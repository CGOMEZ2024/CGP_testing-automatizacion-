# Lab — Suite E2E de un flujo

[← Página anterior](07-lab-page-objects.md) · [Siguiente página →](09-lab-flujo-con-cypress.md)

En este lab practicas la **organización de una suite E2E** automatizando el flujo completo de una
tienda mínima (`ejercicios/M02-08-suite-e2e-de-un-flujo/`): login → catálogo → carrito → pedido.
Partes de una única prueba larga que lo hace todo y la conviertes en una suite con `describe`,
`beforeEach`, etiquetas `@smoke`, sesión guardada (`storageState`) y proyectos.

### Objetivo

Comprender cómo se organiza una suite E2E de un flujo: cómo funciona, cómo debe ser, cómo se detectan
sus debilidades y cómo se mejora.

### Punto de partida

- Codespace del curso abierto (`npm run verificar` termina en `Entorno listo`).
- Ejercicio: `ejercicios/M02-08-suite-e2e-de-un-flujo/`, con la tienda en `app/` y una prueba en
  `tests/tienda.spec.js`.
- La tienda escucha en el puerto **3208**. Usuario de prueba: `ana`, contraseña `tienda123`.
- La sesión va en una cookie (`sesion`) y el carrito se guarda en el navegador (`localStorage`).

```bash
# Entra en la carpeta del ejercicio
cd ejercicios/M02-08-suite-e2e-de-un-flujo
```

### Qué está pasando

El flujo de compra es lo que más dinero cuesta si se rompe, así que es lo primero que se automatiza
de punta a punta. La tentación es escribirlo como **una sola prueba larga**: fácil de grabar, difícil
de mantener. Si falla en el carrito, nunca se sabe si el pedido funciona; si el login se rompe, todo
falla con el mismo mensaje.

Una **suite** reparte el flujo en pruebas cortas e independientes, cada una con un objetivo, y añade
lo necesario para ejecutarlas bien:

| Pieza | Para qué | En este lab |
|-------|----------|-------------|
| `test.describe` | Agrupa las pruebas de una funcionalidad | `Tienda`, `Acceso` |
| `test.beforeEach` | Prepara lo común antes de cada prueba | Entrar y quedarse en el catálogo |
| Etiquetas (`tag`) y `--grep` | Elegir qué subconjunto se ejecuta | `@smoke`: lo mínimo para dar por buena una versión |
| `storageState` + proyecto `setup` | Iniciar sesión una vez y reutilizarla | `.auth/ana.json` |
| Proyectos | Configuraciones distintas en la misma ejecución | `setup`, `tienda` (con sesión), `acceso` (sin sesión) |

### 1 — Ejecutar la prueba larga

Abre la tienda (`node app/server.mjs` y el puerto 3208 en **Ports**) y haz una compra a mano. Después
abre [`tests/tienda.spec.js`](../../ejercicios/M02-08-suite-e2e-de-un-flujo/tests/tienda.spec.js): una
sola prueba, `compra completa`, con cuatro bloques comentados (login, catálogo, carrito, pedido). Para
la aplicación (Ctrl+C) y ejecuta la prueba:

```bash
# Ejecuta la prueba de partida (Playwright arranca la tienda)
npx playwright test
```

**Resultado esperado** (los tiempos cambian en cada ejecución):

```text
Running 1 test using 1 worker

  ✓  1 [chromium] › tests/tienda.spec.js:4:1 › compra completa (416ms)

  1 passed (1.2s)
```

Una línea verde que cubre cuatro funcionalidades. Si un día sale roja, el nombre de la prueba no dirá
cuál de ellas se ha roto.

### 2 — Partir el flujo en una suite

Sustituye el contenido de `tests/tienda.spec.js` por una suite: un `describe`, el login en un
`beforeEach` y una prueba por funcionalidad. Una función auxiliar evita repetir el clic de «Añadir al
carrito».

