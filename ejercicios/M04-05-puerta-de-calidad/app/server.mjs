// Aplicación bajo prueba del lab M04-05: acceso con usuario y contraseña e informes que tardan en generarse.
// Sin dependencias: node:http. Puerto por la variable PORT (3405 por defecto).
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';

const PORT = Number(process.env.PORT ?? 3405);
const pagina = new URL('./public/index.html', import.meta.url);
const esperar = (ms) => new Promise((resolver) => setTimeout(resolver, ms));

createServer(async (req, res) => {
  if (req.url === '/salud') {
    res.writeHead(200, { 'content-type': 'text/plain' }).end('ok');
    return;
  }
  // Informes: tardan en generarse (mensual 2 s, anual 3 s)
  const informe = req.url.match(/^\/api\/informe\/(mensual|anual)$/);
  if (informe) {
    await esperar(informe[1] === 'mensual' ? 2000 : 3000);
    res.writeHead(200, { 'content-type': 'application/json' });
    res.end(JSON.stringify({ tipo: informe[1], pedidos: informe[1] === 'mensual' ? 42 : 517 }));
    return;
  }
  res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' }).end(await readFile(pagina));
}).listen(PORT, () => console.log(`Panel en http://localhost:${PORT}`));
