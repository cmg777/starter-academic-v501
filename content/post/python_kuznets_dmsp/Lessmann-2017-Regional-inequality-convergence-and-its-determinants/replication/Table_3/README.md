# Table 3 — Determinants of sigma-convergence (the regional "Kuznets curve")

Reproduces **Table 3** of Lessmann & Seidel (2017). Panel fixed-effects
regressions on 5-year averages relating **regional inequality** to the level of
national development.

> **Software:** Stata · R · Python · **Package:** `ssc install outreg2`
> **Run:** `cd` into this folder in Stata, then `do Table_3.do`. Output → `output/`.

---

## 1. What this table shows (in plain terms)

Each column regresses a measure of *within-country regional income inequality*
on a **cubic polynomial in log national GDP per capita**, controlling for fixed
country and time effects. The cubic lets the relationship bend: inequality first
rises with development and later falls — a spatial analogue of the Kuznets
hypothesis. Columns (1)–(3) build the polynomial up (linear → quadratic → cubic)
for the Gini; columns (4)–(7) repeat the cubic for four other inequality indices,
showing the pattern is not an artifact of one measure.

## 2. Method, explained simply

- **5-year averages**: annual data are averaged into five periods (1990–94 …
  2010–14) to smooth noise and focus on medium-run patterns.
- **`xtreg, fe` (country fixed effects)**: compares a country *to itself* over
  time, removing every fixed national trait (history, institutions, geography).
- **`i.p5year` (period fixed effects)**: removes global shocks common to all
  countries in a period.
- **`cluster(Country_ISO_long)`**: standard errors allow arbitrary correlation
  within a country across periods.
- **Five inequality indices** (all population-weighted across a country's
  regions): Gini, coefficient of variation, Theil GE(1), MLD GE(0), GE(−1).

## 3. Data dictionary — `data/Table_3_data.csv`

Country-year panel (3,675 rows) trimmed from `Main_Data.dta`. Machine-readable
copy in `data_dictionary.csv`.

| Variable | Type | Label / meaning |
|---|---|---|
| `Country_NAME` | string | country name |
| `Country_ISO` | string | country code, ISO 3166-1 alpha-3 |
| `year` | numeric | year |
| `GDP_pc_Country` | numeric | national GDP per capita, PPP constant 2005 US$ |
| `GINIW_pred_GDP_pc` | numeric | regional inequality — population-weighted **Gini** of predicted income |
| `COVW_pred_GDP_pc` | numeric | regional inequality — **coefficient of variation** |
| `GE_1W_pred_GDP_pc` | numeric | regional inequality — **Theil index**, GE(1) |
| `GE_0W_pred_GDP_pc` | numeric | regional inequality — **mean log deviation**, GE(0) |
| `GE_m1W_pred_GDP_pc` | numeric | regional inequality — **GE(−1)** |

Variables built inside the do-file: `p5year` (period 1–5), `log_GDP_pc_Country`
and its square `_2` and cube `_3`, `Country_ISO_long` (numeric country id).

## 4. Expected result (compare with `expected/Table_3.txt`)

| Coefficient | (1) | (2) | (3) GINIW | (4) COVW | (5) Theil | (6) MLD | (7) GE(−1) |
|---|---|---|---|---|---|---|---|
| log GDP pc | −0.003 | 0.056** | **0.293*** | 0.402*** | 0.066*** | 0.063*** | 0.061*** |
| (log GDP pc)² |  | −0.003*** | **−0.032*** | −0.044*** | −0.008*** | −0.007*** | −0.007*** |
| (log GDP pc)³ |  |  | **0.001*** | 0.002** | 0.000*** | 0.000*** | 0.000*** |
| N | 880 | 880 | 880 | 880 | 880 | 880 | 880 |
| R² | .126 | .201 | .244 | .264 | .210 | .205 | .196 |

Countries = 180. Country FE and Year FE in every column. *(Verified in R from
this exact CSV — see `../_verification/VERIFICATION_REPORT.md`.)*

## 5. Provenance

`data/Table_3_data.csv` is trimmed from `Data/Main_Data.dta`, which is produced
by the `00_Main_Dataset` pipeline (lights → predicted GDP → inequality →
country merge). To rebuild after a new lights dataset, re-run that pipeline and
re-extract this CSV.

## 6. Cross-language comparison (Stata · R · Python)

The same table is reproduced in three languages from the **same**
`data/Table_3_data.csv`:

| File | Tool | Estimator |
|---|---|---|
| `Table_3.do` | Stata | `xtreg, fe` + `i.p5year`, cluster by country |
| `Table_3.R` | R | `fixest::feols(y ~ … \| Country_ISO + p5)`, cluster by country |
| `Table_3.py` | Python | `linearmodels.PanelOLS` (EntityEffects + TimeEffects), cluster by country |

Run them with `do Table_3.do`, `Rscript Table_3.R`, `python Table_3.py`.

**Headline coefficients (column 3, GINIW cubic) — all executed:**

| Quantity | Stata (committed) | R (fixest) | Python (linearmodels) |
|---|---|---|---|
| log GDP pc | 0.293 | 0.293 | 0.293 |
| (log GDP pc)² | −0.032 | −0.032 | −0.032 |
| (log GDP pc)³ | 0.001 | 0.001 | 0.001 |
| COVW: log GDP pc (col 4) | 0.402 | 0.402 | 0.402 |
| N (col 3) | 880 | 879 \* | 880 |
| Countries | 180 | 180 | 180 |

**Notes (tolerance + differences):**
- Coefficients agree across all three to well beyond 3 decimals (R and Python
  match to ~10 dp; both equal the committed Stata values).
- \* The only difference is N: R's `fixest` drops one **singleton** group (a
  country observed in just one 5-year period, which contributes nothing to a
  within estimator), reporting N = 879. Stata's `xtreg, fe` and Python's
  `PanelOLS` keep it (N = 880). The slope estimates are identical either way.
- The Stata column is taken from the committed `expected/Table_3.txt` (Stata is
  not executed in this build environment); R and Python were run here and their
  numbers written to `output/Table_3_results_R.csv` / `_py.csv`.
