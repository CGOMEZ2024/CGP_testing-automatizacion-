// La prueba de la lista de la compra, en Playwright
import { test, expect } from '@playwright/test';

test('añade un producto a la lista', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel('Producto').fill('Leche');
  await page.getByRole('button', { name: 'Añadir' }).click();
  await expect(page.getByRole('listitem')).toHaveText(['Leche']);
  await expect(page.getByText('1 producto', { exact: true })).toBeVisible();
});
