# Glosario 5 — Calidad de la suite y pruebas asistidas por IA

[← Hoja anterior](04-ci-cd.md) · [Índice del glosario](README.md)

Los conceptos para mantener sana una suite que ya existe (estabilidad, cobertura que importa, tiempo,
mantenimiento) y para usar la IA al escribirla y depurarla. Se trabajan en el módulo M05.

---

<a id="mapa"></a>
## 1. El mapa de familias

✔ = lo usas en el curso · ○ = hermano que no usamos, para que sepas que existe y cuándo se elige.

```text
Medir la calidad de una suite
├── ✔ Cobertura de código (v8, líneas y ramas) .......... M05-02, M05-05
├── ✔ Mutation testing (Stryker) ......................... M05-02, M05-05
├── ○ Cobertura de requisitos (matriz requisito → prueba; cuando hay trazabilidad regulada)
└── ○ Property-based testing (fast-check: genera cientos de entradas a partir de propiedades)

Detectar pruebas inestables
├── ✔ Repetir: --repeat-each, --workers .................. M05-00, M05-01
├── ✔ Reintentos con estado flaky y failOnFlakyTests ..... M05-00, M05-01
└── ○ Historial de ejecuciones en CI (detección estadística en servicios de reporting)

Acelerar una suite
├── ✔ Paralelismo: workers, fullyParallel ................ M05-01, M05-03
├── ✔ Sesión reutilizada (storageState + proyecto setup) . M05-03
├── ✔ Preparación por API ................................ M05-03
└── ○ Sharding entre máquinas (--shard=1/4; suites de cientos de pruebas)

Generar pruebas
├── ✔ Asistente de IA en el editor (GitHub Copilot Chat) . M05-05, M05-06
├── ✔ Grabador (npx playwright codegen) .................. M05-05
├── ○ Agentes de pruebas de Playwright (planner/generator/healer, con un asistente de IA)
└── ○ Otros asistentes (Cursor, Claude Code, Codeium…; el mismo ciclo: pedir, ejecutar, revisar)
```

<a id="comparacion-calidad"></a>
### Comparación: cómo saber si una suite es buena

| | ✔ Cobertura de código | ✔ Mutation testing | ○ Property-based testing |
|--|--|--|--|
| **Cómo funciona** | Marca qué líneas y ramas se ejecutan durante las pruebas | Siembra un error por copia del código y mira si alguna prueba falla | Genera muchas entradas y comprueba una propiedad general |
| **Cuándo se elige** | Siempre: es barata y encuentra código que nadie prueba | En el código con reglas de negocio, para medir la fuerza de las aserciones | Funciones puras con propiedades claras (ordenar, serializar) |
| **Qué cuesta** | Casi nada | Una ejecución de la suite por mutante | Pensar las propiedades; fallos difíciles de leer sin *shrinking* |
| **En el curso** | 100 % con aserciones débiles (M05-02) | 36,59 % → 95,12 % (M05-02) | — |

<a id="comparacion-generacion"></a>
### Comparación: generar pruebas

| | ✔ GitHub Copilot Chat | ✔ `playwright codegen` |
|--|--|--|
| **Cómo funciona** | Un modelo de lenguaje lee el código y el contexto que le das y escribe pruebas | Graba tus acciones en el navegador y las escribe como código |
| **Cuándo se elige** | Pruebas unitarias o de API a partir del código; diagnósticos de fallos | Esbozar un flujo E2E y descubrir localizadores |
| **Qué cuesta** | Revisar: omite límites y errores, propone cambiar lo esperado | Limpiar: nombres, clics sobrantes, URLs absolutas, solo el camino feliz |
| **En el curso** | 8 pruebas en verde con 8 mutantes vivos (M05-05) | Una prueba `test` que pasa; revisada a dos (M05-05) |

---

## 2. Los conceptos

<a id="flaky-test"></a>
### Flaky test (prueba inestable)

**Qué es:** una prueba que unas veces pasa y otras falla sin que cambie el código que prueba.

**En el curso:** `pedidos.spec.js` (M05-00) falla en 9 o 13 de 20 repeticiones; en M05-01, tres causas
distintas: espera fija, animación y datos compartidos.

