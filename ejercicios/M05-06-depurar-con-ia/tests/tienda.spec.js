import { test, expect } from '@playwright/test';

// Pruebas escritas para la versión 1 de la tienda. Desde la versión 2, fallan.

test('muestra el nombre y el precio del producto', async ({ page }) => {
  await page.goto('/producto.html');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Auriculares Pro');
  await expect(page.getByTestId('precio')).toHaveText('59,90 €');
});

test('añadir al carrito suma un artículo', async ({ page }) => {
  await page.goto('/producto.html');
  await page.getByRole('button', { name: 'Comprar' }).click();
  await expect(page.getByTestId('articulos')).toHaveText('1');
});

test('el total multiplica el precio por la cantidad', async ({ page }) => {
  await page.goto('/producto.html');
  await page.getByLabel('Cantidad').fill('2');
  await page.getByRole('button', { name: 'Comprar' }).click();
  await expect(page.getByTestId('total')).toHaveText('119,80 €');
});
