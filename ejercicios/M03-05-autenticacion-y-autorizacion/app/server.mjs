// API con inicio de sesión y roles.
//   POST /api/login            → { token } si usuario y clave son correctos
//   GET  /api/informes         → cualquier usuario con sesión (rol lector o admin)
//   GET  /api/admin/usuarios   → solo rol admin
// El token es «datos.firma»: datos en base64url y firma HMAC-SHA256 con un secreto del servidor.
// Arranque: PORT=3305 node app/server.mjs
import { createServer } from 'node:http';
import { createHmac, timingSafeEqual } from 'node:crypto';

const PORT = Number(process.env.PORT ?? 3305);
const SECRETO = process.env.SECRETO ?? 'secreto-solo-para-el-lab';
const DURACION_TOKEN_S = 3600;

const usuarios = {
  ana: { clave: 'ana123', rol: 'admin' },
  luis: { clave: 'luis123', rol: 'lector' },
};
const informes = [
  { id: 1, titulo: 'Ventas de octubre' },
  { id: 2, titulo: 'Incidencias de la semana' },
];

const firmar = (datos) => createHmac('sha256', SECRETO).update(datos).digest('base64url');

function crearToken(usuario, rol) {
  const exp = Math.floor(Date.now() / 1000) + DURACION_TOKEN_S;
  const datos = Buffer.from(JSON.stringify({ usuario, rol, exp })).toString('base64url');
  return `${datos}.${firmar(datos)}`;
}

// Devuelve los datos del token si la firma es buena y no ha caducado; si no, null
function verificarToken(token) {
  const [datos, firma] = token.split('.');
  if (!datos || !firma) return null;
  const esperada = Buffer.from(firmar(datos));
  const recibida = Buffer.from(firma);
  if (esperada.length !== recibida.length || !timingSafeEqual(esperada, recibida)) return null;
  const sesion = JSON.parse(Buffer.from(datos, 'base64url').toString());
  if (sesion.exp < Date.now() / 1000) return null;
  return sesion;
}

function enviarJson(res, estado, cuerpo, cabeceras = {}) {
  res.writeHead(estado, { 'Content-Type': 'application/json; charset=utf-8', ...cabeceras });
  res.end(JSON.stringify(cuerpo));
}

// Autenticación: ¿quién eres? Sin token válido → 401
function autenticar(req, res) {
  const cabecera = req.headers.authorization ?? '';
  if (!cabecera.startsWith('Bearer ')) {
    enviarJson(res, 401, { error: 'Falta el token' }, { 'WWW-Authenticate': 'Bearer' });
    return null;
  }
  const sesion = verificarToken(cabecera.slice('Bearer '.length));
  if (!sesion) {
    enviarJson(res, 401, { error: 'Token no válido' }, { 'WWW-Authenticate': 'Bearer error="invalid_token"' });
    return null;
  }
  return sesion;
}

async function leerJson(req) {
  let texto = '';
  for await (const trozo of req) texto += trozo;
  try { return JSON.parse(texto); } catch { return {}; }
}

createServer(async (req, res) => {
  const { pathname } = new URL(req.url, `http://${req.headers.host}`);

  if (req.method === 'POST' && pathname === '/api/login') {
    const { usuario, clave } = await leerJson(req);
    const cuenta = usuarios[usuario];
    if (!cuenta || cuenta.clave !== clave) return enviarJson(res, 401, { error: 'Credenciales incorrectas' });
    return enviarJson(res, 200, { token: crearToken(usuario, cuenta.rol) });
  }

  if (req.method === 'GET' && pathname === '/api/informes') {
    const sesion = autenticar(req, res);
    if (!sesion) return;
    return enviarJson(res, 200, informes);
  }

  if (req.method === 'GET' && pathname === '/api/admin/usuarios') {
    const sesion = autenticar(req, res);
    if (!sesion) return;
    // Autorización: ¿puedes hacer esto? Con sesión pero sin el rol → 403
    if (sesion.rol !== 'admin') return enviarJson(res, 403, { error: 'Necesitas el rol admin' });
    return enviarJson(res, 200, Object.entries(usuarios).map(([nombre, { rol }]) => ({ nombre, rol })));
  }

  enviarJson(res, 404, { error: 'Ruta no encontrada' });
}).listen(PORT, () => console.log(`API con sesión en http://localhost:${PORT}`));
