import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/auth/server';
import { prisma } from '@/lib/prisma';
import { logout } from '@/lib/auth/actions';
import DeletionClient from './DeletionClient';

export const metadata: Metadata = {
  title: 'Dashboard — Workn',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth?view=login');
  }

  // Load application-tier user profile from PostgreSQL
  const appUser = await prisma.user.findUnique({
    where: { authUserId: user.id },
  });

  // TASK 5 STEP 6 (Evidence 12): Account Deletion Lockout View
  // If the account has been scheduled for deletion, render the authoritative statutory lockout screen!
  if (appUser && appUser.accountStatus === 'INACTIVE') {
    return (
      <main
        style={{
          minHeight: '100vh',
          backgroundColor: 'var(--color-surface)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 'var(--space-6)',
        }}
      >
        <div
          role="alert"
          style={{
            maxWidth: '580px',
            width: '100%',
            backgroundColor: 'var(--color-surface-container-lowest)',
            border: '1.5px solid var(--color-error)',
            borderRadius: 'var(--radius-lg)',
            padding: 'var(--space-8)',
            boxShadow: 'var(--effect-soft-shadow)',
            textAlign: 'center',
          }}
        >
          {/* Lockout Badge */}
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'var(--color-error-container)',
              color: 'var(--color-on-error-container)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto var(--space-6)',
              fontSize: '28px',
            }}
          >
            🔒
          </div>

          <span
            style={{
              display: 'inline-block',
              padding: 'var(--space-1) var(--space-3)',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'var(--color-error-container)',
              color: 'var(--color-on-error-container)',
              fontSize: 'var(--type-label-small-font-size)',
              fontWeight: 700,
              letterSpacing: '0.5px',
              marginBottom: 'var(--space-3)',
            }}
          >
            ACCOUNT STATUS: INACTIVE (LOCKED)
          </span>

          <h1
            style={{
              fontFamily: 'var(--type-headline-large-font-family)',
              fontSize: 'var(--type-headline-large-font-size)',
              fontWeight: 700,
              color: 'var(--color-on-surface)',
              marginBottom: 'var(--space-3)',
            }}
          >
            Account Scheduled for Deletion
          </h1>

          <p
            style={{
              fontFamily: 'var(--type-body-medium-font-family)',
              fontSize: 'var(--type-body-medium-font-size)',
              color: 'var(--color-on-surface-variant)',
              lineHeight: 1.6,
              marginBottom: 'var(--space-6)',
            }}
          >
            Your account deletion request has been processed under <strong>NDPA 2023 Section 34</strong> and <strong>GDPR Article 17</strong>. Your account is immediately locked, all active browser sessions across all devices have been terminated, and personal contact details have been anonymised.
          </p>

          {/* Statutory Details Breakdown */}
          <div
            style={{
              backgroundColor: 'var(--color-surface-container-high)',
              borderRadius: 'var(--radius-md)',
              padding: 'var(--space-4)',
              textAlign: 'left',
              marginBottom: 'var(--space-6)',
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-3)',
              fontSize: 'var(--type-body-small-font-size)',
              fontFamily: 'var(--type-body-medium-font-family)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--color-on-surface-variant)' }}>Grace Period Window:</span>
              <strong style={{ color: 'var(--color-on-surface)' }}>30 Days (Statutory)</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--color-on-surface-variant)' }}>Active Sessions:</span>
              <strong style={{ color: 'var(--color-error)' }}>0 (All Revoked)</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--color-on-surface-variant)' }}>Identity State:</span>
              <strong style={{ color: 'var(--color-on-surface)' }}>Anonymised Member</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--color-on-surface-variant)' }}>Commercial Ledgers:</span>
              <strong style={{ color: 'var(--color-on-surface)' }}>Preserved for 6 Years (CAMA / LIRS)</strong>
            </div>
          </div>

          <form action={logout}>
            <button
              type="submit"
              style={{
                width: '100%',
                padding: 'var(--space-3) var(--space-6)',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--color-on-surface)',
                color: 'var(--color-surface)',
                border: 'none',
                fontFamily: 'var(--type-label-large-font-family)',
                fontSize: 'var(--type-label-large-font-size)',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Sign Out & Return to Home
            </button>
          </form>
        </div>
      </main>
    );
  }

  // Active Member Dashboard
  return (
    <main
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--color-surface)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Top Nav */}
      <header
        style={{
          borderBottom: '1px solid var(--color-outline-variant)',
          backgroundColor: 'var(--color-surface-container-lowest)',
          padding: 'var(--space-4) var(--space-6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--color-primary)',
              color: 'var(--color-on-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: 'var(--type-display-large-font-family)',
              fontWeight: 700,
              fontSize: '18px',
            }}
          >
            W
          </div>
          <span
            style={{
              fontFamily: 'var(--type-headline-large-font-family)',
              fontWeight: 700,
              fontSize: '18px',
              color: 'var(--color-on-surface)',
              letterSpacing: '-0.5px',
            }}
          >
            Workn
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
          <span
            className="type-body-medium"
            style={{ color: 'var(--color-on-surface-variant)' }}
          >
            {user.email}
          </span>
          <form action={logout}>
            <button
              type="submit"
              id="dashboard-logout"
              style={{
                padding: 'var(--space-2) var(--space-4)',
                borderRadius: 'var(--radius-md)',
                border: '1.5px solid var(--color-outline-variant)',
                backgroundColor: 'transparent',
                color: 'var(--color-on-surface)',
                fontFamily: 'var(--type-label-medium-font-family)',
                fontSize: 'var(--type-label-medium-font-size)',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'border-color 150ms ease',
              }}
            >
              Sign out
            </button>
          </form>
        </div>
      </header>

      {/* Main Content */}
      <section
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: 'var(--space-10) var(--space-6)',
          textAlign: 'center',
          gap: 'var(--space-4)',
        }}
      >
        <h1 className="type-headline-large" style={{ color: 'var(--color-on-surface)' }}>
          Member Dashboard
        </h1>
        <p className="type-body-large" style={{ color: 'var(--color-on-surface-variant)', maxWidth: '480px' }}>
          Welcome back! Your membership, bookings, and workspace benefits are active.
        </p>

        <div
          style={{
            marginTop: 'var(--space-2)',
            padding: 'var(--space-3) var(--space-6)',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--color-primary-container)',
            color: 'var(--color-on-primary-container)',
            fontFamily: 'var(--type-body-medium-font-family)',
            fontSize: 'var(--type-body-medium-font-size)',
          }}
        >
          Signed in as <strong>{user.email}</strong>
        </div>

        {/* Task 5 Step 6: Account Deletion & Erasure Trigger */}
        <DeletionClient />
      </section>
    </main>
  );
}
