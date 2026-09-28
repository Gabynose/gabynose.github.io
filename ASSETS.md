# Assets pendientes

## Logo de cada proyecto (caja de la vista general y cabecera del detalle)
| Archivo | Carpeta | Medida | Formato |
|---|---|---|---|
| `nombre-del-proyecto.png` | `public/proyectos/logos/` | el dibujo, ≥1200 px en su lado mayor | PNG **sin fondo** (el margen transparente se recorta solo) |

Se carga en `src/proyectos.js` → `logo: { src: 'nombre-del-proyecto.png', color: '#hex', color2: '#hex' (opcional) }` y opcional `efecto: 'fuego' | 'orbita'`.
En `src` va **solo el nombre del archivo**, igual que como se llama (mayúsculas y extensión). `npm run dev` y `npm run build` avisan si algo no coincide.

## Proyecto 1
| Archivo | Carpeta | Medida | Estado |
|---|---|---|---|
| `proyecto-1-principal.png` | `public/proyectos/logos/` | 1448×1086 | ✅ |
| `proyecto-1-galeria-1.jpg` | `public/proyectos/` | 1600×1200 (4:3) | pendiente |
| `proyecto-1-galeria-2.jpg` | `public/proyectos/` | 1600×1200 (4:3) | pendiente |
| `proyecto-1-galeria-3.jpg` | `public/proyectos/` | 1600×1200 (4:3) | pendiente |

## Proyecto 2 (Pool Over)
| Archivo | Carpeta | Medida | Estado |
|---|---|---|---|
| `proyecto-2-principal.png` | `public/proyectos/logos/` | 1600×1200 (dibujo 1573×583) | ✅ |
| `proyecto-2-galeria-1.jpg` | `public/proyectos/` | 1600×1200 (4:3) | ✅ |
| `proyecto-2-galeria-2.jpg` | `public/proyectos/` | 1600×1200 (4:3) | pendiente |
| `proyecto-2-galeria-3.jpg` | `public/proyectos/` | 1600×1200 (4:3) | pendiente |

## Proyecto 3
| Archivo | Carpeta | Medida | Estado |
|---|---|---|---|
| logo (PNG sin fondo) | `public/proyectos/logos/` | lado mayor 1200 px | pendiente (hoy: logo de prueba) |
| `proyecto-3-galeria-1.jpg` | `public/proyectos/` | 1600×1200 (4:3) | pendiente |
| `proyecto-3-galeria-2.jpg` | `public/proyectos/` | 1600×1200 (4:3) | pendiente |
| `proyecto-3-galeria-3.jpg` | `public/proyectos/` | 1600×1200 (4:3) | pendiente |

## Proyecto 4
| Archivo | Carpeta | Medida | Estado |
|---|---|---|---|
| logo (PNG sin fondo) | `public/proyectos/logos/` | lado mayor 1200 px | pendiente (hoy: logo de prueba) |
| `proyecto-4-galeria-1.jpg` | `public/proyectos/` | 1600×1200 (4:3) | pendiente |
| `proyecto-4-galeria-2.jpg` | `public/proyectos/` | 1600×1200 (4:3) | pendiente |
| `proyecto-4-galeria-3.jpg` | `public/proyectos/` | 1600×1200 (4:3) | pendiente |

## Identidad
| Archivo | Carpeta | Medida | Finalidad | Estado |
|---|---|---|---|---|
| `foto.jpg` | `public/` | 800×800 (1:1) | Foto de contacto | ✅ |
| `logo.svg` (o `.png`) | `public/` | cuadrado, ≥144×144 | Logo de la nav (opcional, hoy usa monograma "GB") | pendiente |
| `favicon.svg` | `public/placeholders/` (reemplazar el existente) | cuadrado, o PNG 512×512 | Ícono de pestaña | pendiente |

## Ya no se usan (se pueden borrar)
`public/proyectos/proyecto-1-principal.jpg` (reemplazado por el logo del proyecto).

## Tamaño de los logos
Los logos se muestran a ~330 px. Con más de 1000 px de lado el navegador decodifica píxeles de más y el scroll se traba en PCs lentas. Si el chequeo avisa, correr `npm run optimizar -- nombre.png` (guarda el original en `originales/`).

## Gifs y webp animados (galería)
Copiar el archivo animado original a `public/proyectos/` (no arrastrarlo ni pegarlo desde otra app: llega como imagen fija). Si mide más de 1280 px de ancho o pesa más de 4 MB, correr `npm run optimizar`.

## Formato
Logos: PNG sin fondo (con o sin margen transparente). Galería: JPG o WEBP. Nombre en minúsculas, sin espacios.
