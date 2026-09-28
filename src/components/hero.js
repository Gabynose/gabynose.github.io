// Presentación: línea superior, nombre enorme, bajada y botón a la izquierda; cubo a la derecha.
import { el, icon } from '../dom.js';

// Detalles del apellido (imitan la referencia del usuario): rendijas oscuras del color del fondo en la "g" y la "a".
// La "g" lleva una cuña en la unión del cuenco con la tija; la "a", una línea fina bajo su ojo (ver hero.css).
const DETALLES = new Set(['g', 'a']);

function palabra(texto, conDetalles) {
  if (!conDetalles) return texto;
  return [...texto].map((letra) => {
    const clave = letra.toLowerCase();
    return DETALLES.has(clave) ? el('span', { class: `hero__cut hero__cut--${clave}`, text: letra }) : letra;
  });
}

export function renderHero(root, { hero }) {
  const name = el(
    'h1',
    { class: 'hero__name', id: 'inicio-titulo', 'aria-label': hero.titulo },
    hero.titulo.split(/[ ]+/).map((texto, index, todas) =>
      el(
        'span',
        { class: 'hero__line', 'aria-hidden': 'true' },
        el('span', { class: 'hero__word' }, palabra(texto, index === todas.length - 1)),
      ),
    ),
  );

  const eyebrow = el('p', { class: 'hero__eyebrow' }, [
    el('span', { class: 'hero__eyebrow-line', 'aria-hidden': 'true' }),
    hero.subtitulo,
  ]);

  const lead = el('p', { class: 'hero__lead', text: hero.descripcion });

  const actions = el('div', { class: 'hero__actions' }, [
    el('a', { class: 'btn-hero', href: hero.cta.href }, [hero.cta.label, icon('arrow-right', 'btn-hero__icon')]),
  ]);

  // Cubo Rubik 3D (Ref 2). Se monta de forma diferida desde cube/mount.js.
  const visual = el('div', { class: 'hero__visual', 'aria-hidden': 'true' }, el('div', { class: 'cube', 'data-cube': true }));

  root.replaceChildren(el('div', { class: 'hero' }, [el('div', { class: 'hero__text' }, [eyebrow, name, lead, actions]), visual]));
}
