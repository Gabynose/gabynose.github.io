// Expositor de proyectos + vista de detalle (Ref 4: refined.framer.website).
// La vista de detalle se abre por encima del expositor. La cabecera del detalle
// "vuela" desde la tarjeta hasta su lugar, con su animación ya encendida.
import { el, icon, prefersReducedMotion, revealWords } from '../dom.js';
import { lockScroll } from '../motion/scroll.js';
import { driftGrid } from '../motion/grid.js';
import { logoBox, setBoxActive, setBoxInView } from '../projects/logo-box.js';
import { seedFire } from '../projects/fire.js';

const EASE_OUT = 'cubic-bezier(0.19, 1, 0.22, 1)';

function image({ src, alt }, className, eager = false) {
  return el('img', {
    class: className,
    src,
    alt,
    width: 1200,
    height: 900,
    loading: eager ? 'eager' : 'lazy',
    decoding: 'async',
  });
}

// Botón píldora con texto que rueda (mismo gesto que la nav).
function pillButton(label, iconName, className) {
  return el('button', { class: `btn-pill ${className}`, type: 'button' }, [
    el('span', { class: 'btn-pill__circle' }, icon(iconName, 'btn-pill__icon')),
    el('span', { class: 'btn-pill__text' }, [el('span', { text: label }), el('span', { 'aria-hidden': 'true', text: label })]),
  ]);
}

function renderCard(project) {
  const box = logoBox(project);
  const media = el('div', { class: 'project__media' }, [
    box,
    el('span', { class: 'project__cue btn-pill__circle', 'aria-hidden': 'true' }, icon('arrow-up-right', 'btn-pill__icon')),
  ]);
  // El borde de la tarjeta también se tiñe con la luz de la marca.
  for (const [name, value] of Object.entries(project.luz)) media.style.setProperty(name, value);

  const card = el('li', { class: 'project', 'data-reveal-item': true, 'data-project': project.id }, [
    media,
    el(
      'h3',
      { class: 'project__title' },
      el('button', { class: 'project__open', type: 'button', 'aria-haspopup': 'dialog', 'data-open': project.id }, project.titulo),
    ),
    el('p', { class: 'project__desc', text: project.descripcion }),
  ]);

  // Interacción A: con mouse o teclado. En pantallas táctiles no hay hover.
  card.addEventListener('pointerenter', (event) => {
    if (event.pointerType !== 'touch') setBoxActive(box, true);
  });
  card.addEventListener('pointerleave', () => setBoxActive(box, card.querySelector(':focus-visible') !== null));
  card.addEventListener('focusin', (event) => {
    if (event.target.matches(':focus-visible')) setBoxActive(box, true);
  });
  card.addEventListener('focusout', (event) => {
    if (!card.contains(event.relatedTarget) && !card.matches(':hover')) setBoxActive(box, false);
  });
  return card;
}

export function renderProyectos(root, { proyectos }) {
  // Sin proyectos, la sección no se muestra.
  root.hidden = proyectos.lista.length === 0;
  root.replaceChildren(
    el('div', { class: 'proyectos', 'data-reveal': true }, [
      el('h2', { class: 'proyectos__title', id: 'proyectos-titulo' }, revealWords(proyectos.titulo)),
      el(
        'ul',
        { class: 'projects', role: 'list' },
        proyectos.lista.map((p) => renderCard(p)),
      ),
    ]),
  );
}

// ---------- Vista de detalle ----------

// Cabecera del detalle: la caja del proyecto, con el borde teñido de marca (siempre encendida).
function hero(project, cardBox) {
  const figure = el('figure', { class: 'detail__hero' }, logoBox(project, { eager: true, like: cardBox }));
  for (const [name, value] of Object.entries(project.luz)) figure.style.setProperty(name, value);
  return figure;
}

function renderDetail(dialog, project, labels, cardBox) {
  const block = (label, text) =>
    el('section', { class: 'detail__block' }, [
      el('h3', { class: 'detail__label', text: label }),
      el('p', { class: 'detail__text', text }),
    ]);

  dialog.replaceChildren(
    el('div', { class: 'bg-grid', 'aria-hidden': 'true' }),
    el('div', { class: 'detail__bar' }, pillButton(labels.cerrar, 'arrow-left', 'btn-pill--back detail__close')),
    el('article', { class: 'detail__body' }, [
      hero(project, cardBox),
      el('header', { class: 'detail__head', 'data-detail-fade': true }, [
        el('h2', { class: 'detail__title', id: 'detail-title', text: project.titulo }),
        el('p', { class: 'detail__lead', text: project.descripcion }),
      ]),
      el('div', { class: 'detail__blocks', 'data-detail-fade': true }, [
        block(labels.problema, project.problema),
        block(labels.solucion, project.solucion),
      ]),
      // Sin imágenes cargadas, el bloque no existe (no se muestran placeholders).
      project.galeria.length
        ? el(
            'div',
            { class: 'detail__gallery', 'data-detail-fade': true },
            project.galeria.map((img) => el('figure', {}, image(img, 'detail__img'))),
          )
        : null,
      el('div', { class: 'detail__foot' }, pillButton(labels.cerrar, 'arrow-left', 'btn-pill--back detail__close')),
    ]),
  );
}