```js
// Pruebas de la tienda (M02-08), organizadas como suite
import { test, expect } from '@playwright/test';

// Añade productos desde el catálogo (la página ya está en el catálogo)
async function anadir(page, ...nombres) {
  for (const nombre of nombres) {
    await page.getByRole('article', { name: nombre }).getByRole('button', { name: 'Añadir al carrito' }).click();
  }
}

test.describe('Tienda', () => {
  // Antes de CADA prueba: login por la interfaz
  test.beforeEach(async ({ page }) => {
    await page.goto('/login.html');
    await page.getByLabel('Usuario').fill('ana');
    await page.getByLabel('Contraseña').fill('tienda123');
    await page.getByRole('button', { name: 'Entrar' }).click();
    await expect(page.getByText('Hola, ana')).toBeVisible();
  });

  test('el catálogo muestra los tres productos', async ({ page }) => {
    await expect(page.getByRole('article')).toHaveCount(3);
  });

  test('añadir actualiza el contador del carrito', async ({ page }) => {
    await anadir(page, 'Taza', 'Taza', 'Gorra');
    await expect(page.getByRole('link', { name: 'Carrito (3)' })).toBeVisible();
  });

  test('el carrito suma el total', async ({ page }) => {
    await anadir(page, 'Taza', 'Gorra');
    await page.getByRole('link', { name: /Carrito/ }).click();
    await expect(page.getByTestId('total')).toHaveText('20,00 €');
  });

  test('confirmar el pedido vacía el carrito', async ({ page }) => {
    await anadir(page, 'Camiseta');
    await page.getByRole('link', { name: /Carrito/ }).click();
    await page.getByRole('button', { name: 'Confirmar pedido' }).click();
    await expect(page.getByRole('status')).toHaveText(/Pedido P-\d{4} confirmado/);
    await expect(page.getByRole('link', { name: 'Carrito (0)' })).toBeVisible();
  });
});
```

```bash
# Ejecuta la suite
npx playwright test
```

**Resultado esperado:**

```text
Running 4 tests using 1 worker

  ✓  1 [chromium] › tests/tienda.spec.js:21:3 › Tienda › el catálogo muestra los tres productos (205ms)
  ✓  2 [chromium] › tests/tienda.spec.js:25:3 › Tienda › añadir actualiza el contador del carrito (271ms)
  ✓  3 [chromium] › tests/tienda.spec.js:30:3 › Tienda › el carrito suma el total (292ms)
  ✓  4 [chromium] › tests/tienda.spec.js:36:3 › Tienda › confirmar el pedido vacía el carrito (324ms)

  4 passed (1.8s)
```

El nombre completo es `Tienda › …`: el `describe` da contexto en el reporte. Cada prueba arranca con un
navegador limpio (carrito vacío) y hace su propio login: **ninguna depende de otra**, así que se pueden
ejecutar solas, en cualquier orden o en paralelo. Las pruebas del carrito y del pedido añaden sus
propios productos en lugar de reutilizar los de una prueba anterior.

### 3 — Etiquetar la suite de humo

