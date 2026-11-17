# Glosario 1 — Fundamentos de la automatización de pruebas

[Índice del glosario](README.md) · [Siguiente hoja →](02-e2e.md)

Los conceptos de base del curso: tipos y niveles de prueba, cómo se reparten (pirámide), cómo se
escribe una prueba y qué la hace fiable. Se presentan en el módulo M01 y se usan en todos los demás.

---

<a id="mapa"></a>
## 1. El mapa de familias

✔ = lo usas en el curso · ○ = hermano que no usamos, para que sepas que existe y cuándo se elige · ✘ = anti-patrón que se ve en un lab.

```text
Niveles de prueba (cuánto sistema pone en marcha)
├── ✔ Prueba unitaria ............... M01-03, M01-05, M01-06
├── ✔ Prueba de integración ......... M01-04
├── ✔ Prueba de API ................. M01-02, M01-04, M01-05, M03
├── ✔ Prueba end-to-end (E2E) ....... M01-02, M01-05, M02
└── ○ Prueba de contrato entre servicios (Pact: cuando consumidor y proveedor los mantienen equipos distintos)

Formas de repartir la suite
├── ✔ Pirámide de pruebas ........... M01-05
├── ○ Trofeo de pruebas (peso en integración; aplicaciones web con poca lógica propia)
└── ✘ Cono de helado (anti-patrón) .. M01-05

Ejecutores de pruebas unitarias en JavaScript
├── ✔ Vitest ........................ M01-01, M01-03 a M01-06, M05
├── ○ Jest (el más extendido en proyectos existentes)
├── ○ Mocha + Chai (proyectos antiguos; aserciones aparte)
└── ○ node:test (integrado en Node.js, sin dependencias)
```

<a id="comparacion-forma-suite"></a>
### Comparación: qué forma darle a la suite

| | ✔ Pirámide | ○ Trofeo | ✘ Cono de helado |
|--|--|--|--|
| **Cómo es** | Muchas unitarias, algunas de integración/API, pocas E2E | Peso en integración; análisis estático en la base | Casi todo E2E o manual |
| **Cuándo se elige** | Lógica de negocio propia (cálculos, reglas) | Aplicaciones web que sobre todo encajan piezas | Nunca a propósito: aparece al probar todo «como un usuario» |
| **Qué cuesta** | Escribir y mantener muchas pruebas pequeñas | Pruebas de integración algo más lentas | Suite lenta e inestable; fallos que esperan timeouts |
| **En el curso** | 9 unitarias + 2 API + 3 E2E; error de tarifa avisado en 170 ms | — | 8 E2E; el mismo error avisado en 14.4 s |

<a id="comparacion-ejecutores"></a>
### Comparación: qué ejecutor de pruebas unitarias

| | ✔ Vitest | ○ Jest | ○ node:test |
|--|--|--|--|
| **Cómo funciona** | Usa la configuración de Vite; ESM nativo; API compatible con Jest | Transforma el código con Babel; API `describe`/`it`/`expect` | Incluido en Node.js; `node --test` |
| **Cuándo se elige** | Proyectos nuevos, ESM, frontends con Vite | Proyectos que ya lo usan | Librerías pequeñas sin dependencias |
| **Qué cuesta** | Una dependencia de desarrollo | Configuración extra para ESM | Menos utilidades (mocks, cobertura, informes) |
| **En el curso** | 10 pruebas de descuentos en unos 150 ms | — | — |

---

## 2. Los conceptos

<a id="prueba-automatizada"></a>
### Prueba automatizada

**Qué es:** un programa que ejecuta una parte del sistema con datos conocidos y compara lo que
obtiene con lo esperado. Pasa o falla sin que nadie mire la pantalla.

**En el curso:** cada fichero `*.test.js` (Vitest) o `*.spec.js` (Playwright) de `ejercicios/`.

**Dónde se rompe:** cuando no tiene aserción o comprueba algo irrelevante: siempre pasa y no
protege de nada (M01-01, la página sin título que la suite de humo no veía).

