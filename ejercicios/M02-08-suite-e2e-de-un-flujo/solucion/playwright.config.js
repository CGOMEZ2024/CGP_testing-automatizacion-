// Configuración de Playwright para M02-08, solución: un proyecto que inicia sesión una vez
// y guarda la sesión, otro que la reutiliza y otro para las pruebas de acceso sin sesión
import { defineConfig, devices } from '@playwright/test';

const SESION = `${import.meta.dirname}/.auth/ana.json`;   // cookie de sesión guardada por el setup

export default defineConfig({
  testDir: './tests',
  outputDir: './test-results',
  reporter: 'list',
  use: { baseURL: 'http://localhost:3208' },
  projects: [
    { name: 'setup', testMatch: /.*\.setup\.js/ },
    {
      name: 'tienda',
      testMatch: /tienda\.spec\.js/,
      dependencies: ['setup'],                         // antes, ejecuta el proyecto setup
      use: { ...devices['Desktop Chrome'], storageState: SESION },
    },
    { name: 'acceso', testMatch: /acceso\.spec\.js/, use: { ...devices['Desktop Chrome'] } },
  ],
  webServer: {
    command: 'node ../app/server.mjs',
    url: 'http://localhost:3208',
    reuseExistingServer: true,
  },
});
