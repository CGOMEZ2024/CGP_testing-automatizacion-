# M03-03 — Colección de Postman

Ejercicio del laboratorio [Colección de Postman](../../labs/M03-testing-apis/03-lab-coleccion-postman.md).

- `app/server.mjs` — API de libros en memoria, puerto 3303.
- `coleccion.postman.json` — colección v2.1: la primera petición tiene pruebas; las demás, no (punto de partida).
- `solucion/coleccion.postman.json` — la colección con todas las pruebas y la petición del reto.

```bash
# Terminal 1: arranca la API
cd ejercicios/M03-03-coleccion-postman
PORT=3303 node app/server.mjs
```

```bash
# Terminal 2: ejecuta la colección (o la solución)
cd ejercicios/M03-03-coleccion-postman
npx newman run coleccion.postman.json
npx newman run solucion/coleccion.postman.json
```
