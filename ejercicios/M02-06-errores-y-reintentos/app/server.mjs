// Aplicación bajo prueba de M02-06: consulta de saldo y movimientos de una cuenta.
// GET /api/saldo falla con 503 en la 1.ª, 4.ª, 7.ª… petición (una de cada FALLA_CADA, 3 por defecto):
// un servicio inestable. Con FALLA_CADA=1 falla siempre.
// GET /api/movimientos tiene un error real: devuelve 2 de los 3 movimientos.
// Puerto: PORT (3206 por defecto). Sin dependencias: solo node:http.
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const PORT = Number(process.env.PORT ?? 3206);
const FALLA_CADA = Number(process.env.FALLA_CADA ?? 3);
const PAGINA = fileURLToPath(new URL('./public/index.html', import.meta.url));
const MOVIMIENTOS = [
  { concepto: 'Nómina', importe: 1500 },
  { concepto: 'Alquiler', importe: -800 },
  { concepto: 'Supermercado', importe: -580 },
];
let peticionesSaldo = 0;

const json = (res, estado, datos) =>
  res.writeHead(estado, { 'content-type': 'application/json' }).end(JSON.stringify(datos));

createServer(async (req, res) => {
  const ruta = new URL(req.url, 'http://localhost').pathname;
  if (ruta === '/api/saldo') {
    peticionesSaldo += 1;
    console.log(`/api/saldo petición ${peticionesSaldo}`);
    if ((peticionesSaldo - 1) % FALLA_CADA === 0) return json(res, 503, { error: 'Servicio no disponible' });
    return json(res, 200, { saldo: 120 });
  }
  if (ruta === '/api/movimientos') {
    return json(res, 200, MOVIMIENTOS.slice(0, 2));        // error real: falta el último
  }
  if (ruta === '/') {
    return res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' }).end(await readFile(PAGINA));
  }
  res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' }).end('No encontrado');
}).listen(PORT, () => console.log(`Aplicación en http://localhost:${PORT}`));
