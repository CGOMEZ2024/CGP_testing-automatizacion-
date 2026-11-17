// Aplicación bajo prueba de M05-06: la ficha de un producto con su carrito (puerto 3506).
// Sirve app/public/ y, en /api/producto, los datos de app/catalogo.json.
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { join, extname } from 'node:path';

const PORT = Number(process.env.PORT ?? 3506);
const PUBLIC = join(import.meta.dirname, 'public');
const TIPOS = { '.html': 'text/html; charset=utf-8', '.json': 'application/json' };

createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost');
  const fichero = url.pathname === '/api/producto'
    ? join(import.meta.dirname, 'catalogo.json')
    : join(PUBLIC, url.pathname === '/' ? 'producto.html' : url.pathname);
  try {
    const cuerpo = await readFile(fichero);
    res.writeHead(200, { 'content-type': TIPOS[extname(fichero)] ?? 'text/plain' });
    res.end(cuerpo);
  } catch {
    res.writeHead(404).end('No encontrado');
  }
}).listen(PORT, () => console.log(`Tienda en http://localhost:${PORT}`));
