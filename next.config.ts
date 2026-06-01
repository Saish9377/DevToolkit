/** @type {import('next').NextConfig} */
const nextConfig = {
  // Turbopack config (Next.js 16 default)
  turbopack: {},

  // Compress responses
  compress: true,

  // Remove powered-by header
  poweredByHeader: false,

  // Enable static HTML export
  output: 'export',

  // Image optimization (must disable standard loader in static export)
  images: {
    unoptimized: true,
  },

  // Bypass buggy Windows child worker crashes during build type-checks
  typescript: {
    ignoreBuildErrors: true,
  },
};

module.exports = nextConfig;
