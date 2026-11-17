# Lab — Autenticación y autorización

[← Página anterior](04-lab-newman-datos-y-entornos.md) · [Siguiente página →](06-lab-mock-desde-el-contrato.md)

Practicas la diferencia entre **[autenticación](../glosario/03-apis.md#autenticacion) y
[autorización](../glosario/03-apis.md#autorizacion)** con una API de informes que da un
token al iniciar sesión y tiene una zona solo para administradores.
Partes de pruebas que solo cubren al administrador y añades los casos que importan: 401 sin token o con un
token falso, 403 con el rol equivocado y 200 con el correcto.

### Objetivo

Comprender qué es la autenticación frente a la autorización: cómo funciona, cómo debe ser, cómo se
detectan sus debilidades y cómo se mejora.

### Punto de partida

- Codespace del curso abierto y un terminal en
  [`ejercicios/M03-05-autenticacion-y-autorizacion/`](../../ejercicios/M03-05-autenticacion-y-autorizacion/README.md).
- La API (`app/server.mjs`, puerto 3305) tiene dos usuarios:

| Usuario | Clave | Rol |
|---------|-------|-----|
| `ana` | `ana123` | `admin` |
| `luis` | `luis123` | `lector` |

- [Playwright](../glosario/02-e2e.md#playwright) arranca la API al ejecutar las pruebas (`webServer`), sin navegador.

```bash
# Entra en la carpeta del ejercicio
cd ejercicios/M03-05-autenticacion-y-autorizacion
```

### Qué está pasando

Son dos preguntas distintas que la API se hace en cada petición:

| Pregunta | Nombre | Si la respuesta es «no» |
|----------|--------|-------------------------|
| ¿Quién eres? ¿Tu token es auténtico y no ha caducado? | Autenticación | **401 Unauthorized** (+ [cabecera](../glosario/03-apis.md#cabecera-http) `WWW-Authenticate`) |
| Sé quién eres: ¿puedes hacer esto? | Autorización | **403 Forbidden** |

Las pruebas «felices» (el admin entra) son las que menos protegen: un fallo de seguridad típico es que la
zona de admin compruebe que hay sesión pero no el rol, y eso solo lo detecta una prueba que entra **con
el rol equivocado**. En la API, `POST /api/login` devuelve un token `datos.firma`: los datos (usuario, rol,
caducidad) en base64url y una firma HMAC-SHA256 con un secreto que solo conoce el servidor.

| Ruta | Quién puede |
|------|-------------|
| `GET /api/informes` | Cualquier usuario con sesión |
| `GET /api/admin/usuarios` | Solo `admin` |

### 1 — Ejecutar las pruebas de partida

```bash
# Ejecuta las pruebas (Playwright arranca la API en el puerto 3305)
npx playwright test
```

**Resultado esperado** (los tiempos cambian):

```text
Running 2 tests using 1 worker

  ✓  1 tests/auth.spec.js:11:1 › admin lee los informes (37ms)
  ✓  2 tests/auth.spec.js:19:1 › admin lee los usuarios (16ms)

  2 passed (1.2s)
```

Abre `tests/auth.spec.js`: una función `login()` pide el token y cada prueba lo envía en la cabecera
`Authorization: Bearer <token>`. Solo se prueba a `ana`.

### 2 — Mirar las respuestas en crudo

Arranca la API a mano para ver qué responde en cada caso.

```bash
# Terminal 2: arranca la API
cd ejercicios/M03-05-autenticacion-y-autorizacion
PORT=3305 node app/server.mjs
```

```bash
# Terminal 1: inicia sesión como ana
curl -i -X POST http://localhost:3305/api/login -H 'Content-Type: application/json' -d '{"usuario":"ana","clave":"ana123"}'
```

**Resultado esperado** (el token cambia en cada inicio de sesión porque lleva la hora de caducidad):

```text
HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8
Date: Tue, 17 Nov 2026 16:26:35 GMT
Connection: keep-alive
Keep-Alive: timeout=5
Transfer-Encoding: chunked

{"token":"eyJ1c3VhcmlvIjoiYW5hIiwicm9sIjoiYWRtaW4iLCJleHAiOjE3OTQ5MzYzOTV9.her7LWQ6KwBsasfWhdKNhSuTz6tt6xo1qPSeKEH8pSs"}
```

Pide los informes sin token:

```bash
# Sin cabecera Authorization
curl -i http://localhost:3305/api/informes
```

```text
HTTP/1.1 401 Unauthorized
Content-Type: application/json; charset=utf-8
WWW-Authenticate: Bearer
Date: Tue, 17 Nov 2026 16:26:35 GMT
Connection: keep-alive
Keep-Alive: timeout=5
Transfer-Encoding: chunked

{"error":"Falta el token"}
```

Ahora inicia sesión como `luis` con el mismo `curl` de antes (`"usuario":"luis","clave":"luis123"`), copia
el valor de `token` de la respuesta y pide la zona de admin con él:

```bash
# Guarda en TOKEN el token de luis (pega el tuyo entre las comillas)
TOKEN='pega-aquí-el-token-de-luis'
# Pide la zona de admin con el token de un lector
curl -i http://localhost:3305/api/admin/usuarios -H "Authorization: Bearer $TOKEN"
```

```text
HTTP/1.1 403 Forbidden
Content-Type: application/json; charset=utf-8
Date: Tue, 17 Nov 2026 16:26:35 GMT
Connection: keep-alive
Keep-Alive: timeout=5
Transfer-Encoding: chunked

{"error":"Necesitas el rol admin"}
```

401: la API no sabe quién eres. 403: lo sabe, y no tienes permiso. Para la API con `Ctrl+C` en el
terminal 2.

### 3 — Probar el 401 sin token

Añade al final de `tests/auth.spec.js`:

```js
test('sin token: 401', async ({ request }) => {
  const respuesta = await request.get('/api/informes');
  expect(respuesta.status()).toBe(401);
  expect(respuesta.headers()['www-authenticate']).toBe('Bearer'); // cómo autenticarse
  expect(await respuesta.json()).toEqual({ error: 'Falta el token' });
});
```

```bash
# Ejecuta las pruebas cuyo título contiene «401»
npx playwright test -g "401"
```

**Resultado esperado:**

```text
Running 1 test using 1 worker

  ✓  1 tests/auth.spec.js:27:1 › sin token: 401 (45ms)

  1 passed (794ms)
```

### 4 — Probar el 401 con un token inventado

Que haya cabecera no basta: el token tiene que ser auténtico. Añade:

```js
test('token inventado: 401', async ({ request }) => {
  const respuesta = await request.get('/api/informes', {
    headers: { Authorization: 'Bearer esto.no-es-un-token' },
  });
  expect(respuesta.status()).toBe(401);
  expect(await respuesta.json()).toEqual({ error: 'Token no válido' });
});
```

```bash
# Ejecuta las dos pruebas de 401
npx playwright test -g "401"
```

**Resultado esperado:**

```text
Running 2 tests using 1 worker

  ✓  1 tests/auth.spec.js:27:1 › sin token: 401 (35ms)
  ✓  2 tests/auth.spec.js:34:1 › token inventado: 401 (13ms)

  2 passed (869ms)
```

### 5 — Probar la autorización con el lector

Las dos pruebas que más importan: `luis` **no** entra en la zona de admin (403) y **sí** lee los informes
(200). La segunda evita el error contrario: cerrar de más. Añade:

```js
test('lector en la zona de admin: 403', async ({ request }) => {
  const token = await login(request, 'luis', 'luis123');
  const respuesta = await request.get('/api/admin/usuarios', {
    headers: { Authorization: `Bearer ${token}` },
  });
  expect(respuesta.status()).toBe(403);
  expect(await respuesta.json()).toEqual({ error: 'Necesitas el rol admin' });
});

test('lector lee los informes', async ({ request }) => {
  const token = await login(request, 'luis', 'luis123');
  const respuesta = await request.get('/api/informes', {
    headers: { Authorization: `Bearer ${token}` },
  });
  expect(respuesta.status()).toBe(200);
});
```

```bash
# Ejecuta todas las pruebas
npx playwright test
```

**Resultado esperado:**

```text
Running 6 tests using 1 worker

  ✓  1 tests/auth.spec.js:11:1 › admin lee los informes (33ms)
  ✓  2 tests/auth.spec.js:19:1 › admin lee los usuarios (13ms)
  ✓  3 tests/auth.spec.js:27:1 › sin token: 401 (11ms)
  ✓  4 tests/auth.spec.js:34:1 › token inventado: 401 (9ms)
  ✓  5 tests/auth.spec.js:42:1 › lector en la zona de admin: 403 (12ms)
  ✓  6 tests/auth.spec.js:51:1 › lector lee los informes (10ms)

  6 passed (806ms)
```

Tienes la matriz completa: sin sesión, sesión falsa, rol que no puede y roles que sí.

## Comprueba tu entendimiento

**Credenciales incorrectas**
Con la API arrancada a mano, inicia sesión con una clave equivocada:

```bash
# Login con clave incorrecta
curl -i -X POST http://localhost:3305/api/login -H 'Content-Type: application/json' -d '{"usuario":"ana","clave":"mal"}'
```

→ `HTTP/1.1 401 Unauthorized` y `{"error":"Credenciales incorrectas"}`: no hay sesión, así que es un
problema de autenticación, no de permisos.

**401 o 403**
Sin ejecutar nada, decide qué código corresponde a: (a) un token caducado; (b) un lector que intenta
borrar un usuario; (c) una petición sin cabecera `Authorization`.
→ (a) 401, (b) 403, (c) 401. Solo (b) sabe quién eres.

## Investiga

El token no está cifrado, solo firmado: cualquiera puede leer sus datos. Con la API arrancada, decodifica la
primera parte del token de `luis` (lo que va antes del punto):

```bash
# Decodifica la parte de datos del token (base64url → JSON)
node -e "console.log(Buffer.from(process.argv[1].split('.')[0], 'base64url').toString())" "$TOKEN"
```

**Resultado esperado** (`exp` cambia):

```text
{"usuario":"luis","rol":"lector","exp":1794936395}
```

¿Qué impide a `luis` cambiar `"lector"` por `"admin"`? Busca en `app/server.mjs` la función
`verificarToken` y localiza qué compara. Esa es la base del reto.

## Experimenta

Alguien «simplifica» la zona de admin y quita la comprobación del rol. **Predice:** de las seis pruebas,
¿cuáles fallan?

En `app/server.mjs`, comenta la línea de la autorización:

```js
    // if (sesion.rol !== 'admin') return enviarJson(res, 403, { error: 'Necesitas el rol admin' });
```

```bash
# Ejecuta todas las pruebas con la API modificada
npx playwright test
```

**Resultado esperado** (extracto):

```text
  ✓  1 tests/auth.spec.js:11:1 › admin lee los informes (36ms)
  ✓  2 tests/auth.spec.js:19:1 › admin lee los usuarios (12ms)
  ✓  3 tests/auth.spec.js:27:1 › sin token: 401 (11ms)
  ✓  4 tests/auth.spec.js:34:1 › token inventado: 401 (12ms)
  ✘  5 tests/auth.spec.js:42:1 › lector en la zona de admin: 403 (14ms)
  ✓  6 tests/auth.spec.js:51:1 › lector lee los informes (39ms)


  1) tests/auth.spec.js:42:1 › lector en la zona de admin: 403 ─────────────────────────────────────

    Error: expect(received).toBe(expected) // Object.is equality

    Expected: 403
    Received: 200
…
  1 failed
    tests/auth.spec.js:42:1 › lector en la zona de admin: 403 ──────────────────────────────────────
  5 passed (1.3s)
```

Solo falla una, y es una que no tenías al empezar: con las dos pruebas de partida, un lector con acceso de
administrador pasaba en verde. Quita el comentario de la línea.

## Mejora

Repetir `login()` y la cabecera en cada prueba hace fácil olvidarla. Con [fixtures](../glosario/02-e2e.md#fixture) de Playwright, cada
prueba pide un cliente ya autenticado por rol: `comoAdmin`, `comoLector` o `sinSesion`. Crea
`tests/sesiones.js`:

```js
// Fixtures por rol: cada prueba recibe un cliente HTTP que ya lleva (o no) la cabecera Authorization.
import { test as base, expect } from '@playwright/test';

const credenciales = { admin: ['ana', 'ana123'], lector: ['luis', 'luis123'] };

async function clienteConSesion(playwright, baseURL, rol) {
  const anonimo = await playwright.request.newContext({ baseURL });
  const [usuario, clave] = credenciales[rol];
  const respuesta = await anonimo.post('/api/login', { data: { usuario, clave } });
  expect(respuesta.status()).toBe(200);
  const { token } = await respuesta.json();
  await anonimo.dispose();
  return playwright.request.newContext({
    baseURL,
    extraHTTPHeaders: { Authorization: `Bearer ${token}` }, // va en todas sus peticiones
  });
}

export const test = base.extend({
  comoAdmin: async ({ playwright, baseURL }, use) => {
    const cliente = await clienteConSesion(playwright, baseURL, 'admin');
    await use(cliente);
    await cliente.dispose();
  },
  comoLector: async ({ playwright, baseURL }, use) => {
    const cliente = await clienteConSesion(playwright, baseURL, 'lector');
    await use(cliente);
    await cliente.dispose();
  },
  sinSesion: async ({ request }, use) => {
    await use(request); // el cliente por defecto no lleva token
  },
});
export { expect };
```

Y reescribe `tests/auth.spec.js` como una matriz rol × ruta (es `solucion/tests/auth.spec.js`):

```js
import { test, expect } from './sesiones.js';

test.describe('GET /api/informes (cualquier sesión)', () => {
  test('sin token: 401', async ({ sinSesion }) => {
    const respuesta = await sinSesion.get('/api/informes');
    expect(respuesta.status()).toBe(401);
    expect(respuesta.headers()['www-authenticate']).toBe('Bearer');
  });

  test('token inventado: 401', async ({ sinSesion }) => {
    const respuesta = await sinSesion.get('/api/informes', {
      headers: { Authorization: 'Bearer esto.no-es-un-token' },
    });
    expect(respuesta.status()).toBe(401);
    expect(await respuesta.json()).toEqual({ error: 'Token no válido' });
  });

  test('lector: 200', async ({ comoLector }) => {
    expect((await comoLector.get('/api/informes')).status()).toBe(200);
  });

  test('admin: 200', async ({ comoAdmin }) => {
    expect((await comoAdmin.get('/api/informes')).status()).toBe(200);
  });
});

test.describe('GET /api/admin/usuarios (solo admin)', () => {
  test('sin token: 401', async ({ sinSesion }) => {
    expect((await sinSesion.get('/api/admin/usuarios')).status()).toBe(401);
  });

  test('lector: 403', async ({ comoLector }) => {
    const respuesta = await comoLector.get('/api/admin/usuarios');
    expect(respuesta.status()).toBe(403);
    expect(await respuesta.json()).toEqual({ error: 'Necesitas el rol admin' });
  });

  test('admin: 200', async ({ comoAdmin }) => {
    const respuesta = await comoAdmin.get('/api/admin/usuarios');
    expect(respuesta.status()).toBe(200);
    expect(await respuesta.json()).toContainEqual({ nombre: 'luis', rol: 'lector' });
  });
});
```

```bash
# Ejecuta la matriz
npx playwright test
```

**Resultado esperado:**

```text
Running 7 tests using 1 worker

  ✓  1 tests/auth.spec.js:5:3 › GET /api/informes (cualquier sesión) › sin token: 401 (23ms)
  ✓  2 tests/auth.spec.js:11:3 › GET /api/informes (cualquier sesión) › token inventado: 401 (10ms)
  ✓  3 tests/auth.spec.js:19:3 › GET /api/informes (cualquier sesión) › lector: 200 (15ms)
  ✓  4 tests/auth.spec.js:23:3 › GET /api/informes (cualquier sesión) › admin: 200 (11ms)
  ✓  5 tests/auth.spec.js:29:3 › GET /api/admin/usuarios (solo admin) › sin token: 401 (6ms)
  ✓  6 tests/auth.spec.js:33:3 › GET /api/admin/usuarios (solo admin) › lector: 403 (10ms)
  ✓  7 tests/auth.spec.js:39:3 › GET /api/admin/usuarios (solo admin) › admin: 200 (7ms)

  7 passed (720ms)
```

El informe se lee como una tabla de permisos: cada ruta, cada rol, su código.

## Reto

### 1 — Un lector se fabrica un token de admin

**La situación:** `luis` ha visto en Investiga que los datos del token se leen sin clave. Prueba a cambiar
`"rol":"lector"` por `"rol":"admin"`, vuelve a codificarlo y lo envía con **la firma de su token original**.
El equipo quiere una prueba que garantice que eso nunca da acceso.

**Qué haces:** crea `tests/reto.spec.js` con una prueba que inicie sesión como `luis`, separe el token en
datos y firma, cambie el rol a `admin` en los datos, los vuelva a codificar y pida `/api/admin/usuarios`
con `datosFalsos.firmaOriginal`. Ejecútala con el bloque de abajo. Después, en `app/server.mjs`,
comenta en `verificarToken` la línea que compara las firmas (`if (esperada.length !== …`) y vuelve a
ejecutarla.

```bash
# Ejecuta la prueba del reto
npx playwright test reto
```

**Pistas:** `token.split('.')`, `Buffer.from(texto, 'base64url').toString()`, `JSON.parse`,
`Buffer.from(JSON.stringify(objeto)).toString('base64url')`.

**Lo que buscas:** la prueba espera 401 `Token no válido`; pasa con la API correcta y falla (`Received: 200`)
cuando el servidor no comprueba la firma.

<details>
<summary>Ver solución</summary>

```js
// tests/reto.spec.js — también en solucion/tests/reto.spec.js
import { test, expect } from '@playwright/test';

test('un token manipulado no da acceso de admin', async ({ request }) => {
  const login = await request.post('/api/login', { data: { usuario: 'luis', clave: 'luis123' } });
  const { token } = await login.json();
  const [datos, firma] = token.split('.');

  // Cambia el rol en los datos y vuelve a codificarlos; la firma es la del token original
  const sesion = JSON.parse(Buffer.from(datos, 'base64url').toString());
  const falsos = Buffer.from(JSON.stringify({ ...sesion, rol: 'admin' })).toString('base64url');

  const respuesta = await request.get('/api/admin/usuarios', {
    headers: { Authorization: `Bearer ${falsos}.${firma}` },
  });
  expect(respuesta.status()).toBe(401);
  expect(await respuesta.json()).toEqual({ error: 'Token no válido' });
});
```

Con la API correcta:

```text
Running 1 test using 1 worker

  ✓  1 tests/reto.spec.js:4:1 › un token manipulado no da acceso de admin (32ms)

  1 passed (581ms)
```

Sin comprobar la firma (extracto):

```text
  ✘  1 tests/reto.spec.js:4:1 › un token manipulado no da acceso de admin (30ms)
…
    Expected: 401
    Received: 200
…
  1 failed
```

La firma HMAC depende de los datos y del secreto: al cambiar un carácter de los datos, la firma original
deja de corresponder y solo quien tiene el secreto puede calcular la nueva. Si el servidor no la verifica,
el token es una nota que cualquiera puede reescribir. **La regla:** prueba la autenticación con tokens
manipulados, caducados y de otro usuario, no solo con «sin token». Vuelve a activar la línea de la firma.

</details>

La solución completa (fixtures, matriz y reto) está en `solucion/`:

```bash
# Ejecuta la solución
npx playwright test --config solucion/playwright.config.js
```

```text
Running 8 tests using 2 workers
…
  8 passed (826ms)
```

## Errores frecuentes

| Síntoma | Causa probable | Cómo arreglarlo |
|---------|----------------|-----------------|
| `Error: http://localhost:3305/api/informes is already used…` | La API arrancada a mano en el paso 2 sigue en marcha | Párala con `Ctrl+C` antes de lanzar las pruebas |
| 401 `Token no válido` con un token recién copiado | Al pegarlo se ha colado un espacio, una comilla o se ha cortado | Copia solo el valor entre comillas de `"token"` |
| 401 `Falta el token` aunque envías la cabecera | Falta la palabra `Bearer ` (con espacio) delante del token | `Authorization: Bearer <token>` |
| Las pruebas pasan aunque quites la comprobación de rol | Solo pruebas al usuario que sí tiene permiso | Añade la prueba del lector con 403 (paso 5) |
| `Error: Cannot find module '…/tests/sesiones.js' imported from …/tests/auth.spec.js` | El fichero de fixtures no está en `tests/` o el nombre no coincide | Crea `tests/sesiones.js` e impórtalo con `./sesiones.js` |

## Conclusiones

### Qué es la autenticación frente a la autorización

Autenticación es demostrar quién eres (credenciales → token firmado; si falla, 401). Autorización es decidir
qué puedes hacer con esa identidad (rol → permiso; si falla, 403). Se prueban por separado porque se rompen
por separado.

### Cómo debe ser

| Requisito | En el lab |
|-----------|-----------|
| Sin sesión, 401 con `WWW-Authenticate` | `sin token: 401` |
| Token falso o manipulado, 401 | `token inventado` y reto del rol cambiado |
| Rol sin permiso, 403 | `lector en la zona de admin: 403` |
| Rol con permiso, 200 | admin en las dos rutas; lector en informes |
| Cada prueba con su identidad, sin repetir el login | fixtures `comoAdmin`, `comoLector`, `sinSesion` |

### Dónde se rompe y cómo lo has detectado

| Fallo | Cómo lo has visto | Qué provoca |
|-------|-------------------|-------------|
| Solo se prueba el camino feliz | Quitar el control de rol daba `2 passed` con las pruebas de partida | Escalada de privilegios sin aviso |
| Rol sin comprobar | `Expected: 403 Received: 200` en la prueba del lector | Un lector ve la zona de admin |
| Firma sin verificar | El reto da `Received: 200` con un token reescrito | Cualquiera se da el rol que quiera |

### Cómo se perfecciona

En un proyecto real, la matriz rol × ruta sale de los requisitos de seguridad y se genera (una prueba por
celda) en lugar de escribirse a mano; los tokens son estándar (JWT firmado, OAuth 2.0 / OpenID Connect) y
se prueban también caducados y revocados; los usuarios de prueba y sus claves llegan como secretos del
[pipeline](../glosario/04-ci-cd.md#pipeline), no escritos en el código.

### En una frase

> 🔑 Prueba cada ruta con la identidad que **no** debe entrar: 401 si no sabe quién eres, 403 si lo sabe y no puedes.
