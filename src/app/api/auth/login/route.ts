import { NextRequest, NextResponse } from 'next/server';
import { LoginSchema } from '@/lib/validation/auth';
import { createClient } from '@/lib/auth/server';
import {
  checkRateLimit,
  extractClientIp,
  getRateLimitHeaders,
  RATE_LIMIT_POLICIES,
} from '@/lib/security/rate-limiter';

export async function POST(req: NextRequest) {
  try {
    const clientIp = extractClientIp(req.headers);

    const contentType = req.headers.get('content-type') || '';
    let rawPayload: Record<string, unknown> = {};

    if (contentType.includes('application/json')) {
      rawPayload = await req.json().catch(() => ({}));
    } else {
      const formData = await req.formData().catch(() => new FormData());
      formData.forEach((value, key) => {
        rawPayload[key] = value;
      });
    }

    // 1. Boundary schema validation
    const parsed = LoginSchema.safeParse(rawPayload);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0]?.message || 'Invalid login credentials' },
        { status: 400 }
      );
    }

    const { email, password } = parsed.data;

    // 2. Rate limiting check (5 attempts per 15 mins)
    const rateLimitKey = `login:${clientIp}:${email}`;
    const rateCheck = checkRateLimit(rateLimitKey, RATE_LIMIT_POLICIES.login);

    if (!rateCheck.allowed) {
      const waitMinutes = Math.ceil(rateCheck.retryAfter / 60);
      return NextResponse.json(
        {
          success: false,
          error: `Too many login attempts from this address. Locked out for ${waitMinutes} minute(s).`,
          status: 429,
          retryAfter: rateCheck.retryAfter,
        },
        {
          status: 429,
          headers: getRateLimitHeaders(rateCheck),
        }
      );
    }

    const supabase = await createClient();
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 401, headers: getRateLimitHeaders(rateCheck) }
      );
    }

    return NextResponse.json(
      { success: true, user: { id: data.user.id, email: data.user.email } },
      { status: 200, headers: getRateLimitHeaders(rateCheck) }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

