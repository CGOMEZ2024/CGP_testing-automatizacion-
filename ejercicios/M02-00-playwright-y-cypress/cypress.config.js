// Configuración de Cypress para M02-00: todo dentro de esta carpeta, sin carpeta cypress/
import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3200',        // Cypress no arranca la app: va en otra terminal
    specPattern: 'cypress-e2e/**/*.cy.js',   // dónde están las pruebas
    supportFile: false,                      // sin fichero de soporte
  },
  fixturesFolder: false,
  screenshotsFolder: 'test-results/cypress/screenshots',
  videosFolder: 'test-results/cypress/videos',
  downloadsFolder: 'test-results/cypress/downloads',
  video: false,
});
