/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'https://api.zendfi.tech',
  },
  async rewrites() {
    return [
      {
        source: '/pay/link/:code',
        destination: '/checkout/:code',
      },
    ];
  },
};

export default nextConfig;
