// Fixture «tareas»: cada prueba la recibe ya creada y con la página abierta
import { test as base, expect } from '@playwright/test';
import { PaginaTareas } from './paginas/PaginaTareas.js';

export const test = base.extend({
  tareas: async ({ page }, use) => {
    const tareas = new PaginaTareas(page);   // preparar
    await tareas.abrir();
    await use(tareas);                       // aquí se ejecuta la prueba
  },                                         // (después de use iría la limpieza)
});

export { expect };
