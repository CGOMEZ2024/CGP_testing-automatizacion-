import { test, expect } from '@playwright/test';

test('el total del pedido es 1234,50 €', async ({ page }) => {
  await page.goto('/resumen.html');
  await page.getByRole('button', { name: 'Calcular total' }).click();
  // Se comprueba el estado final, no un instante: toHaveText reintenta hasta que coincide
  await expect(page.getByTestId('total')).toHaveText('1234,50 €');
});
