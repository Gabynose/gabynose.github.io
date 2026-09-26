// Cloudflare Worker del formulario de contacto.
// Recibe el formulario del portfolio, lo valida y lo envía por mail con Resend.
// Las claves viven solo acá, como secretos de Cloudflare: nunca llegan al navegador.
//
// Secretos (npx wrangler secret put ...): RESEND_API_KEY, TURNSTILE_SECRET
// Variables (wrangler.toml): ALLOWED_ORIGINS, TO_EMAIL, FROM_EMAIL
// Binding opcional: RATE_LIMITER (límite de envíos por visitante)

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const LIMITS = { nombre: 100, email: 200, mensaje: 5000 };

function json(body, status, origin) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...(origin ? { 'Access-Control-Allow-Origin': origin, Vary: 'Origin' } : {}),
    },
  });
}

const clean = (value, max) => (typeof value === 'string' ? value.trim().slice(0, max + 1) : '');

async function turnstileOk(token, secret, ip) {
  if (!token) return false;
  const form = new FormData();
  form.append('secret', secret);
  form.append('response', token);
  if (ip) form.append('remoteip', ip);
  const result = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', { method: 'POST', body: form });
  const data = await result.json().catch(() => ({}));
  return data.success === true;
}

export default {
  async fetch(request, env) {
    const allowed = (env.ALLOWED_ORIGINS ?? '').split(',').map((o) => o.trim()).filter(Boolean);
    const origin = request.headers.get('Origin') ?? '';
    const cors = allowed.includes(origin) ? origin : null;

    if (request.method === 'OPTIONS') {
      if (!cors) return new Response(null, { status: 403 });
      return new Response(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': cors,
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Accept',
          'Access-Control-Max-Age': '86400',
          Vary: 'Origin',
        },
      });
    }
    if (request.method !== 'POST') return json({ success: false }, 405, cors);
    if (!cors) return json({ success: false }, 403, null);

    const ip = request.headers.get('CF-Connecting-IP') ?? '';
    if (env.RATE_LIMITER) {
      const { success } = await env.RATE_LIMITER.limit({ key: ip || 'sin-ip' });
      if (!success) return json({ success: false, error: 'rate' }, 429, cors);
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return json({ success: false }, 400, cors);
    }

    // Campo trampa lleno: un bot. Se le responde "enviado" sin enviar nada.
    if (typeof body.empresa === 'string' && body.empresa.trim()) return json({ success: true }, 200, cors);

    const nombre = clean(body.nombre, LIMITS.nombre).replace(/\s+/g, ' ');
    const email = clean(body.email, LIMITS.email);
    const mensaje = clean(body.mensaje, LIMITS.mensaje);
    const invalid =
      !nombre ||
      nombre.length > LIMITS.nombre ||
      !EMAIL_RE.test(email) ||
      email.length > LIMITS.email ||
      !mensaje ||
      mensaje.length > LIMITS.mensaje;
    if (invalid) return json({ success: false }, 400, cors);

    if (!(await turnstileOk(body.turnstile, env.TURNSTILE_SECRET, ip))) {
      return json({ success: false, error: 'captcha' }, 403, cors);
    }

    // Texto plano; el nombre ya no tiene saltos de línea.
    const subject = `Proyecto web · ${nombre}`;
    const text = `${mensaje}\n\n— ${nombre}\n${email}\n\nEnviado desde el formulario del portfolio.`;
    const sent = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: env.FROM_EMAIL,
        to: [env.TO_EMAIL],
        reply_to: email, // "Responder" en Gmail le contesta al visitante
        subject,
        text,
      }),
    });
    if (!sent.ok) return json({ success: false }, 502, cors);
    return json({ success: true }, 200, cors);
  },
};
