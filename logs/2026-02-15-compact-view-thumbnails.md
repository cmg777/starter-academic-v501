# Larger Compact-View Thumbnails

**Date:** 2026-02-15

## What Changed

Enlarged the thumbnails in Wowchemy's compact view (`view: 2`) from the default 150px to 350px on desktop and from 80px to 200px on mobile. The compact view is used in the homepage Presentations widget and any other listing set to `view: 2`. The default thumbnails were too small to understand the image content.

## Files Modified

- `layouts/partials/li_compact.html` — New local override of the Wowchemy theme template. Only change: image resize from `.Resize "150x"` to `.Resize "350x"` so Hugo generates a higher-resolution source image.
- `assets/scss/custom.scss` — Added Section 10: larger compact-view thumbnails (~10 lines). Overrides `max-width` from 150px to 350px (desktop) and from 80px to 200px (mobile).

## Technical Details

Two things constrained the thumbnail size in the Wowchemy theme:

1. **Hugo template** (`li_compact.html`): `.Resize "150x"` generates a 150px-wide source image
2. **Theme CSS** (`_listing.scss`): `max-width: 150px` (80px on mobile at `<768px`)

A CSS-only fix would upscale the 150px source image, making it blurry. Both the template and CSS needed updating.

### Template override

The local `layouts/partials/li_compact.html` is a copy of the Wowchemy original at:
`github.com/wowchemy/wowchemy-hugo-modules/wowchemy@v0.0.0-20210324194200-fda9f39d872e/layouts/partials/li_compact.html`

The only change is line 79: `.Resize "350x"` instead of `.Resize "150x"`.

### CSS override (Section 10 in `custom.scss`)

```scss
.media.stream-item img {
  max-width: 350px;
}

@media (max-width: 767.98px) {
  .media.stream-item img {
    max-width: 200px;
  }
}
```

## Current Status

Custom SCSS now has 10 sections:

1. Hero2 full-width fix
2. Full-width iframe breakout
3. Collapsible dashboard sections
4. Nightlights callout accent
5. Navbar menu centering
6. Dark-section button styling
7. Navbar brand/search overlap fix
8. Gallery carousel styling
9. Mobile-friendly iframes and embeds
10. Larger compact-view thumbnails
