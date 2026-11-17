// Pruebas del carrito con cupón (M02-05) — solución con una captura adjunta al reporte
import { test, expect } from '@playwright/test';

test('el cupón de verano descuenta un 10 %', async ({ page }, testInfo) => {
  await page.goto('/');
  await page.getByLabel('Cupón').fill('verano10');          // como lo escribiría un cliente
  await page.getByRole('button', { name: 'Aplicar' }).click();
  await expect(page.getByTestId('total')).toHaveText('90,00 €');

  // Evidencia explícita: la pantalla tras aplicar el cupón, adjunta al reporte
  await testInfo.attach('carrito con cupón', {
    body: await page.screenshot({ fullPage: true }),
    contentType: 'image/png',
  });
});
