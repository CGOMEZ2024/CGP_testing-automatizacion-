# M01-05 — La pirámide en números

Una calculadora de envío (`src/envio.js`, API y página en `app/`, puerto 3105) con una suite que
tiene forma de cono de helado: todas las reglas de cálculo se comprueban end-to-end en el
navegador (`pruebas/e2e/envio.spec.js`). La mides, bajas cada comprobación a su nivel y vuelves a medir.

Página del laboratorio: [Lab — La pirámide en números](../../labs/M01-introduccion-automatizacion/05-lab-piramide-de-pruebas.md)

```bash
cd ejercicios/M01-05-piramide-de-pruebas
# Suite E2E y de API (Playwright arranca la app él solo)
npx playwright test
# Pruebas unitarias (cuando las hayas escrito en pruebas/unitarias/)
npx vitest run
```

`solucion/` es el ejercicio terminado (pirámide: unitarias, API y E2E, con la regla del reto):

```bash
npx vitest run --root solucion
npx playwright test --config solucion/playwright.config.js
```
