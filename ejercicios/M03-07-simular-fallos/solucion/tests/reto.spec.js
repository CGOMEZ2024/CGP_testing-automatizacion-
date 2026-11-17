// Reto: la API responde 200 pero sin cuerpo (p. ej. un proxy que corta la respuesta).
import { test, expect } from '@playwright/test';

test('avisa si la API responde 200 sin cuerpo', async ({ page }) => {
  await page.route('**/api/pedidos', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: '' }),
  );
  await page.goto('/');
  await expect(page.getByRole('alert')).toHaveText('Respuesta no válida del servidor');
});
