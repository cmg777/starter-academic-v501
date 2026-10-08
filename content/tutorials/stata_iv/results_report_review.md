# Results Report Review: stata_iv

**Report:** `results_report.md` (~10 KB, 215 lines)
**Script:** `analysis.do`
**Reviewed:** 2026-05-09 (post-execution review against `analysis.log` ground truth)
**Reviewer scope:** all 6 dimensions — accuracy, completeness, interpretation quality, figure descriptions, key findings, structure

## Verdict: MINOR REVISION

The report is structurally complete, well-organized, and pedagogically strong. Headline numbers (OLS β = 0.522, IV β = 0.944, KP rk Wald F = 16.32, endogeneity p = 0.0026) all verify cleanly against the execution log. However, **four numeric ranges and one arithmetic claim are off** — small individually, but the post writer will repeat them downstream, so they should be corrected at the report stage. No fabricated headline numbers, no misrepresented figures.

## Accuracy Check

**Numbers verified against `analysis.log` and CSV outputs: 38 of 42 checked match exactly (or within stated rounding); 4 mismatches found.**

Sampled headline verifications:
- ✓ Tab 4 Col 1 IV β = 0.944 (SE 0.176) — log line 1226: `.9442794   .1760958`
- ✓ Tab 4 Col 1 first-stage F = 16.32 — log lines 985, 1163
- ✓ Endogeneity test χ² = 9.085, p = 0.0026 — log lines 1244-1245
- ✓ Anderson-Rubin Wald F = 61.66, p < 0.0001 — log line 1196
- ✓ Tab 2 Col 2 OLS β = 0.522 (SE 0.050) — `tab2_ols.csv`
- ✓ Tab 3 Panel A Col 9 first stage: logem4 → avexpr = -0.607 — `tab3a_inst.csv`
- ✓ Tab 7 Cols 7-9 Hansen J p = 0.459, 0.554, 0.760 — `tab7_iv_health.csv`
- ✓ Tab 8 Panel C Hansen J p-value range 0.21-0.80 — `tab8_overid.csv` (min 0.211, max 0.796)
- ✓ Figure file sizes: 305 / 319 / 196 KB match `ls -la` output exactly
- ✓ Mortality range 2.15-7.99, exp converted to ~9 / ~2,940 deaths per 1,000 — log line 153
- ✓ Sample sizes 162 (whole world) / 64 (base sample) / 39% — log lines 121, 145

The 4 mismatches are listed in Issues #1-4 below.

## Issues Found

