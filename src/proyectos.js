// Proyectos del portfolio. Este es el único lugar donde se agregan, editan o quitan.
//
// Agregar: copiá la plantilla de abajo al final de la lista y completá los datos.
// Quitar: borrá el bloque { ... } entero del proyecto.
// El orden de la lista es el orden en la página. Guardá y recompilá (npm run build).
//
// Plantilla:
//
//   {
//     titulo: 'Nombre del proyecto',
//     descripcion: 'Una o dos líneas: qué es y para quién.',
//     logo: {
//       src: 'nombre.png',                // solo el nombre del PNG sin fondo que subiste a public/proyectos/logos/
//       color: '#7c3aed',                  // color principal de la marca: tiñe la luz de la caja
//       color2: '#c026d3',                 // opcional: segundo color de la marca
//     },
//     efecto: 'fuego',                     // opcional: 'fuego' (humo y chispas) u 'orbita' (curva de luz).
//                                          // Sin esta línea, la caja lleva solo el glow.
//     problema: 'Qué problema tenía el cliente.',
//     solucion: 'Qué se hizo y qué cambió.',
//     galeria: [
//       { src: '/proyectos/nombre-galeria-1.jpg', alt: 'Qué se ve en la imagen' },
//       { src: '/proyectos/nombre-galeria-2.jpg', alt: 'Qué se ve en la imagen' },
//       { src: '/proyectos/nombre-galeria-3.jpg', alt: 'Qué se ve en la imagen' },
//     ],
//   },

const LOREM_CORTO =
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer posuere erat a ante venenatis dapibus.';
const LOREM_LARGO =
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum id ligula porta felis euismod semper. Cras mattis consectetur purus sit amet fermentum. Donec ullamcorper nulla non metus auctor fringilla.';
const PENDIENTE = { src: '/placeholders/proyecto.svg', alt: 'Imagen pendiente' };

export const proyectos = [
  {
    titulo: 'Automatic Form',
    descripcion: 'Rellena automáticamente valores de un formulario.',
    logo: { src: 'proyecto-1-principal.png', color: '#204ddf', color2: '#ffffff' },
    
    problema: "Oficinistas tenian problemas con el rellenado de datos de una plataforma, tardaban mucho y se equivocaban en las cosas que ponían.",
    solucion: "Se desarrolló una herramienta que permite rellenar automáticamente los campos de un formulario, con la posibilidad de personalizar los valores a rellenar y extenderse hacia otras plataformas.",
    galeria: [PENDIENTE, PENDIENTE, PENDIENTE],
  },
  {
    titulo: 'Pool Over',
    descripcion: "Landing page para un bar de pool.",
    logo: { src: 'proyecto-2-principal.png', color: '#f97316', color2: '#380303' },
    
    problema: "El bar necesitaba una landing page para promocionar sus servicios, atraer clientes y realizar reservas.",
    solucion: "Se desarrolló una landing page con un diseño atractivo y funcional, que permite a los clientes conocer los servicios del bar y reservar antes de ir.",
    galeria: [{ src: '/proyectos/proyecto-2-galeria-1.jpg', alt: 'Imagen 1 del proyecto 2' }, { src: '/proyectos/proyecto-2-galeria-2.jpg', alt: 'Imagen 2 del proyecto 2' }, { src: '/proyectos/proyecto-2-galeria-3.jpg', alt: 'Imagen 3 del proyecto 2' }],
  },
  {
    titulo: 'Flowly',
    descripcion: "En desarrollo.",
    logo: { src: 'logo-prueba-3.png', color: '#22d3ee' },
    efecto: 'orbita',
    problema: LOREM_LARGO,
    solucion: LOREM_LARGO,
    galeria: [PENDIENTE, PENDIENTE, PENDIENTE],
  },
  {
    titulo: 'Proyecto 4',
    descripcion: LOREM_CORTO,
    logo: { src: 'logo-prueba-4.png', color: '#3b82f6' },
    problema: LOREM_LARGO,
    solucion: LOREM_LARGO,
    galeria: [PENDIENTE, PENDIENTE, PENDIENTE],
  },
];
