// Pruebas del formulario de alta (M02-04)
import { test, expect } from '@playwright/test';

test('alta correcta', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel('Nombre').fill('Ana');
  await page.getByLabel('Correo electrónico').fill(`ana.${Date.now()}@example.com`);
  await page.getByLabel('Contraseña', { exact: true }).fill('secreta123');
  await page.getByLabel('Repite la contraseña').fill('secreta123');
  // Paso 3: elige el plan «Profesional» y acepta las condiciones
  await page.getByRole('button', { name: 'Crear cuenta' }).click();
  await expect(page.getByRole('status')).toContainText('Alta completada');
});

test('el nombre es obligatorio', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Crear cuenta' }).click();
  await expect(page.getByText('El nombre es obligatorio')).toBeVisible();
  await expect(page.getByLabel('Nombre')).toHaveAttribute('aria-invalid', 'true');
});

// Paso 5: escribe aquí las pruebas de los demás mensajes de validación
