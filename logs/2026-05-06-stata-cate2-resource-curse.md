# Stata CATE Tutorial: Resource Curse with Stata 19

**Date**: 2026-05-06 to 2026-05-07
**Post**: `content/post/stata_cate2/`
**Status**: Complete

## What was done

Created a self-contained Stata 19 tutorial on Conditional Average Treatment Effects (CATE) applied to the resource curse hypothesis, inspired by Hodler, Lechner & Raschky (2023).

### Deliverables

- `index.md` (1,380 lines) -- full blog post with 10 sections, 3 Mermaid diagrams, real Stata output, 8 PNG figures
- `analysis.do` (740 lines) -- companion Stata do-file (17 sections)
- `analysis.log` -- Stata 19.5 SE execution log
- `infographic_instructions.md` -- chalkboard infographic prompt (4 sections: full prompt, negative, condensed, panel reference data)
- `featured.webp` -- featured image
- 8 PNG figures from `categraph` (GATE plots, IATE histogram, IATE function plots)
- `sim_resource_curse.csv` + `.dta` -- simulated dataset (3,000 obs)

### Key results

- Three findings from the paper reproduced:
  1. Mining increases NTL (ATE = 0.15) and conflict (+6.6 pp)
  2. Price effects are non-linear (2-1 ~ 0, 3-1 ~ 0.41)
  3. Institutional quality moderates mining (chi2 = 96.9, p < 0.0001) but not prices (p = 0.12)
- GATE direction differs from paper: weaker institutions show LARGER mining effects (downward slope). Documented as DGP parametrization difference.
- NTL 3v2 comparison fails due to propensity score overlap violation on 300 obs. Documented with PO fallback.

### Technical notes

- Stata SE 19.5 at `/Applications/StataNow/StataSE.app/Contents/MacOS/stata-se`
- Batch mode: `stata-se -b do analysis.do`
- Runtime: ~45 min total (rforest estimations are CPU-intensive on SE)
- Overlap issue on 3v2: AIPW fails, PO with `pstolerance(1e-8)` produces unreliable estimate. Comparison excluded from summary.
- Analysis.log contains two appended runs (first failed at 3v2, continuation picked up from there)

### Review

Full 12-dimension review completed. Verdict: MINOR REVISION (applied). Key fixes:
- GATE interpretation corrected from "upward slope" to "downward slope" (matching actual data)
- Conditional "should show" language replaced with declarative statements using actual numbers
- ATE-truth deviation paragraph added
- `pstolerance` defined inline
