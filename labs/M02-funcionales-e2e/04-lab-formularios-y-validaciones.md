# Lab — Formularios y validaciones

[← Página anterior](03-lab-sincronizacion.md) · [Siguiente página →](05-lab-evidencias.md)

En este lab practicas la **interacción con formularios y la validación de sus mensajes** con un
formulario de alta de cuenta (`ejercicios/M02-04-formularios-y-validaciones/`): nombre, correo,
contraseña, confirmación, plan y aceptación de condiciones. El navegador valida cada campo y el
servidor rechaza un correo repetido. La prueba del alta correcta está a medio hacer y falla.

### Objetivo

Comprender cómo se prueba un formulario y sus validaciones: cómo funciona, cómo debe ser, cómo se
detectan sus debilidades y cómo se mejora.

### Punto de partida

- Codespace del curso abierto (`npm run verificar` termina en `Entorno listo`).
- Ejercicio: `ejercicios/M02-04-formularios-y-validaciones/`, con el formulario en `app/public/index.html`,
  la API `POST /api/altas` en `app/server.mjs` y dos pruebas en `tests/alta.spec.js`.
- La aplicación escucha en el puerto **3204**; el servidor guarda las altas en memoria mientras está en marcha.

```bash
# Entra en la carpeta del ejercicio
cd ejercicios/M02-04-formularios-y-validaciones
```

### Qué está pasando

