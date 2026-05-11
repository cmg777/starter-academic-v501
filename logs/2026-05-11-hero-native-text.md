# Landing-page hero: Canva-faithful replica with native HTML

**Date:** 2026-05-11

## Motivation

The previous landing page (`content/home/hero2.md`) overlaid a Canva-exported
JPG (`static/media/canva-hero.jpg`) on top of the night-lights background
(`assets/media/websiteCover5.webp`). The JPG had all the headline text baked
in, which produced a visible rectangular "image-on-image" seam, made the text
unselectable / non-indexable / non-screen-reader-friendly, and meant any copy
change required a round trip through Canva.

The goal of this change is to keep the original Canva design language
(translucent blue panels, Trajan-style inscriptional caps, monospace URL, fully
visible night-lights map) but render every glyph as native HTML/CSS so the
text is selectable, indexable, and editable in markdown.

## Changes

### `content/home/hero2.md`
- Replaced the `<a href="canva.com"><img src="/media/canva-hero.jpg"></a>`
  overlay with three semantic `<div class="hero-glass-card">` blocks:
  1. Title (`<h1>`) + subtitle (`<p>`)
  2. Tagline (`<p>`)
  3. Author block — name + URL + affiliation, with `--author` modifier
- `image_darken` stays at `0` so the night-lights map remains fully visible
  edge-to-edge; the translucent panels are the only thing providing contrast.

### `assets/scss/custom.scss` — Section 21
- `@import` Cinzel from Google Fonts (weights 500, 600, 700). Used for title,
  tagline, and author-name — closest open-source match to the original's
  Trajan-style inscriptional capitals.
- `.hero-glass-card` is a flat translucent navy rectangle
  (`rgba(18, 32, 75, 0.58)`) with a 4 px radius. No backdrop-filter, no box
  shadow, no border — matches the original's screen-printed look.
- `.hero-glass-card--author` modifier narrows the third panel to 580 px so
  the layout matches the original's proportional widths (title/tagline wider,
  author narrower).
- `.hero-author-url` uses a system monospace stack (SF Mono / JetBrains Mono /
  Fira Code / Monaco / Consolas / Courier New, monospace) to reproduce the
  distinctive code-font URL line.
- Sans-serif subtitle and affiliation inherit from the Wowchemy body font.
- Subtle fade-in-up entrance animation on the three panels (0.15 s / 0.40 s /
  0.65 s stagger). `prefers-reduced-motion: reduce` disables it.
- Mobile breakpoint at 600 px tightens padding and reduces border-radius.

## Verification

Tested locally at `http://localhost:1313/`:
- Night-lights world map is fully visible across the viewport, no darkening.
- Three translucent navy panels stack vertically; author panel is narrower.
- Title, tagline, and author name render in Cinzel (verified via DevTools →
  Network → Font: `Cinzel-...woff2` loaded).
- `https://carlos-mendez.org` renders in monospace.
- Title is a real `<h1>`, all text is selectable.
- Hugo build clean (no warnings).

## Follow-up (optional)

- `static/media/canva-hero.jpg` is now orphaned — safe to delete in a future
  cleanup commit. Keep around for now in case rollback is desired.
- The legacy `hero.md` (inactive, weight 03) is untouched and remains
  available as an alternative widget if needed later.

## Phase 3 — full enhancement pass (same day)

Building on the Canva-faithful base, applied a curated set of 2025–26 hero
design upgrades. User-approved direction: "apply all" with confirmed picks
for URL→icons, no kicker, no live badge, subtle brand underline.

### Background
- Ken Burns slow zoom/pan on the night-lights map (32 s loop on `#hero2::before`).
- Top + bottom edge mask gradients fading to navbar navy (`#0e1545`) via
  `#hero2::after`, for seamless transitions into adjacent widgets.

### Title
- Word-by-word reveal: title split into 5 `<span class="hero-word">` elements,
  fading in with a 100 ms stagger after a 200 ms delay.
- Font-weight 600 → 700, letter-spacing 0.04 em → 0.08 em, line-height 1.15 → 1.05.
- Subtle teal text-glow (`text-shadow: 0 0 24px rgba(0, 212, 200, 0.18)`).
- New `.hero-title-underline` div: 90 px wide gradient line (teal → orange,
  fading at edges) with a single 6 px teal dot pulsing at center (2.4 s loop).

### Subtitle
- Font swap to Cormorant Garamond italic (loaded alongside Cinzel in the
  Google Fonts `@import`). Editorial/academic feel.

