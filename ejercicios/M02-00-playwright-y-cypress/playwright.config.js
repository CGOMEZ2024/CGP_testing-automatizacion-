// Configuración de Playwright para M02-00: pruebas en playwright/, app arrancada por webServer
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './playwright',
  outputDir: './test-results',
  reporter: 'list',
  use: { baseURL: 'http://localhost:3200' },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: 'node app/server.mjs',          // Playwright arranca la app antes de las pruebas
    url: 'http://localhost:3200',
    reuseExistingServer: true,               // si ya está en marcha, la reutiliza
  },
});
