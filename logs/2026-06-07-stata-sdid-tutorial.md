# 2026-06-07 — New tutorial: Synthetic Difference-in-Differences for Proposition 99 (`stata_sdid`)

## Why

A new Stata data-science tutorial teaching **Synthetic Difference-in-Differences (SDID)** —
Arkhangelsky, Athey, Hsiao, Imbens & Wager (2021) — via the `sdid` command of Clarke,
Pailañir, Athey & Imbens (2024), applied to the canonical **California Proposition 99**
tobacco-control case study. It fills a real gap: the site already had `stata_sc` (classical
synthetic control), `stata_did`, and `stata_honestdid`, but no SDID post — and SDID is the
natural synthesis of the two. The post was requested to:

1. Introduce SDID and **derive its core equations** (the weighted two-way fixed-effects
   objective, the unit- and time-weight optimization problems, the variance/CI).
2. **Contextualize** SDID against the *original* difference-in-differences and the *original*
   synthetic control — conceptually **and** with quantitative Stata examples — including a
   cross-check against the dedicated `synth2` command.
3. Show that the single `sdid` command implements DiD, SC, and SDID in an **identical
   framework** (estimation + inference + graphs), efficiently.
4. Handle **inference for one treated unit** (placebo/permutation), explicitly scoping out
   bootstrap/jackknife + staggered adoption as a different design.

## What shipped

Everything under `content/post/stata_sdid/`:

- **`analysis.do`** — self-contained script. Ran clean in **Stata 19 SE** in batch (the
  machine's Stata 18.5/17/16/StataNow **MP licenses had expired 2025-10-19**; the
  `/Applications/Stata/StataSE.app` perpetual SE license works; `sdid`/`synth`/`synth2` resolve
  from the shared `ado/plus`). Loads/caches `prop99_example.dta`, runs the raw 2×2 DiD,
  `synth2` (path-matched SC), `sdid` (SDID + `method(did|sc|sdid)`), the placebo permutation
  loop, exports 6 CSVs to `web_app/data/`, and produces **9 PNG figures**. `seed(1213)`.
- **`index.md`** — notebook-style post: ATT estimand + 7 display equations (Goldmark/KaTeX
  escaping verified), DiD↔SC↔SDID contextualization, the "one command, three estimators"
  demonstration, single-treated-unit placebo inference (with the SE-vs-permutation nuance),
  3 Mermaid diagrams, sandwich pattern, ~14 numeric interpretations.
- **`analysis.log`**, **`prop99_example.dta`** (linked Dataset button).
- **Web app** — 4-tab D3 SPA at `web_app/` (Concept / Weighting-scheme explorer /
  Counterfactual & gap / Placebo inference), data-driven from the exported CSVs.
- **`infographic_instructions.md`** — 6-panel chalkboard spec (Story Spine, 3 BIG numbers
  −27.3 / −19.5 / −15.6).
- **AI Podcast** player (m4a, stream) and a **Slides (PDF)** button → `sdid.pdf` (13 pp).
- **i18n** — ES + JA card-only stubs (`content/es|ja/post/stata_sdid/`).
- **Categories:** Stata · Causal Inference · Synthetic Control · Difference-in-Differences (DiD).

The third-party source paper bundle (`references/` — Clarke et al. 2024 markdown +
`online_supplementary_material.pdf` + `sdidExamples.pdf` + `replication_materials.do`) is
**git-ignored** (Hugo would otherwise publish the PDFs; copyright + bloat). The post cites the
paper in References. Pattern matches `stata_iv/references/` and `r_double_lasso/references/`.

## Key results (replicate Arkhangelsky et al. 2021 exactly)

- **SDID ATT = −15.60** packs per capita (placebo SE **9.88**, 95% CI [−34.97, 3.76]);
  SDID time weights fall entirely on **1986–88** (0.37 / 0.21 / 0.43); unit weights diffuse
  (Nevada, New Hampshire, Connecticut, Delaware, Colorado…).
- **Synthetic control (`synth2`) = −19.48** (pre-fit RMSE 1.66, R² 0.98; 6 donors:
  Utah .39, Montana .23, Nevada .21, Connecticut .11, New Hampshire .05, Colorado .02).
- **Raw 2×2 DiD = −27.35**, reproduced **to the decimal** by `sdid, method(did)`; and
  `sdid, method(sc)` = **−19.62** ≈ `synth2` — the quantitative proof of the unified framework.
- **Inference:** with one treated unit, jackknife is undefined and bootstrap unreliable →
  placebo. In-space permutation **p = 0.026** (only 1 of 38 control placebos as extreme as
  California) — significant, even though the wide normal-approx CI includes 0.

## Quality gates

- **`review-post`: ACCEPT** — 12 dimensions; Code/Equations/Rigor/Interpretations 10/10.
  Fixed one LOW (empty code stub in §8).
- **`review-app`: ACCEPT** — 10-dimension audit, headless Chromium across all 4 tabs at
  desktop + mobile, **0 console errors**, no mobile overflow; report in `web_app/REVIEW.md`.
  Fixed one LOW rounding inconsistency (Explorer DiD −27.4 → −27.3).
- **`review-script`: ACCEPT** — 8 dimensions; clean run, reproduces all numbers; report in
  `script-review.md`. Fixed three LOW comment items (execution-neutral).

## Status

Complete, verified, and committed to `master` (this commit) — Netlify production deploy
triggered. `scripts/i18n-parity.sh` → **0 gaps** (post stub count 83 → 84 each for es/ja).
Hugo 0.111.3 build clean; the post lists under the new `/category/synthetic-control/` and
`/category/difference-in-differences-did/` taxonomy pages.
