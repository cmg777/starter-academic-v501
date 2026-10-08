# Synthetic replication dataset — Heger & Neumayer (2019)

A **synthetic, teaching-oriented** dataset that mirrors the data used in:

> Heger, M. P., & Neumayer, E. (2019). *The impact of the Indian Ocean tsunami
> on Aceh's long-term economic growth.* **Journal of Development Economics, 141,
> 102365.** https://doi.org/10.1016/j.jdeveco.2019.06.008

> ⚠️ **These numbers are simulated, not real.** The paper's underlying micro-data
> (World Bank **INDO-DAPOER** GDP, **DMSP-OLS** night lights, and the tsunami
> inundation maps) are licensed/confidential. This dataset is *calibrated* so
> that re-running the paper's regressions on it reproduces the paper's
> **findings** — the signs, the statistical significance, and the approximate
> magnitudes of the key coefficients. Use it to **teach the methods**, not to
> draw conclusions about Aceh.

---

## 1. What the paper does (in brief)

On 26 December 2004 the Indian Ocean tsunami devastated the Indonesian province
of **Aceh**, which then received the single largest reconstruction effort ever
directed at a developing-world disaster (USD 7.7 bn). Heger & Neumayer exploit
the *unexpected* geography of the flooding as a **quasi-natural experiment** and
ask whether the disaster-plus-aid shock raised or lowered Aceh's long-run output.

They use two causal-inference tools at **two geographic levels**:

| Level | Unit | Outcome | Source | Used for |
|---|---|---|---|---|
| District | Kabupaten/Kota | Real GDP (oil & gas excluded) | INDO-DAPOER | Main DiD + synthetic control |
| Sub-district | Kecamatan | Night-lights luminosity | DMSP-OLS | Flood-intensity (dose-response) DiD |

