# DiD Post: Staggered Dataset Exploration Enrichment

**Date:** 2026-03-19

## Changes to `content/post/python_did/`

### Enriched staggered dataset exploration section

The "Exploring the staggered dataset" subsection previously showed only a never-treated unit (unit 0) via `head(10)`, making it impossible for readers to see how the staggered structure manifests in the data. Three improvements were made:

#### 1. Added early-treated and late-treated unit examples

- **Early-treated unit (cohort 3, unit 90):** Shows `treated` flipping 0→1 at period 3, `treat` staying at 1 throughout, and `true_effect` growing from 2.0 to 3.2 across 7 post-treatment periods.
- **Late-treated unit (cohort 7, unit 91):** Shows the longer pre-treatment phase (7 periods) and only 3 post-treatment periods, with `true_effect` reaching just 2.4 by period 9.
- Interpretation paragraphs explain the asymmetry that causes TWFE bias.

#### 2. Clarified `treated` vs `treat` column definitions

Previously, `treat` was vaguely called a "secondary treatment indicator." Now all four staggered-specific columns are defined with bullet points:
- `first_treat`: period of treatment onset (0 = never)
- `treat`: time-invariant group membership (ever-treated = 1)
- `treated`: time-varying post-treatment indicator (flips 0→1 at onset)
- `true_effect`: ground-truth effect for verification

#### 3. Replaced uninformative crosstab

The old `pd.crosstab(first_treat, period)` showed identical counts across all periods (balanced panel — no variation). Replaced with a crosstab of **treated unit counts** by cohort and period using `values=data_stag["treated"], aggfunc="sum"`. The new table shows zeros cascading to treatment counts (0→60→135→210), directly visualizing the staggered rollout.

### Reduced overuse of Cunningham (2021) citation

The citation appeared 4 times across the post. Kept only the one at the ATT + Bias decomposition (the potential outcomes illustration it was intended for). Removed from:
- Successive differencing paragraph
- Potential outcomes framework introduction (kept Rubin, 1974)
- TWFE regression definition

### Reframed learning objectives

Removed function names (e.g., `DifferenceInDifferences().fit()`) from learning objectives. All six objectives are now conceptual:
- Estimate the ATT using classic DiD
- Interpret event study plots
- Recognize why TWFE fails under staggered adoption
- Assess robustness of causal conclusions

## Files modified

- `index.md` — staggered exploration section, learning objectives, Cunningham citations
- `script.py` — added unit example prints, updated crosstab
- `notebook.ipynb` — inserted new code/markdown cells for unit examples, updated crosstab cell, learning objectives, Cunningham citations

## What did NOT change

- All figures (no re-rendering needed — changes are text/output only)
- The `describe()` block, pivot table, line plot, and all sections from Bacon decomposition onward
- Front matter, links, featured image
