# M04-04 — Publicar artefactos

Ejercicio del lab [Publicar artefactos](../../labs/M04-ci-cd-testing-continuo/04-lab-publicar-artefactos.md):
una lista de tareas (`app/`, puerto 3404) y tres pruebas de Playwright que generan reporte HTML y, si fallan, traza.

```bash
cd ejercicios/M04-04-publicar-artefactos
npx playwright test
```

`artefactos.yml` es el workflow de partida (se copia a `.github/workflows/` en la raíz del repositorio);
`solucion/artefactos.yml`, el que sube reporte y trazas también cuando las pruebas fallan.
