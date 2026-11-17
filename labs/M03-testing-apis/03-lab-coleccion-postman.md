# Lab — Colección de Postman

[← Página anterior](02-lab-contratos-json-schema.md) · [Siguiente página →](04-lab-newman-datos-y-entornos.md)

Practicas la **[colección de Postman](../glosario/03-apis.md#coleccion-postman) y sus
[scripts de prueba](../glosario/03-apis.md#pm-test)** con una API de libros. La colección ya tiene las
peticiones, pero solo la primera comprueba algo; escribes las pruebas de las demás con `pm.test` y
`pm.expect` y ejecutas la colección con [Newman](../glosario/03-apis.md#newman).

### Objetivo

Comprender qué es una colección de Postman con scripts de prueba: cómo funciona, cómo debe ser, cómo se
detectan sus debilidades y cómo se mejora.

### Punto de partida

- Codespace del curso abierto, con dos terminales en
  [`ejercicios/M03-03-coleccion-postman/`](../../ejercicios/M03-03-coleccion-postman/README.md).
- Sin credenciales. La API (`app/server.mjs`, puerto 3303) arranca con dos libros en memoria.
- La colección es un fichero, `coleccion.postman.json`, que editas en VS Code. No hace falta la
  aplicación de Postman ni una cuenta.

```bash
# Terminal 1: arranca la API de libros (déjala en marcha durante todo el lab)
cd ejercicios/M03-03-coleccion-postman
PORT=3303 node app/server.mjs
```

```text
API de libros en http://localhost:3303
```

```bash
# Terminal 2: entra en la carpeta del ejercicio
cd ejercicios/M03-03-coleccion-postman
```

### Qué está pasando

En muchos equipos las [pruebas de API](../glosario/01-fundamentos.md#prueba-de-api) las escribe QA en Postman: es visual, se comparte como fichero y
cualquiera puede lanzar una petición a mano. Una **colección** es esa lista de peticiones guardada en
JSON (formato v2.1), y cada petición puede llevar un **script de prueba** que se ejecuta al llegar la
respuesta. Newman ejecuta la colección desde la terminal, sin interfaz, y es lo que se usa en un
[pipeline](../glosario/04-ci-cd.md#pipeline). El riesgo típico es una colección que *ejecuta* peticiones sin *comprobar* nada: Newman la
da por buena.

| En Postman (app) | En este lab |
|------------------|-------------|
| Pestaña **Scripts → Post-response** de una petición | El array `"exec"` del evento `"listen": "test"` en el JSON |
| Botón **Run collection** | `npx newman run coleccion.postman.json` |
| [Variable de colección](../glosario/03-apis.md#entorno-postman) `baseUrl` | El bloque `"variable"` al final del fichero |

### 1 — Leer la colección en crudo

Abre `coleccion.postman.json` en el editor. Cada petición es un elemento de `"item"`; esta es la segunda:

```json
{
  "name": "Leer el libro 1",
  "event": [
    {
      "listen": "test",
      "script": {
        "type": "text/javascript",
        "exec": [
          "// Escribe aquí las pruebas de esta petición"
        ]
      }
    }
  ],
  "request": {
    "method": "GET",
    "header": [],
    "url": {
      "raw": "{{baseUrl}}/api/libros/1",
      "host": ["{{baseUrl}}"],
      "path": ["api", "libros", "1"]
    }
  }
}
```

| Parte | Qué es |
|-------|--------|
| `"name"` | El nombre que verás en el informe de Newman |
| `"request"` | Método y URL; `{{baseUrl}}` se sustituye por la variable de colección (`http://localhost:3303`) |
| `"event"` → `"listen": "test"` | El script que se ejecuta con la respuesta; cada línea de JavaScript es un texto del array `"exec"` |

La primera petición, «Listar libros», ya tiene su script: `pm.response.to.have.status(200)`,
`pm.response.to.be.json` y `pm.expect(libros).to.be.an('array').that.is.not.empty`.

### 2 — Ejecutar la colección tal cual

```bash
# Terminal 2: ejecuta la colección
npx newman run coleccion.postman.json
```

**Resultado esperado** (tiempos y tamaños cambian; la lista crece con cada ejecución porque la colección
crea un libro):

```text
newman

M03-03 API de libros

→ Listar libros
  GET http://localhost:3303/api/libros [200 OK, 354B, 69ms]
  ✓  el estado es 200
  ✓  responde JSON
  ✓  devuelve una lista con libros

→ Leer el libro 1
  GET http://localhost:3303/api/libros/1 [200 OK, 265B, 8ms]

→ Leer un libro que no existe
  GET http://localhost:3303/api/libros/99 [404 Not Found, 216B, 4ms]

→ Crear un libro
  POST http://localhost:3303/api/libros [201 Created, 294B, 5ms]

┌─────────────────────────┬──────────────────┬──────────────────┐
│                         │         executed │           failed │
├─────────────────────────┼──────────────────┼──────────────────┤
│              iterations │                1 │                0 │
├─────────────────────────┼──────────────────┼──────────────────┤
│                requests │                4 │                0 │
├─────────────────────────┼──────────────────┼──────────────────┤
│            test-scripts │                4 │                0 │
├─────────────────────────┼──────────────────┼──────────────────┤
│      prerequest-scripts │                0 │                0 │
├─────────────────────────┼──────────────────┼──────────────────┤
│              assertions │                3 │                0 │
├─────────────────────────┴──────────────────┴──────────────────┤
│ total run duration: 217ms                                     │
├───────────────────────────────────────────────────────────────┤
│ total data received: 380B (approx)                            │
├───────────────────────────────────────────────────────────────┤
│ average response time: 21ms [min: 4ms, max: 69ms, s.d.: 27ms] │
└───────────────────────────────────────────────────────────────┘
```

Cuatro peticiones, cero fallos… y solo tres [aserciones](../glosario/01-fundamentos.md#asercion), todas de la primera petición. Las otras tres no
tienen ningún `✓` debajo: Newman las ha ejecutado, pero nadie ha comprobado sus respuestas. «0 failed» no
significa «todo bien», significa «nada ha fallado de lo que se ha comprobado».

### 3 — Comprobar estado y cuerpo del libro 1

En la petición «Leer el libro 1», sustituye el array `"exec"` por este. Cada `pm.test` es una prueba con
nombre; dentro, `pm.response.to.have.status` y `pm.expect` son las aserciones (sintaxis de Chai).

```json
"exec": [
  "pm.test('el estado es 200', () => {",
  "  pm.response.to.have.status(200);",
  "});",
  "pm.test('es el libro 1', () => {",
  "  const libro = pm.response.json();",
  "  pm.expect(libro.id).to.eql(1);",
  "  pm.expect(libro.titulo).to.eql('Clean Code');",
  "  pm.expect(libro.disponible).to.be.a('boolean');",
  "});"
]
```

```bash
# Ejecuta la colección
npx newman run coleccion.postman.json
```

**Resultado esperado** (extracto; en la tabla final, `assertions` pasa a `5`):

```text
→ Leer el libro 1
  GET http://localhost:3303/api/libros/1 [200 OK, 265B, 7ms]
  ✓  el estado es 200
  ✓  es el libro 1
```

### 4 — Validar el esquema del libro

Comprobar campo a campo no detecta un campo que desaparece si no lo nombras. `pm.response.to.have.jsonSchema`
valida el cuerpo entero contra un [JSON Schema](../glosario/03-apis.md#json-schema). Añade este bloque al
final del mismo array `"exec"` (pon una coma tras la última línea anterior, `"});"`):

```json
"pm.test('cumple el esquema del libro', () => {",
"  pm.response.to.have.jsonSchema({",
"    type: 'object',",
"    required: ['id', 'titulo', 'autor', 'anio', 'disponible'],",
"    properties: {",
"      id: { type: 'integer' },",
"      titulo: { type: 'string' },",
"      autor: { type: 'string' },",
"      anio: { type: ['integer', 'null'] },",
"      disponible: { type: 'boolean' }",
"    }",
"  });",
"});"
```

```bash
# Ejecuta la colección
npx newman run coleccion.postman.json
```

**Resultado esperado** (extracto; `assertions` pasa a `6`):

```text
→ Leer el libro 1
  GET http://localhost:3303/api/libros/1 [200 OK, 265B, 5ms]
  ✓  el estado es 200
  ✓  es el libro 1
  ✓  cumple el esquema del libro
```

### 5 — Probar el 404

En «Leer un libro que no existe», sustituye el array `"exec"` por:

```json
"exec": [
  "pm.test('el estado es 404', () => {",
  "  pm.response.to.have.status(404);",
  "});",
  "pm.test('explica el error', () => {",
  "  pm.expect(pm.response.json()).to.eql({ error: 'Libro no encontrado' });",
  "});"
]
```

```bash
# Ejecuta la colección
npx newman run coleccion.postman.json
```

**Resultado esperado** (extracto; `assertions` pasa a `8`):

```text
→ Leer un libro que no existe
  GET http://localhost:3303/api/libros/99 [404 Not Found, 216B, 6ms]
  ✓  el estado es 404
  ✓  explica el error
```

### 6 — Probar la creación

En «Crear un libro» (un `POST` con cuerpo JSON), sustituye el array `"exec"` por este. `to.include`
compara solo los campos que le das, porque el `id` lo pone la API.

```json
"exec": [
  "pm.test('el estado es 201', () => {",
  "  pm.response.to.have.status(201);",
  "});",
  "pm.test('devuelve el libro creado', () => {",
  "  const libro = pm.response.json();",
  "  pm.expect(libro).to.include({ titulo: 'Accelerate', autor: 'Nicole Forsgren', disponible: true });",
  "  pm.expect(libro.id).to.be.a('number');",
  "});",
  "pm.test('la cabecera Location apunta al libro', () => {",
  "  const libro = pm.response.json();",
  "  pm.response.to.have.header('Location', '/api/libros/' + libro.id);",
  "});"
]
```

```bash
# Ejecuta la colección
npx newman run coleccion.postman.json
```

**Resultado esperado:**

```text
newman

M03-03 API de libros

→ Listar libros
  GET http://localhost:3303/api/libros [200 OK, 702B, 64ms]
  ✓  el estado es 200
  ✓  responde JSON
  ✓  devuelve una lista con libros

→ Leer el libro 1
  GET http://localhost:3303/api/libros/1 [200 OK, 265B, 5ms]
  ✓  el estado es 200
  ✓  es el libro 1
  ✓  cumple el esquema del libro

→ Leer un libro que no existe
  GET http://localhost:3303/api/libros/99 [404 Not Found, 216B, 6ms]
  ✓  el estado es 404
  ✓  explica el error

→ Crear un libro
  POST http://localhost:3303/api/libros [201 Created, 294B, 4ms]
  ✓  el estado es 201
  ✓  devuelve el libro creado
  ✓  la cabecera Location apunta al libro

┌─────────────────────────┬──────────────────┬──────────────────┐
│                         │         executed │           failed │
├─────────────────────────┼──────────────────┼──────────────────┤
│              iterations │                1 │                0 │
├─────────────────────────┼──────────────────┼──────────────────┤
│                requests │                4 │                0 │
├─────────────────────────┼──────────────────┼──────────────────┤
│            test-scripts │                4 │                0 │
├─────────────────────────┼──────────────────┼──────────────────┤
│      prerequest-scripts │                0 │                0 │
├─────────────────────────┼──────────────────┼──────────────────┤
│              assertions │               11 │                0 │
├─────────────────────────┴──────────────────┴──────────────────┤
│ total run duration: 275ms                                     │
├───────────────────────────────────────────────────────────────┤
│ total data received: 728B (approx)                            │
├───────────────────────────────────────────────────────────────┤
│ average response time: 19ms [min: 4ms, max: 64ms, s.d.: 25ms] │
└───────────────────────────────────────────────────────────────┘
```

Cada petición tiene ahora sus `✓`: once aserciones en lugar de tres.

## Comprueba tu entendimiento

**Cómo se ve un fallo**
En «Leer el libro 1», cambia `'Clean Code'` por `'Clean code'` y ejecuta:

```bash
# Ejecuta la colección
npx newman run coleccion.postman.json
```
→ La prueba aparece numerada (`1. es el libro 1`) y, al final, una tabla `failure / detail` dice
`expected 'Clean Code' to deeply equal 'Clean code'` e `inside "Leer el libro 1"`. Vuelve a dejarlo como
estaba.

```text
→ Leer el libro 1
  GET http://localhost:3303/api/libros/1 [200 OK, 265B, 4ms]
  ✓  el estado es 200
  1. es el libro 1
  ✓  cumple el esquema del libro
…
  #  failure         detail

 1.  AssertionError  es el libro 1
                     expected 'Clean Code' to deeply equal 'Clean code'
                     at assertion:1 in test-script
                     inside "Leer el libro 1"
```

**Código de salida**
Con el fallo anterior, ejecuta Newman y, justo después, muestra el código de salida.

```bash
# Ejecuta la colección y muestra el código de salida del proceso
npx newman run coleccion.postman.json
echo $?
```

→ `1` con algún fallo y `0` sin fallos. Es lo que un pipeline mira para decidir si sigue.

## Investiga

Abre el mismo fichero en la aplicación de Postman, si la tienes en tu equipo: **Import** →
arrastra `coleccion.postman.json`. Cada línea del array `"exec"` aparece en la pestaña **Scripts →
Post-response** de la petición, y la variable `baseUrl` en la pestaña **Variables** de la colección. Lo que
cambies ahí y exportes (**Export → Collection v2.1**) es el mismo JSON que ejecuta Newman. Busca en la
[documentación de Newman](https://learning.postman.com/docs/collections/using-newman-cli/newman-options/)
qué hace la opción `--bail` y pruébala con el fallo de «Comprueba tu entendimiento».

## Mejora

El [contrato](../glosario/03-apis.md#contrato-de-api) de la API dice que leer un libro tarda menos de 500 ms. Añade al final del `"exec"` de «Leer el
libro 1» una prueba de tiempo con `pm.response.responseTime`:

```json
"pm.test('responde en menos de 500 ms', () => {",
"  pm.expect(pm.response.responseTime).to.be.below(500);",
"});"
```

```bash
# Ejecuta la colección
npx newman run coleccion.postman.json
```

**Resultado esperado** (extracto):

```text
→ Leer el libro 1
  GET http://localhost:3303/api/libros/1 [200 OK, 265B, 8ms]
  ✓  el estado es 200
  ✓  es el libro 1
  ✓  cumple el esquema del libro
  ✓  responde en menos de 500 ms
```

No es una prueba de rendimiento: es un umbral que avisa si una respuesta simple se vuelve lenta de golpe.

## Reto

### 1 — La validación de entrada también se prueba

**La situación:** la API exige `titulo` y `autor` al crear un libro y responde 400 con
`{ "error": "titulo y autor son obligatorios" }` si falta alguno. La colección solo prueba el caso que va
bien. Un compañero dice que «la validación ya la probará el backend».

**Qué haces:** añade a `"item"` una quinta petición, «Crear un libro sin autor»: `POST {{baseUrl}}/api/libros`
con [cabecera](../glosario/03-apis.md#cabecera-http) `Content-Type: application/json` y cuerpo `{"titulo": "Sin autor"}`, y su script de prueba.
Copia como base el objeto de «Crear un libro» y cambia nombre, cuerpo y `"exec"`.

**Pistas:** el cuerpo va en `"body": { "mode": "raw", "raw": "…" }` con las comillas escapadas (`\"`);
`pm.response.to.have.status(400)` y `pm.response.json().error`.

**Lo que buscas:** una ejecución con cinco peticiones, todas con sus `✓`, y 14 aserciones sin fallos
(con la mejora del tiempo).

<details>
<summary>Ver solución</summary>

```json
{
  "name": "Crear un libro sin autor",
  "event": [
    {
      "listen": "test",
      "script": {
        "type": "text/javascript",
        "exec": [
          "pm.test('el estado es 400', () => {",
          "  pm.response.to.have.status(400);",
          "});",
          "pm.test('explica qué falta', () => {",
          "  pm.expect(pm.response.json().error).to.eql('titulo y autor son obligatorios');",
          "});"
        ]
      }
    }
  ],
  "request": {
    "method": "POST",
    "header": [{ "key": "Content-Type", "value": "application/json" }],
    "body": { "mode": "raw", "raw": "{\"titulo\": \"Sin autor\"}" },
    "url": { "raw": "{{baseUrl}}/api/libros", "host": ["{{baseUrl}}"], "path": ["api", "libros"] }
  }
}
```

```bash
# Ejecuta la colección de la solución
npx newman run solucion/coleccion.postman.json
```

```text
→ Crear un libro sin autor
  POST http://localhost:3303/api/libros [400 Bad Request, 230B, 19ms]
  ✓  el estado es 400
  ✓  explica qué falta

┌─────────────────────────┬───────────────────┬───────────────────┐
│                         │          executed │            failed │
├─────────────────────────┼───────────────────┼───────────────────┤
│              iterations │                 1 │                 0 │
├─────────────────────────┼───────────────────┼───────────────────┤
│                requests │                 5 │                 0 │
├─────────────────────────┼───────────────────┼───────────────────┤
│            test-scripts │                 5 │                 0 │
├─────────────────────────┼───────────────────┼───────────────────┤
│      prerequest-scripts │                 0 │                 0 │
├─────────────────────────┼───────────────────┼───────────────────┤
│              assertions │                14 │                 0 │
├─────────────────────────┴───────────────────┴───────────────────┤
```

La API ya rechazaba bien; lo que faltaba era una prueba que lo dijera. Si mañana alguien relaja la
validación, esta petición lo detecta antes de que lleguen libros sin autor a la base de datos.
**La regla:** cada regla de validación de la API merece su petición negativa en la colección.

</details>

## Errores frecuentes

| Síntoma | Causa probable | Cómo arreglarlo |
|---------|----------------|-----------------|
| `error: collection could not be loaded` y `the file at "…" does not contain valid JSON data` | El JSON ha quedado mal al editar: falta una coma o sobra alguna | Revisa la petición que has tocado; VS Code subraya en rojo el error de sintaxis |
| `connect ECONNREFUSED 127.0.0.1:3303` | La API no está en marcha | Arráncala en el terminal 1 (bloque de abajo) |
| Una petición sale sin ninguna `✓` | Su `"exec"` no tiene `pm.test` (solo comentarios) | Escribe al menos una prueba con `pm.test` |
| `JSONError … is not valid JSON` | Llamas a `pm.response.json()` y la respuesta no trae JSON | Comprueba primero el estado; mira la respuesta en crudo (bloque de abajo) |
| Las comillas dentro de una línea de `"exec"` rompen el JSON | Comillas dobles sin escapar dentro del texto | Usa comillas simples en el JavaScript, como en los bloques de este lab |

```bash
# Arranca la API de libros
PORT=3303 node app/server.mjs
```

```bash
# Mira la respuesta en crudo de una petición (aquí, el libro 1)
curl -i http://localhost:3303/api/libros/1
```

## Conclusiones

### Qué es una colección de Postman con scripts de prueba

Un fichero JSON (v2.1) con peticiones y, en cada una, un script que se ejecuta con la respuesta y declara
pruebas con `pm.test`. Newman lo ejecuta en la terminal y termina con código 1 si alguna falla.

### Cómo debe ser

| Requisito | En el lab |
|-----------|-----------|
| Cada petición comprueba algo | De 3 a 14 aserciones; ninguna petición sin `✓` |
| Estado, cuerpo y cabeceras | `to.have.status`, `pm.expect(…).to.eql`, `to.have.header('Location', …)` |
| Forma completa del cuerpo | `pm.response.to.have.jsonSchema` con `required` |
| Casos negativos | 404 y 400 con su mensaje de error |
| Variables en lugar de URLs fijas | `{{baseUrl}}` como variable de colección |

### Dónde se rompe y cómo lo has detectado

| Fallo | Cómo lo has visto | Qué provoca |
|-------|-------------------|-------------|
| Peticiones sin pruebas | 4 peticiones, 3 aserciones, «0 failed» | Una colección que siempre pasa |
| Comparar solo algunos campos | El esquema cubre los campos que no nombras | Campos que desaparecen sin aviso |
| JSON mal editado | Newman no carga la colección | El pipeline falla por la herramienta, no por la API |

### Cómo se perfecciona

En un proyecto real, la colección vive en el repositorio junto al código de la API y Newman la ejecuta en
el pipeline; la URL y las credenciales salen de un entorno, no de la colección
([Newman con datos y entornos](04-lab-newman-datos-y-entornos.md)), y los casos que solo cambian de datos
se alimentan desde un CSV en lugar de duplicar peticiones.

### En una frase

> 🔑 Newman da por buena cualquier petición sin `pm.test`: una colección vale por sus aserciones, no por sus peticiones.
