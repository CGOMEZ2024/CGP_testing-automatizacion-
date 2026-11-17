# M03-02 — Contratos con JSON Schema

Ejercicio del laboratorio [Contratos con JSON Schema](../../labs/M03-testing-apis/02-lab-contratos-json-schema.md).

- `app/server.mjs` — API de tareas de solo lectura en el puerto 3302; `VERSION_API=2` renombra `hecha` a `completada`.
- `contrato/tarea.schema.json` — el contrato de una tarea (punto de partida: le falta lo que obliga).
- `tests/` — pruebas de estado y de contrato (Ajv + ajv-formats).
- `solucion/` — esquema y pruebas completos.

```bash
# Ejecuta las pruebas contra la versión 1 y contra la versión 2 de la API
cd ejercicios/M03-02-contratos-json-schema
npx playwright test
VERSION_API=2 npx playwright test
```

```bash
# Ejecuta la solución contra la versión 2 (el contrato detecta el cambio)
VERSION_API=2 npx playwright test --config solucion/playwright.config.js
```
