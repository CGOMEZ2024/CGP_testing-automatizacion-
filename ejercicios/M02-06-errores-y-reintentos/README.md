# M02-06-errores-y-reintentos — Errores y reintentos

Ejercicio del lab [Errores y reintentos](../../labs/M02-funcionales-e2e/06-lab-errores-y-reintentos.md): una página de cuenta cuyo servicio de saldo falla una de cada tres peticiones (`FALLA_CADA`) y cuyo listado de movimientos tiene un error real (`app/`), con pruebas sin estrategia de reintento (`tests/`).

```bash
# Entra en la carpeta del ejercicio
cd ejercicios/M02-06-errores-y-reintentos
# Punto de partida: Playwright arranca la aplicación (webServer) y ejecuta tests/
npx playwright test
# Solución
npx playwright test --config solucion/playwright.config.js
```

Para abrir la aplicación a mano (puerto **3206**, pestaña **Ports** del Codespace):

```bash
# Arranca la aplicación sin pruebas (Ctrl+C para pararla)
node app/server.mjs
```