### Tagline
- Letter-spacing 0.06 em → 0.08 em (matches title rhythm).

### Author block
- `.hero-author-url` removed entirely (the monospace URL line).
- Replaced with `.hero-social-icons` row: ORCID + Google Scholar + GitHub +
  LinkedIn, sourced from `content/authors/admin/_index.md`. Icons in 75 %
  white, hover → teal `#00d4c8` with 2 px lift.

### Panels
- Left-edge brand accents (3 px solid border): title teal, tagline orange,
  author steel-blue. Ties hero to the rest of the site palette.
- Hover micro-lift: 2 px rise + alpha 0.58 → 0.66.
- Cursor-reactive parallax: inline `<script>` in `hero2.md` listens to
  `mousemove`, sets `--px` / `--py` CSS vars on each panel. Title moves 6 px,
  tagline 4 px, author 3 px. Uses modern CSS `translate` property so it
  composes with the entrance `transform` without conflict. Disabled on touch
  and reduced-motion.
- Scroll-driven fade-out via `animation-timeline: view()` — panels gently
  fade and rise as the user scrolls past, wrapped in `@supports` for graceful
  degradation on Firefox.

### Hero size + scroll indicator
- `min-height: 78 vh` → `100 vh` desktop, `100 svh` mobile (iOS Safari fix).
- New `.hero-scroll-indicator` anchor below the author panel: small "scroll"
  label in letter-spaced caps + bouncing teal chevron, fading in at 1.8 s.
  Click smooth-scrolls to `#about`. Hidden on viewports shorter than 600 px.

### Performance
- Cinzel weights reduced (500;600;700 → 500;700) — we only need two weights.
- Cormorant Garamond italic only (`ital,wght@1,400;1,500`) — no roman weights
  loaded.
- Preload optimization deferred (would require overriding Wowchemy's
  `site_head.html`, risking theme drift on updates).

### Accessibility
- `aria-label` on icon links and the social row.
- `aria-hidden="true"` on decorative chevron and underline.
- Full reduced-motion block: disables Ken Burns, panel entrance, word reveal,
  pulse, scroll-bounce, text-glow. Layout still resolves correctly.

### Readability tweak (post-feedback)
- Bumped panel alpha from `rgba(18, 32, 75, 0.58)` → `0.85` and hover from
  `0.66` → `0.90`. The night-lights map has many high-luminance dots that
  were punching through the panels and breaking up the white Cinzel text,
  particularly behind the title. The map remains fully visible around the
  panels; inside, it now reads as a faint shadow rather than competing with
  the text.

### Readability tweak v2 — title text-shadow contrast halo
- After the opacity bump the title still read as washed-out next to the
  crisp white tagline. Root cause: the title's `text-shadow: 0 0 24px
  rgba(0, 212, 200, 0.18)` (wide teal glow) was mixing with bright map
  dots bleeding through the panel and muddying each letter's perceived
  edge. Replaced it with a two-layer dark halo:
  `text-shadow: 0 1px 3px rgba(0, 0, 0, 0.85), 0 0 12px rgba(0, 0, 0, 0.55);`
  Each white letter now has a tight dark outline plus a softer dark
  backing glow, so the title pops as fully opaque crisp white regardless
  of what's behind. Panel opacity left at 0.85 (user explicitly declined
  going fully solid). Tagline and author-name untouched — both already
  read correctly without a text-shadow.

### Readability tweak v3 — pixel-level text outline on title
- v2 was still not enough. The 12 px soft outer shadow created an
  ambiguous gradient zone at every letter edge that, against bright
  red/orange city-light dots bleeding through the 0.85 panel, the eye
  read as translucency — even though `.hero-title` was confirmed
  `color: #fff` in compiled CSS with no opacity / background-clip /
  blend-mode conflict.
- Switched from blur-based readability to a hard, pixel-level outline:
  `-webkit-text-stroke: 1.5px rgba(0, 0, 0, 0.95);` plus
  `paint-order: stroke fill;` so the white fill is drawn ON TOP of the
  stroke (otherwise default `fill stroke` would overdraw the fill and
  make letters look thinner). Tightened the text-shadow at the same
  time: `0 1px 2px rgba(0, 0, 0, 0.9), 0 0 6px rgba(0, 0, 0, 0.7);`.

