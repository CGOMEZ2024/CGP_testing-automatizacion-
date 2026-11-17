// Aplicación bajo prueba de M02-04: formulario de alta (app/public/index.html) y API POST /api/altas.
// El servidor guarda las altas en memoria y rechaza un correo repetido (409).
// Puerto: PORT (3204 por defecto). Sin dependencias: solo node:http.
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const PORT = Number(process.env.PORT ?? 3204);
const PAGINA = fileURLToPath(new URL('./public/index.html', import.meta.url));
const altas = new Map();                                  // correo → alta

const json = (res, estado, datos) =>
  res.writeHead(estado, { 'content-type': 'application/json' }).end(JSON.stringify(datos));

createServer(async (req, res) => {
  const ruta = new URL(req.url, 'http://localhost').pathname;
  if (req.method === 'POST' && ruta === '/api/altas') {
    let cuerpo = '';
    for await (const trozo of req) cuerpo += trozo;
    const { nombre, correo, plan } = JSON.parse(cuerpo || '{}');
    if (altas.has(correo)) return json(res, 409, { error: 'Ese correo ya está registrado' });
    const alta = { id: altas.size + 1, nombre, correo, plan };
    altas.set(correo, alta);
    return json(res, 201, alta);
  }
  if (ruta === '/') {
    return res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' }).end(await readFile(PAGINA));
  }
  res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' }).end('No encontrado');
}).listen(PORT, () => console.log(`Aplicación en http://localhost:${PORT}`));
