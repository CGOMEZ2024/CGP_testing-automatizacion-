// Configuración de Cypress para M02-09, solución: vídeo activado. Se lanza desde la carpeta del ejercicio:
//   npx cypress run --config-file solucion/cypress.config.js
import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3209',
    specPattern: 'solucion/e2e/**/*.cy.js',  // rutas relativas a la carpeta desde la que se lanza
    supportFile: false,
  },
  fixturesFolder: false,
  screenshotsFolder: 'test-results/cypress/screenshots',
  videosFolder: 'test-results/cypress/videos',
  downloadsFolder: 'test-results/cypress/downloads',
  video: true,                               // un vídeo .mp4 por spec
});
