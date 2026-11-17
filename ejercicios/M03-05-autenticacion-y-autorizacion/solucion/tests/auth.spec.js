// Solución: la matriz rol × recurso, con un cliente por rol (fixtures de sesiones.js).
import { test, expect } from './sesiones.js';

test.describe('GET /api/informes (cualquier sesión)', () => {
  test('sin token: 401', async ({ sinSesion }) => {
    const respuesta = await sinSesion.get('/api/informes');
    expect(respuesta.status()).toBe(401);
    expect(respuesta.headers()['www-authenticate']).toBe('Bearer');
  });

  test('token inventado: 401', async ({ sinSesion }) => {
    const respuesta = await sinSesion.get('/api/informes', {
      headers: { Authorization: 'Bearer esto.no-es-un-token' },
    });
    expect(respuesta.status()).toBe(401);
    expect(await respuesta.json()).toEqual({ error: 'Token no válido' });
  });

  test('lector: 200', async ({ comoLector }) => {
    expect((await comoLector.get('/api/informes')).status()).toBe(200);
  });

  test('admin: 200', async ({ comoAdmin }) => {
    expect((await comoAdmin.get('/api/informes')).status()).toBe(200);
  });
});

test.describe('GET /api/admin/usuarios (solo admin)', () => {
  test('sin token: 401', async ({ sinSesion }) => {
    expect((await sinSesion.get('/api/admin/usuarios')).status()).toBe(401);
  });

  test('lector: 403', async ({ comoLector }) => {
    const respuesta = await comoLector.get('/api/admin/usuarios');
    expect(respuesta.status()).toBe(403);
    expect(await respuesta.json()).toEqual({ error: 'Necesitas el rol admin' });
  });

  test('admin: 200', async ({ comoAdmin }) => {
    const respuesta = await comoAdmin.get('/api/admin/usuarios');
    expect(respuesta.status()).toBe(200);
    expect(await respuesta.json()).toContainEqual({ nombre: 'luis', rol: 'lector' });
  });
});
