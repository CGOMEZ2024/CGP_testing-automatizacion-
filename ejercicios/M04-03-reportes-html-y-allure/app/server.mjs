// Aplicación bajo prueba del lab M04-03: una calculadora de propinas.
// Sin dependencias: node:http sirve app/public/. Puerto por la variable PORT (3403 por defecto).
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';

const PORT = Number(process.env.PORT ?? 3403);
const pagina = new URL('./public/index.html', import.meta.url);

createServer(async (req, res) => {
  if (req.url === '/salud') {
    res.writeHead(200, { 'content-type': 'text/plain' }).end('ok');
    return;
  }
  res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' }).end(await readFile(pagina));
}).listen(PORT, () => console.log(`Calculadora en http://localhost:${PORT}`));
