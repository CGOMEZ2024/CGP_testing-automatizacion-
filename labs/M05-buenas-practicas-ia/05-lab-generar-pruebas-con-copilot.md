# Lab — Generar pruebas con Copilot

[← Página anterior](04-lab-refactorizar-escenarios.md) · [Siguiente página →](06-lab-depurar-con-ia.md)

Practicas la **[generación asistida](../glosario/05-calidad-e-ia.md#generacion-asistida) de pruebas** con una función que valida contraseñas según cinco
reglas de negocio. Pides a [GitHub Copilot](../glosario/05-calidad-e-ia.md#github-copilot) las pruebas
unitarias, las ejecutas, las revisas con criterios objetivos (límites, errores, [aserciones](../glosario/01-fundamentos.md#asercion) débiles y
mutantes vivos) y completas lo que se le ha escapado. Al final grabas una prueba E2E de la página de
registro con `npx playwright codegen`, la otra forma de generar pruebas automáticamente, y la revisas igual.

### Objetivo

Comprender qué es la generación asistida de pruebas: cómo funciona, cómo debe ser su resultado para darlo
por bueno, cómo se detectan sus huecos y cómo se mejora.

### Punto de partida

- Codespace del curso abierto, con la extensión **GitHub Copilot Chat** activa (icono de Copilot en la
  barra de estado). Necesitas una cuenta de GitHub con Copilot (el plan gratuito sirve).
- Terminal en la carpeta del ejercicio
  [`ejercicios/M05-05-generar-pruebas-con-copilot/`](../../ejercicios/M05-05-generar-pruebas-con-copilot/README.md).
- `tests/` y `e2e/` están vacías: ahí guardas lo que generes. En `ejemplos/` hay un ejemplo de respuesta
  de Copilot y uno de grabación de [codegen](../glosario/05-calidad-e-ia.md#codegen), por si no tienes Copilot o el escritorio.
- Para codegen: el escritorio del Codespace (puerto **6080**, pestaña **Ports**, contraseña `curso`).

```bash
# Entra en la carpeta del ejercicio
cd ejercicios/M05-05-generar-pruebas-con-copilot
```

### Qué está pasando

Escribir pruebas es la tarea en la que más se usa la IA en los equipos: es repetitiva y el código ya
existe. Copilot lee la función y propone casos en segundos. Pero **lee el código, no el requisito**:
tiende a probar lo que el código hace, con los valores «típicos», y omite los límites y los errores que
el código no deja ver. Una prueba generada que pasa a la primera no se ha visto fallar nunca: hay que
comprobar que es capaz de hacerlo.

| Pieza | Qué es |
|-------|--------|
| `src/contrasena.js` | `validarContrasena(clave, { usuario })` → `{ valida, errores }`. Reglas: 12–64 caracteres; mayúscula, minúscula, dígito y símbolo; sin espacios; sin el usuario (sin distinguir mayúsculas); `TypeError` si no es texto |
| `vitest.config.js` / `stryker.config.json` | Para ejecutar las pruebas y medir mutantes |
| `app/` + `playwright.config.js` | Página de registro (puerto 3505) que usa la misma función; pruebas E2E en `e2e/` |

### 1 — Leer la función

Abre `src/contrasena.js`. Las reglas están en el comentario de cabecera y cada `errores.push('…')`
corresponde a una:

```js
  if (clave.length < 12 || clave.length > 64) errores.push('longitud');
  if (!/[A-ZÁÉÍÓÚÑ]/.test(clave)) errores.push('mayuscula');
  if (!/[a-záéíóúñ]/.test(clave)) errores.push('minuscula');
  if (!/[0-9]/.test(clave)) errores.push('digito');
  if (!/[^A-Za-zÁÉÍÓÚÑáéíóúñ0-9\s]/.test(clave)) errores.push('simbolo');
  if (/\s/.test(clave)) errores.push('espacios');
  if (usuario && clave.toLowerCase().includes(usuario.toLowerCase())) errores.push('usuario');
```

Antes de pedir nada, haz tu propia lista mental de casos que no deberían faltar: es con lo que vas a
comparar la respuesta.

### 2 — Pedir las pruebas a Copilot

Con el fichero abierto en el editor, pides las pruebas desde la vista de Chat, dándole el fichero como
contexto y el marco de pruebas que usa el proyecto.

1. Abre la vista de Chat: icono de **Copilot** en la barra de título → **Open Chat**, o `Ctrl+Alt+I`.
2. En el selector de modo, debajo del cuadro de texto, elige **Ask**.
3. Pulsa **Add Context…** (el clip) y elige `src/contrasena.js`, o escribe `#file:src/contrasena.js` en el mensaje.
4. Escribe este prompt y envíalo:

```text
#file:src/contrasena.js
Escribe pruebas unitarias con Vitest (ESM, import { describe, it, expect } from 'vitest')
para validarContrasena. El fichero de pruebas estará en tests/contrasena.test.js
e importará la función desde '../src/contrasena.js'.
```

> [!TIP]
> Atajo equivalente: selecciona la función en el editor, pulsa `Ctrl+I` (chat en línea) y escribe `/tests`.
> Copilot propone un fichero de pruebas nuevo; revisa en qué ruta lo crea antes de aceptarlo.

**Ejemplo de respuesta** (la tuya será distinta; este ejemplo está en `ejemplos/contrasena.copilot.test.js`):

```js
import { describe, it, expect } from 'vitest';
import { validarContrasena } from '../src/contrasena.js';

describe('validarContrasena', () => {
  it('should accept a valid password', () => {
    const result = validarContrasena('Segura#2024abc');
    expect(result.valida).toBe(true);
    expect(result.errores).toEqual([]);
  });

  it('should reject a password that is too short', () => {
    const result = validarContrasena('Ab1!');
    expect(result.valida).toBe(false);
  });

  it('should reject a password without uppercase letters', () => {
    const result = validarContrasena('segura#2024abc');
    expect(result.valida).toBe(false);
    expect(result.errores).toContain('mayuscula');
  });

  // … minúsculas, dígitos y símbolos, con la misma forma …

  it('should reject a password that contains the username', () => {
    const result = validarContrasena('Ana#2024segura', { usuario: 'Ana' });
    expect(result.valida).toBe(false);
  });

  it('should throw if password is not a string', () => {
    expect(() => validarContrasena(12345)).toThrow();
  });
});
```

Guarda la respuesta como `tests/contrasena.test.js` (botón **Insert into New File** del bloque de código
y **Save As…**, o copia y pega). Si no tienes Copilot, usa el ejemplo:

```bash
# Solo si no tienes la respuesta de Copilot: copia el ejemplo
cp ejemplos/contrasena.copilot.test.js tests/contrasena.test.js
```

### 3 — Ejecutar lo generado

```bash
# Las pruebas generadas, con su nombre
npx vitest run --reporter=verbose
```

**Resultado esperado** (con el ejemplo; con tu respuesta, el número y los nombres cambian):

```text
 ✓ tests/contrasena.test.js > validarContrasena > should accept a valid password 2ms
 ✓ tests/contrasena.test.js > validarContrasena > should reject a password that is too short 0ms
 ✓ tests/contrasena.test.js > validarContrasena > should reject a password without uppercase letters 1ms
 ✓ tests/contrasena.test.js > validarContrasena > should reject a password without lowercase letters 0ms
 ✓ tests/contrasena.test.js > validarContrasena > should reject a password without digits 0ms
 ✓ tests/contrasena.test.js > validarContrasena > should reject a password without symbols 0ms
 ✓ tests/contrasena.test.js > validarContrasena > should reject a password that contains the username 0ms
 ✓ tests/contrasena.test.js > validarContrasena > should throw if password is not a string 0ms

 Test Files  1 passed (1)
      Tests  8 passed (8)
```

Ocho pruebas en verde a la primera. Si alguna de las tuyas falla, lee el error antes de culpar al código:
a veces Copilot inventa un valor o un nombre de error que no existe (`'uppercase'` en vez de `'mayuscula'`).

### 4 — Revisar con criterios, no a ojo

Una prueba generada se revisa con las mismas preguntas que una escrita a mano. Aplicadas al ejemplo:

| Criterio | Qué buscas | En el ejemplo |
|----------|------------|---------------|
| **Límites** de cada regla | 11, 12, 64 y 65 caracteres | Solo `'Ab1!'` (4 caracteres) |
| **Todas las reglas** | Una prueba por `errores.push` | Falta `espacios` |
| **Aserción que distingue el motivo** | `errores` exactos, no solo `valida: false` | «too short» y «username» solo miran `valida`: `'Ab1!'` es inválida por longitud, pero la prueba pasaría igual si fallara por otra cosa |
| **Variantes del requisito** | «sin distinguir mayúsculas» | Usuario `'Ana'` dentro de `'Ana#…'`: mismas mayúsculas |
| **Errores** con su tipo o mensaje | `toThrow(TypeError)` o el mensaje | `toThrow()` acepta cualquier error |
| **Combinaciones** | Varios errores a la vez | No hay |

Para no depender solo de tu lectura, lo mides. Primero la cobertura:

```bash
# Qué líneas de src/ ejecutan las pruebas generadas
npx vitest run --coverage
```

**Resultado esperado** (con el ejemplo):

```text
---------------|---------|----------|---------|---------|-------------------
File           | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
---------------|---------|----------|---------|---------|-------------------
All files      |   94.44 |    95.45 |     100 |     100 |                   
 contrasena.js |   94.44 |    95.45 |     100 |     100 | 19                
---------------|---------|----------|---------|---------|-------------------
```

100 % de líneas: la cobertura apenas avisa (la línea 19, `espacios`, sale como sentencia sin ejecutar).
Después, los mutantes:

```bash
# Qué errores sembrados dejan pasar las pruebas generadas
npx stryker run
```

**Resultado esperado** (con el ejemplo; extracto):

```text
[Survived] EqualityOperator
src/contrasena.js:14:7
-     if (clave.length < 12 || clave.length > 64) errores.push('longitud');
+     if (clave.length <= 12 || clave.length > 64) errores.push('longitud');
…
[Survived] ConditionalExpression
src/contrasena.js:14:28
-     if (clave.length < 12 || clave.length > 64) errores.push('longitud');
+     if (clave.length < 12 || false) errores.push('longitud');
…
[Survived] ConditionalExpression
src/contrasena.js:19:7
-     if (/\s/.test(clave)) errores.push('espacios');
+     if (false) errores.push('espacios');
…
[Survived] StringLiteral
src/contrasena.js:20:84
-     if (usuario && clave.toLowerCase().includes(usuario.toLowerCase())) errores.push('usuario');
+     if (usuario && clave.toLowerCase().includes(usuario.toLowerCase())) errores.push("");
…
All files      |  83.33 |   84.91 |       45 |         0 |          8 |        1 |        0 |
 contrasena.js |  83.33 |   84.91 |       45 |         0 |          8 |        1 |        0 |
```

Cada superviviente confirma un hueco de la tabla: con estas pruebas se podría aceptar una contraseña de
12 caracteres como corta, aceptar una de 200, aceptar espacios o devolver el error del usuario vacío, y
todo seguiría en verde.

### 5 — Pedir lo que falta y completar

Le das a Copilot lo que has encontrado. En la misma conversación (así conserva el contexto), con
`tests/contrasena.test.js` abierto:

```text
#file:tests/contrasena.test.js #file:src/contrasena.js
Revisa estas pruebas. Faltan: los límites de longitud (11, 12, 64 y 65 caracteres),
la regla de espacios, que el usuario se detecte sin distinguir mayúsculas y un caso
con varios errores a la vez. Además, cada prueba de rechazo debe comprobar el array
errores exacto con toEqual, y la de TypeError, el tipo y el mensaje.
Añade y corrige las pruebas sin cambiar src/contrasena.js.
```

**Ejemplo de respuesta** (resumen; la tuya será distinta): Copilot reescribe las aserciones con
`toEqual([...])`, añade un `it.each` con las cuatro longitudes, una prueba con espacio, otra con
`'XANA#2024segura'` y usuario `'ana'`, y una con `'abc'` y cuatro errores.

Aplica los cambios (en modo **Edit** o **Agent**, Copilot los propone sobre el fichero; revisa el diff y
pulsa **Keep**) o compara con la versión revisada de `solucion/tests/contrasena.test.js`. Ejecuta las dos
medidas otra vez:

```bash
# Pruebas completadas y sus mutantes
npx vitest run --reporter=verbose
npx stryker run
```

**Resultado esperado** (con la solución del ejercicio; extracto):

```text
 ✓ tests/contrasena.test.js > validarContrasena > longitud: 11 caracteres: corta 0ms
 ✓ tests/contrasena.test.js > validarContrasena > longitud: 12 caracteres: vale (límite) 0ms
 ✓ tests/contrasena.test.js > validarContrasena > longitud: 64 caracteres: vale (límite) 0ms
 ✓ tests/contrasena.test.js > validarContrasena > longitud: 65 caracteres: larga 0ms
 ✓ tests/contrasena.test.js > validarContrasena > con un espacio en medio 0ms
 ✓ tests/contrasena.test.js > validarContrasena > el usuario se detecta sin distinguir mayúsculas 0ms
 ✓ tests/contrasena.test.js > validarContrasena > sin usuario, no se comprueba esa regla 0ms
 ✓ tests/contrasena.test.js > validarContrasena > acumula todos los errores que tenga 0ms
…
      Tests  16 passed (16)
…
[Survived] StringLiteral
src/contrasena.js:9:54
-   export function validarContrasena(clave, { usuario = '' } = {}) {
+   export function validarContrasena(clave, { usuario = "Stryker was here!" } = {}) {
…
All files      |  98.15 |   98.15 |       53 |         0 |          1 |        0 |        0 |
 contrasena.js |  98.15 |   98.15 |       53 |         0 |          1 |        0 |        0 |
```

De 83,33 % a 98,15 %. El único superviviente cambia el usuario por defecto por un texto que ninguna
contraseña razonable contiene: no delata un caso que falte.

> [!WARNING]
> Al reescribir aserciones, comprueba que no se pierde nada. En una primera versión de la solución, todas
> las pruebas de rechazo pasaron a mirar solo `errores` y sobrevivió el mutante `valida: true`: ninguna
> comprobaba ya que `valida` fuera `false`. Una prueba con `toEqual({ valida: false, errores: [...] })` lo resolvió.

### 6 — Grabar una prueba E2E con codegen

`npx playwright codegen` es generación automática sin IA:
abre un navegador, graba lo que haces y escribe la prueba. Necesita una pantalla, así que se usa en el
escritorio del Codespace.

1. Arranca la aplicación en un terminal (se queda en marcha):

```bash
# Terminal 1 — la página de registro en el puerto 3505
node app/server.mjs
```

2. Abre el escritorio: pestaña **Ports** → puerto **6080** → icono del globo (**Open in Browser**) →
   **Connect**, contraseña `curso`.
3. En otro terminal de VS Code, lanza codegen. El navegador y la ventana **[Playwright](../glosario/02-e2e.md#playwright) Inspector** aparecen
   en el escritorio:

```bash
# Terminal 2 — graba sobre la página de registro
npx playwright codegen http://localhost:3505/registro.html
```

4. En el navegador del escritorio: en **Usuario** escribe `ana`; en **Contraseña**, `Segura#2024abc`;
   pulsa **Crear cuenta**.
5. En la barra de herramientas de codegen, pulsa **Assert text** y haz clic sobre el texto
   `Cuenta creada para ana`.
6. En el Inspector, copia el código (botón **Copy**), cierra el navegador y guárdalo como
   `e2e/registro.spec.js`. Para el terminal 1 con `Ctrl+C`.

**Ejemplo de grabación** (la tuya será parecida, no idéntica; este ejemplo está en
`ejemplos/registro.codegen.spec.js`):

```js
import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('http://localhost:3505/registro.html');
  await page.getByRole('textbox', { name: 'Usuario' }).click();
  await page.getByRole('textbox', { name: 'Usuario' }).fill('ana');
  await page.getByRole('textbox', { name: 'Contraseña' }).click();
  await page.getByRole('textbox', { name: 'Contraseña' }).fill('Segura#2024abc');
  await page.getByRole('button', { name: 'Crear cuenta' }).click();
  await expect(page.getByRole('status')).toContainText('Cuenta creada para ana');
});
```

```bash
# Ejecuta la grabación (Playwright arranca la app con webServer)
npx playwright test
```

**Resultado esperado** (con el ejemplo; el tiempo cambia):

```text
Running 1 test using 1 worker

  ✓  1 e2e/registro.spec.js:5:1 › test (244ms)

  1 passed
```

Funciona, y los [localizadores](../glosario/02-e2e.md#localizador) por rol son buenos. Lo que la grabación no sabe: se llama `test`, lleva
`click()` que sobran antes de cada `fill`, la URL es absoluta (ignora `baseURL`) y solo graba el camino
feliz. La versión revisada, con un segundo caso de error, está en `solucion/e2e/registro.spec.js`:

```bash
# La grabación revisada
npx playwright test --config solucion/playwright.config.js
```

**Resultado esperado** (los tiempos cambian):

```text
Running 2 tests using 1 worker

  ✓  1 solucion/e2e/registro.spec.js:9:1 › con una contraseña válida se crea la cuenta (185ms)
  ✓  2 solucion/e2e/registro.spec.js:17:1 › si la contraseña contiene el usuario, se muestra ese error (131ms)

  2 passed (920ms)
```

## Comprueba tu entendimiento

**Una prueba generada que no protege**
En `src/contrasena.js`, cambia `clave.length > 64` por `clave.length > 200` (un error: el máximo deja de
aplicarse) y ejecuta las pruebas del ejemplo y las de la solución:

```bash
# Las pruebas del ejemplo de Copilot contra el código roto
cp ejemplos/contrasena.copilot.test.js tests/contrasena.test.js
npx vitest run
# Las de la solución contra el mismo código
npx vitest run --config solucion/vitest.config.js
```

→ Con el ejemplo, `Tests  8 passed (8)`: una contraseña de 200 caracteres sería válida y nadie lo
nota. Con la solución, `FAIL … longitud: 65 caracteres: larga` con
`AssertionError: expected [] to deeply equal [ 'longitud' ]`. Deshaz el cambio en `src/contrasena.js`.

**Lo que ve [Stryker](../glosario/05-calidad-e-ia.md#mutation-testing) y lo que ves tú**
Compara la tabla del paso 4 con los supervivientes del primer `npx stryker run`.
→ Límites, espacios, el código de error del usuario y el mensaje del `TypeError` aparecen como mutantes
vivos. «Variantes del requisito» (mayúsculas del usuario) y «combinaciones» no: Stryker solo siembra
errores en el código que existe; lo que el requisito pide y el código no expresa lo tienes que pensar tú.

## Investiga

¿Cambia la respuesta según el contexto que das? Abre una conversación nueva (**New Chat**, el `+` de la
vista de Chat) y pide lo mismo del paso 2 añadiendo el requisito escrito: copia el comentario de cabecera
de `src/contrasena.js` en el prompt y pide explícitamente «incluye los valores límite de cada regla».
Ejecuta Stryker sobre lo que genere y compara el [mutation score](../glosario/05-calidad-e-ia.md#mutation-score) con el de tu primera respuesta. Prueba
también el modo **Agent** pidiéndole que ejecute `npx stryker run` y mate los supervivientes: observa qué
comandos te pide permiso para ejecutar y si alguna prueba que añade solo sirve para mover el número.

## Reto

### 1 — «Copilot dice que ya está bien probado»

**La situación:** un compañero pega en el chat las pruebas del paso 2 y pregunta «¿faltan casos?».
Copilot contesta que la cobertura es completa. Él propone fusionar.

**Qué haces:** escribe en `tests/` una sola prueba nueva, sin mirar la solución, que **falle** con el
código de la izquierda y pase con el de la derecha, para cada una de estas dos mutaciones (aplícalas a
mano en `src/contrasena.js`, una cada vez, y deshazlas después):

| Original | Mutación |
|----------|----------|
| `clave.length > 64` | `clave.length >= 64` |
| `if (/\s/.test(clave))` | `if (false)` |

```bash
# Tras cada mutación, tus pruebas tienen que fallar
npx vitest run
```

**Pistas:** `'x'.repeat(n)` construye textos largos; una contraseña que cumple todo salvo el espacio es
`'Segura #2024abc'`.

**Lo que buscas:** dos pruebas que detectan cada mutación, y la respuesta argumentada a «¿está bien
probado?»: lo que lo demuestra es un mutante muerto, no la opinión del asistente.

<details>
<summary>Ver solución</summary>

```js
it.each([
  ['64 caracteres: vale (límite)', 'Ab#1' + 'x'.repeat(60), []],
])('longitud: %s', (_caso, clave, errores) => {
  expect(validarContrasena(clave).errores).toEqual(errores);
});

it('con un espacio en medio', () => {
  expect(validarContrasena('Segura #2024abc').errores).toEqual(['espacios']);
});
```

Con la mutación `>= 64`:

```text
   × longitud: 64 caracteres: vale (límite) 5ms
      Tests  1 failed | 1 passed (2)
```

Con la mutación `if (false)`:

```text
   × con un espacio en medio 4ms
AssertionError: expected [] to deeply equal [ 'espacios' ]
      Tests  1 failed | 1 passed (2)
```

Cada prueba mata su mutante: la de 64 caracteres recibe `['longitud']` cuando no debería, y la del
espacio devuelve `[]`. Con todas las pruebas de la solución, Stryker da `98.15` (paso 5).

**La regla:** la IA propone y opina; una suite está bien probada cuando sus pruebas fallan ante los
errores que importan, y eso se comprueba ejecutando, no preguntando.

</details>

## Errores frecuentes

| Síntoma | Causa probable | Cómo arreglarlo |
|---------|----------------|-----------------|
| `Failed to resolve import "../src/contrasena.js"` | Copilot puso otra ruta o guardaste el fichero en otra carpeta | El fichero va en `tests/` e importa `'../src/contrasena.js'` |
| `ReferenceError: describe is not defined` | Copilot asumió Jest con globales | Añade `import { describe, it, expect } from 'vitest';` (o pídeselo indicando [Vitest](../glosario/01-fundamentos.md#vitest)) |
| Pruebas con `jest.fn()` o `@jest/globals` | Copilot usó Jest | Repite el prompt indicando «Vitest, ESM» o cambia `jest` por `vi` |
| `No test files found` | `tests/` está vacía o el fichero no acaba en `.test.js` | Guarda la respuesta como `tests/contrasena.test.js` |
| codegen: `Looks like you launched a headed browser without having a XServer running` | El terminal no ve el escritorio | Ejecuta `export DISPLAY=:1` en ese terminal y repite codegen |
| codegen abre la página en blanco o con error de conexión | La app no está arrancada | Terminal 1: `node app/server.mjs` |
| La grabación falla con `Timeout` en un `click` | Grabaste un clic en algo que cambia (un texto con la hora, un id generado) | Borra esa línea o cambia el localizador por uno por rol o etiqueta |

## Conclusiones

### Qué es la generación asistida de pruebas

Un asistente (Copilot) o un grabador (codegen) escribe el código de la prueba a partir del código fuente o
de lo que haces en la página. Acelera la parte mecánica; no sabe qué es importante comprobar ni conoce el
requisito, salvo que se lo des.

### Cómo debe ser

| Requisito | En el lab |
|-----------|-----------|
| Pedir con contexto: fichero, marco de pruebas, rutas | `#file:src/contrasena.js`, «Vitest (ESM)», `tests/contrasena.test.js` |
| Ejecutar lo generado antes de leerlo con calma | 8 pruebas en verde a la primera, que no demuestran nada todavía |
| Revisar con criterios | Límites, todas las reglas, aserciones exactas, errores, combinaciones |
| Medir, no opinar | Stryker: 83,33 % → 98,15 % |
| Grabaciones revisadas | `test` → nombres con significado, sin clics sobrantes, `baseURL`, caso de error |

### Dónde se rompe y cómo lo has detectado

| Fallo | Cómo lo has visto | Qué provoca |
|-------|-------------------|-------------|
| Límites omitidos | Mutantes `<= 12` y `>= 64` vivos | Una contraseña de 12 o de 200 caracteres mal tratada pasaría |
| Regla omitida | `if (false) … 'espacios'` vivo; línea 19 sin ejecutar | Se aceptarían espacios |
| Aserción débil | «too short» solo mira `valida` | La prueba pasa por la razón equivocada |
| Refuerzo mal hecho | `valida: true` vivo al pasar todo a `errores` | Se pierde una comprobación al «mejorar» |
| Grabación literal | Nombre `test`, URL absoluta, solo el camino feliz | Prueba difícil de mantener y que cubre la mitad |

### Cómo se perfecciona

En un proyecto real, el equipo fija en el repositorio instrucciones para Copilot
(`.github/copilot-instructions.md`: marco de pruebas, estilo, «incluye siempre los límites»), las pruebas
generadas pasan la misma revisión de código que las demás, y Stryker o la revisión de mutantes se usa
como criterio de aceptación de lo generado. Codegen se usa para descubrir localizadores y esbozar un
flujo, y después se refactoriza a [Page Objects](../glosario/02-e2e.md#page-object).

### En una frase

> 🔑 La IA escribe las pruebas en segundos; tú decides qué tienen que comprobar y lo demuestras
> ejecutándolas contra errores sembrados.
