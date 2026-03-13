# DoubleML Post Updates, Infographic Skill Redesign, and Image Lightbox

**Date:** 2026-03-13

## Infographic skill redesign (`.claude/skills/infographic-instructions/SKILL.md`)

Redesigned the infographic-instructions skill from light-background sketchnote to dark-background chalkboard aesthetic:

- **Background**: navy blue `#0e1545` replaces implied white background
- **Color palette**: 6 dark-background-optimized colors — chalk white `#f0ece2` for text, bright steel blue `#8bb8e0` for headers, warm orange `#e8956a` for accents, teal `#00d4c8` for callouts, muted chalk gray `#b0a89a` for secondary elements
- **Design style**: chalkboard sketchnote with chalk-drawn lettering, chalk-dust textures, chalk borders, chalk swooshes on key numbers
- **Layout**: landscape orientation (16:9), 3x2 grid (3 columns x 2 rows)
- **New sections**: Visual Hierarchy (5-level text sizing) and Panel Layout (grid spec, connectors, numbering)
- Updated reference output (`content/post/python_partial_identification/infographic_instructions.md`)

## DoubleML post updates (`content/post/python_doubleml/`)

- Editorial pass: replaced `--` with em dashes `—` throughout
- Corrected mean values in histogram interpretation (1.971/2.057 replacing 1.98/2.05, gap 0.09 not 0.07)
- Clarified RCT framing: covariate adjustment improves precision, not removes bias
- Explicitly labeled $\theta_0$ as the ATE
- Expanded interpretation paragraphs with more context
- Generated infographic instructions (`infographic_instructions.md`) with chalkboard design
- Replaced `featured.png` with `featured.jpg`
- Synced `notebook.ipynb` with index.md changes

## Image lightbox (`layouts/post/single.html`, `assets/scss/custom.scss`)

Added click-to-enlarge image viewer for post pages:

- JS lightbox in `layouts/post/single.html` with keyboard navigation, prev/next arrows, and zoom-out close
- CSS overlay, close button, navigation arrows, and "Click to enlarge" hint in `assets/scss/custom.scss`
- Accessibility: ARIA roles, keyboard support (Escape, arrow keys)
- External badge images (Colab, etc.) excluded from zoom cursor

## Files changed

- `.claude/skills/infographic-instructions/SKILL.md`
- `content/post/python_partial_identification/infographic_instructions.md`
- `content/post/python_doubleml/index.md`
- `content/post/python_doubleml/notebook.ipynb`
- `content/post/python_doubleml/infographic_instructions.md` (new)
- `content/post/python_doubleml/featured.jpg` (new, replaces featured.png)
- `assets/scss/custom.scss`
- `layouts/post/single.html`
