// API mínima para mirar una respuesta HTTP por dentro.
// Arranque: PORT=3300 node app/server.mjs
import { createServer } from 'node:http';

const PORT = Number(process.env.PORT ?? 3300);

const productos = [
  { id: 1, nombre: 'Teclado', precio: 24.9, stock: 12 },
  { id: 2, nombre: 'Ratón', precio: 12.5, stock: 0 },
];

function enviarJson(res, estado, cuerpo) {
  res.writeHead(estado, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(cuerpo));
}

createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const partes = url.pathname.split('/').filter(Boolean); // ['api','productos','1']

  if (req.method === 'GET' && url.pathname === '/api/productos') {
    return enviarJson(res, 200, productos);
  }
  if (req.method === 'GET' && partes[0] === 'api' && partes[1] === 'productos' && partes.length === 3) {
    const producto = productos.find((p) => p.id === Number(partes[2]));
    if (!producto) return enviarJson(res, 404, { error: 'Producto no encontrado' });
    return enviarJson(res, 200, producto);
  }
  enviarJson(res, 404, { error: 'Ruta no encontrada' });
}).listen(PORT, () => console.log(`API de productos en http://localhost:${PORT}`));