| # | Dimension | Severity | Location | Issue | Suggested fix |
|---|-----------|----------|----------|-------|---------------|
| 1 | Accuracy | MEDIUM | Table 5 interpretation paragraph | Report says "Standard errors widen modestly (0.16 to 0.40)" but actual SE range across `tab5_iv_controls.csv` Cols 1-9 is **0.156 to 0.535** (Col 4 SE = 0.535). The 0.40 upper bound is wrong. | Replace "(0.16 to 0.40)" with "(0.16 to 0.54)". |
| 2 | Accuracy | MEDIUM | Table 5 interpretation paragraph | Report says "first-stage F-statistics drop to 6-17" but Col 4 has F = **2.90** (not in the 6-17 range). The text already mentions Col 4's F = 2.90 in the next sentence, so the range above contradicts it. | Replace "6-17" with "2.90-16.76" (or "below 3 to nearly 17"), or rewrite as "first-stage F ranges from 2.90 (Col 4) to 16.76 (Col 7), straddling the conventional weak-IV threshold". |
| 3 | Accuracy | MEDIUM | Table 8 interpretation paragraph + Key Finding #6 | Report states Panel D coefficients on `avexpr` "fall to 0.40-0.52" or "halve from ~0.94 to 0.40-0.52". Actual Panel D range across all 10 columns (`tab8_overid.csv` Cols 21-30) is **0.402 to 0.879**. Cols 21-22 (using `euro1900` as alt instrument with `logem4` as control) keep avexpr at 0.81-0.88, while Cols 23-30 (using historical-institutions instruments cons00a/democ00a/cons1/indtime/democ1) fall to 0.40-0.52. The selective range hides a substantively interesting finding: the drop is concentrated in 8 of 10 specs. | Rewrite as: "the IV coefficient on `avexpr` falls to **0.40-0.52** in 8 of 10 columns (those using historical-institution alternatives — `cons00a`, `democ00a`, `cons1`, `indtime`, `democ1`); Cols 21-22 using `euro1900` as the alt instrument keep avexpr at 0.81-0.88, since `euro1900` is conceptually closer to a continuous mortality proxy than a clean institutional alternative." |
| 4 | Accuracy | MEDIUM | Metadata block — "Key packages" line | Package version numbers `ivreg2 4.1.11`, `estout 3.31`, `coefplot 1.8.7` are not printed in `analysis.log`. The log shows only `capture ssc install <pkg>` (which suppresses output if already installed). These versions are plausible but were not verified during this run. | Replace with: "Key packages: `ivreg2`, `ranktest`, `estout`, `coefplot` (all SSC; versions not captured in this run — run `which ivreg2` or `ado describe ivreg2` to record)." |
| 5 | Accuracy | LOW | Data Overview interpretation — "100-fold income range" | Report claims "log GDP per capita varies from 6.11 (~\\$450) to 10.22 (~\\$27,400), a 100-fold income range". Actual ratio: exp(10.22 - 6.11) = exp(4.11) = **61.0** (i.e., 61-fold, not 100-fold). The dollar conversions are correct (\\$450 → \\$27,400) but the ratio statement is rounded up generously. | Replace "100-fold income range" with "60-fold income range" (or "two-orders-of-magnitude income gap"). |
| 6 | Accuracy | LOW | Table 4 interpretation — Nigeria/Chile illustration | Report uses "Nigeria (`avexpr` ≈ 5.6)" and "Chile (`avexpr` ≈ 7.8)" to illustrate the 2.2-point gap and resulting 8-fold income increase. Actual values from `data_maketable4.csv`: Nigeria avexpr = **5.545**, Chile avexpr = **7.818** — a 2.27-point gap, yielding exp(0.944 × 2.27) ≈ **8.5-fold**. | Replace "5.6" with "5.5" (or keep illustrative-precision). The 8-fold claim still holds (slightly understates at 8.5-fold). Optional: change "8-fold" to "~8.5-fold" for precision. |
| 7 | Accuracy | LOW | Key Finding #3 — "27 out of 27 control sets" | Arithmetic for "27 specifications" is unclear. Tab 5 (9 cols) + Tab 6 (9 cols) + Tab 7 Cols 7-11 (5 cols) = **23** specs, and the range claimed (0.55-1.36) requires including Tab 7 Cols 1-6 (which the text excludes, since it ALSO claims health-channel specs are the only place IV approaches OLS). The 27 likely came from 9 + 9 + 9 (i.e., Cols 1-9 of all three tables, including the contradictory Tab 7 Cols 1-6). Either count is internally inconsistent with the paragraph. | Either: (a) state "27 specifications across Tables 5, 6, and 7 Cols 1-9; the IV coefficient ranges from 0.55 to 1.36 — its lowest values appearing in the health-channel specs (Tab 7 Cols 1-6)" — which keeps the 27 count and resolves the contradiction; or (b) state "23 robust specifications excluding the health-channel cols, range 0.61-1.36" — which keeps the simple-robustness narrative. |
| 8 | Interpretation quality | LOW | Table 5 interpretation paragraph | The phrase "AJR's argument that institutions are doing the work — not legal origin, religion, or which European power did the colonizing — survives this battery" is a strong qualitative claim, but the F-stat collapse to 2.90 in Col 4 and 6.05 in Col 2 means the survival is partly a **wide-CI** survival, not a **point-estimate** survival. Could mention this caveat. | After "survives this battery", add: "though Col 4 (Neo-Europes excluded + latitude) has F = 2.90 — its survival is in confidence-interval terms, not in tight-point-estimate terms." |
| 9 | Structure | LOW | Metadata block — runtime | Report states "Runtime: 41 seconds end-to-end" but the previous review noted the 41.97-second wall-clock figure included separate user/system breakdowns. Either is fine, but be consistent. | Optional: drop the parenthetical "end-to-end" or specify "41.97 s wall-clock". |

