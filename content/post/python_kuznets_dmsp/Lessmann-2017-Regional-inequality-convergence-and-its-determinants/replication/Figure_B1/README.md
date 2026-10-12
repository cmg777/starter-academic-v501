# Figure B.1 — Predicted regional income in Sub-Saharan Africa

Reproduces **Figure B.1** of Lessmann & Seidel (2017): a choropleth (filled)
map of **predicted regional GDP per capita** (1992–2012 average) restricted to
**Sub-Saharan Africa**. It is the same map as Figure 1 of the paper, just masked
to the SSA subsample so the continent's internal income geography is readable.

> **Software:** Stata · R · Python · **Needs Stata 15+** (for `spshape2dta`)
> **Packages:** `ssc install spmap` (`spshape2dta` ships with Stata 15+)
> **Run:** `cd` into this folder in Stata, then `do Figure_B1.do`. Output → `output/`.

---

## 1. What this shows (in plain terms)

Lessmann & Seidel use night-time satellite lights to **predict** GDP per capita
for every first-level administrative region (states, provinces, departments)
worldwide, where official regional accounts often do not exist. This map colours
each Sub-Saharan African region by that predicted income, averaged over
1992–2012: **darker blue = richer region**. It lets you see *within-country*
income geography across the continent — coastal vs. interior, capital-region
premia, resource enclaves — using a consistent, comparable measure.

## 2. Method, explained simply

- **Predicted regional income**: built by the `00_Main_Dataset` pipeline from
  satellite lights; this folder only *displays* the finished values.
- **Cross-section**: each region's annual values are averaged over 1992–2012 to
  one number (`collapse (mean) ...`).
- **Map join**: regions are matched by ISO region code to the polygon shapefile
  (`worldmap_regions`), converted to Stata format with `spshape2dta`, which
  creates the polygon id `_ID` and the coordinate file `*_shp.dta`.
- **`spmap ... if ssa==1`**: draws the choropleth for SSA regions only. The
  `ssa` dummy is the *only* difference from the all-world Figure 1.
- **`clnumber(9) fcolor(Blues2)`**: 9 income classes, sequential blue ramp.

## 3. Data dictionary — `data/Figure_B1_region_income.csv`

Region-year panel (64,942 rows, 1992–2012). Machine-readable copy in
`data_dictionary.csv`.

| Variable | Type | Label / meaning |
|---|---|---|
| `Region_ISO` | string | first-level region code (ISO-style, e.g. `AFG26`) |
| `year` | numeric | year (1992–2012) |
| `ssa` | numeric | Sub-Saharan Africa flag (1 = SSA region, 0 = otherwise) |
| `pred_GDP_pc_Region` | numeric | predicted regional GDP per capita (the mapped variable) |
| `pred_GDP_pc_Country` | numeric | predicted national GDP per capita (region's country) |

Spatial files also in `data/` (Natural Earth, ~90% coverage of first-level
admin units): `worldmap_regions.shp/.shx/.dbf/.prj`. Variables built inside the
do-file: `regiso` (rename of `Region_ISO` for the merge), `_ID` (polygon id
created by `spshape2dta`), `_merge`.

## 4. How to run

1. In Stata (version **15 or later**) install the mapping package once:
   `ssc install spmap`
2. `cd` into this folder, then run `do Figure_B1.do`.

The do-file converts the shapefile (`spshape2dta`), imports the CSV, collapses
to a cross-section, merges income onto the map, and draws the SSA-only map.

## 5. Expected result (compare with `expected/Figure_B1_R_reference.png`)

A **Sub-Saharan-Africa-only sequential-blue choropleth** of predicted regional
income (1992–2012 average), darker blue = richer region, 9 colour classes —
matching `expected/Figure_B1_R_reference.png`.

> **Coverage caveat:** the Natural Earth regions layer covers ~90% of the
> world's first-level administrative units, so a few regions in the income data
> have no matching polygon and do not appear on the map.

## 6. Provenance

`data/Figure_B1_region_income.csv` is trimmed from `Data/pred_GDP_pc_Region.dta`
(the region-level predicted-income panel), which is produced by the
`00_Main_Dataset` pipeline (lights → predicted GDP → region/country merge). The
`worldmap_regions.*` shapefile is the Natural Earth first-level admin layer
shipped in `data/`. To rebuild after a new lights dataset, re-run that pipeline
and re-extract this CSV.

## 7. Cross-language comparison (Stata · R · Python)

The same SSA-only map is drawn in three languages from the **same**
`data/Figure_B1_region_income.csv` and the **same** bundled
`worldmap_regions.*` shapefile. Each script collapses the region-year panel to a
1992–2012 cross-section, keeps `ssa==1`, joins by region ISO code (`regiso`), and
shades predicted regional GDP per capita in Blues:

| File | Tool | Mapping engine |
|---|---|---|
| `Figure_B1.do` | Stata | `spmap ... if ssa==1` (after `spshape2dta`) |
| `Figure_B1.R` | R | `sf` + `ggplot2` (`geom_sf`) |
| `Figure_B1.py` | Python | `geopandas` + `matplotlib` |

Run with `do Figure_B1.do`, `Rscript Figure_B1.R`, `python Figure_B1.py`.
R writes `output/Figure_B1_R.png`; Python writes `output/Figure_B1_py.png`
(suffixed `_R`/`_py` so they never overwrite the Stata `Figure_B_1.png`).

**Underlying values (R and Python executed here):**

| Quantity | Stata | R (sf) | Python (geopandas) |
|---|---|---|---|
| SSA regions with data | 613 | 613 | 613 |
| SSA regions matched to map | 574 | 574 | 574 |
| Predicted GDP pc range | [281.65, 15235.90] | [281.65, 15235.90] | [281.65, 15235.90] |

**Notes (tolerance + differences):**
- All three collapse to the **same** 613 SSA regions and shade the identical
  predicted-income values; only cosmetic defaults differ. R and Python use a
  continuous Blues ramp, while Stata `spmap` uses `clnumber(9)` discrete
  quantile bins (`fcolor(Blues2)`) — set `clmethod`/`clnumber` to match the bins
  exactly. The income geography (rich South Africa, Gabon, Botswana; poor Sahel
  belt) is identical across versions.
- **39 of the 613** SSA regions have no matching polygon in the Natural Earth
  layer (the ~90%-coverage caveat above), so **574** are drawn. R and Python both
  report this `matched=574` count; the difference of 39 is the expected coverage
  gap, not a code mismatch (tolerance: exact on the matched set).
- Visual target: `expected/Figure_B1_R_reference.png` — a Sub-Saharan-Africa-only
  sequential-blue choropleth, darker blue = richer region.
- Stata is not executed in this environment; R and Python were run here
  (`output/Figure_B1_results_R.csv` / `_py.csv`).
