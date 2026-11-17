// Descuento según el importe de la compra (en euros):
//   menos de 50 €   →  0 %
//   desde 50 €      →  5 %
//   desde 100 €     → 10 %
// Devuelve el porcentaje de descuento. Un importe negativo es un error.
export function calcularDescuento(importe) {
  if (importe < 0) {
    throw new RangeError('El importe no puede ser negativo');
  }
  if (importe > 100) {
    return 10;
  }
  if (importe >= 50) {
    return 5;
  }
  return 0;
}
