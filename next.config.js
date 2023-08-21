/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  publicRuntimeConfig: {
    pocketbase: 'http://localhost:8090',
  },
}

module.exports = nextConfig
