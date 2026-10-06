# 2026-10-06 — Homepage loading performance

## Problem

On first visits the live homepage stayed blank for 1–2 s, the hero and globe
appeared late, and sections faded in slowly while scrolling. The cause was mostly
the page's own design, not the server:

1. Every hero element started at `opacity:0` + blur, with animation delays up to
   1.55 s. The globe image (the largest visible element) was invisible until
   0.48 s and settled only at about 2 s.
2. A render-blocking external stylesheet (used only by the homepage) had to finish
   downloading before anything could draw.
3. Scroll reveals waited until a section was 8% inside the viewport, then ran
   1–1.15 s transitions with up to 630 ms of stagger. Content already on screen
   when the script ran was hidden and animated in again.
4. The desktop globe texture was a 780 KB JPEG requested only after the script
   ran, then decoded synchronously during the WebGL upload. It was served
   `immutable` without a hashed filename, so a replacement would never reach
   returning visitors.
5. Google Analytics had not been loaded on the homepage since the 2026-10-03
   redesign.

## Changes

- **Hero timeline** (`assets/css/orbital-cinema.css`): same keyframes, compressed.
  Everything is visible by about 0.6 s (globe starts at .12 s and settles by
  about 1.2 s). Underline, title sheen, beam, and CTA sweep start earlier in
  proportion.
- **Inline CSS** (`layouts/index.html`): the palette + design + cinema CSS are
  concatenated, minified, and inlined in `<head>`.
- **One JS bundle**: `orbital.js`, `lang-pref.js`, `orbital-gallery.js`,
  `orbital-cinema.js` are concatenated in their original order, deferred,
  fingerprinted, with SRI.
- **Scroll reveals** (`assets/js/orbital-cinema.js`): `rootMargin` `0px 0px 12% 0px`,
  `threshold` 0, transitions .6/.7 s, stagger cap 6×50 ms. Elements already in the
  viewport are never tagged (positions are read in one pass before any write).
- **Globe texture**: sources moved from `static/media/orbital/` to
  `assets/media/orbital/`. Hugo serves same-size WebP at q88 (3600×1800 desktop,
  1800×900 mobile, about half the bytes, PSNR ≈ 42.7 dB against the JPEG,
  visually identical at 2× zoom). Hashed filenames make the `immutable` header
  safe. `orbital.js` calls
  `image.decode()` before `texImage2D`. The research-card background uses the
  same mobile WebP through `--research-art`.
- **Google Analytics**: restored on the homepage for production builds only.
  `gtag` calls are queued at once; the library loads after `load` via
  `requestIdleCallback`.

## Decisions

- **Language redirect kept as a 302.** An edge rewrite would save one round trip,
  but it would serve Japanese/Spanish content at the English canonical URL and
  break `lang-pref.js` path detection. Internal links on `/ja/` and `/es/` never
  point to bare `/` except the deliberate EN switch, which saves the preference.
- **No `/orbital/*` immutable header.** Netlify merges matching header rules, and
  the generic `*.js` rule would also match, which risks a contradictory
  `Cache-Control`. The bundle is fingerprinted, so the existing 30-day rule is safe.

## Measurements

Lighthouse 12.8.2, local Chrome headless, run from Japan against the live site.
Medians of 3 runs. Mobile = simulated slow 4G + 4x CPU. `/` from Japan includes the
first-visit geo redirect to `/ja/`.

### Before (live, 2026-10-06, commit bf59fc2d)

| Page | Score | FCP | LCP | Speed Index | TBT | CLS | Transfer |
|---|---|---|---|---|---|---|---|
| `/` mobile | 76 | 1359 ms | 1418 ms | 2751 ms | 999 ms | 0.087 | 305 KB |
| `/` desktop | 99 | 535 ms | 586 ms | 1286 ms | 4 ms | 0.012 | 1783 KB |
| `/es/` mobile | 98 | 1376 ms | 1578 ms | 2176 ms | 75 ms | 0.086 | 304 KB |
| `/es/` desktop | 99 | 582 ms | 648 ms | 1071 ms | 4 ms | 0.007 | 1782 KB |
| `/ja/` mobile | 98 | 1123 ms | 1318 ms | 2259 ms | 67 ms | 0.087 | 305 KB |
| `/ja/` desktop | 100 | 457 ms | 513 ms | 706 ms | 6 ms | 0.012 | 1783 KB |

Mobile TBT varied widely (46–2663 ms across runs on `/`). The long tasks came from
`orbital-cinema.js` (up to 1229 ms) and `orbital.js` (up to 1001 ms). Their source
was forced layouts: the gallery coverflow read each slide's `offsetLeft` right
after styling the previous one (one full-page layout per slide, 19 slides), plus
the synchronous texture decode. Both are fixed: reads now happen before writes,
the initial gallery measurements run on the next animation frame, and the texture
is decoded with `image.decode()` first.

PageSpeed Insights: the keyless API returned HTTP 429 (shared daily quota), so PSI
numbers were taken through the pagespeed.web.dev UI after deploy (see below).

RESULTS_AFTER_PLACEHOLDER
