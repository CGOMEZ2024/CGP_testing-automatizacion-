// Playwright de M05-05: pruebas E2E en e2e/ (las grabadas con codegen) y la app en el puerto 3505
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  reporter: 'list',
  outputDir: './test-results',
  use: { baseURL: 'http://localhost:3505' },
  webServer: {
    command: 'node app/server.mjs',
    url: 'http://localhost:3505/registro.html',
    reuseExistingServer: true,
  },
});
