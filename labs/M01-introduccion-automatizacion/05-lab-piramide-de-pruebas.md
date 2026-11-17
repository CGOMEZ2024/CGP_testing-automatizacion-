# Lab — La pirámide en números

[← Página anterior](04-lab-prueba-de-integracion.md) · [Siguiente página →](06-lab-pruebas-independientes.md)

En este lab practicas la **[pirámide de pruebas](../glosario/01-fundamentos.md#piramide-de-pruebas)** midiendo su coste: partes de una calculadora de
gastos de envío (`ejercicios/M01-05-piramide-de-pruebas/`) cuya suite tiene forma de **cono de
helado**, con todas las reglas de cálculo comprobadas en el navegador. La mides, bajas cada
comprobación al nivel más barato que la detecta (unitaria, API o E2E) y vuelves a medir.

### Objetivo

Comprender qué es la pirámide de pruebas y el coste de cada nivel: cómo funciona, cómo debe ser,
cómo se detectan sus debilidades y cómo se mejora.

### Punto de partida

- Codespace del curso abierto (o cualquier entorno con `npm run verificar` en `Entorno listo`).
- Ejercicio: `ejercicios/M01-05-piramide-de-pruebas/`:
  - `src/envio.js`: la regla de cálculo del envío.
  - `app/`: la API `/api/envio` y la página con el formulario (puerto 3105).
  - `pruebas/e2e/envio.spec.js`: la suite de partida, 8 pruebas E2E.
- `playwright.config.js` usa un solo *worker* (`workers: 1`) para medir el coste de cada prueba sin
  que el [paralelismo](../glosario/05-calidad-e-ia.md#paralelismo) lo esconda.

```bash
# Entra en la carpeta del ejercicio
cd ejercicios/M01-05-piramide-de-pruebas
```

### Qué está pasando

La tienda cobra el envío según la zona: península 4,95 € (gratis desde 60 €), Baleares 9,95 €
(gratis desde 120 €) y Canarias 14,95 € (nunca gratis). Quien escribió las pruebas lo hizo como lo
probaría una persona: abrir la página, rellenar, pulsar y mirar. Funciona, pero cada regla de
cálculo pasa por el navegador, la página, la red y el servidor para llegar a una función de diez
líneas.

| Nivel | Qué debería comprobar aquí | Por qué en ese nivel |
|-------|----------------------------|----------------------|
| **Unitaria** | Cada tarifa, cada umbral de envío gratis, cada error | La regla vive en `calcularEnvio`; es lo más rápido y señala la función |
| **API** | Que `/api/envio` responde el JSON y los estados que espera la página | Es el contrato entre la página y el servidor |
| **E2E** | Lo que solo hace la página: el formulario, el formato `4.95 €`, «Gratis», el mensaje de error | Ningún otro nivel ve la pantalla |

Elegir qué comprobar en cada nivel es una **estrategia de automatización**: no se trata de
automatizar más, sino de poner cada comprobación donde da más información por menos coste.

### 1 — Ver la aplicación y la suite

Mira primero lo que se prueba. Arranca la aplicación y ábrela desde la pestaña **Ports**
(puerto 3105, icono del globo):

```bash
# Arranca la calculadora de envío en el puerto 3105 (párala después con Ctrl+C)
node app/server.mjs
```

Calcula, por ejemplo, 30 € a **Canarias**: la página muestra `Envío: 14.95 €`. Después abre
[`pruebas/e2e/envio.spec.js`](../../ejercicios/M01-05-piramide-de-pruebas/pruebas/e2e/envio.spec.js):
ocho pruebas que repiten ese mismo recorrido, una por regla:

```js
test('canarias, 30 €: envío 14,95 €', async ({ page }) => {
  await calcular(page, '30', 'Canarias');     // abre la página, rellena y pulsa
  await expect(page.getByRole('status', { name: 'Envío' })).toHaveText('14.95 €');
});
```

Para el servidor con <kbd>Ctrl</kbd>+<kbd>C</kbd>: [Playwright](../glosario/02-e2e.md#playwright) arranca el suyo.

### 2 — Medir el cono de helado

Mides cuánto cuesta la suite tal como está.

```bash
# Ejecuta la suite E2E de partida
npx playwright test
```

**Resultado esperado** (los tiempos cambian en cada ejecución y en cada máquina):

```text
Running 8 tests using 1 worker

  ✓  1 [chromium] › pruebas/e2e/envio.spec.js:12:1 › península, 30 €: envío 4,95 € (245ms)
  ✓  2 [chromium] › pruebas/e2e/envio.spec.js:17:1 › península, 59,99 €: envío 4,95 € (252ms)
  ✓  3 [chromium] › pruebas/e2e/envio.spec.js:22:1 › península, 60 €: envío gratis (200ms)
  ✓  4 [chromium] › pruebas/e2e/envio.spec.js:27:1 › baleares, 100 €: envío 9,95 € (158ms)
  ✓  5 [chromium] › pruebas/e2e/envio.spec.js:32:1 › baleares, 120 €: envío gratis (184ms)
  ✓  6 [chromium] › pruebas/e2e/envio.spec.js:37:1 › canarias, 30 €: envío 14,95 € (154ms)
  ✓  7 [chromium] › pruebas/e2e/envio.spec.js:42:1 › canarias, 500 €: envío 14,95 € (nunca gratis) (156ms)
  ✓  8 [chromium] › pruebas/e2e/envio.spec.js:47:1 › importe negativo: mensaje de error (161ms)

  8 passed (2.3s)
```

Entre 150 y 250 ms por prueba, 2.3 s en total. En una página mínima y en local parece poco; en
una aplicación real cada E2E tarda segundos, y con cientos de reglas la suite tarda lo que tarda
la prueba más lenta multiplicado por cientos.

### 3 — Medir cuánto tarda en avisar de un error

El coste que más importa no es el de la suite en verde, sino cuánto tarda en decirte que has roto
algo. Simula un error: en `src/envio.js` cambia la tarifa de Canarias de `coste: 14.95` a
`coste: 12.95`.

```bash
# Ejecuta la suite E2E con la tarifa de Canarias equivocada
npx playwright test
```

**Resultado esperado** (extracto; los tiempos cambian):

```text
  ✓  5 [chromium] › pruebas/e2e/envio.spec.js:32:1 › baleares, 120 €: envío gratis (146ms)
  ✘  6 [chromium] › pruebas/e2e/envio.spec.js:37:1 › canarias, 30 €: envío 14,95 € (5.1s)
  ✘  7 [chromium] › pruebas/e2e/envio.spec.js:42:1 › canarias, 500 €: envío 14,95 € (nunca gratis) (5.3s)
  ✓  8 [chromium] › pruebas/e2e/envio.spec.js:47:1 › importe negativo: mensaje de error (317ms)

  1) [chromium] › pruebas/e2e/envio.spec.js:37:1 › canarias, 30 €: envío 14,95 € ───────────────────

    Error: expect(locator).toHaveText(expected) failed

    Locator:  getByRole('status', { name: 'Envío' })
    Expected: "14.95 €"
    Received: "12.95 €"
    Timeout:  5000ms

  2 failed
    [chromium] › pruebas/e2e/envio.spec.js:37:1 › canarias, 30 €: envío 14,95 € ────────────────────
    [chromium] › pruebas/e2e/envio.spec.js:42:1 › canarias, 500 €: envío 14,95 € (nunca gratis) ────
  6 passed (14.4s)
```

Cada prueba que falla espera 5 segundos (el timeout de la [aserción](../glosario/01-fundamentos.md#asercion)) por si la página aún no ha
pintado el valor correcto. La suite pasa de 2.3 s a 14.4 s justo cuando más prisa tienes, y el
mensaje habla de una pantalla, no de la función. **Deja la tarifa en `14.95`.**

### 4 — Bajar las reglas a pruebas unitarias

Las siete combinaciones de zona e importe y los dos errores son reglas de `calcularEnvio`: su
sitio es una [prueba unitaria](../glosario/01-fundamentos.md#prueba-unitaria). Crea el fichero `pruebas/unitarias/envio.test.js` con una tabla de
casos (`it.each`) y las dos pruebas de error:

```js
// Las reglas de cálculo, en su nivel: pruebas unitarias de calcularEnvio.
import { describe, it, expect } from 'vitest';
import { calcularEnvio } from '../../src/envio.js';

describe('calcularEnvio', () => {
  it.each([
    { importe: 30, zona: 'peninsula', coste: 4.95 },
    { importe: 59.99, zona: 'peninsula', coste: 4.95 },
    { importe: 60, zona: 'peninsula', coste: 0 },
    { importe: 100, zona: 'baleares', coste: 9.95 },
    { importe: 120, zona: 'baleares', coste: 0 },
    { importe: 30, zona: 'canarias', coste: 14.95 },
    { importe: 500, zona: 'canarias', coste: 14.95 },
  ])('$zona, $importe €: envío $coste €', ({ importe, zona, coste }) => {
    expect(calcularEnvio(importe, zona)).toBe(coste);
  });

  it('un importe negativo es un error', () => {
    expect(() => calcularEnvio(-5, 'peninsula')).toThrow('El importe no puede ser negativo');
  });

  it('una zona desconocida es un error', () => {
    expect(() => calcularEnvio(30, 'andorra')).toThrow('Zona desconocida: andorra');
  });
});
```

```bash
# Ejecuta las pruebas unitarias
npx vitest run
```

**Resultado esperado:**

```text
 ✓ pruebas/unitarias/envio.test.js > calcularEnvio > peninsula, 30 €: envío 4.95 € 1ms
 ✓ pruebas/unitarias/envio.test.js > calcularEnvio > peninsula, 59.99 €: envío 4.95 € 0ms
 ✓ pruebas/unitarias/envio.test.js > calcularEnvio > peninsula, 60 €: envío 0 € 0ms
 ✓ pruebas/unitarias/envio.test.js > calcularEnvio > baleares, 100 €: envío 9.95 € 0ms
 ✓ pruebas/unitarias/envio.test.js > calcularEnvio > baleares, 120 €: envío 0 € 0ms
 ✓ pruebas/unitarias/envio.test.js > calcularEnvio > canarias, 30 €: envío 14.95 € 0ms
 ✓ pruebas/unitarias/envio.test.js > calcularEnvio > canarias, 500 €: envío 14.95 € 0ms
 ✓ pruebas/unitarias/envio.test.js > calcularEnvio > un importe negativo es un error 1ms
 ✓ pruebas/unitarias/envio.test.js > calcularEnvio > una zona desconocida es un error 1ms

 Test Files  1 passed (1)
      Tests  9 passed (9)
   Start at  17:25:39
   Duration  126ms (transform 52%, import 27%, tests 11%, worker 9%)
```

Las mismas reglas que costaban 150–250 ms cada una cuestan ahora 0–1 ms. Y aparece una comprobación
que desde la página era imposible: la zona desconocida, porque el desplegable solo ofrece tres.

### 5 — Probar el contrato de la API

La página depende de que `/api/envio` responda un JSON con `coste` y un `400` con `error` cuando algo
va mal. Eso es el contrato entre las dos piezas, y se prueba sin navegador con el cliente `request`
de Playwright. Crea `pruebas/api/envio.spec.js`:

```js
// El contrato de la API: lo que la página espera recibir de /api/envio.
import { test, expect } from '@playwright/test';

test('API: responde 200 con importe, zona y coste', async ({ request }) => {
  const respuesta = await request.get('/api/envio?importe=30&zona=peninsula');
  expect(respuesta.status()).toBe(200);
  expect(await respuesta.json()).toEqual({ importe: 30, zona: 'peninsula', coste: 4.95 });
});

test('API: una zona desconocida responde 400 con el motivo', async ({ request }) => {
  const respuesta = await request.get('/api/envio?importe=30&zona=andorra');
  expect(respuesta.status()).toBe(400);
  expect(await respuesta.json()).toEqual({ error: 'Zona desconocida: andorra' });
});
```

```bash
# Ejecuta solo las pruebas de API
npx playwright test pruebas/api
```

**Resultado esperado:**

```text
Running 2 tests using 1 worker

  ✓  1 [chromium] › pruebas/api/envio.spec.js:4:1 › API: responde 200 con importe, zona y coste (30ms)
  ✓  2 [chromium] › pruebas/api/envio.spec.js:10:1 › API: una zona desconocida responde 400 con el motivo (11ms)

  2 passed (729ms)
```

### 6 — Dejar en E2E solo lo que hace la página

Ahora que las reglas y el contrato están cubiertos abajo, la suite E2E solo tiene que comprobar lo
que únicamente la página hace: enviar el formulario y mostrar el resultado en sus tres formas
(precio con formato, «Gratis» y mensaje de error). Sustituye las ocho pruebas de
`pruebas/e2e/envio.spec.js` (deja la función `calcular`) por estas tres:

```js
test('muestra el coste con dos decimales y el símbolo del euro', async ({ page }) => {
  await calcular(page, '30', 'Península');
  await expect(page.getByRole('status', { name: 'Envío' })).toHaveText('4.95 €');
});

test('muestra «Gratis» cuando el envío no cuesta nada', async ({ page }) => {
  await calcular(page, '60', 'Península');
  await expect(page.getByRole('status', { name: 'Envío' })).toHaveText('Gratis');
});

test('muestra el mensaje de error de la API', async ({ page }) => {
  await calcular(page, '-5', 'Península');
  await expect(page.getByRole('status', { name: 'Envío' })).toHaveText('El importe no puede ser negativo');
});
```

```bash
# Ejecuta las pruebas de API y E2E
npx playwright test
```

**Resultado esperado:**

```text
Running 5 tests using 1 worker

  ✓  1 [chromium] › pruebas/api/envio.spec.js:4:1 › API: responde 200 con importe, zona y coste (29ms)
  ✓  2 [chromium] › pruebas/api/envio.spec.js:10:1 › API: una zona desconocida responde 400 con el motivo (11ms)
  ✓  3 [chromium] › pruebas/e2e/envio.spec.js:12:1 › muestra el coste con dos decimales y el símbolo del euro (184ms)
  ✓  4 [chromium] › pruebas/e2e/envio.spec.js:17:1 › muestra «Gratis» cuando el envío no cuesta nada (149ms)
  ✓  5 [chromium] › pruebas/e2e/envio.spec.js:22:1 › muestra el mensaje de error de la API (134ms)

  5 passed (1.3s)
```

La suite tiene ya forma de pirámide: 9 unitarias, 2 de API y 3 E2E.

### 7 — Volver a medir el aviso de error

Repites el error del paso 3 (`coste: 12.95` en Canarias) y ejecutas los dos niveles, empezando
por el rápido, como haría un [pipeline](../glosario/04-ci-cd.md#pipeline).

```bash
# Primero las unitarias: son las que avisan antes
npx vitest run
```

**Resultado esperado** (extracto):

```text
 × pruebas/unitarias/envio.test.js > calcularEnvio > canarias, 30 €: envío 14.95 € 6ms
   → expected 12.95 to be 14.95 // Object.is equality
 × pruebas/unitarias/envio.test.js > calcularEnvio > canarias, 500 €: envío 14.95 € 1ms
   → expected 12.95 to be 14.95 // Object.is equality

 ❯ pruebas/unitarias/envio.test.js:15:42

 Test Files  1 failed (1)
      Tests  2 failed | 7 passed (9)
   Duration  170ms (transform 35%, tests 28%, import 26%, worker 11%)
```

```bash
# Después la API y la E2E
npx playwright test
```

```text
  5 passed (1.2s)
```

El error aparece en 170 ms, con el valor esperado y el recibido, en la prueba de `calcularEnvio`.
Las E2E siguen en verde: no comprueban tarifas, y no tienen por qué. **Deja la tarifa en `14.95`.**

| | [Cono de helado](../glosario/01-fundamentos.md#cono-de-helado) (paso 2–3) | Pirámide (paso 6–7) |
|---|---|---|
| Pruebas | 8 E2E | 9 unitarias + 2 API + 3 E2E |
| Suite en verde | 2.3 s | 126 ms ([Vitest](../glosario/01-fundamentos.md#vitest)) + 1.3 s (Playwright) |
| Aviso del error de tarifa | 14.4 s, en una pantalla | 170 ms, en `calcularEnvio` |
| Comprobaciones imposibles desde la página | Zona desconocida sin probar | Probada en unitaria y en API |

## Comprueba tu entendimiento

**Cada nivel comprueba lo suyo**
Cambia en `app/public/index.html` el texto `'Gratis'` por `'Sin coste'` y ejecuta `npx vitest run` y
`npx playwright test`.
→ Las 9 unitarias y las 2 de API pasan; solo falla la E2E «muestra «Gratis» cuando el envío no
cuesta nada»: el cambio está en la página, y solo la E2E mira la página. Deja `'Gratis'`.

## Experimenta

**¿Arregla el paralelismo el cono de helado?** Alguien propone no tocar la suite de ocho E2E y
ejecutarla en paralelo. Recupera la suite original desde git, pon otra vez el error de tarifa
(`coste: 12.95` en Canarias) y predice cuánto tarda con cuatro *workers*:

```bash
# Recupera la suite E2E original (8 pruebas); tu versión está también en solucion/
git checkout -- pruebas/e2e/envio.spec.js
```

```bash
# Solo las E2E, en cuatro procesos, repartiendo también las pruebas de un mismo fichero
npx playwright test pruebas/e2e --fully-parallel --workers=4
```

**Resultado esperado** (extracto, con la tarifa de Canarias a 12.95):

```text
Running 8 tests using 4 workers
  ✓  1 [chromium] › pruebas/e2e/envio.spec.js:17:1 › península, 59,99 €: envío 4,95 € (401ms)
  ✓  3 [chromium] › pruebas/e2e/envio.spec.js:27:1 › baleares, 100 €: envío 9,95 € (393ms)
  ✓  2 [chromium] › pruebas/e2e/envio.spec.js:12:1 › península, 30 €: envío 4,95 € (378ms)
  ✓  4 [chromium] › pruebas/e2e/envio.spec.js:22:1 › península, 60 €: envío gratis (330ms)
  ✓  5 [chromium] › pruebas/e2e/envio.spec.js:32:1 › baleares, 120 €: envío gratis (204ms)
  ✓  8 [chromium] › pruebas/e2e/envio.spec.js:47:1 › importe negativo: mensaje de error (214ms)
  ✘  6 [chromium] › pruebas/e2e/envio.spec.js:37:1 › canarias, 30 €: envío 14,95 € (5.3s)
  ✘  7 [chromium] › pruebas/e2e/envio.spec.js:42:1 › canarias, 500 €: envío 14,95 € (nunca gratis) (5.3s)
  2 failed
  6 passed (6.7s)
```

De 14.4 s a 6.7 s, pero cada prueba se ha vuelto más lenta (330–400 ms frente a 150–250 ms) porque
compiten por la CPU, y el aviso sigue siendo 40 veces más lento que el de la unitaria. Sin
`--fully-parallel`, Playwright reparte por ficheros y, con uno solo, sigue usando un *worker*.
El paralelismo reduce el tiempo; no cambia el coste. Deja la tarifa en `14.95` y recupera tu
versión de la suite (la de tres E2E), que es la misma que la de la solución:

```bash
# Vuelve a la suite E2E en forma de pirámide
cp solucion/pruebas/e2e/envio.spec.js pruebas/e2e/envio.spec.js
```

## Reto

### 1 — Una regla nueva: ¿cuántas pruebas tocas?

**La situación:** marketing decide que Canarias también tenga envío gratis, **desde 200 €**. Con
la suite en forma de pirámide, quieres saber cuánto cuesta el cambio en pruebas.

**Qué haces:**

1. En `pruebas/unitarias/envio.test.js`, cambia la fila de 500 € en Canarias y añade las del límite.
2. Ejecuta `npx vitest run` y mira fallar las filas nuevas.
3. Cambia la tarifa de Canarias en `src/envio.js` (y su comentario).
4. Ejecuta `npx vitest run` y `npx playwright test`.

**Pistas:** la tarifa está en el objeto `TARIFAS`, en `gratisDesde`. Los límites son 199,99 €
(paga) y 200 € (gratis).

**Lo que buscas:** el cambio de regla solo toca `src/envio.js` y la tabla de unitarias; la API y
las E2E siguen pasando **sin modificarlas**.

<details>
<summary>Ver solución</summary>

En la tabla de `pruebas/unitarias/envio.test.js`, la fila `{ importe: 500, zona: 'canarias', coste: 14.95 }`
se sustituye por:

```js
    { importe: 199.99, zona: 'canarias', coste: 14.95 },
    { importe: 200, zona: 'canarias', coste: 0 },
```

En `src/envio.js`:

```js
//   canarias  14,95 €  · gratis desde 200 €
  canarias: { coste: 14.95, gratisDesde: 200 },
```

```text
 ✓ pruebas/unitarias/envio.test.js > calcularEnvio > canarias, 30 €: envío 14.95 € 0ms
 ✓ pruebas/unitarias/envio.test.js > calcularEnvio > canarias, 199.99 €: envío 14.95 € 0ms
 ✓ pruebas/unitarias/envio.test.js > calcularEnvio > canarias, 200 €: envío 0 € 0ms
      Tests  10 passed (10)
   Duration  142ms (transform 49%, import 30%, tests 12%, worker 8%)
```

```text
Running 5 tests using 1 worker
  ✓  1 [chromium] › pruebas/api/envio.spec.js:4:1 › API: responde 200 con importe, zona y coste (55ms)
  ✓  2 [chromium] › pruebas/api/envio.spec.js:10:1 › API: una zona desconocida responde 400 con el motivo (30ms)
  ✓  3 [chromium] › pruebas/e2e/envio.spec.js:12:1 › muestra el coste con dos decimales y el símbolo del euro (255ms)
  ✓  4 [chromium] › pruebas/e2e/envio.spec.js:17:1 › muestra «Gratis» cuando el envío no cuesta nada (165ms)
  ✓  5 [chromium] › pruebas/e2e/envio.spec.js:22:1 › muestra el mensaje de error de la API (160ms)
  5 passed (1.6s)
```

Con la suite original, la misma regla rompe la E2E «canarias, 500 €: envío 14,95 € (nunca gratis)»,
que tarda 5.2 s en fallar y hay que reescribir a mano:

```text
  ✘  7 [chromium] › pruebas/e2e/envio.spec.js:42:1 › canarias, 500 €: envío 14,95 € (nunca gratis) (5.2s)
  1 failed
  7 passed (9.2s)
```

En un proyecto real, las reglas de negocio cambian mucho más que la forma de la pantalla: con la
pirámide, cada cambio de regla se paga en filas de una tabla unitaria. La solución completa está en
`solucion/`:

```bash
# Unitarias y Playwright de la solución
npx vitest run --root solucion
npx playwright test --config solucion/playwright.config.js
```

**La regla:** cada comprobación en el nivel más bajo que la detecta; las E2E, solo para lo que
únicamente se ve en la pantalla.

</details>

## Errores frecuentes

| Síntoma | Causa probable | Cómo arreglarlo |
|---------|----------------|-----------------|
| `No test files found` al ejecutar `npx vitest run` | Aún no has creado `pruebas/unitarias/envio.test.js`, o lo has nombrado `.spec.js` | Vitest ejecuta los `*.test.js`; Playwright, los `*.spec.js` |
| `npx playwright test` falla con `TypeError: Cannot read properties of undefined (reading 'config')` en `describe` | Has nombrado la unitaria `.spec.js` y Playwright intenta ejecutarla | Renómbrala a `envio.test.js` |
| `Cannot find module '../../src/envio.js'` | El fichero de pruebas no está en `pruebas/unitarias/` | Respeta la carpeta: la ruta del `import` depende de ella |
| Las E2E fallan a los 5 s con `Received: "—"` | La página no recibe respuesta de la API | Comprueba que nada más ocupa el puerto 3105 y vuelve a ejecutar |
| Los tiempos no se parecen a los de la página | Cada máquina y cada ejecución es distinta | Compara proporciones (unitaria frente a E2E), no milisegundos exactos |

```bash
# Unitarias (ficheros *.test.js)
npx vitest run
```

```bash
# API y E2E (ficheros *.spec.js)
npx playwright test
```

## Conclusiones

### Qué es la pirámide de pruebas

Una forma de repartir las pruebas por niveles según su coste: muchas unitarias en la base, algunas
de API e integración en el centro y pocas E2E en la punta. Su contrario, el **cono de helado**,
comprueba casi todo desde la interfaz.

```text
  Cono de helado (inicio)        Pirámide (final)
  ┌──────────────────┐                /\
  │   8 E2E          │               /3 \       E2E: formulario y formato
  └──────────────────┘              /----\
         \    /                    / 2 API\     contrato de /api/envio
          \  /                    /--------\
           \/  0 unitarias       / 9 unit.  \   cada tarifa, umbral y error
                                /____________\
```

### Cómo debe ser

| Requisito | En el lab |
|-----------|-----------|
| Cada regla en una unitaria | 9 casos de `calcularEnvio`, 0–1 ms cada uno |
| El contrato entre piezas en API | 2 pruebas de `/api/envio`: 200 con `coste` y 400 con `error` |
| La E2E, solo para lo que se ve | 3 pruebas: precio con formato, «Gratis», mensaje de error |
| El aviso de error, en lo más rápido | 170 ms en la unitaria frente a 14.4 s en el cono |
| Cambiar una regla cuesta poco | La regla nueva de Canarias solo toca la tabla unitaria |

### Dónde se rompe y cómo lo has detectado

| Fallo | Cómo lo has visto | Qué provoca |
|-------|-------------------|-------------|
| Reglas comprobadas en E2E | 8 pruebas a 150–250 ms para una función de diez líneas | Suite lenta que crece con cada regla |
| Fallo en E2E espera el timeout | 2 fallos a 5.1–5.3 s; la suite pasa de 2.3 s a 14.4 s | El feedback más lento cuando más se necesita |
| Paralelizar en lugar de bajar de nivel | `--fully-parallel --workers=4`: 6.7 s, cada prueba más lenta | Más máquina para el mismo coste |
| Casos imposibles desde la interfaz | La zona desconocida no se podía probar desde el desplegable | Huecos de cobertura que el cono no ve |

### Cómo se perfecciona

En un pipeline real, las unitarias se ejecutan primero y cortan la ejecución si fallan; las de
API y las E2E van después o en paralelo. La forma de la suite se revisa periódicamente midiendo
tiempos y contando pruebas por nivel, y cada fallo encontrado en E2E se pregunta: ¿podría haberlo
encontrado una prueba más abajo?

### En una frase

> 🔑 La pirámide no va de tener menos E2E, sino de comprobar cada cosa en el nivel más barato que
> la detecta: aquí, el mismo error pasó de avisar en 14.4 s a avisar en 170 ms.
