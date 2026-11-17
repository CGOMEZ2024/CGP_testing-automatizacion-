# Lab — Navegación web

[← Página anterior](00-playwright-y-cypress.md) · [Siguiente página →](02-lab-selectores-estables.md)

En este lab practicas la **navegación con [Playwright](../glosario/02-e2e.md#playwright) y las [aserciones](../glosario/01-fundamentos.md#asercion) web-first** con un sitio de tres
páginas (Inicio, Catálogo y Contacto) en `ejercicios/M02-01-navegacion-web/`. El catálogo pide sus
productos a una API que tarda 300 ms y, cuando llegan, cambia el título de la pestaña: una prueba que
lee el título «de una vez» falla; una que lo espera, pasa.

### Objetivo

Comprender qué es una [aserción web-first](../glosario/02-e2e.md#asercion-web-first) al navegar por un sitio: cómo funciona, cómo debe ser, cómo
se detectan sus debilidades y cómo se mejora.

### Punto de partida

- Codespace del curso abierto (`npm run verificar` termina en `Entorno listo`).
- Ejercicio: `ejercicios/M02-01-navegacion-web/`, con el sitio en `app/` y dos pruebas en
  `tests/navegacion.spec.js` (una pasa, otra falla).
- La aplicación escucha en el puerto **3201**; Playwright la arranca solo al lanzar las pruebas (`webServer`).

```bash
# Entra en la carpeta del ejercicio
cd ejercicios/M02-01-navegacion-web
```

### Qué está pasando

Una prueba **[end-to-end](../glosario/01-fundamentos.md#prueba-end-to-end)** de navegación hace lo que haría una persona: abre una URL, pulsa enlaces y
comprueba que ha llegado a donde esperaba. En un proyecto real es la primera red de seguridad de un
sitio: un enlace roto, una ruta renombrada o una página que ya no carga se detectan antes de que lo
note un cliente.

La dificultad es que una página web **no está quieta**: el HTML llega, después los scripts piden
datos y la página cambia. Playwright resuelve esto con dos piezas:

| Pieza | Qué hace | Ejemplo |
|-------|----------|---------|
| **Acción** con [espera automática](../glosario/02-e2e.md#espera-automatica) | Antes de pulsar o escribir, espera a que el elemento exista, sea visible y esté habilitado | `await page.getByRole('link', { name: 'Contacto' }).click()` |
| **Aserción web-first** | Repite la comprobación hasta que se cumple o pasan 5 s | `await expect(page).toHaveTitle('Catálogo (3 productos)')` |
| Aserción «de una vez» | Lee un valor ahora y lo compara; no reintenta | `expect(await page.title()).toBe('…')` |

### 1 — Arrancar el sitio y mirarlo en crudo

Antes de automatizar una navegación conviene ver qué hay: las páginas, sus enlaces y la API de la que
dependen. Arranca la aplicación a mano y pregunta a la API.

```bash
# Terminal 1: arranca el sitio (Ctrl+C para pararlo al terminar este paso)
node app/server.mjs
```

```bash
# Terminal 2: la API de productos que usa el catálogo
curl -s http://localhost:3201/api/productos
```

**Resultado esperado:**

```text
Aplicación en http://localhost:3201
```

```text
["Teclado","Ratón","Monitor"]
```

Abre el puerto 3201 desde la pestaña **Ports** y navega por **Inicio**, **Catálogo** y **Contacto**.
En el catálogo verás «Cargando productos…» un instante antes de la lista. Abre
[`app/public/catalogo.html`](../../ejercicios/M02-01-navegacion-web/app/public/catalogo.html) en el
editor: el `<title>` del HTML es `Catálogo`, y el script lo cambia a `Catálogo (3 productos)` cuando
llega la respuesta. Para la aplicación con **Ctrl+C** en la terminal 1.

### 2 — Leer las pruebas de partida

Abre [`tests/navegacion.spec.js`](../../ejercicios/M02-01-navegacion-web/tests/navegacion.spec.js):

```js
// Pruebas de navegación del sitio de tres páginas (M02-01)
import { test, expect } from '@playwright/test';

test('la portada se carga', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle('Inicio · Sitio de prueba');
  await expect(page.getByRole('heading', { name: 'Bienvenida' })).toBeVisible();
});

test('el catálogo anuncia cuántos productos hay', async ({ page }) => {
  await page.goto('/catalogo.html');
  // Lee el título UNA vez y lo compara: si aún no ha cambiado, falla
  expect(await page.title()).toBe('Catálogo (3 productos)');
});

// Paso 4: escribe aquí la prueba «recorre las tres páginas»
```

`page.goto('/')` abre `http://localhost:3201/` porque `playwright.config.js` define
`baseURL: 'http://localhost:3201'`. La primera prueba usa aserciones web-first (`await expect(...)`);
la segunda, una aserción «de una vez».

### 3 — Ejecutar las pruebas

Lanza la suite tal como está para ver cuál de las dos formas aguanta una página que cambia.

```bash
# Ejecuta las pruebas (Playwright arranca la aplicación con webServer)
npx playwright test
```

**Resultado esperado** (los tiempos cambian en cada ejecución):

```text
Running 2 tests using 1 worker

  ✓  1 [chromium] › tests/navegacion.spec.js:4:1 › la portada se carga (274ms)
  ✘  2 [chromium] › tests/navegacion.spec.js:10:1 › el catálogo anuncia cuántos productos hay (161ms)


  1) [chromium] › tests/navegacion.spec.js:10:1 › el catálogo anuncia cuántos productos hay ────────

    Error: expect(received).toBe(expected) // Object.is equality

    Expected: "Catálogo (3 productos)"
    Received: "Catálogo"

      11 |   await page.goto('/catalogo.html');
      12 |   // Lee el título UNA vez y lo compara: si aún no ha cambiado, falla
    > 13 |   expect(await page.title()).toBe('Catálogo (3 productos)');
         |                              ^
      14 | });

  1 failed
    [chromium] › tests/navegacion.spec.js:10:1 › el catálogo anuncia cuántos productos hay ─────────
  1 passed (1.6s)
```

`page.goto` termina cuando la página ha cargado (evento `load`), pero la API tarda 300 ms más.
`page.title()` lee el título en ese instante («Catálogo») y `toBe` lo compara una sola vez. La
aplicación no tiene ningún error: la prueba ha mirado demasiado pronto.

### 4 — Cambiar a una aserción web-first

Sustituye las dos últimas líneas de la segunda prueba por una aserción sobre la página, que
Playwright repite hasta que el título coincide:

```js
  // Aserción web-first: reintenta hasta que el título coincide (o se agota el tiempo)
  await expect(page).toHaveTitle('Catálogo (3 productos)');
```

```bash
# Vuelve a ejecutar
npx playwright test
```

**Resultado esperado:**

```text
Running 2 tests using 1 worker

  ✓  1 [chromium] › tests/navegacion.spec.js:4:1 › la portada se carga (309ms)
  ✓  2 [chromium] › tests/navegacion.spec.js:10:1 › el catálogo anuncia cuántos productos hay (543ms)

  2 passed (2.3s)
```

La prueba del catálogo tarda ahora algo más de 300 ms: es lo que ha esperado al título. No hay
ninguna pausa fija en el código; el `await` está **fuera** de `expect`, en la aserción completa.

### 5 — Primer clic: pulsar «Catálogo»

Empieza la prueba de navegación. Sustituye el comentario `// Paso 4: escribe aquí…` por una prueba
que abre la portada y pulsa el enlace **Catálogo**:

```js
test('recorre las tres páginas', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: 'Catálogo' }).click();
});
```

```bash
# Ejecuta las pruebas
npx playwright test
```

**Resultado esperado** (extracto):

```text
  ✘  3 [chromium] › tests/navegacion.spec.js:16:1 › recorre las tres páginas (136ms)

    Error: locator.click: Error: strict mode violation: getByRole('link', { name: 'Catálogo' }) resolved to 2 elements:
        1) <a href="/catalogo.html">Catálogo</a> aka getByRole('link', { name: 'Catálogo', exact: true })
        2) <a href="/catalogo.html">Ver el catálogo</a> aka getByRole('link', { name: 'Ver el catálogo' })

    Call log:
      - waiting for getByRole('link', { name: 'Catálogo' })

  1 failed
    [chromium] › tests/navegacion.spec.js:16:1 › recorre las tres páginas ──────────────────────────
  2 passed (1.3s)
```

El nombre `'Catálogo'` se busca **sin distinguir mayúsculas y como subcadena**, y la portada tiene
dos enlaces que lo contienen: el del menú y «Ver el catálogo». Playwright trabaja en **modo
estricto**: si un [localizador](../glosario/02-e2e.md#localizador) encuentra varios elementos para una acción, se niega a elegir uno. Te
avisa y te propone localizadores únicos (`aka …`).

### 6 — Acotar al menú y comprobar la URL

Localiza primero el menú (`<nav aria-label="Principal">`) y busca el enlace dentro. Después comprueba
la URL y que el catálogo muestra sus tres productos. Sustituye la prueba del paso 5 por esta:

```js
test('recorre las tres páginas', async ({ page }) => {
  await page.goto('/');

  // Inicio → Catálogo por el menú
  const menu = page.getByRole('navigation', { name: 'Principal' });
  await menu.getByRole('link', { name: 'Catálogo' }).click();
  await expect(page).toHaveURL(/\/catalogo\.html$/);
  await expect(page.getByRole('listitem')).toHaveCount(3);
});
```

```bash
# Ejecuta las pruebas
npx playwright test
```

**Resultado esperado:**

```text
Running 3 tests using 1 worker

  ✓  1 [chromium] › tests/navegacion.spec.js:4:1 › la portada se carga (116ms)
  ✓  2 [chromium] › tests/navegacion.spec.js:10:1 › el catálogo anuncia cuántos productos hay (376ms)
  ✓  3 [chromium] › tests/navegacion.spec.js:16:1 › recorre las tres páginas (491ms)

  3 passed (1.7s)
```

`toHaveURL` acepta una expresión regular: comprueba que la ruta termina en `/catalogo.html` sin atar la
prueba al puerto. `toHaveCount(3)` también es web-first: espera a que la API pinte los tres `<li>`.

### 7 — Llegar a Contacto y volver atrás

Completa el recorrido: del catálogo a **Contacto**, comprueba URL, título y el enlace de correo, y
vuelve con el botón «atrás» del navegador. Añade al final de la prueba, antes del `});`:

```js
  // Catálogo → Contacto
  await menu.getByRole('link', { name: 'Contacto' }).click();
  await expect(page).toHaveURL('/contacto.html');
  await expect(page).toHaveTitle('Contacto · Sitio de prueba');
  await expect(page.getByRole('link', { name: 'hola@example.com' })).toBeVisible();

  // Botón «atrás» del navegador: vuelve al catálogo
  await page.goBack();
  await expect(page).toHaveURL(/catalogo/);
```

```bash
# Ejecuta las pruebas
npx playwright test
```

**Resultado esperado:**

```text
Running 3 tests using 1 worker

  ✓  1 [chromium] › tests/navegacion.spec.js:4:1 › la portada se carga (127ms)
  ✓  2 [chromium] › tests/navegacion.spec.js:10:1 › el catálogo anuncia cuántos productos hay (371ms)
  ✓  3 [chromium] › tests/navegacion.spec.js:16:1 › recorre las tres páginas (1.0s)

  3 passed (2.2s)
```

`toHaveURL('/contacto.html')` usa una ruta relativa: Playwright la completa con la `baseURL`. El fichero
completo está en [`solucion/tests/navegacion.spec.js`](../../ejercicios/M02-01-navegacion-web/solucion/tests/navegacion.spec.js).

```bash
# Ejecuta la solución
npx playwright test --config solucion/playwright.config.js
```

## Comprueba tu entendimiento

**La aserción que no espera**
En la prueba del catálogo, vuelve a poner `expect(await page.title()).toBe('Catálogo (3 productos)')` y ejecuta `npx playwright test -g catálogo`.
→ Falla con `Received: "Catálogo"`: el título se leyó antes de que llegara la API.

**El [modo estricto](../glosario/02-e2e.md#modo-estricto)**
En el paso 6, cambia `menu.getByRole('link', { name: 'Catálogo' })` por `page.getByRole('link', { name: 'Catálogo', exact: true })` y ejecuta.
→ Pasa: con `exact: true` el nombre tiene que coincidir entero y solo hay un enlace así.

## Experimenta

Las aserciones web-first esperan 5 s como máximo. ¿Qué pasa si ese límite es menor que lo que tarda la
API (300 ms)? **Predice** qué pruebas fallarán y con qué mensaje. Después añade en `playwright.config.js`,
debajo de `reporter: 'list',`, esta línea y ejecuta:

```js
  expect: { timeout: 200 },
```

```bash
# Ejecuta con el límite de espera de las aserciones a 200 ms
npx playwright test
```

**Resultado esperado** (extracto):

```text
  ✓  1 [chromium] › tests/navegacion.spec.js:4:1 › la portada se carga (111ms)
  ✘  2 [chromium] › tests/navegacion.spec.js:10:1 › el catálogo anuncia cuántos productos hay (250ms)
  ✘  3 [chromium] › tests/navegacion.spec.js:16:1 › recorre las tres páginas (429ms)

    Error: expect(page).toHaveTitle(expected) failed

    Expected: "Catálogo (3 productos)"
    Received: "Catálogo"
    Timeout:  200ms

    Call log:
      - Expect "toHaveTitle" with timeout 200ms
        8 × locator resolved to <html lang="es">…</html>
          - unexpected value "Catálogo"
  ...
    Error: expect(locator).toHaveCount(expected) failed

    Locator:  getByRole('listitem')
    Expected: 3
    Received: 0
    Timeout:  200ms

  2 failed
  1 passed (2.0s)
```

El `Call log` muestra los [reintentos](../glosario/02-e2e.md#reintento) («8 × locator resolved…»): la aserción ha mirado varias veces y
se ha rendido a los 200 ms. La espera automática no es magia: tiene un límite, y ese límite tiene que ser
mayor que lo que tarda de verdad la aplicación. Quita esa línea y vuelve a ejecutar: todo pasa de nuevo.

## Reto

### 1 — Contar productos sin esperar

**La situación:** un compañero añade una prueba rápida para el catálogo y te dice que «en su
máquina» pasa:

```js
test('el catálogo tiene tres productos', async ({ page }) => {
  await page.goto('/catalogo.html');
  expect(await page.getByRole('listitem').count()).toBe(3);
});
```

**Qué haces:** crea `tests/reto.spec.js` con esa prueba (y el `import` de `test` y `expect`) y ejecútala sola.
Después reescríbela para que sea fiable.

```bash
# Ejecuta solo la prueba del reto
npx playwright test tests/reto.spec.js
```

**Pistas:** `locator.count()` devuelve un número en el instante en que se llama; busca la aserción de
`expect(locator)` que cuenta elementos.

**Lo que buscas:** la prueba falla tal como está y pasa siempre tras tu cambio, sin añadir pausas.

<details>
<summary>Ver solución</summary>

Tal como está:

```text
  ✘  1 [chromium] › tests/reto.spec.js:3:1 › el catálogo tiene tres productos (116ms)

    Error: expect(received).toBe(expected) // Object.is equality

    Expected: 3
    Received: 0

  1 failed
```

Con la aserción web-first:

```js
  await expect(page.getByRole('listitem')).toHaveCount(3);
```

```text
Running 1 test using 1 worker

  ✓  1 [chromium] › tests/reto.spec.js:3:1 › el catálogo tiene tres productos (393ms)

  1 passed (1.1s)
```

`count()` vio 0 elementos porque la lista aún no se había pintado; en una máquina más lenta o con
la API más rápida podría haber visto 3. Ese «a veces sí, a veces no» es justo lo que hace que una
suite deje de ser creíble. **La regla:** todo lo que se compruebe sobre la página va dentro de
`await expect(locator).toX()`; `expect(await …)` solo para valores que ya no van a cambiar.

</details>

## Errores frecuentes

| Síntoma | Causa probable | Cómo arreglarlo |
|---------|----------------|-----------------|
| `Received: "Catálogo"` en una comprobación del título | Aserción «de una vez» (`expect(await page.title())`) antes de que la página termine | `await expect(page).toHaveTitle(...)` |
| `strict mode violation: … resolved to 2 elements` | El localizador encuentra varios elementos (el nombre se busca como subcadena) | Acotar con un contenedor (`menu.getByRole(...)`) o `exact: true` |
| `Timeout: 200ms` y `Received` con el valor antiguo | `expect.timeout` menor que lo que tarda la aplicación | Dejar el valor por defecto (5 s) o ajustarlo al entorno |

## Conclusiones

### Qué es una aserción web-first

Una comprobación sobre la página que Playwright **repite** hasta que se cumple o se agota su tiempo
(5 s por defecto). Junto con la espera automática de las acciones (`click`, `fill`), hace que una
prueba de navegación siga el ritmo real de la página sin pausas escritas a mano.

### Cómo debe ser

| Requisito | En el lab |
|-----------|-----------|
| Cada comprobación sobre la página es web-first | `toHaveTitle`, `toHaveURL`, `toHaveCount`, `toBeVisible` |
| Los localizadores apuntan a un único elemento | El enlace se busca dentro del menú `Principal` |
| Las URL se comprueban sin atarse al entorno | `toHaveURL(/\/catalogo\.html$/)` y rutas relativas a `baseURL` |
| Se recorre el camino que haría una persona | Inicio → Catálogo → Contacto → atrás |

### Dónde se rompe y cómo lo has detectado

| Fallo | Cómo lo has visto | Qué provoca |
|-------|-------------------|-------------|
| Leer un valor antes de tiempo | `Received: "Catálogo"` en el paso 3 y `Received: 0` en el reto | Fallos que dependen de la velocidad de la máquina |
| Localizador ambiguo | `strict mode violation` en el paso 5 | La prueba se para antes de actuar sobre el elemento equivocado |
| Límite de espera menor que la aplicación | `Timeout: 200ms` en Experimenta | Falsos fallos con una aplicación correcta |

### Cómo se perfecciona

En un proyecto real, el límite de espera se ajusta a lo que tarda el entorno donde se ejecutan las
pruebas (CI suele ser más lento que un portátil), y las navegaciones críticas (portada, login, pago) van
en un conjunto pequeño que se ejecuta en cada cambio. Los textos de los enlaces son parte del
contrato: si cambian, la prueba avisa, y eso es deseable.

### En una frase

> 🔑 En una prueba de navegación, el `await` va delante de `expect(...)`, no dentro: la aserción espera a la página y no al revés.
