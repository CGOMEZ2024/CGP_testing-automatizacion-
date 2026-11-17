// Solución del lab M04-03 (Mejora): configuración de Allure 3.
// Cópiala a la carpeta del ejercicio (allurerc.mjs): Allure la lee del directorio desde el que lo ejecutas.
import { defineConfig } from 'allure';

export default defineConfig({
  name: 'Calculadora de propinas',
  output: './allure-report',
  // Cada generación añade una línea a este fichero: así el reporte tiene historial entre ejecuciones
  historyPath: './allure-history.jsonl',
  // Clasifica los fallos por el mensaje de error, no solo por el estado
  categories: [
    { name: 'Resultado incorrecto (posible error de la app)', matchers: { message: /toHaveText/ } },
    { name: 'Elemento no encontrado (revisar la prueba)', matchers: { message: /Timeout \d+ms exceeded/ } },
  ],
});