Headline result: flooded units **lost** output in 2005 but, thanks to the
reconstruction boom, ended on a **permanently higher** growth path than their
non-flooded counterfactuals ("sustainable recovery beyond the counterfactual
trend").

---

## 2. The two data files

| File | Grain | Rows | Units | Years |
|---|---|---|---|---|
| `aceh_tsunami_district_panel.csv` | district × year | 1,750 | 125 districts | 1999–2012 |
| `aceh_tsunami_subdistrict_panel.csv` | kecamatan × year | 3,864 | 276 kecamatans | 1999–2012 |

Each has its own dictionary: `aceh_tsunami_district_data_dictionary.csv` and
`aceh_tsunami_subdistrict_data_dictionary.csv`.

### Regional units (and how they map to the paper)

**Districts — 125 on Sumatra:**
- **Aceh — 23**: **10 flooded (treated)** + **13 non-flooded (control)**.
- **North Sumatra — 26**: **2 flooded** barrier islands (Nias, Tanahbala) + 24
  controls (enter only in the Table 5 robustness check).
- **Rest of Sumatra — 76**: controls across 8 provinces (West Sumatra, Riau,
  Riau Islands, Jambi, Bengkulu, South Sumatra, Bangka-Belitung, Lampung).

**Sub-districts — 276 kecamatans in Aceh**: **68 flooded + 208 non-flooded**
(matches the paper's Table 1).

These allocations are not arbitrary — they reproduce the paper's reported
**sample sizes** (growth rates span 13 years, 2000–2012; the non-flooded Aceh
district **Subulussalam** has missing growth for 2003–2006, per the paper's
footnote 3, so it contributes −4 observations wherever it appears):

| Paper table | Control pool | N (paper) | N (here) |
|---|---|---|---|
| Table 2 col 1 | Aceh + Rest of Sumatra (99 districts) | 1283 | 99·13 − 4 = **1283** |
| Table 2 col 2 | Rest of Sumatra (86) | 1118 | 86·13 = **1118** |
| Table 2 col 3 | Aceh only (23) | 295 | 23·13 − 4 = **295** |
| Table 5 col 1 | all 125 districts | 1621 | 125·13 − 4 = **1621** |
| Table 5 col 3 | Aceh + North Sumatra (49) | 633 | 49·13 − 4 = **633** |

The **city/rural** split also matches Table 7 (2 flooded Kota + 8 flooded
Kabupaten in Aceh ⇒ 3 non-flooded Aceh Kota, 10 non-flooded Aceh Kabupaten;
18 Kota + 58 Kabupaten in the rest of Sumatra).

---

## 3. How the data was constructed

The core trick is to **generate growth rates, then cumulate them into levels**,
so that growth and levels are mutually consistent and a fixed-effects DiD
recovers exactly what we put in.

**District GDP growth** for district *i* in year *t*:

```
gdp_growth[i,t] = district_FE[i] + year_FE[t]
                + treatment_increment(i, period)      # treated: by city/rural
                + control_spillover(i, period)        # non-flooded Aceh only
                + spatial_shock[i,t]                  # nearby districts co-move (Conley)
                + serial_shock[i, period]             # persists within a period (HAC)
                + idiosyncratic_noise
```

We reproduce the paper's **heterogeneity** directly rather than imposing one
pooled effect (all increments are relative to the 2000–2002 baseline):

- **City vs rural treated** (from the paper's **Table 7, col 2**): the 2 flooded
  *Kota* and 8 flooded *Kabupaten* get different increments. Because the pool is
  2 city + 8 rural, the population-weighted average reproduces **Table 2** exactly:

  | Period | City (Kota) | Rural (Kabupaten) | Pooled = Table 2 |
  |---|---|---|---|
  | 2003–04 | +0.007 | +0.024 | **+0.020** |
  | 2005 | −0.015 | −0.098 | **−0.081** |
  | 2006–08 | +0.139 | +0.045 | **+0.059** |
  | 2009–12 | +0.000 | +0.015 | **+0.010** |

- **Reconstruction spill-over** to *non-flooded Aceh* control districts (larger
  inland than coastal), so the "Aceh non-flooded" columns of Tables 2/6/8
  attenuate exactly as the paper finds (e.g. Table 2 col 3 recovery ≈ +0.030,
  half of col 1's +0.059).
- **North-Sumatra islands** (Nias/Tanahbala, also hit by the March-2005 Nias
  earthquake): a larger 2005 loss and no reconstruction boom (Table 5).

A two-way (district + year) fixed-effects regression of growth on `flooded ×
period` differences these out, so the estimated coefficients come back **≈ the
paper's reported values, column by column**. Levels are then
`GDP[t] = GDP[1999] · Π(1 + growth)`.

**Standard errors.** The paper reports **Conley spatial-HAC** SEs (serial
correlation within a district + contemporaneous spatial correlation ≤100 km).
Two error components make those SEs behave like the paper's: a *spatial* shock
(nearby districts co-move within a year → Conley SE > naive) and a *serial*
shock (one draw per district per period, shared across that period's years →
the multi-year recovery SE is as large as the one-year 2005 SE). Both are
**demeaned within treatment/control groups**, so they inflate the standard
errors *without moving the calibrated point estimates*, and both use their own
RNGs so the night-lights/structural results are untouched. `data_prep.did_estimate`
and `replication/06_…` compute the Conley-HAC SE explicitly.

**Population and GDP per capita (Table 8).** Population is cumulated the same
way, but flooded districts get a one-off **−9.6%** shock in 2005 (the casualties)
and grow ~1.9 pp slower in 2006–2008. Since `gdp_pc_growth = gdp_growth −
pop_growth`, this **simultaneously** reproduces Table 8: *no* significant
per-capita loss in 2005 (GDP and population fall together) and a significant
per-capita **gain** in 2006–2008 (fewer people sharing the rebuilt economy).

**Night-lights intensity (Tables 3–4).** Drawn from their **own RNG** (so the
sub-district draw can be calibrated independently of the GDP panel). Each flooded
kecamatan gets a latent **flood "dose"** in (0, 1], right-skewed so most are
lightly hit and a few devastated. Night-lights growth carries a per-period
increment proportional to **dose²** — the squaring concentrates the effect in the
worst-hit places, so only the **top intensity quintile** is significant (Table 4),
while the *continuous* regressors (`share_pop_flooded`, `share_area_flooded`) stay
linear in dose so **Table 3**'s coefficients land on the paper's values
(share-of-population recovery ≈ **+0.016\*\*\***, share-of-area ≈ **+1.75\*\*\***,
2005 weak/negative, pre & post ns). 2004 average luminosity matches Table 1
(flooded mean ≈ 5.28 / sd ≈ 8.87, non-flooded ≈ 2.30 / 4.33). A fixed number of
growth observations are dropped at random (sensor gaps) to hit the paper's
regression **N = 3,444**.

**Structural change & synthetic control (Figs 3–7).** Sectoral value-added
shares and capital formation are built from smooth **province-level** paths plus
district noise (so the province average returns the target). Aceh shows the
sharp post-2004 break the paper reports — agriculture 44→32%, manufacturing
6→3.5%, services 40→55%, and a capital-formation spike peaking in 2006 — while
donor provinces drift smoothly, so a province-level synthetic control recovers
the counterfactual. The covariates (`poverty_rate`, `doctors_per_1000`,
`water_access_pct`, `sanitation_access_pct`, `electricity_access_pct`, `hdi`)
are the synthetic-control predictors named in the paper's footnote 9.

---

## 4. Decisions & assumptions (what we chose and why)

- **Calibrated to the paper's actual numbers.** The data-generating process is
  tuned so the DiD coefficients, **column by column**, land close to the paper's
  reported values (signs, magnitudes within ≈0.005 on the headline cells, and the
  significance stars), and the standard errors match the paper's **Conley
  spatial-HAC** SEs (so e.g. the 2006–08 recovery effect is **\*\*** at 5%, not
  \*\*\*). The heterogeneity across columns (city vs rural, the Aceh-control
  spill-over, the North-Sumatra islands) is built in, not left to chance.
- **Real Aceh names; IDs elsewhere.** Aceh's 23 districts use real names with a
  realistic flood assignment; the ~100 control districts use real province names
  + systematic IDs (e.g. `RIAU_D05`) to avoid inventing inaccurate geography.
- **Years 1999–2012** for both panels (levels); growth rates 2000–2012.
- **Two files, two dictionaries** (per request).

### Known approximations (documented on purpose)
- **Sample sizes are exact.** The district taxonomy reproduces every reported
  N (Table 2 1283/1118/295; Table 5 1621/1144/633; Table 6 945/819/256; Table 7
  295/260/61 & 988/858/234; Table 9 1465/477; night-lights 3,444). One inland Aceh
  district is *counted* as coastal so Table 6's coastal sub-sample (256) matches —
  the paper's operational coast/inland split, not strict physical geography.
- **Two random seeds.** With only 10 treated districts the point estimates carry
  real sampling scatter, so the GDP seed (114) and the night-lights seed
  (24) were each chosen so this *one* realised sample sits closest to the
  paper across all tables. The error components are demeaned within groups, so the
  seed only nudges the idiosyncratic part; the structure is fixed by the DGP.
- **Conley spatial-HAC SEs**: both panels carry `latitude`/`longitude` (real
  centroids for Aceh, plausible-within-province elsewhere). A spatial shock and a
  serial shock — demeaned within groups, drawn from their own RNGs — reproduce the
  paper's SE pattern without disturbing the point estimates. See
  `replication/06_spatial_standard_errors.py`.
- **"Aceh non-flooded" columns are imprecise.** With the same 10 treated units
  across columns, the synthetic Conley-HAC SE is similar in every column, whereas
  the paper's Aceh-only columns (Tables 2/6/8 col 3) have smaller SEs (higher R²);
  there the *point* estimates match but the column-3 recovery effect can read as
  insignificant. The **2-district city columns** of Table 7 are likewise imprecise
  (few clusters), exactly as the paper cautions.
- **Night-lights quintiles (Table 4)**: the paper's Table 4 magnitudes (Q5 ~0.38)
  are on a scale inconsistent with its own Table 3 (~0.016) — no single process
  reproduces both. We match Table 3 exactly and Table 4's **pattern** (only the
  top quintile significant), at the Table-3-consistent magnitude.
- **GDP scale/currency**: absolute level chosen for realistic per-capita figures;
  growth-rate results are scale-free.

---

## 5. Files & how to regenerate

```
generate_synthetic_data.py                      # this generator (numpy + pandas)
aceh_tsunami_district_panel.csv                 # district × year GDP panel
aceh_tsunami_district_data_dictionary.csv       # dictionary for the above
aceh_tsunami_subdistrict_panel.csv              # kecamatan × year night-lights panel
aceh_tsunami_subdistrict_data_dictionary.csv    # dictionary for the above
README.md                                       # this file
```

Environment: the generator needs only `numpy` + `pandas` (and `statsmodels` for
the optional `--validate` self-check). If your system Python cannot install
them, create a throwaway environment, e.g. with [uv](https://docs.astral.sh/uv/):

```bash
uv venv --python 3.13 .venv
uv pip install --python .venv/bin/python numpy pandas statsmodels
```

Regenerate (deterministic; fixed seed):

```bash
python generate_synthetic_data.py            # writes the 5 data/doc files
python generate_synthetic_data.py --validate # also prints recovered vs target coefficients
```

---

## 6. Variable reference — district panel (`aceh_tsunami_district_panel.csv`)

| Variable | Role | Units | Description |
|---|---|---|---|
| `district_id` | identifier | string | Unique identifier for the district (Kabupaten/Kota). |
| `district_name` | identifier | string | Name of the district. Real names for Aceh's 23 districts; systematic placeholders elsewhere. |
| `province` | identifier | string | Indonesian province the district belongs to. |
| `region_group` | identifier | {Aceh, North Sumatra, Rest of Sumatra} | Coarse grouping used to build estimation samples. |
| `district_type` | covariate | {Kota, Kabupaten} | Kota (urban city district) vs Kabupaten (rural regency). |
| `coastal` | covariate | 0/1 | 1 if the district lies on the coast, 0 if inland. |
| `flooded` | treatment | 0/1 | Treatment indicator: 1 if the district was flooded by the 2004 tsunami. |
| `neighbour_of_flooded` | treatment | 0/1 | 1 if a non-flooded district borders a flooded one (placebo-treated in Table 9). |
| `flood_treatment_group` | identifier | category | Readable label combining treatment status and region. |
| `latitude` | identifier | degrees | District-centroid latitude (decimal degrees, +N). |
| `longitude` | identifier | degrees | District-centroid longitude (decimal degrees, +E). |
| `year` | identifier | year | Calendar year of the observation. |
| `post` | derived | 0/1 | 1 for years 2005 and later. |
| `period` | derived | category | Event-time period used for the staggered DiD dummies. |
| `gdp_const_usd_m` | outcome | million constant 2004 USD | District real GDP excluding oil & gas, constant 2004 USD, millions. |
| `gdp_growth` | outcome | proportion/yr | Annual growth rate of real GDP (log difference). |
| `population` | covariate | persons | District population (persons). |
| `pop_growth` | derived | proportion/yr | Annual population growth rate. |
| `gdp_pc_usd` | outcome | constant 2004 USD | Real GDP per capita, constant 2004 USD. |
| `gdp_pc_growth` | outcome | proportion/yr | Annual growth rate of real GDP per capita. |
| `va_agri_share` | outcome | % of GDP | Agriculture value added as % of GDP. |
| `va_manu_share` | outcome | % of GDP | Manufacturing value added as % of GDP. |
| `va_serv_share` | outcome | % of GDP | Services / tertiary value added as % of GDP. |
| `capital_formation_pc_usd` | outcome | current USD per capita | Gross capital formation per capita, current USD. |
| `poverty_rate` | covariate | % | Share of population below the poverty line. |
| `doctors_per_1000` | covariate | per 1,000 | Physicians per 1,000 people. |
| `water_access_pct` | covariate | % | % of households with clean-water access. |
| `sanitation_access_pct` | covariate | % | % of households with sanitation access. |
| `electricity_access_pct` | covariate | % | % of households with electricity. |
| `hdi` | covariate | index 0-100 | Human Development Index (0-100 scale). |

## 7. Variable reference — sub-district panel (`aceh_tsunami_subdistrict_panel.csv`)

| Variable | Role | Units | Description |
|---|---|---|---|
| `kecamatan_id` | identifier | string | Unique identifier for the sub-district (Kecamatan). |
| `kecamatan_name` | identifier | string | Readable name linking the kecamatan to its parent district. |
| `district_name` | identifier | string | Aceh district the kecamatan belongs to. |
| `province` | identifier | string | Always Aceh (night-lights analysis is Aceh-only). |
| `flooded` | treatment | 0/1 | 1 if the kecamatan was flooded by the tsunami. |
| `share_pop_flooded` | treatment | 0-1 | Share of the kecamatan's population in flooded area (exogenous dose). |
| `share_area_flooded` | treatment | 0-1 | Share of the kecamatan's physical area that was flooded (exogenous dose). |
| `flood_intensity_quintile` | treatment | 0-5 | Quintile (1-5) of the flooding-intensity distribution among flooded units. |
| `area_km2` | covariate | km^2 | Approximate land area of the kecamatan. |
| `n_pixels` | covariate | count | Number of ~0.86 km^2 night-light grid cells in the kecamatan. |
| `latitude` | identifier | degrees | Kecamatan-centroid latitude (decimal degrees, +N). |
| `longitude` | identifier | degrees | Kecamatan-centroid longitude (decimal degrees, +E). |
| `year` | identifier | year | Calendar year of the observation. |
| `post` | derived | 0/1 | 1 for years 2005 and later. |
| `period` | derived | category | Event-time period for the staggered DiD dummies. |
| `avg_luminosity` | outcome | DN (0-63) | Mean Digital Number (brightness) across the kecamatan's pixels. |
| `nl_sum` | outcome | DN-sum | Sum of Digital Numbers over all pixels in the kecamatan. |
| `nl_log` | outcome | log DN-sum | log( sum of (DN + 0.001) ) -- the transformed regression variable. |
| `nl_growth` | outcome | proportion/yr | Annual growth rate of log night-lights (log difference). |

---

## 8. Reproducing the paper, table by table

| Paper object | Method on this data |
|---|---|
| **Table 1** | Group `avg_luminosity` (year 2004) by `flooded`; report mean/SD/min/max. |
| **Table 2** | OLS of `gdp_growth` on `flooded×period` dummies + district & year FE; cluster by district. Control pools via `region_group`. |
| **Table 3** | OLS of `nl_growth` on `flooded×period` (and on `share_pop_flooded×period`, `share_area_flooded×period`) + kecamatan & year FE. |
| **Table 4** | OLS of `nl_growth` on `flood_intensity_quintile×post` dummies + kecamatan & year FE. |
| **Table 5** | Table 2 spec including North Sumatra (`region_group != 'Rest of Sumatra'` for the red pool, etc.). |
| **Table 6** | Table 2 spec restricted to `coastal == 1`. |
| **Table 7** | Table 2 spec split by `district_type` (Kota vs Kabupaten). |
| **Table 8** | Table 2 spec with `gdp_pc_growth` as the outcome. |
| **Table 9** | Drop `flooded == 1`; placebo-treat `neighbour_of_flooded == 1`; run the Table 2 spec. |
| **Figs 2–3** | Plot mean `gdp_const_usd_m` (indexed to 2004) for treated vs controls; synthetic control of treated-Aceh GDP on rest-of-Sumatra donors. |
| **Figs 4–7** | Aggregate `va_*_share` and `capital_formation_pc_usd` to the province level; province synthetic control of Aceh vs other provinces. |

*Generated by `generate_synthetic_data.py` (seed 114).*
