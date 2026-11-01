/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      {
        source: '/privacy',
        destination: '/?view=privacy',
        permanent: false,
      },
      {
        source: '/terms',
        destination: '/?view=terms',
        permanent: false,
      },
      {
        source: '/privacy-policy',
        destination: '/?view=privacy',
        permanent: false,
      },
      {
        source: '/terms-of-service',
        destination: '/?view=terms',
        permanent: false,
      },
      {
        source: '/login',
        destination: '/auth?view=login',
        permanent: false,
      },
      {
        source: '/register',
        destination: '/auth?view=register',
        permanent: false,
      },
      {
        source: '/forgot-password',
        destination: '/auth?view=forgot-password',
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
