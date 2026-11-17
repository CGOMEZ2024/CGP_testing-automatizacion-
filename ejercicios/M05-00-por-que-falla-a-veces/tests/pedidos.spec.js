import { test, expect } from '@playwright/test';

test('la lista muestra los tres pedidos', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Cargar pedidos' }).click();

  // «Medio segundo debería bastar»: una espera fija ante una respuesta que tarda 100–900 ms
  await page.waitForTimeout(500);

  // count() no reintenta: cuenta lo que haya en este instante
  expect(await page.getByRole('listitem').count()).toBe(3);
});
