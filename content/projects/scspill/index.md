---
date: "2026-07-28T00:00:00Z"
external_link: ""
image:
  caption: ""
  focal_point: Smart
summary: A Python library for Bayesian synthetic control when the treatment leaks — it relaxes SUTVA through a spatial-autoregressive channel and estimates both the effect on the treated unit and the spillover received by every donor, with full Bayesian uncertainty.
tags:
- python
- causal
- spatial
title: "scspill"

links:
  - name: "Website"
    url: "https://quarcs-lab.github.io/scspill/"
    icon_pack: ai
    icon: open-data
  - name: "PyPI"
    url: "https://pypi.org/project/scspill/"
    icon_pack: fab
    icon: python
  - name: "Quick Start (Colab)"
    url: "https://colab.research.google.com/github/quarcs-lab/scspill/blob/main/notebooks/california.ipynb"
    icon_pack: fab
    icon: google
  - name: "Get started"
    url: "https://quarcs-lab.github.io/scspill/get-started.html"
    icon_pack: fas
    icon: rocket
  - name: "The method"
    url: "https://quarcs-lab.github.io/scspill/articles/method.html"
    icon_pack: fas
    icon: square-root-alt
  - name: "Validation"
    url: "https://quarcs-lab.github.io/scspill/articles/validation.html"
    icon_pack: fas
    icon: flask
  - name: "API Reference"
    url: "https://quarcs-lab.github.io/scspill/reference/"
    icon_pack: fas
    icon: book
  - name: "GitHub"
    url: "https://github.com/quarcs-lab/scspill"
    icon_pack: fab
    icon: github

url_pdf: ""
url_slides: ""
url_video: ""
---

**Synthetic control when the treatment leaks — the policy effect *and* the spillover received by every donor.**

