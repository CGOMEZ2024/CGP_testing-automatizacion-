// Prueba unitaria de humo (Vitest): si pasa, Node y Vitest funcionan.
import { describe, it, expect } from 'vitest';
import { saludar } from '../src/saludo.js';

describe('saludar', () => {
  it('devuelve el saludo con el nombre', () => {
    expect(saludar('Ada')).toBe('Hola, Ada');
  });
});
