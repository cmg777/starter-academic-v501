# Table 1 — Nighttime lights predict regional GDP (7 specifications)

Reproduces **Table 1** of Lessmann & Seidel (2017). This is the paper's
**first-stage / calibration regression**: it establishes that satellite
nighttime light intensity is a strong, robust predictor of regional income.
The fitted values of column (7) are the "predicted GDP" that the rest of the
paper uses to measure inequality and convergence for regions that have no
official income data.

> **Software:** Stata · R · Python · **Package:** `ssc install outreg2`
> **Run:** `cd` into this folder in Stata, then `do Table_1.do`. Output → `output/`.

---

## 1. What this table shows (in plain terms)

Most of the world's subnational regions report no GDP figures. But every
region emits light at night, and satellites have measured that light globally
for decades. This table asks: *how well does nighttime light per pixel predict
log regional GDP per capita?* The answer is "very well," and the relationship
is stable as we add more and more controls — which is exactly what you need
before trusting lights as a stand-in for income.

Reading across the columns, the elasticity of regional GDP with respect to
lights stays positive and highly significant even after stripping out region,
country, or world-region fixed effects and conditioning on national income.
Column (7) is the full **prediction model**: its fitted values become the
predicted GDP used to build the inequality indices in the other folders.

## 2. Method, explained simply

- **`xtreg` (random effects)** is the default estimator for columns (1) and
  (3)–(7); column (2) is a plain OLS `reg`.
- **`cluster(Country_ISO)`**: standard errors allow arbitrary correlation
  among regions within the same country.
- **Progressively tighter comparisons.** Each column controls for a different
  layer of "everything else":
  - (1) nothing — raw correlation.
  - (2) **region fixed effects** (`_Icode_Cout_*`) + satellite FE: compares a
    region *to itself* over time.
  - (3) **country fixed effects** (`country_dum1`–`country_dum81`) + satellite FE.
  - (4) adds **national GDP per capita** to (3).
  - (5) **country-group (World Bank region) fixed effects** (`eap ssa mena lac
    eca sa`) + satellite FE.
  - (6) adds **national GDP per capita** to (5).
  - (7) adds **geography & pixel-coding controls** — share of top-coded
    (saturated) and low-coded (unlit) pixels, region area, number of regions,
    and their interaction. This is the model actually used for prediction.
- **Satellite fixed effects** (`satyear_1`–`satyear_7`): different satellites
  and sensors record light on slightly different scales, so each satellite-era
  gets its own intercept.

## 3. Data dictionary — `data/Table_1_data.csv`

Region-year panel (5,258 rows; 1,504 regions) trimmed from the prediction
dataset. Machine-readable copy in `data_dictionary.csv`. Column names are
**case-sensitive** and used exactly as listed.

| Variable | Type | Label / meaning |
|---|---|---|
| `code_Coutry_Region` | numeric | region id (country×region code); panel id |
| `Country_ISO` | string | country code, ISO 3166-1 alpha-3; clustering id |
| `year` | numeric | year |
| `log_GDP_pc_Region` | numeric | **dependent variable** — log GDP per capita, region |
| `log_Light_ppix_Region` | numeric | log average nighttime light per pixel, region |
| `log_GDP_pc_Country` | numeric | log GDP per capita, country |
| `log_N_pix_top_cod_1_ppix` | numeric | log number of top-coded (saturated) pixels |
| `log_N_pix_low_cod_1_ppix` | numeric | log number of low-coded (unlit) pixels |
| `log_area` | numeric | log area of region |
| `log_region` | numeric | log number of subnational regions of a country |
| `log_region_X_log_area` | numeric | interaction: `log_region` × `log_area` |
| `eap` | numeric | World Bank group dummy — East Asia and the Pacific |
| `eca` | numeric | World Bank group dummy — Europe and Central Asia |
| `lac` | numeric | World Bank group dummy — Latin America and the Caribbean |
| `mena` | numeric | World Bank group dummy — Middle East and North Africa |
| `sa` | numeric | World Bank group dummy — South Asia |
| `ssa` | numeric | World Bank group dummy — Sub-Saharan Africa |
| `satyear_1` … `satyear_7` | numeric | satellite fixed-effect dummies (original `_satyear_1`–`_satyear_7`; leading underscore dropped on CSV import) |
| `country_dum1` … `country_dum81` | numeric | country fixed-effect dummies (`country_dum1`==ALB, `country_dum2`==ARE, … `country_dum81`==ZAF) |

Variables built inside the do-file: `_Icode_Cout_2`–`_Icode_Cout_1504`
(region dummies from `xi i.code_Coutry_Region`, used as region FE in column 2).

## 4. How to run

1. Install the required package once (in Stata):
   ```stata
   ssc install outreg2
   ```
2. In Stata, change directory into **this** folder, then run the do-file:
   ```stata
   cd "/path/to/replication/Table_1"
   do Table_1.do
   ```
3. Results are written to `output/Table_1.xls` and `output/Table_1.txt`.

## 5. Expected result (compare with `expected/Table_1.txt`)

