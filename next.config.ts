/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['images.unsplash.com'],
  },
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000', 'localhost:3002'],
    },
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: '/api/:path*',
      },
      {
        source: '/build-profile',
        destination: '/pages/build-profile',
      },
      {
        source: '/contact',
        destination: '/pages/contact',
      },
      {
        source: '/profile',
        destination: '/pages/profile',
      },
      
    ];
  },
};

export default nextConfig;
