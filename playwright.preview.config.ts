import { defineConfig, devices } from "@playwright/test";

const previewPort = Number(process.env.ACCESSREADY_PREVIEW_PORT ?? "4173");
const workspacePrefix = `/ports/${previewPort}`;

export default defineConfig({
  testDir: "./tests/preview",
  workers: 2,
  timeout: 45000,
  expect: { timeout: 12000 },
  reporter: [["list"]],
  outputDir: "test-results/preview",
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? "http://127.0.0.1:3200",
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
  // Reuse the live preview when supplied; otherwise exercise the proxy fixture.
  webServer: process.env.PLAYWRIGHT_BASE_URL ? undefined : [
    {
      command: "node scripts/preview-server.mjs 3199",
      env: { NEXT_PUBLIC_ACCESSREADY_BASE_PATH: `${workspacePrefix}/accessready-v2` },
      url: "http://127.0.0.1:3199/accessready-v2/api/health",
      reuseExistingServer: false,
    },
    {
      command: `node tests/support/port-proxy.mjs 3200 3199 ${workspacePrefix}`,
      url: `http://127.0.0.1:3200${workspacePrefix}/accessready-v2/api/health`,
      reuseExistingServer: false,
    },
  ],
});
