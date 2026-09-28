// Cubo Rubik 3D (Ref 2: resend.com). Monocromo, gira solo, se arrastra con inercia y se "resuelve".
// Escena pura: no toca el DOM, así puede correr dentro de un Web Worker (cube.worker.js)
// o, si el navegador no lo soporta, en el hilo principal. La conexión con la página vive en mount.js.
import {
  ACESFilmicToneMapping,
  BackSide,
  BoxGeometry,
  Color,
  Euler,
  Group,
  MathUtils,
  Matrix4,
  Mesh,
  MeshBasicMaterial,
  MeshPhysicalMaterial,
  Object3D,
  PerspectiveCamera,
  PlaneGeometry,
  PMREMGenerator,
  Quaternion,
  Scene,
  Shape,
  ShapeGeometry,
  SRGBColorSpace,
  Vector3,
  WebGLRenderer,
} from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';

const SPACING = 1.02;
const AXES = ['x', 'y', 'z'];
const AXIS_VECTORS = { x: new Vector3(1, 0, 0), y: new Vector3(0, 1, 0), z: new Vector3(0, 0, 1) };
const FACES = [
  { axis: 'x', sign: 1 },
  { axis: 'x', sign: -1 },
  { axis: 'y', sign: 1 },
  { axis: 'y', sign: -1 },
  { axis: 'z', sign: 1 },
  { axis: 'z', sign: -1 },
];

function roundedSquare(size, radius) {
  const h = size / 2;
  const shape = new Shape();
  shape.moveTo(-h + radius, -h);
  shape.lineTo(h - radius, -h);
  shape.quadraticCurveTo(h, -h, h, -h + radius);
  shape.lineTo(h, h - radius);
  shape.quadraticCurveTo(h, h, h - radius, h);
  shape.lineTo(-h + radius, h);
  shape.quadraticCurveTo(-h, h, -h, h - radius);
  shape.lineTo(-h, -h + radius);
  shape.quadraticCurveTo(-h, -h, -h + radius, -h);
  return new ShapeGeometry(shape, 6);
}

// Estudio oscuro con softboxes: da los reflejos del cubo negro de Ref 2.
function studioEnvironment() {
  const env = new Scene();
  // Paredes del estudio: su gris es la luz ambiente que levanta las caras en sombra.
  env.add(new Mesh(new BoxGeometry(24, 24, 24), new MeshBasicMaterial({ color: 0x1c1c1c, side: BackSide })));
  const panel = (width, height, intensity, position) => {
    const light = new Mesh(
      new PlaneGeometry(width, height),
      new MeshBasicMaterial({ color: new Color(intensity, intensity, intensity) }),
    );
    light.position.set(...position);
    light.lookAt(0, 0, 0);
    env.add(light);
  };
  // Caras planas y brillantes: cada panel se ve donde cae el reflejo de la vista.
  panel(14, 6, 2.2, [0, 9, -4]); // cenital trasero (tapa superior)
  panel(4, 10, 2.5, [-10, 0, 0]); // lateral izquierda
  panel(4, 10, 1.6, [10, -1, -1]); // lateral derecha
  panel(8, 3, 1.2, [0, 6, 8]); // cenital frontal suave
  panel(8, 3, 1.3, [0, -9, 3]); // relleno bajo: separa la base del fondo negro
  panel(18, 12, 1.1, [0, 1, -12]); // contraluz: dibuja las aristas y la silueta
  return env;
}

// Cede el hilo entre pasos pesados (útil sobre todo si el cubo corre en el hilo principal).
const nextTask = () =>
  globalThis.scheduler?.yield ? globalThis.scheduler.yield() : new Promise((resolve) => setTimeout(resolve, 0));

const easeInOutCubic = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

