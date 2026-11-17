# Testing en Agile y DevOps

[← Página anterior](README.md) · [Siguiente página →](01-lab-preparar-el-entorno.md)

Un equipo Agile entrega cada pocas semanas, y uno con DevOps puede entregar varias veces al día.
A ese ritmo nadie puede repetir a mano todas las pruebas antes de cada entrega: las pruebas tienen
que estar escritas como código, ejecutarse solas en cada cambio y decir en poco tiempo si algo se ha
roto. Esta página explica qué cambia en el testing cuando se entrega de forma continua, cómo se
reparte el esfuerzo entre los distintos tipos de prueba y qué hace que una suite automatizada
ayude en lugar de estorbar. Los laboratorios del módulo practican cada idea con un ejercicio propio.

## Fundamentos del testing moderno

Una **[prueba automatizada](../glosario/01-fundamentos.md#prueba-automatizada)** es un programa que ejecuta una parte del sistema con unos datos
conocidos y compara lo que obtiene con lo que debería obtener. Si coinciden, pasa; si no, falla y
dice dónde. Toda prueba, de cualquier nivel, tiene la misma anatomía:

| Fase | Qué hace | Ejemplo (una función de descuentos) |
|------|----------|-------------------------------------|
| **Preparar** | Deja el sistema en un estado conocido y crea los datos | `const importe = 100;` |
| **Actuar** | Ejecuta una sola acción, la que se prueba | `const descuento = calcularDescuento(importe);` |
| **Comprobar** | Compara el resultado con el esperado ([aserción](../glosario/01-fundamentos.md#asercion)) | `expect(descuento).toBe(10);` |

Lo que distingue al testing moderno del de hace unos años no es la herramienta, sino **cuándo y
quién** prueba:

| Testing tradicional | Testing moderno |
|---------------------|-----------------|
| Una fase al final, después de desarrollar | Continuo, en cada cambio de código |
| Lo hace un equipo de QA separado | Lo hace todo el equipo; QA diseña la estrategia y los casos difíciles |
| Mayoría de pruebas manuales con guion | Pruebas como código, versionadas junto a la aplicación |
| El informe llega días después | El resultado llega en el propio pull request |
| Se busca encontrar fallos | Se busca **evitar** que lleguen a producción y detectarlos pronto |

> [!NOTE]
> Automatizar no elimina las pruebas manuales. Las pruebas **exploratorias** (una persona usando el
> sistema con criterio, buscando lo que nadie ha previsto) siguen siendo necesarias. La
> automatización se encarga de lo repetitivo para que ese tiempo humano vaya a lo que solo una
> persona encuentra.

## Testing en entornos Agile y DevOps

En Agile, una historia de usuario no está terminada cuando el código compila, sino cuando cumple
la **[Definition of Done](../glosario/01-fundamentos.md#definition-of-done)** (DoD) del equipo. Una DoD habitual incluye las pruebas:

| Criterio de la Definition of Done | Qué exige |
|-----------------------------------|-----------|
| Criterios de aceptación cubiertos por pruebas | Cada criterio de la historia tiene al menos una prueba automatizada |
| Suite en verde en [integración continua](../glosario/01-fundamentos.md#integracion-continua) | Todas las pruebas pasan en el [pipeline](../glosario/04-ci-cd.md#pipeline), no solo en el portátil de quien programa |
| Sin regresiones | Las pruebas que ya existían siguen pasando |
| Revisión de código, incluidas las pruebas | Las pruebas se revisan igual que el código de la aplicación |

En DevOps, el lugar donde se ejecutan esas pruebas es la **integración continua** (CI): cada push o
pull request dispara un pipeline que instala, construye y ejecuta la suite. El valor está en el
**feedback rápido**: cuanto antes sabe un desarrollador que ha roto algo, más barato es arreglarlo.

| Cuándo se detecta el fallo | Quién lo ve | Qué cuesta arreglarlo |
|----------------------------|-------------|-----------------------|
| Al guardar el fichero ([prueba unitaria](../glosario/01-fundamentos.md#prueba-unitaria) en modo vigilancia) | Quien lo acaba de escribir | Casi nada: tiene el código en la cabeza |
| En el pull request (pipeline de CI) | El autor y quien revisa | Poco: el cambio es pequeño y reciente |
| En el entorno de preproducción | QA, otros equipos | Más: hay que reproducirlo y buscar qué cambio lo causó |
| En producción | Los clientes | Mucho: incidencia, corrección urgente, reputación |

> [!TIP]
> Una suite que tarda tanto que nadie la ejecuta antes de subir el código no da feedback rápido,
> por muchas pruebas que tenga. La velocidad de la suite es parte de su calidad.

## Shift-left testing

**[Shift-left](../glosario/01-fundamentos.md#shift-left)** significa mover las pruebas hacia la izquierda en la línea del tiempo del
desarrollo: probar antes, más cerca de donde nace el código. En la práctica:

| Práctica shift-left | Ejemplo |
|---------------------|---------|
| Escribir la prueba antes o a la vez que el código | Antes de añadir un tramo de descuento nuevo, se escribe la prueba que lo exige y se ve fallar |
| Probar en el nivel más bajo que detecta el fallo | La regla de precios se prueba con una unitaria, no abriendo el navegador |
| Ejecutar las pruebas en local y en cada pull request | Un pipeline que bloquea la fusión si algo falla |
| QA participa en el refinamiento de las historias | Los criterios de aceptación se escriben ya como ejemplos comprobables |

El complemento, **shift-right**, es observar el sistema en producción (monitorización, pruebas con
tráfico real). No compite con shift-left: lo cierra.

## Tipos de pruebas

Cada tipo de prueba responde a una pregunta distinta y tiene un coste distinto.

| Tipo | Qué comprueba | Qué pone en marcha | Herramienta en el curso | Velocidad típica |
|------|---------------|--------------------|-------------------------|------------------|
| **Unitaria** | Una función o clase aislada | Solo ese código, en memoria | [Vitest](../glosario/01-fundamentos.md#vitest) | Milisegundos |
| **Integración** | Que varias piezas reales colaboran bien (rutas + almacén + servidor HTTP) | Varias piezas, sin interfaz de usuario | Vitest con `fetch` | Decenas de milisegundos |
| **API** | El contrato HTTP: estado, cabeceras y cuerpo de cada endpoint | El servidor completo, sin navegador | [Playwright](../glosario/02-e2e.md#playwright) `request`, Postman/[Newman](../glosario/03-apis.md#newman) | Decenas de milisegundos |
| **Funcional** | Que una funcionalidad hace lo que dice su requisito, vista desde fuera | Depende del nivel elegido (API o interfaz) | Playwright, [Cypress](../glosario/02-e2e.md#cypress) | Variable |
| **[End-to-end](../glosario/01-fundamentos.md#prueba-end-to-end) (E2E)** | Un recorrido completo de usuario, del navegador a los datos | Navegador, aplicación, API y datos | Playwright, Cypress | Segundos |

> [!NOTE]
> «Funcional» no es un nivel, es un **propósito**: comprobar el comportamiento esperado de una
> funcionalidad. Una [prueba funcional](../glosario/01-fundamentos.md#prueba-funcional) puede hacerse contra la API o contra la interfaz. «Unitaria»,
> «integración» y «E2E» sí son niveles: dicen **cuánto sistema** pone en marcha la prueba.

La misma regla de negocio se puede comprobar en los tres niveles. La demostración
[Una funcionalidad, tres niveles](02-una-funcionalidad-tres-niveles.md) lo hace con una regla de
precio y compara cuánto tarda cada uno.

## Pirámide de testing

La **[pirámide de pruebas](../glosario/01-fundamentos.md#piramide-de-pruebas)** (Mike Cohn) dice cómo repartir las pruebas por niveles: muchas
unitarias en la base, menos de integración y API en el centro y pocas E2E en la punta.

```text
            /\
           /E2E\           pocas: recorridos críticos de usuario
          /------\
         /  API /  \       algunas: contratos y piezas reales juntas
        / integración\
       /--------------\
      /   unitarias    \   muchas: cada regla y cada caso límite
     /__________________\
```

El motivo es el coste: cuanto más arriba, más lenta es la prueba, más cosas pueden fallar que no
tienen que ver con lo que se comprueba y más cuesta saber por qué ha fallado.

| Forma de la suite | Cómo es | Qué provoca |
|-------------------|---------|-------------|
| **Pirámide** | Muchas unitarias, algunas de integración/API, pocas E2E | Feedback en segundos; cada fallo señala su causa |
| **[Cono de helado](../glosario/01-fundamentos.md#cono-de-helado)** (anti-patrón) | Casi todo E2E o manual, pocas unitarias | Suite lenta e inestable; un error de cálculo tarda en aparecer y cuesta localizarlo |
| **Trofeo** (Kent C. Dodds) | El peso en las [pruebas de integración](../glosario/01-fundamentos.md#prueba-de-integracion), con análisis estático en la base | Alternativa para aplicaciones web donde lo que más se rompe es cómo encajan las piezas |

> [!TIP]
> La pirámide y el trofeo no se contradicen en lo importante: los dos dejan pocas E2E y piden
> comprobar cada regla en el nivel más barato que la detecta. El lab
> [La pirámide en números](05-lab-piramide-de-pruebas.md) mide la diferencia con una suite real.

## Estrategias de automatización

No todo merece una prueba automatizada, ni en el mismo nivel. Tres preguntas ayudan a decidir:

| Pregunta | Automatiza si… | Mejor manual o no probar si… |
|----------|----------------|------------------------------|
| **¿Se repite?** | Se ejecutará en cada cambio (regresión) | Se comprueba una vez y no cambia |
| **¿Qué riesgo cubre?** | Un fallo afecta a dinero, datos o a muchos usuarios | El impacto de un fallo es bajo |
| **¿Es estable?** | El comportamiento está definido | La interfaz cambia cada semana (prototipo) |

El **retorno de la inversión** (ROI) de una prueba es lo que ahorra (ejecuciones manuales evitadas,
fallos detectados antes) frente a lo que cuesta escribirla **y mantenerla**. Una prueba E2E
frágil que hay que arreglar en cada sprint puede tener un ROI negativo.

Una estrategia razonable para empezar:

1. Las **reglas de negocio** (cálculos, validaciones, límites): unitarias, con sus [casos límite](../glosario/01-fundamentos.md#caso-limite).
2. Los **contratos entre piezas** (endpoints, acceso a datos): integración y API.
3. Los **recorridos críticos** de usuario (alta, compra, pago): unas pocas E2E.
4. Lo **nuevo o incierto**: exploración manual, y se automatiza cuando se estabiliza.

## Buenas prácticas y anti-patrones

| Buena práctica | Por qué |
|----------------|---------|
| Una prueba comprueba **un comportamiento** y su nombre lo dice | Cuando falla, el nombre ya explica qué se ha roto |
| Cada prueba **prepara sus propios datos** y no depende de otra | Se puede ejecutar sola, en cualquier orden y en paralelo |
| Se prueban los **casos límite** (0, el umbral exacto, el valor negativo) | Ahí están la mayoría de errores |
| Las pruebas se ejecutan en un **[entorno reproducible](../glosario/01-fundamentos.md#entorno-reproducible)** | Pasa o falla igual en cualquier máquina y en CI |
| La suite es **rápida** y se ejecuta en cada cambio | Feedback rápido: es lo que justifica automatizar |

| Anti-patrón | Síntoma | Lab donde lo ves |
|-------------|---------|------------------|
| **Cono de helado** | Las reglas de cálculo se comprueban en el navegador; la suite tarda y falla por timeouts | [La pirámide en números](05-lab-piramide-de-pruebas.md) |
| **[Estado compartido](../glosario/01-fundamentos.md#estado-compartido)** entre pruebas | Pasan en orden, fallan al ejecutar una sola o al barajarlas | [Pruebas independientes](06-lab-pruebas-independientes.md) |
| **Solo el camino feliz** | Todo verde, pero el error está en el valor límite | [Primera prueba unitaria](03-lab-primera-prueba-unitaria.md) |
| **[Mock](../glosario/01-fundamentos.md#mock) que no se parece a la realidad** | La unitaria pasa y la aplicación falla al juntar las piezas | [Prueba de integración](04-lab-prueba-de-integracion.md) |
| **[Esperas fijas](../glosario/02-e2e.md#espera-fija)** (`sleep`, `waitForTimeout`) | Pruebas lentas que fallan a veces | Módulo M02 |
| **Prueba sin aserción** | Ejecuta código pero no comprueba nada: siempre pasa | — |

> [!WARNING]
> Una suite en verde solo dice que **las pruebas que existen** pasan. Si faltan los casos límite o
> las aserciones no comprueban lo importante, el verde no protege de nada.
