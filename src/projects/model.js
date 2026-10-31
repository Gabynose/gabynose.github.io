// Convierte cada entrada de src/proyectos.js en el objeto que usa la página.
// Si falta un dato o está mal escrito, avisa en la consola de desarrollo y usa un valor seguro.
import { brandLight, parseHex } from './light.js';
import { logoUrl, previewUrl } from './paths.js';

export const EFECTOS = ['orbita', 'fuego'];
export const TIPOS = ['web', 'celular'];
const COLOR_NEUTRO = '#f5f5f4';

function warn(titulo, message) {
  if (import.meta.env.DEV) console.warn(`[proyectos] "${titulo}": ${message}`);
}

// Un proyecto sin logo real (sin src, en /placeholders/ o un logo-prueba-*) todavía no está "ocupado":
// no se muestra en la grilla hasta que se suba su logo.
export function isPending(logoSrc) {
  const src = String(logoSrc ?? '').trim();
  const name = src.split('/').pop().toLowerCase();
  return !src || src.includes('/placeholders/') || name.startsWith('logo-prueba');
}

export function toProject(raw, index) {
  const titulo = raw.titulo ?? `Proyecto ${index + 1}`;
  // Vista previa: con `imagen` la caja se llena con una imagen 4:3; sin ella, es la caja de logo con glow.
  const imagen = raw.imagen ?? null;
  const vista = imagen ? 'imagen' : 'logo';
  const logo = imagen ?? raw.logo ?? {};

  if (!logo.src) {
    warn(titulo, imagen ? 'falta imagen.src (el nombre del archivo en public/proyectos/previews/).' : "falta logo.src (el nombre del PNG, ej. 'marca.png').");
  }

  // En la vista imagen el color es opcional: solo tiñe el borde al pasar el mouse.
  let color = logo.color;
  if (!parseHex(color)) {
    if (!(imagen && color == null)) warn(titulo, `${imagen ? 'imagen' : 'logo'}.color "${color}" no es un hex válido (ej. '#7c3aed'). Se usa luz neutra.`);
    color = COLOR_NEUTRO;
  }
  let color2 = logo.color2;
  if (color2 != null && !parseHex(color2)) {
    warn(titulo, `logo.color2 "${color2}" no es un hex válido. Se deriva del color principal.`);
    color2 = null;
  }

  // El efecto es opcional: sin él, la caja lleva solo el glow.
  let efecto = imagen ? null : (raw.efecto ?? null);
  if (efecto != null && !EFECTOS.includes(efecto)) {
    warn(titulo, `efecto "${efecto}" no existe. Opciones: ${EFECTOS.join(', ')}, o quitá la línea. Se usa solo el glow.`);
    efecto = null;
  }

  // Tipo de proyecto: define cómo se ve la galería del detalle ('web' = capturas apiladas, 'celular' = 3 en fila).
  let tipo = raw.tipo ?? 'web';
  if (!TIPOS.includes(tipo)) {
    warn(titulo, `tipo "${tipo}" no existe. Opciones: ${TIPOS.join(', ')}. Se usa 'web'.`);
    tipo = 'web';
  }

  return {
    id: `proyecto-${index + 1}`,
    titulo,
    pendiente: isPending(logo.src),
    tipo,
    vista,
    descripcion: raw.descripcion ?? '',
    // En la vista imagen, `logo` guarda la ruta de la imagen (la caja la usa igual).
    logo: imagen
      ? { src: previewUrl(logo.src), alt: imagen.alt ?? `Vista previa de ${titulo}` }
      : { src: logoUrl(logo.src), alt: `Logo de ${titulo}` },
    luz: brandLight(color, color2),
    efecto,
    problema: raw.problema ?? '',
    solucion: raw.solucion ?? '',
    // Los placeholders (/placeholders/...) no se muestran: la galería solo tiene imágenes o gifs reales.
    galeria: (raw.galeria ?? []).filter((image) => image?.src && !image.src.startsWith('/placeholders/')),
  };
}
