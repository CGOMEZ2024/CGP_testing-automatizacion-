// Fixtures por rol: cada prueba pide «comoAdmin», «comoLector» o «sinSesion» y recibe
// un cliente HTTP que ya lleva (o no) la cabecera Authorization.
import { test as base, expect } from '@playwright/test';

const credenciales = { admin: ['ana', 'ana123'], lector: ['luis', 'luis123'] };

async function clienteConSesion(playwright, baseURL, rol) {
  const anonimo = await playwright.request.newContext({ baseURL });
  const [usuario, clave] = credenciales[rol];
  const respuesta = await anonimo.post('/api/login', { data: { usuario, clave } });
  expect(respuesta.status()).toBe(200);
  const { token } = await respuesta.json();
  await anonimo.dispose();
  return playwright.request.newContext({
    baseURL,
    extraHTTPHeaders: { Authorization: `Bearer ${token}` },
  });
}

export const test = base.extend({
  comoAdmin: async ({ playwright, baseURL }, use) => {
    const cliente = await clienteConSesion(playwright, baseURL, 'admin');
    await use(cliente);
    await cliente.dispose();
  },
  comoLector: async ({ playwright, baseURL }, use) => {
    const cliente = await clienteConSesion(playwright, baseURL, 'lector');
    await use(cliente);
    await cliente.dispose();
  },
  sinSesion: async ({ request }, use) => {
    await use(request); // el cliente por defecto no lleva token
  },
});
export { expect };
