// Prueba de la tienda (M02-08): todo el flujo en una sola prueba larga
import { test, expect } from '@playwright/test';

test('compra completa', async ({ page }) => {
  // Login
  await page.goto('/login.html');
  await page.getByLabel('Usuario').fill('ana');
  await page.getByLabel('Contraseña').fill('tienda123');
  await page.getByRole('button', { name: 'Entrar' }).click();
  await expect(page.getByText('Hola, ana')).toBeVisible();

  // Catálogo: tres productos; se añaden una taza y una gorra
  await expect(page.getByRole('article')).toHaveCount(3);
  await page.getByRole('article', { name: 'Taza' }).getByRole('button', { name: 'Añadir al carrito' }).click();
  await page.getByRole('article', { name: 'Gorra' }).getByRole('button', { name: 'Añadir al carrito' }).click();
  await expect(page.getByRole('link', { name: 'Carrito (2)' })).toBeVisible();

  // Carrito: total 8 + 12
  await page.getByRole('link', { name: 'Carrito (2)' }).click();
  await expect(page.getByTestId('total')).toHaveText('20,00 €');

  // Pedido
  await page.getByRole('button', { name: 'Confirmar pedido' }).click();
  await expect(page.getByRole('status')).toHaveText(/Pedido P-\d{4} confirmado/);
  await expect(page.getByRole('link', { name: 'Carrito (0)' })).toBeVisible();
});
