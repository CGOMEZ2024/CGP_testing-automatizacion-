// Coste de envío de un pedido de una tienda online.
// Reglas de negocio:
//   - El peso tiene que ser mayor que 0 (si no, error).
//   - Envío gratis a la península si el importe es de 50 € o más.
//   - Tarifa base: 4 € a la península, 8 € a las islas.
//   - Por encima de 5 kg, 0,50 € por cada kilo de más.
//   - El envío urgente cuesta el doble.
export function costeEnvio({ peso, destino, importe, urgente = false }) {
  if (peso <= 0) {
    throw new RangeError('El peso tiene que ser mayor que 0');
  }
  if (destino === 'peninsula' && importe >= 50) {
    return 0;
  }
  let coste = destino === 'islas' ? 8 : 4;
  if (peso > 5) {
    coste += (peso - 5) * 0.5;
  }
  if (urgente) {
    coste *= 2;
  }
  return Math.round(coste * 100) / 100;
}
