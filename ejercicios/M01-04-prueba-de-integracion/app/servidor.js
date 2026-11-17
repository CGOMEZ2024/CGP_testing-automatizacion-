// Servidor HTTP de la API de tareas (node:http, sin dependencias).
//   GET  /api/tareas  → lista de tareas
//   POST /api/tareas  → crea una tarea con { "titulo": "…" }
import { createServer } from 'node:http';
import { listarTareas, crearTarea } from './rutas.js';

async function leerJson(peticion) {
  let texto = '';
  for await (const trozo of peticion) texto += trozo;
  return texto ? JSON.parse(texto) : {};
}

export function crearServidor(almacen) {
  return createServer(async (peticion, respuesta) => {
    let resultado;
    try {
      if (peticion.url === '/api/tareas' && peticion.method === 'GET') {
        resultado = listarTareas(almacen);
      } else if (peticion.url === '/api/tareas' && peticion.method === 'POST') {
        resultado = crearTarea(almacen, await leerJson(peticion));
      } else {
        resultado = { estado: 404, cuerpo: { error: 'No encontrado' } };
      }
    } catch (error) {
      console.error(error);                 // el detalle queda en el registro del servidor
      resultado = { estado: 500, cuerpo: { error: 'Error interno' } };
    }
    respuesta.writeHead(resultado.estado, { 'Content-Type': 'application/json; charset=utf-8' });
    respuesta.end(JSON.stringify(resultado.cuerpo));
  });
}
