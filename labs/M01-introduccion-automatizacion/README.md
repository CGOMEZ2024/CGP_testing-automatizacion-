# M01 — Introducción a la automatización de pruebas

[← Página anterior](../../README.md) · [Siguiente página →](00-testing-en-agile-y-devops.md)

Este módulo pone la base de todo el curso: por qué en un equipo Agile o DevOps las pruebas tienen
que ser código que se ejecuta solo en cada cambio, qué tipos de prueba existen y cuánto cuesta
cada uno. Se trabaja con el entorno del curso ya montado (Codespaces, [Vitest](../glosario/01-fundamentos.md#vitest) y [Playwright](../glosario/02-e2e.md#playwright)) y con
ejercicios pequeños e independientes: una función de descuentos, una API de tareas, una
calculadora de envío y un carrito. Cada uno hace visible una idea: los [casos límite](../glosario/01-fundamentos.md#caso-limite), lo que un [mock](../glosario/01-fundamentos.md#mock)
esconde, el coste de cada nivel de la [pirámide](../glosario/01-fundamentos.md#piramide-de-pruebas) y el daño del [estado compartido](../glosario/01-fundamentos.md#estado-compartido).

## Qué aprenderás

- Abrir el entorno de pruebas del curso y comprobar que es el mismo para todos.
- Distinguir una [prueba unitaria](../glosario/01-fundamentos.md#prueba-unitaria), de integración, de API y [end-to-end](../glosario/01-fundamentos.md#prueba-end-to-end) por lo que ponen en marcha y lo que cuestan.
- Escribir pruebas con la estructura [preparar, actuar, comprobar](../glosario/01-fundamentos.md#preparar-actuar-comprobar) y elegir los casos límite que encuentran errores.
- Probar una API arrancando su servidor dentro de la prueba, con sus piezas reales.
- Medir una suite y decidir en qué nivel va cada comprobación.
- Detectar pruebas que dependen unas de otras y hacerlas independientes.

## Teoría

### Por qué automatizar en Agile y DevOps

Con entregas frecuentes, repetir a mano todas las pruebas antes de cada versión es imposible. Las
[pruebas automatizadas](../glosario/01-fundamentos.md#prueba-automatizada) forman parte de la *[Definition of Done](../glosario/01-fundamentos.md#definition-of-done)*, se ejecutan en [integración continua](../glosario/01-fundamentos.md#integracion-continua)
en cada pull request y dan **feedback rápido**: cuanto antes avisa una prueba, menos cuesta
arreglar lo que ha roto. Probar antes y más cerca del código es lo que se llama **[shift-left](../glosario/01-fundamentos.md#shift-left)**.

### Los niveles de prueba

| Nivel | Qué pone en marcha | Ejemplo en este módulo | Coste medido |
|-------|--------------------|------------------------|--------------|
| Unitaria | Una función, en memoria | `calcularDescuento(100)` | 0–2 ms por prueba |
| Integración / API | Varias piezas reales, por HTTP | `POST /api/tareas` con servidor y almacén reales | 3–20 ms por prueba |
| End-to-end | Navegador, página, API y lógica | Rellenar el formulario y leer «4.95 €» | 130–250 ms por prueba; 5 s al fallar |

> [!NOTE]
> «Funcional» no es un nivel, es un propósito: comprobar que una funcionalidad cumple su requisito.
> Una [prueba funcional](../glosario/01-fundamentos.md#prueba-funcional) puede hacerse contra la API o contra la interfaz.

### La pirámide y su anti-patrón

Muchas unitarias, algunas de integración y API, pocas E2E. Su contrario, el **[cono de helado](../glosario/01-fundamentos.md#cono-de-helado)**
(casi todo E2E), da suites lentas que tardan en avisar y señalan una pantalla en lugar de una
función. El **trofeo** pone el peso en la integración; las dos formas coinciden en lo esencial:
cada comprobación en el nivel más barato que la detecta.

> [!WARNING]
> Una suite en verde solo dice que las pruebas que existen pasan. Sin casos límite, con mocks que
> no se parecen a la realidad o con pruebas que dependen del orden, el verde no protege de nada.

## Páginas

<!-- gen:paginas -->
| # | Página | Qué hay |
|---|--------|---------|
| 00 | [Testing en Agile y DevOps](00-testing-en-agile-y-devops.md) | Por qué se automatiza, shift-left, pirámide, tipos de pruebas y estrategias |
| 01 | [Lab — Preparar el entorno](01-lab-preparar-el-entorno.md) | Abres el Codespace, compruebas las herramientas y ejecutas la [suite de humo](../glosario/01-fundamentos.md#prueba-de-humo) del curso |
| 02 | [Una funcionalidad, tres niveles](02-una-funcionalidad-tres-niveles.md) | Demostración: el mismo cálculo de precio probado como unitaria, API y end-to-end, con sus tiempos |
| 03 | [Lab — Primera prueba unitaria](03-lab-primera-prueba-unitaria.md) | Escribes con Vitest las pruebas de una función de descuentos y encuentras su error de límites |
| 04 | [Lab — Prueba de integración](04-lab-prueba-de-integracion.md) | Pruebas un endpoint HTTP arrancado en el propio test, con su almacén real en memoria |
| 05 | [Lab — La pirámide en números](05-lab-piramide-de-pruebas.md) | Mides una suite con forma de cono de helado y bajas comprobaciones de nivel hasta darle forma de pirámide |
| 06 | [Lab — Pruebas independientes](06-lab-pruebas-independientes.md) | Una suite pasa en orden y falla al barajarla; eliminas el estado compartido |

→ Empieza por **[00 — Testing en Agile y DevOps](00-testing-en-agile-y-devops.md)**.
<!-- /gen:paginas -->

## Conclusiones del módulo

### Qué es automatizar pruebas en un equipo Agile

Convertir las comprobaciones en código que se ejecuta solo, en un entorno igual para todos, en
cada cambio. No sustituye la exploración manual: la libera de lo repetitivo.

### Cómo debe ser una suite

| Requisito | Dónde lo has visto |
|-----------|--------------------|
| [Entorno reproducible](../glosario/01-fundamentos.md#entorno-reproducible) | `npm run verificar` y la suite de humo, iguales en cada Codespace |
| Casos límite, no solo el camino feliz | El error de `>` frente a `>=` solo apareció con 100 € justos |
| Piezas reales donde importa cómo encajan | La integración encontró el `guardar` que el mock escondía |
| Cada comprobación en su nivel | El aviso del error de tarifa pasó de 14.4 s a 170 ms |
| Pruebas independientes | 5 de 8 órdenes fallaban; tras el arreglo, 8 de 8 en verde |

### Dónde se rompe

| Anti-patrón | Síntoma |
|-------------|---------|
| Solo camino feliz | Todo verde con el error dentro |
| Mock distinto de la realidad | Unitaria verde, API respondiendo `500` |
| Cono de helado | Suite lenta; los fallos esperan el timeout de 5 s |
| Estado compartido | Pasa en orden, falla sola o barajada |

### En una frase

> 🔑 Una suite automatizada vale lo que tarda en avisar y lo bien que señala la causa: casos
> límite, cada comprobación en su nivel y pruebas que no dependen unas de otras.
