// Configuración de la solución: mismas opciones, pruebas en solucion/tests.
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  reporter: 'list',
  outputDir: './test-results', // resultados junto a este ejercicio
  use: {
    baseURL: 'http://localhost:3301',
  },
  webServer: {
    command: 'node ../app/server.mjs', // la API está una carpeta más arriba
    url: 'http://localhost:3301/api/tareas',
    env: { PORT: '3301' },
    reuseExistingServer: false,
  },
});
