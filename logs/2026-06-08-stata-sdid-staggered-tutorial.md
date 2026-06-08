# 2026-06-08 — New tutorial: Staggered Synthetic Difference-in-Differences (`stata_sdid_staggered`)

## Why

A new Stata data-science tutorial extending **Synthetic Difference-in-Differences (SDID)** to
the **staggered adoption** design — where units adopt treatment at *different* times — the
direct sequel to `stata_sdid` (which scoped staggered adoption out as "the natural next step").
It is built from the Clarke, Pailañir, Athey & Imbens (2024) *Stata Journal* reference materials
and applied to the canonical **parliamentary gender-quota** case study (`quota_example`). The
post was requested to:

1. Introduce SDID from first principles and **derive its core equations**, then the **staggered
   extension** — per-cohort effects $\hat\tau_a$ aggregated by treated unit-years into the ATT.
2. Carefully present the data and run a **cross-country EDA** of outcome, treatment, and control
   dynamics using the **`panelview`** package (treatment-timing staircase + outcome trajectories).
3. Carefully introduce the **event-study plot** via the modern **`sdid_event`** command (Ciccia,
   Clarke & Pailañir 2024) — distinguishing pre-trend placebos from post-period dynamic effects.
4. Leave students able to apply staggered SDID **conceptually and practically**, including
   covariates (optimized vs projected) and bootstrap/jackknife/placebo inference (all three now
   valid with many treated units, unlike the single-unit Prop 99 case).

## What shipped

Everything under `content/post/stata_sdid_staggered/`:

- **`analysis.do`** — self-contained script. Ran clean in **Stata 18.0 MP** in batch (the
  machine's 18.5/StataNow MP licenses had **expired 2025-10-19**; the `/Applications/Stata 18.0`
  MP perpetual license works; `sdid`/`panelview`/`reghdfe` resolve from the shared `ado/plus`,
  **`sdid_event` installed from SSC**). Loads/caches `quota_example.dta`, documents the 7 staggered
  cohorts, runs the `panelview` EDA, a naive-TWFE foil, staggered `sdid` + `e(tau)`, covariates
  (`optimized`/`projected`), the `sdid_event` event study, and the inference comparison; exports
  **7 CSVs** to `web_app/data/` and **8 PNG figures**. `seed(1213)`.
- **`index.md`** — notebook-style post: ATT estimand + **6 display equations** (Goldmark/KaTeX
  escaping verified, no AVOID-list constructs), SDID-from-first-principles, the cohort→aggregate
  derivation, a careful `sdid_event` reading guide, **3 Mermaid diagrams** (site palette), 7
  `<details>` concept cards, sandwich pattern, **9 numeric interpretations**.
- **`analysis.log`**, **`quota_example.dta`** (linked Dataset button), **`results_report.md`**
  (9 key findings + reproduction audit vs the paper).
- **Web app** — 4-tab D3 SPA at `web_app/` (Concept / Cohort effects + adoption timeline /
  Weights & counterfactual per cohort / Event study), data-driven from the exported CSVs.
  Verified rendering in headless Chrome across all 4 tabs; the JS λ-anchor reproduces Stata's
  pre-period offset (10.445) to the digit.
- **`infographic_instructions.md`** — 6-panel chalkboard spec (Story Spine, 3 BIG numbers
  +8.0 pp / 9 countries-7 cohorts / −3.5…+21.8).
- **AI Podcast** player (m4a, stream) and a **Slides (PDF)** button → `Staggered_SDID.pdf`.
- **i18n** — ES + JA card-only stubs (`content/es|ja/post/stata_sdid_staggered/`).
- **Categories:** Stata · Causal Inference · Synthetic Control · Difference-in-Differences (DiD).

The third-party source bundle (`reference/` — Clarke et al. 2024 full-text markdown +
`online_supplementary_material.pdf` + `replication_materials.do`) is **git-ignored** (Hugo would
otherwise publish the paper text + PDF; copyright + bloat). The post cites the paper in
References. Pattern matches `stata_sdid/references/`, `r_augsynth/references/`, `r_did2/reference/`.

## Key results (replicate Clarke et al. 2024 exactly)

- **Overall ATT = +8.03 pp** women in parliament (bootstrap SE **3.74**, *p* = 0.032, 95% CI
  [0.70, 15.37]) — robust to the `lngdp` covariate (**8.05** optimized / **8.06** projected).
- **Cohort heterogeneity:** `e(tau)` ranges **−3.45 (2005) to +21.76 (2012)**; the aggregate is
  the treated-period-weighted average (≠ the ≈7.0 unweighted mean), reproduced in the log.
- **Event study (`sdid_event`, 2002 cohort):** 12 pre-period placebos all in [−0.22, +0.76]
  (parallel trends hold); post-period effect appears at adoption (+4.1) and persists (+6 to +9).
- **Inference (2002 & 2003 subsample):** identical ATT **10.33** across estimators; SE
  **bootstrap 4.73 / placebo 2.34 / jackknife 6.01** (jackknife most conservative, CI crosses 0).

## Status

Complete, verified, and committed to `master` (this commit) — Netlify production deploy triggered.
`scripts/i18n-parity.sh` → **0 gaps** (post stub count → 85 each for es/ja). Hugo 0.111.3 build
clean (math, 3 Mermaid `subgraph` diagrams, 8 figures, web app, Slides PDF all render).
