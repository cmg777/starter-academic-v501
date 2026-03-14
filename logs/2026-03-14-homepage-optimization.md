# Homepage optimization and visual refinements

**Date:** 2026-03-14

## Summary

Streamlined the homepage layout, introduced warm orange as a secondary accent color, and fixed gallery filename issues.

## Content cleanup

- Deactivated the slider (`content/home/slider.md`) -- contained Wowchemy demo text and a missing image reference (`contact.jpg`)
- Deactivated the tag cloud (`content/home/tags.md`) -- added visual noise without clear navigation value
- Simplified the Research Lab section (`content/home/researchLab.md`) -- removed the GDP dynamics map, Canva presentation, and Discord collaboration callout; kept YouTube video, VIIRS map, DMSP regression map, and population explorer (geoexplorer1)

## Layout changes

- Moved gallery from weight 66 to weight 52, placing it closer to the Students/Alumni section
- Replaced the callout note in Posts section with a centered "View All Posts & Tutorials" button

## Visual refinements

- Blockquote borders and post card top borders changed from teal (`#00d4c8`) to warm orange (`#d97757`) in both light and dark modes
- h2 underlines changed from teal to subtle blue (`rgba(26, 58, 138, 0.15)`) with tighter letter-spacing
- Post cards now display date and category badges between title and summary
- Back-to-top button styled to match nightlights theme (`#0e1545` background, `#00d4c8` text)

## File fixes

- Renamed 3 gallery images with trailing spaces in filenames (macOS-safe but Linux/Netlify-unsafe)
- Removed `.DS_Store` from gallery directory

## Files modified

- `assets/scss/custom.scss`
- `content/home/slider.md`, `tags.md`, `posts.md`, `researchLab.md`, `gallery/index.md`
- `content/home/gallery/gallery/` (3 renamed images, 1 deleted `.DS_Store`)
- `layouts/partials/li_compact.html`
