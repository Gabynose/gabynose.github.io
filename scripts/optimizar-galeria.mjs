// Optimiza las imágenes pesadas de public/proyectos/:
//  - gifs y webp animados de la galería (public/proyectos/): se reducen a 1280 px de ancho.
//  - logos PNG de las cajas (public/proyectos/logos/): se reducen a 1000 px de lado mayor.
// Uso: npm run optimizar                  (revisa todo)
//      npm run optimizar -- nombre.webp   (solo ese archivo)
//
// Por qué: los archivos se muestran mucho más chicos que su tamaño real (un logo de 1600 px se ve a ~330 px,
// una animación de 1600 px a ~960 px). El navegador decodifica y escala cada píxel: con archivos grandes la
// página se traba en PCs lentas y las animaciones pueden titilar. Los fotogramas y tiempos no cambian.
// El original se guarda en originales/ (carpeta local, no se sube a GitHub) y nunca se pisa dos veces.
import sharp from 'sharp';
import { copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync, statSync, unlinkSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { extname, join } from 'node:path';

sharp.cache(false); // sin caché no queda ningún archivo abierto (en Windows impediría reemplazarlo)

export const MAX_ANCHO_ANIMACION = 1280;
export const MAX_LADO_LOGO = 1000;
const GALERIA = 'public/proyectos';
const LOGOS = 'public/proyectos/logos';
const BACKUP = 'originales';
const mb = (bytes) => `${(bytes / 1048576).toFixed(2)} MB`;
const kb = (bytes) => `${Math.round(bytes / 1024)} KB`;

// En Windows, el antivirus o el servidor de desarrollo pueden tener un archivo abierto un instante: se reintenta.
async function conReintentos(accion) {
  for (let intento = 1; ; intento++) {
    try {
      return accion();
    } catch (error) {
      if (intento >= 12 || !['EBUSY', 'EPERM'].includes(error.code)) throw error;
      await new Promise((resolve) => setTimeout(resolve, 400));
    }
  }
}

const only = process.argv.slice(2).filter((a) => !a.startsWith('-'));
const listar = (dir, patron) =>
  existsSync(dir)
    ? readdirSync(dir).filter((name) => patron.test(name) && statSync(join(dir, name)).isFile() && (!only.length || only.includes(name)))
    : [];

// Escribe la versión reducida en una carpeta temporal y, si conviene, la copia sobre el original (que queda en originales/).
async function reemplazar({ dir, name, original, pipeline, esperadas, describir, formato, tolerancia = 1 }) {
  const file = join(dir, name);
  const temp = join(tmpdir(), `optimizar-${name}`); // fuera del proyecto: nada lo vigila mientras se escribe
  await pipeline.toFile(temp);
  const before = original.length;
  const after = statSync(temp).size;
  const check = await sharp(readFileSync(temp), { animated: true, limitInputPixels: false }).metadata();
  const descartar = async (mensaje) => {
    await conReintentos(() => unlinkSync(temp));
    console.log(`${mensaje}`);
  };
  if ((check.pages ?? 1) !== esperadas) return descartar(`! ${name}: al optimizarlo cambió la cantidad de fotogramas (${esperadas} → ${check.pages}). No se cambió el archivo.`);
  if (after >= before * tolerancia) return descartar(`= ${name}: la versión reducida no pesa menos (${formato(after)} vs ${formato(before)}); se deja como está.`);

  mkdirSync(BACKUP, { recursive: true });
  const saved = join(BACKUP, name);
  if (!existsSync(saved)) copyFileSync(file, saved);
  try {
    await conReintentos(() => copyFileSync(temp, file));
  } catch {
    return console.log(`! ${name}: otro programa lo está usando. Cerrá el navegador o el servidor de desarrollo y volvé a correr npm run optimizar.`);
  }
  await conReintentos(() => unlinkSync(temp)).catch(() => {});
  console.log(`✓ ${name}: ${describir(check)}, ${formato(before)} → ${formato(after)}. Original en ${saved}.`);
}

// 1) Gifs y webp animados de la galería.
const animados = listar(GALERIA, /\.(gif|webp)$/i);
for (const name of animados) {
  const file = join(GALERIA, name);
  const input = { animated: true, limitInputPixels: false };
  const original = readFileSync(file); // a memoria: así no queda un handle abierto sobre el archivo
  const meta = await sharp(original, input).metadata();
  const frames = meta.pages ?? 1;
  if (frames < 2) {
    console.log(`= ${name}: imagen fija, no se toca.`);
    continue;
  }
  if (meta.width <= MAX_ANCHO_ANIMACION) {
    console.log(`= ${name}: ${meta.width}×${meta.pageHeight}, ${frames} fotogramas, ${mb(original.length)}. Ya está optimizado.`);
    continue;
  }
  const pipeline = sharp(original, input).resize({ width: MAX_ANCHO_ANIMACION });
  await reemplazar({
    dir: GALERIA,
    name,
    original,
    pipeline: extname(name).toLowerCase() === '.gif' ? pipeline.gif({ effort: 7 }) : pipeline.webp({ quality: 80, effort: 4 }),
    esperadas: frames,
    describir: (m) => `${meta.width}×${meta.pageHeight} → ${m.width}×${m.pageHeight}, ${frames} fotogramas`,
    formato: mb,
  });
}

// 2) Logos PNG de las cajas de proyecto.
for (const name of listar(LOGOS, /\.png$/i)) {
  const file = join(LOGOS, name);
  const original = readFileSync(file);
  const meta = await sharp(original, { limitInputPixels: false }).metadata();
  if (Math.max(meta.width, meta.height) <= MAX_LADO_LOGO) {
    console.log(`= ${name}: ${meta.width}×${meta.height}, ${kb(original.length)}. Ya está optimizado.`);
    continue;
  }
  const pipeline = sharp(original, { limitInputPixels: false })
    .resize({ width: MAX_LADO_LOGO, height: MAX_LADO_LOGO, fit: 'inside', withoutEnlargement: true })
    .png({ compressionLevel: 9, palette: false });
  await reemplazar({
    dir: LOGOS,
    name,
    original,
    pipeline,
    esperadas: 1,
    describir: (m) => `${meta.width}×${meta.height} → ${m.width}×${m.height}`,
    formato: kb,
    tolerancia: 1.15, // en un logo importa la cantidad de píxeles que decodifica el navegador, no solo el peso
  });
}

if (!animados.length && !listar(LOGOS, /\.png$/i).length) console.log('No hay gifs, webp ni logos para revisar.');
