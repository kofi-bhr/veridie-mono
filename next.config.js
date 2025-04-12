/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      },
    ],
  },
  // Explicitly tell Next.js to use only the App Router
  // This prevents it from trying to scan the non-existent pages directory
  experimental: {
    pagesDir: false, // Disable Pages Router completely
  },
};

module.exports = nextConfig;
