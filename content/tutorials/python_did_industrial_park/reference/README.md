# Synthetic replication dataset — Huang, Wang & Xu (2026)

A **synthetic, teaching-oriented** dataset that mirrors the data used in:

> Huang, G., Wang, M., & Xu, H. (2026). *The socioeconomic impacts of industrial
> parks in Ethiopia.* **Journal of Urban Economics.**
> https://doi.org/10.1016/j.jue.2026.103867

> WARNING: **These numbers are simulated, not real.** The paper's underlying data
> are licensed/confidential and assembled from many sources — harmonized
> **DMSP-OLS / VIIRS nighttime lights** (Chen et al. 2020), the **GISD30**
> impervious-surface product (Zhang et al. 2021), the **Ethiopia DHS**
> (2000-2019), the **2007 Population & Housing Census** (official tabulations +
> IPUMS microdata), **SRTM** elevation/slope, **gROADS** road density, and the
> **EIC/IPDC** industrial-park list with **propensity-score-matched** control
> woredas. This dataset is *calibrated* so that re-running the paper's
> regressions on it reproduces the paper's **findings** — the signs, the
> statistical significance (stars), and the approximate magnitudes of the key
> coefficients. Use it to **teach the methods**, not to draw conclusions about
> Ethiopia.

---

## 1. What the paper does

On a **staggered** rollout (2008-2021) the Ethiopian government opened **22
industrial parks across 18 districts (woredas)**; the paper studies their causal
effect on local economic activity, urbanization, household living standards, and
women's empowerment. The design is a **difference-in-differences** comparing
**17 treated woredas** (those that host a park) with **122 never-treated control
woredas** selected by **propensity-score matching** within 100 km of a park.

Three data layers (Eqs. 1-2):

| Level | Unit | Outcomes | Source | Tables |
|---|---|---|---|---|
| District | woreda x year (2005-2020) | nighttime light, impervious ratio | harmonized NTL, GISD30 | 1-4, A4-A12, Fig. 1 |
| Household | DHS round (2000-2019) | durable goods, housing quality, wealth | Ethiopia DHS | 5, Fig. 2 |
| Individual | DHS round (2000-2019) | non-ag employment, women's empowerment | Ethiopia DHS | 6-7, A15-A16, Fig. 3 |

**Headline results.** A park raises nighttime light by ~21% (IHS 0.214, raw
1.276) and the impervious-surface ratio by ~3 pp, with **no spillover** to nearby
districts; effects are larger near cities and with denser roads; households gain
durables/housing/wealth; and **women's** non-agricultural employment rises 13 pp,
lifting their decision-making power and savings and reducing acceptance of
domestic violence.

---

## 2. The three data files

| File | Grain | Rows | Units | Periods |
|---|---|---|---|---|
| `data/industrial_park_district_panel.csv` | woreda x year | 2,224 | 139 woredas | 2005-2020 (annual) |
| `data/industrial_park_household_rcs.csv` | DHS household | 13,200 | repeated cross-section | 2000/2005/2011/2016/2019 |
| `data/industrial_park_individual_rcs.csv` | DHS individual | 17,900 | repeated cross-section | 2000/2005/2011/2016/2019 |

Each has its own dictionary in `reference/`:
`industrial_park_district_panel_data_dictionary.csv`,
`industrial_park_household_rcs_data_dictionary.csv`,
`industrial_park_individual_rcs_data_dictionary.csv`.

- **17 treated + 122 control woredas** = 139; annual 2005-2020 (16 years) =>
  **2,224 district rows**. Impervious surface is observed only at
  2005/2010/2015/2020 => **556 non-null**.
- Treatment cohorts (Appendix Table A1): `2008:1, 2014:2, 2015:2, 2016:3,
  2017:3, 2018:2, 2019:2, 2020:2` (the 2008 Eastern Industrial Park anchor plus
  the 2014-2020 IPDC build-out), so every event time k in [-5,+5] has >=3 treated
  districts.
- The DHS rounds are a **repeated cross-section** (different respondents each
  round, no panel key). The same `district_id -> open_year` map links the RCS to
  the district panel; in RCS `treatment` = district treated AND round >= open
  round, with the **modal treated district first treated in the 2016 round**
  (phase 0), giving phases {-3,-2,-1,0,+1} across the five rounds.

---

## 3. How each ORIGINAL variable was built, and the synthetic mapping

