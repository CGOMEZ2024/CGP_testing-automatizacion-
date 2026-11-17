import { test, expect } from '@playwright/test';

// Estas pruebas dan por hecho un entorno recién creado: solo los tres libros de la semilla

test('el catálogo empieza con los tres libros de la semilla', async ({ request }) => {
  const respuesta = await request.get('/libros');
  expect(respuesta.status()).toBe(200);
  const libros = await respuesta.json();
  expect(libros.map((libro) => libro.titulo)).toEqual([
    'Cien años de soledad',
    'La casa de los espíritus',
    'Rayuela',
  ]);
});

test('añade un libro y le da el id 4', async ({ request }) => {
  const respuesta = await request.post('/libros', {
    data: { titulo: 'Pedro Páramo', autor: 'Juan Rulfo' },
  });
  expect(respuesta.status()).toBe(201);
  expect(await respuesta.json()).toEqual({ id: 4, titulo: 'Pedro Páramo', autor: 'Juan Rulfo' });
});
