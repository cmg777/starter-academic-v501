# Cinematic landing page — 2026-10-04

## Request

Make the website more cinematic, immersive and interactive, with 3D animation,
and more beautiful overall. The user also changed the hero's key message to
"Monitoring **Local Development** from **outer space**," with both keyword
phrases highlighted.

## What changed

All effects are hand-written (WebGL, Canvas 2D, CSS 3D). No library or CDN.

- **Hero headline** (`data/orbital.json`, EN/ES/JA): three tiers. "Monitoring"
  is a small lead-in on a gold rule. *Local Development* is the largest, brightest
  line, with a gold underline that draws in. *outer space* carries a moving
  blue-gold luminous gradient.
  - ES: "Monitorear el **desarrollo local** desde el **espacio exterior**." Kept
    lowercase, since Spanish doesn't use title case.
  - JA: 「**地域の開発**を、**宇宙**から観測する。」
  - `<title>`/`og:title` use the plain text.
- **Globe shader** (`assets/js/orbital.js`):
  - Key-lit atmospheric limb with a two-layer halo.
  - Warm bloom on NASA's brightest city pixels. Light positions are unchanged.
  - Faint 30° graticule.
  - A draw hook, `earth.onGlobeDraw(yaw, pitch, zoom, animated)`, lets overlays
    follow the exact projection.
- **3D orbital rings**: two tilted CSS 3D rings with satellites and comet
  trails. Each ring is drawn twice and clipped, so the far half passes behind
  the globe and the near half in front.
- **Network arcs** (`orbital-cinema.js`): great-circle arcs from Nagoya to the
  lab's home and study regions, with travelling pulses.
  - Destinations: Jakarta, Phnom Penh, Bangkok, Beijing, Lima, Bogotá, Sarajevo
    and Addis Ababa.
  - The arcs fade at the limb. The pulses freeze when the globe is paused.
  - Caption: "VIIRS / 2016 · QuaRCS network", added to all three locales as
    `globeNetwork`.
- **Space**: a fixed depth starfield (canvas) with twinkle, rare meteors, and
  pointer and scroll parallax (scrolling flies the camera forward). Also drifting
  nebula light in the hero and a cursor spotlight on fine pointers.
- **Opening sequence**: staggered blur-to-sharp rise of the hero copy. The globe
  materializes from a blurred, bright, smaller state. On scroll, the hero copy
  lifts and fades while the globe figure drifts and scales.
- **Interaction**:
  - 3D tilt with moving glare on research cards, project and tutorial images,
    the portrait, and thumbnails.
  - Magnetic buttons; a light sweep on the primary button.
  - Light-sweep hover on publication and presentation rows.
  - A glowing ring on student portraits.
- **Scroll**: 3D reveals for section headings and cards (staggered), a header
  that turns to glass, and a blue-to-gold scroll-progress line.
- **Pillars**: an infinite ticker. Hover pauses it; it is static under reduced
  motion.
- **Gallery**: a coverflow. Slides snap to the center with rotated, scaled and
  dimmed neighbors, and clicking a side photo centers it.
  `orbital-gallery.js` now measures slide positions instead of assuming
  full-width slides. Photos stay uncropped, with a shadow that follows each
  photo's edges.
- **Footer**: an "earthrise" planet limb with a breathing atmosphere and a sun
  glint.
- **Content pages** (`orbital-subpages.css`, CSS only):
  - A faint fixed star backdrop with nebula light.
  - A reading-progress line under the navbar, in browsers that support
    `animation-timeline`.
  - Luminous card hover, and a soft glow on article titles.

## Fallbacks and performance

- `prefers-reduced-motion`: no intro, parallax, tilt, ticker or rotation
  movement. The starfield draws once, still.
- Touch and coarse pointers: no tilt, magnetic effect or spotlight.
- Print: decorative layers hidden; every section is visible.
- No JavaScript: the full static page. The reveal hiding only applies after the
  script adds `.cinema`.
- The starfield and pointer loop stop in background tabs. The globe and arcs keep
  the existing offscreen and background-tab suspension. Canvas pixel ratio is
  capped at 1.5.
- Sizes: `orbital-cinema.js` is 8.7 KB minified (3.7 KB gzipped). The landing
  CSS bundle is 42.6 KB minified.

## Verification

- `node --test tests/orbital.test.cjs`: 9/9 pass. The new test checks that
  overlays receive every draw, with the same yaw, and know when the globe is
  still.
- Hugo 0.111.3 `--gc --minify --buildFuture`: exit 0. Page counts are unchanged
  (EN 1172 / ES 553 / JA 553). The existing `.Path` warning remains.
- Browser checks:
  - 1440 px desktop in EN/ES/JA.
  - 390 px phones (in iframes) in EN/ES/JA, and 820 px tablet.
  - No horizontal overflow and no console errors.
  - The Japanese phone headline keeps whole lines; a clipped final Spanish glyph
    was fixed.
- The local Chrome window reported `visibilityState: hidden`, so transitions were
  checked by forcing the end state. Real-time motion should be reviewed in a
  visible browser before publishing.

## Rollback

The design before this change is commit `c6561220`. The site before the October
redesign is tag `pre-design-update-2026-10-03`. See
`logs/2026-10-03-pre-design-update-snapshot.md`.
