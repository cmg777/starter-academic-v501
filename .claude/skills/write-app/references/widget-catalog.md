# Widget Catalog

The `write-app` skill draws from a fixed library of 10 archetypes. Each
archetype is a self-contained "tab" the user can pick during the Phase 2
interview.

Four archetypes are **ready**: validated against `r_double_lasso`, JS
fragments fully implemented and tested under Node's `vm` runner. Six are
**stub**: documented here so the skill can describe them in the
interview, but their JS fragments are placeholders. A stub widget
renders a card that explains what it would do and links back to this
catalog — it does not break the app.

Stub widgets are honest about their status. The Phase 2 interview must
make the trade-off visible before the user commits.

---

## Status legend

- **READY** — fragment in `templates/widgets/` is functional. Used in
  the `r_double_lasso` reference deliverable.
- **STUB** — fragment is a placeholder. Catalog entry below describes
  the *intended* contract; promoting to READY is a follow-up task.

---

## 1. Concept animation — READY

**Definition.** A small looping SVG (~10–20 s loop) that visualises the
post's core intuition with no user input. Default first tab on every
app.

**When to use.** Always. Every app's Tab 1 is a concept animation; the
remaining 2–3 tabs are interactive.

**Data contract.** None — the animation is mathematically generated.

**JS contract.**

- Exports `CHARTS.l1_vs_l2_animation(container)` (and variants by
  topic family — `dampened_oscillation`, `mean_reversion`,
  `parallel_trends`).
- `requestAnimationFrame` loop that updates one or two marker points
  on a static curve.
- No sliders, no event handlers.

**Pedagogy notes.**

- The animation is the "Why am I here?" moment. It should make the
  post's central trade-off visible in 5 seconds.
- Pair with one paragraph of lede text above and a 2-line caption
  below.

**Reference.** `templates/widgets/concept-animation.js`. The L1-vs-L2
variant is the validated default; topic-family variants are stubbed
within the same file as named exports.

---

## 2. Penalty / hyperparameter slider — READY

**Definition.** A single slider that controls the shrinkage knob (λ for
LASSO/ridge, `max_depth` for trees, `k` for k-NN). The chart updates
live to show how coefficients / predictions move.

**When to use.** Posts that prominently feature regularisation, model
complexity, or shrinkage. Topic families: `ml`, `causal-inference` (if
LASSO is involved).

**Data contract.** Simulated DGP. Uses `DGP.simulate_lasso({n, p,
signal, seed})` to generate `y = X·θ + ε` and then runs
`LASSO.lasso_path(X, y, n, p)` for a path of λ values. No external CSV
needed.

**JS contract.**

- Sliders: `n` (50–500), `p` (5–100), `signal` (0.1–1.5), `λ-index`
  (0–79 across the path).
- Chart: `CHARTS.coefficient_path(container)` with `update(path,
  currentLambda)`. Treatment column is highlighted; selected
  coefficients teal, zeroed coefficients faint grey.
- Stats card showing `|I|`, `α̂_LASSO`, `α̂_postOLS`, `true α`.

**Pedagogy notes.**

- "What to look for" list emphasises sparsity-vs-λ, the post-OLS
  bias-removal step, and the treatment-stays-in column.
- Cap `n ≤ 500` and `p ≤ 100` to keep one slider tick under ~300 ms.

**Reference.** `templates/widgets/penalty-slider.js`.

---

## 3. Estimator-comparison forest plot — READY

**Definition.** Horizontal CI bars across multiple methods on the same
outcome, faceted by outcome. Hover gives SE / CI / n_selected. This is
the headline figure of `r_double_lasso` Tab 4.

**When to use.** Posts that report 3+ methods estimating the same
quantity (causal inference with method-comparison tables, robustness
checks, sensitivity analyses).

**Data contract.** Pattern-A only. Expects `data/results.json` with the
schema:

