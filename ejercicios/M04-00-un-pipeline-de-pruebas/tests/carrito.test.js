import { describe, it, expect } from 'vitest';
import { totalCarrito } from '../src/carrito.js';

describe('totalCarrito', () => {
  it('un carrito vacío suma 0', () => {
    expect(totalCarrito([])).toBe(0);
  });

  it('multiplica precio por cantidad', () => {
    expect(totalCarrito([{ precio: 2.5, cantidad: 4 }])).toBe(10);
  });

  it('redondea a céntimos', () => {
    expect(totalCarrito([{ precio: 0.1, cantidad: 3 }])).toBe(0.3);
  });
});
