import { describe, test, expect } from 'vitest';
import { precioEntrada } from '../../src/entradas.js';

// Una fila por caso: los datos se leen como una tabla de reglas de negocio
const casos = [
  // caso                                            edad  día          carnet  precio
  { caso: 'menor de 12, día normal',                 edad: 8,  dia: 'lunes',     carnetJoven: false, precio: 5 },
  { caso: 'menor de 12, miércoles (no baja de 5 €)', edad: 8,  dia: 'miercoles', carnetJoven: false, precio: 5 },
  { caso: 'con 12 años ya no es menor (límite)',     edad: 12, dia: 'lunes',     carnetJoven: false, precio: 9 },
  { caso: 'adulto, día normal',                      edad: 40, dia: 'lunes',     carnetJoven: false, precio: 9 },
  { caso: 'adulto, miércoles',                       edad: 40, dia: 'miercoles', carnetJoven: false, precio: 6 },
  { caso: '65 años justos (límite)',                 edad: 65, dia: 'lunes',     carnetJoven: false, precio: 6 },
  { caso: 'carnet joven con 20 años',                edad: 20, dia: 'lunes',     carnetJoven: true,  precio: 7 },
  { caso: 'carnet joven con 25 años (límite)',       edad: 25, dia: 'lunes',     carnetJoven: true,  precio: 7 },
  { caso: 'carnet joven caducado con 26 años',       edad: 26, dia: 'lunes',     carnetJoven: true,  precio: 9 },
  { caso: 'carnet joven, miércoles',                 edad: 20, dia: 'miercoles', carnetJoven: true,  precio: 6 },
];

describe('precioEntrada', () => {
  test.each(casos)('$caso → $precio €', ({ edad, dia, carnetJoven, precio }) => {
    expect(precioEntrada({ edad, dia, carnetJoven })).toBe(precio);
  });
});
