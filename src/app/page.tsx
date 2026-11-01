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

import HomeClient from '@/components/home/HomeClient';

export default function HomePage() {
  return <HomeClient />;
}

