// Configuración de Playwright para M02-05 (la app la arranca webServer)
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  outputDir: './test-results',
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:3205',
    // Paso 3: aquí se configuran las evidencias (screenshot, video, trace)
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: 'node app/server.mjs',
    url: 'http://localhost:3205',
    reuseExistingServer: true,
  },
});
