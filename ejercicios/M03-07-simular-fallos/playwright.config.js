// Pruebas de la página de pedidos en Chromium; la API real la sirve app/server.mjs.
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  reporter: 'list',
  outputDir: './test-results',
  use: { baseURL: 'http://localhost:3307' },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: 'node app/server.mjs',
    url: 'http://localhost:3307/api/pedidos',
    env: { PORT: '3307' },
    reuseExistingServer: false,
  },
});
