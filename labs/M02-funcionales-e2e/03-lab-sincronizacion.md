# Lab — Sincronización

[← Página anterior](02-lab-selectores-estables.md) · [Siguiente página →](04-lab-formularios-y-validaciones.md)

En este lab practicas la **sincronización entre la prueba y la página**: esperas automáticas y
esperas explícitas. El ejercicio `ejercicios/M02-03-sincronizacion/` es una página de «Entregas de
hoy» que pide sus datos a una API que tarda **un tiempo al azar entre 100 y 900 ms**. Su prueba espera
medio segundo fijo con `waitForTimeout(500)`: a veces basta y a veces no.

### Objetivo

Comprender qué es la [espera automática](../glosario/02-e2e.md#espera-automatica) (auto-wait) y cuándo hace falta una [espera explícita](../glosario/02-e2e.md#espera-explicita): cómo
funciona, cómo debe ser, cómo se detectan sus debilidades y cómo se mejora.

### Punto de partida

- Codespace del curso abierto (`npm run verificar` termina en `Entorno listo`).
- Ejercicio: `ejercicios/M02-03-sincronizacion/`, con la aplicación en `app/` y una prueba en
  `tests/entregas.spec.js`.
- La aplicación escucha en el puerto **3203**. El retraso de la API se cambia con las variables
  `RETRASO_MIN` y `RETRASO_MAX` (en ms) al lanzar las pruebas.

```bash
# Entra en la carpeta del ejercicio
cd ejercicios/M02-03-sincronizacion
```

### Qué está pasando

Casi ninguna página moderna está completa cuando termina de cargar: pide datos, espera respuestas y
se repinta. La prueba tiene que **sincronizarse** con ella: actuar y comprobar cuando la página está lista,
ni antes ni (mucho) después. Hay tres formas:

| Forma | Cómo | Problema |
|-------|------|----------|
| [Espera fija](../glosario/02-e2e.md#espera-fija) | `await page.waitForTimeout(500)` | Si la página tarda más, falla; si tarda menos, se pierde el tiempo |
| Espera automática (**auto-wait**) | Las acciones esperan a que su elemento sea accionable; las [aserciones](../glosario/01-fundamentos.md#asercion) web-first reintentan | Tiene un límite (5 s por defecto) |
| Espera explícita de un evento | `page.waitForResponse('**/api/entregas')` | Hay que prepararla **antes** de la acción que lo provoca |

En un proyecto real, las esperas fijas son la causa más común de **[pruebas inestables](../glosario/05-calidad-e-ia.md#flaky-test)** (*flaky*):
pasan en el portátil de quien las escribió y fallan en CI, que va más cargado.

### 1 — Mirar la API en crudo

Pregunta dos veces a la API y fíjate en la cabecera `x-retraso-ms`, que dice cuánto ha tardado esa
respuesta.

```bash
# Terminal 1: arranca la aplicación (Ctrl+C para pararla al terminar el paso)
node app/server.mjs
```

```bash
# Terminal 2: dos peticiones con sus cabeceras
curl -si http://localhost:3203/api/entregas
curl -si http://localhost:3203/api/entregas
```

**Resultado esperado** (los retrasos son al azar):

```text
Aplicación en http://localhost:3203 (retraso 100–900 ms)
```

```text
HTTP/1.1 200 OK
content-type: application/json
x-retraso-ms: 553
...

[{"codigo":"E-101","destino":"Bilbao","estado":"En reparto"},{"codigo":"E-102","destino":"Sevilla","estado":"Entregada"},{"codigo":"E-103","destino":"Zaragoza","estado":"En almacén"}]
HTTP/1.1 200 OK
content-type: application/json
x-retraso-ms: 238
...
```

Una vez 553 ms, otra 238 ms. Abre el puerto 3203 desde la pestaña **Ports** y recarga varias veces:
«Cargando entregas…» dura más o menos, y el botón **Actualizar** está desactivado mientras tanto. Para
la aplicación con **Ctrl+C**.

### 2 — Leer la prueba

Abre [`tests/entregas.spec.js`](../../ejercicios/M02-03-sincronizacion/tests/entregas.spec.js):

```js
test('la lista muestra las tres entregas', async ({ page }) => {
  await page.goto('/');
  await page.waitForTimeout(500);                    // «medio segundo debería bastar»
  const entregas = page.locator('#entregas li');
  expect(await entregas.count()).toBe(3);
  expect(await entregas.first().textContent()).toContain('E-101');
});
```

La prueba apuesta a que la API responde en menos de 500 ms. Con retrasos de 100 a 900 ms, lo hará
aproximadamente la mitad de las veces.

### 3 — Ejecutarla varias veces

Una ejecución sola no dice nada: puede tocar verde o rojo. Ejecútala tres veces seguidas.

```bash
# Tres ejecuciones de la misma prueba
npx playwright test
npx playwright test
npx playwright test
```

**Resultado esperado** (cambia en cada ejecución; esta vez salió verde, rojo, rojo):

```text
  ✓  1 [chromium] › tests/entregas.spec.js:4:1 › la lista muestra las tres entregas (775ms)
  1 passed (1.7s)
```

```text
  ✘  1 [chromium] › tests/entregas.spec.js:4:1 › la lista muestra las tres entregas (805ms)

    Error: expect(received).toBe(expected) // Object.is equality

    Expected: 3
    Received: 0

       6 |   await page.waitForTimeout(500);                    // «medio segundo debería bastar»
       7 |   const entregas = page.locator('#entregas li');
    >  8 |   expect(await entregas.count()).toBe(3);
         |                                  ^
  1 failed
```

Misma prueba, mismo código, resultados distintos: es una prueba **inestable**. `Received: 0` dice que
a los 500 ms la lista aún estaba vacía.

### 4 — Medir la inestabilidad con `--repeat-each`

Para ver la tasa de fallo de verdad, [Playwright](../glosario/02-e2e.md#playwright) repite cada prueba N veces en una misma ejecución.

```bash
# Repite la prueba 10 veces (en varios workers a la vez)
npx playwright test --repeat-each 10
```

**Resultado esperado** (el número de fallos cambia en cada ejecución):

```text
Running 10 tests using 4 workers

  ✓   1 [chromium] › tests/entregas.spec.js:4:1 › la lista muestra las tres entregas (822ms)
  ✓   2 [chromium] › tests/entregas.spec.js:4:1 › la lista muestra las tres entregas (957ms)
  ✓   3 [chromium] › tests/entregas.spec.js:4:1 › la lista muestra las tres entregas (816ms)
  ✓   4 [chromium] › tests/entregas.spec.js:4:1 › la lista muestra las tres entregas (890ms)
  ✓   5 [chromium] › tests/entregas.spec.js:4:1 › la lista muestra las tres entregas (819ms)
  ✓   6 [chromium] › tests/entregas.spec.js:4:1 › la lista muestra las tres entregas (872ms)
  ✓   7 [chromium] › tests/entregas.spec.js:4:1 › la lista muestra las tres entregas (846ms)
  ✓   8 [chromium] › tests/entregas.spec.js:4:1 › la lista muestra las tres entregas (812ms)
  ✘   9 [chromium] › tests/entregas.spec.js:4:1 › la lista muestra las tres entregas (805ms)
  ✘  10 [chromium] › tests/entregas.spec.js:4:1 › la lista muestra las tres entregas (758ms)
  ...
  2 failed
    [chromium] › tests/entregas.spec.js:4:1 › la lista muestra las tres entregas ───────────────────
    [chromium] › tests/entregas.spec.js:4:1 › la lista muestra las tres entregas ───────────────────
  8 passed (6.9s)
```

2 de 10 en esta ejecución; en otra pueden ser 4 o 6. Cualquier número distinto de 0 significa que la
prueba no es de fiar. Fíjate también en los tiempos: ninguna baja de unos 750 ms, porque todas
pagan el medio segundo de espera aunque la API haya respondido en 100 ms.

### 5 — Sustituir la espera fija por aserciones web-first

Quita el `waitForTimeout` y deja que las aserciones esperen por sí mismas. Sustituye el cuerpo de la
prueba por:

```js
test('la lista muestra las tres entregas', async ({ page }) => {
  await page.goto('/');
  const entregas = page.getByRole('listitem');
  // Aserciones web-first: reintentan hasta que se cumplen (5 s como máximo)
  await expect(entregas).toHaveCount(3);
  await expect(entregas.first()).toContainText('E-101');
});
```

```bash
# Repite la prueba 10 veces
npx playwright test --repeat-each 10
```

**Resultado esperado** (los tiempos cambian):

```text
Running 10 tests using 4 workers

  ✓   2 [chromium] › tests/entregas.spec.js:4:1 › la lista muestra las tres entregas (436ms)
  ✓   1 [chromium] › tests/entregas.spec.js:4:1 › la lista muestra las tres entregas (1.1s)
  ✓   4 [chromium] › tests/entregas.spec.js:4:1 › la lista muestra las tres entregas (1.1s)
  ✓   3 [chromium] › tests/entregas.spec.js:4:1 › la lista muestra las tres entregas (1.3s)
  ✓   5 [chromium] › tests/entregas.spec.js:4:1 › la lista muestra las tres entregas (747ms)
  ✓   6 [chromium] › tests/entregas.spec.js:4:1 › la lista muestra las tres entregas (1.1s)
  ✓   7 [chromium] › tests/entregas.spec.js:4:1 › la lista muestra las tres entregas (1.1s)
  ✓   8 [chromium] › tests/entregas.spec.js:4:1 › la lista muestra las tres entregas (1.1s)
  ✓   9 [chromium] › tests/entregas.spec.js:4:1 › la lista muestra las tres entregas (1.3s)
  ✓  10 [chromium] › tests/entregas.spec.js:4:1 › la lista muestra las tres entregas (593ms)

  10 passed (7.1s)
```

10 de 10, y cada prueba dura lo que tarda su respuesta (de 436 ms a 1.3 s), no un valor fijo.

### 6 — Esperar a la respuesta de la API

A veces interesa sincronizarse con la **red**, no con la pantalla: por ejemplo, para comparar la lista
con lo que devolvió el servidor. Añade esta prueba al final del fichero:

```js
test('la lista coincide con lo que devuelve la API', async ({ page }) => {
  // Se prepara la espera ANTES de la acción que provoca la petición
  const respuesta = page.waitForResponse('**/api/entregas');
  await page.goto('/');
  const datos = await (await respuesta).json();
  await expect(page.getByRole('listitem')).toHaveCount(datos.length);
});
```

`waitForResponse` devuelve una promesa que se cumple cuando pasa una respuesta cuya URL encaja con el
patrón. Se crea **sin `await`** antes del `goto`; si se crease después, la respuesta podría haber
pasado ya y la prueba se quedaría esperando hasta agotar el tiempo (lo compruebas en «Comprueba tu entendimiento»).

### 7 — Pulsar un botón que todavía no está listo

El botón **Actualizar** está desactivado mientras se cargan los datos. Añade una última prueba:

```js
test('actualizar vuelve a cargar la lista', async ({ page }) => {
  await page.goto('/');
  // click espera solo a que el botón esté habilitado (lo está cuando termina la primera carga)
  await page.getByRole('button', { name: 'Actualizar' }).click();
  await expect(page.getByText('Cargando entregas…')).toBeVisible();
  await expect(page.getByText('3 entregas')).toBeVisible();
});
```

```bash
# Ejecuta las tres pruebas
npx playwright test
```

**Resultado esperado:**

```text
Running 3 tests using 1 worker

  ✓  1 [chromium] › tests/entregas.spec.js:4:1 › la lista muestra las tres entregas (400ms)
  ✓  2 [chromium] › tests/entregas.spec.js:12:1 › la lista coincide con lo que devuelve la API (943ms)
  ✓  3 [chromium] › tests/entregas.spec.js:20:1 › actualizar vuelve a cargar la lista (1.8s)

  3 passed (4.5s)
```

`click()` no falla por encontrar el botón desactivado: **espera** a que sea accionable (visible,
estable, habilitado y sin nada encima) y entonces pulsa. Esa es la espera automática de las acciones.
La solución completa está en
[`solucion/tests/entregas.spec.js`](../../ejercicios/M02-03-sincronizacion/solucion/tests/entregas.spec.js).

```bash
# Ejecuta la solución 10 veces
npx playwright test --config solucion/playwright.config.js --repeat-each 10
```

## Comprueba tu entendimiento

**La espera preparada tarde**
En la prueba del paso 6, deja el `goto` primero, añade `await expect(page.getByRole('listitem')).toHaveCount(3);` y crea la espera después: `const respuesta = page.waitForResponse('**/api/entregas', { timeout: 3_000 });`. Ejecuta `npx playwright test -g API`.
→ `TimeoutError: page.waitForResponse: Timeout 3000ms exceeded while waiting for event "response"`: la respuesta ya había pasado cuando empezó a esperarla.

**Dónde está el retraso**
Ejecuta `curl -si http://localhost:3203/api/entregas` con la aplicación en marcha.
→ La cabecera `x-retraso-ms` dice cuánto ha tardado esa respuesta; cambia en cada petición.

## Experimenta

### «En mi máquina pasa»

**Predice:** si la API respondiera siempre entre 50 y 200 ms, ¿fallaría la prueba original con
`waitForTimeout(500)`? Recupera la prueba original del paso 2 en otro fichero o deshaz el cambio, y
ejecútala con la API rápida:

```bash
# La API responde entre 50 y 200 ms (Playwright pasa las variables al servidor que arranca)
RETRASO_MIN=50 RETRASO_MAX=200 npx playwright test --repeat-each 10
```

**Resultado esperado** (última línea):

```text
  10 passed (4.0s)
```

Con un servidor rápido la espera fija «funciona»: así nacen las pruebas que pasan en local y fallan
en CI. La prueba no era correcta; el entorno la tapaba.

### El límite de la espera automática

**Predice:** con la prueba corregida, ¿qué pasa si la API tarda entre 6 y 6,5 s? Ejecuta solo esa prueba:

```bash
# La API tarda más de 6 segundos
RETRASO_MIN=6000 RETRASO_MAX=6500 npx playwright test -g "tres entregas"
```

**Resultado esperado** (extracto):

```text
  ✘  1 [chromium] › tests/entregas.spec.js:4:1 › la lista muestra las tres entregas (5.1s)

    Error: expect(locator).toHaveCount(expected) failed

    Locator:  getByRole('listitem')
    Expected: 3
    Received: 0
    Timeout:  5000ms

    Call log:
      - Expect "toHaveCount" getByRole('listitem') with timeout 5000ms
      - waiting for getByRole('listitem')
        14 × locator resolved to 0 elements
           - unexpected value "0"
```

La espera automática reintenta 14 veces y se rinde a los 5 s. Si una operación tarda de verdad más
(un informe, una exportación), se amplía el límite **solo en esa aserción**:

```js
  await expect(entregas).toHaveCount(3, { timeout: 10_000 });
```

```text
  ✓  1 [chromium] › tests/entregas.spec.js:4:1 › la lista muestra las tres entregas (6.5s)

  1 passed (7.5s)
```

## Reto

### 1 — «Un segundo, por si acaso»

**La situación:** para «arreglar» la prueba inestable, un compañero sube la espera a
`waitForTimeout(1000)`. En producción la API responde entre 50 y 150 ms.

**Qué haces:** compara la suite con su arreglo y con el tuyo, en un solo worker y con la API de
producción. Pon `waitForTimeout(1000)` en la prueba original, ejecuta, y después ejecuta la versión
web-first del paso 5:

```bash
# 10 repeticiones en un solo worker, con la API rápida
RETRASO_MIN=50 RETRASO_MAX=150 npx playwright test --repeat-each 10 --workers 1
```

**Pistas:** compara la última línea de cada ejecución y lo que tarda cada prueba.

**Lo que buscas:** las dos versiones pasan; decide cuál es mejor con números y explica qué pasaría
con la del compañero si un día la API tarda 1,2 s.

<details>
<summary>Ver solución</summary>

Con `waitForTimeout(1000)`:

```text
Running 10 tests using 1 worker

  ✓   1 [chromium] › tests/entregas.spec.js:4:1 › la lista muestra las tres entregas (1.1s)
  ✓   2 [chromium] › tests/entregas.spec.js:4:1 › la lista muestra las tres entregas (1.1s)
  ...
  ✓  10 [chromium] › tests/entregas.spec.js:4:1 › la lista muestra las tres entregas (1.2s)

  10 passed (16.1s)
```

Con [aserciones web-first](../glosario/02-e2e.md#asercion-web-first):

```text
Running 10 tests using 1 worker

  ✓   1 [chromium] › tests/entregas.spec.js:4:1 › la lista muestra las tres entregas (324ms)
  ✓   2 [chromium] › tests/entregas.spec.js:4:1 › la lista muestra las tres entregas (273ms)
  ...
  ✓  10 [chromium] › tests/entregas.spec.js:4:1 › la lista muestra las tres entregas (296ms)

  10 passed (8.5s)
```

Las dos pasan, pero la espera fija cuesta más de 1 s por prueba aunque la respuesta llegue en
150 ms: la suite tarda casi el doble (16.1 s frente a 8.5 s). Y no es más fiable: si un día la API
tarda 1,2 s, vuelve a fallar. Una espera fija siempre es demasiado larga o demasiado corta. **La
regla:** se espera a una **condición** (un elemento, un texto, una respuesta), nunca a un tiempo.

</details>

## Errores frecuentes

| Síntoma | Causa probable | Cómo arreglarlo |
|---------|----------------|-----------------|
| La prueba pasa y falla sin cambiar nada | Espera fija (`waitForTimeout`) o `expect(await …)` sobre algo que se carga después | Aserciones web-first; medirlo con `--repeat-each` |
| `waitForResponse` agota el tiempo aunque la petición se ve en la red | La espera se preparó después de la acción que dispara la petición | Crear la promesa antes de la acción y hacer `await` después |
| `Timeout: 5000ms` con una aplicación correcta pero lenta | La operación tarda más que el límite por defecto | `{ timeout: … }` en esa aserción, no en toda la suite |
| Con `RETRASO_MIN=…` no cambia nada | La aplicación de otra terminal sigue en marcha y Playwright la reutiliza (`reuseExistingServer`) | Pararla con Ctrl+C y volver a lanzar las pruebas |

## Conclusiones

### Qué es la espera automática

Playwright sincroniza la prueba con la página sin pausas escritas a mano: cada **acción** espera a que
su elemento sea accionable y cada **aserción web-first** reintenta hasta cumplirse, con un límite (5 s
por defecto). Cuando lo que importa es un evento de red, `waitForResponse` espera a esa respuesta concreta.

### Cómo debe ser

| Requisito | En el lab |
|-----------|-----------|
| Sin `waitForTimeout` en las pruebas | Sustituido por `toHaveCount(3)` y `toContainText('E-101')` |
| Esperas a condiciones, no a tiempos | Lista con 3 elementos, texto «3 entregas», respuesta de `/api/entregas` |
| Esperas de red preparadas antes de la acción | `const respuesta = page.waitForResponse(...)` antes del `goto` |
| Límites ampliados solo donde hacen falta | `{ timeout: 10_000 }` en la aserción de la operación lenta |
| Estabilidad medida, no supuesta | `--repeat-each 10`: 8/10 con espera fija, 10/10 con web-first |

### Dónde se rompe y cómo lo has detectado

| Fallo | Cómo lo has visto | Qué provoca |
|-------|-------------------|-------------|
| Espera fija demasiado corta | 2 de 10 fallos con `waitForTimeout(500)` | Prueba inestable, desconfianza en la suite |
| Espera fija demasiado larga | 16.1 s frente a 8.5 s en el reto | Suite lenta sin ganar fiabilidad |
| Entorno que tapa el problema | 10/10 con la API rápida en Experimenta | «En mi máquina pasa» |
| Operación más lenta que el límite | `Timeout: 5000ms` con la API a 6 s | Falso fallo hasta ampliar el límite en esa aserción |

### Cómo se perfecciona

En un proyecto real, `--repeat-each` (o `--repeat-each` con `--workers` altos para cargar la máquina)
se usa para validar una prueba nueva antes de subirla. Las esperas fijas se buscan en la revisión de
código (`grep -rn waitForTimeout tests/`) y se tratan como deuda. Los límites se ajustan al entorno
más lento donde se ejecuta la suite, normalmente CI.

### En una frase

> 🔑 No esperes un tiempo: espera a que pase algo (un elemento, un texto, una respuesta) y deja que Playwright decida cuánto.