### Resolution — strip every effect I piled on the title
- After Dark Reader was toggled off, the title was STILL transparent in
  the user's screenshot while the tagline and author name rendered as
  crisp solid white. Crucial observation: same `color: #fff`, same navy
  panel, same dark-section context — yet only the title was broken.
- The CSS difference was the stack of "defensive" effects accumulated
  across rounds v2–v5 on the title specifically:
  `-webkit-text-stroke: 2px #000000`, `paint-order: stroke fill`, an
  8-direction wall-of-shadows `text-shadow`, `color/opacity !important`
  spam, plus the `<span class="hero-word">` wrappers and `wordIn`
  animation. The tagline and author name had NONE of these and rendered
  fine.
- Conclusion: **the effects I added to fix the symptom were creating
  the symptom.** Most likely the text-stroke + paint-order combination
  on thin-stroke Cinzel glyphs was rendering the dark stroke *inside*
  the letter geometry, consuming the white fill and leaving patches of
  the navy panel visible inside the letterforms (which the user read
  as "transparency"). The 8-direction shadow stack compounded it.
- Fix: deleted every title-specific effect and reverted `.hero-title`
  to the same minimal CSS as `.hero-tagline` — just font, size, weight,
  letter-spacing, uppercase, white. The title-as-TITLE styling (large,
  bold, letter-spaced) is preserved; only the broken effects are gone.
- Also removed the `<span class="hero-word">` wrappers from the title
  markup and the `wordIn` keyframe and `.hero-title .hero-word` rule
  block from the SCSS, plus the now-unused reduced-motion overrides
  for those selectors. (User-confirmed in the resolving round that the
  word-by-word entrance was OK to drop.)
- The `color-scheme: dark light` declaration added during the Dark
  Reader misdiagnosis stays — harmless and useful future-proofing.

- After five rounds of CSS readability fixes, the user still reported the
  map showing through the title letters on localhost. Exhaustive search
  of the cascade confirmed no `-webkit-text-fill-color`, `background-clip:
  text`, `mix-blend-mode`, `filter`, `mask`, or `clip-path` rule anywhere
  that could make the text fill transparent. By all standard CSS the
  title HAD to render as solid opaque white.
- Asked the user about browser extensions. Confirmed: **Dark Reader** (or
  similar theme-injecting extension) was installed. That was the cause.
  Dark Reader injects its own stylesheet AT RUNTIME (after the page
  loads) that rewrites text-fill colors to semi-transparent so its
  synthetic dark-mode filter can show through. The injected CSS lives
  only in the browser's render tree — `curl` and any server-side
  inspection cannot see it. Every CSS fix I tried was correct on the
  server and silently overridden in the user's browser.
- Site-side mitigation added at the top of `custom.scss`:
  ```scss
  :root, html, body {
    color-scheme: dark light;
  }
  ```
  Most theme-injecting extensions (Dark Reader included) honor pages
  that declare a native dark color scheme and skip the auto-darkening.
- User-side mitigation: disable Dark Reader for this site via the
  extension's per-site toggle.

### Readability tweak v4 — defensive layers + wall-of-shadows (kept as armor)
- v3 still didn't visually register as fully opaque white. Couldn't
  reproduce a single root cause across the cascade, so switched to a
  belt-and-suspenders approach with four independent guarantees:
  1. `color: #ffffff !important` — overrides any cascading rule.
  2. `opacity: 1 !important` on both `.hero-title` and `.hero-title .hero-word`
     — guarantees no opacity animation or inheritance can ever leave the
     text below full opacity.
  3. `-webkit-text-stroke: 2px #000000` — bumped to integer 2 px for
     consistent rasterization across browsers (1.5 px renders unreliably
     in some Safari/Chrome combinations).
  4. Wall-of-shadows text-shadow — eight 1–2 px solid black offsets in
     all cardinal/diagonal directions plus a soft drop shadow. This is
     the classic CSS outline emulation; works in every browser regardless
     of `-webkit-text-stroke` support.
- Also removed the `opacity` property from the `wordIn` `@keyframes` so
  the word-by-word entrance now animates `transform` only — words can
  never end up below full opacity even if the animation is interrupted
  or cached weirdly. The visible reveal effect is preserved (words still
  slide up); they just never go below 1.0 alpha.

## Final status — new hero PARKED, old hero LIVE

After seven CSS iterations the title transparency on the user's macOS
was still unresolved. User decided to **revert to the original
Canva-JPG hero** (live) and **preserve the new hero** for future work.

### Current state of the site

- **`content/home/hero2.md`** — restored to the original Canva-JPG
  overlay (`active: true`). Live on the homepage.
