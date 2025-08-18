// TEMPORARILY DISABLED - import { withSentryConfig } from '@sentry/nextjs';

/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // Temporarily allow production builds to complete with TypeScript errors
    // TODO: Fix TypeScript errors and set to false
    ignoreBuildErrors: true,
  },
  eslint: {
    // Only run ESLint on these directories during production builds
    dirs: ['src/app', 'src/components', 'src/utils'],
    // Allow production builds to complete even if there are ESLint errors
    ignoreDuringBuilds: true,
  },

  // Configure webpack to handle Supabase in Edge Runtime and optimize performance
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Exclude problematic Node.js modules from Edge Runtime
      config.resolve.alias = {
        ...config.resolve.alias,
        // Prevent Node.js APIs from being used in Edge Runtime
        'process': false,
        'fs': false,
        'path': false,
      };
    }

    // Optimize webpack cache to reduce large string serialization warnings
    config.cache = {
      ...config.cache,
      compression: 'gzip',
      maxMemoryGenerations: 1,
    };

    // Optimize module concatenation
    config.optimization = {
      ...config.optimization,
      concatenateModules: true,
    };

    return config;
  },

  // External packages for server components
  serverExternalPackages: ['@supabase/supabase-js'],

  // Exclude test pages from production build
  async redirects() {
    return [
      {
        source: '/test-wait',
        destination: '/404',
        permanent: false,
      },
    ];
  },
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
      {
        protocol: "https",
        hostname: "fal.media",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "*.fal.media",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "3002",
        pathname: "/api/placeholder/**",
      },
    ],
    // Allow SVG optimization for placeholder images
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    // Optimize image loading to prevent preload warnings
    minimumCacheTTL: 60,
    formats: ['image/webp', 'image/avif'],
  },

  // Configure security headers
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
};

// TEMPORARILY DISABLED - Sentry configuration
/*
const sentryWebpackPluginOptions = {
  // Additional config options for the Sentry Webpack plugin
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,

  // Only print logs for uploading source maps in CI
  silent: !process.env.CI,

  // Upload source maps in production only
  widenClientFileUpload: true,
  hideSourceMaps: true,
  disableLogger: true,

  // Automatically tree-shake Sentry logger statements to reduce bundle size
  automaticVercelMonitors: true,
};

// Export the configuration wrapped with Sentry
export default withSentryConfig(nextConfig, sentryWebpackPluginOptions);
*/

// TEMPORARILY DISABLED SENTRY - Export plain config
export default nextConfig;
