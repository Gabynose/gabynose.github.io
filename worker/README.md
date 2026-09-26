# Formulario de contacto: Worker de Cloudflare

El formulario del portfolio envía a este Worker, que valida el mensaje y te lo manda por mail con Resend.
Las claves quedan guardadas en Cloudflare: nunca aparecen en el código de la página.

## Una sola vez

1. **Resend** (envío de mails): creá una cuenta gratis en resend.com **con gabrielboggia@gmail.com** y generá una *API Key*.
   Sin dominio propio, Resend solo envía al mail de tu cuenta: justo lo que necesitamos.
2. **Cloudflare** (Worker + captcha): creá una cuenta gratis en cloudflare.com.
   En *Turnstile* → *Add widget*: nombre `Portfolio contacto`, hostname `gabynose.github.io`, modo *Managed*, pre-clearance *No*.
   Te da una **Site Key** (pública) y una **Secret Key** (secreta).
3. En una terminal, dentro de esta carpeta `worker/`:

   ```bash
   npx wrangler login
   npx wrangler secret put RESEND_API_KEY
   npx wrangler secret put TURNSTILE_SECRET
   npx wrangler deploy
   ```

   Cada `secret put` te pide pegar el valor (la API Key de Resend y la Secret Key de Turnstile).
   El `deploy` te muestra la URL del Worker, algo como `https://portfolio-contacto.TU-CUENTA.workers.dev`.
   Si el deploy falla por el bloque `[[ratelimits]]`, borralo de `wrangler.toml` y volvé a correr `npx wrangler deploy`.
4. En `src/content.js` → `contacto`:
   - `endpoint`: la URL del Worker.
   - `turnstileSiteKey`: la Site Key de Turnstile (es pública, va en la página).

Listo. Mandá un mensaje de prueba desde la página: el primero puede caer en *Spam* de Gmail; marcalo como "No es spam".

## Límites (planes gratis)

- Resend: 100 mails por día, 3.000 por mes.
- Cloudflare Workers: 100.000 pedidos por día.
- Por visitante: 3 envíos por minuto.

## Cambiar una clave

Si una clave se filtra o querés rotarla: generá una nueva en Resend o Turnstile y volvé a correr el `npx wrangler secret put ...` correspondiente. No hace falta tocar la página.
