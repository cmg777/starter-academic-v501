# Replication suite — Heger & Neumayer (2019), Aceh tsunami

Python scripts that reproduce **every table and figure** of

> Heger, M. P., & Neumayer, E. (2019). *The impact of the Indian Ocean tsunami
> on Aceh's long-term economic growth.* **Journal of Development Economics, 141,
> 102365.**

from the synthetic dataset one directory up (`../aceh_tsunami_*.csv`). The
scripts are written to **teach the methods**, so they are heavily commented and
build up from intuition to the formal estimators.

> The data is **synthetic and calibrated** to reproduce the paper's findings (see
> `../README.md`). So the numbers below match the *paper*, not any real economy.

---

## 1. Quick start

The machine's default `python3` cannot `pip install` (a broken `pyexpat`), so use
a throwaway virtual environment. With [uv](https://docs.astral.sh/uv/):

```bash
cd ..                                   # the dataset/ folder
uv venv --python 3.12 .venv
uv pip install --python .venv/bin/python -r replication/requirements.txt
.venv/bin/python replication/run_all.py
```

`run_all.py` runs scripts 01→05 and writes results to `tables/` and `figures/`.
Run any script on its own the same way, e.g.
`.venv/bin/python replication/02_did_tables_gdp.py`.

> **Intel-Mac note:** `pyfixest` needs `numba`, whose newest releases lack
> x86_64-macOS wheels. `requirements.txt` pins `numba==0.60.0` /
> `llvmlite==0.43.0`, which install cleanly. (Drop those pins on Apple Silicon/Linux.)

---

## 2. What each script does

| Script | Library | Reproduces | Output |
|---|---|---|---|
| `data_prep.py` | pandas | *(shared helpers — not run directly)* | — |
| `01_did_intuition.py` | **diff-diff** | the DiD idea: 2×2 table → event study (Table 2 dynamics) | console + `figures/fig_event_study_gdp.png` |
| `02_did_tables_gdp.py` | **pyfixest** | **Tables 2, 5, 6, 7, 8, 9** (GDP DiD + robustness + placebo) | `tables/table{2,5,6,7,8,9}*.md/.tex` |
| `03_nightlights_tables.py` | pandas + **pyfixest** | **Tables 1, 3, 4** (luminosity summary, dose-response, quintiles) | `tables/table{1,3,4}*.md/.tex` |
| `04_synthetic_control.py` | matplotlib + **mlsynth** | **Figures 2 & 3** (GDP dynamics + synthetic control) | `figures/fig2_*`, `figures/fig3_*` |
| `05_structural_change.py` | matplotlib + **mlsynth** | **Figures 4–7** (sectoral shares + capital formation) | `figures/fig{4,5,6,7}_*` |
| `06_spatial_standard_errors.py` | numpy + matplotlib | spatial autocorrelation & **Conley spatial SEs** (the paper's inference) | `figures/fig_spatial_*`, `tables/table_spatial_*` |
| `run_all.py` | — | runs 01→06 in order | — |

The division of labour: **diff-diff** teaches the difference-in-differences logic
and acts as a cross-check; **pyfixest** supplies the two-way fixed-effects point
estimates (script 02 prints a one-line pyfixest-vs-hand-rolled cross-check), on
top of which we report the paper's **Conley spatial-HAC** standard errors;
**mlsynth** does the synthetic control. Scripts 01 (diff-diff) and 02 (pyfixest)
deliberately produce the *same* headline numbers (2005 ≈ −0.081\*\*\*,
2006–08 ≈ +0.059\*\*) by two independent routes.

---

## 3. The method, in one screen

**Difference-in-differences (Tables 2–9).** Flooded units are "treated"; others
are controls. Under *parallel trends* (absent the tsunami both groups grow alike),
the tsunami's effect is the treated change minus the control change. The paper
splits "after" into event-time periods so the **dynamics** show:

```
   ΔY_it = β1·D·[2003-04] + β2·D·[2005] + β3·D·[2006-08] + β4·D·[2009-12]
           + district FE + year FE + ε
```

with `D = flooded`. The baseline (2000–02) is the reference. β2 < 0 (destruction),
β3 > 0 and large (reconstruction boom), β1 ≈ 0 (parallel-trends check).

**Synthetic control (Figures 3–7).** Build a bespoke "synthetic Aceh" as a
weighted average of donor units chosen to match Aceh's *pre-tsunami* path; the
post-2004 gap is the effect.

---

## 4. How to read the outputs

- Regression tables print to the console as markdown and are saved as both
  `.md` (for notes/slides) and `.tex` (for papers). Stars: `*** p<0.01,
  ** p<0.05, * p<0.10`.
- Each table/figure prints a short "Reading:" note and the paper's reported
  values for comparison.
- Figures are PNGs in `figures/`.

Headline checks (what you should see — these now match the paper's *values*,
not just its pattern):

| Result | Value |
|---|---|
| Table 2, Tsunami (2005) | ≈ **−0.081\*\*\*** |
| Table 2, Recovery (2006–08) | ≈ **+0.059\*\*** (col 3, vs Aceh controls, ≈ **+0.030**) |
| Table 8, per-capita 2005 | insignificant (no per-capita loss); recovery ≈ **+0.078\*\*\*** |
| Table 3, share-of-pop / area 2006–08 | ≈ **+0.016\*\*\*** / **+1.75\*\*\*** |
| Table 4 | only the top intensity quintile is significant (both measures) |
| Table 7 | rural hit hard in 2005 (≈ −0.098\*\*\*), cities rebound hugely (≈ +0.134\*) |
| Table 9 (placebo) | nothing significant |
| Figure 3 | treated rises above synthetic after 2005 |
| Figures 4/6 | agriculture share falls (44→32%) / services rises (40→55%) vs synthetic |

> **On significance:** the recovery effect is **\*\*** (5%), not \*\*\* — the
> paper's Conley spatial-HAC standard errors are larger than naive ones (script
> 06 shows why). Under naive SEs the same coefficient would look \*\*\*.

---

## 5. Spatial standard errors (script 06)

The paper reports **Conley spatial-HAC** standard errors — adjusting for both
**serial** correlation within a district over time *and* **contemporaneous
spatial** correlation across nearby districts (Tobler's first law), which the
treated units (all clustered on Aceh's coast) make especially relevant. The
**GDP tables (script 02) report these SEs**, computed by `data_prep.did_estimate`
as one sandwich whose "meat" unions clustering-by-district (serial) and same-year
pairs within 100 km (spatial). **Script 06** then dissects the estimator in four
steps: (A) a **map** showing treatment is spatially clustered; (B) **Moran's I**
on the residuals (≈ +0.07, p ≈ 0.003 → spatial autocorrelation is real); (C) the
**same DiD estimates with four standard errors** — naive → clustered → Conley
spatial → Conley-HAC (one sandwich, four "meats"); and (D) how the SE grows with
the distance cutoff. The recovery SE roughly **doubles** from naive to HAC, which
is exactly why it is **\*\*** and not \*\*\* — *the point estimate never changes;
only your honesty about its uncertainty does.* To make the lesson real, the data
carries demeaned spatial and serial growth shocks (see `../README.md`).

> Night-lights tables (script 03) cluster on the sub-district only (no spatial
> term), as the paper does (its footnote 10 notes Conley SEs do not converge for
> night lights). `diff-diff` also offers Conley SEs directly via `conley_coords=`,
> `conley_cutoff_km=`, `conley_lag_cutoff=`.

## 6. Other caveats (deliberate, documented)

- **Night-lights Tables 3 vs 4 scales** are mutually inconsistent *in the paper*
  (Table 4's Q5 ≈ 0.38 cannot coexist with Table 3's ≈ 0.016). We reproduce
  **Table 3's magnitudes exactly** and **Table 4's pattern** (only the top
  quintile significant) at the Table-3-consistent scale.
- **"Aceh non-flooded" columns** (Tables 2/6/8 col 3): the *point* estimates match
  the paper, but because the synthetic Conley-HAC SE is similar across columns
  (same 10 treated units), the col-3 recovery effect can read as insignificant
  where the paper — with a higher-R² Aceh-only sample — finds it significant.
- **Table 7** city columns rest on only 2 flooded city districts, so they are
  imprecise (few clusters) — as the paper itself cautions.
- **Figures 4–7** use a province-level synthetic control with only ~9 donor
  provinces, so the pre-fit is looser than the district-level Figure 3. The
  qualitative divergence is the point.

See `../README.md` for how the dataset was constructed and `../*_data_dictionary.csv`
for every variable.
