// Solución de M05-03: en paralelo, sesión iniciada una vez (proyecto «setup») y datos por API
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,                // también las pruebas de un mismo fichero
  workers: 4,                         // cuatro navegadores a la vez
  reporter: [['list', { printSteps: true }]],
  outputDir: './test-results',
  use: {
    baseURL: 'http://localhost:3503',
  },
  projects: [
    // 1) Inicia sesión una vez y guarda las cookies en .auth/ana.json
    { name: 'setup', testMatch: /.*\.setup\.js/ },
    // 2) Las pruebas arrancan ya con esa sesión
    {
      name: 'chromium',
      testMatch: /.*\.spec\.js/,
      dependencies: ['setup'],
      use: { storageState: '.auth/ana.json' },
    },
  ],
  webServer: {
    command: 'node ../app/server.mjs',
    url: 'http://localhost:3503/login.html',
    reuseExistingServer: true,
  },
});
