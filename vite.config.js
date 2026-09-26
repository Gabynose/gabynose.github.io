import { defineConfig } from 'vite';
import { checkProyectos } from './vite-plugin-proyectos.js';

export default defineConfig({
  plugins: [checkProyectos()],
  // El Worker del cubo es un módulo ES (importa three).
  worker: { format: 'es' },
  build: {
    // El chunk del cubo (Three.js, ~140 KB gzip) se carga diferido; no bloquea la carga inicial.
    chunkSizeWarningLimit: 600,
  },
});
