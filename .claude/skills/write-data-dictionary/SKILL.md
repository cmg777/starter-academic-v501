---
name: write-data-dictionary
description: Generate an interactive, self-contained HTML data dictionary for an existing post on carlos-mendez.org, plus a full Stata pipeline (labeled .dta, README, codebook .do, download-all ZIP). The skill reads the post's data files and prose (index.md appendix/data-dictionary/methods + script), auto-drafts an editable per-post metadata file, then renders a branded, dark-mode page with a searchable variable explorer (distribution sparklines + coverage bars), tabbed per-dataset dictionaries, sortable statistics, a cross-file index, construction formulas, sources, citations, and copy-paste load snippets (Stata/pandas/R/pyreadstat from raw GitHub URLs). Driven by a generic renderer copied into the post's data/ folder; rerun to regenerate. No backend, no build step.
argument-hint: "<post slug> [--no-link] [--no-verify]"
disable-model-invocation: true
user-invocable: true
---

# Write Data Dictionary: interactive HTML page + Stata pipeline for a post's data

Generate the same kind of data-dictionary page that ships at
`content/post/python_kuznets_dmsp/data/` (the **reference implementation**) for any post that has
tabular data files. Architecture: a **generic renderer** (`build_data_dictionary.py`, copied
verbatim into the post's `data/`) reads a **per-post `data_dictionary.yaml`** and the data, then
emits a labeled Stata `.dta` per dataset, `README.md`, `stata_codebook.do`, `<slug>_data.zip`, and
`index.html`. Rerun the script to regenerate everything; the YAML is the single editable source of
truth for prose, the data is the source of truth for statistics.

## What this skill does NOT do

- It does not invent variable definitions. It auto-drafts from the post's own appendix / data
  dictionary / methods / script; anything it can't find is left blank in the YAML for you to fill.
- It does not change the data values — the `.dta` is byte-faithful to its source; only metadata
  (labels, value labels) is added.
- It does not translate (the page is a data-folder document, English only — no `content/es`,
  `content/ja`). Posts' ES/JA stubs are `render: never` and unaffected.
- It does not auto-commit. Phase 5 offers commit/push as a copy-paste follow-up.

## Example invocations

```
/project:write-data-dictionary r_double_lasso
/project:write-data-dictionary python_did_sc_tsunami --no-link
/project:write-data-dictionary r_kuznets --no-verify
```

## Deliverables (written into `content/post/<slug>/data/`)

| Path | Purpose |
|---|---|
| `data_dictionary.yaml` | per-post metadata (auto-drafted, you review/edit) — the editable source |
| `build_data_dictionary.py` | the generic renderer (copied verbatim from this skill) |
| `<base>.dta` (one per dataset) | labeled Stata `.dta` v118 (variable + value labels) |
| `README.md` | GitHub-facing codebook (dictionary + stats + links) |
| `stata_codebook.do` | run once in Stata to attach long-form per-variable notes |
| `<slug>_data.zip` | download-all bundle (every `.dta` + source + README + `.do`) |
| `index.html` | the interactive data-dictionary page (served at `/post/<slug>/data/`) |

Plus, unless `--no-link`, one front-matter `links:` entry in the post's `index.md`:
`{ icon: book, icon_pack: fas, name: "Data dictionary", url: data/index.html }` (relative,
no trailing slash — a trailing slash 404s under the Wowchemy theme).

## Color palette (the renderer's built-in theme)

| Token | Hex | Use |
|---|---|---|
| steel | `#6a9bcc` | primary, continuous sparklines, links |
| orange | `#d97757` | accents, dummy sparklines, ZIP button |
| teal | `#00d4c8` | kicker, coverage gradient |
| ink | `#141413` | body text (light); dark theme `#e8ecf2` |
| dark surfaces | `#0b1120 / #121a2e / #26304a` | dark-mode bg/card/lines |

The full feature set the page must have is catalogued in
[`references/feature-catalog.md`](references/feature-catalog.md). The renderer already implements
all of it — do not re-implement; only update the renderer template if a feature is missing.

## Phase 1 — Pre-flight (read-only)

### 1.1 Parse arguments
`<post slug>` (required) + flags `--no-link` (skip the front-matter button) and `--no-verify`
(skip Phase 5 browser/Hugo checks).

### 1.2 Locate the post + data
Confirm `content/post/<slug>/index.md` and `content/post/<slug>/data/` exist (abort with a clear
message if the post has no `data/` folder). Inventory data files by extension:
`.csv` / `.dta` / `.parquet` / `.xlsx` (see input-format handling in
[`references/metadata-schema.md`](references/metadata-schema.md)). If `.parquet`/`.xlsx` are
present, note that Phase 4 must `pip install` `pyarrow`/`openpyxl` into `.venv`.

### 1.3 Mine the post for definitions
Read `index.md` and the post's script for variable definitions / sources / construction. Look for
(in priority order): an **Appendix data dictionary** or a `## Data` / data-dictionary table; a
**methods/variables** section; inline descriptions; and the script's comments/labels. The
extraction heuristics live in [`references/auto-draft.md`](references/auto-draft.md).

### 1.4 Detect repo context
The renderer self-derives the raw-GitHub base, slug, and post URL from `git` and its own location
— you do not hardcode them. Just confirm the post is inside this git repo.

## Phase 2 — Confirm scope + interview (MANDATORY; no files written yet)

Print a SCOPE block summarising Phase 1:

```
SCOPE (PRELIMINARY — confirm in interview)
==========================================
Post slug:     <slug>
Title:         <study title>
Data files:    <N> (<csv/dta/parquet/xlsx breakdown>)
Definitions:   <found in: Appendix A | data-dictionary table | methods | script | none>
Optional sections detected: <sources? formulas? caveats? citation?>
Existing data buttons in index.md: <Data (CSV) / Data (Stata .dta) / none>
Flags:         --no-link=<..>  --no-verify=<..>
```

Then ask `AskUserQuestion` rounds (≤4 questions each) until 95% confident, covering at least:
1. **Title / subtitle / overview** wording for the page hero + overview.
2. **Which optional sections** to include (sources, construction & formulas, caveats, citation) —
   omit any with no content.
3. **Citation** author + year (the renderer auto-builds APA + BibTeX; offer to add the original
   study as an extra reference).
4. **Existing GitHub data buttons** — keep, or remove "Data (CSV)" / "Data (Stata .dta)" in favor
   of the single "Data dictionary" button (the kuznets page removed them).

End with a final SCOPE block and explicit `y` before proceeding.

## Phase 3 — Draft + review the metadata

Write `content/post/<slug>/data/data_dictionary.yaml`, auto-populated per
[`references/auto-draft.md`](references/auto-draft.md) against the schema in
[`references/metadata-schema.md`](references/metadata-schema.md):
`study` (title/subtitle/overview/panel_structure/optional kpis), `sources`, `formulas_html`,
`caveats`, `citation`, `files` (per dataset: label/grain/years/coverage/key/purpose/note), and
`columns` (per variable: label/definition/construction/units/source/coverage/kind/value_labels).
Leave unknown fields blank rather than guessing. Show the drafted YAML (or a summary) and let the
user review/edit before rendering. A filled example is in
[`references/templates/data_dictionary.example.yaml`](references/templates/data_dictionary.example.yaml).

## Phase 4 — Generate

1. Copy `references/templates/build_data_dictionary.py` → `content/post/<slug>/data/build_data_dictionary.py`.
2. If `.parquet`/`.xlsx` inputs exist: `.venv/bin/python3 -m pip install pyarrow openpyxl`.
3. Run it: `cd content/post/<slug>/data && <repo>/.venv/bin/python3 build_data_dictionary.py`
   (writes the `.dta`, README, `.do`, ZIP, `index.html`; self-checks `.dta` release 118).
4. Unless `--no-link`: add the `"Data dictionary"` `links:` entry to the post's `index.md`
   (`url: data/index.html`). If the user chose to remove the GitHub data buttons, delete those
   `links:` entries. (No body change. No ES/JA change.)

## Phase 5 — Verify + report (skip if `--no-verify`)

Run the checks in [`references/verification-checklist.md`](references/verification-checklist.md):
structural greps on `index.html`; a headless-Chromium pass (tabs show one panel each; "Expand all"
reveals every panel — proves Ctrl+F/print coverage; dark toggle changes + persists; a cross-file
index variable link sets `#var-…`; print media shows all panels; no JS console errors); and a Hugo
build with the pinned binary (0.96–0.119 window) confirming `public/post/<slug>/data/index.html`
publishes and the button renders. Then print a `[✓]/[✗]` report and offer copy-paste follow-ups:
open the page locally, review/edit `data_dictionary.yaml` and rerun the renderer, and commit + push
(the page goes live after Netlify deploys).
