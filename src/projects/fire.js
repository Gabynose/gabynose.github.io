// Ref 2: humo turbulento y chispas del color de la marca, por detrás del logo.
// Canvas 2D. Se dibuja una vez por tamaño de caja; la semilla sale del logo,
// así la tarjeta y el detalle muestran exactamente el mismo fuego.

// Ancho del campo de humo: la mitad del ancho de la caja, entre 140 y 300.
// Se escala con suavizado (el humo es blando) y en mobile cuesta ~4 veces menos.
const smokeResolution = (width) => Math.max(140, Math.min(300, Math.round(width * 0.5)));
const EMBERS = 60;
const BASE_WIDTH = 600; // ancho de caja de referencia para el tamaño de las chispas

function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function seedFrom(text) {
  let h = 2166136261;
  for (const ch of text) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
  return h >>> 0;
}

// Ruido de gradiente 2D (Perlin) con permutación sembrada.
function createNoise(random) {
  const p = Array.from({ length: 256 }, (_, i) => i);
  for (let i = 255; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [p[i], p[j]] = [p[j], p[i]];
  }
  const perm = new Uint8Array(512);
  for (let i = 0; i < 512; i++) perm[i] = p[i & 255];
  const fade = (t) => t * t * t * (t * (t * 6 - 15) + 10);
  const GRADS = [
    [1, 1], [-1, 1], [1, -1], [-1, -1],
    [1, 0], [-1, 0], [0, 1], [0, -1],
  ];
  const grad = (h, x, y) => {
    const g = GRADS[h & 7];
    return g[0] * x + g[1] * y;
  };
  return (x, y) => {
    const xi = Math.floor(x);
    const yi = Math.floor(y);
    const xf = x - xi;
    const yf = y - yi;
    const X = xi & 255;
    const Y = yi & 255;
    const u = fade(xf);
    const v = fade(yf);
    const aa = perm[perm[X] + Y];
    const ab = perm[perm[X] + Y + 1];
    const ba = perm[perm[X + 1] + Y];
    const bb = perm[perm[X + 1] + Y + 1];
    const x1 = grad(aa, xf, yf) + u * (grad(ba, xf - 1, yf) - grad(aa, xf, yf));
    const x2 = grad(ab, xf, yf - 1) + u * (grad(bb, xf - 1, yf - 1) - grad(ab, xf, yf - 1));
    return x1 + v * (x2 - x1);
  };
}

function fbm(noise, x, y) {
  let sum = 0;
  let amp = 0.5;
  let freq = 1;
  for (let o = 0; o < 5; o++) {
    sum += amp * noise(x * freq, y * freq);
    freq *= 2.03;
    amp *= 0.5;
  }
  return sum;
}

const smoothstep = (a, b, x) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};
const mix = (a, b, t) => a.map((v, i) => v + (b[i] - v) * t);
const rgb = (c, alpha) => `rgb(${c[0]} ${c[1]} ${c[2]} / ${alpha})`;

// Humo: jirones con el dominio deformado, estirados en horizontal, que se abren desde el logo.
function smoke(W, H, logo, colors, random) {
  const w = smokeResolution(W);
  const h = Math.round((w * H) / W);
  const noise = createNoise(random);
  const image = new ImageData(w, h);
  const data = image.data;
  const cx = w / 2;
  const cy = h / 2;
  const rx = Math.min((logo.w / W) * w * 0.9, w * 0.34); // se apaga antes del borde de la caja
  const ry = Math.min((logo.h / H) * h * 0.62, h * 0.36);
  const ox = random() * 50;
  const oy = random() * 50;

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const nx = (x - cx) / rx;
      const ny = (y - cy) / ry;
      const r = Math.hypot(nx, ny);
      if (r > 1.7) continue;
      const px = ox + (x / w) * 2.4;
      const py = oy + (y / h) * 4;
      const qx = fbm(noise, px + 1.7, py + 9.2);
      const qy = fbm(noise, px + 8.3, py + 2.8);
      const f = fbm(noise, px + 3 * qx, py + 3 * qy);
      // Filamentos: los cruces por cero de un ruido deformado dan hilos finos y enroscados.
      const g = fbm(noise, px * 1.7 + 2.2 * qy + 5.1, py * 1.7 + 2.2 * qx + 3.3);
      const ridge = (1 - Math.min(1, Math.abs(g) * 2.8)) ** 3.5;
      const cloud = smoothstep(-0.05, 0.5, f);
      const mask = 1 - smoothstep(0.3, 1.35, r + f * 0.9);
      const alpha = mask * (cloud * 0.28 + ridge * 0.8);
      if (alpha <= 0.004) continue;
      const hot = ridge * (1 - smoothstep(0.15, 1, r));
      const color = mix(mix(colors.glow, colors.glow2, smoothstep(0.1, 1.1, r)), colors.rim, hot * 0.5);
      const i = (y * w + x) * 4;
      data[i] = color[0];
      data[i + 1] = color[1];
      data[i + 2] = color[2];
      data[i + 3] = Math.round(Math.min(1, alpha) * 255);
    }
  }

  const layer = document.createElement('canvas');
  layer.width = w;
  layer.height = h;
  layer.getContext('2d').putImageData(image, 0, 0);
  return layer;
}

