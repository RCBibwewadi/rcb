import type { NextConfig } from "next";

const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true, // ✅ Ignore all ESLint errors during build
  },
};
export default nextConfig;
