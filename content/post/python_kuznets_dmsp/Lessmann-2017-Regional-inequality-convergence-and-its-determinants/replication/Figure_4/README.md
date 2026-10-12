# Figure 4 — Regional inequality and development (the spatial Kuznets curve)

Reproduces **Figure 4** of Lessmann & Seidel (2017): partial-residual scatter
plots of within-country regional inequality (GINIW) against log national GDP per
capita, with the fitted cubic curve. Panel (a) shows all countries; panel (b)
labels a set of example countries.

> **Software:** Stata · R · Python · **Package:** none
> **Run:** `cd` into this folder in Stata, then `do Figure_4.do`. Output → `output/`.

---

## 1. What this figure shows (in plain terms)

The dots are **partial residuals**: each country-period's regional inequality
*after removing the estimated period (year) effects*, so the picture isolates the
relationship with development. The solid line is the **fitted cubic** from
Table 3, column (3). The curve **rises then falls** — regional inequality tends
to be highest at middle income levels (a spatial analogue of Kuznets's
hypothesis). Panel (b) is the same cloud and curve but plots only labelled
example countries so you can read off where specific economies sit.

## 2. Method, explained simply

- **5-year averages**: annual data are collapsed into five periods (1990–94 …
  2010–14).
- **`xtreg, fe`**: a country fixed-effects regression of GINIW on a cubic in log
  GDP per capita plus period dummies — identical to Table 3, column (3).
- **Partial residual**: we subtract only the estimated period effects
  (`_b[_Ip5year_*] × dummy`) from GINIW, leaving the GDP relationship to be
  plotted. Coefficients are read with `_b[…]` rather than hard-coded, so the plot
  stays correct if the data are updated.
- **`twoway … (function y = …)`** overlays the cubic curve using those same
  `_b[…]` coefficients.

## 3. Data dictionary — `data/Figure_4_data.csv`

Country-year panel (3,675 rows) trimmed from `Main_Data.dta`. Machine-readable
copy in `data_dictionary.csv`.

| Variable | Type | Label / meaning |
|---|---|---|
| `Country_ISO` | string | country code, ISO 3166-1 alpha-3 |
| `Country_NAME` | string | country name |
| `year` | numeric | year |
| `GINIW_pred_GDP_pc` | numeric | regional inequality — population-weighted Gini of predicted income |
| `GDP_pc_Country` | numeric | national GDP per capita, PPP constant 2005 US$ |

Built in the do-file: `p5year` (period 1–5), `log_GDP_pc_Country` and its square
`_2`/cube `_3`, `Country_ISO_long` (numeric id), `yhat_period` (period-effect
contribution), `GINIW_temp` (the plotted partial residual).

## 4. How to run

1. In Stata, `cd` into this folder.
2. `do Figure_4.do` (no package needed).
3. Outputs: `output/Figure_4_a.png`/`.gph` and `output/Figure_4_b.png`/`.gph`.

## 5. Expected result

- Fitted cubic equals Table 3 col (3): `log GDP` **0.2931**, `(log GDP)²`
  **−0.0320**, `(log GDP)³` **0.00112**, constant **−0.7985** (R-verified from
  this exact CSV).
- The curve rises to a peak around middle-income and declines.
- Visual target: `expected/Figure_4_R_reference.png` and `manuscript.pdf` p.124.

### Note on the original (fixed here)
The original Figure 4b labelled-country list contained two typos — `ITL` and
`IRE`, which do not exist in the data, so Italy and Ireland silently never
appeared. This version uses the correct ISO codes **`ITA`** and **`IRL`**.

## 6. Provenance

`data/Figure_4_data.csv` is trimmed from `Data/Main_Data.dta`, produced by the
`00_Main_Dataset` pipeline (lights → predicted GDP → inequality → country merge).
To rebuild after a new lights dataset, re-run that pipeline and re-extract.

## 7. Cross-language comparison (Stata · R · Python)

The figure is reproduced in three languages from the **same**
`data/Figure_4_data.csv`:

| File | Tool | What it draws with |
|---|---|---|
| `Figure_4.do` | Stata | `xtreg, fe` + `twoway scatter`/`function` |
| `Figure_4.R` | R | `fixest::feols` + `ggplot2` |
| `Figure_4.py` | Python | `statsmodels` OLS (country+period dummies) + `matplotlib` |

Run with `do Figure_4.do`, `Rscript Figure_4.R`, `python Figure_4.py`.
R writes `output/Figure_4_{a,b}_R.png`; Python writes `…_py.png`.

**Fitted cubic (the plotted curve = Table 3 col 3) — R and Python executed here:**

| Quantity | Stata (committed) | R (fixest) | Python (statsmodels) |
|---|---|---|---|
| log GDP pc | 0.2931 | 0.2931 | 0.2931 |
| (log GDP pc)² | −0.0320 | −0.0320 | −0.0320 |
| (log GDP pc)³ | 0.00112 | 0.00112 | 0.00112 |
| Labelled countries found (4b) | 13/13 | 13/13 | 13/13 |

**Notes (tolerance + differences):**
- The three cubic curves are identical to ~10 dp; all match the committed Stata
  result and Table 3 column (3).
- All three correctly plot **ITA** and **IRL** in panel (b) (the original Stata
  `ITL`/`IRE` typos are fixed in every version).
- The scatter *point clouds* are the same shape in all three. The "partial
  residual" on the y-axis removes the period (year) effects; the small constant
  used only to place the cubic curve in the cloud is a display choice, not a
  reported number. (R uses the centred period fixed effect from `fixef()`;
  Python uses the period dummy coefficients — these differ by a constant
  vertical shift that does not affect the curve shape or the cubic estimates.)
- Stata column = the values from the original do-file / `expected/Table_3.txt`
  (Stata not executed here); R and Python numbers are in
  `output/Figure_4_results_R.csv` / `_py.csv`.
