# Script review — `analysis.py` (`python_sc_bayes_spatial`)

**Reviewed:** 2026-08-04 · **Verdict: ACCEPT**
**Basis:** a full cold run (`execution_log.txt`, 446 lines, exit 0, 18/18 assertions passing) plus a warm re-run and a line read of all 1,320 lines.

Scores: Execution 10 · Structure 9 · Code quality 9 · Reproducibility 10 · Figures 9 · Data handling 10 · Statistical correctness 9 · Causal inference 10.

---

## 1. Execution

Runs clean from a cold cache to `=== Script completed successfully ===`, exit 0, no unhandled exceptions and no silent failures. All 19 figures and 23 tables are written. A warm re-run completes in under a minute and reproduces every headline number from cache.

## 2. Structure and organisation

Fifteen numbered sections with `═`-ruled headers, following the house pattern from `python_sc_dsc_sdid/analysis.py`. Helpers (`rule`, `save_fig`, `write_tab`, `caption`, `restyle_dark`, `as_fig`, `cached`, `ladder`) are defined once at §0 and reused throughout.

**One deliberate deviation from narrative order, and it is documented.** Stage 3 is fitted in §5 and Stage 2b is narrated from it in §6, because scspill exposes the ρ = 0 case as part of every SAR fit. The docstring and the §6 prose both say so. This halves the MCMC budget and is the right call.

## 3. Code quality

- `Bench` is a frozen dataclass; the benchmark runner emits a row for every spec regardless of outcome, with `status`, `error_type`, `error_msg` and `seconds` columns.
- The `comparable` boolean and the free-text `estimand` column are the strongest single design decision in the file. Three of nine estimators target a different quantity, and the table refuses to let a reader miss that.
- `_summarise()` in `_fit_bscm` collapses whichever array axis is *not* the donor axis rather than assuming an orientation — which is what caught mlsynth storing chains as `(n_donors, n_draws)`.
- The `NAMING HAZARD` block at the top of the docstring is warranted: four models in this post are called "a Bayesian synthetic control" and three are called "the spillover SCM".

**Minor (2).** `_fit_scspill` returns a `(dict, live_result)` tuple whose second element is used only through the module-global `_live_sar`; a small class or an explicit out-parameter would read better. And §7's `_lo`/`_hi` Series are built with a `None` fallback that is then re-checked at three call sites — a `pd.Series(dtype=float)` sentinel would remove the branching.

## 4. Reproducibility

The strongest dimension.

- BLAS thread counts pinned **above the imports**, with the reason stated; `JAX_ENABLE_X64=1` set before anything pulls jax.
- Every estimator seeded explicitly (`seed=`, `mcmc_seed=`, `random_state=` as each library requires).
- The cache key fingerprints Python, both library versions, the mlsynth commit SHA, the **resolved** backend and the seed, so a pin change invalidates every entry rather than serving stale numbers under new pins.
- `CACHE_SCHEMA` was bumped to 2 during development when a payload shape changed — the mechanism works.
- The cache stores extracted plain-dict payloads (~170 KB) rather than the frozen pydantic result (20–40 MB and version-fragile).
- The backend is resolved via scspill's own `resolve_backend()` and **printed**, not assumed. numba and numpy were verified to give identical results.
- `scspill.__version__ != "0.2.1"` warns rather than dies — correct for a script a reader may run under a later release.

## 5. Figure conventions

All 19 figures are 300 dpi with `bbox_inches="tight"` and the dark navy facecolor. Six are native package plots, which is the point of a library tutorial; `restyle_dark()` plus the `PlotConfig.theme` hook plus mutating `SCSPILL_RC` covers all three ways scspill's house style can leak through.

**Defect found and fixed during review.** Figure 10's tile cartogram originally used a `** 0.45` power transform on the fill while the colourbar remained linear, so Idaho's 0.49 rendered at the same intensity as a value of 2.3. It also labelled tiles with `state[:2]`, which collides for four states beginning "Ne". Both corrected: the ramp is now linear with a comment explaining why the resulting pale field *is* the finding, and labels are real postal codes.

## 6. Data handling

The shipped `treated` column is rebuilt from the stated rule and asserted equal, so a future upstream change cannot silently move the post-period. Donor ordering is pinned once and every array is reindexed against it. `_align()` in `_fit_bscm` maps mlsynth's internal donor order onto scspill's by name and returns NaN rather than mislabelling.

