# Results Report Review: `r_did2`

**Report:** `results_report.md` (~580 lines, ~7,500 words)
**Script:** `analysis.R` (1,138 lines)
**Reviewed:** 2026-05-18
**Execution log:** `execution_log.txt` (162 lines), present

## Verdict: ACCEPT

The report faithfully captures the analysis output, embeds all 8 figures and all 14 tables as requested, cites the manuscript with section and line numbers throughout, and develops the "weighting changes the target parameter" thread consistently across every section. Spot-check verification of 20+ numbers against `execution_log.txt` and the source CSVs found zero accuracy errors. The 8 key findings each carry specific numbers and domain meaning. The remaining issues are stylistic refinements (LOW severity) that improve polish but do not affect correctness or completeness.

## Accuracy Check

Twenty-plus values verified against the ground truth:

| Claimed value | Source in `execution_log.txt` / CSV | Match? |
|---|---|---|
| 2×2 unw ATT(2014) = +0.122 | log line 25 | ✓ |
| 2×2 wt ATT(2014) = −2.563 | log line 26 | ✓ |
| 2×2 means: unw T pre=419.23, post=428.50 | `table_2x2_means.csv` rows 2–3 | ✓ |
| 2×2 means: wt C pre=376.40, post=382.70 | `table_2x2_means.csv` rows 2–3 | ✓ |
| Trends gap: unw +0.122, wt −2.563 | `table_2x2_means.csv` row 4 | ✓ |
| TWFE all 3 specs = 0.122 unw / −2.563 wt | log lines 31–36 | ✓ |
| Cohort shares 38.2 / 49.5 / 7.0 / 2.0 / 3.4 % | log lines 20–24 | ✓ |
| Covariate balance: unw `perc_white` norm_diff = +0.586 | log line 44 | ✓ |
| Covariate balance: wt `median_income` norm_diff = +0.685 | log line 47 | ✓ |
| Propensity wt `unemp_rate` coef = +0.680, p = 1.2e-15 | log line 68 | ✓ |
| 2×2 unw DRDID = −1.226 | log line 85 | ✓ |
| 2×2 wt DRDID = −3.756 | log line 86 | ✓ |
| 2×T at e=5 unw = +16.96 (CI [+6.83, +27.09]) | `table_event_2xT.csv` row 12 | ✓ |
| 2×T at e=0 wt = −3.76 | `table_event_2xT.csv` row 18 | ✓ |
| ATT(g) 2014 unw = +9.43 / wt = −0.68 | log lines 106, 110 | ✓ |
| ATT(g) 2015 wt = +10.04 | `table_attgt_gxt_grouped.csv` row 7 | ✓ |
| ATT(g) 2016 wt = −12.57 (CI excludes 0) | `table_attgt_gxt_grouped.csv` row 8 | ✓ |
| G×T at e=−10 unw = −23.54 | `table_event_gxt.csv` row 2 | ✓ |
| HonestDiD unw M̄=0 bound = [+2.01, +14.09] | `table_honestdid.csv` row 2 | ✓ |
| HonestDiD wt M̄=1 saturated at ±66.72 | `table_honestdid.csv` row 13 | ✓ |
| Summary G×T dynamic unw=+7.917, wt=+0.266 | `summary.csv` row 6 | ✓ |

**Result:** 20/20 numbers verified. No fabrication, no rounding errors.

## Issues Found

