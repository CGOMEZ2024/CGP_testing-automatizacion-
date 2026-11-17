// Configuración del lab M04-07: pruebas de API (sin navegador) contra el entorno de compose.yaml.
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  outputDir: './test-results',
  workers: 1, // las pruebas de un mismo fichero, en orden
  reporter: 'list',
  use: { baseURL: 'http://localhost:3407' },
  // En CI no hay Docker Compose: la API se arranca aquí y la base de datos es un «service» del job
  webServer: process.env.CI
    ? { command: 'node app/server.mjs', url: 'http://localhost:3407/salud', reuseExistingServer: false }
    : undefined,
});
