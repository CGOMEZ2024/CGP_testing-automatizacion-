// Configuración de la solución: pruebas de solucion/tests, la API de la carpeta de arriba.
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  reporter: 'list',
  outputDir: './test-results',
  use: { baseURL: 'http://localhost:3305' },
  webServer: {
    command: 'node ../app/server.mjs',
    url: 'http://localhost:3305/api/informes', // responde 401, pero responde: la API está arriba
    env: { PORT: '3305' },
    reuseExistingServer: false,
  },
});
