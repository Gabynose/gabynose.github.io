// Sección "Tu problema": frase grande, nube de cruces y cuatro párrafos (Ref 3).
import { el, revealWords } from '../dom.js';

export function renderProblema(root, { problema }) {
  root.replaceChildren(
    el('div', { class: 'problema', 'data-reveal': true }, [
      el('h2', { class: 'problema__title', id: 'problema-titulo' }, revealWords(problema.titulo)),
      el('div', { class: 'problema__visual', 'data-crosses': true, 'data-reveal-item': true }),
      el(
        'div',
        { class: 'problema__text' },
        problema.parrafos.map((lineas) =>
          el(
            'p',
            { class: 'problema__paragraph', 'data-reveal-item': true },
            [].concat(lineas).flatMap((linea, i) => (i ? [el('br'), linea] : [linea])),
          ),
        ),
      ),
    ]),
  );
}
