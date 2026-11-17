# M03-05 — Autenticación y autorización

Ejercicio del laboratorio [Autenticación y autorización](../../labs/M03-testing-apis/05-lab-autenticacion-y-autorizacion.md).

- `app/server.mjs` — API con `POST /api/login` (token firmado con HMAC), `GET /api/informes` (cualquier sesión)
  y `GET /api/admin/usuarios` (solo `admin`), puerto 3305. Usuarios: `ana`/`ana123` (admin) y `luis`/`luis123` (lector).
- `tests/auth.spec.js` — punto de partida: solo el camino feliz con `admin`.
- `solucion/` — pruebas de 401, 403 y 200 por rol, con fixtures por rol.

```bash
# Ejecuta las pruebas (Playwright arranca la API)
cd ejercicios/M03-05-autenticacion-y-autorizacion
npx playwright test
```

```bash
# Ejecuta la solución
npx playwright test --config solucion/playwright.config.js
```
