# Feature catalog — what the generated page contains

The renderer (`templates/build_data_dictionary.py`) already implements every feature below; this
is the spec/source-of-truth so you can confirm parity and know what to fix if a feature regresses.
The reference page is `content/post/python_kuznets_dmsp/data/index.html`.

## Page sections (in order; optional ones auto-omit when their metadata is empty)

1. **Hero** — gradient header, kicker "Interactive data dictionary", title + subtitle, "← Back to
   the post" link, and **KPI cards** (default: datasets / variables / rows / data points; or
   `study.kpis`).
2. **Sticky top nav** — links to every present section + a **dark-mode toggle** (right-aligned);
   **scroll-spy** highlights the current section.
3. **Downloads** — "Download all (ZIP)" + `stata_codebook.do`, and a per-dataset table with a
   `.dta` button and a source-file button. Links are **raw.githubusercontent.com** URLs.
4. **Load in code** — copy-paste **Stata** (`use <url>`), **Python** (`pd.read_stata(<url>)` +
   load-all loop + a `pyreadstat` download example with `!pip install -q pyreadstat`), and **R**
   (`haven::read_dta`) snippets, each with a Copy button; a Google-Colab note under Python.
5. **Overview & sources** *(optional)* — overview prose, an optional note box, and a sources table.
6. **Cite this data** *(optional)* — APA + BibTeX blocks with Copy buttons.
7. **Variable explorer** — one row per unique variable: name + **`#` copy-permalink**, type badge,
   **distribution sparkline**, label, definition, units, **"In files"** links (jump to the dataset
   tab), source. **Live search** + **type-filter chips**; sortable; in a capped (78vh) scroll-box
   with a sticky header; each row has `id="var-<name>"`.
8. **Cross-file variable index** — presence matrix (● per file); each variable links to its
   explorer row (`#var-<name>`).
9. **Construction & formulas** *(optional)* — `formulas_html`.
10. **Datasets** — an **"Expand all datasets"** toggle (makes browser Ctrl+F and printing cover
    every dataset) + dataset **tabs**; each panel = a variable-dictionary table + a **sortable
    statistics** table with **distribution sparklines** and **coverage (missingness) bars**.
11. **Known limitations & caveats** *(optional)* — `caveats`.
12. **Footer** — generated-by note + back-to-post link.

## Interactive behaviors

- **Tabs**: each shows exactly one dataset panel; the others are `display:none` (so a single tab
  prints/searches by default — hence the Expand-all toggle).
- **Expand all / Tabbed view**: toggles all panels visible; `@media print` forces all panels
  visible and uncaps tall tables and strips chrome.
- **Dark mode**: a boot script resolves `localStorage('dd-theme')` or `prefers-color-scheme` before
  paint (no flash); the toggle flips `document.documentElement.dataset.theme` and persists it.
- **Sortable tables**: numeric-aware; the Distribution and Coverage columns are `nosort`.
- **Sparklines**: inline SVG histograms (continuous, winsorized 2–98 pct) or 0/1 bars (dummy),
  with a `<title>` tooltip; computed in Python from the data.
- **Copy buttons**: code blocks and per-variable permalinks copy to clipboard.

## Non-negotiable correctness checks (regression guards)

- Every `.ds-panel` div is **closed** (panels are siblings, not nested) — otherwise non-first tabs
  render blank. (This was a real bug in the reference page; keep the closing `</div>`.)
- `.dta` files are written at **release 118** (pyreadstat `version=14`); value labels present on
  dummies.
- All download/load links use raw GitHub (no folder/blob navigation links exposed to readers).
- Tag balance (sections/tables/divs) even; no JS console errors.
