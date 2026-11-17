// Solución: valida la tarea suelta y cada elemento de la lista.
import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';

const esquemaTarea = JSON.parse(readFileSync(new URL('../contrato/tarea.schema.json', import.meta.url)));
const ajv = new Ajv({ allErrors: true });
addFormats(ajv);
const validarTarea = ajv.compile(esquemaTarea);
// La lista es un array cuyos elementos cumplen el esquema de la tarea
const validarLista = ajv.compile({ type: 'array', minItems: 1, items: esquemaTarea });

test('la tarea 1 cumple el contrato', async ({ request }) => {
  const tarea = await (await request.get('/api/tareas/1')).json();
  const valida = validarTarea(tarea);
  expect(valida, ajv.errorsText(validarTarea.errors)).toBe(true);
});

test('la lista cumple el contrato', async ({ request }) => {
  const lista = await (await request.get('/api/tareas')).json();
  const valida = validarLista(lista);
  expect(valida, ajv.errorsText(validarLista.errors)).toBe(true);
});
