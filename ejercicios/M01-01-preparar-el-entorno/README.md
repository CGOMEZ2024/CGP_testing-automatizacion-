# M01-01 — Preparar el entorno

Suite de humo del curso: una prueba unitaria con Vitest y una prueba de navegador con Playwright
contra una página mínima (`app/`, puerto 3101). Si las dos pasan, el entorno está listo.

Página del laboratorio: [Lab — Preparar el entorno](../../labs/M01-introduccion-automatizacion/01-lab-preparar-el-entorno.md)

```bash
cd ejercicios/M01-01-preparar-el-entorno
# Prueba unitaria (Vitest)
npx vitest run
# Prueba de navegador (Playwright arranca la app él solo)
npx playwright test
```

`solucion/` es el ejercicio terminado (con la prueba del reto):

```bash
npx playwright test --config solucion/playwright.config.js
```
