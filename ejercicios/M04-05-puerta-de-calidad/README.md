# M04-05 — Puerta de calidad

Ejercicio del lab [Puerta de calidad](../../labs/M04-ci-cd-testing-continuo/05-lab-puerta-de-calidad.md):
un panel con acceso e informes lentos (`app/`, puerto 3405) y seis pruebas, dos de ellas etiquetadas `@smoke`.

```bash
cd ejercicios/M04-05-puerta-de-calidad
# Suite completa
npx playwright test
# Suite rápida
npx playwright test --grep @smoke
```

Workflows de la solución: `solucion/calidad-pr.yml` (suite rápida en cada pull request) y
`solucion/suite-nocturna.yml` (suite completa programada y a mano).
