import { test, expect } from '@playwright/test';

// Cada prueba usa títulos propios (con una etiqueta aleatoria) para no depender de las demás
const etiqueta = () => Math.random().toString(36).slice(2, 7);

// Antes de CADA prueba: inicio de sesión por la interfaz
test.beforeEach(async ({ page }) => {
  await test.step('iniciar sesión por la interfaz', async () => {
    await page.goto('/login.html');
    await page.getByLabel('Usuario').fill('ana');
    await page.getByLabel('Clave').fill('curso123');
    await page.getByRole('button', { name: 'Entrar' }).click();
    await expect(page.getByRole('heading', { name: 'Mis notas' })).toBeVisible();
  });
});

// Crear una nota rellenando el formulario, como haría una persona
async function crearNotaPorUI(page, titulo) {
  await page.getByLabel('Nueva nota').fill(titulo);
  await page.getByRole('button', { name: 'Añadir' }).click();
  await expect(page.getByRole('listitem').filter({ hasText: titulo })).toBeVisible();
}

test('una nota nueva aparece como pendiente', async ({ page }) => {
  const titulo = `Comprar pan ${etiqueta()}`;
  await crearNotaPorUI(page, titulo);
  await expect(page.getByRole('listitem').filter({ hasText: titulo })).toContainText('Pendiente');
});

test('marcar una nota la deja como hecha', async ({ page }) => {
  const titulo = `Llamar al banco ${etiqueta()}`;
  await test.step('preparar datos por la interfaz', async () => {
    await crearNotaPorUI(page, titulo);
  });
  const nota = page.getByRole('listitem').filter({ hasText: titulo });
  await nota.getByRole('checkbox').check();
  await expect(nota).toContainText('Hecha');
});

test('desmarcar una nota la devuelve a pendiente', async ({ page }) => {
  const titulo = `Pagar recibo ${etiqueta()}`;
  await test.step('preparar datos por la interfaz', async () => {
    await crearNotaPorUI(page, titulo);
    await page.getByRole('listitem').filter({ hasText: titulo }).getByRole('checkbox').check();
    await expect(page.getByRole('listitem').filter({ hasText: titulo })).toContainText('Hecha');
  });
  const nota = page.getByRole('listitem').filter({ hasText: titulo });
  await nota.getByRole('checkbox').uncheck();
  await expect(nota).toContainText('Pendiente');
});

test('borrar una nota la quita de la lista', async ({ page }) => {
  const titulo = `Regar plantas ${etiqueta()}`;
  await test.step('preparar datos por la interfaz', async () => {
    await crearNotaPorUI(page, titulo);
  });
  await page.getByRole('button', { name: `Borrar ${titulo}` }).click();
  await expect(page.getByRole('listitem').filter({ hasText: titulo })).toHaveCount(0);
});

test('el buscador muestra solo las notas que coinciden', async ({ page }) => {
  const e = etiqueta();
  await test.step('preparar datos por la interfaz', async () => {
    await crearNotaPorUI(page, `Viaje a Roma ${e}`);
    await crearNotaPorUI(page, `Viaje a Lima ${e}`);
    await crearNotaPorUI(page, `Cena con Luis ${e}`);
  });
  await page.getByLabel('Buscar').fill(`Viaje a Roma ${e}`);
  await expect(page.getByRole('listitem')).toHaveCount(1);
});

test('la búsqueda no distingue mayúsculas', async ({ page }) => {
  const e = etiqueta();
  await test.step('preparar datos por la interfaz', async () => {
    await crearNotaPorUI(page, `Revisar Contrato ${e}`);
  });
  await page.getByLabel('Buscar').fill(`revisar contrato ${e}`);
  await expect(page.getByRole('listitem')).toHaveCount(1);
});

test('una búsqueda sin coincidencias no muestra notas', async ({ page }) => {
  const e = etiqueta();
  await test.step('preparar datos por la interfaz', async () => {
    await crearNotaPorUI(page, `Ir al dentista ${e}`);
    await crearNotaPorUI(page, `Ir al médico ${e}`);
  });
  await page.getByLabel('Buscar').fill(`Ir al gimnasio ${e}`);
  await expect(page.getByRole('listitem')).toHaveCount(0);
});

test('las notas se conservan al recargar la página', async ({ page }) => {
  const e = etiqueta();
  await test.step('preparar datos por la interfaz', async () => {
    await crearNotaPorUI(page, `Leer capítulo 1 ${e}`);
    await crearNotaPorUI(page, `Leer capítulo 2 ${e}`);
  });
  await page.reload();
  await page.getByLabel('Buscar').fill(`Leer capítulo`);
  await expect(page.getByRole('listitem').filter({ hasText: e })).toHaveCount(2);
});

test('una nota hecha sigue hecha al recargar', async ({ page }) => {
  const titulo = `Enviar informe ${etiqueta()}`;
  await test.step('preparar datos por la interfaz', async () => {
    await crearNotaPorUI(page, titulo);
  });
  await page.getByRole('listitem').filter({ hasText: titulo }).getByRole('checkbox').check();
  await expect(page.getByRole('listitem').filter({ hasText: titulo })).toContainText('Hecha');
  await page.reload();
  await expect(page.getByRole('listitem').filter({ hasText: titulo })).toContainText('Hecha');
});
