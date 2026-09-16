import path from "node:path";
import type { NextConfig } from "next";

const repoRoot = path.join(import.meta.dirname, "..");

const nextConfig: NextConfig = {
  outputFileTracingRoot: repoRoot,
  outputFileTracingIncludes: {
    "/docs/**": ["../docs/**/*"],
    "/map/**": ["../web/data/atlas/**/*"],
  },
  turbopack: {
    root: repoRoot,
  },
};

export default nextConfig;
