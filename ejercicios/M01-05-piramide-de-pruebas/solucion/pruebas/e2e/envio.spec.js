// Suite E2E de la calculadora de envío: solo lo que hace la página (formulario y forma de mostrar).
import { test, expect } from '@playwright/test';

// Abre la página, escribe el importe, elige la zona y pulsa el botón
async function calcular(page, importe, zona) {
  await page.goto('/');
  await page.getByLabel('Importe del pedido').fill(importe);
  await page.getByLabel('Zona').selectOption(zona);
  await page.getByRole('button', { name: 'Calcular envío' }).click();
}

test('muestra el coste con dos decimales y el símbolo del euro', async ({ page }) => {
  await calcular(page, '30', 'Península');
  await expect(page.getByRole('status', { name: 'Envío' })).toHaveText('4.95 €');
});

test('muestra «Gratis» cuando el envío no cuesta nada', async ({ page }) => {
  await calcular(page, '60', 'Península');
  await expect(page.getByRole('status', { name: 'Envío' })).toHaveText('Gratis');
});

test('muestra el mensaje de error de la API', async ({ page }) => {
  await calcular(page, '-5', 'Península');
  await expect(page.getByRole('status', { name: 'Envío' })).toHaveText('El importe no puede ser negativo');
});
