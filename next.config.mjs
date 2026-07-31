/** @type {import('next').NextConfig} */
const nextConfig = {
  distDir: process.env.NEXT_DIST_DIR || ".next",
  // Sandboxed dev machine can be extremely slow/contended; the 60s default
  // static-worker timeout was killing "Collecting page data" for every route
  // (including Next's internal /_app) well before any real work happened.
  staticPageGenerationTimeout: 600,
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 828, 1058, 1200, 1920, 2048, 2400],
    imageSizes: [384, 640, 720, 828, 1058, 1200, 1440, 1920, 2400],
    minimumCacheTTL: 31536000,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  webpack: (config, { dev }) => {
    if (!dev) config.cache = false;
    return config;
  },
};

export default nextConfig;
