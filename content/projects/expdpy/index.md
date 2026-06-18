---
date: "2026-06-18T00:00:00Z"
external_link: ""
image:
  caption: ""
  focal_point: Smart
summary: A Python library to explore panel data interactively — composable Plotly figures and publication-quality tables, plus no-code Streamlit and Shiny web apps.
tags:
- python
- panel
title: "expdpy"

links:
  - name: "Website"
    url: "https://cmg777.github.io/expdpy/"
    icon_pack: ai
    icon: open-data
  - name: "Quick Start (Colab)"
    url: "https://colab.research.google.com/github/cmg777/expdpy/blob/main/notebooks/quickstart.ipynb"
    icon_pack: fab
    icon: google
  - name: "Streamlit App"
    url: "https://expdpy.streamlit.app/"
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

## expdpy — explore panel data interactively

**expdpy** is an exploratory data analysis toolkit for panel and cross-sectional data, built on modern Python tooling (Plotly, pyfixest, and Great Tables). It pairs composable analytical functions with two no-code web apps, and is a Python port of the ExPanDaR R package.

### Get started

- **[Quick Start notebook (Colab)](https://colab.research.google.com/github/cmg777/expdpy/blob/main/notebooks/quickstart.ipynb)** — run the package end to end in your browser, no installation required.
- **[Online app (Streamlit)](https://expdpy.streamlit.app/)** — explore the bundled datasets with no code.
- **[API Reference](https://cmg777.github.io/expdpy/reference/)** — full function-level documentation.

### What it does

- **Explore** — descriptive statistics, correlation matrices, extreme observations, histograms, time and quantile trends, grouped bar/violin charts, and scatter plots with optional LOESS smoothing.
- **Model** — multi-way fixed effects with clustered standard errors, publication-ready regression tables, Frisch–Waugh–Lovell partial-regression plots, and outlier treatment (winsorization/truncation).
- **Reproduce** — export any session as a Jupyter notebook, Python script, or prepared dataset, and carry configurations between the apps.

### A quick taste

```python
import expdpy as ex
from expdpy.data import load_kuznets

df = load_kuznets()  # synthetic 80-country panel
ex.prepare_scatter_plot(
    df, x="log_gdp_pc", y="gini_regional", color="continent", size="population", loess=1
).show()
```

### Two no-code apps

The same analyses are available in the browser through a multipage **Streamlit** app (deployable to the cloud) and a single-view **Shiny for Python** app — no coding required.

### Example data

expdpy ships with a synthetic **Kuznets** panel (80 countries, 2015–2025) for illustrating N-shaped inequality curves, plus the **Gapminder** dataset.

### Install

```bash
pip install "git+https://github.com/cmg777/expdpy.git"
```

expdpy is a Python port of the [ExPanDaR](https://github.com/joachim-gassen/ExPanDaR) R package by Joachim Gassen and the TRR 266 project; please cite the original work in research. Released under the MIT License.
