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
};

export default nextConfig;