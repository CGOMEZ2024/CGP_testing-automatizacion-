// Configuración del lab M04-05.
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  outputDir: './test-results',
  workers: 1, // una prueba detrás de otra, como en el runner de CI
  reporter: 'list',
  use: { baseURL: 'http://localhost:3405' },
  expect: { timeout: 5_000 },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: 'node app/server.mjs',
    url: 'http://localhost:3405/salud',
    reuseExistingServer: !process.env.CI,
  },
});
