---
title: "Bayesian average of classical estimates for panel data: Can the puzzle of the shape of the regional Kuznets curve be solved?"
authors:
- Ramirez-Hassan Andres
- admin
- Rueda-Ramirez Estephania


date: "2025-06-05T00:00:00Z"
doi: "10.1080/00036846.2024.2439583"

# Schedule page publish date (NOT publication's date).
publishDate: "2025-06-05T00:00:00Z"

# Publication type.
# Legend: 0 = Uncategorized; 1 = Conference paper; 2 = Journal article;
# 3 = Preprint / Working Paper; 4 = Report; 5 = Book; 6 = Book section;
# 7 = Thesis; 8 = Patent
publication_types: ["2"]

# Publication name and optional abbreviated publication name.
publication: "*Empirical Economics*"
publication_short: ""

abstract: "We evaluate the robustness of the regional Kuznets curve using the Bayesian average of classical estimates for panel data and identify the robust determinants of regional inequality. Our simulation exercise suggests that this method recovers the variables underlying the true data generating process. Our results indicate that in addition to real GDP per capita, linear and quadratic, the most robust determinants of regional inequality are natural resource rents, arable land and ethnic inequality. We ﬁnd an inverted-U-shaped relationship between regional inequality and national development in the range of USD 189 to USD 71,682. Beyond this threshold, there is evidence suggesting inequality stabilization."

# Summary. An optional shortened abstract.
summary: "We study the robust determinants of regional inequality using a Bayesian average of classical estimates for panel data."

tags:
- nighttime lights
- Kuznets curve
- regional inequality
- subnational GDP
- Bayesian model avaraging 


featured: true

# Icons: https://fontawesome.com/search

links:
#  - name: "AI Video"
#    url: "https://youtu.be/srNtOUf_e_w?si=ccLDJ7WWtafc6Gag"
#    icon_pack: fab
#    icon: youtube
  - name: "AI Podcast"
    url: "https://youtu.be/K1yj-Aw2Vlg"
    icon_pack: fas
    icon: headphones
  - name: "AI Mindmap"
    url: "https://mapify.so/share-link/yhlCs1IOO2"
    icon_pack: fas
    icon: brain
#  - name: "Slides"
#    url: "https://carlos-mendez.my.canva.site/project2022p-india-ntl-images-geo-notebook-for-processing-and-exploration"
#    icon_pack: fas
#    icon: tv
#  - name: "Colab notebook"
#    url: "https://bit.ly/project2022p"
#    icon_pack: ai
#    icon: open-data
  - name: "Published article (Open Access)"
    url: "https://doi.org/10.1007/s00181-025-02755-8"
    icon_pack: fas
    icon: university
#url_pdf: 'https://openjournals.wu.ac.at/ojs/index.php/region/article/view/493/457'
#url_preprint: "https://bit.ly/project2022p"
#url_code: 'https://bit.ly/project2022p'
#url_dataset: 'https://bit.ly/project2022p'
url_poster: ''
url_project: ''
#url_slides: 'https://carlos-mendez.my.canva.site/project2022p-india-ntl-images-geo-notebook-for-processing-and-exploration'
#url_source: 'https://openjournals.wu.ac.at/ojs/index.php/region/article/view/493'
#url_video: 'https://youtu.be/srNtOUf_e_w?si=ccLDJ7WWtafc6Gag'



# Featured image
# To use, add an image named `featured.jpg/png` to your page's folder.
image:
  caption: ''
  focal_point: ""
  preview_only: false

# Associated Projects (optional).
#   Associate this publication with one or more of your projects.
#   Simply enter your project's folder or file name without extension.
#   E.g. `internal-project` references `content/project/internal-project/index.md`.
#   Otherwise, set `projects: []`.
#projects: [convergence, clusters]

# Slides (optional).
#   Associate this publication with Markdown slides.
#   Simply enter your slide deck's filename without extension.
#   E.g. `slides: "example"` references `content/slides/example/index.md`.
#   Otherwise, set `slides: ""`.
# slides: example
---

