# Lessmann & Seidel (2017) — Regional inequality, convergence, and its determinants: a replication

A fully documented, **beginner-friendly replication** of every table and figure in:

> Christian Lessmann & André Seidel (2017), *Regional inequality, convergence,
> and its determinants — A view from outer space*, **European Economic Review**
> 92, 110–132.

The paper has a problem and a trick. The **problem**: most countries publish no
GDP for their internal regions, so regional inequality can't be measured
worldwide. The **trick**: use **satellite nighttime lights** as a stand-in for
income. The authors learn the lights→income relationship where both are observed,
use it to **predict regional GDP for every region on Earth**, build
**within-country regional inequality**, and study how it relates to development
(an inverted-U "Kuznets curve") and to policy/geography.

This repository keeps the authors' **original Stata archive** *and* adds a new
[`replication/`](replication/) directory that breaks the analysis into **17
independent, self-contained, heavily-annotated folders** — one per table/figure
plus a data-building pipeline — designed so the project can be **extended with a
new nighttime-lights dataset** by editing a single config file.

Every folder reproduces its result in **three languages — Stata, R, and Python**
— from the *same* shipped data, and its README carries a side-by-side
**Stata · R · Python comparison**. The R and Python versions of all 17 results
were executed and agree with the Stata numbers within a documented tolerance.

---

## Quick start

Each result lives in its own folder under [`replication/`](replication/) and runs
on its own — in whichever language you prefer. For example, to reproduce Table 3:

```bash
cd .../replication/Table_3
do Table_3.do        # Stata   (ssc install outreg2 once)
Rscript Table_3.R    # R       (install.packages(c("readr","fixest")))
python Table_3.py    # Python  (pip install pandas linearmodels)
```

Every folder is portable: copy it to another computer, install the package(s) its
README lists, run any of the three scripts, and it reproduces that one result —
its data travel with it. See [`replication/README.md`](replication/README.md) for
the full index and the per-language install blocks.

> **Software:** Stata 13+ (maps need Stata 15+ for `spshape2dta`) · R ≥ 4.1 ·
> Python ≥ 3.10. Use any one — they read the same CSVs and produce the same result.

---

## What's in this repository

### The new replication (`replication/`)

```text
replication/
  README.md             master index, install block, build order, limitations
  00_Main_Dataset/      the pipeline: lights -> predicted GDP -> inequality -> Main_Data
  Table_1 … Table_B4    one folder per table  (1, 2, 3, 4, B.4)
  Figure_1 … Figure_B3  one folder per figure (1, 2, 3, 4, 5, A.1–A.4, B.1, B.3)
  _verification/        R build & QA harness (NOT part of the Stata deliverable)
```

Each table/figure folder has the same shape:

```text
<Folder>/
  data/                 trimmed CSV(s) — only the variables this result needs
  data_dictionary.csv   machine-readable: variable | label | type
  <name>.do             Stata  — the standalone, heavily-annotated script
  <name>.R              R      — same result (image outputs suffixed _R)
  <name>.py             Python — same result (image outputs suffixed _py)
  output/               created at run time (results land here)
  expected/             the target to compare against (committed paper output
                        and/or an R-rendered reference image)
  README.md             plain-English explanation + data dictionary + how-to-run
                        + a Stata · R · Python comparison table
```

Data are shipped as **CSV** (open; read by Stata `import delimited`, R `read_csv`,
Python `pandas.read_csv`). Variable labels, which CSV can't store, live in each
`data_dictionary.csv` and README. (The `00_Main_Dataset` pipeline ships its three
languages as `00_run_all.do` / `run_all.R` / `run_all.py`.)

### The original archive (kept as reference)

| Path | What it is |
| --- | --- |
| `Generation_Main_Dataset.do` | original: build the master dataset |
| `Generation_Tables.do` | original: produce Tables 1–4, B.4 |
| `Generation_Figures.do` | original: produce all figures |
| `Data/` | original source datasets (`.dta`) |
| `Tables/`, `Figures/` | original committed outputs |
| `manuscript.pdf`, `Appendix B Sources.pdf` | the paper and its data-source appendix |
| `my-old-replication/` | earlier exploratory replication attempts |

---

## What each folder reproduces

