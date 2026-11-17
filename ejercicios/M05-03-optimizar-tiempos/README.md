# M05-03 — Optimizar tiempos

Ejercicio del laboratorio [Optimizar tiempos](../../labs/M05-buenas-practicas-ia/03-lab-optimizar-tiempos.md).

- `app/` — una aplicación de notas con inicio de sesión (puerto **3503**, usuario `ana`, clave `curso123`).
  El login tarda ~600 ms y cada operación con notas ~100 ms.
- `tests/` — doce pruebas lentas: cada una inicia sesión por la interfaz y crea sus notas rellenando el
  formulario; `playwright.config.js` con `workers: 1`. Es el punto de partida.
- `solucion/` — configuración en paralelo con un proyecto `setup` que guarda la sesión (`storageState`)
  y pruebas que preparan sus datos por la API.

```bash
cd ejercicios/M05-03-optimizar-tiempos
npx playwright test                                        # la suite lenta
npx playwright test --config solucion/playwright.config.js # la suite optimizada
```
