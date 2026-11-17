// Prueba de humo en navegador (Playwright): si pasa, Chromium y el servidor funcionan.
import { test, expect } from '@playwright/test';

test('la página de humo muestra su encabezado', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Entorno de pruebas listo' })).toBeVisible();
});

// Reto: la suite de humo también falla si la página pierde su título.
test('la página de humo tiene título', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle('Entorno de pruebas');
});
