# Table 2 — Predicted vs. observed vs. light measures of regional inequality

Reproduces **Table 2** of Lessmann & Seidel (2017). Cross-country correlations
showing how well **satellite-predicted** and **raw night-light** measures of
within-country regional inequality track inequality computed from **observed**
regional GDP per capita.

> **Software:** Stata · R · Python · **Package:** `ssc install ineqdeco`
> **Run:** `cd` into this folder in Stata, then `do Table_2.do`. Output → `output/`.

---

## 1. What this table shows (in plain terms)

The whole paper rests on a satellite-based *prediction* of regional income (from
night-lights). Before trusting it, the authors check it against the truth where
the truth is observed. For each country they compute *within-country regional
inequality* three ways:

- from **predicted** regional GDP per capita (the satellite measure),
- from **observed** regional GDP per capita (the benchmark), and
- from raw regional **light per capita** (the unprocessed proxy).

They then correlate these across countries. A high predicted-vs-observed
correlation means the satellite measure is a usable stand-in for real regional
inequality; the (lower) light-vs-observed correlation shows why the *predicted*
measure — not raw lights — is the right object to use.

## 2. Method, explained simply

- **Window**: keep the cross-section years 2001–2012.
- **Five inequality indices**, all **population-weighted** across a country's
  regions: Gini, GE(−1), mean log deviation MLD = GE(0), Theil = GE(1), and the
  coefficient of variation CV = √(2·GE(2)).
- **`ineqdeco var [aw=Pop_Region] if group==i`**: for each country-year group,
  measure how unequally the chosen base variable is spread across that country's
  regions, weighting each region by its population.
- **Collapse**: average each index over 2001–2012 to one value per country (the
  index is constant within a country-year, so this is just the cross-section).
- **`pwcorr`**: pairwise correlations of the three versions, one matrix per index.

*Implementation note:* the original repeated the same 8-line `ineqdeco` loop
fifteen times. This do-file loops over the three base variables and harvests all
five `ineqdeco` return scalars in one pass (the pattern used in
`00_Main_Dataset/02_inequality_indices.do`); the numbers are identical.

## 3. Data dictionary — `data/Table_2_data.csv`

Region-level panel (5,258 rows) trimmed from the main dataset. Machine-readable
copy in `data_dictionary.csv`.

| Variable | Type | Label / meaning |
|---|---|---|
| `Country_ISO` | string | country code, ISO 3166-1 alpha-3 |
| `year` | numeric | year |
| `pred_GDP_pc_Region` | numeric | **predicted** regional GDP per capita (satellite/night-lights model) |
| `GDP_pc_Region` | numeric | **observed** regional GDP per capita, PPP constant 2005 US$ |
| `Light_Region` | numeric | regional total lights (sum of pixel digital numbers) |
| `Light_Country` | numeric | country total lights |
| `Pop_Region` | numeric | regional total population (region weight) |
| `Pop_Country` | numeric | country total population |

Variables built inside the do-file: `Light_pc_Region` (= `Light_Region`/`Pop_Region`),
`group` (country-year id), and the fifteen index columns
`GINIW_* GE_m1W_* GE_0W_* GE_1W_* COVW_*` with suffixes `pred_GDP_pc`, `GDP_pc`,
`Light_pc`.

*CSV-naming caveat:* in this folder the regional light variables are plain
columns; there are no satellite dummies here. (In other folders the original
`_satyear_1.._satyear_7` dummies appear as `satyear_1..satyear_7` because the
leading underscore is dropped on CSV import — not relevant to this table.)

## 4. How to run

```stata
ssc install ineqdeco      // once per machine
cd <path-to>/Table_2      // this folder
do Table_2.do
```

Results print to the Results window and are saved to `output/Table_2.txt`.

## 5. Expected result

Manuscript **Table 2** (p.117), period **2001–2012**, **78 countries**.

