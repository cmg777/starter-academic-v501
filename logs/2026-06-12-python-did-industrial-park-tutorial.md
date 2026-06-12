# 2026-06-12 — New tutorial: Evaluating Industrial Parks with Difference-in-Differences (`python_did_industrial_park`)

Full data-science pipeline run for a beginner-friendly, professor-voice tutorial on **staggered
difference-in-differences**, replicating **Huang, Wang & Xu (2026), "The socioeconomic impacts of
industrial parks in Ethiopia"** on a purpose-built **synthetic, calibrated** dataset. The paper PDF +
appendix were the only source material (no replication data), dropped at
`content/post/python_did_industrial_park/references/` — so the dataset was generated from scratch and
calibrated to reproduce the paper's reported coefficients (signs, significance, approximate magnitudes).
Built with coordinated multi-agent orchestration (a supervised data-engineer pass + parallel fan-out).

## What shipped

- **Synthetic data + provenance** under `data/` and `reference/`:
  - `reference/generate_synthetic_data.py` — deterministic, multi-RNG generator with a `--validate`
    mode that re-runs the recovery regressions (pyfixest) and prints recovered-vs-paper. Three CSVs:
    `industrial_park_district_panel.csv` (139 woredas × 2005–2020 = 2,224 rows; nighttime light +
    impervious, the latter only 2005/10/15/20 → 556 non-null), `industrial_park_household_rcs.csv`
    (13,200 households, DHS repeated cross-section), `industrial_park_individual_rcs.csv` (17,900
    individuals). 3 data dictionaries + a 9-section `reference/README.md` documenting how every
    variable was built in the original paper (harmonized DMSP/VIIRS lights, GISD30 impervious,
    Ethiopia DHS, 2007 census, SRTM, gROADS, EIC/IPDC park list + PSM controls) and how the synthetic
    version maps to it, with the DGP equations, the exact-vs-approximate match lists, and a
    table-by-table reproduction map.
  - **DGP**: additive fixed-effects + saturating treatment-ramp on a latent log-light series
    (`light = sinh`, `ihs_light = asinh`); a treated-cohort trend drift reproduces the trends-vs-no-trends
    attenuation; demeaned spatial + serial shocks give realistic Conley/clustered SEs without moving
    point estimates; RCS outcomes use district+round FE means with clipped-LPM binaries (so the paper's
    LPM coefficient is the target by construction) and per-outcome availability masks that hit every
    reported N exactly.
  - **Calibration (`--validate`)**: IHS light +0.213\*\*\* (trends) / +0.270\*\*\* (no trends);
    impervious +0.026/+0.029\*\*\*; spillover `nearby` ≈0 ns; distance interactions negative & sig;
    Sun-Abraham 0.299 / Borusyak 0.302 / Callaway-Sant'Anna 0.256 / TWFE 0.270 (all agree);
    durables +0.229, housing +0.248, wealth +0.383; **employment full +0.091 ns but female +0.140\*\*\***
    (the gender narrative); decision +0.110, savings +0.315, DV acceptance −0.210. All 11 sample-size
    assertions exact; output byte-deterministic (md5-stable).
  - **Documented approximations** (in the data README): raw-light coefficient runs high (~1.6 vs paper
    1.276 — the bright-base device that lets IHS≈0.214 and raw coexist under asinh); treated light
    *levels* not matched to controls and `light_positive`≈1.0 (treated kept always-lit so the IHS event
    study is clean with only 17 clusters — the EDA parallel-trends figure is therefore baseline-normalized);
    `primary_road` interaction correctly-signed but borderline ns; decision-power mean slightly capped by
    the 0.899 ceiling.
