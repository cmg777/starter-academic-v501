---
date: "2026-07-02T00:00:00Z"
external_link: ""
image:
  caption: ""
  focal_point: Smart
summary: A Python library to explore, analyze, and learn regional growth, convergence, and inequality — with explicit spatial methods, interactive Plotly figures and publication-quality tables, plus three no-code Streamlit apps (Explore, Analyze, Learn).
tags:
- python
- spatial
- regional
title: "geometrics"

links:
  - name: "Website"
    url: "https://quarcs-lab.github.io/geometrics/"
    icon_pack: ai
    icon: open-data
  - name: "PyPI"
    url: "https://pypi.org/project/geometrics/"
    icon_pack: fab
    icon: python
  - name: "Quick Start (Colab)"
    url: "https://colab.research.google.com/github/quarcs-lab/geometrics/blob/main/notebooks/explore.ipynb"
    icon_pack: fab
    icon: google
  - name: "Explore app"
    url: "https://geometrics-explore.streamlit.app/"
    icon_pack: fas
    icon: laptop-code
  - name: "Analyze app"
    url: "https://geometrics-analyze.streamlit.app/"
    icon_pack: fas
    icon: laptop-code
  - name: "Learn app"
    url: "https://geometrics-learn.streamlit.app/"
    icon_pack: fas
    icon: laptop-code
  - name: "API Reference"
    url: "https://quarcs-lab.github.io/geometrics/reference/"
    icon_pack: fas
    icon: book
  - name: "GitHub"
    url: "https://github.com/quarcs-lab/geometrics"
    icon_pack: fab
    icon: github

url_pdf: ""
url_slides: ""
url_video: ""
---

**Regional growth, convergence, and inequality — spatially, in Python.**

