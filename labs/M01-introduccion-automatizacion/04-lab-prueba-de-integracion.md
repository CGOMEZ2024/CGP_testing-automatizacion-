# Lab — Prueba de integración

[← Página anterior](03-lab-primera-prueba-unitaria.md) · [Siguiente página →](05-lab-piramide-de-pruebas.md)

En este lab practicas la **[prueba de integración](../glosario/01-fundamentos.md#prueba-de-integracion)**: pruebas una API de tareas
(`ejercicios/M01-04-prueba-de-integracion/`) arrancando su servidor HTTP real dentro del propio
test, con su almacén en memoria, y comprobando por HTTP el estado y el cuerpo de cada respuesta. La
API ya tiene una [prueba unitaria](../glosario/01-fundamentos.md#prueba-unitaria) con un almacén falso que pasa; la de integración encuentra lo que
esa unitaria no puede ver.

### Objetivo

Comprender qué es una prueba de integración: cómo funciona, cómo debe ser, cómo se detectan sus
debilidades y cómo se mejora.

### Punto de partida

- Codespace del curso abierto (o cualquier entorno con `npm run verificar` en `Entorno listo`).
- Ejercicio: `ejercicios/M01-04-prueba-de-integracion/`:
  - `app/almacen.js`: el almacén de tareas en memoria (hace el papel de la base de datos).
  - `app/rutas.js`: la lógica de cada endpoint.
  - `app/servidor.js`: el servidor HTTP (`node:http`) que une las dos piezas.
  - `app/server.mjs`: arranca la API a mano en el puerto 3104.
  - `pruebas/crear-tarea.test.js`: prueba unitaria de `crearTarea` con un almacén falso.
  - `pruebas/tareas.integracion.test.js`: el principio de la prueba de integración.

```bash
# Entra en la carpeta del ejercicio
cd ejercicios/M01-04-prueba-de-integracion
```

### Qué está pasando

Una aplicación son piezas que se llaman entre sí: el servidor recibe la petición, las rutas
deciden qué hacer y el almacén guarda los datos. Cada pieza puede estar bien por separado y fallar
al juntarlas, porque una espera algo que la otra no ofrece: un método con otro nombre, un campo en
otro formato, un estado HTTP distinto.

Una **prueba unitaria** aísla una pieza sustituyendo las demás por **dobles** ([mocks](../glosario/01-fundamentos.md#mock)): objetos
falsos que responden lo que la prueba les dice. Es rápida y precisa, pero el mock refleja **lo que
quien escribió la prueba cree** que hace la otra pieza. Una **prueba de integración** junta las
piezas reales y las prueba por su interfaz externa, aquí HTTP, que es también la forma de probar
una **API**.

| En un proyecto real | En este laboratorio |
|---------------------|---------------------|
| Base de datos (PostgreSQL, MongoDB…) | `crearAlmacen()`: un array en memoria |
| Controladores o handlers de la API | `crearTarea` y `listarTareas` en `app/rutas.js` |
| Servidor HTTP (Express, Fastify…) | `crearServidor` con `node:http` |
| Cliente de la API (frontend, otro servicio) | `fetch` dentro de la prueba |

### 1 — Ver la API en crudo

Antes de probarla con código, la miras como la vería un cliente. Arranca la API en un terminal:

```bash
# Terminal 1: arranca la API de tareas en el puerto 3104
node app/server.mjs
```

```text
API de tareas: http://localhost:3104/api/tareas
```

En otro terminal, pide la lista de tareas:

```bash
# Terminal 2: GET de la lista de tareas
curl -s http://localhost:3104/api/tareas
```

**Resultado esperado:**

```text
[]
```

Un array JSON vacío: el almacén acaba de crearse. También puedes abrir el puerto 3104 desde la
pestaña **Ports** y añadir `/api/tareas` a la URL. Para el servidor con <kbd>Ctrl</kbd>+<kbd>C</kbd>
en el terminal 1: la prueba no lo necesita, arrancará el suyo.

### 2 — Ejecutar las pruebas que ya existen

Abre [`pruebas/crear-tarea.test.js`](../../ejercicios/M01-04-prueba-de-integracion/pruebas/crear-tarea.test.js).
La unitaria crea un almacén falso con `vi.fn()` que devuelve una tarea fija y comprueba que
`crearTarea` lo llama:

```js
const almacen = { guardar: vi.fn(() => ({ id: 1, titulo: 'Comprar pan', hecha: false })) };
const respuesta = crearTarea(almacen, { titulo: 'Comprar pan' });
expect(respuesta.estado).toBe(201);
expect(almacen.guardar).toHaveBeenCalledWith('Comprar pan');
```

Abre también [`pruebas/tareas.integracion.test.js`](../../ejercicios/M01-04-prueba-de-integracion/pruebas/tareas.integracion.test.js).
Antes de las pruebas, `beforeAll` crea el servidor con un almacén **real** y lo pone a escuchar en
el **puerto 0**, que significa «el que el sistema tenga libre»; `afterAll` lo cierra al terminar:

```js
beforeAll(async () => {
  servidor = crearServidor(crearAlmacen());
  // Puerto 0: el sistema operativo elige uno libre
  await new Promise((resolve) => servidor.listen(0, resolve));
  base = `http://localhost:${servidor.address().port}`;
});
```

Ejecuta las dos:

```bash
# Ejecuta todas las pruebas del ejercicio
npx vitest run
```

**Resultado esperado** (los tiempos cambian):

```text
 ✓ pruebas/crear-tarea.test.js > crearTarea (unitaria, con mock) > guarda la tarea y responde 201 5ms
 ✓ pruebas/crear-tarea.test.js > crearTarea (unitaria, con mock) > sin título responde 400 1ms
 ✓ pruebas/tareas.integracion.test.js > API de tareas (integración) > GET /api/tareas responde 200 con una lista 167ms

 Test Files  2 passed (2)
      Tests  3 passed (3)
```

Todo en verde, incluida la unitaria que «guarda la tarea». La de integración tarda más (167 ms)
porque arranca un servidor y hace una petición HTTP real.

### 3 — Probar la creación por HTTP

Escribes la prueba de integración de `POST /api/tareas`: la petición real, con su cuerpo JSON, y la
comprobación del estado y del cuerpo de la respuesta. Pégala debajo de
`// Tus pruebas, debajo de esta línea`:

```js
  it('POST /api/tareas crea la tarea y responde 201', async () => {
    // Preparar: el cuerpo de la petición
    const nueva = { titulo: 'Comprar pan' };
    // Actuar: una petición HTTP real al servidor
    const respuesta = await fetch(`${base}/api/tareas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(nueva),
    });
    // Comprobar: el estado y el cuerpo de la respuesta
    expect(respuesta.status).toBe(201);
    expect(await respuesta.json()).toEqual({ id: expect.any(Number), titulo: 'Comprar pan', hecha: false });
  });
