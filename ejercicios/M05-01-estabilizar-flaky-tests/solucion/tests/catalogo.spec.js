import { test, expect } from '@playwright/test';

test('el catálogo muestra los cuatro productos', async ({ page }) => {
  await page.goto('/catalogo.html');
  // Aserción web-first: reintenta hasta que haya 4 elementos (o hasta 5 s)
  await expect(page.getByRole('listitem')).toHaveCount(4);
});
