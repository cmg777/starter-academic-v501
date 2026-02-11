# Gallery Carousel Implementation

**Date:** 2026-02-11

## What Changed

Replaced the homepage gallery grid layout (which displayed all 17 photos vertically, making the page long) with a Bootstrap Carousel that shows one image at a time with navigation controls.

## Files Modified

- `layouts/shortcodes/gallery-carousel.html` — New custom shortcode that auto-discovers images from the page bundle's `gallery/` subdirectory and renders them as a Bootstrap Carousel
- `assets/scss/custom.scss` — Added Section 8: gallery carousel styling (~70 lines)
- `content/home/gallery/index.md` — Switched from `{{< gallery >}}` to `{{< gallery-carousel >}}`, added `columns: "1"` for full-width layout

## Technical Details

### Shortcode (`gallery-carousel.html`)
- Auto-discovers images via Hugo page resources (no manual listing needed)
- Handles Wowchemy widget context: resources live on `.Page.Parent`, accessed with path `{widget-dir}/{album}/*`
- Uses Hugo's `.Fit "1200x700"` for image resizing (Lanczos, quality 75)
- Filters non-image resources (e.g., `.DS_Store`)
- First image loads eagerly; rest use `loading="lazy"`
- Parameters: `height` (default "500px"), `interval` (default "3000"), `album` (default "gallery")

### Carousel Features
- **Autoplay:** 3-second interval, pauses on hover (Bootstrap default)
- **Navigation arrows:** Hidden until hover on desktop, always visible on mobile
- **Dot indicators:** Circular, cyan (`#00d4c8`) active state
- **Slide counter:** "1 / 17" in bottom-right, updated via Bootstrap `slid.bs.carousel` event
- **Keyboard navigation:** Arrow keys when focused (Bootstrap default)

### Styling (Section 8 in `custom.scss`)
- Dark navy (`#0e1545`) background fills gaps around non-uniform aspect ratio images
- `object-fit: contain` preserves full images without cropping (1 portrait among 16 landscape)
- `max-width: 1200px` with `border-radius: 8px` for contained card-like appearance
- Responsive: 500px height desktop, 300px mobile (< 768px)

## Key Decisions

- **Bootstrap Carousel over CSS scroll-snap or SplideJS** — Bootstrap 4 is already bundled by Wowchemy v5 with full carousel support. Zero additional dependencies.
- **Contain (no crop) over cover** — Mixed aspect ratios (16 landscape + 1 portrait); dark navy background fills gaps cleanly.
- **Widget resource resolution** — In Wowchemy's widget page context, `.Page.Resources` is empty. Images are accessed via `.Page.Parent.Resources` with the widget folder name as prefix.

## Current Status

Custom SCSS now has 8 sections:
1. Hero2 full-width fix
2. Full-width iframe breakout
3. Collapsible dashboard sections
4. Nightlights callout accent
5. Navbar menu centering
6. Dark-section button styling
7. Navbar brand/search overlap fix
8. Gallery carousel styling
