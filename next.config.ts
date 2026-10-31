import type { NextConfig } from "next";

const basePath = process.env.NEXT_PUBLIC_ACCESSREADY_BASE_PATH ?? "";
const previewPort = /^\/ports\/(\d+)(?:\/|$)/.exec(basePath)?.[1];

const nextConfig: NextConfig = {
  // Optional workspace port preview; normal local and Vercel builds remain at "/".
  basePath,
  // Each port has its own assets, so opening a second preview cannot overwrite
  // the files still being served by the first one.
  distDir: basePath ? `.next-preview-${previewPort ?? "custom"}` : ".next",
  reactStrictMode: true,
  poweredByHeader: false,
  experimental: { cpus: 2 },
};

export default nextConfig;
