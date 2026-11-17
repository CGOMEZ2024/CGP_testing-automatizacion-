import { test, expect } from '@playwright/test';

// Aquí el inicio de sesión ES lo que se prueba: se hace por la interfaz
test('con la clave correcta se entra a las notas', async ({ page }) => {
  await page.goto('/login.html');
  await page.getByLabel('Usuario').fill('ana');
  await page.getByLabel('Clave').fill('curso123');
  await page.getByRole('button', { name: 'Entrar' }).click();
  await expect(page.getByRole('heading', { name: 'Mis notas' })).toBeVisible();
});

test('con una clave incorrecta se muestra un error', async ({ page }) => {
  await page.goto('/login.html');
  await page.getByLabel('Usuario').fill('ana');
  await page.getByLabel('Clave').fill('otra');
  await page.getByRole('button', { name: 'Entrar' }).click();
  await expect(page.getByRole('alert')).toHaveText('Usuario o clave incorrectos');
});

test('sin sesión, la página de notas lleva al login', async ({ page }) => {
  await page.goto('/notas.html');
  await expect(page).toHaveURL(/login\.html/);
});
