# Lab — Depurar con IA

[← Página anterior](05-lab-generar-pruebas-con-copilot.md)

Practicas la **[depuración asistida](../glosario/05-calidad-e-ia.md#depuracion-asistida) por IA** con la ficha de un producto de una tienda y tres pruebas de
[Playwright](../glosario/02-e2e.md#playwright) escritas para su versión anterior. Las tres fallan. Le das a
[GitHub Copilot](../glosario/05-calidad-e-ia.md#github-copilot) el error y el contexto que Playwright
guarda de cada fallo, validas su diagnóstico ejecutando y contrastando con el registro de cambios, y
después le pides que refactorice las pruebas a un [Page Object](../glosario/02-e2e.md#page-object), comprobando que la suite sigue en verde y
comprueba lo mismo.

### Objetivo

Comprender qué es la depuración asistida por IA: cómo funciona, cómo debe validarse lo que propone, cómo
se detectan sus diagnósticos equivocados y cómo se aprovecha sin perder el control de la suite.

### Punto de partida

- Codespace del curso abierto, con la extensión **GitHub Copilot Chat** activa.
- Terminal en la carpeta del ejercicio
  [`ejercicios/M05-06-depurar-con-ia/`](../../ejercicios/M05-06-depurar-con-ia/README.md).
- Aplicación `app/server.mjs` en el puerto 3506 (la arranca Playwright), ya en su **versión 2**.
  `app/CAMBIOS.md` dice qué cambió respecto a la versión 1.
- La solución está en `solucion/` (pruebas corregidas y con Page Object).

```bash
# Entra en la carpeta del ejercicio
cd ejercicios/M05-06-depurar-con-ia
```

### Qué está pasando

Cuando una prueba E2E se rompe, la pregunta no es solo «¿cómo hago que pase?», sino «¿quién tiene razón,
la prueba o la aplicación?». Copilot es muy bueno con la primera: lee el error, ve la página y propone el
cambio que la hace pasar. La segunda la decide el requisito, que el asistente no conoce si no se lo das.
Si aceptas sin validar, puedes «arreglar» una prueba cambiando lo que espera hasta que coincida con un error real.

| Pieza | Qué es |
|-------|--------|
| `app/public/producto.html` | Ficha de «Auriculares Pro»: precio, **Cantidad**, botón **Añadir al carrito**, carrito con artículos y total |
| `app/CAMBIOS.md` | El registro de cambios de la versión 2: lo que el equipo de producto decidió |
| `tests/tienda.spec.js` | Tres pruebas de la versión 1 |
| `playwright.config.js` | `trace: 'retain-on-failure'` y `actionTimeout: 5_000` (un clic que no encuentra su botón falla a los 5 s) |

### 1 — Ejecutar y ver qué falla

```bash
# Las tres pruebas de la versión 1 contra la versión 2
npx playwright test
```

**Resultado esperado** (los tiempos cambian; extracto):

```text
Running 3 tests using 1 worker

  ✘  1 tests/tienda.spec.js:5:1 › muestra el nombre y el precio del producto (5.2s)
  ✘  2 tests/tienda.spec.js:11:1 › añadir al carrito suma un artículo (5.2s)
  ✘  3 tests/tienda.spec.js:17:1 › el total multiplica el precio por la cantidad (5.2s)


  1) tests/tienda.spec.js:5:1 › muestra el nombre y el precio del producto ─────────────────────────

    Error: expect(locator).toHaveText(expected) failed

    Locator:  getByTestId('precio')
    Expected: "59,90 €"
    Received: "64,90 €"
    Timeout:  5000ms
…
    Error Context: test-results/tienda-muestra-el-nombre-y-el-precio-del-producto/error-context.md
…
  2) tests/tienda.spec.js:11:1 › añadir al carrito suma un artículo ────────────────────────────────

    TimeoutError: locator.click: Timeout 5000ms exceeded.
    Call log:
      - waiting for getByRole('button', { name: 'Comprar' })
…
    Error Context: test-results/tienda-añadir-al-carrito-suma-un-artículo/error-context.md
…
  3 failed
```

Dos tipos de fallo: un **dato** distinto del esperado (prueba 1) y un **[localizador](../glosario/02-e2e.md#localizador)** que no encuentra
nada (pruebas 2 y 3). La prueba 3 no ha llegado a su [aserción](../glosario/01-fundamentos.md#asercion): falla antes, en el clic.

### 2 — Mirar el contexto que guarda Playwright

Antes de preguntar a nadie, mira la fuente. Abre en el editor el fichero
`test-results/tienda-añadir-al-carrito-suma-un-artículo/error-context.md`:

```markdown
# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Error details

TimeoutError: locator.click: Timeout 5000ms exceeded.
Call log:
  - waiting for getByRole('button', { name: 'Comprar' })

# Page snapshot

- generic [active] [ref=e1]:
  - main [ref=e2]:
    - heading "Auriculares Pro" [level=1] [ref=e3]
    - paragraph [ref=e4]: "Precio: 64,90 €"
    - generic [ref=e5]:
      - text: Cantidad
      - spinbutton "Cantidad" [ref=e6]: "1"
    - button "Añadir al carrito" [ref=e7]
  - complementary "Carrito" [ref=e8]:
    - paragraph [ref=e9]: "Artículos: 0"
    - paragraph [ref=e10]: "Total: 0,00 €"

# Test source
…
> 13 |   await page.getByRole('button', { name: 'Comprar' }).click();
     |                                                       ^ TimeoutError: locator.click: Timeout 5000ms exceeded.
…
```

| Sección | Qué aporta |
|---------|-----------|
| `Instructions` | Playwright lo escribe pensando en un asistente de IA: es un prompt listo |
| `Page snapshot` | El árbol de accesibilidad de la página en el momento del fallo: hay un `button "Añadir al carrito"` y ningún «Comprar» |
| `Test source` | La línea que falló, marcada |

Con esto ya se ve la causa del localizador. El mismo estado, con capturas y red, está en la traza
(`npx playwright show-trace --host 0.0.0.0 --port 9323 test-results/tienda-añadir-al-carrito-suma-un-artículo/trace.zip`
y la pestaña **Ports**).

### 3 — Pedir el diagnóstico a Copilot

Le das a Copilot el contexto del fallo y la prueba.

1. Abre `tests/tienda.spec.js`, selecciona la línea 13 y pulsa `Ctrl+I` (chat en línea).
2. Escribe `/fix` seguido de `#file:` y elige el `error-context.md` de la prueba 2:

```text
/fix #file:test-results/tienda-añadir-al-carrito-suma-un-artículo/error-context.md
```

Si prefieres la vista de Chat (`Ctrl+Alt+I`, modo **Ask**): pulsa **Add Context…**, añade
`tests/tienda.spec.js` y el `error-context.md`, y escribe «¿Por qué falla esta prueba y cómo la arreglo?».

**Ejemplo de respuesta** (la tuya será distinta):

```text
La prueba busca un botón con el nombre accesible «Comprar», pero en el snapshot de la página
el botón se llama «Añadir al carrito». Actualiza el localizador:

  await page.getByRole('button', { name: 'Añadir al carrito' }).click();

El mismo localizador aparece en la prueba «el total multiplica el precio por la cantidad».
```

Antes de aceptarlo, **valida**: ¿el cambio de nombre es intencionado o es un error de la aplicación?
`app/CAMBIOS.md` lo dice:

```bash
# El registro de cambios de la versión 2
cat app/CAMBIOS.md
```

```text
# Cambios de la tienda

## Versión 2

- El botón «Comprar» se llama ahora «Añadir al carrito» (no compra: añade al carrito).
- Nuevo precio de los Auriculares Pro: 64,90 € (antes, 59,90 €).
```

El cambio es intencionado: la propuesta es correcta. Acéptala (**Accept** en el chat en línea) y aplica
lo mismo en la prueba 3 (`{ name: 'Comprar' }` → `{ name: 'Añadir al carrito' }` en las dos).

### 4 — Ejecutar para validar el arreglo

Un arreglo no está validado hasta que se ejecuta.

```bash
# Las tres pruebas tras corregir el localizador
npx playwright test
```

**Resultado esperado** (extracto):

```text
  ✘  1 tests/tienda.spec.js:5:1 › muestra el nombre y el precio del producto (5.1s)
  ✓  2 tests/tienda.spec.js:11:1 › añadir al carrito suma un artículo (172ms)
  ✘  3 tests/tienda.spec.js:17:1 › el total multiplica el precio por la cantidad (5.2s)
…
  2) tests/tienda.spec.js:17:1 › el total multiplica el precio por la cantidad ─────────────────────

    Error: expect(locator).toHaveText(expected) failed

    Locator:  getByTestId('total')
    Expected: "119,80 €"
    Received: "129,80 €"
…
  2 failed
```

La prueba 2 pasa. La 3 ha avanzado: ya hace clic y ahora falla en su aserción. Arreglar un fallo ha
destapado el siguiente, que el primer diagnóstico no podía ver.

### 5 — El dato: ¿cambia la prueba o la aplicación?

Pide a Copilot el diagnóstico de las pruebas 1 y 3 con sus `error-context.md`:

```text
#file:tests/tienda.spec.js
#file:test-results/tienda-muestra-el-nombre-y-el-precio-del-producto/error-context.md
#file:test-results/tienda-el-total-multiplica-el-precio-por-la-cantidad/error-context.md
¿Por qué fallan estas dos pruebas? ¿Es un error de la prueba o de la aplicación?
```

**Ejemplo de respuesta** (la tuya será distinta):

```text
Las dos pruebas esperan un precio de 59,90 €, pero la página muestra 64,90 €, y el total
de 2 unidades es 129,80 € (2 × 64,90). El cálculo del total es coherente con el precio
mostrado, así que parece que el precio ha cambiado. Actualiza los valores esperados:

  await expect(page.getByTestId('precio')).toHaveText('64,90 €');
  await expect(page.getByTestId('total')).toHaveText('129,80 €');

Si el precio de 59,90 € es el correcto, el error estaría en los datos del catálogo.
```

Copilot no puede saber cuál de las dos es la buena; lo dice y propone la que hace pasar las pruebas. La
decisión es tuya, con el requisito: `app/CAMBIOS.md` dice «Nuevo precio de los Auriculares Pro: 64,90 €».
Cambia en `tests/tienda.spec.js` `'59,90 €'` por `'64,90 €'` y `'119,80 €'` por `'129,80 €'`.

```bash
# Las tres pruebas con los datos de la versión 2
npx playwright test
```

**Resultado esperado** (los tiempos cambian):

```text
Running 3 tests using 1 worker

  ✓  1 tests/tienda.spec.js:5:1 › muestra el nombre y el precio del producto (125ms)
  ✓  2 tests/tienda.spec.js:11:1 › añadir al carrito suma un artículo (108ms)
  ✓  3 tests/tienda.spec.js:17:1 › el total multiplica el precio por la cantidad (135ms)

  3 passed (975ms)
```

> [!WARNING]
> Si `CAMBIOS.md` no dijera nada del precio, la respuesta correcta sería abrir una incidencia, no cambiar
> la prueba. Cambiar el valor esperado para que coincida con lo que hace la aplicación convierte la
> prueba en una foto del comportamiento actual, errores incluidos.

### 6 — Refactorizar a Page Object con Copilot

Las tres pruebas repiten los localizadores: el cambio de «Comprar» había que hacerlo en dos sitios. Un
Page Object los reúne en una clase. Se lo
pides a Copilot en modo **Edit** (o **Agent**), que propone cambios sobre los ficheros:

1. En la vista de Chat, cambia el modo a **Edit**.
2. **Add Context…** → `tests/tienda.spec.js`.
3. Escribe:

```text
Refactoriza tests/tienda.spec.js al patrón Page Object:
- crea tests/paginas/producto.js con una clase PaginaProducto (ESM) que tenga los
  localizadores (nombre, precio, cantidad, botón Añadir al carrito, artículos, total)
  y los métodos abrir() y anadirAlCarrito(unidades = 1);
- las aserciones se quedan en las pruebas, no en el Page Object;
- no cambies los valores esperados ni el número de pruebas.
```

**Ejemplo de respuesta** (la tuya será distinta; la versión del ejercicio está en `solucion/tests/`):
Copilot crea `tests/paginas/producto.js`:

```js
export class PaginaProducto {
  constructor(page) {
    this.page = page;
    this.nombre = page.getByRole('heading', { level: 1 });
    this.precio = page.getByTestId('precio');
    this.cantidad = page.getByLabel('Cantidad');
    this.botonAnadir = page.getByRole('button', { name: 'Añadir al carrito' });
    this.articulos = page.getByTestId('articulos');
    this.total = page.getByTestId('total');
  }

  async abrir() {
    await this.page.goto('/producto.html');
  }

  async anadirAlCarrito(unidades = 1) {
    await this.cantidad.fill(String(unidades));
    await this.botonAnadir.click();
  }
}
```

y reescribe las pruebas; por ejemplo:

```js
test('el total multiplica el precio por la cantidad', async ({ page }) => {
  const producto = new PaginaProducto(page);
  await producto.abrir();
  await producto.anadirAlCarrito(2);
  await expect(producto.total).toHaveText('129,80 €');
});
```

Revisa el diff que propone (los cambios aparecen marcados en el editor) antes de pulsar **Keep**: que los
valores esperados sean los mismos, que no haya desaparecido ninguna aserción y que el Page Object no
compruebe nada por su cuenta. Después, ejecuta:

```bash
# La suite refactorizada
npx playwright test
```

**Resultado esperado** (los tiempos cambian; los números de línea dependen de tu versión):

```text
Running 3 tests using 1 worker

  ✓  1 tests/tienda.spec.js:7:1 › muestra el nombre y el precio del producto (130ms)
  ✓  2 tests/tienda.spec.js:14:1 › añadir al carrito suma un artículo (120ms)
  ✓  3 tests/tienda.spec.js:21:1 › el total multiplica el precio por la cantidad (124ms)

  3 passed (963ms)
```

Las mismas tres pruebas, en verde. Una refactorización de pruebas se valida así: mismo número de pruebas,
mismas aserciones, mismo resultado.

## Comprueba tu entendimiento

**La suite sigue detectando errores**
Simula un error en la aplicación: en `app/public/producto.html`, cambia `euros(articulos * p.precio)` por
`euros(articulos + p.precio)` y ejecuta las pruebas.

```bash
# La suite refactorizada contra una aplicación con un error de cálculo
npx playwright test
```

→ Falla `el total multiplica el precio por la cantidad` con `Expected: "129,80 €"` y
`Received: "66,90 €"`. La refactorización no ha debilitado la prueba. Deshaz el cambio.

**La solución**

```bash
# Las pruebas de la solución
npx playwright test --config solucion/playwright.config.js
```

→ `3 passed`.

## Investiga

¿Qué contexto necesita Copilot para acertar? Repite el paso 5 en una conversación nueva (**New Chat**)
dándole solo `tests/tienda.spec.js`, sin `error-context.md`, y pregunta por qué falla la prueba del
precio. Después, en otra conversación, añade también `#file:app/CAMBIOS.md`. Compara las tres
respuestas: sin el estado de la página, el asistente solo puede suponer; con el registro de cambios,
puede distinguir un cambio intencionado de un error.

## Reto

### 1 — La corrección que hace pasar todo

**La situación:** otra persona del equipo, con la prueba del total fallando, aceptó esta propuesta de un
asistente: «para que la prueba no dependa del precio, comprueba solo que el total se ha actualizado».
Quedó así, en un fichero nuevo `tests/total-debil.spec.js`:

```js
import { test, expect } from '@playwright/test';
import { PaginaProducto } from './paginas/producto.js';

// La «corrección» propuesta: ya no compara con un importe concreto
test('el total se actualiza al añadir (versión débil)', async ({ page }) => {
  const producto = new PaginaProducto(page);
  await producto.abrir();
  await producto.anadirAlCarrito(2);
  await expect(producto.total).not.toHaveText('0,00 €');
});
```

**Qué haces:** crea ese fichero, introduce el error de cálculo de «Comprueba tu entendimiento»
(`articulos + p.precio`) y ejecuta las dos pruebas del total.

```bash
# Solo las pruebas cuyo nombre contiene «el total»
npx playwright test -g "el total"
```

**Pistas:** compara qué comprueba cada una y qué valor muestra la página con el error.

**Lo que buscas:** saber si la «corrección» detecta el error que la prueba original sí detecta.

<details>
<summary>Ver solución</summary>

```text
Running 2 tests using 2 workers

  ✓  2 tests/total-debil.spec.js:5:1 › el total se actualiza al añadir (versión débil) (296ms)
  ✘  1 tests/tienda.spec.js:21:1 › el total multiplica el precio por la cantidad (5.3s)

  1) tests/tienda.spec.js:21:1 › el total multiplica el precio por la cantidad ─────────────────────

    Error: expect(locator).toHaveText(expected) failed

    Locator:  getByTestId('total')
    Expected: "129,80 €"
    Received: "66,90 €"
…
  1 failed
…
  1 passed (6.1s)
```

Con el total mal calculado (66,90 € en lugar de 129,80 €), la versión débil pasa: «no es 0,00 €» lo
cumple cualquier número. Es el patrón más peligroso de un arreglo automático: la prueba deja de fallar
porque ha dejado de comprobar. Borra `tests/total-debil.spec.js` y deshaz el error de la aplicación.

**La regla:** cuando la IA arregla una prueba, mira si ha cambiado el código o la expectativa; si ha
cambiado la expectativa, tiene que haber un requisito que lo justifique y la prueba tiene que seguir
siendo capaz de fallar.

</details>

## Errores frecuentes

| Síntoma | Causa probable | Cómo arreglarlo |
|---------|----------------|-----------------|
| `#file:` no encuentra `error-context.md` | `test-results/` se borra en cada ejecución; la ruta cambió o ya no existe | Ejecuta otra vez las pruebas que fallan y adjunta el fichero recién creado |
| Copilot propone `waitForTimeout` o subir el `timeout` | Interpreta el `TimeoutError` como lentitud | El `Page snapshot` muestra que el botón no existe con ese nombre: pide el arreglo del localizador |
| `Cannot find module './paginas/producto.js'` | Copilot creó el Page Object en otra carpeta | Debe estar en `tests/paginas/producto.js`, o ajusta el `import` |
| Tras refactorizar hay menos pruebas | El modo **Edit** fusionó o eliminó alguna | Revisa el diff antes de **Keep**; pide que no cambie el número de pruebas |
| Las respuestas de Copilot no mencionan la página | No adjuntaste el `error-context.md` ni la traza | Usa **Add Context…** o `#file:` con el fichero del fallo |

## Conclusiones

### Qué es la depuración asistida por IA

Darle a un asistente el error, el estado de la página y el código de la prueba para que proponga la causa
y el arreglo. Playwright lo facilita guardando un `error-context.md` por fallo, con el snapshot de
accesibilidad y la línea que falló. El asistente es rápido encontrando **qué** no coincide; no puede saber
**quién** tiene razón.

### Cómo debe ser

| Requisito | En el lab |
|-----------|-----------|
| Dar contexto real del fallo | `/fix` con el `error-context.md`: el snapshot muestra «Añadir al carrito» |
| Validar contra el requisito | `app/CAMBIOS.md` confirma el nombre del botón y el precio nuevo |
| Validar ejecutando, después de cada arreglo | El arreglo del botón destapó el fallo del total |
| Refactorizar sin cambiar lo que se comprueba | Page Object: 3 pruebas, mismas aserciones, `3 passed` |
| Comprobar que la suite sigue fallando ante errores | `Received: "66,90 €"` con el total mal calculado |

### Dónde se rompe y cómo lo has detectado

| Fallo | Cómo lo has visto | Qué provoca |
|-------|-------------------|-------------|
| Arreglo que cambia la expectativa sin requisito | La propuesta del precio «actualiza los valores esperados» | Una prueba que fotografía errores |
| Arreglo que debilita la aserción | `not.toHaveText('0,00 €')` pasa con 66,90 € | La prueba deja de detectar el error |
| Fallos encadenados | La prueba 3 pasó de fallar en el clic a fallar en el total | Un diagnóstico solo ve el primer fallo |
| Refactor que pierde comprobaciones | Se revisa el diff y se ejecuta | Suite verde que comprueba menos |

### Cómo se perfecciona

En un proyecto real, el `error-context.md` y la traza se publican como artefactos del [pipeline](../glosario/04-ci-cd.md#pipeline) para poder
dárselos al asistente sin reproducir el fallo, el registro de cambios o las historias de usuario se
adjuntan como contexto, y los arreglos de pruebas propuestos por IA pasan revisión de código con una
pregunta fija: ¿ha cambiado el código de la prueba o lo que espera?

### En una frase

> 🔑 La IA encuentra rápido qué no coincide entre la prueba y la página; quién tiene razón lo decide el
> requisito, y el arreglo se acepta solo cuando la prueba pasa y sigue siendo capaz de fallar.
