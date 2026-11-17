# M05-02 — Cobertura útil

Ejercicio del laboratorio [Cobertura útil](../../labs/M05-buenas-practicas-ia/02-lab-cobertura-util.md).

- `src/envio.js` — coste de envío con cinco reglas de negocio. `src/pedido.js` — una clase sin lógica (solo getters).
- `tests/` — pruebas que pasan y cubren el 100 % del código, con aserciones débiles. Es el punto de partida.
- `vitest.config.js` y `stryker.config.json` — cobertura con v8 y mutation testing con Stryker (runner de Vitest).
- `solucion/` — `tests/envio.test.js` con valores exactos y límites, y sus configuraciones para lanzarla.

```bash
cd ejercicios/M05-02-cobertura-util
npx vitest run --coverage     # cobertura de líneas y ramas
npx stryker run               # mutation score
# La solución
npx vitest run --config solucion/vitest.config.js --coverage
npx stryker run solucion/stryker.config.json
```
