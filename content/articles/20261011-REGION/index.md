---
title: "Regional growth, convergence, and spatial spillovers in India: A reproducible view from outer space"
authors:
- admin
- Sujana Kabiraj
- Jiaqi Li
date: "2026-10-11T00:00:00Z"
publishDate: "2026-10-11T00:00:00Z"
doi: "10.18335/region.v13i2.676"
publication_types: ["2"]
publication: "*REGION*, 13(2), 173–196"
publication_short: "REGION"
abstract: "Using satellite nighttime light data as a proxy for economic activity, Chanda and Kabiraj (2020, World Development) studied regional growth and convergence across 520 districts in India. Adopting a reproducible open-science approach, this article builds on their work by extending their main findings on three empirical fronts. First, we illustrate regional convergence patterns using an interactive tool for satellite imagery visualization. Second, we assess the degree of spatial dependence in their main econometric specification. Third, we employ a spatial Durbin model to measure the role of spatial spillovers in the convergence process. Our results indicate that spatial spillovers increase the estimated speed of regional convergence. In our fully specified model, spillovers raise the convergence speed from about 3.0% to about 5.2% per year, which shortens the half-life of regional disparities from roughly 23 to 13 years. We close by illustrating how the same reproducible workflow extends beyond economic output, with an exploratory analysis of how luminosity relates to cultural participation across Indian states."
summary: "Satellite nighttime lights reveal how poorer districts in India catch up. Accounting for connections between neighboring districts raises the estimated pace of catch-up and shortens the time needed to close half the gap from about 23 to 13 years."
tags:
- Regional convergence
- Spatial dependence
- Spatial Durbin model
- Nighttime lights
- Reproducible research
- India
featured: true
links:
- name: "AI Video"
  url: "https://youtu.be/9GmT_xPkaQQ"
  icon_pack: fab
  icon: youtube
- name: "AI Podcast"
  url: "https://open.spotify.com/episode/4tZtxdevtotJsNf7pjjfTW"
  icon_pack: fas
  icon: headphones
- name: "Published article (Open Access)"
  url: "https://doi.org/10.18335/region.v13i2.676"
  icon_pack: fas
  icon: university
- name: "Interactive luminosity map"
  url: "https://carlos-mendez.projects.earthengine.app/view/rc-dmsp-ntl"
  icon_pack: fas
  icon: globe
- name: "Online article & notebooks"
  url: "https://quarcs-lab.github.io/project2025s-py/index-preview.html"
  icon_pack: fas
  icon: book-open
url_pdf: "https://openjournals.wu.ac.at/ojs/index.php/region/article/download/676/542"
url_code: "https://github.com/quarcs-lab/project2025s-py"
url_dataset: ""
url_preprint: ""
url_slides: "https://carlos-mendez.org/articles/20261011-region/slides/index.html"
url_video: ""
url_poster: ""
url_project: ""
image:
  caption: ""
  alt_text: "How fast is India catching up? The published maps compare nighttime luminosity in 1996 and 2010. For 520 districts, Model 4 estimates annual convergence of 3.0% with ordinary least squares and 5.2% with a spatial Durbin model, with implied half-lives of 23 and 13 years. Faster estimated catch-up when spillovers are included; these are model estimates, not causal policy effects."
  focal_point: ""
  preview_only: false
---

## The question

Are poorer districts catching up with richer ones, and does the answer change when neighboring districts are connected? This article revisits growth across **520 Indian districts during 1996–2010**, using satellite nighttime lights per person as a proxy for economic activity. It extends Chanda and Kabiraj (2020) through interactive visualization, tests of spatial dependence, and spatial spillover modeling.

## What changes when neighbors enter the model?

The preferred specification includes control variables and state fixed effects. Comparing ordinary least squares with the **total effects of a spatial Durbin model** changes the implied pace of convergence:

| Model 4 estimate | Ordinary least squares | Spatial Durbin model |
| :--- | ---: | ---: |
| Annual convergence speed | 3.0% | 5.2% |
| Implied half-life of the gap | 23 years | 13 years |

These rounded values are reported in **Table 3, page 184** of the published paper. Half-life means the time needed to close half the initial gap to the steady state under the model. It does not mean that every district reaches the same income level after 13 years.

The spatial model captures both local and neighboring associations. Robustness checks compare the baseline six-nearest-neighbor specification with six alternative spatial weight matrices: the direct and total convergence effects remain negative and statistically significant across all seven specifications (Table 4).

## What the evidence can tell us

Spatial connections matter for how convergence is measured. The analysis does **not** identify the causal effect of changing one district's conditions on another district's growth. Shared geography, institutions, infrastructure, omitted variables, and light spilling across district boundaries can all contribute to spatial dependence. The estimates also summarize a single 14-year growth period rather than changes year by year.

A final exploratory analysis relates luminosity to cultural participation across Indian states. It illustrates how the reproducible workflow can be used beyond economic output; nighttime lights also reflect electrification and urbanization.

## Learn by reproducing the analysis

The [online article and learning materials](https://quarcs-lab.github.io/project2025s-py/) connect each result to its source. Five analytical Python notebooks run in Google Colaboratory; the first notebook provides the interactive visualization and its Google Earth Engine script.

1. [**N1: View from outer space**](https://quarcs-lab.github.io/project2025s-py/notebooks/c01_view_from_space-preview.html) — Explore nighttime lights with Google Earth Engine.
2. [**N2: Regional convergence**](https://quarcs-lab.github.io/project2025s-py/notebooks/c02_regional_convergence_sc-preview.html) — Estimate catch-up, convergence speed, and half-life.
3. [**N3: Spatial dependence**](https://quarcs-lab.github.io/project2025s-py/notebooks/c03_spatial_dependence_lisa-preview.html) — Build spatial weights and examine Moran’s I and local clusters.
4. [**N4: Spillover modeling**](https://quarcs-lab.github.io/project2025s-py/notebooks/c04_spillover_modeling_6nn-preview.html) — Compare ordinary least squares and spatial Durbin models, including direct, indirect, and total effects.
5. [**N5: Robustness**](https://quarcs-lab.github.io/project2025s-py/notebooks/c07_alternative_w_matrices-preview.html) — Check the preferred model using alternative spatial weight matrices.
6. [**N6: Spatial culture**](https://quarcs-lab.github.io/project2025s-py/notebooks/c06_spatial_culture-preview.html) — Explore luminosity and cultural participation across Indian states.

The [GitHub repository](https://github.com/quarcs-lab/project2025s-py) contains the notebooks, data, and manuscript source. The [interactive luminosity map](https://carlos-mendez.projects.earthengine.app/view/rc-dmsp-ntl) lets you explore the satellite imagery directly.

## Publication and image sources

Carlos Mendez, Sujana Kabiraj, and Jiaqi Li (2026). “Regional growth, convergence, and spatial spillovers in India: A reproducible view from outer space.” *REGION*, **13**(2), 173–196. Published October 11, 2026. [DOI: 10.18335/region.v13i2.676](https://doi.org/10.18335/region.v13i2.676).

The infographic reproduces the authors' [Figure 1 luminosity map](https://quarcs-lab.github.io/project2025s-py/images/luminosity_map.png) and plots the reported Model 4 values from Table 3. The map retains its original colors, geography, and scale; the surrounding layout and comparison chart are new. Article and source map: Mendez, Kabiraj, and Li (2026), [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).
