# Glosario 3 — Testing de APIs

[← Hoja anterior](02-e2e.md) · [Índice del glosario](README.md) · [Siguiente hoja →](04-ci-cd.md)

Conceptos de las pruebas sobre APIs REST: qué se comprueba de una respuesta, contratos, colecciones de
Postman y Newman, autenticación y autorización, mocks e intercepción de red. Se usan en el módulo M03 y
reaparecen en M04 cuando estas pruebas pasan al pipeline.

---

<a id="mapa"></a>
## 1. El mapa de familias

✔ = lo usas en el curso · ○ = hermano que no usamos, para que sepas que existe y cuándo se elige.

```text
Probar una API
├── Escribir y ejecutar las pruebas
│   ├── ✔ Playwright request ............. M03-01, M03-02, M03-05
│   ├── ✔ Postman (colección) + Newman ... M03-00, M03-03, M03-04
│   ├── ○ SuperTest / Vitest + fetch (pruebas de API dentro del proyecto Node)
│   ├── ○ REST Assured (equipos Java)
│   ├── ○ Karate (DSL propio, sin programar en un lenguaje general)
│   └── ○ Bruno / Insomnia (alternativas a Postman con colecciones en ficheros)
├── Comprobar el contrato
│   ├── ✔ JSON Schema + Ajv .............. M03-02
│   ├── ✔ OpenAPI (contrato de la API) ... M03-06
│   ├── ○ Pact (contratos dirigidos por el consumidor, varios equipos)
│   └── ○ Schemathesis (genera pruebas automáticamente desde el OpenAPI)
└── Aislar de los servicios
    ├── ✔ Prism (mock desde OpenAPI) ...... M03-06
    ├── ✔ page.route de Playwright (stub en el navegador) ... M03-07
    ├── ○ WireMock (mock de servicio configurable, muy usado en Java)
    └── ○ MSW — Mock Service Worker (stubs en el navegador o en Node, desde el código de la app)
```

<a id="comparacion-herramientas"></a>
### Comparación: con qué escribir las pruebas de API

| | ✔ Playwright `request` | ✔ Postman + Newman | ○ SuperTest | ○ REST Assured |
|--|--|--|--|--|
| **Cómo funciona** | Cliente HTTP dentro de Playwright Test; pruebas en JavaScript | Colección JSON con scripts `pm.test`; Newman la ejecuta en la terminal | Librería que lanza peticiones contra la app Node en el propio proceso | Librería Java con sintaxis `given().when().then()` |
| **Cuándo se elige** | El equipo ya usa Playwright y quiere mezclar API y navegador | QA trabaja en Postman y comparte colecciones; se quieren datos por CSV | Pruebas de integración de un backend Node, sin levantar servidor | Backend y equipo de pruebas en Java |
| **Qué cuesta** | Programar en JavaScript | Editar JSON a mano o depender de la app; lógica compleja incómoda | Solo sirve para apps Node | Ecosistema Java (Maven/Gradle, JUnit) |
| **En el curso** | 5 pruebas reforzadas en M03-01; matriz de 7 permisos en M03-05 | 14 aserciones en M03-03; 4 iteraciones desde CSV en M03-04 | — | — |

<a id="comparacion-aislar"></a>
### Comparación: cómo aislar las pruebas de un servicio

| | ✔ Prism | ✔ `page.route` | ○ WireMock | ○ MSW |
|--|--|--|--|--|
| **Cómo funciona** | Servidor HTTP que responde lo que dice el OpenAPI y valida las peticiones | Intercepta en el navegador las peticiones de una página durante una prueba | Servidor HTTP con respuestas definidas por reglas (JSON o código) | Intercepta `fetch` en el navegador (service worker) o en Node |
| **Cuándo se elige** | Hay contrato y aún no hay backend; varios clientes lo usan | Provocar un fallo concreto (500, lentitud, red caída) en una prueba de interfaz | Simular servicios de terceros con comportamiento a medida | La app front quiere sus propios stubs, reutilizables en desarrollo y pruebas |
| **Qué cuesta** | Solo responde ejemplos o datos aleatorios; nada de lógica | Solo dentro de pruebas de Playwright | Escribir y mantener las reglas | Integrarlo en el código de la aplicación |
| **En el curso** | 404, 422 y 500 (tras el reto) sin backend en M03-06 | 500, lenta, sin conexión, vacía y cuerpo vacío en M03-07 | — | — |

