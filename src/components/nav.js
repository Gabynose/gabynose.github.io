// Nav píldora (Ref 1: dialedweb .navigation-inside).
// Escritorio: logo | enlaces centrados | botón destacado. Mobile (<720px): logo | botón de menú.
import { el, icon, prefersReducedMotion } from '../dom.js';

const EASE_OUT = 'cubic-bezier(0.19, 1, 0.22, 1)';
const MOBILE_QUERY = window.matchMedia('(max-width: 719px)');

function initials(name) {
  return name
    .split(/\s+/)
    .map((word) => word[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function linkContent(item) {
  return [el('span', { class: 'nav__label', text: item.label })];
}

function renderLogo({ identidad, nav }) {
  const mark = identidad.logo
    ? el('img', { src: identidad.logo, alt: '', width: 32, height: 32 })
    : el('span', { class: 'nav__monogram', text: initials(identidad.nombre) });
  // El nombre accesible incluye lo que se ve ("GB") y lo explica: "GB, Gabriel Boggia, volver al inicio".
  return el('a', { class: 'nav__logo', href: '#inicio' }, [
    mark,
    el('span', { class: 'visually-hidden', text: identidad.logo ? nav.logoLabel : `, ${nav.logoLabel}` }),
  ]);
}

function renderCta(item) {
  return el('a', { class: 'nav__cta btn-pill', href: item.href, 'data-section': item.href.slice(1) }, [
    el('span', { class: 'btn-pill__text' }, [
      el('span', {}, linkContent(item)),
      el('span', { 'aria-hidden': 'true' }, linkContent(item)),
    ]),
    el('span', { class: 'btn-pill__circle' }, icon('arrow-up-right', 'btn-pill__icon')),
  ]);
}

export function renderNav(root, content) {
  const { items, menu } = content.nav;
  const main = items.filter((item) => !item.destacado);
  const cta = items.find((item) => item.destacado);

  const links = el(
    'ul',
    { class: 'nav__links', role: 'list' },
    main.map((item) =>
      el('li', {}, el('a', { class: 'nav__link', href: item.href, 'data-section': item.href.slice(1) }, linkContent(item))),
    ),
  );

  const toggle = el(
    'button',
    { class: 'nav__toggle', type: 'button', 'aria-expanded': 'false', 'aria-controls': 'nav-menu', 'aria-label': menu.abrir },
    el('span', { class: 'nav__bars', 'aria-hidden': 'true' }, [el('span'), el('span')]),
  );

  const panel = el(
    'div',
    { class: 'nav__menu', id: 'nav-menu', hidden: true },
    el(
      'ul',
      { role: 'list' },
      items.map((item) =>
        el('li', {}, el('a', { class: 'nav__menu-link', href: item.href, 'data-section': item.href.slice(1) }, linkContent(item))),
      ),
    ),
  );

  root.replaceChildren(el('div', { class: 'nav__pill' }, [renderLogo(content), links, cta ? renderCta(cta) : null, toggle]), panel);

  setupMenu(root, toggle, panel, menu);
  setupActiveSection(root);
}

function setupMenu(root, toggle, panel, labels) {
  let open = false;

  const animatePanel = (opening) => {
    if (prefersReducedMotion()) return Promise.resolve();
    const frames = [
      { opacity: 0, transform: 'translateY(-8px)', clipPath: 'inset(0 0 100% 0 round 24px)' },
      { opacity: 1, transform: 'none', clipPath: 'inset(0 0 0 0 round 24px)' },
    ];
    return panel.animate(opening ? frames : frames.reverse(), { duration: opening ? 600 : 380, easing: EASE_OUT })
      .finished;
  };

  const setOpen = async (next, { focusToggle = false } = {}) => {
    if (next === open) return;
    open = next;
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? labels.cerrar : labels.abrir);
    root.classList.toggle('is-open', open);
    if (open) {
      panel.hidden = false;
      panel.querySelector('a')?.focus({ preventScroll: true });
      await animatePanel(true);
    } else {
      await animatePanel(false);
      if (!open) panel.hidden = true;
      if (focusToggle) toggle.focus({ preventScroll: true });
    }
  };

  toggle.addEventListener('click', () => setOpen(!open));
  panel.addEventListener('click', (event) => {
    if (event.target.closest('a')) setOpen(false);
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && open) setOpen(false, { focusToggle: true });
  });
  document.addEventListener('click', (event) => {
    if (open && !root.contains(event.target)) setOpen(false);
  });
  MOBILE_QUERY.addEventListener('change', (event) => {
    if (!event.matches) setOpen(false);
  });
}

// Marca el enlace de la sección visible (aria-current="location").
function setupActiveSection(root) {
  const links = [...root.querySelectorAll('[data-section]')];
  const sections = [...new Set(links.map((link) => link.dataset.section))]
    .map((id) => document.getElementById(id))
    .filter(Boolean);

  const setCurrent = (id) => {
    for (const link of links) {
      if (link.dataset.section === id) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    }
  };

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) setCurrent(entry.target.id);
      }
    },
    { rootMargin: '-45% 0px -50% 0px' },
  );
  sections.forEach((section) => observer.observe(section));
}
