# Instrumental Variables in Development Economics

Replicating Acemoglu, Johnson & Robinson (2001), "The Colonial Origins of
Comparative Development," using settler mortality as an instrument for
modern institutions across a cross-section of ~64 ex-colonies.

**Audience:** graduate / advanced-undergrad students in development economics.
**Estimand:** under heterogeneous treatment effects, 2SLS identifies the
**LATE** (Imbens & Angrist 1994) for the subpopulation of countries whose
institutional quality would change in response to settler-mortality variation.
Under constant treatment effects, LATE = ATE.

## Pipeline progress

- [x] **Script** (`analysis.do`, `analysis.log`)
- [x] **Script review** (`script-review.md` — verdict: ACCEPT, 1 MEDIUM, 5 LOW)
- [x] **Results report** (`results_report.md` — 7 key findings, 8 interpretations, 3 figures inventoried)
- [x] **Results report review** (`results_report_review.md` — verdict ACCEPT after 4 MED + 3 LOW fixes)
- [x] **Blog post** (`index.md` — 658 lines, 7 toggle-card concepts, 1 Mermaid DAG, 3 figures, 2 display equations, full replication narrative)
- [x] **Infographic instructions** (`infographic_instructions.md` — 6-beat chalkboard storyboard for Gemini; 3 BIG numbers: 0.52, 0.94, +81%)

## Headline replication results

| Quantity | This run | AJR (2001) reported | Match |
|----------|----------|--------------------|-------|
| OLS β on `avexpr`, base sample (Tab 2 Col 2) | 0.522 | 0.52 | ✓ |
| 2SLS β on `avexpr`, base sample (Tab 4 Col 1) | 0.944 | 0.94 | ✓ |
| First-stage Kleibergen-Paap F (Tab 4 Col 1) | 16.32 | F ≈ 22 (Cragg-Donald) | close |
| Hansen J p-values (Tab 8 Panel C) | 0.21–0.80 | non-rejection | ✓ |

The IV > OLS gap is the central AJR finding and is consistent with measurement
error in the institutions index dominating other sources of bias.

## Generated PNG figures

| File | Description |
|------|-------------|
| `stata_iv_first_stage.png` | Settler mortality (`logem4`) → expropriation risk (`avexpr`) scatter, base sample |
| `stata_iv_reduced_form.png` | Settler mortality → log GDP (`logpgp95`) scatter, base sample |
| `stata_iv_ols_vs_iv.png` | `coefplot` of `avexpr` coefficient across six representative OLS / IV specifications |

## Generated CSV tables

| File | Source |
|------|--------|
| `tab1_summary.csv` | Table 1 — summary statistics (base sample) |
| `tab2_ols.csv` | Table 2 — OLS regressions of log GDP per capita |
| `tab3a_inst.csv` | Table 3 Panel A — DV = current institutions (`avexpr`) |
| `tab3b_inst.csv` | Table 3 Panel B — DV = early institutions (`cons00a`/`democ00a`/`euro1900`) |
| `tab4_iv_main.csv` | Table 4 — main 2SLS + OLS pairs (9 IV cols + 9 OLS cols) |
| `tab5_iv_controls.csv` | Table 5 — IV with colonial / legal / religion controls |
| `tab6_iv_geo.csv` | Table 6 — IV with geography and climate controls |
| `tab7_iv_health.csv` | Table 7 — IV with health channels (Cols 7-9 overidentified) |
| `tab8_overid.csv` | Table 8 — alternative instruments + Hansen J overidentification + `logem4` as control |

## Generated dataset CSVs

Plain-text dumps of every input dataset for downstream skills and reproducibility:

| File | Rows × cols | Source |
|------|-------------|--------|
| `data_maketable1.csv` | ~163 × ~20 | maketable1.dta — summary stats source |
| `data_maketable2.csv` | ~111 × ~13 | maketable2.dta — OLS source |
| `data_maketable3.csv` | ~64 × ~10 | maketable3.dta — institutional determinants |
| `data_maketable4.csv` | ~64 × ~12 | maketable4.dta — main IV result |
| `data_maketable5.csv` | ~64 × ~13 | maketable5.dta — colonial / legal / religion |
| `data_maketable6.csv` | ~64 × ~25 | maketable6.dta — geography / climate |
| `data_maketable7.csv` | ~64 × ~14 | maketable7.dta — health channels |
| `data_maketable8.csv` | ~64 × ~10 | maketable8.dta — alternative instruments |

