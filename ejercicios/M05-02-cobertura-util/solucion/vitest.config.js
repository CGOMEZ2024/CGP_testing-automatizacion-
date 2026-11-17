// Vitest de la solución: se lanza desde la carpeta del ejercicio con
//   npx vitest run --config solucion/vitest.config.js --coverage
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['solucion/tests/**/*.test.js', 'tests/pedido.test.js'],
    coverage: {
      provider: 'v8',
      include: ['src/**/*.js'],
      reporter: ['text', 'html'],
    },
  },
});