**Treatment & PSM controls.** *Original:* the host woreda of each park (EIC/IPDC
list, Table A1) is treated from its first park's opening year; controls are
never-treated woredas within 100 km, matched on population density, urbanization,
employment, distance to Addis/nearest city, slope, and elevation (logit PSM ->
17 treated / 122 control). *Synthetic:* `treated`, `open_year`, `treatment`
encode the cohort design above; the 122 controls are spread across the treated
regions so each `region^year` cell has both treated and control support.

**Nighttime light** (`light_intensity`, `ihs_light`, `light_positive`).
*Original:* harmonized DMSP-OLS (2005-2012) + VIIRS (2013-2020) cross-sensor
calibrated to a VIIRS-like series (Chen et al. 2020), aggregated to the woreda.
*Synthetic:* a two-part DGP — an extensive margin (P(light>0) ~ 0.99 treated /
0.527 control) times a bright (treated) / dim (control) intensive base plus the
treatment ramp; `ihs_light = asinh(light_intensity)`. Treated park-cities are
modelled as **essentially always lit**: when a few treated district-years drew
`light==0` the `asinh(0)=0` holes carved a spurious dip into the IHS event study
(and added pre-period noise), so the treated extensive margin is set near 1.

**Impervious surface** (`impervious_ratio`). *Original:* GISD30 30-m impervious
land cover (Zhang et al. 2021), impervious area / woreda area, at 5-year steps.
*Synthetic:* base + treatment ramp + shared-urbanization trend, observed only
2005/2010/2015/2020.

**Geographic & socioeconomic controls.** *Original:* SRTM elevation/slope;
distances from woreda centroids; 2007-census urbanization/employment/population
density (official + IPUMS); gROADS-2008 road density; 2007-census
Christian/Amharic shares. *Synthetic:* drawn to match the **Table A3 Panel C**
treated/control means and SDs exactly; road densities and composition shares are
wide-spread draws used as heterogeneity moderators and trend interactions.

**Household DHS outcomes** (`durable_goods_pc`, `housing_quality`,
`wealth_index`). *Original:* durables per capita; an all-four-amenities housing
indicator; the standardized DHS wealth index (asset PCA). *Synthetic:* a
cross-sectional district + round FE design (continuous outcomes linear; binary
via a clipped linear probability), with `hh_size`/`age_head` mildly correlated
with treatment so the with/without-controls gap matches.

**Individual DHS outcomes** (`nonag_employment`, `decision_power`,
`savings_account`, `dv_accept`, `dv_*`). *Original:* employed-outside-agriculture
indicator; sole/joint say over five household decisions; savings-account
ownership; DV justified under >=1 of five conditions (plus the five components).
*Synthetic:* per-sex employment tau (female precise ***, male small ns) plus a
**district x round factor shock** that inflates the full-sample district-clustered
SE so the AVERAGE employment effect reads ns (the paper's central gender finding:
the average non-ag employment effect is null while the female effect is
significant); women-only empowerment outcomes via clipped LPMs.

---

## 4. How the data was constructed (the DGP)

**District light & impervious (Eq. 1).** The latent light is
`light = positive_dt x (base_d + region-year + theta_d*ramp(k) + phi_d*(year-2012)
+ spatial + serial + noise)`, where:

- `positive_dt` is a **stable demeaned-threshold** Bernoulli (district + common-
  year shocks demeaned within group) so P(light>0) hits ~0.99/0.527 and does not
  drift pre/post (a spurious extensive shift would inflate both the extensive
  coef and the IHS coef). Treated woredas are kept **essentially always lit**: a
  handful of treated `light==0` draws used to carve a visible non-monotone dip
  into the IHS event study (the `asinh(0)=0` holes), so removing them makes the
  event-study path **clean and monotone-ish** and the Sun-Abraham / Borusyak
  aggregates agree with TWFE-no-trends (~0.26);
- the **treated base is bright, the control base dim**, so the additive treatment
  effect `theta_d*ramp` produces a large RAW coefficient (~1.6) but a small
  IHS coefficient (~0.214) because `asinh(.)` compresses the bright treated tail;
  the brightness (`LIGHT_MED_TREATED`) is the knob that sets this IHS/raw split;
- `ramp(k) = 0.45 + 0.55*(1 - exp(-k/1.55))` for k >= 0 (a discrete opening jump
  growing to a plateau by k~5);
- `theta_d` is a **multi-channel linear function** of the moderators (distance to
  Addis/state capital/nearest city, primary/paved road density), with the
  coefficient vector found by a **numerical (damped-Newton) solver** so each
  single-moderator interaction regression (Tables 3-4) recovers its target slope;
