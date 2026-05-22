# Topic Detection

Phase 1 classifies the post into one of these topic families:

- `causal-inference`
- `ml`
- `spatial`
- `panel`
- `bayesian`
- `time-series`
- `mixed`

The classification drives the **default tab proposal** in Phase 2; the
user can override anything. Mis-classification is not fatal — it
biases the starting suggestion, no more.

---

## Inputs the heuristic uses

1. **Slug prefix** (most reliable signal):
   - `r_*`     → R post
   - `python_*` → Python post
   - `stata_*`  → Stata post
   - `gee_*`    → Google Earth Engine (spatial-leaning)
   - `rpy_*`    → bilingual (rare)

2. **Front-matter `tags:` and `categories:` arrays.** Cheap, structured,
   author-curated.

3. **Section-heading keywords** in `index.md`. Search `^#{1,3} ` lines
   case-insensitively for the trigger words below.

4. **First paragraph of the overview / §1.** The author's framing usually
   names the method in the first sentence.

---

## Trigger words → topic family

Use the highest-priority match (top of list wins ties):

| Family             | Trigger words (in tags, headings, or first paragraph)              |
|--------------------|-------------------------------------------------------------------|
| `bayesian`         | bayes, bma, posterior, prior, credible, mcmc, hierarchical bayes  |
| `spatial`          | moran, lisa, gwr, mgwr, spatial weight, w matrix, geographically  |
|                    | weighted, esda, viirs, dmsp, ntl, geo (with geographic context)   |
| `panel`            | panel, did, difference-in-differences, staggered, two-way fe,     |
|                    | within-state, fixed effect, synthetic control, event study,       |
|                    | parallel trends                                                   |
| `causal-inference` | causal, confounder, identification, propensity, instrumental,     |
|                    | iv, rdd, regression discontinuity, doubleml, dml, lasso, dowhy,   |
|                    | partial identification, omitted variable, irf                     |
| `ml`               | random forest, rf, xgboost, gradient boost, neural, k-nn, kmeans, |
|                    | clustering, pca, predict, cross-validation, train-test, k-fold,   |
|                    | feature importance                                                |
| `time-series`      | time series, var, vector autoregression, garch, arma, arima,      |
|                    | impulse response                                                  |

If multiple families match, pick by priority order: bayesian > spatial >
panel > causal-inference > ml > time-series > mixed.

---

## Compound posts

When two families both match strongly (e.g. a panel-data post that also
uses double LASSO), pick the **method** family, not the data-shape
family. So:

- `r_double_lasso` matches both `panel` (panel data, first differences,
  state clustering) and `causal-inference` (LASSO, identification).
  Pick `causal-inference` because the *method* is the lesson.
- `r_staggered_did` matches both `panel` (staggered DiD setup) and
  `causal-inference` (treatment effect identification). Pick `panel`
  because DiD is the method.

The rule of thumb: which tab archetype best teaches the post's main
methodological lesson? Pick the family whose default archetypes do
that.

---

## When in doubt: `mixed`

If no clear winner emerges, classify as `mixed` and use the default
tab proposal: Concept animation · DGP simulator · Forest plot. The
Phase 2 interview will surface enough information for the user to
swap.

---

## Worked examples

### `r_double_lasso`
- Slug: `r_` (R post)
- Tags: `["r", "causal", "machine learning", "lasso", "double-lasso",
  "econometrics", "panel data"]`
- Section headings include: "Double LASSO", "rigorous penalty",
  "state-clustered standard errors"
- First paragraph mentions: "abortion-crime", "causal effect",
  "high-dimensional"
- **Match.** `causal-inference` (priority winner over `panel` and
  `ml`).
- **Default tabs.** Concept animation · DGP simulator · Forest plot
  · Penalty slider (auto-added because `lasso` is in tags).

### `python_doubleml`
- Slug: `python_` (Python post)
- Tags: `["python", "causal", "machine learning", "doubleml"]`
- Section headings: "Double Machine Learning", "Cross-fitting",
  "Nuisance functions"
- **Match.** `causal-inference`.
- **Default tabs.** Concept animation · DGP simulator · Forest plot.

### `python_ml_random_forest`
- Tags: `["python", "machine learning", "random forest", "regression"]`
- Section headings: "Random Forest", "Feature importance"
- **Match.** `ml`.
- **Default tabs.** Concept animation · Penalty slider (k for
  k-NN or max_depth for trees) · Feature importance · Train/test
  split. Three of these are STUBS — Phase 2 must surface that.

### `python_esda`
- Slug: `python_`
- Tags: `["python", "spatial", "moran's i"]`
- Section headings: "Spatial autocorrelation", "Moran's I", "LISA"
- **Match.** `spatial`.
- **Default tabs.** Concept animation · Moran's I scatter + map ·
  Sensitivity heatmap. Two STUBS — Phase 2 must surface.

### `r_staggered_did`
- Slug: `r_`
- Tags: `["r", "causal", "did", "panel data"]`
- Section headings: "Staggered DiD", "Event study", "Parallel
  trends"
- **Match.** `panel`.
- **Default tabs.** Concept animation · DiD event-study (STUB) ·
  Forest plot.

### `r_convergence_clubs`
- Tags: `["r", "growth", "convergence"]`
- No `analysis.R` in folder; links to external Colab/Deepnote
- **Match.** No specific family; `mixed`. Pattern C (landing page).
- **Default tabs.** Concept animation · DGP simulator. Forest plot
  dropped because no real data.

---

## Implementation note

The heuristic is a chain of `if/else` checks ordered by priority. It is
intentionally conservative — false negatives (classifies as `mixed`
when a more specific family applies) are recoverable in Phase 2; false
positives can mislead the user into accepting an inappropriate default.
When unsure, prefer `mixed`.
