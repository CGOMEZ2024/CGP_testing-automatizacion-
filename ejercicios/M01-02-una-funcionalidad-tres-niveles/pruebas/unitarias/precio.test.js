// Nivel unitario: se llama a la función directamente, sin servidor ni navegador.
import { describe, it, expect } from 'vitest';
import { calcularPrecio } from '../../src/precio.js';

describe('calcularPrecio', () => {
  it('9 entradas no tienen descuento', () => {
    expect(calcularPrecio(9)).toBe(112.5);
  });

  it('10 entradas tienen un 20 % de descuento', () => {
    expect(calcularPrecio(10)).toBe(100);
  });
});
