'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/auth/server';
import { prisma } from '@/lib/prisma';

export async function login(formData: FormData) {
  try {
    const supabase = await createClient();

    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    const credentials = {
      email: email ? email.trim() : '',
      password: password ? password.trim() : '',
    };

    const { data, error } = await supabase.auth.signInWithPassword(credentials);

    if (error) {
      return { error: error.message };
    }

    // Ensure member record exists in Prisma
    if (data?.user) {
      const existing = await prisma.user.findUnique({
        where: { authUserId: data.user.id },
      });

      if (!existing) {
        const metadata = (data.user.user_metadata || {}) as Record<string, unknown>;
        const fullName = (metadata.full_name as string) || 'Workn Member';
        const taxId = 'NIG-TAX-' + data.user.id.slice(0, 8).toUpperCase();

        await prisma.user.create({
          data: {
            authUserId: data.user.id,
            fullName,
            email: data.user.email || credentials.email,
            taxId,
            role: 'MEMBER',
            accountStatus: 'ACTIVE',
          },
        });
      }
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
    const supabase = await createClient();

    const fullName = (formData.get('fullName') as string) || '';
    const email = (formData.get('email') as string) || '';
    const password = (formData.get('password') as string) || '';
    const phone = (formData.get('phone') as string) || null;

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password: password.trim(),
      options: {
        data: { full_name: fullName.trim() },
        emailRedirectTo: `${siteUrl}/api/auth/callback`,
      },
    });

    if (error) {
      return { error: error.message };
    }

    // Create or associate the application user record in PostgreSQL (Auth.md Section 4)
    if (data?.user) {
      const taxId = 'NIG-TAX-' + data.user.id.slice(0, 8).toUpperCase();

      await prisma.user.upsert({
        where: { authUserId: data.user.id },
        update: {
          fullName: fullName.trim(),
          email: email.trim(),
          phone: phone ? phone.trim() : null,
        },
        create: {
          authUserId: data.user.id,
          fullName: fullName.trim(),
          email: email.trim(),
          phone: phone ? phone.trim() : null,
          taxId,
          role: 'MEMBER',
          accountStatus: 'ACTIVE',
        },
      });
    }

    return {
      success: true,
      message: 'Account created successfully! Please check your email to confirm your account before logging in.',
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'An unexpected error occurred.';
    return { error: message };
  }
}

export async function forgotPassword(formData: FormData) {
  try {
    const supabase = await createClient();

    const email = formData.get('email') as string;
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
    const supabase = await createClient();
    await supabase.auth.signOut();
  } catch {
    // If client cannot be created, proceed with redirect
  }
  revalidatePath('/', 'layout');
  redirect('/login');
}
