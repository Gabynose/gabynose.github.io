// Presentación: nombre enorme a la izquierda, rol + estado "Disponible", hueco del cubo a la derecha.
import { el } from '../dom.js';

export function renderHero(root, { hero, identidad }) {
  const { disponible } = identidad;

  const name = el(
    'h1',
    { class: 'hero__name', id: 'inicio-titulo', 'aria-label': hero.titulo },
    hero.titulo.split(/\s+/).map((word) =>
      el('span', { class: 'hero__line', 'aria-hidden': 'true' }, el('span', { class: 'hero__word', text: word })),
    ),
  );

  const meta = el('div', { class: 'hero__meta' }, [
    el('p', { class: 'hero__role', text: hero.subtitulo }),
    disponible.activo
      ? el('p', { class: 'status' }, [el('span', { class: 'status__dot', 'aria-hidden': 'true' }), disponible.texto])
      : null,
  ]);

  // Cubo Rubik 3D (Ref 2). Se monta de forma diferida desde cube/mount.js.
  const visual = el('div', { class: 'hero__visual', 'aria-hidden': 'true' }, el('div', { class: 'cube', 'data-cube': true }));

  root.replaceChildren(el('div', { class: 'hero' }, [el('div', { class: 'hero__text' }, [name, meta]), visual]));
}