- **`content/home/hero2-new.md`** — NEW file, holds the full redesigned
  hero (`active: false`). Hugo skips inactive widgets so it does not
  render; the file is parked on disk, ready to swap in.
- **`assets/scss/custom.scss` Section 21** — kept verbatim, but all
  `#hero2` selectors rescoped to `#hero2-new`. The class-based rules
  (`.hero-glass-card`, `.hero-native`, `.hero-title`, etc.) stay as-is
  because the old hero's markup doesn't use those classes — they're
  dormant. Section 1 (`#hero2 .container { max-width: 100% !important; }`
  for the old hero full-width fix) is untouched.
- **`color-scheme: dark light`** declaration at the top of `custom.scss`
  stays (harmless).
- **`static/media/canva-hero.jpg`** kept — needed by the old hero.
- **Inline JS** in `hero2-new.md` updated to reference
  `document.getElementById('hero2-new')` (was `'hero2'`), so cursor
  parallax works correctly when re-activated.

### To re-activate the new hero

1. Flip `active: true` in `content/home/hero2-new.md`.
2. Flip `active: false` in `content/home/hero2.md`.
3. Save — Hugo hot-reloads. The new-hero CSS auto-applies (scoped
   to `#hero2-new`).

### Open issue when resuming

Title text rendered as transparent (map visible through letterforms)
in the user's macOS browser, even though every cascade-level CSS rule
was confirmed solid white (`color: #fff` plus inline `style=` with
`-webkit-text-fill-color: #ffffff`). The tagline and author name —
same color, same panel, same dark section — rendered correctly. After
ruling out Dark Reader (user disabled it), browser cache (hard
refreshed), and every transparency-causing CSS property (none present
in the cascade), the remaining hypotheses are:

1. **macOS Accessibility → Display setting** (Reduce transparency,
   Increase contrast, Color filters, or Differentiate without color)
   that selectively affects large heading rendering. User has not yet
   verified.
2. **A second browser extension** beyond Dark Reader. User said only
   Dark Reader is installed — but the symptom is so specific that an
   undiscovered extension or pinned site policy is worth a re-check.
3. **A browser-rendering quirk** specific to large Cinzel headings at
   the user's screen resolution. Less likely.

Next step when user resumes: confirm OS accessibility settings, then
test in Incognito / Private mode (extensions disabled by default).

### Feature inventory of the new hero (parked, for reference)

So future sessions know what's already built:

- **Three translucent navy panels** (`rgba(18, 32, 75, 0.85)`) with
  brand-color left edges — teal `#00d4c8` (title), warm orange
  `#d97757` (tagline), steel blue `#6a9bcc` (author).
- **Cinzel serif** for title (700 weight), tagline (500), and author
  name (700). All uppercase, letter-spaced.
- **Cormorant Garamond italic** for the subtitle.
- **Gradient brand underline** (teal → orange, 90 px) with a 6 px
  **pulsing teal dot** at its center below the title.
- **Social icon row** in the author panel: ORCID, Google Scholar,
  GitHub, LinkedIn (sourced from `content/authors/admin/_index.md`).
- **Bouncing teal scroll indicator** at the bottom of the hero,
  smooth-scrolls to `#about` on click.
- **Ken Burns slow zoom + pan** background animation on
  `#hero2-new::before` (32 s loop, scales 1.00 → 1.06).
- **Top + bottom edge mask gradients** fading to navbar navy
  `#0e1545`, on `#hero2-new::after`.
- **Cursor-reactive parallax** on the panels (inline `<script>` in
  `hero2-new.md`, max 3–6 px movement, disabled on touch and
  prefers-reduced-motion).
- **Panel hover micro-lift** (2 px rise, alpha 0.85 → 0.90, smooth
  0.3 s transition).
- **Scroll-driven fade-out** via `animation-timeline: view()` on
  Chrome/Safari; Firefox falls back to no fade.
- **100 vh / 100 svh** hero height (iOS Safari address-bar fix).
- **Mobile responsive** breakpoints at 600 px (tighter padding,
  reduced border-radius, scroll indicator hidden on `max-height:
  600 px`).
- **`prefers-reduced-motion: reduce` overrides** for every animation.
- Subset Google Fonts request: only Cinzel weights 500/700 and
  Cormorant Garamond italic 400/500 are downloaded.

The user is interested in resuming this hero redesign in a future
session. This work is paused, not abandoned.
