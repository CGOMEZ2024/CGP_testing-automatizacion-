import { test, expect } from '@playwright/test';

// Cada prueba usa títulos propios (con una etiqueta aleatoria) para no depender de las demás
const etiqueta = () => Math.random().toString(36).slice(2, 7);

// Sin beforeEach de login: la sesión llega en storageState (proyecto «setup»)

// Crear una nota por la API, con las cookies de la sesión del navegador (page.request)
async function crearNotaPorAPI(page, titulo, { hecha = false } = {}) {
  const respuesta = await page.request.post('/api/notas', { data: { titulo } });
  expect(respuesta.status()).toBe(201);
  if (hecha) {
    const { id } = await respuesta.json();
    await page.request.patch(`/api/notas/${id}`, { data: { hecha: true } });
  }
}

test('una nota nueva aparece como pendiente', async ({ page }) => {
  // Aquí crear la nota ES lo que se prueba: se hace por la interfaz
  const titulo = `Comprar pan ${etiqueta()}`;
  await page.goto('/notas.html');
  await page.getByLabel('Nueva nota').fill(titulo);
  await page.getByRole('button', { name: 'Añadir' }).click();
  await expect(page.getByRole('listitem').filter({ hasText: titulo })).toContainText('Pendiente');
});

test('marcar una nota la deja como hecha', async ({ page }) => {
  const titulo = `Llamar al banco ${etiqueta()}`;
  await test.step('preparar datos por la API', async () => {
    await crearNotaPorAPI(page, titulo);
  });
  await page.goto('/notas.html');
  const nota = page.getByRole('listitem').filter({ hasText: titulo });
  await nota.getByRole('checkbox').check();
  await expect(nota).toContainText('Hecha');
});

test('desmarcar una nota la devuelve a pendiente', async ({ page }) => {
  const titulo = `Pagar recibo ${etiqueta()}`;
  await test.step('preparar datos por la API', async () => {
    await crearNotaPorAPI(page, titulo, { hecha: true });
  });
  await page.goto('/notas.html');
  const nota = page.getByRole('listitem').filter({ hasText: titulo });
  await nota.getByRole('checkbox').uncheck();
  await expect(nota).toContainText('Pendiente');
});

test('borrar una nota la quita de la lista', async ({ page }) => {
  const titulo = `Regar plantas ${etiqueta()}`;
  await test.step('preparar datos por la API', async () => {
    await crearNotaPorAPI(page, titulo);
  });
  await page.goto('/notas.html');
  await page.getByRole('button', { name: `Borrar ${titulo}` }).click();
  await expect(page.getByRole('listitem').filter({ hasText: titulo })).toHaveCount(0);
});

test('el buscador muestra solo las notas que coinciden', async ({ page }) => {
  const e = etiqueta();
  await test.step('preparar datos por la API', async () => {
    await crearNotaPorAPI(page, `Viaje a Roma ${e}`);
    await crearNotaPorAPI(page, `Viaje a Lima ${e}`);
    await crearNotaPorAPI(page, `Cena con Luis ${e}`);
  });
  await page.goto('/notas.html');
  await page.getByLabel('Buscar').fill(`Viaje a Roma ${e}`);
  await expect(page.getByRole('listitem')).toHaveCount(1);
});

test('la búsqueda no distingue mayúsculas', async ({ page }) => {
  const e = etiqueta();
  await test.step('preparar datos por la API', async () => {
    await crearNotaPorAPI(page, `Revisar Contrato ${e}`);
  });
  await page.goto('/notas.html');
  await page.getByLabel('Buscar').fill(`revisar contrato ${e}`);
  await expect(page.getByRole('listitem')).toHaveCount(1);
});

test('una búsqueda sin coincidencias no muestra notas', async ({ page }) => {
  const e = etiqueta();
  await test.step('preparar datos por la API', async () => {
    await crearNotaPorAPI(page, `Ir al dentista ${e}`);
    await crearNotaPorAPI(page, `Ir al médico ${e}`);
  });
  await page.goto('/notas.html');
  await page.getByLabel('Buscar').fill(`Ir al gimnasio ${e}`);
  await expect(page.getByRole('listitem')).toHaveCount(0);
});

test('las notas se conservan al recargar la página', async ({ page }) => {
  const e = etiqueta();
  await test.step('preparar datos por la API', async () => {
    await crearNotaPorAPI(page, `Leer capítulo 1 ${e}`);
    await crearNotaPorAPI(page, `Leer capítulo 2 ${e}`);
  });
  await page.goto('/notas.html');
  await page.reload();
  await page.getByLabel('Buscar').fill(`Leer capítulo`);
  await expect(page.getByRole('listitem').filter({ hasText: e })).toHaveCount(2);
});

test('una nota hecha sigue hecha al recargar', async ({ page }) => {
  const titulo = `Enviar informe ${etiqueta()}`;
  await test.step('preparar datos por la API', async () => {
    await crearNotaPorAPI(page, titulo);
  });
  await page.goto('/notas.html');
  await page.getByRole('listitem').filter({ hasText: titulo }).getByRole('checkbox').check();
  await expect(page.getByRole('listitem').filter({ hasText: titulo })).toContainText('Hecha');
  await page.reload();
  await expect(page.getByRole('listitem').filter({ hasText: titulo })).toContainText('Hecha');
});
