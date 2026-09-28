---
name: Gabriel Boggia
description: A craftsman's dark one-page portfolio where the page itself is the proof of skill.
colors:
  night-black: "#050505"
  deep-surface: "#0d0d0d"
  box-black: "#080808"
  bone-white: "#f5f5f4"
  ink-secondary: "rgb(245 245 244 / 0.66)"
  ink-tertiary: "rgb(245 245 244 / 0.5)"
  hairline: "rgb(255 255 255 / 0.1)"
  grid-line: "rgb(255 255 255 / 0.055)"
  available-green: "#3ddc84"
typography:
  display:
    fontFamily: "'Schibsted Grotesk', 'Helvetica Neue', Arial, sans-serif"
    fontSize: "clamp(4rem, 1.25rem + 9vw, 9rem)"
    fontWeight: 700
    lineHeight: 0.9
    letterSpacing: "-0.04em"
  headline:
    fontFamily: "'Schibsted Grotesk', 'Helvetica Neue', Arial, sans-serif"
    fontSize: "clamp(2rem, 1.2rem + 2.6vw, 3.25rem)"
    fontWeight: 700
    lineHeight: 1.05
    letterSpacing: "-0.03em"
  title:
    fontFamily: "'Schibsted Grotesk', 'Helvetica Neue', Arial, sans-serif"
    fontSize: "clamp(1.5rem, 1.2rem + 1vw, 2rem)"
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: "-0.015em"
  lead:
    fontFamily: "'Schibsted Grotesk', 'Helvetica Neue', Arial, sans-serif"
    fontSize: "clamp(1.125rem, 1rem + 0.5vw, 1.5rem)"
    fontWeight: 400
    lineHeight: 1.45
    letterSpacing: "-0.01em"
  body:
    fontFamily: "'Inter', system-ui, -apple-system, 'Segoe UI', sans-serif"
    fontSize: "clamp(1rem, 0.96rem + 0.18vw, 1.125rem)"
    fontWeight: 400
    lineHeight: 1.55
  nav:
    fontFamily: "'Inter', system-ui, -apple-system, 'Segoe UI', sans-serif"
    fontSize: "clamp(0.8125rem, 0.72rem + 0.25vw, 0.9375rem)"
    fontWeight: 400
    lineHeight: 1.4
  label:
    fontFamily: "'Inter', system-ui, -apple-system, 'Segoe UI', sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.4
    letterSpacing: "0.01em"
rounded:
  sm: "12px"
  md: "16px"
  lg: "24px"
  pill: "999px"
spacing:
  s-1: "0.25rem"
  s-2: "0.5rem"
  s-3: "0.75rem"
  s-4: "1rem"
  s-5: "1.5rem"
  s-6: "2rem"
  s-7: "3rem"
  s-8: "4rem"
  s-9: "6rem"
  gutter: "clamp(1rem, 0.4rem + 3vw, 4rem)"
  section-y: "clamp(7rem, 4rem + 12vw, 14rem)"
components:
  nav-pill:
    backgroundColor: "rgb(20 20 20 / 0.55)"
    textColor: "{colors.ink-secondary}"
    rounded: "{rounded.pill}"
    height: "clamp(3.5rem, 8vh, 4.5rem)"
    padding: "0 0.5rem 0 1rem"
  nav-link-active:
    textColor: "{colors.bone-white}"
  button-pill:
    backgroundColor: "rgb(255 255 255 / 0.024)"
    textColor: "{colors.bone-white}"
    typography: "{typography.nav}"
    rounded: "{rounded.pill}"
    padding: "0.375rem 0.375rem 0.375rem 1rem"
  button-solid:
    backgroundColor: "{colors.bone-white}"
    textColor: "{colors.night-black}"
    rounded: "{rounded.pill}"
    height: "3.5rem"
    padding: "0.375rem 0.375rem 0.375rem 1.5rem"
  button-solid-hover:
    backgroundColor: "#ffffff"
  status-chip:
    backgroundColor: "rgb(5 5 5 / 0.7)"
    textColor: "{colors.bone-white}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "0.375rem 0.875rem 0.375rem 0.75rem"
  input-field:
    backgroundColor: "rgb(255 255 255 / 0.06)"
    textColor: "{colors.bone-white}"
    rounded: "{rounded.sm}"
    padding: "1rem"
  input-field-focus:
    backgroundColor: "rgb(255 255 255 / 0.08)"
  card-contact:
    backgroundColor: "rgb(13 13 13 / 0.85)"
    rounded: "{rounded.lg}"
    padding: "clamp(1.5rem, 1rem + 1.5vw, 2.5rem)"
  project-media:
    backgroundColor: "{colors.deep-surface}"
    rounded: "{rounded.md}"
  project-logo-box:
    backgroundColor: "{colors.box-black}"
    rounded: "{rounded.md}"