// Chispas: puntos y estelas que salen del logo; más densas cerca, más tenues lejos.
function embers(ctx, W, H, logo, colors, random) {
  const scale = W / BASE_WIDTH;
  const core = mix(colors.glow, colors.rim, 0.65);
  ctx.globalCompositeOperation = 'lighter';
  ctx.lineCap = 'round';

  for (let i = 0; i < EMBERS; i++) {
    const angle = random() * Math.PI * 2;
    const reach = 1.05 + -Math.log(1 - random() * 0.97) * 0.6;
    const x = W / 2 + Math.cos(angle) * (logo.w / 2) * reach * 1.3;
    const y = H / 2 + Math.sin(angle) * (logo.h / 2) * reach * 1.15;
    if (x < W * 0.04 || x > W * 0.96 || y < H * 0.05 || y > H * 0.95) continue;

    const size = (0.8 + random() ** 2 * 2.2) * scale;
    const alpha = (0.6 + random() * 0.4) * Math.min(1, Math.max(0.3, 1.8 - reach * 0.45));
    ctx.shadowColor = rgb(colors.glow, Math.min(1, alpha * 1.2));
    ctx.shadowBlur = size * 7 * Math.min(2, window.devicePixelRatio || 1);

    if (random() < 0.3) {
      // Estela: apunta hacia afuera, con la cola apagándose hacia el logo.
      const dir = angle + (random() - 0.5) * 0.5;
      const length = (8 + random() * 24) * scale;
      const tx = x - Math.cos(dir) * length;
      const ty = y - Math.sin(dir) * length;
      const gradient = ctx.createLinearGradient(tx, ty, x, y);
      gradient.addColorStop(0, rgb(colors.glow, 0));
      gradient.addColorStop(1, rgb(core, alpha));
      ctx.strokeStyle = gradient;
      ctx.lineWidth = size * 1.1;
      ctx.beginPath();
      ctx.moveTo(tx, ty);
      ctx.lineTo(x, y);
      ctx.stroke();
    } else {
      ctx.fillStyle = rgb(core, alpha);
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.globalCompositeOperation = 'source-over';
  ctx.shadowBlur = 0;
}

const parseTriplet = (value) => value.trim().split(/\s+/).map(Number);

// Dibuja el fuego ocupando toda la caja. `logoRect` en px: lo que ocupa el logo.
export function drawFire(canvas, { width, height, logoRect, style, seed }) {
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  canvas.width = Math.round(width * dpr);
  canvas.height = Math.round(height * dpr);
  const ctx = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, width, height);

  const colors = {
    glow: parseTriplet(style.getPropertyValue('--glow')),
    glow2: parseTriplet(style.getPropertyValue('--glow-2')),
    rim: parseTriplet(style.getPropertyValue('--rim')),
  };
  const random = mulberry32(seed);

  ctx.imageSmoothingQuality = 'high';
  ctx.filter = `blur(${((width / BASE_WIDTH) * 1.2).toFixed(2)}px)`; // humo blando; sin soporte, se omite
  ctx.drawImage(smoke(width, height, logoRect, colors, random), 0, 0, width, height);
  ctx.filter = 'none';
  embers(ctx, width, height, logoRect, colors, random);
}

// ---------- Chispas vivas (Interacción A en cajas con fuego) ----------

const SPARK_RATE = 26; // por segundo mientras está activa
const SPARK_MAX = 40;
const SPARK_BURST = 10; // al entrar, para que la respuesta se note enseguida

function glowSprite(color) {
  const size = 64;
  const sprite = document.createElement('canvas');
  sprite.width = size;
  sprite.height = size;
  const ctx = sprite.getContext('2d');
  const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  gradient.addColorStop(0, rgb(color, 0.9));
  gradient.addColorStop(0.35, rgb(color, 0.28));
  gradient.addColorStop(1, rgb(color, 0));
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);
  return sprite;
}

