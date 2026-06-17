# `data_dictionary.yaml` schema

The per-post metadata file that drives `build_data_dictionary.py`. Everything is **optional** —
the renderer falls back to sensible defaults (label = variable name, `kind` inferred from data,
empty sections omitted). Statistics are always computed from the data, never written here.

```yaml
study:
  title: "Regional Inequality from Outer Space"     # page H1; defaults to the slug
  subtitle: "One-line description under the title"   # optional
  overview: "HTML/prose paragraph for the Overview section."   # optional; omitted if blank
  panel_structure: "Optional note box under the overview (HTML allowed)."   # optional
  post_url: "https://carlos-mendez.org/post/<slug>/"  # optional; auto-derived from baseURL+slug
  kpis:                                              # optional; overrides the 4 default KPI cards
    - {n: 180, l: "countries"}
    - {n: "1992–2012", l: "years"}
  # default KPIs (when omitted): datasets, variables, rows, data points

dta_format_version: 118        # optional; 117/118/119 -> Stata version 13/14/15. Default 118.

sources:                       # optional list; renders the "Data sources" table. Omitted if empty.
  - name: "World Bank WDI"
    provides: "National accounts and determinants"
    reference: "World Bank, WDI. https://databank.worldbank.org/source/world-development-indicators"

formulas_html: |               # optional raw HTML; renders the "Construction & formulas" section.
  <p>Index definitions...</p>
  <ul class="tight"><li><strong>Gini</strong>: <code>...</code></li></ul>

caveats:                       # optional list (HTML allowed per item); "Known limitations" section.
  - "DMSP digital numbers cap at 63 (top-coding)."
  - "Determinant coverage varies by country-year."

citation:                      # optional; renders the "Cite this data" section (APA + BibTeX).
  author: "Mendez, Carlos"     # "Last, First" — APA initials are derived automatically
  year: "2026"
  title: "Full title for the citation"   # optional; defaults to study.title
  apa: |                       # optional; auto-built from author/year/title/url if omitted
  bibtex: |                    # optional; auto-built (@misc) if omitted
  extra_apa: "Original study reference, appended to the APA block."     # optional
  extra_bibtex: "@article{...}"                                          # optional

files:                         # per dataset; key = source filename OR base name. Order is preserved.
  Table_3_data.csv:
    label: "Country-year panel: GDP + 5 indices"   # <=80 chars; becomes the .dta dataset label
    grain: "country-year"
    years: "1992-2012"
    coverage: "180 countries"
    key: "Country_ISO x year"
    purpose: "Estimate the spatial Kuznets curve"
    note: "Long-form _dta note attached by stata_codebook.do."

columns:                       # per UNIQUE variable name (across all datasets)
  GINIW_pred_GDP_pc:
    label: "Pop-weighted regional Gini (predicted income)"   # <=80 chars; the .dta variable label
    definition: "Population-weighted Gini of predicted regional income within a country-year."
    construction: "Gini of pred_GDP_pc_Region weighted by Pop_Region, per country-year."
    units: "0-1"
    source: "This study"
    coverage: "country frame"
    kind: cont                 # cont | dummy | id | str | year. Optional; inferred if omitted.
    value_labels: {0: "No", 1: "Yes"}   # optional; dummies default to {0:No,1:Yes}
```

## Field rules

- **Labels** are truncated to 80 chars (Stata limit). Keep them tight; put detail in `definition`.
- **`kind`** drives value labels, statistics, and the sparkline. Inference: all-0/1 → `dummy`;
  integer in [1800,2100] or a column literally named `year` → `year`; non-numeric → `str`;
  otherwise `cont`. Override here when inference is wrong (e.g., a coded category that looks
  continuous, or an ID stored as an integer → set `kind: id`).
- **`value_labels`** keys must be integers; applied to that column in the `.dta`.
- **Variable names** must be valid Stata names for the `.dta` (≤32 chars, letters/digits/underscore,
  start with a letter). The renderer warns if a name is invalid; rename in the source data first.
- **Sections auto-omit** when empty: `sources`, `formulas_html`, `caveats`, `citation`, and the
  whole Overview section (shown only if any of overview/panel_structure/sources exists).
- **`files` order** sets the dataset tab order; any datasets not listed are appended alphabetically.

## Input formats (what the renderer reads from `data/`)

| Ext | Reader | Notes |
|---|---|---|
| `.csv` | `pd.read_csv` | the core convention |
| `.parquet` | `pd.read_parquet` | needs `pyarrow` (install on demand) |
| `.xlsx` | `pd.read_excel(sheet_name=0)` | first sheet only; split multi-sheet workbooks into separate files |
| `.dta` | `pyreadstat.read_dta` | reuses embedded labels as fallback when the YAML omits them |

For each dataset (grouped by base name; source picked by priority `csv > parquet > xlsx > dta`)
the renderer always writes a labeled `<base>.dta`. Generated outputs (`.dta`, README, `.do`, ZIP,
`index.html`, the script, the YAML) are excluded from input discovery.
