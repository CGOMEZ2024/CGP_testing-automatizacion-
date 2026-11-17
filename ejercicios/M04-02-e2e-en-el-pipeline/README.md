# M04-02 — E2E en el pipeline

Ejercicio del lab [E2E en el pipeline](../../labs/M04-ci-cd-testing-continuo/02-lab-e2e-en-el-pipeline.md):
un conversor de temperaturas (`app/`, puerto 3402) y tres pruebas de Playwright. La configuración de partida
solo funciona si alguien ha arrancado la app; en el lab la preparas para CI.

```bash
cd ejercicios/M04-02-e2e-en-el-pipeline
# Configuración de partida (falla si la app no está arrancada)
npx playwright test
# Solución: arranca la app sola y aplica los ajustes de CI
npx playwright test --config solucion/playwright.config.js
```

Workflows de la solución: `solucion/e2e.yml` (runner con `playwright install`) y `solucion/e2e-contenedor.yml`
(job dentro de la imagen oficial de Playwright). Se copian a `.github/workflows/` en la raíz del repositorio.
