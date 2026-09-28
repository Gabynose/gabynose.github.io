import './styles/fonts.css';

import 'lenis/dist/lenis.css';
import './styles/tokens.css';
import './styles/base.css';
import './styles/layout.css';
import './styles/nav.css';
import './styles/hero.css';
import './styles/problema.css';
import './styles/reveal.css';
import './styles/proyectos.css';
import './styles/contacto.css';

import { content } from './content.js';
import { render } from './render.js';
import { setupPerf } from './perf.js';
import { playIntro } from './motion/intro.js';
import { mountCube } from './cube/mount.js';
import { mountCrosses } from './crosses/crosses.js';
import { setupReveals } from './motion/reveal.js';
import { prefersReducedMotion } from './dom.js';
import { setupScroll } from './motion/scroll.js';
import { setupGrid } from './motion/grid.js';
import { setupProyectos } from './components/proyectos.js';
import { setupContacto } from './components/contacto.js';

setupPerf(); // antes de todo: el modo liviano condiciona lo que se arma
render(content);
setupGrid();
playIntro();
mountCube(document.querySelector('[data-cube]'));
mountCrosses(document.querySelector('[data-crosses]'), { reducedMotion: prefersReducedMotion() });
setupReveals();
setupProyectos(content);
setupContacto(content);
setupScroll();
