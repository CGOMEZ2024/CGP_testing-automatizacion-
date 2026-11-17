// API del lab M04-07: un catálogo de libros guardado en PostgreSQL.
// Conexión por las variables estándar de PostgreSQL (PGHOST, PGUSER, PGPASSWORD, PGDATABASE).
// Puerto por la variable PORT (3407 por defecto).
import { createServer } from 'node:http';
import pg from 'pg';

const PORT = Number(process.env.PORT ?? 3407);
const db = new pg.Pool(); // lee PGHOST, PGPORT, PGUSER, PGPASSWORD y PGDATABASE
// Si la base de datos cierra una conexión inactiva (p. ej. al reiniciarse), se descarta sin tumbar la API
db.on('error', (error) => console.error('Conexión perdida con la base de datos:', error.message));

function responder(res, estado, cuerpo) {
  res.writeHead(estado, { 'content-type': 'application/json' }).end(JSON.stringify(cuerpo));
}

async function leerJson(req) {
  let texto = '';
  for await (const trozo of req) texto += trozo;
  return JSON.parse(texto || '{}');
}

createServer(async (req, res) => {
  try {
    if (req.url === '/salud') {
      await db.query('SELECT 1'); // sana solo si la base de datos responde
      return responder(res, 200, { estado: 'ok' });
    }
    if (req.url === '/libros' && req.method === 'GET') {
      const { rows } = await db.query('SELECT id, titulo, autor FROM libros ORDER BY id');
      return responder(res, 200, rows);
    }
    if (req.url === '/libros' && req.method === 'POST') {
      const { titulo, autor } = await leerJson(req);
      if (!titulo || !autor) return responder(res, 400, { error: 'titulo y autor son obligatorios' });
      const { rows } = await db.query(
        'INSERT INTO libros (titulo, autor) VALUES ($1, $2) RETURNING id, titulo, autor',
        [titulo, autor],
      );
      return responder(res, 201, rows[0]);
    }
    responder(res, 404, { error: 'no encontrado' });
  } catch (error) {
    responder(res, 500, { error: error.message });
  }
}).listen(PORT, () => console.log(`API de libros en http://localhost:${PORT}`));

// Al parar el contenedor, cierra las conexiones y sale
process.on('SIGTERM', () => db.end().then(() => process.exit(0)));
