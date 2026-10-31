'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { forgotPassword } from '@/lib/auth/actions';

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

function MailIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}

export default function ForgotPasswordPage() {
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);
    setSuccessMessage(null);

    const formData = new FormData(event.currentTarget);

    startTransition(async () => {
      const result = await forgotPassword(formData);
      if (result?.error) {
        setFormError(result.error);
      } else if (result?.success) {
        setSuccessMessage(result.message ?? 'If that email is registered, you will receive a reset link.');
      }
    });
  }

  return (
    <>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .auth-card { animation: fadeUp 0.4s ease both; }
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

          {/* Success state */}
          {successMessage ? (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                gap: 'var(--space-4)',
                padding: 'var(--space-6) 0',
              }}
            >
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: 'var(--color-primary-container)',
                  color: 'var(--color-on-primary-container)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <MailIcon />
              </div>
              <div>
                <p className="type-headline-small" style={{ color: 'var(--color-on-surface)', marginBottom: 'var(--space-2)' }}>
                  Check your inbox
                </p>
                <p className="type-body-medium" style={{ color: 'var(--color-on-surface-variant)' }}>
                  {successMessage}
                </p>
              </div>
              <Link
                href="/login"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginTop: 'var(--space-2)',
                  padding: 'var(--space-3) var(--space-6)',
                  borderRadius: 'var(--radius-md)',
                  border: '1.5px solid var(--color-outline-variant)',
                  backgroundColor: 'transparent',
                  color: 'var(--color-on-surface)',
                  fontFamily: 'var(--type-label-large-font-family)',
                  fontSize: 'var(--type-label-large-font-size)',
                  fontWeight: 600,
                  textDecoration: 'none',
                }}
              >
                ← Back to sign in
              </Link>
            </div>
          ) : (
            <>
              {/* Heading */}
              <div style={{ marginBottom: 'var(--space-8)' }}>
                <h1 className="type-headline-medium" style={{ color: 'var(--color-on-surface)', marginBottom: 'var(--space-2)' }}>
                  Reset your password
                </h1>
                <p className="type-body-medium" style={{ color: 'var(--color-on-surface-variant)' }}>
                  Enter your email and we&apos;ll send a reset link.
                </p>
              </div>

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

              <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
                <div>
                  <label htmlFor="forgot-email" className="wk-label">Email address</label>
                  <input
                    id="forgot-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    placeholder="you@example.com"
                    className="wk-input"
                  />
                </div>

                <button
                  type="submit"
                  id="forgot-submit"
                  disabled={isPending}
                  className="wk-btn-primary"
                  style={{ marginTop: 'var(--space-2)' }}
                >
                  {isPending ? <SpinnerIcon /> : null}
                  {isPending ? 'Sending…' : 'Send reset link'}
                </button>
              </form>

              <div style={{ marginTop: 'var(--space-6)', textAlign: 'center' }}>
                <Link
                  href="/login"
                  style={{
                    fontFamily: 'var(--type-label-medium-font-family)',
                    fontSize: 'var(--type-label-medium-font-size)',
                    fontWeight: 600,
                    color: 'var(--color-on-surface-variant)',
                    textDecoration: 'none',
                  }}
                >
                  ← Back to sign in
                </Link>
              </div>
            </>
          )}
        </div>
      </main>
    </>
  );
}
