// Aplicación bajo prueba de M05-05: formulario de registro (puerto 3505).
// Sirve app/public/ y, en /contrasena.js, la misma función de src/ que validan las pruebas unitarias.
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { join, extname } from 'node:path';

const PORT = Number(process.env.PORT ?? 3505);
const PUBLIC = join(import.meta.dirname, 'public');
const SRC = join(import.meta.dirname, '..', 'src');
const TIPOS = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript' };

createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost');
  const fichero = url.pathname === '/contrasena.js'
    ? join(SRC, 'contrasena.js')
    : join(PUBLIC, url.pathname === '/' ? 'registro.html' : url.pathname);
  try {
    const cuerpo = await readFile(fichero);
    res.writeHead(200, { 'content-type': TIPOS[extname(fichero)] ?? 'text/plain' });
    res.end(cuerpo);
  } catch {
    res.writeHead(404).end('No encontrado');
  }
}).listen(PORT, () => console.log(`Registro en http://localhost:${PORT}`));
