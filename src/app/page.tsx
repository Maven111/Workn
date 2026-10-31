import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Workn — Coworking & Workspace Management',
  description: 'Workspace management made simple',
  keywords: [
    'coworking space Lagos',
    'workspace management',
    'desk booking Lagos',
    'meeting rooms Lagos',
    'coworking membership',
    'shared office Nigeria',
  ],
  authors: [{ name: 'Workn Technologies Ltd' }],
  creator: 'Workn',
  publisher: 'Workn',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Workn — Coworking & Workspace Management',
    description: 'Workspace management made simple',
    url: '/',
    siteName: 'Workn',
    locale: 'en_NG',
    type: 'website',
    images: [
      {
        url: '/icon.svg',
        width: 512,
        height: 512,
        alt: 'Workn — Coworking & Workspace Management in Lagos, Nigeria',
      },
    ],
  },
  twitter: {
    card: 'summary',
    title: 'Workn — Coworking & Workspace Management',
    description: 'Workspace management made simple',
    creator: '@workn',
    images: ['/icon.svg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function HomePage() {
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
        }
        .home-btn-primary:hover {
          opacity: 0.9;
          transform: translateY(-1px);
        }
      `}</style>

      <main
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 'var(--space-6)',
          background: `radial-gradient(ellipse 80% 55% at 50% -5%, color-mix(in srgb, var(--color-primary) 12%, transparent), transparent)`,
          backgroundColor: 'var(--color-surface)',
          position: 'relative',
        }}
      >
        {/* Brand Mark */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-12)' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--color-primary)',
              color: 'var(--color-on-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: 'var(--type-display-large-font-family)',
              fontWeight: 700,
              fontSize: '24px',
              boxShadow: 'var(--effect-medium-shadow)',
            }}
          >
            W
          </div>
          <span
            style={{
              fontFamily: 'var(--type-headline-large-font-family)',
              fontWeight: 700,
              fontSize: '24px',
              color: 'var(--color-on-surface)',
              letterSpacing: '-0.5px',
            }}
          >
            Workn
          </span>
        </div>

        {/* Hero */}
        <div style={{ textAlign: 'center', maxWidth: '560px', marginBottom: 'var(--space-10)' }}>
          <h1
            className="type-display-small"
            style={{ color: 'var(--color-on-surface)', marginBottom: 'var(--space-4)' }}
          >
            Your workspace,<br />your way.
          </h1>
          <p
            className="type-body-large"
            style={{ color: 'var(--color-on-surface-variant)', lineHeight: '1.65' }}
          >
            Book desks and meeting rooms, manage your coworking membership,
            and track your workspace benefits — all in one place.
          </p>
        </div>

        {/* CTAs */}
        <div style={{ display: 'flex', gap: 'var(--space-4)', flexWrap: 'wrap', justifyContent: 'center' }}>
          <Link href="/register" id="cta-register" className="home-btn-primary">
            Get started
          </Link>
          <Link href="/login" id="cta-login" className="home-btn-outline">
            Sign in
          </Link>
        </div>

        {/* Footer */}
        <footer
          style={{
            position: 'absolute',
            bottom: 'var(--space-6)',
            fontFamily: 'var(--type-body-small-font-family)',
            fontSize: 'var(--type-body-small-font-size)',
            color: 'var(--color-on-surface-variant)',
            opacity: 0.6,
          }}
        >
          &copy; {new Date().getFullYear()} Workn Technologies Ltd.
        </footer>
      </main>
    </>
  );
}
