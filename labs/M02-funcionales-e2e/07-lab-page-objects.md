# Lab — Page Objects y fixtures

[← Página anterior](06-lab-errores-y-reintentos.md) · [Siguiente página →](08-lab-suite-e2e-de-un-flujo.md)

En este lab practicas el **[Page Object](../glosario/02-e2e.md#page-object) Model** y las **[fixtures](../glosario/02-e2e.md#fixture)** de [Playwright](../glosario/02-e2e.md#playwright) con una lista de
tareas (`ejercicios/M02-07-page-objects/`). Sus cuatro pruebas funcionan, pero repiten los mismos
selectores una y otra vez. Extraes un Page Object y una fixture, cambias un texto de la interfaz y
compruebas que el arreglo se hace en un solo sitio.

### Objetivo

Comprender qué es un Page Object con su fixture: cómo funciona, cómo debe ser, cómo se detectan sus
debilidades y cómo se mejora.

### Punto de partida

- Codespace del curso abierto (`npm run verificar` termina en `Entorno listo`).
- Ejercicio: `ejercicios/M02-07-page-objects/`, con la aplicación en `app/public/index.html` y cuatro
  pruebas en `tests/tareas.spec.js`.
- La aplicación escucha en el puerto **3207**; Playwright la arranca solo. En este ejercicio, una acción
  que no encuentra su elemento falla a los 5 s (`actionTimeout`).

```bash
# Entra en la carpeta del ejercicio
cd ejercicios/M02-07-page-objects
```

### Qué está pasando

Cuando una suite crece, las mismas líneas aparecen en todas las pruebas: abrir la página, escribir en
el campo, pulsar el botón. Si la interfaz cambia (otro texto, otro campo), hay que tocar todas. El
**Page Object** reúne en una clase **cómo se localiza** cada elemento de una pantalla y **qué se puede
hacer** en ella; las pruebas solo dicen **qué** quieren comprobar.

Una **fixture** es la forma de Playwright de preparar algo para cada prueba y entregárselo como
parámetro, igual que entrega `page`. Con `test.extend` se crean fixtures propias.

| Pieza | Qué contiene | En este lab |
|-------|--------------|-------------|
| Prueba | Qué se hace y qué se espera | `await tareas.anadir('Comprar pan')` y sus `expect` |
| Page Object | [Localizadores](../glosario/02-e2e.md#localizador) y acciones de una pantalla | `paginas/PaginaTareas.js` |
| Fixture | Prepara el Page Object (y la página) para cada prueba | `fixtures.js` con `test.extend({ tareas })` |

### 1 — Ejecutar y medir la repetición

Ejecuta la suite y cuenta cuántas veces aparecen los dos localizadores del formulario en las pruebas.

```bash
# Ejecuta las pruebas
npx playwright test
# Cuántas veces se repiten el botón y el campo
grep -c "getByRole('button', { name: 'Añadir' })" tests/tareas.spec.js
grep -c "getByPlaceholder('Nueva tarea')" tests/tareas.spec.js
```

**Resultado esperado** (los tiempos cambian en cada ejecución):

```text
Running 4 tests using 1 worker

  ✓  1 [chromium] › tests/tareas.spec.js:4:1 › añade una tarea (142ms)
  ✓  2 [chromium] › tests/tareas.spec.js:12:1 › completa una tarea (191ms)
  ✓  3 [chromium] › tests/tareas.spec.js:22:1 › borra una tarea (152ms)
  ✓  4 [chromium] › tests/tareas.spec.js:31:1 › no añade tareas vacías (88ms)

  4 passed (1.1s)
```

```text
5
5
```

Cuatro pruebas verdes y cada localizador del formulario escrito **cinco** veces. Abre
[`tests/tareas.spec.js`](../../ejercicios/M02-07-page-objects/tests/tareas.spec.js): cada prueba empieza
igual (`goto`, `fill`, `click`). Ningún fallo todavía; el problema aparecerá con el primer cambio de la interfaz.

### 2 — Crear el Page Object

Crea la carpeta `paginas/` y, dentro, el fichero `PaginaTareas.js` con este contenido:

```js
// Page Object de la lista de tareas: el ÚNICO sitio que sabe cómo se localiza cada elemento
export class PaginaTareas {
  constructor(page) {
    this.page = page;
    this.campoNueva = page.getByPlaceholder('Nueva tarea');
    this.botonAnadir = page.getByRole('button', { name: 'Añadir' });
    this.tareas = page.getByRole('listitem');
  }

  async abrir() {
    await this.page.goto('/');
  }

  // Añade una o varias tareas, en orden
  async anadir(...textos) {
    for (const texto of textos) {
      await this.campoNueva.fill(texto);
      await this.botonAnadir.click();
    }
  }

  async completar(texto) {
    await this.page.getByRole('checkbox', { name: `Completar ${texto}` }).check();
  }

  async borrar(texto) {
    await this.tareas.filter({ hasText: texto }).getByRole('button', { name: 'Borrar' }).click();
  }

  // Localizador del contador, para que la prueba haga sus propias aserciones
  contador(texto) {
    return this.page.getByText(texto, { exact: true });
  }
}
```

Los localizadores se crean en el constructor: un localizador de Playwright no busca nada hasta que se
usa, así que se puede crear antes de abrir la página. Las acciones (`anadir`, `completar`, `borrar`)
tienen nombres del dominio, no de la interfaz. Las **[aserciones](../glosario/01-fundamentos.md#asercion) se quedan en las pruebas**: el Page
Object devuelve localizadores (`tareas`, `contador`) para que cada prueba decida qué comprobar.

### 3 — Usarlo en una prueba

Crea `tests/tareas-po.spec.js` con la primera prueba reescrita. Deja el fichero original: lo usarás para comparar.

```js
// Pruebas de la lista de tareas (M02-07) con Page Object
import { test, expect } from '@playwright/test';
import { PaginaTareas } from '../paginas/PaginaTareas.js';

test('añade una tarea', async ({ page }) => {
  const tareas = new PaginaTareas(page);
  await tareas.abrir();
  await tareas.anadir('Comprar pan');
  await expect(tareas.tareas).toContainText(['Comprar pan']);
  await expect(tareas.contador('1 pendiente')).toBeVisible();
});
```

```bash
# Ejecuta solo el fichero nuevo
npx playwright test tests/tareas-po.spec.js
```

**Resultado esperado:**

```text
Running 1 test using 1 worker

  ✓  1 [chromium] › tests/tareas-po.spec.js:5:1 › añade una tarea (137ms)

  1 passed (716ms)
```

Funciona, pero cada prueba tendría que repetir `new PaginaTareas(page)` y `abrir()`: la preparación
sigue duplicada.

### 4 — Crear la fixture y reescribir las pruebas

Crea en la carpeta del ejercicio el fichero `fixtures.js`:

```js
// Fixture «tareas»: cada prueba la recibe ya creada y con la página abierta
import { test as base, expect } from '@playwright/test';
import { PaginaTareas } from './paginas/PaginaTareas.js';

export const test = base.extend({
  tareas: async ({ page }, use) => {
    const tareas = new PaginaTareas(page);   // preparar
    await tareas.abrir();
    await use(tareas);                       // aquí se ejecuta la prueba
  },                                         // (después de use iría la limpieza)
});

export { expect };
```

Y sustituye el contenido de `tests/tareas-po.spec.js` por las cuatro pruebas usando la fixture:

```js
// Pruebas de la lista de tareas (M02-07) con Page Object y fixture
import { test, expect } from '../fixtures.js';

test('añade una tarea', async ({ tareas }) => {
  await tareas.anadir('Comprar pan');
  await expect(tareas.tareas).toContainText(['Comprar pan']);
  await expect(tareas.contador('1 pendiente')).toBeVisible();
});

test('completa una tarea', async ({ tareas }) => {
  await tareas.anadir('Comprar pan', 'Llamar al banco');
  await tareas.completar('Comprar pan');
  await expect(tareas.contador('1 pendiente')).toBeVisible();
});

test('borra una tarea', async ({ tareas }) => {
  await tareas.anadir('Comprar pan');
  await tareas.borrar('Comprar pan');
  await expect(tareas.tareas).toHaveCount(0);
  await expect(tareas.contador('0 pendientes')).toBeVisible();
});

test('no añade tareas vacías', async ({ tareas }) => {
  await tareas.anadir('   ');
  await expect(tareas.tareas).toHaveCount(0);
});
```

```bash
# Ejecuta las dos versiones de la suite
npx playwright test
```

**Resultado esperado:**

```text
Running 8 tests using 2 workers

  ✓  1 [chromium] › tests/tareas-po.spec.js:4:1 › añade una tarea (217ms)
  ✓  2 [chromium] › tests/tareas.spec.js:4:1 › añade una tarea (202ms)
  ✓  3 [chromium] › tests/tareas-po.spec.js:10:1 › completa una tarea (227ms)
  ✓  4 [chromium] › tests/tareas.spec.js:12:1 › completa una tarea (224ms)
  ✓  5 [chromium] › tests/tareas-po.spec.js:16:1 › borra una tarea (211ms)
  ✓  6 [chromium] › tests/tareas.spec.js:22:1 › borra una tarea (206ms)
  ✓  7 [chromium] › tests/tareas-po.spec.js:23:1 › no añade tareas vacías (134ms)
  ✓  8 [chromium] › tests/tareas.spec.js:31:1 › no añade tareas vacías (131ms)

  8 passed (1.5s)
```

Las pruebas nuevas importan `test` de `../fixtures.js`, no de `@playwright/test`: ese `test` conoce la
fixture `tareas`. Basta con pedirla como parámetro (`async ({ tareas })`) para que Playwright cree el
Page Object, abra la página y se lo entregue.

### 5 — Cambiar la interfaz

El equipo de producto decide que el botón diga **Guardar** en lugar de **Añadir**. Haz el cambio en
[`app/public/index.html`](../../ejercicios/M02-07-page-objects/app/public/index.html):

```html
    <button type="submit">Guardar</button>
```

```bash
# Ejecuta las dos versiones de la suite
npx playwright test
```

**Resultado esperado** (extracto):

```text
Running 8 tests using 2 workers

  ✘  1 [chromium] › tests/tareas.spec.js:4:1 › añade una tarea (5.1s)
  ✘  2 [chromium] › tests/tareas-po.spec.js:4:1 › añade una tarea (5.1s)
  ✘  3 [chromium] › tests/tareas.spec.js:12:1 › completa una tarea (5.2s)
  ✘  4 [chromium] › tests/tareas-po.spec.js:10:1 › completa una tarea (5.1s)
  ✘  5 [chromium] › tests/tareas-po.spec.js:16:1 › borra una tarea (5.2s)
  ✘  6 [chromium] › tests/tareas.spec.js:22:1 › borra una tarea (5.2s)
  ✘  7 [chromium] › tests/tareas.spec.js:31:1 › no añade tareas vacías (5.3s)
  ✘  8 [chromium] › tests/tareas-po.spec.js:23:1 › no añade tareas vacías (5.3s)

  1) [chromium] › tests/tareas-po.spec.js:4:1 › añade una tarea ────────────────────────────────────

    TimeoutError: locator.click: Timeout 5000ms exceeded.
    Call log:
      - waiting for getByRole('button', { name: 'Añadir' })


       at ../paginas/PaginaTareas.js:18

      16 |     for (const texto of textos) {
      17 |       await this.campoNueva.fill(texto);
    > 18 |       await this.botonAnadir.click();
         |                              ^
      19 |     }
      20 |   }
  ...
  5) [chromium] › tests/tareas.spec.js:4:1 › añade una tarea ───────────────────────────────────────

    TimeoutError: locator.click: Timeout 5000ms exceeded.
    Call log:
      - waiting for getByRole('button', { name: 'Añadir' })

       5 |   await page.goto('/');
       6 |   await page.getByPlaceholder('Nueva tarea').fill('Comprar pan');
    >  7 |   await page.getByRole('button', { name: 'Añadir' }).click();
  ...
  8 failed
```

Fallan las ocho, como era de esperar. La diferencia está en **dónde** señala el error: en la suite
original, cada fallo apunta a una línea distinta de cada prueba (7, 15, 25, 34…); en la nueva, los
cuatro apuntan a la misma línea, `PaginaTareas.js:18`.

### 6 — Arreglarlo en un solo sitio

En `paginas/PaginaTareas.js`, cambia el nombre del botón en el constructor:

```js
    this.botonAnadir = page.getByRole('button', { name: 'Guardar' });
```

```bash
# Ejecuta las dos versiones de la suite
npx playwright test
```

**Resultado esperado** (extracto):

```text
Running 8 tests using 2 workers

  ✓  2 [chromium] › tests/tareas-po.spec.js:4:1 › añade una tarea (184ms)
  ✓  3 [chromium] › tests/tareas-po.spec.js:10:1 › completa una tarea (195ms)
  ✓  4 [chromium] › tests/tareas-po.spec.js:16:1 › borra una tarea (139ms)
  ✓  5 [chromium] › tests/tareas-po.spec.js:23:1 › no añade tareas vacías (115ms)
  ✘  1 [chromium] › tests/tareas.spec.js:4:1 › añade una tarea (5.1s)
  ✘  6 [chromium] › tests/tareas.spec.js:12:1 › completa una tarea (5.1s)
  ✘  7 [chromium] › tests/tareas.spec.js:22:1 › borra una tarea (5.1s)
  ✘  8 [chromium] › tests/tareas.spec.js:31:1 › no añade tareas vacías (5.1s)
  ...
```

Una línea cambiada y las cuatro pruebas con Page Object vuelven a verde. La suite original sigue rota:
para arreglarla habría que cambiar las cinco líneas que contó el paso 1.

### 7 — Quedarse con la versión mantenible

Borra la suite original y ejecuta:

```bash
# Elimina las pruebas duplicadas y ejecuta las que quedan
rm tests/tareas.spec.js
npx playwright test
```

**Resultado esperado:**

```text
Running 4 tests using 1 worker

  ✓  1 [chromium] › tests/tareas-po.spec.js:4:1 › añade una tarea (135ms)
  ✓  2 [chromium] › tests/tareas-po.spec.js:10:1 › completa una tarea (169ms)
  ✓  3 [chromium] › tests/tareas-po.spec.js:16:1 › borra una tarea (159ms)
  ✓  4 [chromium] › tests/tareas-po.spec.js:23:1 › no añade tareas vacías (102ms)

  4 passed (1.1s)
```

La solución en [`solucion/`](../../ejercicios/M02-07-page-objects/solucion/) tiene la misma estructura
(`paginas/`, `fixtures.js`, `tests/tareas-po.spec.js`) y se ejecuta contra la aplicación con el botón
**Añadir**. Para volver al estado inicial de la interfaz:

```bash
# Deshace el cambio del texto del botón
git restore app/public/index.html
```

## Comprueba tu entendimiento

**Dónde vive cada cosa**
Busca `expect` en `paginas/PaginaTareas.js` con `grep -c expect paginas/PaginaTareas.js`.
→ `0`: el Page Object localiza y actúa; las aserciones están en las pruebas.

**Qué hace la fixture**
En `tests/tareas-po.spec.js`, cambia en una prueba `async ({ tareas })` por `async ({ page })` y usa `page.getByText('0 pendientes')`.
→ Falla con `element(s) not found`: sin pedir la fixture `tareas`, nadie ha abierto la página. La fixture solo se prepara para las pruebas que la piden.

## Mejora

El texto del contador también está en las pruebas («1 pendiente», «0 pendientes»). Si cambiara a
«Te queda 1 tarea», habría que tocarlas todas. Añade al Page Object un método que traduzca un
**número** a su localizador, por ejemplo `pendientes(n)`, y úsalo en las pruebas en lugar de `contador(texto)`.
Ejecuta `npx playwright test`: tienen que seguir pasando las cuatro.

## Reto

### 1 — Una fixture que se apoya en otra

**La situación:** varias pruebas nuevas necesitan empezar con tres tareas ya creadas («Comprar pan»,
«Llamar al banco», «Regar las plantas»). Copiar el `anadir(...)` al principio de cada una volvería a
duplicar la preparación.

**Qué haces:** añade a `fixtures.js` una segunda fixture, `tareasConTres`, que usa la fixture `tareas`
y añade las tres tareas. Escribe con ella una prueba `completa todas las tareas` que comprueba
«3 pendientes», completa las tres y comprueba «0 pendientes».

**Pistas:** una fixture puede pedir otra en su primer parámetro (`async ({ tareas }, use) => …`).

**Lo que buscas:** cinco pruebas en verde y ninguna línea de preparación repetida en la prueba nueva.

<details>
<summary>Ver solución</summary>

En `fixtures.js`, dentro de `base.extend({ … })`:

```js
  // Se apoya en la fixture anterior: la lista ya abierta y con tres tareas
  tareasConTres: async ({ tareas }, use) => {
    await tareas.anadir('Comprar pan', 'Llamar al banco', 'Regar las plantas');
    await use(tareas);
  },
```

En `tests/tareas-po.spec.js`:

```js
test('completa todas las tareas', async ({ tareasConTres }) => {
  await expect(tareasConTres.contador('3 pendientes')).toBeVisible();
  for (const texto of ['Comprar pan', 'Llamar al banco', 'Regar las plantas']) {
    await tareasConTres.completar(texto);
  }
  await expect(tareasConTres.contador('0 pendientes')).toBeVisible();
});
```

```text
Running 5 tests using 1 worker

  ✓  1 [chromium] › tests/tareas-po.spec.js:4:1 › añade una tarea (133ms)
  ✓  2 [chromium] › tests/tareas-po.spec.js:10:1 › completa una tarea (162ms)
  ✓  3 [chromium] › tests/tareas-po.spec.js:16:1 › borra una tarea (142ms)
  ✓  4 [chromium] › tests/tareas-po.spec.js:23:1 › no añade tareas vacías (88ms)
  ✓  5 [chromium] › tests/tareas-po.spec.js:28:1 › completa todas las tareas (297ms)

  5 passed (1.4s)
```

Playwright resuelve la cadena solo: `tareasConTres` necesita `tareas`, que necesita `page`. Las
pruebas que no piden `tareasConTres` no pagan su preparación. **La regla:** la preparación repetida va a
fixtures que se componen; las pruebas solo piden lo que necesitan y se quedan con lo que comprueban.

</details>

## Errores frecuentes

| Síntoma | Causa probable | Cómo arreglarlo |
|---------|----------------|-----------------|
| `Test has unknown parameter "tareas".` | La prueba importa `test` de `@playwright/test` en lugar de `../fixtures.js` | Importar `test` y `expect` desde `../fixtures.js` |
| `Cannot find module '…/paginas/PaginaTareas.js'` | Ruta relativa mal escrita o sin la extensión `.js` (ESM la exige) | `import { PaginaTareas } from './paginas/PaginaTareas.js'` desde `fixtures.js` |
| La prueba no hace nada y el siguiente paso falla | Falta `await` delante de un método del Page Object | `await tareas.anadir(…)` |
| El Page Object crece con `expect` dentro | Mezcla de qué se hace y qué se comprueba | Devolver localizadores y dejar las aserciones en la prueba |

## Conclusiones

### Qué es un Page Object con su fixture

Una clase que sabe **cómo** se localiza y se maneja una pantalla, y una fixture que la prepara para
cada prueba. Las pruebas quedan escritas en el idioma del dominio (`anadir`, `completar`, `borrar`), y
un cambio de la interfaz se arregla en un único sitio.

### Cómo debe ser

| Requisito | En el lab |
|-----------|-----------|
| Un único sitio por localizador | `botonAnadir` en el constructor de `PaginaTareas` |
| Acciones con nombres del dominio | `anadir(...textos)`, `completar(texto)`, `borrar(texto)` |
| Aserciones en las pruebas | El Page Object devuelve `tareas` y `contador(...)` |
| Preparación en fixtures | `tareas` abre la página; `tareasConTres` se apoya en ella |

### Dónde se rompe y cómo lo has detectado

| Fallo | Cómo lo has visto | Qué provoca |
|-------|-------------------|-------------|
| Selectores duplicados | 5 + 5 apariciones con `grep -c` | Un cambio de interfaz obliga a tocar todas las pruebas |
| Cambio de la interfaz | 8 fallos al cambiar «Añadir» por «Guardar» | Suite roja sin error funcional |
| Arreglo disperso | La suite original sigue roja tras arreglar el Page Object | Horas de mantenimiento en suites grandes |

### Cómo se perfecciona

En proyectos grandes hay un Page Object por pantalla o por componente reutilizable (cabecera,
tabla, diálogo), y fixtures para lo que se prepara una y otra vez: sesión iniciada, datos de
partida, la propia página. El riesgo contrario es el Page Object «dios» con cientos de métodos: si no se
entiende de un vistazo, se parte.

### En una frase

> 🔑 Las pruebas dicen qué se comprueba; el Page Object, cómo se llega; y la fixture, qué se prepara: cuando la interfaz cambia, se toca un sitio.
