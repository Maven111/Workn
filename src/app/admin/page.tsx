import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth/session';
import { prisma } from '@/lib/prisma';
import AdminDashboardClient from './AdminClient';

export const metadata: Metadata = {
  title: 'Administration Console — Workn',
  description: 'Privileged administration console for Workn facility operations.',
  robots: { index: false, follow: false },
};

export default async function AdminPage() {
  const user = await getCurrentUser();

  // If not authenticated, redirect to login
  if (!user) {
    redirect('/auth?view=login&redirect=/admin');
  }

  // Authorization Check: Must possess ADMIN role (Task 5 Step 10)
  // If an ordinary MEMBER pastes the administrative URL, refuse access!
  if (user.role !== 'ADMIN') {
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
            maxWidth: '520px',
            width: '100%',
            backgroundColor: 'var(--color-surface-container-lowest)',
            border: '1px solid var(--color-outline-variant)',
            borderRadius: 'var(--radius-lg)',
            padding: 'var(--space-8)',
            boxShadow: 'var(--effect-soft-shadow)',
            textAlign: 'center',
          }}
        >
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
              fontWeight: 700,
            }}
          >
            !
          </div>

          <h1
            className="type-headline-medium"
            style={{ color: 'var(--color-on-surface)', marginBottom: 'var(--space-2)' }}
          >
            403 — Access Denied
          </h1>

          <p
            className="type-body-large"
            style={{ color: 'var(--color-on-surface-variant)', marginBottom: 'var(--space-4)' }}
          >
            Administrative Privileges Required
          </p>

          <div
            style={{
              backgroundColor: 'var(--color-surface-container-low)',
              borderRadius: 'var(--radius-md)',
              padding: 'var(--space-4)',
              textAlign: 'left',
              fontSize: 'var(--type-body-small-font-size)',
              color: 'var(--color-on-surface-variant)',
              marginBottom: 'var(--space-6)',
              lineHeight: 1.6,
            }}
          >
            <div><strong>Authenticated User:</strong> {user.email}</div>
            <div><strong>Application Role:</strong> {user.role} (Ordinary Member)</div>
            <div><strong>Requested Path:</strong> <code>/admin</code></div>
            <div><strong>Security Status:</strong> Refused by server authorization check.</div>
          </div>

          <p
            className="type-body-small"
            style={{ color: 'var(--color-on-surface-variant)', marginBottom: 'var(--space-6)' }}
          >
            Your account does not possess the <code>ADMIN</code> role required to access facility oversight, member management, or financial audit records. This unauthorized access attempt has been logged.
          </p>

          <Link
            href="/dashboard"
            className="wk-btn-primary"
            style={{ display: 'inline-block', width: '100%', textDecoration: 'none', textAlign: 'center' }}
          >
            Return to Member Dashboard
          </Link>
        </div>
      </main>
    );
  }

  // If user is ADMIN, load administration data
  const totalUsers = await prisma.user.count();
  const totalSessions = await prisma.session.count();
  const totalVerifications = await prisma.emailVerification.count();

  return (
    <AdminDashboardClient
      adminUser={user}
      stats={{
        totalUsers,
        totalSessions,
        totalVerifications,
      }}
    />
  );
}

