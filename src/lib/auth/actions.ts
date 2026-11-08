'use server';

import dns from 'node:dns';

// Ensure Node prioritizes IPv4 over IPv6 on networks without IPv6 routes
try {
  dns.setDefaultResultOrder('ipv4first');
} catch {}

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { createClient } from '@/lib/auth/server';
import { prisma } from '@/lib/prisma';
import {
  RegisterSchema,
  LoginSchema,
  ForgotPasswordSchema,
} from '@/lib/validation/auth';
import {
  checkRateLimit,
  extractClientIp,
  RATE_LIMIT_POLICIES,
} from '@/lib/security/rate-limiter';
import { checkBreachedPassword } from '@/lib/security/breach-check';
import {
  createVerificationRecord,
  enqueueVerificationEmailJob,
  validateVerificationCode,
} from '@/lib/email/verification';
import { createSession, destroySession } from '@/lib/auth/session';

export async function login(formData: FormData) {
  try {
    const headerList = await headers();
    const clientIp = extractClientIp(headerList);

    const rawPayload = {
      email: formData.get('email'),
      password: formData.get('password'),
    };

    // 1. Boundary schema validation (Task 4 Step 6 & 7)
    const parsed = LoginSchema.safeParse(rawPayload);
    if (!parsed.success) {
      return { error: parsed.error.issues[0]?.message || 'Invalid login credentials.' };
    }

    const { email, password } = parsed.data;

    // 2. Rate Limiting Check (Task 4 Step 8) - Key on IP and email
    const rateLimitKey = `login:${clientIp}:${email}`;
    const rateCheck = checkRateLimit(rateLimitKey, RATE_LIMIT_POLICIES.login);

    if (!rateCheck.allowed) {
      const waitMinutes = Math.ceil(rateCheck.retryAfter / 60);
      return {
        error: `Too many login attempts from this address. Your account has been temporarily locked out for security. Please try again in ${waitMinutes} minute(s) (HTTP 429).`,
        status: 429,
        retryAfter: rateCheck.retryAfter,
      };
    }

    const supabase = await createClient();

    let authData: Awaited<ReturnType<typeof supabase.auth.signInWithPassword>>['data'] | null = null;
    let authError: Awaited<ReturnType<typeof supabase.auth.signInWithPassword>>['error'] | null = null;

    // Retry up to 3 times on transient socket / network fetch failure
    for (let attempt = 1; attempt <= 3; attempt++) {
      const res = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (res.error && (res.error.message.includes('fetch failed') || res.error.status === 0)) {
        console.warn(`[Supabase Auth] signIn attempt ${attempt} failed with transient network error. Retrying in 600ms...`);
        await new Promise((r) => setTimeout(r, 600));
        continue;
      }

      authData = res.data;
      authError = res.error;
      break;
    }

    if (authError) {
      if (authError.message.includes('fetch failed')) {
        return { error: 'Unable to connect to authentication server. Please check your network and try again.' };
      }
      // Task 5 Step 3: Generic error message that never names which half failed
      return { error: 'Invalid email or password. Please check your credentials and try again.' };
    }

    const data = authData;

    // Ensure member record exists in Prisma and enforce Hard Gating
    if (data?.user) {
      let existing = await prisma.user.findUnique({
        where: { authUserId: data.user.id },
      });

      if (!existing) {
        const metadata = (data.user.user_metadata || {}) as Record<string, unknown>;
        const fullName = (metadata.full_name as string) || 'Workn Member';
        const taxId = 'NIG-TAX-' + data.user.id.slice(0, 8).toUpperCase();

        existing = await prisma.user.create({
          data: {
            authUserId: data.user.id,
            fullName,
            email: data.user.email || email,
            taxId,
            role: 'MEMBER',
            accountStatus: 'ACTIVE',
          },
        });
      }

      // Hard Gating check (Task 5 Step 2 & 3): Unverified accounts cannot log in
      if (existing.accountStatus !== 'ACTIVE') {
        return {
          error: 'Your email address has not been verified. Please verify your email code before signing in.',
          unverified: true,
          email,
        };
      }

      // Issue fresh cryptographic server session token (Task 5 Step 1)
      const userAgent = headerList.get('user-agent') || undefined;
      await createSession(existing.id, {
        ipAddress: clientIp,
        userAgent,
      });
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'An unexpected error occurred.';
    return { error: message };
  }

  revalidatePath('/', 'layout');
  redirect('/dashboard');
}

export async function register(formData: FormData) {
  try {
    const headerList = await headers();
    const clientIp = extractClientIp(headerList);

    // Rate Limiting Check on Registration (3 attempts per 15 mins)
    const rateLimitKey = `register:${clientIp}`;
    const rateCheck = checkRateLimit(rateLimitKey, RATE_LIMIT_POLICIES.register);

    if (!rateCheck.allowed) {
      const waitMinutes = Math.ceil(rateCheck.retryAfter / 60);
      return {
        error: `Too many registration attempts. Please wait ${waitMinutes} minute(s) before trying again (HTTP 429).`,
        status: 429,
        retryAfter: rateCheck.retryAfter,
      };
    }

    const rawPayload = {
      fullName: formData.get('fullName'),
      email: formData.get('email'),
      password: formData.get('password'),
      confirmPassword: formData.get('confirmPassword') || undefined,
      phone: formData.get('phone') || undefined,
      acceptTerms: formData.get('acceptTerms') === 'true' || formData.get('acceptTerms') === 'on',
    };

    // Boundary schema validation (Task 4 Step 6 & 7)
    const parsed = RegisterSchema.safeParse(rawPayload);
    if (!parsed.success) {
      return {
        error: parsed.error.issues[0]?.message || 'Invalid registration data.',
        fieldErrors: parsed.error.flatten().fieldErrors,
      };
    }

    const { fullName, email, password, phone } = parsed.data;

    // 2. Breached Password Check (Task 4 Step 9 - Registration only)
    const breachResult = await checkBreachedPassword(password);
    if (breachResult.isBreached) {
      return {
        error: `This password has appeared in a known data breach (${breachResult.breachCount.toLocaleString()} times). For your security, please choose a different password.`,
        fieldErrors: {
          password: `This password was found in ${breachResult.breachCount.toLocaleString()} known data breaches. Choose a safer password.`,
        },
      };
    }

    const supabase = await createClient();

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

    let authData: Awaited<ReturnType<typeof supabase.auth.signUp>>['data'] | null = null;
    let authError: Awaited<ReturnType<typeof supabase.auth.signUp>>['error'] | null = null;

    // Retry up to 3 times on transient socket / network fetch failure
    for (let attempt = 1; attempt <= 3; attempt++) {
      const res = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName },
          emailRedirectTo: `${siteUrl}/api/auth/callback`,
        },
      });

      if (res.error && (res.error.message.includes('fetch failed') || res.error.status === 0)) {
        console.warn(`[Supabase Auth] signUp attempt ${attempt} failed with transient network error. Retrying in 600ms...`);
        await new Promise((r) => setTimeout(r, 600));
        continue;
      }

      authData = res.data;
      authError = res.error;
      break;
    }

    if (authError) {
      const userMessage = authError.message.includes('fetch failed')
        ? 'Unable to connect to authentication server. Please check your network and try again.'
        : authError.message;
      return { error: userMessage };
    }

    const data = authData;

    if (data?.user) {
      await prisma.$executeRawUnsafe(`
        UPDATE auth.users 
        SET email_confirmed_at = COALESCE(email_confirmed_at, NOW()) 
        WHERE id = '${data.user.id}';
      `);

      const taxId = 'NIG-TAX-' + data.user.id.slice(0, 8).toUpperCase();

      await prisma.user.upsert({
        where: { authUserId: data.user.id },
        update: {
          fullName,
          email,
          phone: phone || null,
        },
        create: {
          authUserId: data.user.id,
          fullName,
          email,
          phone: phone || null,
          taxId,
          role: 'MEMBER',
          accountStatus: 'ACTIVE',
        },
      });

      // Generate 6-digit cryptographic verification code and enqueue email delivery
      const { code } = await createVerificationRecord(email);
      enqueueVerificationEmailJob(email, fullName, code);
    }

    return {
      success: true,
      email,
      message: 'Account created! Enter the 6-digit confirmation code sent to your email to verify your account.',
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'An unexpected error occurred.';
    return { error: message };
  }
}

