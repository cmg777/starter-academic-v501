# 2026-06-08 — New tutorial: The Augmented Synthetic Control Method (`r_augsynth`)

## Why

A beginner-first R tutorial on the **Augmented Synthetic Control Method (ASCM)** of
Ben-Michael, Feller & Rothstein (2021) for a **single treated unit**, taught through the
canonical **2012 Kansas tax-cut** example with the [`augsynth`](https://github.com/ebenmichael/augsynth)
package. It is the **single-treated-unit foundation** companion to `r_sc_multi_country`
(which covers the multi-unit `multisynth` / multi-outcome `augsynth_multiout` case); the two
cross-link. The post was requested to:

1. Teach **intuition first, then the math** — the reader is a beginner in causal inference.
2. **Carefully present the data and key variables** (the `kansas` panel).
3. **Derive the method with equations** while keeping it accessible.
4. **Carefully explain inference** (notoriously hard in SCM) for *both* the classic and the
   augmented approaches — all four tools `augsynth` ships.

## What shipped

Everything under `content/post/r_augsynth/` (full data-science pipeline + all downstream artifacts):

| File | Purpose |
|------|---------|
| `analysis.R` + `execution_log.txt` | Canonical script: classic SCM → Ridge ASCM → covariate ASCM (+ residualize/fixedeff notes) → 4-way inference. 10 dark-theme figures (site dark-mode palette, see Update below), 6 result CSVs, `web_app/data/results.json`. |
| 10× `r_augsynth_NN_*.png` | Raw paths, actual-vs-synthetic, SCM gap, donor weights, CV-λ, SCM-vs-Ridge overlay, pre-fit imbalance, placebo spaghetti, 4-method inference forest, 5-spec model comparison. |
| `results_report.md` | 9 key findings, interpretations, surprises/caveats, reproduction audit vs the vignette. |
| `index.md` | The post — sandwich pattern, 7 concept cards (Definition/Example/Analogy), ~11 display equations, a Mermaid roadmap, a dedicated four-method **Inference** section, cross-link to `r_sc_multi_country`. |
| `infographic_instructions.md` | Chalkboard storyboard prompt (CCM turned it into `featured.webp`). |
| `tutorial.qmd` + `build_bundle.sh` + `r_augsynth.zip` | Friction-free **Quarto project** bundle (executable companion + `kansas.csv` + README). |
| `web_app/` | 4-tab interactive **D3** lab (Big Picture / Build Synthetic Kansas / The Augmentation / Inference) with a significance simulator and `#pane-*` deep-linking. |
| `kansas.csv` | The `augsynth` Kansas panel (50 states × 105 quarters), shipped so the post is self-contained; `analysis.R` loads it from a GitHub raw URL with a local fallback. |
| `Augmented_Synthetic_Control_Kansas.pdf` | Slide deck (front-matter "Slides (PDF)" link button). |
| AI Podcast | Self-contained audio-player overlay (`#podcast-player`, catbox `22hl3t.m4a`). |
| `content/{es,ja}/post/r_augsynth/index.md` | Translated **stub cards** linking back to the English tutorial. |

## Key results (the Kansas story)

- **Classic SCM**: ATT **−0.0294** (≈ −2.9%), pre-fit L2 **0.083** (79.5% better than uniform), a sparse **7-donor** recipe (SC 0.30, WA 0.22, TX 0.15, …).
- **Ridge ASCM** de-biases it to **−0.0401** (≈ −3.9%), L2 → **0.062**, estimated SCM bias **0.011** (≈ ⅓ of the effect), with the weights barely moving (RMS 0.015, only Louisiana meaningfully negative); λ = 0.079 by 1-SE CV.
- **Covariate ASCM**: **−0.0609** (covariate L2 0.005, 97.7%). The estimate grows monotonically as de-biasing increases — the un-augmented number is the conservative one.
- **Inference, four ways** (all on the Ridge fit): jackknife+ CI **[−0.058, −0.021] excludes 0**; conformal joint-null p **0.066**; permutation **5th of 50** placebos (p 0.10); leave-one-donor jackknife (SE 0.024) Wald CI includes 0. Honest verdict: a real but modest effect, strongest in 2013–2014.

## Self-containment, taxonomy & i18n

- The bulky third-party reference tree (`content/post/r_augsynth/references/` — the ASCM paper + full `augsynth` package source incl. a 1.5 MB raw `.dta`) is **git-ignored**; nothing in the post depends on it.
- Categorized under **R · Causal Inference · Synthetic Control** (existing site taxonomies), tags `r / causal inference / synthetic control / panel data`.
- ES + JA stub cards added; `scripts/i18n-parity.sh` reports **0 gaps**.

## Verification

- `analysis.R` runs to **exit 0, zero warnings**; all 10 figures visually checked; headline numbers reproduce the `singlesynth` vignette exactly.
- Adversarial `review-post` pass → **ACCEPT** (numbers cross-checked against the CSVs).
- Rendered post in headless Chrome: **44 MathJax containers, 0 parse errors**, Mermaid SVG drawn, 14 concept-card details, podcast overlay present, no raw `$$` leakage.
- Quarto `tutorial.qmd` renders end-to-end (**39/39 chunks**).
- Web app in headless Chrome: **9/9 charts render, 0 JS errors**; data-contract validated against `results.json`.
- Full Hugo **0.111.3** build passes (**912 EN pages**); the web app, slides PDF, Quarto zip and `kansas.csv` all publish; the post lists on both `/category/causal-inference/` and `/category/synthetic-control/`.

## Notes / fixes made along the way

- **`jsonlite` NA handling**: a numeric `NA` was serialized as the string `"NA"`, which broke the web app's chart math (`"NA".toFixed` and NaN axis domains). Fixed with `write_json(..., na = "null")`; the CV-λ vector now uses `signif()` (not `round()`) so the smallest λ stays > 0 for the log axis.
- **`augsynth` placebo gotcha**: the placebo-plot factor level for the treated unit is **`"Treatment"`**, not `"Treated"` — the permutation p-value/rank depends on matching it.

## Update (2026-06-08) — dark figures + numbered sections

Two refinements after the initial publish:

1. **Dark-theme figures.** `analysis.R`'s `theme_site()`/`save_fig()` and per-figure colors were switched from the light palette (white background) to the site's canonical **dark** palette — `bg = #0f1729` (matches `.dark body`), grid `#1f2b5e`, text `#c8d0e0`/`#e8ecf2`, donor/placebo lines a recessive slate `#54618a`; the steel-blue/orange/teal accents are unchanged (they read well on navy). This brings the post in line with the 8 other dark-figure R posts (`r_did`, `r_double_lasso`, `r_dynamic_bma2`, …). Re-ran `analysis.R` (exit 0); all 10 PNGs overwritten; `results.json`/CSVs byte-identical (data unchanged, styling only).
2. **Numbered sections.** Every `##`/`###` heading in `index.md` now carries a decimal number (`1.` … `13.`, with `N.M` subsections); the left TOC renders the numbers. No internal anchor cross-links existed, so the changed heading IDs break nothing; the 44 MathJax containers still render with 0 errors.
