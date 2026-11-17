// Pruebas con un carrito propio por prueba: sin beforeEach ni vaciar().
import { describe, it, expect } from 'vitest';
import { crearCarrito } from '../src/carrito.js';

describe('crearCarrito', () => {
  it('empieza vacío', () => {
    const carrito = crearCarrito();
    expect(carrito.contar()).toBe(0);
  });

  it('agrega un libro', () => {
    const carrito = crearCarrito();
    carrito.agregar('Libro', 20);
    expect(carrito.contar()).toBe(1);
  });

  it('calcula el total', () => {
    const carrito = crearCarrito();
    carrito.agregar('Libro', 20);
    carrito.agregar('Lámpara', 35);
    expect(carrito.total()).toBe(55);
  });
});
