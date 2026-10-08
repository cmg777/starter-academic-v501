# Review Report: r_basic_synthetic_control/script.py

## Summary

- **File reviewed:** `script.py` (Colab-exported R code with `.py` extension)
- **Reviewer:** Claude Code, 2026-04-29
- **Verdict:** **MAJOR REVISION** — three HIGH-severity issues block execution and reproducibility
- **Resolution:** all findings are addressed by the new `analysis.R` companion script in the same folder

---

## Dimension scores (1–5)

| # | Dimension                  | Score | Notes |
|---|----------------------------|-------|-------|
| 1 | Execution                  | 1     | Cannot run as Python (R syntax) or as R (Python triple-quoted blocks break the parser). |
| 2 | Structure & Organization   | 2     | Sections are present but live inside Python docstrings rather than `# ──` banners. No header banner, no usage block. |
| 3 | Code Quality               | 2     | Notebook-export style: deprecated `as.tibble()`, dead `library(SCtools)` reference, `dataprep()` + school-rescaling logic copy-pasted three times. |
| 4 | Reproducibility            | 1     | No `set.seed()`, no saved figures, no CSV exports, no execution log. Designed for inline Colab display only. |
| 5 | Figures                    | 2     | Uses base-R `path.plot()` and `gaps.plot()` from the Synth package; output ignores the site palette and clashes with every other R post in the repo. |
| 6 | Data Handling              | 3     | `data("basque")` works, but no panel-shape verification (17×43), no balanced-panel check, no `source_data.csv` export. |
| 7 | Statistical Correctness    | 3     | `synth()` is called correctly with BFGS; predictor balance and weight tables are extracted; but the headline ATT (mean 1970–1997 gap) is never reported as a single number. |
| 8 | Causal Inference           | 3     | Synthetic-control assumptions are described in prose, but the ATT estimand is not stated formally and the in-space placebo never reports a formal MSPE-ratio rank or pseudo-p-value. |

---

## Findings

### HIGH severity

- **H1. Wrong file extension.** The file is named `script.py` but contains 100% R code (`library(Synth)`, `<-` assignments, R-only function calls). Neither `python script.py` nor `Rscript script.py` succeeds.
  - **Fix:** ship a real R script alongside it. New file: `analysis.R`.

- **H2. Python triple-quoted docstrings wrap the R code.** Lines like `"""# Setup"""` (line 16) and the long `"""...$X_{1}..."""` blocks (e.g. lines 53–72, 115–122, 162–175, 313–325, 434–476) are valid Python but are syntax errors in R — `Rscript script.py` aborts on the first `"""`.
  - **Fix:** convert markdown narration to R `#`-comments and `cat()` calls in `analysis.R`.

- **H3. No reproducible artifacts.** The script has no figure-save calls, no CSV exports, no log file, and no `set.seed()`. Re-running on a different machine produces no on-disk evidence of the analysis.
  - **Fix:** in `analysis.R`, set `set.seed(42)`, save 4 PNGs via `ggsave(..., dpi = 300)`, write 5 CSVs via `readr::write_csv()`, and pipe the run to `execution_log.txt`.

### MEDIUM severity

- **M1. Site-palette violation.** `path.plot()` (line 219) and `gaps.plot()` (line 234, 306) call base-R `plot()` with default colors. The repo standard is steel blue `#6a9bcc`, warm orange `#d97757`, near black `#141413`, teal `#00d4c8` — see `r_demeaning_twfe/analysis.R`.
  - **Fix:** rebuild figures in ggplot2 with explicit palette constants and a shared `theme_site()`.

- **M2. Placebo inferential summary missing.** The placebo loop (lines 326–390) computes gap traces and excludes regions where MSPE > 5× Basque, but never reports the MSPE-ratio rank or pseudo-p-value (`rank / N`). The reader must eyeball the line plot.
  - **Fix:** compute pre/post MSPE per region, sort by ratio, print Basque's rank, and emit `placebo_mspe_ratios.csv`.

- **M3. ATT estimate never printed.** `gaps` is computed (line 186) and printed as a 43-row vector, but the headline number — mean post-1970 gap, in 1986 thousands USD — never appears.
  - **Fix:** `cat("Estimated ATT (1970-1997 mean gap):", round(mean(post_gap), 3), "thousand 1986 USD per capita\n")`.

- **M4. Code duplication.** The `dataprep()` call plus the school.high consolidation plus the percentage-rescaling block appear three times verbatim (Basque main analysis lines 75–160, Catalonia placebo lines 244–290, in-space placebo loop lines 332–380). Roughly 90 lines of duplication.
  - **Fix:** factor into a single `prepare_basque(treated_id, control_ids)` helper.

### LOW severity

- **L1. Dead reference.** `library(SCtools)` (line 22) is commented out yet `SCtools` is referenced in passing in the markdown.
  - **Fix:** remove the reference; this script does not need SCtools.

- **L2. Deprecated function.** `as.tibble()` (line 32, commented) is deprecated in favor of `as_tibble()`.
  - **Fix:** drop the line entirely; `glimpse()` already covers the inspection need.

- **L3. LaTeX in execution context.** The markdown blocks contain LaTeX (`$X_1$`, the constrained-optimization equations). These render in Colab/Jupyter but produce raw `$X_1$` text in any plain-text execution log. Equations belong in the blog post, not the runnable script.
  - **Fix:** strip equations from `analysis.R`; keep them for the eventual `index.md` notebook-style post.

---

## Resolution map

| Finding | Addressed in `analysis.R` |
|---------|---------------------------|
| H1 | New file uses `.R` extension, runs with `Rscript analysis.R`. |
| H2 | All narration converted to `# ──` section banners and `cat()` print blocks. |
| H3 | `set.seed(42)`; 4 `ggsave()` calls; 5 `write_csv()` calls; pipe to `execution_log.txt`. |
| M1 | Site palette constants + `theme_site()` applied to all figures; base-R plotting removed. |
| M2 | Section 7 builds `placebo_mspe_ratios.csv` and prints Basque's MSPE-ratio rank as a pseudo-p-value. |
| M3 | Section 8 prints the headline ATT. |
| M4 | Sections 2–7 share a single `prepare_basque(treated_id, control_ids)` helper. |
| L1 | `SCtools` not loaded or referenced. |
| L2 | `as_tibble()` not needed; `glimpse()` and `summary()` are used. |
| L3 | No LaTeX in `analysis.R`; equations reserved for the future blog post. |

---

## Reviewer notes

- The substantive statistical content of `script.py` is faithful to Abadie & Gardeazabal (2003) and Abadie, Diamond & Hainmueller (2011). The defects are all in *form* (extension, docstrings, palette, missing artifacts) and *exposition* (no headline ATT, no formal placebo rank), not in the synthetic-control method itself.
- `script.py` is intentionally retained in the folder as a historical artifact (the original Colab export). All future work should reference `analysis.R`.
