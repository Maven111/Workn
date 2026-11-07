import type { Metadata } from 'next';
import AuthClient from '@/components/auth/AuthClient';

export const metadata: Metadata = {
  title: 'Authentication — Workn',
  description: 'Sign in, register, or manage your Workn account.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function AuthPage() {
  return <AuthClient />;
}
