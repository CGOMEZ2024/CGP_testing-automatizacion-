// Pruebas de la página de la cuenta (M02-06)
import { test, expect } from '@playwright/test';

test('muestra el saldo', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Consultar saldo' }).click();
  await expect(page.getByRole('status')).toHaveText('Saldo: 120,00 €');
});

test('lista los tres movimientos', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('listitem')).toHaveCount(3);
});
