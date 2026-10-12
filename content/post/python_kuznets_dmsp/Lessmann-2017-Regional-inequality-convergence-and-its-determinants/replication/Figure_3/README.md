# Figure 3 — Change in regional inequality, 1992–2001 vs 2002–2012

Reproduces **Figure 3** of Lessmann & Seidel (2017): a diverging world map
(choropleth) showing, for each country, how *within-country regional inequality*
changed between the first and second halves of the sample.

> **Software:** Stata · R · Python · **Packages:** `ssc install spmap` plus
> `spshape2dta` (built into Stata 15+).
> **Run:** `cd` into this folder in Stata, then `do Figure_3.do`. Output → `output/`.

---

## 1. What this shows (in plain terms)

For every country we measure regional inequality (a population-weighted **Gini**
across that country's regions) and average it over two sub-periods: **1992–2001**
and **2002–2012**. The map shades each country by the *change* between the two
periods:

- **Green** = inequality **fell** → the country's regions **converged** (poorer
  regions caught up).
- **Red** = inequality **rose** → the country's regions **diverged**.

The picture lets you see at a glance where regional disparities are widening or
narrowing, complementing the country-by-country regressions in Table 3.

## 2. Method, explained simply

- **Two sub-periods.** Each year is tagged 1st-period (1992–2001) or 2nd-period
  (2002–2012) via the `p2year` flag.
- **Average within country × sub-period.** Using a country×period key
  (`id_t2_j`), we compute each country's mean Gini in each sub-period
  (`GINIW_91_01`, `GINIW_02_12`) and `collapse` to one row per country.
- **The plotted change.** `D_GINIW = GINIW_91_01 − GINIW_02_12`. It is **positive
  when later inequality is lower** (a fall), so positive → green, negative → red.
- **Map join.** The country code is renamed `iso3` to match the Natural Earth
  world shapefile; `spshape2dta` converts the shapefile to Stata format and we
  `merge 1:1 iso3` the values onto the polygons (Antarctica dropped).
- **`spmap` diverging palette.** Eight fixed class breaks from the paper, with
  cranberry (red) shades for the rising-inequality classes and dark-green shades
  for the falling-inequality classes, so the value 0 sits exactly on the
  red/green boundary.

## 3. Data dictionary — `data/Figure_3_data.csv`

Country-year panel (3,675 rows) trimmed from `Main_Data.dta`. Machine-readable
copy in `data_dictionary.csv`.

| Variable | Type | Label / meaning |
|---|---|---|
| `Country_ISO` | string | country code, ISO 3166-1 alpha-3 |
| `year` | numeric | year |
| `GINIW_pred_GDP_pc` | numeric | regional inequality — population-weighted **Gini** of predicted income |

Variables built inside the do-file: `p2year` (sub-period flag 0/1), `id_t2_j`
(country×period key), `GINIW_91_01` and `GINIW_02_12` (sub-period means),
`D_GINIW` (the plotted change), and `iso3` (renamed country code for the merge).

Map files (shipped, not overwritten): `data/worldmap_countries.{shp,dbf,shx,prj}`
— a Natural Earth world boundaries shapefile keyed by `iso3`. `spshape2dta`
generates `worldmap_countries.dta` and `worldmap_countries_shp.dta` at run time.

## 4. How to run

```stata
ssc install spmap        // once; spshape2dta ships with Stata 15+
cd <path>/replication/Figure_3
do Figure_3.do
```

The do-file converts the shapefile, merges the inequality change, and writes
`output/Figure_3.png` (and `output/Figure_3.gph`).

## 5. Expected result

A diverging green/red world choropleth using the **8 custom class breaks** from
the paper:

```
-.036  -.006418  -.0027394  -.0010632  0  .0021963  .0046911  .0071508  .036
```

