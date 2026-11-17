// Playwright de la solución: npx playwright test --config solucion/playwright.config.js
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  reporter: 'list',
  outputDir: './test-results',
  use: { baseURL: 'http://localhost:3505' },
  webServer: {
    command: 'node ../app/server.mjs',
    url: 'http://localhost:3505/registro.html',
    reuseExistingServer: true,
  },
});
