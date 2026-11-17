# Lab — Selectores estables

[← Página anterior](01-lab-navegacion-web.md) · [Siguiente página →](03-lab-sincronizacion.md)

En este lab practicas los **[localizadores](../glosario/02-e2e.md#localizador) por rol y por contrato** con una página de acceso que existe
en dos versiones: el diseño actual (`v1`) y un rediseño (`v2`) que cambia clases, ids y estructura
pero hace lo mismo. Las pruebas de `ejercicios/M02-02-selectores-estables/`, escritas con selectores
CSS y XPath, pasan en `v1` y se rompen en `v2`; las reescribes para que pasen en las dos.

### Objetivo

Comprender qué es un localizador estable: cómo funciona, cómo debe ser, cómo se detectan sus
debilidades y cómo se mejora.

### Punto de partida

- Codespace del curso abierto (`npm run verificar` termina en `Entorno listo`).
- Ejercicio: `ejercicios/M02-02-selectores-estables/`: la página en `app/public/v1/` y `app/public/v2/`,
  y dos pruebas en `tests/acceso.spec.js`.
- La aplicación escucha en el puerto **3202**: `http://localhost:3202/v1/` y `http://localhost:3202/v2/`.
- `playwright.config.js` define dos **proyectos**, `v1` y `v2`: las mismas pruebas contra cada versión.

```bash
# Entra en la carpeta del ejercicio
cd ejercicios/M02-02-selectores-estables
```

### Qué está pasando

Un equipo rediseña una pantalla: nuevas clases CSS, otro maquetado, otros nombres de campos. Para el
usuario no cambia nada (sigue habiendo un campo «Correo electrónico» y un botón «Entrar»), pero las
pruebas que buscaban `#email` o `.btn-primary` dejan de encontrar nada. La suite falla sin que haya
ningún error: es **mantenimiento puro**, y si pasa en cada rediseño el equipo acaba desactivando las pruebas.

Un **localizador** es la forma de decir «este elemento» en una prueba. Los hay que dependen de cómo
está hecha la página y los hay que dependen de lo que el usuario ve o de un contrato explícito:

| Localizador | Depende de | Ejemplo | Aguanta un rediseño |
|-------------|------------|---------|---------------------|
| `getByRole` | Rol accesible y nombre visible | `getByRole('button', { name: 'Entrar' })` | Sí, si el texto no cambia |
| `getByLabel` | La etiqueta del campo | `getByLabel('Correo electrónico')` | Sí |
| `getByPlaceholder`, `getByText` | Texto visible | `getByText('Recordarme')` | Si el texto no cambia |
| `getByTestId` | Un atributo `data-testid` pactado con desarrollo | `getByTestId('saludo')` | Sí, mientras se respete |
| CSS / XPath | Ids, clases, posición en el árbol | `.btn.btn-primary`, `//div[2]/input` | No |

Este orden es la **jerarquía de localizadores** que recomienda [Playwright](../glosario/02-e2e.md#playwright): primero lo que ve el
usuario, después el contrato `data-testid` y, en último lugar, CSS o XPath.

### 1 — Mirar las dos versiones en crudo

Compara los formularios de las dos versiones. Arranca la aplicación y pide el HTML de cada una.

```bash
# Terminal 1: arranca la aplicación (Ctrl+C para pararla al terminar el paso)
node app/server.mjs
```

```bash
# Terminal 2: el formulario de cada versión
curl -s http://localhost:3202/v1/ | sed -n '/<form/,/<\/form>/p'
curl -s http://localhost:3202/v2/ | sed -n '/<form/,/<\/form>/p'
```

**Resultado esperado:**

```text
    <form class="form">
      <div class="form-row">
        <label for="email">Correo electrónico</label>
        <input id="email" class="input-text" type="email">
      </div>
      <div class="form-row">
        <label for="pass">Contraseña</label>
        <input id="pass" class="input-text" type="password">
      </div>
      <div class="form-row">
        <input id="recordar" type="checkbox">
        <label for="recordar">Recordarme</label>
      </div>
      <button class="btn btn-primary" type="submit">Entrar</button>
    </form>
      <form class="stack">
        <label class="field">
          <span class="field__label">Correo electrónico</span>
          <input name="correo" class="field__input" type="email">
        </label>
        <label class="field">
          <span class="field__label">Contraseña</span>
          <input name="clave" class="field__input" type="password">
        </label>
        <label class="check"><input name="recordar" type="checkbox"> Recordarme</label>
        <div class="actions">
          <button class="button button--ghost" type="button">¿Has olvidado la contraseña?</button>
          <button class="button button--main" type="submit">Entrar</button>
        </div>
      </form>
```

Los ids (`email`, `pass`, `recordar`), las clases y los `div.form-row` desaparecen en `v2`, que además
añade un botón. Lo que se mantiene: los textos visibles («Correo electrónico», «Contraseña»,
«Recordarme», «Entrar») y el `data-testid="saludo"` del mensaje de bienvenida (está fuera del
formulario, en las dos versiones). Abre las dos URL desde la pestaña **Ports** para verlo en pantalla
y para la aplicación con **Ctrl+C**.

### 2 — Ejecutar las pruebas contra el diseño actual

Abre [`tests/acceso.spec.js`](../../ejercicios/M02-02-selectores-estables/tests/acceso.spec.js):

```js
test('entra con correo y contraseña', async ({ page }) => {
  await page.goto('index.html');
  await page.locator('#email').fill('ana@example.com');
  await page.locator('//div[@class="form-row"][2]/input').fill('secreta');
  await page.locator('.btn.btn-primary').click();
  await expect(page.locator('div.panel > p.msg')).toHaveText('Hola, ana@example.com');
});

test('marca «Recordarme»', async ({ page }) => {
  await page.goto('index.html');
  await page.locator('form > div:nth-child(3) > input').check();
  await expect(page.locator('#recordar')).toBeChecked();
});
```

Ejecútalas solo contra el proyecto `v1`:

```bash
# Las pruebas contra el diseño actual
npx playwright test --project v1
```

**Resultado esperado** (los tiempos cambian en cada ejecución):

```text
Running 2 tests using 1 worker

  ✓  1 [v1] › tests/acceso.spec.js:4:1 › entra con correo y contraseña (392ms)
  ✓  2 [v1] › tests/acceso.spec.js:12:1 › marca «Recordarme» (255ms)

  2 passed (1.7s)
```

Todo en verde: estas pruebas se escribieron mirando el HTML de `v1`.

### 3 — Ejecutarlas contra el rediseño

Ahora contra `v2`, que para un usuario funciona igual:

```bash
# Las mismas pruebas contra el rediseño
npx playwright test --project v2
```

**Resultado esperado:**

```text
Running 2 tests using 1 worker

  ✘  1 [v2] › tests/acceso.spec.js:4:1 › entra con correo y contraseña (5.1s)
  ✘  2 [v2] › tests/acceso.spec.js:12:1 › marca «Recordarme» (5.1s)


  1) [v2] › tests/acceso.spec.js:4:1 › entra con correo y contraseña ───────────────────────────────

    TimeoutError: locator.fill: Timeout 5000ms exceeded.
    Call log:
      - waiting for locator('#email')

  ...
  2) [v2] › tests/acceso.spec.js:12:1 › marca «Recordarme» ─────────────────────────────────────────

    TimeoutError: locator.check: Timeout 5000ms exceeded.
    Call log:
      - waiting for locator('form > div:nth-child(3) > input')

  ...
  2 failed
    [v2] › tests/acceso.spec.js:4:1 › entra con correo y contraseña ────────────────────────────────
    [v2] › tests/acceso.spec.js:12:1 › marca «Recordarme» ──────────────────────────────────────────
```

Cada acción espera a su elemento ([espera automática](../glosario/02-e2e.md#espera-automatica)) hasta `actionTimeout`, que en este ejercicio es
5 s (`use: { actionTimeout: 5_000 }` en la configuración). `#email` ya no existe: la prueba falla
aunque la página funcione.

### 4 — Leer lo que la página ofrece

Cuando una prueba falla, Playwright deja en `test-results/` un `error-context.md` con el árbol de
accesibilidad de la página: lo que un lector de pantalla «ve». Ábrelo en el editor:
`test-results/acceso-entra-con-correo-y-contraseña-v2/error-context.md`.

**Resultado esperado** (la sección del árbol):

```yaml
- main [ref=e2]:
  - generic [ref=e3]:
    - generic [ref=e4]:
      - heading "Acceso" [level=1] [ref=e5]
      - paragraph [ref=e6]: Usa tu cuenta corporativa
    - generic [ref=e7]:
      - generic [ref=e8]:
        - generic [ref=e9]: Correo electrónico
        - textbox "Correo electrónico" [ref=e10]
      - generic [ref=e11]:
        - generic [ref=e12]: Contraseña
        - textbox "Contraseña" [ref=e13]
      - generic [ref=e14]:
        - checkbox "Recordarme" [ref=e15]
        - text: Recordarme
      - generic [ref=e16]:
        - button "¿Has olvidado la contraseña?" [ref=e17]
        - button "Entrar" [ref=e18]
```

Cada línea es **rol + nombre accesible**: `textbox "Correo electrónico"`, `checkbox "Recordarme"`,
`button "Entrar"`. Eso es justo lo que piden `getByRole` y `getByLabel`, y es igual en las dos versiones.

### 5 — Reescribir la prueba de acceso

Sustituye el cuerpo de la primera prueba por localizadores por etiqueta, por rol y por test id:

```js
test('entra con correo y contraseña', async ({ page }) => {
  await page.goto('index.html');
  await page.getByLabel('Correo electrónico').fill('ana@example.com');
  await page.getByLabel('Contraseña').fill('secreta');
  await page.getByRole('button', { name: 'Entrar' }).click();
  await expect(page.getByTestId('saludo')).toHaveText('Hola, ana@example.com');
});
```

```bash
# Las pruebas contra las dos versiones (los dos proyectos)
npx playwright test
```

**Resultado esperado** (extracto):

```text
Running 4 tests using 2 workers

  ✓  1 [v1] › tests/acceso.spec.js:4:1 › entra con correo y contraseña (457ms)
  ✓  2 [v2] › tests/acceso.spec.js:4:1 › entra con correo y contraseña (438ms)
  ✓  3 [v1] › tests/acceso.spec.js:12:1 › marca «Recordarme» (237ms)
  ✘  4 [v2] › tests/acceso.spec.js:12:1 › marca «Recordarme» (5.1s)

  ...
  1 failed
    [v2] › tests/acceso.spec.js:12:1 › marca «Recordarme» ──────────────────────────────────────────
  3 passed (6.7s)
```

La prueba de acceso pasa ya en las dos versiones. `getByLabel` encuentra el campo tanto si la etiqueta
va con `for="email"` (v1) como si envuelve al campo (v2). Para el mensaje no hay rol ni etiqueta
útiles, así que se usa el contrato `data-testid="saludo"`, que el rediseño ha respetado.

### 6 — Reescribir la prueba de «Recordarme»

Haz lo mismo con la segunda prueba: la casilla es un `checkbox` con nombre «Recordarme».

```js
test('marca «Recordarme»', async ({ page }) => {
  await page.goto('index.html');
  await page.getByRole('checkbox', { name: 'Recordarme' }).check();
  await expect(page.getByRole('checkbox', { name: 'Recordarme' })).toBeChecked();
});
```

```bash
# Las dos pruebas contra las dos versiones
npx playwright test
```

**Resultado esperado:**

```text
Running 4 tests using 2 workers

  ✓  1 [v1] › tests/acceso.spec.js:4:1 › entra con correo y contraseña (327ms)
  ✓  2 [v2] › tests/acceso.spec.js:4:1 › entra con correo y contraseña (378ms)
  ✓  3 [v1] › tests/acceso.spec.js:12:1 › marca «Recordarme» (234ms)
  ✓  4 [v2] › tests/acceso.spec.js:12:1 › marca «Recordarme» (242ms)

  4 passed (1.8s)
```

Las pruebas ya no saben nada de clases, ids ni posiciones. La solución está en
[`solucion/tests/acceso.spec.js`](../../ejercicios/M02-02-selectores-estables/solucion/tests/acceso.spec.js).

```bash
# Ejecuta la solución
npx playwright test --config solucion/playwright.config.js
```

## Comprueba tu entendimiento

**Qué ve el lector de pantalla**
Abre `test-results/…/error-context.md` de cualquier fallo y busca la línea del botón principal.
→ `button "Entrar"`: rol `button`, nombre `Entrar`, lo mismo que pide `getByRole('button', { name: 'Entrar' })`.

**Un proyecto cada vez**
Ejecuta `npx playwright test --project v2` con las pruebas ya reescritas.
→ `2 passed`: las mismas pruebas sirven para el diseño y el rediseño.

## Experimenta

Los localizadores por rol dependen del **texto visible**. ¿Qué pasa si el equipo de producto cambia
«Entrar» por «Iniciar sesión» solo en `v2`? **Predice** qué prueba falla, en qué proyecto y en qué
línea. Después cambia el texto del botón `type="submit"` en `app/public/v2/index.html` y ejecuta:

```bash
# Ejecuta tras cambiar el texto del botón en v2
npx playwright test
```

**Resultado esperado** (extracto):

```text
  ✓  2 [v1] › tests/acceso.spec.js:4:1 › entra con correo y contraseña (270ms)
  ✓  3 [v1] › tests/acceso.spec.js:12:1 › marca «Recordarme» (194ms)
  ✘  1 [v2] › tests/acceso.spec.js:4:1 › entra con correo y contraseña (5.2s)
  ✓  4 [v2] › tests/acceso.spec.js:12:1 › marca «Recordarme» (176ms)

    TimeoutError: locator.click: Timeout 5000ms exceeded.
    Call log:
      - waiting for getByRole('button', { name: 'Entrar' })

  1 failed
  3 passed (7.1s)
```

Esta vez el fallo **sí** dice algo útil: lo que el usuario lee ha cambiado. Si el cambio es
intencionado, se actualiza la prueba; si no, se ha cazado un cambio de texto no previsto. Deja el
botón como estaba («Entrar»).

## Reto

### 1 — «El último botón»

**La situación:** un compañero propone `page.locator('button').last()` para el botón **Entrar**:
«funciona en las dos versiones, porque en las dos es el último botón».

**Qué haces:** crea `tests/reto.spec.js` con la prueba de acceso usando ese localizador y ejecútala. Después
cambia el orden de los dos botones de `app/public/v2/index.html` (que «¿Has olvidado la contraseña?» quede
el último, como podría pasar en otro rediseño) y vuelve a ejecutar. Por último, arréglalo.

```bash
# Ejecuta solo la prueba del reto
npx playwright test tests/reto.spec.js
```

**Pistas:** copia la prueba del paso 5 y cambia solo la línea del clic.

**Lo que buscas:** ver que el localizador por posición pasa hoy y falla con un cambio de orden que no
cambia nada para el usuario, y dejarlo verde en los dos proyectos sin depender del orden.

<details>
<summary>Ver solución</summary>

```js
import { test, expect } from '@playwright/test';

test('entra pulsando el último botón', async ({ page }) => {
  await page.goto('index.html');
  await page.getByLabel('Correo electrónico').fill('ana@example.com');
  await page.getByLabel('Contraseña').fill('secreta');
  await page.locator('button').last().click();
  await expect(page.getByTestId('saludo')).toHaveText('Hola, ana@example.com');
});
```

Con el orden original:

```text
Running 2 tests using 2 workers

  ✓  1 [v2] › tests/reto.spec.js:3:1 › entra pulsando el último botón (269ms)
  ✓  2 [v1] › tests/reto.spec.js:3:1 › entra pulsando el último botón (248ms)

  2 passed (1.3s)
```

Con los botones de `v2` en otro orden (extracto):

```text
  ✘  …  [v2] › tests/reto.spec.js:3:1 › entra pulsando el último botón (5.4s)

    Error: expect(locator).toHaveText(expected) failed

    Locator:  getByTestId('saludo')
    Expected: "Hola, ana@example.com"
    Received: ""
    Timeout:  5000ms

        14 × locator resolved to <div hidden="" class="toast" role="status" data-testid="saludo"></div>
```

El clic fue al botón equivocado («¿Has olvidado la contraseña?»), que no envía el formulario: el fallo
aparece lejos de su causa, en la [aserción](../glosario/01-fundamentos.md#asercion) del saludo. Con
`page.getByRole('button', { name: 'Entrar' }).click()`:

```text
Running 2 tests using 2 workers

  ✓  1 [v1] › tests/reto.spec.js:3:1 › entra pulsando el último botón (197ms)
  ✓  2 [v2] › tests/reto.spec.js:3:1 › entra pulsando el último botón (183ms)

  2 passed (910ms)
```

**La regla:** un localizador debe describir **qué** es el elemento para el usuario, no **dónde**
está. La posición (`last()`, `nth()`, `:nth-child`) es lo primero que cambia en un rediseño. Deja
`v2` como estaba y borra `tests/reto.spec.js`.

</details>

## Errores frecuentes

| Síntoma | Causa probable | Cómo arreglarlo |
|---------|----------------|-----------------|
| `TimeoutError: locator.fill: Timeout 5000ms exceeded` con `waiting for locator('#…')` | El id o la clase ya no existen tras un cambio de la interfaz | Localizar por etiqueta o rol; mirar `error-context.md` |
| `strict mode violation` con `getByLabel('Contraseña')` | Otra etiqueta contiene el mismo texto (p. ej. «Repite la contraseña») | `getByLabel('Contraseña', { exact: true })` |
| `getByTestId` no encuentra nada | El atributo no es `data-testid` o desarrollo lo quitó | Pactar el atributo o configurar `testIdAttribute` en `use` |
| Una acción sobre el elemento equivocado, fallo en la línea siguiente | Localizador por posición (`last()`, `nth-child`) | Localizar por rol y nombre |

## Conclusiones

### Qué es un localizador estable

Una forma de encontrar un elemento que depende de **lo que el usuario percibe** (rol, nombre,
etiqueta) o de un **contrato explícito** con desarrollo (`data-testid`), no de cómo está maquetada la página.

### Cómo debe ser

| Requisito | En el lab |
|-----------|-----------|
| Primero rol y etiqueta | `getByLabel('Correo electrónico')`, `getByRole('checkbox', { name: 'Recordarme' })` |
| `data-testid` cuando no hay nada visible que lo identifique | `getByTestId('saludo')` |
| Sin posiciones ni clases de estilo | Fuera `.btn-primary`, `div:nth-child(3)`, XPath con índices |
| Único en la página | `getByRole('button', { name: 'Entrar' })` frente a `locator('button').last()` |

### Dónde se rompe y cómo lo has detectado

| Fallo | Cómo lo has visto | Qué provoca |
|-------|-------------------|-------------|
| Selector atado a la maqueta | 2 fallos en `v2` en el paso 3, con la página funcionando | Mantenimiento en cada rediseño |
| Selector por posición | El reto: verde hoy, rojo al cambiar el orden | Clic en el elemento equivocado, fallo lejos de la causa |
| Cambio del texto visible | Experimenta: «Iniciar sesión» rompe `getByRole` | Fallo útil: avisa de un cambio que ve el usuario |

### Cómo se perfecciona

En un equipo real, los `data-testid` se pactan con desarrollo (y se revisan en el pull request como
cualquier contrato), y la accesibilidad de la página se cuida: una página accesible es una página
fácil de probar. El generador `npx playwright codegen` y el botón **Pick locator** del modo UI
proponen localizadores siguiendo esta misma jerarquía.

### En una frase

> 🔑 Localiza los elementos como los encuentra el usuario (rol, etiqueta, texto) y usa `data-testid` como contrato; las clases y posiciones son de la maqueta, no de la prueba.
