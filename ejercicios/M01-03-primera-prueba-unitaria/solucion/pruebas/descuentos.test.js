// Pruebas unitarias de calcularDescuento (Vitest).
import { describe, it, expect } from 'vitest';
import { calcularDescuento } from '../src/descuentos.js';

describe('calcularDescuento', () => {
  it('una compra de 30 € no tiene descuento', () => {
    // Preparar: el dato de entrada
    const importe = 30;
    // Actuar: una sola llamada a lo que se prueba
    const descuento = calcularDescuento(importe);
    // Comprobar: el resultado esperado
    expect(descuento).toBe(0);
  });

  // Tus pruebas, debajo de esta línea

  it('una compra de 75 € tiene un 5 %', () => {
    // Preparar
    const importe = 75;
    // Actuar
    const descuento = calcularDescuento(importe);
    // Comprobar
    expect(descuento).toBe(5);
  });

  it('una compra de 150 € tiene un 10 %', () => {
    const importe = 150;
    const descuento = calcularDescuento(importe);
    expect(descuento).toBe(10);
  });

  it('una compra de 50 € justos tiene un 5 %', () => {
    expect(calcularDescuento(50)).toBe(5);
  });

  it('una compra de 100 € justos tiene un 10 %', () => {
    expect(calcularDescuento(100)).toBe(10);
  });

  it('un importe negativo es un error', () => {
    expect(() => calcularDescuento(-1)).toThrow('negativo');
  });

  it.each([
    { importe: 49.99, esperado: 0 },
    { importe: 50, esperado: 5 },
    { importe: 99.99, esperado: 5 },
    { importe: 100, esperado: 10 },
  ])('el límite $importe € da un $esperado %', ({ importe, esperado }) => {
    expect(calcularDescuento(importe)).toBe(esperado);
  });

  it('una compra de 199,99 € sigue en el 10 %', () => {
    expect(calcularDescuento(199.99)).toBe(10);
  });

  it('una compra de 200 € justos tiene un 15 %', () => {
    expect(calcularDescuento(200)).toBe(15);
  });
});
