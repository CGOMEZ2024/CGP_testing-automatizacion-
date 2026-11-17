// Aplicación bajo prueba de M02-09: reserva de salas de reuniones.
// GET /api/salas · POST /api/reservas (tarda RETRASO_MS, 1500 por defecto; 409 si la franja está ocupada)
// Puerto: PORT (3209 por defecto). Sin dependencias: solo node:http.
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const PORT = Number(process.env.PORT ?? 3209);
const RETRASO_MS = Number(process.env.RETRASO_MS ?? 1500);
const PAGINA = fileURLToPath(new URL('./public/index.html', import.meta.url));
const SALAS = ['Sala Norte', 'Sala Sur', 'Sala Este'];
const reservas = [];

const json = (res, estado, datos) =>
  res.writeHead(estado, { 'content-type': 'application/json' }).end(JSON.stringify(datos));

createServer(async (req, res) => {
  const ruta = new URL(req.url, 'http://localhost').pathname;
  if (ruta === '/api/salas') return json(res, 200, SALAS);
  if (req.method === 'POST' && ruta === '/api/reservas') {
    let cuerpo = '';
    for await (const trozo of req) cuerpo += trozo;
    const { sala, fecha, hora, nombre } = JSON.parse(cuerpo || '{}');
    await new Promise((r) => setTimeout(r, RETRASO_MS));          // el servidor tarda en confirmar
    if (reservas.some((r) => r.sala === sala && r.fecha === fecha && r.hora === hora)) {
      return json(res, 409, { error: 'La sala ya está reservada a esa hora' });
    }
    const reserva = { codigo: `R-${String(reservas.length + 1).padStart(4, '0')}`, sala, fecha, hora, nombre };
    reservas.push(reserva);
    return json(res, 201, reserva);
  }
  if (ruta === '/') {
    return res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' }).end(await readFile(PAGINA));
  }
  res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' }).end('No encontrado');
}).listen(PORT, () => console.log(`Reservas en http://localhost:${PORT} (el servidor tarda ${RETRASO_MS} ms en confirmar)`));
