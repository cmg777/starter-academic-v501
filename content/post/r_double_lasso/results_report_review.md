# Results Report Review: r_double_lasso

**Report:** `results_report.md` (301 lines)
**Script:** `analysis.R` (757 lines)
**Reviewed:** 2026-05-21
**Reviewer scope:** all 7 review dimensions, with figures viewed and paper Table 2 cross-checked line by line

## Verdict: ACCEPT

The report reproduces Fitzgerald et al. (2026) Table 2 faithfully and surfaces a coherent two-layer headline (rigorous vs. CV Double LASSO). Every numeric claim spot-checked traces cleanly to `execution_log.txt` and the CSVs; every paper-Table-2 line citation in the audit appendix matches the actual manuscript markdown; all 5 dimension-7 gates pass. Only 1 MEDIUM and 2 LOW issues — none blocks downstream use as input to `/project:write-post`.

---

## Accuracy Check

**Numbers spot-checked: 10 / 10 verified.**

| # | Claim in report | Report line | Source of truth | Result |
|---|---|---|---|---|
| 1 | First-diff violent −0.1521, SE 0.0337 | 72, 81 | log line 24 + results_table2.csv row 1 | ✓ exact |
| 2 | OLS-full violent +0.0135, SE 0.0911, 281 controls | 102, 111 | log line 36 + results_table2.csv row 2 | ✓ exact |
| 3 | PSL violent −0.1567, SE 0.0342, 3 controls | 130, 139 | log line 46 + results_table2.csv row 3 | ✓ exact |
| 4 | DL-rigorous violent −0.0964, SE 0.0514, \|I_y\|=0, \|I_d\|=8 | 164, 175 | log lines 59–60 + selection_diagnostic.csv row 2 | ✓ exact |
| 5 | DL-CV violent +0.0193, SE 0.0978, 150 controls union | 198, 209 | log lines 73–74 + selection_diagnostic.csv row 3 | ✓ exact |
| 6 | DL-rigorous property −0.0314, SE 0.0227, \|I_y\|=3, \|I_d\|=9 | 166, 176 | log lines 61–62 + selection_diagnostic.csv row 4 | ✓ exact |
| 7 | DL-rigorous murder −0.1662, SE 0.0790, \|I_y\|=0, \|I_d\|=9 | 168, 177 | log lines 63–64 + selection_diagnostic.csv row 6 | ✓ exact |
| 8 | OLS-full murder +2.3426, SE 0.3114 | 104, 113 | log line 38 + results_table2.csv row 13 | ✓ exact |
| 9 | DL-CV union 150 / 109 / 161 across outcomes | 197, 199, 201 | log lines 73, 75, 77 + selection_diagnostic.csv | ✓ exact |
| 10 | n = 576, p = 284 | 16, 53 | log line 14 + log line 34 | ✓ exact |

**Paper-Table-2 line citations: 12 / 12 verified.** Every line citation in the Reproduction Audit appendix points to the correct row of the actual Fitzgerald et al. (2026) markdown:

- Violent: First diff (209), DL (210), PSL (211), OLS (212) — all present and quoted correctly
- Property: First diff (216), DL (217), PSL (218), OLS (219) — all present and quoted correctly
- Murder: First diff (223), DL (224), PSL (225), OLS (226) — all present and quoted correctly

The audit faithfully transcribes the paper's "This paper" columns (right side of Table 2 — `−0.152 / 0.034`, `−0.104 / 0.123`, `−0.155 / 0.033`, `0.014 / 0.875`, etc.) and is honest about the three DL-CV rows that have no paper-side counterpart (the paper's Table 2 has no CV column).

---

## Issues Found

