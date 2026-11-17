# Lab — Contratos con JSON Schema

[← Página anterior](01-lab-validar-respuestas.md) · [Siguiente página →](03-lab-coleccion-postman.md)

Practicas el **[contrato](../glosario/03-apis.md#contrato-de-api) de API** validando las respuestas de una
API de tareas contra un [JSON Schema](../glosario/03-apis.md#json-schema) con
[Ajv](../glosario/03-apis.md#ajv). La API tiene dos versiones: en la 2, el equipo del backend ha
renombrado un campo. Las pruebas de estado no lo notan; vas a hacer que el contrato sí.

### Objetivo

Comprender qué es un contrato de API: cómo funciona, cómo debe ser, cómo se detectan sus debilidades y
cómo se mejora.

### Punto de partida

- Codespace del curso abierto y un terminal en
  [`ejercicios/M03-02-contratos-json-schema/`](../../ejercicios/M03-02-contratos-json-schema/README.md).
- Sin credenciales. La API (`app/server.mjs`, puerto 3302) es de solo lectura y tiene dos tareas.
- La variable `VERSION_API` elige la versión que arranca [Playwright](../glosario/02-e2e.md#playwright): `1` (por defecto) o `2`.

```bash
# Entra en la carpeta del ejercicio
cd ejercicios/M03-02-contratos-json-schema
```

### Qué está pasando

Una web y una app móvil leen el campo `hecha` de cada tarea para pintar la casilla de completada. Si el
backend lo renombra, la API sigue respondiendo 200 con JSON y las pruebas de estado siguen en verde,
pero los clientes se rompen en producción. El **contrato** es la descripción formal de qué devuelve la
API (qué campos, de qué tipo, cuáles son obligatorios) y la prueba de contrato comprueba cada respuesta
contra él. Un contrato solo protege de lo que dice: si no obliga a nada, no detecta nada.

| Pieza | Qué es |
|-------|--------|
| `contrato/tarea.schema.json` | El contrato de una tarea en JSON Schema (draft-07) |
| `tests/estado.spec.js` | Pruebas de estado y `Content-Type` |
| `tests/contrato.spec.js` | Prueba que valida el cuerpo con Ajv contra el esquema |
| `VERSION_API=2` | Simula el cambio del backend: `hecha` pasa a llamarse `completada` |

### 1 — Ejecutar las pruebas contra la versión 1

```bash
# Ejecuta las pruebas con la API en su versión 1
npx playwright test
```

**Resultado esperado** (los tiempos y el orden de las líneas pueden cambiar: hay dos *workers*):

```text
Running 3 tests using 2 workers

  ✓  1 tests/estado.spec.js:4:1 › la lista responde 200 con JSON (26ms)
  ✓  3 tests/estado.spec.js:10:1 › la tarea 1 responde 200 con JSON (10ms)
  ✓  2 tests/contrato.spec.js:13:1 › la tarea 1 cumple el contrato (34ms)

  3 passed (720ms)
```

### 2 — Leer el contrato y la respuesta en crudo

Abre `contrato/tarea.schema.json` en el editor:

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "Tarea",
  "type": "object",
  "properties": {
    "id": { "type": "integer" },
    "titulo": { "type": "string", "minLength": 1 },
    "hecha": { "type": "boolean" },
    "creada": { "type": "string", "format": "date-time" }
  }
}
```

Describe cuatro campos con su tipo. Compáralo con lo que devuelve la API: arráncala en un segundo
terminal y pide la tarea 1.

```bash
# Terminal 2: arranca la API en su versión 1
cd ejercicios/M03-02-contratos-json-schema
PORT=3302 node app/server.mjs
```

```bash
# Terminal 1: pide la tarea 1
curl -i http://localhost:3302/api/tareas/1
```

**Resultado esperado** (la fecha de `Date` cambia):

```text
HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8
Date: Tue, 17 Nov 2026 16:21:51 GMT
Connection: keep-alive
Keep-Alive: timeout=5
Transfer-Encoding: chunked

{"id":1,"titulo":"Preparar la demo","hecha":false,"creada":"2026-11-02T09:00:00Z"}
```

Ahora abre `tests/contrato.spec.js`: carga el esquema, lo compila con Ajv y comprueba que
`validarTarea(cuerpo)` devuelve `true`. `addFormats(ajv)` añade los formatos como `date-time`; si falla,
`ajv.errorsText()` pone los errores en el mensaje de la prueba. Para la API del terminal 2 con `Ctrl+C`.

### 3 — Ejecutar las pruebas contra la versión 2

Simulas el despliegue del cambio del backend: la versión 2 de la API.

```bash
# Ejecuta las pruebas con la API en su versión 2
VERSION_API=2 npx playwright test
```

**Resultado esperado:**

```text
Running 3 tests using 2 workers

  ✓  1 tests/estado.spec.js:4:1 › la lista responde 200 con JSON (25ms)
  ✓  3 tests/estado.spec.js:10:1 › la tarea 1 responde 200 con JSON (10ms)
  ✓  2 tests/contrato.spec.js:13:1 › la tarea 1 cumple el contrato (27ms)

  3 passed (686ms)
```

Todo pasa, también la prueba de contrato. Mira qué ha cambiado:

```bash
# Terminal 2: arranca la versión 2
PORT=3302 VERSION_API=2 node app/server.mjs
```

```bash
# Terminal 1: pide la tarea 1 a la versión 2
curl -s http://localhost:3302/api/tareas/1
```

**Resultado esperado:**

```text
{"id":1,"titulo":"Preparar la demo","creada":"2026-11-02T09:00:00Z","completada":false}
```

Falta `hecha` y sobra `completada`. El esquema no se queja porque en JSON Schema las `properties` solo
describen los campos **si aparecen**: un objeto sin ninguno de ellos y con campos extra también cumple.
Para la API del terminal 2.

### 4 — Hacer que el contrato obligue

Añade al esquema qué campos son obligatorios (`required`) y que no se admiten otros
(`additionalProperties: false`). `contrato/tarea.schema.json` queda así:

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "Tarea",
  "type": "object",
  "properties": {
    "id": { "type": "integer" },
    "titulo": { "type": "string", "minLength": 1 },
    "hecha": { "type": "boolean" },
    "creada": { "type": "string", "format": "date-time" }
  },
  "required": ["id", "titulo", "hecha", "creada"],
  "additionalProperties": false
}
```

```bash
# Ejecuta otra vez contra la versión 2
VERSION_API=2 npx playwright test
```

**Resultado esperado:**

```text
Running 3 tests using 2 workers

  ✓  1 tests/estado.spec.js:4:1 › la lista responde 200 con JSON (51ms)
  ✓  3 tests/estado.spec.js:10:1 › la tarea 1 responde 200 con JSON (13ms)
  ✘  2 tests/contrato.spec.js:13:1 › la tarea 1 cumple el contrato (33ms)


  1) tests/contrato.spec.js:13:1 › la tarea 1 cumple el contrato ───────────────────────────────────

    Error: data must have required property 'hecha', data must NOT have additional properties

    expect(received).toBe(expected) // Object.is equality

    Expected: true
    Received: false

      15 |   const valida = validarTarea(tarea);
      16 |   // Si falla, el mensaje de la prueba muestra los errores de Ajv en una línea
    > 17 |   expect(valida, ajv.errorsText(validarTarea.errors)).toBe(true);
         |                                                       ^
      18 | });
      19 |
        at /workspaces/testing-automatizacion-agile-201/ejercicios/M03-02-contratos-json-schema/tests/contrato.spec.js:17:55

    Error Context: test-results/contrato-la-tarea-1-cumple-el-contrato/error-context.md

  1 failed
    tests/contrato.spec.js:13:1 › la tarea 1 cumple el contrato ────────────────────────────────────
  2 passed (746ms)
```

La primera línea del error es la que importa: falta `hecha` y hay un campo que el contrato no conoce.
Las pruebas de estado siguen pasando: el cambio solo lo ve el contrato. Comprueba que la versión 1 sigue
cumpliéndolo:

```bash
# Ejecuta contra la versión 1
npx playwright test
```

**Resultado esperado:**

```text
Running 3 tests using 2 workers

  ✓  1 tests/estado.spec.js:4:1 › la lista responde 200 con JSON (43ms)
  ✓  2 tests/estado.spec.js:10:1 › la tarea 1 responde 200 con JSON (17ms)
  ✓  3 tests/contrato.spec.js:13:1 › la tarea 1 cumple el contrato (34ms)

  3 passed (891ms)
```

### 5 — Validar también la lista

La prueba solo valida la tarea 1; la lista `GET /api/tareas` es otra respuesta y otro contrato: un array
cuyos elementos son tareas. Sustituye el contenido de `tests/contrato.spec.js` por este:

```js
// Valida la tarea suelta y cada elemento de la lista.
import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';

const esquemaTarea = JSON.parse(readFileSync(new URL('../contrato/tarea.schema.json', import.meta.url)));
const ajv = new Ajv({ allErrors: true });   // allErrors: informa de todos los errores, no solo del primero
addFormats(ajv);
const validarTarea = ajv.compile(esquemaTarea);
// La lista es un array cuyos elementos cumplen el esquema de la tarea
const validarLista = ajv.compile({ type: 'array', minItems: 1, items: esquemaTarea });

test('la tarea 1 cumple el contrato', async ({ request }) => {
  const tarea = await (await request.get('/api/tareas/1')).json();
  const valida = validarTarea(tarea);
  expect(valida, ajv.errorsText(validarTarea.errors)).toBe(true);
});

test('la lista cumple el contrato', async ({ request }) => {
  const lista = await (await request.get('/api/tareas')).json();
  const valida = validarLista(lista);
  expect(valida, ajv.errorsText(validarLista.errors)).toBe(true);
});
```

```bash
# Ejecuta solo las pruebas de contrato contra la versión 2
VERSION_API=2 npx playwright test contrato
```

**Resultado esperado** (extracto: el informe completo repite el bloque de código de cada fallo):

```text
Running 4 tests using 2 workers

  ✓  1 tests/estado.spec.js:4:1 › la lista responde 200 con JSON (31ms)
  ✓  3 tests/estado.spec.js:10:1 › la tarea 1 responde 200 con JSON (19ms)
  ✘  2 tests/contrato.spec.js:14:1 › la tarea 1 cumple el contrato (36ms)
  ✘  4 tests/contrato.spec.js:20:1 › la lista cumple el contrato (41ms)


  1) tests/contrato.spec.js:14:1 › la tarea 1 cumple el contrato ───────────────────────────────────

    Error: data must have required property 'hecha', data must NOT have additional properties
…
  2) tests/contrato.spec.js:20:1 › la lista cumple el contrato ─────────────────────────────────────

    Error: data/0 must have required property 'hecha', data/0 must NOT have additional properties, data/1 must have required property 'hecha', data/1 must NOT have additional properties
…
  2 failed
    tests/contrato.spec.js:14:1 › la tarea 1 cumple el contrato ────────────────────────────────────
    tests/contrato.spec.js:20:1 › la lista cumple el contrato ──────────────────────────────────────
  2 passed (1.4s)
```

`data/0` y `data/1` son las posiciones del array: Ajv dice en qué elemento está cada error. Aunque has
filtrado por `contrato`, también aparecen las de `estado.spec.js`: el filtro se compara con la ruta del
fichero y `contrato` forma parte de la carpeta del ejercicio. Contra la versión 1, las cuatro pasan:

```bash
# Ejecuta todo contra la versión 1
npx playwright test
```

```text
Running 4 tests using 2 workers

  ✓  1 tests/estado.spec.js:4:1 › la lista responde 200 con JSON (25ms)
  ✓  3 tests/estado.spec.js:10:1 › la tarea 1 responde 200 con JSON (9ms)
  ✓  2 tests/contrato.spec.js:14:1 › la tarea 1 cumple el contrato (29ms)
  ✓  4 tests/contrato.spec.js:20:1 › la lista cumple el contrato (9ms)

  4 passed (802ms)
```

## Comprueba tu entendimiento

**Qué aporta cada palabra clave**
Quita del esquema solo `"additionalProperties": false` (deja `required`) y ejecuta:

```bash
# Pruebas de contrato contra la versión 2
VERSION_API=2 npx playwright test contrato
```
→ Siguen fallando las dos pruebas de contrato, pero el error ya solo dice
`must have required property 'hecha'`: `completada` deja de molestar. Vuelve a ponerlo.

**El contrato no mira el estado**
Lee `tests/estado.spec.js` y `tests/contrato.spec.js` y localiza qué comprueba cada uno.
→ Estado y `Content-Type` en uno; forma del cuerpo en el otro. Son complementarios: un 500 con un cuerpo
válido pasaría el contrato; un 200 con el cuerpo cambiado pasaría el de estado.

## Experimenta

El backend cambia el formato de la fecha de creación de la tarea 1 a `02/11/2026 09:00`. **Predice**
qué pruebas fallan y con qué mensaje.

En `app/server.mjs`, en `datos`, cambia `creada: '2026-11-02T09:00:00Z'` de la tarea 1 por
`creada: '02/11/2026 09:00'` y ejecuta:

```bash
# Ejecuta las pruebas de contrato contra la versión 1
npx playwright test contrato
```

**Resultado esperado** (extracto):

```text
  ✘  2 tests/contrato.spec.js:14:1 › la tarea 1 cumple el contrato (34ms)
  ✘  4 tests/contrato.spec.js:20:1 › la lista cumple el contrato (29ms)
…
    Error: data/creada must match format "date-time"
…
    Error: data/0/creada must match format "date-time"
…
  2 failed
  2 passed (1.4s)
```

El tipo sigue siendo `string`, así que sin `"format": "date-time"` el cambio pasaría. El formato es lo
que convierte «un texto» en «una fecha ISO 8601 que el cliente sabe parsear». Vuelve a dejar la fecha
original.

## Reto

### 1 — Los errores también son contrato

**La situación:** el cliente web muestra `respuesta.error` cuando algo va mal. Un desarrollador del
backend propone cambiar el cuerpo de los 404 a `{ "mensaje": "Tarea no encontrada" }` porque «solo es
un error».

**Qué haces:** crea `contrato/error.schema.json` con el contrato de un error (un objeto con un único campo
`error`, texto no vacío y obligatorio) y `tests/reto.spec.js` con una prueba que pida `/api/tareas/999`,
compruebe el 404 y valide el cuerpo contra ese esquema. Después aplica el cambio propuesto en
`app/server.mjs` (`{ error: 'Tarea no encontrada' }` → `{ mensaje: 'Tarea no encontrada' }`) y ejecuta:

```bash
# Ejecuta la prueba del reto
npx playwright test reto
```

**Pistas:** la estructura del esquema es la de `tarea.schema.json` con otro `properties`; en la prueba,
el mismo patrón `ajv.compile` + `ajv.errorsText`. Este esquema no usa formatos, así que no necesita
`addFormats`.

**Lo que buscas:** que la prueba pase con la API original y falle con el cambio propuesto.

<details>
<summary>Ver solución</summary>

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "Error",
  "type": "object",
  "properties": {
    "error": { "type": "string", "minLength": 1 }
  },
  "required": ["error"],
  "additionalProperties": false
}
```

```js
// tests/reto.spec.js — también en solucion/tests/reto.spec.js
import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import Ajv from 'ajv';

const esquemaError = JSON.parse(readFileSync(new URL('../contrato/error.schema.json', import.meta.url)));
const ajv = new Ajv({ allErrors: true });
const validarError = ajv.compile(esquemaError);

test('el 404 cumple el contrato de error', async ({ request }) => {
  const respuesta = await request.get('/api/tareas/999');
  expect(respuesta.status()).toBe(404);
  const cuerpo = await respuesta.json();
  expect(validarError(cuerpo), ajv.errorsText(validarError.errors)).toBe(true);
});
```

Con la API original:

```text
Running 1 test using 1 worker

  ✓  1 tests/reto.spec.js:10:1 › el 404 cumple el contrato de error (57ms)

  1 passed (1.4s)
```

Con el cambio propuesto (extracto):

```text
  ✘  1 tests/reto.spec.js:10:1 › el 404 cumple el contrato de error (47ms)
…
    Error: data must have required property 'error', data must NOT have additional properties
…
  1 failed
```

El cambio «solo de un error» habría dejado al cliente web mostrando `undefined`. **La regla:** las
respuestas de error forman parte del contrato igual que las buenas; valídalas con su propio esquema.
Vuelve a dejar `error` en la API.

</details>

La solución completa (esquemas y pruebas) está en `solucion/`. Contra la versión 2, el contrato detecta
el cambio:

```bash
# Ejecuta la solución contra la versión 2
VERSION_API=2 npx playwright test --config solucion/playwright.config.js
```

```text
  ✓  1 solucion/tests/estado.spec.js:4:1 › la lista responde 200 con JSON (29ms)
  ✓  3 solucion/tests/estado.spec.js:10:1 › la tarea 1 responde 200 con JSON (13ms)
  ✓  2 solucion/tests/reto.spec.js:10:1 › el 404 cumple el contrato de error (40ms)
  ✘  4 solucion/tests/contrato.spec.js:14:1 › la tarea 1 cumple el contrato (51ms)
  ✘  5 solucion/tests/contrato.spec.js:20:1 › la lista cumple el contrato (50ms)
  2 failed
  3 passed (1.5s)
```

## Errores frecuentes

| Síntoma | Causa probable | Cómo arreglarlo |
|---------|----------------|-----------------|
| `Error: unknown format "date-time" ignored in schema at path "#/properties/creada"` | Falta `addFormats(ajv)` antes de `ajv.compile` | Añade `addFormats(ajv)` justo después de crear `ajv` |
| El contrato pasa con la versión 2 | El esquema no tiene `required` ni `additionalProperties: false` | Añádelos (paso 4) |
| `VERSION_API=2` no cambia nada | La variable se escribió en una línea aparte, sin `export`, y no llega a Playwright | Ponla delante del comando, en la misma línea: `VERSION_API=2 npx playwright test` |
| `Error: http://localhost:3302/api/tareas is already used…` | Hay una API manual en marcha en el puerto 3302 | Párala con `Ctrl+C` antes de lanzar las pruebas |

## Conclusiones

### Qué es un contrato de API

La descripción formal y verificable de lo que devuelve cada respuesta: campos, tipos, formatos, cuáles
son obligatorios y si se admiten otros. En JSON Schema se escribe una vez y Ajv lo aplica a cada
respuesta.

### Cómo debe ser

| Requisito | En el lab |
|-----------|-----------|
| Obliga a los campos que usan los clientes | `required: ["id", "titulo", "hecha", "creada"]` |
| Cerrado a campos desconocidos, si el acuerdo lo exige | `additionalProperties: false` |
| Tipos y formatos precisos | `integer`, `boolean`, `date-time` con `ajv-formats` |
| Cubre cada respuesta, no solo una | tarea suelta, lista (`items`) y error 404 |
| Errores legibles en el informe | `ajv.errorsText()` en el mensaje de `expect` |

### Dónde se rompe y cómo lo has detectado

| Fallo | Cómo lo has visto | Qué provoca |
|-------|-------------------|-------------|
| Esquema que solo describe | `hecha` → `completada` daba `3 passed` | Cambios incompatibles que llegan a producción |
| Validar solo una respuesta | Hasta el paso 5, la lista no se validaba | La lista cambia sin aviso |
| Formato sin comprobar | `02/11/2026 09:00` solo falla con `format` y `addFormats` | Clientes que no saben leer la fecha |

### Cómo se perfecciona

En un proyecto real el contrato no se escribe a mano en cada prueba: sale de la especificación
[OpenAPI](../glosario/03-apis.md#openapi) de la API (sus `components.schemas` son JSON Schema), vive en el
repositorio junto al código y se valida en el [pipeline](../glosario/04-ci-cd.md#pipeline). Si hay varios equipos consumidores, cada uno
puede publicar lo que necesita y el proveedor comprobar que lo cumple (contratos dirigidos por el
consumidor, como Pact).

### En una frase

> 🔑 Un contrato solo detecta lo que obliga: sin `required` ni `additionalProperties`, un campo renombrado pasa en verde.
