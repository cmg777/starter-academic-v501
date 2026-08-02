# 2026-08-02 — the last "rung"s on the site

Third and final pass, after
[the Python bundle](2026-08-02-python-sc-dsc-sdid-rung-to-stage.md) and
[the R bundle](2026-08-02-r-sc-dsc-sdid-rung-to-stage.md). **No occurrence of the word survives
anywhere in `content/`.**

## Two posts, two different replacement words

The remaining 12 occurrences sat in two unrelated posts, and they did **not** take the same word.

### `python_dynamic_panel` → "stage"

Three occurrences, all the estimator-ladder metaphor, and "stage" was free in that bundle:

| File | Change |
|---|---|
| `slides/slides.qmd` | speaker notes: "each rung fails informatively" → "each stage fails informatively" |
| `slides/SLIDES_REVIEW.md` | the same phrase, quoted in a deferred suggestion |
| `web_app/index.html` | "not picking the prettiest p-value, but picking the rung" → "…the stage" |

### `python_kuznets_dmsp` → "spec" / "specification"

Nine occurrences, and **"stage" was already taken there** — that post uses it for the study's own
pipeline: "the four stages", "the first two stages — *prediction* and …", "the first of the two
construction stages", "the second construction stage". A "seven-stage ladder" of regression
specifications beside a four-stage research design would have meant two different things.

"Step" was unavailable too: the code blocks are organised as `Step 1:`, `Step 2:`, `Step 3:`.

The post already calls the thing "the ladder of specifications" and the Python dict is literally
named `specs`, so the word chose itself:

- prose: "We show four rungs — pooled, region fixed effects, …" → "We show four **specifications** — …"
- code comments: `# rung 1: pooled OLS` → `# spec 1: pooled OLS` (and specs 2, 4, 7)
- `# --- Step 2: … (each rung adds something)` → `(each spec adds something)`
- `# --- Step 3: fit each rung and read off …` → `fit each spec and read off …`
- `* --- Step 1: the seven-rung ladder …` → `the seven-spec ladder` (`stata_replication.do`,
  and the copy embedded at `index.md:1813`)

**`rung` → `spec` and `seven-rung` → `seven-spec` are the same character count**, so every
trailing `---` comment rule stayed aligned and no code block reflowed.

## What was deliberately left alone

- **Vendored third-party material.** `python_sc_co2tax/references/RTutorCarbonTax-master/*.Rmd`
  matches a case-insensitive `rung` search, but has **zero** word-boundary matches — the hits are
  German nouns ending in *-rung* (Änderung, Berechnung) inside a redistributed RTutor problem set.
- **Minified and lock files.** `mermaid.min.js` (×4 posts), `renv.lock`, and some vendored
  `tutorial.html` files match only as substrings inside identifiers. Verified: 0 word-boundary hits.
- **The two rename logs.** They must use the word to explain the change.

Two older logs *did* get updated, since they describe post content that has since been reworded:
`2026-08-01-r-sc-dsc-sdid-tutorial.md` (4) and `2026-08-02-sc-dsc-sdid-audit.md` (1).

## Knock-on

- `python_dynamic_panel/slides/index.html` re-rendered.
- Two orphaned `quarto-syntax-highlighting-*.css` files dropped from that deck's `slides_files/` —
  light-theme variants left behind by an older build, unreferenced by the current `index.html`.
  (The same cleanup was applied to the R deck in the previous commit.)
- No bundle rebuilds needed: `python_kuznets_dmsp.zip` does not include `stata_replication.do`
  (it ships `tutorial.qmd`, `setup_env.py`, `_quarto.yml`, `README.md`, the render scripts and
  `script.py`, none of which contained the word), and `python_dynamic_panel.zip` verified clean.
- `python_kuznets_dmsp/script.py` and `notebook.ipynb` never contained it — the renamed comments
  live only in the post's displayed snippet.

## Verification

| Check | Result |
|---|---|
| `smoke-test.js` on `python_dynamic_panel` | 15/15 |
| Repo-wide word-boundary sweep of `content/` | **0 matches** |
| `python_dynamic_panel.zip` | 0 matches |
| Comment-rule alignment in the kuznets code block | unchanged (same character counts) |

## The site's vocabulary now

| Post | Word | Why |
|---|---|---|
| `python_sc_dsc_sdid`, `r_sc_dsc_sdid` | **stage** | the six-estimator ladder |
| `python_dynamic_panel` | **stage** | same metaphor, same word |
| `python_kuznets_dmsp` | **spec / specification** | "stage" already means the research design's phases |
