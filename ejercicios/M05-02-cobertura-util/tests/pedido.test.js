import { test, expect } from 'vitest';
import { Pedido } from '../src/pedido.js';

// Pruebas de getters: suben la cobertura, pero ¿qué error podrían encontrar?
test('devuelve el id', () => {
  expect(new Pedido(7, 'Ana').id).toBe(7);
});

test('devuelve el cliente', () => {
  expect(new Pedido(7, 'Ana').cliente).toBe('Ana');
});

test('devuelve las líneas', () => {
  expect(new Pedido(7, 'Ana', ['libro']).lineas).toEqual(['libro']);
});
