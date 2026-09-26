// Caja del proyecto: fondo oscuro + luz de marca + logo.
// La misma caja se usa en la tarjeta y en la cabecera del detalle.
import { el, prefersReducedMotion } from '../dom.js';
import { createSparks, drawFire, seedFrom } from './fire.js';
import { logoInLogosDir } from './paths.js';

const SVG_NS = 'http://www.w3.org/2000/svg';

// Tamaño máximo del logo dentro de la caja 4:3, en % (ancho, alto).
const LOGO_MAX_W = 56;
const LOGO_MAX_H = 44;
const BOX_RATIO = 3 / 4;

// Tamaño real que ocupa el logo, en % de la caja. La luz se dimensiona con esto.
function logoFootprint(contentWidth, contentHeight) {
  const aspect = contentWidth / contentHeight;
  const widthAtMaxHeight = aspect * LOGO_MAX_H * BOX_RATIO;
  if (widthAtMaxHeight <= LOGO_MAX_W) return { w: widthAtMaxHeight, h: LOGO_MAX_H };
  return { w: LOGO_MAX_W, h: LOGO_MAX_W / (aspect * BOX_RATIO) };
}

// Dónde está el dibujo dentro del PNG: así un logo con margen transparente
// se ve igual que uno recortado al borde. Se mide sobre una copia chica (barato).
const SAMPLE = 256;
function contentBounds(img) {
  const W = img.naturalWidth;
  const H = img.naturalHeight;
  const full = { x: 0, y: 0, w: W, h: H };
  const s = Math.min(1, SAMPLE / Math.max(W, H));
  const w = Math.max(1, Math.round(W * s));
  const h = Math.max(1, Math.round(H * s));
  try {
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    ctx.drawImage(img, 0, 0, w, h);
    const data = ctx.getImageData(0, 0, w, h).data;
    let x0 = w;
    let y0 = h;
    let x1 = -1;
    let y1 = -1;
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        if (data[(y * w + x) * 4 + 3] <= 12) continue;
        if (x < x0) x0 = x;
        if (x > x1) x1 = x;
        if (y < y0) y0 = y;
        if (y > y1) y1 = y;
      }
    }
    if (x1 < 0) return full;
    // De la copia chica a píxeles reales, con un píxel de holgura.
    const x = Math.max(0, (x0 - 1) / s);
    const y = Math.max(0, (y0 - 1) / s);
    return { x, y, w: Math.min(W, (x1 + 2) / s) - x, h: Math.min(H, (y1 + 2) / s) - y };
  } catch {
    return full; // imagen de otro dominio sin permiso de lectura: se usa entera
  }
}

// Variables CSS del recorte: la imagen se agranda y desplaza para que el dibujo llene el marco del logo.
const pct = (value) => `${value.toFixed(3)}%`;
function cropVars(img, bounds) {
  const W = img.naturalWidth;
  const H = img.naturalHeight;
  const footprint = logoFootprint(bounds.w, bounds.h);
  return {
    footprint,
    vars: {
      '--logo-w': pct(footprint.w),
      '--logo-h': pct(footprint.h),
      '--crop-w': pct((W / bounds.w) * 100),
      '--crop-h': pct((H / bounds.h) * 100),
      '--crop-x': pct((-bounds.x / bounds.w) * 100),
      '--crop-y': pct((-bounds.y / bounds.h) * 100),
      // mask-position en %: desplazamiento / (marco - imagen); sin margen, 0.
      '--mask-x': pct(W === bounds.w ? 0 : (bounds.x / (W - bounds.w)) * 100),
      '--mask-y': pct(H === bounds.h ? 0 : (bounds.y / (H - bounds.h)) * 100),
    },
  };
}
const MEASURE_VARS = ['--logo-w', '--logo-h', '--crop-w', '--crop-h', '--crop-x', '--crop-y', '--mask-x', '--mask-y'];

