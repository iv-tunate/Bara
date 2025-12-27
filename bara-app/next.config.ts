import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,

  // Fix for Next.js 16.0.10 type mismatch
  // @ts-ignore
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
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
    ],
  },

  generateBuildId: async () => {
    return `build-${Date.now()}`;
  },
};

export default nextConfig;
