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
    url: "https://quarcs-lab.github.io/geo4bolivia/"
    icon_pack: ai
    icon: open-data
url_code: "https://github.com/quarcs-lab/geo4bolivia"
url_pdf: ""
url_slides: ""
url_video: ""
---

The **GeoDevelopment Observatory of Bolivia (GDO-Bolivia)** brings together public-access data, analysis tools, and research insights to monitor subnational development at multiple geographic scales. It connects indicators from satellite imagery, censuses, and administrative records with reproducible workflows for researchers, decision-makers, and the public.

## Explore the data

The observatory links geographic units through common identifiers, allowing data to be connected and aggregated across scales, including municipalities, provinces, and departments. Available coverage depends on the dataset; each page documents its variables, sources, reference years, and licensing conditions.

| Collection | Current coverage |
|---|---|
| [Sustainable Development Goal indicators](https://quarcs-lab.github.io/geo4bolivia/indicators/municipalities339-sdg/) | 64 indicators with different reference years spanning 2010–2020; each is stored at its own reference year, rather than as a complete annual series. |
| [Night-time lights per capita](https://quarcs-lab.github.io/geo4bolivia/indicators/municipalities339-ntl/) | 2012–2020; a satellite-based proxy for local economic activity. |
| [Population](https://quarcs-lab.github.io/geo4bolivia/indicators/municipalities339-pop/) | Gridded population estimates and density, 2001–2020. |
| [Satellite embeddings](https://quarcs-lab.github.io/geo4bolivia/indicators/municipalities339-emb/) | 64 satellite-derived features for 2017, with area-weighted and population-weighted versions. |

Coverage varies by collection and variable. Check the documentation before comparing years or combining indicators. The maps are for statistical and informational use; they do not define official territorial boundaries.

## Start an analysis

The [geo4bolivia quickstart](https://quarcs-lab.github.io/geo4bolivia/tools/geo4bolivia-quickstart/) shows how to load data, link a table to the common geographic identifiers, and aggregate indicators across scales. The [tools collection](https://quarcs-lab.github.io/geo4bolivia/#tools) includes Python packages, Google Colab notebooks, and an interactive web app, with examples covering poverty, spatial inequality, and machine learning.

For a research-oriented introduction, explore the [human capital insight](https://quarcs-lab.github.io/geo4bolivia/insights/human-capital-paper/). To ask a question, suggest an indicator, or share an analysis, join the [GitHub Discussions](https://github.com/quarcs-lab/geo4bolivia/discussions).

## Cite the observatory

> Mendez, C. (2026). *GeoDevelopment Observatory of Bolivia*. https://quarcs-lab.github.io/geo4bolivia/

When using a specific dataset, also cite that dataset and its original sources as indicated on its page.

*Hero image: screenshot of GDO-Bolivia’s Santa Cruz view. Satellite imagery: Sentinel-2 cloudless 2016 by EOX IT Services GmbH (modified Copernicus Sentinel data, CC BY 4.0), over NASA Blue Marble.*
