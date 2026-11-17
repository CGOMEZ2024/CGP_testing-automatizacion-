// Pruebas de API: sin navegador. Playwright solo arranca la API y hace peticiones HTTP.
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  reporter: 'list',
  outputDir: './test-results', // resultados junto a este ejercicio
  use: {
    // Las rutas de request.get('/api/...') se resuelven contra esta URL
    baseURL: 'http://localhost:3301',
  },
  // Arranca la API antes de las pruebas y la para al terminar
  webServer: {
    command: 'node app/server.mjs',
    url: 'http://localhost:3301/api/tareas',
    env: { PORT: '3301' },
    reuseExistingServer: false,
  },
});
