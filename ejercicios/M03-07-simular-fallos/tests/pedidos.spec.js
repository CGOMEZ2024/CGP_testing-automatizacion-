// Pruebas de la página de pedidos: la API real y, con page.route, la API simulada.
import { test, expect } from '@playwright/test';

test('muestra los pedidos de la API', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('listitem')).toHaveCount(2);
  await expect(page.getByRole('listitem').first()).toHaveText('Pedido 1042 · Ana · 59.90 €');
  await expect(page.getByRole('alert')).toBeHidden();
});
