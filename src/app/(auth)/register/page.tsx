'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { register } from '@/lib/auth/actions';

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

function CheckIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);
    setSuccessMessage(null);

    const formData = new FormData(event.currentTarget);
    const password = formData.get('password') as string;
    const confirm = formData.get('confirmPassword') as string;

    if (password !== confirm) {
      setFormError('Passwords do not match.');
      return;
    }

    if (password.length < 8) {
      setFormError('Password must be at least 8 characters.');
      return;
    }

    startTransition(async () => {
      const result = await register(formData);
      if (result?.error) {
        setFormError(result.error);
      } else if (result?.success) {
        setSuccessMessage(result.message ?? 'Account created successfully.');
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

          {/* Heading */}
          {!successMessage && (
            <div style={{ marginBottom: 'var(--space-8)' }}>
              <h1 className="type-headline-medium" style={{ color: 'var(--color-on-surface)', marginBottom: 'var(--space-2)' }}>
                Create your account
              </h1>
              <p className="type-body-medium" style={{ color: 'var(--color-on-surface-variant)' }}>
                Join Workn and start managing your workspace.
              </p>
            </div>
          )}

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
                  backgroundColor: 'var(--color-success-container)',
                  color: 'var(--color-on-success-container)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <CheckIcon />
              </div>
              <div>
                <p className="type-headline-small" style={{ color: 'var(--color-on-surface)', marginBottom: 'var(--space-2)' }}>
                  Almost there!
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
                  backgroundColor: 'var(--color-primary)',
                  color: 'var(--color-on-primary)',
                  fontFamily: 'var(--type-label-large-font-family)',
                  fontSize: 'var(--type-label-large-font-size)',
                  fontWeight: 600,
                  textDecoration: 'none',
                  boxShadow: 'var(--effect-soft-shadow)',
                }}
              >
                Back to sign in
              </Link>
            </div>
          ) : (
            <>
              {/* Error Banner */}
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
                {/* Full Name */}
                <div>
                  <label htmlFor="reg-name" className="wk-label">Full name</label>
                  <input
                    id="reg-name"
                    name="fullName"
                    type="text"
                    autoComplete="name"
                    required
                    placeholder="Ada Okafor"
                    className="wk-input"
                  />
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="reg-email" className="wk-label">Email address</label>
                  <input
                    id="reg-email"
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
                  <label htmlFor="reg-password" className="wk-label">Password</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      id="reg-password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      required
                      placeholder="Min 8 characters"
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

                {/* Confirm Password */}
                <div>
                  <label htmlFor="reg-confirm" className="wk-label">Confirm password</label>
                  <input
                    id="reg-confirm"
                    name="confirmPassword"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    placeholder="Re-enter your password"
                    className="wk-input"
                  />
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  id="register-submit"
                  disabled={isPending}
                  className="wk-btn-primary"
                  style={{ marginTop: 'var(--space-2)' }}
                >
                  {isPending ? <SpinnerIcon /> : null}
                  {isPending ? 'Creating account…' : 'Create account'}
                </button>
              </form>

              {/* Sign in link */}
              <div className="wk-divider" style={{ margin: 'var(--space-6) 0' }}>
                Already have an account?
              </div>

              <Link
                href="/login"
                id="go-to-login"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '100%',
                  padding: 'var(--space-3) var(--space-6)',
                  borderRadius: 'var(--radius-md)',
                  border: '1.5px solid var(--color-outline-variant)',
                  backgroundColor: 'transparent',
                  color: 'var(--color-on-surface)',
                  fontFamily: 'var(--type-label-large-font-family)',
                  fontSize: 'var(--type-label-large-font-size)',
                  fontWeight: 600,
                  textDecoration: 'none',
                  transition: 'border-color 150ms ease, background-color 150ms ease',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-primary)';
                  (e.currentTarget as HTMLElement).style.backgroundColor = 'color-mix(in srgb, var(--color-primary) 5%, transparent)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-outline-variant)';
                  (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent';
                }}
              >
                Sign in instead
              </Link>
            </>
          )}
        </div>
      </main>
    </>
  );
}
