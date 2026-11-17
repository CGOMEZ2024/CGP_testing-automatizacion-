// Playwright: pruebas de API y E2E (*.spec.js) contra la app arrancada por webServer.
import { defineConfig, devices } from '@playwright/test';

const PORT = 3102;

export default defineConfig({
  testDir: 'pruebas',
  testMatch: '**/*.spec.js',
  reporter: 'list',                           // una línea por prueba
  outputDir: 'test-results',                  // evidencias de fallos, dentro de esta carpeta
  workers: 1,                                 // una prueba detrás de otra: tiempos comparables
  use: { baseURL: `http://localhost:${PORT}` },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: 'node app/server.mjs',
    url: `http://localhost:${PORT}`,
    env: { PORT: String(PORT) },
    reuseExistingServer: !process.env.CI,
  },
});
