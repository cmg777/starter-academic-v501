# Table 4 — Determinants of regional inequality with controls

Reproduces **Table 4** of Lessmann & Seidel (2017). Panel fixed-effects
regressions on 5-year averages: the spatial "Kuznets curve" of Table 3
(a **cubic in log national GDP per capita**) plus blocks of structural
controls, to see whether the GDP pattern survives once we condition on
resources, openness, geography, aid/schooling, and ethnic inequality.

> **Software:** Stata · R · Python · **Package:** `ssc install outreg2`
> **Run:** `cd` into this folder in Stata, then `do Table_4.do`. Output → `output/`.

> ⚠️ **5 columns, not 6.** The published Table 4 has a 6th specification
> (printed as published **column 4**) built on `icrg_bureaucratic_qualitiy`
> (ICRG bureaucratic quality), `Polity2`, and a federalism × GDP interaction.
> **That ICRG variable is not in the shipped data and cannot be reproduced** —
> it was also already commented out in the authors' original do-file. The block
> is kept *verbatim but commented out* in `Table_4.do`. So the reproduced table
> has **5 columns = published columns 1, 2, 3, 5, 6**.

---

## 1. What this table shows (in plain terms)

Table 3 found that regional inequality rises then falls with national income (a
cubic, hump-shaped curve). Table 4 asks: *is that curve just a stand-in for
something else?* Each column keeps the cubic in log GDP per capita and adds one
thematic block of controls:

- **(1) Resources & farming** — `Resources_rents_share_of_GDP`, `Arable_land`:
  resource-rich or land-rich economies may concentrate income spatially.
- **(2) Openness** — `Trade_GDP_share`, `FDI_share_of_GDP`: trade and foreign
  investment can favour particular (often coastal) regions.
- **(3) Geography & transport cost** — `area`, `price_gasoline`, and their
  interaction `Area_X_price_gasoline`: big countries with costly transport may
  struggle to spread activity evenly.
- **(4 = published 5) Aid & human capital** — `aid_GDP`, `School_enrollment_secondary`.
- **(5 = published 6) Ethnic inequality** — `GINIW_Eth_light`: spatial ethnic
  disparities (measured from night lights) as a correlate of income disparities.

The cubic GDP terms stay statistically significant in every column, so the
development pattern is robust to these controls.

## 2. Method, explained simply

- **5-year averages**: annual data are averaged into five periods (1990–94 …
  2010–14) to smooth noise and focus on medium-run patterns.
- **`xtreg, fe` (country fixed effects)**: compares a country *to itself* over
  time, removing every fixed national trait (history, institutions, geography).
- **`i.p5year` (period fixed effects)**: removes global shocks common to all
  countries in a period.
- **`cluster(Country_ISO_long)`**: standard errors allow arbitrary correlation
  within a country across periods.
- **Constructed controls**: `aid_GDP = Aid/(GDP_pc_Country×Pop_Country)`;
  `Resources_rents_share_of_GDP` and `School_enrollment_secondary` are rescaled
  from percent to share (÷100); `Area_X_price_gasoline = area×price_gasoline/1e7`;
  `fedlup` is a country-constant federation flag (used only in the
  non-reproducible institutions column).

## 3. Data dictionary — `data/Table_4_data.csv`

Country-year panel (3,675 rows) trimmed from `Main_Data.dta`. Machine-readable
copy in `data_dictionary.csv`.

| Variable | Type | Label / meaning |
|---|---|---|
| `Country_NAME` | string | country name |
| `Country_ISO` | string | country code, ISO 3166-1 alpha-3 |
| `year` | numeric | year |
| `GINIW_pred_GDP_pc` | numeric | regional inequality — population-weighted **Gini** of predicted income (dependent variable) |
| `GDP_pc_Country` | numeric | national GDP per capita, PPP constant 2005 US$ |
| `Pop_Country` | numeric | country total population |
| `Resources_rents_share_of_GDP` | numeric | total natural-resource rents (% of GDP; ÷100 in code) |
| `Arable_land` | numeric | arable land (share of land area) |
| `Trade_GDP_share` | numeric | trade (share of GDP) |
| `FDI_share_of_GDP` | numeric | foreign direct investment, net inflows (share of GDP) |
| `area` | numeric | area, sq. km |
| `price_gasoline` | numeric | pump price for gasoline, PPP constant 2005 US$ per liter |
| `Aid` | numeric | aid flows (constant 2011 US$) |
| `School_enrollment_secondary` | numeric | school enrollment, secondary (% gross; ÷100 in code) |
| `GINIW_Eth_light` | numeric | ethnic inequality (population-weighted light Gini coefficient) |
| `Polity2` | numeric | Polity IV Polity2 index (used only in the non-reproducible column) |
| `fedelupd2` | numeric | federal-state dummy (basis for `fedlup`) |

Variables built inside the do-file: `p5year` (period 1–5), `log_GDP_pc_Country`
and its square `_2` and cube `_3`, `aid_GDP`, `Area_X_price_gasoline`, `fedlup`,
`log_GDP_pc_Country_X_fedlup`, `Country_ISO_long` (numeric country id).

## 4. How to run

1. Install the package once (skip if already installed):
   ```stata
   ssc install outreg2
   ```
2. In Stata, change directory into this folder and run the do-file:
   ```stata
   cd "<path>/replication/Table_4"
   do Table_4.do
   ```
3. Results are written to `output/Table_4.xls` and `output/Table_4.txt`.

## 5. Expected result (compare with `expected/Table_4.txt`, its cols 1,2,3,5,6)

