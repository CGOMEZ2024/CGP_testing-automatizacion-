// EJEMPLO de lo que puede generar GitHub Copilot con el prompt del lab.
// Tu respuesta será distinta: sirve para comparar y para seguir el lab sin Copilot.
import { describe, it, expect } from 'vitest';
import { validarContrasena } from '../src/contrasena.js';

describe('validarContrasena', () => {
  it('should accept a valid password', () => {
    const result = validarContrasena('Segura#2024abc');
    expect(result.valida).toBe(true);
    expect(result.errores).toEqual([]);
  });

  it('should reject a password that is too short', () => {
    const result = validarContrasena('Ab1!');
    expect(result.valida).toBe(false);
  });

  it('should reject a password without uppercase letters', () => {
    const result = validarContrasena('segura#2024abc');
    expect(result.valida).toBe(false);
    expect(result.errores).toContain('mayuscula');
  });

  it('should reject a password without lowercase letters', () => {
    const result = validarContrasena('SEGURA#2024ABC');
    expect(result.valida).toBe(false);
    expect(result.errores).toContain('minuscula');
  });

  it('should reject a password without digits', () => {
    const result = validarContrasena('Segura#abcdef');
    expect(result.valida).toBe(false);
    expect(result.errores).toContain('digito');
  });

  it('should reject a password without symbols', () => {
    const result = validarContrasena('Segura2024abc');
    expect(result.valida).toBe(false);
    expect(result.errores).toContain('simbolo');
  });

  it('should reject a password that contains the username', () => {
    const result = validarContrasena('Ana#2024segura', { usuario: 'Ana' });
    expect(result.valida).toBe(false);
  });

  it('should throw if password is not a string', () => {
    expect(() => validarContrasena(12345)).toThrow();
  });
});
