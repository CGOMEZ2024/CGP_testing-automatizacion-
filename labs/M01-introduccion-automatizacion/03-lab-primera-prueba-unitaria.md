# Lab — Primera prueba unitaria

[← Página anterior](02-una-funcionalidad-tres-niveles.md) · [Siguiente página →](04-lab-prueba-de-integracion.md)

En este lab practicas la **anatomía de una prueba** ([preparar, actuar, comprobar](../glosario/01-fundamentos.md#preparar-actuar-comprobar)) escribiendo con
[Vitest](../glosario/01-fundamentos.md#vitest) las pruebas de una función de descuentos por importe
(`ejercicios/M01-03-primera-prueba-unitaria/`). La función tiene un error que las pruebas del
camino feliz no ven; lo encuentras con un [caso límite](../glosario/01-fundamentos.md#caso-limite) y lo corriges.

### Objetivo

Comprender qué es una [prueba unitaria](../glosario/01-fundamentos.md#prueba-unitaria) y su anatomía (preparar, actuar, comprobar): cómo funciona,
cómo debe ser, cómo se detectan sus debilidades y cómo se mejora.

### Punto de partida

- Codespace del curso abierto (o cualquier entorno con `npm run verificar` en `Entorno listo`).
- Ejercicio: `ejercicios/M01-03-primera-prueba-unitaria/`, con la función `src/descuentos.js` y el
  fichero de pruebas `pruebas/descuentos.test.js`, que solo trae la primera prueba.
- No hay servidor ni navegador: todo ocurre en memoria.

```bash
# Entra en la carpeta del ejercicio
cd ejercicios/M01-03-primera-prueba-unitaria
```

### Qué está pasando

Una tienda aplica un descuento según el importe de la compra: nada por debajo de 50 €, un 5 %
desde 50 € y un 10 % desde 100 €. Es una regla de negocio pequeña, pero se equivoca con dinero de
los clientes, así que merece pruebas. Una **prueba unitaria** comprueba esa función sola, sin
servidor ni base de datos: es la prueba más rápida y la que señala con más precisión dónde está el fallo.

Cada prueba tiene tres partes:

| Parte | Qué hace | En este lab |
|-------|----------|-------------|
| **Preparar** | Crea los datos de entrada | `const importe = 75;` |
| **Actuar** | Llama una vez a lo que se prueba | `const descuento = calcularDescuento(importe);` |
| **Comprobar** | Compara con el resultado esperado | `expect(descuento).toBe(5);` |

Vitest organiza las pruebas con tres funciones: `describe` agrupa, `it` define una prueba con un
nombre legible y `expect(...).toBe(...)` es la [aserción](../glosario/01-fundamentos.md#asercion).

### 1 — Leer la regla y la función

Antes de probar algo hay que saber qué debería hacer. Abre en el editor
[`src/descuentos.js`](../../ejercicios/M01-03-primera-prueba-unitaria/src/descuentos.js): el
comentario de arriba es la regla, y la función es lo que alguien programó a partir de ella.

```js
// Descuento según el importe de la compra (en euros):
//   menos de 50 €   →  0 %
//   desde 50 €      →  5 %
//   desde 100 €     → 10 %
export function calcularDescuento(importe) {
  if (importe < 0) {
    throw new RangeError('El importe no puede ser negativo');
  }
  if (importe > 100) {
    return 10;
  }
  if (importe >= 50) {
    return 5;
  }
  return 0;
}
```

No hace falta encontrar el error leyendo: las pruebas lo encontrarán por ti.

### 2 — Ejecutar la prueba que ya existe

Abre [`pruebas/descuentos.test.js`](../../ejercicios/M01-03-primera-prueba-unitaria/pruebas/descuentos.test.js).
Trae una prueba escrita con sus tres partes comentadas y un hueco para las tuyas:

```js
it('una compra de 30 € no tiene descuento', () => {
  // Preparar: el dato de entrada
  const importe = 30;
  // Actuar: una sola llamada a lo que se prueba
  const descuento = calcularDescuento(importe);
  // Comprobar: el resultado esperado
  expect(descuento).toBe(0);
});

// Tus pruebas, debajo de esta línea
```

Ejecútala para tener una línea base:

```bash
# Ejecuta las pruebas una vez (sin modo vigilancia)
npx vitest run
```

**Resultado esperado** (la hora y los milisegundos cambian):

```text
 RUN  v5.1.0 /workspaces/testing-automatizacion-agile-201/ejercicios/M01-03-primera-prueba-unitaria

 ✓ pruebas/descuentos.test.js > calcularDescuento > una compra de 30 € no tiene descuento 2ms

 Test Files  1 passed (1)
      Tests  1 passed (1)
   Start at  17:22:08
   Duration  163ms (import 44%, transform 24%, worker 19%, tests 13%, environment 1%)
```

La línea `✓` se lee como una frase: en el fichero `descuentos.test.js`, el grupo
`calcularDescuento`, la prueba «una compra de 30 € no tiene descuento» ha pasado.

### 3 — Probar el tramo del 5 %

Escribes tu primera prueba: un importe en medio del tramo del 5 %. Pégala debajo de
`// Tus pruebas, debajo de esta línea`, dentro del `describe`:

```js
  it('una compra de 75 € tiene un 5 %', () => {
    // Preparar
    const importe = 75;
    // Actuar
    const descuento = calcularDescuento(importe);
    // Comprobar
    expect(descuento).toBe(5);
  });
```

```bash
# Ejecuta las pruebas
npx vitest run
```

**Resultado esperado:**

```text
 ✓ pruebas/descuentos.test.js > calcularDescuento > una compra de 30 € no tiene descuento 1ms
 ✓ pruebas/descuentos.test.js > calcularDescuento > una compra de 75 € tiene un 5 % 0ms
```

### 4 — Probar el tramo del 10 %

Añades el tercer tramo, también con un valor del medio. Pégala debajo de la anterior:

```js
  it('una compra de 150 € tiene un 10 %', () => {
    const importe = 150;
    const descuento = calcularDescuento(importe);
    expect(descuento).toBe(10);
  });
```

```bash
# Ejecuta las pruebas
npx vitest run
```

**Resultado esperado:**

```text
 ✓ pruebas/descuentos.test.js > calcularDescuento > una compra de 30 € no tiene descuento 2ms
 ✓ pruebas/descuentos.test.js > calcularDescuento > una compra de 75 € tiene un 5 % 0ms
 ✓ pruebas/descuentos.test.js > calcularDescuento > una compra de 150 € tiene un 10 % 0ms

 Test Files  1 passed (1)
      Tests  3 passed (3)
```

Los tres tramos tienen prueba y todo está en verde. Parece terminado, pero solo has probado el
**camino feliz**: valores cómodos, lejos de donde cambia la regla.

### 5 — Probar los límites

Los errores se esconden donde la regla cambia de tramo: en 50 € y en 100 € justos. La regla dice
«desde», así que esos importes ya tienen el descuento del tramo superior. Añade estas dos pruebas;
al ser tan cortas, preparar, actuar y comprobar caben en una línea:

```js
  it('una compra de 50 € justos tiene un 5 %', () => {
    expect(calcularDescuento(50)).toBe(5);
  });

  it('una compra de 100 € justos tiene un 10 %', () => {
    expect(calcularDescuento(100)).toBe(10);
  });
```

```bash
# Ejecuta las pruebas
npx vitest run
```

**Resultado esperado** (extracto):

```text
 ✓ pruebas/descuentos.test.js > calcularDescuento > una compra de 30 € no tiene descuento 1ms
 ✓ pruebas/descuentos.test.js > calcularDescuento > una compra de 75 € tiene un 5 % 0ms
 ✓ pruebas/descuentos.test.js > calcularDescuento > una compra de 150 € tiene un 10 % 0ms
 ✓ pruebas/descuentos.test.js > calcularDescuento > una compra de 50 € justos tiene un 5 % 0ms
 × pruebas/descuentos.test.js > calcularDescuento > una compra de 100 € justos tiene un 10 % 4ms
   → expected 5 to be 10 // Object.is equality

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  pruebas/descuentos.test.js > calcularDescuento > una compra de 100 € justos tiene un 10 %
AssertionError: expected 5 to be 10 // Object.is equality

- Expected
+ Received

- 10
+ 5

 ❯ pruebas/descuentos.test.js:37:36
     35|
     36|   it('una compra de 100 € justos tiene un 10 %', () => {
     37|     expect(calcularDescuento(100)).toBe(10);
       |                                    ^
     38|   });
     39| });

 Test Files  1 failed (1)
      Tests  1 failed | 4 passed (5)
```

| Parte | Qué dice |
|-------|----------|
| `×` y el nombre | Qué comportamiento falla, en palabras de la regla |
| `expected 5 to be 10` | La función devuelve 5 donde la regla exige 10 |
| `- Expected / + Received` | El valor esperado (`-`) y el recibido (`+`) |
| `❯ pruebas/descuentos.test.js:37:36` | La línea de la aserción que ha fallado |

Un cliente que compra por 100 € justos recibe un 5 % en lugar de un 10 %. La prueba de 150 € no lo
veía porque 150 cumple tanto `> 100` como `>= 100`.

### 6 — Corregir la función

El fallo está en la comparación del tramo del 10 %: la regla dice «desde 100 €» y el código dice
«más de 100». En `src/descuentos.js` cambia `importe > 100` por `importe >= 100`:

```js
  if (importe >= 100) {
    return 10;
  }
```

```bash
# Ejecuta las pruebas con la función corregida
npx vitest run
```

**Resultado esperado:**

```text
 ✓ pruebas/descuentos.test.js > calcularDescuento > una compra de 30 € no tiene descuento 2ms
 ✓ pruebas/descuentos.test.js > calcularDescuento > una compra de 75 € tiene un 5 % 0ms
 ✓ pruebas/descuentos.test.js > calcularDescuento > una compra de 150 € tiene un 10 % 0ms
 ✓ pruebas/descuentos.test.js > calcularDescuento > una compra de 50 € justos tiene un 5 % 0ms
 ✓ pruebas/descuentos.test.js > calcularDescuento > una compra de 100 € justos tiene un 10 % 0ms

 Test Files  1 passed (1)
      Tests  5 passed (5)
```

La prueba del límite se queda en la suite: si alguien vuelve a escribir `>`, fallará.

## Comprueba tu entendimiento

**La prueba del límite protege la corrección**
Vuelve a poner `importe > 100` en `src/descuentos.js` y ejecuta `npx vitest run`.
→ Falla solo la prueba de 100 € justos con `expected 5 to be 10`; las de 30, 75, 150 y 50 € siguen en
verde. Deja otra vez `importe >= 100`.

## Investiga

**¿Qué hace la función con un importe negativo?** El código lanza un `RangeError`. Una prueba
también puede comprobar que algo **falla** como debe: se pasa a `expect` una función que hace la
llamada y se usa `toThrow`. Añade:

```js
  it('un importe negativo es un error', () => {
    expect(() => calcularDescuento(-1)).toThrow('negativo');
  });
```

```bash
# Ejecuta las pruebas
npx vitest run
```

```text
 ✓ pruebas/descuentos.test.js > calcularDescuento > un importe negativo es un error 1ms
```

Si escribes `expect(calcularDescuento(-1))` sin la flecha, el error salta antes de que `expect`
pueda capturarlo y la prueba falla con el `RangeError`.

**¿Cómo ejecuto solo una prueba?** Con `-t` y un trozo del nombre:

```bash
# Ejecuta solo las pruebas cuyo nombre contiene «100 €»
npx vitest run -t '100 €'
```

```text
 ↓ pruebas/descuentos.test.js > calcularDescuento > una compra de 30 € no tiene descuento
 ↓ pruebas/descuentos.test.js > calcularDescuento > una compra de 75 € tiene un 5 %
 ↓ pruebas/descuentos.test.js > calcularDescuento > una compra de 150 € tiene un 10 %
 ↓ pruebas/descuentos.test.js > calcularDescuento > una compra de 50 € justos tiene un 5 %
 ✓ pruebas/descuentos.test.js > calcularDescuento > una compra de 100 € justos tiene un 10 % 2ms

 Test Files  1 passed (1)
      Tests  1 passed | 4 skipped (5)
```

`↓` son las pruebas saltadas. Útil para centrarte en la que estás arreglando.

## Experimenta

Las pruebas de límites se parecen mucho entre sí: solo cambian el importe y el descuento. Vitest
permite escribir **una prueba con una tabla de datos** con `it.each`. Antes de ejecutar, predice
cuántas pruebas nuevas aparecerán y con qué nombres. Añade:

```js
  it.each([
    { importe: 49.99, esperado: 0 },
    { importe: 50, esperado: 5 },
    { importe: 99.99, esperado: 5 },
    { importe: 100, esperado: 10 },
  ])('el límite $importe € da un $esperado %', ({ importe, esperado }) => {
    expect(calcularDescuento(importe)).toBe(esperado);
  });
```

```bash
# Ejecuta las pruebas
npx vitest run
```

```text
 ✓ pruebas/descuentos.test.js > calcularDescuento > el límite 49.99 € da un 0 % 0ms
 ✓ pruebas/descuentos.test.js > calcularDescuento > el límite 50 € da un 5 % 0ms
 ✓ pruebas/descuentos.test.js > calcularDescuento > el límite 99.99 € da un 5 % 1ms
 ✓ pruebas/descuentos.test.js > calcularDescuento > el límite 100 € da un 10 % 0ms

 Test Files  1 passed (1)
      Tests  10 passed (10)
```

Cuatro pruebas independientes, una por fila, con `$importe` y `$esperado` sustituidos en el nombre.
Cada límite se prueba por los dos lados (49,99 y 50; 99,99 y 100): así se detecta el error tanto
si el tramo empieza demasiado tarde como demasiado pronto.

## Reto

### 1 — Un tramo nuevo, con la prueba primero

**La situación:** negocio pide un cuarto tramo: **15 % desde 200 €**. Un compañero propone
cambiar la función y «ya se probará luego». Tú vas a hacerlo al revés: primero las pruebas.

**Qué haces:**

1. Añade en `pruebas/descuentos.test.js` dos pruebas: 199,99 € sigue en el 10 % y 200 € justos tiene un 15 %.
2. Ejecuta `npx vitest run` **antes** de tocar la función y comprueba que la de 200 € falla.
3. Cambia `src/descuentos.js` (comentario y código) para el nuevo tramo y vuelve a ejecutar.

**Pistas:** las comprobaciones de la función van de mayor a menor importe; el nuevo `if` tiene que
ir antes que el de 100 €. Los decimales en JavaScript se escriben con punto: `199.99`.

**Lo que buscas:** en el paso 2, exactamente una prueba en rojo (`expected 10 to be 15`); en el
paso 3, todas en verde, incluidas las que ya tenías.

<details>
<summary>Ver solución</summary>

Las pruebas:

```js
  it('una compra de 199,99 € sigue en el 10 %', () => {
    expect(calcularDescuento(199.99)).toBe(10);
  });

  it('una compra de 200 € justos tiene un 15 %', () => {
    expect(calcularDescuento(200)).toBe(15);
  });
```

Antes de cambiar la función:

```text
 × pruebas/descuentos.test.js > calcularDescuento > una compra de 200 € justos tiene un 15 % 4ms
   → expected 10 to be 15 // Object.is equality
      Tests  1 failed | 11 passed (12)
```

La función con el tramo nuevo:

```js
//   desde 200 €     → 15 %
export function calcularDescuento(importe) {
  if (importe < 0) {
    throw new RangeError('El importe no puede ser negativo');
  }
  if (importe >= 200) {
    return 15;
  }
  if (importe >= 100) {
    return 10;
  }
  if (importe >= 50) {
    return 5;
  }
  return 0;
}
```

```text
 ✓ pruebas/descuentos.test.js > calcularDescuento > una compra de 199,99 € sigue en el 10 % 0ms
 ✓ pruebas/descuentos.test.js > calcularDescuento > una compra de 200 € justos tiene un 15 % 0ms
      Tests  12 passed (12)
```

Ver la prueba en rojo antes de programar demuestra que la prueba sirve: si hubiera pasado sin
cambiar nada, no estaría comprobando el tramo nuevo. Las diez pruebas que ya existían confirman
que el cambio no ha roto los tramos anteriores. La solución completa está en `solucion/`:

```bash
# Ejecuta las pruebas de la solución
npx vitest run --root solucion
```

**La regla:** escribe la prueba del comportamiento nuevo antes que el código y mírala fallar; las
pruebas que ya existían son tu red contra regresiones.

</details>

## Errores frecuentes

| Síntoma | Causa probable | Cómo arreglarlo |
|---------|----------------|-----------------|
| `ReferenceError: calcularDescuento is not defined` | Has pegado la prueba en otro fichero o has borrado el `import` | Pega las pruebas en `pruebas/descuentos.test.js`, que ya importa la función |
| `Error: Failed to parse source for import analysis because the content contains invalid JS syntax` | Al pegar ha faltado o sobrado un `});` | Cada `it(...)` se cierra con su `});` y va dentro de `describe('calcularDescuento', () => { … });` |
| Vitest se queda esperando y no vuelve al terminal | Has ejecutado `npx vitest` sin `run`: es el modo vigilancia | Sal con <kbd>q</kbd> y usa `npx vitest run` (bloque de abajo) |
| La prueba de `toThrow` falla con `RangeError` | Falta la flecha: `expect(calcularDescuento(-1))` | Escribe `expect(() => calcularDescuento(-1)).toThrow(...)` |

```bash
# Ejecuta las pruebas una vez y termina
npx vitest run
```

## Conclusiones

### Qué es una prueba unitaria

Un programa pequeño que llama a una función con un dato conocido y compara su resultado con el
esperado: **preparar, actuar, comprobar**. Prueba la pieza aislada, sin servidor ni navegador, y
por eso es la más rápida (0–2 ms cada una en este lab) y la que señala con más precisión dónde
está el error.

### Cómo debe ser

| Requisito | En el lab |
|-----------|-----------|
| Una prueba, un comportamiento, un nombre que lo dice | «una compra de 100 € justos tiene un 10 %» |
| Las tres fases reconocibles | `importe` → `calcularDescuento(importe)` → `expect(...).toBe(...)` |
| Cubre los límites, no solo el centro de cada tramo | 49,99 / 50 / 99,99 / 100 |
| Cubre los errores esperados | `toThrow` con un importe negativo |
| Rápida y repetible | 10 pruebas en unos 150 ms en total |

### Dónde se rompe y cómo lo has detectado

| Fallo | Cómo lo has visto | Qué provoca |
|-------|-------------------|-------------|
| Solo camino feliz | Tres pruebas en verde con el error dentro | Falsa confianza: el verde no protegía el límite |
| Error de límite (`>` por `>=`) | La prueba de 100 € justos: `expected 5 to be 10` | Un cliente con 100 € recibe la mitad de descuento |
| Prueba escrita después del código | En el reto, la prueba nueva falla antes de cambiar la función | Si no se ve fallar, no se sabe si comprueba algo |

### Cómo se perfecciona

Probando cada límite por los dos lados, agrupando los casos parecidos en tablas (`it.each`) para
que añadir uno sea añadir una fila, escribiendo la prueba antes que el cambio y ejecutando la
suite en modo vigilancia (`npx vitest`) mientras se programa, para tener el aviso al guardar.

### En una frase

> 🔑 Una prueba unitaria vale por los casos que elige: el camino feliz demuestra que el código
> funciona a veces; los límites demuestran que funciona donde la regla cambia.
