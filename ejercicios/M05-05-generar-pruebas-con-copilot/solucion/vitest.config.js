// Vitest de la solución: npx vitest run --config solucion/vitest.config.js
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: { include: ['solucion/tests/**/*.test.js'] },
});
