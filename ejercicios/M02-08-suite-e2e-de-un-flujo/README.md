# M02-08-suite-e2e-de-un-flujo — Suite E2E de un flujo

Ejercicio del lab [Suite E2E de un flujo](../../labs/M02-funcionales-e2e/08-lab-suite-e2e-de-un-flujo.md): una tienda mínima con login, catálogo, carrito y pedido (`app/`, usuario `ana` / `tienda123`) y una única prueba larga del flujo (`tests/`). La solución la organiza en suite con etiquetas, sesión guardada (`.auth/`) y proyectos.

```bash
# Entra en la carpeta del ejercicio
cd ejercicios/M02-08-suite-e2e-de-un-flujo
# Punto de partida: Playwright arranca la aplicación (webServer) y ejecuta tests/
npx playwright test
# Solución
npx playwright test --config solucion/playwright.config.js
```

Para abrir la aplicación a mano (puerto **3208**, pestaña **Ports** del Codespace):

```bash
# Arranca la aplicación sin pruebas (Ctrl+C para pararla)
node app/server.mjs
```
