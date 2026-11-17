// Configuración de la solución: pruebas y esquema de solucion/, la API de la carpeta de arriba.
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  reporter: 'list',
  outputDir: './test-results',
  use: { baseURL: 'http://localhost:3302' },
  webServer: {
    command: 'node ../app/server.mjs',
    url: 'http://localhost:3302/api/tareas',
    env: { PORT: '3302', VERSION_API: process.env.VERSION_API ?? '1' },
    reuseExistingServer: false,
  },
});
