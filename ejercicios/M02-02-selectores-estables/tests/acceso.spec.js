// Pruebas de la página de acceso (M02-02), escritas con selectores CSS y XPath
import { test, expect } from '@playwright/test';

test('entra con correo y contraseña', async ({ page }) => {
  await page.goto('index.html');
  await page.locator('#email').fill('ana@example.com');
  await page.locator('//div[@class="form-row"][2]/input').fill('secreta');
  await page.locator('.btn.btn-primary').click();
  await expect(page.locator('div.panel > p.msg')).toHaveText('Hola, ana@example.com');
});

test('marca «Recordarme»', async ({ page }) => {
  await page.goto('index.html');
  await page.locator('form > div:nth-child(3) > input').check();
  await expect(page.locator('#recordar')).toBeChecked();
});