- `phi_d*(year-2012)` is a **shared differential trend** proportional to
  (urbanization - mean); treated woredas have higher 2007 urbanization, so they
  trend up faster — the no-trends regression attributes this to treatment
  (0.265 / 1.723) while the **t x urbanization** trend interaction absorbs it,
  recovering the trend-adjusted effect (0.214 / 1.276). The impervious ratio uses
  the same shared trend (0.032 -> 0.028).

**RCS (Eq. 2).** Each record's outcome mean is
`a_district + b_round + kappa*X + tau*treatment_dt (+ per-sex for employment) + noise`.
District FEs are mean-balanced across treated/control (parallel baseline; Table A3
treated ~ control); round FEs capture secular DHS improvement. **Continuous**
outcomes (durables, wealth) are linear with noise SD matched to the reported
outcome SD. **Binary** outcomes (housing, employment, decision, savings, DV) are
drawn from a **clipped linear probability** `p = clip(a+b+kappa*X+tau*treat, 0.001,
0.999); y ~ Bernoulli(p)` — because the paper runs an **LPM**, the LPM coefficient
equals tau by construction. The decision (0.899 ceiling) and savings (0.063 floor)
means make clipping bias the coefficient, so tau is pre-compensated and verified.

**Honest standard errors.** A **spatial** shock (smooth lat/lon field, ~100 km
decay) and a **serial** shock (one draw per district x event-period) are
**demeaned within (treated x region)** groups and drawn from dedicated RNGs, so
they make the clustered / Conley-style SEs realistic **without moving the point
estimates**. For **employment**, a **district x ROUND factor shock**
(`loading_d * factor_r` + a small idiosyncratic part, overall mean-zero) is added
to the latent employment probability at FULL strength for men and a SMALL fraction
for women. Because it varies over survey rounds it is *not* absorbed by the
district fixed effect, and because it is perfectly correlated within a district
across rounds it strongly inflates the **full-sample district-clustered SE** — so
the average employment coefficient reads **ns** (paper: 0.110, t~1.2) while the
female-only coefficient, carrying little of the shock, stays precise (***).

**Cohort / event-time design.** District panel: event time k in [-5,+5] (annual);
RCS: phases in {-3,...,+1} over the five DHS rounds.

---

## 5. Decisions, assumptions & known approximations

- **RCS limitations.** No within-unit persistence (repeated cross-section, no
  household panel key); coarse event *phases* rather than annual event time; no
  household fixed effects.
- **LPM vs logit / clipping bias.** Binary outcomes use a clipped LPM to match the
  paper's LPM; the clipping bias is largest at the **savings floor** (mean 0.063)
  and the **decision ceiling** (mean 0.899), where tau is pre-compensated — the
  realised **decision mean (~0.88)** sits a touch below the paper's 0.899 because
  the ceiling caps the achievable effect.
- **Only 17 treated clusters.** With 17 treated woredas the point estimates carry
  real sampling scatter and a few effects are **borderline**. The full-sample
  employment coefficient is made cleanly **ns** (paper: 0.110, t~1.2) by the
  district x round factor shock (above). The trend-adjusted **raw**-light effect is
  larger than the paper's headline (~1.6 vs 1.276) and reads `***` rather than
  `**`: keeping the treated extensive margin near 1 (for a clean IHS event study)
  removes the zero-dilution that would otherwise pull the raw mean down, so the
  IHS coefficient (~0.214) lands on target while the raw coefficient sits high.
- **Light *levels* are not matched (bright-base device).** Reconciling the paper's
  IHS effect (0.214) with its raw effect (1.276) is only possible if the marginal
  effect operates at high light, so treated woredas carry an intrinsically bright
  district-fixed base (mean ~4–5) and controls a dim one (~0.1). This leaves every
  DiD coefficient untouched (the district FE absorbs the level) but means the
  treated/control *cross-sectional* light means are far apart — unlike the paper's
  PSM-matched 0.94/0.87. **Plot the parallel-trends/group-means EDA figure on
  baseline-normalized (indexed-to-pre-period) or IHS-demeaned light**, not raw
  levels, so the matched-then-diverge picture reads correctly. Likewise
  `light_positive` is ~1.0 for treated (treated woredas kept always-lit so the IHS
  event study is clean with only 17 clusters), vs the paper's 0.897 — the
  extensive-margin finding (effect is intensive, not extensive) still holds.
- **Heterogeneity (Tables 3-4)** is a **good but partial** match: the distance
  moderators are mutually correlated, so a single realised plateau cannot make all
  five interactions significant at once. With the numerically-solved plateau and
  the wide road densities, **all five interaction point estimates land on target
  with the correct sign**, and `dist_addis` (***), `dist_state_capital` (**),
  `dist_nearest_city` (***) and `paved_road` (**) are significant; the
  `primary_road` interaction is correctly-signed and on-magnitude but remains
  borderline (ns) — the 17-treated sample cannot make BOTH road interactions
  significant simultaneously. The `dist_addis` interaction MAIN term (~3.2) sits
  above the paper's 2.514.
