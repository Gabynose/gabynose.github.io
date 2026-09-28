// Nube de cruces "+" que se pelean por el centro (Ref 3: furoweb.eu).
// Canvas 2D. Cada cruz tiembla al azar y una fuerza suave la devuelve a su origen:
// ninguna llega a quedarse quieta en el centro.

const BASE = 460; // tamaño de referencia (px): Ref 3 usa 540; se reduce para que la nube llene más su hueco
const CONFIG = {
  coreRadius: 42,
  blobRadius: 110,
  outerRadius: 195,
  crossSize: 2.5,
  crossWidth: 0.8,
  color: '245,245,244',
  speedMin: 0.3,
  speedMax: 2.2,
  wobble: 0.055,
  returnForce: 0.003,
};

// Borde orgánico de la nube: suma de senos por ángulo.
const organicOffset = (angle, seed) =>
  Math.sin(angle * 2.1 + seed) * 0.15 + Math.sin(angle * 3.7 + seed * 1.3) * 0.09 + Math.sin(angle * 6.3 + seed * 0.7) * 0.05;

import { isLite, onLite } from '../perf.js';

// Cantidad de niveles de opacidad: las cruces del mismo nivel se dibujan con un único trazo (en vez de uno por cruz).
const OPACITY_LEVELS = 24;
const LITE_COUNT = 120;
const LITE_FRAME_MS = 33; // en modo liviano se actualiza a ~30 fps

