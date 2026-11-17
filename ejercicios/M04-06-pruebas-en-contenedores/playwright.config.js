// Configuración del lab M04-06: la misma suite en tu terminal o en un contenedor.
import { defineConfig, devices } from '@playwright/test';

// BASE_URL la pone compose.yaml; sin ella, se prueba la app arrancada en local
const BASE_URL = process.env.BASE_URL;

export default defineConfig({
  testDir: './tests',
  // En el contenedor las evidencias van a /tmp: así no deja ficheros de root en tu carpeta
  outputDir: process.env.PW_OUTPUT_DIR ?? './test-results',
  reporter: 'list',
  use: { baseURL: BASE_URL ?? 'http://localhost:3406' },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  // Solo arranca la app si no se ha indicado otra URL
  webServer: BASE_URL
    ? undefined
    : {
        command: 'node app/server.mjs',
        url: 'http://localhost:3406/salud',
        reuseExistingServer: !process.env.CI,
      },
});
