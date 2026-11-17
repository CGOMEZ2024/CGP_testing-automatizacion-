# Test Automation for Agile Development

[Siguiente página →](labs/M01-introduccion-automatizacion/00-testing-en-agile-y-devops.md)

## Objetivo general

Al finalizar el curso, el alumno diseña, escribe y mantiene pruebas automatizadas unitarias, de API y
end-to-end, y las hace correr en cada cambio dentro de un pipeline de GitHub Actions con reportes y
evidencias.

## Enfoque

Cada concepto se trabaja con un ejercicio propio y pequeño: una función con un error de límites, una
página que carga datos con retraso, una API que cambia su contrato, un workflow que se pone en rojo. No
hay un proyecto que arrastrar de un laboratorio a otro: cada ejercicio trae su aplicación bajo prueba,
su punto de partida y su solución, y se hace sin haber hecho el anterior.

El recorrido sigue la pirámide de pruebas de abajo arriba y luego la saca del portátil:

1. **Fundamentos:** qué automatizar y a qué nivel, con pruebas unitarias y de integración que se miden.
2. **Navegador:** Playwright y Cypress sobre aplicaciones web, con selectores estables, esperas
   automáticas, evidencias y un diseño que aguanta los cambios de la interfaz.
3. **APIs:** respuestas, contratos, permisos y mocks, con Playwright y con Postman/Newman.
4. **Pipeline:** las mismas pruebas en GitHub Actions, en contenedores y en entornos que nacen y mueren
   con cada ejecución, con reportes y puertas de calidad.
5. **Mantenimiento:** suites estables, rápidas y con la cobertura que importa, con GitHub Copilot
   como ayuda para generar, depurar y refactorizar.

Cada laboratorio no se queda en que la prueba pase: se rompe a propósito, se investiga por qué falla y
se mejora.

## Dirigido a

Desarrolladores, QA Engineers y QA Automation Engineers, DevOps Engineers, Technical Leads y equipos
Agile que quieren que las pruebas formen parte de la entrega continua: escribirlas junto al código,
que se ejecuten solas en cada pull request y que sus fallos se puedan diagnosticar.

## Conocimientos previos

- Se da por sabido: programar en algún lenguaje y qué es una API REST (métodos, códigos de estado, JSON).
- Basta con haber usado: Git y GitHub (clonar, commit, pull request) y un terminal.
- Se estudia en el curso: JavaScript lo justo para las pruebas, Vitest, Playwright, Cypress,
  Postman/Newman, GitHub Actions, Docker Compose y Allure.

Todo se hace en **GitHub Codespaces**, desde el navegador: no hay que instalar nada en el equipo. Hace
falta una cuenta de GitHub y, para el último módulo, acceso a GitHub Copilot.

## Objetivos específicos

- Situar cada tipo de prueba en la pirámide y medir lo que cuesta cada nivel.
- Automatizar flujos web con Playwright y Cypress con selectores estables, esperas automáticas y evidencias.
- Validar APIs REST (respuestas, contratos, autenticación y autorización) y aislarlas con mocks.
- Ejecutar las pruebas en GitHub Actions con reportes, artefactos, puertas de calidad y entornos efímeros.
- Estabilizar y acelerar una suite, medir su cobertura útil y usar GitHub Copilot para generar y depurar pruebas.

## Temario

