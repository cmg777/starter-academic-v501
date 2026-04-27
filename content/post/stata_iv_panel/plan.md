# Plan: IV Estimation with Panel Data

## Scope Confirmation (Approved 2026-04-27)

1. **TOPIC:** IV estimation with panel data -- Replicating Hodler & Raschky (2014)
   "Economic shocks and civil conflict at the regional level"
   Analysis question: "Do negative economic shocks (measured by nighttime
   light intensity) increase the probability of civil conflict in African
   regions, using rainfall and drought as instruments?"

2. **LANGUAGE:** Stata -- replication of a Stata-based paper with .dta dataset
   and existing .do files as reference

3. **FIGURE THEME:** Light (default)

4. **SCRIPT SECTIONS:**
   - 0. Setup (packages, log, seed, colors)
   - 1. Data loading + describe + CSV export
   - 2. Descriptive statistics (Table 1 replication)
   - 3. OLS with FE -- reduced-form estimates (Tables 2-3, cols 1-4)
   - 4. 2SLS/IV with FE -- main IV estimates (Tables 2-3, cols 5-7)
   - 5. First-stage results + diagnostics (Table 4: F-stats, weak ID tests)
   - 6. Visualization: coefficient comparison (OLS vs 2SLS), first-stage
        scatter, conflict map/distribution
   - 7. Summary table export

5. **DELIVERABLES:**
   - analysis.do
   - analysis.log
   - 5 PNG figures
   - 6 CSV tables
   - README.md (artifact inventory)
   - plan.md (this scope document)

6. **FRAMING:** Causal -- IV/2SLS addresses endogeneity of nighttime lights
   as a proxy for economic activity. Estimand: the causal effect of economic
   shocks on conflict probability. Weather instruments (rainfall, drought)
   satisfy the exclusion restriction through a clear lag structure
   (weather_t-2 -> economic activity_t-1 -> conflict_t).

## Design decisions

- Uses pre-detrended variables (`*_dt`) already in the dataset (detrending code
  is in the original do-file but commented out since variables are pre-computed)
- Both `estout` (display) and CSV export for regression tables
- `xtivreg2` with `first` option for IV diagnostics (F-stats, Hansen J)
- Binned scatter plots for first-stage visualization (50 bins, year FE partialled out)
- Site color palette: steel blue (#6a9bcc), warm orange (#d97757)
