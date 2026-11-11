'use client';

import React, { useState, useEffect, useTransition, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { login, register, forgotPassword, verifyCodeAction } from '@/lib/auth/actions';

type AuthView = 'login' | 'register' | 'forgot-password' | 'verify';

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
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
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

function MailIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}

function CautionIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      style={{ flexShrink: 0, marginTop: '1px' }}
    >
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}

function InlineFieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p
      id={id}
      role="alert"
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 'var(--space-2)',
        marginTop: 'var(--space-2)',
        color: 'var(--color-error)',
        fontFamily: 'var(--type-body-small-font-family)',
        fontSize: 'var(--type-body-small-font-size)',
        fontWeight: 500,
        lineHeight: 1.4,
      }}
    >
      <CautionIcon />
      <span>{message}</span>
    </p>
  );
}

const EMAIL_FORMAT_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const FULL_NAME_CHARS_REGEX = /^[A-Za-zÀ-ÖØ-öø-ÿ\s'-]+$/;
const PHONE_DIGITS_REGEX = /^\d{10,11}$/;

function validateFullName(value: string): string | undefined {
  const trimmed = value.trim();
  if (!trimmed) return 'Full name cannot be blank.';
  if (trimmed.length < 3) return 'Full name must be at least 3 characters.';
  if (trimmed.length > 80) return 'Full name cannot exceed 80 characters.';
  if (!FULL_NAME_CHARS_REGEX.test(trimmed)) {
    return 'Full name can only contain letters, spaces, hyphens, and apostrophes.';
  }
  return undefined;
}

function validateEmail(value: string): string | undefined {
  const trimmed = value.trim();
  if (!trimmed) return 'Email address is required.';
  if (!EMAIL_FORMAT_REGEX.test(trimmed)) {
    return "Please include an '@' and a valid domain in your email.";
  }
  return undefined;
}

function validatePhone(value: string): string | undefined {
  const trimmed = value.trim();
  if (!trimmed) return 'Phone number is required.';
  if (!PHONE_DIGITS_REGEX.test(trimmed)) {
    return 'Phone number must be 10 to 11 digits.';
  }
  return undefined;
}

function validatePassword(value: string): string | undefined {
  if (!value) return 'Password is required.';
  if (value.length < 8) return 'Password must be at least 8 characters.';
  if (value.length > 72) return 'Password cannot exceed 72 characters.';
  return undefined;
}

function AuthContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const queryView = searchParams.get('view');
  const redirectTo = searchParams.get('redirect') || '/dashboard';
  const callbackError = searchParams.get('error');

  const [activeView, setActiveView] = useState<AuthView>(() => {
    if (queryView === 'register' || queryView === 'forgot-password' || queryView === 'verify') {
      return queryView;
    }
    return 'login';
  });

  useEffect(() => {
    if (queryView === 'register' || queryView === 'forgot-password' || queryView === 'login' || queryView === 'verify') {
      setActiveView(queryView);
    }
    const queryEmail = searchParams.get('email');
    if (queryEmail) {
      setVerifyEmail(queryEmail);
    }
  }, [queryView, searchParams]);



  // State for Login (format validated ONLY on submit)
  const [loginEmail, setLoginEmail] = useState('');
  const [loginShowPassword, setLoginShowPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginFieldErrors, setLoginFieldErrors] = useState<{ email?: string; password?: string }>({});
  const [isLoginPending, startLoginTransition] = useTransition();

  // State for Forgot Password (with client-side state carryover from login form)
  const [forgotEmail, setForgotEmail] = useState('');

  // State for Register (format validated in REAL TIME as user types)
  const [regFullName, setRegFullName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regAcceptTerms, setRegAcceptTerms] = useState(false);
  const [regShowPassword, setRegShowPassword] = useState(false);
  const [regError, setRegError] = useState<string | null>(null);
  const [regSuccess, setRegSuccess] = useState<string | null>(null);
  const [termsClickNotice, setTermsClickNotice] = useState<string | null>(null);
  const [regFieldErrors, setRegFieldErrors] = useState<{
    fullName?: string;
    email?: string;
    phone?: string;
    password?: string;
    confirmPassword?: string;
  }>({});
  const [isRegPending, startRegTransition] = useTransition();

  // Mode for assessing button states: ?btn=hidden vs default disabled
  const buttonMode = searchParams.get('btn') === 'hidden' ? 'hidden' : 'disabled';

  // Check if form fields have valid entries
  const isRegFieldsValid = Boolean(
    regFullName.trim().length >= 3 &&
    EMAIL_FORMAT_REGEX.test(regEmail.trim()) &&
    PHONE_DIGITS_REGEX.test(regPhone.trim()) &&
    regPassword.length >= 8 &&
    regConfirmPassword === regPassword &&
    !regFieldErrors.fullName &&
    !regFieldErrors.email &&
    !regFieldErrors.phone &&
    !regFieldErrors.password &&
    !regFieldErrors.confirmPassword
  );

  const isRegReadyToSubmit = isRegFieldsValid && regAcceptTerms;

  // State for Forgot Password
  const [forgotError, setForgotError] = useState<string | null>(null);
  const [forgotSuccess, setForgotSuccess] = useState<string | null>(null);
  const [isForgotPending, startForgotTransition] = useTransition();

  // State for Verification Code (Task 4 Step 10)
  const [verifyCode, setVerifyCode] = useState('');
  const [verifyEmail, setVerifyEmail] = useState(() => searchParams.get('email') || 'sabdussalam@x3mideas-ng.com');
  const [verifyError, setVerifyError] = useState<string | null>(null);
  const [verifySuccess, setVerifySuccess] = useState<string | null>(null);
  const [isVerifyPending, startVerifyTransition] = useTransition();

  const switchView = (view: AuthView) => {
    setVerifyCode('');
    setVerifyError(null);
    setVerifySuccess(null);
    setActiveView(view);
    if (view === 'register') {
      setRegSuccess(null);
      setRegError(null);
    }
    if (view === 'login') {
      setLoginError(null);
    }
    if (view === 'forgot-password') {
      setForgotSuccess(null);
      setForgotError(null);
      // State Management: Pre-fill reset form with email typed during failed login without server round-trip
      if (loginEmail.trim()) {
        setForgotEmail(loginEmail.trim());
      }
    }
    const params = new URLSearchParams(searchParams.toString());
    params.set('view', view);
    router.push(`/auth?${params.toString()}`);
  };

  // Handlers
  async function handleVerifySubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setVerifyError(null);
    setVerifySuccess(null);

    const formData = new FormData();
    formData.set('email', verifyEmail.trim() || regEmail.trim());
    formData.set('code', verifyCode);

    startVerifyTransition(async () => {
      const result = await verifyCodeAction(formData);
      if (result?.error) {
        setVerifyError(result.error);
      } else if (result?.success) {
        setVerifySuccess(result.message ?? 'Account verified successfully!');
      }
    });
  }
  async function handleLoginSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoginError(null);
    const formData = new FormData(event.currentTarget);
    const emailVal = (formData.get('email') as string) || '';
    const passwordVal = (formData.get('password') as string) || '';

    const emailErr = validateEmail(emailVal);
    const passwordErr = !passwordVal ? 'Password is required.' : undefined;

    if (emailErr || passwordErr) {
      setLoginFieldErrors({ email: emailErr, password: passwordErr });
      return;
    }

    setLoginFieldErrors({});

    startLoginTransition(async () => {
      const result = await login(formData);
      if (result?.error) {
        setLoginError(result.error);
      } else {
        window.location.href = redirectTo;
      }
    });
  }

  async function handleRegisterSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setRegError(null);
    setRegSuccess(null);

    const formData = new FormData(event.currentTarget);
    const fullNameErr = validateFullName(regFullName);
    const emailErr = validateEmail(regEmail);
    const phoneErr = validatePhone(regPhone);
    const passwordErr = validatePassword(regPassword);
    const confirmErr = !regConfirmPassword
      ? 'Please confirm your password.'
      : regPassword !== regConfirmPassword
        ? 'Passwords do not match.'
        : undefined;

    if (fullNameErr || emailErr || phoneErr || passwordErr || confirmErr) {
      setRegFieldErrors({
        fullName: fullNameErr,
        email: emailErr,
        phone: phoneErr,
        password: passwordErr,
        confirmPassword: confirmErr,
      });
      return;
    }

    const acceptTerms = formData.get('acceptTerms');
    if (!acceptTerms) {
      setRegError('You must agree to the Terms of Service and Privacy Policy to create an account.');
      return;
    }

    // One-line conversion of digits-only phone string using Number constructor before reaching server
    const numericPhone = Number(regPhone.trim());
    formData.set('phone', String(numericPhone));

    // Task 5 Step 2: Gating mode toggle
    const gatingMode = searchParams.get('mode') === 'soft' ? 'soft' : 'hard';
    formData.set('gatingMode', gatingMode);

    startRegTransition(async () => {
      const result = await register(formData);
      if (result?.error) {
        setRegError(result.error);
      } else if (result?.success) {
        setRegSuccess(result.message ?? 'Account created successfully. Check your email to verify.');
        if ((result as any).softGated && (result as any).redirect) {
          window.location.href = (result as any).redirect;
          return;
        }
        if (result.email) {
          setVerifyEmail(result.email);
        }
        switchView('verify');
      }
    });
  }

  async function handleForgotSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setForgotError(null);
    setForgotSuccess(null);

    const formData = new FormData(event.currentTarget);

    startForgotTransition(async () => {
      const result = await forgotPassword(formData);
      if (result?.error) {
        setForgotError(result.error);
      } else if (result?.success) {
        setForgotSuccess(result.message ?? 'If that email is registered, you will receive a reset link.');
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
        .auth-card { animation: fadeUp 0.35s ease both; }
        .auth-outline-btn {
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
          cursor: pointer;
          transition: border-color 150ms ease, background-color 150ms ease;
        }
        .auth-outline-btn:hover {
          border-color: var(--color-primary);
          background-color: color-mix(in srgb, var(--color-primary) 5%, transparent);
        }
        .auth-toggle-link {
          background: transparent;
          border: none;
          cursor: pointer;
          padding: 0;
          font-family: var(--type-label-small-font-family);
          font-size: var(--type-label-small-font-size);
          font-weight: 600;
          color: var(--color-primary);
          text-decoration: none;
        }
        .auth-toggle-link:hover {
          text-decoration: underline;
        }
        .auth-toggle-link:focus-visible {
          outline: 2px solid var(--color-primary);
          outline-offset: 2px;
          border-radius: var(--radius-sm);
        }
        .auth-outline-btn:focus-visible {
          outline: 2px solid var(--color-primary);
          outline-offset: 2px;
        }
        .auth-eye-btn {
          position: absolute;
          right: var(--space-3);
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          cursor: pointer;
          color: var(--color-on-surface-variant);
          padding: var(--space-1);
          display: flex;
          align-items: center;
          border-radius: var(--radius-sm);
          transition: color 150ms ease;
        }
        .auth-eye-btn:hover {
          color: var(--color-on-surface);
        }
        .auth-eye-btn:focus-visible {
          outline: 2px solid var(--color-primary);
          outline-offset: 2px;
        }
        .wk-btn-primary[aria-disabled="true"] {
          opacity: 0.5;
          cursor: not-allowed;
          box-shadow: none;
        }
        .wk-btn-primary[aria-disabled="true"]:hover {
          transform: none;
          opacity: 0.5;
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
          backgroundColor: 'var(--color-surface)',
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
          {/* Brand header */}
          <Link
            href="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 'var(--space-3)',
              marginBottom: 'var(--space-8)',
              textDecoration: 'none',
              cursor: 'pointer',
            }}
            aria-label="Workn Home"
          >
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
          </Link>

          {/* ============================================================= */}
          {/* VIEW: SIGN IN                                                  */}
          {/* ============================================================= */}
          {activeView === 'login' && (
            <div>
              {/* Header */}
              <div style={{ marginBottom: 'var(--space-8)' }}>
                <h1 className="type-headline-medium" style={{ color: 'var(--color-on-surface)', marginBottom: 'var(--space-2)' }}>
                  Welcome back
                </h1>
                <p className="type-body-medium" style={{ color: 'var(--color-on-surface-variant)' }}>
                  Sign in to your Workn account to continue.
                </p>
              </div>

              {/* Error Banners */}
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

              {loginError && (
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
                  {loginError}
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleLoginSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
                <div>
                  <label htmlFor="login-email" className="wk-label">Email address</label>
                  <input
                    id="login-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={loginEmail}
                    placeholder="you@example.com"
                    className="wk-input"
                    aria-invalid={Boolean(loginFieldErrors.email)}
                    aria-describedby={loginFieldErrors.email ? 'login-email-error' : undefined}
                    onBlur={(e) => {
                      if (!e.target.value.trim()) {
                        setLoginFieldErrors((prev) => ({ ...prev, email: 'Email address is required.' }));
                      }
                    }}
                    onChange={(e) => {
                      setLoginEmail(e.target.value);
                      if (loginFieldErrors.email) {
                        setLoginFieldErrors((prev) => ({ ...prev, email: undefined }));
                      }
                    }}
                  />
                  <InlineFieldError id="login-email-error" message={loginFieldErrors.email} />
                </div>

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-2)' }}>
                    <label htmlFor="login-password" className="wk-label" style={{ marginBottom: 0 }}>Password</label>
                    <button
                      type="button"
                      onClick={() => switchView('forgot-password')}
                      className="auth-toggle-link"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div style={{ position: 'relative' }}>
                    <input
                      id="login-password"
                      name="password"
                      type={loginShowPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      required
                      placeholder="Enter your password"
                      className="wk-input"
                      style={{ paddingRight: 'var(--space-10)' }}
                      aria-invalid={Boolean(loginFieldErrors.password)}
                      aria-describedby={loginFieldErrors.password ? 'login-password-error' : undefined}
                      onBlur={(e) => {
                        if (!e.target.value) {
                          setLoginFieldErrors((prev) => ({ ...prev, password: 'Password is required.' }));
                        }
                      }}
                      onChange={() => {
                        if (loginFieldErrors.password) {
                          setLoginFieldErrors((prev) => ({ ...prev, password: undefined }));
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setLoginShowPassword((v) => !v)}
                      aria-label={loginShowPassword ? 'Hide password' : 'Show password'}
                      className="auth-eye-btn"
                    >
                      <EyeIcon open={loginShowPassword} />
                    </button>
                  </div>
                  <InlineFieldError id="login-password-error" message={loginFieldErrors.password} />
                </div>

                <button
                  type="submit"
                  id="login-submit"
                  disabled={isLoginPending}
                  className="wk-btn-primary"
                  style={{ marginTop: 'var(--space-2)' }}
                >
                  {isLoginPending ? <SpinnerIcon /> : null}
                  {isLoginPending ? 'Signing in…' : 'Sign in'}
                </button>
              </form>

              <div className="wk-divider" style={{ margin: 'var(--space-6) 0' }}>
                Don&apos;t have an account?
              </div>

              <button
                type="button"
                id="go-to-register"
                onClick={() => switchView('register')}
                className="auth-outline-btn"
              >
                Create an account
              </button>

              <div style={{ marginTop: 'var(--space-4)', textAlign: 'center' }}>
                <button
                  type="button"
                  id="go-to-verify"
                  onClick={() => switchView('verify')}
                  className="auth-toggle-link"
                  style={{ fontSize: 'var(--type-body-small-font-size)' }}
                >
                  Have a 6-digit confirmation code? Confirm your email &rarr;
                </button>
              </div>
            </div>
          )}

          {/* ============================================================= */}
          {/* VIEW: REGISTER                                                 */}
          {/* ============================================================= */}
          {activeView === 'register' && (
            <div>
              {!regSuccess && (
                <div style={{ marginBottom: 'var(--space-8)' }}>
                  <h1 className="type-headline-medium" style={{ color: 'var(--color-on-surface)', marginBottom: 'var(--space-2)' }}>
                    Create your account
                  </h1>
                  <p className="type-body-medium" style={{ color: 'var(--color-on-surface-variant)' }}>
                    Join Workn and start managing your workspace.
                  </p>
                </div>
              )}

              {regSuccess ? (
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
                      Confirm your email
                    </p>
                    <p className="type-body-medium" style={{ color: 'var(--color-on-surface-variant)' }}>
                      {regSuccess}
                    </p>
                  </div>

                  {verifyError && (
                    <div
                      role="alert"
                      style={{
                        width: '100%',
                        padding: 'var(--space-3) var(--space-4)',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: 'var(--color-error-container)',
                        color: 'var(--color-on-error-container)',
                        border: '1px solid color-mix(in srgb, var(--color-error) 20%, transparent)',
                        fontSize: 'var(--type-body-small-font-size)',
                        textAlign: 'left',
                      }}
                    >
                      {verifyError}
                    </div>
                  )}

                  {verifySuccess ? (
                    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                      <div
                        role="status"
                        style={{
                          padding: 'var(--space-3) var(--space-4)',
                          borderRadius: 'var(--radius-md)',
                          backgroundColor: 'var(--color-success-container)',
                          color: 'var(--color-on-success-container)',
                          fontSize: 'var(--type-body-small-font-size)',
                        }}
                      >
                        {verifySuccess}
                      </div>
                      <button
                        type="button"
                        onClick={() => switchView('login')}
                        className="wk-btn-primary"
                        style={{ width: '100%' }}
                      >
                        Proceed to Sign in
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleVerifySubmit} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                      <div>
                        <label htmlFor="verify-code-input" className="wk-label" style={{ textAlign: 'left', display: 'block' }}>
                          6-Digit Confirmation PIN
                        </label>
                        <input
                          id="verify-code-input"
                          name="code"
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]{6}"
                          maxLength={6}
                          required
                          value={verifyCode}
                          placeholder="123456"
                          className="wk-input"
                          style={{
                            textAlign: 'center',
                            fontSize: '24px',
                            fontWeight: 700,
                            letterSpacing: '8px',
                            fontFamily: 'monospace',
                          }}
                          onChange={(e) => setVerifyCode(e.target.value.replace(/\D/g, ''))}
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={verifyCode.length !== 6 || isVerifyPending}
                        className="wk-btn-primary"
                        style={{ width: '100%' }}
                      >
                        {isVerifyPending ? <SpinnerIcon /> : null}
                        {isVerifyPending ? 'Verifying…' : 'Verify Confirmation Code'}
                      </button>
                      <button
                        type="button"
                        onClick={() => switchView('login')}
                        className="auth-outline-btn"
                        style={{ width: '100%' }}
                      >
                        Back to sign in
                      </button>
                    </form>
                  )}
                </div>
              ) : (
                <>
                  {regError && (
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
                      {regError}
                    </div>
                  )}

                  <form onSubmit={handleRegisterSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
                    <div>
                      <label htmlFor="reg-name" className="wk-label">Full name</label>
                      <input
                        id="reg-name"
                        name="fullName"
                        type="text"
                        autoComplete="name"
                        required
                        value={regFullName}
                        placeholder="Ada Okafor"
                        className="wk-input"
                        aria-invalid={Boolean(regFieldErrors.fullName)}
                        aria-describedby={regFieldErrors.fullName ? 'reg-name-error' : undefined}
                        onBlur={(e) => {
                          setRegFieldErrors((prev) => ({
                            ...prev,
                            fullName: validateFullName(e.target.value),
                          }));
                        }}
                        onChange={(e) => {
                          const val = e.target.value;
                          setRegFullName(val);
                          if (val.trim().length > 0) {
                            setRegFieldErrors((prev) => ({
                              ...prev,
                              fullName: validateFullName(val),
                            }));
                          } else {
                            setRegFieldErrors((prev) => ({ ...prev, fullName: undefined }));
                          }
                        }}
                      />
                      <InlineFieldError id="reg-name-error" message={regFieldErrors.fullName} />
                    </div>

                    <div>
                      <label htmlFor="reg-email" className="wk-label">Email address</label>
                      <input
                        id="reg-email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        required
                        value={regEmail}
                        placeholder="you@example.com"
                        className="wk-input"
                        aria-invalid={Boolean(regFieldErrors.email)}
                        aria-describedby={regFieldErrors.email ? 'reg-email-error' : undefined}
                        onBlur={(e) => {
                          setRegFieldErrors((prev) => ({
                            ...prev,
                            email: validateEmail(e.target.value),
                          }));
                        }}
                        onChange={(e) => {
                          const val = e.target.value;
                          setRegEmail(val);
                          // Real-time email format check as user types on registration
                          setRegFieldErrors((prev) => ({
                            ...prev,
                            email: val.trim() ? validateEmail(val) : undefined,
                          }));
                        }}
                      />
                      <InlineFieldError id="reg-email-error" message={regFieldErrors.email} />
                    </div>

                    <div>
                      <label htmlFor="reg-phone" className="wk-label">Phone number</label>
                      <input
                        id="reg-phone"
                        name="phone"
                        type="text"
                        inputMode="numeric"
                        autoComplete="tel"
                        required
                        value={regPhone}
                        placeholder="08031234567"
                        className="wk-input"
                        aria-invalid={Boolean(regFieldErrors.phone)}
                        aria-describedby={regFieldErrors.phone ? 'reg-phone-error' : undefined}
                        onBlur={(e) => {
                          setRegFieldErrors((prev) => ({
                            ...prev,
                            phone: validatePhone(e.target.value),
                          }));
                        }}
                        onChange={(e) => {
                          // Text input accepting digits only, converted with Number() before reaching server
                          const digitsOnly = e.target.value.replace(/\D/g, '');
                          setRegPhone(digitsOnly);
                          if (digitsOnly.length > 0) {
                            setRegFieldErrors((prev) => ({
                              ...prev,
                              phone: validatePhone(digitsOnly),
                            }));
                          } else {
                            setRegFieldErrors((prev) => ({ ...prev, phone: undefined }));
                          }
                        }}
                      />
                      <InlineFieldError id="reg-phone-error" message={regFieldErrors.phone} />
                    </div>

                    <div>
                      <label htmlFor="reg-password" className="wk-label">Password</label>
                      <div style={{ position: 'relative' }}>
                        <input
                          id="reg-password"
                          name="password"
                          type={regShowPassword ? 'text' : 'password'}
                          autoComplete="new-password"
                          required
                          aria-required="true"
                          value={regPassword}
                          placeholder="At least 8 characters"
                          className="wk-input"
                          style={{ paddingRight: 'var(--space-10)' }}
                          aria-invalid={Boolean(regFieldErrors.password)}
                          aria-describedby={
                            [
                              regFieldErrors.password ? 'reg-password-error' : null,
                              regPassword.length > 0 && !regFieldErrors.password ? 'reg-password-hint' : null,
                            ].filter(Boolean).join(' ') || undefined
                          }
                          onBlur={(e) => {
                            setRegFieldErrors((prev) => ({
                              ...prev,
                              password: validatePassword(e.target.value),
                            }));
                          }}
                          onChange={(e) => {
                            const val = e.target.value;
                            setRegPassword(val);
                            if (val.length > 0) {
                              setRegFieldErrors((prev) => ({
                                ...prev,
                                password: validatePassword(val),
                                confirmPassword:
                                  regConfirmPassword && val !== regConfirmPassword
                                    ? 'Passwords do not match.'
                                    : undefined,
                              }));
                            } else {
                              setRegFieldErrors((prev) => ({ ...prev, password: undefined }));
                            }
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => setRegShowPassword((v) => !v)}
                          aria-label={regShowPassword ? 'Hide password' : 'Show password'}
                          className="auth-eye-btn"
                        >
                          <EyeIcon open={regShowPassword} />
                        </button>
                      </div>
                      {/* Hint appears ONLY once user begins typing */}
                      {regPassword.length > 0 && !regFieldErrors.password && (
                        <p
                          id="reg-password-hint"
                          style={{
                            marginTop: 'var(--space-1)',
                            color: regPassword.length >= 8 ? 'var(--color-success)' : 'var(--color-on-surface-variant)',
                            fontFamily: 'var(--type-body-small-font-family)',
                            fontSize: 'var(--type-body-small-font-size)',
                            lineHeight: 1.4,
                          }}
                        >
                          {regPassword.length >= 8
                            ? '✓ Password length requirement met (8+ characters).'
                            : `Must be at least 8 characters (${regPassword.length}/8 entered).`}
                        </p>
                      )}
                      <InlineFieldError id="reg-password-error" message={regFieldErrors.password} />
                    </div>

                    <div>
                      <label htmlFor="reg-confirm" className="wk-label">Confirm password</label>
                      <input
                        id="reg-confirm"
                        name="confirmPassword"
                        type={regShowPassword ? 'text' : 'password'}
                        autoComplete="new-password"
                        required
                        value={regConfirmPassword}
                        placeholder="Repeat your password"
                        className="wk-input"
                        aria-invalid={Boolean(regFieldErrors.confirmPassword)}
                        aria-describedby={regFieldErrors.confirmPassword ? 'reg-confirm-error' : undefined}
                        onBlur={(e) => {
                          const val = e.target.value;
                          setRegFieldErrors((prev) => ({
                            ...prev,
                            confirmPassword: !val
                              ? 'Please confirm your password.'
                              : val !== regPassword
                                ? 'Passwords do not match.'
                                : undefined,
                          }));
                        }}
                        onChange={(e) => {
                          const val = e.target.value;
                          setRegConfirmPassword(val);
                          setRegFieldErrors((prev) => ({
                            ...prev,
                            confirmPassword:
                              val && val !== regPassword ? 'Passwords do not match.' : undefined,
                          }));
                        }}
                      />
                      <InlineFieldError id="reg-confirm-error" message={regFieldErrors.confirmPassword} />
                    </div>

                    {/* Terms & Conditions Acceptance Checkbox */}
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-3)', marginTop: 'var(--space-1)' }}>
                      <input
                        id="reg-accept-terms"
                        name="acceptTerms"
                        type="checkbox"
                        required
                        aria-required="true"
                        checked={regAcceptTerms}
                        aria-describedby={termsClickNotice ? 'terms-notice-alert' : undefined}
                        onChange={(e) => {
                          setRegAcceptTerms(e.target.checked);
                          if (e.target.checked) {
                            setTermsClickNotice(null);
                          }
                        }}
                        style={{
                          marginTop: '3px',
                          width: '16px',
                          height: '16px',
                          accentColor: 'var(--color-primary)',
                          cursor: 'pointer',
                          flexShrink: 0,
                        }}
                      />
                      <label
                        htmlFor="reg-accept-terms"
                        style={{
                          fontFamily: 'var(--type-body-small-font-family)',
                          fontSize: 'var(--type-body-small-font-size)',
                          color: 'var(--color-on-surface-variant)',
                          lineHeight: 1.45,
                          cursor: 'pointer',
                        }}
                      >
                        I agree to the{' '}
                        <Link
                          href="/?view=terms"
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            color: 'var(--color-primary)',
                            textDecoration: 'underline',
                            fontWeight: 600,
                          }}
                        >
                          Terms of Service
                        </Link>{' '}
                        and{' '}
                        <Link
                          href="/?view=privacy"
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            color: 'var(--color-primary)',
                            textDecoration: 'underline',
                            fontWeight: 600,
                          }}
                        >
                          Privacy Policy
                        </Link>
                        .
                      </label>
                    </div>

                    {/* Notice explaining disabled submit button if triggered without accepting terms */}
                    {termsClickNotice && (
                      <div
                        id="terms-notice-alert"
                        role="alert"
                        style={{
                          marginTop: 'var(--space-2)',
                          padding: 'var(--space-3) var(--space-4)',
                          borderRadius: 'var(--radius-md)',
                          backgroundColor: 'var(--color-error-container)',
                          color: 'var(--color-on-error-container)',
                          border: '1px solid color-mix(in srgb, var(--color-error) 20%, transparent)',
                          fontFamily: 'var(--type-body-small-font-family)',
                          fontSize: 'var(--type-body-small-font-size)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 'var(--space-2)',
                        }}
                      >
                        <CautionIcon />
                        <span>{termsClickNotice}</span>
                      </div>
                    )}

                    {/* Button Mode: 'hidden' until valid vs default 'disabled' until valid */}
                    {buttonMode === 'hidden' && !isRegReadyToSubmit ? null : (
                      <div style={{ width: '100%', marginTop: 'var(--space-2)' }}>
                        <button
                          type="submit"
                          id="reg-submit"
                          disabled={isRegPending}
                          aria-disabled={!isRegReadyToSubmit}
                          aria-describedby={termsClickNotice ? 'terms-notice-alert' : undefined}
                          onClick={(e) => {
                            if (!isRegReadyToSubmit) {
                              e.preventDefault();
                              if (!regAcceptTerms) {
                                setTermsClickNotice('Please accept the Terms of Service and Privacy Policy to continue.');
                              } else if (!isRegFieldsValid) {
                                setTermsClickNotice('Please fill in all fields with valid information to create your account.');
                              }
                            }
                          }}
                          className="wk-btn-primary"
                          style={{ width: '100%' }}
                        >
                          {isRegPending ? <SpinnerIcon /> : null}
                          {isRegPending ? 'Creating account…' : 'Create account'}
                        </button>
                      </div>
                    )}
                  </form>

                  <div className="wk-divider" style={{ margin: 'var(--space-6) 0' }}>
                    Already have an account?
                  </div>

                  <button
                    type="button"
                    onClick={() => switchView('login')}
                    className="auth-outline-btn"
                  >
                    Sign in instead
                  </button>

                  <div style={{ marginTop: 'var(--space-4)', textAlign: 'center' }}>
                    <button
                      type="button"
                      id="reg-go-to-verify"
                      onClick={() => switchView('verify')}
                      className="auth-toggle-link"
                      style={{ fontSize: 'var(--type-body-small-font-size)' }}
                    >
                      Already have a confirmation PIN? Confirm your email &rarr;
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          {/* ============================================================= */}
          {/* VIEW: FORGOT PASSWORD                                          */}
          {/* ============================================================= */}
          {activeView === 'forgot-password' && (
            <div>
              {forgotSuccess ? (
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
                      {forgotSuccess}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => switchView('login')}
                    className="auth-outline-btn"
                    style={{ marginTop: 'var(--space-2)', maxWidth: '200px' }}
                  >
                    &larr; Back to sign in
                  </button>
                </div>
              ) : (
                <>
                  <div style={{ marginBottom: 'var(--space-8)' }}>
                    <h1 className="type-headline-medium" style={{ color: 'var(--color-on-surface)', marginBottom: 'var(--space-2)' }}>
                      Reset your password
                    </h1>
                    <p className="type-body-medium" style={{ color: 'var(--color-on-surface-variant)' }}>
                      Enter your email and we&apos;ll send a reset link.
                    </p>
                  </div>

                  {forgotError && (
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
                      {forgotError}
                    </div>
                  )}

                  <form onSubmit={handleForgotSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
                    <div>
                      <label htmlFor="forgot-email" className="wk-label">Email address</label>
                      <input
                        id="forgot-email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        required
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="wk-input"
                      />
                    </div>

                    <button
                      type="submit"
                      id="forgot-submit"
                      disabled={isForgotPending}
                      className="wk-btn-primary"
                      style={{ marginTop: 'var(--space-2)' }}
                    >
                      {isForgotPending ? <SpinnerIcon /> : null}
                      {isForgotPending ? 'Sending…' : 'Send reset link'}
                    </button>
                  </form>

                  <div style={{ marginTop: 'var(--space-6)', textAlign: 'center' }}>
                    <button
                      type="button"
                      onClick={() => switchView('login')}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        fontFamily: 'var(--type-label-medium-font-family)',
                        fontSize: 'var(--type-label-medium-font-size)',
                        fontWeight: 600,
                        color: 'var(--color-on-surface-variant)',
                        padding: 0,
                      }}
                    >
                      &larr; Back to sign in
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
          {/* ============================================================= */}
          {/* VIEW: EMAIL VERIFICATION (Task 4 Step 10)                     */}
          {/* ============================================================= */}
          {activeView === 'verify' && (
            <div>
              <div style={{ textAlign: 'center', marginBottom: 'var(--space-6)' }}>
                <h1 className="type-headline-medium" style={{ color: 'var(--color-on-surface)', marginBottom: 'var(--space-2)' }}>
                  Confirm your email
                </h1>
                <p className="type-body-medium" style={{ color: 'var(--color-on-surface-variant)' }}>
                  Enter your email address and the 6-digit confirmation PIN.
                </p>
              </div>

              {verifyError && (
                <div
                  role="alert"
                  style={{
                    marginBottom: 'var(--space-5)',
                    padding: 'var(--space-3) var(--space-4)',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--color-error-container)',
                    color: 'var(--color-on-error-container)',
                    border: '1px solid color-mix(in srgb, var(--color-error) 20%, transparent)',
                    fontSize: 'var(--type-body-small-font-size)',
                    textAlign: 'left',
                  }}
                >
                  {verifyError}
                </div>
              )}

              {verifySuccess ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', textAlign: 'center' }}>
                  <div
                    role="status"
                    style={{
                      padding: 'var(--space-4)',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--color-success-container)',
                      color: 'var(--color-on-success-container)',
                      fontSize: 'var(--type-body-medium-font-size)',
                      fontWeight: 600,
                    }}
                  >
                    {verifySuccess}
                  </div>
                  <button
                    type="button"
                    onClick={() => switchView('login')}
                    className="wk-btn-primary"
                    style={{ width: '100%' }}
                  >
                    Proceed to Sign in
                  </button>
                </div>
              ) : (
                <form onSubmit={handleVerifySubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
                  <div>
                    <label htmlFor="verify-email-input" className="wk-label">Email address</label>
                    <input
                      id="verify-email-input"
                      type="email"
                      required
                      value={verifyEmail}
                      onChange={(e) => setVerifyEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="wk-input"
                    />
                  </div>

                  <div>
                    <label htmlFor="verify-code-input" className="wk-label">6-Digit Confirmation PIN</label>
                    <input
                      id="verify-code-input"
                      name="code"
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]{6}"
                      maxLength={6}
                      required
                      value={verifyCode}
                      placeholder="123456"
                      className="wk-input"
                      style={{
                        textAlign: 'center',
                        fontSize: '24px',
                        fontWeight: 700,
                        letterSpacing: '8px',
                        fontFamily: 'monospace',
                      }}
                      onChange={(e) => setVerifyCode(e.target.value.replace(/\D/g, ''))}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={verifyCode.length !== 6 || isVerifyPending}
                    className="wk-btn-primary"
                    style={{ width: '100%' }}
                  >
                    {isVerifyPending ? <SpinnerIcon /> : null}
                    {isVerifyPending ? 'Verifying code…' : 'Verify Confirmation Code'}
                  </button>

                  <div className="wk-divider" style={{ margin: 'var(--space-4) 0' }}>
                    Or
                  </div>

                  <button
                    type="button"
                    onClick={() => switchView('login')}
                    className="auth-outline-btn"
                  >
                    Back to sign in
                  </button>
                </form>
              )}
            </div>
          )}

        </div>
      </main>
    </>
  );
}

export default function AuthClient() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', backgroundColor: 'var(--color-surface)' }} />}>
      <AuthContent />
    </Suspense>
  );
}
