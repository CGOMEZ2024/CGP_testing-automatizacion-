// Vitest: solo las pruebas de pruebas/, nunca las de solucion/.
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['pruebas/**/*.test.js'],
    reporters: ['verbose'],   // una línea por prueba
  },
});
