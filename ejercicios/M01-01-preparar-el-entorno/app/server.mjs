// Servidor mínimo de la suite de humo: sirve app/public/ en el puerto PORT (3101 por defecto).
// Sin dependencias: solo el módulo node:http de Node.js.
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';

const PORT = Number(process.env.PORT ?? 3101);
const pagina = new URL('./public/index.html', import.meta.url);

createServer(async (peticion, respuesta) => {
  if (peticion.url === '/' || peticion.url === '/index.html') {
    respuesta.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    respuesta.end(await readFile(pagina));
    return;
  }
  respuesta.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
  respuesta.end('No encontrado');
}).listen(PORT, () => console.log(`Suite de humo: http://localhost:${PORT}`));
