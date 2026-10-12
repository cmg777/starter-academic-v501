# Replication — Lessmann & Seidel (2017), *Regional inequality, convergence, and its determinants — A view from outer space*

> Christian Lessmann & André Seidel, **European Economic Review** 92 (2017) 110–132.

This `replication/` directory rebuilds **every table and figure** of the paper as
a set of **independent, self-contained, beginner-friendly folders**. Each folder
ships its own trimmed data, the **same result implemented in three languages —
Stata (`.do`), R (`.R`) and Python (`.py`)** — and a README that doubles as a
data dictionary *and* a Stata · R · Python comparison. Copy any single folder to
another computer, install the listed package(s), run any of the three scripts,
and it reproduces that one result — no dependence on the rest of the repo.

Why three languages? Pedagogical breadth (one result, three ecosystems) and a
trustworthy cross-check: all 17 results were re-run in R **and** Python and agree
with the Stata numbers within a documented tolerance (see
[`_verification/VERIFICATION_REPORT.md`](_verification/VERIFICATION_REPORT.md)).

---

## What the paper does (one paragraph)

Most countries have **no GDP statistics for their internal regions**, so regional
inequality cannot be measured directly worldwide. Lessmann & Seidel use
**satellite nighttime lights** as a proxy: they (1) estimate how light intensity
maps to regional GDP where both are observed (Gennaioli et al. 2014), (2) use that
relationship to **predict regional GDP for every region on Earth**, (3) compute
**within-country regional inequality** from the predictions, and (4) study how
that inequality relates to development (an inverted-U "Kuznets curve") and to
policy/geography variables. The result is the first globally comparable panel of
regional inequality.

---

## Folder index

| Folder | Reproduces | Method | Package(s) |
|---|---|---|---|
| **`00_Main_Dataset/`** | the whole data pipeline (lights → predicted GDP → inequality → `Main_Data`) | RE panel regression + `ineqdeco` | `ineqdeco` |
| `Table_1/` | Table 1 — lights predict regional GDP (7 specs) | `xtreg` / `reg`, FE | `outreg2` |
| `Table_2/` | Table 2 — predicted vs observed vs light inequality (correlations) | `ineqdeco` + `pwcorr` | `ineqdeco` |
| `Table_3/` | Table 3 — regional Kuznets curve (cubic in log GDP) | `xtreg, fe` | `outreg2` |
| `Table_4/` | Table 4 — determinants with controls (5 reproducible cols) | `xtreg, fe` | `outreg2` |
| `Table_B4/` | Table B.4 — spatial-HAC (Conley) robustness | `ols_spatial_HAC` | `ols_spatial_HAC`† |
| `Figure_1/` | Fig 1 — predicted regional income, world map | choropleth | `spmap` |
| `Figure_2/` | Fig 2 — regional inequality (GINIW), world map | choropleth | `spmap` |
| `Figure_3/` | Fig 3 — change in inequality, diverging map | choropleth | `spmap` |
| `Figure_4/` | Fig 4 — inequality vs development (a: all, b: labelled) | FE + scatter | — |
| `Figure_5/` | Fig 5 — inequality vs personal inequality (5a) / conflict (5b) | scatter + `lfit` | — |
| `Figure_A1/` | Fig A.1 — predicted vs observed regional GDP, by income tier | scatter | — |
| `Figure_A2/` | Fig A.2 — …by output density | scatter | — |
| `Figure_A3/` | Fig A.3 — USA 2010, by regional price parity | scatter | — |
| `Figure_A4/` | Fig A.4 — national predicted vs observed | scatter | — |
| `Figure_B1/` | Fig B.1 — predicted income, Sub-Saharan Africa | choropleth | `spmap` |
| `Figure_B3/` | Fig B.3 — regional inequality in Germany 2000–2012 | time series | — |
| `_verification/` | (build/QA scripts — **not** part of the Stata deliverable) | R | R |

† `ols_spatial_HAC` is **not** on SSC — see `Table_B4/README.md` for the source.

---

## How to run any folder (pick a language)

`cd` into the folder, then run **any one** of the three scripts:

```bash
# Stata
do Table_3.do
# R
Rscript Table_3.R
# Python
python Table_3.py
```

