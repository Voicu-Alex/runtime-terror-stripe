import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Acest checkout este proiectul; nu folosi lockfile-ul din directorul părinte.
  outputFileTracingRoot: process.cwd(),
  // Documentele încărcate (PDF, poze) pot avea câțiva MB; limita implicită e 1 MB.
  experimental: {
    serverActions: { bodySizeLimit: "10mb" },
  },
  // ESLint nu e instalat încă (eslint-config-next nu era în cache-ul local la 2026-10-28). Tipurile le verifică tsc.
  eslint: { ignoreDuringBuilds: true },
  // Macheta v6 (mockup/v6, copiată în public/ la build): adrese scurte pentru ea.
  async redirects() {
    return [
      { source: "/v6", destination: "/v6/index.html", permanent: false },
      { source: "/v6/", destination: "/v6/index.html", permanent: false },
    ];
  },
};

export default nextConfig;
