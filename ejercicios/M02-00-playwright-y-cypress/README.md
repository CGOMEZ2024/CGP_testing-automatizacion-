# M02-00-playwright-y-cypress — Playwright y Cypress

Ejercicio de la demostración [Playwright y Cypress](../../labs/M02-funcionales-e2e/00-playwright-y-cypress.md): una lista de la compra (`app/`), la misma prueba en Playwright (`playwright/`) y en Cypress (`cypress-e2e/`), y la prueba grabada con `codegen` (`playwright/grabada.spec.js`).

```bash
# Entra en la carpeta del ejercicio
cd ejercicios/M02-00-playwright-y-cypress
# Playwright: arranca la app él mismo y ejecuta playwright/
npx playwright test
```

Cypress no arranca la aplicación: va en otra terminal.

```bash
# Terminal 1: la aplicación en el puerto 3200
cd ejercicios/M02-00-playwright-y-cypress
node app/server.mjs
```

```bash
# Terminal 2: Cypress sin interfaz, con el Chromium que instala Playwright
cd ejercicios/M02-00-playwright-y-cypress
npx cypress run --browser "$(ls ~/.cache/ms-playwright/chromium-*/chrome-linux64/chrome)"
```
