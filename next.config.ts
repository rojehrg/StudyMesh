import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Use Webpack instead of Turbopack (needed for transformers.js compatibility)
  // Run with: next build --webpack

  // Exclude transformers.js dependencies from server-side bundling
  serverExternalPackages: ['@xenova/transformers', 'onnxruntime-node', 'sharp'],

  // Empty turbopack config to satisfy Next.js 16
  turbopack: {},

  // Webpack configuration for transformers.js compatibility
  webpack: (config, { isServer }) => {
    // Disable onnxruntime-node (we only use browser version)
    config.resolve.alias = {
      ...config.resolve.alias,
      "sharp$": false,
      "onnxruntime-node$": false,
    };

    // Prevent multiple React instances (fixes invalid hook call error)
    if (!isServer) {
      config.resolve.alias["react"] = path.resolve("./node_modules/react");
      config.resolve.alias["react-dom"] = path.resolve("./node_modules/react-dom");
    }

    return config;
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
        ],
      },
    ];
  },
};

export default nextConfig;
