import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

test('la página muestra el conversor', async ({ page }) => {
  await expect(page).toHaveTitle('Conversor de temperaturas');
  await expect(page.getByRole('heading', { name: 'Conversor de temperaturas' })).toBeVisible();
});

test('convierte 100 °C en 212 °F', async ({ page }) => {
  await page.getByLabel('Grados Celsius').fill('100');
  await page.getByRole('button', { name: 'Convertir' }).click();
  await expect(page.getByRole('status')).toHaveText('100 °C = 212 °F');
});

test('convierte -40 °C en -40 °F', async ({ page }) => {
  await page.getByLabel('Grados Celsius').fill('-40');
  await page.getByRole('button', { name: 'Convertir' }).click();
  await expect(page.getByRole('status')).toHaveText('-40 °C = -40 °F');
});
