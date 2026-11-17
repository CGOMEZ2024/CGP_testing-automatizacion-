# M01-04 — Prueba de integración

Una API de tareas (`app/`): servidor `node:http`, rutas y un almacén en memoria. Tiene una prueba
unitaria con un almacén falso (`pruebas/crear-tarea.test.js`) y el principio de una prueba de
integración (`pruebas/tareas.integracion.test.js`) que arranca el servidor dentro del test.

Página del laboratorio: [Lab — Prueba de integración](../../labs/M01-introduccion-automatizacion/04-lab-prueba-de-integracion.md)

```bash
cd ejercicios/M01-04-prueba-de-integracion
# Ejecuta las pruebas (unitaria e integración)
npx vitest run
# Arranca la API a mano para probarla con curl (puerto 3104)
node app/server.mjs
```

`solucion/` es el ejercicio terminado (error corregido, pruebas completas y el límite del reto):

```bash
npx vitest run --root solucion
```
