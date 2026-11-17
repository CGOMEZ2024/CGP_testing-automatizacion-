// Pruebas de la página de entregas (M02-03) — solución sin esperas fijas
import { test, expect } from '@playwright/test';

test('la lista muestra las tres entregas', async ({ page }) => {
  await page.goto('/');
  const entregas = page.getByRole('listitem');
  // Aserciones web-first: reintentan hasta que se cumplen (5 s como máximo)
  await expect(entregas).toHaveCount(3);
  await expect(entregas.first()).toContainText('E-101');
});

test('la lista coincide con lo que devuelve la API', async ({ page }) => {
  // Se prepara la espera ANTES de la acción que provoca la petición
  const respuesta = page.waitForResponse('**/api/entregas');
  await page.goto('/');
  const datos = await (await respuesta).json();
  await expect(page.getByRole('listitem')).toHaveCount(datos.length);
});

test('actualizar vuelve a cargar la lista', async ({ page }) => {
  await page.goto('/');
  // click espera solo a que el botón esté habilitado (lo está cuando termina la primera carga)
  await page.getByRole('button', { name: 'Actualizar' }).click();
  await expect(page.getByText('Cargando entregas…')).toBeVisible();
  await expect(page.getByText('3 entregas')).toBeVisible();
});