<iframe width="560" height="315" src="https://www.youtube.com/embed/K1yj-Aw2Vlg?si=iMlgTPuVHk9twxPQ" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

## 🗺️ Motivation

* Regional inequality shapes social cohesion, migration & political stability
* Kuznets (1955): inverted-U link between development & inequality
* Recent evidence hints at more complex (N-shaped) patterns
* Need robust econometric tools to settle the “shape” debate

---

## 📚 Literature Snapshot

* Inverted-U support: List & Gallet (1999); Thornton (2001)
* Mixed / non-U evidence: Tam (2008); Huang (2012)
* N-shape claim: Lessmann (2014); Lessmann & Seidel (2017)
* Gap: model uncertainty rarely addressed explicitly

---

## 🎯 Research Goals

* Extend Bayesian Averaging of Classical Estimates (BACE) to panel fixed-effects
* Test the robustness of Kuznets curve shape under model uncertainty
* Identify determinants that consistently drive regional inequality

---

## 🛠️ Methodology Highlights

* **Search space:** 14 candidate regressors → 2¹⁴ = **16 384** models, each estimated with two-way (country + period) fixed effects.
* **Robustness sweep:** Allowing four fixed-effects options (none, time, country, two-way) expands the universe to **65 536** models; posterior model probabilities (PMPs) concentrate entirely on the two-way specification.
* **Bayesian Averaging of Classical Estimates (BACE):**

  * Retains simple FE-OLS for every model—no heavy MCMC.
  * Translates each model’s BIC into an approximate marginal likelihood.
  * Uses a uniform prior so PMPs sum to 1, then forms **probability-weighted averages** for all coefficients, predictions, and derivatives.
* **Variable screening:** Posterior Inclusion Probability (PIP) highlights robust determinants—“substantial evidence” at PIP ≥ 0.75, “strong” at PIP ≥ 0.90.
* **Curve peaks:** Inequality turning points come from the BACE-weighted derivative of the cubic GDP polynomial, with analytic standard errors for credible bands.
* **Validation:** Monte-Carlo experiments with a known data-generating process show BACE pinpoints the correct fixed-effects structure and true drivers, underscoring the method’s reliability.


---

## 📈 Data Overview

* 180 countries, five 5-year windows (1990-2013)
* Dependent variable: population-weighted Gini from satellite night-lights
* Key covariates (14): GDP pc (linear–quintic), resource rents, arable land, ethnic Gini, trade, FDI, etc.

---

## 🧪 Simulation Check

* Simulated panel with known DGP
* BACE recovered:

  * Correct two-way FE spec (PMP ≈ 100 %)
  * True drivers (GDP pc, rents, land, ethnic Gini)

---

## 🔍 Determinant Robustness (Real Data)

**High PIP (> 0.75)**

* Natural-resource rents ↑ inequality
* Arable land share ↓ inequality
* Ethnic Gini ↑ inequality
  **Kuznets terms**
* GDP pc (linear & quadratic) robust
* Cubic term not robust (PIP ≈ 0.48)

---

## 📐 Shape of the Curve

* Inequality **rises**: USD 189 → 2 189
* **Stabilises**: USD 2 189 → 3 935
* **Falls**: USD 3 935 → 71 682
* **Stabilises** again beyond USD 71 682

> Evidence favours an inverted-U with plateau in rich economies, **not** a full N-shape.

---

## 🧭 Policy Takeaways

* Redistribute natural-resource rents across regions
* Invest in agricultural productivity & equitable land access
* Target ethnic inclusion to curb spatial disparities
* Growth alone won’t close gaps after the peak—active regional policy required

---

## 🏁 Conclusion

* Panel-BACE offers transparent, probabilistic insight into inequality drivers
* Robust inverted-U confirmed; inequality stabilises, not rebounds, at high incomes
* Future work: interact technology diffusion & institutions in the Kuznets framework



