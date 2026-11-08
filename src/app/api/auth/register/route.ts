import { NextRequest, NextResponse } from 'next/server';
import { RegisterSchema } from '@/lib/validation/auth';
import { createClient } from '@/lib/auth/server';
import { prisma } from '@/lib/prisma';
import { checkBreachedPassword } from '@/lib/security/breach-check';

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get('content-type') || '';
    let rawPayload: Record<string, unknown> = {};

    if (contentType.includes('application/json')) {
      rawPayload = await req.json().catch(() => ({}));
    } else if (contentType.includes('application/x-www-form-urlencoded') || contentType.includes('multipart/form-data')) {
      const formData = await req.formData().catch(() => new FormData());
      formData.forEach((value, key) => {
        rawPayload[key] = value;
      });
    } else {
      const text = await req.text().catch(() => '');
      const searchParams = new URLSearchParams(text);
      searchParams.forEach((value, key) => {
        rawPayload[key] = value;
      });
    }

    // Server-side Zod boundary validation (Task 4 Step 6 & 7)
    const result = RegisterSchema.safeParse(rawPayload);

    if (!result.success) {
      const issues = result.error.issues.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message,
      }));

      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed at server boundary',
          message: issues[0]?.message || 'Invalid input data',
          issues,
        },
        { status: 400 }
      );
    }

    const { fullName, email, password, phone } = result.data;

    // Breached Password Check (Task 4 Step 9 - Registration only)
    const breachResult = await checkBreachedPassword(password);
    if (breachResult.isBreached) {
      return NextResponse.json(
        {
          success: false,
          error: 'Breached password detected',
          message: `This password has appeared in a known data breach (${breachResult.breachCount.toLocaleString()} times). For your security, please choose a different password.`,
          issues: [
            {
              field: 'password',
              message: `This password was found in ${breachResult.breachCount.toLocaleString()} known data breaches. Choose a safer password.`,
            },
          ],
        },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: `${siteUrl}/api/auth/callback`,
      },
    });

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      );
    }

    if (data?.user) {
      await prisma.$executeRawUnsafe(`
        UPDATE auth.users 
        SET email_confirmed_at = COALESCE(email_confirmed_at, NOW()) 
        WHERE id = '${data.user.id}';
      `);

      const taxId = 'NIG-TAX-' + data.user.id.slice(0, 8).toUpperCase();

      await prisma.user.upsert({
        where: { authUserId: data.user.id },
        update: { fullName, email, phone: phone || null },
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
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Account registered successfully',
        user: { email, fullName },
      },
      { status: 201 }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