```

`expect.any(Number)` acepta cualquier número: el id lo decide el almacén y la prueba no debe
depender de cuál toque.

```bash
# Ejecuta las pruebas
npx vitest run
```

**Resultado esperado** (extracto):

```text
 ✓ pruebas/crear-tarea.test.js > crearTarea (unitaria, con mock) > guarda la tarea y responde 201 4ms
 ✓ pruebas/crear-tarea.test.js > crearTarea (unitaria, con mock) > sin título responde 400 1ms
stderr | pruebas/tareas.integracion.test.js > API de tareas (integración) > POST /api/tareas crea la tarea y responde 201
TypeError: almacen.guardar is not a function
    at crearTarea (/workspaces/testing-automatizacion-agile-201/ejercicios/M01-04-prueba-de-integracion/app/rutas.js:10:25)
    at Server.<anonymous> (/workspaces/testing-automatizacion-agile-201/ejercicios/M01-04-prueba-de-integracion/app/servidor.js:20:21)
    at process.processTicksAndRejections (node:internal/process/task_queues:103:5)

 ✓ pruebas/tareas.integracion.test.js > API de tareas (integración) > GET /api/tareas responde 200 con una lista 67ms
 × pruebas/tareas.integracion.test.js > API de tareas (integración) > POST /api/tareas crea la tarea y responde 201 78ms
   → expected 500 to be 201 // Object.is equality

 Test Files  1 failed | 1 passed (2)
      Tests  1 failed | 3 passed (4)
