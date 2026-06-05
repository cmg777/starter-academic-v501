# 2026-06-05 — New tutorial: Augmented Synthetic Control for Multiple Countries (`r_sc_multi_country`)

## Why

A new R data-science tutorial teaching the **Augmented Synthetic Control Method (ASCM)**
via the `augsynth` package (Ben-Michael, Feller & Rothstein 2021) in a **multi-country**
setting. Built end-to-end through the site's data-science pipeline. Two arcs:

1. **Teach on simulated data** where the true effect is known — introducing the three
   documented `augsynth` entry points (`single_augsynth`, `multisynth`,
   `augsynth_multiout`), saving a reusable synthetic panel CSV, and running a *suitability
   test* that shows where plain SCM fails and augmentation rescues it.
2. **Replicate** Papaioannou (2021, *Economics Letters*), "European monetary integration,
   TFP and productivity convergence," qualitatively with ASCM (the 12 founding euro members
   vs 24 non-euro donors, 1980–2017).

## What shipped

Everything under `content/post/r_sc_multi_country/`:

- **`analysis.R`** — self-contained script (R 4.5.2). Builds + saves the reusable synthetic
  panel (`synthetic_panel_multicountry.csv`, plus a 2-country intuition CSV), runs all three
  `augsynth` functions, the suitability test, and the EMU replication. Produces **16 PNG
  figures**, 8 result CSVs, and `web_app/data/results.json`. Clean run (exit 0); seed
  `20260605`.
- **`index.md`** — notebook-style post (sandwich pattern, ~14 numeric interpretations, 2
  display equations, mermaid pipeline, 7 concept toggle-cards, 16 figures).
- **`results_report.md`**, **`execution_log.txt`**.
- **Quarto bundle** — `tutorial.qmd` + `r_sc_multi_country.zip` (built by `build_bundle.sh`;
  ships the `.dta` so Part 2 renders).
- **Web app** — 4-tab D3 SPA at `web_app/` (Three Functions / Single & Suitability / Many
  Units / Replication), driven by `results.json`.
- **`infographic_instructions.md`** — 6-panel chalkboard spec (Story Spine, 3 BIG numbers).
- **AI Podcast** player (m4a, stream) and a **Slides (PDF)** resource button.
- **i18n** — ES + JA card-only stubs (`content/es|ja/post/r_sc_multi_country/`).

## Key results

- **Simulated recovery:** `single_augsynth` +2.65 vs true +2.60; `multisynth` pooled 0.718
  vs true 0.735; `augsynth_multiout` both outcomes within ~0.16.
- **Suitability lesson:** for a unit placed *outside the donor hull* (C05), plain SCM gets
  the **sign wrong** (+0.34 vs true −1.23) while Ridge-ASCM recovers it (−1.32); mean
  recovery error 0.39 → 0.13.
- **EMU replication:** per-country ASCM TFP % effects track the paper with **Spearman 0.74**
  (France 42.7% vs 43.6%, Netherlands 44.0% vs 38.2%, Greece/Portugal turning negative
  post-2008). Pooled `multisynth` path: positive early euro years, eroded by the 2008 crisis,
  recovering by 2017 — the paper's arc.

## Quality gates

- **`review-post`: ACCEPT** — found and fixed one HIGH issue: Netlify-fragile math constructs
  (`\underbrace{}_{}`, `\;`, single `\,`, `\big`-bars) in the two display equations, replaced
  with deploy-safe LaTeX. 7/7 scoring dimensions 9–10.
- **`review-app`: ACCEPT** — 10-dimension audit, headless Chromium across all tabs at desktop
  + mobile, **0 runtime errors**; report in `web_app/REVIEW.md`. Added a mobile table
  `overflow-x` guard.

## Status

Complete and verified. `scripts/i18n-parity.sh` → **0 gaps** (post stub count 82 → 83).
Builds clean on the pinned Hugo **0.111.3**.

## Notes / gotchas

- **`augsynth` is not on CRAN** — installed from GitHub pinned to commit `7a90ea4`
  (`remotes::install_github("ebenmichael/augsynth@7a90ea4")`); verified with augsynth 0.2.0,
  Synth 1.1.10.
- **Inference pairing is not interchangeable:** conformal for `single_augsynth` /
  `augsynth_multiout`, wild bootstrap (seeded) for `multisynth`.
- The real `.dta` is **36 countries** (12 EMU + 24 donors); outcomes are `tfp` and `prod_gap`
  (there is no `y_gap`); treatment must be built as `treat × time1` (post-1999) / `treat ×
  time2` (post-1992).
- **`reference/` PDFs kept local-only** (`reference/.gitignore`): the published Papaioannou
  paper PDF, `appendix.pdf`, and the full-text `.md` are excluded (copyright + ~3.3 MB);
  only `dataset_revision_1.dta` is committed.
- **Docs updated** so future posts can reuse the patterns: CLAUDE.md gained a *Slides (PDF)
  link button* section (absolute-URL/new-tab + why-not-`url_slides` theme nuance) and an AI
  Podcast reference entry; README gained a *Post Resource Buttons* note.
