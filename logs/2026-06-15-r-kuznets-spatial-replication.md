# 2026-06-15 — R replication of Lessmann (2013), spatial Kuznets curve

**Status: complete and verified — ready to deploy.** Hugo 0.111.3 builds clean; 19 figures
load (0 broken); 68 MathJax containers render (0 raw `$$` leaks); `tutorial.qmd` and the
reveal.js deck render via Quarto; the web app renders headless; `scripts/i18n-parity.sh`
reports 0 gaps. Reference inputs (the copyrighted Lessmann source, the internal discriminant
note) are kept local and gitignored, not committed to the public repo.

New tutorial post at `content/post/r_kuznets/`: a beginner-friendly, comprehensive R
replication of Lessmann (2013), "Spatial inequality and development — Is there an
inverted-U relationship?" (*J. Public Economics* 106). Built with the full data-science
pipeline on a **synthetic** dataset (no real data — calibrated to reproduce the paper).

## What was built
- `analysis.R` — simulates regional GDP for 56 countries (1980–2009), **computes** the
  population-weighted coefficient of variation (WCV) from the regions, and runs the full
  battery: cross-section OLS (Table 2, HC1 SE), two-way fixed effects via **`fixest`**
  (Table 3), turning points, **Robinson (1988)** semiparametric (`np`, Table 4/Fig 4),
  **Baltagi–Li (2002)** B-spline FE (Table 5/Fig 5), sectoral channel (Table 6), Fig 3,
  robustness (exclude poorest/capitals, CV/Gini, log-vs-level Fig 7), summary stats (A.3).
  Produces 13 figures + 4 `gt` regression-table images + 11 CSVs.
- `results_report.md` — ≥8 findings, reproduction audit vs the paper.
- `index.md` — notebook post (Abstract, Mermaid pipeline, 8 concept cards, sandwich
  pattern, 16 sections), AI-podcast player (catbox m4a).
- `tutorial.qmd` + `r_kuznets.zip` (Quarto bundle); `build_bundle.sh`.
- `slides/` — branded reveal.js deck (18 slides); `slides.pdf` (user's deck).
- `web_app/` — 4-tab D3 lab (idea morph, WCV builder, curve explorer, OLS-vs-FE forest).
- `infographic_instructions.md`; ES/JA stub cards.

## DGP design (the load-bearing idea)
The within-country inverted-U lives in the time-varying regional dispersion; the
between-country cubic N-shape lives in a time-invariant country term **absorbed by country
fixed effects**. Hence the panel shows a clean inverted-U (cubic n.s.) while the
cross-section shows the N-shape with a negative bivariate slope — exactly the paper's
contrast. Frozen at `set.seed(123)`; calibration scoreboard is printed at the end of
`execution_log.txt`. Calibration matches the paper on signs, significance, magnitude, and
turning points (~\$2,100 / ~\$31,000).

## Addendum (later same day) — turning points + discriminant analysis
Based on the user's note `turning_points_and_discriminant_analysis.pdf` (Mendez 2026), §7 was
rewritten into **"Turning points and the discriminant test"**: compute turning points, then the
discriminant **D = β₂² − 3β₁β₃** (D>0 two turning points / =0 inflection / <0 monotonic), plus the
"are the turning points inside the observed income range?" check. Lesson (framed for OLS/FE with a
short BMA aside): *all three cubic terms being significant does not prove the curve bends*. Applied
to this project's cross-section cubic (D=+0.0055, both turning points in range → genuine N-shape)
and panel cubic (D>0 but a turning point at ~\$0.0003, far out of range, and the term is
insignificant), plus three synthetic cases (5a genuine / 5b monotonic-trap D<0 / 5c out-of-range).
Propagated full-pipeline: `analysis.R` (discriminant block + `r_kuznets_14_discriminant_regimes.png`
+ `results_discriminant.csv`), `index.md` (§7 rewrite, concept card #9, Mermaid node, exercise 4,
references), `results_report.md`, `tutorial.qmd`, slides (2 new slides), and the web-app Curve
Explorer (live D + regime + in-range readout, shaded observed-income band). The source note is kept
out of the published site as `.turning_points_and_discriminant_analysis.pdf` (Hugo-ignored dotfile).

## Notes
- The copyrighted source-paper markdown was preserved as a Hugo-ignored dotfile
  (`.source-paper-lessmann-2013.md`) so it is **not** published on the live site.
- Verified: Hugo 0.111.3 builds clean, 17 figures load, 31 MathJax containers render
  (0 raw `$$` leaks), slides + web app render headless, `scripts/i18n-parity.sh` reports
  0 gaps.
