// API de tareas en memoria (se reinicia en cada arranque).
// Arranque: PORT=3301 node app/server.mjs
import { createServer } from 'node:http';

const PORT = Number(process.env.PORT ?? 3301);

let tareas = [
  { id: 1, titulo: 'Preparar la demo', hecha: false },
  { id: 2, titulo: 'Revisar el informe', hecha: true },
];
let siguienteId = 3;

function enviarJson(res, estado, cuerpo, cabeceras = {}) {
  res.writeHead(estado, { 'Content-Type': 'application/json; charset=utf-8', ...cabeceras });
  res.end(cuerpo === undefined ? '' : JSON.stringify(cuerpo));
}

async function leerJson(req) {
  let texto = '';
  for await (const trozo of req) texto += trozo;
  try {
    return JSON.parse(texto || 'null');
  } catch {
    return undefined; // cuerpo que no es JSON
  }
}

// Una tarea válida tiene un título de texto no vacío; «hecha», si viene, es booleano
function errorDeValidacion(datos) {
  if (!datos || typeof datos !== 'object') return 'El cuerpo debe ser un objeto JSON';
  if (typeof datos.titulo !== 'string' || datos.titulo.trim() === '') return 'El campo titulo es obligatorio';
  if ('hecha' in datos && typeof datos.hecha !== 'boolean') return 'El campo hecha debe ser true o false';
  return null;
}

createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const [api, recurso, idTexto, ...resto] = url.pathname.split('/').filter(Boolean);
  if (api !== 'api' || recurso !== 'tareas' || resto.length > 0) {
    return enviarJson(res, 404, { error: 'Ruta no encontrada' });
  }

  // Colección: /api/tareas
  if (idTexto === undefined) {
    if (req.method === 'GET') return enviarJson(res, 200, tareas);
    if (req.method === 'POST') {
      const datos = await leerJson(req);
      const error = errorDeValidacion(datos);
      if (error) return enviarJson(res, 400, { error });
      const tarea = { id: siguienteId++, titulo: datos.titulo.trim(), hecha: datos.hecha ?? false };
      tareas.push(tarea);
      return enviarJson(res, 201, tarea, { Location: `/api/tareas/${tarea.id}` });
    }
    return enviarJson(res, 405, { error: 'Método no permitido' });
  }

  // Elemento: /api/tareas/:id
  const tarea = tareas.find((t) => t.id === Number(idTexto));
  if (!tarea) return enviarJson(res, 404, { error: 'Tarea no encontrada' });

  if (req.method === 'GET') return enviarJson(res, 200, tarea);
  if (req.method === 'PUT') {
    const datos = await leerJson(req);
    const error = errorDeValidacion(datos);
    if (error) return enviarJson(res, 400, { error });
    tarea.titulo = datos.titulo.trim();
    tarea.hecha = datos.hecha ?? tarea.hecha;
    return enviarJson(res, 200, tarea);
  }
  if (req.method === 'DELETE') {
    tareas = tareas.filter((t) => t.id !== tarea.id);
    res.writeHead(204);
    return res.end();
  }
  return enviarJson(res, 405, { error: 'Método no permitido' });
}).listen(PORT, () => console.log(`API de tareas en http://localhost:${PORT}`));
