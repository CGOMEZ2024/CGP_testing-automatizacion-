// EJEMPLO de lo que graba «npx playwright codegen» al crear una cuenta en la página de registro.
// Tu grabación será parecida, pero no idéntica: depende de dónde hagas clic y de lo que escribas.
import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('http://localhost:3505/registro.html');
  await page.getByRole('textbox', { name: 'Usuario' }).click();
  await page.getByRole('textbox', { name: 'Usuario' }).fill('ana');
  await page.getByRole('textbox', { name: 'Contraseña' }).click();
  await page.getByRole('textbox', { name: 'Contraseña' }).fill('Segura#2024abc');
  await page.getByRole('button', { name: 'Crear cuenta' }).click();
  await expect(page.getByRole('status')).toContainText('Cuenta creada para ana');
});
