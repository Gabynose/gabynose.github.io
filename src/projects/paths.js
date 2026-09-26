// Dónde viven los logos. En src/proyectos.js alcanza con el nombre del archivo.
// Sin dependencias del navegador: lo usa también el chequeo de Vite (vite-plugin-proyectos.js).

export const LOGOS_DIR = '/proyectos/logos/';

// 'marca.png' → '/proyectos/logos/marca.png'. Una ruta completa se respeta tal cual.
export function logoUrl(value) {
  const name = String(value ?? '').trim();
  if (!name) return '';
  return name.includes('/') ? name : LOGOS_DIR + name;
}

// La misma imagen, buscada en la carpeta de logos (para rutas escritas con otra carpeta).
export function logoInLogosDir(url) {
  return LOGOS_DIR + url.split('/').pop();
}