---

# Design System: Gabriel Boggia

## Overview

**Creative North Star: "The Night Workshop"**

A single dark room where the work is done in the open. The page is near-black, crossed by a fine white grid that never stops drifting, and everything on it is white type or white at lower opacity. The only object with volume is a glossy black Rubik cube that turns and solves itself; the room's own only color is a green accent used sparingly in the hero (a short line, the button's border) and as a glow under the current nav link. The one sanctioned exception is the client work: each project sits in a black box lit from behind by its own brand color, so the client's identity stays intact while the room around it stays monochrome. Skill is demonstrated by the page's own finish (masked type reveals, a nav pill that drops and stretches, a lit logo box that flies from card to detail without ever going still), not claimed in copy.

Density is low and deliberate: one idea per viewport, huge grotesque headlines, generous section padding, thin hairlines instead of boxes. Surfaces are glass or near-black panels separated by one-pixel white lines at 10% opacity; depth comes from blur, inner glow, and the lit halo behind the cube, never from drop shadows. Motion is slow and liquid, all on one exponential ease-out curve, and fully yields to reduced motion.

The confirmed rejection is the generic corporate portfolio: identical card grids, agency phrasing, brand gradients, blues, particle backgrounds.

**Key Characteristics:**
- Total monochrome on #050505; grays are white at reduced opacity, not separate hues.
- One green accent, only in the hero and the current nav link; project brand light lives strictly inside the project boxes.
- Schibsted Grotesk for everything large, Inter for everything small; only weights 400 and 700.
- Pill and circle geometry for interactive elements; 12/16/24px corners for fields, media, cards.
- A constantly drifting thin-line grid as the ground plane.
- One ease-out-expo curve for all motion; word-by-word masked reveals.

## Colors

A monochrome night palette: one black ground, one warm white, white-by-opacity for every gray, and a single green signal.

### Primary
- **Bone White** (bone-white): all primary type, the solid button, the highlight block behind emphasized headline lines, the arrow circles in pills, focus outlines, and text selection. It is the system's accent as much as its ink.

### Tertiary
- **Accent Green** (available-green, `--c-accent`): the one accent. Only in the hero: the 2px line before the eyebrow and the CTA border (60% mixed, full on hover), plus the glow under the current nav link. Nowhere else.

### Brand Light (per project, data-driven)
Not a token. Each project declares `logo.color` (and optionally `logo.color2`) in `src/proyectos.js`; `src/projects/light.js` turns it into three "r g b" variables scoped to that project's box:
- **--glow**: the brand color with lightness clamped to 55-70% (hue and saturation kept), so even a navy brand can glow on black.
- **--glow-2**: the second color (or a neighboring, deeper hue derived from the first), lightness 45-62%; tints the outer haze and the edges of the fire.
- **--rim**: --glow mixed 45% toward white; the bright edge light hugging the logo, the orbit line, and spark cores.

