import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/preview",
  workers: 2,
  timeout: 45000,
  expect: { timeout: 12000 },
  reporter: [["list"]],
  outputDir: "test-results/preview",
  use: {
    baseURL: "http://127.0.0.1:3200",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    launchOptions: {
      ...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE } : {}),
    },
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 1000 } } },
    { name: "mobile", use: { ...devices["iPhone 13"], defaultBrowserType: "chromium" } },
  ],
  webServer: [
    {
      command: "node scripts/preview-server.mjs 3199",
      env: { NEXT_PUBLIC_ACCESSREADY_BASE_PATH: "/ports/3100" },
      url: "http://127.0.0.1:3199/api/health",
      reuseExistingServer: false,
    },
    {
      command: "node tests/support/port-proxy.mjs 3200 3199 /ports/3100",
      url: "http://127.0.0.1:3200/ports/3100/api/health",
      reuseExistingServer: false,
    },
  ],
});
