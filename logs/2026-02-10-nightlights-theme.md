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
| Primary | Deep navy | `#0f1b3d` |
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

## Current Status

Theme is complete and approved after local preview. Deployed to production via Netlify.
