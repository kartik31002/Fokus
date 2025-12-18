/** @type {import('next').NextConfig} */

// Get the base path from environment variable, default to empty string (root)
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || ''
const isProd = process.env.NODE_ENV === 'production'

const nextConfig = {
  reactStrictMode: true,
  output: 'export', // Enable static export for GitHub Pages
  images: {
    unoptimized: true, // Required for static export
  },
  // Only set basePath in production if NEXT_PUBLIC_BASE_PATH is set
  ...(basePath && isProd ? { basePath } : {}),
  // Disable trailing slash for cleaner URLs
  trailingSlash: false,
}

module.exports = nextConfig
