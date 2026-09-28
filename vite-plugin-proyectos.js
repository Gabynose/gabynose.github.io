// Chequeo de los archivos de src/proyectos.js, en `npm run dev` y en `npm run build`.
// Revisa que cada logo exista con el nombre exacto (mayúsculas incluidas: el hosting las distingue
// aunque Windows no), que sea PNG con transparencia, y que existan las imágenes de galería.
// Explica en español qué está mal y cómo arreglarlo. En build, un logo inexistente frena la publicación.
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const PNG_SIGNATURE = '89504e470d0a1a0a';

// Busca la ruta segmento a segmento comparando nombres exactos.
// 'ok' | 'case' (existe con otras mayúsculas; devuelve el nombre real) | 'missing'.
function findExact(publicDir, url) {
  let dir = publicDir;
  const segments = url.split('/').filter(Boolean);
  let caseMismatch = false;
  const real = [];
  for (const segment of segments) {
    let entries;
    try {
      entries = readdirSync(dir);
    } catch {
      return { status: 'missing' };
    }
    const exact = entries.find((name) => name === segment);
    const loose = exact ?? entries.find((name) => name.toLowerCase() === segment.toLowerCase());
    if (!loose) return { status: 'missing' };
    if (!exact) caseMismatch = true;
    real.push(loose);
    dir = join(dir, loose);
  }
  return caseMismatch ? { status: 'case', real: `/${real.join('/')}` } : { status: 'ok', file: dir };
}

// Fotogramas y tamaño de un gif o un webp (1 fotograma = imagen fija). null = otro formato.
function mediaInfo(file) {
  const b = readFileSync(file);
  if (b.subarray(0, 3).toString('latin1') === 'GIF') {
    let pos = 13 + (b[10] & 0x80 ? 3 * (1 << ((b[10] & 7) + 1)) : 0);
    let frames = 0;
    const skipBlocks = () => { while (pos < b.length && b[pos] !== 0) pos += b[pos] + 1; pos++; };
    while (pos < b.length && b[pos] !== 0x3b) {
      if (b[pos] === 0x21) { pos += 2; skipBlocks(); }
      else if (b[pos] === 0x2c) {
        frames++;
        const packed = b[pos + 9];
        pos += 10 + (packed & 0x80 ? 3 * (1 << ((packed & 7) + 1)) : 0) + 1;
        skipBlocks();
      } else break;
    }
    return { frames, width: b.readUInt16LE(6), height: b.readUInt16LE(8) };
  }
  if (b.subarray(0, 4).toString('latin1') === 'RIFF' && b.subarray(8, 12).toString('latin1') === 'WEBP') {
    const extended = b.subarray(12, 16).toString('latin1') === 'VP8X';
    return {
      frames: extended && b[20] & 0x02 ? (b.toString('latin1').match(/ANMF/g) ?? []).length : 1,
      width: extended ? b.readUIntLE(24, 3) + 1 : 0,
      height: extended ? b.readUIntLE(27, 3) + 1 : 0,
    };
  }
  return null;
}
function pngInfo(file) {
  const bytes = readFileSync(file);
  if (bytes.subarray(0, 8).toString('hex') !== PNG_SIGNATURE) return { png: false };
  const colorType = bytes[25];
  const alpha = colorType === 4 || colorType === 6 || bytes.includes(Buffer.from('tRNS'));
  return { png: true, alpha, width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20) };
}

async function load(root, file) {
  // Query única: Node cachea los módulos y el archivo pudo cambiar.
  return import(`${pathToFileURL(join(root, file)).href}?t=${Date.now()}`);
}

