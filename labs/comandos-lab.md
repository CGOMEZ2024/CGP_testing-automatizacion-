# Comandos del curso

[← Volver al inicio](../README.md)

Comandos propios de este repositorio. El resto (`npx playwright`, `npx vitest`, `npx newman`…) son
las herramientas tal cual, explicadas en cada laboratorio.

<a id="verificar"></a>
## `npm run verificar`

**Qué hace:** pregunta su versión a cada herramienta del curso y dice si falta alguna.

**Necesita:** el Codespace creado (al crearlo, `scripts/instalar-entorno.sh` instala las dependencias).

**Lee / escribe:** no lee ni escribe ficheros; solo ejecuta `<herramienta> --version`.

**Termina bien:** todas las líneas con `OK` y `Entorno listo` (código de salida 0).
**Termina mal:** alguna línea `FALTA` (código 1). Se arregla reinstalando:

```bash
# Reinstala las dependencias del curso (lo mismo que se hace al crear el Codespace)
bash scripts/instalar-entorno.sh
```

```bash
# Comprueba el entorno
npm run verificar
```

<details>
<summary>Qué hace por dentro (<code>scripts/verificar-entorno.mjs</code>)</summary>

```js
// Para cada herramienta, ejecuta su comando de versión y muestra la primera línea
const herramientas = [
  ['Node.js', 'node --version'],
  ['Playwright', 'npx --no-install playwright --version'],
  // … Vitest, Cypress, Newman, Prism, Allure, Docker, GitHub CLI
];
for (const [nombre, comando] of herramientas) {
  try {
    const salida = execSync(comando).toString().trim().split('\n')[0];
    console.log(`OK     ${nombre.padEnd(11)} ${salida}`);
  } catch {
    fallos++;                       // la herramienta no responde
    console.log(`FALTA  ${nombre.padEnd(11)} …`);
  }
}
process.exit(fallos ? 1 : 0);       // 1 si falta algo
```

</details>
