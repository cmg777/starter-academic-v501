# _verification — build & QA harness (NOT part of the Stata deliverable)

These R scripts (a) build each folder's trimmed data and (b) cross-check that the
shipped CSVs reproduce the paper's numbers. The deliverable is the Stata code in
the table/figure folders; this folder only documents how the data was produced
and verified. Stata was not available on the build machine, so verification was
done in R against the committed Stata outputs and the manuscript.

Run order (from the repository root, with R + `haven`, `readr`, `fixest`, `plm`,
`sandwich`, `sf`, `ggplot2`):

| Script | Purpose |
|---|---|
| `00_inspect_sources.R` | dump variable names/labels of every source `.dta` → `source_metadata.txt` |
| `10_extract_csvs.R` | write each folder's trimmed `data/*.csv` + `data_dictionary.csv` |
| `12_pipeline_dictionary.R` | combined 3-file dictionary for `00_Main_Dataset` |
| `15_build_maps.R` | build bundled Natural Earth shapefiles + map reference PNGs |
| `20_verify_tables.R` | reproduce Table 1/3/4/B.4 coefficients from the trimmed CSVs |
| `21_verify_fig_tab2.R` | Table 2 correlations + figure CSV-sufficiency checks |
| `25_render_figure_refs.R` | ggplot reference PNGs for the non-map figures |

`15_build_maps.R` expects two Natural Earth GeoJSON files in `geo/` (removed from
the repo to save ~42 MB). Regenerate them with:

```
mkdir -p geo
B=https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson
curl -sSL "$B/ne_50m_admin_0_countries.geojson"        -o geo/ne_admin0.geojson
curl -sSL "$B/ne_10m_admin_1_states_provinces.geojson" -o geo/ne_admin1.geojson
```

Results are summarised in `VERIFICATION_REPORT.md`.
