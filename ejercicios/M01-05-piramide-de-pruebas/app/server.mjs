// App del lab: página en / y API en /api/envio?importe=N&zona=Z. Puerto PORT (3105 por defecto).
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { calcularEnvio } from '../src/envio.js';

const PORT = Number(process.env.PORT ?? 3105);
const pagina = new URL('./public/index.html', import.meta.url);

function json(respuesta, estado, cuerpo) {
  respuesta.writeHead(estado, { 'Content-Type': 'application/json; charset=utf-8' });
  respuesta.end(JSON.stringify(cuerpo));
}

createServer(async (peticion, respuesta) => {
  const url = new URL(peticion.url, `http://${peticion.headers.host}`);
  if (url.pathname === '/api/envio') {
    const importe = Number(url.searchParams.get('importe'));
    const zona = url.searchParams.get('zona');
    try {
      return json(respuesta, 200, { importe, zona, coste: calcularEnvio(importe, zona) });
    } catch (error) {
      return json(respuesta, 400, { error: error.message });
    }
  }
  if (url.pathname === '/') {
    respuesta.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    return respuesta.end(await readFile(pagina));
  }
  respuesta.writeHead(404).end();
}).listen(PORT, () => console.log(`Calculadora de envío: http://localhost:${PORT}`));
