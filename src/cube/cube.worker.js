// Web Worker del cubo: toda la preparación (reflejos, shaders) y el dibujo ocurren fuera
// del hilo principal, así la página nunca se traba por el cubo.
import { createCubeScene } from './cube.js';

let scene = null;
const pending = [];

const handle = ({ type, args = [] }) => scene?.[type]?.(...args);

self.onmessage = async ({ data }) => {
  if (data.type === 'init') {
    try {
      scene = await createCubeScene(data.canvas, data.options);
      pending.splice(0).forEach(handle);
      self.postMessage({ type: 'ready' });
    } catch (error) {
      self.postMessage({ type: 'error', message: String(error) });
    }
    return;
  }
  if (!scene) pending.push(data);
  else handle(data);
};
