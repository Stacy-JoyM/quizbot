/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',  // Changed from 'standalone' to 'export'
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  },
  images: {
    unoptimized: true,  // Required for static export
  }
}

module.exports = nextConfig