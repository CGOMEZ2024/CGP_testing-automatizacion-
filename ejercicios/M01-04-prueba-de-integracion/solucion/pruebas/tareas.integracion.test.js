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

  it('POST /api/tareas crea la tarea y responde 201', async () => {
    // Preparar: el cuerpo de la petición
    const nueva = { titulo: 'Comprar pan' };
    // Actuar: una petición HTTP real al servidor
    const respuesta = await fetch(`${base}/api/tareas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(nueva),
    });
    // Comprobar: el estado y el cuerpo de la respuesta
    expect(respuesta.status).toBe(201);
    expect(await respuesta.json()).toEqual({ id: expect.any(Number), titulo: 'Comprar pan', hecha: false });
  });

  it('la tarea creada aparece en GET /api/tareas', async () => {
    // Preparar: crea su propia tarea por la API
    const creada = await fetch(`${base}/api/tareas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ titulo: 'Llamar al fontanero' }),
    }).then((r) => r.json());
    // Actuar: pide la lista
    const lista = await fetch(`${base}/api/tareas`).then((r) => r.json());
    // Comprobar: la tarea está guardada en el almacén real
    expect(lista).toContainEqual(creada);
  });

  it('POST sin título responde 400 con el motivo', async () => {
    const respuesta = await fetch(`${base}/api/tareas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    expect(respuesta.status).toBe(400);
    expect(await respuesta.json()).toEqual({ error: 'El título es obligatorio' });
  });

  it('POST con un título de más de 80 caracteres responde 400', async () => {
    const respuesta = await fetch(`${base}/api/tareas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ titulo: 'x'.repeat(81) }),
    });
    expect(respuesta.status).toBe(400);
    expect(await respuesta.json()).toEqual({ error: 'El título no puede superar 80 caracteres' });
  });
});
