# Figure 1 — Predicted regional income (subnational world map)

Reproduces **Figure 1** of Lessmann & Seidel (2017): a choropleth world map
drawn at the **subnational** (NUTS-1 / admin-1) level, shading each region by its
predicted GDP per capita averaged over **1992–2012**.

> **Software:** Stata 15+ · R · Python · **Package:** `ssc install spmap`
> **Run:** `cd` into this folder in Stata, then `do Figure_1.do`. Output → `output/`.

---

## 1. What this figure shows (in plain terms)

Each subnational region of the world is coloured by how rich it is, where
"richness" is GDP per capita **predicted from satellite night-lights**. Darker
**blue = higher** predicted regional income. The point of the map is visual and
fundamental to the paper: income varies dramatically *within* countries, not
only between them. That within-country variation is exactly the "regional
inequality" the rest of the paper measures and explains.

## 2. Method, explained simply

- **Collapse to one snapshot**: annual region-level predicted income is averaged
  over 1992–2012, giving one number per region.
- **Attach to geometry**: those numbers are merged onto a world shapefile of
  region polygons, matched on the region code `regiso`.
- **`spmap` choropleth**: `spmap` fills each polygon with a colour from the
  `Blues2` palette, split into **9 quantile classes** (`clnumber(9)`). Regions
  with no matching value are drawn as **"no data"** (uncoloured).
- No regression is involved — this is a pure mapping/visualisation step.

## 3. Data dictionary — `data/Figure_1_region_income.csv`

Region-year panel trimmed from `pred_GDP_pc_Region.dta`. Machine-readable copy
in `data_dictionary.csv`.

| Variable | Type | Label / meaning |
|---|---|---|
| `Region_ISO` | string | region code (subnational unit), keyed to map field `regiso` |
| `year` | numeric | year |
| `ssa` | numeric | Sub-Saharan Africa indicator (1 = yes) |
| `pred_GDP_pc_Region` | numeric | predicted **regional** GDP per capita (from night-lights) — *the mapped variable* |
| `pred_GDP_pc_Country` | numeric | predicted **national** GDP per capita (the region's country) |

Bundled map (Natural Earth admin-1): `data/worldmap_regions.(shp|shx|dbf|prj)`,
whose only attribute field is `regiso` (the region code used for the merge).

Variables built inside the do-file: `regiso` (renamed from `Region_ISO`), and
`_ID` plus the `_shp.dta` coordinates created by `spshape2dta`.

## 4. How to run

1. Install the package once (skip if present): in Stata, `ssc install spmap`.
2. `cd` into this folder, e.g. `cd ".../replication/Figure_1"`.
3. Run: `do Figure_1.do`.

The do-file converts the bundled shapefile with `spshape2dta` (Stata 15+),
merges the region income values, and writes `output/Figure_1.png` and
`output/Figure_1.gph`.

## 5. Expected result

A **subnational Blues choropleth**: darker blue regions are richer in predicted
income. The spatial pattern matches `expected/Figure_1_R_reference.png`
(manuscript.pdf p.116).

> **Important limitation.** The bundled geometry is the **Natural Earth admin-1**
> shapefile, which matches roughly **90%** of the paper's regions. The original
> map used a **GADM-3.6** shapefile that is no longer downloadable. Regions that
> do not match by `regiso` appear as **"no data"** (uncoloured) on the map, so a
> small set of polygons will be blank relative to the published figure. The
> visible income gradient, and the overall message, are unaffected.

## 6. Provenance

`data/Figure_1_region_income.csv` is trimmed from `Data/pred_GDP_pc_Region.dta`,
which is produced by the `00_Main_Dataset` pipeline (lights → predicted regional
GDP). The bundled `worldmap_regions.*` files are a Natural Earth admin-1
shapefile keyed by `regiso` (substituted for the unavailable GADM-3.6 geometry
that the original `NODATA_2.dta` / `NOCORD_2` map files were built from). To
rebuild after a new lights dataset, re-run that pipeline and re-extract this CSV.

## Cross-language comparison (Stata · R · Python)

The same **subnational** map is drawn in three languages from the **same**
`data/Figure_1_region_income.csv` and the **same** bundled
`worldmap_regions.*` admin-1 shapefile (key field `regiso`). All three keep
years **1992–2012**, collapse to the **mean** of `pred_GDP_pc_Region` (and `ssa`)
by `Region_ISO`, rename `Region_ISO → regiso`, merge onto the polygons, and draw
a **Blues** choropleth on a **log** colour scale.

| File | Tool | Mapping engine |
|---|---|---|
| `Figure_1.do` | Stata | `spmap` (after `spshape2dta`) |
| `Figure_1.R` | R | `sf` + `ggplot2` (`geom_sf`) |
| `Figure_1.py` | Python | `geopandas` + `matplotlib` |

Run with `do Figure_1.do`, `Rscript Figure_1.R`, `python Figure_1.py`.
R writes `output/Figure_1_R.png`; Python writes `output/Figure_1_py.png`
(suffixed so they never overwrite the Stata `output/Figure_1.png`).

**Underlying values (R and Python executed here):**

| Quantity | Stata | R (sf) | Python (geopandas) |
|---|---|---|---|
| Regions with data | ~3166 | 3166 | 3166 |
| Regions matched to map | ~90% | 2843 | 2843 |
| % matched | ~90% | 89.8% | 89.8% |
| Predicted GDP p.c. range | — | [281.6, 66634.2] | [281.6, 66634.2] |

**Notes (tolerance + differences):**
- R and Python are **identical**: same 3166 data regions, the same **2843**
  (89.8%) matched to the admin-1 geometry — squarely the **~90%** the Stata
  reference and README expect — and the same `pred_GDP_pc_Region` range
  `[281.6, 66634.2]`. The remaining ~10% of data regions have no matching
  `regiso` polygon (Natural Earth admin-1 substituted for the unavailable
  GADM-3.6 geometry) and are drawn as **"no data"** (light grey), exactly as in
  the .do.
- Only cosmetic defaults differ. R/Python use a continuous Blues + log10 colour
  scale; Stata `spmap` uses **9 discrete quantile bins** (`clnumber(9)`,
  `fcolor(Blues2)`) — set the same `clmethod`/`clnumber` to match the binning
  exactly. The income gradient (rich North America / Europe / Australia / Gulf
  dark; Sub-Saharan Africa and parts of South/Central Asia light) is the same in
  all three.
- Visual target: `expected/Figure_1_R_reference.png` (manuscript.pdf p.116).
- Stata is not executed in this environment; R and Python were run here
  (`output/Figure_1_results_R.csv` / `_py.csv`).
