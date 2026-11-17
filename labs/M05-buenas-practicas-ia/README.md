# M05 — Buenas prácticas y automatización asistida por IA

[← Página anterior](../M04-ci-cd-testing-continuo/07-lab-entornos-efimeros.md) · [Siguiente página →](00-por-que-falla-a-veces.md)

Una suite automatizada solo sirve si el equipo se fía de ella y la puede mantener. Este módulo trata lo
que pasa cuando la suite ya existe: pruebas que fallan a veces, cobertura que engaña, ejecuciones que
tardan demasiado, pruebas copiadas y pegadas que nadie quiere tocar. Y añade una herramienta nueva al
trabajo diario, **[GitHub Copilot](../glosario/05-calidad-e-ia.md#github-copilot)**, para generar, depurar y refactorizar pruebas sin perder el control
de lo que comprueban.

## Qué aprenderás

- Detectar una [prueba inestable](../glosario/05-calidad-e-ia.md#flaky-test) repitiéndola en paralelo, leer en su traza por qué falla y corregir la
  causa ([espera fija](../glosario/02-e2e.md#espera-fija), animación, [datos compartidos](../glosario/05-calidad-e-ia.md#aislamiento-de-datos)) en lugar de reintentarla.
- Distinguir una cobertura del 100 % de una suite que de verdad detecta errores, con [mutation testing](../glosario/05-calidad-e-ia.md#mutation-testing).
- Medir el tiempo de una suite y reducirlo con [paralelismo](../glosario/05-calidad-e-ia.md#paralelismo), [sesión reutilizada](../glosario/05-calidad-e-ia.md#storage-state) y [preparación por API](../glosario/05-calidad-e-ia.md#preparacion-por-api).
- Convertir pruebas duplicadas en una [prueba parametrizada](../glosario/05-calidad-e-ia.md#prueba-parametrizada) que se lee como una tabla de reglas.
- Pedir a Copilot pruebas y diagnósticos, ejecutarlos y revisarlos con criterios objetivos antes de
  darlos por buenos.

## Teoría

### Una suite es código que se mantiene

Las pruebas tienen los mismos problemas que el código de producción (duplicación, nombres que no dicen
nada, dependencias ocultas) y uno propio: **si una prueba miente, nadie lo nota** hasta que deja pasar
un error. Las cuatro primeras páginas atacan cuatro formas de mentir o de estorbar:

| Problema | Síntoma | Cómo se mide | Página |
|----------|---------|--------------|--------|
| Flaky test | Falla «a veces» sin cambiar el código | `--repeat-each`, estado `flaky` con [reintentos](../glosario/02-e2e.md#reintento) | 00, 01 |
| Cobertura que engaña | 100 % de líneas y los errores pasan | [Mutation score](../glosario/05-calidad-e-ia.md#mutation-score) con Stryker | 02 |
| Suite lenta | El equipo deja de ejecutarla antes de subir | Tiempo total y por paso del reporter | 03 |
| Duplicación | Un cambio de regla obliga a tocar diez pruebas | Líneas, casos repetidos, casos que faltan | 04 |

> [!NOTE]
> **Reintentar no es estabilizar.** `retries` hace que una prueba inestable salga verde y la marca como
> `flaky`; la causa sigue ahí. Sirve para no bloquear al equipo mientras se arregla, nunca como arreglo.

### Cobertura frente a mutation score

La [cobertura de código](../glosario/05-calidad-e-ia.md#cobertura-de-codigo) dice qué líneas **se han
ejecutado** durante las pruebas; no dice si alguna [aserción](../glosario/01-fundamentos.md#asercion) habría fallado con un resultado distinto. El
mutation testing cambia el código a propósito (un `>`
por un `>=`, un `*` por un `/`) y comprueba si alguna prueba lo nota.

| | Cobertura | Mutation score |
|--|-----------|----------------|
| **Pregunta** | ¿Se ha ejecutado esta línea? | ¿Alguna prueba falla si esta línea cambia? |
| **Herramienta en el curso** | `vitest run --coverage` (v8) | `stryker run` (runner de [Vitest](../glosario/01-fundamentos.md#vitest)) |
| **Coste** | Casi nada | Una ejecución de la suite por mutante |
| **Engaña cuando** | Las aserciones son débiles (`toBeDefined()`) | Hay [mutantes equivalentes](../glosario/05-calidad-e-ia.md#mutante-equivalente) |

### La IA genera; tú decides

Copilot produce pruebas y diagnósticos plausibles en segundos, pero no conoce el requisito: conoce el
código y lo que le pides. Lo que el curso propone es un ciclo fijo:

1. **Pide** con contexto (el fichero, el error, el requisito).
2. **Ejecuta** lo que propone: una prueba que no se ha visto fallar no está probada.
3. **Revisa** con criterios objetivos: límites, casos de error, aserciones que comprueban el valor
   exacto, mutantes vivos, y si «arreglar» la prueba ha consistido en cambiar lo que se espera.

> [!WARNING]
> Las respuestas de Copilot cambian en cada petición. En los labs 05 y 06 verás **ejemplos** de
> respuesta; la tuya será distinta. Lo que no cambia es lo que se comprueba al ejecutarla.

## Páginas

<!-- gen:paginas -->
| # | Página | Qué hay |
|---|--------|---------|
| 00 | [Por qué falla a veces](00-por-que-falla-a-veces.md) | Demostración: la misma prueba repetida veinte veces, su tasa de fallo y dónde lo dice la traza |
| 01 | [Lab — Estabilizar flaky tests](01-lab-estabilizar-flaky-tests.md) | Detectas con repeat-each tres pruebas inestables y corriges su causa: espera, animación y datos compartidos |
| 02 | [Lab — Cobertura útil](02-lab-cobertura-util.md) | Una suite con 100 % de cobertura deja vivos los mutantes de Stryker; añades las aserciones que faltan |
| 03 | [Lab — Optimizar tiempos](03-lab-optimizar-tiempos.md) | Reduces el tiempo de una suite con workers, sesión reutilizada y preparación por API en lugar de UI |
| 04 | [Lab — Refactorizar escenarios](04-lab-refactorizar-escenarios.md) | Conviertes pruebas copiadas y pegadas en una prueba parametrizada con datos legibles |
| 05 | [Lab — Generar pruebas con Copilot](05-lab-generar-pruebas-con-copilot.md) | Pides a Copilot los casos de prueba de una función, los ejecutas y revisas qué se le ha escapado |
| 06 | [Lab — Depurar con IA](06-lab-depurar-con-ia.md) | Das a Copilot el error y la traza de una prueba rota, validas su diagnóstico y refactorizas con su ayuda |

→ Empieza por **[00 — Por qué falla a veces](00-por-que-falla-a-veces.md)**.
<!-- /gen:paginas -->

## Conclusiones del módulo

| Práctica | Qué la hace buena | Número real del módulo |
|----------|-------------------|------------------------|
| Estabilizar | Se corrige la causa y se demuestra con repeticiones | 0 fallos en 100 ejecuciones tras corregir (M05-01) |
| Medir calidad de la suite | Mutation score, no solo cobertura | 100 % de cobertura con 36,59 % de mutantes muertos (M05-02) |
| Acelerar | Paralelismo + sesión reutilizada + datos por API | 17,5 s → 4,2 s (M05-03) |
| Mantener | Una tabla de casos con nombre | 76 → 23 líneas y un caso duplicado descubierto (M05-04) |
| Usar IA | Ejecutar y revisar lo que genera | 8 pruebas generadas en verde con 8 mutantes vivos (M05-05) |

> 🔑 Una suite es buena cuando falla solo si hay un error, lo detecta cuando lo hay y se puede cambiar
> sin miedo; la IA acelera escribirla, pero no decide qué hay que comprobar.