`scspill` is a Python implementation of the Bayesian spatial-spillover synthetic control of [Sakaguchi & Tagawa](https://quarcs-lab.github.io/scspill/articles/method.html) (*Identification and Bayesian Inference for Synthetic Control Methods with Spillover Effects*, The Econometrics Journal). Classical synthetic control assumes the donors are untouched by the policy; when the treatment leaks across borders or trade networks that assumption fails and the estimate is biased. `scspill` relaxes SUTVA by letting the treatment spill over to the donor pool through a **spatial-autoregressive channel** with user-supplied weights, and reports the effect on the treated unit, the spillover received by each donor, and the spillover intensity — each with full Bayesian uncertainty. The synthetic weights use **horseshoe regularization without a simplex constraint**, so donors may be dropped, enter negatively, or extrapolate. The estimator follows the [mlsynth](https://github.com/jgreathouse9/mlsynth) architecture — a pydantic config in, a standardized results object out — so the two libraries compose naturally.

### 🚀 [Get started](https://quarcs-lab.github.io/scspill/get-started.html)

Fit the model on California's Proposition 99 in about ten lines: the **ATT with a 95% credible interval**, the spillover intensity ρ, the year-by-year spillover received by every donor, MCMC diagnostics, and counterfactual plots.

[▶ Open in Colab](https://colab.research.google.com/github/quarcs-lab/scspill/blob/main/notebooks/california.ipynb)

### 📐 [The method](https://quarcs-lab.github.io/scspill/articles/method.html)

Identification and the **two-step Bayesian sampler**: horseshoe synthetic weights, the SAR spillover block, and adaptive Metropolis for the spillover intensity. It also documents the defaults that depart from the reference R implementation — each departure has an escape hatch and a benchmark quantifying the difference.

### 🧪 [Validation](https://quarcs-lab.github.io/scspill/articles/validation.html)

Evidence that the sampler is correct: the **Geweke (2004) joint distribution test**, prior-sensitivity grids, prior predictive checks, and cross-validation against the authors' frozen R credible intervals.

## What's inside

**Estimation** — `SCSPILL(config).fit()` returns the ATT and its credible interval, the counterfactual path, the ρ posterior, a time-by-donor spillover panel, and MCMC diagnostics.

**Validation** — `scspill.validation` implements the Geweke joint distribution test of the sampler, prior-sensitivity grids, and prior predictive checks.

**Simulation** — `scspill.simulate` reproduces the paper's [Monte Carlo study](https://quarcs-lab.github.io/scspill/articles/simulation-study.html): a rook-lattice SAR data-generating process and the SCM / BSCM / SCSPILL comparison behind Tables 1–2.

**Data** — `scspill.data` ships the two case studies below, each with its panel and its spatial weights matrices.

**Cross-validated against the R replication package** — the California and Sudan posteriors are checked against the authors' frozen R credible intervals, the Monte Carlo grid against the paper's frozen tables, and the prior predictive statistics to three decimals.

## Bundled case studies

`scspill.data` ships two ready-to-estimate [datasets](https://quarcs-lab.github.io/scspill/articles/datasets.html):

- **California** — Proposition 99, 39 states (1970–2000): per-capita cigarette sales with rook-contiguity weights, via `scspill.data.load_california()`.
- **Sudan** — the 2011 secession, 34 African countries (2000–2015): GDP per capita with trade-network weights, via `scspill.data.load_sudan()`. Worked through in the [Sudan case study](https://quarcs-lab.github.io/scspill/sudan.html).

## Installation

Install the latest release from PyPI (the core install is pure NumPy/SciPy; the `numba` extra adds JIT-compiled samplers):

```bash
pip install scspill              # NumPy/SciPy sampler backend
pip install "scspill[numba]"     # + JIT-compiled samplers (~10x faster)
pip install "scspill @ git+https://github.com/quarcs-lab/scspill.git"   # latest
```

Requires Python 3.10+.

## At a glance

Load a bundled case study, fit the sampler, and read off both the treatment effect and the spillovers:

```python
from scspill import SCSPILL
from scspill.data import load_california

panel = load_california()        # Prop 99 panel + rook-contiguity weights
result = SCSPILL(
    {**panel.config_kwargs(), "m_iter": 20_000, "burn": 10_000, "seed": 42}
).fit()

result.att, result.att_ci          # treatment effect on California + 95% CrI
result.rho_hat, result.rho_ci      # spillover intensity posterior
result.spillover_panel["Nevada"]   # the effect received by Nevada, per year
result.diagnostics()               # ESS / R-hat / MCSE per chain
result.plot(kind="panel")          # counterfactual | effect | top spillovers
```

Head to [Get started](https://quarcs-lab.github.io/scspill/get-started.html), [The method](https://quarcs-lab.github.io/scspill/articles/method.html) and [Validation](https://quarcs-lab.github.io/scspill/articles/validation.html) to see the estimator in action.

## Built on

`scspill` keeps its dependencies deliberately light — the modern Python scientific stack, and nothing else:

- **[NumPy](https://numpy.org)** and **[SciPy](https://scipy.org)** — the sampler backend
- **[pandas](https://pandas.pydata.org)** — panels and the spillover tables
- **[pydantic](https://docs.pydantic.dev)** — the validated estimator configuration
- **[matplotlib](https://matplotlib.org)** — the diagnostic and counterfactual figures
- **[numba](https://numba.pydata.org)** — optional JIT-compiled samplers

## Acknowledgement

The method and its reference implementation are by Shosei Sakaguchi and Hayato Tagawa; the estimator architecture follows Jared Greathouse's [mlsynth](https://github.com/jgreathouse9/mlsynth). This package is an independent Python port developed at the [QuaRCS Lab](https://quarcs-lab.org) (Quantitative Regional and Computational Science) and released under the MIT license. If you use `scspill` in your research, please cite the methodological article and the software (see [`CITATION.cff`](https://github.com/quarcs-lab/scspill/blob/main/CITATION.cff)).
