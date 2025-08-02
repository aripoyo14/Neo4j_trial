import type { NextConfig } from 'next'

/** @type {NextConfig} */
const nextConfig: NextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://backend:8000/api/:path*', // Docker Compose のサービス名を使う
      },
    ]
  },
};

module.exports = nextConfig;

