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
      {/* Fixed top header */}
      <header style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 'var(--space-4) var(--space-8)',
        zIndex: 100,
        backgroundColor: 'color-mix(in srgb, var(--color-surface) 85%, transparent)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: '1px solid color-mix(in srgb, var(--color-outline-variant) 50%, transparent)',
      }}>
        <Link href="/" aria-label="Workn Home" style={{ textDecoration: 'none' }}>
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
              cursor: 'pointer',
            }}
          >
            W
          </div>
        </Link>
        <Link href="/register" className="home-btn-primary" id="cta-get-started">Get started</Link>
      </header>


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
          Your Workspace, Your Way.
        </h1>
        <p className="hero-subtitle">
          <span style={{ display: 'block' }}>
            Less time figuring out a workspace, more time getting things done.
          </span>
          <span style={{ display: 'block' }}>
            Everything Working for you
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
          href="/register"
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
          href="/login"
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

      {/* Footer */}
      <footer
        style={{
          position: 'absolute',
          bottom: 'var(--space-6)',
          fontFamily: 'var(--type-body-small-font-family)',
          fontSize: 'var(--type-body-small-font-size)',
          color: 'var(--color-on-surface-variant)',
          opacity: 0.6,
          pointerEvents: 'none',
        }}
      >
        &copy; {new Date().getFullYear()} Workn Technologies Ltd.
      </footer>
    </main>
  );
}
