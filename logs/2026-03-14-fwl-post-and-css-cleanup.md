# FWL Theorem Post, Dark Theme Figures, and CSS Cleanup

**Date:** 2026-03-14

## New post: FWL theorem (`content/post/python_fwl/`)

Added a new data science tutorial on the Frisch-Waugh-Lovell theorem, demonstrating how multivariate regression "controls for" confounders through the partialling-out procedure.

### Content
- Simulated retail dataset (50 stores, known DGP with true causal effect = +0.2)
- DAG visualization with Mermaid diagram
- Naive vs. controlled regression comparison (sign reversal from -0.106 to +0.267)
- Step-by-step FWL verification (partial and full residualization)
- Extension to multiple controls (income + day of week)
- Side-by-side naive vs. conditional comparison figure
- Applications section covering data visualization, computational efficiency (reghdfe/fixest/pyfixest), and Double Machine Learning
- Exercises and references

### Files
- `index.md` -- full tutorial with YAML front matter, Mermaid DAG, code blocks, output blocks, and interpretation paragraphs
- `script.py` -- standalone Python script with dark theme figure styling
- `notebook.ipynb` -- Jupyter notebook version
- `featured.webp` -- featured image (side-by-side comparison)
- 5 matplotlib figures: `fwl_naive_regression.png`, `fwl_residuals_income.png`, `fwl_partialled_out.png`, `fwl_scaled_residuals.png`, `fwl_comparison.png`
- `infographic_instructions.md` -- AI image generation prompt

### Dark theme figure styling
First post to use dark navy background (`#0f1729`) for all matplotlib figures, matching the site's dark navbar/footer aesthetic. Extended palette: grid lines `#1f2b5e`, light text `#c8d0e0`, white text `#e8ecf2`. Spine-free design with subtle grid lines.

### Writing style
Post uses minimal first-person pronouns ("we" only in tutorial step-by-step passages like "First, we regress..."). Descriptive passages use impersonal constructions, passive voice, and participial phrases.

### Front matter
- `image.placement: 3` for full-width featured image (prevents blurry lightbox enlargement)
- `diagram: true` for Mermaid DAG
- `toc: true` for left-side table of contents
- Links to Google Colab, Python script, and Jupyter notebook

## Data-science-post skill updates (`.claude/skills/data-science-post/SKILL.md`)

- Added dark theme palette documentation (colors, rcParams setup, usage guidance)
- Added simulated data (DGP) section for statistical/causal inference method posts
- Added CSS note about dark-background figure rendering

## CSS cleanup (`assets/scss/custom.scss`)

Removed borders and box-shadows for a cleaner, flatter design:
- Removed `border` and `box-shadow` from `.article-style img` (light mode)
- Removed `border` and `box-shadow` from `.docs-toc` (light and dark modes)
- Removed `border-left` from `.docs-toc #TableOfContents a.active`
- Removed `border-left` from nested TOC lists (`.docs-toc #TableOfContents ul ul`)
- Removed dark mode image border/shadow override (`.dark .article-style img`)
- Removed `border` from blockquote styling

## Documentation updates

- Added FWL post as reference post in `CLAUDE.md` and `README.md`
- Added dark theme figure palette mention in `CLAUDE.md` skill conventions
