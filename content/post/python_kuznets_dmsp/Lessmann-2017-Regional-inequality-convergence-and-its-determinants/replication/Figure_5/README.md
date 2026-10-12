# Figure 5 — Regional inequality vs personal inequality (5a) and conflict (5b)

Reproduces **Figure 5** of Lessmann & Seidel (2017): cross-country scatters that
ask whether **interregional** inequality (gaps *between* a country's regions,
measured from night lights → predicted GDP → the population-weighted Gini
`GINIW`) travels together with two social outcomes — **interpersonal** income
inequality (panel a) and the **risk of internal conflict** (panel b).

> **Software:** Stata · R · Python · **Packages:** none
> **Run:** `cd` into this folder in Stata, then `do Figure_5.do`. Output → `output/`.

> ⚠️ **Figure 5b cannot be reproduced** — the ICRG internal-conflict data is
> licensed (PRS Group) and is **not in the repo**; see manuscript.pdf p.127.
> To reproduce, obtain ICRG `internal_conflict`, merge on `Country_ISO` + `year`,
> build `icrg_risk_of_internal_conflict = (12 - icrg_internal_conflict)/12`, and
> uncomment the preserved block (Section 8 of the do-file).

---

## 1. What this shows (in plain terms)

- **Panel (a)** plots, one dot per country, the household-income Gini
  (inequality *between people*) against `GINIW` (inequality *between regions*).
  The upward OLS line says countries with wide regional gaps also tend to have
  wide personal income gaps — the two dimensions of inequality reinforce rather
  than offset each other.
- **Panel (b)** plots the *risk of internal conflict* against the same `GINIW`.
  The paper finds that more regionally unequal countries face a higher conflict
  risk. **This panel is not produced here** (the conflict data is licensed and
  absent — see the banner above).

## 2. Method, explained simply

- **Cross section, 2001–2012**: keep that window (`year>2000 & year<2013`), then
  `collapse (mean)` the annual panel to **one observation per country**. Each
  dot is a 12-year country average.
- **Rescale**: the household Gini `Giniall` is on a 0–100 scale while `GINIW` is
  on 0–1, so we divide by 100 (`GINIall_100 = Giniall/100`) to make the axes
  comparable.
- **Plot**: `twoway` overlay of a `scatter` (solid triangles) and an `lfit`
  (ordinary least-squares fit line, blue). No regression table, no fixed effects
  — this is a descriptive correlation, not a causal estimate.
- Countries without a household-income Gini simply do not appear in the scatter.

## 3. Data dictionary — `data/Figure_5_data.csv`

Country-year panel trimmed from `Main_Data.dta`. Machine-readable copy in
`data_dictionary.csv`.

| Variable | Type | Label / meaning |
|---|---|---|
| `Country_ISO` | string | country code, ISO 3166-1 alpha-3 |
| `Country_NAME` | string | country name |
| `year` | numeric | year |
| `GINIW_pred_GDP_pc` | numeric | regional inequality — population-weighted **Gini** of predicted (lights-based) GDP per capita |
| `Giniall` | numeric | interpersonal **income Gini** (household survey, 0–100 scale) |

Variable built inside the do-file: `GINIall_100` (= `Giniall`/100, the household
Gini rescaled to 0–1).

> **Naming note:** the original code wrote satellite dummies as
> `_satyear_1`..`_satyear_7`. In CSV-shipped folders the leading underscore is
> dropped (`satyear_1`..) so Stata imports them cleanly. No such variables are
> needed for Figure 5, but the convention applies across this replication set.

## 4. How to run

1. Install Stata (no add-on packages required for this figure).
2. In Stata, `cd` into this folder:
   ```
   cd ".../replication/Figure_5"
   do Figure_5.do
   ```
3. Results land in `output/`: `Figure_5_a.png` and `Figure_5_a.gph`.

## 5. Expected result

- **`Figure_5_a`**: roughly **144 countries** (those with a household-income
  Gini in the 2001–2012 window) appear as triangles; the OLS line slopes **up**,
  i.e. a **positive relationship** between interregional (`GINIW`) and
  interpersonal (`GINI`) inequality.
- Visual target: `expected/Figure_5_R_reference.png` and manuscript.pdf p.127.
- **`Figure_5_b`**: not produced (licensed ICRG conflict data unavailable).

## 6. Provenance

`data/Figure_5_data.csv` is trimmed from `Data/Main_Data.dta`, which is produced
by the `00_Main_Dataset` pipeline (night lights → predicted regional GDP →
regional inequality indices → country-level merge with the household Gini). To
rebuild after a new lights dataset, re-run that pipeline and re-extract this CSV.
Figure 5b additionally requires the licensed ICRG `internal_conflict` series,
which is not part of this package.

## 7. Cross-language comparison (Stata · R · Python)

Panel **5a** is reproduced in three languages from the **same**
`data/Figure_5_data.csv` (panel 5b stays unreproducible — licensed ICRG data;
see the banner at the top):

| File | Tool | What it draws with |
|---|---|---|
| `Figure_5.do` | Stata | `collapse (mean)` + `twoway scatter`/`lfit` |
| `Figure_5.R` | R | `aggregate` + `lm` + `ggplot2` (`geom_smooth(method="lm")`) |
| `Figure_5.py` | Python | `groupby().mean()` + `numpy.polyfit` + `matplotlib` |

Run with `do Figure_5.do`, `Rscript Figure_5.R`, `python Figure_5.py`.
R writes `output/Figure_5_a_R.png`; Python writes `output/Figure_5_a_py.png`.

**Underlying values (R and Python executed here):**

| Quantity | Stata | R (lm) | Python (polyfit) |
|---|---|---|---|
| Countries with both measures | ~144 | 144 | 144 |
| OLS slope (GINI on GINIW) | positive | 0.5873 | 0.5873 |
| OLS intercept | — | 0.3584 | 0.3584 |
| Mean GINIW | — | 0.0649 | 0.0649 |
| Mean GINI (0–1) | — | 0.3965 | 0.3965 |

**Notes (tolerance + differences):**
- R and Python collapse the 2001–2012 panel to the same **144** country means,
  rescale `Giniall/100`, and fit the same OLS line — the slope and intercept
  agree to ~13 significant figures (`0.58731252703818…`), well inside any
  numerical tolerance.
- The slope is clearly **positive**, matching the paper's finding that
  interregional and interpersonal inequality move together; this matches the
  pinned Stata result (~144 countries, positive slope).
- Visual targets: `expected/Figure_5_R_reference.png` and manuscript.pdf p.127.
  The triangle cloud and the upward blue fit line are equivalent across all
  versions; only cosmetic defaults differ (ggplot grey grid vs matplotlib plain
  axes; both use open triangles per Stata `msymbol(t)`).
- Stata is not executed in this environment (the Stata column shows the do-file's
  documented expectation); R and Python were run here and their numbers are in
  `output/Figure_5_results_R.csv` / `_py.csv`.
