// Configuración de partida del lab M04-03: solo el reporter de consola.
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  outputDir: './test-results', // evidencias dentro de la carpeta del ejercicio
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:3403',
    actionTimeout: 3_000, // una acción que no encuentra su elemento falla a los 3 s
  },
  expect: { timeout: 3_000 },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: 'node app/server.mjs',
    url: 'http://localhost:3403/salud',
    reuseExistingServer: !process.env.CI,
  },
});
