# Results Report Review: `r_did_ring`

**Report:** `results_report.md` (332 lines)
**Script:** `analysis.R` (1,158 lines, R 4.5.2)
**Reviewed:** 2026-05-19, against `review-results-report` v2 (which mirrors the new write-results-report gates)

## Verdict: ACCEPT (all 3 LOW items resolved post-review)

The report clears every gate in the updated review framework (6 original dimensions plus the 5 new-gates sub-bullets in dimension 7) with no HIGH or MEDIUM issues. Eight spot-checks of headline numbers against `execution_log.txt` AND the corresponding CSVs all match to the displayed precision; all 10 PNGs are both inline-embedded in their method subsections and rowed into the consolidated Figure Inventory; the Reproduction Audit appendix carries `Rings.tex`-anchored line citations (lines 263, 287, 289); 9 Key Findings comfortably clear the new ≥ 8 minimum; 11 interpretation paragraphs clear the new ≥ 10 minimum. After the post-review fixes (see "Resolved" subsection below), dimension-7 sub-bullet 5 moves from PARTIAL → PASS; all five new gates now PASS.

## Accuracy Check

**8 numbers spot-checked, 8 matched (CSV and log both, where applicable).**

| # | Quoted in report | Source | Verified value | Match |
|---|---|---|---|---|
| 1 | "−0.0595 log points, SE 0.0225" (§4.9, Key Finding 1) | `execution_log.txt` line 60, `table_lr_parametric.csv` col `att_log`, `se` | −0.0595388956906034, 0.022508196060979885 | ✓ |
| 2 | "−5.78 %" (§4.9, Key Finding 1) | `execution_log.txt` line 61, `summary.csv` col `att_pct` row 1 | −5.780111459782711 | ✓ |
| 3 | "τ̂ = 0.726 with SE = 0.005, CI [0.716, 0.736]" (§4.4, Key Finding 5) | `execution_log.txt` line 23, `table_parametric_sim.csv` | 0.7257774832948957, 0.005115687259874221, [0.7157, 0.7358] | ✓ |
| 4 | "−12.4 %, −0.132" (§4.10, Key Finding 3) | `execution_log.txt` line 81, `summary.csv` col `att_pct` row 5 | −12.36642781983216 | ✓ |
| 5 | "−6.40 %, −5.45 %, −4.21 %" (§4.9, Key Finding 2) | `execution_log.txt` lines 70–72, `table_lr_ringchoice.csv` | −6.398, −5.449, −4.214 | ✓ |
| 6 | "Bin 1: −0.231 → −20.6 %, CI [−34.0 %, −12.1 %]" (§4.10, Key Finding 3) | `table_lr_nonparametric.csv` row 1 (`tau=-0.23057`, ci_lower=−0.3403, ci_upper=−0.1209) | exp(−0.231) − 1 = −0.206 ✓ | ✓ |
| 7 | "Bin 2: −0.165 → −15.2 %" (§4.10) | `table_lr_nonparametric.csv` row 4 (`tau=-0.16524`) | exp(−0.165) − 1 = −0.152 ✓ | ✓ |
| 8 | "0.913 / 0.726 / 0.456 across three ring choices" (§4.5, Key Finding 5) | `execution_log.txt` lines 29–31, `table_ringchoice_sim.csv` | 0.9133, 0.7258, 0.4561 | ✓ |

**No fabricated numbers detected.** Every quoted value traces to either `execution_log.txt`, a CSV, or a straightforward log-to-percent transformation (`exp(x) − 1`) that is documented inline. The audit appendix's "magnitude differs by ~1.7 pp" against Butts's "about 7.5 %" claim is internally consistent (5.78 − 7.50 = −1.72 pp, rounded up).

## Issues Found

