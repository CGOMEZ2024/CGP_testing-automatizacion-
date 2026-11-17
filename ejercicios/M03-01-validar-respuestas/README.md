# M03-01 — Validar respuestas

Ejercicio del laboratorio [Validar respuestas](../../labs/M03-testing-apis/01-lab-validar-respuestas.md).

- `app/server.mjs` — API de tareas en memoria (`GET`, `POST`, `PUT`, `DELETE` en `/api/tareas`), puerto 3301.
- `tests/tareas.spec.js` — punto de partida: pruebas que solo miran `respuesta.ok()`.
- `solucion/` — pruebas completas y su configuración.

```bash
# Ejecuta las pruebas (Playwright arranca la API por su cuenta)
cd ejercicios/M03-01-validar-respuestas
npx playwright test
```

```bash
# Ejecuta la solución
npx playwright test --config solucion/playwright.config.js
```
