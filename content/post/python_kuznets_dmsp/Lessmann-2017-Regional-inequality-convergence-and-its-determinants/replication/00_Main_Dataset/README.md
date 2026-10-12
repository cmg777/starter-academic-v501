# 00 · Main Dataset pipeline — nighttime lights → predicted GDP → inequality

This folder **regenerates the master analysis dataset** of Lessmann & Seidel
(2017) from the raw nighttime-lights panels. It is the single most important
folder for **future extensions**: when you obtain a new nighttime-lights
product, you re-run this pipeline (editing only `config.do`) to produce an
updated `Main_Data`, and the table/figure folders can then be refreshed from it.

> **Software:** Stata 13+ · R · Python.
> **One required package:** `ssc install ineqdeco`

---

## 1. What the pipeline does

```
            Prediction_Data.csv                Regional_Data_SL.csv
        (regions WITH observed GDP)            (ALL world regions)
                    │                                   │
        ┌───────────▼───────────┐                       │
        │ STEP 1  estimate       │  coefficients         │
        │ log GDP ~ log lights   ├──────────────────────▶│  apply coefficients
        │ + controls (Table 1.7) │                       │
        └────────────────────────┘                       ▼
                                              pred_GDP_pc_Region.csv
                                              (predicted GDP for every region)
                                                          │
                                          STEP 2  population-weighted
                                          inequality per country-year
                                                          ▼
                                              Inequality_Data.csv
                                                          │
                Country_DATA.csv ───────── STEP 3  merge ─┤
                (country controls)                        ▼
                                                   Main_Data.csv  ← final output
```

| Step | Script | Does | Output |
|---|---|---|---|
| 1 | `01_predict_gdp.do` | Estimate the lights→GDP model (Table 1 col 7) on the observed-GDP subsample; predict regional GDP for the training sample **and** the whole world | `output/pred_GDP_pc_Region_G.csv`, `output/pred_GDP_pc_Region.csv` |
| 2 | `02_inequality_indices.do` | For each country-year, compute 5 population-weighted inequality indices of predicted regional income | `output/Inequality_Data.csv` |
| 3 | `03_merge_controls.do` | Merge inequality with country controls | `output/Main_Data.csv` + `.dta` |
| — | `00_run_all.do` | Runs steps 1→3 in order | all of the above |
| — | `config.do` | **The only file you edit for new data** | (macros) |

---

## 2. How to run

1. In Stata, `cd` into this folder:
   `cd ".../replication/00_Main_Dataset"`
2. Install the package once: `ssc install ineqdeco`
3. `do 00_run_all.do`

Outputs appear in `output/`. Step 2 is slow (one `ineqdeco` call per
country-year). The data here is **self-contained** — no internet, no other
folders required.

---

## 3. Re-running on a NEW nighttime-lights dataset (the extension workflow)

Everything that could change for a new lights product is a macro in `config.do`:

| Macro | Meaning | Typical edit for new data |
|---|---|---|
| `F_TRAIN`, `F_WORLD`, `F_COUNTRY` | the three input CSVs | point to your new files |
| `LIGHTS` | the lights regressor column | rename if your lights variable differs |
| `X_CORE`, `X_INTER`, `FE_SAT`, `FE_GROUP`, `DEPVAR` | the prediction model | add/drop a control here only |
| `WORLD_INTER` | the interaction's name in the world file | reconcile a naming mismatch |
| `INEQ_VAR`, `INEQ_WEIGHT`, `INEQ_GROUP` | what inequality is measured, weighted by, grouped by | usually unchanged |

The stage scripts **loop over these macros**, so adding a control to `X_CORE`
needs no other change — the prediction and storage code adapt automatically.
Requirements for a drop-in lights dataset: the lights column must exist in both
`F_TRAIN` and `F_WORLD`; the world file's region-group dummies must cover the
groups in `FE_GROUP` (with the same omitted base, USA/Canada).

---

## 4. Data dictionary

