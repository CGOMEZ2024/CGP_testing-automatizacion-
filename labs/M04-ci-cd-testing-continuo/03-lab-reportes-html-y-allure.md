# Lab — Reportes HTML y Allure

[← Página anterior](02-lab-e2e-en-el-pipeline.md) · [Siguiente página →](04-lab-publicar-artefactos.md)

Practicas el **reporting de pruebas**: convertir una ejecución en algo que otra persona pueda leer sin
repetirla. El ejercicio es una calculadora de propinas con cinco pruebas de [Playwright](../glosario/02-e2e.md#playwright): dos pasan, una
falla por un error de la aplicación, otra falla porque la prueba se ha quedado vieja y una está omitida.
De **la misma ejecución** sacas cuatro reportes —consola, HTML,
[JUnit](../glosario/04-ci-cd.md#junit-xml) y [Allure](../glosario/04-ci-cd.md#allure)— y comparas qué
cuenta cada uno.

### Objetivo

Comprender qué es el reporting de pruebas: cómo funciona, cómo debe ser, cómo se detectan sus debilidades
y cómo se mejora.

### Punto de partida

- Codespace del curso abierto. No hace falta GitHub Actions: todo el lab ocurre en tu terminal (lo que
  generas aquí es lo que el [pipeline](../glosario/04-ci-cd.md#pipeline) publica en el lab 04).
- Carpeta del ejercicio: [`ejercicios/M04-03-reportes-html-y-allure/`](../../ejercicios/M04-03-reportes-html-y-allure/README.md).
  La app escucha en el puerto **3403** y la arranca Playwright (`webServer`).
- Puertos que abrirás desde la pestaña **Ports** de VS Code: **9323** ([reporte HTML](../glosario/04-ci-cd.md#reporte-html)) y **3413** (Allure).
- Solución: [`solucion/playwright.config.js`](../../ejercicios/M04-03-reportes-html-y-allure/solucion/playwright.config.js)
  y [`solucion/allurerc.mjs`](../../ejercicios/M04-03-reportes-html-y-allure/solucion/allurerc.mjs).

```bash
# Entra en la carpeta del ejercicio
cd ejercicios/M04-03-reportes-html-y-allure
```

### Qué está pasando

Cuando las pruebas corren en CI, nadie mira la consola en directo. Lo que queda de la ejecución es su
**reporte**, y cada lector necesita uno distinto:

| Quién | Qué pregunta | Qué reporte |
|-------|--------------|-------------|
| Quien lanza la suite | ¿Ha pasado? ¿Qué ha fallado? | Consola (`list`) |
| Quien depura el fallo | ¿En qué paso, con qué pantalla, con qué error? | HTML de Playwright |
| El servidor de CI y otras herramientas | ¿Cuántas, cuáles, cuánto han tardado? | JUnit XML |
| El equipo, a lo largo del tiempo | ¿Es un error de la app o de la prueba? ¿Falla desde cuándo? | Allure |

En Playwright, cada reporte es un **reporter** y se pueden activar varios a la vez: todos escuchan la
misma ejecución.

| Pieza | Qué es |
|-------|--------|
| `tests/propinas.spec.js` | Cinco pruebas; dos usan `test.step` para nombrar sus pasos |
| `app/public/index.html` | La calculadora; trunca el total en lugar de redondearlo (el error de la app) |
| `playwright.config.js` | Solo `reporter: 'list'`; en el lab le añades los otros tres |

### 1 — La consola

Ejecutas la suite con la configuración de partida para ver qué cuenta el reporter de consola.

```bash
# La suite con el reporter de consola
npx playwright test
```

**Resultado esperado** (los tiempos cambian):

```text
Running 5 tests using 1 worker

  ✓  1 [chromium] › tests/propinas.spec.js:7:1 › muestra la calculadora (133ms)
  ✓  2 [chromium] › tests/propinas.spec.js:11:1 › calcula una propina del 10 % (144ms)
  ✘  3 [chromium] › tests/propinas.spec.js:26:1 › redondea el total a céntimos (3.1s)
  ✘  4 [chromium] › tests/propinas.spec.js:41:1 › calcula una propina del 20 % (3.1s)
  -  5 [chromium] › tests/propinas.spec.js:48:6 › divide el total entre comensales


  1) [chromium] › tests/propinas.spec.js:26:1 › redondea el total a céntimos › comprobar el total ──

    Error: expect(locator).toHaveText(expected) failed

    Locator:  locator('#total')
    Expected: "38.33"
    Received: "38.32"
    Timeout:  3000ms
    …

  2) [chromium] › tests/propinas.spec.js:41:1 › calcula una propina del 20 % ───────────────────────

    TimeoutError: locator.click: Timeout 3000ms exceeded.
    Call log:
      - waiting for getByRole('button', { name: 'Calcular propina' })
    …

  2 failed
    [chromium] › tests/propinas.spec.js:26:1 › redondea el total a céntimos ────────────────────────
    [chromium] › tests/propinas.spec.js:41:1 › calcula una propina del 20 % ────────────────────────
  1 skipped
  2 passed (7.6s)
```

Dos fallos con causas muy distintas: en el primero la app calcula mal (`38.32` en lugar de `38.33`); en el
segundo la prueba busca un botón `Calcular propina` que se llama `Calcular`. Para la consola los dos son
«failed». Y cuando cierras el terminal, no queda nada.

### 2 — Cuatro reporters en la misma ejecución

Sustituyes el `reporter` de la configuración por una lista. Cada entrada es un reporter con sus opciones;
las rutas van dentro de la carpeta del ejercicio.

```js
  reporter: [
    ['list'], // consola
    ['html', { outputFolder: './playwright-report', open: 'never' }], // web navegable
    ['junit', { outputFile: './reports/junit.xml' }], // XML que entienden los servidores de CI
    ['allure-playwright', { resultsDir: './allure-results' }], // datos en bruto para Allure
  ],
```

```bash
# La misma suite, ahora con cuatro reporters; después, qué ha dejado en la carpeta
npx playwright test
ls
```

**Resultado esperado** de `ls` (la salida de la consola es la misma del paso 1):

```text
README.md
allure-results
app
playwright-report
playwright.config.js
reports
solucion
test-results
tests
```

| Carpeta | Quién la escribe | Qué contiene |
|---------|------------------|--------------|
| `playwright-report/` | `html` | Una web autocontenida (`index.html`) |
| `reports/junit.xml` | `junit` | Un XML con una entrada por prueba |
| `allure-results/` | `allure-playwright` | Un JSON por prueba y sus adjuntos: datos, todavía no un reporte |
| `test-results/` | Playwright | Las evidencias de los fallos (`error-context.md`) |

### 3 — El reporte HTML

Abres el reporte de Playwright con su servidor, escuchando en todas las interfaces para que el Codespace
pueda reenviar el puerto.

```bash
# Sirve el reporte HTML en el puerto 9323 (Ctrl+C para pararlo)
npx playwright show-report playwright-report --host 0.0.0.0
```

**Resultado esperado:**

```text

  Serving HTML report at http://0.0.0.0:9323. Press Ctrl+C to quit.
```

En la pestaña **Ports**, abre el puerto **9323** (icono del globo). Arriba ves los filtros **All**,
**Passed**, **Failed**, **Flaky** y **Skipped** con sus contadores (4, 2, 2, 0, 1: **All** no cuenta la omitida). Pulsa
`redondea el total a céntimos`: la prueba muestra sus pasos con los nombres de `test.step`
(`rellenar la cuenta: 33,33 €`, `elegir el 15 % y calcular`, `comprobar el total`), el error con
`Expected`/`Received` señalado en el código y el adjunto `error-context` con el estado de la página.
Para el servidor con `Ctrl+C`.

### 4 — El JUnit XML

El JUnit no está pensado para personas, sino para otras herramientas (GitLab, Jenkins, Azure DevOps o una
acción de GitHub que lo convierte en anotaciones). Lo miras en crudo; con este filtro te quedas con las
etiquetas que importan:

```bash
# Solo las líneas de suite, caso y resultado del XML
grep -E '<testsuite |<testcase|<failure|<error|<skipped' reports/junit.xml
```

**Resultado esperado** (la fecha y los tiempos cambian):

```text
<testsuite name="propinas.spec.js" timestamp="2026-11-17T16:35:55.707Z" hostname="chromium" tests="5" failures="1" skipped="1" time="6.469" errors="1">
<testcase name="muestra la calculadora" classname="propinas.spec.js" time="0.101">
<testcase name="calcula una propina del 10 %" classname="propinas.spec.js" time="0.126">
<testcase name="redondea el total a céntimos" classname="propinas.spec.js" time="3.124">
<failure message="expect(locator).toHaveText(expected) failed" type="expect.toHaveText">
<testcase name="calcula una propina del 20 %" classname="propinas.spec.js" time="3.118">
<error message="locator.click: Timeout 3000ms exceeded." type="TimeoutError">
<testcase name="divide el total entre comensales" classname="propinas.spec.js">
<skipped>
```

JUnit sí distingue los dos fallos: una [aserción](../glosario/01-fundamentos.md#asercion) que no se cumple es `<failure>` y una excepción es
`<error>` (`failures="1"`, `errors="1"`). Esa distinción es la que leen los servidores de CI.

### 5 — El reporte de Allure

`allure-results/` son datos en bruto. Allure 3 (el paquete `allure` de npm, sin Java) los convierte en un
reporte y lo sirve:

```bash
# Genera el reporte desde los resultados (borra el anterior si existe) y sírvelo en el 3413
npx allure generate allure-results -o allure-report --clean
npx allure open --port 3413 allure-report
```

**Resultado esperado:** `generate` no escribe nada si va bien; `open` deja el servidor en marcha:

```text
Allure is running on http://localhost:3413. Press CTRL+C to stop.
```

Abre el puerto **3413** desde **Ports**. La portada dice **Report failed**, un **50 %** de éxito
(calculado sobre pasadas y fallidas, sin las omitidas) y las pestañas **Results 5** y **Categories 1**.
En **Categories** hay una sola: **Product errors 2**. Pulsa una prueba: tiene pestañas **Overview**,
**History**, **Retries** y **Attachments**, y en **Overview** el cuerpo de la prueba con sus pasos y la
duración de cada uno. Para el servidor con `Ctrl+C`.

### 6 — Qué cuenta cada uno

| | Consola | HTML | JUnit | Allure |
|--|--|--|--|--|
| **Para quién** | Quien lanza | Quien depura | Otras herramientas | El equipo |
| **Pasos (`test.step`)** | Solo el del fallo | ✔ | — | ✔ con duración |
| **Adjuntos y evidencias** | Ruta | ✔ | Ruta en `system-out` | ✔ |
| **Distingue fallo de la app y de la prueba** | — | — | `failure` / `error` | Con categorías propias (Mejora) |
| **Historial entre ejecuciones** | — | — | — | ✔ con `historyPath` (Mejora) |
| **Se publica como** | Log del [job](../glosario/04-ci-cd.md#job) | [Artefacto](../glosario/04-ci-cd.md#artefacto) (carpeta) | Artefacto o anotaciones | Artefacto o web estática |

## Comprueba tu entendimiento

**Un reporter más no cambia el resultado**
Compara la última línea de la consola del paso 1 y del paso 2.
→ Las dos dicen `2 failed`, `1 skipped`, `2 passed`: los reporters observan la ejecución, no la cambian.

**Allure sin generar no es un reporte**
Abre en el editor uno de los `*-result.json` de `allure-results/`.
→ Es un JSON con `name`, `status`, `steps` y `labels` de una prueba: los datos de los que Allure construye
la web.

## Experimenta

Predice: si vuelves a ejecutar la suite **sin** borrar `allure-results/` y generas el reporte, ¿cuántas
pruebas dirá Allure que hay, 5 o 10?

```bash
# Segunda ejecución sobre la misma carpeta de resultados, y cuántos resultados hay ahora
npx playwright test
ls allure-results/*-result.json | wc -l
npx allure generate allure-results -o allure-report --clean
npx allure open --port 3413 allure-report
```

**Resultado esperado** del recuento:

```text
10
```

`allure-playwright` no vacía la carpeta: añade. Allure agrupa por prueba, así que el total sigue siendo
**5**, pero ahora marca **Retried tests 5** y la duración del reporte abarca las dos ejecuciones. En CI no
pasa (cada job empieza con la carpeta vacía); en tu terminal, borra `allure-results/` antes de cada
ejecución que quieras reportar por separado.

## Mejora

La categoría por defecto (**Product errors**) mete en el mismo saco el error de la app y el de la prueba,
y el reporte no recuerda ejecuciones anteriores. Lo arreglas con un fichero de configuración de Allure en
la carpeta del ejercicio, `allurerc.mjs`:

```bash
# Copia la configuración de Allure de la solución a la carpeta del ejercicio
cp solucion/allurerc.mjs .
```

```js
import { defineConfig } from 'allure';

export default defineConfig({
  name: 'Calculadora de propinas',
  output: './allure-report',
  // Cada generación añade una línea a este fichero: así el reporte tiene historial entre ejecuciones
  historyPath: './allure-history.jsonl',
  // Clasifica los fallos por el mensaje de error, no solo por el estado
  categories: [
    { name: 'Resultado incorrecto (posible error de la app)', matchers: { message: /toHaveText/ } },
    { name: 'Elemento no encontrado (revisar la prueba)', matchers: { message: /Timeout \d+ms exceeded/ } },
  ],
});
```

Ejecuta dos veces, limpiando resultados entre medias y generando cada vez:

```bash
# Dos ejecuciones independientes, cada una con su generación de reporte
rm -rf allure-results
npx playwright test
npx allure generate allure-results -o allure-report --clean
rm -rf allure-results
npx playwright test
npx allure generate allure-results -o allure-report --clean
wc -l allure-history.jsonl
```

**Resultado esperado** del último comando:

```text
2 allure-history.jsonl
```

Abre el reporte (`npx allure open --port 3413 allure-report`). El título es **Calculadora de propinas**;
**Categories 2** separa **Resultado incorrecto (posible error de la app) 1** de **Elemento no encontrado
(revisar la prueba) 1**; y en `redondea el total a céntimos`, la pestaña **History** muestra la ejecución
anterior.

## Reto

### 1 — Demostrar que Allure aporta algo

**La situación:** un compañero dice que el reporte HTML de Playwright basta y que Allure sobra. Tú
sostienes que, cuando alguien arregla un error, Allure lo cuenta y el HTML no.

**Qué haces:** con `allurerc.mjs` ya en la carpeta y las dos ejecuciones de la Mejora hechas, arreglas el
error de la app: en `app/public/index.html` cambias `Math.floor((importe + propina) * 100) / 100` por
`Math.round((importe + propina) * 100) / 100`. Ejecutas otra vez (limpiando antes `allure-results/`),
generas y comparas los dos reportes.

**Pistas:** el desplegable **Transition** de la pestaña **Results** en Allure; la pestaña **History** de la
prueba arreglada; en el HTML, el filtro **Passed**.

**Lo que buscas:** en Allure, `redondea el total a céntimos` en verde con historial de dos ejecuciones
anteriores en rojo y marcada como arreglada; en el HTML, la misma prueba solo en verde.

<details>
<summary>Ver solución</summary>

```bash
# Tercera ejecución con la app arreglada y su reporte
rm -rf allure-results
npx playwright test
npx allure generate allure-results -o allure-report --clean
npx allure open --port 3413 allure-report
```

Consola (resumida; los tiempos cambian):

```text
  ✓  1 [chromium] › tests/propinas.spec.js:7:1 › muestra la calculadora (98ms)
  ✓  2 [chromium] › tests/propinas.spec.js:11:1 › calcula una propina del 10 % (128ms)
  ✓  3 [chromium] › tests/propinas.spec.js:26:1 › redondea el total a céntimos (126ms)
  ✘  4 [chromium] › tests/propinas.spec.js:41:1 › calcula una propina del 20 % (3.1s)
  -  5 [chromium] › tests/propinas.spec.js:48:6 › divide el total entre comensales
  1 failed
  1 skipped
  3 passed (4.1s)
```

En Allure, la portada pasa al **75 %**; el desplegable **Transition** ofrece **New**, **Fixed**,
**Regressed** y **Malfunctioned**, y con **Fixed** queda solo `redondea el total a céntimos`, con un icono
de arreglada en su fila; su pestaña **History 2** lista las dos ejecuciones anteriores. El reporte HTML
solo sabe de esta ejecución: la prueba está en verde y nada más.

En un equipo, esa transición es la que responde «¿esto falla desde cuándo?» y «¿lo arregló el último
cambio?». En CI, el historial se conserva guardando `allure-history.jsonl` entre ejecuciones (como
artefacto o en una rama). **La regla:** un reporte de una sola ejecución dice qué pasa; para saber qué ha
cambiado hace falta historial.

Deja la app como estaba (`Math.floor`) para repetir el lab.

</details>

## Errores frecuentes

| Síntoma | Causa probable | Cómo arreglarlo |
|---------|----------------|-----------------|
| `No report found at "/workspaces/testing-automatizacion-agile-201/playwright-report"` | `show-report` sin carpeta busca el reporte en la raíz del repositorio | Pásale la carpeta: `npx playwright show-report playwright-report --host 0.0.0.0` |
| El puerto 9323 o 3413 no aparece en **Ports** | El servidor escucha solo en `localhost` o ya se paró | `--host 0.0.0.0` en `show-report`; deja el comando en marcha mientras miras el reporte |
| `The output directory "…/allure-report" is not empty` | Generas encima de un reporte anterior | Añade `--clean` a `allure generate` |
| Allure cuenta pruebas «Retried» que no has reintentado | `allure-results/` acumula ejecuciones | `rm -rf allure-results` antes de ejecutar |
| `reports/junit.xml` no existe | La ejecución se cortó antes del final (los reporters escriben al terminar) | Deja terminar la suite; no la cortes con `Ctrl+C` ni con un `\| head` |
| Las categorías propias no aparecen | `allurerc.mjs` no está en la carpeta desde la que ejecutas `allure` | Cópialo a la carpeta del ejercicio, junto a `playwright.config.js` |

## Conclusiones

### Qué es el reporting de pruebas

Convertir una ejecución en un documento que responde a las preguntas de quien no la ha visto. En
Playwright se hace con reporters que escuchan la misma ejecución: `list` para la consola, `html` para
depurar, `junit` para otras herramientas y `allure-playwright` como fuente de Allure.

### Cómo debe ser

| Requisito | En el lab |
|-----------|-----------|
| Sale de cada ejecución sin pasos manuales | Cuatro reporters en `playwright.config.js` |
| Muestra el paso y el porqué del fallo | `test.step` con nombres del dominio; `Expected`/`Received` en HTML y Allure |
| Distingue un error de la app de uno de la prueba | `<failure>` / `<error>` en JUnit; categorías propias en Allure |
| Recuerda lo que pasó antes | `historyPath` en Allure: `History 2`, transición **Fixed** |
| Se guarda dentro del ejercicio | `outputFolder`, `outputFile` y `resultsDir` explícitos |

### Dónde se rompe y cómo lo has detectado

| Fallo | Cómo lo has visto | Qué provoca |
|-------|-------------------|-------------|
| Todo fallo es «failed» | Paso 1 y portada de Allure: **Product errors 2** para dos causas distintas | Se investiga la app cuando el problema es la prueba, o al revés |
| Resultados acumulados | Experimenta: 10 ficheros de resultado, **Retried tests 5** | Un reporte que mezcla ejecuciones |
| Sin historial | Reto: el HTML no sabe que la prueba fallaba antes | Nadie ve cuándo empezó ni cuándo se arregló un error |

### Cómo se perfecciona

Con categorías que reflejen las causas reales del equipo, historial persistente entre ejecuciones de CI,
y publicando los reportes como artefactos del pipeline (lab 04) para que estén a un clic del [check](../glosario/04-ci-cd.md#check).

### En una frase

> 🔑 Cada reporte responde a una pregunta distinta: la consola dice qué ha pasado, el HTML cómo, JUnit se
> lo cuenta a otras herramientas y Allure, desde cuándo y por qué.