// Lugar que ocupa el nombre del proyecto cuando falta el logo (la luz se dimensiona igual).
const MISSING_FOOTPRINT = { w: 50, h: 16 };

function warnLogo(project, message) {
  if (import.meta.env.DEV) console.warn(`[proyectos] "${project.titulo}": el logo ${message}`);
}

function ellipse(className, extra = {}) {
  const node = document.createElementNS(SVG_NS, 'ellipse');
  for (const [name, value] of Object.entries({
    class: className,
    cx: 200,
    cy: 100,
    rx: 196,
    ry: 54,
    transform: 'rotate(-21 200 100)',
    'vector-effect': 'non-scaling-stroke',
    ...extra,
  })) {
    node.setAttribute(name, value);
  }
  return node;
}

// Ref 1: órbita fina e inclinada que pasa por detrás del logo.
// El cometa (cola + cabeza) la recorre en la Interacción A.
function orbit() {
  const svg = document.createElementNS(SVG_NS, 'svg');
  svg.setAttribute('class', 'logo-box__orbit');
  // Alto suficiente para la elipse ya girada: la máscara CSS recorta lo que sale de la caja del SVG.
  svg.setAttribute('viewBox', '0 0 400 200');
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('focusable', 'false');
  svg.append(
    ellipse('logo-box__ring'),
    // Sin non-scaling-stroke: con él, los guiones se miden en pantalla y pathLength deja de valer.
    ellipse('logo-box__comet logo-box__comet--tail', { pathLength: 100, 'vector-effect': 'none' }),
    ellipse('logo-box__comet logo-box__comet--head', { pathLength: 100, 'vector-effect': 'none' }),
  );
  return el('span', { class: 'logo-box__orbit-wrap', 'aria-hidden': 'true' }, [
    el('span', { class: 'logo-box__streak' }),
    svg,
  ]);
}

const whenIdle = (task) =>
  'requestIdleCallback' in window ? requestIdleCallback(task, { timeout: 250 }) : setTimeout(task, 50);

// Ref 2: el fuego se dibuja en tiempo libre y se redibuja si la caja cambia de tamaño.
function mountFire(box, canvas, footprint, seed) {
  let drawn = '';
  let pending = false;
  const render = () => {
    pending = false;
    const width = box.clientWidth;
    const height = box.clientHeight;
    const key = `${width}x${height}`;
    if (!width || !height || key === drawn) return;
    drawn = key;
    drawFire(canvas, {
      width,
      height,
      logoRect: { w: (width * footprint.w) / 100, h: (height * footprint.h) / 100 },
      style: box.style,
      seed,
    });
  };
  new ResizeObserver(() => {
    if (pending) return;
    pending = true;
    whenIdle(render);
  }).observe(box);
}

// Chispas de cada caja con fuego, y si la caja está a la vista.
const sparksByBox = new WeakMap();

function updateSparks(box) {
  const entry = sparksByBox.get(box);
  if (!entry) return;
  const run =
    entry.inView && box.classList.contains('is-active') && box.classList.contains('is-lit') && !prefersReducedMotion();
  if (run) entry.sparks.start();
  else entry.sparks.stop();
}

// Interacción A: enciende o apaga el estado activo (hover o foco) de una caja.
export function setBoxActive(box, active) {
  if (box.classList.contains('is-active') === active) return;
  box.classList.toggle('is-active', active);
  updateSparks(box);
}

// Fuera de pantalla las chispas no se calculan; al volver, retoman. No cambia nada visible.
export function setBoxInView(box, inView) {
  const entry = sparksByBox.get(box);
  if (!entry || entry.inView === inView) return;
  entry.inView = inView;
  updateSparks(box);
}

