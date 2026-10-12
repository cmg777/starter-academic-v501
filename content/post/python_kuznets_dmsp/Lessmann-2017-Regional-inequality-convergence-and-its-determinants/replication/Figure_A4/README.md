# Figure A.4 — National predicted vs observed GDP per capita by data source

Reproduces **Figure A.4** of Lessmann & Seidel (2017). A validation scatter:
the authors' **night-lights prediction** of national GDP per capita against
**observed** GDP per capita, plotted for two observed data sources.

> **Software:** Stata · R · Python · **Package:** none
> **Run:** `cd` into this folder in Stata, then `do Figure_A4.do`. Output → `output/`.

---

## 1. What this shows (in plain terms)

Lessmann & Seidel build national income from satellite night-lights. Before
trusting those numbers, they check them against real GDP data. This figure plots
**log observed GDP per capita** (vertical) against **log predicted GDP per
capita** (horizontal) for one point per country (averaged over 2001–2010), and
overlays the **45-degree line**. If the lights model is good, points sit on or
near that line. Two sources of *observed* GDP are shown so the check does not
rely on a single dataset: World Bank figures (all countries) and the Gennaioli
et al. (2014) figures (a 78-country subset).

## 2. Method, explained simply

- **Restrict to 2001–2010** (`keep if year>2000 & year<2011`): the decade of
  overlap, then average each country over those years.
- **`collapse (mean) ..., by(Country_ISO)`**: one row per country — three GDP
  means (observed WB, predicted, observed Gennaioli).
- **Logs** (`log(...)`): GDP per capita spans orders of magnitude, so logs make
  rich and poor countries comparable on one axis.
- **`geroli_dum`** (flag kept verbatim from the original code): 1 if the country
  has Gennaioli observed data, 0 otherwise — used to split the markers.
- **Two `scatter`s + `function y=x`**: triangles for the Gennaioli subset,
  circles for the rest, with each point labelled by its ISO code, and the
  45-degree reference line drawn over the data range [5.5, 12].

## 3. Data dictionary — `data/Figure_A4_data.csv`

Country-year panel trimmed from `Main_Data.dta`. Machine-readable copy in
`data_dictionary.csv`.

| Variable | Type | Label / meaning |
|---|---|---|
| `Country_ISO` | string | country code, ISO 3166-1 alpha-3 |
| `year` | numeric | year |
| `GDP_pc_Country` | numeric | observed national GDP per capita, PPP constant 2005 US$ (World Bank) |
| `pred_GDP_pc_Country` | numeric | predicted national GDP per capita (from night-lights) |
| `GDP_pc_Country_G` | numeric | observed GDP per capita, Gennaioli et al. (2014); missing for non-Gennaioli countries |

> **CSV naming note:** the original Stata code wrote some satellite/year dummies
> with a leading underscore (`_satyear_1`); when present in shipped CSVs those
> are exported without the leading underscore (`satyear_1`) so Stata imports
> them. This particular figure uses none of those dummies.

Variables built inside the do-file: `log_GDP_pc_Country`,
`log_pred_GDP_pc_Country`, and `geroli_dum` (1 = has Gennaioli observed data).

## 4. How to run

1. Install Stata (no external `ssc` packages required).
2. In Stata, `cd` into this folder.
3. Run: `do Figure_A4.do`
4. Outputs land in `output/`: `Figure_A_4.gph` and `Figure_A_4.png`.

## 5. Expected result (compare with `expected/Figure_A4_R_reference.png`)

- **78** countries carry Gennaioli observed data (triangles); **180** countries
  in total (triangles + circles).
- Points cluster tightly around the **45-degree line** — the lights-based
  prediction tracks observed national GDP per capita well.
- Visual target: manuscript p.131, mirrored in
  `expected/Figure_A4_R_reference.png`.

## 6. Provenance

`data/Figure_A4_data.csv` is trimmed from `Data/Main_Data.dta`, which is
produced by the `00_Main_Dataset` pipeline (lights → predicted GDP → country
merge, with the Gennaioli series joined in). To rebuild after a new lights
dataset, re-run that pipeline and re-extract this CSV.

## 7. Cross-language comparison (Stata · R · Python)

The figure is reproduced in three languages from the **same**
`data/Figure_A4_data.csv`:

| File | Tool | What it draws with |
|---|---|---|
| `Figure_A4.do` | Stata | `collapse (mean)` + `twoway scatter`/`function y=x` |
| `Figure_A4.R` | R | `aggregate` + `ggplot2` (`geom_point`/`geom_abline`) |
| `Figure_A4.py` | Python | `pandas groupby` + `matplotlib` (`scatter`/`plot`) |

Run with `do Figure_A4.do`, `Rscript Figure_A4.R`, `python Figure_A4.py`.
R writes `output/Figure_A4_R.png`; Python writes `output/Figure_A4_py.png`
(both suffixed so they never overwrite the Stata `Figure_A_4.png`).

**Headline counts — R and Python executed here:**

| Quantity | Stata (committed) | R | Python |
|---|---|---|---|
| Countries total (all with a prediction) | ~180 | 180 | 180 |
| Countries with Gennaioli observed data (`geroli_dum==1`) | 78 | 78 | 78 |

**Notes (tolerance + differences):**
- Both R and Python reproduce the **exact** committed Stata counts: **180**
  countries total, **78** with Gennaioli observed data. Values are written to
  `output/Figure_A4_results_R.csv` / `_py.csv`.
- The per-country means are computed with `na.rm=TRUE` (R) / `.mean()` (Python),
  which ignore the missing `.` Gennaioli entries exactly as Stata's
  `collapse (mean)` does — so the three pictures use identical coordinates to
  floating-point tolerance (~1e-12).
- All three plot **log(observed)** vs **log(predicted)** with the 45-degree line
  `y = x` over `[5.5, 12]`, split into triangles (Gennaioli "observed data")
  and circles ("predicted data"), each labelled by ISO code; points cluster
  tightly around the line, matching `expected/Figure_A4_R_reference.png`.
- Marker colours/shapes are a display choice: R uses ggplot's default red
  triangle / teal circle; Python mirrors the same palette
  (`#F8766D` / `#00BFC4`). These cosmetic choices do not change any reported
  number.
- Stata column = the values from the original do-file (`~180` / `78`; Stata not
  executed here); R and Python numbers are the executed results above.
