# M02-01-navegacion-web — Navegación web

Ejercicio del lab [Navegación web](../../labs/M02-funcionales-e2e/01-lab-navegacion-web.md): un sitio de tres páginas con una API de productos (`app/`) y sus pruebas de navegación (`tests/`).

```bash
# Entra en la carpeta del ejercicio
cd ejercicios/M02-01-navegacion-web
# Punto de partida: Playwright arranca la aplicación (webServer) y ejecuta tests/
npx playwright test
# Solución
npx playwright test --config solucion/playwright.config.js
```

Para abrir la aplicación a mano (puerto **3201**, pestaña **Ports** del Codespace):

```bash
# Arranca la aplicación sin pruebas (Ctrl+C para pararla)
node app/server.mjs
```
