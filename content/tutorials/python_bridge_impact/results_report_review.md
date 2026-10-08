# Results Report Review: `python_bridge_impact`

**Report:** `results_report.md` (626 lines)
**Script:** `analysis.py`
**Reviewed:** 2026-08-05

## Verdict: MINOR REVISION → **all findings applied 2026-08-05**

The report is thorough, well structured, and clears every one of the five new-gates. Two HIGH
accuracy defects were found — a stale pre-fix coefficient in the Reproduction Audit appendix, and
the pre-trend contradiction that had already been corrected in `index.md` — plus three smaller
items. **All five were fixed in `results_report.md` immediately after this review**; the issue
table below is retained as the audit trail.

## Accuracy Check

**161** three-or-more-decimal numbers were extracted from the report's prose and key findings and
traced against `execution_log.txt` and the 21 result CSVs. **160 verify.** The 18 that are not
verbatim in the execution log are all derived quantities, and each was recomputed from the CSVs:

| Quantity | Report | Recomputed | ✓ |
|---|---|---|---|
| weight-scheme correlation | 0.971 | 0.9707 (log line 79) | ✓ |
| median diff-diff / Stata SE ratio | 0.999 | 0.9993 | ✓ |
| SE ratio range | 0.891 – 1.516 | 0.891 – 1.5159 | ✓ |
| covariate means | 12.155 / 12.111, 4.687 / 4.646 / 4.659 | `_covariate_balance.csv` | ✓ |
| HonestDiD M = 1.5, 2.0 upper bounds | +0.134 / +0.146 | 0.13352 / 0.14579 | ✓ |
| degenerate `$trimL` run | 1.064 (0.710), N = 868, G = 124 | 1.0636 (0.7097) | ✓ |

All **12** rows of the Appendix reproduction table were checked against
`python_bridge_impact_audit_reproduction.csv`. **11 verify exactly. One does not** — see issue 1.

## Issues Found

| # | Dimension | Severity | Location | Issue | Suggested fix |
|---|-----------|----------|----------|-------|---------------|
| 1 | 1 Accuracy | **HIGH** | line 613 (Appendix) | Row "T4 nightlights LR middle" shows our value as **0.1551 (0.0399)** against published 0.149 (0.040) and calls it *"exact after fixing tercile timing"*. Those do not match, and the audit CSV gives the real value: **0.148954 (0.040143)**. The cell is the pre-fix number, left behind when the tercile-timing bug was fixed | Replace with `0.1490 (0.0401)`. The note is already correct |
| 2 | 1 Accuracy | **HIGH** | line 336 | *"No trend difference is significant at 5 percent in any panel or under any estimator. The one marginal case is the nightlights trend under unweighted OLS at +0.043 (0.019, p = 0.022)"* — self-contradictory; p = 0.022 **is** significant at 5 percent. Same defect fixed in `index.md` §7.5 during the post review | Mirror the `index.md` §7.5 wording: state the significant unweighted pre-trend plainly, then show it falling to p = 0.16 under both DR estimators |
| 3 | 3 Interpretation | MEDIUM | line 179 | *"the LWDR and KOBDR columns land within 0.003 of each other throughout"* — false on the yield panel, where the gap reaches 0.0094 (`D_lyld` SR) | "…within 0.003 on the nightlights and census panels, and within 0.01 on the thin yield panel" |
| 4 | 5 Key findings | MEDIUM | Key finding 3 | "the industry share dropped 1.2 percentage points … roughly a third of a 2.8 percent baseline" — 1.2 / 2.8 = 43%, not a third. `index.md` applies "a third" to the **1.0** pp pooled mean, where it is correct | Either use the pooled 1.0 pp with "a third", or keep 1.2 pp and say "over 40 percent of the sector" |
| 5 | 1 Accuracy | LOW | lines 30, 405 | "within 0.0006" — the maximum pyfixest-vs-Stata SE gap is 0.000646 | "within 0.0007" |

## New-gates compliance (dimension 7)

| # | Gate | Status | Notes |
|---|------|--------|-------|
| 1 | Inline figure embeds per method subsection | **PASS** | 21 `![...]` embeds, one per figure, and all 21 also appear in the Figure Inventory (23 table rows = header + separator + 21) |
| 2 | Per-section inline tables (≥ 4) | **PASS** | 10 markdown tables |
| 3 | ≥ 8 Key Findings | **PASS** | 12 |
| 4 | Reproduction Audit appendix (source paper present) | **PASS** | Present, 12 rows, each citing a named `results/*.txt` source file — though one row carries a stale value (issue 1) |
| 5 | Surprises walks 7 categories explicitly | **PASS** | All seven are numbered and labelled: estimator non-determinism, sample reductions, weighting/aggregation, effect concentration, cosmetic warnings, identification assumptions, pedagogical framing |

No gate FAILs, so dimension 7 causes no escalation. The verdict is driven by the two HIGH accuracy
issues.

## Dimension scores

| # | Dimension | Score |
|---|-----------|------:|
| 1 | Accuracy | 7 |
| 2 | Completeness | 10 |
| 3 | Interpretation quality | 9 |
| 4 | Figure descriptions | 9 |
| 5 | Key findings | 8 |
| 6 | Structure and format | 10 |
| 7 | New-gates compliance | 10 |

Interpretation count is well past the minimum: **14 method subsections**, each with a numbered raw
output block and a prose interpretation that quotes numbers and translates them into a domain
quantity (percent change in luminosity, percentage points of employment, upazila counts).

Figure inventory was spot-checked by opening the PNGs; `python_bridge_impact_10_event_study_nightlights.png`
renders correctly and its inventory description and takeaway both match the plotted values
(−0.008 pre, then 0.007 → 0.033 → 0.050 → 0.083 → 0.128).

## Positive Highlights

- **The Surprises section is the strongest part of the report.** It walks all seven categories with
  substantive content rather than "not applicable" filler, and category 3 (weighting and
  aggregation) correctly identifies that the pooled density null is an averaging artefact rather
  than a finding.
- **The reproduction appendix cites source files, not just values.** Every row names the specific
  `results/*.txt` the benchmark came from, which is what makes issue 1 findable at all.
- **It documents two published-table defects the post does not repeat**, including the Table AT.2
  standard-error shift for the Primary and High School rows, which does not appear in `index.md`.

## Priority Action Items

1. **[HIGH]** Line 613 — replace `0.1551 (0.0399)` with `0.1490 (0.0401)`.
2. **[HIGH]** Line 336 — mirror the corrected §7.5 pre-trend wording from `index.md`.
3. **[MED]** Line 179 — bound the LWDR/KOBDR proximity claim to the panels where it holds.
4. **[MED]** Key finding 3 — fix "a third" to match whichever coefficient it cites.
5. **[LOW]** Lines 30 and 405 — 0.0006 → 0.0007.
