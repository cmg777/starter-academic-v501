---
date: "2026-11-20T00:00:00Z"
external_link: ""
image:
  caption: ""
  focal_point: Smart
summary: "How has development changed across Bolivia’s municipalities, and where does it cluster? geo4bolivia loads the observatory’s data in one line and answers with maps and spatial analyses in Python."
tags:
- python
- spatial
- regional
title: "geo4bolivia"

links:
  - name: "Website"
    url: "https://quarcs-lab.github.io/geo4bolivia/"
    icon_pack: ai
    icon: open-data
  - name: "PyPI"
    url: "https://pypi.org/project/geo4bolivia/"
    icon_pack: fab
    icon: python
  - name: "Quick Start (Colab)"
    url: "https://colab.research.google.com/github/quarcs-lab/geo4bolivia/blob/main/notebooks/get-started.ipynb"
    icon_pack: fab
    icon: google
  - name: "API Reference"
    url: "https://quarcs-lab.github.io/geo4bolivia/reference/"
    icon_pack: fas
    icon: book
  - name: "Observatory"
    url: "https://quarcs-lab.github.io/gdo4bolivia/"
    icon_pack: fas
    icon: globe-americas
  - name: "GitHub"
    url: "https://github.com/quarcs-lab/geo4bolivia"
    icon_pack: fab
    icon: github

url_pdf: ""
url_slides: ""
url_video: ""
---

**Bolivia’s subnational data and the fundamental analyses of spatial data science — in one Python package.**

`geo4bolivia` is the Python package of the [GeoDevelopment Observatory of Bolivia](/data/gdo-bolivia/). It finds variables across every dataset of the observatory and explains them (sources, licenses, actual years, how to cite them), loads any indicator in one line as a tidy panel with unit names and boundaries, and moves it across municipalities, provinces and departments with each variable’s own rule. It then runs the fundamental analyses in one call each. Every analysis returns an interactive [Plotly](https://plotly.com/python/) figure, a table, and a reading of the result in plain words.

## What's inside

**[Explore](https://quarcs-lab.github.io/geo4bolivia/explore.html)**: correlations, extremes, distributions, scatter plots and trends, and classed maps of one or several periods or of their change.

**[Spatial dependence](https://quarcs-lab.github.io/geo4bolivia/articles/spatial-dependence.html)**: spatial weights, Moran’s I and LISA cluster maps.

**[Convergence](https://quarcs-lab.github.io/geo4bolivia/articles/convergence.html)**: β-convergence (OLS or spatial models), σ-convergence and convergence clubs.

**[Transitions and mobility](https://quarcs-lab.github.io/geo4bolivia/articles/transitions.html)**: Markov and spatial Markov chains, LISA transitions and rank mobility.

**[Regional inequality](https://quarcs-lab.github.io/geo4bolivia/articles/inequality.html)**: Gini and Theil indices, and the Theil decomposition between and within groups.

**[Models](https://quarcs-lab.github.io/geo4bolivia/articles/models.html)**: regression with fixed effects, panel models, spatial diagnostics and spatial models with direct and indirect impacts.

**[Spatial heterogeneity](https://quarcs-lab.github.io/geo4bolivia/articles/heterogeneity.html)**: multiscale geographically weighted regression (MGWR).

**[Your own indicators](https://quarcs-lab.github.io/geo4bolivia/articles/own-indicators.html)**: link your tables by municipal codes, summarise rasters by unit, aggregate and save in the observatory’s format.

## Installation

Install the latest release from PyPI (Python 3.11+):

```bash
pip install geo4bolivia                 # data, maps and the core analyses
pip install "geo4bolivia[dynamics]"     # + Markov transitions (giddy)
pip install "geo4bolivia[panel]"        # + panel models (linearmodels)
pip install "geo4bolivia[mgwr]"         # + multiscale GWR
pip install "geo4bolivia[all]"          # everything, incl. raster zonal statistics
```

## At a glance

```python
!pip install -q geo4bolivia
import geo4bolivia as geo

# Multidimensional poverty in Bolivia's 343 municipalities, ~2012 and ~2024
mpi = geo.load("sdg01", variables="sdg1_2_mpi")

res = geo.lisa(mpi, "sdg1_2_mpi", year=2024)   # where poverty clusters
print(res.interpret())
res.fig
```

The [get-started guide](https://quarcs-lab.github.io/geo4bolivia/get-started.html), the [articles](https://quarcs-lab.github.io/geo4bolivia/articles/) and the [function reference](https://quarcs-lab.github.io/geo4bolivia/reference/) show every function at work on Bolivia’s data, each with a Colab notebook. An [LLM page](https://quarcs-lab.github.io/geo4bolivia/use-with-llms.html) and `llms.txt` help AI assistants write correct code with the package.

## Acknowledgement

`geo4bolivia` is developed at the [QuaRCS Lab](https://quarcs-lab.org). Its analyses are adapted from its sister packages, [geometrics](/software/geometrics/) and [expdpy](/software/expdpy/), which remain the companions for specialised methods, and build on [PySAL](https://pysal.org/), geopandas, statsmodels, Plotly and Great Tables. The data of the SDG Atlas of Bolivia 2026 and the municipal boundaries are from SDSN Bolivia, used with permission.
