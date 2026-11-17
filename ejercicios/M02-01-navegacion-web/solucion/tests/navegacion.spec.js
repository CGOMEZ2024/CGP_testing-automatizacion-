// Pruebas de navegación del sitio de tres páginas (M02-01) — solución
import { test, expect } from '@playwright/test';

test('la portada se carga', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle('Inicio · Sitio de prueba');
  await expect(page.getByRole('heading', { name: 'Bienvenida' })).toBeVisible();
});

test('el catálogo anuncia cuántos productos hay', async ({ page }) => {
  await page.goto('/catalogo.html');
  // Aserción web-first: reintenta hasta que el título coincide (o se agota el tiempo)
  await expect(page).toHaveTitle('Catálogo (3 productos)');
});

test('recorre las tres páginas', async ({ page }) => {
  await page.goto('/');

  // Inicio → Catálogo por el menú
  const menu = page.getByRole('navigation', { name: 'Principal' });
  await menu.getByRole('link', { name: 'Catálogo' }).click();
  await expect(page).toHaveURL(/\/catalogo\.html$/);
  await expect(page.getByRole('listitem')).toHaveCount(3);

  // Catálogo → Contacto
  await menu.getByRole('link', { name: 'Contacto' }).click();
  await expect(page).toHaveURL('/contacto.html');
  await expect(page).toHaveTitle('Contacto · Sitio de prueba');
  await expect(page.getByRole('link', { name: 'hola@example.com' })).toBeVisible();

  // Botón «atrás» del navegador: vuelve al catálogo
  await page.goBack();
  await expect(page).toHaveURL(/catalogo/);
});
