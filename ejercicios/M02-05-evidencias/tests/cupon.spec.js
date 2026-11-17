// Pruebas del carrito con cupón (M02-05)
import { test, expect } from '@playwright/test';

test('el cupón de verano descuenta un 10 %', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel('Cupón').fill('verano10');          // como lo escribiría un cliente
  await page.getByRole('button', { name: 'Aplicar' }).click();
  await expect(page.getByTestId('total')).toHaveText('90,00 €');
});
