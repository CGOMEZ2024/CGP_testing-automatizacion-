# M03-00 — Anatomía de una prueba de API

Ejercicio de la demostración [Anatomía de una prueba de API](../../labs/M03-testing-apis/00-anatomia-de-una-prueba-api.md).

- `app/server.mjs` — API mínima de productos (`GET /api/productos`, `GET /api/productos/:id`).
- `coleccion.postman.json` — colección de Postman con las mismas comprobaciones.

```bash
# Terminal 1: arranca la API en el puerto 3300
cd ejercicios/M03-00-anatomia-de-una-prueba-api
PORT=3300 node app/server.mjs
```

```bash
# Terminal 2: ejecuta la colección
cd ejercicios/M03-00-anatomia-de-una-prueba-api
npx newman run coleccion.postman.json
```
