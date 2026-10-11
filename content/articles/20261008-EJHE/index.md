---
title: "Wealth and weight revisited: A Bayesian model averaging approach to the Obesity Kuznets Curve"
authors: ["Katerine Restrepo Gómez", "He Du", "admin"]
date: "2026-10-08T00:00:00Z"
publishDate: "2026-10-08T00:00:00Z"
doi: "10.1007/s10198-026-01998-1"
publication_types: ["2"]
publication: "*The European Journal of Health Economics*"
publication_short: "European Journal of Health Economics"
abstract: "The substantial literature on the existence of an inverted U-shaped relationship between obesity prevalence and economic growth, known as the Obesity Kuznets Curve (OKC), has yielded mixed evidence due to uncertainty in model and variable selection. We address this using a comprehensive panel of 84 countries from 2000 to 2020. Our Two-Way Fixed Effects (TWFE) models suggest the OKC follows an inverted-N shape, suggesting multiple transition points in the obesity-wealth nexus. To account for model uncertainty, we employ Bayesian Model Averaging (BMA) against a large set of potential determinants. The inverted-N shape remains robust, with BMA identifying key predictors across economic, sociocultural, and environmental domains. Our results suggest that a single ’turning point’ oversimplifies the obesity transition, and that targeted interventions must account for the multi-stage nature of economic development."
summary: "Does obesity fall as countries become wealthier? Evidence from 84 countries points to a more complex relationship with multiple turning points, rather than a single income threshold."
tags: ["Obesity", "Obesity Kuznets Curve", "Economic growth", "Model uncertainty", "Bayesian model averaging"]
featured: false
links:
- name: "Published article (Open Access)"
  url: "https://doi.org/10.1007/s10198-026-01998-1"
  icon_pack: fas
  icon: university
url_pdf: "https://link.springer.com/content/pdf/10.1007/s10198-026-01998-1.pdf"
url_code: ""
url_dataset: ""
url_preprint: ""
url_slides: ""
url_video: ""
url_poster: ""
url_project: ""
image:
  caption: ""
  alt_text: "Wealth up, obesity down? Two curves reconstructed from the fixed and robust prior posterior means in Table 2 fall, rise, and fall across the observed income range. The vertical axis shows the income component of adult obesity in percentage points relative to GDP per person of 10,000 constant 2015 US dollars; the horizontal axis is GDP per person on a logarithmic scale. Both models use 1,195 observations from 84 countries during 2000–2020. No uncertainty band is shown. Not at every income: these are model associations, not causal effects."
  focal_point: ""
  preview_only: false
---

## The question

Does obesity eventually decline as a country becomes wealthier? The familiar **Obesity Kuznets Curve** suggests a rise followed by a fall. This paper asks whether that simple pattern survives when researchers consider many possible explanations instead of choosing a single statistical model.

The study covers **84 countries during 2000–2020**. It combines age-standardized adult obesity estimates from the World Health Organization with economic, social, and environmental indicators from the World Bank. Obesity prevalence is the share of adults aged 18 or older with a body mass index of at least 30 kg/m². Income is GDP per person in constant 2015 US dollars.

## What the analysis finds

**Bayesian model averaging** combines evidence across alternative models, weighting each by its support in the data. Country and year fixed effects remain in every model, while 61 other potential explanatory variables enter the model-selection process.

The main results support an **inverted-N relationship**: the estimated income component first falls, then rises, then falls again. All three income terms have a posterior inclusion probability of 1.00 under both prior specifications. The sign pattern also appears in the two-way fixed-effects estimates.

| Income term | Fixed prior: posterior mean | Robust prior: posterior mean |
| :--- | ---: | ---: |
| Log GDP per person | −189.358 | −187.464 |
| Squared log GDP per person | 21.620 | 21.405 |
| Cubed log GDP per person | −0.804 | −0.796 |

These are the **Table 2 coefficients**, estimated using 1,195 country-year observations. The terms must be interpreted together; a coefficient on its own is not the effect of a one-dollar increase in income. The models also identify robust associations with indicators such as forest area, renewable energy use, population density, and agricultural structure.

## Reading the infographic

The image draws the income component directly from the published Table 2 posterior means for both priors. Each curve is centered at GDP per person of **10,000 constant 2015 US dollars**, so the vertical axis measures a difference in percentage points, not the predicted level of obesity. The horizontal axis is logarithmic and spans the observed income range reported in Table 7. This centering changes neither the shape nor the turning points.

The curves show posterior means only. The paper reports marginal coefficient standard deviations, but a valid uncertainty band for the combined curve would require their joint posterior or covariance. The infographic therefore adds no band. It is an original reconstruction of the panel estimates, not a reproduction of the descriptive pooled curves in Figures 1–2.

## What the evidence can tell us

The results describe **associations, not causal effects**. National averages cannot establish how an individual person's weight responds to income. The low-income end of the curve relies on fewer countries and less reliable obesity surveillance. A check using predictors lagged by five years preserves the income terms and their signs, but cannot eliminate time-varying confounding or reverse causality.

The practical message is to look beyond a single income threshold. Economic development and obesity are linked in several stages, and higher income alone does not guarantee lower obesity.

## Read the evidence

- **Table 2:** compare the two Bayesian prior specifications and posterior inclusion probabilities.
- **Tables 3–4:** examine the evidence for two turning points and distinguish within-country panel estimates from pooled cross-country descriptions.
- **Table 11:** inspect the robustness check using predictors lagged by five years.

The [open-access published article](https://doi.org/10.1007/s10198-026-01998-1) includes the methods, tables, and appendix. Its data statement says that the full study dataset is available from the corresponding author on reasonable request.

## Publication and image sources

Restrepo Gómez, K., Du, H., & Mendez, C. (2026). “Wealth and weight revisited: A Bayesian model averaging approach to the Obesity Kuznets Curve.” *The European Journal of Health Economics*. Published October 8, 2026. [DOI: 10.1007/s10198-026-01998-1](https://doi.org/10.1007/s10198-026-01998-1). Online first; volume, issue, and pages have not yet been assigned.

The infographic is an original plot of numerical results from Table 2 (PDF page 5), using the income range in Table 7 (PDF page 13). The article is open access under [CC BY-NC-ND 4.0](https://creativecommons.org/licenses/by-nc-nd/4.0/). The publisher's figures are not altered or reproduced here.
