// Pruebas de navegación del sitio de tres páginas (M02-01)
import { test, expect } from '@playwright/test';

test('la portada se carga', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle('Inicio · Sitio de prueba');
  await expect(page.getByRole('heading', { name: 'Bienvenida' })).toBeVisible();
});

test('el catálogo anuncia cuántos productos hay', async ({ page }) => {
  await page.goto('/catalogo.html');
  // Lee el título UNA vez y lo compara: si aún no ha cambiado, falla
  expect(await page.title()).toBe('Catálogo (3 productos)');
});

// Paso 4: escribe aquí la prueba «recorre las tres páginas»
