// Cliente de la API de pedidos: muestra el resumen de un pedido.
// Uso: node cliente/cliente.mjs <id>
//   API_URL  dirección de la API (por defecto, el mock en http://localhost:3306)
//   PREFER   solo para probar contra el mock: se envía como cabecera «Prefer» (p. ej. code=404)
const API_URL = process.env.API_URL ?? 'http://localhost:3306';
const id = process.argv[2] ?? '1042';

const cabeceras = process.env.PREFER ? { Prefer: process.env.PREFER } : {};
const respuesta = await fetch(`${API_URL}/api/pedidos/${id}`, { headers: cabeceras });

// Antes de usar el cuerpo, mira el estado: un 404 no trae un pedido
if (respuesta.status === 404) {
  console.log(`No existe el pedido ${id}`);
  process.exit(1);
}
if (!respuesta.ok) {
  console.log(`La API ha respondido ${respuesta.status}: inténtalo más tarde`);
  process.exit(1);
}
const pedido = await respuesta.json();

const total = pedido.total.toFixed(2).replace('.', ',');
console.log(`Pedido ${pedido.id} de ${pedido.cliente}: ${pedido.estado}, total ${total} €`);
for (const linea of pedido.lineas) {
  console.log(`  - ${linea.cantidad} × ${linea.producto}`);
}
