import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Cloudflare Pages handles output via @cloudflare/next-on-pages
  // Do NOT use output: "standalone" — it conflicts with CF Pages
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  images: {
    // Disable Next.js image optimization on CF Pages
    // (requires server-side processing not available on Workers)
    unoptimized: true,
  },
};

export default nextConfig;
