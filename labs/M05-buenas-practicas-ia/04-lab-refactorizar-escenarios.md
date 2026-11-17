# Lab — Refactorizar escenarios

[← Página anterior](03-lab-optimizar-tiempos.md) · [Siguiente página →](05-lab-generar-pruebas-con-copilot.md)

Practicas el **mantenimiento de una suite** con la función que calcula el precio de una entrada de cine
y nueve pruebas de [Vitest](../glosario/01-fundamentos.md#vitest) escritas copiando y pegando la anterior. Las conviertes en una
[prueba parametrizada](../glosario/05-calidad-e-ia.md#prueba-parametrizada): una tabla de casos con
nombre y una sola comprobación. Con la tabla delante descubres un caso repetido y los límites que
faltaban, y ves cómo cambia el coste de cambiar una regla.

### Objetivo

Comprender qué es una suite mantenible: cómo funciona una prueba parametrizada, cómo debe escribirse
para que se lea, cómo se detecta la duplicación que esconde huecos y cómo se mejora.

### Punto de partida

- Codespace del curso abierto y un terminal en la carpeta del ejercicio
  [`ejercicios/M05-04-refactorizar-escenarios/`](../../ejercicios/M05-04-refactorizar-escenarios/README.md).
- Solo Node y Vitest: no hay aplicación ni navegador.
- La solución completa está en `solucion/`.

```bash
# Entra en la carpeta del ejercicio
cd ejercicios/M05-04-refactorizar-escenarios
```

### Qué está pasando

Las reglas de negocio cambian: una tarifa nueva, un descuento que se amplía. Cada cambio obliga a tocar
las pruebas que lo comprueban. Si esas pruebas son copias casi idénticas con nombres como `precio 4`,
cambiar una regla es buscar a mano qué copias le afectan, y cuando una falla, el nombre no dice qué
regla se ha roto.

| Pieza | Qué es |
|-------|--------|
| `src/entradas.js` | `precioEntrada({ edad, dia, carnetJoven })`: menores de 12, 5 €; miércoles, 6 €; 65 o más, 6 €; carnet joven (12 a 25), 7 €; resto, 9 € |
| `tests/entradas.test.js` | `precio 1` … `precio 9`: siete líneas cada una, solo cambian los datos |
| `vitest.config.js` | Ejecuta solo `tests/` (la solución tiene su propia configuración) |

### 1 — Ejecutar las pruebas copiadas

Abre `tests/entradas.test.js`. Cada prueba repite el mismo esqueleto:

```js
test('precio 4', () => {
  const edad = 40;
  const dia = 'miercoles';
  const carnetJoven = false;
  const precio = precioEntrada({ edad, dia, carnetJoven });
  expect(precio).toBe(6);
});
```

```bash
# Las nueve pruebas, con su nombre
npx vitest run --reporter=verbose
```

**Resultado esperado** (los tiempos cambian):

```text
 ✓ tests/entradas.test.js > precio 1 1ms
 ✓ tests/entradas.test.js > precio 2 0ms
 ✓ tests/entradas.test.js > precio 3 0ms
 ✓ tests/entradas.test.js > precio 4 0ms
 ✓ tests/entradas.test.js > precio 5 0ms
 ✓ tests/entradas.test.js > precio 6 0ms
 ✓ tests/entradas.test.js > precio 7 0ms
 ✓ tests/entradas.test.js > precio 8 0ms
 ✓ tests/entradas.test.js > precio 9 0ms

 Test Files  1 passed (1)
      Tests  9 passed (9)
```

Todo pasa, pero el informe no dice **qué** se ha comprobado.

### 2 — Cambiar una regla y leer el fallo

Para ver el coste de mantenimiento, simula un cambio de negocio: el miércoles pasa a costar 5,50 €. En
`src/entradas.js`, cambia `if (dia === 'miercoles') return 6;` por `if (dia === 'miercoles') return 5.5;`.

```bash
# Las pruebas contra la regla nueva
npx vitest run
```

**Resultado esperado** (extracto):

```text
 FAIL  tests/entradas.test.js > precio 4
AssertionError: expected 5.5 to be 6 // Object.is equality
…
 FAIL  tests/entradas.test.js > precio 9
AssertionError: expected 5.5 to be 6 // Object.is equality

- Expected
+ Received

- 6
+ 5.5

 ❯ tests/entradas.test.js:75:18
…
      Tests  2 failed | 7 passed (9)
```

Fallan `precio 4` y `precio 9`. Para saber si son el miércoles de un adulto, de un menor o de un joven,
tienes que abrir cada una y leer sus tres variables. Deshaz el cambio en `src/entradas.js`
(`return 6;`) para continuar con el paso 3.

### 3 — Pasar las nueve pruebas a una tabla

Una prueba parametrizada separa **los datos**
(una fila por caso) de **la comprobación** (escrita una vez). `test.each` de Vitest ejecuta la función
una vez por fila, y `$caso` y `$precio` ponen en el nombre los valores de la fila. Sustituye el
contenido de `tests/entradas.test.js` por los mismos nueve casos:

```js
import { describe, test, expect } from 'vitest';
import { precioEntrada } from '../src/entradas.js';

// Los nueve casos de antes, uno por fila, con un nombre que dice qué se comprueba
const casos = [
  { caso: 'menor de 12, día normal',   edad: 8,  dia: 'lunes',     carnetJoven: false, precio: 5 },
  { caso: 'menor de 12, miércoles',    edad: 8,  dia: 'miercoles', carnetJoven: false, precio: 5 },
  { caso: 'adulto, día normal',        edad: 40, dia: 'lunes',     carnetJoven: false, precio: 9 },
  { caso: 'adulto, miércoles',         edad: 40, dia: 'miercoles', carnetJoven: false, precio: 6 },
  { caso: 'mayor de 65, día normal',   edad: 70, dia: 'lunes',     carnetJoven: false, precio: 6 },
  { caso: 'carnet joven con 20 años',  edad: 20, dia: 'lunes',     carnetJoven: true,  precio: 7 },
  { caso: 'carnet joven con 20 años',  edad: 20, dia: 'lunes',     carnetJoven: true,  precio: 7 },
  { caso: 'carnet joven con 30 años',  edad: 30, dia: 'lunes',     carnetJoven: true,  precio: 9 },
  { caso: 'carnet joven, miércoles',   edad: 20, dia: 'miercoles', carnetJoven: true,  precio: 6 },
];

describe('precioEntrada', () => {
  // Una prueba por fila; $caso y $precio se sustituyen en el nombre
  test.each(casos)('$caso → $precio €', ({ edad, dia, carnetJoven, precio }) => {
    expect(precioEntrada({ edad, dia, carnetJoven })).toBe(precio);
  });
});
```

```bash
# Las mismas nueve comprobaciones, ahora parametrizadas
npx vitest run --reporter=verbose
```

**Resultado esperado:**

```text
 ✓ tests/entradas.test.js > precioEntrada > menor de 12, día normal → 5 € 1ms
 ✓ tests/entradas.test.js > precioEntrada > menor de 12, miércoles → 5 € 0ms
 ✓ tests/entradas.test.js > precioEntrada > adulto, día normal → 9 € 0ms
 ✓ tests/entradas.test.js > precioEntrada > adulto, miércoles → 6 € 0ms
 ✓ tests/entradas.test.js > precioEntrada > mayor de 65, día normal → 6 € 0ms
 ✓ tests/entradas.test.js > precioEntrada > carnet joven con 20 años → 7 € 0ms
 ✓ tests/entradas.test.js > precioEntrada > carnet joven con 20 años → 7 € 0ms
 ✓ tests/entradas.test.js > precioEntrada > carnet joven con 30 años → 9 € 0ms
 ✓ tests/entradas.test.js > precioEntrada > carnet joven, miércoles → 6 € 0ms

 Test Files  1 passed (1)
      Tests  9 passed (9)
```

El mismo resultado, y ahora el informe es la especificación. Y salta a la vista lo que el código copiado
escondía: `carnet joven con 20 años` aparece **dos veces** (`precio 6` y `precio 7` eran la misma prueba).

### 4 — Quitar lo repetido y añadir los límites

Con la tabla delante, se ve qué reglas tienen su límite probado y cuáles no:

| Regla | Límite | ¿Estaba? |
|-------|--------|----------|
| Menores de 12 | 12 años ya no es menor | No |
| 65 o más | 65 justos | No (solo 70) |
| Carnet joven hasta 25 | 25 vale, 26 no | No (20 y 30) |

Sustituye la tabla por la versión sin duplicado y con los límites (es `solucion/tests/entradas.test.js`):

```js
// Una fila por caso: los datos se leen como una tabla de reglas de negocio
const casos = [
  // caso                                            edad  día          carnet  precio
  { caso: 'menor de 12, día normal',                 edad: 8,  dia: 'lunes',     carnetJoven: false, precio: 5 },
  { caso: 'menor de 12, miércoles (no baja de 5 €)', edad: 8,  dia: 'miercoles', carnetJoven: false, precio: 5 },
  { caso: 'con 12 años ya no es menor (límite)',     edad: 12, dia: 'lunes',     carnetJoven: false, precio: 9 },
  { caso: 'adulto, día normal',                      edad: 40, dia: 'lunes',     carnetJoven: false, precio: 9 },
  { caso: 'adulto, miércoles',                       edad: 40, dia: 'miercoles', carnetJoven: false, precio: 6 },
  { caso: '65 años justos (límite)',                 edad: 65, dia: 'lunes',     carnetJoven: false, precio: 6 },
  { caso: 'carnet joven con 20 años',                edad: 20, dia: 'lunes',     carnetJoven: true,  precio: 7 },
  { caso: 'carnet joven con 25 años (límite)',       edad: 25, dia: 'lunes',     carnetJoven: true,  precio: 7 },
  { caso: 'carnet joven caducado con 26 años',       edad: 26, dia: 'lunes',     carnetJoven: true,  precio: 9 },
  { caso: 'carnet joven, miércoles',                 edad: 20, dia: 'miercoles', carnetJoven: true,  precio: 6 },
];
```

```bash
# La tabla completa y la comparación de tamaño con el fichero original de la solución
npx vitest run --reporter=verbose
wc -l solucion/tests/entradas.test.js
```

**Resultado esperado:**

```text
 ✓ tests/entradas.test.js > precioEntrada > menor de 12, día normal → 5 € 1ms
 ✓ tests/entradas.test.js > precioEntrada > menor de 12, miércoles (no baja de 5 €) → 5 € 0ms
 ✓ tests/entradas.test.js > precioEntrada > con 12 años ya no es menor (límite) → 9 € 0ms
 ✓ tests/entradas.test.js > precioEntrada > adulto, día normal → 9 € 0ms
 ✓ tests/entradas.test.js > precioEntrada > adulto, miércoles → 6 € 0ms
 ✓ tests/entradas.test.js > precioEntrada > 65 años justos (límite) → 6 € 0ms
 ✓ tests/entradas.test.js > precioEntrada > carnet joven con 20 años → 7 € 0ms
 ✓ tests/entradas.test.js > precioEntrada > carnet joven con 25 años (límite) → 7 € 0ms
 ✓ tests/entradas.test.js > precioEntrada > carnet joven caducado con 26 años → 9 € 0ms
 ✓ tests/entradas.test.js > precioEntrada > carnet joven, miércoles → 6 € 0ms

 Test Files  1 passed (1)
      Tests  10 passed (10)

23 solucion/tests/entradas.test.js
```

El fichero original tenía 76 líneas y 9 pruebas (una repetida); la tabla tiene 23 líneas y 10 casos
distintos, tres de ellos límites.

### 5 — Repetir el cambio de regla

Vuelve a cambiar el miércoles a 5,50 € en `src/entradas.js` y ejecuta las pruebas.

```bash
# La tabla contra la regla nueva
npx vitest run
```

**Resultado esperado** (extracto):

```text
 ❯ tests/entradas.test.js (10 tests | 2 failed) 8ms
   ❯ precioEntrada (10)
     × adulto, miércoles → 6 € 4ms
     × carnet joven, miércoles → 6 € 1ms
…
 FAIL  tests/entradas.test.js > precioEntrada > adulto, miércoles → 6 €
 FAIL  tests/entradas.test.js > precioEntrada > carnet joven, miércoles → 6 €
AssertionError: expected 5.5 to be 6 // Object.is equality
…
 ❯ tests/entradas.test.js:21:55
…
      Tests  2 failed | 8 passed (10)
```

El nombre ya dice qué regla se rompe. Actualizar la suite es cambiar el `precio` de dos filas. Deshaz el
cambio en `src/entradas.js` (`return 6;`).

## Comprueba tu entendimiento

**Una fila, una prueba**
Añade a la tabla la fila `{ caso: 'jubilado, miércoles', edad: 70, dia: 'miercoles', carnetJoven: false, precio: 6 }` y ejecuta:

```bash
# Once casos
npx vitest run --reporter=verbose
```

→ `Tests  11 passed (11)` y una línea nueva `jubilado, miércoles → 6 €`. Añadir un caso no ha exigido escribir código.

**La solución**
Ejecuta la solución con su configuración:

```bash
# La tabla de la solución
npx vitest run --config solucion/vitest.config.js --reporter=verbose
```

→ `Tests  10 passed (10)`, los mismos nombres que tu paso 4.

## Investiga

**DRY frente a [DAMP](../glosario/05-calidad-e-ia.md#dry-damp).** En la salida del paso 5, el error apunta a la línea 21 (la comprobación común) y no
a la fila que falla: lo que identifica el caso es el **nombre**. Por eso en una prueba parametrizada el
nombre no es decoración. Mira en el fichero original cuánto texto había por caso (variables, llamada,
[aserción](../glosario/01-fundamentos.md#asercion)) y en la tabla cuánto queda. La regla que se usa en pruebas es
DAMP («frases descriptivas y significativas»): se elimina la
repetición mecánica (DRY), pero cada caso tiene que poder leerse solo, sin seguir funciones auxiliares.
¿Qué perderías si la columna `caso` desapareciera y el nombre fuera `'$edad $dia $carnetJoven'`?

## Reto

### 1 — Una regla nueva, primero la prueba

**La situación:** el cine anuncia que, desde el mes que viene, los menores de 12 pagan **4 €** los
miércoles. La persona que lo implementa propone cambiar primero la tabla y después el código, para ver
la prueba fallar antes de que pase.

**Qué haces:** partiendo de la tabla del paso 4, cambia la fila del menor en miércoles y ejecuta las
pruebas. Después cambia la regla en `src/entradas.js` y vuelve a ejecutarlas.

```bash
# Tras cada cambio
npx vitest run --reporter=verbose
```

**Pistas:** la fila que hay que cambiar ya existe (`menor de 12, miércoles…`); su nombre decía «no baja
de 5 €», así que también cambia. En el código, el menor de 12 sigue siendo la primera condición; un
operador ternario (`condicion ? a : b`) basta.

**Lo que buscas:** ver la prueba fallar por la razón correcta con un solo cambio en la tabla, y pasar con
un solo cambio en el código.

<details>
<summary>Ver solución</summary>

```js
// tests/entradas.test.js — la fila cambiada
  { caso: 'menor de 12, miércoles',                  edad: 8,  dia: 'miercoles', carnetJoven: false, precio: 4 },
```

```text
     × menor de 12, miércoles → 4 € 4ms
⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯
 FAIL  tests/entradas.test.js > precioEntrada > menor de 12, miércoles → 4 €
AssertionError: expected 5 to be 4 // Object.is equality
      Tests  1 failed | 9 passed (10)
```

```js
// src/entradas.js — la regla nueva
  if (edad < 12) return dia === 'miercoles' ? 4 : 5;
```

```text
 ✓ tests/entradas.test.js > precioEntrada > menor de 12, día normal → 5 € 1ms
 ✓ tests/entradas.test.js > precioEntrada > menor de 12, miércoles → 4 € 0ms
…
      Tests  10 passed (10)
```

Un fallo, con el nombre de la regla y el valor esperado; después, un cambio de una línea lo resuelve. Con
las pruebas copiadas habría que encontrar cuál de las nueve era el menor en miércoles (`precio 2`) y
editarla sin equivocarse de copia. Deja el código como estaba (`if (edad < 12) return 5;`) al terminar.

**La regla:** cuando las pruebas son datos, un cambio de negocio es un cambio de datos; si cambiar una
regla obliga a editar código de prueba en varios sitios, la suite está pidiendo una tabla.

</details>

## Errores frecuentes

| Síntoma | Causa probable | Cómo arreglarlo |
|---------|----------------|-----------------|
| El nombre sale literal: `$caso → $precio €` | `test.each` recibe una lista de arrays, no de objetos | Usa objetos con claves (`{ caso: …, precio: … }`) o `%s` con arrays |
| Dos casos con el mismo nombre en el informe | Fila duplicada o nombre copiado sin cambiar | Cada `caso` tiene que describir lo que lo distingue |
| `ReferenceError: describe is not defined` | Falta en el `import` de `vitest` | `import { describe, test, expect } from 'vitest';` |
| Se ejecutan también las pruebas de `solucion/` | Lanzas Vitest desde la raíz del repositorio | Lánzalo desde la carpeta del ejercicio, que tiene su `vitest.config.js` |

## Conclusiones

### Qué es una suite mantenible

Una suite en la que un cambio de requisito se traduce en un cambio pequeño y localizado, y en la que un
fallo dice qué regla se ha roto. Para reglas que se prueban con muchos datos, la forma es una tabla de
casos con nombre y una comprobación escrita una vez.

### Cómo debe ser

| Requisito | En el lab |
|-----------|-----------|
| Datos separados de la comprobación | `test.each(casos)` con una función de una línea |
| Nombres que describen el caso | `carnet joven con 25 años (límite) → 7 €` en lugar de `precio 7` |
| Sin casos repetidos | El duplicado (`precio 6` = `precio 7`) desaparece |
| Límites a la vista | 12, 65, 25 y 26 años añadidos al ver la tabla |
| Menos código, el mismo resultado | 76 → 23 líneas; 9 → 10 casos distintos |

### Dónde se rompe y cómo lo has detectado

| Fallo | Cómo lo has visto | Qué provoca |
|-------|-------------------|-------------|
| Copiar y pegar | Dos pruebas idénticas con nombres distintos | Falsa sensación de cobertura |
| Nombres sin significado | `FAIL … precio 4` sin decir qué regla | Diagnóstico lento |
| Error en la línea común | `tests/entradas.test.js:21:55` para cualquier fila | Sin buen nombre, no se sabe qué caso falla |
| DRY llevado al extremo | (Investiga) nombres generados solo con valores | Pruebas que no se entienden sin leer el código |

### Cómo se perfecciona

En [Playwright](../glosario/02-e2e.md#playwright), la misma idea se escribe con un `for (const caso of casos) test(\`${caso.caso}\`, …)`;
en ambos, las tablas grandes pueden venir de un fichero JSON o CSV que también lea negocio. Los pasos
repetidos que no son datos (abrir la página, iniciar sesión) van a helpers o [fixtures](../glosario/02-e2e.md#fixture) con nombres del
dominio, sin esconder dentro las aserciones.

### En una frase

> 🔑 Cuando muchas pruebas solo se diferencian en los datos, los datos van en una tabla con nombre y la
> comprobación se escribe una vez: así la suite se lee como la regla y un cambio de regla es un cambio de fila.
