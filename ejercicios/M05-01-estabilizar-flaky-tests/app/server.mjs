// Aplicación bajo prueba de M05-01: tres páginas con tres causas de inestabilidad distintas.
//   /catalogo.html  → la API tarda entre 100 y 900 ms (carga variable)
//   /resumen.html   → el total se anima de 0 a su valor (animación)
//   /favoritos.html → listas de favoritos guardadas en el servidor (datos compartidos)
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { join, extname } from 'node:path';

const PORT = Number(process.env.PORT ?? 3501);
const PUBLIC = join(import.meta.dirname, 'public');
const TIPOS = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript' };

const productos = ['Teclado', 'Ratón', 'Monitor', 'Webcam'];
// Una lista de favoritos por nombre; la página usa la lista «general» salvo que se pida otra (?lista=…)
const listas = new Map();
const lista = (nombre) => listas.get(nombre) ?? listas.set(nombre, []).get(nombre);

const json = (res, estado, datos) => {
  res.writeHead(estado, { 'content-type': 'application/json' });
  res.end(datos === undefined ? '' : JSON.stringify(datos));
};
const leerCuerpo = async (req) => {
  let cuerpo = '';
  for await (const trozo of req) cuerpo += trozo;
  return cuerpo ? JSON.parse(cuerpo) : {};
};

createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost');

  if (url.pathname === '/api/productos') {
    // Carga variable: entre 100 y 900 ms
    setTimeout(() => json(res, 200, productos), 100 + Math.floor(Math.random() * 800));
    return;
  }

  const m = url.pathname.match(/^\/api\/listas\/([\w-]+)\/favoritos$/);
  if (m) {
    const favoritos = lista(m[1]);
    if (req.method === 'GET') return json(res, 200, favoritos);
    if (req.method === 'POST') {
      const { nombre } = await leerCuerpo(req);
      favoritos.push(nombre);
      return json(res, 201, favoritos);
    }
    if (req.method === 'DELETE') {
      favoritos.length = 0;
      return json(res, 204);
    }
  }

  const ruta = url.pathname === '/' ? '/catalogo.html' : url.pathname;
  try {
    const cuerpo = await readFile(join(PUBLIC, ruta));
    res.writeHead(200, { 'content-type': TIPOS[extname(ruta)] ?? 'text/plain' });
    res.end(cuerpo);
  } catch {
    res.writeHead(404).end('No encontrado');
  }
}).listen(PORT, () => console.log(`Tienda en http://localhost:${PORT}`));
