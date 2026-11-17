# Lab — Cobertura útil

[← Página anterior](01-lab-estabilizar-flaky-tests.md) · [Siguiente página →](03-lab-optimizar-tiempos.md)

Practicas la diferencia entre **[cobertura de código](../glosario/05-calidad-e-ia.md#cobertura-de-codigo)** y **capacidad de detectar errores** con una función
de coste de envío y sus pruebas de [Vitest](../glosario/01-fundamentos.md#vitest). Las pruebas pasan y cubren el 100 % de las líneas, pero sus
[aserciones](../glosario/01-fundamentos.md#asercion) son débiles. Con [Stryker](../glosario/05-calidad-e-ia.md#mutation-testing) ves cuántos
errores dejarían pasar, refuerzas las aserciones, añades los límites y subes el
[mutation score](../glosario/05-calidad-e-ia.md#mutation-score). De paso, ves qué pruebas solo inflan el número.

### Objetivo

Comprender qué es una cobertura útil: cómo funciona la medición de cobertura y la de mutantes, cómo debe
ser una prueba que detecta errores, cómo se detectan sus debilidades y cómo se mejora.

### Punto de partida

- Codespace del curso abierto y un terminal en la carpeta del ejercicio
  [`ejercicios/M05-02-cobertura-util/`](../../ejercicios/M05-02-cobertura-util/README.md).
- Solo Node: no hay aplicación ni navegador. Vitest, `@vitest/coverage-v8` y Stryker ya están instalados.
- La solución completa está en `solucion/`.

```bash
# Entra en la carpeta del ejercicio
cd ejercicios/M05-02-cobertura-util
```

### Qué está pasando

Es habitual que un equipo se ponga un objetivo de cobertura («80 %», «100 %») y lo vigile en el [pipeline](../glosario/04-ci-cd.md#pipeline).
La cobertura de código cuenta qué líneas y ramas se
**ejecutan** durante las pruebas. No mira las aserciones: una prueba que llama a la función y comprueba
`toBeDefined()` cuenta igual que una que comprueba el importe exacto. El
mutation testing responde la otra pregunta: si alguien
introduce un error en esta línea, ¿lo nota alguna prueba?

| Pieza | Qué es |
|-------|--------|
| `src/envio.js` | `costeEnvio()`: peso > 0, gratis a la península desde 50 €, 4 € península / 8 € islas, 0,50 € por kilo por encima de 5 kg, urgente ×2 |
| `src/pedido.js` | Una clase sin lógica: constructor y tres getters |
| `tests/envio.test.js` | Seis pruebas de `costeEnvio` con aserciones débiles |
| `tests/pedido.test.js` | Tres pruebas de los getters |
| `vitest.config.js` | Cobertura con v8, solo de `src/` |
| `stryker.config.json` | Stryker con el runner de Vitest, muta `src/**/*.js` |

### 1 — Leer las pruebas

Abre `tests/envio.test.js` en el editor. Fíjate solo en las aserciones:

```js
expect(costeEnvio({ peso: 2, destino: 'peninsula', importe: 20 })).toBeDefined();
expect(costeEnvio({ peso: 2, destino: 'peninsula', importe: 80 })).toBeGreaterThanOrEqual(0);
expect(costeEnvio({ peso: 2, destino: 'islas', importe: 20 })).toBeGreaterThan(0);
expect(typeof costeEnvio({ peso: 9, destino: 'peninsula', importe: 20 })).toBe('number');
expect(costeEnvio({ peso: 2, destino: 'peninsula', importe: 20, urgente: true })).toBeTruthy();
expect(() => costeEnvio({ peso: 0, destino: 'peninsula', importe: 20 })).toThrow();
```

Ninguna dice cuánto debe costar el envío. «El envío es gratis» comprueba `>= 0`, que también cumple un
envío de 4 €.

### 2 — Ejecutar las pruebas

```bash
# Las nueve pruebas (seis de envío, tres de pedido)
npx vitest run
```

**Resultado esperado** (los tiempos cambian):

```text
 RUN  v5.1.0 /workspaces/testing-automatizacion-agile-201/ejercicios/M05-02-cobertura-util


 Test Files  2 passed (2)
      Tests  9 passed (9)
```

Todo en verde.

### 3 — Medir la cobertura

```bash
# Las mismas pruebas, midiendo qué líneas y ramas de src/ se ejecutan
npx vitest run --coverage
```

**Resultado esperado:**

```text
 % Coverage report from v8
No files with missing coverage.
2 files fully covered.

=============================== Coverage summary ===============================
Statements   : 100% ( 16/16 )
Branches     : 100% ( 14/14 )
Functions    : 100% ( 5/5 )
Lines        : 100% ( 16/16 )
================================================================================
```

100 % en todo. El informe navegable queda en `coverage/index.html` (en el explorador de VS Code, botón derecho →
**Download…** para abrirlo en tu navegador); muestra cada línea en verde. Según este número, la suite es perfecta.

### 4 — Lanzar Stryker

Stryker hace pequeñas copias de `src/` con un cambio cada una (un **mutante**: `>` por `>=`, `*` por `/`,
una condición por `true`…) y ejecuta las pruebas contra cada copia. Si alguna prueba falla, el mutante
está **muerto** (la suite detecta ese error); si todas pasan, ha **sobrevivido**.

```bash
# Mutation testing con la configuración de stryker.config.json
npx stryker run
```

**Resultado esperado** (los tiempos y el orden de algunas líneas cambian; se muestra un extracto):

```text
INFO Instrumenter Instrumented 2 source file(s) with 41 mutant(s)
…
All tests
  envio.test.js
    ✓ costeEnvio > calcula el envío a la península [line 6] (killed 3)
    ~ costeEnvio > el envío es gratis con importes altos [line 10] (covered 16)
    ✓ costeEnvio > calcula el envío a las islas [line 14] (killed 2)
    ~ costeEnvio > cobra los kilos de más [line 18] (covered 31)
…
[Survived] ConditionalExpression
src/envio.js:12:7
-     if (destino === 'peninsula' && importe >= 50) {
+     if (false) {
…
[Survived] ArithmeticOperator
src/envio.js:17:15
-       coste += (peso - 5) * 0.5;
+       coste += (peso + 5) * 0.5;
…
[Survived] AssignmentOperator
src/envio.js:20:5
-       coste *= 2;
+       coste /= 2;
…
-----------|------------------|----------|-----------|------------|----------|----------|
           | % Mutation score |          |           |            |          |          |
File       |  total | covered | # killed | # timeout | # survived | # no cov | # errors |
-----------|--------|---------|----------|-----------|------------|----------|----------|
All files  |  36.59 |   36.59 |       15 |         0 |         26 |        0 |        0 |
 envio.js  |  30.56 |   30.56 |       11 |         0 |         25 |        0 |        0 |
 pedido.js |  80.00 |   80.00 |        4 |         0 |          1 |        0 |        0 |
-----------|--------|---------|----------|-----------|------------|----------|----------|
```

| Dato | Qué dice |
|------|----------|
| `36.59` | De 41 errores sembrados, la suite detecta 15. Con 100 % de cobertura |
| `if (false)` sobrevive | Si el envío gratis desapareciera, ninguna prueba lo notaría: `>= 0` acepta 4 € |
| `coste /= 2` sobrevive | Si el urgente costara la **mitad**, `toBeTruthy()` seguiría pasando |
| `(covered 16)` con `~` | Esa prueba ejecuta 16 mutantes y no mata ninguno: recorre código sin comprobarlo |

El informe HTML (`reports/mutation/index.html`) muestra cada mutante sobre el código.

### 5 — Comprobar el valor exacto

Sustituye el contenido de `tests/envio.test.js` por las mismas seis situaciones, ahora con el valor que
dicen las reglas. Es el arreglo mínimo: no añade casos.

```js
import { describe, test, expect } from 'vitest';
import { costeEnvio } from '../src/envio.js';

// Las mismas seis situaciones, ahora con el valor exacto que dicen las reglas
describe('costeEnvio', () => {
  test('península, 2 kg, 20 €: tarifa base de 4 €', () => {
    expect(costeEnvio({ peso: 2, destino: 'peninsula', importe: 20 })).toBe(4);
  });

  test('península con 80 €: envío gratis', () => {
    expect(costeEnvio({ peso: 2, destino: 'peninsula', importe: 80 })).toBe(0);
  });

  test('islas, 2 kg, 20 €: 8 €', () => {
    expect(costeEnvio({ peso: 2, destino: 'islas', importe: 20 })).toBe(8);
  });

  test('9 kg: 4 € + 4 kg de más × 0,50 € = 6 €', () => {
    expect(costeEnvio({ peso: 9, destino: 'peninsula', importe: 20 })).toBe(6);
  });

  test('urgente: el doble (8 €)', () => {
    expect(costeEnvio({ peso: 2, destino: 'peninsula', importe: 20, urgente: true })).toBe(8);
  });

  test('peso 0: error con su mensaje', () => {
    expect(() => costeEnvio({ peso: 0, destino: 'peninsula', importe: 20 }))
      .toThrow('El peso tiene que ser mayor que 0');
  });
});
```

```bash
# Otra vez los mutantes
npx stryker run
```

**Resultado esperado** (extracto):

```text
[Survived] ConditionalExpression
src/envio.js:12:7
-     if (destino === 'peninsula' && importe >= 50) {
+     if (true && importe >= 50) {
…
[Survived] EqualityOperator
src/envio.js:12:34
-     if (destino === 'peninsula' && importe >= 50) {
+     if (destino === 'peninsula' && importe > 50) {
…
[Survived] EqualityOperator
src/envio.js:16:7
-     if (peso > 5) {
+     if (peso >= 5) {
…
All files  |  90.24 |   90.24 |       37 |         0 |          4 |        0 |        0 |
 envio.js  |  91.67 |   91.67 |       33 |         0 |          3 |        0 |        0 |
 pedido.js |  80.00 |   80.00 |        4 |         0 |          1 |        0 |        0 |
```

Con el mismo número de pruebas y la misma cobertura, de 36,59 % a 90,24 %. Los tres supervivientes de
`envio.js` son **límites y combinaciones** que ninguna prueba toca: ¿qué pasa con 50 € justos? ¿Y en las
islas con un importe alto? ¿Y con 5 kg justos?

### 6 — Añadir los límites

Añade dentro del `describe` las pruebas que preguntan exactamente eso (la solución completa está en
`solucion/tests/envio.test.js`):

```js
  test('península con 50 € justos: ya es gratis (límite)', () => {
    expect(costeEnvio({ peso: 2, destino: 'peninsula', importe: 50 })).toBe(0);
  });

  test('península con 49,99 €: todavía se cobra (límite)', () => {
    expect(costeEnvio({ peso: 2, destino: 'peninsula', importe: 49.99 })).toBe(4);
  });

  test('islas con 80 €: no hay envío gratis, 8 €', () => {
    expect(costeEnvio({ peso: 2, destino: 'islas', importe: 80 })).toBe(8);
  });

  test('5 kg justos: sin recargo por peso (límite)', () => {
    expect(costeEnvio({ peso: 5, destino: 'peninsula', importe: 20 })).toBe(4);
  });

  test('5,5 kg: recargo de 0,25 € y redondeo a céntimos', () => {
    expect(costeEnvio({ peso: 5.5, destino: 'peninsula', importe: 20 })).toBe(4.25);
  });
```

```bash
# Los mutantes con los límites añadidos
npx stryker run
```

**Resultado esperado** (extracto):

```text
[Survived] EqualityOperator
src/envio.js:16:7
-     if (peso > 5) {
+     if (peso >= 5) {
…
[Survived] ArrayDeclaration
src/pedido.js:3:37
-     constructor(id, cliente, lineas = []) {
+     constructor(id, cliente, lineas = ["Stryker was here"]) {
…
All files  |  95.12 |   95.12 |       39 |         0 |          2 |        0 |        0 |
 envio.js  |  97.22 |   97.22 |       35 |         0 |          1 |        0 |        0 |
 pedido.js |  80.00 |   80.00 |        4 |         0 |          1 |        0 |        0 |
```

`envio.js` pasa a 97,22 %. Queda vivo `peso >= 5` aunque hay una prueba con 5 kg justos: lo resuelves en el reto.

## Comprueba tu entendimiento

**La cobertura no ha cambiado**
Ejecuta otra vez la cobertura con las pruebas reforzadas.

```bash
# Cobertura con la suite nueva
npx vitest run --coverage
```

→ Sigue en 100 %: la cobertura era la misma con la suite débil y con la fuerte. El número que ha cambiado es el de mutantes.

**Un error que ahora se detecta**
Cambia en `src/envio.js` la línea `coste *= 2;` por `coste /= 2;` y ejecuta las pruebas.

```bash
# Las pruebas reforzadas contra el código con el error
npx vitest run
```

→ Falla `urgente: el doble (8 €)` con `expected 2 to be 8`. Con la suite original habría pasado. Deshaz el cambio.

## Investiga

¿Qué pruebas trabajan de verdad? En la salida de Stryker, el bloque `All tests` lista cada prueba con
`(killed N)` si mata mutantes o `(covered N)` con `~` si solo los ejecuta. Busca en tu última ejecución
qué pruebas aparecen con `~` y pregúntate si sobran o si su aserción es débil. Para verlo sobre el código,
abre `reports/mutation/index.html`: cada mutante aparece en su línea, en verde (muerto) o en rojo (vivo).

## Experimenta

**[Cobertura excesiva](../glosario/05-calidad-e-ia.md#cobertura-excesiva).** Predice qué pasará con la cobertura y con el mutation score de `envio.js` si borras
las pruebas de los getters de `Pedido`.

```bash
# Aparta las pruebas de pedido (para recuperarlas, vuelve a moverlas)
mv tests/pedido.test.js /tmp/pedido.test.js
npx vitest run --coverage
npx stryker run
```

**Resultado** (extracto):

```text
-----------|---------|----------|---------|---------|-------------------
File       | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
-----------|---------|----------|---------|---------|-------------------
All files  |    62.5 |    92.85 |      20 |    62.5 |                   
 pedido.js |       0 |        0 |       0 |       0 | 4-11              
-----------|---------|----------|---------|---------|-------------------
…
All files  |  85.37 |   97.22 |       35 |         0 |          1 |        5 |        0 |
 envio.js  |  97.22 |   97.22 |       35 |         0 |          1 |        0 |        0 |
 pedido.js |   0.00 |    0.00 |        0 |         0 |          0 |        5 |        0 |
```

La cobertura cae del 100 % al 62,5 % y el mutation score de `envio.js` no se mueve: las tres pruebas de
getters sostenían un tercio del número y no protegían ninguna regla de negocio. Probar código sin lógica
sube la cobertura, cuesta mantenimiento y no detecta nada que no detecte cualquier prueba que use la clase.
Si el equipo exige 100 %, lo útil es excluir ese código del cálculo (`coverage.exclude`), no escribirle
pruebas. Recupera el fichero:

```bash
# Devuelve las pruebas de pedido a su sitio
mv /tmp/pedido.test.js tests/pedido.test.js
```

## Reto

### 1 — El mutante que no se deja matar

**La situación:** después del paso 6 queda vivo el mutante `peso > 5` → `peso >= 5`. Un compañero dice
que falta una prueba y propone escribirla hasta llegar al 100 %.

**Qué haces:** intenta escribir una prueba de `costeEnvio` que dé un resultado distinto con `>` y con `>=`.
Si no la encuentras, calcula a mano qué devuelve la línea 17 con 5 kg en los dos casos. Si concluyes que
el mutante no se puede matar, márcalo en `src/envio.js` para que Stryker lo ignore, con el motivo, y
vuelve a lanzar Stryker.

**Pistas:** un comentario `// Stryker disable next-line <Mutador>: <motivo>` justo encima de la línea
desactiva ese tipo de mutante en ella. El nombre del mutador sale en la cabecera del superviviente
(`[Survived] EqualityOperator`).

**Lo que buscas:** decidir con argumentos si el mutante delata una prueba que falta o es un falso positivo,
y dejar `envio.js` al 100 % sin pruebas inútiles.

<details>
<summary>Ver solución</summary>

Con 5 kg, la línea 17 suma `(5 - 5) × 0,5 = 0`: con `>` no entra en el `if` y con `>=` entra y suma cero.
El resultado es idéntico para cualquier entrada: es un
[mutante equivalente](../glosario/05-calidad-e-ia.md#mutante-equivalente). Ninguna prueba puede matarlo.

```js
// src/envio.js
  // Stryker disable next-line EqualityOperator: en 5 kg justos el recargo es (5 - 5) × 0,5 = 0; > y >= dan lo mismo
  if (peso > 5) {
```

```text
-----------|--------|---------|----------|-----------|------------|----------|----------|
All files  |  97.44 |   97.44 |       38 |         0 |          1 |        0 |        0 |
 envio.js  | 100.00 |  100.00 |       34 |         0 |          0 |        0 |        0 |
 pedido.js |  80.00 |   80.00 |        4 |         0 |          1 |        0 |        0 |
-----------|--------|---------|----------|-----------|------------|----------|----------|
```

`envio.js` queda al 100 % con 34 mutantes (uno menos: el ignorado) y el motivo queda escrito junto al
código para quien lo revise. En un proyecto real, el objetivo no es el 100 % de mutantes, sino que cada
superviviente esté explicado: o falta una prueba, o es equivalente.

**La regla:** un mutante vivo es una pregunta («¿esto lo nota alguien?»); se contesta con una prueba o con
un argumento, nunca con una prueba escrita solo para mover el número.

</details>

## Errores frecuentes

| Síntoma | Causa probable | Cómo arreglarlo |
|---------|----------------|-----------------|
| `No test files found` | Ejecutas Vitest fuera de la carpeta del ejercicio | `cd ejercicios/M05-02-cobertura-util` y vuelve a lanzarlo |
| Stryker muta o prueba ficheros de otra carpeta | Lo has lanzado desde la raíz del repositorio | Lánzalo desde la carpeta del ejercicio, donde está `stryker.config.json` |
| Stryker: `ERROR Stryker There were failed tests in the initial test run.` | Alguna prueba falla sin mutar nada | Arregla primero las pruebas: `npx vitest run` tiene que salir en verde |
| El score no sube tras cambiar las pruebas | No has guardado el fichero | Guarda (`Ctrl+S`) y vuelve a lanzar `npx stryker run` |
| Aparece una carpeta `.stryker-tmp/` | Es la copia de trabajo de Stryker | Se borra sola al terminar; si queda tras cortar la ejecución, bórrala |

## Conclusiones

### Qué es una cobertura útil

La cobertura mide qué código se **ejecuta**; el mutation score, qué código está **protegido** por una
aserción. Una cobertura útil es la de las reglas de negocio con aserciones que fallarían si la regla cambiara.

### Cómo debe ser

| Requisito | En el lab |
|-----------|-----------|
| Aserciones con el valor exacto | `toBe(8)` en lugar de `toBeTruthy()`: de 36,59 % a 90,24 % sin añadir pruebas |
| Límites de cada regla | 50 € y 49,99 €, 5 kg y 5,5 kg: `envio.js` al 97,22 % |
| Combinaciones que cambian el resultado | Islas con 80 €: el envío gratis no aplica |
| Mensajes de error comprobados | `toThrow('El peso tiene que ser mayor que 0')` |
| Sin pruebas de código sin lógica | Los getters sostenían 37,5 puntos de cobertura y ninguna regla |

### Dónde se rompe y cómo lo has detectado

| Fallo | Cómo lo has visto | Qué provoca |
|-------|-------------------|-------------|
| Aserciones débiles | 100 % de cobertura y 26 mutantes vivos | Errores reales (urgente a mitad de precio) pasan en verde |
| Límites sin probar | `importe > 50` vivo tras reforzar las aserciones | Un cliente con 50 € justos pagaría el envío |
| Cobertura excesiva | Sin `pedido.test.js`, 62,5 % de cobertura y el mismo score en `envio.js` | Pruebas que mantener sin protección a cambio |
| Mutante equivalente | `peso >= 5` imposible de matar | Si se persigue el 100 % a ciegas, se escriben pruebas absurdas |

### Cómo se perfecciona

En un proyecto real, Stryker se lanza en el pipeline nocturno o solo sobre los ficheros cambiados
(`--incremental`), se fija un umbral (`thresholds.break` en `stryker.config.json`) para las partes con
reglas de negocio y la cobertura se usa para encontrar código que **nadie** prueba, no como objetivo.

### En una frase

> 🔑 La cobertura dice qué se ha ejecutado; los mutantes vivos dicen qué errores pasarían sin que nadie
> se enterase.
