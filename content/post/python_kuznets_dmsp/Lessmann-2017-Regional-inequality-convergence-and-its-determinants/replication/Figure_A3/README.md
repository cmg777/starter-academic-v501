# Figure A.3 — USA 2010: predicted vs observed regional GDP, by regional price parity

Reproduces **Figure A.3** of Lessmann & Seidel (2017). A single cross-section
scatter of US states in 2010: night-lights **predicted** log GDP per capita
against **observed** (official) log GDP per capita, with a 45-degree line and
points grouped by each state's **Regional Price Parity (RPP)**.

> **Software:** Stata · R · Python · **Package:** none
> **Run:** `cd` into this folder in Stata, then `do Figure_A3.do`. Output → `output/`.

---

## 1. What this shows (in plain terms)

The paper predicts regional income from satellite night-lights. This figure
asks a simple validation question for the one country where a good cost-of-living
index exists (the USA): **how close are predicted and observed state incomes,
and does the gap line up with local prices?**

- The horizontal axis is the **predicted** log GDP per capita of each state.
- The vertical axis is the **observed** log GDP per capita.
- The diagonal **y = x** line is perfect prediction. Points above it are richer
  than predicted; points below are poorer than predicted.
- Points are colored/marked by **Regional Price Parity (RPP)**, the BEA index
  where 100 = US average price level. Low-price states (LRPP) and high-price
  states (HRPP) tend to sit on opposite sides of the line — evidence that
  regional price differences, not pure noise, explain much of the residual gap.

## 2. Method, explained simply

- **Filter to one cross-section:** keep `year==2010` and `Country_ISO=="USA"`.
  RPP is only defined for US states, so this also drops all missing-RPP rows.
- **Three price tiers** split by RPP cut-offs (roughly equal thirds):
  - **LRPP** (low): `RPP < 90.2` — hollow triangle marker.
  - **MRPP** (mid): `90.2 < RPP < 102.8` — plus marker.
  - **HRPP** (high): `RPP > 102.8` — hollow circle marker.
- **Labels:** each point is tagged with its state name via `mlabel(Region_NAME)`.
- **Reference line:** `function y=x` over the plotted range draws the 45-degree
  line, so vertical distance from it = prediction error.
- No regression is estimated; this is a descriptive diagnostic plot.

## 3. Data dictionary — `data/Figure_A3_data.csv`

Region-year panel trimmed from the main dataset (5,258 rows; this figure uses
only the 51 USA / 2010 rows). Machine-readable copy in `data_dictionary.csv`.

| Variable | Type | Label / meaning |
|---|---|---|
| `Region_NAME` | string | region (US state) name |
| `Country_ISO` | string | country code, ISO 3166-1 alpha-3 |
| `year` | numeric | year |
| `log_GDP_pc_Region` | numeric | **observed** log GDP per capita of the region |
| `pred_log_GDP_pc_Region` | numeric | **predicted** log GDP per capita (from night lights) |
| `RPP` | numeric | Regional Price Parities, USA (BEA; 100 = US average) |

Note: in the original Stata code, satellite-year dummies appeared as
`_satyear_1.._satyear_7` (leading underscore); CSVs strip the leading
underscore so Stata can import them. This figure uses none of those dummies.

## 4. How to run

1. Install Stata (any version ≥ 13). No SSC packages are required.
2. In Stata, `cd` into this folder:
   ```stata
   cd ".../replication/Figure_A3"
   do Figure_A3.do
   ```
3. Results are written to `output/figure_A_3.gph` and `output/figure_A_3.png`.

## 5. Expected result

A scatter of **51 US states/regions in 2010** (50 states + District of
Columbia), split into LRPP / MRPP / HRPP groups, with a 45-degree (`y = x`)
reference line. Low-price (LRPP) states tend to plot below the line and
high-price (HRPP) states above it. Visual target: manuscript p.130 and
`expected/Figure_A3_R_reference.png`.

## 6. Provenance

`data/Figure_A3_data.csv` is trimmed from `Data/Main_Data.dta`, which is
produced by the `00_Main_Dataset` pipeline (lights → predicted GDP → region
merge), with the BEA Regional Price Parities merged on for US states. To rebuild
after a new lights dataset, re-run that pipeline and re-extract this CSV.

---

## Cross-language comparison (Stata · R · Python)

The figure is reproduced in three languages from the **same**
`data/Figure_A3_data.csv` (filter `year==2010 & Country_ISO=="USA"`):

| File | Tool | What it draws with |
|---|---|---|
| `Figure_A3.do` | Stata | `twoway scatter` (by RPP) + `function y=x` |
| `Figure_A3.R` | R | `ggplot2` (`geom_point`/`geom_abline`) |
| `Figure_A3.py` | Python | `matplotlib` (`scatter`/`plot`) |

Run with `do Figure_A3.do`, `Rscript Figure_A3.R`, `python Figure_A3.py`.
R writes `output/Figure_A3_R.png`; Python writes `output/Figure_A3_py.png`
(suffixed so neither overwrites the Stata `output/figure_A_3.png`).

**Key numbers — R and Python executed here:**

| Quantity | Stata (committed) | R (ggplot2) | Python (matplotlib) |
|---|---|---|---|
| States/regions plotted (n) | 51 | 51 | 51 |
| LRPP / MRPP / HRPP counts | 13 / 25 / 13 | 13 / 25 / 13 | 13 / 25 / 13 |
| corr(predicted, observed) | 0.4064 | 0.4064 | 0.4064 |

**Notes (tolerance + differences):**
- All three plot the **same 51 US states/regions** (50 states + District of
  Columbia) in 2010, split into the same LRPP/MRPP/HRPP price tiers using the
  identical RPP cut-offs `90.2` and `102.8`.
- The predicted-vs-observed Pearson correlation matches to ~15 significant
  digits across R and Python (`0.40637029999899…`); the Stata column is the
  pinned reference (n = 51; Stata not executed in this environment).
- The 45-degree reference line is `function y=x` in Stata, `geom_abline(slope=1,
  intercept=0)` in R, and `ax.plot(rng, rng)` in Python — identical lines.
- Marker mapping follows the Stata `.do`: LRPP = triangle, MRPP = plus,
  HRPP = hollow circle. R/Python add colour (red/green/blue) for legibility; the
  point cloud matches `expected/Figure_A3_R_reference.png`.
- R and Python numbers are written to `output/Figure_A3_results_R.csv` /
  `output/Figure_A3_results_py.csv`.
