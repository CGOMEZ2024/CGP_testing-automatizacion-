// Configuración de Playwright para M02-06 (la app la arranca webServer)
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  outputDir: './test-results',
  reporter: 'list',
  workers: 1,                          // un solo worker: el orden de las peticiones es reproducible
  use: { baseURL: 'http://localhost:3206' },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: 'node app/server.mjs',
    url: 'http://localhost:3206',
    reuseExistingServer: false,        // servidor nuevo en cada ejecución: el contador empieza en 0
  },
});
