// Convierte cada entrada de src/proyectos.js en el objeto que usa la página.
// Si falta un dato o está mal escrito, avisa en la consola de desarrollo y usa un valor seguro.
import { brandLight, parseHex } from './light.js';
import { logoUrl } from './paths.js';

export const EFECTOS = ['orbita', 'fuego'];
const COLOR_NEUTRO = '#f5f5f4';

function warn(titulo, message) {
  if (import.meta.env.DEV) console.warn(`[proyectos] "${titulo}": ${message}`);
}

export function toProject(raw, index) {
  const titulo = raw.titulo ?? `Proyecto ${index + 1}`;
  const logo = raw.logo ?? {};

  if (!logo.src) warn(titulo, "falta logo.src (el nombre del PNG, ej. 'marca.png').");

  let color = logo.color;
  if (!parseHex(color)) {
    warn(titulo, `logo.color "${color}" no es un hex válido (ej. '#7c3aed'). Se usa luz neutra.`);
    color = COLOR_NEUTRO;
  }
  let color2 = logo.color2;
  if (color2 != null && !parseHex(color2)) {
    warn(titulo, `logo.color2 "${color2}" no es un hex válido. Se deriva del color principal.`);
    color2 = null;
  }

  // El efecto es opcional: sin él, la caja lleva solo el glow.
  let efecto = raw.efecto ?? null;
  if (efecto != null && !EFECTOS.includes(efecto)) {
    warn(titulo, `efecto "${efecto}" no existe. Opciones: ${EFECTOS.join(', ')}, o quitá la línea. Se usa solo el glow.`);
    efecto = null;
  }

  return {
    id: `proyecto-${index + 1}`,
    titulo,
    descripcion: raw.descripcion ?? '',
    logo: { src: logoUrl(logo.src), alt: `Logo de ${titulo}` },
    luz: brandLight(color, color2),
    efecto,
    problema: raw.problema ?? '',
    solucion: raw.solucion ?? '',
    // Los placeholders (/placeholders/...) no se muestran: la galería solo tiene imágenes o gifs reales.
    galeria: (raw.galeria ?? []).filter((image) => image?.src && !image.src.startsWith('/placeholders/')),
  };
}
