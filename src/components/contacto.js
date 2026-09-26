// Contacto (Ref 4: refined.framer.website): tarjeta de mensaje + tarjeta con formulario.
import { brandIcon, el, icon } from '../dom.js';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const TURNSTILE_SRC = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
const TOKEN_WAIT_MS = 8000;

// Turnstile se carga recién cuando el formulario está cerca de verse o se toca: no pesa en la carga inicial.
function setupTurnstile(form, siteKey) {
  const container = form.querySelector('.contact-form__turnstile');
  if (!container) return null;
  let widgetId = null;
  let token = '';
  let waiting = [];
  const settle = (value) => {
    token = value;
    waiting.forEach((resolve) => resolve(value));
    waiting = [];
  };

  let loading = null;
  const load = () =>
    (loading ??= new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = TURNSTILE_SRC;
      script.async = true;
      script.onload = resolve;
      script.onerror = reject;
      document.head.append(script);
    }).then(() => {
      widgetId = window.turnstile.render(container, {
        sitekey: siteKey,
        theme: 'dark',
        language: 'es',
        appearance: 'interaction-only',
        callback: settle,
        'expired-callback': () => settle(''),
        'error-callback': () => settle(''),
      });
    }));

  const observer = new IntersectionObserver(
    ([entry]) => {
      if (!entry.isIntersecting) return;
      observer.disconnect();
      load().catch(() => {});
    },
    { rootMargin: '400px' },
  );
  observer.observe(form);
  form.addEventListener('focusin', () => load().catch(() => {}), { once: true });

  return {
    // Token de un solo uso: espera a que Cloudflare lo emita (normalmente ya está listo).
    async take() {
      await load().catch(() => {});
      const value =
        token ||
        (await Promise.race([
          new Promise((resolve) => waiting.push(resolve)),
          new Promise((resolve) => setTimeout(() => resolve(''), TOKEN_WAIT_MS)),
        ]));
      token = '';
      if (widgetId !== null) window.turnstile.reset(widgetId);
      return value;
    },
  };
}

function field(name, { label, placeholder }, { multiline = false, type = 'text', autocomplete } = {}) {
  const id = `contacto-${name}`;
  const control = el(multiline ? 'textarea' : 'input', {
    class: 'field__control',
    id,
    name,
    type: multiline ? null : type,
    placeholder,
    autocomplete,
    rows: multiline ? 6 : null,
    required: true,
    'aria-describedby': `${id}-error`,
  });
  return el('div', { class: 'field' }, [
    el('label', { class: 'field__label', for: id, text: label }),
    control,
    el('p', { class: 'field__error', id: `${id}-error`, 'aria-live': 'polite' }),
  ]);
}

export function renderContacto(root, { contacto, identidad }) {
  const redes = identidad.redes.filter((red) => red.url);

  const intro = el('div', { class: 'contact-card contact-card--intro', 'data-reveal-item': true }, [
    identidad.foto
      ? el(
          'figure',
          { class: 'contact__photo' },
          el('img', { src: identidad.foto.src, alt: identidad.foto.alt, width: 400, height: 400, loading: 'lazy', decoding: 'async' }),
        )
      : null,
    el('h2', { class: 'contact__title', id: 'contacto-titulo', text: contacto.titulo }),
    el('p', { class: 'contact__text', text: contacto.texto }),
    el('div', { class: 'contact__bottom' }, [
      el('p', { class: 'contact__label', text: contacto.etiquetaMail }),
      el('div', { class: 'contact__links' }, [
        el('a', { class: 'contact__mail', href: `mailto:${identidad.email}`, text: identidad.email }),
        // Redes con URL cargada, como icono al lado del mail.
        ...redes.map((red) =>
          el(
            'a',
            {
              class: 'contact__social',
              href: red.url,
              target: '_blank',
              rel: 'noopener noreferrer',
              'aria-label': `${red.label} (se abre en una pestaña nueva)`,
              title: red.label,
            },
            brandIcon(red.icono, 'contact__social-icon'),
          ),
        ),
      ]),
    ]),
  ]);

  const { campos } = contacto;
  const form = el('form', { class: 'contact-card contact-form', novalidate: true, 'data-reveal-item': true }, [
    field('nombre', campos.nombre, { autocomplete: 'name' }),
    field('email', campos.email, { type: 'email', autocomplete: 'email' }),
    field('mensaje', campos.mensaje, { multiline: true }),
    // Campo trampa para bots: invisible para personas.
    el('div', { class: 'visually-hidden', 'aria-hidden': 'true' }, el('input', { name: 'empresa', tabindex: '-1', autocomplete: 'off' })),
    el('button', { class: 'btn-solid', type: 'submit' }, [
      el('span', { class: 'btn-solid__label', text: contacto.boton }),
      el('span', { class: 'btn-solid__circle' }, icon('arrow-up-right', 'btn-solid__icon')),
    ]),
    el('p', { class: 'contact-form__status', role: 'status', 'aria-live': 'polite' }),
    // Verificación anti-bots (Turnstile): invisible salvo que Cloudflare dude del visitante.
    contacto.endpoint && contacto.turnstileSiteKey ? el('div', { class: 'contact-form__turnstile' }) : null,
  ]);

  root.replaceChildren(el('div', { class: 'contact', 'data-reveal': true }, [intro, form]));
}

