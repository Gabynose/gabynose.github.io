// Rendimiento adaptativo: detecta PCs lentas y activa un "modo liviano" (clase is-lite en <html>).
// En PCs normales no cambia nada. Modo liviano: scroll nativo en lugar de Lenis, sin grano en las cajas,
// menos partículas en el campo de cruces, cubo a resolución 1x y nav sin desenfoque.
//
// Cómo decide (solo cuando hay evidencia):
//  1) Señales claras del dispositivo: 2 núcleos o menos, 2 GB de memoria o menos, o "ahorro de datos".
//     (4 núcleos NO alcanza: hay notebooks buenos con 4.)
//  2) Medición real: cuadros por segundo mientras la persona hace scroll. Se ignoran los primeros segundos
//     (la carga inicial es pesada hasta en PCs rápidas) y los cuadros sin scroll.
// Para probar: ?lite=1 fuerza el modo liviano y ?lite=0 lo apaga.

const root = document.documentElement;
const listeners = new Set();
let lite = false;

const SLOW_FRAME_MS = 40; // por encima de esto un cuadro se nota como tirón
const MIN_SAMPLES = 90; // cuadros medidos durante el scroll antes de decidir
const SLOW_SHARE = 0.2; // proporción de cuadros lentos que dispara el modo liviano
const MAX_SAMPLES = 400; // con tantas muestras sanas, se deja de medir
const WARMUP_MS = 2500;

export const isLite = () => lite;

// Ejecuta callback cuando (y si) se activa el modo liviano; si ya está activo, de inmediato.
export function onLite(callback) {
  if (lite) callback();
  else listeners.add(callback);
}

function enable(reason) {
  if (lite) return;
  lite = true;
  root.classList.add('is-lite');
  root.dataset.lite = reason;
  try {
    sessionStorage.setItem('perf-lite', '1'); // el resto de la visita ya arranca liviana
  } catch {}
  listeners.forEach((callback) => callback());
  listeners.clear();
}

function measureScroll() {
  let last = performance.now();
  let lastScrollAt = 0;
  let samples = 0;
  let slow = 0;
  addEventListener('scroll', () => (lastScrollAt = performance.now()), { passive: true });

  const tick = (now) => {
    const dt = now - last;
    last = now;
    const scrolling = now - lastScrollAt < 120;
    if (scrolling && now > WARMUP_MS && dt < 500 && document.visibilityState === 'visible') {
      samples += 1;
      if (dt > SLOW_FRAME_MS) slow += 1;
      if (samples >= MIN_SAMPLES && slow / samples > SLOW_SHARE) return enable('cuadros lentos');
      if (samples >= MAX_SAMPLES) return; // la PC va bien: no hace falta seguir midiendo
    }
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

export function setupPerf() {
  const forced = new URLSearchParams(location.search).get('lite');
  if (forced === '0') return;
  if (forced === '1') return enable('forzado');

  let remembered = false;
  try {
    remembered = sessionStorage.getItem('perf-lite') === '1';
  } catch {}
  const { hardwareConcurrency, deviceMemory, connection } = navigator;
  if (remembered) return enable('recordado');
  if ((hardwareConcurrency ?? 8) <= 2) return enable('pocos núcleos');
  if ((deviceMemory ?? 8) <= 2) return enable('poca memoria');
  if (connection?.saveData) return enable('ahorro de datos');
  measureScroll();
}
