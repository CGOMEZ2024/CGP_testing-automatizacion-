# M03-07 — Simular fallos

Ejercicio del laboratorio [Simular fallos](../../labs/M03-testing-apis/07-lab-simular-fallos.md).

- `app/server.mjs` — sirve la página de pedidos y su API (`/api/pedidos`), puerto 3307.
- `app/public/index.html` — la página: estado de carga, lista y mensaje de error.
- `tests/pedidos.spec.js` — punto de partida: solo el caso en que la API responde bien.
- `solucion/` — pruebas con `page.route` (500, lenta, sin conexión, lista vacía, cuerpo vacío) y la página corregida del reto.

```bash
# Ejecuta las pruebas en Chromium (Playwright arranca la app)
cd ejercicios/M03-07-simular-fallos
npx playwright test
```

```bash
# Ejecuta la solución
npx playwright test --config solucion/playwright.config.js
```
