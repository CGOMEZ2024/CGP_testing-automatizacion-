// Almacén de tareas en memoria: hace el papel de la base de datos.
export function crearAlmacen() {
  const tareas = [];
  let siguienteId = 1;
  return {
    // Guarda una tarea nueva y la devuelve con su id
    agregar(titulo) {
      const tarea = { id: siguienteId++, titulo, hecha: false };
      tareas.push(tarea);
      return tarea;
    },
    // Devuelve una copia de todas las tareas
    listar() {
      return [...tareas];
    },
  };
}
