# Una funcionalidad, tres niveles

[← Página anterior](01-lab-preparar-el-entorno.md) · [Siguiente página →](03-lab-primera-prueba-unitaria.md)

Esta demostración toma una sola regla de negocio, «12,50 € por entrada y, a partir de 10 entradas,
un 20 % de descuento», y la comprueba tres veces: con una prueba **unitaria** que llama a la
función, con una prueba de **API** que hace la petición HTTP y con una prueba **[end-to-end](../glosario/01-fundamentos.md#prueba-end-to-end)** que
abre el navegador y pulsa el botón como un usuario. Las tres comprueban lo mismo; lo que cambia es
cuánto sistema ponen en marcha, cuánto tardan y qué cuentan cuando fallan.

## Punto de partida

- Codespace del curso abierto (o cualquier entorno con `npm run verificar` en `Entorno listo`).
- Ejercicio: `ejercicios/M01-02-una-funcionalidad-tres-niveles/`.
- Aplicación: `node app/server.mjs` sirve la página y la API en el puerto 3102. [Playwright](../glosario/02-e2e.md#playwright) la
  arranca solo; para verla a mano se lanza ese comando y se abre el puerto 3102 desde la pestaña **Ports**.

```bash
# Carpeta de la demostración
cd ejercicios/M01-02-una-funcionalidad-tres-niveles
```

## Recorrido

### 1 — La regla y sus tres puertas

La regla vive en una función,
[`src/precio.js`](../../ejercicios/M01-02-una-funcionalidad-tres-niveles/src/precio.js):

```js
export const PRECIO_UNITARIO = 12.5;
export const MINIMO_DESCUENTO = 10;

export function calcularPrecio(unidades) {
  // …valida que unidades sea un entero mayor que 0…
  const bruto = unidades * PRECIO_UNITARIO;
  const total = unidades >= MINIMO_DESCUENTO ? bruto * 0.8 : bruto;
  return Math.round(total * 100) / 100;      // redondeo a céntimos
}
```

A esa función se llega por tres sitios: directamente desde el código, por la API
`GET /api/precio?unidades=N` que la envuelve, y por la página, cuyo formulario llama a la API y
pinta el resultado. Con el servidor en marcha, la API responde así:

```bash
# Terminal 1: arranca la aplicación (puerto 3102)
node app/server.mjs
```

```bash
# Terminal 2: pide el precio de 10 entradas y de 0 entradas (-i muestra también las cabeceras)
curl -s 'http://localhost:3102/api/precio?unidades=10'
curl -s -i 'http://localhost:3102/api/precio?unidades=0'
```

```text
{"unidades":10,"total":100}
HTTP/1.1 400 Bad Request
Content-Type: application/json; charset=utf-8
Date: Tue, 17 Nov 2026 16:21:24 GMT
Connection: keep-alive
Keep-Alive: timeout=5
Transfer-Encoding: chunked

{"error":"unidades debe ser un entero mayor que 0"}
```

10 entradas son 125 € brutos y 100 € con el descuento. Un valor no válido devuelve un `400` con
el motivo. El servidor se para con <kbd>Ctrl</kbd>+<kbd>C</kbd> en el terminal 1.

### 2 — Nivel unitario

[`pruebas/unitarias/precio.test.js`](../../ejercicios/M01-02-una-funcionalidad-tres-niveles/pruebas/unitarias/precio.test.js)
importa la función y la llama. No hay servidor ni navegador:

```js
it('10 entradas tienen un 20 % de descuento', () => {
  expect(calcularPrecio(10)).toBe(100);
});
```

```bash
# Ejecuta las pruebas unitarias con Vitest
npx vitest run
```

Los tiempos cambian en cada ejecución:

```text
 ✓ pruebas/unitarias/precio.test.js > calcularPrecio > 9 entradas no tienen descuento 1ms
 ✓ pruebas/unitarias/precio.test.js > calcularPrecio > 10 entradas tienen un 20 % de descuento 0ms

 Test Files  1 passed (1)
      Tests  2 passed (2)
   Start at  17:21:20
   Duration  113ms (transform 54%, import 27%, worker 11%, tests 8%)
```

Cada prueba tarda alrededor de un milisegundo. Casi todo el `Duration` es la preparación de [Vitest](../glosario/01-fundamentos.md#vitest).

### 3 — Nivel API

[`pruebas/api/precio.spec.js`](../../ejercicios/M01-02-una-funcionalidad-tres-niveles/pruebas/api/precio.spec.js)
usa el cliente `request` de Playwright: hace la petición HTTP y comprueba el estado y el cuerpo.
Aquí ya participan el servidor, el enrutado y la conversión a JSON:

```js
test('API: 10 entradas tienen un 20 % de descuento', async ({ request }) => {
  const respuesta = await request.get('/api/precio?unidades=10');
  expect(respuesta.status()).toBe(200);
  expect(await respuesta.json()).toEqual({ unidades: 10, total: 100 });
});
```

```bash
# Ejecuta solo las pruebas de la carpeta pruebas/api (Playwright arranca la app)
npx playwright test pruebas/api
```

```text
Running 2 tests using 1 worker

  ✓  1 [chromium] › pruebas/api/precio.spec.js:4:1 › API: 9 entradas no tienen descuento (23ms)
  ✓  2 [chromium] › pruebas/api/precio.spec.js:10:1 › API: 10 entradas tienen un 20 % de descuento (8ms)

  2 passed (608ms)
```

Cada prueba tarda decenas de milisegundos: una petición HTTP real en la misma máquina. El total
incluye arrancar el servidor.

### 4 — Nivel end-to-end

[`pruebas/e2e/precio.spec.js`](../../ejercicios/M01-02-una-funcionalidad-tres-niveles/pruebas/e2e/precio.spec.js)
abre Chromium, escribe en el campo **Entradas**, pulsa **Calcular** y lee el total que pinta la página:

```js
test('E2E: 10 entradas tienen un 20 % de descuento', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel('Entradas').fill('10');
  await page.getByRole('button', { name: 'Calcular' }).click();
  await expect(page.getByRole('status', { name: 'Total' })).toHaveText('100.00 €');
});
```

```bash
# Ejecuta solo las pruebas de la carpeta pruebas/e2e
npx playwright test pruebas/e2e
```

```text
Running 2 tests using 1 worker

  ✓  1 [chromium] › pruebas/e2e/precio.spec.js:4:1 › E2E: 9 entradas no tienen descuento (183ms)
  ✓  2 [chromium] › pruebas/e2e/precio.spec.js:11:1 › E2E: 10 entradas tienen un 20 % de descuento (124ms)

  2 passed (921ms)
```

Esta prueba es la única que comprueba lo que ve el usuario: el formato `100.00 €`, que el botón
está conectado y que la página llama a la API correcta. A cambio, tarda del orden de cien veces
más que la unitaria, en una página mínima y en local.

### 5 — El mismo error, tres avisos

En `src/precio.js` se cambia `unidades >= MINIMO_DESCUENTO` por `unidades > MINIMO_DESCUENTO`: un
error de límite que deja sin descuento justo a quien compra 10 entradas. Los tres niveles lo detectan.

```bash
# Unitarias con el error
npx vitest run
```

Extracto de la salida:

```text
 ✓ pruebas/unitarias/precio.test.js > calcularPrecio > 9 entradas no tienen descuento 1ms
 × pruebas/unitarias/precio.test.js > calcularPrecio > 10 entradas tienen un 20 % de descuento 5ms
   → expected 125 to be 100 // Object.is equality

 FAIL  pruebas/unitarias/precio.test.js > calcularPrecio > 10 entradas tienen un 20 % de descuento
AssertionError: expected 125 to be 100 // Object.is equality

- Expected
+ Received

- 100
+ 125

 ❯ pruebas/unitarias/precio.test.js:11:32

 Test Files  1 failed (1)
      Tests  1 failed | 1 passed (2)
   Duration  148ms (transform 40%, import 28%, tests 21%, worker 10%)
```

```bash
# API y E2E con el error
npx playwright test
```

Extracto de la salida:

```text
Running 4 tests using 1 worker

  ✓  1 [chromium] › pruebas/api/precio.spec.js:4:1 › API: 9 entradas no tienen descuento (29ms)
  ✘  2 [chromium] › pruebas/api/precio.spec.js:10:1 › API: 10 entradas tienen un 20 % de descuento (16ms)
  ✓  3 [chromium] › pruebas/e2e/precio.spec.js:4:1 › E2E: 9 entradas no tienen descuento (192ms)
  ✘  4 [chromium] › pruebas/e2e/precio.spec.js:11:1 › E2E: 10 entradas tienen un 20 % de descuento (5.1s)

  1) [chromium] › pruebas/api/precio.spec.js:10:1 › API: 10 entradas tienen un 20 % de descuento ───

    Error: expect(received).toEqual(expected) // deep equality

      Object {
    -   "total": 100,
    +   "total": 125,
        "unidades": 10,
      }

  2) [chromium] › pruebas/e2e/precio.spec.js:11:1 › E2E: 10 entradas tienen un 20 % de descuento ───

    Error: expect(locator).toHaveText(expected) failed

    Locator:  getByRole('status', { name: 'Total' })
    Expected: "100.00 €"
    Received: "125.00 €"
    Timeout:  5000ms

  2 failed
  2 passed (6.5s)
```

| Nivel | Qué pone en marcha | Tiempo con todo en verde | Tiempo en avisar del error | Qué señala el fallo |
|-------|--------------------|--------------------------|----------------------------|---------------------|
| Unitaria (Vitest) | Solo la función | 0–1 ms por prueba | 5 ms | La línea de la [aserción](../glosario/01-fundamentos.md#asercion) y `125` frente a `100` |
| API (Playwright `request`) | Servidor + función | 8–23 ms por prueba | 16 ms | El cuerpo JSON con `total` distinto |
| E2E (Playwright navegador) | Navegador + página + servidor + función | 124–183 ms por prueba | 5.1 s | El texto de la pantalla, tras esperar el timeout |

La E2E no falla al instante: reintenta la aserción durante 5 segundos por si la página aún se está
actualizando. Ninguno de los tres mensajes dice «el error está en `>=`», pero el unitario es el que
más cerca deja: solo puede estar en `calcularPrecio`. El fichero se deja como estaba
(`unidades >= MINIMO_DESCUENTO`).

## Qué queda visto

La misma regla se puede comprobar en tres niveles, y los tres detectan el mismo error. Lo que
cambia es el coste: la unitaria tarda milisegundos y señala la función; la E2E tarda cien veces más,
espera un timeout para fallar y señala una pantalla, pero es la única que comprueba que la página,
la API y la función encajan.

La pregunta que queda abierta: **si los tres niveles detectan el mismo error, ¿qué comprobaciones
conviene escribir en cada nivel y cuántas de cada una?**

Los laboratorios la trabajan por partes, cada uno con su propio ejercicio y sin necesidad de
haber seguido esta demostración: [Primera prueba unitaria](03-lab-primera-prueba-unitaria.md),
[Prueba de integración](04-lab-prueba-de-integracion.md) y
[La pirámide en números](05-lab-piramide-de-pruebas.md).
