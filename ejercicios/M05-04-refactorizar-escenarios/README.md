# M05-04 — Refactorizar escenarios

Ejercicio del laboratorio [Refactorizar escenarios](../../labs/M05-buenas-practicas-ia/04-lab-refactorizar-escenarios.md).

- `src/entradas.js` — precio de una entrada de cine con cinco reglas.
- `tests/entradas.test.js` — nueve pruebas copiadas y pegadas (`precio 1` … `precio 9`). Es el punto de partida.
- `solucion/tests/entradas.test.js` — una prueba parametrizada (`test.each`) sobre una tabla de casos con nombre.

```bash
cd ejercicios/M05-04-refactorizar-escenarios
npx vitest run --reporter=verbose                                    # las pruebas copiadas
npx vitest run --config solucion/vitest.config.js --reporter=verbose # la solución
```