| # | Dimension | Severity | Location | Issue | Suggested fix |
|---|---|---|---|---|---|
| 1 | 4 (figure descriptions) | **MEDIUM** | §4.4 line 149 | `r_double_lasso_paths.png` is embedded at the head of §4.4 (DL rigorous) but the figure actually visualises the **CV-LASSO** of the d-equation (its subtitle says "143 of 284 controls survive at lambda.min" — 143 is the violent-crime CV `\|I_d\|`, not the rigorous-LASSO `\|I_d\|`=8). A reader landing in §4.4 will likely assume the figure shows what rigorous LASSO does. The caption is honest about "CV-chosen lambda.min" but the placement is misleading. | Either (a) move the embed to §4.5 (DL-CV) where it illustrates the over-selection behavior being discussed, or (b) keep it in §4.4 but expand the inline caption to "Why the CV penalty isn't safe here — the d-equation paths show 143 of 284 controls surviving at the CV-chosen lambda.min, vs. 8 for the rigorous penalty applied above." |
| 2 | 1 (accuracy) | LOW | §Data Overview line 53 | "48 states × **13** years (1985–1997), giving 576 observations **after first-differencing**" is mildly inconsistent: 576 / 48 = 12 differenced years (1986–1997), not 13. The execution summary at line 16 correctly says "12 years (1986–1997, after first-differencing)". | Replace line 53 with "48 states × 12 years (1986–1997) after first-differencing the raw 13-year (1985–1997) panel" to make the raw-vs-differenced distinction explicit. |
| 3 | 1 (accuracy) | LOW | Appendix line 297 | The "Murder DL (rigorous)" row says "consistent with the paper's note (line 224) that DL on murder has very few selected controls and the post-OLS is unstable" — but line 224 is the Table 2 DL-Murder data row, not an explanatory note. The qualitative claim about instability lives in the paper's surrounding prose, not at line 224. | Either drop the parenthetical or repoint the citation to the manuscript section that actually discusses this (e.g., the paper's §4 discussion of `n_y` patterns near line 240, or just "consistent with the paper's discussion in §4"). |

**Triage:** 0 HIGH × 1 MEDIUM × 2 LOW. Severity thresholds (per `scoring-and-criteria.md`): ACCEPT requires 0 HIGH and ≤ 2 MEDIUM. This report clears that bar.

---

## New-gates compliance (dimension 7)

