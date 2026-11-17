// Pruebas del formulario de alta (M02-04) — solución
import { test, expect } from '@playwright/test';

// Rellena el formulario con datos válidos; cada prueba cambia solo lo que quiere romper
async function rellenar(page, cambios = {}) {
  const datos = {
    nombre: 'Ana',
    correo: `ana.${Date.now()}.${Math.random().toString(36).slice(2, 6)}@example.com`,
    clave: 'secreta123',
    repite: 'secreta123',
    plan: 'Profesional',
    condiciones: true,
    ...cambios,
  };
  await page.goto('/');
  await page.getByLabel('Nombre').fill(datos.nombre);
  await page.getByLabel('Correo electrónico').fill(datos.correo);
  await page.getByLabel('Contraseña', { exact: true }).fill(datos.clave);
  await page.getByLabel('Repite la contraseña').fill(datos.repite);
  await page.getByLabel('Plan').selectOption({ label: datos.plan });
  await page.getByLabel('Acepto las condiciones').setChecked(datos.condiciones);
  return datos;
}

test('alta correcta', async ({ page }) => {
  const datos = await rellenar(page);
  await page.getByRole('button', { name: 'Crear cuenta' }).click();
  await expect(page.getByRole('status')).toHaveText(`Alta completada: ${datos.correo} (plan Profesional)`);
});

test('el nombre es obligatorio', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Crear cuenta' }).click();
  await expect(page.getByText('El nombre es obligatorio')).toBeVisible();
  await expect(page.getByLabel('Nombre')).toHaveAttribute('aria-invalid', 'true');
});

// Una prueba por regla de validación, generadas desde una tabla de casos
const casos = [
  { regla: 'correo sin dominio', cambios: { correo: 'ana@' }, mensaje: 'Escribe un correo válido' },
  { regla: 'contraseña corta', cambios: { clave: 'abc1', repite: 'abc1' }, mensaje: 'La contraseña necesita 8 caracteres y un número' },
  { regla: 'contraseña sin número', cambios: { clave: 'secretisima', repite: 'secretisima' }, mensaje: 'La contraseña necesita 8 caracteres y un número' },
  { regla: 'confirmación distinta', cambios: { repite: 'otra12345' }, mensaje: 'Las contraseñas no coinciden' },
  { regla: 'condiciones sin aceptar', cambios: { condiciones: false }, mensaje: 'Debes aceptar las condiciones' },
];

for (const { regla, cambios, mensaje } of casos) {
  test(`rechaza: ${regla}`, async ({ page }) => {
    await rellenar(page, cambios);
    await page.getByRole('button', { name: 'Crear cuenta' }).click();
    await expect(page.getByText(mensaje)).toBeVisible();
    await expect(page.getByRole('status')).toBeEmpty();     // no se ha enviado nada
  });
}

test('el servidor rechaza un correo repetido', async ({ page }) => {
  const { correo } = await rellenar(page);
  await page.getByRole('button', { name: 'Crear cuenta' }).click();
  await expect(page.getByRole('status')).toContainText('Alta completada');

  await rellenar(page, { correo });                          // mismo correo otra vez
  await page.getByRole('button', { name: 'Crear cuenta' }).click();
  await expect(page.getByRole('status')).toHaveText('Ese correo ya está registrado');
});
