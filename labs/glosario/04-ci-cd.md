# Glosario 4 — CI/CD y testing continuo

[← Hoja anterior](03-apis.md) · [Índice del glosario](README.md) · [Siguiente hoja →](05-calidad-e-ia.md)

Conceptos de integración continua, reporting, puertas de calidad y entornos de prueba. Se usan en el
módulo M04 (GitHub Actions, Allure, Docker Compose y PostgreSQL efímero).

---

<a id="mapa"></a>
## 1. El mapa de familias

✔ = lo usas en el curso · ○ = hermano que no usamos, para que sepas que existe y cuándo se elige.

```text
Servidores de CI
├── ✔ GitHub Actions ............ M04-00 a M04-07 (workflows en .github/workflows/)
├── ○ GitLab CI/CD (.gitlab-ci.yml: si el código vive en GitLab)
├── ○ Jenkins (servidor propio, plugins; muy extendido en empresas)
└── ○ Azure Pipelines / CircleCI (ecosistema Microsoft / servicio dedicado)

Reportes de pruebas
├── ✔ Consola (list) ............ todos los labs
├── ✔ HTML de Playwright ........ M04-03, M04-04
├── ✔ JUnit XML ................. M04-03
├── ✔ Allure 3 .................. M04-03
└── ○ ReportPortal (servidor con historial y análisis de fallos para muchos proyectos)

Entornos para probar
├── ✔ Contenedores con Docker Compose ... M04-06
├── ✔ Entorno efímero (Compose / services de Actions) ... M04-07
├── ○ Testcontainers (los contenedores los crea el propio código de la prueba)
└── ○ Entornos de revisión por pull request (la app desplegada en un entorno que nace con el PR)
```

<a id="comparacion-ci"></a>
### Comparación: qué servidor de CI

| | ✔ GitHub Actions | ○ GitLab CI/CD | ○ Jenkins |
|--|--|--|--|
| **Cómo funciona** | Workflows YAML en el repositorio; runners de GitHub o propios | `.gitlab-ci.yml` en el repositorio; runners de GitLab o propios | Servidor propio; pipelines en `Jenkinsfile` y plugins |
| **Cuándo se elige** | El código está en GitHub | El código está en GitLab | Hace falta control total del servidor o ya existe en la empresa |
| **Qué cuesta** | Minutos incluidos en cuentas públicas y planes; runners propios para más | Parecido, con minutos por plan | Mantener el servidor, sus plugins y su seguridad |
| **En el curso** | Workflows de M04 en tu fork | — | — |

<a id="comparacion-reportes"></a>
### Comparación: qué reporte

| | ✔ HTML de Playwright | ✔ JUnit XML | ✔ Allure 3 |
|--|--|--|--|
| **Cómo funciona** | Reporter `html`: una web autocontenida con pasos, errores y trazas | Reporter `junit`: un XML con una entrada por prueba | `allure-playwright` escribe resultados; `allure generate` construye la web |
| **Cuándo se elige** | Depurar una ejecución | Que otra herramienta (CI, gestor de pruebas) lea los resultados | Ver tendencias, categorías de fallo e historial |
| **Qué cuesta** | Nada; una carpeta por ejecución | Nada; no es para leerlo a mano | Un paso de generación y guardar el historial entre ejecuciones |
| **En el curso** | `All 4, Passed 2, Failed 2, Skipped 1` en M04-03 | `failures="1"`, `errors="1"` | Categorías propias, `History 2` y transición **Fixed** |

---

## 2. Los conceptos

<a id="integracion-continua"></a>
### Integración continua (CI)

**Qué es:** integrar cada cambio en la rama principal a menudo y verificarlo automáticamente cada vez
(instalar, probar, informar). La entrega continua (CD) va un paso más allá: deja cada cambio verificado
listo para desplegar.

**En el curso:** cada push y pull request de tu fork dispara un workflow que ejecuta las pruebas del
ejercicio y deja un check verde o rojo en el commit.

**Dónde se rompe:** cuando el resultado no decide nada (nadie mira el check) o la suite tarda tanto que se
deja de esperar a ella. Lo ves en M04-01 (rojo que no bloquea) y M04-05 (puerta de calidad).