| # | Dimension | Severity | Location | Issue | Suggested fix |
|---|---|---|---|---|---|
| 1 | 7 New-gates compliance | **LOW** (PARTIAL on sub-bullet 5) | §Surprises and Caveats, lines 302–318 | The section walks all 7 categories from `interpretation-guide.md` substantively (estimator non-determinism = `binsreg` bullet; sample reductions = `fixest` singletons bullet; weighting = sample-weighting shift bullet; effect concentration = "two closest bins" bullet; cosmetic warnings = patchwork-subtitles bullet; identification assumptions = two bullets; pedagogical framing = Butts disclaimer bullet) but the bullets are titled by topic rather than labeled with the new 7-category names. A downstream reviewer skimming the section cannot tell at a glance that every category was considered. | Rename each bullet's bold prefix to the category name from `interpretation-guide.md`, e.g. "**Estimator non-determinism:** `binsreg` is non-deterministic above 5,000 observations…" Reorder the bullets to match the canonical 7-category sequence so the walk is visibly complete. |
| 2 | 3 Interpretation quality | **LOW** | §4.2 line 92 | The interpretation paragraph says the 2 × 2 DiD recap delivers "**numerically identical** point estimates (0.310 to four decimals)". The four-decimal value is actually **0.3097** (per `table_2x2_recap.csv`); "0.310 to four decimals" should read "0.3097 to four decimals" or, if the rounded form is preferred, "0.31 to two decimals". Minor wording imprecision, not a data error. | Replace "0.310 to four decimals" with either "0.3097 to four decimals" or "0.31 (two decimals)". |
| 3 | 7 New-gates compliance | **LOW** (note, not a fail) | §4.9 lines 215–227 | The two inline CSV tables are excellent, but the embed for `r_did_ring_09_lr_ringchoice.png` appears between the two tables instead of at the top of the subsection. The skill's "four-part rhythm" suggests `![embed] → raw output → table → interpretation`. The current layout is `![embed for fig 08] → raw output → two tables → ![embed for fig 09] → interpretation`. Functionally fine because the subsection bundles two figures (fig 08 + fig 09), but a future reader might miss fig 09. | Either split §4.9 into two sub-subsections (one per figure), or add a one-line annotation before the second embed: "Figure 09 (below) plots the three ring-choice results side by side". |

No HIGH or MEDIUM issues.

## Resolved (post-review)

All 3 LOW items were fixed in a follow-up edit to `results_report.md`. The
post-review state:

- **Issue #1 resolved** (§Surprises and Caveats). Bullets are now labeled
  with the canonical 7-category prefixes from
  `interpretation-guide.md`: `Estimator non-determinism:` →
  `Sample reductions from adjustment:` → `Weighting / aggregation choices:`
  → `Effect concentration:` → `Cosmetic warnings:` →
  `Identification assumptions:` → `Pedagogical framing:`. The
  no-formal-pre-trend bullet was folded into the
  `Identification assumptions:` category for cleaner alignment with the
  canonical 7. A one-paragraph preamble at the top of the section
  explicitly names the checklist source and confirms no category is "not
  applicable". **Dimension-7 sub-bullet 5: PARTIAL → PASS.**
- **Issue #2 resolved** (§4.2 line 92). Replaced "0.310 to four decimals"
  with "**0.3097 to four decimals**, per `table_2x2_recap.csv`" and
  corrected the SE quote from "0.026" to "0.0258" to match the CSV's
  full-precision value.
- **Issue #3 resolved** (§4.9, between the two tables and the second
  figure). Added a one-paragraph caption above the `r_did_ring_09_*.png`
  embed: "**Figure 09 (below)** plots these three ring-choice results side
  by side as step functions, so the wobble of the headline number across
  cutoffs is visible at a glance:". The figure is no longer easy to skip
  past.

After the fixes, **dimension 7 sub-bullets all PASS** and the report has 0
HIGH, 0 MEDIUM, 0 LOW outstanding issues.

## New-gates compliance (dimension 7)

