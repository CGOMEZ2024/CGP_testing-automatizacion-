import { describe, test, expect } from 'vitest';
import { costeEnvio } from '../../src/envio.js';

// Las mismas situaciones, con el valor exacto esperado y los límites de cada regla
describe('costeEnvio', () => {
  test('península, 2 kg, 20 €: tarifa base de 4 €', () => {
    expect(costeEnvio({ peso: 2, destino: 'peninsula', importe: 20 })).toBe(4);
  });

  test('península con 80 €: envío gratis', () => {
    expect(costeEnvio({ peso: 2, destino: 'peninsula', importe: 80 })).toBe(0);
  });

  test('península con 50 € justos: ya es gratis (límite)', () => {
    expect(costeEnvio({ peso: 2, destino: 'peninsula', importe: 50 })).toBe(0);
  });

  test('península con 49,99 €: todavía se cobra (límite)', () => {
    expect(costeEnvio({ peso: 2, destino: 'peninsula', importe: 49.99 })).toBe(4);
  });

  test('islas con 80 €: no hay envío gratis, 8 €', () => {
    expect(costeEnvio({ peso: 2, destino: 'islas', importe: 80 })).toBe(8);
  });

  test('9 kg: 4 € + 4 kg de más × 0,50 € = 6 €', () => {
    expect(costeEnvio({ peso: 9, destino: 'peninsula', importe: 20 })).toBe(6);
  });

  test('5 kg justos: sin recargo por peso (límite)', () => {
    expect(costeEnvio({ peso: 5, destino: 'peninsula', importe: 20 })).toBe(4);
  });

  test('5,5 kg: recargo de 0,25 € y redondeo a céntimos', () => {
    expect(costeEnvio({ peso: 5.5, destino: 'peninsula', importe: 20 })).toBe(4.25);
  });

  test('urgente: el doble (8 €)', () => {
    expect(costeEnvio({ peso: 2, destino: 'peninsula', importe: 20, urgente: true })).toBe(8);
  });

  test('peso 0: error con su mensaje', () => {
    expect(() => costeEnvio({ peso: 0, destino: 'peninsula', importe: 20 }))
      .toThrow('El peso tiene que ser mayor que 0');
  });

  test('peso mínimo positivo: se acepta', () => {
    expect(costeEnvio({ peso: 0.1, destino: 'peninsula', importe: 20 })).toBe(4);
  });
});