export function createCrosses(container, { reducedMotion = false } = {}) {
  const canvas = document.createElement('canvas');
  canvas.setAttribute('aria-hidden', 'true');
  canvas.className = 'crosses__canvas';
  container.append(canvas);
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const small = window.matchMedia('(max-width: 767px)').matches;
  const lowEnd = (navigator.hardwareConcurrency || 4) <= 4;
  const count = isLite() ? LITE_COUNT : small ? 160 : lowEnd ? 220 : 300;
  let minFrame = isLite() ? LITE_FRAME_MS : 0;

  let width = 0;
  let height = 0;
  let particles = [];

  function makeParticle(cx, cy, scale, seed) {
    const core = CONFIG.coreRadius * scale;
    const blob = CONFIG.blobRadius * scale;
    const outer = CONFIG.outerRadius * scale;
    const zone = Math.random();
    let r;
    if (zone < 0.18) r = Math.random() * core;
    else if (zone < 0.72) r = core + Math.pow(Math.random(), 0.7) * (blob - core);
    else r = blob + Math.pow(Math.random(), 0.5) * (outer - blob);

    const angle = Math.random() * Math.PI * 2;
    const finalR = r * (1 + organicOffset(angle, seed) * (r / blob));
    const ox = cx + Math.cos(angle) * finalR;
    const oy = cy + Math.sin(angle) * finalR;

    let baseOpacity;
    if (r < core) baseOpacity = 0.65 + Math.random() * 0.35;
    else if (r < blob) baseOpacity = 0.15 + (1 - (r - core) / (blob - core)) * 0.55;
    else baseOpacity = 0.04 + (1 - (r - blob) / (outer - blob)) * 0.15;

    // Las del núcleo se mueven más: es donde se "pelean".
    const speedFactor = r < core ? 1 : r < blob ? 0.55 : 0.2;
    const speed = (CONFIG.speedMin + Math.random() * (CONFIG.speedMax - CONFIG.speedMin)) * speedFactor * scale;
    const size = CONFIG.crossSize * Math.max(scale, 0.8) * (r < core ? 0.9 + Math.random() * 0.8 : 0.5 + Math.random() * 0.7);

    return {
      ox,
      oy,
      x: ox,
      y: oy,
      vx: (Math.random() - 0.5) * speed * 2,
      vy: (Math.random() - 0.5) * speed * 2,
      maxSpeedSq: (speed * 1.8) ** 2,
      baseOpacity,
      phase: Math.random() * Math.PI * 2,
      flickerSpeed: 0.01 + Math.random() * 0.03,
      size,
    };
  }

  function setup() {
    const rect = container.getBoundingClientRect();
    width = rect.width;
    height = rect.height;
    if (!width || !height) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const scale = Math.min(width, height) / BASE;
    const seed = Math.random() * 10;
    particles = Array.from({ length: count }, () => makeParticle(width / 2, height / 2, scale, seed));
  }

  // Estilos precalculados y grupos reutilizados: dibujar no crea strings ni arreglos nuevos en cada cuadro.
  const styles = Array.from({ length: OPACITY_LEVELS }, (_, i) => `rgba(${CONFIG.color},${((i + 0.5) / OPACITY_LEVELS).toFixed(3)})`);
  const groups = Array.from({ length: OPACITY_LEVELS }, () => []);

  function draw() {
    ctx.clearRect(0, 0, width, height);
    ctx.lineWidth = CONFIG.crossWidth;
    ctx.lineCap = 'square';
    for (const group of groups) group.length = 0;
    for (const p of particles) {
      const opacity = Math.max(0, Math.min(1, p.baseOpacity + Math.sin(p.phase) * 0.15));
      groups[Math.min(OPACITY_LEVELS - 1, Math.floor(opacity * OPACITY_LEVELS))].push(p);
    }
    for (let level = 0; level < OPACITY_LEVELS; level++) {
      const group = groups[level];
      if (!group.length) continue;
      ctx.strokeStyle = styles[level];
      ctx.beginPath();
      for (const p of group) {
        ctx.moveTo(p.x - p.size, p.y);
        ctx.lineTo(p.x + p.size, p.y);
        ctx.moveTo(p.x, p.y - p.size);
        ctx.lineTo(p.x, p.y + p.size);
      }
      ctx.stroke();
    }
  }

  // Física de Ref 3, pasada a tiempo real (k = fotogramas a 60 fps).
  function step(k) {
    const wobble = CONFIG.wobble * Math.PI * 2;
    for (const p of particles) {
      const speed = Math.hypot(p.vx, p.vy);
      p.vx += (Math.random() - 0.5) * wobble * speed * k;
      p.vy += (Math.random() - 0.5) * wobble * speed * k;
      p.vx += (p.ox - p.x) * CONFIG.returnForce * k;
      p.vy += (p.oy - p.y) * CONFIG.returnForce * k;
      const speedSq = p.vx * p.vx + p.vy * p.vy;
      if (speedSq > p.maxSpeedSq) {
        const s = Math.sqrt(p.maxSpeedSq / speedSq);
        p.vx *= s;
        p.vy *= s;
      }
      p.x += p.vx * k;
      p.y += p.vy * k;
      p.phase += p.flickerSpeed * k;
    }
  }

  // Si la PC resulta lenta durante la visita: menos partículas y menos cuadros por segundo.
  onLite(() => {
    minFrame = LITE_FRAME_MS;
    if (particles.length > LITE_COUNT) particles.length = LITE_COUNT;
  });

  let rafId = null;
  let last = 0;
  let onScreen = false;

  function frame(now) {
    rafId = null;
    // Modo liviano: se salta el cuadro si pasó menos de ~33 ms desde el último.
    if (minFrame && last && now - last < minFrame - 2) {
      if (onScreen) rafId = requestAnimationFrame(frame);
      return;
    }
    const k = Math.min((now - (last || now)) / (1000 / 60), 3);
    last = now;
    step(k);
    draw();
    if (onScreen) rafId = requestAnimationFrame(frame);
    else last = 0;
  }

  setup();
  draw();

  new ResizeObserver(() => {
    setup();
    draw();
  }).observe(container);

  if (reducedMotion) return; // imagen fija de la nube, sin movimiento

  new IntersectionObserver(([entry]) => {
    onScreen = entry.isIntersecting;
    if (onScreen && rafId === null) rafId = requestAnimationFrame(frame);
  }).observe(container);
}

// Se inicia solo cuando la sección se acerca al viewport.
export function mountCrosses(container, options) {
  if (!container) return;
  const observer = new IntersectionObserver(
    ([entry]) => {
      if (!entry.isIntersecting) return;
      observer.disconnect();
      const schedule = window.requestIdleCallback ?? ((fn) => setTimeout(fn, 0));
      schedule(() => createCrosses(container, options), { timeout: 1000 });
    },
    { rootMargin: '600px 0px' },
  );
  observer.observe(container);
}
