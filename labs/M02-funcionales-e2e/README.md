# M02 — Automatización de pruebas funcionales y E2E

[← Página anterior](../M01-introduccion-automatizacion/06-lab-pruebas-independientes.md) · [Siguiente página →](00-playwright-y-cypress.md)

Una prueba [end-to-end](../glosario/01-fundamentos.md#prueba-end-to-end) hace lo que haría una persona delante del navegador: abre la página, escribe,
pulsa y comprueba lo que ve. Es la prueba que más se parece al uso real y también la más cara y la más
frágil. Este módulo trata las dos caras: **automatizar flujos web** con [Playwright](../glosario/02-e2e.md#playwright) y [Cypress](../glosario/02-e2e.md#cypress), y hacerlo
de forma que las pruebas **no se rompan por lo que no importa** (un rediseño, una API lenta, un
servicio que falla a veces) y **sí avisen de lo que importa**. Cada lab es un ejercicio pequeño e
independiente (`ejercicios/M02-NN-…`) con su aplicación mínima.

## Qué aprenderás

- Escribir y ejecutar la misma prueba en Playwright y en Cypress, y elegir herramienta por su arquitectura.
- Localizar elementos como los encuentra el usuario (rol, etiqueta, `data-testid`) para que un rediseño no rompa la suite.
- Sincronizar la prueba con la página sin pausas fijas, y medir la inestabilidad con `--repeat-each`.
- Probar formularios con una tabla de casos: un camino feliz y una fila por regla de validación.
- Diagnosticar un fallo con captura, vídeo y traza sin repetir la ejecución.
- Distinguir una prueba *flaky* de una rota y reintentar solo lo que tiene sentido.
- Mantener la suite con [Page Objects](../glosario/02-e2e.md#page-object) y [fixtures](../glosario/02-e2e.md#fixture), y organizarla con `describe`, etiquetas, sesión guardada y proyectos.

## Teoría

### Funcional frente a end-to-end

| | [Prueba funcional](../glosario/01-fundamentos.md#prueba-funcional) | Prueba end-to-end (E2E) |
|--|--|--|
| **Qué pregunta** | ¿Hace esta funcionalidad lo que dice el requisito? | ¿Funciona el recorrido completo del usuario, con todas las piezas? |
| **Alcance** | Una funcionalidad (validar un formulario, aplicar un cupón) | Un flujo de negocio (login → catálogo → carrito → pedido) |
| **Por dónde entra** | Interfaz o API | Siempre por la interfaz, con el sistema completo |
| **En el módulo** | Labs 01 a 07 | Labs 08 y 09 |

> [!NOTE]
> Las dos se automatizan con las mismas herramientas en este módulo: la diferencia está en **qué** se
> comprueba, no en **con qué**. Por la [pirámide de pruebas](../glosario/01-fundamentos.md#piramide-de-pruebas), las E2E son pocas y cubren los flujos que
> más cuesta romper.

### Las dos herramientas

| | Playwright | Cypress |
|--|--|--|
| Dónde corre la prueba | En Node.js, fuera del navegador ([CDP](../glosario/02-e2e.md#cdp) en Chromium) | Dentro del navegador |
| Estilo | `await page.…` y `await expect(...)` | Comandos `cy.…` encolados y `.should(...)` |
| [Espera automática](../glosario/02-e2e.md#espera-automatica) | Acciones (accionable) y [aserciones](../glosario/01-fundamentos.md#asercion) web-first: 5 s | Consultas + `.should`: 4 s |
| Arranque de la app | `webServer` en la configuración | Aparte |
| En el curso | Labs 01 a 08 | Demo 00 y lab 09 |

### Lo que hace frágil una prueba de navegador

| Causa | Síntoma | Remedio | Lab |
|-------|---------|---------|-----|
| Selector atado a la maqueta | Falla tras un rediseño sin cambio funcional | `getByRole`, `getByLabel`, `getByTestId` | 02 |
| [Espera fija](../glosario/02-e2e.md#espera-fija) | Pasa y falla sin cambiar nada | [Aserciones web-first](../glosario/02-e2e.md#asercion-web-first), `waitForResponse` | 01, 03 |
| Servicio inestable | Rojo a ratos; con [reintentos](../glosario/02-e2e.md#reintento), *flaky* | `toPass`, `expect.poll`, medir y vigilar | 06 |
| Duplicación | Un cambio de interfaz rompe muchas pruebas | Page Object y fixtures | 07 |
| Dependencia entre pruebas | Falla según el orden | Cada prueba prepara su estado | 08 |

> [!TIP]
> Cuando una prueba E2E falla, el orden es: leer el error, mirar `error-context.md` (el árbol de
> accesibilidad de la página en el fallo) y, si no basta, la traza (lab 05). Tocar la prueba es lo último.

## Páginas

<!-- gen:paginas -->
| # | Página | Qué hay |
|---|--------|---------|
| 00 | [Playwright y Cypress](00-playwright-y-cypress.md) | Demostración: la misma prueba en las dos herramientas, grabada con [codegen](../glosario/05-calidad-e-ia.md#codegen) y ejecutada en ambas |
| 01 | [Lab — Navegación web](01-lab-navegacion-web.md) | Recorres un sitio de tres páginas con Playwright y compruebas URL, título y contenido |
| 02 | [Lab — Selectores estables](02-lab-selectores-estables.md) | Un rediseño rompe los selectores CSS; los cambias por roles, etiquetas y data-testid |
| 03 | [Lab — Sincronización](03-lab-sincronizacion.md) | Una página que carga datos con retraso hace fallar un waitForTimeout; lo sustituyes por esperas automáticas |
| 04 | [Lab — Formularios y validaciones](04-lab-formularios-y-validaciones.md) | Rellenas un formulario de alta, provocas cada mensaje de validación y compruebas el envío |
| 05 | [Lab — Evidencias](05-lab-evidencias.md) | Capturas pantallazos, vídeo y traza de un fallo y lo diagnosticas con el [Trace Viewer](../glosario/02-e2e.md#trace-viewer) |
| 06 | [Lab — Errores y reintentos](06-lab-errores-y-reintentos.md) | Un servicio que falla a veces: configuras reintentos, expect.poll y distingues flaky de roto |
| 07 | [Lab — Page Objects y fixtures](07-lab-page-objects.md) | Refactorizas pruebas duplicadas a un Page Object y una fixture, y un cambio de UI se arregla en un sitio |
| 08 | [Lab — Suite E2E de un flujo](08-lab-suite-e2e-de-un-flujo.md) | Automatizas el flujo login → carrito → pedido de una tienda mínima como suite con etiquetas y proyectos |
| 09 | [Lab — Un flujo con Cypress](09-lab-flujo-con-cypress.md) | Validas un flujo de reserva con Cypress, cy.intercept y su reintento de aserciones |

→ Empieza por **[00 — Playwright y Cypress](00-playwright-y-cypress.md)**.
<!-- /gen:paginas -->


## Conclusiones del módulo

### Qué es automatizar pruebas funcionales y E2E

Describir con código lo que haría una persona en el navegador y comprobar lo que vería, con
herramientas que controlan un navegador real (Playwright desde fuera, Cypress desde dentro).

### Cómo debe ser una suite de navegador

| Requisito | Dónde se ha visto |
|-----------|-------------------|
| [Localizadores](../glosario/02-e2e.md#localizador) por rol, etiqueta o contrato | 02: pasa en el diseño y en el rediseño |
| Ninguna espera fija | 01, 03, 09: de 8/10 a 10/10, y la mitad de tiempo |
| Una regla, una prueba; datos únicos | 04: tabla de casos y correo con `Date.now()` |
| Evidencias de los fallos | 05: la traza mostró el 404 que la pantalla callaba |
| Reintentos acotados y vigilados | 06: `toPass`, `expect.poll`, `--fail-on-flaky-tests` |
| Mantenible y organizada | 07 y 08: Page Object, fixtures, `@smoke`, `storageState`, proyectos |

### Dónde se rompe

En lo que no es la funcionalidad: la maqueta, el reloj, la red y el [estado compartido](../glosario/01-fundamentos.md#estado-compartido). Cada lab ha
provocado uno de esos fallos y lo ha medido antes de corregirlo.

### En una frase

> 🔑 Una prueba E2E útil se escribe como la usa una persona, espera a lo que pasa y no a un tiempo, guarda pruebas de sus fallos y se mantiene en un solo sitio.
