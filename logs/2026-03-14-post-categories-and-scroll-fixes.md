# Post Categories, Navbar Scroll Fix, and Filter Page Improvements

**Date:** 2026-03-14

## Changes

### 1. Topic categories added to all ~30 posts

Added `categories:` field to every post in `content/post/` for use with the Isotope filter dropdown on `/post/`. Categories assigned:

- **Causal Inference** -- DoWhy, DoubleML, FWL, Partial Identification, DiD, Synthetic Control, CO2 tax
- **Machine Learning** -- Random Forest, DoubleML (cross-listed)
- **Spatial Data Science** -- ESDA, GWR/MGWR, spatial weights, intro spatial, spatial inequality
- **Regional Development** -- monitoring regional development, subnational HDI, convergence clubs, Solow model
- **Spatial Heterogeneity** -- GWR/MGWR (cross-listed)
- **Remote Sensing / Google Earth Engine** -- all `gee_*` posts
- **Spatial Econometrics** -- Stata spatial regression posts

Also added corresponding `tags:` entries (e.g., `causal inference`, `machine learning`, `spatial`).

### 2. Custom scroll handler (`assets/js/custom-scroll.js`)

New file that overrides Wowchemy's navbar scroll handler for reliable anchor navigation. The theme's `jQuery.animate({scrollTop})` sometimes scrolled to wrong sections. The custom handler uses native `window.scrollTo()` with smooth behavior and correct navbar offset calculation.

Also includes a capture-phase `hashchange` event blocker that prevents Wowchemy's scroll handler from firing on filtering pages (`/post/`, `/publication/`). This fixes a bug where selecting a category from the dropdown caused a large blank gap between the navbar and content.

Loaded via `plugins_js: ['custom-scroll']` in `config/_default/params.yaml`.

### 3. Homepage posts widget title restored

Changed `content/home/posts.md` title back to "Posts & Tutorials" (navbar still shows just "Posts" via `menus.yaml`).

### 4. Removed unused CSS padding hack

Removed `.js-widget-page { padding-bottom: 60vh; }` from `assets/scss/custom.scss` -- no longer needed since the custom scroll handler properly handles bottom-of-page section navigation.
