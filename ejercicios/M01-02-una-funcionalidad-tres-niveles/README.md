# M01-02 — Una funcionalidad, tres niveles

Una regla de precio (`src/precio.js`), su API (`/api/precio`) y su página (`app/`, puerto 3102),
probadas tres veces: unitaria con Vitest, API con el cliente `request` de Playwright y
end-to-end con Playwright en el navegador.

Página de la demostración: [Una funcionalidad, tres niveles](../../labs/M01-introduccion-automatizacion/02-una-funcionalidad-tres-niveles.md)

```bash
cd ejercicios/M01-02-una-funcionalidad-tres-niveles
# Nivel unitario
npx vitest run
# Nivel API (Playwright arranca la app él solo)
npx playwright test pruebas/api
# Nivel end-to-end
npx playwright test pruebas/e2e
```

Es una demostración: no tiene `solucion/`.
