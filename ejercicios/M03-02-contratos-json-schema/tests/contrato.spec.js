// Pruebas de contrato: el cuerpo de cada respuesta cumple el JSON Schema de contrato/.
import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';

// Carga el esquema y lo compila una vez: «validarTarea(cuerpo)» devuelve true o false
const esquemaTarea = JSON.parse(readFileSync(new URL('../contrato/tarea.schema.json', import.meta.url)));
const ajv = new Ajv({ allErrors: true });
addFormats(ajv); // añade los formatos «date-time», «email», «uri»…
const validarTarea = ajv.compile(esquemaTarea);

test('la tarea 1 cumple el contrato', async ({ request }) => {
  const tarea = await (await request.get('/api/tareas/1')).json();
  const valida = validarTarea(tarea);
  // Si falla, el mensaje de la prueba muestra los errores de Ajv en una línea
  expect(valida, ajv.errorsText(validarTarea.errors)).toBe(true);
});