// Chispas que nacen en el borde del logo, salen hacia afuera, suben un poco y se apagan.
// El bucle solo corre mientras hay chispas vivas.
export function createSparks(canvas, box) {
  const ctx = canvas.getContext('2d');
  let particles = [];
  let spawning = false;
  let running = false;
  let debt = 0;
  let last = 0;
  let size = '';
  let view = null; // { W, H, logoW, logoH, scale, core, sprite }

  function setup() {
    const W = box.clientWidth;
    const H = box.clientHeight;
    if (!W || !H) return false;
    const key = `${W}x${H}`;
    if (key !== size) {
      size = key;
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      particles = [];
    }
    const glow = parseTriplet(box.style.getPropertyValue('--glow'));
    const rim = parseTriplet(box.style.getPropertyValue('--rim'));
    view = {
      W,
      H,
      logoW: (parseFloat(box.style.getPropertyValue('--logo-w')) / 100) * W,
      logoH: (parseFloat(box.style.getPropertyValue('--logo-h')) / 100) * H,
      scale: W / BASE_WIDTH,
      core: mix(glow, rim, 0.7),
      sprite: view?.sprite ?? glowSprite(glow),
    };
    return true;
  }

  function spawn() {
    const { W, H, logoW, logoH, scale } = view;
    const angle = Math.random() * Math.PI * 2;
    const reach = 0.85 + Math.random() * 0.3;
    const speed = (18 + Math.random() * 42) * scale;
    particles.push({
      x: W / 2 + Math.cos(angle) * (logoW / 2) * reach,
      y: H / 2 + Math.sin(angle) * (logoH / 2) * reach,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed * 0.75 - 8 * scale,
      age: 0,
      life: 1.1 + Math.random() * 1.3,
      size: (0.7 + Math.random() ** 2 * 1.6) * scale,
      streak: Math.random() < 0.35,
      phase: Math.random() * 10,
    });
  }

  function frame(now) {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    const { W, H, scale, core, sprite } = view;

    if (spawning) {
      debt += SPARK_RATE * dt;
      while (debt >= 1 && particles.length < SPARK_MAX) {
        spawn();
        debt -= 1;
      }
      debt = Math.min(debt, 1);
    }

    ctx.clearRect(0, 0, W, H);
    ctx.globalCompositeOperation = 'lighter';
    ctx.lineCap = 'round';
    particles = particles.filter((p) => {
      p.age += dt;
      if (p.age >= p.life) return false;
      p.vy -= 14 * scale * dt; // el calor las empuja hacia arriba
      p.vx += Math.sin(p.age * 5 + p.phase) * 10 * scale * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;

      const t = p.age / p.life;
      const alpha = Math.min(1, p.age / 0.15) * (1 - t * t);
      const halo = p.size * 7;
      ctx.globalAlpha = alpha * 0.75;
      ctx.drawImage(sprite, p.x - halo, p.y - halo, halo * 2, halo * 2);
      ctx.globalAlpha = alpha;
      if (p.streak) {
        ctx.strokeStyle = rgb(core, 1);
        ctx.lineWidth = p.size;
        ctx.beginPath();
        ctx.moveTo(p.x - p.vx * 0.07, p.y - p.vy * 0.07);
        ctx.lineTo(p.x, p.y);
        ctx.stroke();
      } else {
        ctx.fillStyle = rgb(core, 1);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
      return true;
    });
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';

    if (spawning || particles.length) requestAnimationFrame(frame);
    else running = false;
  }

  return {
    start() {
      if (!setup()) return;
      spawning = true;
      for (let i = 0; i < SPARK_BURST && particles.length < SPARK_MAX; i++) spawn();
      if (running) return;
      running = true;
      last = performance.now();
      requestAnimationFrame(frame);
    },
    // Deja de generar; las chispas vivas terminan su recorrido.
    stop() {
      spawning = false;
    },
  };
}

// Pinta de entrada el fuego de otra caja (misma semilla, mismo dibujo) escalado a esta.
// Así el humo está desde el primer fotograma; la versión nítida llega en tiempo libre.
export function seedFire(source, target) {
  const from = source.querySelector('.logo-box__fire');
  const to = target.querySelector('.logo-box__fire');
  if (!from?.width || !to || !target.clientWidth) return; // sin fuego, o todavía sin dibujar
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  to.width = Math.round(target.clientWidth * dpr);
  to.height = Math.round(target.clientHeight * dpr);
  const ctx = to.getContext('2d');
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(from, 0, 0, to.width, to.height);
}
