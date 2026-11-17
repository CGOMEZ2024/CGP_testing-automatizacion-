// Configuración de Cypress para M02-09: todo dentro de esta carpeta (sin carpeta cypress/)
import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3209',        // la app se arranca aparte: node app/server.mjs
    specPattern: 'e2e/**/*.cy.js',           // carpeta de las pruebas
    supportFile: false,                      // sin fichero de soporte
  },
  fixturesFolder: false,
  screenshotsFolder: 'test-results/cypress/screenshots',   // capturas de los fallos
  videosFolder: 'test-results/cypress/videos',
  downloadsFolder: 'test-results/cypress/downloads',
  video: false,                              // Paso 7: el vídeo de cada spec
});
