# Difference-in-Differences (DiD) Tutorial

**Topic**: Effect of an after-school tutoring program on academic performance
**Dataset**: Simulated panel data (Corral & Yang, 2024)
**Methods**: 2x2 DiD, TWFE regression, event study
**Language**: Stata

## Pipeline Progress

- [x] Script (`analysis.do`)
- [x] Script review (`script-review.md`) — Verdict: **ACCEPT** (78/80)
- [x] Results report (`results_report.md`)
- [x] Results report review (`results_report_review.md`) — Verdict: **ACCEPT** (60/60)
- [x] Blog post (`index.md`)
- [ ] Infographic (`infographic_instructions.md`)

## Figures

| File | Description |
|------|-------------|
| `stata_did_panelview_2x2.png` | Treatment timing visualization (2x2 data, 35 schools x 2 periods) |
| `stata_did_its.png` | Figure 1: Interrupted Time Series — treated group only, showing naive pre/post change |
| `stata_did_counterfactual.png` | Figure 2: DiD design with treated, comparison, and counterfactual (dashed) trends |
| `stata_did_diff_plot.png` | DiD plot from `diff_plot` — shows both groups with parallel trend and labeled values |
| `stata_did_panelview_event.png` | Treatment timing visualization (event study data, 35 schools x 8 periods) |
| `stata_did_event_study.png` | Figure 3: Event study — dynamic treatment effects with 95% CIs |

## Tables

| File | Description |
|------|-------------|
| `table2.doc` | Table 2: DiD regression coefficients — 3 specifications (baseline, +covariate, +clustered SEs) |
| `table4.doc` | Table 4: Event study coefficients — leads (pre-treatment) and lags (post-treatment) |

## Datasets

| File | Rows | Cols | Description |
|------|------|------|-------------|
| `tutoring_did.dta` (remote) | 70 | 7 | 35 schools x 2 periods — main 2x2 DiD dataset |
| `tutoring_didevent.dta` (remote) | 280 | 8 | 35 schools x 8 periods — event study dataset |

## Key Results

- **DiD estimate**: ~25.32 GPA points (ATT)
- **Regression**: 25.31*** (baseline), 25.33*** (+covariate), 25.31*** (+clustered SEs)
- **Event study**: Pre-treatment coefficients near zero; post-treatment ~25 points consistently

## Packages Used

diff_plot, diff, ftools, reghdfe, panelview, eventdd, matsort, outreg2

## Reference

Corral, D. & Yang, M. (2024). An introduction to the difference-in-differences design in education policy research. *Asia Pacific Education Review*.