## Positive Highlights

- **Headline finding presented honestly with complete provenance.** The 0.944 IV vs 0.522 OLS gap is reported with the right SE (0.176), CI ([0.60, 1.29]), z-statistic (5.36), AND the endogeneity test (χ² = 9.09, p = 0.003) that empirically motivates the IV — a complete chain of reasoning, not just the headline coefficient.
- **The first-stage F situation is communicated honestly.** Many tutorials gloss over the F = 16.32 vs Stock-Yogo iid 16.38 = "essentially a wash" tension. This report flags it explicitly in the Table 4 interpretation, in Key Finding #2, and in the Surprises section. The Anderson-Rubin Wald-test fallback (F = 61.66) is presented as the right weak-IV-robust hedge.
- **Table 7 health-channel discussion is the report's standout.** The "bad-control vs exclusion-violation" framing is exactly the right pedagogical posture — present both readings, note the data alone cannot adjudicate, flag the F-statistic collapse to 1.17-4.86 that limits what the Hansen J non-rejections buy. Honest causal-inference pedagogy.
- **Panel D framing in Key Finding #6** correctly identifies it as the strongest direct test of the exclusion restriction. Even with the inaccuracy noted in Issue #3, the conceptual framing is correct.
- **Albouy (2012) imputation caveat carried forward consistently.** Appears in §0 of the script, in the Table 8 interpretation, in Key Finding #4, AND in the Surprises section. A blog-post writer will not miss this important nuance.
- **LATE vs ATE distinction in Key Finding #7.** This is a frequent omission in IV tutorials at the graduate level; flagging it here means the post writer will not over-claim a population ATE.
- **Sample-size quirk explained** ("the 47-country gap is ex-colonies vs the AJR base sample"). Catches a detail that confuses many readers and prevents downstream "is this a typo?" emails.
- **Specific dollar-amount conversions** (\\$450, \\$27,400) make the 64-country income gap concrete. Even with the 60-vs-100-fold rounding issue, the specificity is exactly what a development-economics audience needs.
- **Figure inventory descriptions are specific, not generic.** Each row names variables, axes, color semantics, and a key takeaway with a number — e.g., "Strong negative slope (–0.61)" rather than "negative relationship".

## Priority Action Items

1. **[MED]** Correct the Tab 5 SE range from "0.16 to 0.40" → "0.16 to 0.54" (Issue #1).
2. **[MED]** Correct the Tab 5 first-stage F range from "6-17" → "2.90-16.76" or rewrite (Issue #2).
3. **[MED]** Rewrite the Tab 8 Panel D paragraph + Key Finding #6 to acknowledge that the drop to 0.40-0.52 is concentrated in 8 of 10 columns; Cols 21-22 with `euro1900` keep avexpr at 0.81-0.88 (Issue #3). This is the most substantively important fix — it changes the story slightly.
4. **[MED]** Either remove fabricated package version numbers or replace with verified versions from `ado describe` (Issue #4).
5. **[LOW]** Fix "100-fold" → "60-fold" income range (Issue #5).
6. **[LOW]** Reconcile the "27 out of 27" arithmetic in Key Finding #3 with the paragraph that excludes Tab 7 Cols 1-6 (Issue #7).
7. **[LOW]** Optional Nigeria/Chile precision tweak (Issue #6).

The report does not need re-running of the script. All fixes are textual edits to `results_report.md` against numbers that are already in the CSV outputs and `analysis.log`. Estimated time: ~10 minutes.

## Methodology

- 6 review dimensions per `references/review-checklist.md`
- Severity per `references/scoring-and-criteria.md` (HIGH/MEDIUM/LOW)
- Verdict per `references/scoring-and-criteria.md` (MINOR REVISION = no HIGH but 3+ MEDIUM)
- Numbers cross-checked against `analysis.log` (10,812 lines), 9 result CSVs, and `data_maketable4.csv` (for Nigeria/Chile spot-check)
- All 3 PNG file sizes verified against `ls -la`
- Read-only review — no files were modified
