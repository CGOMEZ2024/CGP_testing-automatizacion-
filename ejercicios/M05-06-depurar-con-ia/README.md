# M05-06 — Depurar con IA

Ejercicio del laboratorio [Depurar con IA](../../labs/M05-buenas-practicas-ia/06-lab-depurar-con-ia.md).

- `app/` — ficha de un producto con carrito (puerto **3506**), ya en su versión 2. `app/CAMBIOS.md` dice qué cambió.
- `tests/tienda.spec.js` — tres pruebas escritas para la versión 1: las tres fallan. Es el punto de partida.
- `solucion/` — las pruebas corregidas y refactorizadas a un Page Object (`tests/paginas/producto.js`).

```bash
cd ejercicios/M05-06-depurar-con-ia
npx playwright test                                         # las tres fallan
npx playwright test --config solucion/playwright.config.js  # la solución
```