| Folder | Result | Method | Package(s) |
| --- | --- | --- | --- |
| `00_Main_Dataset/` | the whole data pipeline | RE panel regression + `ineqdeco` | `ineqdeco` |
| `Table_1/` | lights predict regional GDP (7 specs) | `xtreg` / `reg` | `outreg2` |
| `Table_2/` | predicted vs observed vs light inequality (correlations) | `ineqdeco` + `pwcorr` | `ineqdeco` |
| `Table_3/` | regional Kuznets curve (cubic in log GDP) | `xtreg, fe` | `outreg2` |
| `Table_4/` | determinants with controls (5 reproducible cols) | `xtreg, fe` | `outreg2` |
| `Table_B4/` | spatial-HAC (Conley) robustness | `ols_spatial_HAC` | `ols_spatial_HAC` † |
| `Figure_1/`, `Figure_B1/` | predicted regional income (world / Sub-Saharan Africa) | choropleth | `spmap` |
| `Figure_2/` | regional inequality (GINIW) world map | choropleth | `spmap` |
| `Figure_3/` | change in inequality (diverging map) | choropleth | `spmap` |
| `Figure_4/` | inequality vs development (a: all, b: labelled) | FE + scatter | — |
| `Figure_5/` | inequality vs personal inequality (5a) / conflict (5b) | scatter + `lfit` | — |
| `Figure_A1–A4/` | predicted-vs-observed validation scatters | scatter | — |
| `Figure_B3/` | regional inequality in Germany, 2000–2012 | time series | — |

† `ols_spatial_HAC` is **not** on SSC — see `Table_B4/README.md` for the source.

---

## Extending the paper with a new nighttime-lights dataset

This is what the archive is built for.

```text
new lights data ─► 00_Main_Dataset (edit config.do only) ─► Main_Data
                                                              │
                  re-extract trimmed CSVs ◄────────── feeds every table/figure folder
```

1. Put new lights panels in `00_Main_Dataset/data/` and edit **only**
   `00_Main_Dataset/config.do` (file paths + the `$LIGHTS` variable name; add or
   drop controls in `$X_CORE`). Run `do 00_run_all.do` to rebuild `Main_Data`.
2. Re-extract each folder's trimmed CSV from the updated data
   (`_verification/10_extract_csvs.R` shows exactly how, or do it in Stata with
   `use … ; keep … ; export delimited`).
3. Re-run the table/figure do-files. They are written generically — no hard-coded
   coefficients, explicit variable lists, looped index computation — so they pick
   up the new numbers automatically.

Full config-macro reference: [`replication/00_Main_Dataset/README.md`](replication/00_Main_Dataset/README.md).

---

## Verification status

The Stata `.do` files were **refactored from the authors' original working
scripts**; the **R and Python versions of all 17 results were executed** and
checked against the committed Stata outputs (`Tables/Table_*.txt`) and the
manuscript. (Stata itself was not available on the build machine, so its column in
each comparison is the committed/expected output.)

Headline agreement (full table in
[`replication/_verification/VERIFICATION_REPORT.md`](replication/_verification/VERIFICATION_REPORT.md)):

| Result | Stata | R | Python |
| --- | --- | --- | --- |
| Table 1 lights elasticities (7 cols) | .399/.190/.153/.122/.232/.104/.102 | match (3 dp) | match (3 dp) |
| Table 2 correlations (incl. Gini) | 0.50/0.40/0.45/0.50/0.52 | match | match |
| Table 3 cubic (GINIW) | .293 / −.032 / .001 | match | match |
| Table 4 controls (5 cols) | rents .018 … ethnic .071 | match | match |
| Table B.4 point estimate | 0.190 | 0.190 | 0.190 |
| Pipeline GINIW vs `Main_Data` | — | corr 1.0000 | corr 1.0000 |

Method-driven gaps (random-effects variance estimators, the Conley spatial-HAC SE
in Table B.4, and `fixest`'s singleton handling) are small and **documented in
each folder's README**, per the agreed "match-within-tolerance" standard.

**To get the official Stata outputs**, run the `.do` files once on a machine with
Stata and confirm each folder's `output/` matches its `expected/`.

---

## Known limitations (documented, not hidden)

- **Table 4, published column 4** (ICRG bureaucratic quality + Polity2 + a federal
  interaction) **cannot be reproduced**: that ICRG variable is licensed and absent
  from the shipped data (it was already commented out in the original do-file). The
  reproduced table has the other 5 columns.
- **Figure 5b** (inequality vs internal-conflict risk) is **not reproducible** for
  the same reason (ICRG data). The code is shipped commented.
- **Maps (Figures 1, 2, 3, B.1):** the original GADM-3.6 coordinate files are no
  longer downloadable (their host is gone), so the folders bundle **Natural Earth**
  polygons instead — countries match 100% (by ISO3), subnational regions ~90%, so a
  few regions show as "no data".
- **Figure 4b labels:** the original listed `ITL`/`IRE`, which are typos that
  silently never plotted; this replication uses the correct `ITA`/`IRL`.

---

## Credits

Original paper and data © Christian Lessmann & André Seidel (2017). This
replication reorganises and documents their archive for teaching and for a planned
extension; it does not alter their results.