- **Exact-match list** (asserted): all sample sizes (district 2,224; impervious
  556; durables 12,207; housing 12,206; wealth 9,688; employment 17,219 with F
  11,055 / M 6,164; decision 4,737; savings 11,155; dv 11,109), the dependent
  means, the Table A3 treated/control means/SDs/N, and the cohort years.
- **Approximate-match list:** the regression coefficients, standard errors,
  event-study shapes, and heterogeneity interactions (sign + significance +
  magnitude within ~0.02 on the headline cells).
- **Seed strategy.** A multi-RNG design isolates the structural DGP (ramps, FEs,
  tau) from the idiosyncratic noise. Seeds: district master 2026, RCS master
  1130, extensive-margin 370 (so P(light>0) hits ~0.99/0.527),
  spatial 71, serial 99 (chosen so the IHS event-study path
  is clean and the Sun-Abraham post-average ~0.26), road-density 26122559, and
  the employment district x round factor-shock offset 806 (chosen so
  the realised full/female/male employment estimates land on target with the right
  stars: full ns, female ***). Seeds only nudge the noise; the structure is fixed.

---

## 6. Reproducing the paper, table by table

| Paper object | Method on this data |
|---|---|
| **Table 1** | `pf.feols("ihs_light ~ treatment | district_id + region^year", vcov=CRV1)`; even cols add `t x baseline-char` trends; also `light_intensity`, `impervious_ratio`. |
| **Table 2** | Add `nearby` to the Table 1 spec; the `nearby` coef ~ 0 ns. |
| **Tables 3-4** | Add `treatment:<moderator>` (distance / road density) to the trend spec. |
| **Tables 5/6/7** | Weighted `pf.feols("<y> ~ treatment + <controls> | district_id + region_id^survey_round", weights="survey_weight", vcov=CRV1)` on the RCS files (employment split by `sex`). |
| **Table A4** | `light_positive` (extensive) and positive-only light (intensive). |
| **Table A6** | `pf.event_study(..., estimator="saturated")` (Sun-Abraham, aggregate post periods) and `estimator="did2s"` (Borusyak). |
| **Table A15** | RCS `dv_goingout ... dv_food`. |
| **Event studies** | District: event-time k in [-5,+5] dummies (Eq. 3); RCS: phase dummies. |

---

## 7. Variable reference — district panel

