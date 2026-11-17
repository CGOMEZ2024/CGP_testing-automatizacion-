# M05-05 — Generar pruebas con Copilot

Ejercicio del laboratorio [Generar pruebas con Copilot](../../labs/M05-buenas-practicas-ia/05-lab-generar-pruebas-con-copilot.md).

- `src/contrasena.js` — `validarContrasena()` con cinco reglas de negocio. Es lo que Copilot tiene que probar.
- `tests/` — vacía: aquí guardas las pruebas unitarias que genere Copilot (`tests/contrasena.test.js`).
- `app/` — página de registro que usa la misma función (puerto **3505**), para grabar una prueba E2E con
  `npx playwright codegen`. `e2e/` — vacía: aquí guardas la grabación (`e2e/registro.spec.js`).
- `ejemplos/` — un ejemplo de respuesta de Copilot y uno de grabación de codegen, por si no tienes Copilot.
- `solucion/` — las pruebas revisadas y completadas (`tests/` y `e2e/`) y sus configuraciones.

```bash
cd ejercicios/M05-05-generar-pruebas-con-copilot
npx vitest run --reporter=verbose   # las pruebas que hayas guardado en tests/
npx stryker run                     # qué se les escapa
# La solución
npx vitest run --config solucion/vitest.config.js --reporter=verbose
npx playwright test --config solucion/playwright.config.js
```
