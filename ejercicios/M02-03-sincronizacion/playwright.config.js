// Configuración de Playwright para M02-03 (la app la arranca webServer)
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  outputDir: './test-results',
  reporter: 'list',
  use: { baseURL: 'http://localhost:3203' },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: 'node app/server.mjs',     // hereda RETRASO_MIN / RETRASO_MAX si los defines al lanzar
    url: 'http://localhost:3203',
    reuseExistingServer: true,
  },
});
