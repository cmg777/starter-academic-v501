# Figure B.3 — Regional inequality (GINIW) in Germany, 2000-2012

Reproduces **Figure B.3** of Lessmann & Seidel (2017). A single-country
time-series line plot of **within-country regional inequality** for Germany.

> **Software:** Stata · R · Python · **Package:** none
> **Run:** `cd` into this folder in Stata, then `do Figure_B3.do`. Output → `output/`.

---

## 1. What this shows (in plain terms)

One line: how unequal Germany's regions are, year by year, from 2000 to 2012.
The y-axis is **GINIW** — a population-weighted Gini coefficient computed across
Germany's regions from satellite-predicted regional income. Higher = regions are
more unequal in income per person; lower = regions are more alike. This appendix
figure zooms into a single, familiar country so the reader can see what the
paper's satellite-based inequality series looks like in practice (it drifts
gently and stays around 0.03).

## 2. Method, explained simply

- **Subset to Germany** (`keep if Country_ISO=="DEU"`) and to the years
  **2000-2012** (`keep if year>1999 & year<2013`).
- **Plot** the inequality series against the year with `twoway line`. That is the
  whole figure — no regression, no transformation. The 13 surviving rows are the
  13 yearly points on the line.
- The y-axis is pinned to the paper's window `0.025(0.002)0.035` with grid lines
  turned off (`nogrid`); the x-axis ticks every two years (`2000(2)2012`).

## 3. Data dictionary — `data/Figure_B3_data.csv`

Country-year panel trimmed from `Main_Data.dta` (all countries; the do-file keeps
only Germany 2000-2012). Machine-readable copy in `data_dictionary.csv`.

| Variable | Type | Label / meaning |
|---|---|---|
| `Country_ISO` | string | country code, ISO 3166-1 alpha-3 |
| `year` | numeric | year |
| `GINIW_pred_GDP_pc` | numeric | predicted regional inequality — population-weighted **Gini** of predicted income per capita |

No variables are created inside the do-file.

> **Note on column names:** the CSV stores satellite/period dummies elsewhere in
> the project without the leading underscore the original Stata used (e.g.
> `satyear_1` rather than `_satyear_1`) so they import cleanly. This figure uses
> none of those — only the three columns above.

## 4. How to run

1. (No external package needed.)
2. In Stata, `cd` into this folder, then:

   ```stata
   do Figure_B3.do
   ```

The do-file reads `data/Figure_B3_data.csv`, subsets to Germany 2000-2012, and
writes `output/Figure_B_3.png` and `output/Figure_B_3.gph`.

## 5. Expected result (compare with `expected/Figure_B3_R_reference.png`)

**13 yearly points for Germany, 2000-2012.** GINIW stays inside the
0.025-0.036 band: it hovers near 0.033-0.036 through 2000-2009, dips sharply to
about 0.025 in 2010, then settles near 0.031-0.032 in 2011-2012 — a gentle net
downward drift over the period. Visual target: `expected/Figure_B3_R_reference.png`.

## 6. Provenance

`data/Figure_B3_data.csv` is trimmed from `Data/Main_Data.dta`, which is produced
by the `00_Main_Dataset` pipeline (lights → predicted GDP → inequality → country
merge). To rebuild after a new lights dataset, re-run that pipeline and re-extract
this CSV.

## Cross-language comparison (Stata · R · Python)

The figure is reproduced in three languages from the **same**
`data/Figure_B3_data.csv` (subset to Germany 2000-2012 — 13 yearly rows):

| File | Tool | What it draws with |
|---|---|---|
| `Figure_B3.do` | Stata | `twoway line` of GINIW vs year |
| `Figure_B3.R` | R | `readr` + `ggplot2::geom_line` |
| `Figure_B3.py` | Python | `pandas` + `matplotlib` line plot |

Run with `do Figure_B3.do`, `Rscript Figure_B3.R`, `python Figure_B3.py`.
R writes `output/Figure_B3_R.png`; Python writes `output/Figure_B3_py.png`
(suffixed `_R`/`_py` so they never overwrite the Stata `Figure_B_3.png`).

**Key numbers — R and Python executed here:**

| Quantity | Stata (committed) | R (ggplot2) | Python (matplotlib) |
|---|---|---|---|
| Plotted points (Germany 2000-2012) | 13 | 13 | 13 |
| GINIW in 2000 (first point) | 0.03411 | 0.03411 | 0.03411 |
| GINIW in 2012 (last point) | 0.03070 | 0.03070 | 0.03070 |
| GINIW min (year 2010) | 0.02462 | 0.02462 | 0.02462 |
| GINIW max (year 2008) | 0.03589 | 0.03589 | 0.03589 |

**Notes (tolerance + differences):**
- All three plot the **same 13 yearly points** read directly from the CSV — no
  regression or transformation — so the y-values are identical to full float
  precision (the small print/CSV rounding above is display only).
- The shape matches the visual target `expected/Figure_B3_R_reference.png`:
  GINIW hovers near 0.034 through 2000-2008, dips sharply to ~0.025 in **2010**,
  then recovers to ~0.031-0.032 in 2011-2012 — a gentle net downward drift.
- The y-axis follows the do-file's pinned window `ylabel(0.025(0.002)0.035, nogrid)`
  (no horizontal grid), matching the `.do`; the reference PNG clamps its top at
  0.036, so the 2008 peak sits at the upper edge in the R/Python panels.
- Stata column = the values that fall out of the do-file's subset (Stata not
  executed here); R and Python numbers are in
  `output/Figure_B3_results_R.csv` / `_py.csv`.
