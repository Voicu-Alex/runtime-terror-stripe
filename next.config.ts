import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Documentele încărcate (PDF, poze) pot avea câțiva MB; limita implicită e 1 MB.
  experimental: {
    serverActions: { bodySizeLimit: "10mb" },
  },
  // ESLint nu e instalat încă (eslint-config-next nu era în cache-ul local la 2026-10-28). Tipurile le verifică tsc.
  eslint: { ignoreDuringBuilds: true },
};

export default nextConfig;
