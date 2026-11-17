# Lab — Estabilizar flaky tests

[← Página anterior](00-por-que-falla-a-veces.md) · [Siguiente página →](02-lab-cobertura-util.md)

Practicas la **estabilización de [pruebas inestables](../glosario/05-calidad-e-ia.md#flaky-test)** con un ejercicio de tres páginas y tres pruebas de
[Playwright](../glosario/02-e2e.md#playwright). Cada prueba es un flaky test por una causa
distinta: una [espera fija](../glosario/02-e2e.md#espera-fija) ante una carga variable, un número que se anima y una lista del servidor que
comparten varias pruebas en paralelo. Las detectas con repeticiones, lees qué dice cada fallo, corriges
la causa y demuestras que ya no fallan.

### Objetivo

Comprender qué causa la inestabilidad de una prueba: cómo funciona, cómo debe ser una prueba estable,
cómo se detectan sus debilidades y cómo se mejora.

### Punto de partida

- Codespace del curso abierto y un terminal en la carpeta del ejercicio
  [`ejercicios/M05-01-estabilizar-flaky-tests/`](../../ejercicios/M05-01-estabilizar-flaky-tests/README.md).
- Sin credenciales. La aplicación (`app/server.mjs`, puerto 3501) la arranca Playwright con `webServer`.
- La solución completa está en `solucion/`; no la necesitas para seguir los pasos.

```bash
# Entra en la carpeta del ejercicio
cd ejercicios/M05-01-estabilizar-flaky-tests
```

### Qué está pasando

Una prueba inestable cuesta más que una prueba rota: la rota se arregla una vez; la inestable hace que
el equipo relance [pipelines](../glosario/04-ci-cd.md#pipeline), deje de mirar los fallos y acabe ignorando uno de verdad. Casi nunca es «la
herramienta que falla»: es la prueba, que supone algo sobre el tiempo o sobre el estado que no siempre
es cierto.

| Página | Qué hace la aplicación | Qué supone la prueba | Causa |
|--------|------------------------|----------------------|-------|
| `catalogo.html` | Pide los productos a una API que tarda de 100 a 900 ms | «Medio segundo basta» (`waitForTimeout(500)`) | Espera fija ante una carga variable |
| `resumen.html` | Al pulsar **Calcular total**, el número sube de 0 al total en 400 ms | «La animación dura 400 ms, espero 400 ms y leo» | Animación |
| `favoritos.html` | Guarda los destinos en el servidor, en una lista `general` | «La lista es mía; la vacío antes de empezar» | [Datos compartidos](../glosario/05-calidad-e-ia.md#aislamiento-de-datos) entre pruebas en paralelo |

La configuración tiene `fullyParallel: true`: las pruebas de un mismo fichero también se reparten entre
workers, como en un pipeline que quiere acabar pronto.

### 1 — Ejecutar la suite una vez

Empiezas por lo que haría cualquiera: una ejecución.

```bash
# Las tres pruebas de favoritos, la de catálogo y la de resumen, una vez
npx playwright test
```

**Resultado esperado** (qué pruebas fallan cambia en cada ejecución; los tiempos también):

```text
Running 5 tests using 4 workers

  ✓  3 tests/favoritos.spec.js:25:1 › vaciar deja la lista sin destinos (435ms)
  ✓  1 tests/catalogo.spec.js:3:1 › el catálogo muestra los cuatro productos (739ms)
  ✘  5 tests/resumen.spec.js:3:1 › el total del pedido es 1234,50 € (526ms)
  ✘  4 tests/favoritos.spec.js:11:1 › añadir un destino lo muestra en la lista (5.3s)
  ✘  2 tests/favoritos.spec.js:17:1 › añadir dos destinos muestra los dos (5.4s)
…
  3 failed
…
  2 passed (6.4s)
```

Si vuelves a ejecutarla, el resultado será otro. Con una ejecución no puedes saber qué prueba es
inestable ni cuánto.

### 2 — Repetir cada prueba diez veces

`--repeat-each` ejecuta cada prueba N veces. Así cada una
tiene diez oportunidades de fallar y obtienes una tasa.

```bash
# Cada prueba, diez veces, en paralelo; un carácter por ejecución
npx playwright test --repeat-each=10 --reporter=dot
```

**Resultado esperado** (los números cambian; se muestra el principio y el resumen final):

```text
Running 50 tests using 4 workers
··F·F··F·····FF·F·········F····F···FF···F········F
…
  12 failed
    tests/catalogo.spec.js:3:1 › el catálogo muestra los cuatro productos ──────────────────────────
    tests/catalogo.spec.js:3:1 › el catálogo muestra los cuatro productos ──────────────────────────
    tests/catalogo.spec.js:3:1 › el catálogo muestra los cuatro productos ──────────────────────────
    tests/catalogo.spec.js:3:1 › el catálogo muestra los cuatro productos ──────────────────────────
    tests/catalogo.spec.js:3:1 › el catálogo muestra los cuatro productos ──────────────────────────
    tests/catalogo.spec.js:3:1 › el catálogo muestra los cuatro productos ──────────────────────────
    tests/favoritos.spec.js:11:1 › añadir un destino lo muestra en la lista ────────────────────────
    tests/favoritos.spec.js:17:1 › añadir dos destinos muestra los dos ─────────────────────────────
    tests/favoritos.spec.js:17:1 › añadir dos destinos muestra los dos ─────────────────────────────
    tests/favoritos.spec.js:17:1 › añadir dos destinos muestra los dos ─────────────────────────────
    tests/resumen.spec.js:3:1 › el total del pedido es 1234,50 € ───────────────────────────────────
    tests/resumen.spec.js:3:1 › el total del pedido es 1234,50 € ───────────────────────────────────
  38 passed (18.4s)
```

El resumen final agrupa los fallos por prueba: aquí, 6 de 10 en catálogo, 4 entre las de favoritos y 2
de 10 en resumen. Las cinco son inestables, con tasas distintas. Lo siguiente es leer **qué** dice cada fallo.

### 3 — Leer el mensaje de cada fallo

La salida completa del paso anterior trae el error de cada fallo. Busca uno de cada fichero (desplázate
por el terminal o repite la ejecución); estos son los de una ejecución real:

```text
  tests/catalogo.spec.js:3:1 › el catálogo muestra los cuatro productos
    Error: expect(received).toBe(expected) // Object.is equality
    Expected: 4
    Received: 0

  tests/resumen.spec.js:3:1 › el total del pedido es 1234,50 €
    Error: expect(received).toBe(expected) // Object.is equality
    Expected: "1234,50 €"
    Received: "1218,14 €"

  tests/favoritos.spec.js:17:1 › añadir dos destinos muestra los dos
    Error: expect(locator).toHaveText(expected) failed
    Locator: getByRole('listitem')
    Timeout: 5000ms
    - Expected  - 0
    + Received  + 2

      Array [
        "Roma",
    +   "París",
    +   "Tokio",
        "Lima",
      ]
```

| Fallo | Qué dice | Pista sobre la causa |
|-------|----------|----------------------|
| Catálogo: `Received: 0` | No había ningún producto al contar | La lista aún no había llegado: problema de **tiempo** |
| Resumen: `"1218,14 €"` | Un valor intermedio, casi el final | Se leyó **en mitad de la animación** |
| Favoritos: aparecen `París` y `Tokio` | Destinos que esta prueba no ha añadido | Los añadió **otra prueba**, a la vez, en la misma lista |

> [!TIP]
> Cada fallo también guarda su traza (`test-results/…/trace.zip`). Se abre con
> `npx playwright show-trace --host 0.0.0.0 --port 9323 <ruta del trace.zip>` y la pestaña **Ports**:
> en la de favoritos, la pestaña **Network** muestra peticiones `POST` y `DELETE` a
> `/api/listas/general/favoritos` que la prueba no ha hecho.

### 4 — Confirmar que favoritos depende del paralelismo

Si la causa de favoritos es que varias pruebas tocan la misma lista a la vez, con un solo worker
deberían pasar siempre. Lo compruebas ejecutando solo ese fichero, primero en serie y después en paralelo.

```bash
# Solo favoritos, diez veces cada prueba, en serie (un worker)
npx playwright test favoritos --repeat-each=10 --workers=1 --reporter=dot
# Lo mismo con cuatro workers
npx playwright test favoritos --repeat-each=10 --workers=4 --reporter=dot
```

**Resultado esperado** (en paralelo, el número de fallos cambia):

```text
Running 30 tests using 1 worker
······························
  30 passed (14.4s)

Running 30 tests using 4 workers
············FFF············FFF
…
  6 failed
…
  24 passed (16.7s)
```

En serie, 30 de 30; en paralelo, 6 fallos. La prueba no está mal escrita por sí sola: falla cuando
convive con las otras. La tentación es poner `workers: 1`, pero eso hace la suite más lenta y deja el
problema escondido para cuando alguien vuelva a activar el [paralelismo](../glosario/05-calidad-e-ia.md#paralelismo).

### 5 — Catálogo: esperar a la condición, no al reloj

Abre `tests/catalogo.spec.js`. La espera fija de 500 ms y el `count()` (que cuenta una vez y no
reintenta) son la causa. Lo sustituyes por una [aserción](../glosario/01-fundamentos.md#asercion) web-first, que reintenta hasta que la lista tiene
4 elementos o vence su tiempo (5 s).

```js
// tests/catalogo.spec.js — sustituye la prueba entera por esta
import { test, expect } from '@playwright/test';

test('el catálogo muestra los cuatro productos', async ({ page }) => {
  await page.goto('/catalogo.html');
  // Aserción web-first: reintenta hasta que haya 4 elementos (o hasta 5 s)
  await expect(page.getByRole('listitem')).toHaveCount(4);
});
```

```bash
# Veinte repeticiones de la prueba corregida
npx playwright test catalogo --repeat-each=20 --reporter=dot
```

**Resultado esperado:**

```text
Running 20 tests using 4 workers
····················
  20 passed (8.3s)
```

20 de 20. Y la prueba ya no espera 500 ms cuando la API responde en 100: acaba en cuanto la condición se cumple.

### 6 — Resumen: comprobar el estado final y quitar la animación

En `tests/resumen.spec.js`, la lectura con `textContent()` es una foto de un instante. Primero cambias
la comprobación por `toHaveText`, que espera a que el texto sea el final.

```js
// tests/resumen.spec.js — sustituye la prueba entera por esta
import { test, expect } from '@playwright/test';

test('el total del pedido es 1234,50 €', async ({ page }) => {
  await page.goto('/resumen.html');
  await page.getByRole('button', { name: 'Calcular total' }).click();
  // Se comprueba el estado final, no un instante: toHaveText reintenta hasta que coincide
  await expect(page.getByTestId('total')).toHaveText('1234,50 €');
});
```

```bash
# Una ejecución con su tiempo
npx playwright test resumen --reporter=list
```

**Resultado esperado** (el tiempo cambia):

```text
Running 1 test using 1 worker

  ✓  1 tests/resumen.spec.js:3:1 › el total del pedido es 1234,50 € (949ms)

  1 passed (1.7s)
```

Ya es estable, pero cada prueba sigue esperando la animación entera. La aplicación respeta la preferencia
del sistema «reducir movimiento» (`prefers-reduced-motion`): si el navegador la pide, el total aparece
sin animar. En `playwright.config.js`, añade `reducedMotion` dentro de `use`:

```js
// playwright.config.js — dentro de use: { … }
    reducedMotion: 'reduce',          // el navegador pide «menos movimiento»: la app no anima el total
```

```bash
# La misma prueba, ahora sin animación
npx playwright test resumen --reporter=list
```

**Resultado esperado** (el tiempo cambia):

```text
Running 1 test using 1 worker

  ✓  1 tests/resumen.spec.js:3:1 › el total del pedido es 1234,50 € (179ms)

  1 passed (815ms)
```

De 949 ms a 179 ms. La aserción hace la prueba estable; quitar la animación la hace además rápida y evita
que una captura o un clic caigan en mitad de un movimiento.

### 7 — Favoritos: cada prueba con sus propios datos

Vaciar la lista `general` en el `beforeEach` no aísla nada cuando otra prueba la está usando a la vez. La
aplicación permite elegir lista con `?lista=…`; cada prueba usa una lista nueva con un identificador
aleatorio, y ya no hace falta vaciar.

```js
// tests/favoritos.spec.js — sustituye la cabecera y el beforeEach por esto (las tres pruebas no cambian)
import { test, expect } from '@playwright/test';
import { randomUUID } from 'node:crypto';

// Cada prueba trabaja en su propia lista: nadie más la lee ni la vacía
test.beforeEach(async ({ page }) => {
  await page.goto(`/favoritos.html?lista=${randomUUID()}`);
});
```

```bash
# Favoritos, diez veces cada prueba, con cuatro workers
npx playwright test favoritos --repeat-each=10 --workers=4 --reporter=dot
```

**Resultado esperado:**

```text
Running 30 tests using 4 workers
······························
  30 passed (9.3s)
```

Antes, 6 fallos en paralelo; ahora, 30 de 30. Además tarda menos: ya no hay fallos que esperan 5 s.

### 8 — Demostrar la estabilidad de toda la suite

Un arreglo de inestabilidad se demuestra con repeticiones, no con una ejecución.

```bash
# Toda la suite, veinte veces cada prueba
npx playwright test --repeat-each=20 --reporter=dot
```

**Resultado esperado** (el tiempo cambia):

```text
Running 100 tests using 4 workers
················································································
····················
  100 passed (35.8s)
```

Cero fallos en 100 ejecuciones. Si te sale algún `F`, lee su mensaje como en el paso 3: indica qué causa queda.

## Comprueba tu entendimiento

**La solución, con repeticiones**
Ejecuta la solución del ejercicio veinte veces por prueba:

```bash
# La solución completa, con su propia configuración
npx playwright test --config solucion/playwright.config.js --repeat-each=20 --reporter=dot
```

→ `100 passed`: la solución hace lo mismo que tus cambios.

**El paralelismo como detector**
Vuelve a poner temporalmente en `tests/favoritos.spec.js` la lista `general` (`page.goto('/favoritos.html')`)
y ejecuta solo favoritos con `--workers=1` y con `--workers=4`.
→ Con uno pasa todo; con cuatro vuelven los fallos con destinos ajenos. Deja otra vez la versión con `randomUUID()`.

## Experimenta

**Predice:** si en lugar de la [aserción web-first](../glosario/02-e2e.md#asercion-web-first) hubieras subido la espera fija del catálogo a 1000 ms,
¿fallaría? ¿Cuánto tardaría cada prueba?

Cambia temporalmente la prueba del catálogo por la versión original con `waitForTimeout(1000)` y ejecuta:

```bash
# Tres repeticiones en serie para comparar tiempos por prueba
npx playwright test catalogo --repeat-each=3 --workers=1 --reporter=list
```

**Resultado** (con la espera de 1000 ms):

```text
  ✓  1 tests/catalogo.spec.js:3:1 › el catálogo muestra los cuatro productos (1.1s)
  ✓  2 tests/catalogo.spec.js:3:1 › el catálogo muestra los cuatro productos (1.1s)
  ✓  3 tests/catalogo.spec.js:3:1 › el catálogo muestra los cuatro productos (1.1s)
```

**Con `toHaveCount(4)`:**

```text
  ✓  1 tests/catalogo.spec.js:3:1 › el catálogo muestra los cuatro productos (912ms)
  ✓  2 tests/catalogo.spec.js:3:1 › el catálogo muestra los cuatro productos (915ms)
  ✓  3 tests/catalogo.spec.js:3:1 › el catálogo muestra los cuatro productos (1.4s)
```

Con 1000 ms pasa (en 20 repeticiones también, porque la API nunca tarda más de 900 ms), pero **todas** las
ejecuciones pagan el peor caso y basta con que la API tarde 1,1 s un día de carga para volver a fallar.
La aserción paga solo lo que tarda la página. Vuelve a dejar `toHaveCount(4)`.

## Reto

### 1 — «Pon reintentos y ya está»

**La situación:** en la revisión del pull request, un compañero propone no tocar las pruebas y añadir
`retries: 3` a la configuración: «así el pipeline sale verde».

**Qué haces:** vuelve a poner temporalmente la prueba **original** del catálogo, ejecútala con
[reintentos](../glosario/02-e2e.md#reintento) y después añade la opción que hace fallar la ejecución si hay pruebas `flaky`.

```js
// tests/catalogo.spec.js — la versión original, solo para este reto
import { test, expect } from '@playwright/test';

test('el catálogo muestra los cuatro productos', async ({ page }) => {
  await page.goto('/catalogo.html');
  await page.waitForTimeout(500);
  expect(await page.getByRole('listitem').count()).toBe(4);
});
```

```bash
# Con tres reintentos
npx playwright test catalogo --repeat-each=10 --retries=3 --reporter=dot
# Con tres reintentos, pero sin aceptar pruebas inestables
npx playwright test catalogo --repeat-each=10 --retries=3 --reporter=dot --fail-on-flaky-tests
```

**Pistas:** el código de salida de la orden (0 = verde para el pipeline) lo ves justo después con:

```bash
# Código de salida de la última orden
echo $?
```

En la configuración, la misma opción se llama `failOnFlakyTests`.

**Lo que buscas:** una configuración de CI que tolere un fallo puntual de infraestructura sin dejar pasar
pruebas inestables sin que nadie se entere.

<details>
<summary>Ver solución</summary>

```text
$ npx playwright test catalogo --repeat-each=10 --retries=3 --reporter=dot
Running 10 tests using 4 workers
·····×·×··×±×±
…
  2 flaky
  8 passed (6.5s)
$ echo $?
0

$ npx playwright test catalogo --repeat-each=10 --retries=3 --reporter=dot --fail-on-flaky-tests
Running 10 tests using 4 workers
···×·±·××·××±±×±
…
  4 flaky
  6 passed (6.5s)
$ echo $?
1
```

Con solo reintentos, la ejecución termina con código 0: el pipeline sale verde con dos pruebas que han
fallado por el camino, y nadie lo mira. Con `--fail-on-flaky-tests`, las mismas pruebas `flaky` hacen
fallar la ejecución (código 1). Una configuración razonable en CI es `retries: 1` (para un fallo de red
puntual) **y** `failOnFlakyTests: true`, o revisar periódicamente las pruebas marcadas como flaky. Al
terminar, vuelve a dejar la prueba con `toHaveCount(4)`.

**La regla:** un reintento es una alarma, no un arreglo; si una prueba solo pasa reintentándola, la
suite tiene que decirlo.

</details>

## Errores frecuentes

| Síntoma | Causa probable | Cómo arreglarlo |
|---------|----------------|-----------------|
| Tras el arreglo, `Error: listen EADDRINUSE :::3501` | Otra ejecución (o la app lanzada a mano) ocupa el puerto | Cierra la otra ejecución; `reuseExistingServer: true` reutiliza la app si es la misma |
| La prueba de resumen sigue tardando ~1 s | `reducedMotion` está fuera de `use` o mal escrito | Va dentro de `use: { … }` y su valor es `'reduce'` |
| Favoritos sigue fallando en paralelo | El `beforeEach` aún vacía la lista `general` o el `goto` no lleva `?lista=` | Deja solo `page.goto(\`/favoritos.html?lista=${randomUUID()}\`)` |
| `ReferenceError: randomUUID is not defined` | Falta el import | `import { randomUUID } from 'node:crypto';` al principio del fichero |
| Con `--repeat-each` todo pasa, pero en CI falla | La máquina de CI es más lenta y cambia los tiempos | Repite con más workers que núcleos (`--workers=8`) para meter carga, como en CI |

## Conclusiones

### Qué es la inestabilidad de una prueba

Una prueba es inestable cuando su resultado depende de algo que la prueba no controla: cuánto tarda una
respuesta, en qué fotograma de una animación lee, qué hacen otras pruebas con los mismos datos. El código
bajo prueba es el mismo en las ejecuciones que pasan y en las que fallan.

### Cómo debe ser

| Requisito | En el lab |
|-----------|-----------|
| Espera a una **condición**, no a un tiempo | `toHaveCount(4)` en lugar de `waitForTimeout(500)` + `count()` |
| Comprueba el **estado final** | `toHaveText('1234,50 €')` en lugar de leer `textContent()` una vez |
| No depende de efectos visuales | `reducedMotion: 'reduce'`: de 949 ms a 179 ms |
| Tiene **sus propios datos** | Una lista por prueba con `randomUUID()` |
| Se demuestra estable con repeticiones | `--repeat-each=20`: 100 de 100 |

### Dónde se rompe y cómo lo has detectado

| Fallo | Cómo lo has visto | Qué provoca |
|-------|-------------------|-------------|
| Espera fija | `Received: 0` en 6 de 10 repeticiones | Falla cuando la API tarda más de lo previsto |
| Animación | `Received: "1218,14 €"`, un valor intermedio | Falla según la carga de la máquina |
| Datos compartidos | Destinos ajenos en la lista; 0 fallos con 1 worker y 6 con 4 | Falla solo en paralelo, que es como corre en CI |
| Reintentos como arreglo | `2 flaky` con código de salida 0 | El problema sigue y nadie lo ve |

### Cómo se perfecciona

En un proyecto real, las pruebas nuevas o modificadas se ejecutan con `--repeat-each` antes de fusionar
(se puede automatizar en el pipeline solo para los ficheros cambiados), `failOnFlakyTests` o un informe
de pruebas `flaky` hace visible la inestabilidad, y una prueba inestable se pone en cuarentena
(`test.fixme`) con un responsable, en lugar de reintentarse indefinidamente.

### En una frase

> 🔑 Una prueba inestable se arregla quitando la suposición sobre el tiempo o sobre los datos, y se da
> por arreglada cuando cien repeticiones en paralelo pasan sin reintentos.
