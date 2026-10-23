---
book_format: online
authors:
- admin
# Catalog addition date; the source gives copyright 2026, not a publication day.
date: "2026-10-17T00:00:00Z"
book_updated: "2026-10-23T11:08:07+09:00"
external_link: ""
image:
  caption: ""
  focal_point: Smart
summary: "Investigate economic growth, differences in prosperity, and business cycles with this Python companion to intermediate macroeconomics. Its 21 chapters and eight appendices combine real data, interactive models, computational notebooks, and lecture slides. Change parameters, explore shocks, and compare model predictions with evidence to connect economic reasoning with hands-on analysis."
tags:
- python
- macroeconomics
- data-science
title: "Data Science and Macroeconomic Models"
subtitle: "An AI-powered Python companion to intermediate macroeconomics"
links:
  - name: "Website"
    url: "https://quarcs-lab.github.io/macro102-site/"
    icon_pack: ai
    icon: open-data
  - name: "Spotify Show"
    url: "https://open.spotify.com/show/5MpdN8gos8te393uEr4ooK"
    icon_pack: fab
    icon: spotify
  - name: "AI Notebooks"
    url: "https://quarcs-lab.github.io/macro102-site/#chapters"
    icon_pack: fas
    icon: laptop-code
  - name: "Lecture Slides"
    url: "/books/macro102/#chapters-computational-notebooks-and-slides"
    icon_pack: fas
    icon: tv
  - name: "GitHub"
    url: "https://github.com/quarcs-lab/macro102-site"
    icon_pack: fab
    icon: github
---

Why have living standards risen so much, and why are some countries still much richer than others? What happens to output, unemployment and inflation when an economy enters a downturn? **Data Science and Macroeconomic Models** approaches these questions by putting real data and working models in readers’ hands.

Written by **Carlos Mendez**, this open online book is subtitled *An AI-powered Python companion to intermediate macroeconomics*. It accompanies Charles I. Jones’s *Macroeconomics* (2024). Its **21 chapters** follow the textbook’s titles and order, while **eight appendices** progress from practical tools to economic growth and advanced model estimation. Read the economic reasoning in Jones, then use the matching notebook to investigate the evidence and operate the model yourself. The book is an independent companion, with its own code and figures, and is not affiliated with or endorsed by the textbook’s author or publisher.

## The cycle of the book

The preface starts from a simple principle: economic explanations should be accountable to the facts. A broad pattern that persists across countries or over time becomes a **stylized fact**—something a useful model should help explain. Those patterns remain open to revision as new data arrive or the sample changes.

Each chapter moves through the same learning cycle: **data → exploration → stylized facts → model → comparison with data → revision**. The first three steps develop the data-science skills needed to find a pattern. The next three ask whether a model can account for it. A mismatch leads back to the data with a sharper question or to the model with a better explanation.

<figure style="width:min(1130px,calc(100vw - 40px));max-width:none;position:relative;left:50%;transform:translateX(-50%);">
  <a href="learning-cycle.svg">
    <img src="learning-cycle.svg" alt="Learning cycle: Data → Explore → Stylized facts → Model → Compare with data → Revise. Revision returns to Data with a sharper question or to Model with a better idea." width="1130" height="176" loading="lazy" decoding="async" style="width:100%;height:auto;">
  </a>
  <figcaption>Original learning-cycle figure from the preface: blue denotes data science and green denotes macroeconomic modeling. <a href="learning-cycle.svg">Open the full-size figure</a>. <a href="https://quarcs-lab.github.io/macro102-site/#the-cycle-of-the-book">Source: book preface</a> · CC BY-NC 4.0.</figcaption>
</figure>

The point is to learn from both a model’s successes and its limits. The Solow model, for example, helps explain differences in prosperity, while the economics of ideas takes up the question of sustained growth. In Appendix G, comparison becomes estimation: readers use data to choose parameters and assess how well a model fits.

## What you can do

