# M02-05-evidencias — Evidencias

Ejercicio del lab [Evidencias](../../labs/M02-funcionales-e2e/05-lab-evidencias.md): un carrito con cupón de descuento que tiene un error (`app/`) y una prueba que lo destapa sin evidencias configuradas (`tests/`). La solución configura captura, vídeo y traza, y corrige la aplicación (`solucion/app/server.mjs`).

```bash
# Entra en la carpeta del ejercicio
cd ejercicios/M02-05-evidencias
# Punto de partida: Playwright arranca la aplicación (webServer) y ejecuta tests/
npx playwright test
# Solución
npx playwright test --config solucion/playwright.config.js
```

Para abrir la aplicación a mano (puerto **3205**, pestaña **Ports** del Codespace):

```bash
# Arranca la aplicación sin pruebas (Ctrl+C para pararla)
node app/server.mjs
```

Reporte HTML y traza (pestaña **Ports**, puertos 9323 y 9322):

```bash
# Sirve el reporte HTML de esta carpeta
npx playwright show-report playwright-report --host 0.0.0.0
```
