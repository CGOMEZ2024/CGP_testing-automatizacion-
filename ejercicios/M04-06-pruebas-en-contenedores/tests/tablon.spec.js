import { test, expect } from '@playwright/test';

test('muestra el tablón con sus dos avisos', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Tablón de avisos' })).toBeVisible();
  await expect(page.getByRole('list', { name: 'Avisos' }).getByRole('listitem')).toHaveCount(2);
});

test('dice qué máquina lo sirve', async ({ page }) => {
  await page.goto('/');
  const pie = page.locator('footer');
  await expect(pie).toContainText('Servido por');
  console.log(`  → ${await pie.textContent()}`); // para ver en la salida qué máquina responde
});
