import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/auth/server';
import { logout } from '@/lib/auth/actions';

export const metadata: Metadata = {
  title: 'Workn — Dashboard',
  description: 'Manage your coworking membership and workspace bookings.',
};

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

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

      {/* Content placeholder */}
      <section
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 'var(--space-12)',
          textAlign: 'center',
          gap: 'var(--space-4)',
        }}
      >
        <h1 className="type-headline-large" style={{ color: 'var(--color-on-surface)' }}>
          Dashboard
        </h1>
        <p className="type-body-large" style={{ color: 'var(--color-on-surface-variant)', maxWidth: '480px' }}>
          Welcome back! Your membership, bookings, and workspace benefits will appear here.
        </p>
        <div
          style={{
            marginTop: 'var(--space-4)',
            padding: 'var(--space-4) var(--space-6)',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--color-primary-container)',
            color: 'var(--color-on-primary-container)',
            fontFamily: 'var(--type-body-medium-font-family)',
            fontSize: 'var(--type-body-medium-font-size)',
          }}
        >
          Signed in as <strong>{user.email}</strong>
        </div>
      </section>
    </main>
  );
}
