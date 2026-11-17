# Lab — Evidencias

[← Página anterior](04-lab-formularios-y-validaciones.md) · [Siguiente página →](06-lab-errores-y-reintentos.md)

En este lab practicas las **[evidencias de ejecución](../glosario/02-e2e.md#evidencias-de-ejecucion)** de [Playwright](../glosario/02-e2e.md#playwright): captura de pantalla, vídeo y
traza. El ejercicio `ejercicios/M02-05-evidencias/` es un carrito de 100 € con un campo de cupón. Su
prueba aplica el cupón `verano10` y espera un total de 90 €, pero falla, y el mensaje de error no
basta para saber por qué. Configuras las evidencias, diagnosticas el fallo con el **[Trace Viewer](../glosario/02-e2e.md#trace-viewer)** y
lo corriges.

### Objetivo

Comprender qué son las evidencias de una ejecución (captura, vídeo y traza): cómo funcionan, cómo deben
ser, cómo se detectan sus debilidades y cómo se mejoran.

### Punto de partida

- Codespace del curso abierto (`npm run verificar` termina en `Entorno listo`).
- Ejercicio: `ejercicios/M02-05-evidencias/`, con la aplicación en `app/`, la prueba en
  `tests/cupon.spec.js` y una configuración **sin evidencias**.
- La aplicación escucha en el puerto **3205**. El [reporte HTML](../glosario/04-ci-cd.md#reporte-html) se sirve en el **9323** y el visor de
  trazas en el **9322** (pestaña **Ports**).

```bash
# Entra en la carpeta del ejercicio
cd ejercicios/M02-05-evidencias
```

### Qué está pasando

Una prueba E2E que falla en CI a las tres de la madrugada solo deja lo que se haya guardado. Un
mensaje como «esperaba 90, he recibido 100» dice **qué** ha fallado, no **por qué**. Las evidencias
son lo que permite diagnosticar sin repetir la ejecución:

| Evidencia | Qué guarda | Opción en `use` |
|-----------|------------|-----------------|
| Captura (`screenshot`) | La pantalla al terminar la prueba | `screenshot: 'only-on-failure'` |
| Vídeo (`video`) | Toda la ejecución, en `.webm` | `video: 'retain-on-failure'` |
| Traza (`trace`) | Cada acción con el DOM antes y después, red, consola y código | `trace: 'on'`, `'retain-on-failure'`, `'on-first-retry'` |
| Captura manual | La pantalla en el momento que elige la prueba | `page.screenshot()` + `testInfo.attach()` |

Cuanto más se guarda, más espacio ocupa: el lab termina midiendo ese coste.

### 1 — Ejecutar la prueba sin evidencias

Abre [`tests/cupon.spec.js`](../../ejercicios/M02-05-evidencias/tests/cupon.spec.js):

```js
test('el cupón de verano descuenta un 10 %', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel('Cupón').fill('verano10');          // como lo escribiría un cliente
  await page.getByRole('button', { name: 'Aplicar' }).click();
  await expect(page.getByTestId('total')).toHaveText('90,00 €');
});
```

```bash
# Ejecuta la prueba (Playwright arranca la aplicación)
npx playwright test
# Lista lo que ha quedado en test-results/
ls -R test-results
```

**Resultado esperado** (los tiempos cambian en cada ejecución):

```text
Running 1 test using 1 worker

  ✘  1 [chromium] › tests/cupon.spec.js:4:1 › el cupón de verano descuenta un 10 % (5.2s)


  1) [chromium] › tests/cupon.spec.js:4:1 › el cupón de verano descuenta un 10 % ───────────────────

    Error: expect(locator).toHaveText(expected) failed

    Locator:  getByTestId('total')
    Expected: "90,00 €"
    Received: "100,00 €"
    Timeout:  5000ms

    Call log:
      - Expect "toHaveText" getByTestId('total') with timeout 5000ms
      - waiting for getByTestId('total')
        14 × locator resolved to <span id="total" data-testid="total">100,00 €</span>
           - unexpected value "100,00 €"

  ...
  1 failed
    [chromium] › tests/cupon.spec.js:4:1 › el cupón de verano descuenta un 10 % ────────────────────
```

```text
test-results:
cupon-el-cupón-de-verano-descuenta-un-10--chromium

test-results/cupon-el-cupón-de-verano-descuenta-un-10--chromium:
error-context.md
```

El total sigue en 100 €. ¿Se pulsó **Aplicar**? ¿Respondió el servidor? ¿Mostró la página algún
aviso? Con solo `error-context.md` no se sabe.

### 2 — Captura de pantalla en los fallos

Abre `playwright.config.js` y sustituye el comentario `// Paso 3: aquí se configuran las evidencias…`
por:

```js
    screenshot: 'only-on-failure',   // captura de la pantalla final si la prueba falla
```

```bash
# Ejecuta y lista los resultados
npx playwright test
ls -R test-results
```

**Resultado esperado** (lo nuevo):

```text
test-results/cupon-el-cupón-de-verano-descuenta-un-10--chromium:
error-context.md
test-failed-1.png
```

Abre `test-failed-1.png` en el editor: el carrito con «Auriculares 60,00 €», «Funda 40,00 €», el campo
**Cupón** con `verano10` escrito y **Total: 100,00 €**. Ningún mensaje de error en pantalla: para el
cliente, el cupón «no hace nada».

### 3 — Vídeo de los fallos

Debajo de la línea de `screenshot`, añade:

```js
    video: 'retain-on-failure',      // graba siempre y guarda el vídeo solo si falla
```

```bash
# Ejecuta y lista los resultados
npx playwright test
ls -R test-results
```

**Resultado esperado** (lo nuevo):

```text
error-context.md
test-failed-1.png
video.webm
```

El vídeo (ábrelo desde el explorador de VS Code) muestra la secuencia: carga, escritura del cupón,
clic y los 5 s de espera de la [aserción](../glosario/01-fundamentos.md#asercion) sin que cambie el total. Confirma que el clic ocurrió, pero
sigue sin decir qué respondió el servidor.

### 4 — Traza y reporte HTML

La traza guarda lo que no se ve en pantalla: la red y la consola. Añade debajo del vídeo:

```js
    trace: 'on',                     // traza completa: acciones, DOM, red y consola
```

Y sustituye `reporter: 'list',` por un reporte doble, en la terminal y en HTML:

```js
  // list en la terminal y, además, el reporte HTML (sin abrirlo solo)
  reporter: [['list'], ['html', { open: 'never', outputFolder: 'playwright-report' }]],
```

```bash
# Ejecuta con las tres evidencias
npx playwright test
```

**Resultado esperado** (el final de la salida):

```text
    attachment #1: screenshot (image/png) ──────────────────────────────────────────────────────────
    test-results/cupon-el-cupón-de-verano-descuenta-un-10--chromium/test-failed-1.png
    ────────────────────────────────────────────────────────────────────────────────────────────────

    attachment #2: video (video/webm) ──────────────────────────────────────────────────────────────
    test-results/cupon-el-cupón-de-verano-descuenta-un-10--chromium/video.webm
    ────────────────────────────────────────────────────────────────────────────────────────────────

    Error Context: test-results/cupon-el-cupón-de-verano-descuenta-un-10--chromium/error-context.md

    attachment #4: trace (application/zip) ─────────────────────────────────────────────────────────
    test-results/cupon-el-cupón-de-verano-descuenta-un-10--chromium/trace.zip
    Usage:

        npx playwright show-trace test-results/cupon-el-cupón-de-verano-descuenta-un-10--chromium/trace.zip

    ────────────────────────────────────────────────────────────────────────────────────────────────

  1 failed
    [chromium] › tests/cupon.spec.js:4:1 › el cupón de verano descuenta un 10 % ────────────────────
```

El reporter `list` enumera las evidencias adjuntas. Tamaños de esta ejecución: captura 15 KB, vídeo
66 KB, traza 112 KB.

### 5 — Diagnosticar con el Trace Viewer

En el Codespace no hay un navegador local donde abrir la traza: se sirve por un puerto.

```bash
# Sirve el visor de trazas en el puerto 9322 (Ctrl+C para pararlo)
npx playwright show-trace --host 0.0.0.0 --port 9322 test-results/cupon-el-cupón-de-verano-descuenta-un-10--chromium/trace.zip
```

**Resultado esperado:**

```text
Listening on http://0.0.0.0:9322
```

Abre el puerto **9322** desde la pestaña **Ports**. El visor tiene:

1. A la izquierda, la lista de **Actions**: `Navigate`, `Fill "verano10"`, `Click`, `Expect "toHaveText"`.
   Al seleccionar una, el centro muestra la página **antes** y **después** de esa acción.
2. Selecciona **Click**. Abajo, en la pestaña **Network**, aparece la petición
   `GET /api/cupones/verano10` con estado **404**.
3. En la pestaña **Console** aparece el aviso `Cupón rechazado: verano10 (404)`.

Ya hay diagnóstico: el servidor no reconoce `verano10`. Compruébalo a mano, con la aplicación arrancada
(`node app/server.mjs` en otra terminal):

```bash
# El cupón en minúsculas, como lo escribe un cliente, y en mayúsculas
curl -si http://localhost:3205/api/cupones/verano10
curl -si http://localhost:3205/api/cupones/VERANO10
```

**Resultado esperado** (sin las cabeceras de fecha y conexión):

```text
HTTP/1.1 404 Not Found
content-type: application/json

{"error":"Cupón desconocido","codigo":"verano10"}
HTTP/1.1 200 OK
content-type: application/json

{"codigo":"VERANO10","descuento":10}
```

Dos errores de la aplicación: el servidor distingue mayúsculas en los cupones y la página **se calla**
cuando uno no vale. La prueba hacía bien su trabajo. Para el visor y la aplicación con **Ctrl+C**.

> [!TIP]
> El reporte HTML lleva la misma traza dentro. Se sirve con
> `npx playwright show-report playwright-report --host 0.0.0.0` (puerto 9323); en la prueba fallida,
> la sección **Traces** abre el mismo visor.

### 6 — Corregir la aplicación

Abre [`app/server.mjs`](../../ejercicios/M02-05-evidencias/app/server.mjs) y normaliza el código del
cupón a mayúsculas. Sustituye la línea `const codigo = decodeURIComponent(cupon[1]);` por:

```js
    const codigo = decodeURIComponent(cupon[1]).toUpperCase();   // el cliente puede escribirlo en minúsculas
```

```bash
# Ejecuta y lista los resultados
npx playwright test
ls test-results/*
```

**Resultado esperado:**

```text
Running 1 test using 1 worker

  ✓  1 [chromium] › tests/cupon.spec.js:4:1 › el cupón de verano descuenta un 10 % (299ms)

  1 passed (884ms)
```

```text
trace.zip
```

La prueba pasa. Con estas opciones ya no hay captura ni vídeo (solo se guardan si falla), pero la traza
sigue: `trace: 'on'` la guarda siempre (47 KB en esta ejecución).

### 7 — Adjuntar una captura propia al reporte

Las evidencias automáticas salen al final. A veces interesa una captura de un momento concreto, también
cuando la prueba pasa (por ejemplo, para enseñar cómo queda la pantalla a quien revisa). Añade a la
prueba el parámetro `testInfo` y, al final, la captura adjunta:

```js
test('el cupón de verano descuenta un 10 %', async ({ page }, testInfo) => {
  // … los pasos de antes …

  // Evidencia explícita: la pantalla tras aplicar el cupón, adjunta al reporte
  await testInfo.attach('carrito con cupón', {
    body: await page.screenshot({ fullPage: true }),
    contentType: 'image/png',
  });
});
```

```bash
# Ejecuta y mira qué guarda el reporte HTML
npx playwright test
ls -R playwright-report/data
```

**Resultado esperado** (los nombres de fichero cambian):

```text
  ✓  1 [chromium] › tests/cupon.spec.js:4:1 › el cupón de verano descuenta un 10 % (326ms)

  1 passed (943ms)
```

```text
playwright-report/data:
7368930e17f9220d2ed4084f569e47bda87dc125.zip
dd03b1a0a83f0011f2a54bcb7bbe1deb0f7e8bd4.png
```

El `.png` es tu captura y el `.zip`, la traza. En el reporte HTML (`show-report`, puerto 9323), la
prueba muestra **carrito con cupón** como adjunto. La configuración, la prueba y la aplicación
corregidas están en [`solucion/`](../../ejercicios/M02-05-evidencias/solucion/).

```bash
# Ejecuta la solución (con su servidor corregido)
npx playwright test --config solucion/playwright.config.js
```

## Comprueba tu entendimiento

**Qué evidencias deja una prueba que pasa**
Con la aplicación corregida y la configuración del paso 4, ejecuta `npx playwright test` y `ls -R test-results`.
→ Solo `trace.zip`: `only-on-failure` y `retain-on-failure` no guardan nada si la prueba pasa; `trace: 'on'` guarda siempre.

**Dónde mirar la red**
En el Trace Viewer, selecciona la acción **Click** y abre **Network**.
→ La petición `/api/cupones/…` con su estado; con el servidor corregido, 200.

## Experimenta

**Predice:** con la aplicación ya corregida, ¿qué queda en `test-results/` si cambias `trace: 'on'` por
`trace: 'retain-on-failure'`? Cámbialo y ejecuta:

```bash
# Ejecuta con la traza solo para los fallos
npx playwright test
ls -R test-results/
```

**Resultado esperado:**

```text
  ✓  1 [chromium] › tests/cupon.spec.js:4:1 › el cupón de verano descuenta un 10 % (258ms)

  1 passed (845ms)
```

```text
test-results/:
```

`test-results/` queda vacía (en alguna ejecución puede quedar la carpeta de la prueba, también vacía):
la traza se graba durante la ejecución y se descarta al pasar.

## Reto

### 1 — ¿Traza siempre en CI?

**La situación:** un compañero propone dejar `trace: 'on'` en CI «para tener siempre toda la
información». La suite crecerá a cientos de pruebas.

**Qué haces:** con la aplicación corregida, mide el espacio que ocupan 20 ejecuciones de la prueba
con `trace: 'on'` y con `trace: 'retain-on-failure'`. Después vuelve a la aplicación con el error
(quita `.toUpperCase()`) y repite con `retain-on-failure`.

```bash
# 20 ejecuciones, reporter de una línea, y lo que ocupan los resultados
npx playwright test --repeat-each 20 --reporter line
du -sh test-results
find test-results -name trace.zip | wc -l
```

**Pistas:** cambia solo la opción `trace` entre ejecuciones; `test-results/` se vacía al empezar cada una.

**Lo que buscas:** el espacio y el número de trazas de cada opción, y una recomendación para CI.

<details>
<summary>Ver solución</summary>

`trace: 'on'`, prueba pasando:

```text
  20 passed (6.1s)
1004K	test-results
20
```

`trace: 'retain-on-failure'`, prueba pasando:

```text
  20 passed (6.8s)
8,0K	test-results
0
```

`trace: 'retain-on-failure'`, prueba fallando:

```text
4,3M	test-results
20
```

Con la prueba pasando, `on` guarda 20 trazas (1 MB) que nadie va a mirar; `retain-on-failure` no
guarda nada. Cuando falla, `retain-on-failure` guarda las 20 trazas, más captura y vídeo (4,3 MB): está
todo lo necesario justo cuando hace falta. En tiempo no hay diferencia apreciable en esta prueba
(6.1 s frente a 6.8 s, ruido entre ejecuciones). **La regla:** en CI se guardan evidencias de los
fallos (`retain-on-failure`, o `on-first-retry` si hay [reintentos](../glosario/02-e2e.md#reintento)), no de todo; la traza completa
siempre es para depurar en local. Vuelve a dejar el `.toUpperCase()`.

</details>

## Errores frecuentes

| Síntoma | Causa probable | Cómo arreglarlo |
|---------|----------------|-----------------|
| `test-results/` solo tiene `error-context.md` | Evidencias no configuradas en `use` | Añadir `screenshot`, `video` y `trace` |
| `No report found at "…/testing-automatizacion-agile-201/playwright-report"` | `show-report` sin ruta busca en la raíz del repositorio | `npx playwright show-report playwright-report --host 0.0.0.0` desde la carpeta del ejercicio |
| El puerto 9322 o 9323 no aparece en **Ports** | El visor o el reporte escuchan solo en `localhost` | Añadir `--host 0.0.0.0` |
| No hay vídeo ni captura aunque la prueba ha fallado | Se ejecutó con la configuración de otra carpeta o sin las opciones en `use` | Revisar `playwright.config.js` del ejercicio |

## Conclusiones

### Qué son las evidencias de ejecución

Lo que Playwright guarda de cada prueba para diagnosticarla sin repetirla: la **captura** final, el
**vídeo** de toda la ejecución y la **traza**, que permite recorrer cada acción con el DOM, la red y la
consola. Se configuran en `use` y se adjuntan al reporte.

### Cómo debe ser

| Requisito | En el lab |
|-----------|-----------|
| Evidencias de los fallos activadas por defecto | `screenshot: 'only-on-failure'`, `video: 'retain-on-failure'` |
| Traza disponible cuando hay que diagnosticar | `trace: 'on'` en local, `retain-on-failure` en CI |
| Reporte que reúne todo | `reporter: [['list'], ['html', …]]` con la traza dentro |
| Capturas explícitas donde aportan | `testInfo.attach('carrito con cupón', …)` |

### Dónde se rompe y cómo lo has detectado

| Fallo | Cómo lo has visto | Qué provoca |
|-------|-------------------|-------------|
| Fallo sin evidencias | Paso 1: «90 frente a 100» y nada más | No se sabe si falla la prueba, la página o el servidor |
| Error silencioso de la aplicación | La captura no muestra aviso; la traza muestra el 404 y el `console.warn` | Diagnóstico en minutos, sin repetir la ejecución |
| Exceso de evidencias | 1 MB de trazas de pruebas que pasan en el reto | Artefactos de CI grandes que nadie mira |

### Cómo se perfecciona

En CI, las evidencias de los fallos se publican como artefactos del [pipeline](../glosario/04-ci-cd.md#pipeline) (se ve en el módulo M04), y
la traza se abre en `trace.playwright.dev` o con `show-trace` tras descargarla. Las pruebas que fallan a
veces se depuran con `trace: 'on-first-retry'`, que solo graba el reintento.

### En una frase

> 🔑 El mensaje de error dice qué ha fallado; la traza dice por qué: actívala para los fallos y mírala antes de tocar la prueba.
