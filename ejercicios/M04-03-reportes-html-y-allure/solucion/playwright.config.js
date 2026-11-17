// Solución del lab M04-03: la misma ejecución alimenta cuatro reporters.
// Ejecútala desde la carpeta del ejercicio: npx playwright test --config solucion/playwright.config.js
// (las rutas llevan ../ porque este fichero está en solucion/)
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: '../tests',
  outputDir: '../test-results',
  reporter: [
    ['list'], // consola
    ['html', { outputFolder: '../playwright-report', open: 'never' }], // web navegable
    ['junit', { outputFile: '../reports/junit.xml' }], // XML que entienden los servidores de CI
    ['allure-playwright', { resultsDir: 'allure-results' }], // datos en bruto para Allure
  ],
  use: {
    baseURL: 'http://localhost:3403',
    actionTimeout: 3_000,
  },
  expect: { timeout: 3_000 },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: 'node app/server.mjs',
    cwd: '..',
    url: 'http://localhost:3403/salud',
    reuseExistingServer: !process.env.CI,
  },
});
