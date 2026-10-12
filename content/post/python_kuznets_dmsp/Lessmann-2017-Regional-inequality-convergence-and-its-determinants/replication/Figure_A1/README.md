# Figure A.1 — Predicted vs observed regional GDP, by national income tier

Reproduces **Figure A.1** (appendix) of Lessmann & Seidel (2017). A validation
scatter showing that the **night-lights income model** recovers observed
regional GDP per capita across the whole development range.

> **Software:** Stata · R · Python · **Package:** none required
> **Run:** `cd` into this folder in Stata, then `do Figure_A1.do`. Output → `output/`.

---

## 1. What this shows (in plain terms)

The paper does not observe GDP for every region directly; it **predicts** it from
satellite night-light intensity. Figure A.1 asks the obvious sanity question:
*where regional GDP IS observed, do the light-based predictions match it?*

Each dot is one region, averaged over **2001–2010**. The horizontal axis is the
model's **predicted** log regional GDP per capita; the vertical axis is the
**observed** log regional GDP per capita. The black line is the 45-degree line
(`y = x`) — perfect prediction. Points are split into three clouds by the income
tier of the region's **country**, so you can see the fit is good for poor, middle
and rich countries alike.

## 2. Method, explained simply

- **Decade window**: keep `year` between 2001 and 2010 (`year>2000 & year<2011`).
- **Collapse to regions**: average each region's series over the decade so every
  region contributes exactly one point (`collapse ..., by(code_Coutry_Region)`).
- **Three overlaid scatters**, split by national income using the World Bank's
  fixed-dollar cutoffs of the era on `GDP_pc_Country`:
  - **LIC** (low income): `GDP_pc_Country < 4089` — small triangles.
  - **MIC** (middle income): `4089 < GDP_pc_Country < 12615` — plus signs.
  - **HIC** (high income): `GDP_pc_Country > 12615` — hollow circles.
- **45-degree line**: `function y = x` over the range 5.5–12 marks perfect fit.
- No regression here — it is a pure goodness-of-fit picture for the prediction.

## 3. Data dictionary — `data/Figure_A1_data.csv`

Region-year panel trimmed from the main lights/GDP dataset. Machine-readable copy
in `data_dictionary.csv`. Column names are **case-sensitive** and match the CSV
header exactly (including the source's spelling `code_Coutry_Region`).

| Variable | Type | Label / meaning |
|---|---|---|
| `code_Coutry_Region` | numeric | region identifier (country-region code; source spelling kept) |
| `Region_NAME` | string | region name |
| `Country_ISO` | string | country code, ISO 3166-1 alpha-3 |
| `year` | numeric | year |
| `GDP_pc_Country` | numeric | national GDP per capita, PPP constant 2005 US$ (used for the income tier) |
| `GDP_pc_Region` | numeric | regional GDP per capita, PPP constant 2005 US$ |
| `log_GDP_pc_Region` | numeric | log observed regional GDP per capita (vertical axis) |
| `pred_log_GDP_pc_Region` | numeric | log **predicted** regional GDP per capita from lights (horizontal axis) |
| `pred_GDP_pc_Region` | numeric | predicted regional GDP per capita (levels) |
| `Pix_Region` | numeric | region area, measured by number of pixels |
| `Pop_Region` | numeric | regional total population |

Variables built inside the do-file: none (only the decade-averaged region means
created by `collapse`).

> **Note on satellite dummies (general to this replication):** the original
> Stata code wrote satellite-year dummies as `_satyear_1`..`_satyear_7`. In the
> shipped CSVs the leading underscore is removed (`satyear_1`..`satyear_7`) so
> Stata's importer accepts them. This figure does not use those dummies.

## 4. How to run

1. Install Stata (no `ssc` package is required for this figure).
2. In Stata, `cd` into this folder (the one containing `Figure_A1.do`).
3. Run:

   ```stata
   do Figure_A1.do
   ```

Outputs are written to `output/`:
- `output/figure_A_1.png` (raster, width 1600)
- `output/figure_A_1.gph` (native Stata graph)

## 5. Expected result

A **tight scatter hugging the 45-degree line**: the light-based predictions
track observed regional GDP per capita closely. The three tiers line up from the
lower-left to the upper-right — **LIC** points cluster around 6–9, **MIC** around
8–10, **HIC** around 9.5–12 in log dollars — and all three straddle `y = x` with
no systematic over- or under-prediction. Visual target:
`expected/Figure_A1_R_reference.png` (manuscript p.128).

## 6. Provenance

`data/Figure_A1_data.csv` is trimmed from the main region-level lights/GDP file
produced by the `00_Main_Dataset` pipeline (lights → predicted regional GDP →
merge with observed regional GDP and national GDP). To rebuild after a new lights
dataset, re-run that pipeline and re-extract this CSV.

---

## 7. Cross-language comparison (Stata · R · Python)

The figure is reproduced in three languages from the **same**
`data/Figure_A1_data.csv` (decade window 2001–2010, collapsed to one point per
region, then a scatter of observed vs predicted log regional GDP split by the
country income tier, plus the 45-degree line `y = x`):

| File | Tool | What it draws with |
|---|---|---|
| `Figure_A1.do` | Stata | `collapse` + `twoway scatter`/`function y=x` |
| `Figure_A1.R` | R | `aggregate` + `ggplot2` (`geom_point` + `geom_abline`) |
| `Figure_A1.py` | Python | `pandas.groupby` + `matplotlib` (`scatter` + `plot`) |

Run with `do Figure_A1.do`, `Rscript Figure_A1.R`, `python Figure_A1.py`.
R writes `output/Figure_A1_R.png`; Python writes `output/Figure_A1_py.png`
(suffixed so they never overwrite the Stata `output/figure_A_1.png`).

**Key numbers — R and Python executed here:**

| Quantity | Stata (pinned) | R | Python |
|---|---|---|---|
| Regions plotted (n) | ~1418 | 1418 | 1418 |
| corr(observed, predicted) log GDP | ~0.9 (high) | 0.9173 | 0.9173 |
| LIC regions (`GDP_pc_Country < 4089`) | — | 179 | 179 |
| MIC regions (`4089–12615`) | — | 523 | 523 |
| HIC regions (`> 12615`) | — | 716 | 716 |

**Notes (tolerance + differences):**
- R and Python are **bit-for-bit identical** on every number: the region count
  (1418), the income-tier counts (179 / 523 / 716) and the obs-vs-pred
  correlation (0.91730 in both, to 5 dp). Values are in
  `output/Figure_A1_results_R.csv` / `_py.csv`.
- The Stata column reflects the **pinned** visual target (a tight scatter along
  the 45-degree line, corr ≈ 0.9); the do-file does not print these numbers, so
  the exact 1418 / 0.9173 are the executed R/Python values. They match the Stata
  picture: a tight cloud hugging `y = x` with the three tiers ranging lower-left
  (LIC) to upper-right (HIC). Visual target `expected/Figure_A1_R_reference.png`.
- Marker styles echo the Stata `msymbol` choices: triangle = LIC, plus = MIC,
  hollow circle = HIC. Colour/shape differences between the R and Python panels
  are cosmetic; the point clouds, the 45-degree line and the axis box (5.5–12)
  are the same in all versions.
- The correlation is computed on the decade-averaged region means (one row per
  `code_Coutry_Region`), identically in both languages, so any rounding in the
  CSV floats does not affect the reported 4-dp value.
