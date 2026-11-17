import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

test('muestra la calculadora', async ({ page }) => {
  await expect(page.getByRole('heading', { name: 'Calculadora de propinas' })).toBeVisible();
});

test('calcula una propina del 10 %', async ({ page }) => {
  await test.step('rellenar la cuenta: 50 €', async () => {
    await page.getByLabel('Importe de la cuenta (€)').fill('50');
  });
  await test.step('elegir el 10 % y calcular', async () => {
    await page.getByLabel('Propina').selectOption('10');
    await page.getByRole('button', { name: 'Calcular' }).click();
  });
  await test.step('comprobar propina y total', async () => {
    await expect(page.locator('#propina')).toHaveText('5.00');
    await expect(page.locator('#total')).toHaveText('55.00');
  });
});

// Falla por un error de la aplicación: el total se trunca en lugar de redondearse
test('redondea el total a céntimos', async ({ page }) => {
  await test.step('rellenar la cuenta: 33,33 €', async () => {
    await page.getByLabel('Importe de la cuenta (€)').fill('33.33');
  });
  await test.step('elegir el 15 % y calcular', async () => {
    await page.getByLabel('Propina').selectOption('15');
    await page.getByRole('button', { name: 'Calcular' }).click();
  });
  await test.step('comprobar el total', async () => {
    // 33,33 + 15 % = 38,3295 → 38,33
    await expect(page.locator('#total')).toHaveText('38.33');
  });
});

// Falla por un error de la prueba: el botón se llama «Calcular», no «Calcular propina»
test('calcula una propina del 20 %', async ({ page }) => {
  await page.getByLabel('Importe de la cuenta (€)').fill('20');
  await page.getByLabel('Propina').selectOption('20');
  await page.getByRole('button', { name: 'Calcular propina' }).click();
  await expect(page.locator('#total')).toHaveText('24.00');
});

test.skip('divide el total entre comensales', async () => {
  // Pendiente: la aplicación todavía no tiene esta función
});