// La cabecera real del detalle vuela desde la tarjeta hasta su lugar (técnica FLIP).
// Al ser la caja real, ya encendida, su animación nunca se detiene durante el viaje.
function fly(figure, fromRect, duration) {
  const toRect = figure.getBoundingClientRect();
  const scale = fromRect.width / toRect.width;
  const dx = fromRect.left - toRect.left;
  const dy = fromRect.top - toRect.top;
  return figure.animate([{ transform: `translate(${dx}px, ${dy}px) scale(${scale})` }, { transform: 'none' }], {
    duration,
    easing: EASE_OUT,
  }).finished;
}

// La caja del detalle retoma los ciclos donde estaba la de la tarjeta: respiración y cometa sin saltos.
const SYNCED = ['.logo-box__halo', '.logo-box__light', '.logo-box__comet--head', '.logo-box__comet--tail'];
function syncCycles(fromBox, toBox) {
  for (const selector of SYNCED) {
    const from = fromBox.querySelector(selector)?.getAnimations().find((a) => a instanceof CSSAnimation);
    const to = toBox.querySelector(selector)?.getAnimations().find((a) => a instanceof CSSAnimation);
    if (from && to && from.currentTime != null) to.currentTime = from.currentTime;
  }
}

// Si la tarjeta ya estaba encendida (hover o foco), la caja del detalle arranca encendida, sin rampa.
function skipTransitions(box) {
  box
    .getAnimations({ subtree: true })
    .filter((a) => a instanceof CSSTransition)
    .forEach((a) => a.finish());
}

