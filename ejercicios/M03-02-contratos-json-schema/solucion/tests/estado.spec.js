// Pruebas de estado y cabeceras: lo que suele comprobarse primero.
import { test, expect } from '@playwright/test';

test('la lista responde 200 con JSON', async ({ request }) => {
  const respuesta = await request.get('/api/tareas');
  expect(respuesta.status()).toBe(200);
  expect(respuesta.headers()['content-type']).toContain('application/json');
});

test('la tarea 1 responde 200 con JSON', async ({ request }) => {
  const respuesta = await request.get('/api/tareas/1');
  expect(respuesta.status()).toBe(200);
  expect(respuesta.headers()['content-type']).toContain('application/json');
});
