import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testMatch: /app\.spec\.ts/,
  timeout: 60_000,
  use: { baseURL: process.env.BASE_URL ?? "http://localhost:4802" },
  webServer: process.env.BASE_URL ? undefined : {
    command: "npx http-server -p 4802 -s .",
    url: "http://localhost:4802",
    reuseExistingServer: true,
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } } },
    { name: "mobile", use: { ...devices["Pixel 7"], viewport: { width: 390, height: 844 } } },
  ],
});
