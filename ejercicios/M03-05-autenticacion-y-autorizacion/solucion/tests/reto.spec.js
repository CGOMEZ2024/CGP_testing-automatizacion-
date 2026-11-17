// Reto: un lector se fabrica un token de admin cambiando los datos y reutilizando su firma.
import { test, expect } from '@playwright/test';

test('un token manipulado no da acceso de admin', async ({ request }) => {
  const login = await request.post('/api/login', { data: { usuario: 'luis', clave: 'luis123' } });
  const { token } = await login.json();
  const [datos, firma] = token.split('.');

  // Cambia el rol en los datos y vuelve a codificarlos; la firma es la del token original
  const sesion = JSON.parse(Buffer.from(datos, 'base64url').toString());
  const falsos = Buffer.from(JSON.stringify({ ...sesion, rol: 'admin' })).toString('base64url');

  const respuesta = await request.get('/api/admin/usuarios', {
    headers: { Authorization: `Bearer ${falsos}.${firma}` },
  });
  expect(respuesta.status()).toBe(401);
  expect(await respuesta.json()).toEqual({ error: 'Token no válido' });
});