| # | Gate | Status | Notes |
|---|---|---|---|
| 1 | Inline figure embeds per method subsection (and every PNG also in inventory) | **PASS** | 4 PNGs total; all 4 are both embedded inline (§4.4 paths, §4.5 methods_compare, §4.6 estimates + selection) AND in the 4-row Figure Inventory table. Sections 4.1–4.3 have no embed because the script generates no per-step figure for them — the gate is conditional on a figure existing for the section, so this is a clean PASS. (See Issue #1 above for a separate placement-quality concern.) |
| 2 | Per-section inline tables sourced from CSVs (≥ 4 across report) | **PASS** | 6 per-section CSV-sourced markdown tables: §4.1 first-diff, §4.2 OLS-full, §4.3 PSL, §4.4 DL-rigorous (joined with selection_diagnostic), §4.5 DL-CV (joined with selection_diagnostic), §Data Overview data-assets table. Comfortably above the ≥ 4 threshold. |
| 3 | ≥ 8 Key Findings | **PASS** | 9 numbered findings (lines 240–256), each with a bold title and at least one specific number. Headline replication, `\|I_y\|`=0 fingerprint, baseline-already-gives-the-answer, kitchen-sink cautionary tale, PSL-vs-DL principle, rigorous-vs-CV sign flip, clustered-SE necessity, p/n regime argument, post-OLS load-bearing. Diverse and accurate. |
| 4 | Reproduction Audit appendix (source paper present) | **PASS** | The post folder contains `references/Fitzgerald Sice 2026 ... .md` — gate applies. The appendix has 15 rows (5 estimators × 3 outcomes), each citing a specific manuscript line for the 12 reproducible ones and explicitly "(not in paper Table 2)" for the 3 DL-CV rows. Verdict paragraph (line 300–301) honestly accounts for the SE divergence on rank-deficient OLS-full / DL-rigorous cases. 12 / 12 line citations verified correct. |
| 5 | Surprises walks 7 categories explicitly | **PASS** | All 7 categories (estimator non-determinism, sample reductions, weighting / aggregation, effect concentration, cosmetic warnings, identification assumptions, pedagogical framing) receive substantive bullets at lines 262–275 — none merely listed, none implicit. The "cosmetic warnings: none" bullet is justified by the script's clean exit (no `Warning:` lines in the log). |

**0 sub-bullets FAIL. 0 PARTIAL.** No verdict escalation triggered by dimension 7.

---

## Positive Highlights

- **Replication framing is calibrated.** The two-layer headline at line 18 ("rigorous reproduces the paper, CV does something different") gives the writer the right narrative spine for the eventual blog post — the contrast IS the story.
- **Selection-count fidelity.** The fact that `\|I_y\|`=0/3/0 and `\|I_d\|`=8/9/9 match the paper *exactly* (across 6 separate LASSO calls) is the most convincing reproduction signal in the report, and it gets foregrounded properly in Key Finding 1.
- **Honest about divergences.** The audit appendix flags the PSL property crime gap (~0.05, attributed to unseeded fold randomization), the murder DL gap (0.04, attributed to the small selected support), and the OLS-full SE divergence (attributed to `matlib::inv` rescaling on near-singular `X'X`) without hand-waving any of them.
- **Coefficient unpacking is good.** Lines 85 and 179 give explicit "a 1-unit increase in the differenced abortion rate is associated with a X-unit decrease in differenced violent-crime rate" glosses — meeting interpretation criterion 7 (domain anchor) for the headline estimands.
- **Surprises category 6 (identification) is the strongest bullet** — explicitly names CIA, parallel trends, and even the paper's two named failure modes (bias amplification, collider bias) with a manuscript section citation.
- **Pedagogical framing bullet (category 7) is well-judged.** The note at line 274 that "Fitzgerald et al. (2026) is itself a replication paper, not a primary causal claim about abortion and crime" inherits the right epistemic stance and will keep the blog post from overclaiming.
- **Cross-method paragraph (line 223) earns its place.** The forest-plot reading is the single best summary in the report — LASSO methods sit between the baseline and the kitchen sink, and the murder column's chaos is named without softening.
- **Inventory descriptions are specific, not generic.** Each row has both a structural description (axes, panels, what's plotted) AND a numerical takeaway — clearing dimension-4 with room to spare.

---

## Priority Action Items

1. **[MED]** Resolve the §4.4 figure placement (Issue #1). Either move `r_double_lasso_paths.png` to §4.5 where it illustrates the CV over-selection that section is about, or expand the §4.4 caption to make explicit that the figure is showing what the *next* section's CV penalty does. The current placement risks confusing a reader who lands in §4.4 expecting to see the rigorous-LASSO's 8-control selection.
2. **[LOW]** Fix the 13-vs-12 year inconsistency in §Data Overview line 53 (Issue #2).
3. **[LOW]** Tighten the manuscript citation in audit row 297 (Issue #3) — either drop the parenthetical or repoint it from line 224 (Table 2 row) to the paper's §4 discussion paragraph.

None of these blocks `/project:write-post`. The report is in good shape to be the source-of-truth for the blog post draft.

---

## Recommendations for downstream stages

When the blog post is drafted from this report, the writer should:

- Lead with the **selection-count exact match** (Key Finding 1) — it is the strongest replication signal and the most teachable result for the post's empirical-econ-grad-new-to-ML audience.
- Use the §4.4 → §4.5 transition (rigorous → CV) as the post's pedagogical hinge: "same recipe, one knob, very different answer."
- Keep the audit appendix's honest accounting of the murder DL gap and the OLS SE divergence — readers will trust the post more for not hiding them.
- Inherit the pedagogical framing from Surprises category 7 explicitly in the post's introduction and conclusion.

---

## Files reviewed

- `content/post/r_double_lasso/results_report.md` (target of review, 301 lines)
- `content/post/r_double_lasso/execution_log.txt` (149 lines, ground truth for numbers)
- `content/post/r_double_lasso/results_table2.csv` (16 rows incl. header)
- `content/post/r_double_lasso/selection_diagnostic.csv` (7 rows incl. header)
- `content/post/r_double_lasso/references/Fitzgerald Sice 2026 Double LASSO  Replication and Practical Insights.md` (paper Table 2 + surrounding text)
- 4 PNGs: `r_double_lasso_estimates.png`, `r_double_lasso_methods_compare.png`, `r_double_lasso_paths.png`, `r_double_lasso_selection.png` — all rendered cleanly, all match their inventory descriptions

No edits made to any file other than this review. `results_report.md`, `analysis.R`, and all CSVs / PNGs are untouched.
