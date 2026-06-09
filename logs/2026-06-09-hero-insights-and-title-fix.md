# Hero: prominent rotating insights + grey-title root-cause fix

**Date:** 2026-06-09

## Background

The native hero (`content/home/hero2-new.md`, styled by Section 21 of
`assets/scss/custom.scss`; lineage in `2026-06-03-hero-dynamic-enhancements.md`
and `2026-06-03-hero-title-fix.md`) shows a rotating list of research pillars in
its subtitle ("Insights from {pillar ⇄ …}"). Two requests this session:

1. Make the rotating **insights more prominent ("notorious")** and **refresh the
   word list**.
2. (follow-ups) The **title "ON THE GEOGRAPHY OF DEVELOPMENT" rendered greyish** —
   make it a crisp, impactful white.

Direction was confirmed via clarifying Q&A: a "moderate glow-up" keeping the same
DNA — transparent panels (no frosted glass, already removed per earlier review),
the kept `websiteCover5.webp` photo, and no new motion.

## 1. Rotating insights — new word list (EN/ES/JA)

The pillars were replaced, kept in sync across `data-rotate`, `aria-label`, and
the static reduced-motion/screen-reader fallback in all three language files.
Final list (4):

| EN | ES | JA |
|----|----|----|
| Geospatial Big Data | Macrodatos geoespaciales | 地理空間ビッグデータ |
| Development Economics | Economía del desarrollo | 開発経済学 |
| Spatial Econometrics | Econometría espacial | 空間計量経済学 |
| Causal Machine Learning | Aprendizaje automático causal | 因果機械学習 |

This dropped the prior "Causal Inference" and "Machine Learning". ("Bayesian
Econometrics" / "Econometría bayesiana" / "ベイズ計量経済学" was added mid-session
then removed per request, leaving 4.)

## 2. Make the insight "notorious" (the star treatment)

`.hero-rotator-item` (Section 21) — the rotating term is now the focal element of
the subtitle:

- `font-size: clamp(1.3rem, 2.7vw, 1.95rem)` (was inheriting ~1–1.25rem),
  `font-weight: 500`, luminous brand-teal glow
  `text-shadow: 0 0 20px rgba(0,212,200,0.45), 0 1px 3px rgba(8,12,38,0.6)`.
- New `.hero-subtitle-lead` rule shrinks/recedes "Insights from"
  (`clamp(0.95rem,1.4vw,1.15rem)`, `opacity: 0.85`).
- Mobile: `.hero-rotator-item { white-space: normal }` + centered, so the longer
  term wraps below the lead (no horizontal scroll). The `inline-grid` single-cell
  stacking is preserved, so the box doesn't reflow as terms swap.
- **No new motion** — the existing 2.8s fade/slide rotation is unchanged.

## 3. Supporting polish (moderate glow-up)

- Legibility `text-shadow` on title/tagline/subtitle/author (panels stay transparent).
- 3-stop underline gradient teal→steel→orange drawn to 110px (was 90px, two-stop);
  brighter pulsing dot.
- Deeper scrim (`0.28 → 0.34`) + a soft center vignette. **(See §4 — this is what
  greyed the title.)**
- Tightened panel spacing.

## 4. The grey-title saga + root-cause fix

The title read **greyish**, and the obvious first move — thinning the title's
`text-shadow` (commit `1a9149c`) — **did not fix it**, because the shadow was never
the cause (a thin edge-shadow can't grey the whole letter *fill*).

**Root cause — layering, not color.** The title text is explicit `#fff`. The hero's
navy **scrim/vignette `#hero2-new::after` sat at `z-index: 2`**, while the content
wrapper `#hero2-new > *` sat at `z-index: 1`. That wrapper's numeric `z-index`
creates a stacking context that **traps all hero text (incl. `.hero-native {
z-index: 3 }`) below the scrim**, so the navy overlay was painted *on top of* the
white letters. The §3 polish made it acute: deepening the flat scrim (`0.28→0.34`)
**and** adding a `0.30` radial vignette centred at `50% 45%` — directly behind the
title — stacked to a ~50% navy veil over the title → blue-grey.

An Explore pass ruled out other causes: nothing leaves opacity < 1; no
filter/blend; `text_color_light` is inactive (title is explicit `#fff`); and the
theme's link rules don't override the title color (already proven on 2026-06-03 that
`color: inherit` renders white, not link-blue).

**Fix (commit `bbe2ed2`).** Swap two z-indexes so the paint order is
**photo → scrim → content**:

- `#hero2-new::after` (scrim+vignette): `z-index: 2 → 1`
- `#hero2-new > *` (content wrapper): `z-index: 1 → 2`

The scrim still sits above the photo (keeps calming the city lights, incl. what
shows through the transparent panels), but the text now renders **above** it as true
`#fff`. Background/scrim mood is unchanged — only the glyphs un-grey. Also added
`color: inherit !important` to `.hero-title-link` as a belt against any future theme
link-color rule (a precaution, not the actual fix). Because the veil was *shared*,
the tagline, author block, and teal insight term also render at their true brighter
colors; the title stays sharpest via its thin shadow.

## Files touched

- `assets/scss/custom.scss` — Section 21 (rotator star treatment, `.hero-subtitle-lead`,
  legibility shadows, scrim/vignette, underline, spacing, **z-index swap**, title-link
  `!important`).
- `content/home/hero2-new.md`, `content/es/home/hero2-new.md`,
  `content/ja/home/hero2-new.md` — the 4-pillar `data-rotate` + `aria-label` +
  visible fallback, per language.

## Commits

- `5f55622` — insights word list + "notorious" star treatment + supporting polish (EN/ES/JA).
- `1a9149c` — thinned the title shadow (superseded; the shadow wasn't the cause).
- `bbe2ed2` — **z-index root-cause fix** (scrim below content) + title-link color guard.
- (this log)

## Verification

Per the owner's preference this session, changes were reviewed on the live Netlify
deploys rather than a local build (the pinned 0.111.3 build was too slow for the
iteration loop); SCSS edits were sanity-read for validity before each push. The
owner approved the final result ("I like it"): the title is crisp true white and the
rotating insight is a prominent glowing teal focal point, across EN/ES/JA.

## Regression guards (for future hero edits)

- **No `animation-timeline: view()`** anywhere under `#hero2-new` (the 2026-06-03
  transparent-title root cause). Still absent.
- **The scrim now sits BELOW the content** (`#hero2-new::after` z-index `1` <
  `#hero2-new > *` z-index `2`), so the text renders above it. Darkening the
  scrim/vignette to tame the photo is now safe (it no longer veils the text — that
  was the grey-title trap) — but do **not** raise `::after` back above the content
  wrapper.
- **Panels stay transparent** (`.hero-glass-card { background: transparent }`);
  frosted glass was removed per review and should not return.
- **i18n:** the three `hero2-new.md` files are intentional mirrors — only the
  subtitle strings differ per language; edit all three together (the i18n parity
  tooling does not track `content/home/` widgets).