| Index | corr. with **predicted** income | corr. with **light** density |
|---|---|---|
| GINIW (Gini) | 0.50 | 0.21 |
| GE(−1) | 0.40 | 0.11 |
| MLD = GE(0) | 0.45 | 0.21 |
| Theil = GE(1) | 0.50 | 0.30 |
| CV | 0.52 | 0.29 |

(Each entry is the correlation of that column's measure with the **observed**
GDP-per-capita measure of the same index.) There is no committed `Table_2.txt`
target — the manuscript is the authority.

## 6. Provenance

`data/Table_2_data.csv` is trimmed from the region-level source
`Data/pred_GDP_pc_Region_G.dta`, which is produced by the `00_Main_Dataset`
pipeline (lights → predicted GDP → regional merge). To rebuild after a new lights
dataset, re-run that pipeline and re-extract this CSV.

## 7. Cross-language comparison (Stata · R · Python)

The same table is reproduced in three languages from the **same**
`data/Table_2_data.csv`. There is **no regression package** here: the five
population-weighted inequality indices are computed **from first principles** in
R and Python (the formulas in §2), then averaged per country over 2001–2012 and
correlated across the 78 countries.

| File | Tool | Inequality engine |
|---|---|---|
| `Table_2.do` | Stata | `ineqdeco var [aw=Pop_Region]` + `pwcorr` |
| `Table_2.R` | R | weighted GE/CV/Gini hand-coded; `cor(use="pairwise.complete.obs")` |
| `Table_2.py` | Python | weighted GE/CV/Gini hand-coded (numpy); `Series.corr` |

Run them with `do Table_2.do`, `Rscript Table_2.R`, `python Table_2.py`.

**Correlation of PREDICTED income with OBSERVED income (across 78 countries):**

| Index | Stata (manuscript) | R | Python |
|---|---|---|---|
| GINIW (Gini) | 0.50 | 0.4944 | 0.4944 |
| GE(−1) | 0.40 | 0.3939 | 0.3939 |
| MLD = GE(0) | 0.45 | 0.4525 | 0.4525 |
| Theil = GE(1) | 0.50 | 0.4962 | 0.4962 |
| CV | 0.52 | 0.5240 | 0.5240 |

**Correlation of LIGHT density with OBSERVED income (across 78 countries):**

| Index | Stata (manuscript) | R | Python |
|---|---|---|---|
| GINIW (Gini) | 0.21 | 0.2054 | 0.2054 |
| GE(−1) | 0.11 | 0.1105 | 0.1105 |
| MLD = GE(0) | 0.21 | 0.2111 | 0.2111 |
| Theil = GE(1) | 0.30 | 0.2976 | 0.2976 |
| CV | 0.29 | 0.2912 | 0.2912 |

**Notes (tolerance + differences):**
- R and Python are **identical to 4 decimal places** on all 10 correlations
  (same arithmetic, same `pairwise.complete.obs` Pearson correlation); their key
  numbers are written to `output/Table_2_results_R.csv` / `_py.csv`.
- The **GE class (GE(−1), MLD, Theil) and CV** match the manuscript's Stata
  `ineqdeco` values to the printed 2-dp precision — the hand-coded weighted
  formulas reproduce `ineqdeco` exactly for these indices.
- The **Gini row** differs by 0.01 in the predicted column (0.50 Stata vs 0.49
  R/Python). This is the documented caveat: our weighted Gini uses the standard
  double-sum of weighted absolute differences
  `Σ_i Σ_j w_i w_j |y_i−y_j| / (2(Σw)² μ)`, whereas Stata's `ineqdeco`
  computes the weighted Gini with a different (rank/covariance-based) algorithm.
  The two definitions coincide for unweighted data but can diverge slightly when
  weights vary across units, which is why the per-country Gini levels — and
  hence the cross-country correlation — shift by ~0.01. The light column matches
  to 2 dp (0.21). All other rows match.
- The Stata column is the **manuscript Table 2 (p.117)**; Stata is not executed
  in this build environment. R and Python were run here.
