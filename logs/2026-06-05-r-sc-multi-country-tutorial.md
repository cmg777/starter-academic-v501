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

## Update (same day) — significant effects + a real inference layer

The first cut recovered point estimates accurately but **almost nothing was statistically
significant**, and the post/web-app barely explained inference. Revised end-to-end:

- **New DGP** (`analysis.R`): effect is now a **jump at adoption + a gentle ramp**;
  treated units C01–C04 are **sparse 3-donor blends** (clean fit), C05 stays outside the
  hull with a small negative effect; **20 donors / 25 units, 1985–2023** (a long
  pre-period — the real lever for conformal power). Verified by four calibration probes
  before the full run.
- **Inference fixed and expanded** — the diagnosis was that *the inference method*, not the
  data, drove non-significance:
  - `single_augsynth` → **jackknife+ CI** (robust, primary) + **conformal** p-value. The
    conformal permutation p-value is realisation-noisy and weak with a long post-window;
    jackknife+ is stable. C01: +6.24, jackknife+ [5.998, 6.506], p < 0.001.
  - `multisynth` → **jackknife** (primary, significant: pooled [0.689, 5.754]) **+ wild
    bootstrap** (conservative, [−2.468, 9.779], n.s.). Reporting both is the teaching point:
    *the inference method can change the verdict.* (Bootstrap is augsynth's default but is
    very wide on few treated units; more donors made it *wider*, not tighter.)
  - `augsynth_multiout` → **conformal p-value per outcome** (grid_size = 1; both p < 0.001).
    `grid_size > 1` is ~5 min/call AND returns degenerate `±Inf` bounds, so CIs stay NA — a
    real limitation, documented.
  - EMU kept **honest**: Germany borderline (conformal p = 0.027 but jackknife+ CI includes
    zero), pooled euro effect −0.016 n.s. under both methods, joint Germany multiout p = 0.60.
- **Post** (`index.md`): new **"## 9. Inference: is the effect real?"** section (sections
  renumbered 9→20); every number updated; explicit significance interpretation throughout;
  mermaid pipeline gained an inference node. Build clean on Hugo 0.111.3, **0 MathJax
  errors**, mermaid renders.
- **Web app**: new **5th "Inference" tab** (significance scoreboard + slider-driven
  simulator that flips the verdict at p = 0.05), significance **badges** on the single/multi
  tabs, a **forest plot** (per-unit + pooled jackknife CIs), and the multi table now shows
  jackknife vs bootstrap. Headless Chromium across all 5 tabs, desktop + mobile, **0 errors**.
- **Downstream regenerated**: `results_report.md`, `execution_log.txt`, `tutorial.qmd`
  (+ rebuilt `r_sc_multi_country.zip`), `infographic_instructions.md`. ES/JA stubs unchanged
  (generic summary); `scripts/i18n-parity.sh` → **0 gaps**.
- **Audited**: an adversarial numeric fact-check (every estimate/CI/p-value/significance
  claim cross-checked against `execution_log.txt` + `results.json`) → **PASS**; a
  writing/structure review → **ACCEPT**.

### Inference gotchas worth remembering

- augsynth's **conformal** average-effect p-value is a permutation test: high-variance
  across DGP realisations and **low-power when the post-window is long relative to the
  pre-period**. A long pre-period (start 1985) fixes it; effect size and pre-fit alone do not.
- For a *single* treated unit, **`jackknife+`** gives a reliable average-effect CI; prefer it
  over conformal when you need significance you can count on.
- **`multisynth` jackknife vs wild bootstrap** answer different questions (between-unit
  variance vs also-the-counterfactual-uncertainty); report both when they disagree.
- **`augsynth_multiout`** has no usable average CI (NA at grid_size = 1; `±Inf`/slow at
  grid_size > 1) — report the conformal p-value per outcome.
