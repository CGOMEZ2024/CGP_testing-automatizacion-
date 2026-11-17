// Configuración de M05-03 tal como se la encuentra el alumno: un solo worker, todo en serie
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  workers: 1,                         // una prueba detrás de otra
  reporter: [['list', { printSteps: true }]],   // muestra cada test.step con su tiempo
  outputDir: './test-results',
  use: {
    baseURL: 'http://localhost:3503',
  },
  webServer: {
    command: 'node app/server.mjs',
    url: 'http://localhost:3503/login.html',
    reuseExistingServer: true,
  },
});