### Neutral
- **Night Black** (night-black): page background, the detail overlay background, text on white surfaces (solid button, highlight), and the inner circle of the solid button.
- **Deep Surface** (deep-surface): placeholder fill behind gallery imagery; contact cards use it at 85% opacity.
- **Box Black** (box-black): the floor of every project logo box, in the card and in the detail header.
- **Ink Secondary** (ink-secondary): body paragraphs, leads, the hero role line, idle nav links, form labels.
- **Ink Tertiary** (ink-tertiary): placeholders and quiet labels such as the email caption.
- **Hairline** (hairline): every one-pixel divider and border: section separators, card and chip outlines, paragraph top rules, icon circles.
- **Grid Line** (grid-line): the drifting background grid only.

### Named Rules
**The One Accent Rule.** Green (#3ddc84) is the only own color and lives only in the hero and the current nav link (see Accent Green). Errors, success, links, and hovers stay monochrome; form errors are marked with a brighter white border and white text.

**The Contained Brand Rule.** A project's brand color may appear only inside its own logo box (light, haze, orbit, fire, sparks) and on that box's one-pixel border when lit. It never leaks into type, buttons, the grid, or section backgrounds. The logo PNG itself is never recolored or filtered beyond the light around it.

**The Opacity Gray Rule.** New grays are white (or bone white) at an alpha, never a mid-gray hex. Borders brighten on hover by raising alpha (0.1 to 0.22 to 0.28 to 0.4), not by changing hue.

## Typography

**Display Font:** Schibsted Grotesk (with 'Helvetica Neue', Arial, sans-serif)
**Body Font:** Inter (with system-ui, -apple-system, 'Segoe UI', sans-serif)

**Character:** A characterful, tight-tracked grotesque carries the voice at huge sizes; Inter does the quiet work of labels, nav, body, and form data. Both are self-hosted, latin subset, 400 and 700 only.

### Hierarchy
- **Display** (700, 4-9rem fluid, 0.9): the hero name, one word per line inside a mask.
- **Headline** (700, 2-3.25rem fluid, 1.05): section titles (problem phrase, projects, contact, detail title). An emphasized line may sit black on a white highlight block.
- **Title** (700, 1.5-2rem fluid, 1.1): project names under their media.
- **Lead** (400, 1.125-1.5rem fluid, 1.3-1.45): Schibsted at regular weight in secondary ink; detail intro and the hero role line (which scales to 1.25-2rem).
- **Body** (400, 1-1.125rem fluid, 1.55): Inter in secondary ink, max 44-62ch.
- **Nav** (400, 0.8125-0.9375rem fluid, 1.4): nav links and pill-button labels.
- **Label** (400 or 700, 0.875rem, 0.01em): chip text, form labels, captions; detail "Problema / Solución" labels use 700.

### Named Rules
**The Two Weights Rule.** Only 400 and 700 exist for the site's own type (Schibsted Grotesk, Inter). Headings are 700, leads and body are 400. One sanctioned exception: the hero name is set in Satoshi Black (900, -0.04em, line-height 0.92), loaded from Fontshare's CDN because its license forbids hosting the files in a public repository.

**The Big-Small Split Rule.** Schibsted for anything read as a headline, lead, or signature (including the email address and mobile menu links); Inter for anything read as UI or data.

## Layout

A centered container of 1320px plus a fluid gutter (1-4rem). Sections carry large fluid vertical padding (7-14rem) and are separated by a single hairline top border; the last section closes with shorter padding. Spacing uses one 4px-based scale (0.25rem to 6rem).

The hero fills the viewport: a 1.35fr / 1fr grid with the name left and the cube right (max 36rem, square), stacking below 900px with the cube centered at 22rem. The problem section uses a 12-column grid: headline full width, the crosses canvas in columns 1-6, paragraphs in columns 8-12, each paragraph under its own hairline. Projects are a two-up grid of 4:3 media (one column below 700px). Contact is two equal cards, max 64rem, stacking below 800px. The project detail is a full-screen overlay with its own synchronized grid, a 60rem reading column, and label/text rows at 1fr / 2fr.

Breakpoints observed: 700px (projects, detail rows), 720px (nav collapses to menu button), 800px (contact), 900px (hero, problem).

## Elevation & Depth

No drop shadows. Depth is conveyed by translucency and light: the nav pill and back button are dark glass (backdrop blur 12px) with a soft inner white glow; the mobile menu is denser glass (blur 16px); a faint radial white halo sits behind the black cube so its silhouette separates from the black ground. Everything else is flat, layered by hairline borders.

### Shadow Vocabulary
- **Glass inner glow** (`box-shadow: inset 0 0 4.5rem rgb(255 255 255 / 0.05)`): the nav pill.
- **Pill inner glow** (`box-shadow: inset 0 0 1rem rgb(255 255 255 / 0.1)`): the outlined pill button.

### Named Rules
**The Light-Not-Shadow Rule.** Lift is expressed as inner glow, blur, or a white halo. Never cast a shadow onto the black ground. The brand glow around a logo is light emitted by the logo (zero-offset, following its real silhouette), not a shadow.

## Shapes

Interactive controls are pills (999px) or perfect circles: nav, CTA, solid button, arrow circles, social icons, menu toggle, monogram, photo frame. Containers use three steps: fields 12px, project and gallery media 16px, contact cards and the mobile menu 24px. Borders are always one pixel. The photo frame is a hairline ring separated from the grayscale image by 6px. The mobile menu toggle uses two 1.5px bars that cross into an X.

## Components

### Buttons
Tactile and quiet; the arrow circle is the shared signature.
- **Shape:** full pill (999px) with a circular arrow well at the trailing end.
- **Outlined pill (nav CTA):** near-transparent white fill, hairline border, inner glow, bone-white label; a 2rem white circle with a black arrow.
- **Hover / Focus:** the label rolls up to a duplicate copy (750ms), the arrow spins one full turn, the border brightens to 22% white.
- **Solid:** the negative of the pill: bone-white fill, black bold label, full width in the form, 3.5rem tall, 2.75rem black circle with a white arrow that rotates 45deg on hover; fill lifts to pure white.
- **Back (detail):** the pill mirrored, circle leading, dark glass fill; the arrow nudges 2px left on hover.

### Chips

### Cards / Containers
- **Corner Style:** 24px contact cards; 16px project media.
- **Background:** contact cards deep surface at 85%; project media holds a logo box (see below).
- **Shadow Strategy:** none (see Elevation).
- **Border:** hairline; on project hover it turns the project's brand glow at 42% and a white arrow circle rises into the bottom-right corner.
- **Internal Padding:** 1.5-2.5rem fluid.

### Project Logo Box (signature)
A 4:3 box (box black, 16px corners) that presents a client's transparent PNG logo intact and adapts only the light around it (Ref 1 and Ref 2 of the projects update). Layers, back to front:
- **Haze:** three radial gradients sized from the logo's real footprint (`--logo-w`, `--logo-h`), tinting the black faintly. Static.
- **Effect (optional, per project):** `orbita`, a thin tilted ellipse (-21deg, ~2.3x the logo width) that passes behind the logo, with a light streak along its axis; or `fuego`, a canvas of domain-warped ridged-noise smoke in a horizontal band plus ~60 sparks and streaks, seeded from the logo path so card and detail match. No effect line means glow only.
- **Logo:** the PNG at max 56% x 44% of the box, with a three-step drop-shadow light (rim, near, far).
- **Grain:** a 1.8% noise layer so faint gradients never band.
Light measures use `cqi` so card (~573px), detail (~960px), and mobile (~340px) look identical. Everything fades in only once the logo is measured; the light never shows alone.

**Interaction A (hover or keyboard focus-visible, not touch):** the haze blooms, the logo lifts to 1.035 and its light intensifies, the border takes the brand glow. CSS transitions only, no loops. In the detail view the header box stays in this state permanently. The optional effects (`orbita`: a static tilted ellipse with a light streak; `fuego`: smoke and sparks drawn once on a canvas) are still images: **project boxes have no continuous animation** (a deliberate performance decision: blurred animated layers x4 boxes are the costliest thing to paint on low-end GPUs).

### Inputs / Fields
- **Style:** borderless 6% white fill, 12px radius, 1rem padding, 16px text; label in Inter small above.
- **Focus:** fill to 8% white and a 50% white border; no outline ring.
- **Error:** 70% white border plus a white 13px message. No red.

### Navigation
A floating dark-glass pill centered near the top, max 72rem wide: monogram circle left, links absolutely centered, outlined CTA pill right. Links are secondary ink; hover, focus, and current state turn them bone white and draw a 1px underline in from the left (it exits to the right). Below 720px, links and CTA hide behind a circular menu toggle that opens a 24px-radius glass panel of large Schibsted links separated by hairlines. On load the pill drops in scaled down, then stretches to full width before its contents fade in left to right.

### Rubik Cube (signature)
A Three.js cube in a Web Worker (OffscreenCanvas, main-thread fallback): glossy clearcoated black body; stickers in three materials, polished silver (#d4d4d4, metallic) top/bottom, clearcoat black (#050505) front/back, graphite (#3a3a3a) sides. It spins at 0.3 rad/s and performs layer turns; it is draggable. Under reduced motion it spins at 0.12 rad/s with no layer turns.

### Crosses Field (signature)
A canvas cloud of small bone-white crosses at varying opacity that jostle with a denser core and slower fringe, filling the gap between the problem headline and its paragraphs. Static under reduced motion.

### Headline Highlight
An emphasized headline line set in black on a bone-white block that bleeds 0.18em left so the text stays aligned with the lines above. On reveal the block wipes in from the left (900ms) in step with the words.

### Motion
One curve, ease-out-expo `cubic-bezier(0.19, 1, 0.22, 1)`, for everything; durations 500ms (state changes), 750ms (rolling labels, larger moves, glow intensify), 1200-1300ms (word reveals, light fade-in). Opening a project flies the real, already-lit detail header from the card (FLIP, 950ms). The page has a single orchestrated entrance (name words rise from masks, meta fades up, nav drops and stretches). On scroll, headings reveal word by word from masks (110ms per line, 25ms per word) and other items fade up 18px. The background grid drifts diagonally one cell every 9s on a shared clock. Lenis provides smooth scroll. Reduced motion: grid static, no entrances or reveals, cube slower without layer turns, crosses frozen, Lenis off, logo boxes: no lift on hover (the light still brightens).

## Do's and Don'ts

### Do:
- **Do** build every gray as white at an alpha over #050505; use the hairline (10% white) for all borders and dividers.
- **Do** keep green limited to the hero accents and the current nav link, and brand color contained inside each project's logo box.
- **Do** set headlines in Schibsted Grotesk 700 with negative tracking (-0.03em to -0.04em) and UI text in Inter 400.
- **Do** use pills and circles for controls, and 12/16/24px for fields, media, and cards.
- **Do** animate with `cubic-bezier(0.19, 1, 0.22, 1)` and provide a reduced-motion path for every moving element.
- **Do** reuse the white arrow circle as the "go / open" cue.

### Don't:
- **Don't** introduce blues, brand gradients, or any second accent color in the site's own UI, including red for errors (project brand light inside logo boxes is the only exception).
- **Don't** place a full screenshot or a logo with its own background as a project's card image; upload the transparent PNG and let the box light it.
- **Don't** use font weights other than 400 and 700.
- **Don't** cast drop shadows; use glass blur, inner glow, or a halo.
- **Don't** replace the drifting line grid with particles or noise backgrounds.
- **Don't** fall back to a uniform corporate card grid with agency phrasing; one idea per viewport.
- **Don't** use emojis.
