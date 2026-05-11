# Results Report Review: python_mgwrfer

**Report:** `results_report.md` (paper-faithful version)
**Script:** `script.py`
**Reviewed:** 2026-05-11
**Status:** Cross-checked against `execution_log.txt`

## Verdict: MINOR REVISION

The report's structure and interpretation are sound; the global Table 2 / local Table 3 / Stage 2 sections all align with the script. Two HIGH accuracy issues are present: the **alpha_hat recovery RMSE and Pearson r** quoted in the Stage 2 block and in the comparison table are from an earlier (pre-fix) rerun and disagree with the values in `execution_log.txt` by ~6%. Fixing these is a straight number swap.

## Accuracy Check

Each headline number in `results_report.md` checked against the freshest `execution_log.txt`:

| Quantity | results_report.md | execution_log.txt | Match? |
|---|---|---|---|
| `Cor(x_k, sc)` | 0.84 | 0.840 / 0.832 | YES |
| OLS_cs `β_1` | 5.476 | 5.476 | YES |
| OLS_pool `β_1` | 6.144 | 6.144 | YES |
| FE `β_1` | 1.565 | 1.565 | YES |
| FE `β_4` (n.s.) | 0.017 (p=0.66) | 0.017 (p=0.664) | YES |
| FE mean(α̂) | 23.234 | 23.234 | YES |
| MGWR_cs bws | [48, 48, 91, 98, 52] | [48. 48. 91. 98. 52.] | YES |
| PMGWR bws | [44, 46, 50, 50, 46] | [44. 46. 50. 50. 46.] | YES |
| MGWFER bws | [50, 91, 116, 62] | [ 50.  91. 116.  62.] | YES |
| PMGWR β_1 RMSE | 2.3003 | 2.3003 | YES |
| MGWFER β_1 RMSE | 0.1793 | 0.1793 | YES |
| MGWFER β_1 Corr | 0.8179 | 0.8179 | YES |
| MGWR_cs RMSE α | 14.1818 | 14.1820 | minor rounding |
| PMGWR RMSE α | 25.6168 | 25.6184 | minor rounding |
| **MGWFER alpha_hat RMSE** | **0.5721** | **0.5398** | **MISMATCH (~6% off)** |
| **MGWFER alpha_hat Corr** | **1.0000** | **0.9996** | **MISMATCH** |
| MGWFER α̂ range | [1.445, 51.622] | [1.445, 51.622] | YES |
| Stage 2 significant | 225/225 (100%) | 225/225 (100%) | YES |

## Issues Found

| # | Dimension | Severity | Location | Issue | Suggested fix |
|---|-----------|----------|----------|-------|---------------|
| 1 | Accuracy | HIGH | Stage 2 block, lines ~157-159 | `alpha_hat recovery: RMSE=0.5721, Corr=1.0000` does not match `execution_log.txt`, which reports `RMSE=0.5398, Corr=0.9996`. Numbers carried over from an earlier crashed run. | Replace `0.5721 → 0.5398`, `1.0000 → 0.9996`. |
| 2 | Accuracy | HIGH | Model Comparison table, line ~182 | Row `RMSE_alpha 14.1818 25.6168 0.5721` should be `14.1820 25.6184 0.5398`. | Replace `0.5721 → 0.5398` (and tighten the four-decimal floats on the other two for consistency). |
| 3 | Accuracy | MEDIUM | Stage 2 interpretation (line ~161) | Prose says "Pearson correlation 1.000" — strictly speaking the script reports 0.9996, which rounds to 1.000 only at 3 sig figs. Saying "≈1.000" or "0.9996" is more truthful. | Soften to "Pearson r ≈ 1.000 (0.9996)". |
| 4 | Interpretation | LOW | Stage 2 interpretation | Sentence says "essentially identical to the truth [2.07, 51.55]" — the actual estimated range is [1.445, 51.622], showing a 0.6-unit undershoot at the low end. A more precise wording: "near-identical, with a 0.6-unit undershoot at the low end." | Tighten phrasing. |
| 5 | Structure | LOW | Surprises section, last item | Note on "Correlation undefined for β_3 and β_4" is correct; could add that this is exactly why the comparison table shows `nan` for those Corr cells. | Add one sentence. |

## Positive Highlights

- **Every global-model number matches the script output exactly** (β_1=5.48, 6.14, 1.57; β_4=4.82, 4.16, 0.02; FE mean(α̂)=23.23).
- **The interpretation of each section is correct and connected**: the report explains why OLS over-estimates by ~4×, why FE corrects, why MGWR_cs and PMGWR both produce anti-correlated `β_1` surfaces, and why MGWFER recovers cleanly.
- **The Figure Inventory table is complete** with all 8 figures and the right key takeaways.
- **Paper alignment is explicit**: the report cites paper Eqs. 39-45 for the DGP, Eq. 30 for Stage 2, and Eqs. 32-37 for the variance machinery. Cross-references to paper Tables 2/3 and Figures 5/9 are accurate.
- **The "Surprises and Caveats" section is candid** about the partial-vs-full back-transform issue, the un-comparability of R²/AICc across estimators, and the grid-size compromise.
- **Sandwich pattern is well-executed**: each method section has explanation → code → output → interpretation in order.

## Priority Action Items

1. **[HIGH] Fix MGWFER alpha_hat numbers**: `0.5721 → 0.5398`, `1.0000 → 0.9996`. Two locations.
2. **[MED] Soften the "Pearson correlation 1.000" phrasing** to "≈1.000 (0.9996)".
3. **[LOW] Refine the "near-identical range" sentence** to acknowledge the 0.6-unit undershoot.
