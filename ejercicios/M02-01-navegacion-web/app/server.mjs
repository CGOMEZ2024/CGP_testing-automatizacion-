// Aplicación bajo prueba de M02-01: un sitio de tres páginas (app/public/) y una API de productos.
// Puerto: PORT (3201 por defecto). Sin dependencias: solo node:http.
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

const PORT = Number(process.env.PORT ?? 3201);
const PUBLICO = fileURLToPath(new URL('./public/', import.meta.url));
const TIPOS = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8' };
const PRODUCTOS = ['Teclado', 'Ratón', 'Monitor'];
const espera = (ms) => new Promise((r) => setTimeout(r, ms));

createServer(async (req, res) => {
  const ruta = new URL(req.url, 'http://localhost').pathname;
  if (ruta === '/api/productos') {
    await espera(300);                                   // la API tarda 300 ms en responder
    return res.writeHead(200, { 'content-type': 'application/json' }).end(JSON.stringify(PRODUCTOS));
  }
  const fichero = normalize(join(PUBLICO, ruta.endsWith('/') ? `${ruta}index.html` : ruta));
  if (!fichero.startsWith(PUBLICO)) return res.writeHead(403).end();
  try {
    const cuerpo = await readFile(fichero);
    res.writeHead(200, { 'content-type': TIPOS[extname(fichero)] ?? 'application/octet-stream' }).end(cuerpo);
  } catch {
    res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' }).end('No encontrado');
  }
}).listen(PORT, () => console.log(`Aplicación en http://localhost:${PORT}`));
