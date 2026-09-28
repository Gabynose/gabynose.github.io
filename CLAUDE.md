# CLAUDE.md

Portfolio de una sola página de **Gabriel Boggia** (desarrollador de software que diseña y programa webs para clientes). Objetivo único: que un posible cliente confíe y escriba. Si algo no acerca al contacto, sobra.

## Documentos de referencia

Leerlos antes de cambiar algo visual o de contenido. Son decisiones cerradas del usuario.

- `docs/00-COMO-BRIEFEAR.MD`: cómo quiere trabajar el usuario (por fases, validando cada corte).
- `docs/01-BRIEF.MD`: brief de marca y estilo.
- `docs/02-REFERENCIAS.md`: 4 webs de referencia; de cada una se toma **solo** la pieza indicada.
- `docs/03-SECCIONES.MD`: estructura de la página.
- `docs/04-CONTENIDO.MD`: textos de perfil.
- `docs/Prototipo de template.png`: wireframe.
- `PRODUCT.md`: contexto de producto (usuarios, compromisos de marca, pendientes).
- `DESIGN.md` y `.impeccable/design.json`: sistema de diseño documentado a partir del código (tokens, tipografía, movimiento, reglas).

Si el brief y una sugerencia de diseño chocan, **manda el brief**.

## Stack

- **Vite 8** con **JavaScript vanilla** (módulos ES) y **CSS plano**, sin framework ni preprocesador.
- **Three.js 0.186**: el cubo Rubik 3D. Corre en un **Web Worker con OffscreenCanvas**; si el navegador no lo soporta, corre en el hilo principal.
- **Lenis 1.3**: scroll suave.
- **Fuentes self-host** (OFL) en `public/fonts/`: Schibsted Grotesk y Inter, solo 400 y 700, subset latin. **Excepción: el nombre del inicio usa Satoshi 900** (Fontshare, ITF Free Font License), cargada desde `cdn.fontshare.com` (`@font-face` en `fonts.css`, preload en `index.html`). NO subirla a `public/fonts/` ni al repo: la licencia prohíbe subir los archivos a un servidor público. Si Fontshare no responde, el nombre cae a Schibsted Grotesk.
- Salida estática (`dist/`), apta para cualquier hosting estático (Netlify, Vercel, GitHub Pages…).

## Comandos

```bash
npm install        # dependencias
npm run dev        # servidor de desarrollo en http://localhost:5173
npm run build      # build de producción en dist/
npm run preview    # sirve dist/ en http://localhost:4173
```

Abrir `index.html` con doble clic no funciona: hace falta el servidor de Vite. No hay tests automatizados. La verificación se hace en el navegador (ver "Verificación").

## Estructura

```
index.html              Esqueleto: <nav> y 4 <section> con data-render; meta/OG; precarga de fuentes
vite.config.js          worker.format 'es'; límite de aviso de chunk (el cubo pesa ~140 KB gzip); plugin de chequeo
vite-plugin-proyectos.js  Chequeo de logos/galería de src/proyectos.js en dev y build (mensajes en español)
public/
  fonts/                woff2 con nombre fijo (se precargan desde index.html) + licencias
  placeholders/         SVG provisorios (proyecto, foto, favicon)
  proyectos/            Galerías de proyectos; logos/ = PNG sin fondo de cada proyecto (+ logo-prueba-*.png)
  robots.txt
src/
  content.js            Archivo de contenido: textos, enlaces e imágenes (salvo proyectos)
  proyectos.js          Lista de proyectos: agregar/quitar/editar acá (plantilla comentada arriba)
  projects/
    model.js            Normaliza cada proyecto de proyectos.js (valida color/efecto, avisa en consola dev)
    paths.js            Nombre de logo → ruta (/proyectos/logos/); sin DOM, lo usa también el plugin de Vite
    light.js            Color de marca → --glow, --glow-2, --rim ("r g b")
    logo-box.js         Caja del proyecto (fondo + luz + efecto + halo + logo); setBoxActive / setBoxInView
    fire.js             Efecto fuego en canvas (humo + chispas, imagen fija que se dibuja una vez)
  main.js               Punto de entrada: importa estilos, renderiza y arranca módulos
  render.js             Recorre [data-render] y llama al componente de cada sección
  dom.js                Helpers: el() (crear nodos), icon(), brandIcon(), revealWords(), prefersReducedMotion()
  components/           nav, hero, problema, proyectos (grid + vista detalle), contacto (tarjetas + formulario)
  motion/
    intro.js            Entrada orquestada de la página (nombre del hero + nav píldora)
    reveal.js           Aparición al entrar en pantalla (palabras por máscara + ítems)
    grid.js             Cuadrícula de fondo en movimiento constante (sincronizada entre página y detalle)
    scroll.js           Lenis + enlaces internos suaves + lockScroll()
  cube/
    cube.js             Escena pura del cubo (sin DOM): createCubeScene(canvas, opciones)
    cube.worker.js      Worker que ejecuta la escena
    mount.js            Conecta el cubo con la página: tamaño, visibilidad, arrastre; fallback sin Worker
  crosses/crosses.js    Canvas 2D de cruces "+" que se pelean por el centro
  styles/               tokens.css (variables), base, layout, fonts y un CSS por sección
```

