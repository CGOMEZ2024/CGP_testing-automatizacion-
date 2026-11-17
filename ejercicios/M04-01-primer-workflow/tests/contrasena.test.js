import { describe, it, expect } from 'vitest';
import { esContrasenaValida } from '../src/contrasena.js';

describe('esContrasenaValida', () => {
  it('acepta 8 caracteres con letras y números', () => {
    expect(esContrasenaValida('abcdefg1')).toBe(true);
  });

  it('rechaza 7 caracteres aunque tenga letras y números', () => {
    expect(esContrasenaValida('abcdef1')).toBe(false);
  });

  it('rechaza una contraseña sin números', () => {
    expect(esContrasenaValida('abcdefgh')).toBe(false);
  });

  it('rechaza una contraseña sin letras', () => {
    expect(esContrasenaValida('12345678')).toBe(false);
  });
});