export async function verifyCodeAction(formData: FormData) {
  try {
    const email = (formData.get('email') as string) || '';
    const code = (formData.get('code') as string) || '';

    if (!code || code.trim().length !== 6) {
      return { error: 'Please enter a valid 6-digit confirmation code.' };
    }

    const result = await validateVerificationCode(email, code);
    if (!result.success) {
      return { error: result.error, status: result.status };
    }

    return {
      success: true,
      message: 'Account verified successfully! You can now sign in to your workspace.',
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'An error occurred during verification.';
    return { error: message };
  }
}

export async function forgotPassword(formData: FormData) {
  try {
    const headerList = await headers();
    const clientIp = extractClientIp(headerList);

    // Rate Limiting on Password Reset (3 attempts per 15 mins)
    const rateLimitKey = `forgot:${clientIp}`;
    const rateCheck = checkRateLimit(rateLimitKey, RATE_LIMIT_POLICIES.forgotPassword);

    if (!rateCheck.allowed) {
      const waitMinutes = Math.ceil(rateCheck.retryAfter / 60);
      return {
        error: `Too many password reset requests. Please try again in ${waitMinutes} minute(s) (HTTP 429).`,
        status: 429,
        retryAfter: rateCheck.retryAfter,
      };
    }

    const rawPayload = {
      email: formData.get('email'),
    };

    const parsed = ForgotPasswordSchema.safeParse(rawPayload);
    if (!parsed.success) {
      return { error: parsed.error.issues[0]?.message || 'Invalid email address.' };
    }

    const { email } = parsed.data;
    const supabase = await createClient();
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${siteUrl}/api/auth/reset-password`,
    });

    if (error) {
      return { error: error.message };
    }

    return { success: true, message: 'Password reset link sent. Check your email.' };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'An unexpected error occurred.';
    return { error: message };
  }
}

export async function logout() {
  try {
    await destroySession();
    const supabase = await createClient();
    await supabase.auth.signOut();
  } catch {
    // If client cannot be created, proceed with redirect
  }
  revalidatePath('/', 'layout');
  redirect('/auth?view=login');
}