export function setupContacto({ contacto, identidad }) {
  const form = document.querySelector('.contact-form');
  if (!form) return;
  const status = form.querySelector('.contact-form__status');
  const button = form.querySelector('.btn-solid');
  const label = button.querySelector('.btn-solid__label');
  let attempted = false;
  const turnstile = contacto.endpoint && contacto.turnstileSiteKey ? setupTurnstile(form, contacto.turnstileSiteKey) : null;

  const setError = (control, message) => {
    const error = form.querySelector(`#${control.id}-error`);
    error.textContent = message || '';
    control.toggleAttribute('aria-invalid', Boolean(message));
    control.closest('.field').classList.toggle('has-error', Boolean(message));
  };

  const validate = (control) => {
    const value = control.value.trim();
    let message = '';
    if (!value) message = contacto.errores.requerido;
    else if (control.name === 'email' && !EMAIL_RE.test(value)) message = contacto.errores.email;
    setError(control, message);
    return !message;
  };

  const controls = [...form.querySelectorAll('.field__control')];
  controls.forEach((control) => {
    // Tras el primer intento, se corrige en vivo; antes, solo al salir del campo con algo escrito.
    control.addEventListener('input', () => attempted && validate(control));
    control.addEventListener('blur', () => (attempted || control.value.trim()) && validate(control));
  });

  const setStatus = (text, kind = '') => {
    status.textContent = text;
    status.dataset.kind = kind;
  };

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    attempted = true;
    const results = controls.map(validate);
    if (results.includes(false)) {
      controls[results.indexOf(false)].focus();
      return;
    }
    // Campo trampa lleno: un bot. Ve "enviado" y no se manda nada.
    if (form.elements.empresa.value) {
      form.reset();
      setStatus(contacto.estados.exito, 'ok');
      return;
    }

    const data = Object.fromEntries(controls.map((c) => [c.name, c.value.trim()]));

    // Sin servicio configurado: abre el programa de correo con el mensaje listo.
    if (!contacto.endpoint) {
      const subject = `${contacto.asuntoMail} · ${data.nombre}`;
      const body = `${data.mensaje}\n\n${data.nombre}\n${data.email}`;
      window.location.href = `mailto:${identidad.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      setStatus(contacto.estados.mailto, 'ok');
      return;
    }

    button.disabled = true;
    form.setAttribute('aria-busy', 'true');
    const original = label.textContent;
    label.textContent = contacto.estados.enviando;
    setStatus('');
    try {
      if (turnstile) data.turnstile = await turnstile.take();
      const response = await fetch(contacto.endpoint, {
        method: 'POST',
        headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok || result.success !== true) throw new Error(String(response.status));
      form.reset();
      attempted = false;
      setStatus(contacto.estados.exito, 'ok');
    } catch {
      setStatus(contacto.estados.error, 'error');
    } finally {
      button.disabled = false;
      form.removeAttribute('aria-busy');
      label.textContent = original;
    }
  });
}
