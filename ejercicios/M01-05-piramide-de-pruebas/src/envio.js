// Coste de envío según la zona y el importe del pedido (en euros):
//   península  4,95 €  · gratis desde 60 €
//   baleares   9,95 €  · gratis desde 120 €
//   canarias  14,95 €  · nunca gratis
export const TARIFAS = {
  peninsula: { coste: 4.95, gratisDesde: 60 },
  baleares: { coste: 9.95, gratisDesde: 120 },
  canarias: { coste: 14.95, gratisDesde: Infinity },
};

export function calcularEnvio(importe, zona) {
  const tarifa = TARIFAS[zona];
  if (!tarifa) {
    throw new RangeError(`Zona desconocida: ${zona}`);
  }
  if (!(importe >= 0)) {
    throw new RangeError('El importe no puede ser negativo');
  }
  return importe >= tarifa.gratisDesde ? 0 : tarifa.coste;
}
