import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('http://localhost:3200/');
  await page.getByRole('textbox', { name: 'Producto' }).click();
  await page.getByRole('textbox', { name: 'Producto' }).fill('Leche');
  await page.getByRole('button', { name: 'Añadir' }).click();
  await expect(page.getByText('Leche')).toBeVisible();
  await expect(page.getByText('1 producto')).toBeVisible();
});