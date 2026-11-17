# M02-04-formularios-y-validaciones — Formularios y validaciones

Ejercicio del lab [Formularios y validaciones](../../labs/M02-funcionales-e2e/04-lab-formularios-y-validaciones.md): un formulario de alta con validaciones en el navegador y en el servidor (`app/`) y sus pruebas a medio hacer (`tests/`).

```bash
# Entra en la carpeta del ejercicio
cd ejercicios/M02-04-formularios-y-validaciones
# Punto de partida: Playwright arranca la aplicación (webServer) y ejecuta tests/
npx playwright test
# Solución
npx playwright test --config solucion/playwright.config.js
```

Para abrir la aplicación a mano (puerto **3204**, pestaña **Ports** del Codespace):

```bash
# Arranca la aplicación sin pruebas (Ctrl+C para pararla)
node app/server.mjs
```
