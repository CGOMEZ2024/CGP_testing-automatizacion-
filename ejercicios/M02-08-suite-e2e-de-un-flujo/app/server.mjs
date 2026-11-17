// Aplicación bajo prueba de M02-08: una tienda mínima (login → catálogo → carrito → pedido).
// La sesión va en una cookie «sesion»; el carrito vive en el navegador (localStorage).
// API: POST /api/login · GET /api/yo · GET /api/productos · POST /api/pedidos
// Usuario de prueba: ana / tienda123. Puerto: PORT (3208 por defecto). Sin dependencias.
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

const PORT = Number(process.env.PORT ?? 3208);
const PUBLICO = fileURLToPath(new URL('./public/', import.meta.url));
const TIPOS = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8' };
const USUARIOS = { ana: 'tienda123' };
const PRODUCTOS = [
  { id: 1, nombre: 'Taza', precio: 8 },
  { id: 2, nombre: 'Camiseta', precio: 15 },
  { id: 3, nombre: 'Gorra', precio: 12 },
];
const sesiones = new Map();                  // id de sesión → usuario
let ultimoPedido = 0;

const json = (res, estado, datos, cabeceras = {}) =>
  res.writeHead(estado, { 'content-type': 'application/json', ...cabeceras }).end(JSON.stringify(datos));
const usuarioDe = (req) => sesiones.get(/(?:^|; )sesion=([^;]+)/.exec(req.headers.cookie ?? '')?.[1]);
async function cuerpo(req) {
  let texto = '';
  for await (const trozo of req) texto += trozo;
  return JSON.parse(texto || '{}');
}

createServer(async (req, res) => {
  const ruta = new URL(req.url, 'http://localhost').pathname;

  if (req.method === 'POST' && ruta === '/api/login') {
    const { usuario, clave } = await cuerpo(req);
    if (USUARIOS[usuario] !== clave) return json(res, 401, { error: 'Usuario o contraseña incorrectos' });
    const id = randomUUID();
    sesiones.set(id, usuario);
    return json(res, 200, { usuario }, { 'set-cookie': `sesion=${id}; Path=/; HttpOnly; SameSite=Lax` });
  }
  if (ruta.startsWith('/api/')) {
    const usuario = usuarioDe(req);
    if (!usuario) return json(res, 401, { error: 'Inicia sesión' });
    if (ruta === '/api/yo') return json(res, 200, { usuario });
    if (ruta === '/api/productos') return json(res, 200, PRODUCTOS);
    if (req.method === 'POST' && ruta === '/api/pedidos') {
      const { lineas = [] } = await cuerpo(req);
      if (lineas.length === 0) return json(res, 400, { error: 'El carrito está vacío' });
      ultimoPedido += 1;
      return json(res, 201, { numero: `P-${String(ultimoPedido).padStart(4, '0')}`, usuario });
    }
    return json(res, 404, { error: 'No existe' });
  }

  const fichero = normalize(join(PUBLICO, ruta === '/' ? 'login.html' : ruta));
  if (!fichero.startsWith(PUBLICO)) return res.writeHead(403).end();
  try {
    const contenido = await readFile(fichero);
    res.writeHead(200, { 'content-type': TIPOS[extname(fichero)] ?? 'application/octet-stream' }).end(contenido);
  } catch {
    res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' }).end('No encontrado');
  }
}).listen(PORT, () => console.log(`Tienda en http://localhost:${PORT}`));
