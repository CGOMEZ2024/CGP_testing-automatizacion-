// Setup de M02-08: inicia sesión UNA vez y guarda cookies y localStorage para el resto de pruebas
import { test as setup, expect } from '@playwright/test';

const SESION = `${import.meta.dirname}/../.auth/ana.json`;

setup('inicia sesión como ana', async ({ page }) => {
  await page.goto('/login.html');
  await page.getByLabel('Usuario').fill('ana');
  await page.getByLabel('Contraseña').fill('tienda123');
  await page.getByRole('button', { name: 'Entrar' }).click();
  await expect(page.getByText('Hola, ana')).toBeVisible();
  await page.context().storageState({ path: SESION });
});
