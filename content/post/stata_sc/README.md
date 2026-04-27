# Synthetic Control Method (SCM) Tutorial

**Topic**: Effect of California's Proposition 99 on cigarette sales
**Dataset**: smoking_sc.dta (39 states x 31 years, 1970-2000)
**Methods**: Synthetic control, in-space placebo, in-time placebo, leave-one-out
**Language**: Stata

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
| `stata_sc_raw_trends.png` | California vs. donor pool average cigarette sales |
| `stata_sc_pred.png` | California vs. Synthetic California predictions |
| `stata_sc_eff.png` | Treatment effects over time |
| `stata_sc_bias.png` | Pre-treatment MSPE |
| `stata_sc_weight_unit.png` | State weights in synthetic control |
| `stata_sc_weight_vars.png` | Predictor variable weights |
| `stata_sc_eff_pboUnit.png` | In-space placebo effects (spaghetti plot) |
| `stata_sc_ratio_pboUnit.png` | MSPE ratio ranking across states |
| `stata_sc_pvalTwo_pboUnit.png` | Two-sided Fisher p-values |
| `stata_sc_pvalRight_pboUnit.png` | Right-tail p-values |
| `stata_sc_pvalLeft_pboUnit.png` | Left-tail p-values |
| `stata_sc_pred_pboTime1985.png` | In-time placebo predictions (fake 1985 treatment) |
| `stata_sc_eff_pboTime1985.png` | In-time placebo effects |
| `stata_sc_loo_combined.png` | Leave-one-out combined robustness graphs |

## Datasets

| File | Rows | Cols | Description |
|------|------|------|-------------|
| `smoking_sc.dta` (remote) | 1,209 | 7 | 39 states x 31 years (1970-2000) |

## Packages Used

synth, synth2

## Reference

Abadie, A., Diamond, A. & Hainmueller, J. (2010). Synthetic control methods for comparative case studies: Estimating the effect of California's tobacco control program. *Journal of the American Statistical Association*, 105(490), 493-505.
