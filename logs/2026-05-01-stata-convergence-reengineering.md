# Re-engineer stata_convergence tutorial

**Date:** 2026-05-01
**Post:** `content/post/stata_convergence/`
**Status:** Complete

## What changed

The stata_convergence tutorial was re-engineered to fix two problems:

1. **Sample inconsistency:** The original tutorial used a varying sample (84 to 124 countries) across sections. Sections 1-2 used the 84 countries available since 1960, but Sections 3-9 reloaded data fresh per period, using all available countries. This introduced composition effects — most notably, the sigma convergence comparison used 84 countries in 1960 but 124 in 2019.

2. **Pedagogical gap:** The tutorial jumped from OLS to NLS without showing students how to extract the speed of convergence from familiar OLS output first.

## Changes made

### Balanced panel (84 countries)
- Added a filter in Section 0 of `analysis.do`: `bys ccode: egen has1960 = max(year == 1960 & !missing(gdppc))` followed by `keep if has1960 == 1`
- All sections now consistently use N=84
- Sigma divergence is actually stronger with the balanced panel: +90.8% (vs +60.4% previously)
- Convergence is slightly slower: beta = 0.00365, half-life = 190 years (vs 0.00425, 169 years)

### OLS-first pedagogy (new sections)
- **Section 6:** Speed & half-life from OLS — full algebraic derivation of beta = -ln(1+lambda*s)/s
- **Section 7:** NLS explanation — what it is, why OLS can't estimate beta directly, equation term by term, Stata syntax
- **Section 8:** Speed & half-life from NLS — same 6 periods
- **Section 9:** OLS vs NLS comparison — side-by-side table showing differences ~10^-17

### Comparative rolling windows and heatmaps
- **Two rolling-window figures:** OLS and NLS separately (Section 10)
- **Two heatmap figures:** OLS and NLS separately (Section 14)
- Both confirm identical results across methods

### Removed
- **Regional decomposition** (Section 9 in original) — not supported with 84-country sample
- **Fixed-sample sigma series** — balanced panel makes it unnecessary
- All regional claims from Discussion and Key Takeaways

### Section count
- Original: 16 sections
- New: 18 sections (added OLS speed, NLS explanation, NLS speed, OLS vs NLS comparison; removed regional decomposition)

## Files modified
- `analysis.do` — complete rewrite (12 code sections)
- `index.md` — complete rewrite (18 content sections)
- `results_report.md` — updated with 84-country results
- `script-review.md` — updated with new structure
- `infographic_instructions.md` — updated all numbers, replaced Panel 2 (data) with OLS vs NLS

## Figures
- 10 new PNGs generated (added speed_ols, speed_nls, rolling_beta_ols, rolling_beta_nls, heatmap_ols, heatmap_nls)
- 4 old PNGs deleted (heatmap, regional_beta, rolling_beta, speed_halflife)

## Key numbers (84-country balanced panel)
- 2000-2019: beta = 0.00365, speed = 0.36%/yr, half-life = 190 years, p = 0.023
- Sigma: 0.924 (1960) to 1.764 (2019), +90.8%, peak at 1.918 in 2008
- Beta-sigma lag: ~8 years (beta convergence ~2000, sigma convergence ~2008)
