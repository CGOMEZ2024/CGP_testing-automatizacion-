# M02-07-page-objects — Page Objects y fixtures

Ejercicio del lab [Page Objects y fixtures](../../labs/M02-funcionales-e2e/07-lab-page-objects.md): una lista de tareas (`app/`) y cuatro pruebas que repiten los mismos selectores (`tests/`). La solución extrae `paginas/PaginaTareas.js` y la fixture `fixtures.js`.

```bash
# Entra en la carpeta del ejercicio
cd ejercicios/M02-07-page-objects
# Punto de partida: Playwright arranca la aplicación (webServer) y ejecuta tests/
npx playwright test
# Solución
npx playwright test --config solucion/playwright.config.js
```

Para abrir la aplicación a mano (puerto **3207**, pestaña **Ports** del Codespace):

```bash
# Arranca la aplicación sin pruebas (Ctrl+C para pararla)
node app/server.mjs
```
