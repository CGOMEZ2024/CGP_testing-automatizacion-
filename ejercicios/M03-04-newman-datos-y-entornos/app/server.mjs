// API de contactos en memoria. Cada instancia dice en qué entorno corre (cabecera X-Entorno).
// Arranque: PORT=3304 ENTORNO=local node app/server.mjs
import { createServer } from 'node:http';

const PORT = Number(process.env.PORT ?? 3304);
const ENTORNO = process.env.ENTORNO ?? 'local';

const contactos = new Map();
let siguienteId = 1;

function enviarJson(res, estado, cuerpo) {
  res.writeHead(estado, { 'Content-Type': 'application/json; charset=utf-8', 'X-Entorno': ENTORNO });
  res.end(cuerpo === undefined ? '' : JSON.stringify(cuerpo));
}

async function leerJson(req) {
  let texto = '';
  for await (const trozo of req) texto += trozo;
  try { return JSON.parse(texto); } catch { return undefined; }
}

createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const [api, recurso, idTexto] = url.pathname.split('/').filter(Boolean);
  if (api !== 'api' || recurso !== 'contactos') return enviarJson(res, 404, { error: 'Ruta no encontrada' });

  if (idTexto === undefined) {
    if (req.method !== 'POST') return enviarJson(res, 405, { error: 'Método no permitido' });
    const datos = await leerJson(req) ?? {};
    const nombre = typeof datos.nombre === 'string' ? datos.nombre.trim() : '';
    const email = typeof datos.email === 'string' ? datos.email.trim() : '';
    if (!nombre) return enviarJson(res, 400, { error: 'El nombre es obligatorio' });
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return enviarJson(res, 400, { error: 'El email no es válido' });
    const contacto = { id: siguienteId++, nombre, email };
    contactos.set(contacto.id, contacto);
    return enviarJson(res, 201, contacto);
  }

  const id = Number(idTexto);
  if (!contactos.has(id)) return enviarJson(res, 404, { error: 'Contacto no encontrado' });
  if (req.method === 'GET') return enviarJson(res, 200, contactos.get(id));
  if (req.method === 'DELETE') {
    contactos.delete(id);
    return enviarJson(res, 204);
  }
  enviarJson(res, 405, { error: 'Método no permitido' });
}).listen(PORT, () => console.log(`API de contactos (${ENTORNO}) en http://localhost:${PORT}`));
