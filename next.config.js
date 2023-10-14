/** @type {import('next').NextConfig} */
const { version } = require('./package.json');
const nextConfig = {
  reactStrictMode: true,
  publicRuntimeConfig: {
    pocketbase: 'https://gaia.tailbyte.org/pb',
    appVersion: version,
  },
  output: 'standalone',
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8090',
        pathname: '/api/**',
      },
    ],
  },
}

module.exports = nextConfig
