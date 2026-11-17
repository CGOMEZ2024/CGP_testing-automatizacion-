import { test, expect } from '@playwright/test';

// Todas las pruebas usan la misma lista del servidor: la «general»
test.beforeEach(async ({ page }) => {
  await page.goto('/favoritos.html');
  // Se vacía la lista para empezar de cero
  await page.getByRole('button', { name: 'Vaciar lista' }).click();
  await expect(page.getByRole('listitem')).toHaveCount(0);
});

test('añadir un destino lo muestra en la lista', async ({ page }) => {
  await page.getByLabel('Destino').fill('Tokio');
  await page.getByRole('button', { name: 'Añadir' }).click();
  await expect(page.getByRole('listitem')).toHaveText(['Tokio']);
});

test('añadir dos destinos muestra los dos', async ({ page }) => {
  await page.getByLabel('Destino').fill('Roma');
  await page.getByRole('button', { name: 'Añadir' }).click();
  await page.getByLabel('Destino').fill('Lima');
  await page.getByRole('button', { name: 'Añadir' }).click();
  await expect(page.getByRole('listitem')).toHaveText(['Roma', 'Lima']);
});

test('vaciar deja la lista sin destinos', async ({ page }) => {
  await page.getByLabel('Destino').fill('París');
  await page.getByRole('button', { name: 'Añadir' }).click();
  await page.getByRole('button', { name: 'Vaciar lista' }).click();
  await expect(page.getByRole('listitem')).toHaveCount(0);
});