## 7. Statistical correctness

- The bootstrap CI for Stage 1 uses 2,000 replicates with the same seed as the R edition, so the two intervals are comparable.
- The spillover sign convention is asserted, not assumed (`Nevada's spillover is negative`).
- The Geweke design follows the function's own documented constraints (`T0=4, N=4`) and deliberately does **not** test the production kernel, which the docs call "effectively untestable at feasible chain lengths". Running it at two chain lengths to distinguish a mixing artifact from an incoherent conditional is exactly the right use of the test.
- `prior_sensitivity` runs the simplified kernel, and the script says so before printing the numbers rather than letting them be read as the headline ρ.

**Minor (1).** The assertion `abs(sar["att"] - R_EDITION["att_sar"]) < 0.60` is a tolerance chosen after seeing the answer. It is a regression guard rather than a test, which is fine, but the file should not be read as validating the estimator against R to that precision *a priori*.

## 8. Causal inference

The estimand is stated as the ATT and held fixed across all three stages. The `comparable` column enforces that the benchmark table cannot silently mix estimands. The identification discussion — that the effects cancel β, the factors and the error variances, so weak identification is confined to ρ — is correct and is the reason the whole approach is usable.

The `att < att_scm` assertion captures the direction the spillover sign implies, and the sign was verified empirically rather than assumed. The bias decomposition reproduces the purged-minus-contaminated difference to 0.057 packs.

---

## Issues

| # | Severity | Issue | Status |
|---|---|---|---|
| 1 | MEDIUM | Figure 10 used a power-transformed fill against a linear colourbar | **fixed** |
| 2 | MEDIUM | Figure 10 tile labels collided (four states begin "Ne") | **fixed** |
| 3 | LOW | `_fit_scspill` returns a tuple whose second element is passed by module global | open, cosmetic |
| 4 | LOW | `_lo`/`_hi` `None` sentinel re-checked at three call sites | open, cosmetic |
| 5 | LOW | `SPILLSYNTH(sar)` at 500k is fitted twice — once as the §8 cross-check, once inside the §10 benchmark (994 s + 1,094 s) | open by choice; keeps the two sections independently cacheable, and both are cached after the first run |
| 6 | LOW | Assertion tolerances are calibrated to observed output | open by design; they are regression guards |

Two MEDIUM issues found, both fixed and re-verified. No HIGH issues. **ACCEPT.**

---

## Resolution — 2026-08-04

Both open cosmetic items closed; the two "open by choice" items stay open, on purpose.

| # | Status | Detail |
|---|---|---|
| 3 | **fixed** | `_fit_scspill` now returns a `ScspillFit` NamedTuple (`payload`, `live`) instead of a bare pair, with a docstring saying why the live pydantic result is never cached. The three call sites read `.payload` rather than `[0]`. The module global survives, but is now documented as structural rather than incidental: `cached()` fixes the callback signature, and the live object cannot travel through the pickle the callback returns. |
| 4 | **fixed** | `_lo`/`_hi` use an empty `pd.Series(dtype=float)` as the sentinel. `.reindex(donors)` then produces the all-NaN fallback for free and `s in _lo.index` is simply False, so three of the four `is not None` branches disappear; the fourth became `if not _lo.empty`. |
| 5 | open by choice | `SPILLSYNTH(sar)` is still fitted twice at 500k. Deduplicating would couple §8 and §10 to save time that caching already saves — both are served from cache after the first run. |
| 6 | open by design | The assertion tolerances remain calibrated to observed output. That is what a regression guard is; there is no a-priori tolerance to substitute. |

One defect was also found in `analysis.py` by the **post** review rather than this one:
Figure 11's caption claimed "with 95% credible intervals" for a figure that draws none,
because `scspill` returns the effects panel as posterior means rather than per-draw. The
caption now says so, in both `analysis.py` and the post.

**Re-verified after the refactors:** `analysis.py` warm run, exit 0, **18/18 assertions
pass**, 19 figures and 22 tables written, headline ATT −16.868 [−23.045, −10.332],
ρ̂ 0.3161, ESS 137, Nevada −5.500 — every number unchanged.
