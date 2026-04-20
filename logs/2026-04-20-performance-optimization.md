# 2026-04-20: Website Performance Optimization

Comprehensive performance audit and optimization of the homepage and site-wide loading time.

## Changes Made

### Quick Wins
- **Image quality**: Reduced Hugo image processing quality from 100 to 75 (`config.yaml`). ~30-50% smaller images with no visible quality loss.
- **Duplicate images removed**: Deleted `static/media/websiteCover1.jpg` (295KB) and `websiteCover2.jpg` (248KB) that duplicated files in `assets/media/`.
- **Browser cache headers**: Added Cache-Control headers in `netlify.toml` for images (1 year), CSS/JS (30 days).
- **Netlify debug mode**: Turned off `debug = true` in the Hugo cache plugin.

### Homepage Optimizations
- **Canva iframe replaced**: Replaced the heavy Canva iframe embed (~500KB third-party JS) in `hero2.md` with a static image (`canva-hero.jpg`, 232KB) linking to the interactive version.
- **Parallax disabled**: Set `image_parallax: false` on `hero2.md` to eliminate scroll-triggered repaints.
- **YouTube facade**: Replaced YouTube iframe in `researchLab.md` with a click-to-load thumbnail. Saves ~400KB until the user clicks play.
- **Reduced homepage items**: Posts & Tutorials and Featured Publications both reduced from 5 to 3 items.

### Asset Compression
- **Gallery images**: Compressed the 3 largest gallery images:
  - `pic509`: 825KB PNG -> 132KB JPG
  - `pic508-20220804`: 793KB -> 214KB (resized from 3335x2223 to 1200px wide)
  - `pic508-20230327`: 387KB -> 309KB
- **CV PDF**: Compressed from 1.8MB to 87KB using Ghostscript.
- **Deleted avatarAnime.png**: Removed unused 2.4MB image from admin profile.

### Configuration
- **Conditional MathJax**: Set `math: false` globally in `params.yaml`. Added `cascade: math: true` in `content/post/_index.md` so posts still render math. Saves ~1MB on non-math pages (homepage, publications, etc.).
- **Disqus disabled**: Set comment provider to empty string. Saves ~300-500KB JS per post page.
- **Google Analytics upgraded**: Replaced legacy `UA-119157933-1` with GA4 `G-8H5LPC98XW`.

## Estimated Total Savings
- Homepage: ~3-4MB less on initial load
- Post pages: ~1.5MB less (no Disqus, conditional MathJax)
- Repeat visits: significantly faster due to cache headers
