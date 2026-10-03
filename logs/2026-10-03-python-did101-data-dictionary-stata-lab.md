# 2026-10-03 — python_did101: data dictionary, Stata port and in-post DiD lab

Second step of bringing `content/post/python_did101/` up to the `python_fwl` feature set (after the
cheat sheets, `2026-10-03-python-did101-cheatsheets.md`). Still to do in later rounds: podcast/video
embeds, AI slides PDF, AhaSlides, and adding the new files to the Quarto bundle (`tutorial.qmd`,
`notebook.ipynb` and `python_did101.zip` are unchanged this round, so their section numbers stop at
the pre-lab numbering).

## Data dictionary (`data/`)

Built with the `write-data-dictionary` skill's renderer (copied from `python_fwl`, the newest version,
which has the `github_branch` pin and half-up rounding) and a new `data_dictionary.yaml`: overview,
two-file panel note, KPIs, sources (Corral & Yang 2024, quarcs-lab data-open, the CSV copies),
construction formulas, caveats and citation. Outputs: labeled `tutoring_did.dta` /
`tutoring_didevent.dta` (release 118, value labels on `treated`, `post`, `txp`), `README.md`,
`stata_codebook.do` (runs cleanly in Stata 19), `python_did101_data.zip`, `index.html`.

- **Renderer fix (this post's copy only):** it read CSVs with pandas' default fast float parser, which
  is off by up to 1e-14 on 17-digit values, so the `.dta` was not byte-faithful to the CSV. Now
  `float_precision="round_trip"`; the `.dta` values equal the CSV values exactly. The skill template
  and other posts' copies still use the default parser.
- **Facts the page states that the post does not:** the event-study file's GPA reaches 107.68 (the
  post calls it a 0–100 score); the 2×2 file is a separate simulation, not two periods of the
  event-study file; `female_share` varies within schools; treated schools are ids 26–35.
- Button "Data dictionary" added; the two quarcs-lab "Dataset" buttons are kept.

## `analysis.do` (Stata port of `script.py`)

Mirrors `script.py` section by section (3 data, 4 naive, 5 design, 6 manual 2×2, 7 regressions,
8 four SEs, 9 tables, 10 coefficient comparison, 11 event study). A `post_is` helper asserts every
number the post prints at the post's precision (≈ 60 checks, including the 2×2 means, all regression
coefficients/SEs/CIs, R², RMSE, the within R² computed two-way as pyfixest defines it, the four SEs and
t-statistics, CRV3 by hand = 0.6373 next to Stata's `vce(jackknife)` 0.6101, and every event-study
estimate/SE/CI/p-value). Figures and the LaTeX table are written only with `global EXPORT 1`; that path
was run in a scratch copy and the eight figures were inspected. No batch log is shipped. Button
"Stata do-file" added.

## In-post interactive lab (`{{< did-lab >}}`, new §12)

New shortcode `layouts/shortcodes/did-lab.html` + `assets/js/did-lab.js` + `assets/css/did-lab.css`
(same three-file pattern as `fwl-lab` / `panel-lab`; assets emitted once per page, minified,
fingerprinted, SRI). Two tabs, both on the post's **real** data (gpa embedded at full precision):

- **2×2 lab:** sliders for the true effect, the common trend and a parallel-trends violation. The data
  are shifted exactly, so DiD = effect + violation and naive = effect + trend + violation; the
  clustered SE stays 0.585. Scatter of the 70 school-periods, group means, the counterfactual DiD
  assumes and the true counterfactual; a strip and readouts for truth / naive / DiD and both biases.
- **Event-study lab:** sliders for the effect at adoption, growth per period, anticipation at t = −1 and
  a pre-trend slope. The event study (7 dummies, TWFE, CRV1, t(34) intervals) and the pooled one-dummy
  TWFE are re-estimated in the browser; plot of coefficients with CIs, the true effect path and the
  pooled estimate; readouts for leads, lags, significant leads and the pooled bias.
- Defaults reproduce the post exactly (36.20 / 25.31 (SE 0.585); 0.34, −0.32, 0.59, 25.03, 24.71,
  24.77, 25.70; pooled 24.897, SE 0.282). A Node test checks the JS against pyfixest at the defaults
  and at a non-default scenario in each tab (coefficients, SEs, intervals) to 1e-6.
- Post: new `## 12. Try it yourself: an interactive DiD lab` with six guided experiments whose numbers
  come from the lab (e.g. a +0.2 pre-trend passes the pre-test with no significant lead but biases the
  pooled DiD by +0.70). Sections 12–15 renumbered to 13–16; the cross-reference "Section 13.2" became
  "Section 14.2". `CLAUDE.md` lists the new shortcode.

## Verification

Production `hugo --gc --minify`: the lab's fingerprinted JS/CSS load, all SVG hooks survive
minification, `analysis.do` and the data dictionary publish. Headless Chromium on the built site: lab
ready, default and slider values as computed, tab switching, 0 console/page errors, 0 MathJax errors,
light and dark themes, no lab overflow at 375 px (the event plot enlarges its text on phones). The
page's wider-than-viewport document at 375 px comes from existing tables/equations, as in
`python_fwl`. Data-dictionary page: no console errors. Learn-card lint passes.