async function check(root) {
  const publicDir = join(root, 'public');
  const { proyectos } = await load(root, 'src/proyectos.js');
  const { logoUrl, logoInLogosDir, LOGOS_DIR } = await load(root, 'src/projects/paths.js');
  const logosDir = join(publicDir, ...LOGOS_DIR.split('/').filter(Boolean));
  let available = [];
  try {
    available = readdirSync(logosDir).filter((name) => statSync(join(logosDir, name)).isFile() && !name.startsWith('.'));
  } catch {}

  const errors = [];
  const warnings = [];
  proyectos.forEach((project, index) => {
    const title = project.titulo ?? `Proyecto ${index + 1}`;
    const say = (message) => `"${title}": ${message}`;
    const src = project.logo?.src;
    if (!src) {
      errors.push(say(`falta logo.src. Poné el nombre del PNG que está en public${LOGOS_DIR}, ej. src: 'marca.png'.`));
      return;
    }
    const url = logoUrl(src);
    const found = findExact(publicDir, url);

    if (found.status === 'missing') {
      const name = url.split('/').pop();
      const inLogos = findExact(publicDir, logoInLogosDir(url));
      if (inLogos.status === 'ok') {
        warnings.push(say(`el logo no está en "${url}", pero sí en public${LOGOS_DIR}. La página lo encuentra igual; para dejarlo prolijo poné src: '${name}'.`));
        return;
      }
      const similar = available.find((file) => file.toLowerCase() === name.toLowerCase());
      const hint = similar
        ? ` ¿Quisiste decir src: '${similar}'? (las mayúsculas tienen que coincidir)`
        : available.length
          ? ` En public${LOGOS_DIR} hay: ${available.join(', ')}.`
          : ` Subí el PNG a public${LOGOS_DIR} y poné su nombre en src.`;
      errors.push(say(`no existe el logo "${url}".${hint}`));
      return;
    }
    if (found.status === 'case') {
      errors.push(say(`el logo "${url}" existe como "${found.real}". En tu PC funciona, pero en el hosting no: escribilo con las mismas mayúsculas.`));
      return;
    }

    const info = pngInfo(found.file);
    if (!info.png) warnings.push(say(`"${url}" no es un PNG (aunque se llame así). Exportalo como PNG sin fondo.`));
    else if (!info.alpha) warnings.push(say(`"${url}" no tiene transparencia: se va a ver su fondo dentro de la caja. Exportalo como PNG sin fondo.`));
    else if (Math.max(info.width, info.height) < 600) warnings.push(say(`"${url}" mide ${info.width}×${info.height}; puede verse borroso en la vista detalle (ideal: el dibujo con 1200 px o más de lado mayor).`));
    else if (Math.max(info.width, info.height) > 1000) warnings.push(say(`"${url}" mide ${info.width}×${info.height}: se muestra a ~330 px y el navegador decodifica todos sus píxeles, lo que traba el scroll en PCs lentas. Corré npm run optimizar (guarda el original en originales/).`));

    for (const image of project.galeria ?? []) {
      if (!image?.src?.startsWith('/')) continue;
      const g = findExact(publicDir, image.src);
      if (g.status === 'missing') warnings.push(say(`no existe la imagen de galería "${image.src}".`));
      if (g.status === 'case') warnings.push(say(`la imagen de galería "${image.src}" existe como "${g.real}" (revisá mayúsculas).`));
      const animated = g.status === 'ok' && /[.](gif|webp)$/i.test(image.src) ? mediaInfo(g.file) : null;
      if (g.status === 'ok' && statSync(g.file).size > 4 * 1024 * 1024) warnings.push(say(`"${image.src}" pesa ${(statSync(g.file).size / 1048576).toFixed(1)} MB: tarda en cargar. Si es un gif o webp animado, corré npm run optimizar.`));
      if (animated && animated.frames > 1 && animated.width > 1280) warnings.push(say(`"${image.src}" es una animación de ${animated.width}×${animated.height}: se muestra a ~960 px y cada cuadro se escala, lo que puede hacerla titilar. Corré npm run optimizar (guarda el original en originales/).`));
      if (g.status === 'ok' && animated && animated.frames === 1) {
        warnings.push(say(`"${image.src}" tiene 1 solo fotograma: no se va a animar. Si esperabas movimiento, este archivo es una captura fija (pasa cuando se arrastra o se pega desde otra app). Copiá el archivo animado original a public/proyectos/. Si es una imagen fija a propósito, ignorá este aviso.`));
      }
    }
  });
  return { errors, warnings };
}

export function checkProyectos() {
  let root;
  let isBuild = false;

  const report = (logger, { errors, warnings }) => {
    for (const message of warnings) logger.warn(`\x1b[33m[proyectos] ${message}\x1b[0m`);
    for (const message of errors) logger.error(`\x1b[31m[proyectos] ${message}\x1b[0m`);
  };

  return {
    name: 'check-proyectos',
    configResolved(config) {
      root = config.root;
      isBuild = config.command === 'build';
    },
    async buildStart() {
      const result = await check(root);
      if (isBuild) {
        for (const message of result.warnings) this.warn(`[proyectos] ${message}`);
        if (result.errors.length) this.error(`\n[proyectos] ${result.errors.join('\n[proyectos] ')}`);
      }
    },
    configureServer(server) {
      let errors = [];
      // En el navegador, un error de logo se ve en el cartel de Vite hasta que se arregla.
      // Se reenvía en cada conexión: al guardar proyectos.js la página se recarga y el cartel se borraría.
      const showOverlay = () => {
        if (!errors.length) return;
        server.ws.send({
          type: 'error',
          err: { message: `[proyectos]\n${errors.join('\n')}`, stack: '', plugin: 'check-proyectos' },
        });
      };
      const run = async () => {
        try {
          const result = await check(root);
          errors = result.errors;
          report(server.config.logger, result);
          showOverlay();
        } catch (error) {
          server.config.logger.error(`[proyectos] no se pudo leer src/proyectos.js: ${error.message}`);
        }
      };
      server.ws.on('connection', showOverlay);
      run();
      const relevant = (file) => /[\\/]src[\\/]proyectos\.js$|[\\/]public[\\/]proyectos[\\/]/.test(file);
      for (const event of ['change', 'add', 'unlink']) server.watcher.on(event, (file) => relevant(file) && run());
    },
  };
}
