// Arranca la API de tareas para probarla a mano: node app/server.mjs (puerto PORT, 3104 por defecto).
import { crearServidor } from './servidor.js';
import { crearAlmacen } from './almacen.js';

const PORT = Number(process.env.PORT ?? 3104);
crearServidor(crearAlmacen()).listen(PORT, () => console.log(`API de tareas: http://localhost:${PORT}/api/tareas`));
