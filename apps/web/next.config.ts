import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  outputFileTracingRoot: path.join(process.cwd(), "../.."),
  eslint: {
    ignoreDuringBuilds: true
  }
};

export default nextConfig;
