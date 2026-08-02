# r_sc_dsc_sdid — artifact inventory

**From DiD to SDID: A Ladder of Synthetic Control Estimators, and What Brexit Cost the UK**
<https://carlos-mendez.org/post/r_sc_dsc_sdid/>

A replication and teaching expansion of de Brabander, Juodis & Miyazato Szini (2025),
*Econometric Reviews* 44(10), 1617–1646, <https://doi.org/10.1080/07474938.2025.2530649>,
using the Brexit dataset of Born, Müller, Schularick & Sedláček (2019).

## Data

| File | What it is |
|---|---|
| `brexit_analysis.csv` | The estimation sample. 24 OECD countries × 104 quarters (1995Q1–2020Q4), log real GDP plus six covariates, no missing values. 2,496 rows. |
| `brexit_panel_long.csv` | The full tidy panel: all 36 countries, 1960Q1–2020Q4, twelve underlying series in long format. For rebuilding a different donor pool or outcome. |
| `data/README.md` | Codebook — variable definitions, provenance, the index map, the dropped-country list and why. |
| `prepare_data.R` | Converts the authors' MATLAB file into the two CSVs above. Run once; the tutorial does not depend on it. |

Both CSVs are loadable directly:

```r
url <- paste0("https://raw.githubusercontent.com/cmg777/starter-academic-v501/",
              "master/content/post/r_sc_dsc_sdid/brexit_analysis.csv")
panel <- read.csv(url)
```

## Code

| File | What it does |
|---|---|
| `analysis.R` | The canonical script. 17 sections: hand-coded and packaged versions of DiD, SC, SC(B), DSC, SDID (three variants), MASC and ASCM; the headline table; the 20-window in-sample placebo tournament at two horizons; the robustness grid; permutation inference. Produces 18 figures, 18 CSVs and `web_app/data/results.json`. |
| `cheatsheet_R.R` | Every estimate from a bare package call — no hand-coding, no weight extraction. Ends with a comparative table against the published values. ~4 min with placebo SEs, 30 s without. |
| `cheatsheet_stata.do` | The same ladder in Stata: `sdid` for DiD/SC/DSC/SDID, `allsynth` for ASCM. MASC has no Stata implementation. ~3 min. |
| `cheatsheet_python.py` | The same ladder in Python via `mlsynth`: `VanillaSC`, `TSSC(MSCa)`, `SDID`, `MASC`, `VanillaSC(augment="ridge")`. ~90 s. |
| `tutorial.qmd` | Runnable Quarto notebook version of the ladder. |
| `build_bundle.sh` | Builds `r_sc_dsc_sdid.zip`, the downloadable Quarto project. |
| `script-review.md` | Code review of `analysis.R` — execution, determinism, the five findings and their fixes. |

```bash
Rscript analysis.R 2>&1 | tee execution_log.txt
```

Cold run ≈ 25 minutes (the `Synth` nested optimisation over 92 predictors dominates);
cached re-runs ≈ 2 minutes. `FORCE_REFIT=1` invalidates `cache/`.

## Packages

**R** — CRAN: `quadprog`, `Synth`, `ggplot2`, `dplyr`, `tidyr`, `readr`, `patchwork`, `scales`, `jsonlite`.

GitHub only:

```r
remotes::install_github("synth-inference/synthdid")
remotes::install_github("ebenmichael/augsynth")
```

`masc` declares a hard dependency on Gurobi, a commercial solver it never reaches on
the code path used here. Strip it first:

```bash
git clone --depth 1 https://github.com/maxkllgg/masc /tmp/masc_src
sed -i '' 's/^    gurobi,$//' /tmp/masc_src/DESCRIPTION
R CMD INSTALL /tmp/masc_src
```

Verified with R 4.5.2, synthdid 0.0.9, augsynth 0.2.0, masc 0.1.1, Synth 1.1-10, quadprog 1.5-8.

**Stata** — all from SSC. Verified with Stata 19 SE, `sdid` 2.0.2, `synth` 0.0.7, `allsynth` (2026-07-15).

```stata
ssc install sdid
ssc install synth
ssc install allsynth
ssc install distinct          // allsynth dependency
ssc install elasticregress    // allsynth dependency
```

**Python** — `mlsynth` is GitHub-only. Verified with Python 3.12 and mlsynth @ main (2026-08-02).

```bash
pip install -U "git+https://github.com/jgreathouse9/mlsynth.git"
```

## Figures

`r_sc_dsc_sdid_NN_*.png`, 18 of them, dark navy theme at 300 dpi, in narrative order:

