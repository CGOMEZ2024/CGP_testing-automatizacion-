// Pruebas de la API de tareas con el cliente «request» de Playwright.
import { test, expect } from '@playwright/test';

test('lista las tareas', async ({ request }) => {
  const respuesta = await request.get('/api/tareas');
  expect(respuesta.ok()).toBeTruthy();
});

test('lee la tarea 1', async ({ request }) => {
  const respuesta = await request.get('/api/tareas/1');
  expect(respuesta.ok()).toBeTruthy();
});

test('crea una tarea', async ({ request }) => {
  const respuesta = await request.post('/api/tareas', {
    data: { titulo: 'Escribir las pruebas' },
  });
  expect(respuesta.ok()).toBeTruthy();
});
