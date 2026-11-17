// Vitest de M05-05: pruebas unitarias en tests/ (las de Playwright están en e2e/)
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['tests/**/*.test.js'],
    coverage: { provider: 'v8', include: ['src/**/*.js'], reporter: ['text'] },
  },
});
