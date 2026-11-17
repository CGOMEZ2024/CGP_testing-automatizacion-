// Pruebas de la página de acceso (M02-02) — solución con localizadores por rol, etiqueta y test id
import { test, expect } from '@playwright/test';

test('entra con correo y contraseña', async ({ page }) => {
  await page.goto('index.html');
  await page.getByLabel('Correo electrónico').fill('ana@example.com');
  await page.getByLabel('Contraseña').fill('secreta');
  await page.getByRole('button', { name: 'Entrar' }).click();
  await expect(page.getByTestId('saludo')).toHaveText('Hola, ana@example.com');
});

test('marca «Recordarme»', async ({ page }) => {
  await page.goto('index.html');
  await page.getByRole('checkbox', { name: 'Recordarme' }).check();
  await expect(page.getByRole('checkbox', { name: 'Recordarme' })).toBeChecked();
});
