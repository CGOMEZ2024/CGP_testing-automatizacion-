// API de libros en memoria (se reinicia en cada arranque).
// Arranque: PORT=3303 node app/server.mjs
import { createServer } from 'node:http';

const PORT = Number(process.env.PORT ?? 3303);

const libros = [
  { id: 1, titulo: 'Clean Code', autor: 'Robert C. Martin', anio: 2008, disponible: true },
  { id: 2, titulo: 'Refactoring', autor: 'Martin Fowler', anio: 1999, disponible: false },
];
let siguienteId = 3;

function enviarJson(res, estado, cuerpo, cabeceras = {}) {
  res.writeHead(estado, { 'Content-Type': 'application/json; charset=utf-8', ...cabeceras });
  res.end(JSON.stringify(cuerpo));
}

async function leerJson(req) {
  let texto = '';
  for await (const trozo of req) texto += trozo;
  try { return JSON.parse(texto); } catch { return undefined; }
}

createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const [api, recurso, idTexto] = url.pathname.split('/').filter(Boolean);
  if (api !== 'api' || recurso !== 'libros') return enviarJson(res, 404, { error: 'Ruta no encontrada' });

  if (idTexto === undefined && req.method === 'GET') return enviarJson(res, 200, libros);
  if (idTexto === undefined && req.method === 'POST') {
    const datos = await leerJson(req);
    if (!datos || typeof datos.titulo !== 'string' || typeof datos.autor !== 'string') {
      return enviarJson(res, 400, { error: 'titulo y autor son obligatorios' });
    }
    const libro = { id: siguienteId++, titulo: datos.titulo, autor: datos.autor, anio: datos.anio ?? null, disponible: true };
    libros.push(libro);
    return enviarJson(res, 201, libro, { Location: `/api/libros/${libro.id}` });
  }
  if (idTexto !== undefined && req.method === 'GET') {
    const libro = libros.find((l) => l.id === Number(idTexto));
    if (!libro) return enviarJson(res, 404, { error: 'Libro no encontrado' });
    return enviarJson(res, 200, libro);
  }
  enviarJson(res, 405, { error: 'Método no permitido' });
}).listen(PORT, () => console.log(`API de libros en http://localhost:${PORT}`));