<!-- gen:temario -->
- **[M01 — Introducción a la automatización de pruebas](labs/M01-introduccion-automatizacion/README.md)**
  - [Fundamentos del testing moderno](labs/M01-introduccion-automatizacion/00-testing-en-agile-y-devops.md)
  - [Testing en entornos Agile y DevOps](labs/M01-introduccion-automatizacion/00-testing-en-agile-y-devops.md)
  - [Pirámide de testing](labs/M01-introduccion-automatizacion/05-lab-piramide-de-pruebas.md)
  - [Shift-left testing](labs/M01-introduccion-automatizacion/00-testing-en-agile-y-devops.md)
  - [Estrategias de automatización](labs/M01-introduccion-automatizacion/05-lab-piramide-de-pruebas.md)
  - [Unitarias](labs/M01-introduccion-automatizacion/03-lab-primera-prueba-unitaria.md)
  - [Integración](labs/M01-introduccion-automatizacion/04-lab-prueba-de-integracion.md)
  - [Funcionales](labs/M01-introduccion-automatizacion/02-una-funcionalidad-tres-niveles.md)
  - [End-to-end](labs/M01-introduccion-automatizacion/02-una-funcionalidad-tres-niveles.md)
  - [APIs](labs/M01-introduccion-automatizacion/04-lab-prueba-de-integracion.md)
  - [Buenas prácticas y anti-patrones](labs/M01-introduccion-automatizacion/06-lab-pruebas-independientes.md)
  - [Preparación del entorno de trabajo](labs/M01-introduccion-automatizacion/01-lab-preparar-el-entorno.md)
  - [Ejecución de pruebas básicas automatizadas](labs/M01-introduccion-automatizacion/03-lab-primera-prueba-unitaria.md)
- **[M02 — Automatización de pruebas funcionales y E2E](labs/M02-funcionales-e2e/README.md)**
  - [Introducción a Playwright y Cypress](labs/M02-funcionales-e2e/00-playwright-y-cypress.md)
  - [Automatización de navegación web](labs/M02-funcionales-e2e/01-lab-navegacion-web.md)
  - [Selectores y sincronización](labs/M02-funcionales-e2e/02-lab-selectores-estables.md)
  - [Selectores y sincronización](labs/M02-funcionales-e2e/03-lab-sincronizacion.md)
  - [Manejo de formularios y validaciones](labs/M02-funcionales-e2e/04-lab-formularios-y-validaciones.md)
  - [Captura de evidencias y screenshots](labs/M02-funcionales-e2e/05-lab-evidencias.md)
  - [Gestión de errores y reintentos](labs/M02-funcionales-e2e/06-lab-errores-y-reintentos.md)
  - [Diseño mantenible de pruebas](labs/M02-funcionales-e2e/07-lab-page-objects.md)
  - [Automatización completa de una aplicación web](labs/M02-funcionales-e2e/08-lab-suite-e2e-de-un-flujo.md)
  - [Creación de suites E2E](labs/M02-funcionales-e2e/08-lab-suite-e2e-de-un-flujo.md)
  - [Validación de flujos funcionales](labs/M02-funcionales-e2e/09-lab-flujo-con-cypress.md)
- **[M03 — Testing de APIs](labs/M03-testing-apis/README.md)**
  - [Introducción al testing de APIs REST](labs/M03-testing-apis/00-anatomia-de-una-prueba-api.md)
  - [Validación de respuestas y contratos](labs/M03-testing-apis/01-lab-validar-respuestas.md)
  - [Validación de respuestas y contratos](labs/M03-testing-apis/02-lab-contratos-json-schema.md)
  - [Uso de Postman y Newman](labs/M03-testing-apis/03-lab-coleccion-postman.md)
  - [Automatización de pruebas API](labs/M03-testing-apis/01-lab-validar-respuestas.md)
  - [Validación de autenticación y autorización](labs/M03-testing-apis/05-lab-autenticacion-y-autorizacion.md)
  - [Mocking y simulación de servicios](labs/M03-testing-apis/06-lab-mock-desde-el-contrato.md)
  - [Mocking y simulación de servicios](labs/M03-testing-apis/07-lab-simular-fallos.md)
  - [Automatización de pruebas sobre APIs REST](labs/M03-testing-apis/01-lab-validar-respuestas.md)
  - [Validación automática de respuestas](labs/M03-testing-apis/02-lab-contratos-json-schema.md)
  - [Ejecución automatizada desde línea de comandos](labs/M03-testing-apis/04-lab-newman-datos-y-entornos.md)
