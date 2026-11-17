# Lab — Errores y reintentos

[← Página anterior](05-lab-evidencias.md) · [Siguiente página →](07-lab-page-objects.md)

En este lab practicas los **[reintentos](../glosario/02-e2e.md#reintento) y su riesgo**. El ejercicio `ejercicios/M02-06-errores-y-reintentos/`
es la página de una cuenta con dos problemas distintos: el servicio de saldo falla **una de cada tres
peticiones** (un servicio inestable) y el listado de movimientos tiene un **error real** (devuelve 2
de 3). Con reintentos, uno queda como *flaky* y el otro como roto; aprendes a distinguirlos y a
reintentar solo lo que tiene sentido.

### Objetivo

Comprender qué son los reintentos de una prueba: cómo funcionan, cómo deben ser, cómo se detectan sus
debilidades y cómo se mejoran.

### Punto de partida

- Codespace del curso abierto (`npm run verificar` termina en `Entorno listo`).
- Ejercicio: `ejercicios/M02-06-errores-y-reintentos/`, con la aplicación en `app/` y dos pruebas en
  `tests/cuenta.spec.js`.
- La aplicación escucha en el puerto **3206**. `/api/saldo` falla con 503 en la 1.ª, 4.ª, 7.ª…
  petición; la variable `FALLA_CADA` cambia ese ritmo (`FALLA_CADA=1`: falla siempre).
- La configuración usa un solo worker y arranca un servidor nuevo en cada ejecución, para que el
  contador de peticiones empiece siempre en 0 y los resultados se puedan reproducir.

```bash
# Entra en la carpeta del ejercicio
cd ejercicios/M02-06-errores-y-reintentos
```

### Qué está pasando

Una prueba E2E toca muchas piezas (navegador, red, servicios de terceros) y alguna falla de vez en
cuando sin que el código probado tenga un error. [Playwright](../glosario/02-e2e.md#playwright) puede **reintentar** una prueba fallida
entera (`retries`). Si a la segunda pasa, el reporte la marca como **flaky**: no ha fallado, pero
tampoco es de fiar.

El riesgo es evidente: un reintento puede tapar un error real que solo aparece a veces. Hay tres
herramientas, de más a menos grueso:

| Herramienta | Qué reintenta | Cuándo tiene sentido |
|-------------|---------------|----------------------|
| `retries` (configuración o `--retries`) | La prueba entera, en un navegador nuevo | Red de seguridad en CI, vigilando los *flaky* |
| `expect(async () => { … }).toPass()` | Un bloque de acciones y [aserciones](../glosario/01-fundamentos.md#asercion) | Cuando el usuario también reintentaría (pulsar otra vez) |
| `expect.poll(() => valor).toBe(…)` | Una función que devuelve un valor | Esperar a que un servicio o un dato llegue a un estado |

### 1 — Ver el servicio en crudo

Pregunta cuatro veces por el saldo y una por los movimientos.

```bash
# Terminal 1: arranca la aplicación (Ctrl+C para pararla al terminar el paso)
node app/server.mjs
```

```bash
# Terminal 2: cuatro consultas de saldo y una de movimientos
for i in 1 2 3 4; do curl -s -w "  → HTTP %{http_code}\n" http://localhost:3206/api/saldo; done
curl -s http://localhost:3206/api/movimientos
```

**Resultado esperado:**

```text
{"error":"Servicio no disponible"}  → HTTP 503
{"saldo":120}  → HTTP 200
{"saldo":120}  → HTTP 200
{"error":"Servicio no disponible"}  → HTTP 503
[{"concepto":"Nómina","importe":1500},{"concepto":"Alquiler","importe":-800}]
```

En la terminal 1, el servidor escribe `/api/saldo petición N` en cada consulta. El saldo falla a
ratos; los movimientos fallan **siempre**: falta «Supermercado». Para la aplicación con **Ctrl+C**.

### 2 — Ejecutar sin reintentos

Abre [`tests/cuenta.spec.js`](../../ejercicios/M02-06-errores-y-reintentos/tests/cuenta.spec.js):

```js
test('muestra el saldo', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Consultar saldo' }).click();
  await expect(page.getByRole('status')).toHaveText('Saldo: 120,00 €');
});

test('lista los tres movimientos', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('listitem')).toHaveCount(3);
});
```

```bash
# Ejecuta las dos pruebas
npx playwright test
```

**Resultado esperado** (extracto; los tiempos cambian):

```text
Running 2 tests using 1 worker

  ✘  1 [chromium] › tests/cuenta.spec.js:4:1 › muestra el saldo (5.1s)
  ✘  2 [chromium] › tests/cuenta.spec.js:10:1 › lista los tres movimientos (5.1s)

    Error: expect(locator).toHaveText(expected) failed

    Locator:  getByRole('status')
    Expected: "Saldo: 120,00 €"
    Received: "Servicio no disponible, inténtalo de nuevo"
  ...
    Error: expect(locator).toHaveCount(expected) failed

    Locator:  getByRole('listitem')
    Expected: 3
    Received: 2
  ...
  2 failed
    [chromium] › tests/cuenta.spec.js:4:1 › muestra el saldo ───────────────────────────────────────
    [chromium] › tests/cuenta.spec.js:10:1 › lista los tres movimientos ────────────────────────────
```

Dos fallos que **parecen iguales** en el resumen y no lo son: uno es el 503 de la primera petición; el
otro, un error del servicio de movimientos.

### 3 — Medir con `--repeat-each`

Antes de reintentar nada, mide. Repite solo la prueba del saldo tres veces:

```bash
# La prueba del saldo, tres veces seguidas
npx playwright test -g "saldo" --repeat-each 3
```

**Resultado esperado:**

```text
Running 3 tests using 1 worker

  ✘  1 [chromium] › tests/cuenta.spec.js:4:1 › muestra el saldo (5.1s)
  ✓  2 [chromium] › tests/cuenta.spec.js:4:1 › muestra el saldo (152ms)
  ✓  3 [chromium] › tests/cuenta.spec.js:4:1 › muestra el saldo (123ms)
  ...
  1 failed
    [chromium] › tests/cuenta.spec.js:4:1 › muestra el saldo ───────────────────────────────────────
  2 passed (6.8s)
```

1 de 3: exactamente el ritmo del servicio. Con los movimientos saldría 3 de 3.

### 4 — Reintentar la suite entera

Lanza la suite con dos reintentos por prueba:

```bash
# Hasta dos reintentos por prueba fallida
npx playwright test --retries 2
```

**Resultado esperado** (extracto):

```text
Running 2 tests using 1 worker

  ✘  1 [chromium] › tests/cuenta.spec.js:4:1 › muestra el saldo (5.2s)
  ✓  2 [chromium] › tests/cuenta.spec.js:4:1 › muestra el saldo (retry #1) (131ms)
  ✘  3 [chromium] › tests/cuenta.spec.js:10:1 › lista los tres movimientos (5.1s)
  ✘  4 [chromium] › tests/cuenta.spec.js:10:1 › lista los tres movimientos (retry #1) (5.1s)
  ✘  5 [chromium] › tests/cuenta.spec.js:10:1 › lista los tres movimientos (retry #2) (5.1s)
  ...
  1 failed
    [chromium] › tests/cuenta.spec.js:10:1 › lista los tres movimientos ────────────────────────────
  1 flaky
    [chromium] › tests/cuenta.spec.js:4:1 › muestra el saldo ───────────────────────────────────────
```

| Prueba | Intentos | Estado | Qué significa |
|--------|----------|--------|---------------|
| `muestra el saldo` | Falla, pasa en el `retry #1` | **flaky** | Algo inestable: la prueba o el servicio |
| `lista los tres movimientos` | Falla 3 de 3 | **failed** | Error determinista: reintentar no sirve |

Los reintentos han separado los dos fallos, pero a costa de 15 s más y de **dar por buena** una prueba
del saldo que ha fallado una vez.

### 5 — Reintentar solo lo que el usuario reintentaría

La página dice «inténtalo de nuevo»: un usuario volvería a pulsar. Reintentar **ese bloque** es
legítimo; reintentar la prueba entera, no tanto. Sustituye la prueba del saldo por:

```js
test('muestra el saldo', async ({ page }) => {
  await page.goto('/');
  // El usuario puede volver a pulsar si el servicio falla: se reintenta ESE bloque, no toda la prueba
  await expect(async () => {
    await page.getByRole('button', { name: 'Consultar saldo' }).click();
    await expect(page.getByRole('status')).toHaveText('Saldo: 120,00 €', { timeout: 1_000 });
  }).toPass({ timeout: 10_000 });
});
```

```bash
# Ejecuta solo la prueba del saldo, sin reintentos
npx playwright test -g "saldo"
```

**Resultado esperado:**

```text
Running 1 test using 1 worker

  ✓  1 [chromium] › tests/cuenta.spec.js:4:1 › muestra el saldo (1.3s)

  1 passed (1.9s)
```

`toPass` ejecuta el bloque; si una aserción de dentro falla, espera un poco y lo repite, hasta 10 s. La
aserción interior tiene su propio límite corto (1 s) para que cada vuelta sea rápida. Ha pasado **sin**
`retries` y sin estado *flaky*: el reintento forma parte del comportamiento esperado.

### 6 — Esperar a que un servicio responda

A veces lo que se reintenta no es una acción de pantalla sino una consulta: «espera a que el servicio
esté arriba». Añade esta prueba después de la del saldo:

```js
test('la API de saldo acaba respondiendo', async ({ request }) => {
  // Pregunta el estado HTTP hasta que vale 200 (o se agota el tiempo)
  await expect
    .poll(async () => (await request.get('/api/saldo')).status(), { timeout: 10_000 })
    .toBe(200);
});
```

```bash
# Ejecuta solo la prueba nueva (servidor recién arrancado: su primera petición falla)
npx playwright test -g "API"
```

**Resultado esperado:**

```text
Running 1 test using 1 worker

  ✓  1 [chromium] › tests/cuenta.spec.js:13:1 › la API de saldo acaba respondiendo (143ms)

  1 passed (671ms)
```

`request` es el cliente HTTP de Playwright (usa la misma `baseURL`). `expect.poll` llama a la función
una y otra vez hasta que el valor es `200`: la primera petición da 503 y la segunda, 200.

### 7 — Marcar el error real como conocido

El listado de movimientos no es inestable: está roto. Reintentarlo solo gasta tiempo. Mientras se
corrige, se marca como **[fallo esperado](../glosario/02-e2e.md#fallo-esperado)** con un motivo. Sustituye esa prueba por:

```js
test('lista los tres movimientos', async ({ page }) => {
  // Error real y conocido: se marca como fallo esperado en lugar de reintentarlo
  test.fail(true, 'Incidencia abierta: /api/movimientos devuelve 2 de 3');
  await page.goto('/');
  await expect(page.getByRole('listitem')).toHaveCount(3);
});
```

```bash
# Toda la suite, sin reintentos
npx playwright test
echo "código de salida: $?"
```

**Resultado esperado:**

```text
Running 3 tests using 1 worker

  ✓  1 [chromium] › tests/cuenta.spec.js:4:1 › muestra el saldo (1.3s)
  ✓  2 [chromium] › tests/cuenta.spec.js:13:1 › la API de saldo acaba respondiendo (14ms)
  ✘  3 [chromium] › tests/cuenta.spec.js:20:1 › lista los tres movimientos (5.1s)

  3 passed (7.0s)
código de salida: 0
```

La marca ✘ dice que la prueba ha fallado, y el resumen la cuenta como pasada **porque se esperaba que
fallara**. El día que alguien arregle el servicio, la prueba pasará y Playwright la dará por **fallida**
(«se esperaba un fallo»): el aviso para quitar el `test.fail`. La solución está en
[`solucion/`](../../ejercicios/M02-06-errores-y-reintentos/solucion/), con
`retries: process.env.CI ? 2 : 0` en la configuración.

```bash
# Ejecuta la solución
npx playwright test --config solucion/playwright.config.js
```

## Comprueba tu entendimiento

**Flaky no es verde**
Con las pruebas del paso 2, ejecuta `npx playwright test -g "saldo" --retries 2` y mira el resumen.
→ `1 flaky`: pasó al reintentar, pero el reporte lo deja anotado.

**Un error determinista no mejora reintentando**
Ejecuta `npx playwright test -g "movimientos" --retries 2` con la prueba original de los movimientos.
→ Tres intentos con `Received: 2` en los tres y `1 failed`.

## Experimenta

Por defecto, una prueba *flaky* **no** hace fallar la ejecución. **Predice** el código de salida de
la prueba original del saldo con `--retries 2`, y después con `--fail-on-flaky-tests`. Recupera la
prueba del paso 2 y ejecuta:

```bash
# Con reintentos: ¿sale bien la ejecución?
npx playwright test -g "saldo" --retries 2
echo "código de salida: $?"
# Con reintentos, pero los flaky cuentan como fallo
npx playwright test -g "saldo" --retries 2 --fail-on-flaky-tests
echo "código de salida: $?"
```

**Resultado esperado** (el final de cada ejecución):

```text
  1 flaky
    [chromium] › tests/cuenta.spec.js:4:1 › muestra el saldo ───────────────────────────────────────
código de salida: 0
```

```text
  1 flaky
    [chromium] › tests/cuenta.spec.js:4:1 › muestra el saldo ───────────────────────────────────────
código de salida: 1
```

Con código 0, un [pipeline](../glosario/04-ci-cd.md#pipeline) de CI daría el cambio por bueno con un servicio que falla un tercio de las
veces. `--fail-on-flaky-tests` convierte la inestabilidad en un fallo visible.

## Reto

### 1 — Cuando el servicio cae del todo

**La situación:** un compañero teme que `toPass` y `expect.poll` «escondan» una caída del servicio de
saldo, igual que los reintentos.

**Qué haces:** con la suite del paso 7, simula una caída total: el servicio falla siempre.

```bash
# El servicio de saldo responde 503 a todas las peticiones
FALLA_CADA=1 npx playwright test
echo "código de salida: $?"
```

**Pistas:** mira cuánto tarda cada prueba y qué dice el error de `toPass` y de `expect.poll`.

**Lo que buscas:** saber si las dos pruebas del saldo fallan, cuándo y con qué mensaje.

<details>
<summary>Ver solución</summary>

```text
Running 3 tests using 1 worker

  ✘  1 [chromium] › tests/cuenta.spec.js:4:1 › muestra el saldo (9.2s)
  ✘  2 [chromium] › tests/cuenta.spec.js:13:1 › la API de saldo acaba respondiendo (10.0s)
  ✘  3 [chromium] › tests/cuenta.spec.js:20:1 › lista los tres movimientos (5.1s)

  1) [chromium] › tests/cuenta.spec.js:4:1 › muestra el saldo ──────────────────────────────────────

    Error: expect(locator).toHaveText(expected) failed

    Locator:  getByRole('status')
    Expected: "Saldo: 120,00 €"
    Received: "Servicio no disponible, inténtalo de nuevo"
    Timeout:  1000ms
    ...
    Call Log:
    - Timeout 10000ms exceeded while waiting on the predicate

  2) [chromium] › tests/cuenta.spec.js:13:1 › la API de saldo acaba respondiendo ───────────────────

    Error: expect(received).toBe(expected) // Object.is equality

    Expected: 200
    Received: 503

    Call Log:
    - Timeout 10000ms exceeded while waiting on the predicate

  2 failed
    [chromium] › tests/cuenta.spec.js:4:1 › muestra el saldo ───────────────────────────────────────
    [chromium] › tests/cuenta.spec.js:13:1 › la API de saldo acaba respondiendo ────────────────────
  1 passed (25.5s)
código de salida: 1
```

Las dos fallan al agotar su límite de 10 s, con el último valor visto (`Received: 503`). No esconden
la caída: la **acotan**. Un fallo ocasional se absorbe dentro de la prueba; uno permanente sigue
fallando. **La regla:** todo reintento lleva un límite y se coloca lo más cerca posible de lo que
falla (un bloque, una consulta), nunca alrededor de la prueba entera para «que salga verde».

</details>

## Errores frecuentes

| Síntoma | Causa probable | Cómo arreglarlo |
|---------|----------------|-----------------|
| La suite sale verde pero el reporte dice `flaky` | `retries` tapa una inestabilidad | Investigar con `--repeat-each`; en CI, `--fail-on-flaky-tests` |
| La misma prueba falla igual en todos los reintentos | Error determinista de la aplicación o de la prueba | Quitar el reintento, corregir o marcar con `test.fail` y motivo |
| `toPass` tarda mucho en fallar | La aserción interior usa el límite por defecto (5 s) en cada vuelta | `{ timeout: 1_000 }` en la aserción de dentro |
| `Timeout 10000ms exceeded while waiting on the predicate` | El valor nunca llega al esperado dentro del límite | Mirar el último `Received`: es el estado real del servicio |

## Conclusiones

### Qué son los reintentos

Volver a ejecutar algo que ha fallado esperando que pase: la prueba entera (`retries`), un bloque
(`toPass`) o una consulta (`expect.poll`). Sirven para absorber fallos ocasionales del entorno, y el
estado **flaky** del reporte avisa de que algo ha necesitado más de un intento.

### Cómo debe ser

| Requisito | En el lab |
|-----------|-----------|
| Medir antes de reintentar | `--repeat-each 3`: 1 de 3 en el saldo, 3 de 3 en movimientos |
| Reintentar lo más cerca posible del fallo | `toPass` alrededor del clic, `expect.poll` sobre el estado HTTP |
| Todo reintento con límite | `toPass({ timeout: 10_000 })`, `poll(…, { timeout: 10_000 })` |
| `retries` solo en CI y con los flaky vigilados | `retries: process.env.CI ? 2 : 0`, `--fail-on-flaky-tests` |
| Errores conocidos marcados, no reintentados | `test.fail(true, 'Incidencia abierta: …')` |

### Dónde se rompe y cómo lo has detectado

| Fallo | Cómo lo has visto | Qué provoca |
|-------|-------------------|-------------|
| Reintento que tapa inestabilidad | `1 flaky` con código de salida 0 | Un servicio que falla un tercio de las veces pasa a producción |
| Reintento de un error real | 3 intentos con `Received: 2` | 10 s perdidos y el mismo resultado |
| Caída total | `FALLA_CADA=1`: `toPass` y `poll` fallan a los 10 s | Fallo claro y acotado, con el último valor visto |

### Cómo se perfecciona

En un proyecto real, las pruebas *flaky* se registran (el [reporte HTML](../glosario/04-ci-cd.md#reporte-html) y [Allure](../glosario/04-ci-cd.md#allure) las marcan) y se
tratan como incidencias con dueño, no como ruido. `retries` en CI es una red de seguridad mientras se
investigan, y la traza `on-first-retry` captura justo el intento que hay que mirar.

### En una frase

> 🔑 Un reintento no arregla nada: mide primero, reintenta solo lo que un usuario reintentaría, con límite, y trata cada *flaky* como un aviso.
