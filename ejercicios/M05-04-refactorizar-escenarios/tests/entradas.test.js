import { test, expect } from 'vitest';
import { precioEntrada } from '../src/entradas.js';

// Cada prueba se escribió copiando la anterior y cambiando los datos

test('precio 1', () => {
  const edad = 8;
  const dia = 'lunes';
  const carnetJoven = false;
  const precio = precioEntrada({ edad, dia, carnetJoven });
  expect(precio).toBe(5);
});

test('precio 2', () => {
  const edad = 8;
  const dia = 'miercoles';
  const carnetJoven = false;
  const precio = precioEntrada({ edad, dia, carnetJoven });
  expect(precio).toBe(5);
});

test('precio 3', () => {
  const edad = 40;
  const dia = 'lunes';
  const carnetJoven = false;
  const precio = precioEntrada({ edad, dia, carnetJoven });
  expect(precio).toBe(9);
});

test('precio 4', () => {
  const edad = 40;
  const dia = 'miercoles';
  const carnetJoven = false;
  const precio = precioEntrada({ edad, dia, carnetJoven });
  expect(precio).toBe(6);
});

test('precio 5', () => {
  const edad = 70;
  const dia = 'lunes';
  const carnetJoven = false;
  const precio = precioEntrada({ edad, dia, carnetJoven });
  expect(precio).toBe(6);
});

test('precio 6', () => {
  const edad = 20;
  const dia = 'lunes';
  const carnetJoven = true;
  const precio = precioEntrada({ edad, dia, carnetJoven });
  expect(precio).toBe(7);
});

test('precio 7', () => {
  const edad = 20;
  const dia = 'lunes';
  const carnetJoven = true;
  const precio = precioEntrada({ edad, dia, carnetJoven });
  expect(precio).toBe(7);
});

test('precio 8', () => {
  const edad = 30;
  const dia = 'lunes';
  const carnetJoven = true;
  const precio = precioEntrada({ edad, dia, carnetJoven });
  expect(precio).toBe(9);
});

test('precio 9', () => {
  const edad = 20;
  const dia = 'miercoles';
  const carnetJoven = true;
  const precio = precioEntrada({ edad, dia, carnetJoven });
  expect(precio).toBe(6);
});
