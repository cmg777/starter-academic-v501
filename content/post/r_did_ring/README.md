# r_did_ring — Artifact Inventory

**Tutorial:** *An Intuitive Introduction to Difference-in-Differences with
Geocoded Microdata (the "ring" approach)*

Inspired by, and explicitly following the methodology of, Butts, Kyle (2023).
"JUE Insight: Difference-in-Differences with Geocoded Microdata." *Journal of
Urban Economics* 133, 103493. The Linden & Rockoff (2008) data and the
parametric / nonparametric ring estimators in `analysis.R` are taken from
Butts's replication archive in `references/`.

## Pipeline progress

- [x] Script (`/project:write-script`) — produced `analysis.R`, 10 PNGs, 11
  CSVs, and a clean `execution_log.txt`.
- [x] Script review (`/project:review-script`) — verdict **ACCEPT**; both
  MEDIUM issues resolved. See `script-review.md` (0 HIGH, 0 MEDIUM, 6 LOW
  outstanding). New nonparametric headline: −12.4 % inside 0.1 mi
  (sample-weighted, up from the pre-fix bin-average of −11.4 %).
- [x] Results report (`/project:write-results-report`) — see
  `results_report.md` (332 lines, 7 sections, 9 key findings, full figure
  inventory + reproduction audit against Butts 2023).
- [x] Results report review (`/project:review-results-report`) — verdict
  **ACCEPT** against the new write-results-report v2 gates; all 3 LOW
  issues resolved post-review. 8/8 numbers spot-checked, 0 HIGH, 0 MEDIUM,
  0 LOW outstanding. Dimension-7 sub-bullet 5: PARTIAL → PASS after fixes.
  See `results_report_review.md`.
