// Precio de una entrada de cine.
// Reglas:
//   - Menores de 12 años: 5 €, cualquier día.
//   - Miércoles (día del espectador): 6 € para el resto.
//   - 65 años o más: 6 €.
//   - Con carnet joven (de 12 a 25 años, ambos incluidos): 7 €.
//   - Resto: 9 €.
export function precioEntrada({ edad, dia, carnetJoven = false }) {
  if (edad < 12) return 5;
  if (dia === 'miercoles') return 6;
  if (edad >= 65) return 6;
  if (carnetJoven && edad <= 25) return 7;
  return 9;
}
