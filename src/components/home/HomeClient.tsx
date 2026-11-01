'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import PrivacyPolicyView from '@/components/legal/PrivacyPolicyView';
import TermsOfServiceView from '@/components/legal/TermsOfServiceView';

type ViewType = 'home' | 'privacy' | 'terms';

function HomeContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const queryView = searchParams.get('view');
  const [activeView, setActiveView] = useState<ViewType>(() => {
    if (queryView === 'privacy' || queryView === 'terms') {
      return queryView;
    }
    return 'home';
  });

  useEffect(() => {
    if (queryView === 'privacy' || queryView === 'terms') {
      setActiveView(queryView);
    } else if (!queryView) {
      setActiveView('home');
    }
  }, [queryView]);

  const navigateToView = (view: ViewType) => {
    setActiveView(view);
    if (view === 'home') {
      router.push('/');
    } else {
      router.push(`/?view=${view}`);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <style>{`
        .home-btn-outline {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: var(--space-3) var(--space-8);
          border-radius: var(--radius-md);
          border: 1.5px solid var(--color-outline-variant);
          background-color: transparent;
          color: var(--color-on-surface);
          font-family: var(--type-label-large-font-family);
          font-size: var(--type-label-large-font-size);
          font-weight: 600;
          text-decoration: none;
          transition: border-color 150ms ease, background-color 150ms ease;
          cursor: pointer;
        }
        .home-btn-outline:hover {
          border-color: var(--color-primary);
          background-color: color-mix(in srgb, var(--color-primary) 5%, transparent);
        }
        .home-btn-primary {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: var(--space-3) var(--space-8);
          border-radius: var(--radius-md);
          background-color: var(--color-primary);
          color: var(--color-on-primary);
          font-family: var(--type-label-large-font-family);
          font-size: var(--type-label-large-font-size);
          font-weight: 600;
          text-decoration: none;
          box-shadow: var(--effect-medium-shadow);
          transition: opacity 150ms ease, transform 100ms ease;
          border: none;
          cursor: pointer;
        }
        .home-btn-primary:hover {
          opacity: 0.9;
          transform: translateY(-1px);
        }
        .hero-subtitle {
          font-family: var(--type-title-large-font-family);
          font-size: clamp(14px, 2vw, 18.5px);
          font-weight: 500;
          color: var(--color-on-surface-variant);
          line-height: 1.5;
          margin-bottom: var(--space-3);
        }
        .hero-description {
          font-family: var(--type-body-large-font-family);
          font-size: clamp(0.9rem, 2vw, 1.1rem);
          font-weight: 400;
          color: var(--color-on-surface-variant);
          opacity: 0.85;
          line-height: 1.5;
        }
        .footer-legal-link {
          background: transparent;
          border: none;
          color: var(--color-on-surface-variant);
          font-family: var(--type-body-small-font-family);
          font-size: var(--type-body-small-font-size);
          cursor: pointer;
          text-decoration: none;
          transition: color 150ms ease, text-decoration 150ms ease;
          padding: 0;
        }
        .footer-legal-link:hover {
          color: var(--color-primary);
          text-decoration: underline;
        }
      `}</style>

      <main
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: activeView === 'home' ? 'center' : 'flex-start',
          padding: activeView === 'home' ? 'var(--space-6)' : '100px var(--space-6) var(--space-12)',
          background: `radial-gradient(ellipse 80% 55% at 50% -5%, color-mix(in srgb, var(--color-primary) 12%, transparent), transparent)`,
          backgroundColor: 'var(--color-surface)',
          position: 'relative',
        }}
      >
        {/* Fixed top header */}
        <header
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: 'var(--space-4) var(--space-8)',
            zIndex: 100,
            background: 'transparent',
            border: 'none',
            borderBottom: 'none',
            boxShadow: 'none',
            pointerEvents: 'none',
          }}
        >
          <button
            onClick={() => navigateToView('home')}
            type="button"
            aria-label="Workn Home"
            style={{
              background: 'transparent',
              border: 'none',
              padding: 0,
              cursor: 'pointer',
              pointerEvents: 'auto',
            }}
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
                boxShadow: 'var(--effect-medium-shadow)',
              }}
            >
              W
            </div>
          </button>
          <Link
            href="/auth?view=register"
            className="home-btn-primary"
            id="cta-get-started"
            style={{ pointerEvents: 'auto' }}
          >
            Get started
          </Link>
        </header>

        {/* View Switching */}
        {activeView === 'home' && (
          <>
            {/* Hero */}
            <div
              style={{
                textAlign: 'center',
                width: '100%',
                maxWidth: '800px',
                padding: '0 var(--space-6)',
                marginBottom: 'var(--space-10)',
              }}
            >
              <h1
                className="type-display-large"
                style={{
                  color: 'var(--color-on-surface)',
                  marginBottom: 'var(--space-4)',
                  lineHeight: '1.05',
                  overflowWrap: 'break-word',
                  wordBreak: 'break-word',
                  whiteSpace: 'nowrap',
                  fontSize: 'clamp(1.5rem, 5vw, 3rem)',
                }}
              >
                Everything, working for you.
              </h1>
              <p className="hero-subtitle">
                <span style={{ display: 'block' }}>
                  Less time figuring out a workspace, more time getting things done.
                </span>
                <span style={{ display: 'block' }}>
                  Focus on the work, we&apos;ll take care of the rest.
                </span>
              </p>
              <p className="hero-description">
                Book workspace, and meeting rooms, manage your  workspace benefits — all in one place.
              </p>
            </div>

            {/* CTAs */}
            <div
              style={{
                display: 'flex',
                gap: 'var(--space-4)',
                flexWrap: 'wrap',
                justifyContent: 'center',
                position: 'relative',
                zIndex: 30,
              }}
            >
              <Link
                href="/auth?view=register"
                id="cta-register"
                role="button"
                prefetch={true}
                className="home-btn-primary"
                style={{
                  cursor: 'pointer',
                  pointerEvents: 'auto',
                }}
              >
                Get started
              </Link>
              <Link
                href="/auth?view=login"
                id="cta-login"
                role="button"
                prefetch={true}
                className="home-btn-outline"
                style={{
                  cursor: 'pointer',
                  pointerEvents: 'auto',
                }}
              >
                Sign in
              </Link>
            </div>
          </>
        )}

        {activeView === 'privacy' && (
          <PrivacyPolicyView
            onBack={() => navigateToView('home')}
            onSwitchToTerms={() => navigateToView('terms')}
          />
        )}

        {activeView === 'terms' && (
          <TermsOfServiceView
            onBack={() => navigateToView('home')}
            onSwitchToPrivacy={() => navigateToView('privacy')}
          />
        )}

        {/* Footer */}
        <footer
          style={{
            position: activeView === 'home' ? 'absolute' : 'relative',
            bottom: activeView === 'home' ? 'var(--space-6)' : 'auto',
            marginTop: activeView === 'home' ? 0 : 'var(--space-12)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexWrap: 'wrap',
            gap: 'var(--space-3)',
            fontFamily: 'var(--type-body-small-font-family)',
            fontSize: 'var(--type-body-small-font-size)',
            color: 'var(--color-on-surface-variant)',
            zIndex: 40,
            pointerEvents: 'auto',
          }}
        >
          <span style={{ opacity: 0.75 }}>
            &copy; {new Date().getFullYear()} Workn Technologies Ltd.
          </span>
          <span style={{ opacity: 0.4 }}>&bull;</span>
          <button
            onClick={() => navigateToView('privacy')}
            type="button"
            id="link-privacy-policy"
            className="footer-legal-link"
          >
            Privacy Policy
          </button>
          <span style={{ opacity: 0.4 }}>&bull;</span>
          <button
            onClick={() => navigateToView('terms')}
            type="button"
            id="link-terms-of-service"
            className="footer-legal-link"
          >
            Terms of Service
          </button>
        </footer>
      </main>
    </>
  );
}

export default function HomeClient() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', backgroundColor: 'var(--color-surface)' }} />}>
      <HomeContent />
    </Suspense>
  );
}