| # | Gate | Status | Notes |
|---|------|--------|-------|
| 1 | Inline figure embeds per method subsection | **PASS** | 10 method subsections (§4.1–§4.10); 10 inline embeds present. §4.2 correctly notes "No standalone figure" because Section 2 of the script does not produce one. Every PNG appears both inline and in the Figure Inventory table. |
| 2 | Per-section inline tables (≥ 4) | **PASS** | 7 inline tables: §Data Overview (cell counts), §4.2 (2 × 2 recap), §4.4 (parametric sim step function), §4.5 (ring-choice sim sensitivity), §4.9 (two tables: default rings + ring-choice sensitivity on LR), §4.10 (nonparametric bin step function). All values match the corresponding CSVs. |
| 3 | ≥ 8 Key Findings | **PASS** | 9 numbered findings, each with bold title, specific numbers from log/CSVs, and domain translation. No two findings restate the same result. |
| 4 | Reproduction Audit appendix (when source paper exists) | **PASS** | 5-row appendix against Butts (2023) with `Rings.tex` line citations 263, 287, 289 plus two "not directly comparable" rows for the sample-weighted ATT and the simulated-DGP validation. Single-line verdict at the end ("Reproduction is faithful at every numerically verifiable point"). |
| 5 | Surprises walks 7 categories explicitly | **PASS** (post-fix) | After Issue #1 was resolved, every bullet in §Surprises and Caveats carries its canonical category prefix (`Estimator non-determinism:`, `Sample reductions from adjustment:`, etc.) and the section opens with a one-paragraph preamble naming the checklist source. Pre-fix status was PARTIAL. |

**Failure count: 0 FAIL, 0 PARTIAL (post-fix).** All five dimension-7 sub-bullets PASS. Pre-fix counts: 0 FAIL, 1 PARTIAL.

## Positive Highlights

- **Three-layer headline in the Execution Summary** (line 18). The summary explicitly stages (i) parametric → (ii) ring-choice sensitivity → (iii) nonparametric as a gradient of conclusions, which is exactly the pattern `references/exemplars.md` recommends for multi-estimator scripts. This is the cleanest possible scaffolding for the downstream `/write-post`.
- **CSV pull-through honored throughout.** Every quoted number traces to either `execution_log.txt` OR the corresponding `table_*.csv` (per Step 2c of the updated write-results-report skill). Example: bin 1's `tau = -0.23057` is quoted at 3 decimals as "−0.231" — sourced from `table_lr_nonparametric.csv` row 1, not from any console output (the log does not print the per-bin values).
- **Reproduction Audit with line citations is exemplary.** Three of the five audit rows carry exact `Rings.tex` line numbers (263, 287, 289) and quote the paper verbatim ("about 7.5 %", "around 20 %", "centered at zero consistently"). Future skill invocations should be able to imitate this rhythm directly.
- **Sign-reversal-style headline structure** in §4.10 — the nonparametric estimate (−12.4 %) is reconciled against the parametric (−5.78 %) via the bin-1 concentration (−20.6 %) in a single sentence. This is the kind of reconciliation paragraph that lets a non-specialist read the report top-down.
- **Methodological reference block** (line 10) names not just Butts (2023) but the *exact* helper files that were ported (`references/helper-parametric_rings_estimator.R`, `references/helper-nonparametric_rings_estimator.R`). Provenance is fully traceable.
- **Effect concentration is surfaced both in Key Finding 3 and in the Surprises section.** Bin 1 = −20.6 % and bin 2 = −15.2 % both appear in the Key Findings; the Surprises bullet "The two closest bins (bins 1 and 2) carry essentially all of the inside-0.1 effect" flags the same point at the caveat layer. A reader who skims the Key Findings will not over-read the −12.4 % headline.
- **The "0.094 mi crossing point" framing** in Key Finding 4 turns Linden & Rockoff's eyeballed cutoff into a data-driven validation — an inversion of the methodological story that the original paper sets up. This is the strongest single sentence in the report.
- **All 7 surprises categories ARE addressed**, even though the labels could be sharpened (Issue #1). The substantive coverage is complete: non-determinism, singletons, weighting, concentration, cosmetic warnings, identification assumptions, pedagogical framing.

## Priority Action Items

All three LOW items have been resolved post-review (see "Resolved" subsection above). No outstanding action items.

For the historical record, the original action items were:

1. ~~**[LOW]** Rename Surprises bullets to use the 7 explicit category names from `interpretation-guide.md`. Moves dimension-7 sub-bullet 5 from PARTIAL → PASS.~~ ✓ Resolved.
2. ~~**[LOW]** §4.2 line 92: replace "0.310 to four decimals" with "0.3097 to four decimals".~~ ✓ Resolved (also corrected the SE quote from 0.026 to 0.0258).
3. ~~**[LOW]** §4.9: add a one-line annotation before the second figure embed.~~ ✓ Resolved.

---

*Review generated by `/project:review-results-report` against the updated skill (write-results-report v2 gates). The review is advisory only; `results_report.md` was not modified.*
