import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  use: {
    channel: process.env.PLAYWRIGHT_CHANNEL,
    baseURL: "http://127.0.0.1:3179",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    { name: "desktop", use: { viewport: { width: 1280, height: 900 } } },
    { name: "mobile", use: { viewport: { width: 375, height: 812 }, isMobile: true, hasTouch: true } },
  ],
  webServer: {
    command: "npm run dev -- --hostname 127.0.0.1 --port 3179",
    url: "http://127.0.0.1:3179/profil",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: { AUTH_SECRET: "local-profile-e2e-test-only", AUTH_TRUST_HOST: "true" },
  },
});
