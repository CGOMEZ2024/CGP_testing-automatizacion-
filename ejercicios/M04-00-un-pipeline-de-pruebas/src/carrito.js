// Calcula el total de un carrito: suma precio × cantidad de cada línea, redondeado a céntimos.
export function totalCarrito(lineas) {
  const total = lineas.reduce((suma, { precio, cantidad }) => suma + precio * cantidad, 0);
  return Math.round(total * 100) / 100;
}