**Lo usas en:** <!--usos:prueba-automatizada-->[M01](../M01-introduccion-automatizacion/README.md) · [00-tes](../M01-introduccion-automatizacion/00-testing-en-agile-y-devops.md)<!--/usos-->

Relacionado: [aserción](#asercion), [anatomía AAA](#preparar-actuar-comprobar)

<a id="asercion"></a>
### Aserción

**Qué es:** la comprobación de una prueba: compara un valor obtenido con el esperado y hace fallar
la prueba si no coinciden.

**En el curso:** `expect(calcularDescuento(100)).toBe(10)` en Vitest;
`await expect(page).toHaveTitle('Entorno de pruebas')` en Playwright, que además reintenta hasta 5 s.

**Dónde se rompe:** una aserción demasiado débil (`toBeDefined()` donde importa el valor) deja pasar
errores; una aserción de interfaz sin reintento falla si la página aún no ha terminado de pintar.

**Lo usas en:** <!--usos:asercion-->[00-tes](../M01-introduccion-automatizacion/00-testing-en-agile-y-devops.md) · [01-lab](../M01-introduccion-automatizacion/01-lab-preparar-el-entorno.md) · [02-una](../M01-introduccion-automatizacion/02-una-funcionalidad-tres-niveles.md) · [03-lab](../M01-introduccion-automatizacion/03-lab-primera-prueba-unitaria.md) · [05-lab](../M01-introduccion-automatizacion/05-lab-piramide-de-pruebas.md) · [M02](../M02-funcionales-e2e/README.md) · [00-pla](../M02-funcionales-e2e/00-playwright-y-cypress.md) · [01-lab](../M02-funcionales-e2e/01-lab-navegacion-web.md) · [02-lab](../M02-funcionales-e2e/02-lab-selectores-estables.md) · [03-lab](../M02-funcionales-e2e/03-lab-sincronizacion.md) · [04-lab](../M02-funcionales-e2e/04-lab-formularios-y-validaciones.md) · [05-lab](../M02-funcionales-e2e/05-lab-evidencias.md) · [06-lab](../M02-funcionales-e2e/06-lab-errores-y-reintentos.md) · [07-lab](../M02-funcionales-e2e/07-lab-page-objects.md) · [08-lab](../M02-funcionales-e2e/08-lab-suite-e2e-de-un-flujo.md) · [09-lab](../M02-funcionales-e2e/09-lab-flujo-con-cypress.md) · [M03](../M03-testing-apis/README.md) · [00-ana](../M03-testing-apis/00-anatomia-de-una-prueba-api.md) · [01-lab](../M03-testing-apis/01-lab-validar-respuestas.md) · [03-lab](../M03-testing-apis/03-lab-coleccion-postman.md) · [04-lab](../M03-testing-apis/04-lab-newman-datos-y-entornos.md) · [03-lab](../M04-ci-cd-testing-continuo/03-lab-reportes-html-y-allure.md) · [M05](../M05-buenas-practicas-ia/README.md) · [01-lab](../M05-buenas-practicas-ia/01-lab-estabilizar-flaky-tests.md) · [02-lab](../M05-buenas-practicas-ia/02-lab-cobertura-util.md) · [04-lab](../M05-buenas-practicas-ia/04-lab-refactorizar-escenarios.md) · [05-lab](../M05-buenas-practicas-ia/05-lab-generar-pruebas-con-copilot.md) · [06-lab](../M05-buenas-practicas-ia/06-lab-depurar-con-ia.md)<!--/usos-->

Relacionado: [preparar, actuar, comprobar](#preparar-actuar-comprobar)

<a id="preparar-actuar-comprobar"></a>
### Preparar, actuar, comprobar (AAA)

**Qué es:** la estructura de toda prueba, en inglés *Arrange, Act, Assert*: preparar los datos y el
estado, ejecutar **una** acción y comprobar el resultado.

**En el curso:** `const importe = 75;` → `const descuento = calcularDescuento(importe);` →
`expect(descuento).toBe(5);` (M01-03).

**Dónde se rompe:** cuando la fase de preparar no existe porque la prueba confía en lo que dejó otra
(M01-06), o cuando una prueba actúa varias veces y ya no se sabe qué comprueba.

**Lo usas en:** <!--usos:preparar-actuar-comprobar-->[M01](../M01-introduccion-automatizacion/README.md) · [03-lab](../M01-introduccion-automatizacion/03-lab-primera-prueba-unitaria.md)<!--/usos-->

Relacionado: [independencia entre pruebas](#independencia-entre-pruebas)

<a id="prueba-unitaria"></a>
### Prueba unitaria

**Qué es:** la que comprueba una función o clase aislada, en memoria, sin servidor, red ni navegador.

**En el curso:** las pruebas de `calcularDescuento` (M01-03), `calcularEnvio` (M01-05) y del carrito
(M01-06), con Vitest; tardan 0–2 ms cada una.

**Dónde se rompe:** si solo cubre el camino feliz (el error de `>` por `>=` pasó tres pruebas en
verde en M01-03) o si sustituye las demás piezas por mocks que no se parecen a ellas (M01-04).

**Lo usas en:** <!--usos:prueba-unitaria-->[M01](../M01-introduccion-automatizacion/README.md) · [00-tes](../M01-introduccion-automatizacion/00-testing-en-agile-y-devops.md) · [01-lab](../M01-introduccion-automatizacion/01-lab-preparar-el-entorno.md) · [03-lab](../M01-introduccion-automatizacion/03-lab-primera-prueba-unitaria.md) · [04-lab](../M01-introduccion-automatizacion/04-lab-prueba-de-integracion.md) · [05-lab](../M01-introduccion-automatizacion/05-lab-piramide-de-pruebas.md) · [04-lab](../M02-funcionales-e2e/04-lab-formularios-y-validaciones.md) · [M04](../M04-ci-cd-testing-continuo/README.md) · [00-un-](../M04-ci-cd-testing-continuo/00-un-pipeline-de-pruebas.md) · [01-lab](../M04-ci-cd-testing-continuo/01-lab-primer-workflow.md) · [02-lab](../M04-ci-cd-testing-continuo/02-lab-e2e-en-el-pipeline.md)<!--/usos-->

Relacionado: [caso límite](#caso-limite), [mock](#mock)

<a id="prueba-de-integracion"></a>
### Prueba de integración

**Qué es:** la que junta varias piezas reales y comprueba que colaboran bien, normalmente por su
interfaz externa.

**En el curso:** en M01-04, el servidor `node:http`, las rutas y el almacén en memoria arrancan
dentro de la prueba (puerto 0) y se prueban con `fetch`.

**Dónde se rompe:** con un puerto fijo ocupado (`EADDRINUSE`) o cuando las pruebas comparten datos
en el almacén y suponen ids concretos.

**Lo usas en:** <!--usos:prueba-de-integracion-->[00-tes](../M01-introduccion-automatizacion/00-testing-en-agile-y-devops.md) · [04-lab](../M01-introduccion-automatizacion/04-lab-prueba-de-integracion.md)<!--/usos-->

Relacionado: [prueba de API](#prueba-de-api), [mock](#mock)

<a id="prueba-de-api"></a>
### Prueba de API

**Qué es:** la que comprueba un endpoint HTTP como lo haría un cliente: método, URL, cuerpo,
estado, cabeceras y cuerpo de la respuesta.

**En el curso:** `request.get('/api/envio?importe=30&zona=andorra')` con Playwright, que espera un
`400` y `{ error: 'Zona desconocida: andorra' }` (M01-05). En M03 se profundiza con contratos y Newman.

**Dónde se rompe:** cuando solo comprueba el estado (`200`) y no el cuerpo, o cuando depende de
datos que dejó otra prueba.

**Lo usas en:** <!--usos:prueba-de-api-->[04-lab](../M01-introduccion-automatizacion/04-lab-prueba-de-integracion.md) · [M03](../M03-testing-apis/README.md) · [00-ana](../M03-testing-apis/00-anatomia-de-una-prueba-api.md) · [01-lab](../M03-testing-apis/01-lab-validar-respuestas.md) · [03-lab](../M03-testing-apis/03-lab-coleccion-postman.md) · [07-lab](../M04-ci-cd-testing-continuo/07-lab-entornos-efimeros.md)<!--/usos-->

Relacionado: [prueba de integración](#prueba-de-integracion)

<a id="prueba-funcional"></a>
### Prueba funcional

**Qué es:** la que comprueba que una funcionalidad hace lo que dice su requisito, vista desde fuera.
Es un **propósito**, no un nivel: puede hacerse contra la API o contra la interfaz.

**En el curso:** «10 entradas tienen un 20 % de descuento» se comprueba como unitaria, API y E2E en
la demostración M01-02.

**Dónde se rompe:** cuando se confunde con E2E y todas las funcionalidades se prueban desde el
navegador (cono de helado).

**Lo usas en:** <!--usos:prueba-funcional-->[M01](../M01-introduccion-automatizacion/README.md) · [00-tes](../M01-introduccion-automatizacion/00-testing-en-agile-y-devops.md) · [M02](../M02-funcionales-e2e/README.md) · [04-lab](../M02-funcionales-e2e/04-lab-formularios-y-validaciones.md)<!--/usos-->

Relacionado: [prueba end-to-end](#prueba-end-to-end)

<a id="prueba-end-to-end"></a>
### Prueba end-to-end (E2E)

**Qué es:** la que recorre el sistema completo como un usuario: navegador, página, API y datos.

**En el curso:** Playwright abre la calculadora, rellena el importe, elige la zona, pulsa
**Calcular envío** y lee el resultado (M01-05); tarda 130–250 ms en verde y unos 5 s al fallar.

**Cómo funciona por dentro:** la aserción `toHaveText` reintenta durante el timeout (5000 ms) por
si la página aún no se ha actualizado. En M01-05 se ve en la traza: `13 × locator resolved to
<output …>12.95 €</output>` antes de rendirse.

**Dónde se rompe:** es la más lenta, la más sensible a cambios de interfaz y la que peor señala la
causa: su fallo habla de una pantalla, no de la función que lo provoca.

**Lo usas en:** <!--usos:prueba-end-to-end-->[M01](../M01-introduccion-automatizacion/README.md) · [00-tes](../M01-introduccion-automatizacion/00-testing-en-agile-y-devops.md) · [02-una](../M01-introduccion-automatizacion/02-una-funcionalidad-tres-niveles.md) · [M02](../M02-funcionales-e2e/README.md) · [01-lab](../M02-funcionales-e2e/01-lab-navegacion-web.md)<!--/usos-->

Relacionado: [pirámide de pruebas](#piramide-de-pruebas)

<a id="prueba-de-humo"></a>
### Prueba de humo

**Qué es:** la comprobación mínima que dice si el sistema arranca y merece la pena seguir probando.

**En el curso:** `ejercicios/M01-01-preparar-el-entorno/`: una unitaria y una de navegador que
deben pasar antes de empezar los labs.

**Dónde se rompe:** si es tan mínima que no mira lo importante (la página sin `<title>` seguía en verde).

**Lo usas en:** <!--usos:prueba-de-humo-->[M01](../M01-introduccion-automatizacion/README.md) · [01-lab](../M01-introduccion-automatizacion/01-lab-preparar-el-entorno.md) · [08-lab](../M02-funcionales-e2e/08-lab-suite-e2e-de-un-flujo.md)<!--/usos-->

Relacionado: [entorno reproducible](#entorno-reproducible)

<a id="piramide-de-pruebas"></a>
### Pirámide de pruebas

**Qué es:** el reparto recomendado de una suite: muchas unitarias, algunas de integración y API,
pocas E2E. Lo justifica el coste de cada nivel.

**En el curso:** M01-05 pasa de 8 E2E a 9 unitarias + 2 API + 3 E2E.

**Cómo funciona por dentro:** con un error en la tarifa de Canarias, el cono tarda 14.4 s en
avisar (dos E2E esperando 5 s cada una); la pirámide, 170 ms (dos unitarias con
`expected 12.95 to be 14.95`).

**Dónde se rompe:** cuando se interpreta como «menos E2E» sin bajar las comprobaciones a otro
nivel: se pierde cobertura en lugar de ganar velocidad.

**Lo usas en:** <!--usos:piramide-de-pruebas-->[M01](../M01-introduccion-automatizacion/README.md) · [00-tes](../M01-introduccion-automatizacion/00-testing-en-agile-y-devops.md) · [05-lab](../M01-introduccion-automatizacion/05-lab-piramide-de-pruebas.md) · [M02](../M02-funcionales-e2e/README.md)<!--/usos-->

Relacionado: [cono de helado](#cono-de-helado)

<a id="cono-de-helado"></a>
### Cono de helado

**Qué es:** el anti-patrón contrario a la pirámide: casi todas las comprobaciones en E2E (o manuales)
y pocas unitarias.

**En el curso:** la suite de partida de M01-05, ocho E2E para una función de diez líneas.

**Dónde se rompe:** suite lenta, fallos que esperan timeouts y reglas que cambian obligan a
reescribir pruebas de interfaz (la regla nueva de Canarias rompió una E2E en 5.2 s).

**Lo usas en:** <!--usos:cono-de-helado-->[M01](../M01-introduccion-automatizacion/README.md) · [00-tes](../M01-introduccion-automatizacion/00-testing-en-agile-y-devops.md) · [05-lab](../M01-introduccion-automatizacion/05-lab-piramide-de-pruebas.md)<!--/usos-->

Relacionado: [pirámide de pruebas](#piramide-de-pruebas)

<a id="shift-left"></a>
### Shift-left

**Qué es:** mover las pruebas al principio del desarrollo: probar antes y en el nivel más bajo
posible, en lugar de en una fase al final.

**En el curso:** escribir la prueba del tramo del 15 % antes de cambiar la función (reto de M01-03)
y comprobar las tarifas con unitarias en lugar de con el navegador (M01-05).

**Dónde se rompe:** cuando las pruebas se escriben después «para tener cobertura» y nunca se las ve
fallar: no se sabe si comprueban algo.

**Lo usas en:** <!--usos:shift-left-->[M01](../M01-introduccion-automatizacion/README.md) · [00-tes](../M01-introduccion-automatizacion/00-testing-en-agile-y-devops.md)<!--/usos-->

Relacionado: [integración continua](#integracion-continua)

<a id="definition-of-done"></a>
### Definition of Done

**Qué es:** la lista de condiciones que el equipo exige para dar una historia de usuario por
terminada; en equipos maduros incluye pruebas automatizadas en verde en CI.

**En el curso:** se presenta en la teoría de M01 y se aplica en M04 con una puerta de calidad que
bloquea la fusión si las pruebas fallan.

**Dónde se rompe:** cuando dice «probado» sin decir dónde ni cómo, y cada persona lo interpreta a su manera.

**Lo usas en:** <!--usos:definition-of-done-->[M01](../M01-introduccion-automatizacion/README.md) · [00-tes](../M01-introduccion-automatizacion/00-testing-en-agile-y-devops.md)<!--/usos-->

Relacionado: [integración continua](#integracion-continua)

<a id="integracion-continua"></a>
### Integración continua (CI)

**Qué es:** la práctica de integrar los cambios en la rama principal a menudo, con un pipeline que
construye y ejecuta las pruebas en cada push o pull request.

**En el curso:** GitHub Actions en el módulo M04; en M01, la idea de que la suite tiene que ser
rápida y reproducible para poder ejecutarse ahí.

**Dónde se rompe:** cuando la suite es tan lenta o inestable que se ignoran sus fallos.

**Lo usas en:** <!--usos:integracion-continua-->[M01](../M01-introduccion-automatizacion/README.md) · [00-tes](../M01-introduccion-automatizacion/00-testing-en-agile-y-devops.md) · [M04](../M04-ci-cd-testing-continuo/README.md) · [00-un-](../M04-ci-cd-testing-continuo/00-un-pipeline-de-pruebas.md) · [01-lab](../M04-ci-cd-testing-continuo/01-lab-primer-workflow.md) · [00-por](../M05-buenas-practicas-ia/00-por-que-falla-a-veces.md)<!--/usos-->

Relacionado: [shift-left](#shift-left)

<a id="caso-limite"></a>
### Caso límite

**Qué es:** el valor exacto donde una regla cambia de comportamiento (un umbral, el 0, el máximo
permitido) y sus vecinos inmediatos.

**En el curso:** 49,99 / 50 / 99,99 / 100 € en los descuentos de M01-03; 199,99 / 200 € en el reto;
80 / 81 caracteres en el título de una tarea (M01-04).

**Dónde se rompe:** un `>` donde la regla dice «desde» (`>=`): 100 € justos devolvían un 5 % en
lugar de un 10 % y solo la prueba del límite lo vio.

**Lo usas en:** <!--usos:caso-limite-->[M01](../M01-introduccion-automatizacion/README.md) · [00-tes](../M01-introduccion-automatizacion/00-testing-en-agile-y-devops.md) · [03-lab](../M01-introduccion-automatizacion/03-lab-primera-prueba-unitaria.md)<!--/usos-->

Relacionado: [prueba unitaria](#prueba-unitaria)

<a id="mock"></a>
### Mock (doble de prueba)

**Qué es:** un objeto falso que sustituye a una pieza real en una prueba y responde lo que la
prueba le indica; también registra cómo se le llamó.

**En el curso:** `{ guardar: vi.fn(() => ({ id: 1, … })) }` como almacén falso en M01-04.

**Dónde se rompe:** cuando no se parece a la pieza real: el mock tenía `guardar` y el almacén real
`agregar`; la unitaria pasaba y la API respondía `500`.

**Lo usas en:** <!--usos:mock-->[M01](../M01-introduccion-automatizacion/README.md) · [00-tes](../M01-introduccion-automatizacion/00-testing-en-agile-y-devops.md) · [04-lab](../M01-introduccion-automatizacion/04-lab-prueba-de-integracion.md) · [M03](../M03-testing-apis/README.md) · [06-lab](../M03-testing-apis/06-lab-mock-desde-el-contrato.md) · [07-lab](../M03-testing-apis/07-lab-simular-fallos.md)<!--/usos-->

Relacionado: [prueba de integración](#prueba-de-integracion)

<a id="independencia-entre-pruebas"></a>
### Independencia entre pruebas

**Qué es:** que cada prueba prepare lo que necesita y su resultado no dependa de qué otras se
ejecutaron antes ni en qué orden.

**En el curso:** M01-06, con `beforeEach(() => { vaciar(); })` y datos propios en cada prueba;
comprobado con `-t` y `--sequence.shuffle --sequence.seed=N`.

**Dónde se rompe:** con **estado compartido** (una variable del módulo, una tabla común): la suite
del carrito pasaba en orden y fallaba en 5 de 8 órdenes barajados.

**Lo usas en:** <!--usos:independencia-entre-pruebas-->[06-lab](../M01-introduccion-automatizacion/06-lab-pruebas-independientes.md)<!--/usos-->

Relacionado: [estado compartido](#estado-compartido)

<a id="estado-compartido"></a>
### Estado compartido

**Qué es:** datos que sobreviven entre pruebas (variables globales, ficheros, filas de base de
datos, usuarios en un servidor) y que una prueba deja y otra da por hechos.

**En el curso:** la variable `lineas` de `src/carrito.js` en M01-06; el almacén común de
`beforeAll` en M01-04, que por eso obliga a no suponer ids.

**Dónde se rompe:** `-t 'calcula el total'` daba `expected +0 to be 55`; sin limpiar, las
pruebas acumulaban 130 € en lugar de 55 €.

**Lo usas en:** <!--usos:estado-compartido-->[M01](../M01-introduccion-automatizacion/README.md) · [00-tes](../M01-introduccion-automatizacion/00-testing-en-agile-y-devops.md) · [06-lab](../M01-introduccion-automatizacion/06-lab-pruebas-independientes.md) · [M02](../M02-funcionales-e2e/README.md)<!--/usos-->

Relacionado: [independencia entre pruebas](#independencia-entre-pruebas)

<a id="entorno-reproducible"></a>
### Entorno reproducible (devcontainer)

**Qué es:** un entorno descrito como código (imagen, versiones, herramientas) para que las pruebas
den el mismo resultado en cualquier máquina. Un **devcontainer** es ese entorno en un contenedor,
y GitHub Codespaces lo ejecuta en la nube.

**En el curso:** `.devcontainer/devcontainer.json` (Node 22, escritorio noVNC en el 6080) y
`package.json` con versiones exactas (Vitest 5.1.0, Playwright 1.65.1); se comprueba con
`npm run verificar`.

**Dónde se rompe:** cuando alguien instala otra versión a mano o una herramienta falta: línea
`FALTA` en `npm run verificar`.

**Lo usas en:** <!--usos:entorno-reproducible-->[M01](../M01-introduccion-automatizacion/README.md) · [00-tes](../M01-introduccion-automatizacion/00-testing-en-agile-y-devops.md) · [01-lab](../M01-introduccion-automatizacion/01-lab-preparar-el-entorno.md)<!--/usos-->

Relacionado: [prueba de humo](#prueba-de-humo)

<a id="vitest"></a>
### Vitest

**Qué es:** el ejecutor de pruebas unitarias y de integración del curso para JavaScript: encuentra
los ficheros `*.test.js`, los ejecuta y muestra el resultado.

**En el curso:** `npx vitest run` en cada ejercicio; `-t` para una prueba sola,
`--sequence.shuffle` para barajar y `it.each` para tablas de casos.

**Dónde se rompe:** `npx vitest` sin `run` se queda en modo vigilancia esperando cambios; un
fichero `*.spec.js` lo ignora Vitest y lo intenta ejecutar Playwright.

**Lo usas en:** <!--usos:vitest-->[M01](../M01-introduccion-automatizacion/README.md) · [00-tes](../M01-introduccion-automatizacion/00-testing-en-agile-y-devops.md) · [01-lab](../M01-introduccion-automatizacion/01-lab-preparar-el-entorno.md) · [02-una](../M01-introduccion-automatizacion/02-una-funcionalidad-tres-niveles.md) · [03-lab](../M01-introduccion-automatizacion/03-lab-primera-prueba-unitaria.md) · [04-lab](../M01-introduccion-automatizacion/04-lab-prueba-de-integracion.md) · [05-lab](../M01-introduccion-automatizacion/05-lab-piramide-de-pruebas.md) · [06-lab](../M01-introduccion-automatizacion/06-lab-pruebas-independientes.md) · [00-un-](../M04-ci-cd-testing-continuo/00-un-pipeline-de-pruebas.md) · [01-lab](../M04-ci-cd-testing-continuo/01-lab-primer-workflow.md) · [M05](../M05-buenas-practicas-ia/README.md) · [02-lab](../M05-buenas-practicas-ia/02-lab-cobertura-util.md) · [04-lab](../M05-buenas-practicas-ia/04-lab-refactorizar-escenarios.md) · [05-lab](../M05-buenas-practicas-ia/05-lab-generar-pruebas-con-copilot.md)<!--/usos-->

Relacionado: [prueba unitaria](#prueba-unitaria)