- **Investigate the data.** Hover over observations, zoom into a period, compare countries and change variables. Public data sources include FRED, the World Bank, the IMF, the OECD and the Penn World Table; Appendix B explains how to retrieve data yourself.
- **Operate the models.** Move sliders to change parameters, introduce a shock or edit an equation in Python. Explore production and growth, the labor market and inflation, monetary policy, financial crises, and the links between domestic and international economies.
- **See the reasoning and the code together.** Chapters build a model from assumptions to predictions, then walk through figures with a purpose, the code that produces them and guidance on what to notice. “Your turn” exercises invite you to change the data or model and interpret the result.
- **Use AI critically.** An assistant can help explain or modify code, but a program that runs can still answer the wrong economic question. The preface asks readers to check the output and judge the evidence themselves.

## How to work through a chapter

1. Read the corresponding chapter in Jones for the economic argument, then open the book’s chapter below for its model overview and interactive figures.
2. Follow the **notebook** link to Google Colab and choose **Runtime → Run all**. Run the code, change parameters and try the exercises. The main chapters require no local installation.
3. Use the chapter’s **slides** for a lecture or a structured review of the same material. The links below open the actual chapter decks.
4. Compare the model’s predictions with the data and explain what changed. If you are new to Python, begin with Appendix A; use Appendix C when you need a mathematics refresher.

## Chapters, computational notebooks and slides

The resources below are organized in the same progression as the book. **Chapter titles open the readable online chapters; Colab opens the executable computational notebooks; Slides opens the lecture decks.** The linked materials are in English.

### Foundations: Chapters 1–2

Begin with the questions macroeconomics asks and the tools used to measure the economy.

