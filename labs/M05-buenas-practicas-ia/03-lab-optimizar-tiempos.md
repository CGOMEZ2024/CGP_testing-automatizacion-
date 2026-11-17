# Lab — Optimizar tiempos

[← Página anterior](02-lab-cobertura-util.md) · [Siguiente página →](04-lab-refactorizar-escenarios.md)

Practicas la **optimización del tiempo de una suite** con una aplicación de notas con inicio de sesión y
doce pruebas de [Playwright](../glosario/02-e2e.md#playwright). La suite tarda lo que tarda porque cada prueba inicia sesión por la
interfaz, crea sus datos rellenando formularios y todas corren en un solo worker. La mides, aplicas tres
cambios uno a uno ([paralelismo](../glosario/05-calidad-e-ia.md#paralelismo),
[sesión reutilizada](../glosario/05-calidad-e-ia.md#storage-state) y
[preparación por API](../glosario/05-calidad-e-ia.md#preparacion-por-api)) y mides después de cada uno.

### Objetivo

Comprender qué hace lenta una suite: cómo se reparte su tiempo, cómo debe prepararse cada prueba, cómo
se detectan los costes que no aportan y cómo se reducen.

### Punto de partida

- Codespace del curso abierto y un terminal en la carpeta del ejercicio
  [`ejercicios/M05-03-optimizar-tiempos/`](../../ejercicios/M05-03-optimizar-tiempos/README.md).
- Aplicación `app/server.mjs` en el puerto 3503 (la arranca Playwright). Usuario `ana`, clave `curso123`.
- El inicio de sesión tarda ~600 ms (comprobar una clave es caro a propósito, como en un sistema real) y
  cada operación con notas ~100 ms.
- La solución completa está en `solucion/`.

```bash
# Entra en la carpeta del ejercicio
cd ejercicios/M05-03-optimizar-tiempos
```

### Qué está pasando

Una suite que tarda mucho deja de ejecutarse antes de cada cambio y acaba ejecutándose solo en el
[pipeline](../glosario/04-ci-cd.md#pipeline), cuando el fallo ya es más caro. El tiempo de una prueba E2E se va en tres sitios: en lo que
**prueba**, en lo que **prepara** (sesión, datos) y en **esperar su turno**. Solo el primero aporta.

| Pieza | Qué es |
|-------|--------|
| `tests/sesion.spec.js` | Tres pruebas del inicio de sesión: aquí la interfaz de login **es** lo que se prueba |
| `tests/notas.spec.js` | Nueve pruebas de notas; cada una inicia sesión por la interfaz en un `beforeEach` y crea sus notas con el formulario |
| `playwright.config.js` | `workers: 1` y el reporter `list` con `printSteps: true`, que muestra el tiempo de cada `test.step` |

Cada prueba usa títulos con una etiqueta aleatoria (`Comprar pan k3x9a`): no depende de las notas de las demás.

### 1 — Medir la suite tal cual

Antes de optimizar, la medida de partida. El reporter muestra el tiempo de cada paso: `iniciar sesión por
la interfaz` y `preparar datos por la interfaz`.

```bash
# La suite completa, con la configuración de partida
npx playwright test
```

**Resultado esperado** (los tiempos cambian en cada ejecución; extracto):

```text
Running 12 tests using 1 worker

     1.1 tests/notas.spec.js:24:1 › una nota nueva aparece como pendiente › Before Hooks › beforeEach hook › iniciar sesión por la interfaz (954ms)
  ✓   1 tests/notas.spec.js:24:1 › una nota nueva aparece como pendiente (1.4s)
     2.1 tests/notas.spec.js:30:1 › marcar una nota la deja como hecha › Before Hooks › beforeEach hook › iniciar sesión por la interfaz (899ms)
     2.2 tests/notas.spec.js:30:1 › marcar una nota la deja como hecha › preparar datos por la interfaz (359ms)
  ✓   2 tests/notas.spec.js:30:1 › marcar una nota la deja como hecha (1.6s)
…
     5.1 tests/notas.spec.js:61:1 › el buscador muestra solo las notas que coinciden › Before Hooks › beforeEach hook › iniciar sesión por la interfaz (880ms)
     5.2 tests/notas.spec.js:61:1 › el buscador muestra solo las notas que coinciden › preparar datos por la interfaz (1.0s)
  ✓   5 tests/notas.spec.js:61:1 › el buscador muestra solo las notas que coinciden (1.9s)
…
  ✓  10 tests/sesion.spec.js:4:1 › con la clave correcta se entra a las notas (952ms)
  ✓  11 tests/sesion.spec.js:12:1 › con una clave incorrecta se muestra un error (904ms)
  ✓  12 tests/sesion.spec.js:20:1 › sin sesión, la página de notas lleva al login (65ms)

  12 passed (17.6s)
```

| Dato | Qué dice |
|------|----------|
| `iniciar sesión por la interfaz (~900ms)` | Cada una de las 9 pruebas de notas paga un login: ~8 s de los 17,6 s |
| `preparar datos por la interfaz` (de 330 ms a 1 s) | Rellenar el formulario y esperar a que aparezca cada nota |
| `1 worker` | Las 12 pruebas, una detrás de otra |

### 2 — Más workers… y no cambia casi nada

Lo primero que se prueba es subir los workers. Lo haces desde la línea de órdenes, sin tocar la configuración.

```bash
# Cuatro workers, sin cambiar nada más
npx playwright test --workers=4 --reporter=list
```

**Resultado esperado** (los tiempos cambian):

```text
Running 12 tests using 2 workers
…
  12 passed (16.0s)
```

Has pedido 4 workers y Playwright usa **2**. Por defecto reparte **ficheros** entre workers, y solo hay
dos: `sesion.spec.js` (3 pruebas cortas) y `notas.spec.js` (9 pruebas largas), que sigue en serie.

### 3 — Paralelizar dentro del fichero

`fullyParallel` reparte también las pruebas de un mismo fichero. Es posible porque cada prueba usa sus
propios datos (si compartieran una lista, fallarían en paralelo). En `playwright.config.js`, sustituye
la línea de `workers` por estas dos:

```js
// playwright.config.js — en lugar de «workers: 1,»
  fullyParallel: true,                // también las pruebas de un mismo fichero
  workers: 4,                         // cuatro navegadores a la vez
```

```bash
# La suite con la configuración paralela
npx playwright test
```

**Resultado esperado** (los tiempos cambian; extracto):

```text
Running 12 tests using 4 workers
…
  12 passed (5.5s)
```

De 17,6 s a 5,5 s sin tocar una sola prueba. Pero cada prueba sigue haciendo el mismo trabajo: el
paralelismo reparte el coste, no lo quita. En un runner de CI con 2 núcleos la ganancia sería menor.

### 4 — Iniciar sesión una vez: proyecto `setup` y `storageState`

Nueve logins idénticos para probar notas no prueban nada nuevo. Playwright puede iniciar sesión **una
vez** en un proyecto `setup`, guardar las cookies del navegador en un fichero
(`storageState`) y arrancar las demás pruebas con ellas.

Primero, el fichero que inicia sesión. Crea `tests/auth.setup.js`:

```js
import { test as setup, expect } from '@playwright/test';

// Se ejecuta una sola vez, antes que las pruebas del proyecto «chromium»
setup('iniciar sesión como ana', async ({ page }) => {
  await page.goto('/login.html');
  await page.getByLabel('Usuario').fill('ana');
  await page.getByLabel('Clave').fill('curso123');
  await page.getByRole('button', { name: 'Entrar' }).click();
  await expect(page.getByRole('heading', { name: 'Mis notas' })).toBeVisible();
  // Guarda cookies y localStorage del navegador en un fichero
  await page.context().storageState({ path: '.auth/ana.json' });
});
```

Después, la configuración con dos proyectos. Sustituye `playwright.config.js` por:

```js
// Configuración en paralelo, con sesión iniciada una vez (proyecto «setup»)
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  workers: 4,
  reporter: [['list', { printSteps: true }]],
  outputDir: './test-results',
  use: {
    baseURL: 'http://localhost:3503',
  },
  projects: [
    // 1) Inicia sesión una vez y guarda las cookies en .auth/ana.json
    { name: 'setup', testMatch: /.*\.setup\.js/ },
    // 2) Las pruebas arrancan ya con esa sesión
    {
      name: 'chromium',
      testMatch: /.*\.spec\.js/,
      dependencies: ['setup'],
      use: { storageState: '.auth/ana.json' },
    },
  ],
  webServer: {
    command: 'node app/server.mjs',
    url: 'http://localhost:3503/login.html',
    reuseExistingServer: true,
  },
});
```

En `tests/notas.spec.js`, el `beforeEach` ya no inicia sesión: solo abre la página. Sustituye el
`beforeEach` entero (con su comentario) por:

```js
// La sesión llega en storageState: antes de cada prueba solo se abre la página
test.beforeEach(async ({ page }) => {
  await page.goto('/notas.html');
});
```

Y en `tests/sesion.spec.js`, que prueba precisamente el login, añade debajo del `import` una línea para
que esas pruebas empiecen **sin** sesión:

```js
// Estas pruebas tratan del inicio de sesión: empiezan SIN la sesión guardada
test.use({ storageState: { cookies: [], origins: [] } });
```

```bash
# La suite con la sesión reutilizada
npx playwright test
```

**Resultado esperado** (los tiempos cambian; extracto):

```text
Running 13 tests using 4 workers

  ✓   1 [setup] › tests/auth.setup.js:4:1 › iniciar sesión como ana (988ms)
     2.1 [chromium] › tests/notas.spec.js:24:1 › marcar una nota la deja como hecha › preparar datos por la interfaz (325ms)
  ✓   2 [chromium] › tests/notas.spec.js:24:1 › marcar una nota la deja como hecha (825ms)
…
  13 passed (5.0s)
```

Una prueba más (la de `setup`) y ningún paso `iniciar sesión por la interfaz` en las de notas. El fichero
guardado es la sesión de `ana`:

```bash
# Qué se ha guardado (el valor de la cookie es un identificador de sesión)
cat .auth/ana.json
```

```text
{
  "cookies": [
    {
      "name": "sesion",
      "value": "…",
      "domain": "localhost",
      "path": "/",
      "expires": -1,
      "httpOnly": true,
      "secure": false,
      "sameSite": "Lax"
    }
  ],
  "origins": []
}
```

> [!WARNING]
> `.auth/` contiene sesiones válidas: está en `.gitignore` y no se sube al repositorio.

### 5 — Preparar los datos por la API

Para probar que se puede **marcar** una nota, la nota tiene que existir; cómo se creó no es lo que se
prueba. Crear por la API es una petición en lugar de rellenar y esperar un formulario. `page.request`
usa las cookies del navegador de la prueba, así que la petición va con la sesión de `ana`.

En `tests/notas.spec.js`, sustituye la función `crearNotaPorUI` por esta:

```js
// Crear una nota por la API, con las cookies de la sesión del navegador (page.request)
async function crearNotaPorAPI(page, titulo, { hecha = false } = {}) {
  const respuesta = await page.request.post('/api/notas', { data: { titulo } });
  expect(respuesta.status()).toBe(201);
  if (hecha) {
    const { id } = await respuesta.json();
    await page.request.patch(`/api/notas/${id}`, { data: { hecha: true } });
  }
}
```

Y en cada prueba: los datos se crean **antes** de abrir la página (quita el `beforeEach` y pon
`await page.goto('/notas.html');` después del `test.step` de preparar datos). Así queda una:

```js
test('marcar una nota la deja como hecha', async ({ page }) => {
  const titulo = `Llamar al banco ${etiqueta()}`;
  await test.step('preparar datos por la API', async () => {
    await crearNotaPorAPI(page, titulo);
  });
  await page.goto('/notas.html');
  const nota = page.getByRole('listitem').filter({ hasText: titulo });
  await nota.getByRole('checkbox').check();
  await expect(nota).toContainText('Hecha');
});
```

La prueba `una nota nueva aparece como pendiente` sigue creando la nota por la interfaz: ahí crear la
nota **es** lo que se prueba. El fichero completo está en `solucion/tests/notas.spec.js`; puedes copiarlo:

```bash
# Copia las pruebas de notas de la solución (misma ruta relativa)
cp solucion/tests/notas.spec.js tests/notas.spec.js
npx playwright test
```

**Resultado esperado** (los tiempos cambian; extracto):

```text
Running 13 tests using 4 workers

  ✓   1 [setup] › tests/auth.setup.js:4:1 › iniciar sesión como ana (996ms)
     5.1 [chromium] › tests/notas.spec.js:49:1 › borrar una nota la quita de la lista › preparar datos por la API (141ms)
     2.1 [chromium] › tests/notas.spec.js:27:1 › marcar una nota la deja como hecha › preparar datos por la API (143ms)
…
     6.1 [chromium] › tests/notas.spec.js:59:1 › el buscador muestra solo las notas que coinciden › preparar datos por la API (329ms)
…
  ✓  12 [chromium] › tests/sesion.spec.js:14:1 › con una clave incorrecta se muestra un error (943ms)
  ✓  11 [chromium] › tests/sesion.spec.js:6:1 › con la clave correcta se entra a las notas (996ms)

  13 passed (4.2s)
```

Preparar tres notas pasa de 1 s a 329 ms. Las pruebas más lentas son ahora las de `sesion.spec.js`, que
siguen iniciando sesión por la interfaz porque es lo que prueban.

### 6 — Comparar el trabajo, no solo el reloj

Con 4 workers, el tiempo total depende de cuántos núcleos tenga la máquina. Para comparar el **trabajo**
que hace la suite, se mide con un solo worker:

```bash
# La suite optimizada, en serie
npx playwright test --workers=1
```

**Resultado esperado** (los tiempos cambian):

```text
Running 13 tests using 1 worker
…
  13 passed (9.3s)
```

| Cambio | 1 worker | 4 workers |
|--------|----------|-----------|
| Suite de partida | 17,5 s | 5,5 s (solo con `fullyParallel`) |
| + sesión reutilizada | 11,2 s | 5,0 s |
| + datos por API | 9,3 s | 4,2 s |

El paralelismo reduce el reloj; la sesión reutilizada y los datos por API reducen el trabajo, y eso se
nota en cualquier máquina, incluida la de CI.

## Comprueba tu entendimiento

**La sesión llega de verdad**
Borra el fichero de sesión y ejecuta solo las pruebas de notas.

```bash
# Sin sesión guardada; el proyecto setup la vuelve a crear
rm -rf .auth
npx playwright test notas
```

→ Primero se ejecuta `[setup] › iniciar sesión como ana` y después las nueve pruebas de notas pasan:
`dependencies: ['setup']` garantiza el orden.

**La solución mide lo mismo**
Ejecuta la solución del ejercicio.

```bash
# La suite optimizada de la solución
npx playwright test --config solucion/playwright.config.js
```

→ `13 passed` en un tiempo parecido al tuyo del paso 5.

## Experimenta

**Predice:** con la suite optimizada, ¿qué pasa si subes a 8 workers? ¿Y si bajas a 2?

```bash
# Prueba los dos extremos
npx playwright test --workers=8
npx playwright test --workers=2
```

Compara los totales con el 4,2 s del paso 5. Con 13 pruebas cortas y dos de ~1 s, a partir de cierto
número de workers el total lo marca la prueba más lenta más el arranque del `setup`: añadir workers deja
de ayudar. En un Codespace de 4 núcleos, más workers que núcleos hace que los navegadores compitan por la CPU.

## Reto

### 1 — «Que las de sesión también usen la sesión guardada»

**La situación:** viendo que las pruebas de `sesion.spec.js` son ahora las más lentas, un compañero
propone quitarles el `test.use({ storageState: { cookies: [], origins: [] } })` «para que vayan igual de
rápido que las demás».

**Qué haces:** comenta esa línea en `tests/sesion.spec.js` y ejecuta solo ese fichero.

```bash
# Solo las pruebas de inicio de sesión
npx playwright test sesion
```

**Pistas:** piensa qué comprueba cada una de las tres pruebas y en qué estado empieza el navegador con la
sesión de `ana` cargada.

**Lo que buscas:** decidir qué pruebas pueden empezar con sesión y cuáles no, y por qué.

<details>
<summary>Ver solución</summary>

```text
Running 4 tests using 3 workers

  ✓  1 [setup] › tests/auth.setup.js:4:1 › iniciar sesión como ana (993ms)
  ✓  2 [chromium] › tests/sesion.spec.js:6:1 › con la clave correcta se entra a las notas (1.0s)
  ✓  3 [chromium] › tests/sesion.spec.js:14:1 › con una clave incorrecta se muestra un error (997ms)
  ✘  4 [chromium] › tests/sesion.spec.js:22:1 › sin sesión, la página de notas lleva al login (5.1s)

  1) [chromium] › tests/sesion.spec.js:22:1 › sin sesión, la página de notas lleva al login ────────

    Error: expect(page).toHaveURL(expected) failed

    Expected pattern: /login\.html/
    Received string:  "http://localhost:3503/notas.html"
```

La prueba «sin sesión» ya no prueba lo que dice: el navegador **tiene** sesión y la página de notas no
redirige. Las otras dos siguen pasando, pero tampoco ganan tiempo: rellenan el login igual, porque eso es
lo que prueban. Vuelve a dejar la línea sin comentar.

**La regla:** se optimiza la preparación de lo que **no** se prueba; lo que es objeto de la prueba se
hace como lo haría el usuario, aunque cueste más.

</details>

## Errores frecuentes

| Síntoma | Causa probable | Cómo arreglarlo |
|---------|----------------|-----------------|
| `Error: listen EADDRINUSE` en el puerto 3503 | La aplicación sigue arrancada desde otra terminal con otro código | Para esa terminal (`Ctrl+C`); con la misma app, `reuseExistingServer: true` la reutiliza |
| Las pruebas de notas acaban en `login.html` | El proyecto `chromium` no tiene `use: { storageState: … }` o la sesión caducó (se reinició la app) | Revisa el proyecto; borra `.auth/` para regenerar la sesión |
| En paralelo, una búsqueda encuentra notas de otra prueba | Se buscó un texto sin la etiqueta de la prueba | Incluye la etiqueta (`${e}`) en el texto que buscas o filtra por ella |
| `Running 12 tests using 2 workers` aunque pidas más | Sin `fullyParallel`, se reparten ficheros | Añade `fullyParallel: true` o `--fully-parallel` |

## Conclusiones

### Qué hace lenta una suite

El tiempo de una prueba es la suma de lo que prueba, lo que prepara y lo que espera su turno. En la
suite de partida, el login repetido y los formularios de preparación eran más de la mitad del trabajo, y
el único worker ponía en fila todo lo demás.

### Cómo debe ser

| Requisito | En el lab |
|-----------|-----------|
| Cada prueba prepara solo lo que necesita, por el camino más corto | Notas por `page.request`: 3 notas en 329 ms en vez de 1 s |
| Lo común se hace una vez | Un login en `setup` en lugar de nueve |
| Las pruebas pueden correr en cualquier orden y a la vez | Títulos con etiqueta propia; `fullyParallel: true` sin fallos |
| Lo que se prueba se hace como el usuario | `sesion.spec.js` sin sesión; «una nota nueva» por el formulario |
| Se mide antes y después | 17,5 s → 4,2 s (4 workers); 17,5 s → 9,3 s de trabajo (1 worker) |

### Dónde se rompe y cómo lo has detectado

| Fallo | Cómo lo has visto | Qué provoca |
|-------|-------------------|-------------|
| Workers sin `fullyParallel` | `using 2 workers` con 4 pedidos; 16,0 s | Un fichero grande sigue en serie |
| Sesión compartida donde se prueba el login | `Received string: ".../notas.html"` | Una prueba que pasa por la razón equivocada o falla |
| Paralelismo con [datos compartidos](../glosario/05-calidad-e-ia.md#aislamiento-de-datos) | (Lo evitan las etiquetas; sin ellas, fallos como en M05-01) | [Pruebas inestables](../glosario/05-calidad-e-ia.md#flaky-test) |

### Cómo se perfecciona

En un proyecto real se mide en el pipeline (el reporter HTML y el JSON dan la duración de cada prueba),
se reparten las pruebas entre máquinas con `--shard=1/4`, se crea un usuario por worker cuando las pruebas
modifican datos de cuenta, y la preparación por API o directamente en la base de datos se encapsula en
[fixtures](../glosario/02-e2e.md#fixture) reutilizables.

### En una frase

> 🔑 Una [suite rápida](../glosario/04-ci-cd.md#suite-rapida-y-nocturna) no hace en cada prueba lo que no está probando: comparte la sesión, prepara los
> datos por la API y deja al paralelismo solo lo que queda.
