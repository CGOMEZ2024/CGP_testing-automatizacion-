# M05-00 — Por qué falla a veces

Ejercicio de la demostración [Por qué falla a veces](../../labs/M05-buenas-practicas-ia/00-por-que-falla-a-veces.md).

- `app/` — una lista de pedidos que la API devuelve con un retraso de 100 a 900 ms (puerto **3500**).
- `tests/pedidos.spec.js` — una prueba que espera 500 ms fijos y cuenta los pedidos: pasa unas veces y falla otras.

```bash
cd ejercicios/M05-00-por-que-falla-a-veces
# La misma prueba, veinte veces seguidas
npx playwright test --repeat-each=20 --reporter=dot
```
