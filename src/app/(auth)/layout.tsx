import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Workn — Sign In',
  description: 'Access your Workn coworking membership and workspace management account.',
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'grid',
        gridTemplateColumns: '1fr',
        backgroundColor: 'var(--color-surface)',
      }}
    >
      {children}
    </div>
  );
}