| Variable | Role | Units | Description |
|---|---|---|---|
| `district_id` | identifier | string | Unique identifier for the district (woreda). |
| `district_name` | identifier | string | District (woreda) name. Real-ish names for the 17 treated woredas (Table A1); systematic placeholders for controls. |
| `region` | identifier | string | Ethiopian regional state. |
| `region_id` | identifier | int | Integer code for the region (region-by-year FE key). |
| `treated` | treatment | 0/1 | 1 if the district ever hosts an industrial park. |
| `open_year` | treatment | Int (2008-2021) | Calendar year the district's first park opened (NaN for controls). |
| `treatment` | treatment | 0/1 | 1 if district is treated AND year >= open_year (Eq. 1 D_dt). |
| `nearby` | treatment | 0/1 | 1 if a control district is within 10 km of an operational park in that year (Table 2 spillover). |
| `event_time` | derived | Int [-5,5] | Years since opening, clipped to [-5,+5] (NaN for controls). |
| `year` | identifier | year | Calendar year (2005-2020). |
| `post` | derived | 0/1 | Equals the treatment indicator (1 once a district's park is open). |
| `light_intensity` | outcome | DN | Harmonized nighttime-light digital number (raw luminosity). |
| `ihs_light` | outcome | asinh(DN) | Inverse hyperbolic sine of light_intensity, asinh(light). |
| `light_positive` | outcome | 0/1 | 1 if light_intensity>0 (extensive margin). |
| `impervious_ratio` | outcome | ratio [0,1] | Impervious surface area / district land area (urbanization). |
| `longitude` | covariate | degrees | District-centroid longitude. |
| `latitude` | covariate | degrees | District-centroid latitude. |
| `elevation` | covariate | metres | Average elevation (SRTM DEM). |
| `slope` | covariate | degrees | Average terrain slope (SRTM DEM). |
| `dist_addis_km` | covariate | km | Distance to Addis Ababa. |
| `dist_state_capital_km` | covariate | km | Distance to the regional capital. |
| `dist_nearest_city_km` | covariate | km | Distance to the nearest large (top-50) city. |
| `urbanization_rate_2007` | covariate | share [0,1] | 2007-census urban-population share. |
| `employment_rate_2007` | covariate | share [0,1] | 2007-census employment rate. |
| `log_pop_density_2007` | covariate | log/km^2 | Log of 2007 population density. |
| `population_2007` | covariate | persons | 2007-census district population. |
| `primary_road_density` | covariate | km/km^2 | Primary-road density (gROADS 2008). |
| `paved_road_density` | covariate | km/km^2 | Paved-road density (gROADS 2008). |
| `share_christian_2007` | covariate | share [0,1] | 2007-census Christian population share. |
| `share_amharic_2007` | covariate | share [0,1] | 2007-census Amharic-speaker share. |
| `labor_intensive_park` | covariate | 0/1 | 1 if the treated district's park is labor-intensive (NaN for controls). |
| `public_park` | covariate | 0/1 | 1 if the treated district's park is publicly owned (NaN for controls). |
| `china_aid` | covariate | 0/1 | 1 if the district received infrastructure-related Chinese ODA (from first receipt). |
| `transport_project` | covariate | 0/1 | 1 if a major transport project traverses the district (from completion). |

## 8. Variable reference — household RCS

| Variable | Role | Units | Description |
|---|---|---|---|
| `hh_id` | identifier | string | Unique household identifier (per round; NO panel key). |
| `survey_round` | identifier | year {2000,2005,2011,2016,2019} | Ethiopia DHS survey round. |
| `district_id` | identifier | string | District (woreda) of the household (links to the panel). |
| `region_id` | identifier | int | Region code (region-by-round FE key). |
| `treated` | treatment | 0/1 | 1 if the district ever hosts a park. |
| `treatment` | treatment | 0/1 | 1 if the district is treated AND survey_round >= the park's open round. |
| `event_phase` | derived | Int [-3,1] | Round position relative to opening, in {-3,-2,-1,0,+1} (NaN for controls). |
| `durable_goods_pc` | outcome | count/person | Number of durable items per household member. |
| `housing_quality` | outcome | 0/1 | 1 if the household has electricity + piped water + toilet + finished floor. |
| `wealth_index` | outcome | z-score | Standardized DHS wealth index (PCA of assets), z-scored per round. |
| `hh_size` | covariate | persons | Number of household members. |
| `age_head` | covariate | years | Age of the household head. |
| `survey_weight` | covariate | weight | DHS sampling weight (regressions are weighted). |

## 9. Variable reference — individual RCS

| Variable | Role | Units | Description |
|---|---|---|---|
| `ind_id` | identifier | string | Unique individual identifier (per round; NO panel key). |
| `survey_round` | identifier | year | Ethiopia DHS survey round. |
| `district_id` | identifier | string | District (woreda) of the respondent. |
| `region_id` | identifier | int | Region code. |
| `treated` | treatment | 0/1 | 1 if the district ever hosts a park. |
| `treatment` | treatment | 0/1 | 1 if district treated AND round >= open round. |
| `event_phase` | derived | Int [-3,1] | Round position relative to opening {-3..+1} (NaN for controls). |
| `sex` | covariate | 0/1 | 0 = male, 1 = female. |
| `age` | covariate | years | Respondent age. |
| `age_sq` | covariate | years^2 | Square of age. |
| `nonag_employment` | outcome | 0/1 | 1 if employed outside agriculture. |
| `decision_power` | outcome | 0/1 | 1 if the woman has the final say on key household decisions (women only). |
| `savings_account` | outcome | 0/1 | 1 if the woman owns a savings account (women only). |
| `dv_accept` | outcome | 0/1 | 1 if the woman accepts domestic violence under any of 5 conditions (women only). |
| `dv_goingout` | outcome | 0/1 | DV justified for going out without telling husband (women only). |
| `dv_kids` | outcome | 0/1 | DV justified for neglecting the children (women only). |
| `dv_arguing` | outcome | 0/1 | DV justified for arguing with husband (women only). |
| `dv_sex` | outcome | 0/1 | DV justified for refusing sex (women only). |
| `dv_food` | outcome | 0/1 | DV justified for burning the food (women only). |
| `hh_size` | covariate | persons | Household size. |
| `age_head` | covariate | years | Age of the household head. |
| `survey_weight` | covariate | weight | DHS sampling weight. |

---

*Generated by `reference/generate_synthetic_data.py` (district seed 2026, RCS seed 1130).*
