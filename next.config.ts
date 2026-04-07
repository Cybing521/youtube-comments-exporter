import path from "node:path";
import { fileURLToPath } from "node:url";
import type { NextConfig } from "next";

const appRoot = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  outputFileTracingRoot: appRoot,
  experimental: {
    webpackBuildWorker: false
  },
  eslint: {
    ignoreDuringBuilds: true
  }
};

export default nextConfig;
