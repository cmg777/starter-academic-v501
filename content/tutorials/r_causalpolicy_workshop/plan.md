# plan.md — r_causalpolicy_workshop

Approved scope for Stage 1 (`write-script`).

## Topic and dataset

Replication of the causalpolicy.nl one-day workshop. Six estimators applied
to the same dataset so readers can compare them head-to-head.

- **Dataset:** California's Proposition 99 cigarette-tax panel
  (`proposition99.rds`, fetched from <https://causalpolicy.nl/data/proposition99.rds>)
- **Treated unit:** California
- **Intervention:** January 1989 (last full pre-period year = 1988)
- **Outcome:** per-capita cigarette sales

## Language, theme, environment

- **Language:** R 4.4.3 (matches source workshop)
- **Figure theme:** dark navy `#0f1729`, white text `#e8ecf2`, accents
  `#6a9bcc` / `#d97757` / `#00d4c8`
- **Packages:** `tidyverse`, `sandwich`, `lmtest`, `tidysynth`, `fpp3`,
  `mice`, `CausalImpact`, `broom`, `glue` (auto-installed via `pacman::p_load`)
- **Random seed:** 42 (set globally; reset before each CausalImpact call)

## Script structure

1. Packages / seed / palette / `theme_site()` helper
2. Data download + cache + CSV mirror
3. Data prep (California-only series, tsibble, mice imputation)
4. EDA — Figure 1 (raw series, all states)
5. Method 1: Naive pre-post (lm on 1984–1993 CA, HAC SEs)
6. Method 2: DiD (CA × Nevada × prepost, HAC SEs, 1984–1993)
   — Figure 2 (parallel-trends visual)
7. Method 3a: ITS via pre-period growth-curve extrapolation
8. Method 3b: ITS via AICc-selected ARIMA forecast
   — Figure 3 (observed vs ARIMA counterfactual)
9. Method 4: RDD on time (`cigsale ~ year0 + prepost + year0:prepost`)
   — Figure 4 (piecewise fit)
10. Method 5: Synthetic Control via `tidysynth` (predictors as in workshop)
    — Figure 5 (trends), Figure 6 (top weights), Figure 7 (placebos)
11. Method 6: CausalImpact (cigarette-only + full-covariate models)
    — Figure 8 (pointwise + cumulative)
12. Cross-method comparison table + Figure 9 (forest plot)
13. README.md generation

## Deliverables

- `analysis.R`, `execution_log.txt`
- `proposition99.rds` (cached) + `proposition99.csv` (mirror)
- 9 PNG figures, 10 CSV tables
- `README.md` (artifact inventory)
- `plan.md` (this file)

## Estimands

| Method | Estimand |
|---|---|
| Naive pre-post | Descriptive Post-Pre difference (NOT a causal estimand) |
| DiD | ATT on California vs Nevada, window 1984–1993 |
| ITS (growth + ARIMA) | Mean post-period deviation from extrapolated pre-trend |
| RDD on time | Level jump in California's series at the 1989 threshold |
| Synthetic Control | ATT on California vs synthetic California, 1989–2000 |
| CausalImpact | Posterior mean ATT with 95% credible interval, 1989–2000 |

## Known framing notes

- The workshop labels segmented regression on time as "RDD". This is RDD with
  time as the running variable, distinct from classical sharp RDD on a
  continuous assignment variable. The post will call this out explicitly.
- CausalImpact relies on `mice` random-forest imputation for missing
  covariates. The imputation seed is fixed at 42 for reproducibility.
- ITS-ARIMA is expected to diverge from the other estimators because AICc
  picks a strongly trending model that extrapolates the late-1980s decline.
  This sensitivity is a feature for the discussion, not a bug.
