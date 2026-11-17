// Pruebas de la página de la cuenta (M02-06) — solución
import { test, expect } from '@playwright/test';

test('muestra el saldo', async ({ page }) => {
  await page.goto('/');
  // El usuario puede volver a pulsar si el servicio falla: se reintenta ESE bloque, no toda la prueba
  await expect(async () => {
    await page.getByRole('button', { name: 'Consultar saldo' }).click();
    await expect(page.getByRole('status')).toHaveText('Saldo: 120,00 €', { timeout: 1_000 });
  }).toPass({ timeout: 10_000 });
});

test('la API de saldo acaba respondiendo', async ({ request }) => {
  // Pregunta el estado HTTP hasta que vale 200 (o se agota el tiempo)
  await expect
    .poll(async () => (await request.get('/api/saldo')).status(), { timeout: 10_000 })
    .toBe(200);
});

test('lista los tres movimientos', async ({ page }) => {
  // Error real y conocido: se marca como fallo esperado en lugar de reintentarlo
  test.fail(true, 'Incidencia abierta: /api/movimientos devuelve 2 de 3');
  await page.goto('/');
  await expect(page.getByRole('listitem')).toHaveCount(3);
});
