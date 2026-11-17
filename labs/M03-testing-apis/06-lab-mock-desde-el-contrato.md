# Lab — Un mock desde el contrato

[← Página anterior](05-lab-autenticacion-y-autorizacion.md) · [Siguiente página →](07-lab-simular-fallos.md)

Practicas el **[mock](../glosario/01-fundamentos.md#mock) de servicio** levantando con
[Prism](../glosario/03-apis.md#prism) una API de pedidos que todavía no existe, a partir de su [contrato](../glosario/03-apis.md#contrato-de-api)
[OpenAPI](../glosario/03-apis.md#openapi). Pruebas contra el mock un cliente pequeño, descubres que no
soporta un 404 y lo arreglas antes de que haya backend.

### Objetivo

Comprender qué es un [mock de servicio](../glosario/03-apis.md#mock-de-servicio): cómo funciona, cómo debe ser, cómo se detectan sus debilidades y cómo
se mejora.

### Punto de partida

- Codespace del curso abierto, con dos terminales en
  [`ejercicios/M03-06-mock-desde-el-contrato/`](../../ejercicios/M03-06-mock-desde-el-contrato/README.md).
- Sin credenciales y **sin backend**: solo están el contrato (`contrato/openapi.yaml`) y el cliente
  (`cliente/cliente.mjs`).
- El mock escucha en el puerto 3306.

```bash
# Terminal 2: entra en la carpeta del ejercicio
cd ejercicios/M03-06-mock-desde-el-contrato
```

### Qué está pasando

El equipo de backend y el de frontend han acordado el contrato de la API de pedidos, pero el backend tardará
en estar. Esperar bloquea al frontend; inventarse respuestas a mano hace que cada uno pruebe contra una API
distinta. Un mock generado **desde el contrato** responde lo que el contrato dice (sus ejemplos o datos
generados a partir de sus esquemas) y rechaza las peticiones que no lo cumplen, así que los dos equipos
trabajan contra la misma fuente de verdad.

| En la realidad | En este laboratorio |
|----------------|---------------------|
| La API de pedidos (aún por construir) | `npx prism mock contrato/openapi.yaml` en el puerto 3306 |
| El contrato acordado | `contrato/openapi.yaml` |
| La web o la app que consume la API | `cliente/cliente.mjs`, que imprime el resumen de un pedido |

### 1 — Leer el contrato

Abre `contrato/openapi.yaml`. Lo esencial:

```yaml
paths:
  /api/pedidos/{id}:
    get:
      parameters:
        - name: id
          in: path
          required: true
          schema: { type: integer, minimum: 1 }
      responses:
        '200':
          content:
            application/json:
              schema: { $ref: '#/components/schemas/Pedido' }
              examples:
                enviado:
                  value:
                    id: 1042
                    cliente: Ana
                    estado: enviado
                    total: 59.9
                    lineas:
                      - { producto: Teclado, cantidad: 2, precio: 24.9 }
                      - { producto: Alfombrilla, cantidad: 1, precio: 10.1 }
        '404':
          content:
            application/json:
              schema: { $ref: '#/components/schemas/Error' }
              example: { error: Pedido no encontrado }
  /api/pedidos:
    post:
      requestBody:
        content:
          application/json:
            schema: { $ref: '#/components/schemas/NuevoPedido' }   # cliente + al menos una línea
```

Dos rutas, qué respuestas puede dar cada una (200 y 404 para leer, 201 para crear), un ejemplo de cada y, en
`components.schemas`, los esquemas `Pedido`, `NuevoPedido` y `Error`: [JSON Schema](../glosario/03-apis.md#json-schema) dentro de OpenAPI.

### 2 — Levantar el mock

```bash
# Terminal 1: levanta el mock a partir del contrato (déjalo en marcha)
cd ejercicios/M03-06-mock-desde-el-contrato
npx prism mock contrato/openapi.yaml -p 3306
```

**Resultado esperado** (la hora y el número de la ruta de ejemplo, `835`, cambian; tarda unos segundos en
arrancar):

```text
[17:27:50] › [CLI] …  awaiting  Starting Prism…
[17:27:50] › [CLI] ℹ  info      GET        http://127.0.0.1:3306/api/pedidos/835
[17:27:50] › [CLI] ℹ  info      POST       http://127.0.0.1:3306/api/pedidos
[17:27:50] › [CLI] ▶  start     Prism is listening on http://127.0.0.1:3306
```

Prism ha leído el contrato y anuncia una ruta por operación. Nadie ha escrito código de servidor.

### 3 — Pedir un pedido al mock

```bash
# Terminal 2: lee el pedido 1042
curl -i http://localhost:3306/api/pedidos/1042
```

**Resultado esperado** (la fecha cambia):

```text
HTTP/1.1 200 OK
Access-Control-Allow-Origin: *
Access-Control-Allow-Headers: *
Access-Control-Allow-Credentials: true
Access-Control-Expose-Headers: *
Content-type: application/json
Content-Length: 174
Date: Tue, 17 Nov 2026 16:28:04 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"id":1042,"cliente":"Ana","estado":"enviado","total":59.9,"lineas":[{"producto":"Teclado","cantidad":2,"precio":24.9},{"producto":"Alfombrilla","cantidad":1,"precio":10.1}]}
```

Es el ejemplo `enviado` del contrato, tal cual. Las [cabeceras](../glosario/03-apis.md#cabecera-http) `Access-Control-*` las añade Prism para que una
web en otro origen pueda llamarlo.

### 4 — Ejecutar el cliente contra el mock

Abre `cliente/cliente.mjs`: pide `/api/pedidos/<id>` a `API_URL` (por defecto, el mock) y pinta el resumen.
Si existe la variable `PREFER`, la envía como cabecera `Prefer`: solo sirve para pedirle al mock una
respuesta concreta.

```bash
# Ejecuta el cliente para el pedido 1042
node cliente/cliente.mjs 1042
```

**Resultado esperado:**

```text
Pedido 1042 de Ana: enviado, total 59,90 €
  - 2 × Teclado
  - 1 × Alfombrilla
```

El cliente funciona… con la única respuesta que ha visto.

### 5 — Pedir al mock el caso de error

El contrato dice que leer un pedido puede dar 404. Con la cabecera `Prefer: code=404`, Prism devuelve esa
respuesta en lugar de la 200.

```bash
# Pide al mock la respuesta 404 del contrato
curl -i http://localhost:3306/api/pedidos/1042 -H 'Prefer: code=404'
```

**Resultado esperado:**

```text
HTTP/1.1 404 Not Found
Access-Control-Allow-Origin: *
Access-Control-Allow-Headers: *
Access-Control-Allow-Credentials: true
Access-Control-Expose-Headers: *
Content-type: application/json
Content-Length: 32
Date: Tue, 17 Nov 2026 16:28:04 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"error":"Pedido no encontrado"}
```

### 6 — Ejecutar el cliente con un 404

```bash
# Ejecuta el cliente pidiendo al mock la respuesta 404
PREFER=code=404 node cliente/cliente.mjs 1042
```

**Resultado esperado** (la ruta es la de tu Codespace):

```text
file:///workspaces/testing-automatizacion-agile-201/ejercicios/M03-06-mock-desde-el-contrato/cliente/cliente.mjs:12
const total = pedido.total.toFixed(2).replace('.', ',');
                           ^

TypeError: Cannot read properties of undefined (reading 'toFixed')
    at file:///workspaces/testing-automatizacion-agile-201/ejercicios/M03-06-mock-desde-el-contrato/cliente/cliente.mjs:12:28
    at process.processTicksAndRejections (node:internal/process/task_queues:103:5)

Node.js v22.23.3
```

El cliente da por hecho que siempre llega un pedido: con `{"error":"Pedido no encontrado"}`, `pedido.total`
no existe. Lo has encontrado sin backend y sin esperar a que el fallo ocurra en producción.

### 7 — Arreglar el cliente y comprobarlo contra el mock

En `cliente/cliente.mjs`, sustituye la línea `const pedido = await respuesta.json();` por este bloque, que
mira el estado antes de usar el cuerpo:

```js
// Antes de usar el cuerpo, mira el estado: un 404 no trae un pedido
if (respuesta.status === 404) {
  console.log(`No existe el pedido ${id}`);
  process.exit(1);
}
if (!respuesta.ok) {
  console.log(`La API ha respondido ${respuesta.status}: inténtalo más tarde`);
  process.exit(1);
}
const pedido = await respuesta.json();
```

```bash
# Comprueba el caso de error y el normal
PREFER=code=404 node cliente/cliente.mjs 1042
node cliente/cliente.mjs 1042
```

**Resultado esperado:**

```text
No existe el pedido 1042
Pedido 1042 de Ana: enviado, total 59,90 €
  - 2 × Teclado
  - 1 × Alfombrilla
```

### 8 — El mock también valida lo que le envías

Un mock desde el contrato no acepta cualquier cosa: comprueba que la **petición** cumple el contrato. El
contrato exige que un pedido nuevo tenga al menos una línea; envía uno sin líneas.

```bash
# Crea un pedido válido y luego uno sin líneas
curl -i -X POST http://localhost:3306/api/pedidos -H 'Content-Type: application/json' -d '{"cliente":"Luis","lineas":[{"producto":"Ratón","cantidad":1}]}'
curl -i -X POST http://localhost:3306/api/pedidos -H 'Content-Type: application/json' -d '{"cliente":"Luis","lineas":[]}'
```

**Resultado esperado** (sin las cabeceras `Access-Control-*`, `Date`, `Connection` y `Keep-Alive`):

```text
HTTP/1.1 201 Created
Content-type: application/json
Content-Length: 122

{"id":1043,"cliente":"Luis","estado":"pendiente","total":12.5,"lineas":[{"producto":"Ratón","cantidad":1,"precio":12.5}]}
HTTP/1.1 422 Unprocessable Entity
content-type: application/problem+json
Content-Length: 396

{"type":"https://stoplight.io/prism/errors#UNPROCESSABLE_ENTITY","title":"Invalid request","status":422,"detail":"Your request is not valid and no HTTP validation response was found in the spec, so Prism is generating this error for you.","validation":[{"location":["body","lineas"],"severity":"Error","code":"minItems","message":"Request body property lineas must NOT have fewer than 1 items"}]}
```

El 422 lo genera Prism, no el contrato: la petición incumple `minItems: 1` y `validation` dice dónde
(`body` → `lineas`). Un cliente que enviara pedidos vacíos lo descubriría aquí.

## Comprueba tu entendimiento

**El mock no tiene datos, tiene ejemplos**
Ejecuta el cliente con otro id.

```bash
# Pide el pedido 7
node cliente/cliente.mjs 7
```

→ Muestra el pedido 1042 de Ana: el mock devuelve el ejemplo del contrato sea cual sea el id. No sirve para
probar que «el pedido 7 es de Luis»: eso es lógica del backend.

**Parámetros que incumplen el contrato**
Pide un pedido con un id que no es un número:

```bash
# id no entero
curl -i http://localhost:3306/api/pedidos/abc
```
→ `422 Unprocessable Entity` con `Request path parameter id must be integer`: el contrato dice que `id` es
entero.

## Investiga

Mira el terminal 1 mientras haces peticiones: Prism registra cada una y cómo la ha resuelto. Para la del
paso 5 verás:

```text
[17:28:04] › [HTTP SERVER] get /api/pedidos/1042 ℹ  info      Request received
[17:28:04] ›     [NEGOTIATOR] ℹ  info      Request contains an accept header: */*
[17:28:04] ›     [VALIDATOR] ✔  success   The request passed the validation rules. Looking for the best response
[17:28:04] ›     [NEGOTIATOR] ✔  success   Found a compatible content for */*
[17:28:04] ›     [NEGOTIATOR] ✔  success   Responding with the requested status code 404
[17:28:04] ›     [NEGOTIATOR] ℹ  info      > Responding with "404"
```

`VALIDATOR` comprueba la petición contra el contrato y `NEGOTIATOR` elige la respuesta. Busca en el log la
línea de la petición del paso 8 que dio 422 y qué regla dice que incumple. Consulta en la
[documentación de Prism](https://docs.stoplight.io/docs/prism/) qué otros valores admite la cabecera
`Prefer` (por ejemplo, `example=` para elegir un ejemplo por su nombre).

## Experimenta

Prism tiene un modo dinámico (`-d`) que, en lugar de los ejemplos, **genera datos aleatorios que cumplen
los esquemas**. **Predice:** ¿qué mostrará el cliente? ¿Será siempre lo mismo?

Para el mock (`Ctrl+C` en el terminal 1) y arráncalo en modo dinámico:

```bash
# Terminal 1: mock con datos generados a partir de los esquemas
npx prism mock contrato/openapi.yaml -p 3306 -d
```

```bash
# Terminal 2: ejecuta el cliente dos veces y mira el cuerpo en crudo
node cliente/cliente.mjs 1042
node cliente/cliente.mjs 1042
curl -s http://localhost:3306/api/pedidos/1042
```

**Resultado esperado** (cada ejecución da datos distintos):

```text
Pedido 94704496 de irure tempor quis in in: pendiente, total 50523749,56 €
  - 77987848 × dolore adipisicing magna
  - 18674353 × commodo
Pedido 65385064 de dolor est sunt: pendiente, total 34675589,63 €
  - 9099034 × veniam labore Lorem
{"Duisb67":-56902117.13538158,"cillumd3":"dolor officia Lorem voluptate aute","cliente":"proident aliquip","cupidatat919":-16057458.395862415,"estado":"entregado","fugiatc6_":-7430578,"id":6954201,"lineas":[{"producto":"ullamco commodo ex nulla","cantidad":25853617,"precio":68965569.61067611,"et_b":"nostrud proident","fugiat_57":40817419.54406145,"exercitationb7":"minim deserunt eu in Duis"},{"producto":"dolore sit","cantidad":20030439,"precio":97389010.53792883,"velit429":false}],"suntd8e":true,"total":86356386.93589509}
```

Los valores cumplen los esquemas (enteros, `estado` del `enum`, `total` ≥ 0), pero aparecen campos que nadie
ha definido (`Duisb67`, `suntd8e`…): el esquema `Pedido` no dice `additionalProperties: false`, así que se
admiten. Es útil para descubrir clientes frágiles ante valores raros; con `Prefer: dynamic=false` vuelves al
ejemplo en una petición concreta. Para el mock y arráncalo otra vez sin `-d` para el reto.

## Reto

### 1 — Un 500 que el mock no sabe dar

**La situación:** con el cliente arreglado, pides al mock un fallo del servidor para ver el mensaje
«inténtalo más tarde»:

```bash
# Pide al mock la respuesta 500
PREFER=code=500 node cliente/cliente.mjs 1042
```

```text
No existe el pedido 1042
```

El cliente dice que el pedido no existe. Un compañero propone cambiar el cliente.

**Qué haces:** averigua qué responde realmente el mock a esa petición y por qué (`curl -i` con la cabecera `Prefer: code=500`).
Corrige donde esté el problema, reinicia Prism y repite la prueba.

**Pistas:** mira el `detail` del cuerpo; una respuesta se añade en `responses` del `get`, con su código entre
comillas, `description` y `content` como la del 404.

**Lo que buscas:** que `PREFER=code=500` muestre `La API ha respondido 500: inténtalo más tarde` y que
`PREFER=code=404` siga mostrando `No existe el pedido 1042`.

<details>
<summary>Ver solución</summary>

```bash
# Qué responde el mock al pedirle un 500
curl -i http://localhost:3306/api/pedidos/1042 -H 'Prefer: code=500'
```

```text
HTTP/1.1 404 Not Found
…
content-type: application/problem+json

{"type":"https://stoplight.io/prism/errors#NOT_FOUND","title":"The server cannot find the requested content","status":404,"detail":"Requested status code 500 is not defined in the document."}
```

El contrato no define un 500, así que Prism responde con un 404 propio. El cliente no tiene la culpa: falta
la respuesta en el contrato. Se añade bajo el `'404'` del `get` (está en `solucion/contrato/openapi.yaml`):

```yaml
        '500':
          description: Fallo del servidor
          content:
            application/json:
              schema: { $ref: '#/components/schemas/Error' }
              example: { error: Error interno }
```

```bash
# Terminal 1: reinicia el mock con el contrato corregido
npx prism mock contrato/openapi.yaml -p 3306
```

```bash
# Terminal 2: repite las dos pruebas
PREFER=code=500 node cliente/cliente.mjs 1042
PREFER=code=404 node cliente/cliente.mjs 1042
```

```text
La API ha respondido 500: inténtalo más tarde
No existe el pedido 1042
```

Un mock es tan bueno como el contrato del que sale: si el contrato no documenta un error, el mock no puede
simularlo y el cliente se prueba contra algo que no ocurrirá así. Corregir el contrato beneficia también al
backend, que ahora sabe que debe devolver ese 500 con ese formato. **La regla:** documenta en el contrato
todos los errores que el cliente debe tratar; si el mock no puede darte un caso, falta en el contrato.

</details>

## Errores frecuentes

| Síntoma | Causa probable | Cómo arreglarlo |
|---------|----------------|-----------------|
| `TypeError: fetch failed` con `connect ECONNREFUSED 127.0.0.1:3306` en el cliente | Prism no está en marcha o aún está arrancando | Arráncalo en el terminal 1 y espera a `Prism is listening` |
| Prism imprime su ayuda y al final `listen EADDRINUSE: address already in use 127.0.0.1:3306` | Ya hay otro Prism (u otro proceso) en el puerto | Para el anterior con `Ctrl+C` en su terminal |
| `422 Unprocessable Entity` inesperado | La petición incumple el contrato (tipo de un parámetro, campo obligatorio, `minItems`) | Lee `validation` en el cuerpo: dice `location` y `message` |
| El cambio en `openapi.yaml` no se nota | Prism sigue con el contrato que leyó al arrancar | Páralo y vuelve a arrancarlo |
| `PREFER=code=500` devuelve 404 | El contrato no define esa respuesta | Añádela en `responses` (reto) |

## Conclusiones

### Qué es un mock de servicio

Un sustituto de un servicio real que responde como él, para probar a quien lo usa sin depender de que
exista o esté disponible. Generado desde el contrato, responde sus ejemplos (o datos generados con `-d`) y
valida las peticiones contra él.

### Cómo debe ser

| Requisito | En el lab |
|-----------|-----------|
| Sale del contrato, no de respuestas inventadas | `npx prism mock contrato/openapi.yaml` |
| Permite pedir cada respuesta documentada | `Prefer: code=404`, `code=500` tras el reto |
| Rechaza peticiones que incumplen el contrato | 422 por `lineas` vacío y por `id` no entero |
| Sirve para probar el cliente en sus casos difíciles | El 404 rompió el cliente antes de que hubiera backend |

### Dónde se rompe y cómo lo has detectado

| Fallo | Cómo lo has visto | Qué provoca |
|-------|-------------------|-------------|
| Cliente que solo conoce el caso feliz | `TypeError … reading 'toFixed'` con `Prefer: code=404` | Pantallas rotas en producción |
| Contrato incompleto | `Requested status code 500 is not defined in the document.` | Casos que el mock no puede simular |
| Confiar en el mock para la lógica | El pedido 7 devuelve el 1042 | Pruebas que «pasan» sin probar nada del backend |
| Esquemas abiertos | Campos aleatorios extra en modo `-d` | Clientes que aceptan basura sin quejarse |

### Cómo se perfecciona

En un proyecto real, el contrato vive en un repositorio compartido, el mock se levanta en el [pipeline](../glosario/04-ci-cd.md#pipeline) del
frontend (o como contenedor) y, cuando el backend existe, Prism puede funcionar como proxy de validación
(`prism proxy`) para comprobar que el backend real también cumple el contrato. Las pruebas del cliente
contra el mock se complementan con pruebas del backend contra el mismo contrato.

### En una frase

> 🔑 Un mock desde el contrato te deja probar el cliente antes de que exista el backend, pero solo puede simular lo que el contrato documenta.
