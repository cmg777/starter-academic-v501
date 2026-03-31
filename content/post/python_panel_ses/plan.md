# Plan: Standard Errors in Panel Data Tutorial

## Approved scope (2026-03-31)

**Topic:** Standard errors in panel data OLS regressions
**Language:** Python (linearmodels, statsmodels, pandas, matplotlib)
**Dataset:** Simulated DGP (100 firms x 10 years, known true beta = 0.5)
**Figure theme:** Dark navy background
**Post type:** Statistical method tutorial

## Case study question

When firms are observed over multiple years, how does our choice of standard error estimator change what we conclude about the effect of R&D spending on firm performance?

## SE methods covered

1. Conventional (homoskedastic) SEs
2. White (heteroskedasticity-robust) SEs
3. Entity-clustered SEs
4. Time-clustered SEs
5. Two-way clustered SEs
6. Driscoll-Kraay SEs

(Fama-MacBeth was removed — too finance-specific for a general econometrics tutorial.)

## Key lessons

1. No SE estimator can fix a biased estimator (pooled OLS = 1.03 vs true 0.5)
2. Entity FE removes bias (estimate = 0.48, close to 0.5)
3. Monte Carlo: entity-clustered SEs on FE models reject at ~6.6% (close to 5%)
4. Time-clustered SEs with few clusters over-reject (~9%)

## Deliverables

- index.md (blog post)
- script.py (companion script)
- 5 PNG figures (dark theme)

## References

- Petersen (2009), Gregoire (2024), Cameron et al. (2011),
  Driscoll & Kraay (1998), Newey & West (1987), White (1980),
  linearmodels documentation
