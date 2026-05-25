/** @type {import('next').NextConfig} */
const nextConfig = {
  distDir: process.env.NEXT_DIST_DIR || ".next",
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
};

export default nextConfig;
