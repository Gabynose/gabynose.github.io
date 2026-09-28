// Archivo único de contenido del portfolio.
// Todo texto, enlace o imagen visible en la página sale de aquí.
// Para cambiar un texto, edítalo en este archivo: no hace falta tocar HTML ni CSS.
// `null` = dato pendiente (se muestra un placeholder hasta que se complete).
// Los proyectos viven aparte, en src/proyectos.js.
import { proyectos } from './proyectos.js';
import { toProject } from './projects/model.js';

export const content = {
  meta: {
    titulo: 'Gabriel Boggia · Desarrollador de software',
    descripcion:
      'Portfolio de Gabriel Boggia. Diseño y desarrollo de páginas web con criterio, enfocadas a resolver problemas reales.',
  },

  identidad: {
    nombre: 'Gabriel Boggia',
    rol: 'Desarrollador de software',
    email: 'gabrielboggia@gmail.com',
    logo: null, // pendiente: logo o monograma para la nav
    foto: { src: '/foto.jpg', alt: 'Gabriel Boggia' },
    redes: [
      { label: 'LinkedIn', icono: 'linkedin', url: 'https://www.linkedin.com/in/gabriel-boggia-70b16619b/' },
      { label: 'GitHub', icono: 'github', url: null }, // pendiente
    ],
  },

  nav: {
    // `destacado: true` = botón de la derecha en la píldora.
    items: [
      { label: 'Inicio', href: '#inicio' },
      { label: 'Tu problema', href: '#problema' },
      { label: 'Proyectos', href: '#proyectos' },
      { label: 'Contacto', href: '#contacto', destacado: true },
    ],
    logoLabel: 'Gabriel Boggia, volver al inicio',
    menu: { abrir: 'Abrir menú', cerrar: 'Cerrar menú' },
  },

  hero: {
    titulo: 'Gabriel Boggia',
    // Línea sobre el nombre (se muestra en mayúsculas).
    subtitulo: 'Desarrollador de software',
    // Bajada bajo el nombre.
    descripcion: 'Creo soluciones digitales que combinan tecnología, diseño y propósito.',
    cta: { label: 'Ver proyectos', href: '#proyectos' },
  },

  problema: {
    // Cada elemento del array es una línea del título.
    // Una línea como objeto { texto, resaltado: true } se muestra en negro sobre fondo blanco.
    titulo: ['Tu negocio juega en primera.', { texto: 'Tu web no.', resaltado: true }],
    // Cada párrafo es un array de líneas (salto de línea entre ellas).
    parrafos: [
      ['Has invertido años en construir tu experiencia.', 'En ganar confianza. En perfeccionar tu oficio.'],
      [
        'Pero tu sitio web sigue pareciendo algo armado a las apuradas, entre reuniones y llamadas.',
        'Y cada visitante lo nota antes que vos.',
      ],
      [
        'Sabés que tiene que cambiar.',
        'El problema es que el negocio siempre va primero, y todavía no encontraste a alguien que entienda de verdad lo que tu marca representa.',
      ],
      [
        'Así, años de credibilidad se deshacen en apenas cinco segundos.',
        'Y nunca vas a saber cuántas oportunidades se fueron en silencio.',
      ],
    ],
  },

  proyectos: {
    titulo: 'Proyectos',
    etiquetas: {
      problema: 'Problema',
      solucion: 'Solución',
      cerrar: 'Volver a proyectos',
    },
    // Solo los proyectos con logo real: los pendientes no ocupan lugar (la última caja suelta queda centrada).
    lista: proyectos.map(toProject).filter((project) => {
      if (project.pendiente && import.meta.env.DEV) {
        console.info(`[proyectos] "${project.titulo}" oculto: todavía usa un logo de prueba. Subí su logo y cambiá logo.src.`);
      }
      return !project.pendiente;
    }),
  },

  contacto: {
    titulo: 'Contá que tenés en mente',
    texto: 'Agendá una llamada conmigo y resolvemos tus dudas.',
    etiquetaMail: 'O escribime directo',
    campos: {
      nombre: { label: 'Nombre', placeholder: 'Tu nombre' },
      email: { label: 'Mail', placeholder: 'tu@mail.com' },
      mensaje: { label: 'Mensaje', placeholder: '¿En qué te puedo ayudar?' },
    },
    boton: 'Enviar mensaje',
    // Al enviar, se abre WhatsApp con tu número y el mensaje ya escrito (wa.me). Tiene prioridad sobre `endpoint`.
    // `numero`: código de país + celular, solo dígitos (+54 9 11 5163-3140 → 5491151633140). Con `null`, se usa `endpoint`/mailto.
    // `mensaje`: plantilla con {nombre}, {mensaje} y {email}. Al {mensaje} se le agrega el punto final si no lo trae.
    whatsapp: {
      numero: '5491151633140',
      mensaje: 'Hola, soy {nombre}... {mensaje} Este es mi mail: {email}',
    },
    // URL del Worker de Cloudflare que envía el mensaje a tu mail (ver worker/README.md).
    // Mientras sea `null`, al enviar se abre el programa de correo del visitante con el mensaje listo.
    endpoint: null,
    // Site Key de Cloudflare Turnstile (anti-bots). Es pública: puede ir en la página.
    turnstileSiteKey: null,
    estados: {
      enviando: 'Enviando…',
      exito: 'Mensaje enviado. Te respondo pronto.',
      error: 'No se pudo enviar. Probá de nuevo o escribime a gabrielboggia@gmail.com.',
      mailto: 'Se abrió tu programa de correo con el mensaje listo para enviar.',
      whatsapp: 'Se abrió WhatsApp con tu mensaje listo. Solo falta enviarlo.',
    },
    errores: {
      requerido: 'Completá este campo.',
      email: 'Revisá el mail: parece incompleto.',
    },
    asuntoMail: 'Proyecto web',
  },

  // Textos de perfil de docs/04-CONTENIDO.MD, guardados para usarlos cuando se decida dónde van.
  textosPerfil: {
    frase: 'Soy un desarrollador de software enfocado a soluciones de problemas reales',
    experiencia:
      'Experiencia en la automatización de procesos manuales, logrando una mayor velocidad de ejecución y una significativa reducción de errores. Asimismo, cuento con trayectoria en el desarrollo de páginas web, aplicando buenas prácticas de diseño y programación para garantizar soluciones eficientes y escalables.',
    proceso:
      'Sintetizo voz de cliente para sacar pain points reales, priorizo con datos, itero en Figma con sistemas de componentes y llego hasta el código para acortar el time-to-ship.',
    descripcionBreve:
      'Software Developer y estudiante de Ingeniería en Informática. Me especializo en el diseño y desarrollo de productos de software orientados a resolver problemas reales, aportando soluciones eficientes y escalables.',
  },
};
