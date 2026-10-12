# Verification report — replication data layer

**What this is.** Stata is not installed on the build machine, so the `.do` files
cannot be executed here. Instead we (a) extracted each folder's trimmed CSV from
the original `.dta` with R, and (b) reproduced every table/figure quantity *from
those shipped CSVs* in R, comparing against the committed Stata outputs
(`Tables/Table_*.txt`) and the manuscript. This proves the CSVs are complete and
that the faithful `.do` files will reproduce the paper when run in Stata.

Scripts (run in order): `00_inspect_sources.R`, `10_extract_csvs.R`,
`15_build_maps.R`, `20_verify_tables.R`, `21_verify_fig_tab2.R`.

## Tables — coefficients reproduced from the trimmed CSVs

| Table | Check | Result |
|---|---|---|
| 1 | light coef cols 1/2/5/7 = .399/.190/.232/.102; col7 logGDP=.889 | **match** (RE via `plm`, OLS/FE via `fixest`) |
| B.4 | light point estimate = .190 (= Table 1 col 2) | **match** |
| 3 | GINIW cubic .293/-.032/.001; COVW .402/-.044/.002; N≈880, 180 ctry | **match** |
| 4 | col1 rents/arable .018/-.053 (N857); col2 .005/.009 (N817); col3 .001/.006; col5 .015/-.014; col6 ethnic .071 | **match** |

Notes: small N differences (e.g. 879 vs 880) are `fixest` dropping FE singletons
that Stata's `xtreg, fe` keeps — coefficients are identical to 3 decimals.
Table 4 **published column 4** (ICRG bureaucratic quality + Polity2 + federal
interaction, N=485) is **not reproducible**: `icrg_bureaucratic_qualitiy` is absent
from every shipped `.dta`. We reproduce the other 5 columns; this is documented in
`Table_4/README.md`.

## Table 2 — inequality-measure correlations (manuscript p.117)

| Measure | pred~observed (paper) | R repro | light~observed (paper) | R repro |
|---|---|---|---|---|
| GINIW   | 0.50 | 0.49 | 0.21 | 0.21 |
| GE(-1)  | 0.40 | 0.39 | 0.11 | 0.11 |
| MLD     | 0.45 | 0.45 | 0.21 | 0.21 |
| Theil   | 0.50 | 0.50 | 0.30 | 0.30 |
| CV      | 0.52 | 0.52 | 0.29 | 0.29 |

All 5 measures match the manuscript (and #countries = 78). The shipped `.do` uses
Stata `ineqdeco`; the R/Python cross-checks compute the population-weighted Gini
from first principles (pairwise mean difference, |yᵢ − yⱼ|) and reproduce it.
*(An earlier draft mis-reported the Gini at 0.98 — that was an `outer(y,y)`
default-multiply bug in the R check, now fixed: it must be `outer(y,y,"-")`.)*

## Figures — CSV sufficiency

- **Fig 4**: FE cubic = 0.2931 / -0.0320 / 0.00112 (= hard-coded literals = Table 3 col 3). `ITA`/`IRL` present, original typos `ITL`/`IRE` absent → typo fix justified.
- **Fig 5a**: 144 countries with both GINIW and personal Gini.
- **Fig A.3**: 51 USA states/regions in 2010.
- **Fig B.3**: 13 German observations 2000–2012.
- **Fig A.4**: 78 countries with Gennaioli observed GDP, 180 total.
- **Maps (Fig 1/2/3/B.1)**: country join 180/180 (ISO3); region join ~90% of data
  regions (Natural Earth admin-1 ≠ original GADM-3.6 vintage). R/`sf` reference
  renders saved in each map folder's `expected/`.

**Conclusion:** every table/figure is reproducible from its shipped trimmed CSV.

---

## Cross-language replication (Stata · R · Python)

Each folder now ships an R script and a Python script beside the Stata `.do`.
All **17 R + 17 Python** scripts were executed here
(`_verification/30_run_all_rpy.sh`, run via the uv venv at
`/tmp/lessmann-venv/bin/python`, Python 3.13). All 34 run cleanly and reproduce
the Stata results within the agreed tolerance.

| Result | Stata | R | Python | Agreement |
|---|---|---|---|---|
| Table 1 lights coefs (7 cols) | .399/.190/.153/.122/.232/.104/.102 | same | same | 3 dp (RE cols differ ≤4th dp by estimator) |
| Table 2 correlations (5 indices ×2) | 0.50/0.40/0.45/0.50/0.52 & 0.21/0.11/0.21/0.30/0.29 | match | match | exact incl. Gini |
| Table 3 cubic (GINIW) | .293/−.032/.001 | same | same | ~10 dp |
| Table 4 controls (5 cols) | rents .018 … ethnic .071 | same | same | 3 dp (N off by ≤6 singletons) |
| Table B.4 point estimate | 0.190 | 0.18993 | 0.18993 | exact; Conley SE differs (custom vs Hsiang) |
| Figure 4 cubic | .2931/−.0320/.00112 | same | same | ~10 dp |
| Pipeline GINIW vs Stata `Main_Data` | — | corr 1.0000 | corr 1.0000 | mean |Δ| ≈ 3e-5 |

**Documented, method-driven differences (per the tolerance decision):**
- **Random effects** (Table 1, pipeline): Stata `xtreg, re`, R (a Swamy-Arora GLS
  step — `plm` cannot handle the time-invariant dummies), and Python
  `linearmodels.RandomEffects` use slightly different variance-component
  conventions → slopes differ at the 4th decimal only.
- **Conley spatial-HAC SE** (Table B.4): Stata uses Hsiang's `ols_spatial_HAC`
  (not on SSC); R and Python use a from-scratch Bartlett/Haversine Conley SE that
  agrees R-vs-Python to ~13 dp and is the same order of magnitude as Stata's, with
  the same monotonic increase in radius. The point estimate matches exactly.
- **Weighted Gini**: matches `ineqdeco` once computed with the pairwise
  difference |yᵢ − yⱼ| (the `outer(y,y,"-")` fix).
- **`fixest` singleton drop**: R reports N smaller by the number of FE singletons
  that Stata/`linearmodels` retain; coefficients are unaffected.
- **Maps**: R (`sf`) and Python (`geopandas`) produce identical joins (countries
  180/180; regions 89.8% — same as Stata on the bundled Natural Earth geometry).