No todas las pruebas son igual de urgentes. Las que dicen «la tienda funciona» (se ve el catálogo, se
puede comprar) forman la **[suite de humo](../glosario/01-fundamentos.md#prueba-de-humo)** (*smoke*): se ejecuta en cada cambio y en segundos. Añade la
etiqueta a esas dos pruebas, con el segundo parámetro de `test`:

```js
  test('el catálogo muestra los tres productos', { tag: '@smoke' }, async ({ page }) => {
```

```js
  test('confirmar el pedido vacía el carrito', { tag: '@smoke' }, async ({ page }) => {
```

```bash
# Lista las pruebas sin ejecutarlas
npx playwright test --list
# Solo las de humo
npx playwright test --grep @smoke
# Todas menos las de humo
npx playwright test --grep-invert @smoke
```

**Resultado esperado:**

```text
Listing tests:
  [chromium] › tienda.spec.js:21:3 › Tienda › el catálogo muestra los tres productos
  [chromium] › tienda.spec.js:25:3 › Tienda › añadir actualiza el contador del carrito
  [chromium] › tienda.spec.js:30:3 › Tienda › el carrito suma el total
  [chromium] › tienda.spec.js:36:3 › Tienda › confirmar el pedido vacía el carrito
Total: 4 tests in 1 file
```

```text
Running 2 tests using 1 worker

  ✓  1 [chromium] › tests/tienda.spec.js:21:3 › Tienda › el catálogo muestra los tres productos @smoke (285ms)
  ✓  2 [chromium] › tests/tienda.spec.js:36:3 › Tienda › confirmar el pedido vacía el carrito @smoke (345ms)

  2 passed (1.4s)
```

```text
Running 2 tests using 1 worker

  ✓  1 [chromium] › tests/tienda.spec.js:25:3 › Tienda › añadir actualiza el contador del carrito (307ms)
  ✓  2 [chromium] › tests/tienda.spec.js:30:3 › Tienda › el carrito suma el total (291ms)

  2 passed (1.2s)
```

`--grep` filtra por título **y** etiquetas; las etiquetas aparecen al final del nombre en el reporte.
`--list` es útil para comprobar qué hay en la suite antes de lanzarla.

### 4 — Iniciar sesión una vez: proyecto `setup`

Cada prueba repite el login por la interfaz. En una suite de cien pruebas son cien logins que no
prueban nada nuevo. [Playwright](../glosario/02-e2e.md#playwright) puede iniciar sesión **una vez** en un proyecto `setup`, guardar
cookies y `localStorage` en un fichero y cargarlo en las demás pruebas.

Crea `tests/auth.setup.js`:

```js
// Setup de M02-08: inicia sesión UNA vez y guarda cookies y localStorage para el resto de pruebas
import { test as setup, expect } from '@playwright/test';

const SESION = `${import.meta.dirname}/../.auth/ana.json`;

setup('inicia sesión como ana', async ({ page }) => {
  await page.goto('/login.html');
  await page.getByLabel('Usuario').fill('ana');
  await page.getByLabel('Contraseña').fill('tienda123');
  await page.getByRole('button', { name: 'Entrar' }).click();
  await expect(page.getByText('Hola, ana')).toBeVisible();
  await page.context().storageState({ path: SESION });
});
```

En `tests/tienda.spec.js`, el `beforeEach` ya no inicia sesión: la sesión llega cargada. Sustitúyelo por:

```js
  // La sesión ya viene en el storageState del proyecto: se empieza en el catálogo
  test.beforeEach(async ({ page }) => {
    await page.goto('/catalogo.html');
    await expect(page.getByText('Hola, ana')).toBeVisible();
  });
```

### 5 — Proyectos: con sesión y sin sesión

El login también hay que probarlo, pero **sin** sesión guardada. Crea `tests/acceso.spec.js` con las
pruebas de acceso copiándolo de
[`solucion/tests/acceso.spec.js`](../../ejercicios/M02-08-suite-e2e-de-un-flujo/solucion/tests/acceso.spec.js)
(login correcto `@smoke`, contraseña incorrecta y catálogo sin sesión). Después, en `playwright.config.js`,
define la ruta de la sesión antes de `export default`:

```js
const SESION = `${import.meta.dirname}/.auth/ana.json`;   // cookie de sesión guardada por el setup
```

Y sustituye la lista `projects` por tres proyectos:

```js
  projects: [
    { name: 'setup', testMatch: /.*\.setup\.js/ },
    {
      name: 'tienda',
      testMatch: /tienda\.spec\.js/,
      dependencies: ['setup'],                         // antes, ejecuta el proyecto setup
      use: { ...devices['Desktop Chrome'], storageState: SESION },
    },
    { name: 'acceso', testMatch: /acceso\.spec\.js/, use: { ...devices['Desktop Chrome'] } },
  ],
```

```bash
# Ejecuta toda la suite
npx playwright test
```

**Resultado esperado:**

```text
Running 8 tests using 2 workers

  ✓  1 [setup] › tests/auth.setup.js:6:1 › inicia sesión como ana (238ms)
  ✓  2 [acceso] › tests/acceso.spec.js:9:3 › Acceso › entra con usuario y contraseña correctos @smoke (242ms)
  ✓  3 [acceso] › tests/acceso.spec.js:17:3 › Acceso › rechaza una contraseña incorrecta (151ms)
  ✓  4 [acceso] › tests/acceso.spec.js:24:3 › Acceso › sin sesión, el catálogo devuelve al login (81ms)
  ✓  5 [tienda] › tests/tienda.spec.js:18:3 › Tienda › el catálogo muestra los tres productos @smoke (108ms)
  ✓  6 [tienda] › tests/tienda.spec.js:22:3 › Tienda › añadir actualiza el contador del carrito (209ms)
  ✓  7 [tienda] › tests/tienda.spec.js:27:3 › Tienda › el carrito suma el total (202ms)
  ✓  8 [tienda] › tests/tienda.spec.js:33:3 › Tienda › confirmar el pedido vacía el carrito @smoke (236ms)

  8 passed (2.4s)
```

| Proyecto | Qué ejecuta | Con sesión |
|----------|-------------|------------|
| `setup` | `auth.setup.js`: un login y guarda `.auth/ana.json` | Lo crea |
| `tienda` | `tienda.spec.js`, después de `setup` | Sí, cargada de `.auth/ana.json` |
| `acceso` | `acceso.spec.js` | No |

Las pruebas de la tienda bajan de unos 200–300 ms a 100–240 ms: ya no pasan por el formulario de login.

### 6 — Mirar la sesión guardada

Abre `.auth/ana.json` en el editor. Contiene la cookie `sesion` del dominio `localhost`, marcada como
`httpOnly`, y la lista `origins` vacía (el carrito aún no tenía nada en `localStorage` al guardar).

> [!WARNING]
> El fichero de sesión es una **credencial**: quien lo tenga entra como `ana`. Por eso la carpeta
> `.auth/` está en `.gitignore` y no se sube al repositorio.

La solución completa está en [`solucion/`](../../ejercicios/M02-08-suite-e2e-de-un-flujo/solucion/).

```bash
# Ejecuta la solución
npx playwright test --config solucion/playwright.config.js
```

## Comprueba tu entendimiento

**Las dependencias entre proyectos**
Ejecuta solo el proyecto de la tienda: `npx playwright test --project tienda`.
→ `Running 5 tests`: Playwright ejecuta antes el proyecto `setup` porque `tienda` depende de él.

**Proyecto sin dependencias**
Ejecuta `npx playwright test --project acceso`.
→ `Running 3 tests`, sin `setup`: estas pruebas no necesitan sesión.

## Experimenta

**Predice** qué pruebas entran en la suite de humo ahora que hay tres proyectos, y si se ejecuta el
`setup` aunque no tenga la etiqueta `@smoke`:

```bash
# La suite de humo con proyectos
npx playwright test --grep @smoke
```

**Resultado esperado:**

```text
Running 4 tests using 2 workers

  ✓  2 [setup] › tests/auth.setup.js:6:1 › inicia sesión como ana (232ms)
  ✓  1 [acceso] › tests/acceso.spec.js:9:3 › Acceso › entra con usuario y contraseña correctos @smoke (239ms)
  ✓  3 [tienda] › tests/tienda.spec.js:18:3 › Tienda › el catálogo muestra los tres productos @smoke (93ms)
  ✓  4 [tienda] › tests/tienda.spec.js:33:3 › Tienda › confirmar el pedido vacía el carrito @smoke (239ms)

  4 passed (1.6s)
```

Tres pruebas de humo (dos de la tienda y el login) y el `setup`: las dependencias de un proyecto se
ejecutan siempre que haga falta alguna de sus pruebas, aunque el filtro no las seleccione.

## Reto

### 1 — Una comprobación de humo más

**La situación:** en producción alguien consiguió enviar un pedido vacío. El equipo ha desactivado el
botón **Confirmar pedido** cuando el carrito está vacío y quiere que la suite de humo lo vigile.

**Qué haces:** añade a la suite `Tienda` una prueba etiquetada `@smoke` que va al carrito vacío y
comprueba que el total es `0,00 €` y que el botón está desactivado. Ejecuta la suite de humo.

**Pistas:** con la sesión cargada, la cabecera muestra el enlace **Carrito (0)**; la [aserción](../glosario/01-fundamentos.md#asercion) para un
botón desactivado es `toBeDisabled()`.

**Lo que buscas:** cinco pruebas en la suite de humo (con el `setup`), todas en verde.

<details>
<summary>Ver solución</summary>

Dentro del `describe('Tienda', …)`:

```js
  test('con el carrito vacío no se puede confirmar', { tag: '@smoke' }, async ({ page }) => {
    await page.getByRole('link', { name: 'Carrito (0)' }).click();
    await expect(page.getByTestId('total')).toHaveText('0,00 €');
    await expect(page.getByRole('button', { name: 'Confirmar pedido' })).toBeDisabled();
  });
```

```bash
npx playwright test --grep @smoke
```

```text
Running 5 tests using 2 workers

  ✓  2 [setup] › tests/auth.setup.js:6:1 › inicia sesión como ana (213ms)
  ✓  1 [acceso] › tests/acceso.spec.js:9:3 › Acceso › entra con usuario y contraseña correctos @smoke (226ms)
  ✓  3 [tienda] › tests/tienda.spec.js:18:3 › Tienda › el catálogo muestra los tres productos @smoke (97ms)
  ✓  4 [tienda] › tests/tienda.spec.js:33:3 › Tienda › confirmar el pedido vacía el carrito @smoke (242ms)
  ✓  5 [tienda] › tests/tienda.spec.js:41:3 › Tienda › con el carrito vacío no se puede confirmar @smoke (133ms)

  5 passed (1.7s)
```

La prueba confía en que cada prueba empieza con el carrito vacío: el `storageState` se guardó con
`localStorage` vacío y cada prueba recibe su propia copia, así que los productos que añade otra prueba
no le llegan. **La regla:** una prueba de la suite prepara su propio estado (o lo recibe de una [fixture](../glosario/02-e2e.md#fixture)
o un `setup`) y nunca depende de lo que dejó otra.

</details>

## Errores frecuentes

| Síntoma | Causa probable | Cómo arreglarlo |
|---------|----------------|-----------------|
| Las pruebas de la tienda fallan al leer `.auth/ana.json` (no existe) | El proyecto `tienda` no depende de `setup`, o el `setup` no se ha ejecutado | `dependencies: ['setup']` en el proyecto |
| Las pruebas de acceso ven la sesión iniciada | El proyecto `acceso` usa también `storageState` | Dejar `acceso` sin `storageState` |
| Una prueba pasa sola y falla con las demás | Depende del estado que deja otra (carrito, pedido) | Que cada prueba prepare sus datos en su cuerpo o en `beforeEach` |
| `--grep @smoke` no encuentra pruebas | Etiqueta escrita sin `@` o en otro parámetro | `{ tag: '@smoke' }` como segundo parámetro de `test` |

## Conclusiones

### Qué es una suite E2E organizada

Un flujo de negocio repartido en pruebas cortas e independientes, agrupadas con `describe`, con la
preparación común en `beforeEach` y en un proyecto `setup`, etiquetadas para poder ejecutar solo la
parte urgente y separadas en proyectos cuando necesitan condiciones distintas (con o sin sesión).

### Cómo debe ser

| Requisito | En el lab |
|-----------|-----------|
| Una prueba, una funcionalidad | 4 pruebas de tienda y 3 de acceso en lugar de `compra completa` |
| Pruebas independientes | Cada una añade sus productos; carrito vacío al empezar |
| Preparación común fuera de las pruebas | `beforeEach` en el catálogo; login una vez en `setup` |
| Subconjuntos ejecutables | `@smoke` con `--grep` y `--grep-invert` |
| Condiciones distintas en proyectos | `tienda` con `storageState`, `acceso` sin él |
| Credenciales fuera del repositorio | `.auth/` en `.gitignore` |

### Dónde se rompe y cómo lo has detectado

| Fallo | Cómo lo has visto | Qué provoca |
|-------|-------------------|-------------|
| Prueba monolítica | `compra completa`: una línea para cuatro funcionalidades | Un fallo no dice qué se ha roto y oculta lo de después |
| Login repetido | `beforeEach` con login en cada prueba del paso 2 | Suites lentas que prueban el login cien veces |
| Dependencias entre pruebas | El reto: el carrito vacío solo es fiable porque cada prueba tiene su copia | Pruebas que fallan según el orden |

### Cómo se perfecciona

En un proyecto real, la suite de humo va en cada push y la completa en el pull request o por la noche
(se ve en M04 con GitHub Actions). Los datos de partida se crean por API en lugar de por la interfaz, y
cada usuario de prueba tiene su propio `setup` cuando hay varios roles.

### En una frase

> 🔑 Un flujo E2E se automatiza como suite: pruebas cortas e independientes, la preparación fuera, la [sesión reutilizada](../glosario/05-calidad-e-ia.md#storage-state) y etiquetas para saber qué ejecutar en cada momento.
