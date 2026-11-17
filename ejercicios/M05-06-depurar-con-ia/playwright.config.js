// Playwright de M05-06: traza y contexto de error de cada fallo, app en el puerto 3506
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  reporter: 'list',
  outputDir: './test-results',
  use: {
    baseURL: 'http://localhost:3506',
    trace: 'retain-on-failure',
    actionTimeout: 5_000,             // un clic que no encuentra su botón falla a los 5 s
  },
  webServer: {
    command: 'node app/server.mjs',
    url: 'http://localhost:3506/producto.html',
    reuseExistingServer: true,
  },
});
