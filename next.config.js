/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  publicRuntimeConfig: {
    pocketbase: 'https://gaia.tailbyte.org/pb',
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
