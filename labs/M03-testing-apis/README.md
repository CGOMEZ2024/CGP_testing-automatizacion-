# M03 — Testing de APIs

[← Página anterior](../M02-funcionales-e2e/09-lab-flujo-con-cypress.md) · [Siguiente página →](00-anatomia-de-una-prueba-api.md)

Una API es la parte de la aplicación que más clientes tiene (la web, la app móvil, otros servicios) y la
que mejor se presta a la automatización: sin navegador, cada prueba tarda milisegundos y falla por una sola
razón. Este módulo recorre la **automatización de pruebas sobre [APIs REST](../glosario/03-apis.md#api-rest)**: validar respuestas, comprobar
[contratos](../glosario/03-apis.md#contrato-de-api) y permisos, ejecutar [colecciones de Postman](../glosario/03-apis.md#coleccion-postman) con [Newman](../glosario/03-apis.md#newman) desde la línea de comandos y aislar las
pruebas de los servicios con [mocks](../glosario/01-fundamentos.md#mock) e [intercepción de red](../glosario/03-apis.md#intercepcion-de-red).

## Qué aprenderás

- Escribir [pruebas de API](../glosario/01-fundamentos.md#prueba-de-api) con el cliente `request` de [Playwright](../glosario/02-e2e.md#playwright) que comprueban estado, [cabeceras](../glosario/03-apis.md#cabecera-http) y cuerpo,
  también en los casos de error.
- Detectar con un [JSON Schema](../glosario/03-apis.md#json-schema) validado por [Ajv](../glosario/03-apis.md#ajv) los cambios de una API que rompen a sus clientes aunque las
  pruebas de estado sigan en verde.
- Escribir las pruebas de una colección de Postman y ejecutarla con Newman con entornos, datos de un CSV,
  informes [JUnit](../glosario/04-ci-cd.md#junit-xml)/HTML y código de salida.
- Probar la [autenticación](../glosario/03-apis.md#autenticacion) y la [autorización](../glosario/03-apis.md#autorizacion) con la identidad que no debe entrar: 401 y 403.
- Levantar un mock de una API desde su [OpenAPI](../glosario/03-apis.md#openapi) con [Prism](../glosario/03-apis.md#prism) y probar un cliente antes de que exista el backend.
- Simular con `page.route` un 500, una respuesta lenta o una caída de red para probar cómo reacciona la
  interfaz.

## Teoría

### Qué tiene una prueba de API

Petición → respuesta → [aserciones](../glosario/01-fundamentos.md#asercion). Lo que se comprueba de la respuesta:

| Parte | Ejemplo | Qué detecta |
|-------|---------|-------------|
| [Código de estado](../glosario/03-apis.md#codigo-de-estado) | `201 Created`, `404 Not Found` | Que la operación ha tenido el resultado previsto |
| Cabeceras | `Content-Type: application/json`, `Location`, `WWW-Authenticate` | Que el cliente sabrá interpretarla y qué hacer después |
| Cuerpo | `{"id":1,"titulo":"…"}` | Que los datos son los correctos y tienen la forma acordada |
| Tiempo | `responseTime < 500` | Degradaciones bruscas (no es una prueba de rendimiento) |

Los códigos que más aparecen en el módulo:

| Código | Significa | Lo verás en |
|--------|-----------|-------------|
| 200 / 201 / 204 | Bien / creado / bien y sin cuerpo | Todos los labs |
| 400 | La petición tiene datos inválidos | Validar respuestas, Newman |
| 401 | No sé quién eres (sin token o token no válido) | Autenticación y autorización |
| 403 | Sé quién eres y no tienes permiso | Autenticación y autorización |
| 404 | No existe | Todos los labs |
| 422 | La petición incumple el contrato (lo genera Prism) | Mock desde el contrato |
| 500 | Fallo del servidor | Simular fallos, mock |

> [!NOTE]
> **Validar una respuesta** es comprobar valores concretos («la tarea 1 se llama *Preparar la demo*»).
> **Validar un contrato** es comprobar la forma («toda tarea tiene `id` entero y `hecha` booleano»). Se
> necesitan las dos: un contrato no sabe si el dato es el correcto y una prueba de valores no ve los campos
> que no nombra.

### Dos formas de escribir las mismas pruebas

| | Playwright `request` | Postman + Newman |
|--|----------------------|------------------|
| Dónde se escribe | Código JavaScript en `*.spec.js` | Colección JSON (o la app de Postman) con scripts `pm.test` |
| Quién suele escribirlo | Desarrollo y automatización | QA, también sin programar mucho |
| Datos y entornos | Variables, [fixtures](../glosario/02-e2e.md#fixture), configuración | `-e entorno.json`, `-d datos.csv` |
| Ejecución en el [pipeline](../glosario/04-ci-cd.md#pipeline) | `npx playwright test` | `npx newman run coleccion.json` |
| Fuerte en | Reutilizar código, combinar API y navegador | Explorar a mano y compartir colecciones |

### Mock frente a stub

> [!NOTE]
> Un **[mock de servicio](../glosario/03-apis.md#mock-de-servicio)** (Prism) sustituye a toda la API para cualquier cliente que lo llame: sirve para
> trabajar sin backend. Un **stub** con intercepción de red (`page.route`) cambia una respuesta concreta
> dentro de una prueba concreta: sirve para provocar un fallo puntual. Ninguno de los dos prueba el backend.

## Páginas

<!-- gen:paginas -->
| # | Página | Qué hay |
|---|--------|---------|
| 00 | [Anatomía de una prueba de API](00-anatomia-de-una-prueba-api.md) | Demostración: una petición con curl, lo que se comprueba de ella y la misma comprobación en Newman |
| 01 | [Lab — Validar respuestas](01-lab-validar-respuestas.md) | Pruebas una API de tareas con el [cliente request de Playwright](../glosario/03-apis.md#request-playwright): estado, cabeceras y cuerpo |
| 02 | [Lab — Contratos con JSON Schema](02-lab-contratos-json-schema.md) | Validas las respuestas contra el esquema del contrato y detectas un cambio que rompe a los clientes |
| 03 | [Lab — Colección de Postman](03-lab-coleccion-postman.md) | Escribes las pruebas de una colección con pm.test y la ejecutas con Newman |
| 04 | [Lab — Newman con datos y entornos](04-lab-newman-datos-y-entornos.md) | Encadenas peticiones con variables, cambias de entorno y alimentas la colección con un CSV |
| 05 | [Lab — Autenticación y autorización](05-lab-autenticacion-y-autorizacion.md) | Compruebas 401 sin token, 403 con el rol equivocado y 200 con el correcto |
| 06 | [Lab — Un mock desde el contrato](06-lab-mock-desde-el-contrato.md) | Levantas un mock con Prism a partir del OpenAPI y pruebas un cliente antes de que exista el backend |
| 07 | [Lab — Simular fallos](07-lab-simular-fallos.md) | Interceptas las llamadas de una página para simular un 500 y una respuesta lenta |

→ Empieza por **[00 — Anatomía de una prueba de API](00-anatomia-de-una-prueba-api.md)**.
<!-- /gen:paginas -->

## Conclusiones del módulo

| Concepto | Lo que te llevas | Dónde lo has visto romperse |
|----------|------------------|-----------------------------|
| Validación de respuestas | Estado exacto, cabeceras y cuerpo, y los casos negativos | `ok()` pasaba pidiendo la tarea equivocada |
| Contrato | `required` y `additionalProperties` hacen que el esquema obligue | Un campo renombrado pasaba en verde |
| Colección de Postman | Cada petición con sus `pm.test` | 4 peticiones, 3 aserciones, «0 failed» |
| Newman parametrizado | Entorno, CSV, reporters y código de salida desde fuera | `{{contactoId}}` vacío y URL `{{baseUrl}}` sin entorno |
| Autenticación y autorización | Probar con la identidad que no debe entrar | Sin control de rol, solo falla la prueba del lector |
| Mock desde el contrato | Probar el cliente antes de que exista el backend | El 500 que el contrato no documentaba |
| Intercepción de red | Provocar fallos de la API en la interfaz | Patrón mal escrito, [espera fija](../glosario/02-e2e.md#espera-fija), un `catch` para todo |

> 🔑 Una prueba de API vale por lo que comprueba y por los casos malos que cubre; contratos, entornos y
> mocks hacen que esas comprobaciones se repitan solas, en cualquier entorno y antes de que el fallo llegue
> al cliente.
