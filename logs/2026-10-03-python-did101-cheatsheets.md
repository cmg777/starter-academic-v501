# 2026-10-03 — python_did101: Python / R / Stata cheat sheets

First step of bringing `content/post/python_did101/` up to the `python_fwl` feature set: the three
cheat sheets, the local CSVs they read, and their link buttons. Nothing else in the post changed;
the remaining `python_fwl` features (podcast/video embeds, AI slides, AhaSlides, data dictionary,
Stata port, in-post lab, bundle update) are for later rounds.

## Files

| File | What it is |
|---|---|
| `data/tutoring_did.csv`, `data/tutoring_didevent.csv` | CSV copies of the two quarcs-lab `.dta` files. `gpa` and `female_share` are written as the exact float64 values the post's `pd.read_stata(...).astype(float)` produces (17 significant digits), so every language reads identical doubles; integer columns are written as integers; `timeToTreat` is empty for comparison schools |
| `cheatsheet_python.py` | pyfixest 0.50.1 |
| `cheatsheet_R.R` | fixest 0.14 |
| `cheatsheet_stata.do` | Stata 17+ built-ins only (`regress`, `xtreg`, `etable`) |

Each sheet loads the local CSV first, then the raw GitHub URL, and follows the `python_fwl` layout:
0 vocabulary; 1 load; 2 naive before-after; 3 the 2×2 by hand (with the rounding note: 25.32 / 10.88
are differences of rounded means, exact 25.315 / 10.886); 4 the interaction regression, asserting each
coefficient equals a group mean; 5 TWFE; 6 the covariate; 7 four standard errors; 8 regression tables
(text + LaTeX); 9 the event study; 10 the event-study figure (written to the temp folder only);
11 traps; and the comparison table.

## Consistency

- The comparison table (naive, manual 2×2, OLS/HC1, TWFE/CRV1, TWFE + covariate, seven event-study
  coefficients) is byte-identical in all three outputs, and each sheet asserts its own column against
  the reference to 4 decimals.
- Section 7 asserts the four SEs (iid 0.6071, HC1 0.5852, CRV1 0.5851, CRV3 0.6373) in every language.
  CRV3 needed explicit work. pyfixest's CRV3 is the leave-one-school-out jackknife **centred on the
  full-sample estimate** times the CRV1 factor G/(G−1)·(N−1)/(N−K) = 35/34·69/67 (K = 3). fixest has
  no CRV3, and Stata's `xtreg, fe vce(jackknife)` centres on the replicate mean with (G−1)/G (0.6101).
  All three sheets compute the jackknife by hand, assert 0.6373, and print the Stata definition as a
  contrast. R also asserts that 35/34·69/67 is fixest's own CRV1 factor.
- Stata specifics checked: `xtreg, fe vce(cluster id)` reproduces fixest's CRV1, but `regress ... i.id,
  vce(cluster id)` counts the school dummies and gives 0.8337 (trap 7). `xtreg`'s `e(r2_w)` (0.995)
  counts the period dummies as regressors, so the sheet computes the two-way within R² (0.981) by
  hand. The event-study dummies are built by hand (factor variables cannot be negative). `etable`
  stars are set to match the other languages (* .05, ** .01, *** .001).
- Traps documented and demonstrated: leaving comparison schools' `timeToTreat` missing (pyfixest
  and fixest stop with "all collinear"; Stata's hand-built dummies are unaffected), pre-tests are
  not proof, the reference period, HC1 in a panel, few treated clusters, CRV3 definitions, pyfixest
  version drift, rounded means, staggered adoption, and Stata float import / negative factor levels.

## Verification

`python cheatsheet_python.py` (pinned venv), `Rscript cheatsheet_R.R` (R 4.5.2) and
`stata-se -b do cheatsheet_stata.do` (Stata 19 SE) all exit cleanly with every assertion passing,
and the three comparison tables diff as identical. The three figures were inspected. A Hugo build
publishes the three files and both CSVs, and the three new `bolt` buttons link to them. The Stata
batch log (license header) stays gitignored (`content/post/*/cheatsheet_stata.log`).
