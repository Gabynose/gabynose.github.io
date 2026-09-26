// Monta el cubo en la página. Si el navegador lo permite, la escena corre en un Web Worker
// (OffscreenCanvas): la preparación y el dibujo no bloquean el hilo principal. Si no, corre aquí.
// Este archivo solo conecta la página con la escena: tamaño, visibilidad y arrastre.
import { el, prefersReducedMotion } from '../dom.js';

function supportsWebGL() {
  try {
    const gl = document.createElement('canvas').getContext('webgl2');
    gl?.getExtension('WEBGL_lose_context')?.loseContext();
    return Boolean(gl);
  } catch {
    return false;
  }
}

const supportsOffscreen = () =>
  typeof OffscreenCanvas !== 'undefined' && 'transferControlToOffscreen' in HTMLCanvasElement.prototype;

const newCanvas = () => el('canvas', { class: 'cube__canvas', 'aria-hidden': 'true' });

// Escena en un Worker. Devuelve un control con la misma forma que createCubeScene.
function startInWorker(canvas, options) {
  const worker = new Worker(new URL('./cube.worker.js', import.meta.url), { type: 'module' });
  const offscreen = canvas.transferControlToOffscreen();
  return new Promise((resolve, reject) => {
    worker.onmessage = ({ data }) => {
      if (data.type === 'ready') resolve(control);
      if (data.type === 'error') reject(new Error(data.message));
    };
    worker.onerror = (event) => reject(new Error(event.message));
    // Cada método llamado se envía al Worker. 'then' queda sin definir: si no, la Promise lo trataría como thenable.
    const control = new Proxy(
      {},
      { get: (_, type) => (type === 'then' ? undefined : (...args) => worker.postMessage({ type, args })) },
    );
    worker.postMessage({ type: 'init', canvas: offscreen, options }, [offscreen]);
  });
}

async function startInPage(canvas, options) {
  const { createCubeScene } = await import('./cube.js');
  return createCubeScene(canvas, options);
}

function connect(container, canvas, scene) {
  const dpr = () => Math.min(window.devicePixelRatio || 1, 2);

  new ResizeObserver(([entry]) => {
    const { width, height } = entry.contentRect;
    scene.resize(width, height, dpr());
  }).observe(container);

  // Solo se dibuja si el cubo está en pantalla y la pestaña visible.
  let onScreen = true;
  const update = () => scene.setVisible(onScreen && document.visibilityState === 'visible');
  new IntersectionObserver(([entry]) => {
    onScreen = entry.isIntersecting;
    update();
  }).observe(container);
  document.addEventListener('visibilitychange', update);

  // Arrastre: los eventos se leen aquí y se envían a la escena con su marca de tiempo.
  let dragId = null;
  canvas.addEventListener('pointerdown', (event) => {
    dragId = event.pointerId;
    canvas.setPointerCapture(event.pointerId);
    container.classList.add('is-dragging');
    scene.pointerDown(event.clientX, event.clientY, event.timeStamp);
  });
  canvas.addEventListener('pointermove', (event) => {
    if (event.pointerId === dragId) scene.pointerMove(event.clientX, event.clientY, event.timeStamp);
  });
  const end = (event) => {
    if (event.pointerId !== dragId) return;
    dragId = null;
    container.classList.remove('is-dragging');
    scene.pointerUp(event.timeStamp);
  };
  canvas.addEventListener('pointerup', end);
  canvas.addEventListener('pointercancel', end);
}

export function mountCube(container) {
  if (!container) return;
  if (!supportsWebGL()) {
    container.classList.add('is-unsupported');
    return;
  }

  const load = async () => {
    const reducedMotion = prefersReducedMotion();
    const { width, height } = container.getBoundingClientRect();
    const options = { reducedMotion, width, height, dpr: Math.min(window.devicePixelRatio || 1, 2) };

    let canvas = newCanvas();
    container.append(canvas);
    let scene;
    if (supportsOffscreen()) {
      try {
        scene = await startInWorker(canvas, options);
      } catch {
        // El Worker no pudo (p. ej. sin WebGL en workers): canvas nuevo y escena en la página.
        canvas.remove();
        canvas = newCanvas();
        container.append(canvas);
      }
    }
    scene ??= await startInPage(canvas, options);
    connect(container, canvas, scene);

    container.classList.add('is-ready');
    if (!reducedMotion) {
      // Entrada de Ref 2 (webgl-scale-in-fade): escala 0.7 a 1 con fundido.
      container.animate(
        [
          { opacity: 0, transform: 'scale(0.7)' },
          { opacity: 1, transform: 'none' },
        ],
        { duration: 1600, easing: 'cubic-bezier(0.19, 1, 0.22, 1)' },
      );
    }
  };

  // Arranca cuando la página ya cargó y el navegador está libre: el texto del hero se pinta primero.
  const schedule = window.requestIdleCallback ?? ((fn) => setTimeout(fn, 200));
  const start = () => schedule(() => load().catch(() => container.classList.add('is-unsupported')), { timeout: 2000 });
  if (document.readyState === 'complete') start();
  else window.addEventListener('load', start, { once: true });
}
