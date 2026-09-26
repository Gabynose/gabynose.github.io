// Vuelca content.js al DOM: cada contenedor [data-render] lo pinta su componente.

import { renderNav } from './components/nav.js';
import { renderHero } from './components/hero.js';
import { renderProblema } from './components/problema.js';
import { renderProyectos } from './components/proyectos.js';
import { renderContacto } from './components/contacto.js';

const renderers = {
  nav: renderNav,
  hero: renderHero,
  problema: renderProblema,
  proyectos: renderProyectos,
  contacto: renderContacto,
};

export function render(content) {
  document.title = content.meta.titulo;
  document.querySelector('meta[name="description"]')?.setAttribute('content', content.meta.descripcion);

  for (const root of document.querySelectorAll('[data-render]')) {
    renderers[root.dataset.render]?.(root, content);
  }
}
