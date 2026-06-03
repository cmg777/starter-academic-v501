# Native hero: modern/dynamic animation enhancement pass

**Date:** 2026-06-03

## Background

Earlier today the native hero (`content/home/hero2-new.md`, styled by Section 21
of `assets/scss/custom.scss`) had its transparent-title bug solved and shipped
(see `2026-06-03-hero-title-fix.md`). With the hero stable, the next request was
design-led: make it **more modern & dynamic**, lightweight (vanilla JS only — no
GSAP/three.js/particles.js), with a **subtle nod** to the geospatial /
satellite-**nightlights** research, and — explicitly — **keep the background
image** (`websiteCover5.webp`); every animation must layer *on top of* it, never
replace it.

## What changed (six features, all overlaying the kept photo)

| ID | Feature |
|----|---------|
| **A1** | **Nightlights twinkle canvas** — a `<canvas>` injected by the inline JS as `#hero2-new`'s first child, painting ~26–105 soft radial-gradient glow points (warm-white, with teal/orange brand accents) that slowly twinkle, lightly clustered to suggest cities. Sits at z1 — above the photo `::before` (z0), below the navy scrim `::after` (z2). |
| **B5** | **Light frosted glass** — `.hero-glass-card` goes from `background: transparent` to `rgba(14,21,69,0.28)` + `backdrop-filter: blur(8px)`; kept deliberately subtle so the photo still reads behind/around the cards. `@supports` fallback for old browsers; lighter blur at ≤600px. |
| **B1** | **Word-by-word title reveal** — title words wrapped in `<span class="hero-title-word">`, each de-blurs + fades in via `heroWordIn` (blur/opacity only, so it doesn't fight the panel's translateY entrance). |
| **B4** | **Underline draws out** — the gradient underline animates `width: 0 → 90px` (`drawUnderline`) from center; the pulsing teal dot stays put at the midpoint. |
| **B2** | **Rotating research pillars** — the subtitle becomes "Insights from {Geospatial Big Data ⇄ Development Economics ⇄ Spatial Econometrics}" via a fade/slide `inline-grid` rotator built by JS. Progressive enhancement: the full static comma list + `aria-label` stay for reduced-motion users and screen readers (`data-rotate` attribute drives the JS). |
| **C1** | **Background counter-parallax** — the kept photo drifts ≤12px *opposite* the cursor (`translate` var on `::before`, composes with the Ken Burns `transform`; the 6% overscan hides the shift). |

## Guardrails honored

- **Image kept**: `websiteCover5.webp` is untouched as the `::before` background (only a `translate` var added).
- **No `animation-timeline: view()`** anywhere under `#hero2-new` — that was the root cause of the transparent-title bug fixed earlier today; ambient effects use `requestAnimationFrame` + `IntersectionObserver` instead.
- **`prefers-reduced-motion`**: canvas + rotator are never created; words/underline/parallax reset to final state in the existing reduce block.
- **Mobile/touch**: cursor parallax early-returns on `(hover:none)`; the canvas caps point count by area, throttles to ~18 fps, and pauses when off-screen or the tab is hidden.

## Files touched

- `assets/scss/custom.scss` — Section 21 only (frosted-glass card + `@supports`, `.hero-nightlights`, `.hero-title-word` + `heroWordIn`, `drawUnderline`, `.hero-rotator`, reduced-motion + mobile additions).
- `content/home/hero2-new.md` — title word spans, subtitle `data-rotate`/`aria-label`, and one combined inline `<script>` (cards + bg parallax, nightlights canvas, pillar rotator).

## Verification

Hugo is not installed in the working environment, so this was **statically
validated, not rendered locally**:

- SCSS brace/paren balance verified equal in `HEAD` vs working copy (`{}` 509/509, `()` 369/369) — the Netlify SCSS compile will not break.
- Inline JS balances (`{}` 35/35, `()` 143/143, `[]` 26/26), clean IIFE, paren depth never negative.
- `grep` confirms no `animation-timeline:` property declarations (only comments).
- Cascade confirmed: the `--title/--tagline/--author` `border-left` accents are defined after the base rule, so the brand colors survive the new `border`.

The visual result (twinkle intensity over the photo, glass opacity, rotator
alignment) will be confirmed on the **Netlify deploy** — these are easy aesthetic
dials (`rgba` alphas, point count, blur) if tuning is wanted.

## Follow-up (same day, after reviewing the deploy)

Per review of the live deploy, **A1 (nightlights twinkle)** and **B5 (frosted
glass)** were removed: the canvas felt unwanted and the user wanted the card
backgrounds **fully transparent** so `websiteCover5.webp` shows through behind the
text exactly as before. Reverted `.hero-glass-card` to `background: transparent`
(border-radius 4px, no blur/border/shadow, `@supports` + mobile overrides
dropped), deleted the `.hero-nightlights` rule, and removed the canvas block from
the inline `<script>`.

**Still live:** B1 word-by-word title reveal, B4 drawing underline, B2 rotating
research pillars, C1 background counter-parallax — all foreground/background
motion that does not obscure the photo. No `animation-timeline: view()`.

## Follow-up 2 (same day) — background zoom amplified

The Ken Burns zoom was too subtle to read as motion (6% over 32s). Per request,
widened `@keyframes kenBurns` to a **~13% zoom range** (`scale(1.03)` →
`scale(1.16)`) with a slightly larger gentle pan (`-2% / 1.4%`), keeping the same
slow 32s `ease-in-out infinite alternate` breathing loop. `from` is anchored at
`scale(1.03)` so the image is always overscanned (min ~1.5%, up to ~8%) — the C1
cursor parallax and the pan never expose a background edge. Reduced-motion still
disables it (static image).

## Follow-up 3 (same day) — background zoom sped up

Per request, increased the speed: `kenBurns` animation duration `32s → 20s`
(still `ease-in-out infinite alternate`). The ~13% zoom range and pan are
unchanged; the breathe just cycles faster.