- **Post** `index.md` (~880 lines): six-beat abstract → "do parks work, and for whom?" overview + Mermaid
  study-design diagram → 5 learning objectives → 8 concept toggle-cards (staggered DiD, parallel trends,
  ATT, TWFE bias / negative weights, event study, repeated-cross-section DiD, Conley SEs, SUTVA/spillovers)
  → sandwich-pattern walk-through (2×2 → TWFE/Table 1 → event study → Sun-Abraham/Borusyak/Callaway-Sant'Anna
  + Goodman-Bacon → heterogeneity & spillovers → survey-weighted RCS welfare → the employment/empowerment
  gender climax → Conley robustness) → discussion → reproduction-audit table → takeaways → exercises →
  references. 2 display equations, 14 figures, ATT estimand stated, synthetic-data honesty called out.
- **Script** `script.py` (1,337 lines, 12 sections) + `execution_log.txt` (exit 0) + **14 dark-theme
  figures** + **20 result CSVs** incl. `reproduction_audit.csv`. pyfixest 0.50.1 + diff-diff 3.5.2;
  local-cache→GitHub-raw data loader; Conley spatial-HAC sandwich; the staggered event studies use
  `pf.event_study(estimator="saturated"|"did2s")` (the hand-rolled `i()` interaction silently collapses).
- **Results report** `results_report.md` (559 lines, 12 findings, 13 interpretations, 25-row reproduction
  audit) and post-root `README.md` artifact inventory.
- **Quarto bundle** `python_did_industrial_park.zip` (720 KB; `references/` holds tutorial.qmd + setup_env.py
  + _quarto.yml + render.command/.bat + bundle README, coexisting with the paper PDFs). Hermetic-venv,
  Python floor 3.11–3.13 (pyfixest pins need ≥3.11). tutorial.qmd renders cleanly (32 chunks, exit 0).
- **Slides** `slides/` — branded Quarto reveal.js deck (30 slides, 3-act arc, brand SCSS verbatim, math intact).
- **Web app** `web_app/` — self-contained 4-tab D3 explorer (event study / estimator comparison + Bacon
  weights / heterogeneity / who-benefits), D3 bundled locally, `data/results.json` from the real CSVs.
- **Infographic** `infographic_instructions.md` — 6-panel chalkboard storyboard (numbers cross-checked).
- **i18n** ES + JA **stub cards** (`content/{es,ja}/post/python_did_industrial_park/index.md`): translated
  title/summary, verbatim categories/date, `card_url` back to the English post, `_build: render:never`.

## Process notes

- Coordinated multi-agent build: 3 Explore/Plan agents (paper extraction, pattern study, DGP + analysis
  design) → 1 supervised data-engineer pass + 1 calibration-refinement pass (employment-full significance
  and the event-study/Sun-Abraham smoothness were the hard fixes; verified by the parent, not trusted) →
  script + results-report agents on the critical path → 5 fan-out artifacts built **in parallel**, with
  `index.md` link injection done centrally afterward to avoid a write race.
- The pedagogically central correction: the first calibration made full-sample employment spuriously
  significant (district-constant shock absorbed by district FE); fixed with a district×**round** factor
  shock so the clustered SE inflates — full reads ns, female stays \*\*\*, preserving the paper's gender story.

## Verification

- `reference/generate_synthetic_data.py --validate` — all headline targets recovered (sign + significance
  + magnitude), all sample sizes exact, deterministic (md5-stable across runs).
- `script.py` — exit 0, 14 figures (>80 KB each) + 20 CSVs; reproduction audit matches `--validate`.
- Full Hugo build under the pinned 0.111.3 extended (`--buildFuture`) — exit 0; post (120 KB),
  `slides/index.html` + `slides_files/`, `web_app/` (incl. vendored D3 + results.json), the 720 KB
  Quarto zip, script, and data CSVs all serve; all six resource-link buttons render; ES/JA cards appear
  on the localized homepages. Post math verified intact in rendered HTML (no Goldmark `<em>` leaks in `$$`).

## Open follow-ups (user-supplied / out of scope here)

- `featured.webp` (user adds manually), the AI-podcast audio + AI-slides PDF (need user files), and an
  optional Jupyter/Colab notebook are not yet added. Review skills (`review-post`, `review-slides`, etc.)
  were not run. The GitHub-raw data/MD links and the Colab path resolve once the repo is pushed to master.
