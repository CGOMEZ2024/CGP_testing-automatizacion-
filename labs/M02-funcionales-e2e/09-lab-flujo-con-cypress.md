# Lab — Un flujo con Cypress

[← Página anterior](08-lab-suite-e2e-de-un-flujo.md) · [Siguiente página →](../M03-testing-apis/README.md)

En este lab practicas el **modelo de comandos y la [retry-ability](../glosario/02-e2e.md#retry-ability) de [Cypress](../glosario/02-e2e.md#cypress)** validando un flujo de
reserva de salas (`ejercicios/M02-09-flujo-con-cypress/`): eliges sala, fecha y hora, pulsas
**Reservar** y el servidor confirma tras un segundo y medio. La prueba de partida espera con
`cy.wait(2000)`; la sustituyes por el [reintento](../glosario/02-e2e.md#reintento) automático de las [aserciones](../glosario/01-fundamentos.md#asercion) y por `cy.intercept`, que
espía y simula la API.

### Objetivo

Comprender cómo Cypress encola comandos y reintenta aserciones: cómo funciona, cómo debe ser, cómo se
detectan sus debilidades y cómo se mejora.

### Punto de partida

- Codespace del curso abierto (`npm run verificar` termina en `Entorno listo`).
- Ejercicio: `ejercicios/M02-09-flujo-con-cypress/`, con la aplicación en `app/`, la prueba en
  `e2e/reserva.cy.js` y la configuración en `cypress.config.js` (todo dentro de la carpeta, sin carpeta `cypress/`).
- La aplicación escucha en el puerto **3209**. El servidor tarda `RETRASO_MS` milisegundos en confirmar
  (1500 por defecto) y recuerda las reservas mientras está en marcha.
- Cypress **no** arranca la aplicación: se trabaja con **dos terminales**.

```bash
# Terminal 1 y terminal 2: entra en la carpeta del ejercicio
cd ejercicios/M02-09-flujo-con-cypress
```

### Qué está pasando

Validar un flujo funcional es comprobar que una secuencia de pasos de negocio llega al resultado
correcto: aquí, que una sala libre se reserva y que una ocupada se rechaza con un mensaje claro. Cypress
lo hace con un modelo distinto al de [Playwright](../glosario/02-e2e.md#playwright):

| | Cypress | Playwright |
|--|--|--|
| Cómo se escribe | `cy.get(...).type(...)`: cada comando se **encola**, sin `await` | `await page.getByLabel(...).fill(...)` |
| Espera de aserciones | `.should(...)` se reintenta hasta 4 s (`defaultCommandTimeout`) | `await expect(...)` se reintenta hasta 5 s |
| Esperar a la red | `cy.intercept(...).as('x')` + `cy.wait('@x')` | `page.waitForResponse(...)` |
| Simular la red | `cy.intercept(ruta, { statusCode, body })` | `page.route(ruta, r => r.fulfill(...))` |
| Arrancar la aplicación | Fuera de Cypress | `webServer` en la configuración |

La **retry-ability** de Cypress funciona así: los comandos que consultan la página (`cy.get`,
`cy.contains`) se repiten junto con la aserción encadenada (`.should`) hasta que la aserción se cumple o
pasan 4 s. Una [espera fija](../glosario/02-e2e.md#espera-fija) (`cy.wait(2000)`) no aporta nada y, si el servidor tarda más, no basta.

En el Codespace, Cypress se lanza con el **Chromium que instala Playwright**: el Electron que trae
dentro está en desuso como navegador de pruebas y en este entorno no consigue grabar capturas ni vídeos.

### 1 — Arrancar la aplicación y mirar la API

En la terminal 1, arranca la aplicación y déjala en marcha durante el lab:

```bash
# Terminal 1: la aplicación (tarda 1500 ms en confirmar cada reserva)
node app/server.mjs
```

En la terminal 2, mira la API: las salas, una reserva y la misma reserva repetida.

```bash
# Terminal 2: salas disponibles
curl -s http://localhost:3209/api/salas
# Una reserva (mide lo que tarda) y la misma otra vez
time curl -s -X POST -H 'content-type: application/json' \
  -d '{"sala":"Sala Sur","fecha":"2027-01-10","hora":"09:00","nombre":"Ana"}' \
  -w "  → HTTP %{http_code}\n" http://localhost:3209/api/reservas
curl -s -X POST -H 'content-type: application/json' \
  -d '{"sala":"Sala Sur","fecha":"2027-01-10","hora":"09:00","nombre":"Luis"}' \
  -w "  → HTTP %{http_code}\n" http://localhost:3209/api/reservas
```

**Resultado esperado:**

```text
Reservas en http://localhost:3209 (el servidor tarda 1500 ms en confirmar)
```

```text
["Sala Norte","Sala Sur","Sala Este"]
{"codigo":"R-0001","sala":"Sala Sur","fecha":"2027-01-10","hora":"09:00","nombre":"Ana"}  → HTTP 201

real	0m1,511s
user	0m0,004s
sys	0m0,004s
{"error":"La sala ya está reservada a esa hora"}  → HTTP 409
```

La reserva tarda 1,5 s y la segunda sobre la misma franja devuelve **409**. Abre el puerto 3209 desde
**Ports** y haz una reserva a mano: el botón queda desactivado y se lee «Enviando…» hasta la confirmación.

### 2 — Ejecutar la prueba de partida

Abre [`e2e/reserva.cy.js`](../../ejercicios/M02-09-flujo-con-cypress/e2e/reserva.cy.js):

```js
describe('Reserva de sala', () => {
  // Fecha al azar para no chocar con las reservas de ejecuciones anteriores (el servidor las recuerda)
  const fecha = `2027-0${1 + Math.floor(Math.random() * 9)}-1${Math.floor(Math.random() * 9)}`;

  it('reserva una sala libre', () => {
    cy.visit('/');
    cy.get('#sala').select('Sala Norte');
    cy.get('#fecha').type(fecha);
    cy.get('#hora').select('10:00');
    cy.get('#nombre').type('Ana');
    cy.contains('button', 'Reservar').click();
    cy.wait(2000);                                   // «lo que tarda el servidor»
    cy.get('#resultado').should('contain', 'confirmada');
  });
});
```

En la terminal 2, guarda la ruta del Chromium de Playwright y lanza Cypress sin interfaz:

```bash
# Terminal 2: el navegador que usará Cypress
CHROMIUM=$(ls ~/.cache/ms-playwright/chromium-*/chrome-linux64/chrome)
# Ejecuta las pruebas de e2e/ (cypress.config.js de esta carpeta)
npx cypress run --browser "$CHROMIUM"
```

**Resultado esperado** (extracto; los tiempos cambian en cada ejecución):

```text
  │ Browser:        Custom Chrome for Testing 159 (headless)                                       │
  ...
  Running:  reserva.cy.js                                                                   (1 of 1)


  Reserva de sala
    ✓ reserva una sala libre (2814ms)


  1 passing (3s)
  ...
    ✔  All specs passed!                        00:02        1        1        -        -        -
```

Pasa, y tarda 2,8 s: los 2 s del `cy.wait` más la carga y el relleno.

### 3 — Quitar la espera fija

Borra la línea `cy.wait(2000);` y vuelve a ejecutar.

```bash
# Terminal 2: misma ejecución sin la espera fija
npx cypress run --browser "$CHROMIUM"
```

**Resultado esperado** (extracto):

```text
  Reserva de sala
    ✓ reserva una sala libre (2248ms)


  1 passing (2s)
```

Sigue pasando, y más rápido. `cy.get('#resultado').should('contain', 'confirmada')` **no mira una
sola vez**: Cypress repite el `get` y la aserción hasta que el texto aparece (a los 1,5 s), con un
máximo de 4 s.

### 4 — Un servidor más lento que la paciencia de Cypress

¿Qué pasa si el servidor tarda 5 s? En la terminal 1, para la aplicación (Ctrl+C) y arráncala más lenta:

```bash
# Terminal 1: el servidor tarda 5 s en confirmar
RETRASO_MS=5000 node app/server.mjs
```

```bash
# Terminal 2: ejecuta y mira qué ha dejado en test-results/
npx cypress run --browser "$CHROMIUM"
ls -R test-results
```

**Resultado esperado** (extracto):

```text
  Reserva de sala
    1) reserva una sala libre


  0 passing (5s)
  1 failing

  1) Reserva de sala
       reserva una sala libre:
     AssertionError: Timed out retrying after 4000ms: expected '<p#resultado>' to contain 'confirmada'
      at Context.eval (webpack:///./e2e/reserva.cy.js:13:25)
  ...
  (Screenshots)

  -  /workspaces/testing-automatizacion-agile-201/ejercicios/M02-09-flujo-con-     (1280x633)
     cypress/test-results/cypress/screenshots/reserva.cy.js/Reserva de sala -- reserv
     a una sala libre (failed).png
```

```text
test-results:
cypress

test-results/cypress:
screenshots

test-results/cypress/screenshots:
reserva.cy.js

test-results/cypress/screenshots/reserva.cy.js:
Reserva de sala -- reserva una sala libre (failed).png
```

`Timed out retrying after 4000ms`: la aserción se reintentó 4 s y el servidor tardó 5. Cypress guarda
una captura del fallo en la carpeta que fija `screenshotsFolder` (dentro del ejercicio). Ábrela: el
resultado dice «Enviando…».

### 5 — Esperar a la petición, no a un tiempo

La prueba no debería adivinar cuánto tarda el servidor: debería esperar **a su respuesta**.
`cy.intercept` espía la petición y le pone un alias; `cy.wait('@alias')` espera a que se complete (hasta
30 s para la respuesta). Sustituye el contenido de `e2e/reserva.cy.js` por:

```js
// Pruebas del flujo de reserva (M02-09)
describe('Reserva de sala', () => {
  // Cada prueba usa una fecha distinta para no chocar con reservas de ejecuciones anteriores
  const fecha = `2027-0${1 + Math.floor(Math.random() * 9)}-1${Math.floor(Math.random() * 9)}`;

  beforeEach(() => {
    cy.intercept('POST', '/api/reservas').as('reserva');      // espía la petición, sin cambiarla
    cy.visit('/');
    cy.get('#sala').select('Sala Norte');
    cy.get('#fecha').type(fecha);
    cy.get('#nombre').type('Ana');
  });

  it('reserva una sala libre', () => {
    cy.get('#hora').select('10:00');
    cy.contains('button', 'Reservar').click();
    cy.wait('@reserva').its('response.statusCode').should('eq', 201);   // espera a la respuesta real
    cy.get('#resultado').should('contain', 'confirmada').and('contain', 'Sala Norte');
  });
});
```

```bash
# Terminal 2: con el servidor todavía a 5 s
npx cypress run --browser "$CHROMIUM"
```

**Resultado esperado** (extracto):

```text
  Reserva de sala
    ✓ reserva una sala libre (5772ms)


  1 passing (6s)
```

Pasa con el servidor lento sin tocar ningún límite: la prueba espera a la respuesta (`201`) y después
comprueba la pantalla. Además, ahora la prueba comprueba **lo que respondió el servidor**, no solo lo que pintó la página.

### 6 — Simular la respuesta del servidor

Para probar el mensaje de sala ocupada no hace falta ocupar una sala de verdad: `cy.intercept` puede
**responder en lugar del servidor** (un *stub*). Vuelve a arrancar la aplicación normal en la terminal 1
(Ctrl+C y `node app/server.mjs`) y añade esta prueba dentro del `describe`:

```js
  it('avisa si la sala está ocupada (respuesta simulada)', () => {
    // Stub: el servidor no llega a recibir la petición; Cypress responde un 409
    cy.intercept('POST', '/api/reservas', {
      statusCode: 409,
      body: { error: 'La sala ya está reservada a esa hora' },
    }).as('ocupada');
    cy.get('#hora').select('11:00');
    cy.contains('button', 'Reservar').click();
    cy.wait('@ocupada');
    cy.get('#resultado').should('have.class', 'error').and('have.text', 'La sala ya está reservada a esa hora');
  });
```

```bash
# Terminal 2: las dos pruebas
npx cypress run --browser "$CHROMIUM"
```

**Resultado esperado** (extracto):

```text
  Reserva de sala
    ✓ reserva una sala libre (2221ms)
    ✓ avisa si la sala está ocupada (respuesta simulada) (665ms)


  2 passing (3s)
```

La prueba simulada tarda 665 ms: no hay servidor de por medio. El `intercept` de la prueba, declarado
después del del `beforeEach`, tiene prioridad sobre él para esa petición.

### 7 — Vídeo de la ejecución

En `cypress.config.js`, cambia `video: false` por `video: true` y ejecuta:

```bash
# Terminal 2: con vídeo
npx cypress run --browser "$CHROMIUM"
ls -R test-results
```

**Resultado esperado** (extracto):

```text
  │ Video:        true                                                                             │
  ...
  (Video)

  -  Video output: /workspaces/testing-automatizacion-agile-201/ejercicios/M02-09-flujo-con-cypress/test-results/cypress/videos/reserva.cy.js.mp4
```

```text
test-results/cypress/videos:
reserva.cy.js.mp4
```

Un `.mp4` por fichero de pruebas (*spec*), con todas sus pruebas. La solución tiene vídeo activado y
las dos pruebas; se ejecuta con su propio fichero de configuración:

```bash
# Terminal 2: la solución
npx cypress run --browser "$CHROMIUM" --config-file solucion/cypress.config.js
```

## Comprueba tu entendimiento

**La paciencia de Cypress se puede ajustar**
Con el servidor a 5 s y la prueba del paso 3 (sin intercept), ejecuta `npx cypress run --browser "$CHROMIUM" --config defaultCommandTimeout=8000`.
→ `✓ reserva una sala libre (5747ms)`: con 8 s de reintento, la aserción llega a ver la confirmación.

**Espiar no es simular**
En la prueba del paso 6, cambia el `statusCode` del *stub* por `201` y el `body` por `{ codigo: 'R-9999', sala: 'Sala Norte', fecha: '2027-01-01', hora: '11:00' }`, y la última aserción por `.should('contain', 'R-9999')`.
→ Pasa: la página pinta la reserva `R-9999` que nunca existió en el servidor. Un *stub* prueba la interfaz, no el backend. Deja la prueba como estaba.

## Experimenta

**Predice** qué tarda más en la prueba del paso 5 con el servidor a 1,5 s: ¿lo que tarda la reserva o lo
que tarda Cypress en comprobar la pantalla? Ejecuta con `RETRASO_MS=1500` y con `RETRASO_MS=5000` y
compara los tiempos de `reserva una sala libre` (2,2 s frente a 5,8 s en las ejecuciones de este lab):
la diferencia es casi exactamente la del servidor. La prueba ya no tiene «colchón»: dura lo que tarda la aplicación.

## Reto

### 1 — Una reserva doble contra el servidor real

**La situación:** la prueba del 409 está simulada. Un compañero pregunta si el servidor **de verdad**
rechaza una reserva doble, porque el *stub* solo demuestra que la página pinta bien el mensaje.

**Qué haces:** añade una tercera prueba, sin *stub*, que reserva la `Sala Norte` a las 12:00 y vuelve a
pulsar **Reservar** con los mismos datos. Comprueba los dos [códigos de estado](../glosario/03-apis.md#codigo-de-estado) y el mensaje final.

**Pistas:** el `beforeEach` ya espía `POST /api/reservas` con el alias `@reserva`; `cy.wait('@reserva')`
se puede usar dos veces y cada una espera a la siguiente petición.

**Lo que buscas:** tres pruebas en verde: la reserva normal, la simulada y la doble real (201 y luego 409).

<details>
<summary>Ver solución</summary>

```js
  it('rechaza reservar dos veces la misma franja (servidor real)', () => {
    cy.get('#hora').select('12:00');
    cy.contains('button', 'Reservar').click();
    cy.wait('@reserva').its('response.statusCode').should('eq', 201);

    cy.contains('button', 'Reservar').click();                 // misma sala, fecha y hora
    cy.wait('@reserva').its('response.statusCode').should('eq', 409);
    cy.get('#resultado').should('have.text', 'La sala ya está reservada a esa hora');
  });
```

```text
  Reserva de sala
    ✓ reserva una sala libre (2250ms)
    ✓ avisa si la sala está ocupada (respuesta simulada) (637ms)
    ✓ rechaza reservar dos veces la misma franja (servidor real) (3641ms)


  3 passing (7s)
```

La prueba real tarda 3,6 s (dos respuestas de 1,5 s) y la simulada 0,6 s. Las dos son útiles: la
simulada comprueba la **página** ante cualquier respuesta (también las difíciles de provocar, como un
500); la real comprueba la **regla de negocio** del servidor. **La regla:** se simula la red para probar
cómo reacciona la interfaz, y se deja pasar la petición real para probar el flujo completo; un *stub*
nunca sustituye a la prueba del comportamiento real.

</details>

## Errores frecuentes

| Síntoma | Causa probable | Cómo arreglarlo |
|---------|----------------|-----------------|
| `Cypress could not verify that this server is running:` `> http://localhost:3209` | La aplicación no está arrancada (Cypress no tiene `webServer`) | `node app/server.mjs` en la terminal 1 |
| `Warning: The Electron browser is deprecated…` y sin capturas ni vídeo | Se lanzó sin `--browser` y usa Electron | `npx cypress run --browser "$CHROMIUM"` |
| `Timed out retrying after 4000ms` con la aplicación correcta | La respuesta tarda más que `defaultCommandTimeout` | `cy.intercept` + `cy.wait('@alias')` antes de la aserción |
| `La sala ya está reservada a esa hora` en la reserva normal | El servidor recuerda reservas de ejecuciones anteriores con la misma fecha | Fecha al azar (como en el ejercicio) o reiniciar la aplicación |
| Se crea una carpeta `cypress/` en el ejercicio | Falta alguna ruta (`screenshotsFolder`, `videosFolder`…) en la configuración | Revisar `cypress.config.js`: todas apuntan a `test-results/cypress/` |

## Conclusiones

### Qué es el modelo de Cypress

Cada `cy.…` encola un comando que Cypress ejecuta dentro del navegador, en orden. Las consultas
(`cy.get`, `cy.contains`) se reintentan junto con su `.should` hasta 4 s (**retry-ability**), y
`cy.intercept` permite espiar o simular la red y esperar a una petición concreta con `cy.wait('@alias')`.

### Cómo debe ser

| Requisito | En el lab |
|-----------|-----------|
| Sin esperas fijas | Fuera `cy.wait(2000)`: de 2,8 s a 2,2 s y sin riesgo con servidores lentos |
| Esperar a la red con alias | `cy.intercept(...).as('reserva')` + `cy.wait('@reserva')` |
| Comprobar la respuesta, no solo la pantalla | `its('response.statusCode').should('eq', 201)` |
| *Stubs* para los casos difíciles de provocar | 409 simulado en 665 ms |
| El comportamiento real también probado | Reserva doble contra el servidor: 201 y 409 |
| Evidencias dentro del ejercicio | Captura y vídeo en `test-results/cypress/` |

### Dónde se rompe y cómo lo has detectado

| Fallo | Cómo lo has visto | Qué provoca |
|-------|-------------------|-------------|
| Espera fija | 2 s perdidos en cada ejecución del paso 2 | Suites lentas y frágiles |
| Servidor más lento que el reintento | `Timed out retrying after 4000ms` con `RETRASO_MS=5000` | Falso fallo con la aplicación correcta |
| Solo *stubs* | El reto: el 409 simulado no demuestra que el servidor lo haga | Una regla de negocio sin probar |

### Cómo se perfecciona

En un proyecto real, `cypress open` (con escritorio) se usa para escribir y depurar las pruebas con su
viaje en el tiempo, y `cypress run` para CI. Los *stubs* se guardan como ficheros de datos
(*[fixtures](../glosario/02-e2e.md#fixture)* de Cypress) cuando las respuestas son grandes, y el arranque de la aplicación se automatiza
fuera de Cypress (un script de `package.json` o el propio [pipeline](../glosario/04-ci-cd.md#pipeline)).

### En una frase

> 🔑 En Cypress no se espera un tiempo: se encadena una aserción que se reintenta o se espera a la petición con `cy.intercept` y su alias.
