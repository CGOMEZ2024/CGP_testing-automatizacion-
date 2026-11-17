// Playwright de la solución: npx playwright test --config solucion/playwright.config.js
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  reporter: 'list',
  outputDir: './test-results',
  use: {
    baseURL: 'http://localhost:3506',
    trace: 'retain-on-failure',
    actionTimeout: 5_000,
  },
  webServer: {
    command: 'node ../app/server.mjs',
    url: 'http://localhost:3506/producto.html',
    reuseExistingServer: true,
  },
});
