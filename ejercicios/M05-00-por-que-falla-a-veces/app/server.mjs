// Aplicación bajo prueba de M05-00: una búsqueda cuya respuesta tarda entre 100 y 900 ms.
// Sin dependencias: node:http sirve app/public/ y la API /api/pedidos.
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { join, extname } from 'node:path';

const PORT = Number(process.env.PORT ?? 3500);
const PUBLIC = join(import.meta.dirname, 'public');
const TIPOS = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript' };

const pedidos = [
  { id: 101, cliente: 'Ana', total: 42.5 },
  { id: 102, cliente: 'Luis', total: 18 },
  { id: 103, cliente: 'Marta', total: 99.9 },
];

// Retraso variable, como una red o una base de datos reales: entre 100 y 900 ms
const retraso = () => 100 + Math.floor(Math.random() * 800);

createServer(async (req, res) => {
  if (req.url === '/api/pedidos') {
    setTimeout(() => {
      res.writeHead(200, { 'content-type': 'application/json' });
      res.end(JSON.stringify(pedidos));
    }, retraso());
    return;
  }
  const ruta = req.url === '/' ? '/index.html' : req.url;
  try {
    const cuerpo = await readFile(join(PUBLIC, ruta));
    res.writeHead(200, { 'content-type': TIPOS[extname(ruta)] ?? 'text/plain' });
    res.end(cuerpo);
  } catch {
    res.writeHead(404).end('No encontrado');
  }
}).listen(PORT, () => console.log(`Pedidos en http://localhost:${PORT}`));
