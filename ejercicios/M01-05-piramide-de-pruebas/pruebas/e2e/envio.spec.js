// Suite E2E de la calculadora de envío: cada regla de cálculo se comprueba en el navegador.
import { test, expect } from '@playwright/test';

// Abre la página, escribe el importe, elige la zona y pulsa el botón
async function calcular(page, importe, zona) {
  await page.goto('/');
  await page.getByLabel('Importe del pedido').fill(importe);
  await page.getByLabel('Zona').selectOption(zona);
  await page.getByRole('button', { name: 'Calcular envío' }).click();
}

test('península, 30 €: envío 4,95 €', async ({ page }) => {
  await calcular(page, '30', 'Península');
  await expect(page.getByRole('status', { name: 'Envío' })).toHaveText('4.95 €');
});

test('península, 59,99 €: envío 4,95 €', async ({ page }) => {
  await calcular(page, '59.99', 'Península');
  await expect(page.getByRole('status', { name: 'Envío' })).toHaveText('4.95 €');
});

test('península, 60 €: envío gratis', async ({ page }) => {
  await calcular(page, '60', 'Península');
  await expect(page.getByRole('status', { name: 'Envío' })).toHaveText('Gratis');
});

test('baleares, 100 €: envío 9,95 €', async ({ page }) => {
  await calcular(page, '100', 'Baleares');
  await expect(page.getByRole('status', { name: 'Envío' })).toHaveText('9.95 €');
});

test('baleares, 120 €: envío gratis', async ({ page }) => {
  await calcular(page, '120', 'Baleares');
  await expect(page.getByRole('status', { name: 'Envío' })).toHaveText('Gratis');
});

test('canarias, 30 €: envío 14,95 €', async ({ page }) => {
  await calcular(page, '30', 'Canarias');
  await expect(page.getByRole('status', { name: 'Envío' })).toHaveText('14.95 €');
});

test('canarias, 500 €: envío 14,95 € (nunca gratis)', async ({ page }) => {
  await calcular(page, '500', 'Canarias');
  await expect(page.getByRole('status', { name: 'Envío' })).toHaveText('14.95 €');
});

test('importe negativo: mensaje de error', async ({ page }) => {
  await calcular(page, '-5', 'Península');
  await expect(page.getByRole('status', { name: 'Envío' })).toHaveText('El importe no puede ser negativo');
});
