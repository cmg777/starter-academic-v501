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
| `cheatsheet.R` | The minimum code that produces every estimate. ~160 lines, runs in half a minute, loads its data over HTTPS. |
| `tutorial.qmd` | Runnable Quarto notebook version of the ladder. |
| `build_bundle.sh` | Builds `r_sc_dsc_sdid.zip`, the downloadable Quarto project. |
| `script-review.md` | Code review of `analysis.R` — execution, determinism, the five findings and their fixes. |

```bash
Rscript analysis.R 2>&1 | tee execution_log.txt
```

Cold run ≈ 25 minutes (the `Synth` nested optimisation over 92 predictors dominates);
cached re-runs ≈ 2 minutes. `FORCE_REFIT=1` invalidates `cache/`.

## Packages

CRAN: `quadprog`, `Synth`, `ggplot2`, `dplyr`, `tidyr`, `readr`, `patchwork`, `scales`, `jsonlite`.

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
| `script-review.md` | `analysis.R`, `cheatsheet.R`, `prepare_data.R` | MINOR REVISION — 3 MED, 2 LOW, all fixed |
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

## Not included

The authors' replication package (`replicationReference/`, 4.5 MB) is gitignored.
Obtain it from the article DOI if you want to compare implementations. The paper's
Monte Carlo study is deliberately out of scope here.