**Lo usas en:** <!--usos:integracion-continua-->[M01](../M01-introduccion-automatizacion/README.md) · [00-tes](../M01-introduccion-automatizacion/00-testing-en-agile-y-devops.md) · [M04](../M04-ci-cd-testing-continuo/README.md) · [00-un-](../M04-ci-cd-testing-continuo/00-un-pipeline-de-pruebas.md) · [01-lab](../M04-ci-cd-testing-continuo/01-lab-primer-workflow.md) · [00-por](../M05-buenas-practicas-ia/00-por-que-falla-a-veces.md)<!--/usos-->

Relacionado: [pipeline](#pipeline) · [workflow](#workflow) · [puerta de calidad](#puerta-de-calidad)

<a id="pipeline"></a>
### Pipeline

**Qué es:** la secuencia automática de etapas por la que pasa un cambio: obtener el código, instalar,
probar, publicar evidencias y, en CD, desplegar.

**En el curso:** cada workflow de M04 es un pipeline: `checkout` → `setup-node` → `npm ci` → pruebas →
`upload-artifact`.

**Dónde se rompe:** cuando una etapa depende de algo que no declara (una app arrancada a mano, navegadores
instalados): en M04-02 la suite falla con `ERR_CONNECTION_REFUSED`.

**Lo usas en:** <!--usos:pipeline-->[00-tes](../M01-introduccion-automatizacion/00-testing-en-agile-y-devops.md) · [01-lab](../M01-introduccion-automatizacion/01-lab-preparar-el-entorno.md) · [05-lab](../M01-introduccion-automatizacion/05-lab-piramide-de-pruebas.md) · [05-lab](../M02-funcionales-e2e/05-lab-evidencias.md) · [06-lab](../M02-funcionales-e2e/06-lab-errores-y-reintentos.md) · [09-lab](../M02-funcionales-e2e/09-lab-flujo-con-cypress.md) · [M03](../M03-testing-apis/README.md) · [00-ana](../M03-testing-apis/00-anatomia-de-una-prueba-api.md) · [01-lab](../M03-testing-apis/01-lab-validar-respuestas.md) · [02-lab](../M03-testing-apis/02-lab-contratos-json-schema.md) · [03-lab](../M03-testing-apis/03-lab-coleccion-postman.md) · [04-lab](../M03-testing-apis/04-lab-newman-datos-y-entornos.md) · [05-lab](../M03-testing-apis/05-lab-autenticacion-y-autorizacion.md) · [06-lab](../M03-testing-apis/06-lab-mock-desde-el-contrato.md) · [M04](../M04-ci-cd-testing-continuo/README.md) · [02-lab](../M04-ci-cd-testing-continuo/02-lab-e2e-en-el-pipeline.md) · [03-lab](../M04-ci-cd-testing-continuo/03-lab-reportes-html-y-allure.md) · [06-lab](../M04-ci-cd-testing-continuo/06-lab-pruebas-en-contenedores.md) · [00-por](../M05-buenas-practicas-ia/00-por-que-falla-a-veces.md) · [01-lab](../M05-buenas-practicas-ia/01-lab-estabilizar-flaky-tests.md) · [02-lab](../M05-buenas-practicas-ia/02-lab-cobertura-util.md) · [03-lab](../M05-buenas-practicas-ia/03-lab-optimizar-tiempos.md) · [06-lab](../M05-buenas-practicas-ia/06-lab-depurar-con-ia.md)<!--/usos-->

Relacionado: [workflow](#workflow) · [job](#job)

<a id="workflow"></a>
### Workflow (GitHub Actions)

**Qué es:** un fichero YAML en `.github/workflows/` (en la raíz del repositorio) que define cuándo se
ejecuta (`on`), en qué máquinas (`runs-on`) y con qué pasos (`steps`).

**En el curso:** `pruebas-unitarias.yml`, `e2e.yml`, `artefactos.yml`, `calidad-pr.yml`,
`suite-nocturna.yml`, `contenedores.yml` y `entorno-efimero.yml`, que creas tú en tu fork a partir de la
carpeta `solucion/` de cada ejercicio.

**Dónde se rompe:** fuera de `.github/workflows/` no existe; con una sangría mal puesta no se carga; en un
fork no corre hasta habilitar Actions (**I understand my workflows, go ahead and enable them**).

**Lo usas en:** <!--usos:workflow-->[M04](../M04-ci-cd-testing-continuo/README.md) · [00-un-](../M04-ci-cd-testing-continuo/00-un-pipeline-de-pruebas.md) · [01-lab](../M04-ci-cd-testing-continuo/01-lab-primer-workflow.md) · [02-lab](../M04-ci-cd-testing-continuo/02-lab-e2e-en-el-pipeline.md) · [04-lab](../M04-ci-cd-testing-continuo/04-lab-publicar-artefactos.md) · [05-lab](../M04-ci-cd-testing-continuo/05-lab-puerta-de-calidad.md) · [07-lab](../M04-ci-cd-testing-continuo/07-lab-entornos-efimeros.md)<!--/usos-->

Relacionado: [evento](#evento) · [job](#job) · [runner](#runner)

<a id="evento"></a>
### Evento (disparador)

**Qué es:** lo que hace que un workflow se ejecute: `push`, `pull_request`, `schedule` (cron),
`workflow_dispatch` (a mano)… Se puede filtrar por ramas (`branches`) y por ficheros (`paths`).

**En el curso:** `push`/`pull_request` con `paths` del ejercicio en M04-01; `pull_request` sin `paths` para
la puerta de M04-05; `schedule: '0 3 * * *'` y `workflow_dispatch` para la suite nocturna.

**Dónde se rompe:** un filtro `paths` en un check obligatorio deja los pull requests esperando un check que
nunca llega (**Expected — Waiting for status to be reported**, M04-05). `schedule` solo corre en la rama
por defecto.

**Lo usas en:** <!--usos:evento-->—<!--/usos-->

Relacionado: [workflow](#workflow) · [puerta de calidad](#puerta-de-calidad)

<a id="job"></a>
### Job y step

**Qué es:** un **job** es un conjunto de pasos que corre en una máquina; los jobs de un workflow van en
paralelo salvo que uno dependa de otro (`needs`). Un **step** es un comando (`run`) o una acción (`uses`)
dentro del job, en orden.

**En el curso:** el job `vitest` de M04-01, `playwright` de M04-02, `suite-rapida` de M04-05 (que es
también el nombre del check). Con `strategy.matrix` un job se multiplica (Node 22 y 24 en M04-00).

**Dónde se rompe:** un step que termina con código distinto de 0 falla y los siguientes se saltan, salvo
que lleven `if` (M04-04: el reporte no se sube si las pruebas fallan).

**Lo usas en:** <!--usos:job-->[M04](../M04-ci-cd-testing-continuo/README.md) · [00-un-](../M04-ci-cd-testing-continuo/00-un-pipeline-de-pruebas.md) · [01-lab](../M04-ci-cd-testing-continuo/01-lab-primer-workflow.md) · [02-lab](../M04-ci-cd-testing-continuo/02-lab-e2e-en-el-pipeline.md) · [03-lab](../M04-ci-cd-testing-continuo/03-lab-reportes-html-y-allure.md) · [04-lab](../M04-ci-cd-testing-continuo/04-lab-publicar-artefactos.md) · [05-lab](../M04-ci-cd-testing-continuo/05-lab-puerta-de-calidad.md) · [06-lab](../M04-ci-cd-testing-continuo/06-lab-pruebas-en-contenedores.md) · [07-lab](../M04-ci-cd-testing-continuo/07-lab-entornos-efimeros.md)<!--/usos-->

Relacionado: [runner](#runner) · [acción](#accion) · [artefacto](#artefacto)

<a id="runner"></a>
### Runner

**Qué es:** la máquina que ejecuta un job. Los de GitHub (`ubuntu-latest`) se crean limpios para cada job y
se destruyen al terminar; también se pueden usar runners propios.

**En el curso:** todos los workflows usan `ubuntu-latest`, que trae Docker y `psql` pero no los navegadores
de Playwright.

**Dónde se rompe:** todo lo que no instale el workflow no existe (navegadores en M04-02) y todo lo que no
se suba como artefacto desaparece (M04-04).

**Lo usas en:** <!--usos:runner-->[M04](../M04-ci-cd-testing-continuo/README.md) · [00-un-](../M04-ci-cd-testing-continuo/00-un-pipeline-de-pruebas.md) · [01-lab](../M04-ci-cd-testing-continuo/01-lab-primer-workflow.md) · [02-lab](../M04-ci-cd-testing-continuo/02-lab-e2e-en-el-pipeline.md) · [04-lab](../M04-ci-cd-testing-continuo/04-lab-publicar-artefactos.md) · [06-lab](../M04-ci-cd-testing-continuo/06-lab-pruebas-en-contenedores.md) · [07-lab](../M04-ci-cd-testing-continuo/07-lab-entornos-efimeros.md)<!--/usos-->

Relacionado: [job](#job) · [artefacto](#artefacto)

<a id="accion"></a>
### Acción (action)

**Qué es:** un paso empaquetado y reutilizable que se usa con `uses: propietario/nombre@versión`.

**En el curso:** `actions/checkout@v7` (trae el código), `actions/setup-node@v7` (Node y caché de npm),
`actions/upload-artifact@v7` (sube evidencias).

**Dónde se rompe:** sin versión fija (`@main`) puede cambiar bajo tus pies; con una versión mayor nueva
cambian sus entradas. Mira su `action.yml` para saber qué acepta.

**Lo usas en:** <!--usos:accion-->—<!--/usos-->

Relacionado: [workflow](#workflow) · [artefacto](#artefacto)

<a id="check"></a>
### Check (status check)

**Qué es:** el resultado de un job asociado a un commit, visible en la lista de commits y en la caja de
fusión del pull request, con enlace al log.

**En el curso:** `Demo pipeline / Unitarias (Node 22)` en M04-00; `suite-rapida` como check obligatorio en
M04-05.

**Dónde se rompe:** un check que no es obligatorio informa pero no impide fusionar.

**Lo usas en:** <!--usos:check-->[M04](../M04-ci-cd-testing-continuo/README.md) · [00-un-](../M04-ci-cd-testing-continuo/00-un-pipeline-de-pruebas.md) · [01-lab](../M04-ci-cd-testing-continuo/01-lab-primer-workflow.md) · [03-lab](../M04-ci-cd-testing-continuo/03-lab-reportes-html-y-allure.md) · [05-lab](../M04-ci-cd-testing-continuo/05-lab-puerta-de-calidad.md)<!--/usos-->

Relacionado: [puerta de calidad](#puerta-de-calidad) · [ruleset](#ruleset)

<a id="artefacto"></a>
### Artefacto

**Qué es:** ficheros que un job sube con `actions/upload-artifact` para que sobrevivan al runner. Quedan
asociados a la ejecución, se descargan desde la web o con `gh run download` y caducan (`retention-days`).

**En el curso:** `reporte-html` (carpeta `playwright-report/`) y `trazas` (`test-results/`) en M04-04.

**Dónde se rompe:** sin `if: ${{ !cancelled() }}` no se sube cuando las pruebas fallan; con `path` relativo
al `working-directory` no encuentra nada (`No files were found with the provided path`); los ficheros
ocultos se quedan fuera.

**Lo usas en:** <!--usos:artefacto-->[M04](../M04-ci-cd-testing-continuo/README.md) · [02-lab](../M04-ci-cd-testing-continuo/02-lab-e2e-en-el-pipeline.md) · [03-lab](../M04-ci-cd-testing-continuo/03-lab-reportes-html-y-allure.md) · [04-lab](../M04-ci-cd-testing-continuo/04-lab-publicar-artefactos.md) · [06-lab](../M04-ci-cd-testing-continuo/06-lab-pruebas-en-contenedores.md)<!--/usos-->

Relacionado: [reporte HTML](#reporte-html) · [traza](#traza)

<a id="reporte-html"></a>
### Reporte HTML de Playwright

**Qué es:** la web que genera el reporter `html`: lista filtrable de pruebas, pasos (`test.step`), errores
con el código señalado, adjuntos y trazas.

**En el curso:** `outputFolder: './playwright-report'` y `npx playwright show-report playwright-report
--host 0.0.0.0` (puerto 9323).

**Dónde se rompe:** sin `outputFolder`, se escribe en `playwright-report/` de la raíz del repositorio,
compartida por todos los ejercicios; sin carpeta, `show-report` busca allí.

**Lo usas en:** <!--usos:reporte-html-->[05-lab](../M02-funcionales-e2e/05-lab-evidencias.md) · [06-lab](../M02-funcionales-e2e/06-lab-errores-y-reintentos.md) · [M04](../M04-ci-cd-testing-continuo/README.md) · [03-lab](../M04-ci-cd-testing-continuo/03-lab-reportes-html-y-allure.md) · [04-lab](../M04-ci-cd-testing-continuo/04-lab-publicar-artefactos.md)<!--/usos-->

Relacionado: [JUnit XML](#junit-xml) · [Allure](#allure) · [artefacto](#artefacto)

<a id="junit-xml"></a>
### JUnit XML

**Qué es:** un formato XML de resultados (`<testsuite>`, `<testcase>`, `<failure>`, `<error>`, `<skipped>`)
que entienden casi todos los servidores de CI y gestores de pruebas.

**En el curso:** `reports/junit.xml` en M04-03, con `failures="1"` (aserción) y `errors="1"` (excepción de
la prueba).

**Dónde se rompe:** se escribe al terminar la ejecución: si se corta, no existe.

**Lo usas en:** <!--usos:junit-xml-->[M03](../M03-testing-apis/README.md) · [04-lab](../M03-testing-apis/04-lab-newman-datos-y-entornos.md) · [M04](../M04-ci-cd-testing-continuo/README.md) · [03-lab](../M04-ci-cd-testing-continuo/03-lab-reportes-html-y-allure.md)<!--/usos-->

Relacionado: [reporte HTML](#reporte-html) · [Allure](#allure)

<a id="allure"></a>
### Allure

**Qué es:** un generador de reportes que construye una web a partir de resultados en bruto
(`allure-results/`) de muchas herramientas. Allure 3 se instala desde npm y no necesita Java.

**En el curso:** `allure-playwright` escribe los resultados; `npx allure generate allure-results -o
allure-report --clean` y `npx allure open --port 3413 allure-report`; `allurerc.mjs` con categorías
propias e `historyPath` (M04-03).

**Cómo funciona por dentro:** agrupa resultados por prueba; si en `allure-results/` hay dos de la misma, los
trata como reintentos (**Retried tests 5** con 10 ficheros en M04-03). Cada generación añade una línea a
`allure-history.jsonl`, de donde salen **History** y las transiciones (**New**, **Fixed**, **Regressed**,
**Malfunctioned**).

**Dónde se rompe:** `allure-results/` acumulado entre ejecuciones; sin `historyPath` no hay historial.

**Lo usas en:** <!--usos:allure-->[01-lab](../M01-introduccion-automatizacion/01-lab-preparar-el-entorno.md) · [06-lab](../M02-funcionales-e2e/06-lab-errores-y-reintentos.md) · [M04](../M04-ci-cd-testing-continuo/README.md) · [03-lab](../M04-ci-cd-testing-continuo/03-lab-reportes-html-y-allure.md)<!--/usos-->

Relacionado: [reporte HTML](#reporte-html) · [JUnit XML](#junit-xml)

<a id="traza"></a>
### Traza (trace) de Playwright

**Qué es:** un `trace.zip` con cada acción de la prueba, el DOM antes y después, red y consola; se abre con
el Trace Viewer (`npx playwright show-trace`).

**En el curso:** `trace: 'retain-on-failure'` en M04-04; se sube como artefacto `trazas`, se descarga y se
abre con `--host 0.0.0.0 --port 9322`.

**Dónde se rompe:** en CI, si no se sube como artefacto, se pierde con el runner.

**Lo usas en:** <!--usos:traza-->—<!--/usos-->

Relacionado: [artefacto](#artefacto) · [reporte HTML](#reporte-html)

<a id="puerta-de-calidad"></a>
### Puerta de calidad (quality gate)

**Qué es:** una condición que un cambio tiene que cumplir para avanzar (fusionarse, desplegarse): pruebas en
verde, cobertura mínima, cero fallos críticos…

**En el curso:** el check `suite-rapida` obligatorio en `main` mediante un ruleset (M04-05). Allure 3 tiene
su propia variante (`allure quality-gate`) sobre los resultados.

**Dónde se rompe:** si la suite que la guarda es lenta, el equipo espera o la desactiva; si el check
obligatorio tiene filtro `paths`, bloquea pull requests para siempre.

**Lo usas en:** <!--usos:puerta-de-calidad-->[M04](../M04-ci-cd-testing-continuo/README.md) · [05-lab](../M04-ci-cd-testing-continuo/05-lab-puerta-de-calidad.md)<!--/usos-->

Relacionado: [ruleset](#ruleset) · [suite rápida y nocturna](#suite-rapida-y-nocturna)

<a id="ruleset"></a>
### Ruleset (regla de rama)

**Qué es:** el conjunto de reglas de GitHub para una o varias ramas (sucesor de *branch protection*):
exigir pull request, aprobaciones, checks en verde, historial lineal…

**En el curso:** `main protegida` en tu fork: **Require a pull request before merging** y **Require status
checks to pass** con `suite-rapida` (M04-05).

**Dónde se rompe:** un push directo a `main` se rechaza (`GH013: Repository rule violations found`); el check
que exiges tiene que haberse ejecutado antes para poder elegirlo.

**Lo usas en:** <!--usos:ruleset-->[M04](../M04-ci-cd-testing-continuo/README.md) · [05-lab](../M04-ci-cd-testing-continuo/05-lab-puerta-de-calidad.md) · [06-lab](../M04-ci-cd-testing-continuo/06-lab-pruebas-en-contenedores.md)<!--/usos-->

Relacionado: [puerta de calidad](#puerta-de-calidad) · [check](#check)

<a id="suite-rapida-y-nocturna"></a>
### Suite rápida y suite nocturna

**Qué es:** el reparto de una suite según cuándo se ejecuta: una **rápida** (*smoke*) con lo mínimo para
saber que la aplicación sirve, que decide cada pull request, y una **completa**, que corre programada (por la
noche) o a mano.

**En el curso:** 2 pruebas `@smoke` (`--grep @smoke`, menos de 1 s) frente a 6 (casi 7 s) en M04-05;
`calidad-pr.yml` y `suite-nocturna.yml` con `schedule` y `workflow_dispatch`.

**Dónde se rompe:** la rápida engorda con pruebas lentas; la nocturna falla y nadie se entera.

**Lo usas en:** <!--usos:suite-rapida-y-nocturna-->[M04](../M04-ci-cd-testing-continuo/README.md) · [05-lab](../M04-ci-cd-testing-continuo/05-lab-puerta-de-calidad.md) · [03-lab](../M05-buenas-practicas-ia/03-lab-optimizar-tiempos.md)<!--/usos-->

Relacionado: [puerta de calidad](#puerta-de-calidad) · [evento](#evento)

<a id="docker-compose"></a>
### Docker Compose

**Qué es:** la herramienta que define y arranca varios contenedores (servicios), sus redes y volúmenes desde
un `compose.yaml`. Dentro de su red, los servicios se llaman por su nombre.

**En el curso:** proyectos `m04-06` (tablón + pruebas) y `m04-07` (PostgreSQL + API).
`docker compose run --rm pruebas`, `up --exit-code-from pruebas`, `up -d --wait`, `down -v`.

**Dónde se rompe:** `localhost` dentro de un contenedor es el propio contenedor (M04-06); `down` sin `-v`
conserva los volúmenes (M04-07); un servicio llamado `app` o `dev` hace que Chromium fuerce HTTPS.

**Lo usas en:** <!--usos:docker-compose-->[M04](../M04-ci-cd-testing-continuo/README.md) · [06-lab](../M04-ci-cd-testing-continuo/06-lab-pruebas-en-contenedores.md)<!--/usos-->

Relacionado: [healthcheck](#healthcheck) · [entorno efímero](#entorno-efimero)

<a id="healthcheck"></a>
### Healthcheck

**Qué es:** un comando que Docker ejecuta periódicamente dentro de un contenedor para saber si está listo
(`healthy`); otros servicios pueden esperar a ese estado (`depends_on: condition: service_healthy`).

**En el curso:** `wget -qO- http://localhost:3406/salud` en el tablón, `pg_isready` en PostgreSQL y `/salud`
con `SELECT 1` en la API de libros; en Actions, `--health-cmd` en `services`.

**Dónde se rompe:** sin él, las pruebas arrancan antes que la app y fallan al azar.

**Lo usas en:** <!--usos:healthcheck-->—<!--/usos-->

Relacionado: [Docker Compose](#docker-compose) · [contenedor de servicio](#contenedor-de-servicio)

<a id="imagen-de-playwright"></a>
### Imagen oficial de Playwright

**Qué es:** la imagen `mcr.microsoft.com/playwright:v<versión>-noble`: Ubuntu 24.04 con Node y los
navegadores de esa versión de Playwright ya instalados.

**En el curso:** `v1.65.1-noble`, igual que `@playwright/test` 1.65.1, como servicio `pruebas` (M04-06) y
como `container` de un job (reto de M04-02).

**Dónde se rompe:** con otra etiqueta, los navegadores no son los que pide el paquete
(`Executable doesn't exist` y «Please update docker image as well»).

**Lo usas en:** <!--usos:imagen-de-playwright-->[M04](../M04-ci-cd-testing-continuo/README.md) · [02-lab](../M04-ci-cd-testing-continuo/02-lab-e2e-en-el-pipeline.md) · [06-lab](../M04-ci-cd-testing-continuo/06-lab-pruebas-en-contenedores.md)<!--/usos-->

Relacionado: [Docker Compose](#docker-compose)

<a id="entorno-efimero"></a>
### Entorno efímero

**Qué es:** un entorno completo que se crea para una ejecución desde un estado conocido y se destruye al
terminar, de modo que ninguna ejecución hereda datos de otra.

**En el curso:** `docker compose up -d --wait` → `npx playwright test` → `docker compose down -v`, con
destrucción garantizada por `trap … EXIT`; en CI, `services: db` (M04-07).

**Dónde se rompe:** si se reutiliza, la segunda ejecución falla (`Pedro Páramo` de más, id 5 en lugar de 4);
si su destrucción depende de que las pruebas pasen (`&&`), queda vivo tras un fallo.

**Lo usas en:** <!--usos:entorno-efimero-->[06-lab](../M01-introduccion-automatizacion/06-lab-pruebas-independientes.md) · [M04](../M04-ci-cd-testing-continuo/README.md) · [07-lab](../M04-ci-cd-testing-continuo/07-lab-entornos-efimeros.md)<!--/usos-->

Relacionado: [datos de semilla](#datos-de-semilla) · [contenedor de servicio](#contenedor-de-servicio)

<a id="datos-de-semilla"></a>
### Datos de semilla

**Qué es:** el conjunto mínimo y conocido de datos con el que arranca un entorno de pruebas.

**En el curso:** `db/semilla.sql` (tabla `libros` y tres libros), que PostgreSQL ejecuta desde
`/docker-entrypoint-initdb.d/` solo si el volumen está vacío y que en CI se carga con `psql`.

**Dónde se rompe:** cambiar la semilla sin borrar el volumen no tiene efecto; una semilla enorme hace lento
cada entorno.

**Lo usas en:** <!--usos:datos-de-semilla-->[M04](../M04-ci-cd-testing-continuo/README.md) · [07-lab](../M04-ci-cd-testing-continuo/07-lab-entornos-efimeros.md)<!--/usos-->

Relacionado: [entorno efímero](#entorno-efimero)

<a id="contenedor-de-servicio"></a>
### Contenedor de servicio (services de Actions)

**Qué es:** un contenedor que GitHub Actions arranca antes de los steps de un job (`services:`), con su
`healthcheck`, y destruye al terminar el job: una base de datos o una cola de mensajes por job.

**En el curso:** `postgres:17-alpine` publicado en `localhost:5432` del runner en
`entorno-efimero.yml` (M04-07).

**Dónde se rompe:** si los steps corren en el runner (no en un contenedor), hace falta `ports` y
`PGHOST: localhost`; sin `--health-cmd`, los steps pueden empezar antes de que acepte conexiones.

**Lo usas en:** <!--usos:contenedor-de-servicio-->[07-lab](../M04-ci-cd-testing-continuo/07-lab-entornos-efimeros.md)<!--/usos-->

Relacionado: [entorno efímero](#entorno-efimero) · [healthcheck](#healthcheck)