CSV columns lose Stata's variable labels, so they are documented here (and in
`data_dictionary.csv`). All monetary values are **PPP, constant 2005 US$**.
Variable *sources* are listed in the paper's *Appendix B* (`../../Appendix B Sources.pdf`).

### 4a. `data/Prediction_Data.csv` — TRAINING set (regions with observed GDP)
5,258 region-years; 1,504 regions in 81 countries (Gennaioli et al. 2014 sample).

| Variable | Label / meaning |
|---|---|
| `Region_NAME`, `Country_NAME` | region / country name |
| `Country_ISO` | country code, ISO 3166-1 alpha-3 |
| `id_t_j` | country-year id (used to aggregate regions → country) |
| `code_Coutry_Region` | numeric region id (the panel unit; original spelling kept) |
| `year` | year |
| `Pop_Region`, `Pop_Country` | regional / country total population |
| `GDP_pc_Region` | **observed** regional GDP per capita (the prediction target, in levels) |
| `log_GDP_pc_Region` | log observed regional GDP per capita = **dependent variable** |
| `log_Light_ppix_Region` | **log average nighttime light per pixel** = the key regressor |
| `log_GDP_pc_Country` | log observed national GDP per capita (control) |
| `log_N_pix_top_cod_1_ppix` | log number of *top-coded* (saturated) light pixels |
| `log_N_pix_low_cod_1_ppix` | log number of *low-coded* (unlit) pixels |
| `log_area` | log region area |
| `log_region` | log number of subnational regions in the country |
| `log_region_X_log_area` | interaction `log_region × log_area` |
| `eap eca lac mena sa ssa` | World-Bank region-group dummies (USA & Canada = omitted base) |
| `satyear_1` … `satyear_7` | satellite-generation fixed-effect dummies (original `_satyear_*`) |

### 4b. `data/Regional_Data_SL.csv` — WORLD set (all regions, predict here)
69,737 region-years. Same variables as above **except**: no observed `GDP_pc_Region`;
adds `Region_ISO` (region code), `n_Region`, `Pix_Country`, a `na` (North America)
group dummy, and names the interaction `log_region_log_area` (no `_X_`).

### 4c. `data/Country_DATA.csv` — country-level controls
6,904 country-years.

| Variable | Label / meaning |
|---|---|
| `Country_NAME`, `Country_ISO`, `year` | identifiers |
| `fedelupd2` | federal-state dummy |
| `GINIW_Eth_light` | ethnic inequality (population-weighted light Gini) |
| `Giniall` | interpersonal income Gini |
| `price_gasoline` | pump price for gasoline (PPP const 2005 US$/litre) |
| `Trade_GDP_share` | trade (% of GDP) |
| `Arable_land` | arable land (share of land area) |
| `Resources_rents_share_of_GDP` | total natural-resource rents (% of GDP) |
| `School_enrollment_secondary` | secondary school enrollment (% gross) |
| `Aid` | aid flows (constant 2011 US$) |
| `FDI_share_of_GDP` | foreign direct investment, net inflows (% of GDP) |
| `GDP_pc_Country` | national GDP per capita (PPP const 2005 US$) |
| `area` | area (sq. km) |
| `Polity2` | Polity IV Polity2 index |

### 4d. Key OUTPUT variables (built by the pipeline)
| Variable | Meaning |
|---|---|
| `pred_GDP_pc_Region` | **predicted** regional GDP per capita (levels) |
| `pred_GDP_pc_Country` | predicted national GDP per capita (aggregated) |
| `GDP_pc_Country_G` | observed national GDP for the Gennaioli training countries (else missing) |
| `GINIW_pred_GDP_pc` | population-weighted **Gini** of predicted regional income |
| `GE_m1W_pred_GDP_pc` | generalized entropy GE(−1) |
| `GE_0W_pred_GDP_pc` | mean log deviation, GE(0) |
| `GE_1W_pred_GDP_pc` | Theil index, GE(1) |
| `COVW_pred_GDP_pc` | coefficient of variation = √(2·GE(2)) |

---

## 5. Methods, in plain terms