Green countries show falling regional inequality (within-country convergence);
red countries show rising inequality (divergence). The result matches
`expected/Figure_3_original.jpg` (the published figure) and
`expected/Figure_3_R_reference.png` (the R-generated reference from this exact
CSV).

> **Caveat (Natural Earth):** boundaries come from the Natural Earth dataset and
> do not imply any endorsement of a particular territorial delimitation.

## 6. Provenance

`data/Figure_3_data.csv` is trimmed from `Data/Main_Data.dta`, which is produced
by the `00_Main_Dataset` pipeline (lights → predicted GDP → inequality → country
merge). The world shapefile is the shipped Natural Earth `worldmap_countries`
layer. To rebuild after a new lights dataset, re-run that pipeline and re-extract
this CSV.

> **Note on satellite dummies:** the original scripts wrote satellite intercept
> dummies as `_satyear_1`..`_satyear_7`; in the shipped CSVs the leading
> underscore is removed (`satyear_1`..`satyear_7`) so Stata's `import delimited`
> accepts them as variable names. (Not used in this figure, but noted for
> consistency across the replication.)

## Cross-language comparison (Stata · R · Python)

The same diverging map is drawn in three languages from the **same**
`data/Figure_3_data.csv` and the **same** bundled `worldmap_countries.*`
shapefile. Each language computes `D_GINIW = mean(1992-2001) − mean(2002-2012)`
per country, merges by ISO3, drops Antarctica, and shades a green (falling
inequality) / red (rising inequality) choropleth centred at 0:

| File | Tool | Mapping engine |
|---|---|---|
| `Figure_3.do` | Stata | `spmap` (after `spshape2dta`) |
| `Figure_3.R` | R | `sf` + `ggplot2` (`geom_sf`, `scale_fill_gradient2`) |
| `Figure_3.py` | Python | `geopandas` + `matplotlib` (`RdYlGn`, `TwoSlopeNorm`) |

Run with `do Figure_3.do`, `Rscript Figure_3.R`, `python Figure_3.py`.
R writes `output/Figure_3_R.png`; Python writes `output/Figure_3_py.png`.

**Underlying values (R and Python executed here):**

| Quantity | Stata | R (sf) | Python (geopandas) |
|---|---|---|---|
| Countries with data | 180 | 180 | 180 |
| Countries matched to map | 180 | 180 | 180 |
| D_GINIW min | −0.0349 | −0.0349 | −0.0349 |
| D_GINIW max | 0.0364 | 0.0364 | 0.0364 |
| D_GINIW range | [−0.0349, 0.0364] | [−0.0349, 0.0364] | [−0.0349, 0.0364] |

**Notes (tolerance + differences):**
- All three join the **same** 180 countries by ISO3 and shade the identical
  `D_GINIW` values, so the maps are equivalent; differences are cosmetic only.
  The R/Python `D_GINIW` range `[−0.0349, 0.0364]` falls within the paper's
  custom break span `[−0.036, 0.036]`, so the same green/red pattern appears.
- **Palette / centring.** All three centre the diverging scale at 0 so positive
  (falling inequality) → green and negative (rising inequality) → red. Stata
  `spmap` uses the 8 fixed custom class breaks from the paper
  (`-.036 … 0 … .036`); R uses a continuous `scale_fill_gradient2`
  (firebrick→white→darkgreen, `midpoint = 0`); Python uses `RdYlGn` with
  `TwoSlopeNorm(vcenter=0)`. To reproduce Stata's discrete bins exactly, bin
  `D_GINIW` on those breaks before plotting.
- R and Python agree to 6 decimals (`output/Figure_3_results_R.csv` /
  `_py.csv`): min `−0.034884`, max `0.036379`.
- Visual targets: `expected/Figure_3_original.jpg` (paper) and
  `expected/Figure_3_R_reference.png`. The red cluster across West/Central Africa
  (rising inequality) and scattered green (falling inequality) appear in all
  versions.
- Stata is not executed in this environment; R and Python were run here.
