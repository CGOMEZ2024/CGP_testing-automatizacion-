// Reto: actualizar y borrar una tarea, y comprobar que el borrado es real.
import { test, expect } from '@playwright/test';

test('actualiza y borra una tarea', async ({ request }) => {
  // Crea una tarea propia para no depender de las que trae la API
  const creada = await (await request.post('/api/tareas', { data: { titulo: 'Temporal' } })).json();

  const actualizada = await request.put(`/api/tareas/${creada.id}`, {
    data: { titulo: 'Temporal revisada', hecha: true },
  });
  expect(actualizada.status()).toBe(200);
  expect(await actualizada.json()).toEqual({ id: creada.id, titulo: 'Temporal revisada', hecha: true });

  const borrada = await request.delete(`/api/tareas/${creada.id}`);
  expect(borrada.status()).toBe(204);
  expect(await borrada.text()).toBe('');

  // Lo que demuestra el borrado es la siguiente lectura
  const leida = await request.get(`/api/tareas/${creada.id}`);
  expect(leida.status()).toBe(404);
});
