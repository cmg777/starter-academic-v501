# Script Review: stata_sdid

**Script:** `analysis.do` (367 lines)
**Language:** Stata
**Executed:** 2026-06-07 (Stata 19 SE, batch) — clean run, this file unchanged since
**Status:** All code runs

## Verdict: **ACCEPT**

A clean, well-organized, reproducible do-file that executes end-to-end without errors and reproduces the published SDID/SC/DiD results exactly. All issues found are LOW (header/comment polish + one developer-specific path).

## Execution Results

- Exit code: **0**
- Figures generated: **9** PNG files (`stata_sdid_*.png`)
- Data exports: **6** CSVs to `web_app/data/`
- Warnings: none (the `synth2 placebo(unit)` optimizer prints verbose interior-point progress, but no errors/convergence failures)
- Reproduced KEY NUMBERS: Raw 2×2 DiD −27.35; DiD(sdid) −27.35; synth2 SC −19.48 (RMSE 1.66); SC(sdid) −19.62; **SDID −15.60** (SE 9.88, 95% CI [−34.97, 3.76]); permutation p 0.026 — all matching Arkhangelsky et al. (2021).

## Dimension scores

| # | Dimension | Score |
|---|-----------|:----:|
| 1 | Execution | 10/10 |
| 2 | Structure & organization | 10/10 |
| 3 | Code quality | 9/10 |
| 4 | Reproducibility | 9/10 |
| 5 | Figure conventions | 9/10 |
| 6 | Data handling | 10/10 |
| 7 | Statistical correctness | 10/10 |
| 8 | Causal inference | 9/10 |

## Issues Found

| # | Dimension | Severity | Location | Issue | Suggested fix |
|---|-----------|----------|----------|-------|---------------|
| 1 | Code quality | LOW | line 9 | Header lists `distinct` under required SSC packages, but `distinct` is never called. | Remove `distinct` from the requires comment. **(fixed)** |
| 2 | Causal inference | LOW | header | The estimand (ATT) is clear from context but not stated explicitly in a comment. | Add an `* Estimand: ATT …` line to the header. **(fixed)** |
| 3 | Reproducibility | LOW | line 26 | `cd` uses a developer-specific absolute path, so a student running the file elsewhere must edit it. | Add a comment flagging the path to edit (kept absolute so the batch run is deterministic). **(fixed)** |
| 4 | Code quality | LOW | line 54 | `scalar ca_id` is assigned but never used downstream (the local `` `ca' `` is used everywhere). | Harmless; left in place to keep `analysis.log` byte-valid. |
| 5 | Figure conventions | INFO | all `graph export` | The skill's `dpi=300, bbox_inches` is matplotlib-specific; Stata uses `width(2000)`, which is the correct analog. | No action. |

## Positive Highlights

- **Exemplary structure:** numbered section dividers (1–9), a full header docstring (run command, dependencies, data provenance, the outcome-only "same information set" rationale), and a palette config block.
- **Honest, correct comparison design:** synth2 matches the full pre-period *path* (each pre-year a separate predictor, lines 101–106), making the SC↔SDID comparison apples-to-apples; `method(did)` is cross-checked against the hand-computed 2×2 (lines 90–93).
- **Subtle correctness done right:** the SDID counterfactual is anchored by its **λ-weighted** pre-period gap (lines 233–239), the only level-anchoring consistent with how SDID's −15.60 actually arises — not a naive mean shift.
- **Reproducible & self-contained:** `seed(1213)` for placebo, local data caching (`capture confirm file` + `save`), scratch file cleaned up (line 355), and every figure/number the post and web app use is exported here.
- **Inference matched to design:** in-space placebo permutation for one treated unit, with both the SE-based CI and the rank-based p-value computed.

## Priority Action Items

1. **[LOW]** Trim `distinct` from the requires header (fixed).
2. **[LOW]** State the ATT estimand in a header comment (fixed).
3. **[LOW]** Flag the absolute `cd` path for students (fixed).

*No per-post `README.md` exists in the bundle, so no file-inventory update was made. Read-only review; the three comment-only fixes above are execution-neutral and do not change `analysis.log`.*
