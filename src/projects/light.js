// Iluminación de la caja: el color de marca se traduce a variables CSS que tiñen la luz.

const HEX = /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i;

export function parseHex(value) {
  if (typeof value !== 'string' || !HEX.test(value.trim())) return null;
  let hex = value.trim().slice(1);
  if (hex.length === 3) hex = [...hex].map((c) => c + c).join('');
  return [0, 2, 4].map((i) => parseInt(hex.slice(i, i + 2), 16));
}

function rgbToHsl([r, g, b]) {
  const [rn, gn, bn] = [r / 255, g / 255, b / 255];
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, l];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  const h = max === rn ? (gn - bn) / d + (gn < bn ? 6 : 0) : max === gn ? (bn - rn) / d + 2 : (rn - gn) / d + 4;
  return [h * 60, s, l];
}

function hslToRgb([h, s, l]) {
  const k = (n) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n) => l - a * Math.max(-1, Math.min(k(n) - 3, 9 - k(n), 1));
  return [f(0), f(8), f(4)].map((v) => Math.round(v * 255));
}

// Sin segundo color: un tono vecino y más profundo, como el rojo que rodea al naranja del fuego.
function deriveSecondary(rgb) {
  const [h, s, l] = rgbToHsl(rgb);
  return hslToRgb([(h + 340) % 360, Math.min(1, s * 1.05), l * 0.72]);
}

// La luz sobre negro necesita cierta claridad: un azul marino puro no brillaría.
// Se conserva el tono y la saturación; solo se acota la luminosidad.
function asLight(rgb, min, max) {
  const [h, s, l] = rgbToHsl(rgb);
  return hslToRgb([h, s, Math.min(max, Math.max(min, l))]);
}

const mixWhite = (rgb, t) => rgb.map((v) => Math.round(v + (255 - v) * t));
const triplet = (rgb) => rgb.join(' ');

export function brandLight(color, color2) {
  const main = parseHex(color);
  const second = parseHex(color2) ?? deriveSecondary(main);
  const glow = asLight(main, 0.55, 0.7);
  return {
    '--glow': triplet(glow),
    '--glow-2': triplet(asLight(second, 0.45, 0.62)),
    '--rim': triplet(mixWhite(glow, 0.45)),
  };
}
