// Nivel API: petición HTTP a /api/precio con el cliente request de Playwright, sin navegador.
import { test, expect } from '@playwright/test';

test('API: 9 entradas no tienen descuento', async ({ request }) => {
  const respuesta = await request.get('/api/precio?unidades=9');
  expect(respuesta.status()).toBe(200);
  expect(await respuesta.json()).toEqual({ unidades: 9, total: 112.5 });
});

test('API: 10 entradas tienen un 20 % de descuento', async ({ request }) => {
  const respuesta = await request.get('/api/precio?unidades=10');
  expect(respuesta.status()).toBe(200);
  expect(await respuesta.json()).toEqual({ unidades: 10, total: 100 });
});
