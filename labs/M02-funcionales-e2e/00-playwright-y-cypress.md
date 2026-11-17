# Playwright y Cypress

[← Página anterior](README.md) · [Siguiente página →](01-lab-navegacion-web.md)

Una lista de la compra con un campo, un botón y una lista: lo mínimo para ver una prueba de
navegador de principio a fin. La misma prueba (añadir «Leche» y comprobar que aparece) está escrita
dos veces, en **[Playwright](../glosario/02-e2e.md#playwright)** y en **[Cypress](../glosario/02-e2e.md#cypress)**, y una tercera vez grabada con el generador de código
de Playwright. Así se ve qué tienen en común las dos herramientas y dónde se separan.

## Punto de partida

- Codespace del curso abierto (`npm run verificar` termina en `Entorno listo`).
- Ejercicio: `ejercicios/M02-00-playwright-y-cypress/`, con la aplicación en `app/`, la prueba de
  Playwright en `playwright/` y la de Cypress en `cypress-e2e/`.
- La aplicación escucha en el puerto **3200**. Playwright la arranca solo; para Cypress va en otra terminal.
- Para ver navegadores con interfaz: el escritorio noVNC del puerto **6080** (pestaña **Ports**,
  contraseña `curso`).

```bash
# Entra en la carpeta del ejercicio
cd ejercicios/M02-00-playwright-y-cypress
```

## Recorrido

### 1 — La aplicación

`app/public/index.html` es una página estática: un formulario con la etiqueta **Producto**, el
botón **Añadir**, un contador («0 productos») y una lista vacía. Un pequeño script añade cada producto a
la lista y actualiza el contador. `app/server.mjs` la sirve con `node:http`, sin dependencias.

```bash
# Arranca la aplicación (Ctrl+C para pararla)
node app/server.mjs
```

```text
Aplicación en http://localhost:3200
```

Desde la pestaña **Ports**, el puerto 3200 abre la página en el navegador del equipo.

### 2 — Grabar la prueba con codegen

Con la aplicación en marcha, `codegen` abre un Chromium y el **Playwright Inspector**. Todo lo que se
hace en ese navegador se convierte en código. En el Codespace se ve en el escritorio noVNC (puerto 6080).

```bash
# Terminal 2: abre el grabador sobre la aplicación y guarda el resultado en un fichero
npx playwright codegen -o playwright/grabada.spec.js http://localhost:3200
```

En la grabación se pulsa el campo **Producto**, se escribe `Leche` y se pulsa **Añadir**. Después,
con el botón del ojo de la barra flotante (**Assert visibility**) se pulsa sobre «Leche» y sobre «1 producto».
Al cerrar el navegador, el fichero contiene:

```js
import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('http://localhost:3200/');
  await page.getByRole('textbox', { name: 'Producto' }).click();
  await page.getByRole('textbox', { name: 'Producto' }).fill('Leche');
  await page.getByRole('button', { name: 'Añadir' }).click();
  await expect(page.getByText('Leche')).toBeVisible();
  await expect(page.getByText('1 producto')).toBeVisible();
});
```

El grabador no escribe `#producto` ni `button:nth-child(2)`: elige **[localizadores](../glosario/02-e2e.md#localizador) por rol y por
nombre accesible** (`getByRole('textbox', { name: 'Producto' })`), los mismos que usaría una persona
con un lector de pantalla. También deja cosas que sobran (el `click` antes del `fill`, la URL completa en
lugar de la de la configuración, el nombre `test`). Es un punto de partida, no la prueba terminada.

### 3 — La prueba de Playwright, escrita a mano

`playwright/lista.spec.js` es la versión limpia de lo grabado:

```js
// La prueba de la lista de la compra, en Playwright
import { test, expect } from '@playwright/test';

test('añade un producto a la lista', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel('Producto').fill('Leche');
  await page.getByRole('button', { name: 'Añadir' }).click();
  await expect(page.getByRole('listitem')).toHaveText(['Leche']);
  await expect(page.getByText('1 producto', { exact: true })).toBeVisible();
});
```

Cada línea es una promesa con `await`: el código de la prueba corre en **Node.js** y manda órdenes al
navegador. `playwright.config.js` pone la URL base (`baseURL`) y, con `webServer`, arranca la
aplicación antes de las pruebas:

```js
export default defineConfig({
  testDir: './playwright',
  outputDir: './test-results',
  reporter: 'list',
  use: { baseURL: 'http://localhost:3200' },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: 'node app/server.mjs',          // Playwright arranca la app antes de las pruebas
    url: 'http://localhost:3200',
    reuseExistingServer: true,               // si ya está en marcha, la reutiliza
  },
});
```

```bash
# Ejecuta las dos pruebas de Playwright (la grabada y la escrita a mano)
npx playwright test
```

Resultado (los tiempos cambian en cada ejecución):

```text
Running 2 tests using 2 workers

  ✓  2 [chromium] › playwright/lista.spec.js:4:1 › añade un producto a la lista (370ms)
  ✓  1 [chromium] › playwright/grabada.spec.js:3:1 › test (403ms)

  2 passed (1.6s)
```

Las dos pruebas corren **en paralelo** («2 workers»), cada una en su propio contexto de navegador
aislado, sin coste extra de configuración.

### 4 — La misma prueba en Cypress

`cypress-e2e/lista.cy.js` hace lo mismo con la API de Cypress:

```js
// La misma prueba de la lista de la compra, en Cypress
describe('Lista de la compra', () => {
  it('añade un producto a la lista', () => {
    cy.visit('/');
    cy.get('#producto').type('Leche');
    cy.contains('button', 'Añadir').click();
    cy.get('li').should('have.length', 1).and('have.text', 'Leche');
    cy.contains('1 producto').should('be.visible');
  });
});
```

No hay `await`: cada `cy.…` **encola un comando** y Cypress los ejecuta en orden dentro del propio
navegador. Las [aserciones](../glosario/01-fundamentos.md#asercion) van encadenadas con `should`, y Cypress las reintenta hasta que se cumplen
o pasan 4 segundos. `cypress.config.js` deja todo dentro de la carpeta del ejercicio:

```js
export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3200',        // Cypress no arranca la app: va en otra terminal
    specPattern: 'cypress-e2e/**/*.cy.js',   // dónde están las pruebas
    supportFile: false,                      // sin fichero de soporte
  },
  fixturesFolder: false,
  screenshotsFolder: 'test-results/cypress/screenshots',
  videosFolder: 'test-results/cypress/videos',
  downloadsFolder: 'test-results/cypress/downloads',
  video: false,
});
```

Cypress no tiene un `webServer`: la aplicación tiene que estar ya en marcha (paso 1, terminal 1).
Se lanza en modo sin interfaz con `cypress run`, indicándole el Chromium que instala Playwright:

```bash
# Terminal 2: ruta del Chromium de Playwright (Cypress lo usa como navegador)
CHROMIUM=$(ls ~/.cache/ms-playwright/chromium-*/chrome-linux64/chrome)
# Ejecuta las pruebas de Cypress sin interfaz
npx cypress run --browser "$CHROMIUM"
```

Resultado (extracto; los tiempos cambian en cada ejecución):

```text
  (Run Starting)

  ┌────────────────────────────────────────────────────────────────────────────────────────────────┐
  │ Cypress:        16.3.0                                                                         │
  │ Browser:        Custom Chrome for Testing 159 (headless)                                       │
  │ Specs:          1 found (lista.cy.js)                                                          │
  │ Searched:       cypress-e2e/**/*.cy.js                                                         │
  └────────────────────────────────────────────────────────────────────────────────────────────────┘

  Running:  lista.cy.js                                                                     (1 of 1)


  Lista de la compra
    ✓ añade un producto a la lista (330ms)


  1 passing (363ms)

  ...

       Spec                                              Tests  Passing  Failing  Pending  Skipped
  ┌────────────────────────────────────────────────────────────────────────────────────────────────┐
  │ ✔  lista.cy.js                              366ms        1        1        -        -        - │
  └────────────────────────────────────────────────────────────────────────────────────────────────┘
    ✔  All specs passed!                        366ms        1        1        -        -        -
```

Sin `--browser`, Cypress usa el Electron que trae dentro y avisa de que está en desuso como
navegador de pruebas:

```text
  │ Browser:        Electron 150 (headless) (deprecated)                                           │

Warning: The Electron browser is deprecated as a test browser and will be removed in a future version of Cypress.
```

Por eso en el curso se le pasa el Chromium de Playwright: además, las dos herramientas prueban sobre el mismo navegador.

### 5 — Dos arquitecturas

Las dos pruebas comprueban lo mismo, pero las herramientas están construidas al revés:

| | Playwright | Cypress |
|--|--|--|
| **Dónde corre la prueba** | Fuera del navegador, en Node.js; habla con él por un protocolo ([CDP](../glosario/02-e2e.md#cdp) en Chromium) | Dentro del navegador, en el mismo bucle de eventos que la aplicación |
| **Estilo del código** | `async`/`await` explícito | Cadena de comandos `cy.…` encolados, sin `await` |
| **Lenguajes** | JavaScript/TypeScript, Python, Java, .NET | JavaScript/TypeScript |
| **Navegadores** | Chromium, Firefox, WebKit | Chrome/Chromium, Edge, Firefox, Electron (sin WebKit estable) |
| **Varias pestañas o ventanas** | Sí: cada `page` es una pestaña; varios contextos aislados | No: una pestaña por prueba |
| **iframes** | `frameLocator()` / `contentFrame()` | Acceso manual al documento del iframe; mismo origen |
| **Arranque de la aplicación** | `webServer` en la configuración | Fuera de Cypress (otra terminal o una herramienta aparte) |
| **[Paralelismo](../glosario/05-calidad-e-ia.md#paralelismo)** | Workers locales incluidos | Una spec tras otra en local; en paralelo con servicio de pago o varias máquinas de CI |
| **Depuración** | [Trace Viewer](../glosario/02-e2e.md#trace-viewer), modo UI, Inspector | Runner interactivo con viaje en el tiempo (`cypress open`) |

> [!NOTE]
> Ninguna es «la buena». Cypress da una experiencia de depuración muy visual dentro del navegador;
> Playwright llega a más navegadores, pestañas y lenguajes porque controla el navegador desde fuera.
> En el curso se usa Playwright en casi todos los labs y Cypress en [09 — Un flujo con Cypress](09-lab-flujo-con-cypress.md).

## Qué queda visto

La misma comprobación funcional (añadir un producto y verlo en la lista) automatizada con dos
herramientas: una grabada con `codegen` y retocada, otra escrita a mano en Playwright y otra en Cypress.
Las tres pasan, pero se escriben, se configuran y se ejecutan de forma distinta: Playwright arranca la
aplicación y corre en paralelo; Cypress necesita la aplicación ya levantada y encola comandos dentro del navegador.

El laboratorio [01 — Navegación web](01-lab-navegacion-web.md) recorre un sitio de varias páginas con
Playwright y se puede hacer sin haber seguido esta demostración. Queda abierta la pregunta: si la
página tarda en cambiar su título o en pintar una lista, ¿por qué una prueba que «mira» en el momento
equivocado falla y otra que dice lo mismo con `await expect(...)` pasa?
