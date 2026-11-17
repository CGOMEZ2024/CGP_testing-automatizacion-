# M02-02-selectores-estables — Selectores estables

Ejercicio del lab [Selectores estables](../../labs/M02-funcionales-e2e/02-lab-selectores-estables.md): una página de acceso en dos versiones, el diseño `app/public/v1/` y el rediseño `app/public/v2/`, y pruebas con selectores CSS/XPath que el rediseño rompe (`tests/`). Cada versión es un proyecto de Playwright (`v1`, `v2`).

```bash
# Entra en la carpeta del ejercicio
cd ejercicios/M02-02-selectores-estables
# Punto de partida: Playwright arranca la aplicación (webServer) y ejecuta tests/
npx playwright test
# Solución
npx playwright test --config solucion/playwright.config.js
```

Para abrir la aplicación a mano (puerto **3202**, pestaña **Ports** del Codespace):

```bash
# Arranca la aplicación sin pruebas (Ctrl+C para pararla)
node app/server.mjs
```

Las dos versiones: http://localhost:3202/v1/ y http://localhost:3202/v2/
