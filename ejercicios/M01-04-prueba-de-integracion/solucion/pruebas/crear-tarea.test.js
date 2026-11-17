// Prueba unitaria de crearTarea: el almacén es un doble (mock) hecho con vi.fn().
import { describe, it, expect, vi } from 'vitest';
import { crearTarea } from '../app/rutas.js';

describe('crearTarea (unitaria, con mock)', () => {
  it('guarda la tarea y responde 201', () => {
    // Preparar: un almacén falso que devuelve una tarea fija
    const almacen = { agregar: vi.fn(() => ({ id: 1, titulo: 'Comprar pan', hecha: false })) };
    // Actuar
    const respuesta = crearTarea(almacen, { titulo: 'Comprar pan' });
    // Comprobar: el estado y que se llamó al almacén con el título
    expect(respuesta.estado).toBe(201);
    expect(almacen.agregar).toHaveBeenCalledWith('Comprar pan');
  });

  it('sin título responde 400', () => {
    const almacen = { agregar: vi.fn() };
    const respuesta = crearTarea(almacen, { titulo: '' });
    expect(respuesta.estado).toBe(400);
    expect(almacen.agregar).not.toHaveBeenCalled();
  });
});
