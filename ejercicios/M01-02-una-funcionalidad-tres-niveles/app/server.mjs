// App de la demo: página en / y API en /api/precio?unidades=N. Puerto PORT (3102 por defecto).
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { calcularPrecio } from '../src/precio.js';

const PORT = Number(process.env.PORT ?? 3102);
const pagina = new URL('./public/index.html', import.meta.url);

function json(respuesta, estado, cuerpo) {
  respuesta.writeHead(estado, { 'Content-Type': 'application/json; charset=utf-8' });
  respuesta.end(JSON.stringify(cuerpo));
}

createServer(async (peticion, respuesta) => {
  const url = new URL(peticion.url, `http://${peticion.headers.host}`);
  if (url.pathname === '/api/precio') {
    const unidades = Number(url.searchParams.get('unidades'));
    try {
      return json(respuesta, 200, { unidades, total: calcularPrecio(unidades) });
    } catch (error) {
      return json(respuesta, 400, { error: error.message });
    }
  }
  if (url.pathname === '/') {
    respuesta.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    return respuesta.end(await readFile(pagina));
  }
  respuesta.writeHead(404).end();
}).listen(PORT, () => console.log(`Calculadora de entradas: http://localhost:${PORT}`));
