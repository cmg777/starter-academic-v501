# Approved scope: Dynamic panel data tutorial (python_dynamic_panel)

Scope confirmed by the user via the session plan
(`~/.claude/plans/in-content-post-python-dynamic-panel-cre-proud-harbor.md`, approved 2026-06-11).

```
SCOPE CONFIRMATION
==================

1. TOPIC: Dynamic panel data estimation (Arellano-Bond difference GMM,
   Blundell-Bond system GMM) using the Arellano-Bond (1991) UK employment
   panel (abdata.csv: 140 firms, 1976-1984, unbalanced).
   Analysis question: "How persistent is firm employment, and why do OLS,
   fixed effects, and naive IV all fail to answer that question - while
   GMM succeeds?"

2. LANGUAGE: Python - pydynpd for GMM (the post's featured package, from
   referenceMaterials vignettes) + pyfixest for the biased OLS/FE/IV
   benchmarks (user-selected).

3. FIGURE THEME: Dark navy (#0f1729 bg, #1f2b5e grid, #6a9bcc/#d97757/#00d4c8
   accents) - matches python_fwl / python_pyfixest.

4. SCRIPT SECTIONS:
   - 0. Setup (NumPy-2 compat shim for pydynpd 0.2.2, seed, colors, labels)
   - 1. Data loading + panel structure (Fig 1: employment trajectories)
   - 2. Data preparation (lags, first differences) + CSV export
   - 3. The bracket: pooled OLS (up-biased) vs FE/Nickell (down-biased)
        (Fig 2: bias bracket)
   - 4. Anderson-Hsiao IV in first differences (consistent but imprecise)
   - 5. Difference GMM (pydynpd, one-step + two-step) - lands near the FE
        bound: Bond (2002) weak-instrument diagnostic
   - 6. System GMM (collapsed, two-step) - the resolution; AR(1)/AR(2) +
        Hansen diagnostics
   - 7. Instrument proliferation: lag-window x collapse grid
        (Fig 3: instrument count vs Hansen p)
   - 8. Replication check: package-vignette AB two-lag spec (exact match)
   - 9. Synthesis (Fig 4: forest plot of rho-hat with OLS-FE bracket band)
   Estimated: 4 PNG figures, ~6 CSV tables

5. DELIVERABLES:
   - script.py
   - execution_log.txt
   - 4 PNG figures (dark theme, dpi 300)
   - ~6 CSV tables (prepared data + per-method results + grid + summary)
   - README.md (artifact inventory)
   - plan.md (this scope document)

6. FRAMING: Descriptive / structural. The parameter of interest is the
   autoregressive coefficient rho of a dynamic labor-demand equation
   n_it = rho*n_i,t-1 + b1*w_it + b2*w_i,t-1 + b3*k_it + b4*k_i,t-1 + a_i + d_t + e_it
   (employment persistence) plus wage/capital elasticities. No ATE/ATT:
   identification rests on sequential exogeneity of the instruments and
   no serial correlation in e_it, tested via AR(2) and Hansen.

7. AMBIGUITY RESOLUTIONS (from user Q&A):
   - Full pipeline incl. reviews, infographic, web app, Quarto bundle,
     Colab notebook, slides, i18n stubs.
   - Single running specification: the Blundell-Bond (1998) AR(1)
     labor-demand model (verified end-to-end numbers below); the
     Arellano-Bond two-lag vignette spec appears as a replication check.
```

## Verified numbers (pinned before script writing; /tmp/venv_pydynpd, seed-free estimators)

| Estimator | rho1 (L1.n) | SE | Hansen p | AR(2) p | Instruments |
|---|---|---|---|---|---|
| Pooled OLS (year FE, cluster id) | 0.9617 | 0.008 | - | - | - |
| Fixed effects (id+year, cluster id) | 0.6262 | 0.052 | - | - | - |
| Anderson-Hsiao IV (diff, n_lag2 instr) | 1.2327 | 0.478 | - | - | - |
| Diff GMM two-step gmm(n,w,k 2:99) | 0.6788 | 0.089 | 0.211 | 0.866 | 91 |
| Sys GMM two-step collapsed | 0.9270 | 0.079 | 0.462 | 0.994 | 32 |
| Vignette replication (AB 2-lag spec) | 0.2711 | - | 0.434 | 0.760 | 42 |

Environment: /tmp/venv_pydynpd (Homebrew Python 3.11 arm64; pydynpd 0.2.2,
pyfixest 0.50.1, numpy 2.4.6, pandas 3.0.3). pydynpd 0.2.2 predates NumPy 2.0;
script carries a 6-line compat shim (np.in1d alias + scalar-conversion wrappers
injected into pydynpd.specification_tests). Never run Python with cwd inside
referenceMaterials/ (local package source shadows the installed one).
