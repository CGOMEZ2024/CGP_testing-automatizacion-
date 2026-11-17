// Configuración de la solución: pruebas de solucion/tests y la app de solucion/app (página corregida en el reto).
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  reporter: 'list',
  outputDir: './test-results',
  use: { baseURL: 'http://localhost:3307' },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: 'node app/server.mjs',
    url: 'http://localhost:3307/api/pedidos',
    env: { PORT: '3307' },
    reuseExistingServer: false,
  },
});
