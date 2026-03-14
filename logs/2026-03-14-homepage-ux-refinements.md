# Homepage UX Refinements

**Date:** 2026-03-14

## Changes

### Featured image layout (`layouts/partials/page_header.html`)
- Changed `container-fluid` to `container` for `image.placement: 3` — featured images now align with the navbar width instead of spanning the full viewport
- Added `mt-5` top margin for spacing between navbar and featured image

### Post card improvements (`layouts/partials/li_compact.html`)
- Removed category tags (Python, Tutorial) from homepage post card metadata — only the date is shown
- Added click-to-enlarge lightbox for post card images — clicking the image opens a full-screen lightbox with prev/next navigation instead of navigating to the post
  - Uses `data-full` attribute with 2560x2560 high-res image for lightbox view
  - Reuses existing lightbox CSS classes from `custom.scss` section 14
  - Script uses `window.__postCardLightboxInit` guard to prevent duplicate initialization
  - Supports keyboard navigation (Escape, Arrow keys)

### Posts & Tutorials homepage section (`content/home/posts.md`)
- Replaced "View All Posts & Tutorials" button with a callout note linking to the filtering page, matching the Publications section pattern