`geometrics` builds on the [PySAL](https://pysal.org/) family and wraps the standard analyses of the regional-convergence literature into easy-to-apply functions that return interactive [Plotly](https://plotly.com/python/) figures, publication-quality [Great Tables](https://posit-dev.github.io/great-tables/), and tidy DataFrames. It pairs an **Explore / Analyze / Learn** workflow with a built-in **teaching layer** that interprets and explains every result, and **three no-code apps**. It is built for students, teachers and applied researchers alike.

### 🗺️ [Explore](https://quarcs-lab.github.io/geometrics/explore.html)

Map and describe your regions: classified and animated choropleths, spatial-weights connectivity, **Moran scatterplots and LISA cluster maps**, and space-time views.

[🚀 Launch app](https://geometrics-explore.streamlit.app/) · [▶ Open in Colab](https://colab.research.google.com/github/quarcs-lab/geometrics/blob/main/notebooks/explore.ipynb)

### 🧮 [Analyze](https://quarcs-lab.github.io/geometrics/analyze.html)

Estimate the models: **β-, σ- and club convergence**, spatial econometric models with impacts, Markov and spatial-Markov dynamics, **Gini/Theil inequality** with spatial decomposition, and GWR / multiscale GWR.

[🚀 Launch app](https://geometrics-analyze.streamlit.app/) · [▶ Open in Colab](https://colab.research.google.com/github/quarcs-lab/geometrics/blob/main/notebooks/analyze.ipynb)

### 📚 [Learn](https://quarcs-lab.github.io/geometrics/learn.html)

See the ideas behind the methods: **11 runnable concept sandboxes** where you tune a known truth, a **30-topic** explainer index, and a plain-language reading on every result.

[🚀 Launch app](https://geometrics-learn.streamlit.app/) · [▶ Open in Colab](https://colab.research.google.com/github/quarcs-lab/geometrics/blob/main/notebooks/learn.ipynb)

## Try the apps in your browser

No install, no code — the three `geometrics` apps run the whole workflow in your browser: point-and-click maps and models, sortable tables, and reproducible exports. Each is the no-code companion to a docs case study.

[🗺️ Explore app](https://geometrics-explore.streamlit.app/) · [🧮 Analyze app](https://geometrics-analyze.streamlit.app/) · [📚 Learn app](https://geometrics-learn.streamlit.app/)

## What's inside

**Maps & ESDA** — classified / animated choropleths, spatial-weights connectivity, Moran scatterplots, LISA cluster maps, and Moran's I over time.

**Space-time dynamics** — cross-sectional distribution evolution and entity-by-time heatmaps.

**Convergence** — β-convergence with OLS or spatial estimators, σ-convergence, and Phillips–Sul convergence clubs with club maps.

**Spatial econometrics** — the `spreg` suite, LM diagnostics with model recommendation, and alternative-weights robustness.

**Distribution dynamics** — Markov and spatial-Markov transition analysis.

**Inequality** — Gini / Theil trends with spatial decomposition, and Theil between/within decomposition.

**Local models** — GWR and multiscale GWR with mapped local coefficients.

**Concept sandboxes** — 11 teaching functions that simulate data from known data-generating processes.

## Bundled case studies

`geometrics.data` ships two ready-to-analyze case studies:

- **India** — 520 districts, satellite nighttime lights (1996–2010): `gm.data.load_india()`, `load_india_states()`.
- **Bolivia** — PWT-anchored local GDP (2021 PPP US\\$, 2012–2022) at three geographic scales: `gm.data.load_bolivia()` (112 provinces), `load_bolivia_departments()` (9 departments), and `load_bolivia_grid()` (1,603 cells).

## Installation

Install the latest release from PyPI (the core install covers most workflows; extras add the Markov dynamics, the no-code apps, and PNG export):

```bash
pip install geometrics                 # core
pip install "geometrics[dynamics]"     # + Markov / spatial Markov (giddy)
pip install "geometrics[streamlit]"    # + the three no-code apps
pip install "geometrics[all]"          # everything, incl. PNG export
```

Requires Python 3.11+.

## At a glance

Load a bundled case study, attach its variable labels, and map it — every figure is an interactive Plotly object:

```python
import geometrics as gm

# India — 520 districts, satellite nighttime lights (1996–2010)
gdf, df, df_dict = gm.data.load_india()
df = gm.set_labels(df, df_dict, set_panel=True)

# A classified choropleth of nighttime lights in 2010
gm.explore_choropleth_map(df, "ntl_total", gdf=gdf, period=2010).fig
```

**Estimate convergence and let it explain itself** — β- and σ-convergence, each with a plain-language reading:

```python
beta = gm.analyze_beta_convergence(df, "ntl_total", model="ols")
print(beta.interpret())          # plain-language, associational reading

sigma = gm.analyze_sigma_convergence(df, "ntl_total")
```

**Learn as you go** — concept sandboxes and explainers:

```python
gm.learn_beta_convergence(convergence_rate=0.02)  # a runnable concept sandbox
print(gm.explain("spatial_autocorrelation"))      # a concept explainer; gm.list_topics() lists all 30
```

Head to [Explore](https://quarcs-lab.github.io/geometrics/explore.html), [Analyze](https://quarcs-lab.github.io/geometrics/analyze.html) and [Learn](https://quarcs-lab.github.io/geometrics/learn.html) to see every function in action.

## Built on

`geometrics` stands on the [PySAL](https://pysal.org/) spatial-analysis ecosystem and the modern Python data stack:

- **[PySAL](https://pysal.org/)** — `libpysal` (weights), `esda` (Moran's I / LISA), `giddy` (distribution dynamics), `inequality` (Gini / Theil), `mapclassify` (choropleth classification), `spreg` (spatial regression), and `mgwr` (multiscale GWR)
- **[geopandas](https://geopandas.org/)** — geospatial dataframes
- **[Plotly](https://plotly.com/python/)** — interactive figures
- **[Great Tables](https://posit-dev.github.io/great-tables/)** — publication-quality tables

## Acknowledgement

`geometrics` is developed at the [QuaRCS Lab](https://quarcs-lab.org) (Quantitative Regional and Computational Science) and stands on the shoulders of the [PySAL](https://pysal.org/) project, geopandas, Plotly and Great Tables. If you use `geometrics` in your research, please cite the repository (see [`CITATION.cff`](https://github.com/quarcs-lab/geometrics/blob/main/CITATION.cff)) and the underlying PySAL packages.