- **`xtreg … , re`** — a random-effects panel regression. It uses the variation
  both across regions and over time to relate log regional GDP to log lights and
  controls. We only need its coefficients (the "recipe") to predict income
  elsewhere; clustering the standard errors by country affects the reported
  precision, not the prediction recipe.
- **Prediction = b′x** — predicted log income is the sum of each coefficient
  times its variable, plus the constant. We exponentiate to get income levels.
- **Population-weighted inequality (`ineqdeco`)** — measures how unequal income
  is *across regions within a country*, giving bigger regions more weight. Five
  complementary indices are reported because each is sensitive to inequality in a
  different part of the distribution (e.g. GE(−1) to the poor tail, CV to the
  rich tail).

---

## 6. Differences from the original `Generation_Main_Dataset.do`

All produce the same numbers; the rewrite is for clarity and extensibility.

1. **Config-driven**: the model and file paths are macros in `config.do`, not
   hard-coded throughout.
2. **Looped coefficient handling**: the original hand-wrote 23 `gen beta_k=_b[…]`
   lines and a long linear-combination formula; we loop over the model macros.
3. **Modern merge**: `merge 1:1 …, keep(match) nogenerate` replaces the
   pre-Stata-11 `merge … using, unique` + `keep if _merge==3`.
4. **Single inequality loop**: one `ineqdeco` pass harvests all five indices
   instead of five near-identical loops.
5. **Open formats**: inputs/outputs are CSV (plus a labelled `Main_Data.dta`).

### Known limitations
- The training/world inputs here are **trimmed** to the columns the pipeline
  needs. A few raw columns used only by individual validation figures (e.g.
  `RPP`, `Light_Region`) are *not* in these trimmed inputs — those figures ship
  their own complete data in their own folders.
- `GDP_pc_Country_G` is recovered as `exp(log_GDP_pc_Country)` on the training
  sample (numerically identical to the observed level).

---

## 7. Cross-language comparison (Stata · R · Python)

The whole pipeline is also provided in R and Python from the **same** inputs:

| File | Tool | Prediction estimator | Inequality |
|---|---|---|---|
| `00_run_all.do` (+ stages) | Stata | `xtreg, re` | `ineqdeco [aw=Pop_Region]` |
| `run_all.R` | R | `plm(model="random")` | weighted Gini/GE/CV from first principles |
| `run_all.py` | Python | `linearmodels.RandomEffects` | weighted Gini/GE/CV (numpy) |

Run with `do 00_run_all.do`, `Rscript run_all.R`, `python run_all.py`. R and
Python write `output/Main_Data_R.csv` / `output/Main_Data_py.csv`.

**Spot-checks (R and Python executed here; Stata = the committed build):**

| Quantity | Stata | R (plm) | Python (linearmodels) |
|---|---|---|---|
| β on log nighttime lights (Table 1 col 7) | 0.102 | 0.1018 | 0.1019 |
| β on log national GDP p.c. | 0.889 | 0.8896 | 0.8895 |
| Country-years in `Main_Data` | 3,675 | 3,675 | 3,675 |
| GINIW (Germany, 2010) | 0.0246 | 0.0247 | 0.0246 |

**Notes (tolerance + differences):**
- Across all 3,675 country-years, the pipeline's GINIW **correlates 1.0000** with
  the Stata-built `Main_Data` (mean absolute difference ≈ 3×10⁻⁵).
- The tiny deviations come only from the random-effects variance-component
  estimator differing slightly between Stata `xtreg, re`, R `plm`, and
  `linearmodels` — this shifts the predicted incomes by a hair, which propagates
  to the inequality indices. Point estimates and the whole map of results are
  effectively identical.
- The weighted Gini, GE(−1), MLD, Theil and CV all reproduce `ineqdeco`. (Use
  the pairwise difference |yᵢ − yⱼ| in the Gini, not a product — a subtle trap.)
- Stata is not executed in this environment; R/Python numbers are in
  `output/Main_Data_results_R.csv` / `_py.csv`.
