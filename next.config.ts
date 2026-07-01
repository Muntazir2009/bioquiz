import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  images: {
    unoptimized: true,
  },
  allowedDevOrigins: ['127.0.0.1', 'localhost', '0.0.0.0', 'preview-chat-0c43b15c-9de1-4951-b402-9d48d6dc288a.space-z.ai'],
  async headers() {
    return [
      // HTML pages — no cache so users always get fresh content
      {
        source: '/:path((?!_next|chat-widget|favicon|logo|og|robots|sitemap|manifest|icon|apple-icon|_vercel|\\.well-known).*)',
        headers: [
          { key: 'Cache-Control', value: 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0' },
          { key: 'Pragma', value: 'no-cache' },
          { key: 'Expires', value: '0' },
        ],
      },
      // Next.js static assets — long immutable cache
      {
        source: '/_next/(.*)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      // Public static assets (chat widget, images, fonts, etc.) — short cache with revalidation
      {
        source: '/chat-widget(.*)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=60, stale-while-revalidate=300' },
        ],
      },
    ];
  },
};

export default nextConfig;