**Dónde se rompe:** con reintentos sale verde y marcada `flaky`, y el equipo deja de mirarla (reto de M05-01).

**Lo usas en:** <!--usos:flaky-test-->[03-lab](../M02-funcionales-e2e/03-lab-sincronizacion.md) · [M05](../M05-buenas-practicas-ia/README.md) · [00-por](../M05-buenas-practicas-ia/00-por-que-falla-a-veces.md) · [01-lab](../M05-buenas-practicas-ia/01-lab-estabilizar-flaky-tests.md) · [03-lab](../M05-buenas-practicas-ia/03-lab-optimizar-tiempos.md)<!--/usos-->

Relacionado: [`--repeat-each`](#repeat-each) · [aislamiento de datos](#aislamiento-de-datos)

<a id="repeat-each"></a>
### `--repeat-each`

**Qué es:** opción de Playwright Test que ejecuta cada prueba N veces en la misma ejecución, para medir su
tasa de fallo.

**En el curso:** `npx playwright test --repeat-each=20 --reporter=dot`; el reporter `dot` pinta `·`, `F`,
`×` y `±` por intento. Combinada con `--workers=1` y `--workers=4` separa los fallos de tiempo de los de
datos compartidos (M05-01).

**Dónde se rompe:** en una máquina rápida y descargada, una prueba inestable puede pasar las N veces; en
CI, con menos CPU, no.

**Lo usas en:** <!--usos:repeat-each-->—<!--/usos-->

<a id="fail-on-flaky-tests"></a>
### `failOnFlakyTests`

**Qué es:** opción de configuración de Playwright (`--fail-on-flaky-tests` en la línea de órdenes) que
hace que la ejecución termine con error si alguna prueba solo ha pasado tras un reintento.

**En el curso:** con `--retries=3`, el catálogo de M05-01 sale con código 0 y `2 flaky`; con la opción,
código 1.

**Lo usas en:** <!--usos:fail-on-flaky-tests-->—<!--/usos-->

<a id="reduced-motion"></a>
### `reducedMotion`

**Qué es:** opción de contexto del navegador que emula la preferencia del sistema «reducir movimiento»
(`prefers-reduced-motion`). Las aplicaciones que la respetan desactivan sus animaciones.

**En el curso:** `use: { reducedMotion: 'reduce' }` en M05-01: la prueba del total pasa de 949 ms a 179 ms.

**Dónde se rompe:** si la aplicación no consulta `prefers-reduced-motion`, la opción no cambia nada; la
estabilidad la da la aserción sobre el estado final.

**Lo usas en:** <!--usos:reduced-motion-->—<!--/usos-->

<a id="aislamiento-de-datos"></a>
### Aislamiento de datos

**Qué es:** que cada prueba cree y use sus propios datos, sin leer ni modificar los de otras, para poder
ejecutarse en cualquier orden y en paralelo.

**En el curso:** una lista de favoritos por prueba con `?lista=${randomUUID()}` (M05-01); títulos de
notas con una etiqueta aleatoria (M05-03).

**Dónde se rompe:** vaciar unos datos compartidos en un `beforeEach` funciona en serie (30 de 30) y falla
en paralelo (6 fallos con 4 workers, M05-01).

**Lo usas en:** <!--usos:aislamiento-de-datos-->[M05](../M05-buenas-practicas-ia/README.md) · [01-lab](../M05-buenas-practicas-ia/01-lab-estabilizar-flaky-tests.md) · [03-lab](../M05-buenas-practicas-ia/03-lab-optimizar-tiempos.md)<!--/usos-->

<a id="cobertura-de-codigo"></a>
### Cobertura de código

**Qué es:** el porcentaje de sentencias, ramas, funciones y líneas del código que se ejecutan durante las
pruebas.

**En el curso:** `npx vitest run --coverage` con el proveedor v8 (`@vitest/coverage-v8`), limitado a `src/`.

**Cómo funciona por dentro:** v8 cuenta cuántas veces se ejecuta cada bloque. En M05-02, `envio.js` y
`pedido.js` suman 16 sentencias y 14 ramas; las seis pruebas débiles y las tres de getters pasan por todas:
16/16 y 14/14, 100 %.

**Dónde se rompe:** no mira las aserciones: `toBeDefined()` cubre lo mismo que `toBe(4)`.

**Lo usas en:** <!--usos:cobertura-de-codigo-->[M05](../M05-buenas-practicas-ia/README.md) · [02-lab](../M05-buenas-practicas-ia/02-lab-cobertura-util.md)<!--/usos-->

Relacionado: [mutation score](#mutation-score) · [cobertura excesiva](#cobertura-excesiva)

<a id="cobertura-excesiva"></a>
### Cobertura excesiva

**Qué es:** pruebas escritas para subir el porcentaje de cobertura sobre código sin lógica (getters,
constructores, configuración), que cuestan mantenimiento y no pueden detectar ningún error de negocio.

**En el curso:** las tres pruebas de `Pedido` en M05-02 sostienen 37,5 puntos de cobertura (100 % → 62,5 %
al quitarlas) y el mutation score de `envio.js` no se mueve.

**Lo usas en:** <!--usos:cobertura-excesiva-->[02-lab](../M05-buenas-practicas-ia/02-lab-cobertura-util.md)<!--/usos-->

<a id="mutation-testing"></a>
### Mutation testing (Stryker)

**Qué es:** técnica que introduce errores pequeños y realistas en el código (**mutantes**) y ejecuta las
pruebas contra cada uno. Si alguna falla, el mutante está **muerto**; si todas pasan, **sobrevive**: esa
línea podría estar mal sin que nadie se entere.

**En el curso:** `npx stryker run` con `stryker.config.json` (`testRunner: "vitest"`,
`coverageAnalysis: "perTest"`). Mutantes típicos: `>` → `>=`, `*=` → `/=`, `if (urgente)` → `if (false)`.

**Lo usas en:** <!--usos:mutation-testing-->[M05](../M05-buenas-practicas-ia/README.md) · [02-lab](../M05-buenas-practicas-ia/02-lab-cobertura-util.md) · [05-lab](../M05-buenas-practicas-ia/05-lab-generar-pruebas-con-copilot.md)<!--/usos-->

Relacionado: [mutation score](#mutation-score) · [mutante equivalente](#mutante-equivalente)

<a id="mutation-score"></a>
### Mutation score

**Qué es:** el porcentaje de mutantes muertos sobre los mutantes evaluados.

**Cómo funciona por dentro:** en M05-02, Stryker genera 41 mutantes; las pruebas débiles matan 15:
15 / 41 = 36,59 %. Con valores exactos, 37 / 41 = 90,24 %. Con los límites, 39 / 41 = 95,12 %.

**Dónde se rompe:** perseguir el 100 % lleva a escribir pruebas absurdas para mutantes equivalentes.

**Lo usas en:** <!--usos:mutation-score-->[M05](../M05-buenas-practicas-ia/README.md) · [02-lab](../M05-buenas-practicas-ia/02-lab-cobertura-util.md) · [05-lab](../M05-buenas-practicas-ia/05-lab-generar-pruebas-con-copilot.md)<!--/usos-->

<a id="mutante-equivalente"></a>
### Mutante equivalente

**Qué es:** un mutante que cambia el código pero no su comportamiento para ninguna entrada; ninguna
prueba puede matarlo.

**En el curso:** `peso > 5` → `peso >= 5` en `envio.js`: con 5 kg el recargo es `(5 - 5) × 0,5 = 0` en
los dos casos. Se marca con `// Stryker disable next-line EqualityOperator: <motivo>` (reto de M05-02).

**Lo usas en:** <!--usos:mutante-equivalente-->[M05](../M05-buenas-practicas-ia/README.md) · [02-lab](../M05-buenas-practicas-ia/02-lab-cobertura-util.md)<!--/usos-->

<a id="paralelismo"></a>
### Paralelismo (`workers`, `fullyParallel`)

**Qué es:** ejecutar varias pruebas a la vez en procesos distintos (**workers**). Por defecto, Playwright
reparte **ficheros**; con `fullyParallel: true`, también las pruebas de un mismo fichero.

**En el curso:** en M05-03, `--workers=4` sin `fullyParallel` usa 2 workers (hay 2 ficheros) y baja de
17,5 s a 16,0 s; con `fullyParallel`, a 5,5 s.

**Dónde se rompe:** con datos compartidos, el paralelismo convierte pruebas correctas en inestables (M05-01).

**Lo usas en:** <!--usos:paralelismo-->[05-lab](../M01-introduccion-automatizacion/05-lab-piramide-de-pruebas.md) · [06-lab](../M01-introduccion-automatizacion/06-lab-pruebas-independientes.md) · [00-pla](../M02-funcionales-e2e/00-playwright-y-cypress.md) · [M05](../M05-buenas-practicas-ia/README.md) · [01-lab](../M05-buenas-practicas-ia/01-lab-estabilizar-flaky-tests.md) · [03-lab](../M05-buenas-practicas-ia/03-lab-optimizar-tiempos.md)<!--/usos-->

<a id="storage-state"></a>
### Sesión reutilizada (`storageState`)

**Qué es:** el estado del navegador (cookies y `localStorage`) guardado en un fichero para que otras
pruebas empiecen con la sesión ya iniciada. En Playwright se genera en un **proyecto `setup`** del que
dependen los demás (`dependencies: ['setup']`).

**En el curso:** `tests/auth.setup.js` inicia sesión una vez y guarda `.auth/ana.json`; el proyecto
`chromium` lo carga con `use: { storageState: '.auth/ana.json' }` (M05-03).

**Dónde se rompe:** en las pruebas cuyo objeto es el login; «sin sesión, lleva al login» falla con la
sesión cargada (reto de M05-03). Se vacía con `test.use({ storageState: { cookies: [], origins: [] } })`.

**Lo usas en:** <!--usos:storage-state-->[08-lab](../M02-funcionales-e2e/08-lab-suite-e2e-de-un-flujo.md) · [M05](../M05-buenas-practicas-ia/README.md) · [03-lab](../M05-buenas-practicas-ia/03-lab-optimizar-tiempos.md)<!--/usos-->

<a id="preparacion-por-api"></a>
### Preparación por API

**Qué es:** crear los datos que una prueba necesita con peticiones a la API, en lugar de hacerlo por la
interfaz, cuando crearlos no es lo que se prueba.

**En el curso:** `page.request.post('/api/notas', …)` con las cookies del navegador: preparar tres notas
pasa de ~1 s a ~0,3 s (M05-03).

**Lo usas en:** <!--usos:preparacion-por-api-->[M05](../M05-buenas-practicas-ia/README.md) · [03-lab](../M05-buenas-practicas-ia/03-lab-optimizar-tiempos.md)<!--/usos-->

<a id="prueba-parametrizada"></a>
### Prueba parametrizada

**Qué es:** una prueba escrita una vez que se ejecuta con cada fila de una tabla de datos, con un nombre
generado a partir de la fila.

**En el curso:** `test.each(casos)('$caso → $precio €', …)` en Vitest (M05-04); en Playwright, un
`for (const caso of casos) test(...)`.

**Dónde se rompe:** el error apunta a la línea común, no a la fila: sin un nombre descriptivo no se sabe
qué caso falla.

**Lo usas en:** <!--usos:prueba-parametrizada-->[M05](../M05-buenas-practicas-ia/README.md) · [04-lab](../M05-buenas-practicas-ia/04-lab-refactorizar-escenarios.md)<!--/usos-->

<a id="dry-damp"></a>
### DRY y DAMP

**Qué es:** dos criterios que tiran en direcciones distintas. DRY («no te repitas») elimina duplicación;
DAMP («frases descriptivas y significativas») pide que cada prueba se entienda sola. En pruebas, se
quita la repetición mecánica sin esconder el caso detrás de abstracciones.

**En el curso:** 9 pruebas copiadas (76 líneas, una repetida) → tabla de 10 casos con nombre (23 líneas)
en M05-04.

**Lo usas en:** <!--usos:dry-damp-->[04-lab](../M05-buenas-practicas-ia/04-lab-refactorizar-escenarios.md)<!--/usos-->

<a id="github-copilot"></a>
### GitHub Copilot (Chat)

**Qué es:** el asistente de IA de GitHub integrado en VS Code. La vista de Chat tiene modos (**Ask**:
responde; **Edit**: propone cambios en ficheros; **Agent**: además ejecuta comandos), comandos como
`/tests`, `/fix` y `/explain`, y contexto que se adjunta con **Add Context…** o `#file:`.

**En el curso:** generar las pruebas de `validarContrasena` (M05-05) y diagnosticar pruebas rotas con el
`error-context.md` de Playwright (M05-06).

**Dónde se rompe:** omite límites y reglas, debilita aserciones al «arreglar» y propone cambiar el valor
esperado sin saber si el requisito cambió.

**Lo usas en:** <!--usos:github-copilot-->[M05](../M05-buenas-practicas-ia/README.md) · [05-lab](../M05-buenas-practicas-ia/05-lab-generar-pruebas-con-copilot.md) · [06-lab](../M05-buenas-practicas-ia/06-lab-depurar-con-ia.md)<!--/usos-->

Relacionado: [generación asistida](#generacion-asistida) · [depuración asistida](#depuracion-asistida)

<a id="generacion-asistida"></a>
### Generación asistida de pruebas

**Qué es:** escribir pruebas con ayuda de una herramienta que produce el código: un asistente de IA a
partir del código fuente o un grabador a partir de lo que haces en la página.

**En el curso:** el ciclo **pedir con contexto → ejecutar → revisar con criterios y mutantes**: 8 pruebas
generadas en verde con un 83,33 % de mutation score; completadas, 98,15 % (M05-05).

**Lo usas en:** <!--usos:generacion-asistida-->[05-lab](../M05-buenas-practicas-ia/05-lab-generar-pruebas-con-copilot.md)<!--/usos-->

<a id="codegen"></a>
### `playwright codegen`

**Qué es:** el grabador de Playwright: abre un navegador y el **Playwright Inspector** y escribe una
prueba con localizadores por rol a partir de tus clics y textos.

**En el curso:** `npx playwright codegen http://localhost:3505/registro.html` en el escritorio noVNC
(puerto 6080). La grabación se llama `test`, lleva clics sobrantes y una URL absoluta (M05-05).

**Lo usas en:** <!--usos:codegen-->[M02](../M02-funcionales-e2e/README.md) · [05-lab](../M05-buenas-practicas-ia/05-lab-generar-pruebas-con-copilot.md)<!--/usos-->

<a id="depuracion-asistida"></a>
### Depuración asistida por IA

**Qué es:** pedir a un asistente la causa y el arreglo de una prueba que falla, dándole el error, el
estado de la página y el código.

**En el curso:** `/fix` con `#file:test-results/…/error-context.md`, el fichero que Playwright escribe por
cada fallo con instrucciones para un asistente, el snapshot de accesibilidad y la línea que falló (M05-06).

**Dónde se rompe:** el asistente sabe qué no coincide, no quién tiene razón; un arreglo que cambia
`toHaveText('129,80 €')` por `not.toHaveText('0,00 €')` pasa con un total mal calculado (reto de M05-06).

**Lo usas en:** <!--usos:depuracion-asistida-->[06-lab](../M05-buenas-practicas-ia/06-lab-depurar-con-ia.md)<!--/usos-->

<a id="refactorizacion-asistida"></a>
### Refactorización asistida (a Page Object)

**Qué es:** pedir al asistente que reorganice el código de las pruebas sin cambiar lo que comprueban; por
ejemplo, llevar los localizadores y las acciones de una página a una clase (Page Object).

**En el curso:** Copilot en modo **Edit** crea `tests/paginas/producto.js` (`PaginaProducto`); la suite
sigue con 3 pruebas en verde y vuelve a fallar ante un error de cálculo (M05-06).

**Lo usas en:** <!--usos:refactorizacion-asistida-->—<!--/usos-->
