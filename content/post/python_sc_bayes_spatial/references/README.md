# Bayesian Spatial Synthetic Control in Python — reproducible bundle

Companion project for
[carlos-mendez.org/post/python_sc_bayes_spatial](https://carlos-mendez.org/post/python_sc_bayes_spatial/).

Three nested synthetic-control estimators on the California Proposition 99
panel: the classical simplex, a Bayesian horseshoe prior, and the Bayesian
spatial (SAR) model of Sakaguchi & Tagawa (2026) that drops SUTVA on the donor
pool and reports what leaked onto each donor state.

## Quick start

**macOS** — double-click `render.command`.
**Windows** — double-click `render.bat`.

Either way the first run takes a few minutes: it builds a hermetic `.venv/`
next to this README, installs the pinned packages into it, registers a Jupyter
kernel, and renders `tutorial.qmd` to `tutorial.html`. Later runs take seconds.

From a terminal:

```bash
python3 setup_env.py        # build the environment (idempotent)
quarto render tutorial.qmd  # render the tutorial
```

## What is in this bundle

| File | What it is |
|---|---|
| `tutorial.qmd` | the tutorial, executable end to end |
| `setup_env.py` | hermetic `.venv` bootstrap, pinned package install, kernel registration |
| `_quarto.yml` | wires `setup_env.py` into Quarto's `pre-render` hook |
| `render.command` / `render.bat` | one-click wrappers for macOS and Windows |
| `analysis.py` | the full pipeline behind the post: 20 figures, 23 tables |
| `cheatsheet_python.py` | the whole argument in ~250 runnable lines, under a minute |
| `source_data.csv` | the 1,209-row state-year panel |
| `spatial_W.csv` | the 38 × 38 donor contiguity matrix |

## The two pins, and why they are what they are

```
scspill[numba]==0.2.1
mlsynth[bayes] @ git+https://github.com/jgreathouse9/mlsynth.git@15f168bb90487098a7324be00b6663fcab0139ef
```

**`scspill` is pinned to a PyPI release.** Version 0.2.1 is the one every number
in the post was produced under. It is alpha-stage software with four releases
in its history, and its configuration objects are `extra="forbid"` pydantic
models — a field rename upstream would break every fit rather than silently
changing an answer, which is the safer failure but still a failure. Pin it.

**`mlsynth` is pinned to a commit, not a release.** Its PyPI release numbered
1.0.0 lags the `main` branch by weeks at the same version string, so
`pip install mlsynth==1.0.0` does not get you the code the post ran against.

**The extras are not decoration.** `[numba]` makes `scspill`'s samplers roughly
five times faster and returns identical results — verified, not assumed. If
numba has no wheel for your Python, `setup_env.py` retries without it and says
so; the tutorial still runs, on the numpy backend. `[bayes]` pulls `numpyro`,
which `BFSC`, `MVBBSC`, `BPSCS` and `SPOTSYNTH` all import. Without it four rows
of the estimator-comparison table fail with `ModuleNotFoundError`.

## MCMC budget

`tutorial.qmd` runs at `m_iter=4000, burn=2000` so a first render finishes in
about a minute. **The post's headline numbers use 500,000 iterations.**

That is not padding. The ATT is stable from roughly 100,000 draws onward, but
the spatial parameter ρ is the weakly identified quantity in this model, and its
effective sample size does not clear the conventional floor of 100 until about
half a million. The tutorial budget reproduces the *shape* of every result —
signs, ranks, orders of magnitude — and not the third decimal. Section 14 of the
post is the evidence.

To reproduce the published numbers:

```bash
.venv/bin/python analysis.py 2>&1 | tee execution_log.txt   # ~1 hour cold
```

`analysis.py` caches every fit under `cache/`, so a second run takes under a
minute. `FORCE_REFIT=1` invalidates the cache; `M_ITER=100000` buys most of the
answer for a fifth of the wait.

## Requirements

Python 3.10–3.13 and [Quarto](https://quarto.org/docs/get-started/) 1.4 or
newer. Nothing else — `setup_env.py` handles the rest and never touches your
system Python.

## References

- Sakaguchi, S. & Tagawa, H. (2026). Identification and Bayesian inference for
  synthetic control methods with spillover effects. *The Econometrics Journal*.
  <https://doi.org/10.1093/ectj/utag006>
- Abadie, A., Diamond, A. & Hainmueller, J. (2010). Synthetic control methods
  for comparative case studies. *JASA*, 105(490), 493–505.
- `scspill` — <https://quarcs-lab.github.io/scspill/>
- `mlsynth` — <https://mlsynth.readthedocs.io/>
- The R edition of this post —
  <https://carlos-mendez.org/post/r_sc_bayes_spatial/>
