---
date: "2026-05-17T00:00:00Z"
external_link: ""
image:
  caption: ""
  focal_point: Smart
summary: An introduction to regional impact evaluation using modern causal-inference methods with worked examples and publicly available data for full reproducibility.
tags:
- r
- causal
- regional
title: "Comparative Causal Metrics"

links:
  - name: "Website"
    url: "https://quarcs-lab.github.io/ccm"
    icon_pack: ai
    icon: open-data
  - name: "GitHub"
    url: "https://github.com/quarcs-lab/ccm"
    icon_pack: fab
    icon: github

url_pdf: ""
url_slides: ""
url_video: ""
---

## Welcome to Comparative Causal Metrics! (Work in Progress)

*An Introduction to Regional Impact Evaluation*

An introduction to **regional impact evaluation** using modern causal-inference methods implemented in R and rendered with Quarto. The resource covers quasi-experimental techniques for evaluating policy effects and interventions on regional outcomes, with worked examples and publicly available data for full reproducibility.

This work in progress book features:

- **A comparative tour of methods** — From interrupted time series and difference-in-differences to synthetic control, Bayesian structural time series, and modern panel-data estimators, all with a regional comparative focus.
- **R + Quarto Notebooks** — Reproducible chapters with collapsible code, ready to render locally or extend with your own data.

The book is organized in two parts:

- **Part I — Single treated unit (Chapters 1–9)** builds intuition with one running case study: California's 1989 Proposition 99 cigarette tax.
- **Part II — Staggered adoption (Chapters 10–12)** moves to settings where many units adopt a policy at different times, using a Callaway–Sant'Anna minimum-wage county panel.


## Chapters

**Part I — Single treated unit**

1. [Introduction](https://quarcs-lab.github.io/ccm/01-introduction.html)
2. [Interrupted Time Series](https://quarcs-lab.github.io/ccm/02-interrupted-time-series.html)
3. [Basic Differences-in-Differences](https://quarcs-lab.github.io/ccm/03-basic-diff-in-diff.html)
4. [Classical Synthetic Control](https://quarcs-lab.github.io/ccm/04-classical-synthetic-control.html)
5. [Augmented Synthetic Control](https://quarcs-lab.github.io/ccm/05-augmented-synthetic-control.html)
6. [Synthetic Difference-in-Differences](https://quarcs-lab.github.io/ccm/06-synthetic-did.html)
7. [Structural Bayesian Time Series](https://quarcs-lab.github.io/ccm/07-structural-bayesian-ts.html)
8. [Synthetic Control with Prediction Intervals](https://quarcs-lab.github.io/ccm/08-synthetic-control-prediction-intervals.html)
9. [Bayesian Spatial Synthetic Control](https://quarcs-lab.github.io/ccm/09-bayesian-spatial-sc.html)

**Part II — Staggered adoption**

10. [Staggered Differences-in-Differences](https://quarcs-lab.github.io/ccm/10-staggered-did.html)
11. [Interactive Fixed Effects and Matrix Completion](https://quarcs-lab.github.io/ccm/11-matrix-completion-and-ife.html)
12. [Generalized Synthetic Control](https://quarcs-lab.github.io/ccm/12-gsynth.html)

Plus: [References](https://quarcs-lab.github.io/ccm/references.html)


Contribute and provide feedback at [https://github.com/quarcs-lab/ccm](https://github.com/quarcs-lab/ccm).


## Related project

Companion resource: [Mastering Causal Metrics](/project/intro2causal/) — an AI-powered Python study guide based on Angrist & Pischke's *Mastering 'Metrics*.
