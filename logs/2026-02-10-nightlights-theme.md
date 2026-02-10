# Nightlights Theme Implementation

**Date:** 2026-02-10

## What Changed

Replaced the default "ocean" theme with a custom "nightlights" theme inspired by nighttime lights satellite imagery, matching the site's research focus on spatial economics and development.

## Files Modified

- `data/themes/nightlights.toml` — New custom theme definition (color palette, section backgrounds)
- `config/_default/params.yaml` — Switched theme to `nightlights`, disabled day/night toggle, centered menu alignment
- `assets/scss/custom.scss` — Added callout accent color override and navbar menu centering adjustments
- `content/home/slider.md` — Removed duplicate `weight` key in front matter

## Color Palette

| Element | Color | Hex |
|---------|-------|-----|
| Primary | Blue | `#1e40af` |
| Navbar background | Dark navy blue | `#0e1545` |
| Menu text | White (85% opacity) | `rgba(255,255,255,0.85)` |
| Active link / Accent | Cyan/teal | `#00d4c8` |
| Menu title | White | `#fff` |
| Odd sections | White | `rgb(255,255,255)` |
| Even sections | Light blue | `rgb(240,245,250)` |

## Key Decisions

- **Day/night toggle disabled** — The nightlights theme is designed as a single light theme with a dark navbar; a dark mode variant was not created.
- **Menu centered** — Set `align: c` in params.yaml and added `flex-grow: 1` CSS on `.navbar-nav` to better distribute space.
- **Callout accent** — Overrode `.callout-note` border color to match the cyan accent (`#00d4c8`).

## Follow-up Fix: Button styling on dark sections (Section 6)

**Issue:** On dark-background sections (Featured Publications), `.btn-outline-primary` buttons became invisible on hover. Wowchemy's `.home-section.dark a { color: #1e40af }` overrode Bootstrap's hover text color, making text the same color as the background.

**Fix:** Added Section 6 to `custom.scss`:
- Normal state: solid filled buttons using navbar navy (`#0e1545`) with white text
- Hover/focus/active: cyan accent (`#00d4c8`) background with dark navy text (`#0e1545`)

## Follow-up Fix: Navbar brand/search overlap on small screens (Section 7)

**Issue:** On viewports < 992px, the brand name "Carlos Mendez" and the search icon overlapped. The brand wrapper uses `position: absolute` (full width, centered), while `ul.nav-icons` (search icon) remained in flex flow with `ml-auto` — both siblings occupying the same visual space.

**Fix:** Added Section 7 to `custom.scss`:
- Absolutely positioned `ul.nav-icons` to `right: 1rem` with vertical centering, removing it from flex flow
- Constrained `.navbar-brand-mobile-wrapper` with `left: 3rem; right: 3rem` plus overflow handling
- Added smaller font/padding for menu items on small desktops (992px-1199px)

## Documentation updates

- `README.md` — Updated Local Development section with Hugo binary path (`~/Library/Application Support/Hugo/0.84.2/hugo`)
- `CLAUDE.md` — Replaced "Hugo not installed" note with actual binary path and dev server command

## Current Status

All fixes verified locally and deployed. Custom SCSS now has 7 sections:
1. Hero2 full-width fix
2. Full-width iframe breakout
3. Collapsible dashboard sections
4. Nightlights callout accent
5. Navbar menu centering
6. Dark-section button styling (solid fill + accent hover)
7. Navbar brand/search overlap fix (mobile + small desktop)