```json
{
  "estimates": [
    {"method": "...", "outcome": "...", "estimate": -0.0964,
     "se": 0.0514, "ci_lo": -0.197, "ci_hi": 0.005, "n_selected": 8},
    ...
  ],
  "selection": [
    {"outcome": "...", "method": "...", "n_Iy": 0, "n_Id": 8,
     "n_intersection": 0, "n_union": 8},
    ...
  ]
}
```

If `ci_lo`/`ci_hi` are missing, compute as `estimate ± 1.96 * se`.

**JS contract.**

- Toggles: outcome checkboxes (multiSelect), method checkboxes
  (multiSelect).
- Chart: `CHARTS.forest_plot(container)` with `update(data,
  activeMethods, activeOutcomes)`.
- Companion chart: `CHARTS.selection_bars(container)` showing
  per-method `n_union` against the 284-control baseline.

**Pedagogy notes.**

- A "Why does method X explode?" collapsible card per outcome with an
  inline math note about `(X'X)⁻¹` (or the analogous failure mode).
- The Pattern-B/C fallback: if the user picks this widget but no
  results CSV exists, the interview must escalate — propose either
  simulating the comparison via the DGP archetype, or skipping this
  widget.

**Reference.** `templates/widgets/forest-plot.js`.

---

## 4. DGP simulator with ground truth — READY

**Definition.** Slider-controlled simulated data with a known true
parameter. The app shows estimators converging (or not) to the truth as
parameters change. Best vehicle for teaching bias, variance,
consistency, and the prediction-vs-causal-inference distinction.

**When to use.** Any post that teaches a method's correctness
properties (LASSO bias, DiD parallel trends, IV exclusion restriction).
The `r_double_lasso` Tab 3 (Penalty Showdown) is this archetype's
canonical instance.

**Data contract.** Simulated via `DGP.simulate_dl({n, p, signal,
asymmetry, seed})`. No external data needed.

**JS contract.**

- Sliders: `n`, `p`, `signal`, `asymmetry` (or topic-specific
  analogues: pre/post window for DiD, leverage for IV, etc.).
- Two side-by-side method cards (e.g. Rigorous vs CV; OLS vs IV;
  static vs dynamic DiD) each showing `α̂`, SE, selection counts.
- `CHARTS.alpha_compare(container)` horizontal bar chart with a
  vertical line at the known true α.
- Optional "Run 100 simulations" button that draws histograms
  (`CHARTS.alpha_histograms`) showing the bias-variance picture
  across draws.

**Pedagogy notes.**

- Lead with one sentence naming the trade-off. End with one sentence
  naming the takeaway.
- The 100-sim button is the most pedagogically valuable component —
  it converts a single noisy estimate into a sampling distribution
  the student can see.

**Reference.** `templates/widgets/dgp-simulator.js`.

---

## 5. DiD event-study explorer — STUB

**Definition.** Pre/post treatment lag axis with event-study
coefficients ± CIs, a vertical reference line at t = 0, and treated-vs-
control trajectory panels above.

**When to use.** Posts on difference-in-differences, staggered DiD,
synthetic control. Topic families: `panel`, `causal-inference` with DiD
tags.

**Data contract (intended).** Pattern A. Requires
`data/results.json` with:

```json
{
  "event_study": [
    {"lag": -5, "estimate": 0.01, "se": 0.04, "ci_lo": -0.07, "ci_hi": 0.09},
    ...
  ],
  "trajectories": {
    "treated": [{"year": 1995, "value": ...}, ...],
    "control": [{"year": 1995, "value": ...}, ...]
  }
}
```

**JS contract (intended).**

- Slider: pre/post window length (e.g. ±3 to ±10).
- Toggle: show/hide control trajectory.
- Two charts: trajectory panel (top), event-study panel (bottom).

**Pedagogy notes (intended).**

- Foreground the parallel-trends visual test — let the student
  *see* the pre-trend coefficients fluctuate around zero.

**Status.** STUB. Fragment renders an explanatory card describing the
intended widget. Implement when the next DiD post needs an app.

---

## 6. Feature importance / partial dependence — STUB

