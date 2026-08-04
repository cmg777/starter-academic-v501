# Approved scope — `python_sc_bayes_spatial`

The Python counterpart of `content/post/r_sc_bayes_spatial/`. Not a translation:
the R edition's numbers are the *baseline to be reconciled against*, and the gap
between the two is the post's methodological centrepiece.

## Topic and framing

A beginner-friendly but complete introduction to synthetic control from three
perspectives, on the California Proposition 99 case study:

1. **Classical simplex SC** — Abadie, Diamond & Hainmueller (2010)
2. **Bayesian SC** — horseshoe prior on unconstrained weights
3. **Bayesian spatial SC** — Sakaguchi & Tagawa (2026), a SAR layer on donor
   outcomes that drops SUTVA on the donor pool

## Data

`scspill.data.load_california()` — the ADH Proposition 99 panel as distributed
with Cunningham's *Causal Inference: The Mixtape*, plus two spatial objects.

- 39 US states x 31 years (1970–2000) = 1,209 rows, balanced, no missing values
- Outcome `cigsale` (packs per capita per year); covariate `retprice`
- Treated unit California; **treatment year 1988** (scspill's convention, and
  the R edition's). T0 = 18, T1 = 13, 38 donors.
- `spatial_w`: each donor's rook contiguity with California. **Nevada only** —
  Oregon and Arizona border California but are not in the ADH donor pool.
- `spatial_W`: 38x38 rook contiguity among donors, row-normalised inside the
  estimator.

mlsynth's own Proposition 99 example uses `year >= 1989`. The script rebuilds
the treatment dummy at 1988 and asserts it, so all three stages and the
benchmark condition on the same post-period.

## Estimators

| Stage | Class | Role |
|---|---|---|
| 1 | `mlsynth.VanillaSC` | simplex baseline |
| 2a | `mlsynth.BSCM` (horseshoe, spike-and-slab) | Bayesian SC **with an intercept** |
| 2b | `scspill.SCSPILL` at rho = 0 | Bayesian SC **without** an intercept; free from the Stage-3 fit |
| 3 | `scspill.SCSPILL(method="sar")` | the headline |
| 3' | `mlsynth.SPILLSYNTH(method="sar")` | independent port of the same paper |

Plus a benchmark sweep over `BVSS`, `MVBBSC`, `BFSC`, `BPSCS`, `SPILLSYNTH(cd)`,
`SpSyDiD`, `ISCM`, `SPOTSYNTH`, each carrying an `estimand` sentence and a
`comparable` flag so the table cannot imply a false comparison.

## Sections

0 setup · 1 data · 2 spatial structure · 3 Stage 1 · 4 Stage 2a · 5 Stage 3 ·
6 Stage 2b + the intercept · 7 spillovers · 8 R reconciliation + the six
departures · 9 validation (prior predictive, Geweke, prior sensitivity) ·
10 benchmark sweep · 11 Monte Carlo · 12 the ladder · 13 assertions ·
14 MCMC budget ladder · 15 web-app data

## MCMC budget

Two-tier. Headline `m_iter=500_000, burn=250_000`; notebook and Quarto bundle
`4_000 / 2_000`. Section 14 is the evidence: the ATT is stable from 100k
onward, but `ESS(rho)` does not clear the conventional floor of 100 until about
500k. rho is the weakly identified parameter and it sets the budget.

## Pins

```
pip install "scspill[numba]==0.2.1"
pip install "mlsynth[bayes] @ git+https://github.com/jgreathouse9/mlsynth.git@15f168bb90487098a7324be00b6663fcab0139ef"
```

`numba` is an extra, not a requirement: the script resolves the backend at
runtime, prints what it got, and puts it in the cache key. The two backends were
verified to give identical results.

## Outputs

20 figures `python_sc_bayes_spatial_NN_*.png` (dpi 300, dark navy theme), 23
CSVs, `execution_log.txt`, and under `APP_DATA=1` the web app's
`data/results.json`. `featured.webp` is added by hand, not generated.

## Deliverables beyond the script

`index.md` (long-form, ~1,650 lines), `notebook.ipynb` (Colab),
`cheatsheet_python.py`, `references/` Quarto bundle + `.zip`, `slides/`,
`web_app/`, `data/` dictionary, `infographic_instructions.md`, ES + JA stub
cards, a `logs/` entry, and a reciprocal link added to the R edition.