export function setupProyectos({ proyectos }) {
  const grid = document.querySelector('.projects');
  if (!grid) return;

  const dialog = el('dialog', { class: 'detail', 'aria-labelledby': 'detail-title', 'data-lenis-prevent': true });
  document.body.append(dialog);

  let current = null; // { project, card, trigger }
  let state = 'closed'; // closed | opening | open | closing
  let footObserver = null;
  let heroObserver = null;

  // Con el detalle ya abierto, la vista general se oculta: nunca se ven las dos mezcladas.
  const hidePage = (hidden) => document.documentElement.classList.toggle('is-detail-open', hidden);

  // Al llegar al final, el botón de abajo queda y el de arriba se desvanece.
  function watchFooter() {
    const bar = dialog.querySelector('.detail__bar');
    const foot = dialog.querySelector('.detail__foot');
    footObserver = new IntersectionObserver(
      ([entry]) => {
        const hide = entry.isIntersecting;
        // Si el foco estaba en el botón que se oculta, pasa al que queda visible.
        if (hide && bar.contains(document.activeElement)) foot.querySelector('button')?.focus({ preventScroll: true });
        bar.classList.toggle('is-hidden', hide);
      },
      { root: dialog, threshold: 0.6 },
    );
    footObserver.observe(foot);
  }

  async function open(id, trigger) {
    if (state !== 'closed') return;
    const project = proyectos.lista.find((p) => p.id === id);
    const card = grid.querySelector(`[data-project="${id}"]`);
    if (!project || !card) return;
    state = 'opening';
    current = { project, card, trigger };
    const cardBox = card.querySelector('.logo-box');
    const cardWasActive = cardBox.classList.contains('is-active');
    const from = cardBox.getBoundingClientRect();
    // Ninguna animación de un cierre anterior puede seguir aplicada (p. ej. el fondo transparente).
    dialog.getAnimations({ subtree: true }).forEach((animation) => animation.cancel());

    renderDetail(dialog, project, proyectos.etiquetas, cardBox);
    driftGrid(dialog.querySelector('.bg-grid'));
    lockScroll(true);
    dialog.showModal();
    dialog.scrollTop = 0;
    dialog.querySelector('.detail__close')?.focus({ preventScroll: true });
    watchFooter();

    // En el detalle, la caja principal queda con la Interacción A encendida todo el tiempo.
    // Se enciende ya, antes del vuelo: la animación sigue viva durante toda la transición.
    const figure = dialog.querySelector('.detail__hero');
    const heroBox = figure.querySelector('.logo-box');
    seedFire(cardBox, heroBox);
    setBoxActive(heroBox, true);
    heroObserver = new IntersectionObserver(([entry]) => setBoxInView(heroBox, entry.isIntersecting), {
      root: dialog,
    });
    heroObserver.observe(figure);
    if (cardWasActive) skipTransitions(heroBox);
    syncCycles(cardBox, heroBox);
    setBoxActive(cardBox, false);

    const settle = () => {
      state = 'open';
      hidePage(true);
      cardBox.style.visibility = '';
    };

    if (prefersReducedMotion()) return settle();

    dialog.animate([{ backgroundColor: 'rgb(5 5 5 / 0)' }, { backgroundColor: 'rgb(5 5 5 / 1)' }], {
      duration: 700,
      easing: EASE_OUT,
    });
    dialog.querySelectorAll('.detail__bar, [data-detail-fade]').forEach((node, i) =>
      node.animate([{ opacity: 0, transform: 'translateY(28px)' }, { opacity: 1, transform: 'none' }], {
        duration: 1000,
        delay: 320 + i * 90,
        easing: EASE_OUT,
        fill: 'backwards',
      }),
    );

    cardBox.style.visibility = 'hidden'; // su gemela vuela desde este lugar
    try {
      await fly(figure, from, 950);
      settle();
    } catch {
      // "Volver" se pulsó antes de terminar la apertura: el cierre ya limpió todo.
    }
  }

  // Cierre rápido: todo el detalle (imagen incluida) se desvanece a la vez.
  // Funciona en cualquier momento, también si la apertura sigue en curso.
  async function close() {
    if (!current || state === 'closing' || state === 'closed') return;
    state = 'closing';
    const { card, trigger } = current;
    hidePage(false); // la vista general reaparece detrás mientras el detalle se desvanece

    // Corta la apertura si seguía animándose. La cuadrícula y las animaciones CSS de la caja
    // (respiración, cometa) siguen hasta que termina el fundido.
    dialog
      .getAnimations({ subtree: true })
      .filter(
        (animation) =>
          !(animation instanceof CSSAnimation || animation instanceof CSSTransition) &&
          !animation.effect?.target?.classList.contains('bg-grid'),
      )
      .forEach((animation) => animation.cancel());
    card.querySelector('.logo-box').style.visibility = '';

    const finish = () => {
      dialog.close();
      cleanup();
      trigger?.focus({ preventScroll: true });
    };

    if (prefersReducedMotion()) return finish();

    for (const node of dialog.children) {
      // La cuadrícula solo se desvanece: su desplazamiento lo lleva su propia animación.
      const frames = node.classList.contains('bg-grid')
        ? [{ opacity: 1 }, { opacity: 0 }]
        : [{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'translateY(12px)' }];
      node.animate(frames, { duration: 260, easing: 'cubic-bezier(0.4, 0, 1, 1)', fill: 'forwards' });
    }
    const fade = dialog.animate([{ backgroundColor: 'rgb(5 5 5 / 1)' }, { backgroundColor: 'rgb(5 5 5 / 0)' }], {
      duration: 360,
      easing: 'ease-out',
      fill: 'forwards',
    });
    await fade.finished.catch(() => {});
    finish();
  }

  grid.addEventListener('click', (event) => {
    const button = event.target.closest('[data-open]');
    if (button) open(button.dataset.open, button);
  });

  dialog.addEventListener('click', (event) => {
    if (event.target.closest('.detail__close')) close();
  });

  // Limpieza común. Se llama al cerrar y también si el navegador cierra el diálogo por su cuenta.
  function cleanup() {
    if (state === 'closed') return;
    footObserver?.disconnect();
    heroObserver?.disconnect();
    heroObserver = null;
    footObserver = null;
    // Apaga la caja del detalle antes de quitarla: si no, sus chispas seguirían generándose.
    const heroBox = dialog.querySelector('.detail__hero .logo-box');
    if (heroBox) setBoxActive(heroBox, false);
    dialog.getAnimations({ subtree: true }).forEach((animation) => animation.cancel());
    dialog.replaceChildren();
    hidePage(false);
    lockScroll(false);
    if (current?.card) current.card.querySelector('.logo-box').style.visibility = '';
    current = null;
    state = 'closed';
  }
  // El evento 'close' llega asíncrono: si el detalle ya se volvió a abrir, es de un cierre viejo y se ignora.
  dialog.addEventListener('close', () => {
    if (!dialog.open) cleanup();
  });

  // Escape: cierre animado en lugar del cierre seco del navegador.
  dialog.addEventListener('cancel', (event) => {
    event.preventDefault();
    close();
  });
}
