// Aplicación bajo prueba de M02-03: una página que pide las entregas de hoy a una API lenta.
// La API tarda un tiempo AL AZAR entre RETRASO_MIN y RETRASO_MAX ms (100–900 por defecto).
// Puerto: PORT (3203 por defecto). Sin dependencias: solo node:http.
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const PORT = Number(process.env.PORT ?? 3203);
const RETRASO_MIN = Number(process.env.RETRASO_MIN ?? 100);
const RETRASO_MAX = Number(process.env.RETRASO_MAX ?? 900);
const PAGINA = fileURLToPath(new URL('./public/index.html', import.meta.url));
const ENTREGAS = [
  { codigo: 'E-101', destino: 'Bilbao', estado: 'En reparto' },
  { codigo: 'E-102', destino: 'Sevilla', estado: 'Entregada' },
  { codigo: 'E-103', destino: 'Zaragoza', estado: 'En almacén' },
];

createServer(async (req, res) => {
  const ruta = new URL(req.url, 'http://localhost').pathname;
  if (ruta === '/api/entregas') {
    const retraso = RETRASO_MIN + Math.floor(Math.random() * (RETRASO_MAX - RETRASO_MIN));
    await new Promise((r) => setTimeout(r, retraso));
    res.writeHead(200, { 'content-type': 'application/json', 'x-retraso-ms': String(retraso) });
    return res.end(JSON.stringify(ENTREGAS));
  }
  if (ruta === '/') {
    return res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' }).end(await readFile(PAGINA));
  }
  res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' }).end('No encontrado');
}).listen(PORT, () => console.log(`Aplicación en http://localhost:${PORT} (retraso ${RETRASO_MIN}–${RETRASO_MAX} ms)`));
