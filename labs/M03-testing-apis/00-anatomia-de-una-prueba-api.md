# Anatomía de una prueba de API

[← Página anterior](README.md) · [Siguiente página →](01-lab-validar-respuestas.md)

Una [prueba de API](../glosario/01-fundamentos.md#prueba-de-api) no abre ningún navegador: envía una **petición** HTTP, recibe una **respuesta** y
comprueba con **[aserciones](../glosario/01-fundamentos.md#asercion)** que esa respuesta es la que dice el acuerdo con quien la usa. Esta
demostración desmonta esas tres piezas con una [API REST](../glosario/03-apis.md#api-rest) mínima de
productos: primero se mira la respuesta en crudo con `curl` y después se ve la misma comprobación
escrita como [colección de Postman](../glosario/03-apis.md#coleccion-postman) y ejecutada con
[Newman](../glosario/03-apis.md#newman).

## Punto de partida

- Codespace del curso abierto, con dos terminales.
- Carpeta del ejercicio: [`ejercicios/M03-00-anatomia-de-una-prueba-api/`](../../ejercicios/M03-00-anatomia-de-una-prueba-api/README.md),
  con la API en `app/server.mjs` y la colección en `coleccion.postman.json`.
- Sin credenciales: la API es pública y guarda dos productos en memoria.

```bash
# Terminal 1: arranca la API de productos en el puerto 3300
cd ejercicios/M03-00-anatomia-de-una-prueba-api
PORT=3300 node app/server.mjs
```

```text
API de productos en http://localhost:3300
```

## Recorrido

### 1 — La respuesta, entera

`curl -i` muestra la respuesta tal como llega por la red: la línea de estado, las
[cabeceras](../glosario/03-apis.md#cabecera-http) y, tras una línea en blanco, el cuerpo. Es lo mismo que
recibirá cualquier cliente de la API (una web, una app móvil, otro servicio).

```bash
# Terminal 2: pide el producto 1 y muestra también las cabeceras (-i)
cd ejercicios/M03-00-anatomia-de-una-prueba-api
curl -i http://localhost:3300/api/productos/1
```

La fecha cambia en cada ejecución:

```text
HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8
Date: Tue, 17 Nov 2026 16:18:35 GMT
Connection: keep-alive
Keep-Alive: timeout=5
Transfer-Encoding: chunked

{"id":1,"nombre":"Teclado","precio":24.9,"stock":12}
```

| Parte | Valor | Qué se comprueba de ella |
|-------|-------|--------------------------|
| Línea de estado | `HTTP/1.1 200 OK` | el [código de estado](../glosario/03-apis.md#codigo-de-estado): 200 = se ha encontrado y se devuelve |
| Cabecera `Content-Type` | `application/json; charset=utf-8` | que el cliente sabrá interpretar el cuerpo como JSON |
| Cuerpo | `{"id":1,"nombre":"Teclado",…}` | que es *ese* producto, con sus campos y sus tipos |

### 2 — El caso que sale mal también responde

Pedir un producto que no existe no rompe nada: la API responde, con otro código y otro cuerpo. Una
prueba de API comprueba también estos caminos, porque los clientes dependen de ellos para mostrar un
mensaje en lugar de fallar.

```bash
# Pide un producto que no existe
curl -i http://localhost:3300/api/productos/99
```

```text
HTTP/1.1 404 Not Found
Content-Type: application/json; charset=utf-8
Date: Tue, 17 Nov 2026 16:18:35 GMT
Connection: keep-alive
Keep-Alive: timeout=5
Transfer-Encoding: chunked

{"error":"Producto no encontrado"}
```

El 404 dice «no existe» y el cuerpo lo explica con un campo `error`. Un cliente que solo mirara el
cuerpo y esperara un producto fallaría aquí.

### 3 — Las comprobaciones, escritas

Mirar con `curl` es una inspección manual. Para que se repita sola, las comprobaciones se escriben.
El fichero `coleccion.postman.json` es una colección de Postman (formato v2.1): una lista de peticiones,
cada una con un script `test` que se ejecuta al llegar la respuesta. El de la primera petición dice:

```js
pm.test('el estado es 200', () => {
  pm.response.to.have.status(200);
});
pm.test('responde JSON', () => {
  pm.expect(pm.response.headers.get('Content-Type')).to.include('application/json');
});
pm.test('el cuerpo es el producto 1', () => {
  const producto = pm.response.json();
  pm.expect(producto.id).to.eql(1);
  pm.expect(producto.nombre).to.eql('Teclado');
});
```

Son las tres filas de la tabla del paso 1, convertidas en
aserciones: estado, cabecera y cuerpo. La segunda petición
hace lo mismo con el 404.

### 4 — La colección, ejecutada desde la terminal

Newman es el ejecutor de colecciones de Postman por línea de comandos: no necesita la aplicación de
Postman ni una cuenta, y es lo que se lanza en un [pipeline](../glosario/04-ci-cd.md#pipeline).

```bash
# Ejecuta todas las peticiones de la colección y sus pruebas
npx newman run coleccion.postman.json
```

Los tiempos (`23ms`, `67ms`…) cambian en cada ejecución:

```text
newman

M03-00 Anatomía de una prueba de API

→ Leer el producto 1
  GET http://localhost:3300/api/productos/1 [200 OK, 230B, 23ms]
  ✓  el estado es 200
  ✓  responde JSON
  ✓  el cuerpo es el producto 1

→ Leer un producto que no existe
  GET http://localhost:3300/api/productos/99 [404 Not Found, 219B, 3ms]
  ✓  el estado es 404
  ✓  explica el error

┌─────────────────────────┬──────────────────┬──────────────────┐
│                         │         executed │           failed │
├─────────────────────────┼──────────────────┼──────────────────┤
│              iterations │                1 │                0 │
├─────────────────────────┼──────────────────┼──────────────────┤
│                requests │                2 │                0 │
├─────────────────────────┼──────────────────┼──────────────────┤
│            test-scripts │                2 │                0 │
├─────────────────────────┼──────────────────┼──────────────────┤
│      prerequest-scripts │                0 │                0 │
├─────────────────────────┼──────────────────┼──────────────────┤
│              assertions │                5 │                0 │
├─────────────────────────┴──────────────────┴──────────────────┤
│ total run duration: 67ms                                      │
├───────────────────────────────────────────────────────────────┤
│ total data received: 86B (approx)                             │
├───────────────────────────────────────────────────────────────┤
│ average response time: 13ms [min: 3ms, max: 23ms, s.d.: 10ms] │
└───────────────────────────────────────────────────────────────┘
```

| Línea | Qué es |
|-------|--------|
| `→ Leer el producto 1` | la petición (su nombre en la colección) |
| `GET … [200 OK, 230B, 23ms]` | lo que ha respondido la API: estado, tamaño y tiempo |
| `✓ el estado es 200` | una aserción que se cumple; si no, aparecería numerada y con el detalle al final |
| `assertions 5 / 0` | cinco aserciones ejecutadas, ninguna fallida: el proceso termina con código 0 |

## Qué queda visto

Una prueba de API tiene siempre la misma forma: **petición → respuesta → aserciones** sobre el estado,
las cabeceras y el cuerpo, y cubre tanto el caso que va bien como el que va mal. Se puede escribir en
cualquier herramienta: aquí, una colección de Postman; en
[Validar respuestas](01-lab-validar-respuestas.md), el cliente `request` de [Playwright](../glosario/02-e2e.md#playwright); y las
colecciones se trabajan a fondo en [Colección de Postman](03-lab-coleccion-postman.md).

Queda abierta una pregunta: si una prueba solo comprobara que la respuesta «ha ido bien», sin mirar
el cuerpo, ¿qué cambios en la API dejarían pasar sin avisar?
