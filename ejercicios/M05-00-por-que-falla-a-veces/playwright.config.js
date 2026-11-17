// Configuración de la demo M05-00: Chromium, traza de cada intento fallido y la app en el puerto 3500
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  reporter: 'list',
  outputDir: './test-results',      // resultados y trazas dentro de esta carpeta
  use: {
    baseURL: 'http://localhost:3500',
    trace: 'retain-on-failure',       // guarda la traza de cada intento que falla
  },
  webServer: {
    command: 'node app/server.mjs',
    url: 'http://localhost:3500',
    reuseExistingServer: true,
  },
});
