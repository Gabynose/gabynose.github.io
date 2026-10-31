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
//     tipo: 'celular',                     // opcional: 'web' (por defecto) o 'celular'. Celular = galería con 3 capturas verticales una al lado de la otra.
//     // ALTERNATIVA a `logo`: vista previa de tipo imagen. La caja se llena con una imagen 4:3 (sin glow ni efecto).
//     // imagen: {
//     //   src: 'nombre.jpg',                // solo el nombre del archivo que subiste a public/proyectos/previews/ (ideal 1600x1200)
//     //   alt: 'Qué se ve en la imagen',     // opcional
//     //   color: '#7c3aed',                  // opcional: tiñe el borde al pasar el mouse
//     // },
//     efecto: 'fuego',                     // opcional: 'fuego' (humo y chispas fijos) u 'orbita' (curva de luz fija).
//                                          // Sin esta línea, la caja lleva solo el glow.
//     problema: 'Qué problema tenía el cliente.',
//     solucion: 'Qué se hizo y qué cambió.',
//     galeria: [                            // imágenes .jpg, .png, .webp o .gif (los gifs se animan solos)
//       { src: '/proyectos/nombre-galeria-1.jpg', alt: 'Qué se ve en la imagen' },
//       { src: '/proyectos/nombre-galeria-2.jpg', alt: 'Qué se ve en la imagen' },
//       { src: '/proyectos/nombre-galeria-3.jpg', alt: 'Qué se ve en la imagen' },
//       // Podés poner 1, 2, 3 o más. Sin galería (o sin la línea), el detalle no muestra ese bloque.
//     ],
//   },

const LOREM_CORTO =
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer posuere erat a ante venenatis dapibus.';
const LOREM_LARGO =
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum id ligula porta felis euismod semper. Cras mattis consectetur purus sit amet fermentum. Donec ullamcorper nulla non metus auctor fringilla.';
const PENDIENTE = { src: '/placeholders/proyecto.svg', alt: 'Imagen pendiente' };

export const proyectos = [
  {
    titulo: 'Game Feelings',
    descripcion: 'Contale a un asistente qué juego tenés ganas de jugar y te recomienda opciones a tu medida.',
    imagen: { src: 'game-feelings-preview.jpg', alt: 'Chao, el asistente de Game Feelings, preguntando qué tipo de juego buscás', color: '#38bdf8' },
    problema: 'Elegir qué jugar es agotador: hay miles de títulos y los filtros clásicos por género o puntaje no entienden lo que uno realmente quiere. Terminás mirando listas interminables o repitiendo siempre los mismos juegos.',
    solucion: 'Game Feelings convierte la búsqueda en una charla. Escribís con tus palabras lo que tenés ganas de jugar, por ejemplo "una aventura cooperativa para Switch", y una inteligencia artificial interpreta tus gustos y elige las recomendaciones. Después la app busca cada juego en la API de RAWG, una de las bases de videojuegos más grandes que existen, y te muestra las tapas, el año y el nombre en un carrusel listo para explorar. Todo con un asistente simpático que te acompaña, sonido y modo claro y oscuro.',
    galeria: [
      { src: '/proyectos/proyecto-4-galeria-1.png', alt: 'Pantalla de inicio de Game Feelings, con el buscador de juegos' },
      { src: '/proyectos/game-feelings-galeria-1.jpg', alt: 'Recomendaciones de juegos de terror cooperativos en un carrusel de tapas' },
    ],
  },
  {
    titulo: 'Excel Unifier',
    descripcion: 'Unifica varios Excel en uno nuevo, de forma automática.',
    imagen: { src: 'excel-unifier-preview.jpg', alt: 'Portada de Excel Unifier', color: '#0ab4fb' },
    tipo: 'celular',
    problema: "El cliente tenía que pasar a mano, valor por valor, los datos de varios Excel a uno nuevo. Era lento y fácil de equivocarse.",
    solucion: "Se desarrolló una herramienta que toma múltiples Excel y los transforma en uno nuevo, aplicando de forma automática las reglas específicas que pidió el cliente. Ya no hace falta copiar nada a mano.",
    galeria: [
      { src: '/proyectos/excel-unifier-galeria-1.png', alt: 'Pantalla principal de Excel Unifier' },
      { src: '/proyectos/excel-unifier-galeria-2.png', alt: 'Excel Unifier en modo Multiple, con el orden de los archivos a unir' },
      { src: '/proyectos/excel-unifier-galeria-3.png', alt: 'Excel Unifier con el resultado listo para descargar' },
    ],
  },
  {
    titulo: 'Automatic Form',
    descripcion: 'Rellena automáticamente valores de un formulario.',
    logo: { src: 'proyecto-1-principal.png', color: '#204ddf', color2: '#ffffff' },
    
    problema: "Oficinistas tenian problemas con el rellenado de datos de una plataforma, tardaban mucho y se equivocaban en las cosas que ponían.",
    solucion: "Se desarrolló una herramienta que permite rellenar automáticamente los campos de un formulario, con la posibilidad de personalizar los valores a rellenar y extenderse hacia otras plataformas.",
    galeria: [{ src: '/proyectos/proyecto-1-galeria-1.gif', alt: 'Captura del proyecto 1' }],
  },
  {
    titulo: 'Belitos',
    descripcion: "Landing page para un kiosco de barrio.",
    logo: { src: 'proyecto-3-principal.png', color: '#d75de2' },
    
    problema: "El kiosco necesitaba una landing page inspirada en el estilo del local, para promocionar sus productos y servicios, atraer clientes y realizar pedidos.",
    solucion: "Se desarrolló una landing page con un diseño atractivo y funcional, que permite a los clientes conocer los productos y servicios del kiosco, y contactarse con el local.",
    galeria: [{ src: '/proyectos/proyecto-3-galeria-1.webp', alt: 'Captura del proyecto 3' }],
  },
  {
    titulo: 'Pool Over',
    descripcion: "Landing page para un bar de pool.",
    logo: { src: 'proyecto-2-principal.png', color: '#f97316', color2: '#380303' },
    
    problema: "El bar necesitaba una landing page para promocionar sus servicios, atraer clientes y realizar reservas.",
    solucion: "Se desarrolló una landing page con un diseño atractivo y funcional, que permite a los clientes conocer los servicios del bar y reservar antes de ir.",
    galeria: [{ src: '/proyectos/proyecto-2-galeria-1.jpg', alt: 'Imagen 1 del proyecto 2' }, { src: '/proyectos/proyecto-2-galeria-2.jpg', alt: 'Imagen 2 del proyecto 2' }, { src: '/proyectos/proyecto-2-galeria-3.jpg', alt: 'Imagen 3 del proyecto 2' }],
  },
];