| Coefficient | (1) | (2) | (3) | (4) | (5) | (6) | (7) |
|---|---|---|---|---|---|---|---|
| `log_Light_ppix_Region` | 0.399*** | 0.190*** | 0.153*** | 0.122*** | 0.232*** | 0.104*** | 0.102*** |
| `log_GDP_pc_Country` |  |  |  | 0.864*** |  | 0.901*** | 0.889*** |
| `log_N_pix_top_cod_1_ppix` |  |  |  |  |  |  | 0.004*** |
| `log_N_pix_low_cod_1_ppix` |  |  |  |  |  |  | −0.007** |
| `log_area` |  |  |  |  |  |  | 0.183*** |
| `log_region` |  |  |  |  |  |  | 0.396*** |
| `log_region_X_log_area` |  |  |  |  |  |  | −0.041*** |
| Observations | 5,258 | 5,258 | 5,258 | 5,258 | 5,258 | 5,258 | 5,258 |
| Regions | 1,504 |  | 1,504 | 1,504 | 1,504 | 1,504 | 1,504 |
| Region FE | NO | YES | NO | NO | NO | NO | NO |
| Country FE | NO | NO | YES | YES | NO | NO | NO |
| Country Group FE | NO | NO | NO | NO | YES | YES | YES |
| Satellite FE | NO | YES | YES | YES | YES | YES | YES |

Robust standard errors clustered by country. `*** p<0.01, ** p<0.05, * p<0.1`.
N = 5,258 region-years; 1,504 regions.

## 6. Provenance

`data/Table_1_data.csv` is trimmed from `Data/Prediction_Data.dta`, which is
produced by the `00_Main_Dataset` pipeline (lights → pixel aggregation →
region/country merge). The country dummies (`country_dum1`–`country_dum81`) and
satellite dummies (`satyear_1`–`satyear_7`) are pre-built in that pipeline and
shipped in the CSV. To rebuild after a new lights dataset, re-run that pipeline
and re-extract this CSV.

## 7. Cross-language comparison (Stata · R · Python)

The same table is reproduced in three languages from the **same**
`data/Table_1_data.csv`:

| File | Tool | Estimator |
|---|---|---|
| `Table_1.do` | Stata | `xtreg` (random effects) for cols 1, 3–7; `reg` with region FE for col 2; cluster by `Country_ISO` |
| `Table_1.R` | R | `xtreg_re()` — a faithful Swamy-Arora GLS re-implementation of `xtreg, re` for the RE cols; `fixest::feols(… \| code_Coutry_Region)` for col 2 |
| `Table_1.py` | Python | `linearmodels.RandomEffects` for the RE cols; `linearmodels.PanelOLS(EntityEffects)` for col 2 |

Run them with `do Table_1.do`, `Rscript Table_1.R`, `python Table_1.py`.

**Headline coefficient — `log_Light_ppix_Region` across the 7 columns (all executed):**

| Column | Stata (committed) | R (Swamy-Arora) | Python (linearmodels) |
|---|---|---|---|
| (1) RE, no FE | 0.399 | 0.399 | 0.399 |
| (2) region FE + sat FE | 0.190 | 0.190 | 0.190 |
| (3) country FE + sat FE | 0.153 | 0.153 | 0.153 |
| (4) (3) + national GDP pc | 0.122 | 0.122 | 0.123 |
| (5) country-group FE + sat FE | 0.232 | 0.232 | 0.232 |
| (6) (5) + national GDP pc | 0.104 | 0.104 | 0.104 |
| (7) prediction model | 0.102 | 0.102 | 0.102 |
| (7) `log_GDP_pc_Country` | 0.889 | 0.889 | 0.889 |
| N (region-years) | 5,258 | 5,258 | 5,258 |
| Regions | 1,504 | 1,504 | 1,504 |

**Notes (tolerance + differences):**
- All three agree to **3 decimals** on every reported coefficient. The only
  visible rounding difference is column (4), where Python rounds to 0.123 and
  Stata/R to 0.122 (raw values 0.12252 vs 0.12237 — a 0.00015 gap).
- These sub-0.001 gaps are expected: the random-effects **variance-component
  estimators differ slightly** across implementations (Stata `xtreg, re`,
  Python `linearmodels.RandomEffects`, and this R Swamy-Arora step all estimate
  σ²_u / σ²_e on marginally different degrees-of-freedom conventions), which
  perturbs the GLS weight θ and hence the slopes at the 4th decimal.
- **Why R does not use `plm(model="random")`.** plm's RE cannot invert its
  variance-component system when **time-invariant regressors** are present
  (the 81 country dummies in cols 3–4, the World Bank group dummies in cols
  5–7), erroring with *"system is exactly singular."* Stata and `linearmodels`
  carry such regressors (they enter only the between part). `Table_1.R` therefore
  uses an explicit Swamy-Arora GLS routine (`xtreg_re()`) that reproduces Stata's
  `xtreg, re` to 3+ decimals — see the in-script comment for the 5-step recipe.
- **Collinear country dummies.** The 81 `country_dum*` columns sum to 1 in every
  row (all 81 countries present), so with the intercept they are perfectly
  collinear; Stata silently omits one. R and Python both drop `country_dum81`
  (ZAF) to obtain an identical full-rank design.
- **Column (2) N.** Stata's region-FE `reg` reports N = 5,258; R's `fixest`
  removes 42 singleton regions for the slope (N = 5,216 in the fit) but returns
  the **identical** coefficient 0.190. Python's `PanelOLS(EntityEffects)` keeps
  all rows and also returns 0.190.
- The Stata column is taken from the committed `expected/Table_1.txt` (Stata is
  not executed in this build environment); R and Python were run here and their
  numbers written to `output/Table_1_results_R.csv` / `_py.csv`.