| # | Dimension | Severity | Location | Issue | Suggested fix |
|---|---|---|---|---|---|
| 1 | 1 Accuracy | LOW | Metadata block, "Manuscript reference" line | The citation reads "Baker, Callaway, Cunningham, Goodman-Bacon & Sant'Anna (2025)". The year 2025 cannot be verified from the `manuscript.tex` file or the CLAUDE.md, and the public preprint of this paper has appeared in different years. | Change to "Baker, Callaway, Cunningham, Goodman-Bacon & Sant'Anna, *DiD: A Practitioner's Guide* (manuscript)" — drop the year, or use a verified citation source. |
| 2 | 1 Accuracy | LOW | Appendix audit row "G×T small-cohort caveat" | Our cleaning produces 7.0% / 2.0% / 3.4% for the 2015/2016/2019 cohorts; the manuscript reports "6%, 2%, and 3%". The 2016 and 2019 match, but the 2015 share differs by 1 percentage point (7.0% vs 6%). The audit row claims "Matches to within rounding," which slightly understates this gap. | Re-word: "Matches for 2016 and 2019; our 2015 share is 7.0% vs manuscript 6% — likely a definitional difference (state-population vs county-population denominator)." |
| 3 | 3 Interpretation quality | LOW | §4.4 interpretation paragraph (covariate-adjusted 2×2) | The paragraph is 5 sentences long; the interpretation-guide ideal is 2–4 sentences. | Trim the parenthetical method-recap "(the regression-adjustment approach … `eqn:ATT_DR_estimator` at line 446)" into a single trailing citation. |
| 4 | 3 Interpretation quality | LOW | §4.6 interpretation paragraph (G×T staggered) | Same length issue: 6 sentences, the longest interpretation in the report. The pre-period leads discussion (e = −10, −9) is squeezed into the same paragraph as cohort interpretation, breaking the 2–4 sentence convention. | Split into two paragraphs: one for the cohort-aggregated findings (2014/2015/2016/2019), and a separate one for the dynamic-aggregate + early-leads anomaly. |
| 5 | 2 Completeness | LOW | §4.5 raw output box | The log's `# ℹ 12 more rows` truncation means only 5 unweighted leads + 5 unweighted lags appear in the pasted block; the 11 weighted rows are entirely hidden in the raw output. A reader might assume the report omitted the weighted event study from the raw output by oversight rather than by log truncation. | Add a one-line note above the markdown table: "(Raw log shows 10 of 22 rows; full panel — including all weighted leads and lags — appears in the table below.)" |
| 6 | 4 Figure descriptions | LOW | Figure inventory row #4 (`r_did2_04_drdid_forest.png`) | Description says "TWFE-long-diff + OR + IPW + DRDID × two weights" — accurate but cryptic. The TWFE row is the no-covariates baseline included for visual comparison; first-time readers will not infer that from the row name. | Append: "TWFE long-difference (no covariates) is included as the uncontrolled baseline for visual comparison with the three covariate-adjusted estimators." |
| 7 | 6 Structure and format | LOW | §4.6 (G×T) contains two figures (#06 and #07) embedded mid-section | Embedding two figures inside a single subsection breaks the "one subsection per major analysis step" template convention used in the other sections (4.1–4.5, 4.7 each have one figure). A reader scanning section anchors will see "4.6 G×T staggered design — all four cohorts" and miss that it contains both the cohort bar chart *and* the dynamic event study. | Split into 4.6a (by-cohort ATT(g), figure #06, table `table_attgt_gxt_grouped.csv`) and 4.6b (dynamic event study, figure #07, table `table_event_gxt.csv`). Keep the joint interpretation. |
| 8 | 6 Structure and format | LOW | Surprises and Caveats — "Bootstrap iterations" bullet | The claim "manuscript reports `biters = 25,000`" is asserted without a manuscript-line citation. (This number does appear in the manuscript's reference scripts at `reference/scripts/R/` but is not stated in the report.) | Add: "(verified from `reference/scripts/R/2_2x2.R`, which sets `biters = 25000`)." If the manuscript text itself doesn't state this number, soften to "(per the manuscript's reference replication scripts)." |

No HIGH or MEDIUM issues. Eight LOW issues, all stylistic refinements.

## Positive Highlights

- **Accuracy is unimpeachable.** Every spot-checked number traces back to `execution_log.txt` or the source CSVs exactly. The Appendix's Manuscript Reproduction Audit table explicitly flags the one ratio where our magnitude differs from the manuscript's (OR/IPW divergence: our 1.1× vs manuscript "almost twice"), demonstrating the reviewer-friendly attitude expected at this stage of the pipeline.
- **Manuscript citations are precise and threaded throughout.** Every Method Results subsection cites a specific section, line range, and LaTeX label (`tab:two_by_two_ex`, `fig:trends`, `eqn:twfe_2_by_2`, `ass:gt-parallel-trends-never`, etc.), enabling a reader to verify each result against the source manuscript without ambiguity.
- **The "weighting changes the target parameter" thread is consistent.** Every section, every interpretation, and every key finding returns to this central insight. The Execution Summary opens with the distinction; the 2×2 interpretation hammers it home; the Appendix Audit table indexes each manuscript reference to it. The thread does not waver.
- **Beginner-friendly depth without dumbing down.** New jargon is defined inline (`ATT(e)`, `M̄`, `normalized difference`, `propensity score`, `DRDID`, `parallel trends`) but the technical specificity is preserved. This is exactly the right register for a draft that will be lifted into the eventual blog post.
- **Eight key findings, each with specific numbers and a clear "so what."** None are restatements; all translate quantitative results into substantive claims about the weighted vs unweighted estimands.
- **Complete artifact inventory.** All 8 PNGs embedded (verified by counting `![...](r_did2_...png)` patterns); all 14 CSVs either rendered as markdown tables or explicitly cited by filename (`table_attgt_gxt.csv` is the only one not rendered, and the report explains why: 88 rows of raw matrix data is the source for the aggregated tables already shown).
- **Honest about limitations.** The Surprises section is unusually rich for this stage — `biters = 2,000` shortfall, HonestDiD grid saturation, 6 stdout `cat()` lines that can't be silenced, e = −10/−9 negative pre-trends, the manuscript's own pedagogical disclaimer. A downstream post-writer has no excuse to overclaim.

## Priority Action Items

All issues are LOW severity. Recommended order (lowest disruption first):

1. **[LOW]** Apply Issue #1 (drop unverifiable "2025") and Issue #8 (cite where `biters = 25,000` comes from) — single-line wording fixes.
2. **[LOW]** Apply Issue #2 (more precise audit row for the 2015 share discrepancy) and Issue #5 (one-line note above the 2×T raw-output table).
3. **[LOW]** Apply Issue #6 (clarify Figure 4's TWFE-baseline row).
4. **[LOW]** Apply Issues #3 and #4 (split or trim the two oversized interpretation paragraphs in §4.4 and §4.6).
5. **[LOW]** Apply Issue #7 (split §4.6 into 4.6a / 4.6b) — largest structural change; do last so prior fixes don't get rebased.

---

*Review generated by `/project:review-results-report`. Read-only; `results_report.md` was not modified during the review.*
