// Sirve la página de pedidos (app/public) y la API que consulta (/api/pedidos).
// Arranque: PORT=3307 node app/server.mjs
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';

const PORT = Number(process.env.PORT ?? 3307);

const pedidos = [
  { id: 1042, cliente: 'Ana', total: 59.9 },
  { id: 1043, cliente: 'Luis', total: 12.5 },
];

createServer(async (req, res) => {
  const { pathname } = new URL(req.url, `http://${req.headers.host}`);
  if (pathname === '/api/pedidos') {
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    return res.end(JSON.stringify(pedidos));
  }
  if (pathname === '/') {
    const html = await readFile(new URL('./public/index.html', import.meta.url));
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    return res.end(html);
  }
  res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end('No encontrado');
}).listen(PORT, () => console.log(`Página de pedidos en http://localhost:${PORT}`));
