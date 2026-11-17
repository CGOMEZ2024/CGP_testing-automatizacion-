// Vitest de M05-04: solo las pruebas de tests/ (la solución tiene su propia configuración)
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: { include: ['tests/**/*.test.js'] },
});
