// Pruebas de la tienda (M02-08) — solución: suite que parte de la sesión guardada por el setup
import { test, expect } from '@playwright/test';

// Añade productos desde el catálogo (la página ya está en el catálogo)
async function anadir(page, ...nombres) {
  for (const nombre of nombres) {
    await page.getByRole('article', { name: nombre }).getByRole('button', { name: 'Añadir al carrito' }).click();
  }
}

test.describe('Tienda', () => {
  // La sesión ya viene en el storageState del proyecto: se empieza en el catálogo
  test.beforeEach(async ({ page }) => {
    await page.goto('/catalogo.html');
    await expect(page.getByText('Hola, ana')).toBeVisible();
  });

  test('el catálogo muestra los tres productos', { tag: '@smoke' }, async ({ page }) => {
    await expect(page.getByRole('article')).toHaveCount(3);
  });

  test('añadir actualiza el contador del carrito', async ({ page }) => {
    await anadir(page, 'Taza', 'Taza', 'Gorra');
    await expect(page.getByRole('link', { name: 'Carrito (3)' })).toBeVisible();
  });

  test('el carrito suma el total', async ({ page }) => {
    await anadir(page, 'Taza', 'Gorra');
    await page.getByRole('link', { name: /Carrito/ }).click();
    await expect(page.getByTestId('total')).toHaveText('20,00 €');
  });

  test('confirmar el pedido vacía el carrito', { tag: '@smoke' }, async ({ page }) => {
    await anadir(page, 'Camiseta');
    await page.getByRole('link', { name: /Carrito/ }).click();
    await page.getByRole('button', { name: 'Confirmar pedido' }).click();
    await expect(page.getByRole('status')).toHaveText(/Pedido P-\d{4} confirmado/);
    await expect(page.getByRole('link', { name: 'Carrito (0)' })).toBeVisible();
  });
});
