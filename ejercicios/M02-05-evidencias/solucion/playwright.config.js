// Configuración de Playwright para M02-05, solución: evidencias de cada ejecución
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  outputDir: './test-results',
  // list en la terminal y, además, el reporte HTML (sin abrirlo solo)
  reporter: [['list'], ['html', { open: 'never', outputFolder: 'playwright-report' }]],
  use: {
    baseURL: 'http://localhost:3205',
    screenshot: 'only-on-failure',   // captura de la pantalla final si la prueba falla
    video: 'retain-on-failure',      // graba siempre y guarda el vídeo solo si falla
    trace: 'on',                     // traza completa: acciones, DOM, red y consola
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: 'node app/server.mjs',
    url: 'http://localhost:3205',
    reuseExistingServer: true,
  },
});
