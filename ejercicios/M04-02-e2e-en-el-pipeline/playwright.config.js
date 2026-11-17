// Configuración de partida del lab M04-02: funciona en tu máquina si la app ya está arrancada.
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  outputDir: './test-results', // evidencias dentro de la carpeta del ejercicio
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:3402',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
});
