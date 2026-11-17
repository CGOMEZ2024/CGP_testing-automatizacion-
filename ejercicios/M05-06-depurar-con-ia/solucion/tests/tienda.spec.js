import { test, expect } from '@playwright/test';
import { PaginaProducto } from './paginas/producto.js';

// Las mismas tres pruebas, ya corregidas para la versión 2 y usando el Page Object.
// Las aserciones siguen en la prueba: el Page Object sabe CÓMO se usa la página; la prueba, QUÉ se espera.

test('muestra el nombre y el precio del producto', async ({ page }) => {
  const producto = new PaginaProducto(page);
  await producto.abrir();
  await expect(producto.nombre).toHaveText('Auriculares Pro');
  await expect(producto.precio).toHaveText('64,90 €');
});

test('añadir al carrito suma un artículo', async ({ page }) => {
  const producto = new PaginaProducto(page);
  await producto.abrir();
  await producto.anadirAlCarrito();
  await expect(producto.articulos).toHaveText('1');
});

test('el total multiplica el precio por la cantidad', async ({ page }) => {
  const producto = new PaginaProducto(page);
  await producto.abrir();
  await producto.anadirAlCarrito(2);
  await expect(producto.total).toHaveText('129,80 €');
});
