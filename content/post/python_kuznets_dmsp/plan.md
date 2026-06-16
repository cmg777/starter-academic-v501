# Approved scope — python_kuznets_dmsp

**Topic.** Comprehensive, beginner-friendly Python replication of Lessmann & Seidel
(2017), "Regional inequality, convergence, and its determinants — A view from outer
space," *European Economic Review* 92, 110–132.

**Analysis question.** Can we turn satellite nighttime lights into predicted regional
GDP, build inequality indices from those predictions, and show how regional inequality
moves with national development across countries?

**Main focus (vs the sibling `python_fe_kuznets`).** (1) predicting GDP from luminosity
+ controls, in detail (estimation AND the prediction step); (2) constructing the
population-weighted inequality indices from scratch, in detail, including the role of
population weights; (3) the cross-country dynamics of inequality (EDA). The Kuznets
curve / determinants / spatial robustness are kept tight and cross-linked to the sibling.

**Language / theme.** Python, light-theme figures, site palette.

**Scope = econometrics, no geospatial maps.** No geopandas. Covers Table 1 (lights→GDP),
Table 2 (five inequality indices), Table 3 (Kuznets cubic), Table 4 (determinants),
Table B.4 (Conley spatial-HAC), plus the Kuznets scatter (Fig 4) and the regional-vs-
personal scatter (Fig 5a). The 2 ICRG-blocked results (Table 4 col 4, Fig 5b) are out.

**Estimator stack.** Panel regressions in **PyFixest** (Tables 3, 4, B.4 point estimate,
Table 1 FE/OLS columns). Table 1's random-effects columns are reproduced with a small
`linearmodels.RandomEffects` sidebar (PyFixest is FE/OLS only) and shown side-by-side, so
the table both runs in PyFixest and matches the paper. Table B.4 spatial-HAC SEs use a
from-scratch great-circle Conley helper.

**Data.** Trimmed CSVs bundled in `data/` (~3.5 MB), loaded with a raw-GitHub-URL +
local-fallback loader. The 15 MB full-world prediction file is NOT bundled (only needed
for maps).

**Framing.** Descriptive + predictive; no causal estimand. The lights→GDP step is a
prediction/calibration model; the Kuznets regressions are descriptive associations with
country and period fixed effects.

**Deliverables.** `script.py`, `execution_log.txt`, 13 PNG figures, 11 CSV result files,
`README.md`, `plan.md`, then `results_report.md`, `index.md`, `notebook.ipynb`, an
interactive web app, a Quarto reveal.js deck, an infographic prompt, a hermetic Quarto
`.zip`, and ES/JA stub cards.