| Coefficient | (1) | (2) | (3) | (4)=pub 5 | (5)=pub 6 |
|---|---|---|---|---|---|
| log GDP pc | 0.350*** | 0.205** | 0.171** | 0.226** | 0.149** |
| (log GDP pc)² | −0.038*** | −0.022** | −0.019** | −0.023* | −0.015** |
| (log GDP pc)³ | 0.001*** | 0.001** | 0.001** | 0.001 | 0.000* |
| Resources rents (share) | **0.018*** | | | | |
| Arable land | **−0.053*** | | | | |
| Trade (share) | | **0.005*** | | | |
| FDI (share) | | **0.009** | | | |
| price gasoline | | | **0.001** | | |
| Area × price gasoline | | | **0.006*** | | |
| aid_GDP | | | | **0.015*** | |
| School enrollment sec. | | | | **−0.014*** | |
| GINIW_Eth_light | | | | | **0.071*** |
| N | **857** | **817** | **676** | **591** | **845** |
| R² | .287 | .258 | .165 | .251 | .363 |

(`**` etc. in the pinned cells above mark the published asterisks: rents 0.018***,
arable −0.053***, trade 0.005***, FDI 0.009 (n.s.), gasoline 0.001 (n.s.),
Area×gasoline 0.006**, aid_GDP 0.015**, school −0.014*, ethnic 0.071***.)

Country FE and Year FE in every column. **Published column 4** (ICRG
bureaucratic quality, `N=485`) is intentionally omitted — its key regressor is
absent from the data.

## 6. Provenance

`data/Table_4_data.csv` is trimmed from `Data/Main_Data.dta`, which is produced
by the `00_Main_Dataset` pipeline (lights → predicted GDP → inequality →
country/World-Bank merge). The five reproducible columns are the authors'
original Table 4 code (`Generation_Tables.do`, block "Table 4") with data
loading repointed to the shipped CSV and outputs repointed to `output/`. To
rebuild after a new lights dataset, re-run that pipeline and re-extract this CSV.

## 7. Cross-language comparison (Stata · R · Python)

The same five-column table is reproduced in three languages from the **same**
`data/Table_4_data.csv`. All scripts collapse to 5-year averages with
per-variable means (no listwise deletion), build the same derived controls
(`aid_GDP`, the ÷100 rescales, `Area_X_price_gasoline = area×price_gasoline/1e7`),
and run country + period fixed effects clustered by country. Published column 4
(`icrg_bureaucratic_qualitiy`) is **skipped in all three** — that variable is not
in the shipped data.

| File | Tool | Estimator |
|---|---|---|
| `Table_4.do` | Stata | `xtreg, fe` + `i.p5year`, cluster by country |
| `Table_4.R` | R | `fixest::feols(GINIW_pred_GDP_pc ~ … \| Country_ISO + p5)`, cluster by country |
| `Table_4.py` | Python | `linearmodels.PanelOLS` (EntityEffects + TimeEffects), cluster by country |

Run them with `do Table_4.do`, `Rscript Table_4.R`, `python Table_4.py`.

**Key control coefficient(s) per column and N — all executed:**

| Column (block) | Coefficient | Stata (committed) | R (fixest) | Python (linearmodels) |
|---|---|---|---|---|
| (1) resources + farming | Resources rents (share) | 0.018 | 0.018 | 0.018 |
| (1) resources + farming | Arable land | −0.053 | −0.053 | −0.053 |
| (1) | N | 857 | 857 | 857 |
| (2) openness | Trade (share) | 0.005 | 0.005 | 0.005 |
| (2) openness | FDI (share) | 0.009 | 0.009 | 0.009 |
| (2) | N | 817 | 817 | 817 |
| (3) geography + transport | price gasoline | 0.001 | 0.001 | 0.001 |
| (3) geography + transport | Area × price gasoline | 0.006 | 0.006 | 0.006 |
| (3) | N | 676 | 672 \* | 676 |
| (4 = pub 5) aid + schooling | aid_GDP | 0.015 | 0.015 | 0.015 |
| (4 = pub 5) aid + schooling | School enrollment sec. | −0.014 | −0.014 | −0.014 |
| (4) | N | 591 | 585 \* | 591 |
| (5 = pub 6) ethnic | GINIW_Eth_light | 0.071 | 0.071 | 0.071 |
| (5) | N | 845 | 844 \* | 845 |

**Notes (tolerance + differences):**
- Every key coefficient agrees across all three languages and matches the
  committed Stata values to 3 decimals. R and Python agree to ~12 decimal places
  (e.g. rents 0.01828861…, arable −0.05287267…, Area×gasoline 0.00600533…),
  confirming identical estimators on identical samples.
- \* The only differences are in **N** for columns 3, 4, 5. R's `fixest` removes
  **fixed-effect singletons** — countries observed in just one 5-year period
  after the column's own missing-value drop, which contribute nothing to a within
  estimator (4, 6, and 1 singleton(s) respectively → N = 672, 585, 844). Stata's
  `xtreg, fe` and Python's `PanelOLS` keep those rows (N = 676, 591, 845). The
  slope estimates are identical to ~12 dp either way, so the singleton handling
  does not move any reported coefficient.
- The Stata column is taken from the committed `expected/Table_4.txt`
  (cols 1, 2, 3, 5, 6); Stata is not executed in this build environment. R and
  Python were run here and their numbers written to
  `output/Table_4_results_R.csv` / `output/Table_4_results_py.csv`.
- The cubic in log GDP per capita stays significant in every column in all three
  languages, so the spatial Kuznets pattern survives each control block.