## Stata packages used (SSC)

| Package | Purpose |
|---------|---------|
| `ivreg2` (Baum, Schaffer, Stillman) | 2SLS with Kleibergen-Paap rk Wald F, Stock-Yogo critical values, Hansen J |
| `ranktest` (Kleibergen, Schaffer) | dependency of `ivreg2` for rk statistics |
| `estout` (Jann) | `eststo` / `esttab` for table assembly and CSV export |
| `coefplot` (Jann) | coefficient comparison plot (Figure 3) |

## Diagnostics layered onto AJR's Tables

- **Weak-IV F-statistic** — printed for every 2SLS run via `ivreg2`'s `e(widstat)` (Kleibergen-Paap rk Wald F under robust SEs)
- **Stock-Yogo (2005) critical values** — echoed in `analysis.log` (10% maximal IV size threshold = 16.38 under iid; users should consult Olea-Pflueger 2013 for robust thresholds)
- **Endogeneity test (Durbin-Wu-Hausman)** — Tab 4 Col 1 via `ivreg2 …, endog(avexpr)`
- **Overidentification test (Hansen J)** — Table 7 Cols 7-9 (4 instruments / 2 endogenous regressors) and Table 8 Panel C (alternative instrument paired with `logem4`); `gmm2s` option used for efficient GMM
- **LATE vs ATE callout** — comment block in §0 documents that 2SLS identifies a LATE under heterogeneous effects (Imbens-Angrist 1994)
- **Albouy (2012) critique** — `di` block in §9 flags that ~36% of mortality observations are imputed/repeats, so Hansen J non-rejection across alternative instruments does not rule out shared imputation bias

## Data loading

`analysis.do` loads each table's `.dta` from one of two sources, selected by
the `USE_GITHUB` global at §0:

- `USE_GITHUB 1` (default): pulls each file from
  `https://raw.githubusercontent.com/cmg777/starter-academic-v501/master/content/post/stata_iv/maketableN.dta`
  — runs anywhere with internet, no clone required.
- `USE_GITHUB 0`: loads from the current folder — useful when iterating
  on the script offline. Requires the eight `.dta` files to be present
  in this directory.

The eight `.dta` files (`maketable1.dta` … `maketable8.dta`) are committed
at the post root, so both modes work out of the box.

## How to run

```bash
cd content/post/stata_iv/
"/Applications/Stata 18.0/StataMP.app/Contents/MacOS/stata-mp" -b do analysis.do
```

Run-time: ~30 seconds on Apple Silicon (offline / `USE_GITHUB 0`); ~5–10 seconds longer over GitHub. SSC packages auto-install on first run via `capture ssc install …`.

## Reference materials in `references/`

- `AJR manuscript.md` — the paper text
- `maketable1/` … `maketable8/` — Acemoglu's original replication package, one folder per table
- `dataDescriptionsSources.png`, `dataMortality.png` — data documentation screenshots
- `readme.TXT`, `web.txt` — original distribution notes and useful URLs

## Files in this folder

```
content/post/stata_iv/
├── analysis.do          # Stata do-file (this script)
├── analysis.log         # Stata text log (full execution record)
├── plan.md              # Approved scope and design
├── README.md            # This file
├── script-review.md     # 8-dimension code review (verdict: ACCEPT)
├── results_report.md    # Structured interpretation of every result (7 findings)
├── execution_log.txt    # Copy of analysis.log — input for write-post
├── stata_iv_first_stage.png
├── stata_iv_reduced_form.png
├── stata_iv_ols_vs_iv.png
├── maketable1.dta … maketable8.dta       # 8 input datasets (also mirrored to GitHub raw URL)
├── tab1_summary.csv … tab8_overid.csv     # 9 result tables
├── data_maketable1.csv … data_maketable8.csv  # 8 dataset CSV dumps
└── references/          # AJR replication materials (input .dta + paper text); not committed to GitHub
```
