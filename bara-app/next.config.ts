import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,

  // Disable ESLint during builds temporarily
  eslint: {
    ignoreDuringBuilds: true,
  },

  // Disable TypeScript checking during builds temporarily
  typescript: {
    ignoreBuildErrors: true,
  },

  // Enable standalone output for Docker
  output: "standalone",

  // Optimize for production
  experimental: {
    optimizePackageImports: ["react-hot-toast", "react-pdf"],
  },

  // Configure image optimization
  images: {
    unoptimized: false,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
};

export default nextConfig;
