# Figure A.2 — Predicted vs observed regional GDP, by regional output density

Reproduces **Figure A.2** of Lessmann & Seidel (2017). A validation scatter:
satellite-**predicted** regional GDP per capita against directly **observed**
regional GDP per capita (averages 2001–2010), with regions split into three
**output-density** tiers and a 45-degree perfect-prediction line.

> **Software:** Stata · R · Python · **Package:** none
> **Run:** `cd` into this folder in Stata, then `do Figure_A2.do`. Output → `output/`.

---

## 1. What this shows (in plain terms)

The paper's whole method rests on predicting regional income from **night-light
intensity** seen from space. This figure asks the obvious sanity question: *when
we can also see the region's true GDP, does the satellite prediction match it?*

Each dot is one region. The x-axis is the (log) **predicted** regional GDP per
capita; the y-axis is the (log) **observed** regional GDP per capita. The black
**45-degree line (y = x)** is the perfect-prediction benchmark. If the proxy
were exact, every dot would sit on that line. The tight cloud around the line
says the night-lights proxy is a good stand-in for hard-to-get regional GDP.

The companion Figure A.1 splits regions by their **country's** income group
(LIC/MIC/HIC). Figure A.2 instead splits the same regions by their **own
regional output density** — output per unit of lit area — into three tiers
(LDIR/MDIR/HDIR), showing the proxy works across the density spectrum, not just
for dense, brightly-lit places.

## 2. Method, explained simply

- **Cross section, 2001–2010**: keep those years and average each region down to
  **one row per region** (`collapse … by(code_Coutry_Region)`).
- **Output density** = total regional output ÷ lit area =
  `(GDP_pc_Region * Pop_Region) / Pix_Region`. This is the splitting variable.
- **Three density tiers** (fixed cutoffs from the original):
  - `LDIR` low-density industrial regions — density **< 168,071.5**
  - `MDIR` medium-density industrial regions — **168,071.5 – 1,478,853**
  - `HDIR` high-density industrial regions — density **> 1,478,853**
- **Plot**: three overlaid `scatter`s (one per tier, different markers) plus a
  `function y=x` line over the range 5.5–12. The legend is tucked inside the
  plot (`ring(0) pos(5)`).
- **No regression here** — this is a descriptive validation chart, not an
  estimate.

## 3. Data dictionary — `data/Figure_A2_data.csv`

Region-year panel trimmed from `pred_GDP_pc_Region_G.dta`. Machine-readable copy
in `data_dictionary.csv`.

| Variable | Type | Label / meaning |
|---|---|---|
| `code_Coutry_Region` | numeric | region code (unique region id; original spelling "Coutry") |
| `Region_NAME` | string | region name |
| `Country_ISO` | string | country code, ISO 3166-1 alpha-3 |
| `year` | numeric | year |
| `GDP_pc_Country` | numeric | national GDP per capita, PPP constant 2005 US$ |
| `GDP_pc_Region` | numeric | observed regional GDP per capita, PPP constant 2005 US$ |
| `log_GDP_pc_Region` | numeric | log observed regional GDP per capita (y-axis) |
| `pred_log_GDP_pc_Region` | numeric | log **predicted** (from lights) regional GDP per capita (x-axis) |
| `pred_GDP_pc_Region` | numeric | predicted (from lights) regional GDP per capita, levels |
| `Pix_Region` | numeric | region area, measured as the number of (lit) pixels |
| `Pop_Region` | numeric | regional total population |

Variable built inside the do-file: `GDP_dens_Region` (regional output density,
used to form the LDIR/MDIR/HDIR tiers).

## 4. How to run

```stata
* in Stata, from this folder:
cd "<...>/replication/Figure_A2"
do Figure_A2.do
```

No `ssc` packages required. Outputs land in `output/`:
`figure_A_2.gph` (editable) and `figure_A_2.png` (width 1600).

## 5. Expected result

A scatter that lies tightly along the **45-degree line** across all three
density tiers (LDIR/MDIR/HDIR) — predicted regional GDP closely tracks observed
regional GDP, confirming the night-lights proxy. Visual target:
`expected/Figure_A2_R_reference.png` (manuscript p.129).

## 6. Provenance

`data/Figure_A2_data.csv` is trimmed from `Data/pred_GDP_pc_Region_G.dta`, the
region-level prediction file produced by the `00_Main_Dataset` pipeline
(lights → predicted regional GDP → merge with observed regional GDP). The
original code averaged two helper series (`Country_ISO_long`,
`GDP_pc_Country_G`) that are not needed for this figure and were dropped from the
trimmed CSV; the `collapse` here therefore lists the required variables
explicitly instead of using the original dash-range. Note the CSV header keeps
the source's original misspelling `code_Coutry_Region`. To rebuild after a new
lights dataset, re-run the pipeline and re-extract this CSV.

## 7. Cross-language comparison (Stata · R · Python)

The figure is reproduced in three languages from the **same**
`data/Figure_A2_data.csv` (collapse to one 2001–2010 row per region, build the
output-density tiers, scatter predicted vs observed log regional GDP pc + the
y = x line):

| File | Tool | What it draws with |
|---|---|---|
| `Figure_A2.do` | Stata | `collapse` + `twoway scatter`/`function y=x` |
| `Figure_A2.R` | R | `dplyr` collapse + `ggplot2` (`geom_point`/`geom_abline`) |
| `Figure_A2.py` | Python | `pandas` groupby + `matplotlib` (`scatter`/`plot`) |

Run with `do Figure_A2.do`, `Rscript Figure_A2.R`, `python Figure_A2.py`.
R writes `output/Figure_A2_R.png`; Python writes `output/Figure_A2_py.png`
(both suffixed so they never overwrite the Stata `figure_A_2.png`).

**Headline numbers — R and Python executed here:**

| Quantity | Stata (reference) | R (dplyr/ggplot2) | Python (pandas/matplotlib) |
|---|---|---|---|
| Regions plotted (N) | 45° scatter | 1418 | 1418 |
| corr(observed, predicted) log GDP pc | tight along y = x | 0.9173 | 0.9173 |
| LDIR / MDIR / HDIR counts | 3 density tiers | 357 / 707 / 354 | 357 / 707 / 354 |

**Notes (tolerance + differences):**
- The collapse, density tiers, and 45-degree line are identical across the three
  versions. R and Python agree to full double precision: N = **1418** regions and
  `corr(observed, predicted)` = **0.91730** (both, to 5 dp).
- The density-tier splits use the same fixed cutoffs (168,071.5 and 1,478,853),
  giving the same **357 / 707 / 354** LDIR/MDIR/HDIR counts in both languages.
- The Stata column is the descriptive **visual** target (no numbers are printed
  by the do-file); the cloud hugging the y = x line matches
  `expected/Figure_A2_R_reference.png`. R and Python numbers are in
  `output/Figure_A2_results_R.csv` / `_py.csv`.
- Cosmetic only: marker glyphs and the legend placement differ slightly by
  plotting library (ggplot2's outside legend vs matplotlib's inside lower-right);
  the point cloud, tiers, and 45-degree line are the same shape in all three.