- **[M04 — Integración CI/CD y testing continuo](labs/M04-ci-cd-testing-continuo/README.md)**
  - [Integración de pruebas en pipelines](labs/M04-ci-cd-testing-continuo/01-lab-primer-workflow.md)
  - [GitHub Actions para automatización](labs/M04-ci-cd-testing-continuo/01-lab-primer-workflow.md)
  - [Ejecución automática de pruebas](labs/M04-ci-cd-testing-continuo/02-lab-e2e-en-el-pipeline.md)
  - [Reporting y generación de evidencias](labs/M04-ci-cd-testing-continuo/03-lab-reportes-html-y-allure.md)
  - [Estrategias de calidad continua](labs/M04-ci-cd-testing-continuo/05-lab-puerta-de-calidad.md)
  - [Gestión de entornos efímeros](labs/M04-ci-cd-testing-continuo/07-lab-entornos-efimeros.md)
  - [Testing en contenedores Docker](labs/M04-ci-cd-testing-continuo/06-lab-pruebas-en-contenedores.md)
  - [Integración completa de tests en pipeline CI/CD](labs/M04-ci-cd-testing-continuo/02-lab-e2e-en-el-pipeline.md)
  - [Generación de reportes automáticos](labs/M04-ci-cd-testing-continuo/03-lab-reportes-html-y-allure.md)
  - [Publicación de artefactos de testing](labs/M04-ci-cd-testing-continuo/04-lab-publicar-artefactos.md)
- **[M05 — Buenas prácticas y automatización asistida por IA](labs/M05-buenas-practicas-ia/README.md)**
  - [Flaky tests y estabilización de suites](labs/M05-buenas-practicas-ia/01-lab-estabilizar-flaky-tests.md)
  - [Estrategias de mantenimiento](labs/M05-buenas-practicas-ia/04-lab-refactorizar-escenarios.md)
  - [Cobertura útil vs cobertura excesiva](labs/M05-buenas-practicas-ia/02-lab-cobertura-util.md)
  - [Optimización de tiempos de ejecución](labs/M05-buenas-practicas-ia/03-lab-optimizar-tiempos.md)
  - [Uso de GitHub Copilot para generación de pruebas](labs/M05-buenas-practicas-ia/05-lab-generar-pruebas-con-copilot.md)
  - [Generación automática de casos de prueba](labs/M05-buenas-practicas-ia/05-lab-generar-pruebas-con-copilot.md)
  - [Asistencia IA para debugging y refactorización](labs/M05-buenas-practicas-ia/06-lab-depurar-con-ia.md)
  - [Generación asistida de pruebas mediante IA](labs/M05-buenas-practicas-ia/05-lab-generar-pruebas-con-copilot.md)
  - [Optimización de suites automatizadas](labs/M05-buenas-practicas-ia/03-lab-optimizar-tiempos.md)
  - [Refactorización de escenarios de testing](labs/M05-buenas-practicas-ia/04-lab-refactorizar-escenarios.md)
<!-- /gen:temario -->

## Antes de empezar

1. Haz un **fork** de este repositorio en tu cuenta de GitHub (botón **Fork**).
2. En tu fork: **Code** → **Codespaces** → **Create codespace on main**. La primera vez tarda unos
   minutos: instala Node, los navegadores y las herramientas.
3. Comprueba el entorno con [`npm run verificar`](labs/comandos-lab.md#verificar):

```bash
# Comprueba que todas las herramientas del curso responden
npm run verificar
```

Lo detallan [el primer laboratorio](labs/M01-introduccion-automatizacion/01-lab-preparar-el-entorno.md),
las [fichas de comandos](labs/comandos-lab.md) y el [glosario](labs/glosario/README.md).

### Guardar tu trabajo

Los cambios que hagas en los ejercicios y los workflows que crees son tuyos: guárdalos en tu fork.

```bash
# Un commit por laboratorio, en tu fork (origin)
git add -A
git commit -m "M02-03: sincronización"
git push
```

Para recibir correcciones del curso, añade el repositorio original como `upstream` y fusiónalo:

```bash
# Una sola vez: el repositorio del curso como upstream
git remote add upstream https://github.com/my-it-labs/testing-automatizacion-agile-201.git
# Cada vez que quieras traer correcciones
git fetch upstream
git merge upstream/main
```

Los resultados de las pruebas (reportes, trazas, vídeos, `node_modules`) quedan fuera de Git
(`.gitignore`).

## Empieza aquí

<!-- gen:empieza -->
→ **[M01 — Testing en Agile y DevOps](labs/M01-introduccion-automatizacion/00-testing-en-agile-y-devops.md)**
<!-- /gen:empieza -->
