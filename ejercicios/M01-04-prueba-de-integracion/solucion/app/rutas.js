// Lógica de cada endpoint: recibe el almacén y los datos, devuelve { estado, cuerpo }.
export function listarTareas(almacen) {
  return { estado: 200, cuerpo: almacen.listar() };
}

export function crearTarea(almacen, datos) {
  if (typeof datos?.titulo !== 'string' || datos.titulo.trim() === '') {
    return { estado: 400, cuerpo: { error: 'El título es obligatorio' } };
  }
  if (datos.titulo.trim().length > 80) {
    return { estado: 400, cuerpo: { error: 'El título no puede superar 80 caracteres' } };
  }
  const tarea = almacen.agregar(datos.titulo.trim());
  return { estado: 201, cuerpo: tarea };
}