**Definition.** Bar chart of feature importance with a slider over a
focal feature; second panel shows the partial-dependence curve.

**When to use.** Tree-based ML (random forest, gradient boosting,
XGBoost). Topic family: `ml`.

**Data contract (intended).** Pattern A. `data/results.json` with:

```json
{
  "feature_importance": [{"name": "...", "value": 0.18}, ...],
  "pdp": {
    "feature_name": "education_years",
    "x": [...], "y": [...]
  }
}
```

**JS contract (intended).** Bar chart + line chart + dropdown to swap
the PDP feature.

**Status.** STUB. Card placeholder.

---

## 7. Spatial / Moran's I scatter + map — STUB

**Definition.** A small interactive map (D3 + GeoJSON) plus a Moran's I
scatterplot (z_i vs Wz_i). Click a region on the map to highlight it
on the scatter, or vice versa.

**When to use.** ESDA, GWR, MGWR, spatial panel posts. Topic family:
`spatial`.

**Data contract (intended).** Pattern A. `data/results.json` with
GeoJSON inline (or a separate `data/regions.geojson`) plus per-region
values and the row-standardised spatial weight matrix W (as a sparse
adjacency list).

**JS contract (intended).** D3 projection + topojson rendering;
scatterplot uses `d3.geoCentroid`-style linking.

**Status.** STUB. Card placeholder.

---

## 8. Train/test split + cross-validation — STUB

**Definition.** Slider for split fraction; visualiser of fold
assignment; per-fold MSE bars; held-out vs in-sample loss.

**When to use.** Any predictive-modelling post. Topic family: `ml`.

**Data contract (intended).** Simulated via the existing DGP module;
no external data needed (but can use Pattern A if present).

**JS contract (intended).** Slider (split fraction), button (re-fold),
two charts (fold matrix, MSE bars).

**Status.** STUB.

---

## 9. Sensitivity / robustness heatmap — STUB

**Definition.** 2D parameter grid (e.g. bandwidth × polynomial order)
coloured by point estimate. Hover for cell value; click to "freeze"
the parameter pair and see the corresponding regression details below.

**When to use.** RDD, kernel methods, anything with two
researcher-degrees-of-freedom knobs. Topic family: `causal-inference`
with `rd` or `kernel` tags.

**Data contract (intended).** Pattern A. `data/results.json` with a
3-column tidy grid: `{x_param, y_param, estimate}`.

**JS contract (intended).** D3 heatmap with diverging color scale
centred at 0.

**Status.** STUB.

---

## 10. Bayesian posterior explorer — STUB

**Definition.** Two sliders for prior hyperparameters; live update of
the posterior density (kernel density or analytical form). Highlights
credible interval; optional "data evidence" overlay.

**When to use.** BMA, Bayesian spatial, hierarchical Bayes posts.
Topic family: `bayesian`.

**Data contract (intended).** Posterior draws as `data/posterior.json`
(array of numbers), or analytical-conjugate form computed in JS.

**JS contract (intended).** Two sliders, one chart, one toggle.

**Status.** STUB.

---

## Default topic → archetype map

Used by Phase 1 to propose the initial tab list. The user can override
in Phase 2.

| Topic family      | Default tabs (in order)                                              |
|-------------------|----------------------------------------------------------------------|
| causal-inference  | Concept animation · DGP simulator · Forest plot · (Penalty slider if LASSO) |
| ml                | Concept animation · Penalty slider · Feature importance · Train/test split |
| spatial           | Concept animation · Moran's I scatter + map · Sensitivity heatmap    |
| panel             | Concept animation · DiD event-study · Forest plot                    |
| bayesian          | Concept animation · Bayesian posterior · DGP simulator               |
| time-series       | Concept animation · DGP simulator · Sensitivity heatmap              |
| mixed / unknown   | Concept animation · DGP simulator · Forest plot                      |

When a default tab is a STUB widget, the Phase-2 question for "Tab
structure" must mark it `(stub)` and ask the user whether to keep,
swap with a READY widget, or skip.
