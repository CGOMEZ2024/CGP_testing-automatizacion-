import { test as setup, expect } from '@playwright/test';

// Se ejecuta una sola vez, antes que las pruebas del proyecto «chromium»
setup('iniciar sesión como ana', async ({ page }) => {
  await page.goto('/login.html');
  await page.getByLabel('Usuario').fill('ana');
  await page.getByLabel('Clave').fill('curso123');
  await page.getByRole('button', { name: 'Entrar' }).click();
  await expect(page.getByRole('heading', { name: 'Mis notas' })).toBeVisible();
  // Guarda cookies y localStorage del navegador en un fichero
  await page.context().storageState({ path: '.auth/ana.json' });
});