## Cómo funciona

- **Inicio (hero):** raya verde + rol en mayúsculas espaciadas (`hero.subtitulo`), nombre en 2 líneas, bajada (`hero.descripcion`) y botón `hero.cta`. Todo sale de `src/content.js`. En el apellido (última palabra), `hero.js` envuelve la "g" y la "a" en `.hero__cut` e imita la referencia del usuario con pseudo-elementos del color del fondo: en cada "g", una cuña diagonal en la unión del cuenco con la tija (no una línea recta); en la "a", una línea vertical suave (~0.036em) desde su ojo hasta la línea base. La cuña es un SVG con desenfoque (no `clip-path`, que recortaría el borde difuso); tamaños calibrados píxel a píxel contra la referencia (cuña ~0.16em de largo y ~0.09em de alto en la tija). Medidas en `em` tomadas de la referencia ampliada sobre Satoshi 900 (si cambia la fuente, volver a medir; comparar con un screenshot a 5x). El usuario pidió sacar "Disponible para trabajar". **El cubo (`.hero__visual`, `.cube`, `src/cube/`) no se toca**.
- **Contenido:** todo sale de `src/content.js`, salvo los proyectos, que salen de `src/proyectos.js`. Para cambiar un texto se edita ahí, sin tocar HTML ni CSS. `null` = dato pendiente.
- **Proyectos (`src/proyectos.js`):** cada uno lleva `logo: { src, color, color2? }` y `efecto` opcional (`'fuego'` | `'orbita'`; sin la línea, solo glow). En `src` va **solo el nombre del archivo**; `src/projects/paths.js` le agrega `/proyectos/logos/` (una ruta completa se respeta).
- **Proyectos pendientes:** un proyecto sin logo real (`logo-prueba-*`, `/placeholders/` o sin `src`) queda `pendiente` (`isPending` en `model.js`) y `content.js` lo saca de la lista: no ocupa lugar en la grilla. Con cantidad impar, la última caja queda centrada (CSS `.project:last-child:nth-child(odd)`). Al subir el logo real, la caja vuelve sola al layout de 2 por fila. En dev, la consola avisa qué proyecto quedó oculto.
- **Galería del detalle:** acepta `.jpg`, `.png`, `.webp` y `.gif` (los gifs se animan solos, es un `<img>` común). `model.js` descarta los placeholders (`/placeholders/...`): si un proyecto no tiene imágenes reales, el bloque de galería no se muestra. Puede tener 1, 2, 3 o más imágenes.
- **Rendimiento en PCs lentas (`src/perf.js`):**
  - Modo liviano automático (`html.is-lite`), solo si hay evidencia: 2 núcleos o menos, 2 GB o menos, ahorro de datos, o cuadros lentos (>40 ms en el 20 % de 90 cuadros) **medidos durante el scroll**, sin contar los primeros 2,5 s (la carga inicial es pesada hasta en PCs rápidas). 4 núcleos no alcanza. Se recuerda en `sessionStorage`. Prueba: `?lite=1` fuerza, `?lite=0` apaga.
  - En lite: Lenis se destruye (scroll nativo: no depende del hilo principal), sin grano en las cajas, cruces a 120 partículas y ~30 fps, cubo a 1x sin antialias, nav y botón "Volver" sin `backdrop-filter`. Fuera de lite no cambia nada.
  - Causas medidas del lag al llegar a Proyectos (CPU 6x, LoAF): decodificación síncrona de logos de 1600 px en `measure()`, 300 `stroke` por cuadro en las cruces, reflow forzado por palabra en `setDelays()`. Ya corregidas: logos a 1000 px (`npm run optimizar`), medición asíncrona con `createImageBitmap` y en fila, cruces con un trazo por nivel de opacidad, lecturas de layout antes de las escrituras.
  - **Decisión del usuario (rendimiento):** las cajas NO tienen animaciones continuas. Se quitó la respiración del glow (y su capa de halo con blur + máscara), el cometa de la órbita y las chispas vivas del fuego. No volver a agregar animaciones infinitas dentro de las cajas: en gama baja el desenfoque animado x4 cajas es lo más caro de pintar.
  - Cómo medir: Edge headless + `Emulation.setCPUThrottlingRate` 6, rueda del mouse hasta `#proyectos`, `PerformanceObserver('long-animation-frame')` (da qué función bloquea cada cuadro). Objetivo: 0-1 cuadros >50 ms en la zona de Proyectos. El primer arranque de cada navegador de prueba siempre muestra un pico en frío: descartarlo.
