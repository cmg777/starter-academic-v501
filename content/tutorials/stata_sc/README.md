# Synthetic Control Method (SCM) Tutorial

- **Topic:** the effect of Proposition 99 on cigarette sales in California
- **Dataset:** smoking_sc.dta (39 states × 31 years, 1970–2000)
- **Methods:** synthetic control, in-space placebo, in-time placebo, and leave-one-out
- **Language:** Stata

## Pipeline Progress

- [x] Script (`analysis.do`)
- [ ] Script review (`script-review.md`)
- [x] Results report (`results_report.md`)
- [ ] Results report review (`results_report_review.md`)
- [x] Blog post (`index.md`)
- [x] Infographic (`infographic_instructions.md`)

## Figures

| File | Description |
|------|-------------|
| `stata_sc_raw_trends.png` | Cigarette sales in California and the donor pool average |
| `stata_sc_pred.png` | Actual and synthetic cigarette sales in California |
| `stata_sc_eff.png` | Treatment effects over time |
| `stata_sc_bias.png` | Covariate balance (percent differences from California) |
| `stata_sc_weight_unit.png` | State weights in the synthetic control |
| `stata_sc_weight_vars.png` | Predictor weights (V matrix) |
| `stata_sc_eff_pboUnit.png` | In-space placebo gaps for California and the 19 retained placebo states (spaghetti plot) |
| `stata_sc_ratio_pboUnit.png` | Ranking of all 39 states by the ratio of post-treatment to pre-treatment MSPE |
| `stata_sc_pvalTwo_pboUnit.png` | Two-sided Fisher exact p-values |
| `stata_sc_pvalRight_pboUnit.png` | Right-sided p-values (test for a positive effect) |
| `stata_sc_pvalLeft_pboUnit.png` | Left-sided p-values (test for a negative effect) |
| `stata_sc_pred_pboTime1985.png` | In-time placebo: actual and synthetic sales with a fake 1985 treatment |
| `stata_sc_eff_pboTime1985.png` | In-time placebo: gaps with a fake 1985 treatment |
| `stata_sc_loo_combined.png` | Leave-one-out robustness: combined seven-panel graph |

## Figure Provenance

The do-file was corrected and rerun on 2026-10-05, and every estimate stayed the same. The deployed PNG figures were not regenerated, however, and they still come from the original run of 2026-04-27. Their notes can therefore differ from those that the corrected do-file writes; for example, the note on `stata_sc_loo_combined.png` still reads "Each panel excludes one donor state", which is inaccurate.

## Datasets

| File | Rows | Cols | Description |
|------|------|------|-------------|
| `smoking_sc.dta` (remote) | 1,209 | 7 | 39 states × 31 years (1970–2000) |

## Packages Used

- synth
- synth2

## References

- Abadie, A., Diamond, A., & Hainmueller, J. (2010). Synthetic control methods for comparative case studies: Estimating the effect of California's tobacco control program. *Journal of the American Statistical Association*, 105(490), 493–505. https://doi.org/10.1198/jasa.2009.ap08746
- Yan, G., & Chen, Q. (2023). synth2: Synthetic control method with placebo tests, robustness test, and visualization. *The Stata Journal*, 23(3), 597–624. https://doi.org/10.1177/1536867X231195278
