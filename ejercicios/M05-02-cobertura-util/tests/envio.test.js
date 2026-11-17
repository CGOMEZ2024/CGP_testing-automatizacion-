import { describe, test, expect } from 'vitest';
import { costeEnvio } from '../src/envio.js';

// Pasan todas y recorren todas las líneas de envio.js… pero ¿comprueban algo?
describe('costeEnvio', () => {
  test('calcula el envío a la península', () => {
    expect(costeEnvio({ peso: 2, destino: 'peninsula', importe: 20 })).toBeDefined();
  });

  test('el envío es gratis con importes altos', () => {
    expect(costeEnvio({ peso: 2, destino: 'peninsula', importe: 80 })).toBeGreaterThanOrEqual(0);
  });

  test('calcula el envío a las islas', () => {
    expect(costeEnvio({ peso: 2, destino: 'islas', importe: 20 })).toBeGreaterThan(0);
  });

  test('cobra los kilos de más', () => {
    expect(typeof costeEnvio({ peso: 9, destino: 'peninsula', importe: 20 })).toBe('number');
  });

  test('el urgente cuesta más', () => {
    expect(costeEnvio({ peso: 2, destino: 'peninsula', importe: 20, urgente: true })).toBeTruthy();
  });

  test('rechaza un peso no válido', () => {
    expect(() => costeEnvio({ peso: 0, destino: 'peninsula', importe: 20 })).toThrow();
  });
});
