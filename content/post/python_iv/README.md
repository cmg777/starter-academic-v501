# Instrumental Variables in Development Economics — Python Companion

Replicating Acemoglu, Johnson & Robinson (2001), "The Colonial Origins of
Comparative Development," using settler mortality as an instrument for
modern institutions across a cross-section of ~64 ex-colonies — in
**Python**, with [`pyfixest`](https://pyfixest.org/) and
[`linearmodels`](https://bashtage.github.io/linearmodels/).

This is the sibling of [`content/post/stata_iv/`](../stata_iv/). Both
posts run on the same eight `.dta` files; both produce headline numbers
that match to three decimal places. Same inputs, same conclusions, two
languages.

**Audience:** graduate / advanced-undergrad students in development economics.
**Estimand:** under heterogeneous treatment effects, 2SLS identifies the
**LATE** (Imbens & Angrist 1994) for the subpopulation of countries whose
institutional quality would change in response to settler-mortality variation.
Under constant treatment effects, LATE = ATE.

## Headline replication results (vs Stata `ivreg2` reference)

| Quantity                                             | Python (this run) | Stata `ivreg2` | Match |
|------------------------------------------------------|-------------------|----------------|-------|
| OLS β on `avexpr`, base sample (Tab 2 Col 2)         | **0.522**         | 0.522          | ✓     |
| 2SLS β on `avexpr`, base sample (Tab 4 Col 1)        | **0.944**         | 0.944          | ✓     |
| 2SLS SE on `avexpr` (`linearmodels`)                 | **0.176**         | 0.176          | ✓     |
| First-stage robust F (KP-style, base sample)         | 16.85             | 16.32          | close |
| Wu-Hausman / DWH endogeneity p                       | < 0.001           | 0.003          | ✓     |
| Hansen J / Sargan p-values (Tab 8 Panel C)           | 0.18–0.79         | 0.21–0.80      | close |

The IV > OLS gap is the central AJR finding and reproduces cleanly across
both libraries. The first-stage F values differ by a few percent because
`pyfixest`/`linearmodels` and Stata's `ivreg2` apply slightly different
small-sample adjustments to the HC robust covariance.

## Library strategy: hybrid `pyfixest` + `linearmodels`

`pyfixest` is the primary engine. `linearmodels.iv.IV2SLS` supplies the
diagnostics that `pyfixest` does not natively report:

| Job                                            | Library                          |
|------------------------------------------------|----------------------------------|
| 2SLS β / SE / CI / p, OLS comparisons          | `pyfixest.feols`                 |
| First-stage regression (Figure 1)              | `pyfixest.feols`                 |
| Olea-Pflueger effective F                      | `pyfixest.feols(...).IV_Diag()`  |
| Kleibergen-Paap-style robust first-stage F     | `linearmodels.IV2SLS`            |
| Hansen J / Sargan overid (Tab 7 Col 7-9, Tab 8 Panel C) | `linearmodels.IV2SLS`    |
| Wu-Hausman endogeneity test                    | `linearmodels.IV2SLS`            |
| Multi-endogenous 2SLS (Tab 7 Cols 7-9)         | `linearmodels.IV2SLS`            |
| Coefplot (Figure 3)                            | `matplotlib` + manual extraction |

`pyfixest`'s [llms.txt](https://pyfixest.org/llms.txt) explicitly notes
that *"Multiple endogenous variables are not supported"*, which is the
hard constraint that forces the hybrid approach for AJR Table 7 Cols 7–9.

## Data loading

`analysis.py` loads each table's `.dta` from one of two sources, selected by
the `USE_GITHUB` flag at the top of the script:

- `USE_GITHUB = True` (default): pulls each file from
  `https://raw.githubusercontent.com/cmg777/starter-academic-v501/master/content/post/stata_iv/maketableN.dta`
  — runs anywhere with internet, no clone required.
- `USE_GITHUB = False`: loads from `../stata_iv/` (a relative path to the
  companion Stata post folder). Useful for offline iteration. The
  Stata post root has the eight `.dta` files committed.

There are **no `.dta` files at the python_iv root** — the Python post
borrows the Stata post's data, by design. Same data, two languages.

## Generated PNG figures

| File                              | Description |
|-----------------------------------|-------------|
| `python_iv_first_stage.png`       | Settler mortality (`logem4`) → expropriation risk (`avexpr`) scatter, base sample |
| `python_iv_reduced_form.png`      | Settler mortality → log GDP (`logpgp95`) scatter, base sample |
| `python_iv_ols_vs_iv.png`         | matplotlib coefplot of `avexpr` across six representative OLS / IV specifications |

## Generated CSV tables

| File                  | Source                                        |
|-----------------------|-----------------------------------------------|
| `tab1_summary.csv`    | Table 1 — summary statistics (base sample)    |
| `tab2_ols.csv`        | Table 2 — OLS regressions of log GDP per capita |
| `tab3a_inst.csv`      | Table 3 Panel A — DV = current institutions (`avexpr`) |
| `tab3b_inst.csv`      | Table 3 Panel B — DV = early institutions     |
| `tab4_iv_main.csv`    | Table 4 — main 2SLS + OLS pairs (with KP-F + DWH) |
| `tab5_iv_controls.csv`| Table 5 — IV with colonial / legal / religion controls |
| `tab6_iv_geo.csv`     | Table 6 — IV with geography and climate controls |
| `tab7_iv_health.csv`  | Table 7 — IV with health channels (Cols 7-9 with Hansen J via `linearmodels`) |
| `tab8_overid.csv`     | Table 8 — alternative instruments + Hansen J overidentification (Panel C) + `logem4` as control (Panel D) |

## How to run

Recommended: a fresh virtual environment. The post folder ships with
a pre-built `.venv` for local iteration; create your own with `uv` or
the standard `venv` module if needed.

```bash
cd content/post/python_iv/

# (one-time) create venv + install deps
uv venv --python 3.11 .venv
uv pip install --python .venv/bin/python --only-binary :all: pyfixest linearmodels pandas numpy matplotlib

# Run the analysis end-to-end
.venv/bin/python analysis.py 2>&1 | tee execution_log.txt
```

Run-time: ~45 seconds on Apple Silicon (~5–10 seconds longer than the
Stata sibling because eight `.dta` files round-trip over HTTPS at start).

The `--only-binary :all:` flag tells `uv` to prefer wheel installs and
skip building `llvmlite` / `numba` from source on x86_64 macOS, where
the latest source builds need a matching LLVM version. Apple Silicon
(arm64) typically resolves the same packages without the flag.

## Diagnostics layered onto AJR's Tables

- **Olea-Pflueger effective F** — printed for every 2SLS run via
  `pyfixest.feols(...).IV_Diag()` then `._eff_F` (HC-robust).
- **Kleibergen-Paap-style robust first-stage F** — printed via
  `linearmodels.IV2SLS(...).fit(cov_type="robust").first_stage.diagnostics`.
- **Stock-Yogo (2005) critical values** — echoed in code comments;
  10% maximal IV size threshold = 16.38 under iid.
- **Wu-Hausman endogeneity test** — `linearmodels.IV2SLS(...).fit().wu_hausman()`.
- **Sargan / Hansen J overidentification** — `linearmodels.IV2SLS(...).fit().sargan`.
- **LATE vs ATE callout** — comment block in §0 documents that 2SLS
  identifies a LATE under heterogeneous effects (Imbens-Angrist 1994).
- **Albouy (2012) critique** — `print` callout in §9 flags that ~36% of
  mortality observations are imputed/repeats, so Hansen J non-rejection
  across alternative instruments does not rule out shared imputation bias.

## Files in this folder

```
content/post/python_iv/
├── analysis.py             # Python script (this analysis)
├── execution_log.txt       # Captured stdout from running analysis.py
├── plan.md                 # Approved scope and design (mirrors stata_iv pattern)
├── README.md               # This file
├── python_iv_first_stage.png
├── python_iv_reduced_form.png
├── python_iv_ols_vs_iv.png
├── tab1_summary.csv … tab8_overid.csv     # 9 result tables
└── .venv/                  # local Python 3.11 venv (untracked)
```

The eight input `.dta` files are NOT mirrored here — they live at
`content/post/stata_iv/` (and on the site's GitHub raw URL). This
post deliberately reuses them.
