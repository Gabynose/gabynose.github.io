// Scroll suave (Lenis). Se desactiva si el usuario pide movimiento reducido.
import Lenis from 'lenis';
import { isLite, onLite } from '../perf.js';

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const ANCHOR_SCROLL = { duration: 1.4, easing: (t) => 1 - Math.pow(1 - t, 4) };

let lenis = null;

function setupLenis() {
  // En PCs lentas el scroll nativo no depende del hilo principal: no se traba aunque la página esté ocupada.
  if (reduceMotion.matches || isLite()) {
    lenis?.destroy();
    lenis = null;
    return;
  }
  if (lenis) return;
  // Movimiento reducido ya se gestiona arriba: Lenis solo existe cuando está permitido.
  lenis = new Lenis({ autoRaf: true, lerp: 0.08, respectReducedMotion: false });
}

// Bloquea / libera el scroll de la página (p. ej. con la vista de detalle abierta).
export function lockScroll(locked) {
  document.documentElement.classList.toggle('is-scroll-locked', locked);
  if (locked) lenis?.stop();
  else lenis?.start();
}

export function setupScroll() {
  // Enlaces internos (#seccion): recorrido suave en vez del salto nativo.
  document.addEventListener('click', (event) => {
    const link = event.target.closest('a[href^="#"]');
    if (!link || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey) return;
    const target = document.querySelector(link.getAttribute('href'));
    if (!target) return;

    event.preventDefault();
    if (lenis) lenis.scrollTo(target, ANCHOR_SCROLL);
    else target.scrollIntoView();
    history.replaceState(null, '', link.getAttribute('href'));
    target.focus({ preventScroll: true });
  });

  setupLenis();
  reduceMotion.addEventListener('change', setupLenis);
  onLite(setupLenis); // si la PC resulta lenta durante la visita, se pasa al scroll nativo
}
