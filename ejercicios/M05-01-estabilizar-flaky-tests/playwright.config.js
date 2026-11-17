// Configuración de M05-01: pruebas en paralelo (fullyParallel) y la app en el puerto 3501
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,                // también las pruebas de un mismo fichero van en paralelo
  reporter: 'list',
  outputDir: './test-results',
  use: {
    baseURL: 'http://localhost:3501',
    trace: 'retain-on-failure',       // traza de cada intento que falla
  },
  webServer: {
    command: 'node app/server.mjs',
    url: 'http://localhost:3501/catalogo.html',
    reuseExistingServer: true,
  },
});
