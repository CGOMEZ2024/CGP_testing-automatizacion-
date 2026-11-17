// Pruebas de la página de pedidos: la API real y, con page.route, la API simulada.
import { test, expect } from '@playwright/test';

test('muestra los pedidos de la API', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('listitem')).toHaveCount(2);
  await expect(page.getByRole('listitem').first()).toHaveText('Pedido 1042 · Ana · 59.90 €');
  await expect(page.getByRole('alert')).toBeHidden();
});

test('muestra un error si la API responde 500', async ({ page }) => {
  // Antes de abrir la página: toda petición a /api/pedidos recibe un 500 inventado
  await page.route('**/api/pedidos', (route) =>
    route.fulfill({ status: 500, contentType: 'application/json', body: '{"error":"Error interno"}' }),
  );
  await page.goto('/');
  await expect(page.getByRole('alert')).toHaveText('No se han podido cargar los pedidos (error 500)');
  await expect(page.getByRole('listitem')).toHaveCount(0);
});

test('muestra «Cargando» mientras la API tarda', async ({ page }) => {
  // La respuesta queda retenida hasta que la prueba llame a liberar()
  let liberar;
  const retenida = new Promise((resolver) => (liberar = resolver));
  await page.route('**/api/pedidos', async (route) => {
    await retenida;
    await route.continue();
  });
  await page.goto('/');
  await expect(page.getByRole('status')).toHaveText('Cargando pedidos…');
  liberar(); // ahora sí: la API responde
  await expect(page.getByRole('listitem')).toHaveCount(2);
  await expect(page.getByRole('status')).toBeEmpty();
});

test('avisa si no hay conexión', async ({ page }) => {
  // La petición no llega a ningún servidor: el navegador recibe un error de red
  await page.route('**/api/pedidos', (route) => route.abort('connectionrefused'));
  await page.goto('/');
  await expect(page.getByRole('alert')).toHaveText('Sin conexión con el servidor');
});

test('dice que no hay pedidos si la lista llega vacía', async ({ page }) => {
  await page.route('**/api/pedidos', (route) => route.fulfill({ json: [] }));
  await page.goto('/');
  await expect(page.getByRole('status')).toHaveText('No hay pedidos');
});
