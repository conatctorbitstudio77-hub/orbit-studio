import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  experimental: {
    // Turbopack's persistent dev cache is unreliable on this project's path
    // because it lives inside an iCloud-synced Desktop folder, which
    // dematerializes/locks files mid-write and crashes the dev server.
    turbopackFileSystemCacheForDev: false,
  },
};

export default nextConfig;
