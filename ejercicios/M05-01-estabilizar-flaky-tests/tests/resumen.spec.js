import { test, expect } from '@playwright/test';

test('el total del pedido es 1234,50 €', async ({ page }) => {
  await page.goto('/resumen.html');
  await page.getByRole('button', { name: 'Calcular total' }).click();
  // «La animación dura 400 ms»: se espera lo mismo y se lee el texto una sola vez
  await page.waitForTimeout(400);
  expect(await page.getByTestId('total').textContent()).toBe('1234,50 €');
});
