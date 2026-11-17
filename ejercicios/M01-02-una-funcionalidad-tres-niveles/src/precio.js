// Regla de negocio: cada entrada cuesta 12,50 €; a partir de 10 entradas, 20 % de descuento.
export const PRECIO_UNITARIO = 12.5;
export const MINIMO_DESCUENTO = 10;

export function calcularPrecio(unidades) {
  if (!Number.isInteger(unidades) || unidades < 1) {
    throw new RangeError('unidades debe ser un entero mayor que 0');
  }
  const bruto = unidades * PRECIO_UNITARIO;
  const total = unidades >= MINIMO_DESCUENTO ? bruto * 0.8 : bruto;
  return Math.round(total * 100) / 100;      // redondeo a céntimos
}
