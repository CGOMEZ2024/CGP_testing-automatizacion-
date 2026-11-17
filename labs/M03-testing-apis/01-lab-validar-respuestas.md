# Lab — Validar respuestas

[← Página anterior](00-anatomia-de-una-prueba-api.md) · [Siguiente página →](02-lab-contratos-json-schema.md)

Practicas la **validación de respuestas HTTP** con una API de tareas en memoria y el
cliente `request` de [Playwright](../glosario/02-e2e.md#playwright), sin navegador. Partes de
tres pruebas que solo comprueban que la respuesta «ha ido bien» y las conviertes en pruebas que miran
el estado, las [cabeceras](../glosario/03-apis.md#cabecera-http) y el cuerpo, con casos negativos.

### Objetivo

Comprender qué es la validación de respuestas HTTP: cómo funciona, cómo debe ser, cómo se detectan sus
debilidades y cómo se mejora.

### Punto de partida

- Codespace del curso abierto y un terminal en la carpeta del ejercicio
  [`ejercicios/M03-01-validar-respuestas/`](../../ejercicios/M03-01-validar-respuestas/README.md).
- Sin credenciales. La API (`app/server.mjs`, puerto 3301) arranca con dos tareas y pierde lo creado al
  pararse.
- Playwright arranca la API por su cuenta (`webServer` en `playwright.config.js`); no hace falta
  tenerla en marcha para ejecutar las pruebas.

```bash
# Entra en la carpeta del ejercicio
cd ejercicios/M03-01-validar-respuestas
```

### Qué está pasando

Una API es un [contrato](../glosario/03-apis.md#contrato-de-api) con quien la usa: una web, una app móvil u otro servicio programan contra lo que
devuelve. Una [prueba de API](../glosario/01-fundamentos.md#prueba-de-api) automatiza la comprobación de ese
contrato en cada cambio, sin pasar por la interfaz, y por eso es más rápida y más estable que una
prueba E2E. Lo que la hace útil es **qué** comprueba: una prueba que solo mira que la respuesta es un
2xx pasa aunque la API devuelva otro objeto, otro código o un JSON roto.

| Pieza | Qué es |
|-------|--------|
| `app/server.mjs` | La API bajo prueba: `GET`, `POST`, `PUT` y `DELETE` en `/api/tareas` |
| `playwright.config.js` | Sin proyectos de navegador; `baseURL` y `webServer` apuntan a la API |
| `tests/tareas.spec.js` | Las pruebas, con el [fixture](../glosario/02-e2e.md#fixture) `request` (un cliente HTTP que reutiliza `baseURL`) |
| `solucion/` | Pruebas completas y su configuración |

### 1 — Ejecutar las pruebas de partida

Primero ves qué tienes: tres pruebas que leen la lista, leen la tarea 1 y crean una tarea, y en las tres
la única comprobación es `expect(respuesta.ok()).toBeTruthy()`.

```bash
# Ejecuta las pruebas (Playwright arranca la API en el puerto 3301 y la para al acabar)
npx playwright test
```

**Resultado esperado** (los tiempos entre paréntesis cambian en cada ejecución):

```text
Running 3 tests using 1 worker

  ✓  1 tests/tareas.spec.js:4:1 › lista las tareas (40ms)
  ✓  2 tests/tareas.spec.js:9:1 › lee la tarea 1 (13ms)
  ✓  3 tests/tareas.spec.js:14:1 › crea una tarea (13ms)

  3 passed (1.1s)
```

Todo en verde. `respuesta.ok()` es `true` para cualquier estado entre 200 y 299: es lo único que
garantizan estas pruebas.

### 2 — Mirar la API en crudo

Antes de escribir [aserciones](../glosario/01-fundamentos.md#asercion) miras lo que la API devuelve de verdad: así sabes qué estado, qué cabeceras
y qué cuerpo tiene que esperar cada prueba. Arranca la API a mano en un segundo terminal.

```bash
# Terminal 2: arranca la API en el puerto 3301
cd ejercicios/M03-01-validar-respuestas
PORT=3301 node app/server.mjs
```

```bash
# Terminal 1: lee la tarea 1, crea una tarea y prueba a crear una sin título
curl -i http://localhost:3301/api/tareas/1
curl -i -X POST http://localhost:3301/api/tareas -H 'Content-Type: application/json' -d '{"titulo":"Escribir las pruebas"}'
curl -i -X POST http://localhost:3301/api/tareas -H 'Content-Type: application/json' -d '{"hecha":true}'
```

**Resultado esperado** (la fecha cambia):

```text
HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8
Date: Tue, 17 Nov 2026 16:19:44 GMT
Connection: keep-alive
Keep-Alive: timeout=5
Transfer-Encoding: chunked

{"id":1,"titulo":"Preparar la demo","hecha":false}
HTTP/1.1 201 Created
Content-Type: application/json; charset=utf-8
Location: /api/tareas/3
Date: Tue, 17 Nov 2026 16:19:44 GMT
Connection: keep-alive
Keep-Alive: timeout=5
Transfer-Encoding: chunked

{"id":3,"titulo":"Escribir las pruebas","hecha":false}
HTTP/1.1 400 Bad Request
Content-Type: application/json; charset=utf-8
Date: Tue, 17 Nov 2026 16:19:44 GMT
Connection: keep-alive
Keep-Alive: timeout=5
Transfer-Encoding: chunked

{"error":"El campo titulo es obligatorio"}
```

| Petición | Estado | Lo que hay que comprobar además |
|----------|--------|---------------------------------|
| Leer la tarea 1 | `200 OK` | `Content-Type` JSON y el cuerpo exacto de la tarea 1 |
| Crear | `201 Created` | cabecera `Location` con la URL de lo creado y cuerpo con un `id` nuevo |
| Crear sin título | `400 Bad Request` | el mensaje de error |

Para la API con `Ctrl+C` en el terminal 2: si sigue en marcha, Playwright no puede arrancar la suya en el
mismo puerto.

### 3 — Comprobar que la prueba de la tarea 1 no comprueba nada

Pones a prueba la prueba: cambias la URL de «lee la tarea 1» para que pida otra tarea. Si la prueba
valiera algo, fallaría. Abre `tests/tareas.spec.js` y, en la prueba `lee la tarea 1`, cambia
`/api/tareas/1` por `/api/tareas/2`.

```bash
# Ejecuta de nuevo las pruebas
npx playwright test
```

**Resultado esperado:**

```text
Running 3 tests using 1 worker

  ✓  1 tests/tareas.spec.js:4:1 › lista las tareas (24ms)
  ✓  2 tests/tareas.spec.js:9:1 › lee la tarea 1 (9ms)
  ✓  3 tests/tareas.spec.js:14:1 › crea una tarea (10ms)

  3 passed (682ms)
```

La prueba se llama «lee la tarea 1», recibe la tarea 2 y pasa. Es un falso verde: ningún cambio en el
cuerpo la haría fallar. Vuelve a dejar `/api/tareas/1`.

### 4 — Validar estado, cabecera y cuerpo

Sustituye la prueba `lee la tarea 1` por esta versión, que comprueba las tres partes de la respuesta.
`toEqual` compara el objeto entero: sobra o falta un campo, o cambia un valor, y falla.

```js
test('lee la tarea 1', async ({ request }) => {
  const respuesta = await request.get('/api/tareas/1');
  expect(respuesta.status()).toBe(200);                                      // estado exacto
  expect(respuesta.headers()['content-type']).toContain('application/json'); // cabecera (en minúsculas)
  expect(await respuesta.json()).toEqual({ id: 1, titulo: 'Preparar la demo', hecha: false }); // cuerpo
});
```

```bash
# Ejecuta solo las pruebas cuyo título contiene «lee la tarea 1»
npx playwright test -g "lee la tarea 1"
```

**Resultado esperado:**

```text
Running 1 test using 1 worker

  ✓  1 tests/tareas.spec.js:9:1 › lee la tarea 1 (49ms)

  1 passed (1.2s)
```

Ahora repite la trampa del paso 3: cambia `/api/tareas/1` por `/api/tareas/2` en esta prueba y
ejecútala otra vez con el mismo comando.

**Resultado esperado** (la ruta de la línea `at` es la de tu Codespace):

```text
Running 1 test using 1 worker

  ✘  1 tests/tareas.spec.js:9:1 › lee la tarea 1 (31ms)


  1) tests/tareas.spec.js:9:1 › lee la tarea 1 ─────────────────────────────────────────────────────

    Error: expect(received).toEqual(expected) // deep equality

    - Expected  - 3
    + Received  + 3

      Object {
    -   "hecha": false,
    -   "id": 1,
    -   "titulo": "Preparar la demo",
    +   "hecha": true,
    +   "id": 2,
    +   "titulo": "Revisar el informe",
      }

      11 |   expect(respuesta.status()).toBe(200);
      12 |   expect(respuesta.headers()['content-type']).toContain('application/json');
    > 13 |   expect(await respuesta.json()).toEqual({ id: 1, titulo: 'Preparar la demo', hecha: false });
         |                                  ^
      14 | });
      15 |
      16 | test('crea una tarea', async ({ request }) => {
        at /workspaces/testing-automatizacion-agile-201/ejercicios/M03-01-validar-respuestas/tests/tareas.spec.js:13:34

    Error Context: test-results/tareas-lee-la-tarea-1/error-context.md

  1 failed
    tests/tareas.spec.js:9:1 › lee la tarea 1 ──────────────────────────────────────────────────────
```

El diff dice exactamente qué ha cambiado: `-` lo que esperabas, `+` lo que ha llegado. El estado (200)
y la cabecera pasaban; lo que delata el cambio es el cuerpo. Vuelve a dejar `/api/tareas/1`.

### 5 — Validar una creación

Al crear, lo correcto es un `201 Created`, el objeto creado y una cabecera `Location` que apunte a él.
El `id` lo pone la API y no lo conoces de antemano: por eso aquí usas `toMatchObject`, que solo compara
los campos que le das, y `expect.any(Number)` para el `id`. Sustituye la prueba `crea una tarea` por esta:

```js
test('crea una tarea', async ({ request }) => {
  const respuesta = await request.post('/api/tareas', {
    data: { titulo: 'Escribir las pruebas' },          // Playwright lo envía como JSON
  });
  expect(respuesta.status()).toBe(201);
  const creada = await respuesta.json();
  expect(creada).toMatchObject({ titulo: 'Escribir las pruebas', hecha: false }); // solo estos campos
  expect(creada.id).toEqual(expect.any(Number));                                   // un número, el que sea
  expect(respuesta.headers()['location']).toBe(`/api/tareas/${creada.id}`);
});
```

```bash
# Ejecuta solo la prueba de creación
npx playwright test -g "crea una tarea"
```

**Resultado esperado:**

```text
Running 1 test using 1 worker

  ✓  1 tests/tareas.spec.js:16:1 › crea una tarea (26ms)

  1 passed (580ms)
```

### 6 — Añadir un caso negativo: datos inválidos

Una API también tiene que rechazar bien: estado 400 y un mensaje que el cliente pueda mostrar. Añade
esta prueba al final del fichero:

```js
test('rechaza una tarea sin título', async ({ request }) => {
  const respuesta = await request.post('/api/tareas', { data: { hecha: true } });
  expect(respuesta.status()).toBe(400);
  expect(await respuesta.json()).toEqual({ error: 'El campo titulo es obligatorio' });
});
```

```bash
# Ejecuta solo la nueva prueba
npx playwright test -g "rechaza"
```

**Resultado esperado:**

```text
Running 1 test using 1 worker

  ✓  1 tests/tareas.spec.js:27:1 › rechaza una tarea sin título (25ms)

  1 passed (567ms)
```

Fíjate en que `request` **no lanza excepción** con un 4xx o un 5xx: devuelve la respuesta y eres tú quien
decide qué estado es el correcto.

### 7 — Añadir el 404 y ejecutar todo

El último caso: pedir algo que no existe. Añade al final:

```js
test('una tarea que no existe da 404', async ({ request }) => {
  const respuesta = await request.get('/api/tareas/999');
  expect(respuesta.status()).toBe(404);
  expect(await respuesta.json()).toEqual({ error: 'Tarea no encontrada' });
});
```

```bash
# Ejecuta todas las pruebas
npx playwright test
```

**Resultado esperado:**

```text
Running 5 tests using 1 worker

  ✓  1 tests/tareas.spec.js:4:1 › lista las tareas (27ms)
  ✓  2 tests/tareas.spec.js:9:1 › lee la tarea 1 (13ms)
  ✓  3 tests/tareas.spec.js:16:1 › crea una tarea (16ms)
  ✓  4 tests/tareas.spec.js:27:1 › rechaza una tarea sin título (15ms)
  ✓  5 tests/tareas.spec.js:33:1 › una tarea que no existe da 404 (11ms)

  5 passed (764ms)
```

Cinco pruebas que, ahora sí, fallan si cambia el estado, el tipo de contenido o el cuerpo.

## Comprueba tu entendimiento

**`toEqual` frente a `toMatchObject`**
En la prueba `lee la tarea 1`, cambia `toEqual` por `toMatchObject` y quita `hecha: false` del objeto
esperado. Ejecuta la prueba:

```bash
# Ejecuta solo la prueba de la tarea 1
npx playwright test -g "lee la tarea 1"
```

→ Pasa: `toMatchObject` ignora los campos que no le das. Con `toEqual` y el mismo objeto, fallaría
porque al esperado le falta `hecha`.

**Qué hace `ok()`**
Escribe una prueba que pida `/api/tareas/999` y compruebe solo `expect(respuesta.ok()).toBeFalsy()`.
→ Pasa: un 404 no es «ok». Pero también pasaría con un 500: `ok()` no distingue qué ha ido mal.

## Experimenta

Un compañero cambia la API para que crear devuelva `200` en lugar de `201`. **Antes de ejecutar,
predice** qué pruebas fallan con tus pruebas nuevas y si las pruebas de partida lo habrían notado.

En `app/server.mjs`, en el bloque `POST`, cambia `enviarJson(res, 201, tarea, …)` por
`enviarJson(res, 200, tarea, …)` y ejecuta:

```bash
# Ejecuta todas las pruebas con la API modificada
npx playwright test
```

**Resultado esperado:**

```text
Running 5 tests using 1 worker

  ✓  1 tests/tareas.spec.js:4:1 › lista las tareas (46ms)
  ✓  2 tests/tareas.spec.js:9:1 › lee la tarea 1 (25ms)
  ✘  3 tests/tareas.spec.js:16:1 › crea una tarea (29ms)
  ✓  4 tests/tareas.spec.js:27:1 › rechaza una tarea sin título (49ms)
  ✓  5 tests/tareas.spec.js:33:1 › una tarea que no existe da 404 (52ms)


  1) tests/tareas.spec.js:16:1 › crea una tarea ────────────────────────────────────────────────────

    Error: expect(received).toBe(expected) // Object.is equality

    Expected: 201
    Received: 200

      18 |     data: { titulo: 'Escribir las pruebas' },
      19 |   });
    > 20 |   expect(respuesta.status()).toBe(201);
         |                              ^
      21 |   const creada = await respuesta.json();
      22 |   expect(creada).toMatchObject({ titulo: 'Escribir las pruebas', hecha: false });
      23 |   expect(creada.id).toEqual(expect.any(Number));
        at /workspaces/testing-automatizacion-agile-201/ejercicios/M03-01-validar-respuestas/tests/tareas.spec.js:20:30

    Error Context: test-results/tareas-crea-una-tarea/error-context.md

  1 failed
    tests/tareas.spec.js:16:1 › crea una tarea ─────────────────────────────────────────────────────
  4 passed (1.8s)
```

Con las tres pruebas de partida (las que solo miraban `ok()`), este mismo cambio daba `3 passed`: 200
también es un 2xx. Vuelve a dejar `201` en la API.

## Mejora

La prueba `lista las tareas` sigue mirando solo `ok()`. Refuérzala: estado 200, `Content-Type` JSON y
que el cuerpo sea un array no vacío.

```js
test('lista las tareas', async ({ request }) => {
  const respuesta = await request.get('/api/tareas');
  expect(respuesta.status()).toBe(200);
  expect(respuesta.headers()['content-type']).toContain('application/json');
  const tareas = await respuesta.json();
  expect(Array.isArray(tareas)).toBe(true);
  expect(tareas.length).toBeGreaterThan(0);
});
```

```bash
# Ejecuta la prueba de la lista
npx playwright test -g "lista"
```

**Resultado esperado:**

```text
Running 1 test using 1 worker

  ✓  1 tests/tareas.spec.js:4:1 › lista las tareas (26ms)

  1 passed (594ms)
```

## Reto

### 1 — Actualizar y borrar, y demostrar que se ha borrado

**La situación:** la API tiene `PUT /api/tareas/:id` (devuelve 200 y la tarea actualizada) y
`DELETE /api/tareas/:id` (devuelve 204 sin cuerpo). Nadie las prueba. Un compañero propone una prueba que
solo compruebe que el `DELETE` devuelve 204.

**Qué haces:** crea `tests/reto.spec.js` con una prueba que cree su propia tarea, la actualice con `PUT`,
la borre con `DELETE` y, después, demuestre que ya no existe. Ejecútala:

```bash
# Ejecuta la prueba del reto
npx playwright test reto
```

**Pistas:** `request.put(url, { data })`, `request.delete(url)`, `respuesta.text()` para un cuerpo vacío.
Crea la tarea en la propia prueba para no depender de las tareas 1 y 2.

**Lo que buscas:** una prueba que pase y que fallaría si el `DELETE` respondiera 204 sin borrar nada.

<details>
<summary>Ver solución</summary>

```js
// tests/reto.spec.js — también en solucion/tests/reto.spec.js
import { test, expect } from '@playwright/test';

test('actualiza y borra una tarea', async ({ request }) => {
  // Crea una tarea propia para no depender de las que trae la API
  const creada = await (await request.post('/api/tareas', { data: { titulo: 'Temporal' } })).json();

  const actualizada = await request.put(`/api/tareas/${creada.id}`, {
    data: { titulo: 'Temporal revisada', hecha: true },
  });
  expect(actualizada.status()).toBe(200);
  expect(await actualizada.json()).toEqual({ id: creada.id, titulo: 'Temporal revisada', hecha: true });

  const borrada = await request.delete(`/api/tareas/${creada.id}`);
  expect(borrada.status()).toBe(204);
  expect(await borrada.text()).toBe('');

  // Lo que demuestra el borrado es la siguiente lectura
  const leida = await request.get(`/api/tareas/${creada.id}`);
  expect(leida.status()).toBe(404);
});
```

```bash
# Ejecuta la prueba del reto
npx playwright test reto
```

```text
Running 1 test using 1 worker

  ✓  1 tests/reto.spec.js:4:1 › actualiza y borra una tarea (45ms)

  1 passed (950ms)
```

El 204 solo dice que la API ha aceptado la orden; la lectura posterior con 404 es la que demuestra el
efecto. En un proyecto real, la prueba que se queda en el 204 pasaría aunque el borrado no llegara a la
base de datos. **La regla:** valida el efecto de una operación con una lectura posterior, no solo con
la respuesta de la propia operación.

</details>

La solución completa está en `solucion/`:

```bash
# Ejecuta la solución (pruebas reforzadas y reto)
npx playwright test --config solucion/playwright.config.js
```

```text
Running 6 tests using 2 workers

  ✓  1 solucion/tests/tareas.spec.js:4:1 › lista las tareas (26ms)
  ✓  2 solucion/tests/reto.spec.js:4:1 › actualiza y borra una tarea (35ms)
  ✓  3 solucion/tests/tareas.spec.js:13:1 › lee la tarea 1 (12ms)
  ✓  4 solucion/tests/tareas.spec.js:20:1 › crea una tarea (17ms)
  ✓  5 solucion/tests/tareas.spec.js:31:1 › rechaza una tarea sin título (14ms)
  ✓  6 solucion/tests/tareas.spec.js:37:1 › una tarea que no existe da 404 (9ms)

  6 passed (993ms)
```

## Errores frecuentes

| Síntoma | Causa probable | Cómo arreglarlo |
|---------|----------------|-----------------|
| `Error: http://localhost:3301/api/tareas is already used, make sure that nothing is running on the port/url…` | La API que arrancaste a mano en el paso 2 sigue en marcha | Párala con `Ctrl+C` en su terminal y vuelve a lanzar las pruebas |
| `expect(received).toBe(expected)` con `undefined` al leer una cabecera | Las claves de `respuesta.headers()` van en minúsculas | Usa `headers()['content-type']`, no `['Content-Type']` |
| La prueba de creación falla con `id` distinto en cada ejecución | Comparas el `id` con un número fijo | Usa `expect.any(Number)` o `toMatchObject` sin el `id` |
| `SyntaxError: Unexpected end of JSON input` | Llamas a `json()` sobre una respuesta sin cuerpo (204) | Usa `respuesta.text()` y compáralo con `''` |

## Conclusiones

### Qué es la validación de respuestas HTTP

Comprobar, en cada respuesta, las tres partes que un cliente usa: el [código de estado](../glosario/03-apis.md#codigo-de-estado), las cabeceras
que importan (`Content-Type`, `Location`) y el cuerpo, en los caminos buenos y en los malos.

### Cómo debe ser

| Requisito | En el lab |
|-----------|-----------|
| Estado exacto, no «2xx» | `toBe(201)` en la creación, `toBe(400)` y `toBe(404)` en los errores |
| Cabeceras que el cliente usa | `content-type` con JSON y `location` apuntando a lo creado |
| Cuerpo comparado con lo esperado | `toEqual` cuando conoces todo; `toMatchObject` + `expect.any` cuando la API pone valores |
| Casos negativos | 400 por título vacío y 404 por tarea inexistente |
| Efecto comprobado | el borrado se verifica con una lectura que da 404 |

### Dónde se rompe y cómo lo has detectado

| Fallo | Cómo lo has visto | Qué provoca |
|-------|-------------------|-------------|
| Prueba que solo mira `ok()` | Pedir la tarea 2 en lugar de la 1 daba `3 passed` | Falsos verdes ante cualquier cambio del cuerpo |
| Estado de creación cambiado (201 → 200) | Solo la prueba reforzada falla con `Expected: 201 Received: 200` | Clientes que esperan 201 y `Location` dejan de funcionar |
| Prueba que se fía del 204 | En el reto, solo la lectura posterior demuestra el borrado | Borrados «aceptados» que no ocurren |

### Cómo se perfecciona

En un proyecto real, las pruebas crean sus propios datos (como el reto) para poder ejecutarse en
paralelo y en cualquier orden; el formato completo del cuerpo se valida contra un esquema en lugar de
campo a campo ([Contratos con JSON Schema](02-lab-contratos-json-schema.md)); y estas pruebas corren en
el [pipeline](../glosario/04-ci-cd.md#pipeline) en cada cambio, porque son rápidas y no necesitan navegador.

### En una frase

> 🔑 Una prueba de API vale lo que comprueba: estado exacto, cabeceras y cuerpo, en el caso bueno y en los malos; `ok()` solo dice que no ha ido muy mal.
