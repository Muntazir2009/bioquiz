/** @type {import('next').NextConfig} */
const nextConfig = {
  // Serve static HTML files from public directory
  async rewrites() {
    return [
      {
        source: '/:path*.html',
        destination: '/:path*.html',
      },
    ];
  },
};

module.exports = nextConfig;
