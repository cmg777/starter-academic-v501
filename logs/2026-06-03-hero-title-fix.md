# Native hero: transparent-title bug solved + polish pass; hero shipped

**Date:** 2026-06-03

## Background

The redesigned native hero (`content/home/hero2-new.md` — three translucent navy
panels, Cinzel title, gradient underline + pulsing dot, social icons, Ken Burns
background, cursor parallax) was built on 2026-05-11 but **parked** behind one
blocker: the `<h1>` title ("On the Geography of Development") rendered with
**transparent letterforms** — the background map showed through the glyphs —
while the sibling `<p>` tagline and author name rendered solid white. Seven CSS
iterations failed, and the 2026-05-11 investigation suspected a macOS
accessibility setting or a browser extension. The old Canva-GIF hero stayed live.

This session the user confirmed the transparent title reproduces **everywhere** —
Incognito, other browsers, and their phone — which ruled out any local
environment cause and proved it was a real, reproducible rendering issue.

## Root cause

The prior effort only read *source* CSS (which is clean) and only inspected the
*title text's* own computed style (also clean — solid white, no clip/mask/blend).
It never inspected the **parent panel's** opacity.

Driving a headless Chromium against the Hugo dev server and **diffing
`getComputedStyle` of the broken title vs the working tagline + walking the title's
ancestors** found it immediately: the parent `.hero-glass-card--title` panel sat
at **`opacity: 0.434`** at rest (scroll at the top of the page). That parent
opacity multiplies onto everything inside — navy panel *and* white text — so the
map showed through the white letters. The inline `opacity: 1` / `-webkit-text-fill-color`
the prior effort kept adding to the `<h1>` did nothing, because the transparency
lived on the parent, not the text.

Why only the title panel? The scroll-driven fade-out:

```scss
@supports (animation-timeline: view()) {
  .hero-glass-card {
    animation: heroFadeUp ... forwards, heroFadeOut linear both;
    animation-timeline: auto, view();
    animation-range: auto, exit 0% exit 70%;
  }
  @keyframes heroFadeOut { to { opacity: 0; transform: translateY(-30px); } }
}
```

`#hero2-new` has `overflow: hidden` (to clip the 1.06× Ken Burns background),
which makes it a **scroll container**. `animation-timeline: view()` binds to the
nearest scroll container, so the timeline tracked that non-scrolling box instead
of the document. Each panel then got a fixed, position-based "exit" progress even
at scroll 0: the topmost (title) panel resolved to ~57% exited → `opacity 0.43`,
the lower panels to ~0% → `opacity 1`. This fires on every browser supporting
view-timelines (Chrome 115+, Safari 17.4+, mobile) and is silently ignored on
those without — exactly the cross-environment pattern the user reported.

## The fix

- **`assets/scss/custom.scss` (Section 21):** removed the
  `@supports (animation-timeline: view())` `heroFadeOut` block. Panels now rely
  solely on the time-based `heroFadeUp ... forwards` entrance, so every panel
  ends at `opacity: 1`. (This also closes a reduced-motion gap: the old
  `heroFadeOut` was not disabled under `prefers-reduced-motion`.)
- **`content/home/hero2-new.md`:** removed the now-redundant inline
  `style="color:#fff; opacity:1; -webkit-text-fill-color:#fff"` from the `<h1>`.

Verified in headless Chromium: title panel `opacity` is now `1` (desktop +
mobile + reduced-motion), and the title renders solid white.

## Polish pass (same Section 21)

- **Double-height section:** the theme's `.home-section { padding: 110px 0 }`
  stacked on `.hero-native { min-height: 100vh }` (~100vh + 220px of dead space).
  Added `#hero2-new { padding-top: 0; padding-bottom: 0 }` and changed
  `.hero-native` to `min-height: calc(100vh - 60px)` / `calc(100svh - 60px)`
  (navbar offset). Hero is now content-height (~one viewport).
- **Contrast / honest glass:** added a brand-navy scrim `rgba(14,21,69,0.28)`
  as a third layer on `#hero2-new::after`; raised panel alpha `0.85 → 0.88`
  (hover `0.90 → 0.93`); added `backdrop-filter: blur(3px) saturate(115%)` and
  `box-shadow: 0 4px 24px rgba(8,14,40,0.35)` to the panels.
- **Focus-visible rings** (teal `#00d4c8` outlines) on social icons and the
  scroll indicator; teal text-shadow glow on social-icon hover.
- **Mobile:** more side/panel padding so text clears the accent border; title
  `letter-spacing 0.08em → 0.05em` to avoid a cramped third-line wrap; affiliation
  clamp floor `0.82rem → 0.85rem`. No horizontal scroll at 375px.
- **UX:** scroll-indicator entrance delay `1.8s → 1.3s`.

## Activation

- `content/home/hero2-new.md` → `active: true`; `content/home/hero2.md` →
  `active: false` (the Canva-GIF hero is retired but preserved). Updated the
  front-matter comment in `hero2-new.md` from "PARKED" to "LIVE / resolved".

## How to re-verify

Run `"$HOME/Library/Application Support/Hugo/0.84.2/hugo" server --disableFastRender`,
open `http://localhost:1313/`, and confirm the title is solid white in a normal
window, an Incognito window, and on a phone. The headless diagnostic/verification
scripts used this session: diff the title panel's computed `opacity` vs the lower
panels — all should read `1`.
