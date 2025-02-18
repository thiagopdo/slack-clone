import path from "path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      "@": path.resolve(__dirname, "src"), // Garante que o alias '@/' aponta para 'src/'
    };
    return config;
  },
};

export default nextConfig;
