/** @type {import('next').NextConfig} */
const apiInternal =
  process.env.INTERNAL_API_URL?.replace(/\/$/, '') || 'http://localhost:3000';
const apiPublic =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') || 'http://localhost:3000';

let publicHost = 'localhost';
try {
  publicHost = new URL(apiPublic).hostname;
} catch {
  /* keep localhost */
}

const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
        pathname: '/uploads/**',
      },
      {
        protocol: 'http',
        hostname: '127.0.0.1',
        port: '3000',
        pathname: '/uploads/**',
      },
      {
        protocol: 'http',
        hostname: publicHost,
        port: '8080',
        pathname: '/uploads/**',
      },
      {
        protocol: 'http',
        hostname: publicHost,
        port: '3000',
        pathname: '/uploads/**',
      },
      {
        protocol: 'https',
        hostname: publicHost,
        pathname: '/uploads/**',
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: '/uploads/:path*',
        destination: `${apiInternal.replace(/\/api$/, '')}/uploads/:path*`,
      },
    ];
  },
};

export default nextConfig;
