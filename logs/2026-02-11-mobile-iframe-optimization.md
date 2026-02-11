# Mobile Iframe and Embed Optimization

**Date:** 2026-02-11

## What Changed

Made all iframes and embeds across the site mobile-friendly. The site had ~28 iframes with hardcoded pixel heights (600px, 450px, 650px) that consumed too much vertical space on smartphones. A single global CSS rule now caps their height on mobile, plus two targeted content fixes for edge cases.

## Files Modified

- `assets/scss/custom.scss` — Added Section 9: mobile-friendly iframes and embeds (~20 lines)
- `content/publication/20250605-EE/index.md` — Replaced fixed `560x315` YouTube with responsive 16:9 container
- `content/tutorials/python_esda/index.md` — Converted `height:6in` inline style to HTML attribute for global CSS compatibility

## Technical Details

### Global CSS Fix (Section 9 in `custom.scss`)

Three rules:

1. **`iframe { max-width: 100% }`** — Prevents any iframe from overflowing its container horizontally
2. **`iframe[height] { max-height: 60vh !important }`** (at `<768px`) — Caps height on mobile for all iframes with HTML `height` attributes. On iPhone (667px viewport), this limits iframes to ~400px.
3. **`.full-width-iframe-container` mobile override** (at `<768px`) — Disables the `100vw` viewport breakout on phones where the content container is already near full-width

### Why `iframe[height]` selector works

The key insight: problematic iframes use HTML `height` attributes (e.g., `height="600"`), while already-responsive iframes use inline `style="position: absolute; height: 100%"`. The CSS attribute selector `iframe[height]` targets only the former, leaving responsive embeds untouched.

### Iframes fixed by the global rule (~28 total)

- `content/home/researchLab.md`: 1 YouTube + 4 GEE maps (all `height="600"`)
- `content/home/eventsOnline.md`: lu.ma calendar (`height="450"`)
- 8 tutorial pages: GEE map iframes (`height="600"`)
- `content/publication/20220616-JCES/index.md`: 4 Deepnote embeds
- `content/publication/20220104-ComparativeEcoStud/index.md`: 5 Deepnote/slides embeds
- `content/publication/20230802-SCED/index.md`: 1 Deepnote embed
- `content/publication/20231124-LSRS/index.md`: YouTube (`height="400"`)
- `content/publication/20200817-RSPP/index.md`: YouTube (`height="400"`)
- `content/post/20240917-.../index.md`: lu.ma (`height="650"`)
- `content/event/20241113GDSL/index.md`: lu.ma (`height="650"`)

### Iframes NOT affected (already responsive)

- Canva embeds (hero2, researchLab, events, publications) — use 16:9 padding-bottom trick
- YouTube embeds in responsive containers — same padding technique
- `fullwidth-iframe` shortcode — uses inline `style="height: min(..., 70vh)"`
- Gallery carousel — uses `<img>`, not `<iframe>`

### Targeted content fixes

- **20250605-EE YouTube**: Had `width="560" height="315"` (fixed pixels, overflows on phones <560px). Wrapped in standard 16:9 responsive container matching existing site pattern.
- **python_esda map**: Had `style="height:6in"` (inline style, invisible to `iframe[height]` selector). Converted to `height="576"` HTML attribute so the global cap applies.

## Why 60vh?

- iPhone (667px viewport): `60vh = 400px` — enough to interact with maps/videos
- iPad (1024px viewport): `60vh = 614px` — close to original 600px, minimal visual change
- Desktop: No effect — `max-height: 60vh` is larger than the fixed heights

## Current Status

Custom SCSS now has 9 sections:
1. Hero2 full-width fix
2. Full-width iframe breakout
3. Collapsible dashboard sections
4. Nightlights callout accent
5. Navbar menu centering
6. Dark-section button styling
7. Navbar brand/search overlap fix
8. Gallery carousel styling
9. Mobile-friendly iframes and embeds
