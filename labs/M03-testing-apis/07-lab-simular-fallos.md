# Lab — Simular fallos

[← Página anterior](06-lab-mock-desde-el-contrato.md) · [Siguiente página →](../M04-ci-cd-testing-continuo/README.md)

Practicas la **[intercepción de red](../glosario/03-apis.md#intercepcion-de-red)** con una página que lista
pedidos llamando a una API. La API real siempre responde bien, así que no hay forma de ver qué hace la página
cuando falla. Con `page.route` de [Playwright](../glosario/02-e2e.md#playwright) interceptas esa llamada y simulas un 500, una respuesta lenta,
una caída de red y una lista vacía, y compruebas que la página muestra lo que debe.

### Objetivo

Comprender qué es la intercepción de red (stub): cómo funciona, cómo debe ser, cómo se detectan sus
debilidades y cómo se mejora.

### Punto de partida

- Codespace del curso abierto y un terminal en
  [`ejercicios/M03-07-simular-fallos/`](../../ejercicios/M03-07-simular-fallos/README.md).
- Sin credenciales. `app/server.mjs` (puerto 3307) sirve la página `app/public/index.html` y la API
  `/api/pedidos` con dos pedidos.
- Las pruebas usan Chromium; Playwright arranca la app (`webServer`).

```bash
# Entra en la carpeta del ejercicio
cd ejercicios/M03-07-simular-fallos
```

### Qué está pasando

Una interfaz tiene que comportarse bien cuando el backend falla: avisar del error, mostrar que está
cargando, distinguir «no hay datos» de «no hay conexión». Esos estados casi nunca se prueban porque el
backend de pruebas no falla cuando tú quieres. Interceptar la red resuelve eso: la prueba se coloca entre el
navegador y la API y decide qué respuesta recibe la página. Es un **stub**: una respuesta preparada para
una prueba concreta, dentro del navegador, sin tocar el servidor (a diferencia del [mock](../glosario/01-fundamentos.md#mock) de servicio del
[lab anterior](06-lab-mock-desde-el-contrato.md), que sustituye a toda la API para todos sus clientes).

| Herramienta de `page.route` | Qué hace con la petición interceptada |
|-----------------------------|----------------------------------------|
| `route.fulfill({ status, body, json })` | Responde con lo que le das; la petición no llega al servidor |
| `route.abort('connectionrefused')` | La corta: el navegador ve un error de red |
| `route.continue()` | La deja pasar al servidor real (tras esperar, cambiar [cabeceras](../glosario/03-apis.md#cabecera-http)…) |

### 1 — Ejecutar la prueba de partida

```bash
# Ejecuta las pruebas en Chromium (Playwright arranca la app en el puerto 3307)
npx playwright test
```

**Resultado esperado** (los tiempos cambian):

```text
Running 1 test using 1 worker

  ✓  1 [chromium] › tests/pedidos.spec.js:4:1 › muestra los pedidos de la API (212ms)

  1 passed (1.5s)
```

Una única prueba: la del caso en que todo va bien.

### 2 — Ver la página y la API en crudo

Arranca la app a mano y mírala como la vería un usuario.

```bash
# Terminal 2: arranca la app
cd ejercicios/M03-07-simular-fallos
PORT=3307 node app/server.mjs
```

En la pestaña **Ports** de VS Code, abre la dirección del puerto **3307** (icono del globo): la página
muestra «Pedidos» y la lista `Pedido 1042 · Ana · 59.90 €`, `Pedido 1043 · Luis · 12.50 €`. Pide también la
API:

```bash
# Terminal 1: la respuesta que consume la página
curl -i http://localhost:3307/api/pedidos
```

**Resultado esperado** (la fecha cambia):

```text
HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8
Date: Tue, 17 Nov 2026 16:30:19 GMT
Connection: keep-alive
Keep-Alive: timeout=5
Transfer-Encoding: chunked

[{"id":1042,"cliente":"Ana","total":59.9},{"id":1043,"cliente":"Luis","total":12.5}]
```

Abre `app/public/index.html`: el script escribe `Cargando pedidos…` en el párrafo `role="status"`, llama a
`fetch('/api/pedidos')` y, según lo que pase, pinta la lista, escribe `No hay pedidos`, o muestra un error en
el párrafo `role="alert"`: `No se han podido cargar los pedidos (error N)` si el estado no es 2xx, o
`Sin conexión con el servidor` si `fetch` falla. Ninguno de esos caminos se ve con la API real. Para la app
con `Ctrl+C` en el terminal 2.

### 3 — Simular un 500

`page.route` se declara **antes** de `page.goto`: así la página nunca ve la API real. Añade al final de
`tests/pedidos.spec.js`:

```js
test('muestra un error si la API responde 500', async ({ page }) => {
  // Antes de abrir la página: toda petición a /api/pedidos recibe un 500 inventado
  await page.route('**/api/pedidos', (route) =>
    route.fulfill({ status: 500, contentType: 'application/json', body: '{"error":"Error interno"}' }),
  );
  await page.goto('/');
  await expect(page.getByRole('alert')).toHaveText('No se han podido cargar los pedidos (error 500)');
  await expect(page.getByRole('listitem')).toHaveCount(0);
});
```

```bash
# Ejecuta la prueba del 500
npx playwright test -g "500"
```

**Resultado esperado:**

```text
Running 1 test using 1 worker

  ✓  1 [chromium] › tests/pedidos.spec.js:11:1 › muestra un error si la API responde 500 (164ms)

  1 passed (1.1s)
```

`**/api/pedidos` es un patrón *glob*: cualquier origen, esa ruta.

### 4 — Simular una respuesta lenta

Ahora la API responde bien pero tarde. La prueba retiene la petición 2 s y luego la deja pasar al servidor
real con `route.continue()`; mientras, la página debe decir que está cargando. Añade:

```js
test('muestra «Cargando» mientras la API tarda', async ({ page }) => {
  await page.route('**/api/pedidos', async (route) => {
    await new Promise((resolver) => setTimeout(resolver, 2000)); // retrasa la respuesta 2 s
    await route.continue(); // y después deja pasar la petición a la API real
  });
  await page.goto('/');
  await expect(page.getByRole('status')).toHaveText('Cargando pedidos…');
  await expect(page.getByRole('listitem')).toHaveCount(2);
  await expect(page.getByRole('status')).toBeEmpty();
});
```

```bash
# Ejecuta la prueba de la respuesta lenta
npx playwright test -g "Cargando"
```

**Resultado esperado:**

```text
Running 1 test using 1 worker

  ✓  1 [chromium] › tests/pedidos.spec.js:21:1 › muestra «Cargando» mientras la API tarda (2.5s)

  1 passed (3.6s)
```

La prueba dura lo que el retraso: 2 s de [espera fija](../glosario/02-e2e.md#espera-fija) por prueba. Lo mejoras en «Mejora».

### 5 — Simular una caída de red

Sin respuesta ninguna: `route.abort` hace que `fetch` falle como si el servidor estuviera apagado. Añade:

```js
test('avisa si no hay conexión', async ({ page }) => {
  // La petición no llega a ningún servidor: el navegador recibe un error de red
  await page.route('**/api/pedidos', (route) => route.abort('connectionrefused'));
  await page.goto('/');
  await expect(page.getByRole('alert')).toHaveText('Sin conexión con el servidor');
});
```

```bash
# Ejecuta la prueba de la caída de red
npx playwright test -g "conexión"
```

**Resultado esperado:**

```text
Running 1 test using 1 worker

  ✓  1 [chromium] › tests/pedidos.spec.js:32:1 › avisa si no hay conexión (235ms)

  1 passed (1.4s)
```

### 6 — Simular una lista vacía y ejecutar todo

El último estado: la API funciona pero no hay pedidos. `route.fulfill({ json })` responde 200 con ese JSON.
Añade:

```js
test('dice que no hay pedidos si la lista llega vacía', async ({ page }) => {
  await page.route('**/api/pedidos', (route) => route.fulfill({ json: [] }));
  await page.goto('/');
  await expect(page.getByRole('status')).toHaveText('No hay pedidos');
});
```

```bash
# Ejecuta todas las pruebas
npx playwright test
```

**Resultado esperado:**

```text
Running 5 tests using 1 worker

  ✓  1 [chromium] › tests/pedidos.spec.js:4:1 › muestra los pedidos de la API (202ms)
  ✓  2 [chromium] › tests/pedidos.spec.js:11:1 › muestra un error si la API responde 500 (140ms)
  ✓  3 [chromium] › tests/pedidos.spec.js:21:1 › muestra «Cargando» mientras la API tarda (2.4s)
  ✓  4 [chromium] › tests/pedidos.spec.js:32:1 › avisa si no hay conexión (78ms)
  ✓  5 [chromium] › tests/pedidos.spec.js:39:1 › dice que no hay pedidos si la lista llega vacía (89ms)

  5 passed (4.8s)
```

Cinco estados de la página probados con una API que siempre responde bien.

## Comprueba tu entendimiento

**Quién escribe el mensaje**
En la prueba del 500, cambia `status: 500` por `status: 503` (deja el texto esperado igual) y ejecútala:

```bash
# Ejecuta la prueba del 500
npx playwright test -g "500"
```
→ Falla con `Expected: "…(error 500)"` y `Received: "…(error 503)"`: el estado lo has inventado tú y la
página lo ha mostrado tal cual; la API real no ha intervenido. Vuelve a poner `500`.

**El orden importa**
Mueve, en la prueba del 500, la línea `await page.goto('/');` antes de `page.route(…)` y ejecútala con el mismo comando.
→ Falla con `element(s) not found`: cuando se instala la intercepción, la página ya ha pedido los pedidos a
la API real y no hay alerta. Vuelve a dejarla como estaba.

## Experimenta

Un compañero escribe el patrón como `'**/api/pedido'` (sin la «s»). **Predice:** ¿falla la prueba del 500
o pasa sin probar nada?

Cambia el patrón en la prueba del 500 y ejecútala:

```bash
# Ejecuta la prueba del 500 con el patrón mal escrito
npx playwright test -g "500"
```

**Resultado esperado** (extracto):

```text
  ✘  1 [chromium] › tests/pedidos.spec.js:11:1 › muestra un error si la API responde 500 (5.2s)

    Error: expect(locator).toHaveText(expected) failed

    Locator: getByRole('alert')
    Expected: "No se han podido cargar los pedidos (error 500)"
    Timeout: 5000ms
    Error: element(s) not found
…
  1 failed
```

El patrón no coincide con ninguna petición, así que la página recibe la API real y no hay alerta. Aquí la
prueba falla porque comprueba el efecto (la alerta); una prueba que solo instalara la ruta y comprobara
«que la página carga» habría pasado sin simular nada. Vuelve a poner `'**/api/pedidos'`.

## Mejora

Los 2 s fijos del paso 4 hacen la prueba lenta y, en una máquina cargada, frágil. Mejor: retener la
respuesta **hasta que la prueba haya comprobado el estado de carga** y liberarla entonces. Sustituye la
prueba `muestra «Cargando» mientras la API tarda` por:

```js
test('muestra «Cargando» mientras la API tarda', async ({ page }) => {
  // La respuesta queda retenida hasta que la prueba llame a liberar()
  let liberar;
  const retenida = new Promise((resolver) => (liberar = resolver));
  await page.route('**/api/pedidos', async (route) => {
    await retenida;
    await route.continue();
  });
  await page.goto('/');
  await expect(page.getByRole('status')).toHaveText('Cargando pedidos…');
  liberar(); // ahora sí: la API responde
  await expect(page.getByRole('listitem')).toHaveCount(2);
  await expect(page.getByRole('status')).toBeEmpty();
});
```

```bash
# Ejecuta la prueba mejorada
npx playwright test -g "Cargando"
```

**Resultado esperado:**

```text
Running 1 test using 1 worker

  ✓  1 [chromium] › tests/pedidos.spec.js:21:1 › muestra «Cargando» mientras la API tarda (219ms)

  1 passed (1.3s)
```

De 2,5 s a unas décimas, y sin depender de cuánto tarde la máquina: la prueba controla el momento exacto en
que llega la respuesta.

## Reto

### 1 — Un 200 que no trae nada

**La situación:** en producción, un proxy corta a veces la respuesta y la página recibe un `200` con el
cuerpo vacío. Soporte recibe quejas de usuarios que ven «Sin conexión con el servidor» con la red
funcionando.

**Qué haces:** crea `tests/reto.spec.js` con una prueba que simule `200` con cuerpo vacío y espere en la
alerta `Respuesta no válida del servidor`. Ejecútala. Cuando falle, corrige `app/public/index.html` para que
distinga «no hay respuesta» (error de `fetch`) de «hay respuesta, pero el cuerpo no vale» (error de
`json()`), y vuelve a ejecutar todas las pruebas.

**Pistas:** `route.fulfill({ status: 200, contentType: 'application/json', body: '' })`; en la página, el
`try` actual envuelve a la vez el `fetch` y el `respuesta.json()`: sepáralos en dos `try` con mensajes
distintos.

**Lo que buscas:** la prueba del reto falla con la página original (`Received: "Sin conexión con el
servidor"`) y, tras la corrección, pasan las seis pruebas.

<details>
<summary>Ver solución</summary>

```js
// tests/reto.spec.js — también en solucion/tests/reto.spec.js
import { test, expect } from '@playwright/test';

test('avisa si la API responde 200 sin cuerpo', async ({ page }) => {
  await page.route('**/api/pedidos', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: '' }),
  );
  await page.goto('/');
  await expect(page.getByRole('alert')).toHaveText('Respuesta no válida del servidor');
});
```

Con la página original (extracto):

```text
  ✘  1 [chromium] › tests/reto.spec.js:4:1 › avisa si la API responde 200 sin cuerpo (5.1s)

    Error: expect(locator).toHaveText(expected) failed

    Locator:  getByRole('alert')
    Expected: "Respuesta no válida del servidor"
    Received: "Sin conexión con el servidor"
    Timeout:  5000ms
…
  1 failed
```

La corrección de la página (`solucion/app/public/index.html`), en el lugar del bloque desde
`estado.textContent = 'Cargando pedidos…';` hasta el final del `catch`:

```js
    function pintar(pedidos) {
      estado.textContent = pedidos.length === 0 ? 'No hay pedidos' : '';
      for (const pedido of pedidos) {
        const li = document.createElement('li');
        li.textContent = `Pedido ${pedido.id} · ${pedido.cliente} · ${pedido.total.toFixed(2)} €`;
        lista.append(li);
      }
    }

    estado.textContent = 'Cargando pedidos…';
    let respuesta;
    try {
      respuesta = await fetch('/api/pedidos');
    } catch {
      // fetch solo falla si no hay respuesta: red caída, servidor apagado…
      mostrarError('Sin conexión con el servidor');
    }
    if (respuesta && !respuesta.ok) {
      mostrarError(`No se han podido cargar los pedidos (error ${respuesta.status})`);
    } else if (respuesta) {
      try {
        pintar(await respuesta.json());
      } catch {
        // Hay respuesta, pero el cuerpo no es la lista que esperamos
        mostrarError('Respuesta no válida del servidor');
      }
    }
```

```bash
# Ejecuta todas las pruebas con la página corregida
npx playwright test
```

```text
Running 6 tests using 2 workers

  ✓  2 [chromium] › tests/reto.spec.js:4:1 › avisa si la API responde 200 sin cuerpo (141ms)
  ✓  1 [chromium] › tests/pedidos.spec.js:4:1 › muestra los pedidos de la API (157ms)
  ✓  3 [chromium] › tests/pedidos.spec.js:11:1 › muestra un error si la API responde 500 (86ms)
  ✓  4 [chromium] › tests/pedidos.spec.js:21:1 › muestra «Cargando» mientras la API tarda (2.5s)
  ✓  5 [chromium] › tests/pedidos.spec.js:32:1 › avisa si no hay conexión (207ms)
  ✓  6 [chromium] › tests/pedidos.spec.js:39:1 › dice que no hay pedidos si la lista llega vacía (155ms)

  6 passed (4.0s)
```

Un único `catch` para dos fallos distintos daba un mensaje equivocado, y soporte buscaba un problema de red
que no existía. La intercepción permite reproducir en segundos un fallo que en producción es intermitente.
**La regla:** cada forma de fallo que el usuario puede ver merece su estado en la interfaz y su prueba con
la respuesta simulada.

</details>

La solución completa (pruebas con la mejora, reto y página corregida) está en `solucion/`:

```bash
# Ejecuta la solución
npx playwright test --config solucion/playwright.config.js
```

```text
Running 6 tests using 2 workers
…
  6 passed (1.4s)
```

## Errores frecuentes

| Síntoma | Causa probable | Cómo arreglarlo |
|---------|----------------|-----------------|
| La prueba recibe los datos reales en lugar de los simulados | `page.route` está después de `page.goto` o el patrón no coincide | Declara la ruta antes de `goto` y revisa el patrón (`**/api/pedidos`) |
| `Error: http://localhost:3307/api/pedidos is already used…` | La app arrancada a mano sigue en marcha | Párala con `Ctrl+C` antes de lanzar las pruebas |
| La prueba de carga se queda esperando hasta el timeout | En la versión mejorada falta la llamada a `liberar()` | Llama a `liberar()` después de comprobar `Cargando pedidos…` |
| `Executable doesn't exist at …/chromium…` | Falta el navegador de Playwright en el Codespace | Reinstálalo con el bloque de abajo |

```bash
# Instala Chromium para Playwright (lo hace el Codespace al crearse)
npx playwright install --with-deps chromium
```

## Conclusiones

### Qué es la intercepción de red (stub)

Colocar la prueba entre el navegador y la API para decidir qué recibe la página: una respuesta inventada
(`fulfill`), un error de red (`abort`) o la respuesta real, retrasada o modificada (`continue`). Sirve para
probar los estados de la interfaz que dependen de que la API falle.

### Cómo debe ser

| Requisito | En el lab |
|-----------|-----------|
| La ruta se instala antes de que la página llame | `page.route` antes de `page.goto` |
| Cada estado de fallo, su prueba | 500, red caída, lista vacía, carga, cuerpo vacío |
| Se comprueba el efecto visible | `getByRole('alert')` y `getByRole('status')` con su texto |
| Sin esperas fijas | La respuesta retenida y liberada en la mejora |
| Patrón preciso | `**/api/pedidos`, y una prueba que falla si no coincide |

### Dónde se rompe y cómo lo has detectado

| Fallo | Cómo lo has visto | Qué provoca |
|-------|-------------------|-------------|
| Patrón que no coincide | `element(s) not found` con `'**/api/pedido'` | Pruebas que no simulan lo que creen |
| Espera fija | 2,5 s en una prueba de carga | Suites lentas y frágiles |
| Un `catch` para todo | El reto: «Sin conexión» con un 200 vacío | Mensajes que confunden a usuarios y a soporte |

### Cómo se perfecciona

En un proyecto real, las respuestas simuladas se toman del [contrato](../glosario/03-apis.md#contrato-de-api) (los ejemplos del [OpenAPI](../glosario/03-apis.md#openapi)) para no
inventar formatos que la API nunca devolverá; se pueden grabar respuestas reales en un HAR y reproducirlas
con `page.routeFromHAR`; y estas pruebas conviven con unas pocas E2E contra la API real, que comprueban que
lo simulado y lo real siguen coincidiendo.

### En una frase

> 🔑 Interceptar la red te deja probar cómo se comporta la interfaz cuando la API falla, sin esperar a que falle de verdad.
