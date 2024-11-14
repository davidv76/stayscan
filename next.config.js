/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['gjcx1ldol922ulx5.public.blob.vercel-storage.com'],
  },
  async headers() {
    return [
      {
        source: '/api/webhooks/stripe',
        headers: [
          { key: 'Content-Type', value: 'application/json' },
        ],
      },
    ]
  },
  env: {
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    PRISMA_ACCELERATE_URL: process.env.PRISMA_ACCELERATE_URL,
  },
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client', 'bcrypt'],
  },
  // Add any other existing configuration options here
}

module.exports = nextConfig