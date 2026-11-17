// Aplicación bajo prueba de M02-05 (solución: acepta el cupón en minúsculas). Sirve la misma página que ../../app/public/.
// GET /api/cupones/:codigo → 200 { codigo, descuento } si existe; 404 si no.
// Puerto: PORT (3205 por defecto). Sin dependencias: solo node:http.
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const PORT = Number(process.env.PORT ?? 3205);
const PAGINA = fileURLToPath(new URL('../../app/public/index.html', import.meta.url));
const CUPONES = { VERANO10: 10, BIENVENIDA5: 5 };       // código → % de descuento

const json = (res, estado, datos) =>
  res.writeHead(estado, { 'content-type': 'application/json' }).end(JSON.stringify(datos));

createServer(async (req, res) => {
  const ruta = new URL(req.url, 'http://localhost').pathname;
  const cupon = ruta.match(/^\/api\/cupones\/([^/]+)$/);
  if (cupon) {
    const codigo = decodeURIComponent(cupon[1]).toUpperCase();   // el cliente puede escribirlo en minúsculas
    if (!(codigo in CUPONES)) return json(res, 404, { error: 'Cupón desconocido', codigo });
    return json(res, 200, { codigo, descuento: CUPONES[codigo] });
  }
  if (ruta === '/') {
    return res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' }).end(await readFile(PAGINA));
  }
  res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' }).end('No encontrado');
}).listen(PORT, () => console.log(`Aplicación en http://localhost:${PORT}`));
