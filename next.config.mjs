/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "api.astria.ai",
        pathname: "/rails/active_storage/blobs/**",
      },
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      {
        protocol: "https",
        hostname: "sdbooth2-production.s3.amazonaws.com",
        pathname: "/**",
      },
    ],
  },
  // Fix for HTTP 431 error - move external packages to new location
  serverExternalPackages: ["@supabase/supabase-js"],
  // Configure headers for larger cookie support
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