| Chapter | Notebook | Slides |
| --- | --- | --- |
| 1. [Introduction to Macroeconomics](https://quarcs-lab.github.io/macro102-site/notebooks/ch01-introduction-to-macroeconomics.html) | [Colab](https://colab.research.google.com/github/quarcs-lab/macro102-site/blob/main/notebooks/ch01-introduction-to-macroeconomics.ipynb) | [Slides](https://quarcs-lab.github.io/macro102-site/slides/ch01/) |
| 2. [Measuring the Macroeconomy](https://quarcs-lab.github.io/macro102-site/notebooks/ch02-measuring-the-macroeconomy.html) | [Colab](https://colab.research.google.com/github/quarcs-lab/macro102-site/blob/main/notebooks/ch02-measuring-the-macroeconomy.ipynb) | [Slides](https://quarcs-lab.github.io/macro102-site/slides/ch02/) |


### The long run: Chapters 3–8

Study production, capital accumulation, ideas, labor markets and inflation to understand long-run prosperity.

| Chapter | Notebook | Slides |
| --- | --- | --- |
| 3. [An Overview of Long-Run Economic Growth](https://quarcs-lab.github.io/macro102-site/notebooks/ch03-an-overview-of-long-run-economic-growth.html) | [Colab](https://colab.research.google.com/github/quarcs-lab/macro102-site/blob/main/notebooks/ch03-an-overview-of-long-run-economic-growth.ipynb) | [Slides](https://quarcs-lab.github.io/macro102-site/slides/ch03/) |
| 4. [A Model of Production](https://quarcs-lab.github.io/macro102-site/notebooks/ch04-a-model-of-production.html) | [Colab](https://colab.research.google.com/github/quarcs-lab/macro102-site/blob/main/notebooks/ch04-a-model-of-production.ipynb) | [Slides](https://quarcs-lab.github.io/macro102-site/slides/ch04/) |
| 5. [The Solow Growth Model](https://quarcs-lab.github.io/macro102-site/notebooks/ch05-the-solow-growth-model.html) | [Colab](https://colab.research.google.com/github/quarcs-lab/macro102-site/blob/main/notebooks/ch05-the-solow-growth-model.ipynb) | [Slides](https://quarcs-lab.github.io/macro102-site/slides/ch05/) |
| 6. [Growth and Ideas](https://quarcs-lab.github.io/macro102-site/notebooks/ch06-growth-and-ideas.html) | [Colab](https://colab.research.google.com/github/quarcs-lab/macro102-site/blob/main/notebooks/ch06-growth-and-ideas.ipynb) | [Slides](https://quarcs-lab.github.io/macro102-site/slides/ch06/) |
| 7. [The Labor Market, Wages, and Unemployment](https://quarcs-lab.github.io/macro102-site/notebooks/ch07-the-labor-market-wages-and-unemployment.html) | [Colab](https://colab.research.google.com/github/quarcs-lab/macro102-site/blob/main/notebooks/ch07-the-labor-market-wages-and-unemployment.ipynb) | [Slides](https://quarcs-lab.github.io/macro102-site/slides/ch07/) |
| 8. [Inflation](https://quarcs-lab.github.io/macro102-site/notebooks/ch08-inflation.html) | [Colab](https://colab.research.google.com/github/quarcs-lab/macro102-site/blob/main/notebooks/ch08-inflation.ipynb) | [Slides](https://quarcs-lab.github.io/macro102-site/slides/ch08/) |


### The short run: Chapters 9–15

Explore fluctuations, crises and stabilization policy, from the IS curve to dynamic stochastic general equilibrium models.

| Chapter | Notebook | Slides |
| --- | --- | --- |
| 9. [An Introduction to the Short Run](https://quarcs-lab.github.io/macro102-site/notebooks/ch09-an-introduction-to-the-short-run.html) | [Colab](https://colab.research.google.com/github/quarcs-lab/macro102-site/blob/main/notebooks/ch09-an-introduction-to-the-short-run.ipynb) | [Slides](https://quarcs-lab.github.io/macro102-site/slides/ch09/) |
| 10. [The Great Recession and the Covid-19 Pandemic: A First Look](https://quarcs-lab.github.io/macro102-site/notebooks/ch10-the-great-recession-and-the-covid-19-pandemic-a-first-look.html) | [Colab](https://colab.research.google.com/github/quarcs-lab/macro102-site/blob/main/notebooks/ch10-the-great-recession-and-the-covid-19-pandemic-a-first-look.ipynb) | [Slides](https://quarcs-lab.github.io/macro102-site/slides/ch10/) |
| 11. [The IS Curve](https://quarcs-lab.github.io/macro102-site/notebooks/ch11-the-is-curve.html) | [Colab](https://colab.research.google.com/github/quarcs-lab/macro102-site/blob/main/notebooks/ch11-the-is-curve.ipynb) | [Slides](https://quarcs-lab.github.io/macro102-site/slides/ch11/) |
| 12. [Monetary Policy and the Phillips Curve](https://quarcs-lab.github.io/macro102-site/notebooks/ch12-monetary-policy-and-the-phillips-curve.html) | [Colab](https://colab.research.google.com/github/quarcs-lab/macro102-site/blob/main/notebooks/ch12-monetary-policy-and-the-phillips-curve.ipynb) | [Slides](https://quarcs-lab.github.io/macro102-site/slides/ch12/) |
| 13. [Stabilization Policy and the AS/AD Framework](https://quarcs-lab.github.io/macro102-site/notebooks/ch13-stabilization-policy-and-the-as-ad-framework.html) | [Colab](https://colab.research.google.com/github/quarcs-lab/macro102-site/blob/main/notebooks/ch13-stabilization-policy-and-the-as-ad-framework.ipynb) | [Slides](https://quarcs-lab.github.io/macro102-site/slides/ch13/) |
| 14. [Financial Crises and the Short-Run Model](https://quarcs-lab.github.io/macro102-site/notebooks/ch14-financial-crises-and-the-short-run-model.html) | [Colab](https://colab.research.google.com/github/quarcs-lab/macro102-site/blob/main/notebooks/ch14-financial-crises-and-the-short-run-model.ipynb) | [Slides](https://quarcs-lab.github.io/macro102-site/slides/ch14/) |
| 15. [DSGE Models: The Frontier of Business Cycle Research](https://quarcs-lab.github.io/macro102-site/notebooks/ch15-dsge-models-the-frontier-of-business-cycle-research.html) | [Colab](https://colab.research.google.com/github/quarcs-lab/macro102-site/blob/main/notebooks/ch15-dsge-models-the-frontier-of-business-cycle-research.ipynb) | [Slides](https://quarcs-lab.github.io/macro102-site/slides/ch15/) |


### Applications and microfoundations: Chapters 16–20

Connect the models to household and firm decisions, government policy, trade and international finance.

| Chapter | Notebook | Slides |
| --- | --- | --- |
| 16. [Consumption](https://quarcs-lab.github.io/macro102-site/notebooks/ch16-consumption.html) | [Colab](https://colab.research.google.com/github/quarcs-lab/macro102-site/blob/main/notebooks/ch16-consumption.ipynb) | [Slides](https://quarcs-lab.github.io/macro102-site/slides/ch16/) |
| 17. [Investment](https://quarcs-lab.github.io/macro102-site/notebooks/ch17-investment.html) | [Colab](https://colab.research.google.com/github/quarcs-lab/macro102-site/blob/main/notebooks/ch17-investment.ipynb) | [Slides](https://quarcs-lab.github.io/macro102-site/slides/ch17/) |
| 18. [The Government and the Macroeconomy](https://quarcs-lab.github.io/macro102-site/notebooks/ch18-the-government-and-the-macroeconomy.html) | [Colab](https://colab.research.google.com/github/quarcs-lab/macro102-site/blob/main/notebooks/ch18-the-government-and-the-macroeconomy.ipynb) | [Slides](https://quarcs-lab.github.io/macro102-site/slides/ch18/) |
| 19. [International Trade](https://quarcs-lab.github.io/macro102-site/notebooks/ch19-international-trade.html) | [Colab](https://colab.research.google.com/github/quarcs-lab/macro102-site/blob/main/notebooks/ch19-international-trade.ipynb) | [Slides](https://quarcs-lab.github.io/macro102-site/slides/ch19/) |
| 20. [Exchange Rates and International Finance](https://quarcs-lab.github.io/macro102-site/notebooks/ch20-exchange-rates-and-international-finance.html) | [Colab](https://colab.research.google.com/github/quarcs-lab/macro102-site/blob/main/notebooks/ch20-exchange-rates-and-international-finance.ipynb) | [Slides](https://quarcs-lab.github.io/macro102-site/slides/ch20/) |


### Looking ahead: Chapter 21

Consider what macroeconomics has learned and the questions that remain open.

| Chapter | Notebook | Slides |
| --- | --- | --- |
| 21. [Parting Thoughts](https://quarcs-lab.github.io/macro102-site/notebooks/ch21-parting-thoughts.html) | [Colab](https://colab.research.google.com/github/quarcs-lab/macro102-site/blob/main/notebooks/ch21-parting-thoughts.ipynb) | [Slides](https://quarcs-lab.github.io/macro102-site/slides/ch21/) |


## Eight appendices: tools, economic growth and DSGE models

The appendices now follow three complementary learning paths:

- **Tools (A–C).** Begin with Colab, Python and its data-science libraries; learn to retrieve macroeconomic data; and review the mathematics with Python calculations.
- **Economic growth (D–F).** Use the Penn World Table to separate GDP growth and income gaps into contributions from capital, labor and productivity. Explore whether poorer countries catch up through measures of convergence, then add human capital to the Solow model and replicate the cross-country analysis of Mankiw, Romer and Weil (1992).
- **DSGE models (G–H).** Write, solve and estimate macroeconomic models with Snowdrop. Appendix G includes maximum-likelihood and Bayesian estimation of Ireland’s (2004) New Keynesian model on U.S. data. Appendix H solves the estimated Smets–Wouters model and recomputes the impulse responses presented in Chapter 15.

Appendix B installs its additional data libraries in the first code cell; G and H install Snowdrop there. **All eight appendices now have computational notebooks and lecture slides.**

| Chapter | Notebook | Slides |
| --- | --- | --- |
| A. [Google Colab, Python Coding, and Data Science Libraries](https://quarcs-lab.github.io/macro102-site/notebooks/appA-google-colab-python-and-data-science-libraries.html) | [Colab](https://colab.research.google.com/github/quarcs-lab/macro102-site/blob/main/notebooks/appA-google-colab-python-and-data-science-libraries.ipynb) | [Slides](https://quarcs-lab.github.io/macro102-site/slides/appA/) |
| B. [Accessing Macroeconomic Data with Python](https://quarcs-lab.github.io/macro102-site/notebooks/appB-accessing-macroeconomic-data-with-python.html) | [Colab](https://colab.research.google.com/github/quarcs-lab/macro102-site/blob/main/notebooks/appB-accessing-macroeconomic-data-with-python.ipynb) | [Slides](https://quarcs-lab.github.io/macro102-site/slides/appB/) |
| C. [Math Review for Macroeconomics](https://quarcs-lab.github.io/macro102-site/notebooks/appC-math-review-for-macroeconomics.html) | [Colab](https://colab.research.google.com/github/quarcs-lab/macro102-site/blob/main/notebooks/appC-math-review-for-macroeconomics.ipynb) | [Slides](https://quarcs-lab.github.io/macro102-site/slides/appC/) |
| D. [Growth and Development Accounting](https://quarcs-lab.github.io/macro102-site/notebooks/appD-growth-and-development-accounting.html) | [Colab](https://colab.research.google.com/github/quarcs-lab/macro102-site/blob/main/notebooks/appD-growth-and-development-accounting.ipynb) | [Slides](https://quarcs-lab.github.io/macro102-site/slides/appD/) |
| E. [Growth and Convergence Across Countries](https://quarcs-lab.github.io/macro102-site/notebooks/appE-growth-and-convergence-across-countries.html) | [Colab](https://colab.research.google.com/github/quarcs-lab/macro102-site/blob/main/notebooks/appE-growth-and-convergence-across-countries.ipynb) | [Slides](https://quarcs-lab.github.io/macro102-site/slides/appE/) |
| F. [Augmented Solow Growth Model](https://quarcs-lab.github.io/macro102-site/notebooks/appF-augmented-solow-growth-model.html) | [Colab](https://colab.research.google.com/github/quarcs-lab/macro102-site/blob/main/notebooks/appF-augmented-solow-growth-model.ipynb) | [Slides](https://quarcs-lab.github.io/macro102-site/slides/appF/) |
| G. [DSGE Modeling with Python](https://quarcs-lab.github.io/macro102-site/notebooks/appG-dsge-modeling-with-python.html) | [Colab](https://colab.research.google.com/github/quarcs-lab/macro102-site/blob/main/notebooks/appG-dsge-modeling-with-python.ipynb) | [Slides](https://quarcs-lab.github.io/macro102-site/slides/appG/) |
| H. [The DSGE Model of Smets and Wouters](https://quarcs-lab.github.io/macro102-site/notebooks/appH-the-dsge-model-of-smets-and-wouters.html) | [Colab](https://colab.research.google.com/github/quarcs-lab/macro102-site/blob/main/notebooks/appH-the-dsge-model-of-smets-and-wouters.ipynb) | [Slides](https://quarcs-lab.github.io/macro102-site/slides/appH/) |


## Who the book is for

The book welcomes undergraduate and master’s students, self-learners, data-science learners looking for economic applications, and economists who want practical Python experience. **No prior programming experience is assumed.** Readers interested in economic growth can explore Appendices D–F, while G–H connect macroeconomic models with solution and estimation.

Start with the [preface](https://quarcs-lab.github.io/macro102-site/), choose a chapter above, or begin with Appendix A if you are new to computational notebooks.
