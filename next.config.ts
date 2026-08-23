import type { NextConfig } from "next";

const R2_HOSTNAME = process.env.NEXT_PUBLIC_R2_HOSTNAME;

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    // Serve AVIF/WebP from the built-in optimizer where next/image is used.
    formats: ['image/avif', 'image/webp'],
    // Cache optimized images at the edge for a day before revalidating.
    minimumCacheTTL: 86400,
    remotePatterns: [
      // Cloudflare R2 public bucket. The r2.dev subdomain covers development;
      // NEXT_PUBLIC_R2_HOSTNAME points at the custom CDN domain in production.
      { protocol: 'https', hostname: '**.r2.dev' },
      ...(R2_HOSTNAME ? [{ protocol: 'https' as const, hostname: R2_HOSTNAME }] : []),
    ],
  },
  experimental: {
    // Tree-shake heavy libs to per-icon/per-export imports → smaller client JS.
    optimizePackageImports: ['motion'],
  },
};

export default nextConfig;
