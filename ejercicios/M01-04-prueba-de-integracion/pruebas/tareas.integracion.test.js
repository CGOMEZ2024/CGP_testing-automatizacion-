// Prueba de integración: servidor HTTP real + rutas reales + almacén real, por HTTP.
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { crearServidor } from '../app/servidor.js';
import { crearAlmacen } from '../app/almacen.js';

let servidor;
let base;

beforeAll(async () => {
  servidor = crearServidor(crearAlmacen());
  // Puerto 0: el sistema operativo elige uno libre
  await new Promise((resolve) => servidor.listen(0, resolve));
  base = `http://localhost:${servidor.address().port}`;
});

afterAll(async () => {
  await new Promise((resolve) => servidor.close(resolve));
});

describe('API de tareas (integración)', () => {
  it('GET /api/tareas responde 200 con una lista', async () => {
    const respuesta = await fetch(`${base}/api/tareas`);
    expect(respuesta.status).toBe(200);
    expect(Array.isArray(await respuesta.json())).toBe(true);
  });

  // Tus pruebas, debajo de esta línea
});
