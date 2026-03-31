# Panel Standard Errors Tutorial

**Date:** 2026-03-31
**Post:** `content/post/python_panel_ses/`

## Summary

New Python tutorial: "Standard Errors in Panel Data: A Beginner's Guide in Python." Compares six SE estimators (conventional, White, entity-clustered, time-clustered, two-way clustered, Driscoll-Kraay) using simulated panel data (100 firms x 10 years) with a known true effect (beta = 0.5). Includes entity and two-way fixed effects, and a 500-iteration Monte Carlo simulation showing empirical rejection rates.

## Key findings from the simulation

- Pooled OLS is biased (coeff = 1.03 vs true 0.5) due to correlated firm effects
- Entity FE recovers the true effect (coeff = 0.48)
- Monte Carlo: FE + entity-clustered SEs reject at 6.6% (near nominal 5%)
- Time-clustered SEs over-reject at 9.0% with only 10 year-clusters

## Deliverables

- `index.md` -- full tutorial (15 sections)
- `script.py` -- companion Python script (runs end-to-end, generates 5 figures)
- `notebook.ipynb` -- Colab notebook (32 cells)
- 5 dark-theme PNG figures
- `infographic_instructions.md` -- AI image-gen prompt (6 panels)
- `featured.webp` -- featured image

## Inspiration

Inspired by [Gregoire (2024)](https://vincent.codes.finance/posts/panel-ols-standard-errors/). Original simulated data, explanations, and code. Properly cited in post.

## Review status

- Referee report: MINOR REVISION (no HIGH issues, 7 MEDIUM all fixed)
- Proofread: PASS (all 10 checks)
- All referee fixes applied (jargon expanded, references reordered, H0 clarified, sentences split)