Los formularios son donde más se equivoca un usuario y donde más reglas de negocio se esconden: un
correo mal escrito, una contraseña débil, unas condiciones sin aceptar. Una [prueba funcional](../glosario/01-fundamentos.md#prueba-funcional) de un
formulario comprueba dos cosas:

- **El camino feliz**: con datos válidos, el alta se completa.
- **Cada regla de validación**: con un dato inválido, aparece **el mensaje correcto junto al campo
  correcto** y no se envía nada.

[Playwright](../glosario/02-e2e.md#playwright) tiene una acción para cada tipo de control:

| Control | Acción | En este lab |
|---------|--------|-------------|
| Campo de texto | `fill(valor)` | Nombre, correo, contraseñas |
| Desplegable `<select>` | `selectOption({ label })` | Plan «Profesional» |
| Casilla | `check()` / `setChecked(true\|false)` | «Acepto las condiciones» |
| Botón | `click()` | **Crear cuenta** |

Las validaciones de este formulario están en dos sitios, como en un proyecto real: en el navegador
(formato y obligatoriedad) y en el servidor (correo ya registrado).

### 1 — Leer las reglas en la fuente

Antes de probar un formulario hay que saber qué reglas tiene. Abre
[`app/public/index.html`](../../ejercicios/M02-04-formularios-y-validaciones/app/public/index.html) y
busca el objeto `reglas`:

```js
    const reglas = {
      nombre: () => ($('nombre').value.trim() ? '' : 'El nombre es obligatorio'),
      correo: () => (/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test($('correo').value) ? '' : 'Escribe un correo válido'),
      clave: () => (/^(?=.*\d).{8,}$/.test($('clave').value) ? '' : 'La contraseña necesita 8 caracteres y un número'),
      repite: () => ($('repite').value === $('clave').value ? '' : 'Las contraseñas no coinciden'),
      condiciones: () => ($('condiciones').checked ? '' : 'Debes aceptar las condiciones'),
    };
```

Cinco reglas, cinco mensajes. Cada mensaje se escribe en un `<span class="error">` al lado de su campo,
y el campo inválido queda marcado con `aria-invalid="true"`. Después, en
[`app/server.mjs`](../../ejercicios/M02-04-formularios-y-validaciones/app/server.mjs), el servidor
responde **409** si el correo ya existe.

### 2 — Ejecutar las pruebas de partida

Abre [`tests/alta.spec.js`](../../ejercicios/M02-04-formularios-y-validaciones/tests/alta.spec.js). La
prueba `alta correcta` rellena los campos de texto, pero tiene un hueco (`// Paso 3: …`). Ejecútala:

```bash
# Ejecuta las pruebas (Playwright arranca la aplicación)
npx playwright test
```

**Resultado esperado** (los tiempos cambian en cada ejecución):

```text
Running 2 tests using 1 worker

  ✘  1 [chromium] › tests/alta.spec.js:4:1 › alta correcta (5.2s)
  ✓  2 [chromium] › tests/alta.spec.js:15:1 › el nombre es obligatorio (148ms)


  1) [chromium] › tests/alta.spec.js:4:1 › alta correcta ───────────────────────────────────────────

    Error: expect(locator).toContainText(expected) failed

    Locator: getByRole('status')
    Expected substring: "Alta completada"
    Received string:    ""
    Timeout: 5000ms

  ...
  1 failed
    [chromium] › tests/alta.spec.js:4:1 › alta correcta ────────────────────────────────────────────
  1 passed (6.3s)
```

El mensaje de resultado está vacío: el alta no se ha enviado. El error no dice por qué.

### 3 — Ver la página en el momento del fallo

Abre `test-results/alta-alta-correcta-chromium/error-context.md`. Además del error, trae la página
como árbol de accesibilidad en el instante del fallo:

```yaml
- heading "Alta de cuenta" [level=1]
- text: Nombre
- textbox "Nombre": Ana
- text: Correo electrónico
- textbox "Correo electrónico": ana.1794933185335@example.com
- text: Contraseña
- textbox "Contraseña": secreta123
- text: Repite la contraseña
- textbox "Repite la contraseña": secreta123
- text: Plan
- combobox "Plan":
  - option "Básico" [selected]
  - option "Profesional"
  - option "Empresa"
- checkbox "Acepto las condiciones"
- text: Acepto las condiciones Debes aceptar las condiciones
- button "Crear cuenta"
- status
```

Los textos están rellenos, el plan sigue en «Básico» y junto a la casilla aparece **«Debes aceptar las
condiciones»**: la validación del navegador ha parado el envío. La prueba no tenía un error de la
aplicación: le faltaban dos pasos.

### 4 — Completar el camino feliz

Sustituye la línea `// Paso 3: elige el plan «Profesional» y acepta las condiciones` por:

```js
  await page.getByLabel('Plan').selectOption({ label: 'Profesional' });
  await page.getByLabel('Acepto las condiciones').check();
```

```bash
# Vuelve a ejecutar
npx playwright test
```

**Resultado esperado:**

```text
Running 2 tests using 1 worker

  ✓  1 [chromium] › tests/alta.spec.js:4:1 › alta correcta (228ms)
  ✓  2 [chromium] › tests/alta.spec.js:16:1 › el nombre es obligatorio (107ms)

  2 passed (997ms)
```

`selectOption({ label: 'Profesional' })` elige por el texto que ve el usuario (el `value` es
`profesional`). `check()` marca la casilla y comprueba que ha quedado marcada. El correo lleva
`Date.now()` para que cada ejecución use uno nuevo: el servidor recuerda las altas y rechaza repetidos.

### 5 — Probar una regla de validación

La prueba `el nombre es obligatorio` ya existe: pulsa **Crear cuenta** con todo vacío y comprueba el
mensaje y el atributo `aria-invalid`. Escribe una igual para el correo. Sustituye el comentario
`// Paso 5: …` por:

```js
test('rechaza un correo sin dominio', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel('Correo electrónico').fill('ana@');
  await page.getByRole('button', { name: 'Crear cuenta' }).click();
  await expect(page.getByText('Escribe un correo válido')).toBeVisible();
  await expect(page.getByLabel('Correo electrónico')).toHaveAttribute('aria-invalid', 'true');
});
```

```bash
# Ejecuta las pruebas
npx playwright test
```

**Resultado esperado:**

```text
Running 3 tests using 1 worker

  ✓  1 [chromium] › tests/alta.spec.js:4:1 › alta correcta (189ms)
  ✓  2 [chromium] › tests/alta.spec.js:16:1 › el nombre es obligatorio (99ms)
  ✓  3 [chromium] › tests/alta.spec.js:23:1 › rechaza un correo sin dominio (106ms)

  3 passed (972ms)
```

Comprobar el mensaje **y** `aria-invalid` asegura que el error sale en el campo correcto (y que un
lector de pantalla lo anuncia), no solo que existe en algún sitio de la página.

### 6 — Una prueba por regla, desde una tabla

Quedan cuatro reglas más. Copiar la prueba cuatro veces repetiría el relleno del formulario en cada
una. Mejor: una función que rellena el formulario **válido** y recibe solo lo que cada caso quiere
romper, y una tabla de casos que genera una prueba por fila. Sustituye el contenido de
`tests/alta.spec.js` por el de
[`solucion/tests/alta.spec.js`](../../ejercicios/M02-04-formularios-y-validaciones/solucion/tests/alta.spec.js)
**sin la última prueba** (`el servidor rechaza un correo repetido`). Lo importante:

```js
// Rellena el formulario con datos válidos; cada prueba cambia solo lo que quiere romper
async function rellenar(page, cambios = {}) {
  const datos = {
    nombre: 'Ana',
    correo: `ana.${Date.now()}.${Math.random().toString(36).slice(2, 6)}@example.com`,
    clave: 'secreta123',
    repite: 'secreta123',
    plan: 'Profesional',
    condiciones: true,
    ...cambios,
  };
  await page.goto('/');
  await page.getByLabel('Nombre').fill(datos.nombre);
  await page.getByLabel('Correo electrónico').fill(datos.correo);
  await page.getByLabel('Contraseña', { exact: true }).fill(datos.clave);
  await page.getByLabel('Repite la contraseña').fill(datos.repite);
  await page.getByLabel('Plan').selectOption({ label: datos.plan });
  await page.getByLabel('Acepto las condiciones').setChecked(datos.condiciones);
  return datos;
}

// Una prueba por regla de validación, generadas desde una tabla de casos
const casos = [
  { regla: 'correo sin dominio', cambios: { correo: 'ana@' }, mensaje: 'Escribe un correo válido' },
  { regla: 'contraseña corta', cambios: { clave: 'abc1', repite: 'abc1' }, mensaje: 'La contraseña necesita 8 caracteres y un número' },
  { regla: 'contraseña sin número', cambios: { clave: 'secretisima', repite: 'secretisima' }, mensaje: 'La contraseña necesita 8 caracteres y un número' },
  { regla: 'confirmación distinta', cambios: { repite: 'otra12345' }, mensaje: 'Las contraseñas no coinciden' },
  { regla: 'condiciones sin aceptar', cambios: { condiciones: false }, mensaje: 'Debes aceptar las condiciones' },
];

for (const { regla, cambios, mensaje } of casos) {
  test(`rechaza: ${regla}`, async ({ page }) => {
    await rellenar(page, cambios);
    await page.getByRole('button', { name: 'Crear cuenta' }).click();
    await expect(page.getByText(mensaje)).toBeVisible();
    await expect(page.getByRole('status')).toBeEmpty();     // no se ha enviado nada
  });
}
```

```bash
# Ejecuta las pruebas
npx playwright test
```

**Resultado esperado:**

```text
Running 7 tests using 1 worker

  ✓  1 [chromium] › tests/alta.spec.js:25:1 › alta correcta (193ms)
  ✓  2 [chromium] › tests/alta.spec.js:31:1 › el nombre es obligatorio (92ms)
  ✓  3 [chromium] › tests/alta.spec.js:48:3 › rechaza: correo sin dominio (179ms)
  ✓  4 [chromium] › tests/alta.spec.js:48:3 › rechaza: contraseña corta (176ms)
  ✓  5 [chromium] › tests/alta.spec.js:48:3 › rechaza: contraseña sin número (153ms)
  ✓  6 [chromium] › tests/alta.spec.js:48:3 › rechaza: confirmación distinta (146ms)
  ✓  7 [chromium] › tests/alta.spec.js:48:3 › rechaza: condiciones sin aceptar (116ms)

  7 passed (1.7s)
```

Cinco pruebas salen de la misma línea (`alta.spec.js:48:3`), cada una con su nombre. Cada caso parte
de un formulario válido y rompe **una sola cosa**: si falla, se sabe qué regla es. La última [aserción](../glosario/01-fundamentos.md#asercion)
(`status` vacío) comprueba que la validación del navegador ha impedido el envío.

## Comprueba tu entendimiento

**La etiqueta que se parece a otra**
En `rellenar`, quita `{ exact: true }` de `getByLabel('Contraseña', …)` y ejecuta `npx playwright test -g "alta correcta"`.
→ `strict mode violation: getByLabel('Contraseña') resolved to 2 elements`: también encaja «Repite la contraseña». Vuelve a poner `exact: true`.

**Qué regla falla**
En la tabla, cambia el mensaje de `confirmación distinta` por `'Las contraseñas no son iguales'` y ejecuta.
→ Falla solo `rechaza: confirmación distinta`, con el texto esperado en el error. Déjalo como estaba.

## Mejora

Las reglas del navegador no protegen de todo: dos personas pueden registrarse con el mismo correo, y
eso solo lo sabe el servidor. Añade al final del fichero una prueba que da de alta un correo y lo
vuelve a intentar:

```js
test('el servidor rechaza un correo repetido', async ({ page }) => {
  const { correo } = await rellenar(page);
  await page.getByRole('button', { name: 'Crear cuenta' }).click();
  await expect(page.getByRole('status')).toContainText('Alta completada');

  await rellenar(page, { correo });                          // mismo correo otra vez
  await page.getByRole('button', { name: 'Crear cuenta' }).click();
  await expect(page.getByRole('status')).toHaveText('Ese correo ya está registrado');
});
```

```bash
# Ejecuta solo la prueba nueva
npx playwright test -g "repetido"
```

**Resultado esperado:**

```text
Running 1 test using 1 worker

  ✓  1 [chromium] › tests/alta.spec.js:56:1 › el servidor rechaza un correo repetido (420ms)

  1 passed (1.0s)
```

`rellenar` devuelve los datos que ha usado: la segunda vuelta reutiliza el mismo correo. Esta es la
única prueba que depende del estado del servidor, y lo crea ella misma en su primera mitad. Ya tienes
la solución completa:

```bash
# Ejecuta la solución
npx playwright test --config solucion/playwright.config.js
```

## Reto

### 1 — Una regla nueva, primero la prueba

**La situación:** seguridad pide una regla nueva: la contraseña no puede contener el nombre de la
persona (sin distinguir mayúsculas). El mensaje acordado es «La contraseña no puede contener tu nombre».

**Qué haces:** primero añade el caso a la tabla de `tests/alta.spec.js` (nombre `Ana`, contraseña
`ana12345`) y ejecuta las pruebas de rechazo: tiene que fallar, porque la regla no existe. Después
implementa la regla en `reglas.clave` de `app/public/index.html` y vuelve a ejecutar toda la suite.

```bash
# Las pruebas de rechazo (también entra la del correo repetido, que contiene «rechaza»)
npx playwright test -g "rechaza"
```

**Pistas:** en la tabla, `cambios: { clave: 'ana12345', repite: 'ana12345' }` (el nombre ya es `Ana`
en `rellenar`). En la regla: `.toLowerCase()` e `.includes()`; conserva el mensaje de longitud para
contraseñas cortas.

**Lo que buscas:** el caso nuevo falla antes de tocar la aplicación y toda la suite pasa después.

<details>
<summary>Ver solución</summary>

Fila nueva de la tabla:

```js
  { regla: 'contraseña con el nombre', cambios: { clave: 'ana12345', repite: 'ana12345' }, mensaje: 'La contraseña no puede contener tu nombre' },
```

Antes de tocar la aplicación (extracto):

```text
  ✘  5 [chromium] › tests/alta.spec.js:49:3 › rechaza: contraseña con el nombre (5.2s)

    Error: expect(locator).toBeVisible() failed

    Locator: getByText('La contraseña no puede contener tu nombre')
    Expected: visible
    Timeout: 5000ms
    Error: element(s) not found

  1 failed
    [chromium] › tests/alta.spec.js:49:3 › rechaza: contraseña con el nombre ───────────────────────
  6 passed (8.8s)
```

Regla en `app/public/index.html`:

```js
      clave: () => {
        const clave = $('clave').value;
        const nombre = $('nombre').value.trim().toLowerCase();
        if (!/^(?=.*\d).{8,}$/.test(clave)) return 'La contraseña necesita 8 caracteres y un número';
        if (nombre && clave.toLowerCase().includes(nombre)) return 'La contraseña no puede contener tu nombre';
        return '';
      },
```

```bash
# Toda la suite
npx playwright test
```

```text
Running 9 tests using 1 worker

  ✓  1 [chromium] › tests/alta.spec.js:25:1 › alta correcta (214ms)
  ✓  2 [chromium] › tests/alta.spec.js:31:1 › el nombre es obligatorio (102ms)
  ✓  3 [chromium] › tests/alta.spec.js:49:3 › rechaza: correo sin dominio (145ms)
  ✓  4 [chromium] › tests/alta.spec.js:49:3 › rechaza: contraseña corta (155ms)
  ✓  5 [chromium] › tests/alta.spec.js:49:3 › rechaza: contraseña sin número (188ms)
  ✓  6 [chromium] › tests/alta.spec.js:49:3 › rechaza: confirmación distinta (148ms)
  ✓  7 [chromium] › tests/alta.spec.js:49:3 › rechaza: contraseña con el nombre (150ms)
  ✓  8 [chromium] › tests/alta.spec.js:49:3 › rechaza: condiciones sin aceptar (119ms)
  ✓  9 [chromium] › tests/alta.spec.js:57:1 › el servidor rechaza un correo repetido (286ms)

  9 passed (2.1s)
```

La regla nueva ha costado una fila en la tabla; las demás pruebas siguen pasando, así que la regla
no ha roto las anteriores (el alta correcta usa `secreta123`, que no contiene «ana»). **La regla:** con
una tabla de casos, cada regla de validación nueva es una fila, y se escribe antes que el código para
ver que la prueba falla por el motivo correcto.

</details>

## Errores frecuentes

| Síntoma | Causa probable | Cómo arreglarlo |
|---------|----------------|-----------------|
| `Received string: ""` en el mensaje de resultado | Una validación del navegador ha parado el envío | Mirar `error-context.md`: el mensaje de error aparece junto al campo |
| `strict mode violation: getByLabel('Contraseña')` | Dos etiquetas contienen «Contraseña» | `getByLabel('Contraseña', { exact: true })` |
| `Ese correo ya está registrado` en el alta correcta | Correo fijo y el servidor recuerda las altas de ejecuciones anteriores | Generar un correo único (`Date.now()`) o reiniciar la aplicación |
| `selectOption` no encuentra la opción | Se pasa el texto visible como `value` | `selectOption({ label: 'Profesional' })` o el `value` real (`'profesional'`) |

## Conclusiones

### Qué es probar un formulario

Rellenar cada control con la acción que le corresponde (`fill`, `selectOption`, `check`), enviar y
comprobar el resultado: el alta en el camino feliz y, en cada regla, el mensaje correcto en el campo
correcto sin que se envíe nada. Las reglas viven en el navegador y en el servidor, y las dos se prueban.

### Cómo debe ser

| Requisito | En el lab |
|-----------|-----------|
| Un camino feliz completo | `alta correcta` con plan y condiciones |
| Una prueba por regla, que rompe una sola cosa | Tabla `casos` con 5 filas, `rellenar(page, cambios)` |
| Se comprueba el mensaje **y** el campo | `getByText(mensaje)` y `aria-invalid="true"` |
| Se comprueba que no se envía nada | `expect(status).toBeEmpty()` |
| Las reglas del servidor también | `el servidor rechaza un correo repetido` (409) |
| Datos únicos por ejecución | Correo con `Date.now()` |

### Dónde se rompe y cómo lo has detectado

| Fallo | Cómo lo has visto | Qué provoca |
|-------|-------------------|-------------|
| Prueba incompleta (faltan pasos) | `Received string: ""` y «Debes aceptar las condiciones» en `error-context.md` | Falso fallo que parece de la aplicación |
| Etiqueta ambigua | `strict mode violation` sin `exact: true` | La prueba no sabe qué campo rellenar |
| Regla que no existe | El caso del reto falla con `element(s) not found` | Una regla pedida pero no implementada se detecta antes de publicar |

### Cómo se perfecciona

En un proyecto real, la tabla de casos sale de los criterios de aceptación de la historia de usuario,
y las reglas del navegador se prueban también **sin navegador** ([pruebas unitarias](../glosario/01-fundamentos.md#prueba-unitaria) de las funciones
de validación) para que la suite E2E se quede con el camino feliz y unas pocas reglas
representativas. Las reglas del servidor se prueban además directamente contra la API.

### En una frase

> 🔑 Un formulario se prueba con un caso válido completo y una fila por regla que rompe una sola cosa, comprobando el mensaje, el campo y que no se ha enviado nada.
