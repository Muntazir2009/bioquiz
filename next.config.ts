import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  allowedDevOrigins: ['127.0.0.1', 'localhost', '0.0.0.0', '*.vercel.run'],
};

export default nextConfig;