// Crea la escena sobre un canvas (HTMLCanvasElement u OffscreenCanvas) y devuelve su control.
// Los tiempos del arrastre llegan desde la página (event.timeStamp): todos usan el mismo reloj.
export async function createCubeScene(canvas, { reducedMotion = false, width = 1, height = 1, dpr = 1, antialias = true } = {}) {
  const renderer = new WebGLRenderer({ canvas, antialias, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(dpr);
  renderer.outputColorSpace = SRGBColorSpace;
  renderer.toneMapping = ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.2;
  renderer.setClearColor(0x000000, 0);

  await nextTask();
  const scene = new Scene();
  const pmrem = new PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(studioEnvironment(), 0.02).texture;
  pmrem.dispose();
  await nextTask();

  const camera = new PerspectiveCamera(28, 1, 0.1, 100);
  camera.position.set(0, 0, 11.5);

  // Materiales: cuerpo negro + pegatinas en tres grises. Cada par de caras opuestas
  // comparte tono, así el cubo resuelto se lee como un Rubik real en monocromo.
  const body = new MeshPhysicalMaterial({ color: 0x0b0b0b, roughness: 0.4, metalness: 0, clearcoat: 0.8, clearcoatRoughness: 0.25 });
  const faceMaterials = {
    y: new MeshPhysicalMaterial({ color: 0xd4d4d4, roughness: 0.2, metalness: 1 }), // arriba/abajo: plata
    z: new MeshPhysicalMaterial({ color: 0x050505, roughness: 0.12, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.05 }), // frente/fondo: negro
    x: new MeshPhysicalMaterial({ color: 0x3a3a3a, roughness: 0.3, metalness: 0.6, clearcoat: 1, clearcoatRoughness: 0.15 }), // laterales: grafito
  };

  const bodyGeometry = new RoundedBoxGeometry(1, 1, 1, 4, 0.1);
  const stickerGeometry = roundedSquare(0.8, 0.12);

  const cube = new Group();
  const cubies = [];
  for (let x = -1; x <= 1; x++) {
    for (let y = -1; y <= 1; y++) {
      for (let z = -1; z <= 1; z++) {
        const cubie = new Group();
        cubie.add(new Mesh(bodyGeometry, body));
        const coords = { x, y, z };
        for (const face of FACES) {
          if (coords[face.axis] !== face.sign) continue;
          const sticker = new Mesh(stickerGeometry, faceMaterials[face.axis]);
          const normal = AXIS_VECTORS[face.axis].clone().multiplyScalar(face.sign);
          sticker.position.copy(normal).multiplyScalar(0.502);
          sticker.lookAt(normal.clone().multiplyScalar(2));
          cubie.add(sticker);
        }
        cubie.position.set(x * SPACING, y * SPACING, z * SPACING);
        cube.add(cubie);
        cubies.push(cubie);
      }
    }
  }
  cube.quaternion.setFromEuler(new Euler(0.52, -0.72, 0));
  scene.add(cube);

  function resize(w, h, ratio = dpr) {
    if (!w || !h) return;
    renderer.setPixelRatio(ratio);
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    start();
  }

  // Movimientos de capa. Solo capas exteriores, como un cubo real.
  const pivot = new Object3D();
  cube.add(pivot);
  const snapMatrix = new Matrix4();

  function beginMove(move) {
    pivot.rotation.set(0, 0, 0);
    pivot.updateMatrixWorld();
    const members = cubies.filter((c) => Math.round(c.position[move.axis] / SPACING) === move.layer);
    members.forEach((c) => pivot.attach(c));
    return members;
  }

  function finishMove(members) {
    pivot.updateMatrixWorld();
    for (const c of members) {
      cube.attach(c);
      c.position.set(
        Math.round(c.position.x / SPACING) * SPACING,
        Math.round(c.position.y / SPACING) * SPACING,
        Math.round(c.position.z / SPACING) * SPACING,
      );
      // Ajuste exacto a múltiplos de 90°: evita que el error numérico se acumule.
      snapMatrix.makeRotationFromQuaternion(c.quaternion);
      const e = snapMatrix.elements;
      for (const k of [0, 1, 2, 4, 5, 6, 8, 9, 10]) e[k] = Math.round(e[k]);
      c.quaternion.setFromRotationMatrix(snapMatrix);
    }
    pivot.rotation.set(0, 0, 0);
  }

  const angleOf = (move) => (Math.PI / 2) * move.turns;

  function applyInstant(move) {
    const members = beginMove(move);
    pivot.rotation[move.axis] = angleOf(move);
    finishMove(members);
  }

  // Secuencia de "resolución": se mezcla con N movimientos al azar y se resuelve
  // ejecutando la inversa en orden contrario. El cubo vuelve de verdad a su estado resuelto.
  const OUTER_LAYERS = [-1, 1];
  const pick = (list) => list[Math.floor(Math.random() * list.length)];
  const between = (min, max) => min + Math.random() * (max - min);

  function scramble(count) {
    const moves = [];
    let prevAxis = null;
    for (let i = 0; i < count; i++) {
      const axis = pick(AXES.filter((a) => a !== prevAxis)); // nunca dos seguidos en el mismo eje
      const turns = Math.random() < 0.18 ? 2 : pick([1, -1]);
      moves.push({ axis, layer: pick(OUTER_LAYERS), turns });
      prevAxis = axis;
    }
    return moves;
  }

  const moveStep = (move, duration) => ({ move, duration: duration * (Math.abs(move.turns) === 2 ? 1.35 : 1) });
  const waitStep = (time) => ({ wait: time });

  function solveSteps(moves) {
    const steps = [];
    let untilPause = Math.floor(between(3, 7));
    [...moves].reverse().forEach((m) => {
      steps.push(moveStep({ ...m, turns: -m.turns }, 0.42));
      // Ritmo humano: pausas cortas entre giros y, cada tanto, una más larga "pensando".
      if (--untilPause === 0) {
        steps.push(waitStep(between(0.5, 1)));
        untilPause = Math.floor(between(3, 7));
      } else {
        steps.push(waitStep(between(0.05, 0.16)));
      }
    });
    return steps;
  }

  const SOLVED_HOLD = 3.2;
  const SCRAMBLE_MOVES = 20;

  function nextCycle() {
    const moves = scramble(SCRAMBLE_MOVES);
    return [...moves.map((m) => moveStep(m, 0.2)), waitStep(1.1), ...solveSteps(moves), waitStep(SOLVED_HOLD)];
  }

  // Estado inicial: mezclado, para que lo primero que se vea sea el cubo resolviéndose.
  const initialScramble = scramble(SCRAMBLE_MOVES);
  initialScramble.forEach(applyInstant);
  const sequence = {
    steps: [waitStep(1.4), ...solveSteps(initialScramble), waitStep(SOLVED_HOLD)],
    current: null,
    wait: 0,
  };

  function advanceSequence(dt) {
    let budget = dt;
    while (budget > 0) {
      const cur = sequence.current;
      if (cur) {
        cur.t = Math.min(cur.t + budget / cur.duration, 1);
        pivot.rotation[cur.move.axis] = angleOf(cur.move) * easeInOutCubic(cur.t);
        if (cur.t < 1) return;
        finishMove(cur.members);
        sequence.current = null;
        return;
      }
      if (sequence.wait > 0) {
        const used = Math.min(sequence.wait, budget);
        sequence.wait -= used;
        budget -= used;
        continue;
      }
      if (!sequence.steps.length) sequence.steps = nextCycle();
      const step = sequence.steps.shift();
      if ('wait' in step) sequence.wait = step.wait;
      else sequence.current = { ...step, members: beginMove(step.move), t: 0 };
    }
  }

  // Arrastre con inercia (rotación en espacio de mundo).
  const velocity = { x: 0, y: 0 }; // rad/s alrededor de los ejes X e Y del mundo
  // Giro constante en un solo sentido mientras nadie toca el cubo.
  // Con movimiento reducido gira igual, pero más lento (y sin giros de capa).
  const SPIN_SPEED = reducedMotion ? 0.12 : 0.3; // rad/s: una vuelta cada ~21 s
  let spinFactor = 1; // 0 mientras se arrastra; vuelve a 1 de forma suave al soltar
  const drag = { active: false, lastX: 0, lastY: 0, lastT: 0 };
  const tmpQuat = new Quaternion();
  const worldY = new Vector3(0, 1, 0);
  const worldX = new Vector3(1, 0, 0);
  // Giro de reposo alrededor del eje vertical del cubo inclinado: la tapa superior siempre se ve.
  const idleAxis = new Vector3(0, 1, 0).applyAxisAngle(worldX, 0.52);

  const rotateBy = (ax, ay) => {
    tmpQuat.setFromAxisAngle(worldY, ay);
    cube.quaternion.premultiply(tmpQuat);
    tmpQuat.setFromAxisAngle(worldX, ax);
    cube.quaternion.premultiply(tmpQuat);
  };

  function pointerDown(x, y, t) {
    drag.active = true;
    drag.lastX = x;
    drag.lastY = y;
    drag.lastT = t;
    velocity.x = velocity.y = 0;
    start();
  }

  function pointerMove(x, y, t) {
    if (!drag.active) return;
    const dt = Math.max((t - drag.lastT) / 1000, 1 / 240);
    const ay = (x - drag.lastX) * 0.009;
    const ax = (y - drag.lastY) * 0.009;
    rotateBy(ax, ay);
    velocity.x = MathUtils.lerp(velocity.x, ax / dt, 0.5);
    velocity.y = MathUtils.lerp(velocity.y, ay / dt, 0.5);
    drag.lastX = x;
    drag.lastY = y;
    drag.lastT = t;
  }

  function pointerUp(t) {
    if (!drag.active) return;
    drag.active = false;
    // Si el puntero se quedó quieto antes de soltar, no hay lanzamiento.
    if (t - drag.lastT > 80) velocity.x = velocity.y = 0;
    const max = 9;
    velocity.x = MathUtils.clamp(velocity.x, -max, max);
    velocity.y = MathUtils.clamp(velocity.y, -max, max);
  }

  // Bucle: solo corre si el cubo está en pantalla y la pestaña visible (lo informa mount.js).
  const raf = globalThis.requestAnimationFrame
    ? globalThis.requestAnimationFrame.bind(globalThis)
    : (callback) => setTimeout(() => callback(performance.now()), 16);
  let rafId = null;
  let last = 0;
  let visible = true;
  let ready = false;

  function frame(now) {
    rafId = null;
    const dt = Math.min((now - (last || now)) / 1000, 1 / 20);
    last = now;
    // El giro constante nunca se detiene: solo se pausa mientras se arrastra.
    spinFactor += ((drag.active ? 0 : 1) - spinFactor) * (1 - Math.exp(-dt * (drag.active ? 12 : 1.6)));

    if (!drag.active) {
      // Inercia del arrastre que decae.
      const decay = Math.exp(-dt * 2.4);
      velocity.x *= decay;
      velocity.y *= decay;
      if (Math.abs(velocity.x) > 1e-4 || Math.abs(velocity.y) > 1e-4) {
        rotateBy(velocity.x * dt, velocity.y * dt);
      }
    }
    if (spinFactor > 1e-3) {
      tmpQuat.setFromAxisAngle(idleAxis, SPIN_SPEED * spinFactor * dt);
      cube.quaternion.premultiply(tmpQuat);
    }

    if (!reducedMotion) advanceSequence(dt);

    renderer.render(scene, camera);
    if (visible) rafId = raf(frame);
    else last = 0;
  }

  function start() {
    if (ready && rafId === null && visible) rafId = raf(frame);
  }

  function setVisible(value) {
    visible = value;
    start();
  }

  resize(width, height, dpr);
  // Compila los shaders en paralelo (sin bloquear) antes del primer dibujo.
  await renderer.compileAsync(scene, camera);
  await nextTask();
  renderer.render(scene, camera);
  ready = true;
  start();

  return { resize, pointerDown, pointerMove, pointerUp, setVisible };
}
