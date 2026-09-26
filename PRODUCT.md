# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Vite + vanilla JavaScript (ES modules), plain CSS. Libraries only where needed: Three.js (Rubik cube), Lenis (smooth scroll), @fontsource (self-hosted fonts). Static output. Chosen by the user from a recommendation.

## Users

Prospective clients (businesses and individuals) evaluating whether to hire Gabriel Boggia to design and build their website. They arrive from a direct link Gabriel sends them and decide within seconds whether this person has craft, judgment, and availability.

## Product Purpose

One-page portfolio whose only job is to get prospects to make contact. It shows good work, builds trust, and keeps contact one click away. Any section that does not move a visitor toward contact is removed.

## Positioning

A developer who also designs: someone who can make a brand stand out online with judgment, not a template. The page itself is the proof.

## Operating Context

Shared by Gabriel directly with potential clients. Viewed on desktop and mobile. Contact form (name, email, message) is the conversion point; it posts to a Cloudflare Worker that emails Gabriel via Resend (keys kept server-side, Turnstile + honeypot + rate limit).

## Capabilities and Constraints

- Sections, in order: nav, presentation (name + role + Rubik cube), phrase section ("Tu problema"), project showcase with detail overlay, contact.
- Navigation labels (text only, no numbers): Inicio, Tu problema, Proyectos, Contacto.
- All front-end copy in Spanish.
- Dark theme only. No light theme.
- Performance and accessibility are requirements; fast load.
- Hosting: GitHub Pages (static). Custom domain still undecided.

## Brand Commitments

- Name: Gabriel Boggia. Role shown under the name: "Desarrollador de software".
- Email: gabrielboggia@gmail.com. Networks: LinkedIn, GitHub (URLs pending).
- Total monochrome: black background, white text, no blues, no brand gradients. The only living color is the green "Disponible para trabajar" status, shown under the name on the hero.
- Background: plain black with a grid of thin white lines that drifts constantly (diagonal, slow). No particle backgrounds.
- Typography: a characterful grotesque for huge headlines (Schibsted Grotesk), Inter for small labels and data. Only regular (400) or bold (700), never intermediate weights.
- Low density, lots of air, few things per screen.
- Motion subtle and elegant; smooth scroll; movement should flow like water.
- No emojis.
- Tone: dark but with character, human. Anti-model: generic corporate portfolio full of identical cards and agency phrases.
- Binding references (take only the named piece): dialedweb.com nav pill; resend.com rotating/draggable Rubik cube; furoweb.eu headline + paragraphs + fighting-crosses animation; refined.framer.website project showcase, detail view, and contact block.

## Evidence on Hand

- Profile copy in `docs/04-CONTENIDO.MD`.
- Wireframe: `docs/Prototipo de template.png`.
- No logo, favicon, photos, or project images yet: placeholders until provided. No project data, testimonials, or metrics exist; do not fabricate them.

## Product Principles

1. Every section earns its place by moving the visitor toward contact.
2. Show, do not claim: the craft of the page is the proof.
3. Restraint over decoration: when in doubt, remove.
4. Fast and accessible before impressive.
