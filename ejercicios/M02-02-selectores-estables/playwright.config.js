// Configuración de Playwright para M02-02: las mismas pruebas contra el diseño v1 y el rediseño v2
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  outputDir: './test-results',
  reporter: 'list',
  use: { actionTimeout: 5_000 },   // una acción que no encuentra su elemento falla a los 5 s
  projects: [
    // Un proyecto por versión de la página: cambia solo la URL base
    { name: 'v1', use: { ...devices['Desktop Chrome'], baseURL: 'http://localhost:3202/v1/' } },
    { name: 'v2', use: { ...devices['Desktop Chrome'], baseURL: 'http://localhost:3202/v2/' } },
  ],
  webServer: {
    command: 'node app/server.mjs',
    url: 'http://localhost:3202/v1/',
    reuseExistingServer: true,
  },
});
