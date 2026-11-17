// Aplicación bajo prueba del lab M04-06: un tablón de avisos que dice en qué máquina se ejecuta.
// Sin dependencias: node:http. Puerto por la variable PORT (3406 por defecto).
import { createServer } from 'node:http';
import { hostname } from 'node:os';

const PORT = Number(process.env.PORT ?? 3406);
const avisos = ['Reunión de equipo el lunes', 'Nueva versión en preproducción'];

createServer((req, res) => {
  if (req.url === '/salud') {
    res.writeHead(200, { 'content-type': 'text/plain' }).end('ok');
    return;
  }
  res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
  res.end(`<!doctype html>
<html lang="es">
<head><meta charset="utf-8"><title>Tablón de avisos</title></head>
<body>
  <h1>Tablón de avisos</h1>
  <ul aria-label="Avisos">${avisos.map((a) => `<li>${a}</li>`).join('')}</ul>
  <footer>Servido por ${hostname()}</footer>
</body>
</html>`);
}).listen(PORT, () => console.log(`Tablón en http://localhost:${PORT} (máquina ${hostname()})`));
