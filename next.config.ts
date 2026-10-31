import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Optional workspace port preview; normal local and Vercel builds remain at "/".
  basePath: process.env.NEXT_PUBLIC_ACCESSREADY_BASE_PATH ?? "",
  distDir: process.env.NEXT_PUBLIC_ACCESSREADY_BASE_PATH ? ".next-preview-v2" : ".next",
  reactStrictMode: true,
  poweredByHeader: false,
  experimental: { cpus: 2 },
};

export default nextConfig;
