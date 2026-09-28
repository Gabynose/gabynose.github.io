// Aparición al entrar en pantalla. Mismo gesto que el nombre del hero: las palabras suben
// desde su máscara, línea por línea; los párrafos llegan después.
// Sin JS o con movimiento reducido, todo está visible desde el principio.
import { prefersReducedMotion } from '../dom.js';

function setDelays(block) {
  // Retraso por línea (según su posición vertical) y un poco por palabra.
  let lineTop = null;
  let line = -1;
  let inLine = 0;
  // Primero se leen todas las posiciones y recién después se escribe: mezclar lecturas y escrituras
  // fuerza un reflow por palabra (en PCs lentas, cientos de milisegundos).
  const words = [...block.querySelectorAll('.reveal-word')];
  const tops = words.map((word) => word.getBoundingClientRect().top); // posición real, aunque la palabra esté dentro de un resaltado
  words.forEach((word, index) => {
    const top = tops[index];
    if (lineTop === null || Math.abs(top - lineTop) > 4) {
      lineTop = top;
      line += 1;
      inLine = 0;
    }
    word.style.setProperty('--d', `${line * 110 + inLine * 25}ms`);
    inLine += 1;
  });

  // El barrido del resaltado arranca con la primera palabra de su línea.
  block.querySelectorAll('.highlight').forEach((highlight) => {
    const first = highlight.querySelector('.reveal-word');
    if (first) highlight.style.setProperty('--d', first.style.getPropertyValue('--d'));
  });

  const lines = line + 1;
  block.querySelectorAll('[data-reveal-item]').forEach((item, i) => {
    item.style.setProperty('--d', `${lines * 110 + 200 + i * 120}ms`);
  });
}

export function setupReveals() {
  if (prefersReducedMotion()) return;
  const blocks = document.querySelectorAll('[data-reveal]');
  if (!blocks.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        setDelays(entry.target);
        entry.target.classList.add('is-revealed');
        observer.unobserve(entry.target);
      }
    },
    { rootMargin: '0px 0px -20% 0px' },
  );

  blocks.forEach((block) => {
    block.classList.add('is-armed');
    observer.observe(block);
  });
}
