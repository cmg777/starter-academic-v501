# Auto-drafting `data_dictionary.yaml` from a post

Goal: produce a high-quality first draft the user only has to lightly edit. Extract from the
post's own writing first; infer from data second; **leave blank rather than invent**.

## Where to look in the post (priority order)

1. **Appendix data dictionary** — many posts (e.g. `python_kuznets_dmsp` §"Appendix A. Data
   dictionary") contain tables with columns like *Variable | What it is | How constructed | Source
   | Unit | Coverage*. Map these directly:
   `What it is → definition`, `How constructed → construction`, `Source → source`, `Unit → units`,
   `Coverage → coverage`, and a short form of *What it is* → `label`.
2. **A `## Data` / "data dictionary" / "variables" section** in the body — prose or a smaller
   table; same mapping.
3. **Methods / model section** — for constructed variables (indices, transforms, predictions),
   lift the formula into `construction` and, if the post explains several, gather them into
   `study.formulas_html`.
4. **The post's script** (`script.py`/`.R`/`.do` or the fenced code in `index.md`) — variable
   creation lines, comments, and any label statements (`label var`, `rename`, `df.rename`,
   `attr(...,'label')`) give labels/definitions and reveal how a column was built.
5. **Sources** — a "Data sources"/"References" list or per-variable source column → `sources[]`
   (name / provides / reference-with-URL).
6. **Caveats** — "limitations", "caveats", "notes" prose → `caveats[]`.
7. **Citation** — the post's author (default **Mendez, Carlos**) + the post's `date:` front-matter
   year → `citation.author`/`year`; if the post replicates/credits another study, add it as
   `citation.extra_apa` / `extra_bibtex`.

Delegate large PDFs/long appendices to an `Explore` agent (per the repo's PDF-handling
convention) and extract only the variable rows.

## Inferring from the data (fill the gaps the prose doesn't cover)

For every column across all datasets, compute from the data and set:
- `kind` — only if you want to override inference (all-0/1 → dummy; year-like int or name `year`
  → year; non-numeric → str/id; else cont). Set `kind: id` for integer identifiers that would
  otherwise read as continuous (codes, FIPS, IDs).
- `label` — if no prose label, draft a human label from the column name (expand snake_case,
  title-case sensibly: `log_gdp_pc` → "Log GDP per capita"); keep ≤80 chars.
- `units` — infer from name hints (`_pct`/`share`→ratio/%, `log_`→log, `_usd`→US$, lat/lon→degrees)
  only when confident; else blank.
- `value_labels` — for dummies, default `{0: "No", 1: "Yes"}` (the renderer adds this
  automatically); add explicit maps for coded categoricals you understand.

## Per-dataset (`files`) drafting

For each data file, draft `label`, `grain` (region-year / country-year / cross-section / panel —
infer from the key columns), `years` (min–max of a year column if present), `coverage` (e.g. "N
units"), `key` (the apparent id × time columns), and a one-line `purpose` (from how the post uses
that file, e.g. "training set for Table 1"). `note` is the long-form `_dta` note (optional).

## KPIs

Default cards (datasets / variables / rows / data points) suit any post. Add
`study.kpis` overrides only when the post has a natural headline metric (e.g. countries, a year
span) — detect a `Country*`/`iso`/`country` id column for a "countries" count and a `year` column
for a span.

## Quality bar

- Prefer the post's own wording for definitions/construction (quote tightly), so the dictionary
  stays consistent with the article.
- Don't fabricate sources or coverage numbers — blank is better than wrong.
- Keep labels terse and consistent in style across variables.
- After drafting, show the YAML (or a per-dataset summary of how many fields were filled vs left
  blank) so the user can target their edits.
