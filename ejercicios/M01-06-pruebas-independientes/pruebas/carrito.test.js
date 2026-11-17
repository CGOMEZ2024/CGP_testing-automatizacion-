// Pruebas del carrito. Pasan... si se ejecutan en este orden.
import { describe, it, expect } from 'vitest';
import { agregar, contar, total } from '../src/carrito.js';

describe('carrito', () => {
  it('empieza vacío', () => {
    expect(contar()).toBe(0);
  });

  it('agrega un libro', () => {
    agregar('Libro', 20);
    expect(contar()).toBe(1);
  });

  it('agrega una lámpara', () => {
    agregar('Lámpara', 35);
    expect(contar()).toBe(2);
  });

  it('calcula el total', () => {
    expect(total()).toBe(55);
  });
});
