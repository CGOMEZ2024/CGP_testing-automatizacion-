# M04 — Integración CI/CD y testing continuo

[← Página anterior](../M03-testing-apis/07-lab-simular-fallos.md) · [Siguiente página →](00-un-pipeline-de-pruebas.md)

Hasta aquí las pruebas se ejecutaban cuando alguien se acordaba de lanzarlas en su terminal. Este
módulo las saca de ahí y las pone a trabajar solas: **integración de pruebas en [pipelines](../glosario/04-ci-cd.md#pipeline)** con
GitHub Actions, de forma que cada push y cada pull request ejecute la suite, deje su reporte y sus
evidencias, y pueda impedir que un cambio roto llegue a `main`. Todo se hace en tu fork del curso:
los [workflows](../glosario/04-ci-cd.md#workflow) los escribes tú en `.github/workflows/` y los ves correr en la pestaña **Actions**.
Cierra con dos ideas que hacen que el resultado sea fiable: probar dentro de contenedores y en
entornos que nacen y mueren con cada ejecución.

## Qué aprenderás

- Escribir un workflow de GitHub Actions que ejecuta [pruebas unitarias](../glosario/01-fundamentos.md#prueba-unitaria) y E2E en cada push y pull request.
- Preparar una suite de [Playwright](../glosario/02-e2e.md#playwright) para CI: aplicación arrancada por la configuración, navegadores
  instalados, [reintentos](../glosario/02-e2e.md#reintento) y `forbidOnly` solo en CI.
- Generar de una misma ejecución el [reporte HTML](../glosario/04-ci-cd.md#reporte-html), el [JUnit](../glosario/04-ci-cd.md#junit-xml) y el de [Allure](../glosario/04-ci-cd.md#allure), y saber qué pregunta responde cada uno.
- Publicar reportes y trazas como [artefactos](../glosario/04-ci-cd.md#artefacto) del workflow, también cuando las pruebas fallan, y
  descargarlos para diagnosticar.
- Convertir el [check](../glosario/04-ci-cd.md#check) de pruebas en una [puerta de calidad](../glosario/04-ci-cd.md#puerta-de-calidad) que bloquea la fusión, con una [suite rápida](../glosario/04-ci-cd.md#suite-rapida-y-nocturna) en
  el pull request y la completa por la noche.
- Ejecutar la suite en la [imagen oficial de Playwright](../glosario/04-ci-cd.md#imagen-de-playwright) contra la aplicación en [Docker Compose](../glosario/04-ci-cd.md#docker-compose), y crear
  y destruir un entorno con base de datos y [datos de semilla](../glosario/04-ci-cd.md#datos-de-semilla) en cada ejecución.

## Teoría

### Integración continua

La **[integración continua](../glosario/01-fundamentos.md#integracion-continua)** (CI) es integrar cada cambio en la rama principal a menudo y verificarlo
de forma automática cada vez. La verificación la hace un **pipeline**: una secuencia de pasos
(instalar, compilar, probar, publicar) que se dispara sola ante un evento. En GitHub, el pipeline es un
**workflow** de GitHub Actions: un fichero YAML en `.github/workflows/`.

| Pieza | Qué es | En un workflow |
|-------|--------|----------------|
| Evento | Lo que dispara la ejecución | `on: push`, `on: pull_request`, `on: schedule`, `on: workflow_dispatch` |
| [Job](../glosario/04-ci-cd.md#job) | Un conjunto de pasos que corre en una máquina | `jobs.<id>` con su `runs-on` |
| [Runner](../glosario/04-ci-cd.md#runner) | La máquina virtual (o el contenedor) que ejecuta el job | `runs-on: ubuntu-latest` |
| Step | Un comando o una acción, en orden | `run: npx vitest run` · `uses: actions/checkout@v7` |
| Acción | Un paso empaquetado y reutilizable | `actions/setup-node`, `actions/upload-artifact` |
| Check | El resultado del job, visible en el commit y en el pull request | ✓ verde / ✗ rojo |
| Artefacto | Ficheros que el job guarda para después | Reporte HTML, trazas, JUnit |

> [!NOTE]
> **CI no es CD.** CI verifica cada cambio (este módulo). La **entrega continua** (CD) deja cada
> cambio verificado listo para desplegar, y el **despliegue continuo** lo despliega solo. Las pruebas
> automáticas son la condición para las dos: sin ellas, desplegar a menudo es desplegar errores a menudo.

### Qué cambia cuando las pruebas corren en CI

En tu terminal tú arrancas la aplicación, tienes los navegadores instalados y miras la salida. En el
runner no hay nadie: cada job empieza en una máquina **limpia** que solo tiene lo que el workflow le
pone. Por eso la configuración de pruebas se prepara para CI:

| En tu terminal | En el runner de CI |
|----------------|--------------------|
| La app la arrancas tú | La arranca la configuración (`webServer`) o un contenedor |
| Navegadores ya instalados | `npx playwright install --with-deps chromium` o la imagen oficial de Playwright |
| Miras la salida y el reporte al momento | El reporte y las trazas se suben como **artefactos** |
| Un `test.only` te ahorra tiempo | Un `test.only` olvidado haría pasar la suite con una sola prueba: `forbidOnly` |
| Repites a mano si algo falla | `retries` reintenta, y el reporte marca la prueba como inestable |

### Calidad continua

Una suite en CI solo protege si su resultado **decide algo**. Eso es una **puerta de calidad**: una
regla de la rama ([ruleset](../glosario/04-ci-cd.md#ruleset)) exige que el check de pruebas esté en verde para fusionar. Para que la
puerta no frene al equipo, se reparte la suite:

| Suite | Cuándo | Qué contiene |
|-------|--------|--------------|
| Rápida (`@smoke`) | En cada pull request: es la puerta | Lo mínimo para saber que la aplicación sirve |
| Completa | Por la noche (`schedule`) y a mano (`workflow_dispatch`) | Todo, incluidas las pruebas lentas |

### Entornos para probar

| Entorno | Qué es | Riesgo |
|---------|--------|--------|
| Compartido (preproducción) | Un entorno fijo que usan todos | Datos que cambian entre ejecuciones; una prueba rompe a otra |
| En contenedores | La app y las pruebas en imágenes con versión fija | Que la imagen no coincida con la versión de la herramienta |
| Efímero | Se crea con datos de semilla para cada ejecución y se destruye al terminar | Olvidar destruirlo (o sus volúmenes) y que la siguiente ejecución herede datos |

> [!TIP]
> Si la prueba solo pasa «la primera vez», el problema no es la prueba: es el entorno, que no vuelve
> a su estado inicial. En el lab 07 lo ves con una base de datos PostgreSQL.

## Páginas

<!-- gen:paginas -->
| # | Página | Qué hay |
|---|--------|---------|
| 00 | [Un pipeline de pruebas](00-un-pipeline-de-pruebas.md) | Demostración: un push dispara un workflow, se leen sus jobs, sus logs y su resultado en el pull request |
| 01 | [Lab — Primer workflow](01-lab-primer-workflow.md) | Creas un workflow que ejecuta las pruebas unitarias en cada push y pull request |
| 02 | [Lab — E2E en el pipeline](02-lab-e2e-en-el-pipeline.md) | Ejecutas Playwright en Actions con su aplicación levantada y los navegadores instalados |
| 03 | [Lab — Reportes HTML y Allure](03-lab-reportes-html-y-allure.md) | Generas el reporte HTML, el JUnit y el de Allure de la misma ejecución y comparas qué cuenta cada uno |
| 04 | [Lab — Publicar artefactos](04-lab-publicar-artefactos.md) | Subes reportes y trazas como artefactos del workflow, también cuando las pruebas fallan |
| 05 | [Lab — Puerta de calidad](05-lab-puerta-de-calidad.md) | Haces obligatorio el check de pruebas para fusionar y separas la suite rápida de la nocturna |
| 06 | [Lab — Pruebas en contenedores](06-lab-pruebas-en-contenedores.md) | Ejecutas la suite en la imagen oficial de Playwright contra la aplicación en Docker Compose |
| 07 | [Lab — Entornos efímeros](07-lab-entornos-efimeros.md) | Cada ejecución levanta su base de datos con datos de semilla y la destruye al terminar |

→ Empieza por **[00 — Un pipeline de pruebas](00-un-pipeline-de-pruebas.md)**.
<!-- /gen:paginas -->

## Conclusiones del módulo

| Idea | Dónde la ves |
|------|--------------|
| Un workflow es un fichero versionado: evento → job → steps, y su resultado es un check del commit | [01 — Primer workflow](01-lab-primer-workflow.md) |
| Una suite E2E pasa en CI cuando la configuración arranca la app y el runner tiene los navegadores; sin eso falla con `ERR_CONNECTION_REFUSED` | [02 — E2E en el pipeline](02-lab-e2e-en-el-pipeline.md) |
| La consola dice qué ha pasado; el HTML, cómo; JUnit se lo cuenta a otras herramientas; Allure añade categorías e historial | [03 — Reportes HTML y Allure](03-lab-reportes-html-y-allure.md) |
| Las evidencias se suben con `if: ${{ !cancelled() }}`: sin esa condición, faltan justo cuando las pruebas fallan | [04 — Publicar artefactos](04-lab-publicar-artefactos.md) |
| La suite solo protege si su check es obligatorio para fusionar; la rápida decide el PR y la completa corre de noche | [05 — Puerta de calidad](05-lab-puerta-de-calidad.md) |
| En contenedores, `localhost` es el propio contenedor y la imagen de Playwright tiene que tener la versión del paquete | [06 — Pruebas en contenedores](06-lab-pruebas-en-contenedores.md) |
| Un [entorno efímero](../glosario/04-ci-cd.md#entorno-efimero) hace repetible la ejecución: semilla al crear, `down -v` al terminar, pase lo que pase | [07 — Entornos efímeros](07-lab-entornos-efimeros.md) |

> 🔑 Una prueba automática que nadie ejecuta no protege nada: en CI se ejecuta sola, deja sus
> evidencias y decide si el cambio entra.
