import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,

  eslint: {
    ignoreDuringBuilds: true,
  },

  typescript: {
    ignoreBuildErrors: true,
  },

  output: "standalone",

  experimental: {
    optimizePackageImports: ["react-hot-toast", "react-pdf"],
  },

  images: {
    unoptimized: false,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
    domains: ["res.cloudinary.com"],
  },
  generateBuildId: async () => {
    return `build-${Date.now()}`;
  },
};

export default nextConfig;
