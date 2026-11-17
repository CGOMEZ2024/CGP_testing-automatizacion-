# M02-09-flujo-con-cypress — Un flujo con Cypress

Ejercicio del lab [Un flujo con Cypress](../../labs/M02-funcionales-e2e/09-lab-flujo-con-cypress.md): una página de reserva de salas cuya API tarda en confirmar (`app/`, variable `RETRASO_MS`) y una prueba de Cypress con espera fija (`e2e/`).

Cypress no arranca la aplicación: va en otra terminal.

```bash
# Terminal 1: la aplicación en el puerto 3209
cd ejercicios/M02-09-flujo-con-cypress
node app/server.mjs
```

```bash
# Terminal 2: Cypress con el Chromium que instala Playwright
cd ejercicios/M02-09-flujo-con-cypress
CHROMIUM=$(ls ~/.cache/ms-playwright/chromium-*/chrome-linux64/chrome)
# Punto de partida
npx cypress run --browser "$CHROMIUM"
# Solución
npx cypress run --browser "$CHROMIUM" --config-file solucion/cypress.config.js
```
