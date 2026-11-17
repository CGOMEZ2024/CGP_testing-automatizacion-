// Aplicación bajo prueba de M05-03: notas con inicio de sesión (puerto 3503).
//   POST /api/login       {usuario, clave} → cookie «sesion» (tarda ~600 ms, como un login real)
//   GET  /api/notas       notas del usuario de la sesión
//   POST /api/notas       {titulo} → crea una nota pendiente
//   PATCH /api/notas/:id  {hecha} → marca o desmarca
//   DELETE /api/notas/:id
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { join, extname } from 'node:path';
import { randomUUID } from 'node:crypto';

const PORT = Number(process.env.PORT ?? 3503);
const PUBLIC = join(import.meta.dirname, 'public');
const TIPOS = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript' };
const USUARIOS = { ana: 'curso123' };

const sesiones = new Map();               // id de sesión → usuario
const notas = [];                         // { id, usuario, titulo, hecha }
let siguienteId = 1;
const espera = (ms) => new Promise((r) => setTimeout(r, ms));

const json = (res, estado, datos) => {
  res.writeHead(estado, { 'content-type': 'application/json' });
  res.end(datos === undefined ? '' : JSON.stringify(datos));
};
const leerCuerpo = async (req) => {
  let cuerpo = '';
  for await (const trozo of req) cuerpo += trozo;
  return cuerpo ? JSON.parse(cuerpo) : {};
};
const usuarioDe = (req) => {
  const id = /sesion=([\w-]+)/.exec(req.headers.cookie ?? '')?.[1];
  return sesiones.get(id);
};

createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost');

  if (url.pathname === '/api/login' && req.method === 'POST') {
    const { usuario, clave } = await leerCuerpo(req);
    await espera(600);                    // comprobar la clave cuesta: ~600 ms
    if (USUARIOS[usuario] !== clave) return json(res, 401, { error: 'Credenciales incorrectas' });
    const id = randomUUID();
    sesiones.set(id, usuario);
    res.setHeader('set-cookie', `sesion=${id}; Path=/; HttpOnly`);
    return json(res, 200, { usuario });
  }

  if (url.pathname.startsWith('/api/notas')) {
    const usuario = usuarioDe(req);
    if (!usuario) return json(res, 401, { error: 'Sin sesión' });
    await espera(100);                    // cada operación con la base de datos: ~100 ms
    const id = Number(url.pathname.split('/')[3]);
    const nota = notas.find((n) => n.id === id && n.usuario === usuario);

    if (url.pathname === '/api/notas' && req.method === 'GET') {
      return json(res, 200, notas.filter((n) => n.usuario === usuario));
    }
    if (url.pathname === '/api/notas' && req.method === 'POST') {
      const { titulo } = await leerCuerpo(req);
      const nueva = { id: siguienteId++, usuario, titulo, hecha: false };
      notas.push(nueva);
      return json(res, 201, nueva);
    }
    if (nota && req.method === 'PATCH') {
      nota.hecha = Boolean((await leerCuerpo(req)).hecha);
      return json(res, 200, nota);
    }
    if (nota && req.method === 'DELETE') {
      notas.splice(notas.indexOf(nota), 1);
      return json(res, 204);
    }
    return json(res, 404, { error: 'No existe' });
  }

  const ruta = url.pathname === '/' ? '/login.html' : url.pathname;
  try {
    const cuerpo = await readFile(join(PUBLIC, ruta));
    res.writeHead(200, { 'content-type': TIPOS[extname(ruta)] ?? 'text/plain' });
    res.end(cuerpo);
  } catch {
    res.writeHead(404).end('No encontrado');
  }
}).listen(PORT, () => console.log(`Notas en http://localhost:${PORT}`));
