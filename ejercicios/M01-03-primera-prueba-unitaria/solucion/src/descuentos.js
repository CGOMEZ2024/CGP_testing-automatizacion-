// Descuento según el importe de la compra (en euros):
//   menos de 50 €   →  0 %
//   desde 50 €      →  5 %
//   desde 100 €     → 10 %
//   desde 200 €     → 15 %
// Devuelve el porcentaje de descuento. Un importe negativo es un error.
export function calcularDescuento(importe) {
  if (importe < 0) {
    throw new RangeError('El importe no puede ser negativo');
  }
  if (importe >= 200) {
    return 15;
  }
  if (importe >= 100) {
    return 10;
  }
  if (importe >= 50) {
    return 5;
  }
  return 0;
}
