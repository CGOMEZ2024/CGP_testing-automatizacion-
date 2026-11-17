# M05-01 — Estabilizar flaky tests

Ejercicio del laboratorio [Estabilizar flaky tests](../../labs/M05-buenas-practicas-ia/01-lab-estabilizar-flaky-tests.md).

- `app/` — tres páginas con tres causas de inestabilidad (puerto **3501**): `catalogo.html` (la API
  tarda de 100 a 900 ms), `resumen.html` (el total se anima) y `favoritos.html` (listas guardadas en el servidor).
- `tests/` — una prueba inestable por página. Es el punto de partida del lab.
- `solucion/` — `playwright.config.js` y `tests/` ya corregidos.

```bash
cd ejercicios/M05-01-estabilizar-flaky-tests
# Cada prueba, diez veces y en paralelo
npx playwright test --repeat-each=10 --reporter=dot
# La solución, veinte veces
npx playwright test --config solucion/playwright.config.js --repeat-each=20 --reporter=dot
```
