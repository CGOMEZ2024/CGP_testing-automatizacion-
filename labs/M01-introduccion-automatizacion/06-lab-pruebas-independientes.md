# Lab — Pruebas independientes

[← Página anterior](05-lab-piramide-de-pruebas.md) · [Siguiente página →](../M02-funcionales-e2e/README.md)

En este lab practicas la **[independencia entre pruebas](../glosario/01-fundamentos.md#independencia-entre-pruebas)** y su anti-patrón más común, el **estado
compartido**: una suite de un carrito de la compra (`ejercicios/M01-06-pruebas-independientes/`)
pasa cuando se ejecuta en el orden en que está escrita, pero falla al ejecutar una prueba sola o al
barajar el orden. Lo detectas con [Vitest](../glosario/01-fundamentos.md#vitest) y lo arreglas con `beforeEach` y datos propios en cada prueba.

### Objetivo

Comprender qué es la independencia entre pruebas: cómo funciona, cómo debe ser, cómo se detectan
sus debilidades y cómo se mejora.

### Punto de partida

- Codespace del curso abierto (o cualquier entorno con `npm run verificar` en `Entorno listo`).
- Ejercicio: `ejercicios/M01-06-pruebas-independientes/`, con el carrito `src/carrito.js` y su
  suite `pruebas/carrito.test.js`.
- No hay servidor ni navegador: todo ocurre en memoria.

```bash
# Entra en la carpeta del ejercicio
cd ejercicios/M01-06-pruebas-independientes
```

### Qué está pasando

Una prueba independiente prepara todo lo que necesita y no deja nada que otra necesite. Así se
puede ejecutar sola (para depurarla), en cualquier orden y en paralelo. Cuando dos pruebas
comparten estado (una variable global, un fichero, una fila en la base de datos, un usuario en un
servidor), la segunda depende de lo que hizo la primera, y la suite solo pasa en el orden en que
se escribió.

| En un proyecto real | En este laboratorio |
|---------------------|---------------------|
| Una tabla de base de datos que comparten todas las pruebas | La variable `lineas` del módulo `src/carrito.js` |
| Una prueba crea un usuario y la siguiente lo usa | «agrega una lámpara» cuenta con el libro que añadió la prueba anterior |
| La suite falla al paralelizarla o al ejecutar solo una prueba en CI | Falla con `-t` y con `--sequence.shuffle` |

### 1 — Leer el carrito y sus pruebas

Abre [`src/carrito.js`](../../ejercicios/M01-06-pruebas-independientes/src/carrito.js). Las
líneas del carrito están en una variable del módulo: cualquiera que importe el fichero comparte
**el mismo** carrito.

```js
const lineas = [];

export function agregar(producto, precio) {
  lineas.push({ producto, precio });
}
// contar(), total() y vaciar() trabajan sobre la misma variable
```

Abre [`pruebas/carrito.test.js`](../../ejercicios/M01-06-pruebas-independientes/pruebas/carrito.test.js)
y fíjate en qué supone cada prueba sobre lo que pasó antes:

```js
  it('agrega un libro', () => {
    agregar('Libro', 20);
    expect(contar()).toBe(1);        // supone que el carrito estaba vacío
  });

  it('agrega una lámpara', () => {
    agregar('Lámpara', 35);
    expect(contar()).toBe(2);        // supone que ya hay un libro
  });

  it('calcula el total', () => {
    expect(total()).toBe(55);        // supone el libro y la lámpara
  });
```

### 2 — Ejecutar la suite en orden

```bash
# Ejecuta las pruebas en el orden en que están escritas
npx vitest run
```

**Resultado esperado** (los tiempos cambian):

```text
 ✓ pruebas/carrito.test.js > carrito > empieza vacío 2ms
 ✓ pruebas/carrito.test.js > carrito > agrega un libro 0ms
 ✓ pruebas/carrito.test.js > carrito > agrega una lámpara 0ms
 ✓ pruebas/carrito.test.js > carrito > calcula el total 0ms

 Test Files  1 passed (1)
      Tests  4 passed (4)
```

Todo en verde. Es lo que ve el equipo cada día, y por eso nadie sospecha.

### 3 — Ejecutar una prueba sola

Cuando una prueba falla, lo primero es ejecutarla sola para depurarla. Haz eso con «calcula el total»:

```bash
# Ejecuta solo la prueba cuyo nombre contiene «calcula el total»
npx vitest run -t 'calcula el total'
```

**Resultado esperado** (extracto):

```text
 ↓ pruebas/carrito.test.js > carrito > empieza vacío
 ↓ pruebas/carrito.test.js > carrito > agrega un libro
 ↓ pruebas/carrito.test.js > carrito > agrega una lámpara
 × pruebas/carrito.test.js > carrito > calcula el total 5ms
   → expected +0 to be 55 // Object.is equality

 FAIL  pruebas/carrito.test.js > carrito > calcula el total
AssertionError: expected +0 to be 55 // Object.is equality

 ❯ pruebas/carrito.test.js:21:21
     19|
     20|   it('calcula el total', () => {
     21|     expect(total()).toBe(55);
       |                     ^

 Test Files  1 failed (1)
      Tests  1 failed | 3 skipped (4)
```

Sola, la prueba ve un carrito vacío: total 0. No comprueba el cálculo del total; comprueba que
otras dos pruebas se ejecutaron antes.

### 4 — Barajar el orden

Vitest puede ejecutar las pruebas en un orden aleatorio con `--sequence.shuffle`. Con
`--sequence.seed` fijas la semilla del azar, así que el mismo número da siempre el mismo orden y
cualquiera puede reproducir el fallo.

```bash
# Orden aleatorio, reproducible con la semilla 3
npx vitest run --sequence.shuffle --sequence.seed=3
```

**Resultado esperado:**

```text
 RUN  v5.1.0 /workspaces/testing-automatizacion-agile-201/ejercicios/M01-06-pruebas-independientes
      Running tests with seed "3"

 × pruebas/carrito.test.js > carrito > calcula el total 5ms
   → expected +0 to be 55 // Object.is equality
 ✓ pruebas/carrito.test.js > carrito > agrega un libro 0ms
 ✓ pruebas/carrito.test.js > carrito > agrega una lámpara 0ms
 × pruebas/carrito.test.js > carrito > empieza vacío 0ms
   → expected 2 to be +0 // Object.is equality

 Test Files  1 failed (1)
      Tests  2 failed | 2 passed (4)
```

| Prueba | Qué ha pasado |
|--------|---------------|
| «calcula el total» | Va la primera: el carrito está vacío, total 0 |
| «agrega un libro» y «agrega una lámpara» | Por casualidad siguen en su orden relativo: pasan |
| «empieza vacío» | Va la última: el carrito ya tiene 2 líneas de las otras pruebas |

### 5 — Contar cuántos órdenes fallan

Un solo orden podría ser mala suerte. Ejecuta la suite con ocho semillas distintas y cuenta:

```bash
# Ocho órdenes distintos; de cada uno, solo la línea del resumen
for semilla in 1 2 3 4 5 6 7 8; do echo -n "semilla $semilla:"; npx vitest run --sequence.shuffle --sequence.seed=$semilla --reporter=dot 2>&1 | grep -E "^ +Tests"; done
```

**Resultado esperado:**

```text
semilla 1:      Tests  2 failed | 2 passed (4)
semilla 2:      Tests  3 failed | 1 passed (4)
semilla 3:      Tests  2 failed | 2 passed (4)
semilla 4:      Tests  4 passed (4)
semilla 5:      Tests  4 passed (4)
semilla 6:      Tests  4 passed (4)
semilla 7:      Tests  3 failed | 1 passed (4)
semilla 8:      Tests  2 failed | 2 passed (4)
```

Cinco órdenes de ocho fallan. Las semillas 4, 5 y 6 caen en el orden escrito (u otro compatible)
y pasan: por eso una suite con [estado compartido](../glosario/01-fundamentos.md#estado-compartido) puede pasar semanas en verde y fallar el día que
alguien añade una prueba, cambia el orden o activa el [paralelismo](../glosario/05-calidad-e-ia.md#paralelismo).

### 6 — Hacer cada prueba independiente

Dos cambios, y hacen falta los dos:

- **`beforeEach`**: antes de **cada** prueba, el carrito se vacía. Ninguna hereda lo que dejó otra.
- **Datos propios**: cada prueba añade lo que necesita para su comprobación, sin contar con las anteriores.

Sustituye el contenido de `pruebas/carrito.test.js` por:

```js
// Pruebas del carrito: cada una parte de un carrito vacío y crea sus propios datos.
import { describe, it, expect, beforeEach } from 'vitest';
import { agregar, contar, total, vaciar } from '../src/carrito.js';

describe('carrito', () => {
  // Antes de cada prueba: carrito vacío, pase lo que pase en las demás
  beforeEach(() => {
    vaciar();
  });

  it('empieza vacío', () => {
    expect(contar()).toBe(0);
  });

  it('agrega un libro', () => {
    agregar('Libro', 20);
    expect(contar()).toBe(1);
  });

  it('agrega una lámpara después de un libro', () => {
    // Sus propios datos: no cuenta con el libro de la prueba anterior
    agregar('Libro', 20);
    agregar('Lámpara', 35);
    expect(contar()).toBe(2);
  });

  it('calcula el total', () => {
    agregar('Libro', 20);
    agregar('Lámpara', 35);
    expect(total()).toBe(55);
  });
});
```

```bash
# Repite el orden que fallaba
npx vitest run --sequence.shuffle --sequence.seed=3
```

**Resultado esperado:**

```text
      Running tests with seed "3"

 ✓ pruebas/carrito.test.js > carrito > calcula el total 2ms
 ✓ pruebas/carrito.test.js > carrito > agrega un libro 1ms
 ✓ pruebas/carrito.test.js > carrito > agrega una lámpara después de un libro 0ms
 ✓ pruebas/carrito.test.js > carrito > empieza vacío 0ms

 Test Files  1 passed (1)
      Tests  4 passed (4)
```

El mismo orden que antes fallaba, ahora en verde.

### 7 — Confirmar con una prueba sola y con los ocho órdenes

Compruebas los dos síntomas del principio: la prueba sola y los órdenes barajados.

```bash
# La prueba del total, sola
npx vitest run -t 'calcula el total'
```

```text
 ↓ pruebas/carrito.test.js > carrito > empieza vacío
 ↓ pruebas/carrito.test.js > carrito > agrega un libro
 ↓ pruebas/carrito.test.js > carrito > agrega una lámpara después de un libro
 ✓ pruebas/carrito.test.js > carrito > calcula el total 3ms
      Tests  1 passed | 3 skipped (4)
```

```bash
# Los ocho órdenes de antes
for semilla in 1 2 3 4 5 6 7 8; do echo -n "semilla $semilla:"; npx vitest run --sequence.shuffle --sequence.seed=$semilla --reporter=dot 2>&1 | grep -E "^ +Tests"; done
```

```text
semilla 1:      Tests  4 passed (4)
semilla 2:      Tests  4 passed (4)
semilla 3:      Tests  4 passed (4)
semilla 4:      Tests  4 passed (4)
semilla 5:      Tests  4 passed (4)
semilla 6:      Tests  4 passed (4)
semilla 7:      Tests  4 passed (4)
semilla 8:      Tests  4 passed (4)
```

## Comprueba tu entendimiento

**Una prueba que se puede ejecutar sola**
Ejecuta `npx vitest run -t 'empieza vacío'` y después `npx vitest run -t 'lámpara'`.
→ Cada una pasa sola (`1 passed | 3 skipped`), sin que se ejecute ninguna otra antes.

## Investiga

**¿Qué semilla usa Vitest si no le das una?** Ejecuta el barajado sin `--sequence.seed`:

```bash
# Orden aleatorio con una semilla elegida por Vitest
npx vitest run --sequence.shuffle
```

La cabecera dice la semilla elegida, por ejemplo `Running tests with seed "1794932914007"` (cambia
en cada ejecución). Si un barajado falla en CI, esa línea es lo que necesitas para reproducirlo en
tu Codespace con `--sequence.seed=<ese número>`.

## Experimenta

¿Hacen falta los dos cambios del paso 6? Predice antes de ejecutar.

**A. Datos propios, sin `beforeEach`.** Comenta las tres líneas del `beforeEach` en
`pruebas/carrito.test.js` y ejecuta en orden:

```bash
# Suite en orden, sin vaciar el carrito entre pruebas
npx vitest run
```

```text
 ✓ pruebas/carrito.test.js > carrito > empieza vacío 2ms
 ✓ pruebas/carrito.test.js > carrito > agrega un libro 0ms
 × pruebas/carrito.test.js > carrito > agrega una lámpara después de un libro 9ms
   → expected 3 to be 2 // Object.is equality
 × pruebas/carrito.test.js > carrito > calcula el total 1ms
   → expected 130 to be 55 // Object.is equality
      Tests  2 failed | 2 passed (4)
```

Falla incluso en orden: cada prueba añade sus productos encima de los de la anterior (3 líneas;
20 + 20 + 35 + 20 + 35 = 130 €).

**B. `beforeEach` sin datos propios.** Vuelve a activar el `beforeEach` y usa las pruebas
originales del paso 1 (la lámpara sola esperando 2 líneas y el total sin añadir nada):

```text
 ✓ pruebas/carrito.test.js > carrito > empieza vacío 3ms
 ✓ pruebas/carrito.test.js > carrito > agrega un libro 1ms
 × pruebas/carrito.test.js > carrito > agrega una lámpara 17ms
   → expected 1 to be 2 // Object.is equality
 × pruebas/carrito.test.js > carrito > calcula el total 3ms
   → expected +0 to be 55 // Object.is equality
      Tests  2 failed | 2 passed (4)
```

También falla en orden, y eso es bueno: limpiar entre pruebas convierte una dependencia oculta en
un fallo visible y constante. Deja la versión del paso 6.

## Reto

### 1 — Un carrito propio para cada prueba

**La situación:** una compañera propone quitar el problema de raíz: que el carrito no sea una
variable del módulo, sino que cada uno cree el suyo con una función `crearCarrito()`. Así ninguna
prueba podría tocar el carrito de otra, aunque olvide vaciarlo.

**Qué haces:**

1. Añade al final de `src/carrito.js` (sin quitar lo que hay) una función `crearCarrito()` que
   devuelva un objeto con sus propios `agregar`, `contar` y `total`.
2. Crea `pruebas/carrito-fabrica.test.js` con tres pruebas («empieza vacío», «agrega un libro»,
   «calcula el total») que creen cada una su carrito, **sin `beforeEach` ni `vaciar`**.
3. Ejecuta el bucle de las ocho semillas.

**Pistas:** dentro de `crearCarrito`, declara un array con `const` y devuelve
`{ agregar(producto, precio) { … }, contar() { … }, total() { … } }`; cada llamada crea un array nuevo.

**Lo que buscas:** las ocho semillas en verde con 7 pruebas (las 4 del carrito y las 3 nuevas), sin
ningún `beforeEach` en el fichero nuevo.

<details>
<summary>Ver solución</summary>

Al final de `src/carrito.js`:

```js
// Cada llamada crea un carrito nuevo, con sus propias líneas: nada compartido.
export function crearCarrito() {
  const lineasPropias = [];
  return {
    agregar(producto, precio) {
      lineasPropias.push({ producto, precio });
    },
    contar() {
      return lineasPropias.length;
    },
    total() {
      return lineasPropias.reduce((suma, linea) => suma + linea.precio, 0);
    },
  };
}
```

`pruebas/carrito-fabrica.test.js`:

```js
// Pruebas con un carrito propio por prueba: sin beforeEach ni vaciar().
import { describe, it, expect } from 'vitest';
import { crearCarrito } from '../src/carrito.js';

describe('crearCarrito', () => {
  it('empieza vacío', () => {
    const carrito = crearCarrito();
    expect(carrito.contar()).toBe(0);
  });

  it('agrega un libro', () => {
    const carrito = crearCarrito();
    carrito.agregar('Libro', 20);
    expect(carrito.contar()).toBe(1);
  });

  it('calcula el total', () => {
    const carrito = crearCarrito();
    carrito.agregar('Libro', 20);
    carrito.agregar('Lámpara', 35);
    expect(carrito.total()).toBe(55);
  });
});
```

```text
semilla 1:      Tests  7 passed (7)
semilla 2:      Tests  7 passed (7)
semilla 3:      Tests  7 passed (7)
semilla 4:      Tests  7 passed (7)
semilla 5:      Tests  7 passed (7)
semilla 6:      Tests  7 passed (7)
semilla 7:      Tests  7 passed (7)
semilla 8:      Tests  7 passed (7)
```

Con `beforeEach` la independencia depende de que nadie olvide limpiar; con un carrito por prueba,
el diseño la garantiza. En una aplicación real es lo mismo con una base de datos: mejor que cada
prueba cree sus datos con identificadores únicos (o su propio esquema efímero) que confiar en una
limpieza común. La solución completa está en `solucion/`:

```bash
# Ejecuta la solución en un orden barajado
npx vitest run --root solucion --sequence.shuffle --sequence.seed=3
```

**La regla:** el estado que no se comparte no puede filtrarse entre pruebas; si hay que
compartirlo, se restaura antes de cada prueba.

</details>

## Errores frecuentes

| Síntoma | Causa probable | Cómo arreglarlo |
|---------|----------------|-----------------|
| `ReferenceError: beforeEach is not defined` | Falta en el `import` de `vitest` | `import { describe, it, expect, beforeEach } from 'vitest';` |
| `ReferenceError: vaciar is not defined` | Falta en el `import` de `../src/carrito.js` | Añade `vaciar` a la lista importada |
| Pasa en orden y falla con `-t` | La prueba depende de lo que hizo otra antes | Que prepare sus propios datos dentro del `it` |
| Falla incluso en orden después de añadir datos propios | No hay `beforeEach` que vacíe el carrito | Añade `beforeEach(() => { vaciar(); });` |
| No puedes reproducir el fallo de un barajado | No conoces la semilla | Copia el número de `Running tests with seed "…"` y úsalo con `--sequence.seed` |

```bash
# Reproduce un orden concreto (cambia 3 por la semilla que viste)
npx vitest run --sequence.shuffle --sequence.seed=3
```

## Conclusiones

### Qué es la independencia entre pruebas

Que el resultado de cada prueba dependa solo de su código y de lo que ella misma prepara, no de
qué otras pruebas se ejecutaron antes ni en qué orden. Su anti-patrón es el **estado compartido**:
datos que una prueba deja y otra da por hechos.

### Cómo debe ser

| Requisito | En el lab |
|-----------|-----------|
| Cada prueba parte de un estado conocido | `beforeEach(() => { vaciar(); })` |
| Cada prueba crea sus propios datos | «calcula el total» añade su libro y su lámpara |
| Se puede ejecutar sola | `-t 'calcula el total'` → `1 passed` |
| Pasa en cualquier orden | 8 de 8 semillas en verde |
| Mejor aún: nada que compartir | `crearCarrito()`: un carrito por prueba |

### Dónde se rompe y cómo lo has detectado

| Fallo | Cómo lo has visto | Qué provoca |
|-------|-------------------|-------------|
| Una prueba usa datos de otra | Sola: `expected +0 to be 55` | No se puede depurar una prueba aislada |
| Orden distinto del escrito | 5 de 8 semillas fallan | Fallos que aparecen al añadir pruebas o paralelizar |
| Datos propios sin limpieza | Sin `beforeEach`: `expected 130 to be 55` | Restos acumulados entre pruebas |
| Limpieza sin datos propios | Con `beforeEach` y las pruebas originales: falla en orden | Dependencia visible (mejor que oculta) |

### Cómo se perfecciona

En una suite real se ejecuta en CI con orden aleatorio (`sequence.shuffle` en la configuración de
Vitest) y en paralelo, para que cualquier dependencia salga pronto; la semilla de cada ejecución
queda en el registro para reproducirla. En las pruebas con base de datos o servidor, cada prueba
crea sus datos con identificadores únicos o trabaja en un [entorno efímero](../glosario/04-ci-cd.md#entorno-efimero) que se crea y se destruye.

### En una frase

> 🔑 Si una prueba solo pasa cuando otra se ejecuta antes, no está probando el código: está
> probando el orden de la suite.
