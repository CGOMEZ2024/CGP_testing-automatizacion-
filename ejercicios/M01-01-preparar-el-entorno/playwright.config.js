// Playwright: pruebas de navegador (*.spec.js) de pruebas/, contra la app arrancada por webServer.
import { defineConfig, devices } from '@playwright/test';

const PORT = 3101;

export default defineConfig({
  testDir: 'pruebas',
  testMatch: '**/*.spec.js',
  reporter: 'list',                           // una línea por prueba
  outputDir: 'test-results',                  // evidencias de fallos, dentro de esta carpeta
  use: {
    baseURL: `http://localhost:${PORT}`,
    // Pausa entre acciones, en ms, para seguirlas con la vista: SLOWMO=1000 npx playwright test --headed
    launchOptions: { slowMo: Number(process.env.SLOWMO ?? 0) },
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: 'node app/server.mjs',           // arranca la app antes de las pruebas
    url: `http://localhost:${PORT}`,          // y espera a que responda
    env: { PORT: String(PORT) },
    reuseExistingServer: !process.env.CI,
  },
});
