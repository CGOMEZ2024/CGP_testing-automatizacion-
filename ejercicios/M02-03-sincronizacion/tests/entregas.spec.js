// Pruebas de la página de entregas (M02-03)
import { test, expect } from '@playwright/test';

test('la lista muestra las tres entregas', async ({ page }) => {
  await page.goto('/');
  await page.waitForTimeout(500);                    // «medio segundo debería bastar»
  const entregas = page.locator('#entregas li');
  expect(await entregas.count()).toBe(3);
  expect(await entregas.first().textContent()).toContain('E-101');
});
