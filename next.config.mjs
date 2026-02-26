import withPWA from 'next-pwa';

const isDev = process.env.NODE_ENV === 'development';

const pwaConfig = {
  dest: 'public',
  disable: isDev,
};

const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Add other Next.js config here
};

export default withPWA(pwaConfig)(nextConfig);
