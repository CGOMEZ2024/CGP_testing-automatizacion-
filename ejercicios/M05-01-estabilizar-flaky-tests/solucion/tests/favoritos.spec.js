import { test, expect } from '@playwright/test';
import { randomUUID } from 'node:crypto';

// Cada prueba trabaja en su propia lista: nadie más la lee ni la vacía
test.beforeEach(async ({ page }) => {
  await page.goto(`/favoritos.html?lista=${randomUUID()}`);
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
