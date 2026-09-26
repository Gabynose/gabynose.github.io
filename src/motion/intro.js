// Entrada de la página: un solo momento orquestado (hero + nav).
// El contenido es visible por defecto; si hay movimiento reducido no se anima nada.
import { prefersReducedMotion } from '../dom.js';

const EASE_OUT = 'cubic-bezier(0.19, 1, 0.22, 1)';
const POWER1_OUT = 'cubic-bezier(0.25, 0.46, 0.45, 0.94)';

export function playIntro() {
  if (prefersReducedMotion()) return;

  const opts = (delay, duration, easing = EASE_OUT) => ({ delay, duration, easing, fill: 'backwards' });

  // Nombre: cada línea sube desde su máscara.
  document.querySelectorAll('.hero__word').forEach((word, i) => {
    word.animate([{ transform: 'translateY(105%)' }, { transform: 'none' }], opts(150 + i * 90, 1300));
  });

  document.querySelectorAll('.hero__meta > *').forEach((node, i) => {
    node.animate(
      [{ opacity: 0, transform: 'translateY(14px)' }, { opacity: 1, transform: 'none' }],
      opts(400 + i * 110, 1100),
    );
  });

  // Nav (Ref 1): la píldora cae y escala, luego se estira a lo ancho y aparecen los enlaces.
  const pill = document.querySelector('.nav__pill');
  if (!pill) return;
  const narrow = window.matchMedia('(max-width: 719px)').matches ? '37.5%' : '25%';

  pill.animate(
    [{ opacity: 0, transform: 'translateY(-15vh) scale(0.6)' }, { opacity: 1, transform: 'none' }],
    opts(300, 750, POWER1_OUT),
  );
  pill.animate([{ width: narrow }, { width: '100%' }], opts(1050, 800));

  // Con la píldora ya estirada, todo su contenido aparece con el mismo fundido, de izquierda a derecha:
  // logo, enlaces y botón de contacto (en mobile, el botón de menú).
  const items = [
    ...pill.querySelectorAll('.nav__logo, .nav__links li, .nav__cta, .nav__toggle'),
  ].filter((node) => node.getClientRects().length); // solo lo visible en este tamaño
  items.forEach((item, i) => {
    item.animate([{ opacity: 0 }, { opacity: 1 }], opts(1550 + i * 100, 1000, 'ease-out'));
  });
}
