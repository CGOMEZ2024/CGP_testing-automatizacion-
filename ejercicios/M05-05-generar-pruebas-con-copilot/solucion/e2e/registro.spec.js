// La grabación de codegen, revisada: nombre que dice qué se prueba, sin clics de más,
// URL relativa (baseURL) y un segundo caso que la grabación no tenía (el error)
import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/registro.html');
});

test('con una contraseña válida se crea la cuenta', async ({ page }) => {
  await page.getByRole('textbox', { name: 'Usuario' }).fill('ana');
  await page.getByRole('textbox', { name: 'Contraseña' }).fill('Segura#2024abc');
  await page.getByRole('button', { name: 'Crear cuenta' }).click();
  await expect(page.getByRole('status')).toHaveText('Cuenta creada para ana');
  await expect(page.getByRole('list', { name: 'Errores' }).getByRole('listitem')).toHaveCount(0);
});

test('si la contraseña contiene el usuario, se muestra ese error', async ({ page }) => {
  await page.getByRole('textbox', { name: 'Usuario' }).fill('ana');
  await page.getByRole('textbox', { name: 'Contraseña' }).fill('Ana#2024segura');
  await page.getByRole('button', { name: 'Crear cuenta' }).click();
  await expect(page.getByRole('status')).toHaveText('Revisa la contraseña');
  await expect(page.getByRole('list', { name: 'Errores' }).getByRole('listitem'))
    .toHaveText(['No puede contener tu usuario']);
});