Results appear in that folder's `output/` (R/Python images are suffixed `_R`/`_py`
so they never overwrite the Stata output); compare against its `expected/` and the
README's "Cross-language comparison" section.

**Install the dependencies once.**

*Stata* (covers all folders):
```stata
ssc install outreg2
ssc install ineqdeco
ssc install spmap
ssc install shp2dta        // only if your Stata is < 15 (else spshape2dta is built in)
* ols_spatial_HAC: not on SSC — see Table_B4/README.md
```
Maps additionally need `spshape2dta` (built into Stata 15+).

*R* (≥ 4.1):
```r
install.packages(c("readr","fixest","plm","sf","ggplot2","modelsummary"))
```

*Python* (≥ 3.10):
```bash
pip install pandas numpy statsmodels linearmodels matplotlib geopandas
```
(Each script's header lists exactly which packages that folder needs.)

---

## Each folder's anatomy

```
<Folder>/
  data/                 trimmed CSV(s) — only the variables this result needs
  data_dictionary.csv   machine-readable: variable | label | type
  <name>.do             the standalone, heavily-annotated Stata script
  <name>.R              the same result in R     (suffixed _R on any image output)
  <name>.py             the same result in Python (suffixed _py on any image output)
  output/               created at run time (results land here)
  expected/             the target to compare against (committed paper output
                        and/or an R-rendered reference image)
  README.md             plain-English explanation + data dictionary + how-to-run
                        + a Stata · R · Python comparison table
```

Data are shipped as **CSV** (open, and read by Stata via `import delimited`).
Variable labels, which CSV cannot store, live in `data_dictionary.csv` and each
README.

---

## Extending the paper with a NEW nighttime-lights dataset

This is what the archive is built for. The chain is:

```
new lights data  ──►  00_Main_Dataset (edit config.do only)  ──►  Main_Data
                                                                     │
                       re-extract trimmed CSVs  ◄──────────── feeds every table/figure folder
```

1. Put your new lights panels in `00_Main_Dataset/data/` and edit **only**
   `00_Main_Dataset/config.do` (file paths + the `$LIGHTS` variable name; add/drop
   controls in `$X_CORE`). Run `do 00_run_all.do` to produce a new `Main_Data`.
2. Re-extract each folder's trimmed CSV from the updated data (the R helper
   `_verification/10_extract_csvs.R` shows exactly how, or do it in Stata with
   `use … ; keep … ; export delimited`).
3. Re-run the table/figure do-files. The do-files are written generically (no
   hard-coded coefficients; explicit variable lists; looped index computation),
   so they pick up the new numbers automatically.

See `00_Main_Dataset/README.md` for the full config-macro reference.

---

## Known limitations (documented, not hidden)

- **Table 4, published column 4** (ICRG bureaucratic quality + Polity2 + a federal
  interaction) **cannot be reproduced**: `icrg_bureaucratic_qualitiy` is licensed
  ICRG data, absent from the shipped datasets. The reproduced table has the other
  5 columns; the original block is kept commented. (See `Table_4/README.md`.)
- **Figure 5b** (inequality vs internal-conflict risk) **cannot be reproduced**
  for the same reason (ICRG `internal_conflict`). The code is shipped commented.
- **Maps (Fig 1, 2, 3, B.1):** the original GADM-3.6 coordinate files are no longer
  downloadable (their host is gone). The folders instead bundle **Natural Earth**
  polygons: countries match 100% (ISO3); subnational regions match ~90% of the
  paper's regions, so a few regions show as "no data". (See each map README.)
- **Figure 4b labels:** the original listed `ITL`/`IRE`, which are typos that
  silently never plotted; we use the correct `ITA`/`IRL`.

---

## A note on verification

The deliverable is **Stata**, but Stata was not available on the build machine, so
the `.do` files were **refactored from the authors' original working scripts**
(`../Generation_*.do`) and the **data + expected numbers were cross-checked in R**
against the committed outputs (`../Tables/Table_*.txt`) and the manuscript. Every
table reproduces its coefficients from the shipped CSV; see
`_verification/VERIFICATION_REPORT.md`. Run the `.do` files in Stata to produce the
official outputs.
