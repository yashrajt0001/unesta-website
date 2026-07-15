import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    // Serve AVIF/WebP from the built-in optimizer where next/image is used.
    formats: ['image/avif', 'image/webp'],
    // Cache optimized images at the edge for a day before revalidating.
    minimumCacheTTL: 86400,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
    ],
  },
  experimental: {
    // Tree-shake heavy libs to per-icon/per-export imports → smaller client JS.
    optimizePackageImports: ['motion'],
  },
};

export default nextConfig;
