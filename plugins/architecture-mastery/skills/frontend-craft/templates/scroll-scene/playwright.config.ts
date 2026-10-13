import { defineConfig, devices } from "@playwright/test";

// WebGL por software en CI/headless: lento pero determinista. Por eso timeouts generosos.
const gl = { launchOptions: { args: ["--enable-unsafe-swiftshader", "--use-angle=swiftshader", "--ignore-gpu-blocklist"] } };

export default defineConfig({
  testMatch: /.*\.spec\.ts/,
  timeout: 240_000,
  expect: { timeout: 30_000 },
  fullyParallel: false,
  workers: 1,
  use: { baseURL: process.env.BASE_URL ?? "http://localhost:4800" },
  webServer: process.env.BASE_URL ? undefined : {
    command: "npx http-server -p 4800 -s .",
    url: "http://localhost:4800",
    reuseExistingServer: true,
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 }, ...gl } },
    { name: "mobile", use: { ...devices["Pixel 7"], viewport: { width: 390, height: 844 }, ...gl } },
  ],
});
