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
});
