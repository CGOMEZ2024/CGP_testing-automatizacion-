// Pruebas de la lista de tareas (M02-07) — solución con Page Object y fixture
import { test, expect } from '../fixtures.js';

test('añade una tarea', async ({ tareas }) => {
  await tareas.anadir('Comprar pan');
  await expect(tareas.tareas).toContainText(['Comprar pan']);
  await expect(tareas.contador('1 pendiente')).toBeVisible();
});

test('completa una tarea', async ({ tareas }) => {
  await tareas.anadir('Comprar pan', 'Llamar al banco');
  await tareas.completar('Comprar pan');
  await expect(tareas.contador('1 pendiente')).toBeVisible();
});

test('borra una tarea', async ({ tareas }) => {
  await tareas.anadir('Comprar pan');
  await tareas.borrar('Comprar pan');
  await expect(tareas.tareas).toHaveCount(0);
  await expect(tareas.contador('0 pendientes')).toBeVisible();
});

test('no añade tareas vacías', async ({ tareas }) => {
  await tareas.anadir('   ');
  await expect(tareas.tareas).toHaveCount(0);
});