```

| Parte | Qué dice |
|-------|----------|
| `expected 500 to be 201` | El servidor ha respondido `500 Internal Server Error` |
| `stderr \| … TypeError: almacen.guardar is not a function` | El registro del servidor: `rutas.js` llama a `almacen.guardar` |
| `at crearTarea (…/app/rutas.js:10:25)` | La línea exacta del fallo |
| La unitaria sigue en `✓` | Su almacén falso **sí** tiene `guardar`; el real no |

Abre [`app/almacen.js`](../../ejercicios/M01-04-prueba-de-integracion/app/almacen.js): el
almacén real ofrece `agregar` y `listar`, no `guardar`. La unitaria pasaba porque el mock se
escribió con el nombre equivocado, el mismo que usa `rutas.js`: los dos compartían el error.

### 4 — Corregir la llamada al almacén

La pieza que se equivoca es `rutas.js`. En `app/rutas.js` cambia `almacen.guardar(` por
`almacen.agregar(`:

```js
  const tarea = almacen.agregar(datos.titulo.trim());
```

```bash
# Ejecuta las pruebas con la ruta corregida
npx vitest run
```

**Resultado esperado** (extracto):

```text
 ✓ pruebas/tareas.integracion.test.js > API de tareas (integración) > GET /api/tareas responde 200 con una lista 48ms
 ✓ pruebas/tareas.integracion.test.js > API de tareas (integración) > POST /api/tareas crea la tarea y responde 201 15ms
 × pruebas/crear-tarea.test.js > crearTarea (unitaria, con mock) > guarda la tarea y responde 201 8ms
   → almacen.agregar is not a function
 ✓ pruebas/crear-tarea.test.js > crearTarea (unitaria, con mock) > sin título responde 400 2ms

 FAIL  pruebas/crear-tarea.test.js > crearTarea (unitaria, con mock) > guarda la tarea y responde 201
TypeError: almacen.agregar is not a function
 ❯ crearTarea app/rutas.js:10:25

 Test Files  1 failed | 1 passed (2)
      Tests  1 failed | 3 passed (4)
```

La integración pasa y ahora falla la unitaria: su mock sigue imitando un almacén que no existe.

### 5 — Alinear el mock con el almacén real

Un mock tiene que parecerse a la pieza que sustituye. En `pruebas/crear-tarea.test.js` cambia
las cuatro apariciones de `guardar` por `agregar` (en VS Code: <kbd>Ctrl</kbd>+<kbd>H</kbd>).
El almacén falso queda así:

```js
    const almacen = { agregar: vi.fn(() => ({ id: 1, titulo: 'Comprar pan', hecha: false })) };
```

```bash
# Ejecuta las pruebas
npx vitest run
```

**Resultado esperado** (extracto):

```text
 ✓ pruebas/crear-tarea.test.js > crearTarea (unitaria, con mock) > guarda la tarea y responde 201 12ms
 ✓ pruebas/crear-tarea.test.js > crearTarea (unitaria, con mock) > sin título responde 400 1ms
 ✓ pruebas/tareas.integracion.test.js > API de tareas (integración) > GET /api/tareas responde 200 con una lista 88ms
 ✓ pruebas/tareas.integracion.test.js > API de tareas (integración) > POST /api/tareas crea la tarea y responde 201 14ms
      Tests  4 passed (4)
```

### 6 — Comprobar que la tarea queda guardada

Responder `201` no garantiza que la tarea se haya guardado. Esta prueba crea su propia tarea y
comprueba que aparece en la lista: recorre servidor, rutas y almacén de ida y de vuelta. También
añades la validación por HTTP: sin título, `400` con el motivo. Pega las dos debajo de la anterior:

```js
  it('la tarea creada aparece en GET /api/tareas', async () => {
    // Preparar: crea su propia tarea por la API
    const creada = await fetch(`${base}/api/tareas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ titulo: 'Llamar al fontanero' }),
    }).then((r) => r.json());
    // Actuar: pide la lista
    const lista = await fetch(`${base}/api/tareas`).then((r) => r.json());
    // Comprobar: la tarea está guardada en el almacén real
    expect(lista).toContainEqual(creada);
  });

  it('POST sin título responde 400 con el motivo', async () => {
    const respuesta = await fetch(`${base}/api/tareas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    expect(respuesta.status).toBe(400);
    expect(await respuesta.json()).toEqual({ error: 'El título es obligatorio' });
  });
```

```bash
# Ejecuta las pruebas
npx vitest run
```

**Resultado esperado:**

```text
 ✓ pruebas/crear-tarea.test.js > crearTarea (unitaria, con mock) > guarda la tarea y responde 201 2ms
 ✓ pruebas/crear-tarea.test.js > crearTarea (unitaria, con mock) > sin título responde 400 0ms
 ✓ pruebas/tareas.integracion.test.js > API de tareas (integración) > GET /api/tareas responde 200 con una lista 18ms
 ✓ pruebas/tareas.integracion.test.js > API de tareas (integración) > POST /api/tareas crea la tarea y responde 201 6ms
 ✓ pruebas/tareas.integracion.test.js > API de tareas (integración) > la tarea creada aparece en GET /api/tareas 3ms
 ✓ pruebas/tareas.integracion.test.js > API de tareas (integración) > POST sin título responde 400 con el motivo 2ms

 Test Files  2 passed (2)
      Tests  6 passed (6)
```

Las pruebas comparten servidor y almacén (se crean una vez, en `beforeAll`), así que ninguna
supone que la lista está vacía ni que su tarea tiene el id 1: cada una crea lo que necesita y
busca lo suyo. Por eso pasan en cualquier orden.

## Comprueba tu entendimiento

**Qué nivel detecta un almacén que no devuelve nada**
En `app/almacen.js` cambia el cuerpo de `listar()` por `return [];` y ejecuta `npx vitest run`.
→ Falla solo «la tarea creada aparece en GET /api/tareas» con `expected [] to deep equally contain { id: 2, …(2) }`.
Las dos unitarias siguen en verde: no usan el almacén real. Deja otra vez `return [...tareas];`.

## Experimenta

**¿Por qué el puerto 0?** Predice qué pasará si la prueba usa un puerto fijo que ya está ocupado.
Arranca la API a mano en el terminal 1 (ocupa el 3104):

```bash
# Terminal 1: la API ocupa el puerto 3104
node app/server.mjs
```

En `pruebas/tareas.integracion.test.js` cambia `servidor.listen(0, resolve)` por
`servidor.listen(3104, resolve)` y, en el terminal 2:

```bash
# Terminal 2: ejecuta las pruebas con el puerto fijo
npx vitest run
```

```text
 ↓ pruebas/tareas.integracion.test.js > API de tareas (integración) > GET /api/tareas responde 200 con una lista
 ↓ pruebas/tareas.integracion.test.js > API de tareas (integración) > POST /api/tareas crea la tarea y responde 201

 FAIL  pruebas/tareas.integracion.test.js [ pruebas/tareas.integracion.test.js ]
Error: Hook timed out in 10000ms.

⎯⎯⎯⎯⎯ Uncaught Exception ⎯⎯⎯⎯⎯
Error: listen EADDRINUSE: address already in use :::3104

 Test Files  1 failed | 1 passed (2)
      Tests  2 passed | 4 skipped (6)
     Errors  1 error
   Duration  10.16s (tests 99%)
```

`EADDRINUSE`: el puerto ya está en uso. `beforeAll` espera 10 segundos a un servidor que nunca
arranca y las pruebas de integración se saltan. En CI pasa lo mismo cuando dos suites se ejecutan
a la vez en la misma máquina. Con el puerto 0 cada ejecución recibe uno libre. Vuelve a dejar
`listen(0, resolve)` y para la API del terminal 1.

## Reto

### 1 — Un límite de longitud, probado de punta a punta

**La situación:** el equipo de la aplicación móvil pide que la API rechace títulos de más de 80
caracteres, porque no caben en su pantalla. Quieren un `400` con el mensaje
`El título no puede superar 80 caracteres`.

**Qué haces:** escribe primero la prueba de integración en `pruebas/tareas.integracion.test.js`
(POST con un título de 81 caracteres), ejecútala y mírala fallar. Después añade la validación en
`crearTarea`, en `app/rutas.js`, y vuelve a ejecutar.

**Pistas:** `'x'.repeat(81)` crea un texto de 81 caracteres. La validación nueva va después de la
del título vacío y antes de llamar al almacén.

**Lo que buscas:** primero `expected 201 to be 400` en la prueba nueva; después, todas en verde.

<details>
<summary>Ver solución</summary>

La prueba:

```js
  it('POST con un título de más de 80 caracteres responde 400', async () => {
    const respuesta = await fetch(`${base}/api/tareas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ titulo: 'x'.repeat(81) }),
    });
    expect(respuesta.status).toBe(400);
    expect(await respuesta.json()).toEqual({ error: 'El título no puede superar 80 caracteres' });
  });
```

Antes de cambiar `rutas.js`:

```text
 × pruebas/tareas.integracion.test.js > API de tareas (integración) > POST con un título de más de 80 caracteres responde 400 13ms
   → expected 201 to be 400 // Object.is equality
      Tests  1 failed | 6 passed (7)
```

La validación en `app/rutas.js`:

```js
  if (datos.titulo.trim().length > 80) {
    return { estado: 400, cuerpo: { error: 'El título no puede superar 80 caracteres' } };
  }
  const tarea = almacen.agregar(datos.titulo.trim());
```

```text
 ✓ pruebas/tareas.integracion.test.js > API de tareas (integración) > POST con un título de más de 80 caracteres responde 400 5ms
      Tests  7 passed (7)
```

La prueba comprueba lo que verá la aplicación móvil: el estado HTTP y el mensaje exacto. Una
unitaria de `crearTarea` comprobaría la regla, pero no que el servidor la convierte en un `400`
con ese cuerpo. La solución completa está en `solucion/`:

```bash
# Ejecuta las pruebas de la solución
npx vitest run --root solucion
```

**La regla:** lo que otro sistema consume (estado, cuerpo, mensajes de error) se prueba por la
interfaz que consume, con las piezas reales detrás.

</details>

## Errores frecuentes

| Síntoma | Causa probable | Cómo arreglarlo |
|---------|----------------|-----------------|
| `expected 500 to be 201` | Una pieza falla dentro del servidor | Lee el bloque `stderr` de la salida: trae el error y la línea |
| `Hook timed out in 10000ms` y `EADDRINUSE` | La prueba usa un puerto fijo que está ocupado | Usa `servidor.listen(0, resolve)` |
| [Vitest](../glosario/01-fundamentos.md#vitest) no termina al acabar las pruebas | El servidor sigue abierto | Ciérralo en `afterAll` con `servidor.close` |
| Una prueba pasa sola y falla con las demás porque el `id` no es el esperado | La prueba supone un id concreto, y las anteriores ya han creado tareas en el mismo almacén | Usa `expect.any(Number)` para el id y compara con lo que devolvió tu propio POST |

```bash
# Ejecuta las pruebas del ejercicio
npx vitest run
```

## Conclusiones

### Qué es una prueba de integración

Una prueba que junta piezas reales (aquí servidor HTTP, rutas y almacén) y las prueba por su
interfaz externa. Detecta lo que ninguna unitaria con mocks puede ver: que las piezas **no
encajan**. Cuando la interfaz es HTTP, es también una [prueba de API](../glosario/01-fundamentos.md#prueba-de-api): comprueba estado y cuerpo
como lo haría un cliente.

### Cómo debe ser

| Requisito | En el lab |
|-----------|-----------|
| Piezas reales, sin dobles | `crearServidor(crearAlmacen())` |
| Se prueba por la interfaz externa | `fetch` contra `/api/tareas`, estado y cuerpo |
| Arranca y para lo que necesita | `beforeAll` con `listen(0)` y `afterAll` con `close` |
| No choca con otros procesos | Puerto 0: uno libre en cada ejecución |
| Independiente del orden y de los ids | Cada prueba crea su tarea; `expect.any(Number)` |
| Sigue siendo rápida | 6 pruebas en unos 165 ms |

### Dónde se rompe y cómo lo has detectado

| Fallo | Cómo lo has visto | Qué provoca |
|-------|-------------------|-------------|
| Mock distinto de la pieza real | La unitaria en verde con `guardar`; la integración en `500` | La API no crea tareas aunque «las pruebas pasan» |
| Almacén que no devuelve los datos | Solo falla «la tarea creada aparece…» | Datos que se pierden sin error visible |
| Puerto fijo ocupado | `EADDRINUSE` y `Hook timed out in 10000ms` | Suites que fallan según qué más se ejecute en la máquina |

### Cómo se perfecciona

En un proyecto real, el almacén en memoria se sustituye por la base de datos de verdad en un
contenedor efímero (Docker), que se crea y se destruye en cada ejecución, y los mocks se mantienen
solo para lo que no se controla (un servicio de pagos externo), verificando de vez en cuando que el
contrato del mock sigue siendo el del servicio real.

### En una frase

> 🔑 Una unitaria con mock comprueba que una pieza hace lo que **crees** que necesitan las demás;
> la de integración comprueba que hace lo que **de verdad** necesitan.
