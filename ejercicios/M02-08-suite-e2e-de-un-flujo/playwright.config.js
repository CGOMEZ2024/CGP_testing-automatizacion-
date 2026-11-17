// Configuración de Playwright para M02-08 (la app la arranca webServer)
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  outputDir: './test-results',
  reporter: 'list',
  use: { baseURL: 'http://localhost:3208' },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: 'node app/server.mjs',
    url: 'http://localhost:3208',
    reuseExistingServer: true,
  },
});
