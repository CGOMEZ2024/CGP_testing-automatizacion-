// Aplicación bajo prueba de M02-07: sirve la lista de tareas (app/public/) en el puerto PORT (3207 por defecto).
// Sin dependencias: solo node:http.
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

const PORT = Number(process.env.PORT ?? 3207);
const PUBLICO = fileURLToPath(new URL('./public/', import.meta.url));
const TIPOS = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8' };

createServer(async (req, res) => {
  const ruta = new URL(req.url, 'http://localhost').pathname;
  const fichero = normalize(join(PUBLICO, ruta.endsWith('/') ? `${ruta}index.html` : ruta));
  if (!fichero.startsWith(PUBLICO)) return res.writeHead(403).end();
  try {
    const cuerpo = await readFile(fichero);
    res.writeHead(200, { 'content-type': TIPOS[extname(fichero)] ?? 'application/octet-stream' }).end(cuerpo);
  } catch {
    res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' }).end('No encontrado');
  }
}).listen(PORT, () => console.log(`Aplicación en http://localhost:${PORT}`));
