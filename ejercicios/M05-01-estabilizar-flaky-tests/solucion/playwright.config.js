// Solución de M05-01: la misma configuración y, además, sin animaciones en las pruebas
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  reporter: 'list',
  outputDir: './test-results',
  use: {
    baseURL: 'http://localhost:3501',
    trace: 'retain-on-failure',
    reducedMotion: 'reduce',          // el navegador pide «menos movimiento»: la app no anima el total
  },
  webServer: {
    command: 'node ../app/server.mjs',  // la app está una carpeta más arriba
    url: 'http://localhost:3501/catalogo.html',
    reuseExistingServer: true,
  },
});
