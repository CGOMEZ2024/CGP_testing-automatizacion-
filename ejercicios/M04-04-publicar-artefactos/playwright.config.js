// Configuración del lab M04-04: reporte HTML y traza de las pruebas que fallan.
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  outputDir: './test-results', // aquí quedan las trazas de los fallos
  reporter: [['list'], ['html', { outputFolder: './playwright-report', open: 'never' }]],
  use: {
    baseURL: 'http://localhost:3404',
    trace: 'retain-on-failure', // guarda la traza solo de las pruebas que fallan
  },
  expect: { timeout: 3_000 },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: 'node app/server.mjs',
    url: 'http://localhost:3404/salud',
    reuseExistingServer: !process.env.CI,
  },
});
