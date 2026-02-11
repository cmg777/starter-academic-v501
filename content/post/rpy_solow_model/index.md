---
authors:
  - admin
categories:
  - R
  - Python
draft: false
featured: false
date: "2023-07-29T00:00:00Z"
external_link: ""
image:
  caption: ""
  focal_point: Smart
links:
- icon: open-data
  icon_pack: ai
  name: "[R] Google Colab"
  url: https://colab.research.google.com/drive/1MbagABPt4e38e6LhgLuaoBCheuA7ZJ85?usp=sharing
- icon: open-data
  icon_pack: ai
  name: "[Python] Google Colab"
  url: https://colab.research.google.com/drive/1mTgF08Jbf6oNxONbGHyWJZrkygiX0E9N?usp=sharing
- icon: open-data
  icon_pack: ai
  name: "[Stata] Script"
  url: https://gist.github.com/cmg777/a1181c89de80e5eb5e8c8be2383342d1
slides: 
summary: An introduction to the Solow growth model and its convergence prediction
tags:
- r
- python
- convergence
title: The Solow growth model and its convergence prediction
url_code: ""
url_pdf: ""
url_slides: ""
url_video: ""
---

## 📊 The Augmented Solow Model: An Overview with Python, R, and Stata

**How do countries grow richer, and why do some grow faster than others?** Today, we're diving into a computational exploration of economic growth using the **augmented Solow model**, an enhanced version of Solow's foundational 1956 model that includes insights from Mankiw, Romer, and Weil (1992). This model helps explain **why some countries grow richer than others** and whether poor countries are indeed catching up to the wealthier ones. Let's unpack the model, the equations, and what the data says.

### 🔍 The Classic Solow Model: A Quick Recap
The **Solow model** is one of the cornerstones of economic growth theory. It explains how countries grow by focusing on three main ingredients:

- **Physical Capital (★)**: Think of it as the machines, factories, and tools that help us produce more.
- **Labor (👨‍🌾)**: The workforce that puts the capital to use.
- **Technology (or Productivity)**: The magic that makes capital and labor more effective.

The original Solow model tells us that growth can occur through accumulating **physical capital**, increasing the **workforce**, and through **technological progress**. However, over time, capital experiences diminishing returns — the more you invest, the less extra output you get, unless technology improves.

### 🧠 Why Augment the Model?
In 1992, **Mankiw, Romer, and Weil** suggested adding **human capital** to the mix. Human capital, like education and health, can significantly enhance productivity. By adding this to the model, we get a richer understanding of growth disparities between nations.

This shows that growth is not just about physical investments and labor but also about how well the workforce is trained and educated. Human capital plays a pivotal role in enhancing productivity, which can accelerate growth, particularly in poorer countries.

### 📈 Convergence: Are Poorer Countries Catching Up?
A critical prediction of the Solow model is **convergence** — the idea that poorer countries should grow faster than richer countries, eventually catching up in terms of per capita income.

However, data shows **conditional convergence** rather than unconditional convergence. This means countries tend to converge to their own steady-state levels of income, which are defined by their individual characteristics like **savings rate**, **population growth**, and **human capital** levels.

### 🗃️ Data Analysis & Key Insights
The dataset used in this analysis includes cross-country data on economic indicators like GDP, investment rates, and education levels.

**Data Samples**:
- **Non-oil Sample (98 countries)**: Countries not heavily reliant on oil production.
- **Intermediate Sample (75 countries)**: Excludes very small countries and those with data issues.
- **OECD Sample (22 countries)**: Focuses on countries with higher data quality.

The Python notebook processes these datasets to estimate the parameters for **savings**, **population growth**, and **human capital**, helping us understand the role of these factors in determining income levels and growth rates across countries.


### 🔗 Further Resources
- **Video review**: For a foundational overview of the Solow growth model, check out [this introductory video](https://youtu.be/md0cjl51JTk?si=P4OEEYJqMoBYl3Ir)
- **Stata Replication Code**: To replicate the key tables and figures from Mankiw, Romer, and Weil, access the [GitHub Gist here](https://gist.github.com/cmg777/a1181c89de80e5eb5e8c8b).
- **Primer on the Solow Model**: For those new to the basics, [this primer](https://wke.lt/w/s/NOD3t3) is a great place to start.

### 🖥️ Python Notebook Insights
The computational notebook provides step-by-step Python-based analysis, from loading the dataset to estimating parameters and visualizing growth trends. By transforming variables like **GDP**, **savings**, and **education** into their logarithmic forms, the model reveals the underlying dynamics of growth and the relative importance of each factor.

### 📝 Summary
The **augmented Solow model** enriches our understanding of economic growth by adding human capital into the equation. This addition helps explain why some countries grow faster than others and supports the concept of **conditional convergence** — the idea that countries grow towards their own unique steady states based on their **savings rates**, **population growth**, and **education**.




<center>
{{% callout note %}}
Learn by R coding using this [Google Colab notebook](https://colab.research.google.com/drive/1MbagABPt4e38e6LhgLuaoBCheuA7ZJ85?usp=sharing).
{{% /callout %}}
</center>

<center>
{{% callout note %}}
Learn by Python coding using this [Google Colab notebook](https://colab.research.google.com/drive/1mTgF08Jbf6oNxONbGHyWJZrkygiX0E9N?usp=sharing).
{{% /callout %}}
</center>

<center>
{{% callout note %}}
Learn by Stata coding using this [Stata script](https://gist.github.com/cmg777/a1181c89de80e5eb5e8c8be2383342d1).
{{% /callout %}}
</center>

