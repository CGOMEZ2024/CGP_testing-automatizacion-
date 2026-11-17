// Las pruebas del ejemplo de Copilot, revisadas y completadas con lo que se le escapó
import { describe, it, expect } from 'vitest';
import { validarContrasena } from '../../src/contrasena.js';

describe('validarContrasena', () => {
  // --- Lo que generó Copilot, con las aserciones reforzadas ---
  it('acepta una contraseña que cumple todas las reglas', () => {
    expect(validarContrasena('Segura#2024abc')).toEqual({ valida: true, errores: [] });
  });

  it('una contraseña corta falla SOLO por longitud', () => {
    // 'Ab1!' cumple mayúscula, minúscula, dígito y símbolo: el único error es la longitud
    expect(validarContrasena('Ab1!')).toEqual({ valida: false, errores: ['longitud'] });
  });

  it('sin mayúsculas', () => {
    expect(validarContrasena('segura#2024abc').errores).toEqual(['mayuscula']);
  });

  it('sin minúsculas', () => {
    expect(validarContrasena('SEGURA#2024ABC').errores).toEqual(['minuscula']);
  });

  it('sin dígitos', () => {
    expect(validarContrasena('Segura#abcdef').errores).toEqual(['digito']);
  });

  it('sin símbolos', () => {
    expect(validarContrasena('Segura2024abc').errores).toEqual(['simbolo']);
  });

  it('contiene el usuario', () => {
    expect(validarContrasena('Ana#2024segura', { usuario: 'Ana' }).errores).toEqual(['usuario']);
  });

  it('lanza TypeError con su mensaje si no es un texto', () => {
    expect(() => validarContrasena(12345)).toThrow(new TypeError('La contraseña tiene que ser un texto'));
  });

  // --- Lo que faltaba: límites, espacios, mayúsculas del usuario y varios errores a la vez ---
  it.each([
    ['11 caracteres: corta', 'Abcdefgh#12', ['longitud']],
    ['12 caracteres: vale (límite)', 'Abcdefgh#123', []],
    ['64 caracteres: vale (límite)', 'Ab#1' + 'x'.repeat(60), []],
    ['65 caracteres: larga', 'Ab#1' + 'x'.repeat(61), ['longitud']],
  ])('longitud: %s', (_caso, clave, errores) => {
    expect(validarContrasena(clave).errores).toEqual(errores);
  });

  it('con un espacio en medio', () => {
    expect(validarContrasena('Segura #2024abc').errores).toEqual(['espacios']);
  });

  it('el usuario se detecta sin distinguir mayúsculas', () => {
    expect(validarContrasena('XANA#2024segura', { usuario: 'ana' }).errores).toEqual(['usuario']);
  });

  it('sin usuario, no se comprueba esa regla', () => {
    expect(validarContrasena('Segura#2024abc', {}).valida).toBe(true);
  });

  it('acumula todos los errores que tenga', () => {
    expect(validarContrasena('abc').errores).toEqual(['longitud', 'mayuscula', 'digito', 'simbolo']);
  });
});
