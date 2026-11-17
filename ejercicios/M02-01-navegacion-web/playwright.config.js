// Configuración de Playwright para M02-01 (pruebas en tests/; la app la arranca webServer)
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  outputDir: './test-results',
  reporter: 'list',
  use: { baseURL: 'http://localhost:3201' },     // page.goto('/') abre http://localhost:3201/
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: 'node app/server.mjs',
    url: 'http://localhost:3201',
    reuseExistingServer: true,
  },
});