- **Gifs y webp animados (titileo):**
  - Las imágenes de galería animadas se cargan de entrada (no `lazy`): una animación a medio bajar repite solo los cuadros recibidos. Llevan la clase `detail__anim` (`will-change: transform`, capa propia).
  - `npm run optimizar` (`scripts/optimizar-galeria.mjs`) reduce los gifs/webp animados de `public/proyectos/` a 1280 px de ancho (mismos fotogramas y tiempos) y los logos PNG de `public/proyectos/logos/` a 1000 px de lado mayor (PNG RGBA sin pérdida: NO usar `effort`, `sharp` lo pasa a paleta de 256 colores y degrada el glow). Los originales quedan en `originales/` (gitignored). Es idempotente. Ojo: sin argumentos procesa TODO, incluidos gifs que el usuario esté verificando; para uno solo, `npm run optimizar -- nombre.png`. Si dice que otro programa usa el archivo, cerrar el servidor de desarrollo y reintentar.
  - El chequeo de Vite avisa si una animación mide más de 1280 px, pesa más de 4 MB o tiene 1 solo fotograma.
  - Los archivos que llegan por el chat son capturas fijas: el original animado se copia desde la PC.
- **Logos a prueba de errores** (el usuario sube logos solo, sin pasar por Claude):
  - `vite-plugin-proyectos.js` corre en `npm run dev` (terminal + cartel de Vite, en vivo al guardar) y en `npm run build`: que el logo exista con el nombre exacto (mayúsculas: Windows no las distingue, el hosting sí), que sea PNG con transparencia y buena resolución, que existan las imágenes de galería. Un logo inexistente o con mayúsculas distintas **frena el build**; lo demás avisa.
  - En la página: si la ruta apunta a otra carpeta, se reintenta con el mismo nombre en `/proyectos/logos/`; si el archivo no existe, la caja muestra el nombre del proyecto con su luz (`is-missing`), nunca una imagen rota. El `id` se genera por posición. Quitar un bloque o dejar cantidad impar no rompe nada (la última caja se centra; con lista vacía la sección se oculta). Un color o efecto mal escrito no rompe: avisa en consola de desarrollo y usa un valor seguro.
  - Títulos con línea resaltada (negro sobre blanco): `{ texto, resaltado: true }`.
  - Párrafos con saltos: array de líneas.
  - `nav.items[].destacado` = botón de la derecha en la píldora.
  - **Formulario → WhatsApp (activo):** `contacto.whatsapp = { numero, mensaje }`. Al enviar, valida y abre `https://wa.me/<numero>?text=…` en pestaña nueva (un `<a target=_blank>` con `click()`, no `window.open`, que con `noopener` devuelve `null`), con la plantilla `Hola, soy {nombre}... {mensaje} Este es mi mail: {email}` (al mensaje se le agrega el punto final si no termina en `.!?…`). Número actual: +54 9 11 5163-3140 (`5491151633140`). Tiene prioridad sobre `endpoint`/mailto: con `numero: null` vuelve el flujo de abajo. Con WhatsApp activo, Turnstile no se carga.
  - **Formulario → Worker (inactivo mientras haya WhatsApp):** `contacto.endpoint` = URL del Cloudflare Worker (`worker/`); `contacto.turnstileSiteKey` = Site Key pública de Turnstile. Mientras `endpoint` sea `null`, se abre el mailto del visitante.
    - Flujo: navegador → Worker (valida origen, datos, campo trampa `empresa`, token Turnstile y límite de 3 envíos/min por IP) → Resend → mail a gabrielboggia@gmail.com, con "responder a" apuntando al visitante.
    - Las claves (`RESEND_API_KEY`, `TURNSTILE_SECRET`) viven solo como secretos del Worker: nunca en el repo (es público en GitHub Pages). Pasos de deploy: `worker/README.md`.
    - No usar Web3Forms: su plan gratis no acepta envíos desde servidor.
    - Turnstile se carga diferido (cerca del formulario o al enfocarlo), para no afectar a Lighthouse.
    - Para probar sin cuentas: las claves de prueba oficiales de Turnstile (site `1x00000000000000000000AA`, secret `1x0000000000000000000000000000000AA`) y un servidor Node que sirva `worker/contact.js` con Resend simulado.
