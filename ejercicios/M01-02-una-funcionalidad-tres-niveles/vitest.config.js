// Vitest: solo las pruebas unitarias (*.test.js) de pruebas/.
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['pruebas/**/*.test.js'],
    reporters: ['verbose'],   // una línea por prueba
  },
});
