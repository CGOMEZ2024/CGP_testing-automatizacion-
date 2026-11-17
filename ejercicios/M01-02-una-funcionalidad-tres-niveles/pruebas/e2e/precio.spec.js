// Nivel end-to-end: un navegador real abre la página, escribe y pulsa, como un usuario.
import { test, expect } from '@playwright/test';

test('E2E: 9 entradas no tienen descuento', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel('Entradas').fill('9');
  await page.getByRole('button', { name: 'Calcular' }).click();
  await expect(page.getByRole('status', { name: 'Total' })).toHaveText('112.50 €');
});

test('E2E: 10 entradas tienen un 20 % de descuento', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel('Entradas').fill('10');
  await page.getByRole('button', { name: 'Calcular' }).click();
  await expect(page.getByRole('status', { name: 'Total' })).toHaveText('100.00 €');
});
