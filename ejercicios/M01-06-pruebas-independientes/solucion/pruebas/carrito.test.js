// Pruebas del carrito: cada una parte de un carrito vacío y crea sus propios datos.
import { describe, it, expect, beforeEach } from 'vitest';
import { agregar, contar, total, vaciar } from '../src/carrito.js';

describe('carrito', () => {
  // Antes de cada prueba: carrito vacío, pase lo que pase en las demás
  beforeEach(() => {
    vaciar();
  });

  it('empieza vacío', () => {
    expect(contar()).toBe(0);
  });

  it('agrega un libro', () => {
    agregar('Libro', 20);
    expect(contar()).toBe(1);
  });

  it('agrega una lámpara después de un libro', () => {
    // Sus propios datos: no cuenta con el libro de la prueba anterior
    agregar('Libro', 20);
    agregar('Lámpara', 35);
    expect(contar()).toBe(2);
  });

  it('calcula el total', () => {
    agregar('Libro', 20);
    agregar('Lámpara', 35);
    expect(total()).toBe(55);
  });
});
