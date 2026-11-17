// Solución: cada prueba comprueba estado, cabecera y cuerpo, y hay casos negativos.
import { test, expect } from '@playwright/test';

test('lista las tareas', async ({ request }) => {
  const respuesta = await request.get('/api/tareas');
  expect(respuesta.status()).toBe(200);
  expect(respuesta.headers()['content-type']).toContain('application/json');
  const tareas = await respuesta.json();
  expect(Array.isArray(tareas)).toBe(true);
  expect(tareas.length).toBeGreaterThan(0);
});

test('lee la tarea 1', async ({ request }) => {
  const respuesta = await request.get('/api/tareas/1');
  expect(respuesta.status()).toBe(200);
  expect(respuesta.headers()['content-type']).toContain('application/json');
  expect(await respuesta.json()).toEqual({ id: 1, titulo: 'Preparar la demo', hecha: false });
});

test('crea una tarea', async ({ request }) => {
  const respuesta = await request.post('/api/tareas', {
    data: { titulo: 'Escribir las pruebas' },
  });
  expect(respuesta.status()).toBe(201);
  const creada = await respuesta.json();
  expect(creada).toMatchObject({ titulo: 'Escribir las pruebas', hecha: false });
  expect(creada.id).toEqual(expect.any(Number));
  expect(respuesta.headers()['location']).toBe(`/api/tareas/${creada.id}`);
});

test('rechaza una tarea sin título', async ({ request }) => {
  const respuesta = await request.post('/api/tareas', { data: { hecha: true } });
  expect(respuesta.status()).toBe(400);
  expect(await respuesta.json()).toEqual({ error: 'El campo titulo es obligatorio' });
});

test('una tarea que no existe da 404', async ({ request }) => {
  const respuesta = await request.get('/api/tareas/999');
  expect(respuesta.status()).toBe(404);
  expect(await respuesta.json()).toEqual({ error: 'Tarea no encontrada' });
});
