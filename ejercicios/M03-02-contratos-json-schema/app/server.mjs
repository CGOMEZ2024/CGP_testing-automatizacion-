// API de tareas de solo lectura, en dos versiones.
//   VERSION_API=1 (por defecto): la tarea lleva el campo «hecha»
//   VERSION_API=2: el equipo del backend ha renombrado «hecha» a «completada»
// Arranque: PORT=3302 VERSION_API=1 node app/server.mjs
import { createServer } from 'node:http';

const PORT = Number(process.env.PORT ?? 3302);
const VERSION_API = process.env.VERSION_API ?? '1';

const datos = [
  { id: 1, titulo: 'Preparar la demo', hecha: false, creada: '2026-11-02T09:00:00Z' },
  { id: 2, titulo: 'Revisar el informe', hecha: true, creada: '2026-11-03T15:30:00Z' },
];

// Cómo sale una tarea por la API según la versión
function representar(tarea) {
  if (VERSION_API === '2') {
    const { hecha, ...resto } = tarea;
    return { ...resto, completada: hecha };
  }
  return tarea;
}

function enviarJson(res, estado, cuerpo) {
  res.writeHead(estado, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(cuerpo));
}

createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const [api, recurso, idTexto] = url.pathname.split('/').filter(Boolean);
  if (req.method !== 'GET' || api !== 'api' || recurso !== 'tareas') {
    return enviarJson(res, 404, { error: 'Ruta no encontrada' });
  }
  if (idTexto === undefined) return enviarJson(res, 200, datos.map(representar));
  const tarea = datos.find((t) => t.id === Number(idTexto));
  if (!tarea) return enviarJson(res, 404, { error: 'Tarea no encontrada' });
  enviarJson(res, 200, representar(tarea));
}).listen(PORT, () => console.log(`API de tareas v${VERSION_API} en http://localhost:${PORT}`));