- [x] Blog post (`/project:write-post`) — see `index.md` (Mode A;
  consumes the script + results report, embeds all 10 PNGs, with
  Key Concepts toggle-cards, Mermaid methodology diagram, and 2–3
  short verbatim quotes from Butts 2023's `Rings.tex`).
- [x] Blog post review (`/project:review-post`) — verdict **ACCEPT**;
  2 MED + 5 LOW resolved post-review (cluster-robust SE defined,
  references reordered to first-mention order, helpers note added,
  long sentence split, terminology canonicalized, bandwidth
  pseudocode annotated, 10 italic figure captions added).
- [x] Infographic (`/project:write-infographic`) — see
  `infographic_instructions.md` (~3,559 tokens, four sections,
  layered mode, 6 ON-IMAGE messages). Story Spine + 6 story beats
  + 3 BIG numbers (−5.78 %, 52 %, −20.6 %); Panel 4 uses a
  balance-scale Comparison metaphor.
- [x] Infographic review (`/project:review-infographic`) — verdict
  **ACCEPT**; 2 LOW resolved post-review (P3→P4 transition
  differentiated; simulated-DGP τ(d) added to background formulas).
  28/28 numbers spot-checked. Coverage: **FULL** after fixes.
- [x] Quarto notebook (`/project:write-quarto-notebook`) — see
  `tutorial.qmd` (907 lines, 22 executable chunks, `darkly` theme).
  Renders cleanly on first attempt; all 13 R packages pinned to
  exact versions probed at write-time for bit-reproducibility. A
  "Quarto (.qmd)" entry is now in `index.md`'s `links:` block,
  between the R script and the MD version.

## Figures

| File | Description |
|------|-------------|
| `r_did_ring_01_ring_geometry.png` | Toy spatial picture: treatment point, inner / outer rings, 2,000 random units. |
| `r_did_ring_02_dgp_curve.png` | The simulated true treatment-effect curve we will try to recover. |
| `r_did_ring_03_parametric_estimate.png` | Parametric ring DiD applied to the simulated DGP with the correct ring choice. |
| `r_did_ring_04_ringchoice_problem.png` | Three ring choices on the same DGP — the headline number wobbles. |
| `r_did_ring_05_nonparametric_sim.png` | Nonparametric ring DiD recovers the whole TE curve from the simulated DGP. |
| `r_did_ring_06_lr_gradient.png` | Linden-Rockoff raw price gradient, pre vs. post arrival (local-polynomial smoother). |
| `r_did_ring_07_lr_bandwidth.png` | Same data, three smoothing bandwidths — bandwidth fragility. |
| `r_did_ring_08_lr_parametric.png` | Parametric ring DiD on Linden-Rockoff at the default ring boundary. |
| `r_did_ring_09_lr_ringchoice.png` | Linden-Rockoff parametric estimator under three ring choices. |
| `r_did_ring_10_lr_nonparametric.png` | Nonparametric ring DiD on Linden-Rockoff: the estimated TE curve. |

## CSV tables

| File | Description |
|------|-------------|
| `summary.csv` | Headline summary across estimators (parametric default, ring-choice sensitivity, nonparametric average inside 0.1 mi). |
| `table_2x2_recap.csv` | 2x2 DiD recap on simulated data (first-differences vs. two-way FE). |
| `table_parametric_sim.csv` | Step function from the parametric ring estimator on the simulated DGP. |
| `table_ringchoice_sim.csv` | Ring-choice sensitivity on the simulated DGP (3 choices). |
| `table_nonparametric_sim.csv` | Step function from the nonparametric ring estimator on the simulated DGP. |
| `table_lr_cells.csv` | Cell counts for the Linden-Rockoff sample (ring × pre/post). |
| `table_lr_parametric.csv` | Linden-Rockoff parametric ring DiD coefficient at the default rings. |
| `table_lr_ringchoice.csv` | Linden-Rockoff parametric ring DiD at three different inner-ring cutoffs. |
| `table_lr_nonparametric.csv` | Linden-Rockoff nonparametric ring DiD step function. |

## Datasets

| File | Rows | Cols | Description |
|------|-----:|-----:|-------------|
| `linden_rockoff.dta` | 170,239 | 51 | Original Stata file from Butts's replication archive; loaded by the script via GitHub raw URL with local-file fallback. |
| `raw_data.csv` | 170,517 | 51 | CSV export of the full Linden-Rockoff data. |
| `data_prepared.csv` | 9,094 | 56 | Analysis sample: `offender == 1`, distance rescaled to miles, derived columns added. |

## R packages

Loaded via `pacman::p_load()` (auto-installs missing packages from CRAN):

`tidyverse`, `fixest`, `haven`, `data.table`, `binsreg`, `KernSmooth`,
`lpridge`, `ggplot2`, `patchwork`, `sf`, `glue`, `scales`, `broom`.

No GitHub-only packages — `kfbmisc` from the original archive is replaced by
the site's `theme_dark_dampoostle()`.

## Review artifacts

| File | Description |
|------|-------------|
| `script-review.md` | Eight-dimension quality review of `analysis.R` (verdict: ACCEPT). |
| `results_report.md` | Structured interpretation report bridging script output to the blog post (~332 lines, 10 figures embedded, 9 key findings, Butts 2023 reproduction audit). |
| `results_report_review.md` | Seven-dimension quality review of `results_report.md` against the new write-results-report v2 gates (verdict: ACCEPT; 0 HIGH, 0 MEDIUM, 3 LOW). |
| `index.md` | Notebook-style blog post (~6,500 tokens; 16 sections; 10 figures embedded; 3 display equations; Key Concepts toggle-cards; Mermaid methodology diagram; Exercises section). Target audience: advanced undergrad / early grad econ. Light citations + 3 verbatim quotes from Butts 2023's `Rings.tex`. |
| `infographic_instructions.md` | Storyboard-first chalkboard infographic prompt (~3,559 tokens; layered mode; six-panel narrative arc; Story Spine + 3 BIG numbers + Panel 4 balance-scale Comparison; reviewed verdict: ACCEPT; coverage: FULL after post-review fixes). |
| `tutorial.qmd` | Self-contained Quarto notebook (907 lines, 22 executable chunks, `darkly` theme). Renders cleanly with all 13 R packages pinned to exact versions via `pak::pkg_install("pkg@version")` for bit-reproducibility. Open in Positron / RStudio and hit *Render*. |

## How to reproduce

```bash
cd content/post/r_did_ring/
Rscript analysis.R 2>&1 | tee execution_log.txt
```

The script tries to read the data from
`https://raw.githubusercontent.com/cmg777/starter-academic-v501/master/content/post/r_did_ring/linden_rockoff.dta`
first; if the URL returns 404 (e.g., before the file is pushed to GitHub) it
falls back to the local copy `linden_rockoff.dta` in this folder.

## References

- Butts, Kyle (2023). "JUE Insight: Difference-in-Differences with Geocoded
  Microdata." *Journal of Urban Economics* 133, 103493.
- Linden, Leigh and Jonah E. Rockoff (2008). "Estimates of the Impact of
  Crime Risk on Property Values from Megan's Laws." *American Economic
  Review* 98(3): 1103–1127.
- Cattaneo, Crump, Farrell, and Feng (2024). "On Binscatter." *American
  Economic Review* 114(5): 1488–1514. (Foundation of `binsreg`.)