| # | Figure | Point |
|---|---|---|
| 01 | `gdp_paths` | The UK is one line in a crowd |
| 02 | `did_counterfactual` | What DiD assumes, drawn before it is named |
| 03 | `covariates` | Six predictors on wildly different scales |
| 04 | `convex_hull` | The rubber band |
| 05 | `simplex_surface` | The optimisation, as a search over a triangle |
| 06 | `sc_fit_gap` | 86 quarters of tracking, then a gap |
| 07 | `solver_ladder` | The published estimate is where the optimiser stopped |
| 08 | `dsc_offset` | DSC is SC's curve slid by one number |
| 09 | `lambda_weights` | Time weights collapse, and why |
| 10 | `bias_toy` | Extrapolation vs interpolation bias, drawn |
| 11 | `bias_targets` | Only SDID is dark in both columns |
| 12 | `masc_cv` | The blend is cross-validated, not guessed |
| 13 | `donor_weights` | Four recipes, nearly one blend |
| 14 | `all_counterfactuals` | Disagreement is a post-treatment phenomenon |
| 15 | `att_dotplot` | Every rung beats 2.4% |
| 16 | `placebo_tournament` | The fire drill, at two horizons |
| 17 | `robustness_grid` | The specification zoo |
| 18 | `placebo_in_space` | What if the referendum had happened elsewhere |

## Tables

18 CSVs at the post root: `att_headline`, `replication_check`, `sc_solver_ladder`,
`sdid_time_weights`, `donor_weights_by_method`, `masc_cv_table`,
`placebo_insample_errors`, `placebo_insample_summary`, `placebo_h1_summary`,
`placebo_h4_summary`, `placebo_in_space_ratios`, `inference_summary`,
`robustness_treatment_date`, `robustness_no_us`, `robustness_penalty`,
`robustness_covariates`, plus the two published datasets.

## Other artifacts

| Path | What |
|---|---|
| `index.md` | The post |
| `slides/` | reveal.js deck (`slides.qmd` → `index.html`) |
| `ai-slides.pdf` | AI-generated slide deck (15 pages), linked as an absolute-URL resource button |
| `web_app/` | Interactive lab; reads `web_app/data/results.json` |
| `infographic_instructions.md` | Four-section chalkboard image prompt for the visual companion |
| `execution_log.txt` | Full console output of the last run |
| `cache/` | Memoised expensive fits (`*.rds`), committed so re-runs are fast |

## Review reports

Five reviews were run over this bundle on 2026-08-02. All findings were applied.

| Report | Covers | Verdict |
|---|---|---|
| `script-review.md` | `analysis.R`, `cheatsheet_R.R` (then named `cheatsheet.R`), `prepare_data.R` | MINOR REVISION — 3 MED, 2 LOW, all fixed |
| `post-review.md` | `index.md`, all 13 dimensions | MINOR REVISION — 2 HIGH, 4 MED, 1 LOW, all fixed but the featured image |
| `infographic-review.md` | `infographic_instructions.md` | MAJOR REVISION — brief rewritten to the house template |
| `slides/SLIDES_REVIEW.md` | the reveal.js deck | ACCEPT — 2 HIGH overflows fixed |
| `web_app/REVIEW.md` | the interactive lab | ACCEPT — no changes needed |

## Replication check

Every headline estimate lands within 0.005 percentage points of the published table,
and the placebo tournament reproduces the published error statistics to four decimals.
`analysis.R` asserts this at the end and fails loudly if it drifts.

| Method | Ours (2018Q4) | Published |
|---|---|---|
| SC | 3.056 | 3.06 |
| DSC | 2.985 | 2.98 |
| SDID (i) | 2.758 | 2.76 |
| SDID (ii) / (iii) | 2.787 | 2.79 |
| MASC | 2.726 | 2.73 |
| ASCM | 3.045 | 3.04 |
| SC(B), mean covariates | 2.428 | 2.43 |

## The three ports

The ladder is fitted three times, once per language. Shortfall at 2018Q4, outcomes only.

| Rung | R | Stata | Python | Paper |
|---|---|---|---|---|
| DiD | 4.98 | 4.98 | 4.98 | — |
| SC | 3.06 | 3.06 | **3.04** | 3.06 |
| DSC | 2.98 | 2.98 | 3.00 | 2.98 |
| SDID | 2.79 | 2.79 | **2.80** | 2.79 |
| MASC | 2.73 | — | 2.73 | 2.73 |
| ASCM | 3.04 | 3.10 | 3.04 | 3.04 |

Stata reproduces R to five decimals on every rung it can fit. Python's two bolded
disagreements are the solver, not the language: `mlsynth` uses a convex solver and lands on
the exact-QP answer, while `synthdid` and Stata's `sdid` both stop where Frank–Wolfe stops.
This is section 8.4 of the post confirmed from an independent direction. Section 19 of
`index.md` works through it.

Three gaps, reported rather than approximated: Stata has no MASC; Stata's `allsynth` is
bias-corrected SC rather than ridge-augmented SC and cannot take more predictors than it has
donors; and SC(B) is in none of the sheets.

## Not included

The authors' replication package (`replicationReference/`, 4.5 MB) is gitignored.
Obtain it from the article DOI if you want to compare implementations. The paper's
Monte Carlo study is deliberately out of scope here.
