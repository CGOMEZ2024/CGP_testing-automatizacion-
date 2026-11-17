// Pruebas de acceso a la tienda (M02-08) — sin sesión guardada
import { test, expect } from '@playwright/test';

test.describe('Acceso', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login.html');
  });

  test('entra con usuario y contraseña correctos', { tag: '@smoke' }, async ({ page }) => {
    await page.getByLabel('Usuario').fill('ana');
    await page.getByLabel('Contraseña').fill('tienda123');
    await page.getByRole('button', { name: 'Entrar' }).click();
    await expect(page).toHaveURL(/catalogo/);
    await expect(page.getByText('Hola, ana')).toBeVisible();
  });

  test('rechaza una contraseña incorrecta', async ({ page }) => {
    await page.getByLabel('Usuario').fill('ana');
    await page.getByLabel('Contraseña').fill('otra');
    await page.getByRole('button', { name: 'Entrar' }).click();
    await expect(page.getByRole('alert')).toHaveText('Usuario o contraseña incorrectos');
  });

  test('sin sesión, el catálogo devuelve al login', async ({ page }) => {
    await page.goto('/catalogo.html');
    await expect(page).toHaveURL(/login/);
  });
});
