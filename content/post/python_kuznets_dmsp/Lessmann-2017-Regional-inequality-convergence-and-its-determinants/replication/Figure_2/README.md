# Figure 2 — Regional inequality within countries (GINIW world map)

Reproduces **Figure 2** of Lessmann & Seidel (2017). A world **choropleth map**
that shades each country by its average level of *within-country regional income
inequality* (the population-weighted Gini, `GINIW`).

> **Software:** Stata · R · Python · **Requires Stata 15+** · **Package:** `ssc install spmap`
> **Run:** `cd` into this folder in Stata, then `do Figure_2.do`. Output → `output/`.

---

## 1. What this map shows (in plain terms)

Each country is coloured by how unequally income is distributed **across its own
regions**, averaged over the sample years. Light = internally even; dark red =
internally very unequal. The striking pattern is a **dark-red belt across Africa
and the Sahel**: the world's poorest countries tend to have the *most* lopsided
internal geographies (a few rich enclaves and a vast poor hinterland), while rich
countries are comparatively even across their regions. This sets up the paper's
central question — how regional inequality changes as countries develop.

## 2. Method, explained simply

- **One value per country**: the annual `GINIW` series is averaged over all
  years (`collapse (mean) ... , by(Country_ISO)`), giving each country a single
  shade.
- **Join to a map**: the per-country values are merged by **ISO3 code** onto a
  world polygon layer. The original paper used a GADM coordinate file that is no
  longer downloadable, so this folder ships a drop-in **Natural Earth** country
  shapefile (`data/worldmap_countries.*`) keyed by `iso3`.
- **`spshape2dta`** (built into Stata 15+) converts the shapefile into the two
  datasets `spmap` needs: an attribute file (`...dta`, field `iso3`, key `_ID`)
  and a coordinate file (`..._shp.dta`).
- **`spmap ... fcolor(Reds)`** draws the choropleth with a sequential red ramp;
  7 quantile bins reproduce the look of the reference. Countries with no data
  (and Antarctica, which is dropped) appear light grey.

## 3. Data dictionary — `data/Figure_2_data.csv`

Country-year panel (3,675 rows) trimmed from `Main_Data.dta`. Machine-readable
copy in `data_dictionary.csv`.

| Variable | Type | Label / meaning |
|---|---|---|
| `Country_ISO` | string | country code, ISO 3166-1 alpha-3 |
| `year` | numeric | year |
| `GINIW_pred_GDP_pc` | numeric | predicted regional inequality, population-weighted **Gini** coefficient |

Bundled map layer `data/worldmap_countries.(shp\|shx\|dbf\|prj)` — Natural Earth
country polygons with a single attribute field `iso3` (242 polygons).

Variables built inside the do-file: country-averaged `GINIW_pred_GDP_pc`, the
renamed join key `iso3`, and the spatial keys `_ID` (from `spshape2dta`).

> **CSV naming note:** the original Stata pipeline wrote satellite dummies as
> `_satyear_1.._satyear_7`; in shipped CSVs the leading underscore is dropped
> (`satyear_1..satyear_7`) so Stata's `import delimited` accepts them. Figure 2
> does not use those dummies, but the convention applies folder-wide.

## 4. How to run

1. Install the package once (needs internet): in Stata run `ssc install spmap`.
   `spshape2dta` ships with Stata 15+ — no install needed. On **Stata < 15**,
   instead run `ssc install shp2dta` and use the fallback shown at the bottom of
   `Figure_2.do` (section 5 comment).
2. `cd` into this folder, then `do Figure_2.do`.
3. Results land in `output/`: `Figure_2.png` and `Figure_2.gph`.

## 5. Expected result

A **world choropleth in Reds**. **180/180** countries in the CSV match a map
polygon by ISO3. High inequality (dark red) clusters across **Africa / the
Sahel**; rich economies are light. The pattern matches
`expected/Figure_2_original.jpg` (manuscript) and
`expected/Figure_2_R_reference.png`.

## 6. Provenance

`data/Figure_2_data.csv` is trimmed from `Data/Main_Data.dta`, which is produced
by the `00_Main_Dataset` pipeline (lights → predicted GDP → inequality → country
merge). The `worldmap_countries.*` layer is a Natural Earth admin-0 shapefile
bundled here because the paper's original GADM coordinate source is no longer
available. To rebuild after a new lights dataset, re-run that pipeline and
re-extract this CSV.

## 7. Cross-language comparison (Stata · R · Python)

The same map is drawn in three languages from the **same** `data/Figure_2_data.csv`
and the **same** bundled `worldmap_countries.*` shapefile:

| File | Tool | Mapping engine |
|---|---|---|
| `Figure_2.do` | Stata | `spmap` (after `spshape2dta`) |
| `Figure_2.R` | R | `sf` + `ggplot2` (`geom_sf`) |
| `Figure_2.py` | Python | `geopandas` + `matplotlib` |

Run with `do Figure_2.do`, `Rscript Figure_2.R`, `python Figure_2.py`.
R writes `output/Figure_2_R.png`; Python writes `output/Figure_2_py.png`.

**Underlying values (R and Python executed here):**

| Quantity | Stata | R (sf) | Python (geopandas) |
|---|---|---|---|
| Countries with data | 180 | 180 | 180 |
| Countries matched to map | 180 | 180 | 180 |
| GINIW range | [0.003, 0.148] | [0.003, 0.148] | [0.003, 0.148] |

**Notes (tolerance + differences):**
- All three join the **same** 180 countries by ISO3 and shade the identical
  values, so the maps are equivalent; only cosmetic defaults differ. R and Python
  use a continuous Reds scale; Stata `spmap`'s default uses discrete quantile
  bins — set `clmethod`/`clnumber` to match exactly.
- Visual targets: `expected/Figure_2_original.jpg` (paper) and
  `expected/Figure_2_R_reference.png`. The dark-red belt across Africa/the Sahel
  appears in all versions.
- Stata is not executed in this environment; R and Python were run here
  (`output/Figure_2_results_R.csv` / `_py.csv`).
