# M02-03-sincronizacion — Sincronización

Ejercicio del lab [Sincronización](../../labs/M02-funcionales-e2e/03-lab-sincronizacion.md): una página que pide las entregas a una API con retraso al azar (`app/`, variables `RETRASO_MIN` y `RETRASO_MAX`) y una prueba con espera fija que falla a veces (`tests/`).

```bash
# Entra en la carpeta del ejercicio
cd ejercicios/M02-03-sincronizacion
# Punto de partida: Playwright arranca la aplicación (webServer) y ejecuta tests/
npx playwright test
# Solución
npx playwright test --config solucion/playwright.config.js
```

Para abrir la aplicación a mano (puerto **3203**, pestaña **Ports** del Codespace):

```bash
# Arranca la aplicación sin pruebas (Ctrl+C para pararla)
node app/server.mjs
```