---

## 2. Los conceptos

<a id="api-rest"></a>
### API REST

**Qué es:** una interfaz HTTP en la que cada recurso tiene una URL (`/api/tareas/1`) y se maneja con los
métodos del protocolo: `GET` lee, `POST` crea, `PUT` reemplaza, `DELETE` borra. Las respuestas suelen ser
JSON y el resultado se expresa con el código de estado.

**En el curso:** cada ejercicio de M03 trae una API mínima en `app/server.mjs` hecha con `node:http`: tareas
(puerto 3301), libros (3303), contactos (3304), informes con sesión (3305), pedidos (3307).

**Dónde se rompe:** cuando la API cambia lo que devuelve sin avisar a sus clientes; en M03-02, la versión 2
renombra `hecha` a `completada` y sigue respondiendo 200.

**Lo usas en:** <!--usos:api-rest-->[M03](../M03-testing-apis/README.md) · [00-ana](../M03-testing-apis/00-anatomia-de-una-prueba-api.md)<!--/usos-->

Relacionado: [código de estado](#codigo-de-estado), [contrato de API](#contrato-de-api)

<a id="prueba-de-api"></a>
### Prueba de API

**Qué es:** una prueba que envía una petición HTTP a la API, sin interfaz, y comprueba con aserciones el
estado, las cabeceras y el cuerpo de la respuesta, tanto en el caso que va bien como en los de error.

**En el curso:** en M03-00 la misma comprobación se ve con `curl -i` y en una colección de Newman; en M03-01
las pruebas pasan de `respuesta.ok()` a `toBe(201)`, `content-type` y `toEqual` del cuerpo.

**Dónde se rompe:** una prueba que solo mira que la respuesta es 2xx; en M03-01, pedir la tarea 2 en lugar
de la 1 seguía dando `3 passed`.

**Lo usas en:** <!--usos:prueba-de-api-->[04-lab](../M01-introduccion-automatizacion/04-lab-prueba-de-integracion.md) · [M03](../M03-testing-apis/README.md) · [00-ana](../M03-testing-apis/00-anatomia-de-una-prueba-api.md) · [01-lab](../M03-testing-apis/01-lab-validar-respuestas.md) · [03-lab](../M03-testing-apis/03-lab-coleccion-postman.md) · [07-lab](../M04-ci-cd-testing-continuo/07-lab-entornos-efimeros.md)<!--/usos-->

Relacionado: [cliente request de Playwright](#request-playwright), [scripts de prueba de Postman](#pm-test)

<a id="codigo-de-estado"></a>
### Código de estado HTTP

**Qué es:** el número de tres cifras de la primera línea de la respuesta que resume el resultado: 2xx bien,
4xx error del cliente, 5xx error del servidor.

**En el curso:** 201 + `Location` al crear y 204 al borrar (M03-01), 400 por datos inválidos (M03-01, M03-04),
401 y 403 (M03-05), 422 de Prism (M03-06), 500 simulado (M03-07).

**Dónde se rompe:** cuando la prueba acepta cualquier 2xx; en M03-01, cambiar la creación de 201 a 200 solo
lo detecta `toBe(201)`.

**Lo usas en:** <!--usos:codigo-de-estado-->[09-lab](../M02-funcionales-e2e/09-lab-flujo-con-cypress.md) · [M03](../M03-testing-apis/README.md) · [00-ana](../M03-testing-apis/00-anatomia-de-una-prueba-api.md) · [01-lab](../M03-testing-apis/01-lab-validar-respuestas.md)<!--/usos-->

Relacionado: [autenticación](#autenticacion), [autorización](#autorizacion)

<a id="cabecera-http"></a>
### Cabecera HTTP

**Qué es:** un par nombre–valor que acompaña a la petición o a la respuesta. Las que más se prueban:
`Content-Type` (formato del cuerpo), `Location` (URL de lo creado), `Authorization` (credenciales) y
`WWW-Authenticate` (cómo autenticarse tras un 401).

**En el curso:** `respuesta.headers()['content-type']` en M03-01 (las claves van en minúsculas),
`X-Entorno` para saber qué entorno ha respondido en M03-04, `Authorization: Bearer …` en M03-05.

**Dónde se rompe:** leerla con mayúsculas en Playwright (`['Content-Type']` da `undefined`).

**Lo usas en:** <!--usos:cabecera-http-->[M03](../M03-testing-apis/README.md) · [00-ana](../M03-testing-apis/00-anatomia-de-una-prueba-api.md) · [01-lab](../M03-testing-apis/01-lab-validar-respuestas.md) · [03-lab](../M03-testing-apis/03-lab-coleccion-postman.md) · [04-lab](../M03-testing-apis/04-lab-newman-datos-y-entornos.md) · [05-lab](../M03-testing-apis/05-lab-autenticacion-y-autorizacion.md) · [06-lab](../M03-testing-apis/06-lab-mock-desde-el-contrato.md) · [07-lab](../M03-testing-apis/07-lab-simular-fallos.md)<!--/usos-->

Relacionado: [token Bearer](#token-bearer)

<a id="request-playwright"></a>
### Cliente `request` de Playwright

**Qué es:** el fixture `request` de Playwright Test: un cliente HTTP (`APIRequestContext`) que usa la
`baseURL` de la configuración y hace `get`, `post`, `put`, `delete` sin abrir navegador. No lanza excepción
con un 4xx o 5xx: devuelve la respuesta.

**En el curso:** proyectos sin navegador en M03-01, M03-02 y M03-05; en M03-05,
`playwright.request.newContext({ extraHTTPHeaders })` crea un cliente por rol (fixtures `comoAdmin`,
`comoLector`).

**Dónde se rompe:** llamar a `json()` sobre un 204 (`SyntaxError: Unexpected end of JSON input`).

**Lo usas en:** <!--usos:request-playwright-->[M03](../M03-testing-apis/README.md)<!--/usos-->

Relacionado: [prueba de API](#prueba-de-api)

<a id="contrato-de-api"></a>
### Contrato de API

**Qué es:** la descripción formal de lo que la API acepta y devuelve (campos, tipos, formatos, obligatorios,
errores) que comparten quien la construye y quien la usa. La prueba de contrato valida cada respuesta
contra esa descripción.

**En el curso:** `contrato/tarea.schema.json` en M03-02; `contrato/openapi.yaml` en M03-06.

**Dónde se rompe:** cuando el contrato solo describe y no obliga; en M03-02, sin `required` ni
`additionalProperties: false`, la versión 2 de la API lo cumplía.

**Lo usas en:** <!--usos:contrato-de-api-->[M03](../M03-testing-apis/README.md) · [01-lab](../M03-testing-apis/01-lab-validar-respuestas.md) · [02-lab](../M03-testing-apis/02-lab-contratos-json-schema.md) · [03-lab](../M03-testing-apis/03-lab-coleccion-postman.md) · [06-lab](../M03-testing-apis/06-lab-mock-desde-el-contrato.md) · [07-lab](../M03-testing-apis/07-lab-simular-fallos.md)<!--/usos-->

Relacionado: [JSON Schema](#json-schema), [OpenAPI](#openapi)

<a id="json-schema"></a>
### JSON Schema

**Qué es:** un estándar para describir la forma de un documento JSON con palabras clave: `type`,
`properties`, `required`, `additionalProperties`, `items`, `format`, `enum`, `minItems`…

**En el curso:** el esquema `Tarea` de M03-02 (draft-07), el de error del reto, el de libro con
`pm.response.to.have.jsonSchema` en M03-03 y los `components.schemas` del OpenAPI de M03-06.

**Cómo funciona por dentro:** `properties` solo se aplica a los campos **que aparecen**. Para la respuesta
`{"id":1,"titulo":"Preparar la demo","creada":"…","completada":false}`: sin `required`, falta `hecha` y no
pasa nada; con `required` → `must have required property 'hecha'`; con `additionalProperties: false` →
además `must NOT have additional properties` por `completada`.

**Dónde se rompe:** esquemas abiertos que aceptan casi todo (M03-02) y campos aleatorios extra al generar
datos con Prism `-d` (M03-06).

**Lo usas en:** <!--usos:json-schema-->[M03](../M03-testing-apis/README.md) · [02-lab](../M03-testing-apis/02-lab-contratos-json-schema.md) · [03-lab](../M03-testing-apis/03-lab-coleccion-postman.md) · [06-lab](../M03-testing-apis/06-lab-mock-desde-el-contrato.md)<!--/usos-->

Relacionado: [Ajv](#ajv), [contrato de API](#contrato-de-api)

<a id="ajv"></a>
### Ajv

**Qué es:** el validador de JSON Schema más usado en JavaScript. `ajv.compile(esquema)` devuelve una función
que dice si un dato cumple y deja los motivos en `.errors`; `ajv-formats` añade formatos como `date-time` o
`email`.

**En el curso:** `tests/contrato.spec.js` de M03-02, con `allErrors: true` y `ajv.errorsText()` en el mensaje
de `expect`.

**Dónde se rompe:** usar `format` sin `addFormats(ajv)`: `Error: unknown format "date-time" ignored in schema`.

**Lo usas en:** <!--usos:ajv-->[M03](../M03-testing-apis/README.md) · [02-lab](../M03-testing-apis/02-lab-contratos-json-schema.md)<!--/usos-->

Relacionado: [JSON Schema](#json-schema)

<a id="openapi"></a>
### OpenAPI

**Qué es:** el formato estándar (YAML o JSON) para describir una API REST entera: rutas, parámetros,
cuerpos de petición, respuestas por código, ejemplos y esquemas (que son JSON Schema). De él salen
documentación, mocks, clientes y pruebas.

**En el curso:** `contrato/openapi.yaml` de M03-06 (API de pedidos), con ejemplos para 200, 404 y 201, y la
respuesta 500 que se añade en el reto.

**Dónde se rompe:** un OpenAPI que no documenta un error no permite simularlo: Prism responde
`Requested status code 500 is not defined in the document.`

**Lo usas en:** <!--usos:openapi-->[M03](../M03-testing-apis/README.md) · [02-lab](../M03-testing-apis/02-lab-contratos-json-schema.md) · [06-lab](../M03-testing-apis/06-lab-mock-desde-el-contrato.md) · [07-lab](../M03-testing-apis/07-lab-simular-fallos.md)<!--/usos-->

Relacionado: [Prism](#prism), [contrato de API](#contrato-de-api)

<a id="coleccion-postman"></a>
### Colección de Postman

**Qué es:** un fichero JSON (formato v2.1) con una lista de peticiones, sus variables y sus scripts. Se edita
en la aplicación de Postman o a mano, y se ejecuta con Newman.

**En el curso:** `coleccion.postman.json` en M03-00, M03-03 y M03-04, editadas en VS Code: cada script es el
array `"exec"` del evento `"listen": "test"`.

**Dónde se rompe:** peticiones sin pruebas (M03-03: cuatro peticiones, tres aserciones, «0 failed») y JSON
mal editado (`collection could not be loaded`).

**Lo usas en:** <!--usos:coleccion-postman-->[M03](../M03-testing-apis/README.md) · [00-ana](../M03-testing-apis/00-anatomia-de-una-prueba-api.md) · [03-lab](../M03-testing-apis/03-lab-coleccion-postman.md)<!--/usos-->

Relacionado: [scripts de prueba de Postman](#pm-test), [Newman](#newman)

<a id="pm-test"></a>
### Scripts de prueba de Postman (`pm.test`)

**Qué es:** JavaScript que se ejecuta al recibir la respuesta de una petición. `pm.test('nombre', fn)` declara
una prueba; dentro, `pm.response.to.have.status`, `pm.response.to.have.header`,
`pm.response.to.have.jsonSchema` y `pm.expect(…)` (sintaxis de Chai) son las aserciones.

**En el curso:** M03-03 (estado, cuerpo, esquema, `Location`, tiempo de respuesta) y M03-04
(`pm.collectionVariables.set`, `pm.execution.setNextRequest(null)`, `pm.variables.get`).

**Dónde se rompe:** una aserción mal escrita se ve numerada en Newman con su detalle
(`expected 'Clean Code' to deeply equal 'Clean code'`).

**Lo usas en:** <!--usos:pm-test-->[03-lab](../M03-testing-apis/03-lab-coleccion-postman.md)<!--/usos-->

Relacionado: [colección de Postman](#coleccion-postman)

<a id="newman"></a>
### Newman

**Qué es:** el ejecutor de colecciones de Postman por línea de comandos. No necesita la aplicación ni una
cuenta; termina con código 0 si todas las aserciones pasan y 1 si alguna falla.

**En el curso:** `npx newman run coleccion.postman.json` con `-e` (entorno), `-d` (CSV) y
`-r cli,junit,htmlextra` (informes en `reports/`) en M03-04.

**Dónde se rompe:** sin `-e`, las URL quedan como `{{baseUrl}}` y fallan por DNS; el código de salida 1
aparece aunque todas las peticiones hayan respondido (falla una aserción).

**Lo usas en:** <!--usos:newman-->[00-tes](../M01-introduccion-automatizacion/00-testing-en-agile-y-devops.md) · [01-lab](../M01-introduccion-automatizacion/01-lab-preparar-el-entorno.md) · [M03](../M03-testing-apis/README.md) · [00-ana](../M03-testing-apis/00-anatomia-de-una-prueba-api.md) · [03-lab](../M03-testing-apis/03-lab-coleccion-postman.md) · [04-lab](../M03-testing-apis/04-lab-newman-datos-y-entornos.md)<!--/usos-->

Relacionado: [entorno de Postman](#entorno-postman), [pruebas dirigidas por datos](#pruebas-dirigidas-por-datos)

<a id="entorno-postman"></a>
### Entorno y variables de Postman

**Qué es:** un entorno es un fichero con variables (`baseUrl`, credenciales…) que se elige al ejecutar; las
variables de colección viven en la colección y los scripts pueden escribirlas para encadenar peticiones.
`pm.variables.get` busca en todos los ámbitos y devuelve el más específico (datos > entorno > colección).

**En el curso:** `entorno-local.json` (3304) y `entorno-preproduccion.json` (3314) en M03-04;
`contactoId` se guarda tras crear y lo usan leer y borrar.

**Dónde se rompe:** una variable que nadie rellena: `GET /api/contactos/` sin id → 405 en las tres
peticiones siguientes.

**Lo usas en:** <!--usos:entorno-postman-->[03-lab](../M03-testing-apis/03-lab-coleccion-postman.md) · [04-lab](../M03-testing-apis/04-lab-newman-datos-y-entornos.md)<!--/usos-->

Relacionado: [Newman](#newman)

<a id="pruebas-dirigidas-por-datos"></a>
### Pruebas dirigidas por datos

**Qué es:** la misma prueba ejecutada con varios juegos de datos, uno por iteración, que vienen de un fichero
(CSV o JSON). Un caso nuevo es una fila nueva, sin tocar la lógica.

**En el curso:** `datos.csv` (3 iteraciones, una negativa con 400) y `datos-reto.csv` con la columna
`errorEsperado` (4 iteraciones, 15 aserciones) en M03-04.

**Dónde se rompe:** un dato mal puesto da un falso rojo; Newman indica la fila con `iteration: 3`.

**Lo usas en:** <!--usos:pruebas-dirigidas-por-datos-->[04-lab](../M03-testing-apis/04-lab-newman-datos-y-entornos.md)<!--/usos-->

Relacionado: [Newman](#newman)

<a id="autenticacion"></a>
### Autenticación

**Qué es:** comprobar quién hace la petición: credenciales al iniciar sesión y, después, un token en cada
petición. Si falla (no hay token, es falso o ha caducado), la API responde **401** con `WWW-Authenticate`.

**En el curso:** `POST /api/login` y `verificarToken` en M03-05; pruebas `sin token: 401` y
`token inventado: 401`, y el reto del token manipulado.

**Dónde se rompe:** un servidor que no verifica la firma acepta un token reescrito (`Received: 200` en el
reto).

**Lo usas en:** <!--usos:autenticacion-->[M03](../M03-testing-apis/README.md) · [05-lab](../M03-testing-apis/05-lab-autenticacion-y-autorizacion.md)<!--/usos-->

Relacionado: [autorización](#autorizacion), [token Bearer](#token-bearer)

<a id="autorizacion"></a>
### Autorización

**Qué es:** decidir si una identidad ya autenticada puede hacer una operación, normalmente por su rol. Si no
puede, la API responde **403**.

**En el curso:** `GET /api/admin/usuarios` solo para `admin` en M03-05; la prueba
`lector en la zona de admin: 403`.

**Dónde se rompe:** si se quita la comprobación de rol, las pruebas del administrador siguen pasando; solo la
del lector falla (`Expected: 403 Received: 200`).

**Lo usas en:** <!--usos:autorizacion-->[M03](../M03-testing-apis/README.md) · [05-lab](../M03-testing-apis/05-lab-autenticacion-y-autorizacion.md)<!--/usos-->

Relacionado: [autenticación](#autenticacion)

<a id="token-bearer"></a>
### Token Bearer

**Qué es:** una credencial que se envía en `Authorization: Bearer <token>`: quien la «porta» queda
autenticado. Suele llevar datos (usuario, rol, caducidad) firmados por el servidor, como un JWT.

**En el curso:** el token de M03-05 es `datos.firma`: JSON en base64url y firma HMAC-SHA256 con un secreto
del servidor (`node:crypto`).

**Cómo funciona por dentro:** los datos de `luis` decodificados son
`{"usuario":"luis","rol":"lector","exp":…}`; cualquiera puede leerlos, pero la firma es
HMAC(secreto, datos): al cambiar `lector` por `admin`, la firma original deja de coincidir y la API responde
401 `Token no válido`.

**Dónde se rompe:** pegar el token con espacios o sin la palabra `Bearer `; firmar sin verificar.

**Lo usas en:** <!--usos:token-bearer-->—<!--/usos-->

Relacionado: [autenticación](#autenticacion)

<a id="mock-de-servicio"></a>
### Mock de servicio

**Qué es:** un sustituto de un servicio que responde como él, para probar a sus clientes sin depender de que
exista o esté disponible. Si sale del contrato, también rechaza las peticiones que no lo cumplen.

**En el curso:** la API de pedidos de M03-06, que no existe: el cliente se prueba contra el mock y se
descubre que no soportaba un 404.

**Dónde se rompe:** no tiene lógica (el pedido 7 devuelve el ejemplo del 1042) y solo simula lo que el
contrato documenta.

**Lo usas en:** <!--usos:mock-de-servicio-->[M03](../M03-testing-apis/README.md) · [06-lab](../M03-testing-apis/06-lab-mock-desde-el-contrato.md)<!--/usos-->

Relacionado: [Prism](#prism), [intercepción de red](#intercepcion-de-red)

<a id="prism"></a>
### Prism

**Qué es:** la herramienta de Stoplight que levanta un servidor mock a partir de un OpenAPI
(`prism mock`). Responde los ejemplos del contrato (o datos generados con `-d`), deja elegir la respuesta con
la cabecera `Prefer` (`code=404`, `example=…`, `dynamic=false`) y responde 422 a las peticiones inválidas.

**En el curso:** `npx prism mock contrato/openapi.yaml -p 3306` en M03-06.

**Dónde se rompe:** pedir un código que el contrato no define (`Prefer: code=500` → 404 de Prism); cambiar el
contrato y no reiniciar Prism.

**Lo usas en:** <!--usos:prism-->[01-lab](../M01-introduccion-automatizacion/01-lab-preparar-el-entorno.md) · [M03](../M03-testing-apis/README.md) · [06-lab](../M03-testing-apis/06-lab-mock-desde-el-contrato.md)<!--/usos-->

Relacionado: [OpenAPI](#openapi), [mock de servicio](#mock-de-servicio)

<a id="intercepcion-de-red"></a>
### Intercepción de red (stub)

**Qué es:** colocar la prueba entre el navegador y la red para decidir qué recibe la página en una petición
concreta. En Playwright, `page.route(patrón, manejador)` con `route.fulfill` (respuesta inventada),
`route.abort` (error de red) o `route.continue` (dejarla pasar, quizá más tarde).

**En el curso:** M03-07: 500, respuesta retenida para ver «Cargando pedidos…», `abort('connectionrefused')`,
lista vacía y 200 sin cuerpo, sobre una API real que siempre responde bien.

**Dónde se rompe:** instalar la ruta después de `page.goto` o con un patrón que no coincide
(`'**/api/pedido'` → `element(s) not found`); esperas fijas de segundos.

**Lo usas en:** <!--usos:intercepcion-de-red-->[M03](../M03-testing-apis/README.md) · [07-lab](../M03-testing-apis/07-lab-simular-fallos.md)<!--/usos-->

Relacionado: [mock de servicio](#mock-de-servicio)
