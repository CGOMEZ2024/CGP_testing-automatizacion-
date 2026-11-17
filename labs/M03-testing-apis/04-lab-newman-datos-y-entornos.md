# Lab — Newman con datos y entornos

[← Página anterior](03-lab-coleccion-postman.md) · [Siguiente página →](05-lab-autenticacion-y-autorizacion.md)

Practicas la **ejecución por línea de comandos parametrizada** con [Newman](../glosario/03-apis.md#newman)
y una API de contactos: encadenas peticiones con variables, ejecutas la misma colección contra dos
entornos, la alimentas con un CSV
([pruebas dirigidas por datos](../glosario/03-apis.md#pruebas-dirigidas-por-datos)) y generas informes
[JUnit](../glosario/04-ci-cd.md#junit-xml) y HTML.

### Objetivo

Comprender qué es la ejecución por línea de comandos parametrizada: cómo funciona, cómo debe ser, cómo se
detectan sus debilidades y cómo se mejora.

### Punto de partida

- Codespace del curso abierto, con dos terminales en
  [`ejercicios/M03-04-newman-datos-y-entornos/`](../../ejercicios/M03-04-newman-datos-y-entornos/README.md).
- Sin credenciales. La API (`app/server.mjs`) guarda los contactos en memoria y dice en qué entorno corre
  con la [cabecera](../glosario/03-apis.md#cabecera-http) `X-Entorno`.
- Ficheros: `coleccion.postman.json`, `entorno-local.json` (puerto 3304), `entorno-preproduccion.json`
  (puerto 3314) y `datos.csv`.

```bash
# Terminal 1: arranca la API del entorno «local» (déjala en marcha)
cd ejercicios/M03-04-newman-datos-y-entornos
PORT=3304 ENTORNO=local node app/server.mjs
```

```text
API de contactos (local) en http://localhost:3304
```

```bash
# Terminal 2: entra en la carpeta del ejercicio
cd ejercicios/M03-04-newman-datos-y-entornos
```

### Qué está pasando

La misma colección tiene que servir en el portátil, en preproducción y en el [pipeline](../glosario/04-ci-cd.md#pipeline), con datos distintos
y sin editarla. Para eso, lo que cambia sale de fuera:

| Qué cambia | Dónde vive | Cómo se pasa |
|------------|-----------|--------------|
| URL y nombre del entorno | `entorno-*.json` | `-e entorno-local.json` |
| Datos de cada caso | `datos.csv`, una fila por iteración | `-d datos.csv` |
| Valores que produce una petición (el `id` creado) | [Variables de colección](../glosario/03-apis.md#entorno-postman), escritas desde un script | `pm.collectionVariables.set(…)` |
| Formato del resultado | Reporters | `-r cli,junit,htmlextra` |

La colección es un recorrido completo: **crear** un contacto → **leerlo** → **borrarlo** → comprobar que
**ya no existe**. Cada petición usa el `id` que devolvió la primera.

### 1 — Leer la colección y el entorno en crudo

Abre `entorno-local.json`:

```json
{
  "name": "local",
  "values": [
    { "key": "baseUrl", "value": "http://localhost:3304", "enabled": true },
    { "key": "nombreEntorno", "value": "local", "enabled": true }
  ]
}
```

Abre `coleccion.postman.json`. Las URL son `{{baseUrl}}/api/contactos` y
`{{baseUrl}}/api/contactos/{{contactoId}}`; el cuerpo de «Crear contacto» es
`{"nombre": "{{nombre}}", "email": "{{email}}"}`. Al final, el bloque `"variable"` da valores por defecto a
`nombre`, `email`, `estadoEsperado` y `contactoId` (este, vacío). El script de «Crear contacto» es:

```js
// El estado esperado llega de la fila del CSV (o de la variable de colección si no hay CSV)
const esperado = Number(pm.variables.get('estadoEsperado'));
pm.test(`el estado es ${esperado}`, () => {
  pm.response.to.have.status(esperado);
});
pm.test('responde el entorno elegido', () => {
  pm.response.to.have.header('X-Entorno', pm.environment.get('nombreEntorno'));
});
if (pm.response.code !== 201) {
  // Sin contacto creado no hay nada que leer ni borrar: termina esta iteración
  pm.execution.setNextRequest(null);
}
```

`pm.variables.get` busca la variable en todos los ámbitos (datos, entorno, colección) y devuelve la más
específica.

### 2 — Ejecutar contra el entorno local

```bash
# Terminal 2: ejecuta la colección con el entorno local
npx newman run coleccion.postman.json -e entorno-local.json
```

**Resultado esperado** (extracto; tiempos y tamaños cambian):

```text
→ Crear contacto
  POST http://localhost:3304/api/contactos [201 Created, 250B, 42ms]
  ✓  el estado es 201
  ✓  responde el entorno elegido

→ Leer el contacto creado
  GET http://localhost:3304/api/contactos/ [405 Method Not Allowed, 244B, 4ms]
  1. el estado es 200
  2. es el contacto creado

→ Borrar el contacto
  DELETE http://localhost:3304/api/contactos/ [405 Method Not Allowed, 244B, 3ms]
  3. el estado es 204

→ Leer el contacto borrado
  GET http://localhost:3304/api/contactos/ [405 Method Not Allowed, 244B, 3ms]
  4. ya no existe: 404
…
│              assertions │                6 │                4 │
…
  #  failure         detail

 1.  AssertionError  el estado es 200
                     expected response to have status code 200 but got 405
                     at assertion:0 in test-script
                     inside "Leer el contacto creado"
…
```

La creación funciona, pero las tres peticiones siguientes van a `/api/contactos/` **sin id**:
`{{contactoId}}` sigue vacía porque nadie la ha rellenado. Mira el código de salida:

```bash
# Muestra el código de salida del último comando
echo $?
```

```text
1
```

### 3 — Encadenar: guardar el id creado

Tras crear, guarda el `id` de la respuesta en la variable de colección `contactoId`; las peticiones
siguientes la leen. En el `"exec"` de «Crear contacto», sustituye las cuatro últimas líneas (el bloque
`if (pm.response.code !== 201) { … }`) por estas:

```json
"if (pm.response.code === 201) {",
"  // Guarda el id para las peticiones siguientes",
"  pm.collectionVariables.set('contactoId', pm.response.json().id);",
"} else {",
"  // Sin contacto creado no hay nada que leer ni borrar: termina esta iteración",
"  pm.execution.setNextRequest(null);",
"}"
```

```bash
# Ejecuta otra vez con el entorno local
npx newman run coleccion.postman.json -e entorno-local.json
```

**Resultado esperado** (el `id` depende de cuántos contactos haya creado ya la API; con la API recién
arrancada es `1`):

```text
→ Crear contacto
  POST http://localhost:3304/api/contactos [201 Created, 250B, 43ms]
  ✓  el estado es 201
  ✓  responde el entorno elegido

→ Leer el contacto creado
  GET http://localhost:3304/api/contactos/1 [200 OK, 245B, 8ms]
  ✓  el estado es 200
  ✓  es el contacto creado

→ Borrar el contacto
  DELETE http://localhost:3304/api/contactos/1 [204 No Content, 176B, 3ms]
  ✓  el estado es 204

→ Leer el contacto borrado
  GET http://localhost:3304/api/contactos/1 [404 Not Found, 237B, 2ms]
  ✓  ya no existe: 404

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
│              assertions │                6 │                0 │
├─────────────────────────┴──────────────────┴──────────────────┤
…
```

El recorrido crea su propio dato y lo borra al final: no depende de lo que hubiera en la API ni deja basura.

### 4 — Cambiar de entorno sin tocar la colección

Levantas un segundo entorno, «preproducción», en otro puerto, y ejecutas la misma colección con su fichero
de entorno.

```bash
# Terminal 3: arranca la API del entorno «preproduccion» en el puerto 3314
cd ejercicios/M03-04-newman-datos-y-entornos
PORT=3314 ENTORNO=preproduccion node app/server.mjs
```

```bash
# Terminal 2: la misma colección, otro entorno
npx newman run coleccion.postman.json -e entorno-preproduccion.json
```

**Resultado esperado** (extracto):

```text
→ Crear contacto
  POST http://localhost:3314/api/contactos [201 Created, 258B, 29ms]
  ✓  el estado es 201
  ✓  responde el entorno elegido
…
│              assertions │                6 │                0 │
```

Las peticiones van al puerto 3314 y la prueba «responde el entorno elegido» confirma que ha contestado
preproducción. Para esa API con `Ctrl+C` en el terminal 3.

### 5 — Alimentar la colección con un CSV

Abre `datos.csv`:

```text
nombre,email,estadoEsperado
Ana,ana@example.com,201
Luis,luis@example.com,201
Marta,no-es-un-email,400
```

La primera fila son los nombres de las variables; cada fila siguiente es una **iteración**: Newman ejecuta
la colección entera una vez por fila, con esos valores.

```bash
# Ejecuta una iteración por fila del CSV
npx newman run coleccion.postman.json -e entorno-local.json -d datos.csv
```

**Resultado esperado** (extracto; los `id` dependen del estado de la API):

```text
Iteration 1/3

→ Crear contacto
  POST http://localhost:3304/api/contactos [201 Created, 250B, 22ms]
  ✓  el estado es 201
  ✓  responde el entorno elegido
…
Iteration 2/3
…
Iteration 3/3

→ Crear contacto
  POST http://localhost:3304/api/contactos [400 Bad Request, 239B, 3ms]
  ✓  el estado es 400
  ✓  responde el entorno elegido

┌─────────────────────────┬─────────────────┬─────────────────┐
│                         │        executed │          failed │
├─────────────────────────┼─────────────────┼─────────────────┤
│              iterations │               3 │               0 │
├─────────────────────────┼─────────────────┼─────────────────┤
│                requests │               9 │               0 │
…
│              assertions │              14 │               0 │
```

La tercera fila es un caso negativo: espera 400 y lo recibe, y `setNextRequest(null)` corta la iteración
tras la creación. Por eso hay 9 peticiones y no 12.

### 6 — Informes para el pipeline y código de salida

Un pipeline no lee la tabla de la terminal: lee un fichero JUnit (XML) para mostrar las pruebas, y a las
personas les sirve un HTML. Pide los tres reporters a la vez.

```bash
# cli = terminal; junit = XML; htmlextra = página HTML. Los ficheros van a reports/ (ignorada por git)
npx newman run coleccion.postman.json -e entorno-local.json -d datos.csv \
  -r cli,junit,htmlextra \
  --reporter-junit-export reports/newman.xml \
  --reporter-htmlextra-export reports/newman.html
echo $?
```

**Resultado esperado:** la misma salida del paso 5 en la terminal, y al final:

```text
0
```

```bash
# Lista los informes generados
ls reports
```

```text
newman.html  newman.xml
```

Abre `reports/newman.xml` en el editor: un `<testsuite>` por petición y un `<testcase>` por `pm.test`. El
inicio (los `id` y las fechas cambian):

```text
<?xml version="1.0" encoding="UTF-8"?>
<testsuites name="M03-04 API de contactos" tests="9" time="0.043">
  <testsuite name="Crear contacto" id="0561ac7e-ab8d-4fce-809e-4cc72e88b7a4" timestamp="2026-11-17T16:25:33.869Z" tests="2" failures="0" errors="0" time="0.009">
    <testcase name="el estado es 201" time="0.003" classname="CrearContacto"/>
    <testcase name="responde el entorno elegido" time="0.003" classname="CrearContacto"/>
    <testcase name="el estado es 400" time="0.003" classname="CrearContacto"/>
  </testsuite>
```

Para ver `reports/newman.html`, haz clic derecho sobre el fichero en el explorador de VS Code →
**Download…** y ábrelo en tu navegador: tiene un resumen, cada iteración y cada petición con su respuesta.

## Comprueba tu entendimiento

**Sin entorno**
Ejecuta la colección sin `-e`.

```bash
# Ejecuta la colección sin fichero de entorno
npx newman run coleccion.postman.json
```

→ La petición sale con la URL literal `{{baseUrl}}/api/contactos` y falla con
`getaddrinfo EAI_AGAIN {{baseurl}}` (según la red, `ENOTFOUND`): la variable no existe en ningún ámbito.

**Entorno caído**
Con la API de preproducción parada, ejecuta con `-e entorno-preproduccion.json`.
→ `connect ECONNREFUSED 127.0.0.1:3314` en «Crear contacto», y el código de salida es `1`.

## Experimenta

Un compañero edita `datos.csv` y, por error, pone `201` como estado esperado de la fila de Marta (cuyo
email no es válido). **Predice:** ¿cuántas iteraciones fallan, qué dice el error y qué código de salida
tiene Newman?

Cambia `Marta,no-es-un-email,400` por `Marta,no-es-un-email,201` y ejecuta:

```bash
# Ejecuta con el CSV modificado y muestra el código de salida
npx newman run coleccion.postman.json -e entorno-local.json -d datos.csv
echo $?
```

**Resultado esperado** (extracto):

```text
Iteration 3/3

→ Crear contacto
  POST http://localhost:3304/api/contactos [400 Bad Request, 239B, 3ms]
  1. el estado es 201
  ✓  responde el entorno elegido
…
│              assertions │               14 │               1 │
…
  #  failure         detail

 1.  AssertionError  el estado es 201
     iteration: 3    expected response to have status code 201 but got 400
                     at assertion:0 in test-script
                     inside "Crear contacto"
1
```

El informe indica la iteración (`iteration: 3`), es decir, la fila del CSV que falla. Fíjate en que
`requests … failed 0`: las peticiones han ido bien; lo que falla es una [aserción](../glosario/01-fundamentos.md#asercion). Vuelve a dejar `400`.

## Reto

### 1 — Que el CSV diga también el mensaje de error

**La situación:** la API devuelve dos errores distintos con 400: `El nombre es obligatorio` y
`El email no es válido`. Con solo `estadoEsperado`, una fila sin nombre que fallara por el email pasaría
igual. QA quiere añadir casos al CSV sin tocar la colección cada vez.

**Qué haces:** crea `datos-reto.csv` con una cuarta columna, `errorEsperado`, y estas filas: Ana válida
(columna vacía), Marta con email inválido, una fila sin nombre y Pedro sin email. Añade al script de
«Crear contacto» una prueba que, **solo si la fila trae `errorEsperado`**, compare
`pm.response.json().error` con ese valor. Ejecuta con `-d datos-reto.csv`.

**Pistas:** `pm.variables.get('errorEsperado')` devuelve el valor de la fila (vacío en la de Ana);
un `if` alrededor de `pm.test`; en un CSV, un campo vacío es simplemente nada entre dos comas.

**Lo que buscas:** 4 iteraciones, 15 aserciones, ninguna fallida, y en las filas de error una prueba
`el error es «…»` con el mensaje exacto.

<details>
<summary>Ver solución</summary>

```text
nombre,email,estadoEsperado,errorEsperado
Ana,ana@example.com,201,
Marta,no-es-un-email,400,El email no es válido
,sin-nombre@example.com,400,El nombre es obligatorio
Pedro,,400,El email no es válido
```

Líneas que se añaden al `"exec"` de «Crear contacto», antes del `if (pm.response.code === 201)`:

```json
"// Reto: si la fila del CSV trae «errorEsperado», comprueba también el mensaje",
"const errorEsperado = pm.variables.get('errorEsperado');",
"if (errorEsperado) {",
"  pm.test(`el error es «${errorEsperado}»`, () => {",
"    pm.expect(pm.response.json().error).to.eql(errorEsperado);",
"  });",
"}",
```

```bash
# Ejecuta la solución con el CSV del reto (ficheros en solucion/)
npx newman run solucion/coleccion.postman.json -e entorno-local.json -d solucion/datos-reto.csv
```

```text
Iteration 2/4

→ Crear contacto
  POST http://localhost:3304/api/contactos [400 Bad Request, 239B, 5ms]
  ✓  el estado es 400
  ✓  responde el entorno elegido
  ✓  el error es «El email no es válido»

Iteration 3/4

→ Crear contacto
  POST http://localhost:3304/api/contactos [400 Bad Request, 241B, 3ms]
  ✓  el estado es 400
  ✓  responde el entorno elegido
  ✓  el error es «El nombre es obligatorio»

Iteration 4/4

→ Crear contacto
  POST http://localhost:3304/api/contactos [400 Bad Request, 239B, 3ms]
  ✓  el estado es 400
  ✓  responde el entorno elegido
  ✓  el error es «El email no es válido»
…
│              iterations │                 4 │                0 │
│                requests │                 7 │                0 │
│              assertions │                15 │                0 │
```

A partir de aquí, un caso nuevo es una fila nueva: QA amplía la cobertura sin tocar JavaScript. En un
pipeline, el mismo CSV sirve para todos los entornos. **La regla:** separa los datos de la lógica de la
prueba; si dos casos solo se diferencian en los datos, son dos filas, no dos peticiones.

</details>

## Errores frecuentes

| Síntoma | Causa probable | Cómo arreglarlo |
|---------|----------------|-----------------|
| `getaddrinfo EAI_AGAIN {{baseurl}}` o `ENOTFOUND` | Falta `-e` o el fichero de entorno no tiene `baseUrl` | Añade `-e entorno-local.json` |
| Peticiones a `/api/contactos/` sin id (405) | No se guarda el id: falta `pm.collectionVariables.set('contactoId', …)` | Paso 3 |
| `connect ECONNREFUSED 127.0.0.1:3314` | La API de preproducción no está arrancada | Arráncala en otro terminal (bloque de abajo) |
| `expected 'X-Entorno' response header to be 'local' but got 'preproduccion'` | El entorno apunta a un puerto donde corre otra instancia (otro `ENTORNO`) | Comprueba `baseUrl` en el fichero de entorno y con qué `ENTORNO` arrancaste la API |
| Todas las filas usan Ana | El CSV no se ha pasado (`-d`) y se usan los valores por defecto de la colección | Añade `-d datos.csv` |
| No aparece `reports/newman.html` | Falta `htmlextra` en `-r` o la ruta de `--reporter-htmlextra-export` | Copia el comando del paso 6 completo |

```bash
# Arranca la API del entorno de preproducción
PORT=3314 ENTORNO=preproduccion node app/server.mjs
```

## Conclusiones

### Qué es la ejecución por línea de comandos parametrizada

Ejecutar la misma colección, sin editarla, con lo que cambia pasado desde fuera: el entorno (`-e`), los
datos (`-d`) y el formato del resultado (`-r`); y encadenar peticiones con variables que escriben los
propios scripts.

### Cómo debe ser

| Requisito | En el lab |
|-----------|-----------|
| Nada de URLs fijas en la colección | `{{baseUrl}}` desde `entorno-local.json` / `entorno-preproduccion.json` |
| Las pruebas crean y limpian sus datos | crear → leer → borrar → 404 con `contactoId` |
| Casos que difieren en datos = filas | `datos.csv`, 3 iteraciones; `datos-reto.csv`, 4 |
| Resultado legible por máquinas | JUnit en `reports/newman.xml` |
| El proceso dice si ha ido bien | código de salida `0` / `1` |

### Dónde se rompe y cómo lo has detectado

| Fallo | Cómo lo has visto | Qué provoca |
|-------|-------------------|-------------|
| Variable no encadenada | `GET /api/contactos/` → 405 y 4 aserciones fallidas | Peticiones que prueban otra cosa |
| Falta el entorno | URL literal `{{baseUrl}}` y error de DNS | El pipeline falla por configuración |
| Dato mal puesto en el CSV | `iteration: 3` en el informe de fallos | Falso rojo; el informe dice qué fila revisar |

### Cómo se perfecciona

En un proyecto real, los ficheros de entorno con secretos no se versionan: el pipeline los genera o pasa los
valores con `--env-var clave=valor` desde sus secretos. El informe JUnit se publica en el pipeline para ver
cada prueba, y el código de salida decide si el despliegue continúa
([M04 — CI/CD y testing continuo](../M04-ci-cd-testing-continuo/README.md)).

### En una frase

> 🔑 Una colección bien parametrizada no cambia entre entornos ni entre casos: cambian el `-e`, el `-d` y las filas, y el código de salida dice la verdad.