// `like`: otra caja del mismo proyecto ya medida (la tarjeta). Si se pasa, esta nace
// encendida con sus medidas, sin esperar a que cargue la imagen ni fundirse desde negro.
export function logoBox(project, { eager = false, like = null } = {}) {
  const hasFire = project.efecto === 'fuego';
  const fire = hasFire ? el('canvas', { class: 'logo-box__fire', 'aria-hidden': 'true' }) : null;
  const sparks = hasFire ? el('canvas', { class: 'logo-box__sparks', 'aria-hidden': 'true' }) : null;
  const img = el('img', {
    src: project.logo.src,
    alt: project.logo.alt,
    loading: eager ? 'eager' : 'lazy',
    decoding: 'async',
  });
  // Marco del logo: tiene la proporción del dibujo; la imagen adentro se recorta sola.
  const frame = el('span', { class: 'logo-box__logo' }, img);

  const box = el('div', { class: 'logo-box', 'data-efecto': project.efecto }, [
    el('span', { class: 'logo-box__light', 'aria-hidden': 'true' }),
    project.efecto === 'orbita' ? orbit() : null,
    fire,
    sparks,
    // Halo que respira: la silueta del logo en el color de marca, difuminada.
    el('span', { class: 'logo-box__halo', 'aria-hidden': 'true' }, el('span')),
    frame,
  ]);
  for (const [name, value] of Object.entries(project.luz)) box.style.setProperty(name, value);
  box.style.setProperty('--logo-url', `url(${JSON.stringify(project.logo.src)})`);
  // Cada caja respira desfasada: no laten todas juntas.
  box.style.setProperty('--breath-delay', `-${seedFrom(project.logo.src) % 6400}ms`);
  if (sparks) sparksByBox.set(box, { sparks: createSparks(sparks, box), inView: true });

  const lightUp = (footprint, vars) => {
    for (const [name, value] of Object.entries(vars)) box.style.setProperty(name, value);
    box.classList.add('is-lit'); // la luz se enciende con el logo, nunca sola
    if (fire) mountFire(box, fire, footprint, seedFrom(project.logo.src));
  };
  const measure = () => {
    if (!img.naturalWidth) return;
    const { footprint, vars } = cropVars(img, contentBounds(img));
    lightUp(footprint, vars);
  };
  // Red de seguridad: sin logo, la caja muestra el nombre del proyecto con su luz (nunca una imagen rota).
  const showName = () => {
    if (box.classList.contains('is-missing')) return;
    box.classList.add('is-missing');
    frame.replaceWith(el('span', { class: 'logo-box__name', text: project.titulo }));
    lightUp(MISSING_FOOTPRINT, { '--logo-w': pct(MISSING_FOOTPRINT.w), '--logo-h': pct(MISSING_FOOTPRINT.h) });
  };
  // Si la ruta apuntaba a otra carpeta, se busca el mismo archivo en public/proyectos/logos/.
  let retried = false;
  img.addEventListener('error', () => {
    const fallback = logoInLogosDir(project.logo.src);
    if (!retried && fallback !== project.logo.src) {
      retried = true;
      warnLogo(project, `no está en "${project.logo.src}"; se busca en "${fallback}".`);
      img.src = fallback;
      box.style.setProperty('--logo-url', `url(${JSON.stringify(fallback)})`);
      return;
    }
    warnLogo(project, `no se encontró "${img.getAttribute('src')}". Se muestra el nombre del proyecto.`);
    showName();
  });

  if (like?.classList.contains('is-missing')) showName();
  else if (like?.classList.contains('is-lit')) {
    const vars = Object.fromEntries(MEASURE_VARS.map((name) => [name, like.style.getPropertyValue(name)]));
    lightUp({ w: parseFloat(vars['--logo-w']), h: parseFloat(vars['--logo-h']) }, vars);
    img.src = like.querySelector('img').src; // si la tarjeta tuvo que corregir la ruta, se usa la corregida
    box.style.setProperty('--logo-url', like.style.getPropertyValue('--logo-url'));
  } else if (img.complete && img.naturalWidth) measure();
  else img.addEventListener('load', measure, { once: true });

  return box;
}
