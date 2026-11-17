// Vitest de M05-02: pruebas en tests/ y cobertura (v8) solo del código de src/
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['tests/**/*.test.js'],
    coverage: {
      provider: 'v8',
      include: ['src/**/*.js'],
      reporter: ['text', 'html'],   // tabla en el terminal e informe en coverage/index.html
    },
  },
});
