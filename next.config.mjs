/** @type {import('next').NextConfig} */
const nextConfig = {
  // Raise the body-size limit for PDF uploads (default is 1 MB)
  experimental: {
    serverActions: {
      bodySizeLimit: "52mb",
    },
  },

  // Tell Next.js 16 we're happy with Turbopack and have no custom webpack config
  turbopack: {},
};

export default nextConfig;
