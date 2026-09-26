// Cuadrícula de fondo en movimiento constante (diagonal, lenta).
// Desplaza la capa exactamente una celda y vuelve a empezar: el bucle no se nota.
// Todas las cuadrículas (página y vista de detalle) comparten el mismo reloj, así coinciden.
import { prefersReducedMotion } from '../dom.js';

const SECONDS_PER_CELL = 9;
const animations = new Map();

function animate(grid) {
  animations.get(grid)?.cancel();
  if (prefersReducedMotion()) return; // movimiento reducido: cuadrícula quieta

  const cell = parseFloat(getComputedStyle(grid).backgroundSize) || 0;
  if (!cell) return;
  const animation = grid.animate(
    [{ transform: 'translate3d(0, 0, 0)' }, { transform: `translate3d(${cell}px, ${cell}px, 0)` }],
    { duration: SECONDS_PER_CELL * 1000, iterations: Infinity, easing: 'linear' },
  );
  animation.startTime = 0; // reloj común del documento
  animations.set(grid, animation);
}

export function driftGrid(grid) {
  if (grid) animate(grid);
}

export function setupGrid() {
  document.querySelectorAll('.bg-grid').forEach(animate);

  // El tamaño de celda depende del ancho: se recalcula al redimensionar.
  let timer;
  window.addEventListener('resize', () => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      for (const grid of [...animations.keys()]) {
        if (grid.isConnected) animate(grid);
        else animations.delete(grid);
      }
    }, 200);
  });

  window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', () => {
    document.querySelectorAll('.bg-grid').forEach(animate);
  });
}
