# M01-06 — Pruebas independientes

Un carrito de la compra cuyo estado vive en una variable del módulo (`src/carrito.js`) y una suite
(`pruebas/carrito.test.js`) que pasa en orden pero falla al ejecutar una prueba sola o al barajar
el orden. La arreglas para que cada prueba prepare sus propios datos.

Página del laboratorio: [Lab — Pruebas independientes](../../labs/M01-introduccion-automatizacion/06-lab-pruebas-independientes.md)

```bash
cd ejercicios/M01-06-pruebas-independientes
# En el orden escrito
npx vitest run
# En un orden barajado y reproducible (semilla 3)
npx vitest run --sequence.shuffle --sequence.seed=3
```

`solucion/` es el ejercicio terminado (suite arreglada y el carrito por fábrica del reto):

```bash
npx vitest run --root solucion
```
