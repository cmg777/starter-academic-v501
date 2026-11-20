---
data_type: portal
region: bolivia
date: "2026-10-29T00:00:00Z"
external_link: ""
image:
  caption: ""
  focal_point: Center
summary: An observatory of subnational development for monitoring Bolivia’s regions at multiple geographic scales, with open data, analysis tools, and research insights.
tags:
- spatial
- python
- regional
title: GeoDevelopment Observatory of Bolivia
links:
  - name: "Website"
    url: "https://quarcs-lab.github.io/gdo4bolivia/"
    icon_pack: ai
    icon: open-data
  - name: "Package docs"
    url: "https://quarcs-lab.github.io/geo4bolivia/"
    icon_pack: fas
    icon: book
url_code: "https://github.com/quarcs-lab/gdo4bolivia"
url_pdf: ""
url_slides: ""
url_video: ""
---

The **GeoDevelopment Observatory of Bolivia (GDO-Bolivia)** brings together public-access data, analysis tools, and research insights to monitor subnational development at multiple geographic scales. It connects indicators from satellite imagery, censuses, and administrative records with reproducible workflows for researchers, decision-makers, and the public.

## Explore the data

The observatory links geographic units through common identifiers, allowing data to be connected and aggregated across scales: municipalities, provinces, and departments. Its municipal map is SDSN Bolivia's map of 2025, with 343 municipalities and indigenous autonomies. Available coverage depends on the dataset; each page documents its variables, sources, reference years, and licensing conditions.

| Collection | Current coverage |
|---|---|
| [Sustainable Development Index and SDG goals](https://quarcs-lab.github.io/gdo4bolivia/indicators/municipalities343-sdg/) | The SDG Atlas of Bolivia 2026 (SDSN Bolivia): the Sustainable Development Index and its ranking, plus one dataset per goal (15 goals, 81 indicators), for all 343 municipalities in two periods, near 2012 and near 2024. |
| [Night-time lights per capita](https://quarcs-lab.github.io/gdo4bolivia/indicators/municipalities343-ntl/) | 2012–2020 for 333 municipalities; a satellite-based proxy for local economic activity. |
| [Population](https://quarcs-lab.github.io/gdo4bolivia/indicators/municipalities343-pop/) | Gridded population estimates and density, 2001–2020, for 333 municipalities. |
| [Satellite embeddings](https://quarcs-lab.github.io/gdo4bolivia/indicators/municipalities343-emb/) | 64 satellite-derived features for 2017, with area-weighted and population-weighted versions, for 333 municipalities. |

Coverage varies by collection and variable. Check the documentation before comparing years or combining indicators. The maps are for statistical and informational use; they do not define official territorial boundaries.

## Start an analysis

The Python package [geo4bolivia](https://quarcs-lab.github.io/geo4bolivia/) loads any indicator in one line, moves it across scales, and runs the fundamental analyses of spatial data science in one call each: maps, spatial clustering (Moran's I and LISA), convergence, transitions and mobility, inequality, regression and spatial models, and multiscale geographically weighted regression. Its [documentation](https://quarcs-lab.github.io/geo4bolivia/) has a [get-started guide](https://quarcs-lab.github.io/geo4bolivia/get-started.html), an article for each method worked through on Bolivia's data, and a [function reference](https://quarcs-lab.github.io/geo4bolivia/reference/) with an example for every function.

On the observatory, the [geo4bolivia quickstart](https://quarcs-lab.github.io/gdo4bolivia/tools/geo4bolivia-quickstart/) is a ready-to-run notebook, and the [tools collection](https://quarcs-lab.github.io/gdo4bolivia/#tools) includes Python packages, Google Colab notebooks, and an interactive web app, with examples covering poverty, spatial inequality, sustainable development, and machine learning.

For a research-oriented introduction, explore the [human capital insight](https://quarcs-lab.github.io/gdo4bolivia/insights/human-capital-paper/). To ask a question, suggest an indicator, or share an analysis, join the [GitHub Discussions](https://github.com/quarcs-lab/gdo4bolivia/discussions).

## Cite the observatory

> Mendez, C. (2026). *GeoDevelopment Observatory of Bolivia*. https://quarcs-lab.github.io/gdo4bolivia/

When using a specific dataset, also cite that dataset and its original sources as indicated on its page.

*Hero image: screenshot of GDO-Bolivia’s Santa Cruz view. Satellite imagery: Sentinel-2 cloudless 2016 by EOX IT Services GmbH (modified Copernicus Sentinel data, CC BY 4.0), over NASA Blue Marble.*
