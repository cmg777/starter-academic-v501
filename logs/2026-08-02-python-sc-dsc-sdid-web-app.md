# 2026-08-02 — an interactive companion of its own for `python_sc_dsc_sdid`

## What changed

`content/post/python_sc_dsc_sdid/` shipped without a web app and borrowed the R edition's
by absolute URL (`name: "Web app — R edition"`). It now has its own:
`content/post/python_sc_dsc_sdid/web_app/`, twelve scrolling panels, and the front-matter
entry is a plain `Web app` → `web_app/index.html`. The R post's app is untouched.

## Why the two apps differ deliberately

The R companion is **estimator-centric** — counterfactual, weights, time weights, ladder,
placebo, solver iterations — which suits a post that hand-codes each estimator before
calling its package.

The Python post's argument is **package-centric**: one config dict across the whole ladder,
and defaults that quietly change the answer. The new app is built around that. Panels 1–3
carry the ladder as a backdrop (reusing the R app's `paths`, `gap`, `weights`, `ladder` and
`placebo` chart builders so the two read as a pair); panels 4–7 are about `mlsynth` itself;
panels 8–12 are the evidence.

| # | Panel | New? |
|---|---|---|
| 1 | The counterfactual | shared with the R app |
| 2 | Who is in the blend | shared |
| 3 | The ladder, side by side | shared |
| 4 | Anatomy of a fit, and the TSSC rounding trap | new, no D3 |
| 5 | A name that means two things (`mlsynth.DSC` vs `TSSC(method="MSCa")`) | new, no D3 |
| 6 | The defaults dial — `zeta` swept, `set_f`, `w_constr`, covariates | new |
| 7 | Three meanings of "control for", with the pre-RMSE column beside it | new |
| 8 | The fire drill (placebo tournament) | shared |
| 9 | Placebo in space | new |
| 10 | The SDID event study | new |
| 11 | The inference menu | new |
| 12 | The solver's fingerprint | new (the R app plots iterations; this one plots implementations) |

## `analysis.py` grew a guarded section 17

Panel 6 wants a *sweep*, and the committed CSVs only held the two or three settings the post
quotes. Section 17 adds four tables and writes `web_app/data/results.json` directly, so the
JSON is never hand-edited and cannot drift from the post.

It runs only under `APP_DATA=1`, mirroring the existing `FORCE_REFIT=1` pattern, and it
refuses to run if the assertion block above it failed:

```bash
APP_DATA=1 python analysis.py        # rebuild the app's data
python analysis.py                   # unchanged behaviour, prints "[skip] web-app data"
```

New tables: `app_zeta_sweep.csv`, `app_wconstr_grid.csv`, `app_setf_grid.csv`,
`app_covariates.csv`. Everything else the app needs was already there and is read as-is.

**`zeta` has no number to sweep around until you evaluate it.** `SDIDConfig.zeta` defaults
to `None`, which means "compute one for me"; the package then sets it to
`(N_treated · T_post)^(1/4) · sd(ΔY_donors)`. Section 17 imports mlsynth's own
`compute_regularization` to get that value (0.012425 on this panel) and sweeps in multiples
of it, rather than hard-coding a grid.

**Float churn.** Re-running the pipeline rewrote five pre-existing CSVs in their 13th–14th
significant figure — summation-order noise, worst relative change 6.4e-15, nothing the post
quotes. They were restored with `git restore`. No PNG changed at all.

## A discrepancy the app surfaced in the post's own prose

Section 21 says *"Three defaults each move the answer by more than the spread across the
ladder"* and then gives `zeta` 0.13pp, `set_f` 0.47pp, covariates 1.76pp against a ladder
spread of 0.31pp. Section 22's second bullet repeats the claim. **`zeta`'s 0.13pp is
smaller than the 0.31pp spread, not larger** — the individual numbers are right, the
summarising sentence overstates. Two of the three clear the ladder, not three.

Panel 6 draws this honestly: the ladder spread is a shaded band, and `zeta`'s capsule is
rendered in steel rather than orange precisely because it stays inside it. `w_constr`,
which the post does not count among the three, spans 0.40pp and does clear the band.

Left for a separate prose edit — the `write-app` skill does not modify post content.

## Verification

- `APP_DATA=1 python analysis.py`: clean, all assertions pass, 4 new CSVs + 66.7 KB of JSON.
- Data contract: **1332 values** in `results.json` compared against the committed CSVs at
  8 significant figures, no mismatches. This is the substitute for the skill's generic
  `dgp.js`/`lasso.js` smoke test, which does not apply — this app computes nothing in the
  browser, the same call the R app's `REVIEW.md` made and documented.
- Hugo 0.111.3: all five assets HTTP 200; the post renders
  `href="/post/python_sc_dsc_sdid/web_app/index.html"` exactly (never `/web_app/`).
- Browser: 12 panels, 15 SVGs all with `role="img"` + `aria-label`, every one of the 20
  control pills changes its chart, the zeta slider tracks 0 → 2×, console clean, and the
  page body never scrolls horizontally at 500 px.
- Panel 1's readouts reproduce §14 exactly: DiD 4.98, SC 3.04, DSC 2.99, SDID 2.80,
  MASC 2.73, ASCM 3.04.
- `scripts/i18n-parity.sh`: 95/95 posts, 0 missing. No i18n change needed — the ES/JA
  counterparts are card-only stubs.

## Follow-up

`/project:review-app python_sc_dsc_sdid` for the 10-dimension audit and a `REVIEW.md`, as
the R companion has.
