import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Documentele încărcate (PDF, poze) pot avea câțiva MB; limita implicită e 1 MB.
  experimental: {
    serverActions: { bodySizeLimit: "10mb" },
  },
};

export default nextConfig;
