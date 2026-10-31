'use client';

import { useState, useTransition, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { login } from '@/lib/auth/actions';

function EyeIcon({ open }: { open: boolean }) {
  return open ? (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ) : (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

function SpinnerIcon() {
  return (
    <svg
      width="18" height="18" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
      style={{ animation: 'spin 0.75s linear infinite' }}
    >
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
    </svg>
  );
}

// Inner component that uses useSearchParams — must be wrapped in Suspense
function LoginForm() {
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/dashboard';

  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);

    const formData = new FormData(event.currentTarget);

    startTransition(async () => {
      const result = await login(formData);
      if (result?.error) {
        setFormError(result.error);
      } else {
        // Server action redirect will handle navigation
        window.location.href = redirectTo;
      }
    });
  }

  const callbackError = searchParams.get('error');

  return (
    <>
      {/* Error Banner (callback) */}
      {callbackError === 'auth_callback_failed' && (
        <div
          role="alert"
          style={{
            marginBottom: 'var(--space-5)',
            padding: 'var(--space-3) var(--space-4)',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--color-error-container)',
            color: 'var(--color-on-error-container)',
            fontFamily: 'var(--type-body-medium-font-family)',
            fontSize: 'var(--type-body-medium-font-size)',
          }}
        >
          Something went wrong during sign-in. Please try again.
        </div>
      )}

      {/* Error Banner (form) */}
      {formError && (
        <div
          role="alert"
          style={{
            marginBottom: 'var(--space-5)',
            padding: 'var(--space-3) var(--space-4)',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--color-error-container)',
            color: 'var(--color-on-error-container)',
            border: '1px solid color-mix(in srgb, var(--color-error) 20%, transparent)',
            fontFamily: 'var(--type-body-medium-font-family)',
            fontSize: 'var(--type-body-medium-font-size)',
          }}
        >
          {formError}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
        {/* Email */}
        <div>
          <label htmlFor="login-email" className="wk-label">Email address</label>
          <input
            id="login-email"
            name="email"
            type="email"
            autoComplete="email"
            required
            placeholder="you@example.com"
            className="wk-input"
          />
        </div>

        {/* Password */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-2)' }}>
            <label htmlFor="login-password" className="wk-label" style={{ marginBottom: 0 }}>Password</label>
            <Link
              href="/forgot-password"
              style={{
                fontFamily: 'var(--type-label-small-font-family)',
                fontSize: 'var(--type-label-small-font-size)',
                fontWeight: 600,
                color: 'var(--color-primary)',
                textDecoration: 'none',
              }}
            >
              Forgot password?
            </Link>
          </div>
          <div style={{ position: 'relative' }}>
            <input
              id="login-password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              required
              placeholder="Enter your password"
              className="wk-input"
              style={{ paddingRight: 'var(--space-10)' }}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              style={{
                position: 'absolute',
                right: 'var(--space-4)',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--color-on-surface-variant)',
                padding: 0,
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <EyeIcon open={showPassword} />
            </button>
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          id="login-submit"
          disabled={isPending}
          className="wk-btn-primary"
          style={{ marginTop: 'var(--space-2)' }}
        >
          {isPending ? <SpinnerIcon /> : null}
          {isPending ? 'Signing in…' : 'Sign in'}
        </button>
      </form>

      {/* Divider */}
      <div className="wk-divider" style={{ margin: 'var(--space-6) 0' }}>
        Don&apos;t have an account?
      </div>

      {/* Register link */}
      <Link
        href="/register"
        id="go-to-register"
        className="auth-outline-link"
      >
        Create an account
      </Link>
    </>
  );
}

export default function LoginPage() {
  return (
    <>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .auth-card { animation: fadeUp 0.4s ease both; }
        .auth-outline-link {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          padding: var(--space-3) var(--space-6);
          border-radius: var(--radius-md);
          border: 1.5px solid var(--color-outline-variant);
          background-color: transparent;
          color: var(--color-on-surface);
          font-family: var(--type-label-large-font-family);
          font-size: var(--type-label-large-font-size);
          font-weight: 600;
          text-decoration: none;
          transition: border-color 150ms ease, background-color 150ms ease;
        }
        .auth-outline-link:hover {
          border-color: var(--color-primary);
          background-color: color-mix(in srgb, var(--color-primary) 5%, transparent);
        }
      `}</style>

      <main
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 'var(--space-6)',
          background: `radial-gradient(ellipse 80% 60% at 50% -10%, color-mix(in srgb, var(--color-primary) 10%, transparent), transparent)`,
        }}
      >
        {/* Card */}
        <div
          className="auth-card"
          style={{
            width: '100%',
            maxWidth: '440px',
            backgroundColor: 'var(--color-surface-container-lowest)',
            borderRadius: 'var(--radius-xl)',
            border: '1px solid var(--color-outline-variant)',
            padding: 'var(--space-10)',
            boxShadow: 'var(--effect-medium-shadow)',
          }}
        >
          {/* Brand */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-8)' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--color-primary)',
                color: 'var(--color-on-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: 'var(--type-display-large-font-family)',
                fontWeight: 700,
                fontSize: '20px',
                flexShrink: 0,
                boxShadow: 'var(--effect-soft-shadow)',
              }}
            >
              W
            </div>
            <span
              style={{
                fontFamily: 'var(--type-headline-large-font-family)',
                fontWeight: 700,
                fontSize: '20px',
                color: 'var(--color-on-surface)',
                letterSpacing: '-0.5px',
              }}
            >
              Workn
            </span>
          </div>

          {/* Heading */}
          <div style={{ marginBottom: 'var(--space-8)' }}>
            <h1 className="type-headline-medium" style={{ color: 'var(--color-on-surface)', marginBottom: 'var(--space-2)' }}>
              Welcome back
            </h1>
            <p className="type-body-medium" style={{ color: 'var(--color-on-surface-variant)' }}>
              Sign in to your Workn account to continue.
            </p>
          </div>

          {/* Suspense boundary required for useSearchParams */}
          <Suspense fallback={
            <div style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <SpinnerIcon />
            </div>
          }>
            <LoginForm />
          </Suspense>
        </div>
      </main>
    </>
  );
}
