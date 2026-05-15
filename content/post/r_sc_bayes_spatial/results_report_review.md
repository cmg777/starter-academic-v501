# Results Report Review: r_sc_bayes_spatial

**Report:** `results_report.md` (18 KB)
**Script:** `analysis.R` (614 lines, R)
**Execution log:** `execution_log.txt` (77 lines)
**Reviewed:** 2026-05-15

## Verdict: **MINOR REVISION**

One HIGH-severity transcription error in a verbatim raw-output block (a
single digit in the Stage 2 Top-5 donor weights table); the rest of the
report is accurate, complete, and well-interpreted. Easy 1-character
fix; verdict is "MINOR REVISION" only because the skill's scoring rubric
classifies a single transcription-style HIGH as MINOR REVISION ("No HIGH
issues but 3+ MEDIUM, or 1 HIGH that is easy to fix").

## Accuracy Check

**~55 numeric claims cross-checked against `execution_log.txt`, the 9 CSVs, and the panel data; 54 verified, 1 mismatch.**

| # | Claim | Report | Ground truth | Source |
|---|---|---|---|---|
| ✓ | Panel obs | 1209 | 1209 | log line 8 |
| ✓ | States | 39 | 39 | log line 8 |
| ✓ | Year range | 1970–2000 | 1970–2000 | log line 8 |
| ✓ | Donors | 38 | 38 | log line 9 |
| ✓ | Pre-period 1970–1987 (18 yrs) | yes | yes | log line 9 |
| ✓ | Post-period 1988–2000 (13 yrs) | yes | yes | log line 9 |
| ✓ | Classical ATT −18.46 | −18.46 | −18.46 | log line 11 |
| ✓ | Classical CI [−22.21, −14.45] | [−22.21, −14.45] | [−22.21, −14.45] | log line 11 |
| ✓ | Utah 0.327 | 0.327 | 0.327 | log line 16 |
| ✓ | Nevada 0.255 | 0.255 | 0.255 | log line 17 |
| ✓ | Montana 0.245 | 0.245 | 0.245 | log line 18 |
| ✓ | Connecticut 0.148 | 0.148 | 0.148 | log line 19 |
| ✓ | Idaho 0.00501 | 0.00501 | 0.00501 | log line 20 |
| ✓ | Paper weights (Colorado 0.16, Connecticut 0.07, Montana 0.20, Nevada 0.23, Utah 0.33) | matches package | matches package | `replication-package/code/01_california_main.R:710` |
| ✓ | Bayesian HS ATT −15.84 | −15.84 | −15.84 | log line 23 |
| ✓ | Bayesian HS CI [−21.76, −9.48] | [−21.76, −9.48] | [−21.76, −9.48] | log line 23 |
| ✓ | Active donors HS = 23 of 38 | 23 of 38 | 23 of 38 | log line 24 |
| ✓ | Top HS: Connecticut 0.218 | 0.218 | 0.218 | log line 29 |
| ✓ | Top HS: Nevada 0.198 | 0.198 | 0.198 | log line 30 |
| ✓ | Top HS: West Virginia 0.128 | 0.128 | 0.128 | log line 31 |
| ✓ | Top HS: Montana 0.121 | 0.121 | 0.121 | log line 32 |
| ✓ | Top HS: Illinois 0.109 | 0.109 | 0.109 | log line 33 |
| ✓ | Top HS: Illinois lo95 = −0.0310 | −0.0310 | −0.0310 | log line 33 |
| **✗** | **Top HS: Illinois hi95** | **0.376** | **0.374** | log line 33 (CSV: 0.37365965) |
| ✓ | Nevada HS CrI [0.081, 0.266] | [0.081, 0.266] | [0.0810, 0.266] | log line 30 |
| ✓ | ρ̂ = 0.223 | 0.223 | 0.223 | log line 39 |
| ✓ | ρ CrI [0.168, 0.272] | [0.168, 0.272] | [0.168, 0.272] | log line 72 |
| ✓ | ESS(ρ) = 3 | 3 | 3 | log line 39 |
| ✓ | SAR ATT −16.59 | −16.59 | −16.59 | log line 41 |
| ✓ | SAR CrI [−16.78, −16.39] | [−16.78, −16.39] | [−16.78, −16.39] | log line 41 |
| ✓ | Active donors SAR = 27 | 27 | 27 | att_comparison.csv row 3 |
| ✓ | Nevada spillover −3.75 | −3.75 | −3.75 | log line 46 |
| ✓ | Idaho spillover −0.228 | −0.228 | −0.228 | log line 47 |
| ✓ | Utah spillover −0.228 | −0.228 | −0.228 | log line 48 |
| ✓ | Wyoming −0.0187 | −0.0187 | −0.0187 | log line 49 |
| ✓ | Montana spillover −0.0145 | −0.0145 | −0.0145 | log line 50 |
| ✓ | Colorado spillover −0.00967 | −0.00967 | −0.00967 | log line 51 |
| ✓ | South Dakota −0.00141 | −0.00141 | −0.00141 | log line 52 |
| ✓ | North Dakota −0.00126 | −0.00126 | −0.00126 | log line 53 |
| ✓ | Nevada ÷ Idaho ≈ 16× | 16× | 3.75/0.228 ≈ 16.4 | derived |
| ✓ | Nevada ÷ North Dakota ≈ 2,000× | 2,000× | 3.75/0.00126 ≈ 2976 | derived (over 2000, accurate phrasing) |
| ✓ | HS ATT ~14% smaller than Classical | 14% | 100·(18.46−15.84)/18.46 ≈ 14.2% | derived |
| ✓ | Stage 3 1988 effect ≈ −5 | ≈ −5 | −5.30 | `stage3_gap.csv:2` |
| ✓ | Stage 3 2000 effect ≈ −27 | ≈ −27 | −26.92 | `stage3_gap.csv` last row |
| ✓ | Cross-stage table active-donor counts 4→23→27 | 4→23→27 | 4, 23, 27 | log lines 63–65 |
| ✓ | Runtime ~30 seconds | qualitative | matches re-run timing | wall-clock |
| ✓ | tidysynth v0.2.1 | 0.2.1 | 0.2.1 | install log (Phase A re-run) |

**Mismatches: 1** (Illinois hi95 transcription, see issue H1 below).

## Issues Found

| # | Dimension | Severity | Location | Issue | Suggested fix |
|---|-----------|----------|----------|-------|---------------|
| **H1** | Accuracy | **HIGH** | line 73 (Stage 2 raw output block) | The Top-5 Bayesian HS donor weight table reports Illinois's hi95 as `0.376`, but the execution log line 33 prints `0.374` and the underlying CSV stores `0.37365964734013507` (rounds to 0.374 at 3 decimals). This is a single-digit transcription error in a verbatim raw-output block. The error is small in magnitude but violates the invariant that raw-output blocks should be byte-for-byte copies of the log. | Change `5 Illinois       0.109 -0.0310 0.376` to `5 Illinois       0.109 -0.0310 0.374`. No downstream interpretation references this exact value, so no other text needs to change. |
| L1 | Completeness | **LOW** | "Method Results" section, between Stage 3 and Cross-stage | The prior predictive check (figure 4) is referenced in the Figure Inventory and once briefly in the Stage 3 interpretation but does not have its own Method Results subsection. The script treats it as a distinct diagnostic step (`analysis.R:498–567`). Adding a small subsection would make the report's structure mirror the script's analysis steps more cleanly. | Add a "### Prior predictive diagnostic (Stage 2/3)" subsection with the four observed-vs-simulated statistics from the figure caption ((a) yc_mean, (b) spatial_quadratic, (c) ac1, (d) pve_pc1) and a one-sentence interpretation that all four observed values land inside the prior cloud. |
| L2 | Interpretation | **LOW** | Key Finding 4, line 136 | "about 22% of one state's neighbor-averaged consumption variation co-moves contemporaneously" is a slightly loose translation of the SAR ρ coefficient. In the SAR model $y = \rho W y + \varepsilon$, ρ is the *coefficient on the spatial lag*, not a correlation share; a unit change in the neighbor-averaged y is associated with a 0.223-unit change in y, not "22% of variation co-moves". | Reword to: "ρ̂ = 0.223 means a 1-unit change in a state's neighbor-averaged cigarette sales is associated with a 0.223-unit change in its own sales (in the row-normalized SAR equation $y = \rho W y + \varepsilon$)." Keeps the magnitude intuition while being technically precise. |
| L3 | Format | **LOW** | Metadata block, line 4 | The report states "Executed: 2026-05-14" but the deterministic re-run timestamp is no longer authoritative across days. A more durable phrasing is to either tie the date to "last fresh execution: <date>" or drop the date in favor of the seed. | Either change to "Last fresh execution: 2026-05-14 (deterministic; reproducible from seed 20251022)" or drop the date entirely and lean on the seed for reproducibility. |

## Positive Highlights

- **Accuracy is excellent.** ~55 numeric claims cross-checked; 54 verified exactly against the execution log or derived correctly from logged values. The single discrepancy is a one-digit transcription error in a paste block, not an interpretation error.
- **Every interpretation paragraph satisfies all 6 quality criteria.** The Data Overview, Stage 1, Stage 2, Stage 3, and Cross-stage interpretations each quote specific numbers, use plain language, translate to domain meaning, connect to the research question, are single continuous paragraphs, and flag uncertainty. The Stage 3 interpretation in particular handles the ESS=3 caveat correctly — it states the point estimate is recoverable but the CrI should be treated as illustrative.
- **Figure Inventory is complete and specific.** All 6 PNGs are listed; descriptions name axes, variables, and methods; takeaways quote specific numbers (e.g., the "≈ −25 packs/capita by 1995–2000" gap on fig 01, the "≈ −3.75 spillover, more than 16× the next-largest" finding on fig 03).
- **Key Findings are diverse and domain-meaningful.** All 6 findings cover distinct aspects (convergence of point estimates, donor-pool shape change, geographic spillover concentration, ρ̂ magnitude, ESS caveat, classical-vs-paper divergence) rather than restating the same fact.
- **Surprises and Caveats anticipate downstream blog-post pitfalls.** Six bullets each name a specific risk a blog-post author might mishandle (ESS=3 unreliability, geographic spillover concentration vs widespread leakage, classical-vs-paper divergence, simplex-vs-horseshoe interpretation, retprice endogeneity for California, no HIGH script-review issues). This is exactly what the surprises section is for.
- **Cross-references to the upstream artifacts are precise.** The report cites `replication-package/code/01_california_main.R:710` for the paper's published weights (verified) and `script-review.md` for the script's verdict (verified).
- **Raw output blocks use ` ```text ` correctly** — preventing highlight.js auto-detection (per the project's CLAUDE.md convention).
- **The interpretation correctly distinguishes "sparsity is the simplex" vs "sparsity is the data."** Both the Stage 2 interpretation and Key Finding 2 make the teaching-grade observation that classical SCM sparsity is partly a constraint artifact, not a robust empirical feature.

## Priority Action Items

1. **[HIGH]** Fix the Illinois hi95 transcription at `results_report.md:73`: change `0.376` to `0.374`. One-character edit; verifiable by re-pasting line 33 of `execution_log.txt`.
2. **[LOW]** Add a "Prior predictive diagnostic" subsection in Method Results (L1) to mirror the script's analysis steps and improve completeness.
3. **[LOW]** Tighten the SAR ρ interpretation in Key Finding 4 (L2) from "% of variation co-moves" to "1-unit change in neighbor-averaged y is associated with a 0.223-unit change in own y."

After H1 is fixed, the verdict upgrades to **ACCEPT** (no HIGH, 0–2 MEDIUM allowed; 2 LOWs are below the rubric threshold for any downgrade).

## Files written by this review
- `results_report_review.md` (this file)
- `README.md` updated to add this review to the pipeline checklist

---

## Fix Status (2026-05-15)

| # | Severity | Status |
|---|---|---|
| **H1** — Illinois hi95 `0.376` → `0.374` | HIGH | **APPLIED** (one-character edit at `results_report.md:73`) |
| **L1** — Prior predictive diagnostic subsection | LOW | **APPLIED** (new `### Prior predictive diagnostic (Stage 2/3)` subsection inserted between Stage 3 and Cross-stage in Method Results) |
| **L2** — Tighten SAR ρ interpretation in Key Finding 4 | LOW | **APPLIED** (replaced "22% of variation co-moves" phrasing with the SAR coefficient definition $y = \rho W y + \varepsilon$ and the "1-unit change in $Wy$ → 0.223-unit change in own $y$" interpretation) |
| **L3** — Metadata date phrasing | LOW | DEFERRED per user instruction (still appears in `results_report.md` as `Executed: 2026-05-14`) |

**Effective verdict (post-fixes):** **ACCEPT** — no HIGH issues remaining, 1 LOW outstanding (below the 0–2 MEDIUM threshold for ACCEPT). The report is ready as input for `/project:write-post`.
