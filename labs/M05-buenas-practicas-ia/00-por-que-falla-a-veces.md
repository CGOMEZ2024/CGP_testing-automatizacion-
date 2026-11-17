# Por qué falla a veces

[← Página anterior](README.md) · [Siguiente página →](01-lab-estabilizar-flaky-tests.md)

Una prueba que pasa en el portátil de quien la escribió y falla una de cada pocas veces en la
[integración continua](../glosario/01-fundamentos.md#integracion-continua) es un [flaky test](../glosario/05-calidad-e-ia.md#flaky-test). Esta demostración
toma una sola prueba de [Playwright](../glosario/02-e2e.md#playwright), la ejecuta una vez (pasa), la repite veinte veces (falla la mitad),
la ejecuta con [reintentos](../glosario/02-e2e.md#reintento) (sale `flaky`) y busca en su traza el motivo.

## Punto de partida

- Ejercicio: [`ejercicios/M05-00-por-que-falla-a-veces/`](../../ejercicios/M05-00-por-que-falla-a-veces/README.md),
  en un terminal del Codespace.
- La aplicación (`app/server.mjs`, puerto 3500) es una página con un botón **Cargar pedidos**; la API
  `/api/pedidos` responde con un retraso aleatorio de **100 a 900 ms**, como una red o una base de datos reales.
  Playwright la arranca solo (`webServer` en `playwright.config.js`).
- Sin credenciales.

```bash
# Carpeta de la demostración
cd ejercicios/M05-00-por-que-falla-a-veces
```

La prueba (`tests/pedidos.spec.js`) pulsa el botón, espera medio segundo fijo y cuenta los pedidos:

```js
test('la lista muestra los tres pedidos', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Cargar pedidos' }).click();

  // «Medio segundo debería bastar»: una espera fija ante una respuesta que tarda 100–900 ms
  await page.waitForTimeout(500);

  // count() no reintenta: cuenta lo que haya en este instante
  expect(await page.getByRole('listitem').count()).toBe(3);
});
```

## Recorrido

### 1 — Una ejecución: pasa

Lo que hace cualquiera antes de subir un cambio es ejecutar la prueba una vez.

```bash
# Una ejecución normal
npx playwright test
```

**Resultado** (en una ejecución concreta; otras veces esta misma orden falla):

```text
Running 1 test using 1 worker

  ✓  1 tests/pedidos.spec.js:3:1 › la lista muestra los tres pedidos (650ms)

  1 passed (1.3s)
```

Verde. Con una sola ejecución no hay forma de distinguir una prueba estable de una que ha tenido suerte.

### 2 — Veinte ejecuciones: la tasa de fallo

`--repeat-each=20` ejecuta cada prueba veinte veces (en paralelo, con varios workers). El reporter `dot`
pinta un carácter por ejecución: `·` pasa, `F` falla.

```bash
# La misma prueba, veinte veces
npx playwright test --repeat-each=20 --reporter=dot
```

**Resultado** (el reparto de `·` y `F` cambia en cada ejecución; se muestra el principio y el final):

```text
Running 20 tests using 4 workers
FFFF·FFF··FF···FF·FF

  1) tests/pedidos.spec.js:3:1 › la lista muestra los tres pedidos ─────────────────────────────────

    Error: expect(received).toBe(expected) // Object.is equality

    Expected: 3
    Received: 0
…
  13 failed
…
  7 passed (8.4s)
```

| Dato | Qué dice |
|------|----------|
| `13 failed` / `7 passed` | En esta tanda, el 65 % de las ejecuciones falla. En otra tanda salieron 9 de 20: la tasa varía, pero nunca es cero |
| `Received: 0` | En el instante del conteo no había **ningún** pedido en la lista: no es un dato mal calculado, es que aún no había llegado |

`--repeat-each` convierte «a veces falla» en un número que
se puede comparar antes y después de un arreglo.

### 3 — Con reintentos: el estado `flaky`

Con `--retries=2`, Playwright vuelve a ejecutar hasta dos veces cada prueba que falla. Si pasa en un
reintento, la marca como **flaky** en lugar de como fallida. En el reporter `dot`, `×` es un intento
fallido que se va a reintentar, `±` una prueba que acaba pasando tras fallar y `F` una que falla todos sus intentos.

```bash
# Veinte ejecuciones, con dos reintentos por fallo
npx playwright test --repeat-each=20 --retries=2 --reporter=dot
```

**Resultado** (cambia en cada ejecución):

```text
Running 20 tests using 4 workers
···×·×±×·×·±×±·×××××±±±F··××··±±
…
  1 failed
…
  8 flaky
…
  11 passed (12.9s)
```

| Línea | Qué significa |
|-------|---------------|
| `8 flaky` | Ocho ejecuciones fallaron y luego pasaron: con reintentos, el [pipeline](../glosario/04-ci-cd.md#pipeline) las da por buenas |
| `1 failed` | Una falló los tres intentos seguidos: el reintento reduce los fallos, no los elimina |
| `(12.9s)` frente a `(8.4s)` | Cada reintento es una ejecución más: los reintentos esconden el problema y además cuestan tiempo |

### 4 — La traza: dónde se ve la causa

La configuración guarda la traza de cada intento fallido (`trace: 'retain-on-failure'`). La salida de
cada fallo indica dónde está y cómo abrirla; en el Codespace, el visor se sirve en un puerto y se abre
desde la pestaña **Ports**:

```bash
# Abre una de las trazas en el Trace Viewer (sustituye la ruta por una de las que imprimió tu ejecución)
npx playwright show-trace --host 0.0.0.0 --port 9323 test-results/pedidos-la-lista-muestra-los-tres-pedidos-repeat16/trace.zip
```

En la lista de acciones de la izquierda del [Trace Viewer](../glosario/02-e2e.md#trace-viewer) aparece la secuencia completa del intento. Los
tiempos de una traza fallida, leídos del propio `trace.zip`:

```text
goto            71 ms   url: /
click           72 ms   getByRole('button', { name: 'Cargar pedidos' })
waitForTimeout 503 ms   500
queryCount       2 ms   getByRole('listitem')  → 0
```

Y en la pestaña **Network**, la petición `GET /api/pedidos` aparece **sin respuesta**: cuando la prueba
contó los elementos y terminó, la API todavía no había contestado.

| Dónde mirar | Qué se ve | Qué demuestra |
|-------------|-----------|---------------|
| Acción `waitForTimeout` | 503 ms, siempre los mismos | La espera no depende de lo que pasa en la página |
| Acción `queryCount` → 0 | El conteo se hace una vez, en 2 ms | `count()` no reintenta: es una foto del instante |
| **Network**: `/api/pedidos` sin respuesta | La respuesta llegó después | La causa es una carrera entre la [espera fija](../glosario/02-e2e.md#espera-fija) y una carga variable |

## Qué queda visto

- Una ejecución verde no prueba que una prueba sea estable; veinte repeticiones en paralelo, sí dan una tasa.
- Los reintentos convierten fallos en `flaky` y alargan la ejecución, pero no quitan la causa.
- La traza dice qué esperaba la prueba y qué estaba pasando en la página en ese momento.

El laboratorio [Estabilizar flaky tests](01-lab-estabilizar-flaky-tests.md) trabaja con tres pruebas
inestables por tres causas distintas; se puede hacer sin haber seguido esta demostración.

**La pregunta que abre el lab:** si alargar la espera a 1 segundo haría que esta prueba pasara las veinte
veces, ¿estaría arreglada?
