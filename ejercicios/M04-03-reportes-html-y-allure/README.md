# M04-03 — Reportes HTML y Allure

Ejercicio del lab [Reportes HTML y Allure](../../labs/M04-ci-cd-testing-continuo/03-lab-reportes-html-y-allure.md):
una calculadora de propinas (`app/`, puerto 3403) y cinco pruebas: dos pasan, dos fallan por motivos distintos
y una está omitida, para que los reportes tengan algo que contar.

```bash
cd ejercicios/M04-03-reportes-html-y-allure
# Configuración de partida: solo la consola
npx playwright test
# Solución: HTML, JUnit y Allure de la misma ejecución
npx playwright test --config solucion/playwright.config.js
npx allure generate allure-results -o allure-report
```

`solucion/allurerc.mjs` es la configuración de Allure (categorías e historial) que se copia a la carpeta del ejercicio.
