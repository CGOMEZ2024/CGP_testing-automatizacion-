// Pruebas de la lista de tareas (M02-07): funcionan, pero repiten selectores en cada prueba
import { test, expect } from '@playwright/test';

test('añade una tarea', async ({ page }) => {
  await page.goto('/');
  await page.getByPlaceholder('Nueva tarea').fill('Comprar pan');
  await page.getByRole('button', { name: 'Añadir' }).click();
  await expect(page.getByRole('listitem')).toContainText(['Comprar pan']);
  await expect(page.getByText('1 pendiente')).toBeVisible();
});

test('completa una tarea', async ({ page }) => {
  await page.goto('/');
  await page.getByPlaceholder('Nueva tarea').fill('Comprar pan');
  await page.getByRole('button', { name: 'Añadir' }).click();
  await page.getByPlaceholder('Nueva tarea').fill('Llamar al banco');
  await page.getByRole('button', { name: 'Añadir' }).click();
  await page.getByRole('checkbox', { name: 'Completar Comprar pan' }).check();
  await expect(page.getByText('1 pendiente')).toBeVisible();
});

test('borra una tarea', async ({ page }) => {
  await page.goto('/');
  await page.getByPlaceholder('Nueva tarea').fill('Comprar pan');
  await page.getByRole('button', { name: 'Añadir' }).click();
  await page.getByRole('listitem').filter({ hasText: 'Comprar pan' }).getByRole('button', { name: 'Borrar' }).click();
  await expect(page.getByRole('listitem')).toHaveCount(0);
  await expect(page.getByText('0 pendientes')).toBeVisible();
});

test('no añade tareas vacías', async ({ page }) => {
  await page.goto('/');
  await page.getByPlaceholder('Nueva tarea').fill('   ');
  await page.getByRole('button', { name: 'Añadir' }).click();
  await expect(page.getByRole('listitem')).toHaveCount(0);
});
