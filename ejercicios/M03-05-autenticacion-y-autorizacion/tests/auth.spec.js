// Pruebas de autenticación y autorización de la API de informes.
import { test, expect } from '@playwright/test';

// Inicia sesión y devuelve el token
async function login(request, usuario, clave) {
  const respuesta = await request.post('/api/login', { data: { usuario, clave } });
  expect(respuesta.status()).toBe(200);
  return (await respuesta.json()).token;
}

test('admin lee los informes', async ({ request }) => {
  const token = await login(request, 'ana', 'ana123');
  const respuesta = await request.get('/api/informes', {
    headers: { Authorization: `Bearer ${token}` },
  });
  expect(respuesta.status()).toBe(200);
});

test('admin lee los usuarios', async ({ request }) => {
  const token = await login(request, 'ana', 'ana123');
  const respuesta = await request.get('/api/admin/usuarios', {
    headers: { Authorization: `Bearer ${token}` },
  });
  expect(respuesta.status()).toBe(200);
});
