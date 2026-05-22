# Data Handling

The app is static — every interaction must run in the browser without a
backend. That constraints how the skill binds the post's data to the
app.

Three patterns cover all 81 posts in `content/post/`. Phase 1 detects
the pattern; Phase 2 confirms; Phase 3 bakes the data into
`web_app/data/results.json`.

---

## Pattern A — precomputed results CSV(s) present

**Signal.** One or more `*.csv` files alongside `index.md` in the post
folder, with filenames suggesting tabulated estimates:

- `results_table*.csv` (the strong signal — used by `r_double_lasso`)
- `*_diagnostic.csv`
- `*_estimates.csv`, `*_coefs.csv`, `*_results.csv`
- `regression_results.csv`, `ml_*_results.csv`

**What the skill does.**

1. Read the first ~5 KB of each candidate CSV to learn the schema.
2. List the candidates in Phase 2 Round 3 with their column names and
   row count so the user can pick.
3. Parse the chosen CSV(s) in Phase 3 into `web_app/data/results.json`
   using the schema documented in
   [`templates/data/results.json.tmpl`](templates/data/results.json.tmpl).
4. If `ci_lo` / `ci_hi` columns are missing but `se` and `estimate` are
   present, compute as `estimate ± 1.96 * se`.
5. Round numeric values to **4 decimal places** for display
   compactness.

**Example.** `r_double_lasso` ships `results_table2.csv` (15 rows ×
7 columns) and `selection_diagnostic.csv` (6 rows × 6 columns); both
get baked into `data/results.json` matching the post's Figure 1.

---

## Pattern B — raw `data/` folder only

**Signal.** A `content/post/<slug>/data/` subfolder exists with one or
more CSVs, but no precomputed result tables at the post root.

**What the skill does.**

1. List the raw CSVs in the Phase 1 report so the user knows what's
   present.
2. **Do not** try to fit models in JS from the raw data — it's too
   slow for live interaction with realistic sample sizes.
3. In Phase 2 Round 3, ask the user to choose:
   - Fall back to a simulated DGP (skip the forest-plot tab), or
   - Cancel and run `/project:write-results-report <slug>` first to
     generate a results CSV, then re-invoke `write-app`.
4. If the user picks the simulator fallback, write
   `data/results.json = {"estimates": [], "selection": []}` (empty
   stub). The chosen tabs must all run on the simulated DGP.

**Example.** `python_doubleml` has a script + data folder but no
results table. The natural choice is the simulator fallback (the post
is about DML mechanics, not specific numbers).

---

## Pattern C — landing page

**Signal.**

- No `analysis.R`, `script.py`, or `analysis.do` in the post folder.
- No `data/` subfolder.
- `index.md`'s `links:` array contains external URLs (Google Colab,
  RStudio Cloud, Deepnote, Streamlit, etc.) pointing at the actual
  computational notebook.

**What the skill does.**

1. Read the external URLs from `links:` to glean topic context.
2. In Phase 2 Round 3, propose a simulated DGP that mimics the post's
   topic family (consult the catalog for topic-appropriate DGP
   variants).
3. Forest plot tab is automatically dropped.
4. `data/results.json` is the empty stub.

**Example.** `r_convergence_clubs` links to Colab and Deepnote
notebooks; the app would ship a convergence-themed DGP simulator
showing how the OLS estimate of `β` in `Δlog y = α + β log y_0 + ε`
moves as the simulated cross-section changes.

---

## Schema for `data/results.json` (Pattern A)

The canonical shape used by the forest-plot and selection-bar widgets:

```json
{
  "estimates": [
    {
      "method":     "First diff" | "OLS (full)" | "PSL" | "DL (rigorous)" | "DL (CV)" | "<custom>",
      "outcome":    "<outcome label>",
      "estimate":   -0.1521,
      "se":         0.0337,
      "ci_lo":      -0.2181,
      "ci_hi":      -0.0861,
      "n_selected": 8       // optional; null if not applicable
    }
  ],
  "selection": [
    {
      "outcome":         "<outcome label>",
      "method":          "<method label>",
      "n_Iy":            0,
      "n_Id":            8,
      "n_intersection":  0,
      "n_union":         8
    }
  ]
}
```

Widgets that read this JSON tolerate extra keys; they only read what
they need. Missing the `selection` array does not break the forest
plot tab — only the selection-bar tab.

---

## CSV → JSON parsing tips

- Use `node -e "..."` or a tiny Python one-liner to convert. Do not
  add a build step.
- Preserve method names verbatim — the chart's color map keys on them.
- Sort the JSON `estimates` array by `[outcome, method]` for stable
  ordering across runs.
- If the CSV uses scientific notation (`1.23e-04`), parse as float and
  re-render in fixed-point form for the user-facing display.

---

## Anti-patterns

- **Do not fetch live data from external URLs at app load.** The app
  must work offline; users on flaky networks (in classrooms, on
  trains) should not see a blank tab. Bake everything into the
  bundle.
- **Do not embed raw individual-observation data in `results.json`.**
  Apps are for *estimates*, not raw microdata. If a widget needs
  microdata (rare; only the train/test-split STUB), use the DGP
  simulator instead.
- **Do not refit models in JS on the raw data folder.** Even
  20-variable OLS on n=500 in JS is slow enough that the user
  notices. The acceptable JS workload is small simulated problems
  (`n ≤ 500`, `p ≤ 100`).
- **Do not split `results.json` into multiple files.** One file keeps
  the bundle simple and matches the validated `r_double_lasso`
  pattern. If results genuinely don't fit a single JSON, the chart
  selection is wrong — reconsider in Phase 2.