- **Render:** el HTML trae contenedores vacíos con `data-render`. `render.js` los rellena con los componentes, que usan `el()`. No hay HTML prerenderizado.
- **Cubo:** `mount.js` espera a `load` + tiempo libre y crea un `<canvas>`. Si hay OffscreenCanvas, lo transfiere al Worker y habla con él por `postMessage` a través de un Proxy. La escena mezcla el cubo, lo "resuelve" ejecutando la inversa de la mezcla, gira siempre en un sentido y se puede arrastrar con inercia. Los tiempos del arrastre viajan como `event.timeStamp`.
- **Caja de proyecto (`logo-box.js`):** el logo PNG sin fondo sobre `#080808`, con la luz de su color de marca.
  - Capas: neblina, efecto opcional (órbita SVG o canvas de fuego), halo (silueta del PNG por máscara CSS, difuminada), logo con `drop-shadow` y grano. La luz se dimensiona con lo que ocupa el logo real (`--logo-w`/`--logo-h`) y en `cqi`, así tarjeta, detalle y mobile se ven iguales.
  - Recorte automático: al cargar, se mide el dibujo dentro del PNG (canal alfa sobre una copia de 256 px) y el margen transparente queda fuera del marco (`--crop-*` para la imagen, `--mask-*` para el halo). El usuario puede subir logos con o sin margen.
  - Todo se enciende (`is-lit`) recién cuando el logo está medido; la luz aparece con un fundido único. El glow es estático: neblina + `drop-shadow` del logo.
  - **Interacción A** (`is-active`, hover con mouse o foco de teclado visible; no táctil): más luz, logo elevado y borde teñido. Solo transiciones CSS, sin bucles.
  - `efecto` (opcional): `orbita` = elipse fija con estela; `fuego` = humo y chispas dibujados una vez en canvas (semilla = ruta del logo, igual en tarjeta y detalle). Ninguno se anima.
- **Vista detalle de proyectos:** es un `<dialog>` modal que se abre encima de la vista general.
  - La cabecera es la misma caja, siempre con la luz de la Interacción A encendida mientras el detalle está abierto.
  - Al abrir, vuela la cabecera **real** desde la tarjeta (FLIP sobre la `figure`), ya encendida. Al cerrar, todo se desvanece rápido (~0,36 s) y el cierre se puede cortar en cualquier momento.
  - Mientras está abierta, la vista general queda oculta (`html.is-detail-open`) y el scroll bloqueado (`lockScroll`).
  - La máquina de estados es `closed | opening | open | closing`. El evento `close` se ignora si el diálogo ya se reabrió.
- **Movimiento:** una sola curva, `cubic-bezier(0.19, 1, 0.22, 1)`. Todo respeta `prefers-reduced-motion`:
  - Sin entradas ni revelados.
  - Cuadrícula quieta.
  - El cubo gira más lento y sin giros de capa.
  - Lenis desactivado.

## Reglas de diseño (no romper)

