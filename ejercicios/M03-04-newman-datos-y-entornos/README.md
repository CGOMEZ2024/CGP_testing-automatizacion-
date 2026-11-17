# M03-04 — Newman con datos y entornos

Ejercicio del laboratorio [Newman con datos y entornos](../../labs/M03-testing-apis/04-lab-newman-datos-y-entornos.md).

- `app/server.mjs` — API de contactos; `PORT` y `ENTORNO` eligen puerto y nombre del entorno (cabecera `X-Entorno`).
- `coleccion.postman.json` — crear → leer → borrar → leer borrado (punto de partida: no guarda el id creado).
- `entorno-local.json` (puerto 3304) y `entorno-preproduccion.json` (puerto 3314).
- `datos.csv` — una fila por iteración.
- `solucion/` — colección que encadena con `pm.collectionVariables.set` y CSV del reto.

```bash
# Terminal 1: la API «local»
cd ejercicios/M03-04-newman-datos-y-entornos
PORT=3304 ENTORNO=local node app/server.mjs
```

```bash
# Terminal 2: la colección con el entorno local y los datos del CSV
cd ejercicios/M03-04-newman-datos-y-entornos
npx newman run coleccion.postman.json -e entorno-local.json -d datos.csv
```

```bash
# La solución, con el CSV del reto
npx newman run solucion/coleccion.postman.json -e entorno-local.json -d solucion/datos-reto.csv
```
