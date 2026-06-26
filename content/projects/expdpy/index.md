---
date: "2026-06-18T00:00:00Z"
external_link: ""
image:
  caption: ""
  focal_point: Smart
summary: A Python library to explore, analyze, and learn panel data interactively — composable Plotly figures and publication-quality tables, plus three no-code Streamlit web apps (Explore, Analyze, Learn).
tags:
- python
- panel
title: "expdpy"

links:
  - name: "Website"
    url: "https://cmg777.github.io/expdpy/"
    icon_pack: ai
    icon: open-data
  - name: "PyPI"
    url: "https://pypi.org/project/expdpy/"
    icon_pack: fab
    icon: python
  - name: "Quick Start (Colab)"
    url: "https://colab.research.google.com/github/cmg777/expdpy/blob/main/notebooks/explore.ipynb"
    icon_pack: fab
    icon: google
  - name: "Explore app"
    url: "https://expdpy-explore.streamlit.app/"
    icon_pack: fas
    icon: laptop-code
  - name: "Analyze app"
    url: "https://expdpy-analyze.streamlit.app/"
    icon_pack: fas
    icon: laptop-code
  - name: "Learn app"
    url: "https://expdpy-learn.streamlit.app/"
    icon_pack: fas
    icon: laptop-code
  - name: "API Reference"
    url: "https://cmg777.github.io/expdpy/reference/"
    icon_pack: fas
    icon: book
  - name: "GitHub"
    url: "https://github.com/cmg777/expdpy"
    icon_pack: fab
    icon: github

url_pdf: ""
url_slides: ""
url_video: ""
---

## expdpy — explore, analyze and learn panel data interactively

**expdpy** is an exploratory data analysis toolkit for panel and cross-sectional data, built on modern Python tooling (Plotly, pyfixest, and Great Tables). It pairs composable analytical functions with three no-code Streamlit web apps, and is a Python port of the ExPanDaR R package.

### Get started

- **[Quick Start notebook (Colab)](https://colab.research.google.com/github/cmg777/expdpy/blob/main/notebooks/explore.ipynb)** — run the package end to end in your browser, no installation required.
- **No-code apps (Streamlit)** — [Explore](https://expdpy-explore.streamlit.app/), [Analyze](https://expdpy-analyze.streamlit.app/), and [Learn](https://expdpy-learn.streamlit.app/) the bundled datasets with no code.
- **[API Reference](https://cmg777.github.io/expdpy/reference/)** — full function-level documentation.

### What it does

- **Explore** — descriptive, correlation, and extreme-observation tables; histograms, bar charts, time and quantile trends, by-group views, and missing-value heatmaps; scatter plots with LOESS smoothing, within/between decomposition, per-unit trajectories, panel-structure diagnostics, distribution and transition dynamics, and outlier treatment.
- **Analyze** — multi-way fixed effects and clustered standard errors via pyfixest; pooled, between, fixed- and random-effects estimators; the correlated-random-effects (Mundlak) estimator and Hausman test; post-estimation tools (fixed-effect plots, predictions, Wald tests); robust inference (randomization inference, wild cluster bootstrap); Frisch–Waugh–Lovell and coefficient plots; event-study / staggered difference-in-differences; β-, σ- and club convergence; and the Kuznets-waves curve.
- **Learn** — 27 concept explainers with `.interpret()` and `.explain()` methods, plus nine concept sandboxes that simulate data to teach first-differences, fixed effects, clustering, omitted-variable bias, and convergence analysis.

### A quick taste

```python
import expdpy as ex
from expdpy.data import load_kuznets

df = load_kuznets()  # synthetic 80-country panel
ex.explore_scatter_plot(
    df, x="log_gdp_pc", y="gini_regional", color="continent", size="population", loess=1
).fig
```

### Three no-code apps

The same analyses are available in the browser through three multipage **Streamlit** apps — **Explore**, **Analyze**, and **Learn** (deployable to the cloud) — no coding required.

### Example data

expdpy ships with several built-in datasets: a synthetic **kuznets** panel (80 countries, 2015–2025) for illustrating N-shaped inequality curves, **gapminder**, **staggered_did**, **productivity**, and **bolivia112_gdppc**.

### Install

```bash
pip install expdpy
pip install "expdpy[streamlit]"   # adds the no-code Streamlit apps
```

expdpy requires Python 3.10+. For the latest unreleased version, install from GitHub:

```bash
pip install "git+https://github.com/cmg777/expdpy.git"
```

expdpy is a Python port of the [ExPanDaR](https://github.com/trr266/ExPanDaR) R package by Joachim Gassen and the TRR 266 project; please cite the original work in research. Released under the MIT License.
