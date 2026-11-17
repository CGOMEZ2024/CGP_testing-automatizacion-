import { test, expect } from '@playwright/test';

test('el catálogo muestra los cuatro productos', async ({ page }) => {
  await page.goto('/catalogo.html');
  // Espera fija: «la API suele tardar menos de medio segundo»
  await page.waitForTimeout(500);
  expect(await page.getByRole('listitem').count()).toBe(4);
});
