// Reto: los errores también forman parte del contrato.
import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import Ajv from 'ajv';

const esquemaError = JSON.parse(readFileSync(new URL('../contrato/error.schema.json', import.meta.url)));
const ajv = new Ajv({ allErrors: true });
const validarError = ajv.compile(esquemaError);

test('el 404 cumple el contrato de error', async ({ request }) => {
  const respuesta = await request.get('/api/tareas/999');
  expect(respuesta.status()).toBe(404);
  const cuerpo = await respuesta.json();
  expect(validarError(cuerpo), ajv.errorsText(validarError.errors)).toBe(true);
});
