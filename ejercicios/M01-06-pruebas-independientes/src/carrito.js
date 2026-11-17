// Carrito de la compra. Las líneas viven en una variable del módulo:
// todo el que importe este fichero comparte el mismo carrito.
const lineas = [];

export function agregar(producto, precio) {
  lineas.push({ producto, precio });
}

export function contar() {
  return lineas.length;
}

export function total() {
  return lineas.reduce((suma, linea) => suma + linea.precio, 0);
}

export function vaciar() {
  lineas.length = 0;
}