- **Monocromo con un solo acento:** fondo `#050505`, texto blanco, grises por opacidad. El único color propio es el verde `#3ddc84` (`--c-accent`), usado solo en el inicio: raya sobre el nombre, borde del botón "Ver proyectos" y brillo bajo el enlace activo de la nav. No usarlo en otras secciones sin preguntar.
- **Excepción (update de Proyectos, decidida por el usuario):** el color de marca de cada proyecto vive **solo dentro de su caja** (luz, efecto, borde encendido). Nunca en textos, botones ni fondos. El logo nunca se recolorea.
- **Tipografía:** Schibsted Grotesk para titulares, Inter para etiquetas y datos. **Solo pesos 400 y 700**, nunca intermedios. Única excepción, pedida por el usuario: el nombre del inicio (`.hero__name`) en Satoshi 900, tracking -0.04em, interlineado 0.92. Satoshi solo existe como archivo estático en 900 (no hay 800).
- **Sin** emojis, degradados de marca, fondos de partículas ni tema claro (solo oscuro).
- **Fondo:** cuadrícula de líneas blancas finas, en movimiento constante y lento.
- **Densidad:** baja, mucho aire; ante la duda, quitar.
- **Front-end en español rioplatense** (voseo: "Contá", "Sabés").
- **Iconos:** SVG dibujados (`dom.js`), nunca glifos ni emojis.
- **Navegación:** solo texto (sin números 01/02…).

## Forma de trabajar con el usuario

- **Por fases:** no avanzar a la siguiente sin su OK explícito.
- **Verificar en el navegador** antes de decir que algo está hecho (capturas, medidas en consola, estados).
- **Preguntar antes de asumir** si algo es ambiguo o falta.
- **No reescribir su copy sin avisar:** señalar el problema y dejar que decida.
- **Estilo de respuesta:** usa el modo "caveman" (respuestas cortas); los documentos persistentes se escriben en prosa normal.

## Verificación y gotchas

- **Movimiento reducido del sistema:** si Windows tiene "Efectos de animación" apagado, el navegador reporta `prefers-reduced-motion: reduce` y no se ven la entrada, los revelados ni la resolución del cubo.
- **Panel de navegador oculto:** si el panel integrado está oculto, `requestAnimationFrame`, las animaciones y los IntersectionObserver se congelan. Para verificar, forzar fotogramas con capturas, o adelantar animaciones con `getAnimations().forEach(a => a.finish())`.
- **Capturas con scroll:** en el panel suelen salir en blanco. Mejor ocultar secciones anteriores o usar un viewport alto.
- **Panel colapsado:** a veces `innerWidth` queda en 0 y todo mide 0 (los canvas no se dibujan). Fijar un viewport con `resize_window` (p. ej. 1280×720) antes de probar.
- **rAF congelado:** para probar movimiento de canvas con el panel oculto, reemplazar temporalmente `window.requestAnimationFrame` por un `setTimeout` de 16 ms.
- **`var()` dentro de `@keyframes`** para `stroke-dashoffset` no funcionó: usar keyframes explícitos.
- **Proxy del Worker:** debe devolver `undefined` para `then`; si no, la Promise lo trata como thenable y nunca resuelve.
- **Aviso de chunk grande:** Vite avisa por el tamaño de three; el límite subido en `vite.config.js` es intencional.
- **Auditoría usada en la fase 7:**
  - Lighthouse contra `npm run preview`: 100 en rendimiento, accesibilidad, buenas prácticas y SEO, en mobile y en escritorio.
  - axe-core en 4 estados, sin violaciones.
  - Barrido de 320 a 1920 px, sin desbordes.
  - Mantener esos niveles.

## Pendiente (placeholders actuales)

- Proyectos reales: logo PNG sin fondo + color de marca, 3 de galería, título, descripción, problema y solución. Hoy son lorem, logos de prueba (`placeholders/logos/`) y `placeholders/proyecto.svg`. Medidas y carpetas en `ASSETS.md`.
- Foto real para la tarjeta de contacto (cuadrada, ≥400×400); hoy es `placeholders/foto.svg` con alt "Foto pendiente".
- Logo (hoy el monograma "GB"), favicon e imagen OG.
- URL de GitHub (el icono aparece solo al cargarla).
- Deploy del formulario (lo hace el usuario, ver `worker/README.md`): cuentas de Resend y Cloudflare, secretos, `wrangler deploy`, y cargar `endpoint` y `turnstileSiteKey` en `content.js`.
- Hosting: GitHub Pages en `https://gabynose.github.io` (repo `Gabynose/gabynose.github.io`, público). `.github/workflows/deploy.yml` compila y publica en cada push a `main` (el chequeo de logos puede frenar la publicación). `docs/` no se sube (está en `.gitignore`). Dominio propio: pendiente, opcional.
- Decisiones de copy abiertas:
  - Tilde en "Contá **qué** tenés en mente".
  - "Agendá una llamada" promete agendar, pero falta un enlace de reserva o hay que cambiar el texto.
