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

**Explore, analyze and learn panel data — interactively, in Python.**

`expdpy` pairs composable functions that return interactive [Plotly](https://plotly.com/python/) figures and publication-quality [Great Tables](https://posit-dev.github.io/great-tables/) with **fixest-style econometrics**, a built-in **teaching layer** that interprets and explains every result, and **three no-code apps**. It is built for students, teachers and applied researchers alike.

### 🔍 [Explore](https://cmg777.github.io/expdpy/explore.html)

Describe and visualize your panel: tables, distributions, missing-value maps, time trends, group comparisons, scatter plots, **within/between variation** and **panel dynamics**.

[🚀 Launch app](https://expdpy-explore.streamlit.app/) · [▶ Open in Colab](https://colab.research.google.com/github/cmg777/expdpy/blob/main/notebooks/explore.ipynb)

### 🧮 [Analyze](https://cmg777.github.io/expdpy/analyze.html)

Estimate models: fixed / random / **correlated random effects**, FWL, the Hausman test, robust inference, **event-study / DiD**, **β/σ/club convergence** and the **Kuznets-waves** curve.

[🚀 Launch app](https://expdpy-analyze.streamlit.app/) · [▶ Open in Colab](https://colab.research.google.com/github/cmg777/expdpy/blob/main/notebooks/analyze.ipynb)

### 📚 [Learn](https://cmg777.github.io/expdpy/learn.html)

See the ideas behind the methods: **9 runnable concept sandboxes** where you tune a known truth, a **27-topic** explainer index, and a plain-language reading on every result.

[🚀 Launch app](https://expdpy-learn.streamlit.app/) · [▶ Open in Colab](https://colab.research.google.com/github/cmg777/expdpy/blob/main/notebooks/learn.ipynb)

## Try the apps in your browser

No install, no code — the three `ExPdPy` apps run the whole workflow in your browser: a sample pipeline, point-and-click analysis, sortable tables, and reproducible notebook export. Each is the no-code companion to a docs case study.

[🔍 Explore app](https://expdpy-explore.streamlit.app/) · [🧮 Analyze app](https://expdpy-analyze.streamlit.app/) · [📚 Learn app](https://expdpy-learn.streamlit.app/)

## What's inside

**Explore** — descriptive / correlation / extreme-observation tables, histograms and bar charts, time and quantile trends, by-group bar / violin / trend views, a missing-value heatmap, scatter plots with an optional LOESS smoother, the within/between (`xtsum`) decomposition, per-unit trajectories, panel-structure diagnostics, distribution & transition dynamics, and `treat_outliers`.

**Analyze** — OLS with **multi-way fixed effects** and **clustered standard errors** via [pyfixest](https://github.com/py-econometrics/pyfixest); a richer `analyze_estimation` (stepwise / multiple-outcome, Newey–West & Driscoll–Kraay SEs); **pooled / between / fixed / random effects** and the **correlated-random-effects (Mundlak)** estimator; the **Hausman test**; post-estimation (fixed-effect plots, predictions, Wald joint tests); **robust inference** (randomization inference, wild cluster bootstrap); **Frisch–Waugh–Lovell** and **coefficient** plots; modern **event-study / staggered difference-in-differences** (`did2s`, Sun–Abraham, LP-DiD, dynamic TWFE); **β-, σ- and club convergence**; and the **Kuznets-waves** curve under pooled / between / within estimators.

**Learn** — every result speaks plain language: `.interpret()` gives an **associational** reading (never a causal claim unless the design supports it) and `.explain()` / `explain(topic)` / `list_topics()` browse **27** concept explainers. **Nine concept sandboxes** simulate data so you can *see* and tune a known truth — the first-differences ≈ demeaning ≈ dummies identity, fixed effects, clustering, omitted-variable bias, β/σ/club convergence, and the Kuznets wave.

**Bundled datasets** — `expdpy.data` ships ready-to-explore panels: **`kuznets`** (the flagship N-shaped Kuznets-curve demo), `gapminder`, **`staggered_did`** (event-study / DiD), **`productivity`** and **`bolivia112_gdppc`** (convergence). See the [kuznets dataset](https://cmg777.github.io/expdpy/explanation/kuznets-dataset.html) page for the data dictionary.

## Installation

Install the latest release from PyPI (random effects, CRE and the Hausman test work out of the box; the apps need the `streamlit` extra):

```bash
pip install expdpy
pip install "expdpy[streamlit]"   # the no-code ExPdPy apps (Streamlit)
```

Using [uv](https://docs.astral.sh/uv/):

```bash
uv pip install expdpy
uv pip install "expdpy[streamlit]"
```

For the latest unreleased version, install straight from the `main` branch:

```bash
pip install "git+https://github.com/cmg777/expdpy.git"
```

Requires Python 3.10+.

## At a glance

The lead example throughout these docs is the bundled `kuznets` panel (80 countries × 2015–2025): a synthetic dataset whose regional inequality traces an **N-shaped Kuznets curve** in income — rising, falling, then rising again at very high income.

```python
import expdpy as ex
from expdpy.data import load_kuznets

df = load_kuznets()
# The N-shaped regional Kuznets curve: regional inequality vs (log) GDP per capita
ex.explore_scatter_plot(
    df, x="log_gdp_pc", y="gini_regional", color="continent", size="population", loess=1
).fig
```

**Run a regression and let it explain itself** — two-way fixed effects, clustered standard errors, a plain-language reading, and a coefficient plot:

```python
res = ex.analyze_regression_table(
    df,
    dvs="gini_regional",
    idvs=["log_gdp_pc", "log_gdp_pc_sq", "log_gdp_pc_cu"],
    feffects=["country", "year"],
    clusters=["country"],
)
print(res.interpret())            # plain-language, associational reading
ex.analyze_coefficient_plot(res)  # themed coefficient plot with confidence intervals
```

**Learn as you go** — concept sandboxes and explainers:

```python
ex.learn_first_differences()        # first differences ≈ demeaning ≈ dummy variables
print(ex.explain("fixed_effects"))  # a concept explainer; ex.list_topics() lists all 27
```

Head to [Explore](https://cmg777.github.io/expdpy/explore.html), [Analyze](https://cmg777.github.io/expdpy/analyze.html) and [Learn](https://cmg777.github.io/expdpy/learn.html) to see every function in action, or the [kuznets dataset](https://cmg777.github.io/expdpy/explanation/kuznets-dataset.html) page for the data dictionary.

## Built on

`expdpy` stands on the modern Python data and econometrics stack:

- **[Plotly](https://plotly.com/python/)** — interactive figures
- **[pyfixest](https://github.com/py-econometrics/pyfixest)** — fixed-effects and difference-in-differences estimators
- **[Great Tables](https://posit-dev.github.io/great-tables/)** — publication-quality tables
- **[linearmodels](https://bashtage.github.io/linearmodels/)** — random / between / correlated random effects and the Hausman test
- **[Streamlit](https://streamlit.io/)** — the no-code `ExPdPy` apps

## Acknowledgement

expdpy began as a Python port of the excellent [ExPanDaR](https://github.com/trr266/ExPanDaR) R package by **Joachim Gassen** and the **TRR 266 Accounting for Transparency** project, and its foundations remain deeply inspired by that work. Over time, expdpy has grown well beyond the original — fixest-style estimators, event-study / difference-in-differences tools, random- and correlated-random-effects panel models, convergence analysis, and a built-in teaching layer that interprets and explains results — and it will keep evolving.

We are grateful to the ExPanDaR authors. Please cite the original work when using `expdpy` in research (see [`CITATION.cff`](https://github.com/cmg777/expdpy/blob/main/CITATION.cff)).
