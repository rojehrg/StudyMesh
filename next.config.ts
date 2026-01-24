import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Compiler options for smaller bundles
  compiler: {
    // Remove console.log in production
    removeConsole: process.env.NODE_ENV === "production" ? {
      exclude: ["error", "warn"],
    } : false,
  },

  // Modularize imports for better tree-shaking
  modularizeImports: {
    // Optimize lucide-react icons - import only used icons
    "lucide-react": {
      transform: "lucide-react/dist/esm/icons/{{kebabCase member}}",
    },
  },

  // Image optimization settings
  images: {
    // Enable modern image formats
    formats: ["image/avif", "image/webp"],
    // Device sizes for responsive images
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    // Image sizes for next/image
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // Minimize image processing time in development
    minimumCacheTTL: 60,
    // Remote patterns for external images
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
      },
      {
        protocol: "https",
        hostname: "avatars.slack-edge.com",
      },
    ],
  },

  // Experimental features for better performance
  experimental: {
    // Optimize CSS
    optimizeCss: true,
    // Enable scroll restoration
    scrollRestoration: true,
  },

  // Security headers
  async headers() {
    return [
      {
        // Apply these headers to all routes
        source: "/:path*",
        headers: [
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
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
          // Resource hints for external domains
          {
            key: "Link",
            value: [
              '<https://fonts.googleapis.com>; rel=preconnect',
              '<https://fonts.gstatic.com>; rel=preconnect; crossorigin',
            ].join(", "),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
