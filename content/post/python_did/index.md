---
authors:
  - admin
categories:
  - Python
  - Difference-in-Differences (DiD)
draft: false
featured: false
date: "2026-03-19T00:00:00Z"
external_link: ""
image:
  caption: ""
  focal_point: Smart
  placement: 3
links:
- icon: chalkboard-teacher
  icon_pack: fas
  name: "Slides (HTML)"
  url: slides/index.html
- icon: laptop-code
  icon_pack: fas
  name: Web app
  url: web_app/index.html
- icon: open-data
  icon_pack: ai
  name: "[Python] Google Colab"
  url: https://colab.research.google.com/github/cmg777/starter-academic-v501/blob/master/content/post/python_did/notebook.ipynb
- icon: file-code
  icon_pack: fas
  name: "Quarto project (.zip)"
  url: python_did.zip
- icon: code
  icon_pack: fas
  name: "Python script"
  url: script.py
- icon: book
  icon_pack: fas
  name: "Jupyter notebook"
  url: notebook.ipynb
- icon: markdown
  icon_pack: fab
  name: "MD version"
  url: https://raw.githubusercontent.com/cmg777/starter-academic-v501/master/content/post/python_did/index.md
slides:
summary: Estimating causal treatment effects using Difference-in-Differences with the diff-diff package, from the classic 2x2 design through staggered adoption with Callaway-Sant'Anna and HonestDiD sensitivity analysis
tags:
- python
- causal
- causal inference
- panel data
title: "Introduction to Difference-in-Differences in Python"
url_code: ""
url_pdf: ""
url_slides: ""
url_video: ""
toc: true
diagram: true
---

## Abstract

Policy evaluation hinges on separating the genuine effect of an intervention from pre-existing trends and selection differences between treated and untreated groups, the classic challenge that Difference-in-Differences (DiD) addresses by comparing changes in outcomes over time across a treated and a control group under the parallel trends assumption. This tutorial introduces the full DiD toolkit in Python using the `diff-diff` package, progressing from the canonical 2x2 design through event studies to staggered adoption with Callaway-Sant'Anna and HonestDiD sensitivity analysis. The analysis relies on synthetic panel data with known true effects: a balanced panel of 100 units observed over 10 periods (1,000 observations) with a true treatment effect of 5.0, and a staggered panel of 300 units over 10 periods (3,000 observations) with three cohorts adopting treatment at periods 3, 5, and 7 plus a never-treated group of 90 units. Methods include the classic 2x2 estimator, a multi-period event study, the Goodman-Bacon decomposition, the doubly-robust Callaway-Sant'Anna estimator targeting the ATT, and HonestDiD robustness bounds. The classic 2x2 estimator recovers an ATT of 5.12 (95% CI [4.64, 5.60]), and a pre-trends test fails to reject parallel trends (slope difference 0.12, p = 0.29). Under staggered adoption, naive Two-Way Fixed Effects yields a downward-biased 2.18 because 28.3% of its weight falls on forbidden comparisons, whereas Callaway-Sant'Anna recovers 2.41 with effects growing from 1.97 immediately after treatment to 3.27 six periods later; HonestDiD shows a breakdown value exceeding M = 15. These results demonstrate that modern estimators are essential for credibly recovering causal effects under staggered timing, and that reporting a sensitivity breakdown value alongside the point estimate strengthens the robustness of any DiD conclusion.

## Overview

An education ministry rolls out AI tutoring bots in some cities but not others. Did the AI tools actually improve learning, or were those cities already on an upward trajectory? This is the core challenge of **policy evaluation**: separating the genuine effect of an intervention from pre-existing trends and selection differences between treated and untreated groups. The seminal study by [Card and Krueger (1994)](https://www.jstor.org/stable/2118030) pioneered this approach in a different context --- examining how a minimum wage increase in New Jersey affected fast-food employment compared to neighboring Pennsylvania.

**Difference-in-Differences (DiD)** is the workhorse method for answering such questions. The idea is elegantly simple: compare the change in outcomes over time between a group that received treatment and a group that did not. If both groups were evolving similarly before treatment --- the *parallel trends* assumption --- then the difference in their changes isolates the causal effect. Think of it as using the control group as a mirror: it shows what would have happened to the treated group had the policy never been implemented.

The **[diff-diff](https://diff-diff.readthedocs.io/en/stable/)** Python package, developed by [Gerber (2026)](https://github.com/igerber/diff-diff), provides a unified, scikit-learn-style API for 13+ DiD estimators validated against their R counterparts. These range from the classic 2x2 design to modern methods for staggered adoption. In this tutorial, we start with the simplest case, build up to event studies and multi-cohort designs, and finish with sensitivity analysis that quantifies how robust the findings are to violations of parallel trends. All examples use synthetic **panel data** --- datasets where the same units (cities, firms, individuals) are observed repeatedly over multiple time periods --- with known true effects, so every estimate can be verified against ground truth.

**Learning objectives:**

- Understand the logic of the 2x2 DiD design and why it identifies causal effects under parallel trends
- Estimate the Average Treatment Effect on the Treated (ATT) using classic DiD
- Test the parallel trends assumption with pre-treatment trend comparisons
- Interpret event study plots that reveal dynamic treatment effects over time
- Recognize why Two-Way Fixed Effects fails under staggered adoption and how Callaway-Sant'Anna corrects for it
- Assess robustness of causal conclusions using Bacon decomposition diagnostics and HonestDiD sensitivity analysis

### Key concepts at a glance

The post leans on a small vocabulary repeatedly. The rest of the tutorial assumes you can move between these terms quickly. Each concept below has three parts. The **definition** is always visible. The **example** and **analogy** sit behind clickable cards: open them when you need them, leave them collapsed for a quick scan. If a later section mentions "forbidden comparisons" or "ATT" and the term feels slippery, this is the section to re-read.

**1. Identification (DiD assumptions).** DiD identifies the ATT under two assumptions: parallel trends (treated and control would have moved in parallel without treatment) and no anticipation (no pre-treatment effect of the upcoming treatment).

<div class="concept-pair">
<details class="concept-card concept-example"><summary>Example</summary>

The post simulates data where parallel trends holds by construction. The pre-trend test gives slope difference 0.1216 with p = 0.2938 — well above 5%. Identification is plausible.

</details>
<details class="concept-card concept-analogy"><summary>Analogy</summary>

The two legs of a tripod the camera sits on. Remove either and the picture collapses.

</details>
</div>

**2. ATT (average treatment effect on treated)** $E[Y(1)-Y(0)\mid D=1]$. The expected outcome under treatment minus the expected counterfactual outcome, averaged over the treated subpopulation.

<div class="concept-pair">
<details class="concept-card concept-example"><summary>Example</summary>

In this post, the true ATT = 5.0 by construction. The classic 2×2 estimator recovers $\widehat{\mathrm{ATT}}$ = 5.1216 (within 2.4%). The 95% CI [4.6399, 5.6034] easily covers the truth.

</details>
<details class="concept-card concept-analogy"><summary>Analogy</summary>

The effect on the people who actually got the treatment, not the population at large.

</details>
</div>

**3. Classic 2×2 design** $(\bar Y\_{\mathrm{post}}^T - \bar Y\_{\mathrm{pre}}^T) - (\bar Y\_{\mathrm{post}}^C - \bar Y\_{\mathrm{pre}}^C)$. Two groups (treated, control), two periods (pre, post). Difference of differences.

<div class="concept-pair">
<details class="concept-card concept-example"><summary>Example</summary>

In the simulated `treatment_period = 5` data, the pre-post change in the treated group minus the same change in the control group gives 5.1216 — the canonical DiD estimator at work.

</details>
<details class="concept-card concept-analogy"><summary>Analogy</summary>

Before-after photos for two groups, then comparing the changes side by side.

</details>
</div>

**4. Pre-trends test** $H\_0$: leads = 0. Run an event-study regression and test whether all pre-treatment leads are jointly zero. Empirical proxy for parallel trends.

<div class="concept-pair">
<details class="concept-card concept-example"><summary>Example</summary>

In this post, the lead at e=-2 is -0.52 (p = 0.31). Failing to reject does not prove parallel trends, but it removes the most obvious objection.

</details>
<details class="concept-card concept-analogy"><summary>Analogy</summary>

The crash-test on the bridge before the load arrives — it can't certify safety, but it catches the obvious cracks.

</details>
</div>

**5. Event study** $\mathrm{ATT}(e)$ for $e = -L,\ldots,K$. Estimate ATTs by *time since treatment*, with $e = 0$ the treatment period. Plots the dynamic response.

<div class="concept-pair">
<details class="concept-card concept-example"><summary>Example</summary>

In this post, lag 0 effect = 1.97; the effect grows to 3.27 by lag 6. The dose-response shows the policy bites harder over time.

</details>
<details class="concept-card concept-analogy"><summary>Analogy</summary>

The effect 1, 2, 3 years after the policy change, regardless of which calendar year it changed.

</details>
</div>

**6. Forbidden comparisons.** Naive TWFE silently uses *already-treated* units as controls for *later-treated* units. With heterogeneous effects, this contaminates the estimate.

<div class="concept-pair">
<details class="concept-card concept-example"><summary>Example</summary>

In this post's staggered-adoption section, naive TWFE = 2.18, far from the true average of 5. Bacon decomposition reveals 28.3% of the weight comes from forbidden 2×2 comparisons that drag the average down.

</details>
<details class="concept-card concept-analogy"><summary>Analogy</summary>

Using an already-injured player as a control for an injury study — the control is not really untreated.

</details>
</div>

**7. Callaway-Sant'Anna doubly-robust.** Compute $\mathrm{ATT}(g, t)$ for each cohort $g$ and period $t$ using a *doubly robust* estimator (outcome model + propensity score). Aggregate with valid weights.

<div class="concept-pair">
<details class="concept-card concept-example"><summary>Example</summary>

Applied to the staggered data here, Callaway-Sant'Anna's overall ATT = 2.41, similar in magnitude to the contaminated TWFE estimate but constructed only from valid 2×2 comparisons.

</details>
<details class="concept-card concept-analogy"><summary>Analogy</summary>

Belt and suspenders — the outcome model and propensity model are two independent guarantees that the trousers stay up.

</details>
</div>

**8. HonestDiD $\bar M$ (breakdown value).** The largest violation of parallel trends (in units of the largest pre-treatment trend) at which the treatment-effect CI still excludes zero.

<div class="concept-pair">
<details class="concept-card concept-example"><summary>Example</summary>

In this post, the breakdown is $\bar M \approx 15$. The CI at $M = 0$ is [2.5324, 2.6592]; at $M = 15$ it widens to [0.3795, 4.8122] — still excludes zero. The result is exceptionally robust.

</details>
<details class="concept-card concept-analogy"><summary>Analogy</summary>

The wind speed at which the bridge first wobbles. A higher number means a sturdier bridge.

</details>
</div>

<a href="https://colab.research.google.com/github/cmg777/starter-academic-v501/blob/master/content/post/python_did/notebook.ipynb" target="_blank"><img src="https://colab.research.google.com/assets/colab-badge.svg" alt="Open In Colab"></a>

## Conceptual framework: What is Difference-in-Differences?

Imagine a school district deploys AI tutoring bots in some schools but not others, and you want to know whether the AI tools improved learning outcomes. You could compare learning scores at AI-equipped schools versus non-equipped schools after deployment. But AI-equipped schools might have had stronger students to begin with --- perhaps the district piloted the technology in its highest-performing schools. A simple post-treatment comparison confounds the AI effect with pre-existing differences. Alternatively, you could compare a single school before and after the AI rollout --- but learning scores might have been rising everywhere due to a new curriculum or improved teacher training, not the AI tools.

DiD combines these two simpler approaches so that selection bias and the effect of time are, in turns, eliminated. The logic proceeds through **successive differencing**:

- **First difference**: Compare a unit before and after treatment. This eliminates time-invariant differences between groups (e.g., one school always scores higher than another), but confounds the treatment effect with common time trends (e.g., district-wide learning improvements from a new curriculum).
- **Second difference**: Difference the first differences between treated and control groups. This eliminates the common time trends, leaving only the treatment effect.

```mermaid
graph TB
    subgraph "Before Treatment"
        A["<b>Treated Group</b><br/>Pre-treatment outcome"]
        B["<b>Control Group</b><br/>Pre-treatment outcome"]
    end
    subgraph "After Treatment"
        C["<b>Treated Group</b><br/>Post-treatment outcome"]
        D["<b>Control Group</b><br/>Post-treatment outcome"]
    end

    A -->|"Change in<br/>treated"| C
    B -->|"Change in<br/>control"| D

    style A fill:#d97757,stroke:#141413,color:#fff
    style C fill:#d97757,stroke:#141413,color:#fff
    style B fill:#6a9bcc,stroke:#141413,color:#fff
    style D fill:#6a9bcc,stroke:#141413,color:#fff
```

### The DiD estimator

The 2x2 DiD estimator formalizes this double comparison. Let $k$ denote the treated group and $U$ the untreated group:

$$\hat{\delta}^{2 \times 2}\_{kU} = \big( \bar{Y}\_k^{Post} - \bar{Y}\_k^{Pre} \big) - \big( \bar{Y}\_U^{Post} - \bar{Y}\_U^{Pre} \big)$$

In words: take the before-and-after change in the treated group, subtract the before-and-after change in the control group, and the remainder is the treatment effect. Here $\bar{Y}\_k^{Post}$ is the average outcome for treated units in the post-treatment period (rows where `treated = 1` and `post = 1`), and similarly for the other three terms.

### What DiD actually estimates: The potential outcomes framework

The sample-means formula above tells us *how to compute* DiD from data, but it does not tell us *what causal quantity* DiD recovers or *under what assumptions* it is valid. To answer these deeper questions, we need the **potential outcomes framework** ([Rubin, 1974](https://doi.org/10.1037/h0037350)).

The key idea is that every unit has *two* potential outcomes at every point in time, but we only ever observe one of them:

- $Y^1\_{i}$ --- the outcome unit $i$ would experience **with** treatment
- $Y^0\_{i}$ --- the outcome unit $i$ would experience **without** treatment

For a treated city, we observe $Y^1$ (what actually happened after adopting AI tutoring) but never $Y^0$ (what *would have* happened had the city not adopted AI). For a control city, we observe $Y^0$ but never $Y^1$. This is the **fundamental problem of causal inference**: for any individual unit, the causal effect $Y^1\_{i} - Y^0\_{i}$ is unobservable because one potential outcome is always missing.

Since we cannot measure individual effects, we aim for the **Average Treatment Effect on the Treated (ATT)** --- the average causal effect across all treated units in the post-treatment period:

$$ATT = E[Y^1\_k - Y^0\_k | Post]$$

In words: what is the average difference between what treated units actually experienced and what they *would have* experienced without treatment, measured in the post-treatment period? Here $E[\cdot]$ denotes the expected value (population average), $k$ indexes the treated group, and the conditioning on $Post$ restricts attention to the post-treatment period. In our data, $E[Y^1\_k | Post]$ corresponds to the average `outcome` for rows where `treated = 1` and `post = 1` --- that is, $\bar{Y}\_k^{Post}$ from the previous formula.

The challenge is that $E[Y^0\_k | Post]$ --- the average untreated outcome for the treated group after treatment --- is a **counterfactual** that we never observe. Treated cities received the policy, so we cannot see what their outcomes would have been without it. This is where DiD's clever trick comes in.

### From sample means to potential outcomes

Let us now connect the sample-means formula to potential outcomes by rewriting each $\bar{Y}$ term. For the **control group**, which never receives treatment, the observed outcome always equals the untreated potential outcome: $Y\_U = Y^0\_U$ in both periods. For the **treated group**, the observed outcome equals the untreated potential outcome before treatment ($Y\_k = Y^0\_k$ when $Pre$) and the treated potential outcome after ($Y\_k = Y^1\_k$ when $Post$). Substituting these into the DiD formula:

$$\hat{\delta}^{2 \times 2}\_{kU} = \big( \underbrace{\bar{Y}\_k^{Post}}\_{= E[Y^1\_k | Post]} - \underbrace{\bar{Y}\_k^{Pre}}\_{= E[Y^0\_k | Pre]} \big) - \big( \underbrace{\bar{Y}\_U^{Post}}\_{= E[Y^0\_U | Post]} - \underbrace{\bar{Y}\_U^{Pre}}\_{= E[Y^0\_U | Pre]} \big)$$

On the left of the outer subtraction, the treated group's pre-treatment mean uses $Y^0\_k$ (no treatment yet) and post-treatment mean uses $Y^1\_k$ (treatment is active). On the right, both control group means use $Y^0\_U$ (never treated). Now we apply a standard algebraic trick: **add and subtract** the unobserved counterfactual $E[Y^0\_k | Post]$ inside the first parenthesis:

$$= \big( E[Y^1\_k | Post] - E[Y^0\_k | Post] + E[Y^0\_k | Post] - E[Y^0\_k | Pre] \big) - \big( E[Y^0\_U | Post] - E[Y^0\_U | Pre] \big)$$

Rearranging by grouping the first two terms and the last three:

$$= \underbrace{E[Y^1\_k | Post] - E[Y^0\_k | Post]}\_{ATT} + \underbrace{\big( E[Y^0\_k | Post] - E[Y^0\_k | Pre] \big) - \big( E[Y^0\_U | Post] - E[Y^0\_U | Pre] \big)}\_{Bias}$$

This is the fundamental decomposition of the DiD estimator ([Cunningham, 2021](https://mixtape.scunning.com/09-difference_in_differences)). The first term is the **ATT** --- the causal quantity we want. The second term is the **non-parallel trends bias** --- the difference in how the two groups' untreated outcomes would have evolved over time. The bias term compares the untreated trajectory of the treated group ($E[Y^0\_k | Post] - E[Y^0\_k | Pre]$) against the untreated trajectory of the control group ($E[Y^0\_U | Post] - E[Y^0\_U | Pre]$). If the bias term is zero, the DiD estimator cleanly identifies the ATT.

### Parallel trends assumption

The bias term vanishes when the treated and control groups would have followed the same trajectory absent treatment:

$$E[Y^0\_k | Post] - E[Y^0\_k | Pre] = E[Y^0\_U | Post] - E[Y^0\_U | Pre]$$

This is the **parallel trends assumption**. It does not require the groups to have the same outcome levels --- only the same *trends*. Two cities can have different learning scores, but if their learning scores were rising at the same speed before the AI rollout, DiD can credibly estimate the policy's impact. Importantly, this assumption is **fundamentally untestable** because the counterfactual outcome $E[Y^0\_k | Post]$ --- what would have happened to the treated group absent treatment --- is never observed. We can check whether trends were parallel in the pre-treatment period, but this does not guarantee they would have remained parallel afterward. This limitation is why Section 11 introduces HonestDiD sensitivity analysis.

### Regression formulation

In practice, DiD is implemented as a regression with an interaction term:

$$Y\_{it} = \alpha + \gamma \cdot Treated\_i + \lambda \cdot Post\_t + \delta \cdot (Treated\_i \times Post\_t) + \varepsilon\_{it}$$

where $Treated\_i$ is the group indicator (our `treated` column), $Post\_t$ is the time indicator (our `post` column), and $\delta$ is the DiD treatment effect. The coefficient $\gamma$ captures the pre-existing level difference between groups, and $\lambda$ captures the common time trend. This regression mechanically constructs the counterfactual using the control group's trajectory --- it always estimates the $\delta$ coefficient as the extra change in the treated group, which is only valid if the counterfactual trend truly equals the control group's trend.

**Estimand clarity:** DiD targets the **Average Treatment Effect on the Treated (ATT)** --- the average impact of treatment on those units that actually received it. This differs from the Average Treatment Effect (ATE), which averages over the entire population including units that were never treated. The ATT answers: "For the units that received the policy, how much did it change their outcomes?" This is typically the policy-relevant question, since the decision-maker wants to know whether the intervention helped the people it was aimed at.

Now that we understand the logic, let us implement it step by step using the `diff-diff` package.

## Setup and imports

Before running the analysis, install the required package:

```python
# Run in terminal (or use !pip install in a notebook)
pip install diff-diff
```

The following code imports all necessary libraries and sets configuration variables. The `diff-diff` package provides [`generate_did_data()`](https://diff-diff.readthedocs.io/en/stable/) to create synthetic panel data with known treatment effects, [`DifferenceInDifferences()`](https://diff-diff.readthedocs.io/en/stable/) for the classic 2x2 estimator, and several advanced estimators for multi-period and staggered designs.

```python
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
from diff_diff import (
    DifferenceInDifferences,
    MultiPeriodDiD,
    CallawaySantAnna,
    BaconDecomposition,
    HonestDiD,
    generate_did_data,
    generate_staggered_data,
    check_parallel_trends,
)

# Reproducibility
RANDOM_SEED = 42
np.random.seed(RANDOM_SEED)

# Site color palette
STEEL_BLUE = "#6a9bcc"
WARM_ORANGE = "#d97757"
NEAR_BLACK = "#141413"
TEAL = "#00d4c8"

# Dark-theme palette
DARK_NAVY = "#0f1729"
GRID_LINE = "#1f2b5e"
LIGHT_TEXT = "#c8d0e0"
WHITE_TEXT = "#e8ecf2"
```

## Classic 2x2 DiD design

The simplest DiD setup has two groups (treated and control) observed at two time points (before and after treatment). We start here because the 2x2 case makes the mechanics of DiD transparent before moving to more complex designs.

### Generating synthetic panel data

We use [`generate_did_data()`](https://diff-diff.readthedocs.io/en/stable/) to create a synthetic panel where the true treatment effect is exactly 5.0 units. This known ground truth lets us verify that the estimator recovers the correct answer. The function creates a balanced panel with `n_units` units observed over `n_periods` periods, where `treatment_fraction` of units receive treatment starting at `treatment_period`.

```python
data_2x2 = generate_did_data(
    n_units=100,
    n_periods=10,
    treatment_effect=5.0,
    treatment_period=5,
    treatment_fraction=0.5,
    seed=RANDOM_SEED,
)

print(f"Dataset shape: {data_2x2.shape}")
print(f"Columns: {data_2x2.columns.tolist()}")
print(f"\nTreatment groups:")
print(data_2x2.groupby("treated")["unit"].nunique().rename(
    {0: "Control", 1: "Treated"}))
print(f"\nPeriods: {sorted(int(p) for p in data_2x2['period'].unique())}")
print(f"Treatment period: 5 (post = 1 for periods >= 5)")
print(f"True treatment effect: 5.0")
```

```
Dataset shape: (1000, 6)
Columns: ['unit', 'period', 'treated', 'post', 'outcome', 'true_effect']

Treatment groups:
treated
Control    50
Treated    50
Name: unit, dtype: int64

Periods: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
Treatment period: 5 (post = 1 for periods >= 5)
True treatment effect: 5.0
```

The synthetic panel contains 1,000 observations: 100 units observed across 10 periods (0 through 9). Half the units (50) are assigned to treatment, which begins at period 5. The dataset includes a `true_effect` column that equals 0.0 in pre-treatment periods and 5.0 in post-treatment periods for treated units, providing a built-in benchmark. The `post` indicator is 1 for periods 5--9 and 0 for periods 0--4, matching the binary time dimension of the classic 2x2 framework.

### Exploring the 2x2 dataset

Before estimating any model, we inspect the raw data to understand its structure. The `.head()` method shows the first rows so we can see how each observation is organized as a unit-period pair.

```python
data_2x2.head(10)
```

```
 unit  period  treated  post   outcome  true_effect
    0       0        1     0 10.231272          0.0
    0       1        1     0 12.408662          0.0
    0       2        1     0 11.253170          0.0
    0       3        1     0 12.846950          0.0
    0       4        1     0 11.675816          0.0
    0       5        1     1 17.903997          5.0
    0       6        1     1 17.659412          5.0
    0       7        1     1 18.770401          5.0
    0       8        1     1 20.449742          5.0
    0       9        1     1 18.382114          5.0
```

Each row is one unit in one period. The `unit` column identifies the individual, `period` tracks time, `treated` indicates group assignment (time-invariant), and `post` flags observations after the treatment period. The `outcome` column is what we aim to explain, and `true_effect` is the ground truth we will try to recover. This unit-period structure is the hallmark of **panel data** --- repeated observations on the same units over time.

Summary statistics confirm the design parameters:

```python
data_2x2.describe()
```

```
              unit       period     treated        post      outcome  true_effect
count  1000.000000  1000.000000  1000.00000  1000.00000  1000.000000  1000.000000
mean     49.500000     4.500000     0.50000     0.50000    13.380874     1.250000
std      28.880514     2.873719     0.50025     0.50025     3.752000     2.166147
min       0.000000     0.000000     0.00000     0.00000     4.965883     0.000000
25%      24.750000     2.000000     0.00000     0.00000    10.716817     0.000000
50%      49.500000     4.500000     0.50000     0.50000    12.558536     0.000000
75%      74.250000     7.000000     1.00000     1.00000    15.926784     1.250000
max      99.000000     9.000000     1.00000     1.00000    24.294992     5.000000
```

The means of `treated` and `post` are both exactly 0.50, confirming a perfectly balanced design: half the units are treated, and half the time periods are post-treatment. The outcome ranges from about 5.0 to 24.3 with a mean of 13.4, reflecting the combination of time trends, unit effects, and treatment effects. The `true_effect` mean of 1.25 comes from the fact that only 25% of observations (treated units in post-treatment periods) have a non-zero effect of 5.0.

A crosstab reveals the 2x2 structure that gives DiD its name:

```python
pd.crosstab(data_2x2["treated"], data_2x2["post"], margins=True)
```

```
post       0    1  All
treated
0        250  250  500
1        250  250  500
All      500  500  1000
```

This is the core of the 2x2 design: 250 observations in each of the four cells (control-pre, control-post, treated-pre, treated-post). The balanced allocation means each cell has equal weight in the estimator, which maximizes statistical power. In observational studies, these cell sizes are rarely equal, but the DiD estimator adjusts for imbalance automatically.

Finally, we examine how the outcome varies across the four cells:

```python
data_2x2.groupby(["treated", "post"])["outcome"].describe()
```

```
                count       mean       std        min        25%        50%        75%        max
treated post
0       0       250.0  10.614957  1.871283   5.670539   9.261649  10.781139  11.866492  15.825691
        1       250.0  13.086386  1.968271   8.158302  11.777457  13.149548  14.600075  18.372485
1       0       250.0  11.114546  2.015353   4.965883   9.909285  11.065526  12.494486  16.804462
        1       250.0  18.707609  1.905034  13.182572  17.296981  18.870692  20.070330  24.294992
```

In the pre-treatment period, both groups have similar mean outcomes: 10.61 for the control group and 11.11 for the treated group --- a negligible difference of 0.50 that suggests the groups started on comparable footing. In the post-treatment period, the control group mean rises to 13.09 (a gain of 2.47), while the treated group mean jumps to 18.71 (a gain of 7.59). The extra gain for the treated group (7.59 - 2.47 = 5.12) closely approximates the treatment effect that DiD will formally estimate. The raw numbers already hint that something happened to the treated group beyond the natural time trend.

The box plot below visualizes these distributions:

```python
fig, ax = plt.subplots(figsize=(9, 5))
fig.patch.set_linewidth(0)
groups = [
    ("Control, Pre",  data_2x2[(data_2x2["treated"] == 0) & (data_2x2["post"] == 0)]["outcome"]),
    ("Control, Post", data_2x2[(data_2x2["treated"] == 0) & (data_2x2["post"] == 1)]["outcome"]),
    ("Treated, Pre",  data_2x2[(data_2x2["treated"] == 1) & (data_2x2["post"] == 0)]["outcome"]),
    ("Treated, Post", data_2x2[(data_2x2["treated"] == 1) & (data_2x2["post"] == 1)]["outcome"]),
]
bp = ax.boxplot(
    [g[1] for g in groups],
    tick_labels=[g[0] for g in groups],
    patch_artist=True,
    widths=0.5,
    medianprops=dict(color=WHITE_TEXT, linewidth=2),
)
box_colors = [STEEL_BLUE, STEEL_BLUE, WARM_ORANGE, WARM_ORANGE]
for patch, color in zip(bp["boxes"], box_colors):
    patch.set_facecolor(color)
    patch.set_alpha(0.6)
ax.set_ylabel("Outcome")
ax.set_title("Outcome Distribution by Treatment Group and Period")
plt.savefig("did_outcome_distribution.png", dpi=300, bbox_inches="tight",
            facecolor=DARK_NAVY, edgecolor=DARK_NAVY, pad_inches=0)
plt.show()
```

![Box plot showing outcome distributions for control and treated groups in pre and post periods. Both groups start with similar distributions, but the treated group shifts markedly upward in the post period.](did_outcome_distribution.png)

The box plot makes the treatment effect visible at a glance. In the pre-treatment period, control (steel blue) and treated (warm orange) boxes overlap almost completely, centered around 10.6--11.1. Both groups shift upward in the post period due to the natural time trend, but the treated group shifts *more* --- its median jumps to around 18.9, compared to 13.1 for the control. The extra upward shift for the treated group is the treatment effect that DiD will formally estimate. Notice also that the spread (box height) remains similar across all four groups, suggesting that treatment affects the level but not the variability of outcomes.

### Visualizing parallel trends

Before estimating the treatment effect, we check whether the treated and control groups followed similar trajectories in the pre-treatment period. This visual inspection is the first step in assessing whether the parallel trends assumption is plausible. If the two groups were diverging before treatment, any post-treatment difference could reflect pre-existing trends rather than a causal effect.

```python
treated_means = data_2x2[data_2x2["treated"] == 1].groupby("period")["outcome"].mean()
control_means = data_2x2[data_2x2["treated"] == 0].groupby("period")["outcome"].mean()

fig, ax = plt.subplots(figsize=(9, 5))
fig.patch.set_linewidth(0)
ax.plot(control_means.index, control_means.values, "o-",
        color=STEEL_BLUE, linewidth=2, markersize=7, label="Control group")
ax.plot(treated_means.index, treated_means.values, "s-",
        color=WARM_ORANGE, linewidth=2, markersize=7, label="Treated group")
ax.axvline(x=4.5, color=LIGHT_TEXT, linestyle="--", linewidth=1.5,
           alpha=0.7, label="Treatment onset")
ax.set_xlabel("Period")
ax.set_ylabel("Average Outcome")
ax.set_title("Parallel Trends: Treatment vs Control Groups")
ax.legend(loc="upper left")
ax.set_xticks(range(10))
plt.savefig("did_parallel_trends.png", dpi=300, bbox_inches="tight",
            facecolor=DARK_NAVY, edgecolor=DARK_NAVY, pad_inches=0)
plt.show()
```

![Parallel trends plot showing treatment and control groups tracking closely in pre-treatment periods 0-4, then diverging sharply after treatment onset at period 5.](did_parallel_trends.png)

The two groups move in lockstep during periods 0 through 4, confirming that the parallel trends assumption holds in this synthetic dataset. Both lines fluctuate around similar values with no visible divergence before period 5. After treatment onset, the treated group (warm orange) jumps upward while the control group (steel blue) continues its prior trajectory. The gap between the two lines in the post-treatment period visually represents the treatment effect --- roughly 5 units, consistent with the true effect built into the data.

### Estimating the treatment effect

With parallel trends confirmed visually, we apply the classic DiD estimator. The [`DifferenceInDifferences()`](https://diff-diff.readthedocs.io/en/stable/) class implements the 2x2 design with analytical standard errors. The `.fit()` method takes the data along with column names for the outcome, treatment indicator, and time indicator (pre/post).

```python
did = DifferenceInDifferences()
results_2x2 = did.fit(data_2x2, outcome="outcome",
                       treatment="treated", time="post")
results_2x2.print_summary()
```

```
======================================================================
             Difference-in-Differences Estimation Results
======================================================================

Observations:                   1000
Treated units:                   500
Control units:                   500
R-squared:                    0.7332

----------------------------------------------------------------------
Parameter           Estimate    Std. Err.     t-stat      P>|t|
----------------------------------------------------------------------
ATT                   5.1216       0.2455     20.863     0.0000   ***
----------------------------------------------------------------------

95% Confidence Interval: [4.6399, 5.6034]

Signif. codes: '***' 0.001, '**' 0.01, '*' 0.05, '.' 0.1
======================================================================
```

The estimated ATT is 5.12, close to the true effect of 5.0, with a standard error of 0.25. The t-statistic of 20.86 and p-value near zero confirm that the effect is highly statistically significant. The 95% confidence interval [4.64, 5.60] comfortably contains the true value of 5.0, demonstrating that the classic DiD estimator successfully recovers the known treatment effect. The small deviation from 5.0 (an overestimate of 0.12) reflects sampling variability, not estimator bias --- with 100 units and 10 periods, some random noise is expected.

### Visualizing the counterfactual

DiD's power lies in constructing a **counterfactual** --- what would have happened to the treated group without treatment. We build this by projecting the control group's post-treatment trajectory, shifted up by the pre-treatment gap between the groups. The shaded area between the actual treated outcomes and this counterfactual line represents the estimated causal effect.

```python
fig, ax = plt.subplots(figsize=(9, 5))
fig.patch.set_linewidth(0)
ax.plot(control_means.index, control_means.values, "o-",
        color=STEEL_BLUE, linewidth=2, markersize=7, label="Control group")
ax.plot(treated_means.index, treated_means.values, "s-",
        color=WARM_ORANGE, linewidth=2, markersize=7, label="Treated group")

# Counterfactual: treated group without treatment
pre_diff = treated_means.loc[:4].mean() - control_means.loc[:4].mean()
counterfactual = control_means.loc[5:] + pre_diff
ax.plot(counterfactual.index, counterfactual.values, "s--",
        color=TEAL, linewidth=2, markersize=7,
        label="Counterfactual (no treatment)")
ax.fill_between(counterfactual.index, counterfactual.values,
                treated_means.loc[5:].values, alpha=0.2, color=TEAL,
                label=f"Treatment effect (ATT ≈ {results_2x2.att:.1f})")
ax.axvline(x=4.5, color=LIGHT_TEXT, linestyle="--", linewidth=1.5, alpha=0.7)
ax.set_xlabel("Period")
ax.set_ylabel("Average Outcome")
ax.set_title("DiD Treatment Effect: Observed vs Counterfactual")
ax.legend(loc="upper left")
ax.set_xticks(range(10))
plt.savefig("did_treatment_effect.png", dpi=300, bbox_inches="tight",
            facecolor=DARK_NAVY, edgecolor=DARK_NAVY, pad_inches=0)
plt.show()
```

![Counterfactual plot showing the treated group diverging from its projected path after treatment. The teal shaded area between the actual and counterfactual lines represents the causal effect.](did_treatment_effect.png)

The teal dashed line traces where the treated group would have been without the intervention, constructed by shifting the control group's post-treatment path to match the treated group's pre-treatment level. The shaded gap between the actual treated outcomes (warm orange) and this counterfactual (teal) is the estimated causal effect --- approximately 5.1 units per period. This visualization makes the DiD logic tangible: the control group's trajectory serves as the mirror image of the treated group's no-treatment path, and the extra gain above that mirror is what the policy caused.

## Testing parallel trends

The visual check suggested parallel trends hold, but a formal statistical test provides more rigorous evidence. The [`check_parallel_trends()`](https://diff-diff.readthedocs.io/en/stable/) function compares the pre-treatment time trends of the treated and control groups by estimating a linear slope for each group across the pre-treatment periods, then testing whether the two slopes are statistically different.

```python
pt_result = check_parallel_trends(
    data_2x2,
    outcome="outcome",
    time="period",
    treatment_group="treated",
    pre_periods=[0, 1, 2, 3, 4],
)

print(f"Treated group pre-trend slope:  {pt_result['treated_trend']:.4f}"
      f" (SE = {pt_result['treated_trend_se']:.4f})")
print(f"Control group pre-trend slope:  {pt_result['control_trend']:.4f}"
      f" (SE = {pt_result['control_trend_se']:.4f})")
print(f"Trend difference:               {pt_result['trend_difference']:.4f}"
      f" (SE = {pt_result['trend_difference_se']:.4f})")
print(f"t-statistic:                    {pt_result['t_statistic']:.4f}")
print(f"p-value:                        {pt_result['p_value']:.4f}")
print(f"Parallel trends plausible:      {pt_result['parallel_trends_plausible']}")
```

```
Treated group pre-trend slope:  0.5262 (SE = 0.0839)
Control group pre-trend slope:  0.4047 (SE = 0.0798)
Trend difference:               0.1216 (SE = 0.1158)
t-statistic:                    1.0497
p-value:                        0.2938
Parallel trends plausible:      True
```

The pre-treatment trend slopes are 0.53 for the treated group and 0.40 for the control group --- a difference of 0.12 with a p-value of 0.29. Since p > 0.05, we fail to reject the null hypothesis that the trends are equal, supporting the parallel trends assumption. However, a critical caveat: *failing to reject is not the same as confirming*. The test has limited power, especially with only 5 pre-treatment periods. Even if the trends differed slightly, this test might not detect it. Moreover, [Roth (2022)](https://doi.org/10.1257/aeri.20210236) shows that conditioning on passing a pre-test can distort subsequent inference --- estimated effects may be biased toward zero and confidence intervals may have incorrect coverage. This is why Section 11 introduces HonestDiD, which asks: "How wrong could parallel trends be before our conclusion changes?" That question is more informative than a binary pass/fail test.

## Event study: Dynamic treatment effects

The 2x2 estimator produces a single ATT that averages across all post-treatment periods. But treatment effects often change over time --- they might build up gradually, appear immediately, or fade out. An **event study** (also called dynamic DiD) estimates separate effects for each period relative to treatment, revealing the full trajectory.

The event study extends the basic DiD regression by replacing the single treatment effect $\delta$ with a set of period-specific coefficients --- one for each period before and after treatment:

$$Y\_{it} = \gamma\_i + \lambda\_t + \sum\_{k=-K+1}^{-2} \beta\_k^{lead} D\_{it}^k + \sum\_{k=0}^{L} \beta\_k^{lag} D\_{it}^k + \varepsilon\_{it}$$

Let us unpack each component of this equation:

- $Y\_{it}$ is the outcome for unit $i$ at time $t$ --- the variable we are trying to explain (our `outcome` column).
- $\gamma\_i$ are **unit fixed effects** --- a separate intercept for each unit that absorbs all time-invariant characteristics. For example, if one city always has higher learning scores than another due to demographics or school funding levels, $\gamma\_i$ captures that permanent difference. In practice, this is equivalent to demeaning each unit's outcome by its own time-average.
- $\lambda\_t$ are **time fixed effects** --- a separate intercept for each period that absorbs shocks common to all units at a given time. If a national curriculum reform in period 3 raises learning outcomes for everyone equally, $\lambda\_t$ captures that common shift. Together with unit fixed effects, this implements the "two-way" in TWFE.
- $D\_{it}^k$ is a **relative-time indicator** (also called an event-time dummy): it equals 1 when unit $i$ at time $t$ is exactly $k$ periods away from its treatment onset, and 0 otherwise. For a unit first treated at period 5, we have $D\_{i,3}^{-2} = 1$ (two periods before treatment), $D\_{i,5}^{0} = 1$ (the treatment period itself), $D\_{i,7}^{2} = 1$ (two periods after treatment), and so on.
- $\beta\_k^{lead}$ (for $k = -K+1, \ldots, -2$) are the **lead coefficients** --- pre-treatment effects at each period before treatment. These serve as **placebo tests**: if the treated and control groups were evolving similarly before the intervention, all lead coefficients should be close to zero and statistically insignificant. A significant lead coefficient signals a pre-existing divergence, which would undermine the parallel trends assumption. The summation starts at $k = -K+1$ (the earliest available lead) and stops at $k = -2$, because the period immediately before treatment ($k = -1$) is **omitted as the reference period** and normalized to zero. All other coefficients are estimated relative to this baseline.
- $\beta\_k^{lag}$ (for $k = 0, 1, \ldots, L$) are the **lag coefficients** --- post-treatment effects at each period after treatment onset. The coefficient $\beta\_0^{lag}$ captures the **instantaneous effect** at the moment treatment begins, $\beta\_1^{lag}$ captures the effect one period later, and so on through $\beta\_L^{lag}$ at $L$ periods after treatment. These coefficients trace out the **dynamic treatment effect trajectory**: they reveal whether the effect appears immediately or builds up gradually, whether it persists or fades out, and whether it stabilizes at a constant level or continues to grow.
- $\varepsilon\_{it}$ is the error term, capturing all unobserved factors not absorbed by the fixed effects or treatment indicators.

The key insight is that this single equation simultaneously tests the identifying assumption *and* estimates the treatment effect. The leads ($\beta\_k^{lead}$) test parallel trends period by period, while the lags ($\beta\_k^{lag}$) reveal how the treatment effect evolves over time. In our tutorial, treatment begins at period 5 and the reference period is 4 ($k = -1$), so we have 4 lead coefficients at $k = -5, -4, -3, -2$ (corresponding to periods 0--3) and $L = 4$ lag coefficients at $k = 0, 1, 2, 3, 4$ (corresponding to periods 5--9).

The [`MultiPeriodDiD()`](https://diff-diff.readthedocs.io/en/stable/) estimator fits this specification, using one pre-treatment period as the reference point.

```python
event = MultiPeriodDiD()
results_event = event.fit(
    data_2x2,
    outcome="outcome",
    treatment="treated",
    time="period",
    post_periods=[5, 6, 7, 8, 9],
    reference_period=4,
)
results_event.print_summary()
```

```
================================================================================
           Multi-Period Difference-in-Differences Estimation Results
================================================================================

Observations:                   1000
Treated observations:            500
Control observations:            500
Pre-treatment periods:             5
Post-treatment periods:            5
R-squared:                    0.7648

--------------------------------------------------------------------------------
                   Pre-Period Effects (Parallel Trends Test)
--------------------------------------------------------------------------------
Period              Estimate    Std. Err.     t-stat      P>|t|   Sig.
--------------------------------------------------------------------------------
0                    -0.5167       0.5121     -1.009     0.3132
1                    -0.5050       0.5031     -1.004     0.3157
2                    -0.2804       0.5228     -0.536     0.5919
3                    -0.3227       0.5187     -0.622     0.5340
[ref: 4]               0.0000          ---        ---        ---
--------------------------------------------------------------------------------

--------------------------------------------------------------------------------
                         Post-Period Treatment Effects
--------------------------------------------------------------------------------
Period              Estimate    Std. Err.     t-stat      P>|t|   Sig.
--------------------------------------------------------------------------------
5                     4.6509       0.5162      9.011     0.0000    ***
6                     4.8285       0.5227      9.238     0.0000    ***
7                     4.6907       0.5068      9.255     0.0000    ***
8                     4.7888       0.4908      9.757     0.0000    ***
9                     5.0244       0.5203      9.657     0.0000    ***
--------------------------------------------------------------------------------

--------------------------------------------------------------------------------
                 Average Treatment Effect (across post-periods)
--------------------------------------------------------------------------------
Parameter           Estimate    Std. Err.     t-stat      P>|t|   Sig.
--------------------------------------------------------------------------------
Avg ATT               4.7967       0.3923     12.227     0.0000    ***
--------------------------------------------------------------------------------

95% Confidence Interval: [4.0269, 5.5665]

Signif. codes: '***' 0.001, '**' 0.01, '*' 0.05, '.' 0.1
================================================================================
```

The pre-treatment coefficients (periods 0--3) are all small and statistically insignificant, ranging from -0.52 to -0.28 with p-values well above 0.05. This confirms that the treated and control groups were evolving similarly before the intervention --- the period-by-period placebo test passes. In contrast, all five post-treatment effects (periods 5--9) are large and highly significant, ranging from 4.65 to 5.02 with t-statistics above 9.0. The average ATT across post periods is 4.80 with a 95% CI of [4.03, 5.57], consistent with the true effect of 5.0. The effects are remarkably stable over time, indicating no fade-out or build-up --- the treatment shifts outcomes by roughly 5 units immediately and maintains that shift.

The event study plot below makes these dynamics visible:

```python
es_df = results_event.to_dataframe()

fig, ax = plt.subplots(figsize=(9, 5))
fig.patch.set_linewidth(0)
pre = es_df[~es_df["is_post"]]
post = es_df[es_df["is_post"]]

ax.errorbar(pre["period"], pre["effect"], yerr=1.96 * pre["se"],
            fmt="o", color=STEEL_BLUE, capsize=4, linewidth=2,
            markersize=8, label="Pre-treatment")
ax.errorbar(post["period"], post["effect"], yerr=1.96 * post["se"],
            fmt="s", color=WARM_ORANGE, capsize=4, linewidth=2,
            markersize=8, label="Post-treatment")

# Reference period
ax.plot(4, 0, "D", color=WHITE_TEXT, markersize=10, zorder=5,
        label="Reference period")

ax.axhline(y=0, color=LIGHT_TEXT, linewidth=1, alpha=0.5)
ax.axvline(x=4.5, color=LIGHT_TEXT, linestyle="--", linewidth=1.5, alpha=0.5)
ax.axhline(y=5.0, color=TEAL, linestyle=":", linewidth=1.5, alpha=0.7,
           label="True effect (5.0)")
ax.set_xlabel("Period")
ax.set_ylabel("Estimated Effect")
ax.set_title("Event Study: Dynamic Treatment Effects")
ax.legend(loc="upper left")
ax.set_xticks(range(10))
plt.savefig("did_event_study.png", dpi=300, bbox_inches="tight",
            facecolor=DARK_NAVY, edgecolor=DARK_NAVY, pad_inches=0)
plt.show()
```

![Event study plot with pre-treatment coefficients clustered near zero and post-treatment coefficients jumping to approximately 5.0. Confidence intervals shown for each period.](did_event_study.png)

The event study plot tells the DiD story at a glance. Pre-treatment coefficients (steel blue circles) hover near the zero line, their confidence intervals all crossing zero --- this is the visual signature of valid parallel trends. At the treatment cutoff (dashed vertical line), the estimates jump sharply to around 5.0 (warm orange squares), and the teal dotted line at 5.0 shows that every post-treatment estimate is close to the true effect. The confidence intervals in the post-treatment period are narrow and well above zero, confirming both statistical significance and accuracy.

With the classic 2x2 case established, the next question is: what happens when different units adopt treatment at different times?

## Staggered adoption: Why TWFE fails

In many real-world policies, treatment does not begin simultaneously for all units. AI tutoring platforms roll out city by city, digital infrastructure investments phase in over years, and educational technology grants expand district by district. This is **staggered adoption** --- different units start treatment at different times.

The traditional approach is **Two-Way Fixed Effects (TWFE)** regression, which estimates a single treatment coefficient using unit and time fixed effects:

$$Y\_{it} = \gamma\_i + \lambda\_t + \delta \cdot D\_{it} + \varepsilon\_{it}$$

Here $\gamma\_i$ absorbs all time-invariant unit characteristics (unit fixed effects), $\lambda\_t$ absorbs all common time shocks (time fixed effects), $D\_{it}$ is a treatment indicator that equals 1 when unit $i$ is treated at time $t$, and $\delta$ is the single treatment effect that TWFE estimates. With a single treatment period, $\delta$ correctly recovers the ATT. But with staggered timing, the single coefficient $\delta$ is a weighted average of many underlying 2x2 comparisons --- and some of those comparisons are problematic.

The problem is that TWFE makes **forbidden comparisons**: it implicitly uses already-treated units as controls for newly-treated units. If treatment effects grow over time, these forbidden comparisons produce negative bias, pulling the overall estimate downward. Think of it this way: if early adopters have been benefiting from treatment for three years and their outcomes have grown substantially, TWFE compares newly-treated units to these high-performing early adopters. The newly-treated units look *worse* by comparison, even though they are genuinely benefiting from treatment. In extreme cases with heterogeneous treatment effects across cohorts, TWFE can even assign **negative weights** to some 2x2 comparisons, potentially flipping the sign of the estimate opposite to every unit's true treatment effect (this does not occur in our example, but is documented in [de Chaisemartin & D'Haultfoeuille, 2020](https://doi.org/10.1257/aer.20181169)).

### Generating staggered adoption data

The [`generate_staggered_data()`](https://diff-diff.readthedocs.io/en/stable/) function creates a panel with multiple treatment cohorts --- groups of units that begin treatment in different periods --- plus a never-treated group.

```python
data_stag = generate_staggered_data(
    n_units=300,
    n_periods=10,
    seed=RANDOM_SEED,
)

print(f"Dataset shape: {data_stag.shape}")
cohorts = data_stag.groupby("first_treat")["unit"].nunique()
print(f"\nCohort sizes:")
for ft, n in cohorts.items():
    label = "Never-treated" if ft == 0 else f"First treated in period {ft}"
    print(f"  {label}: {n} units")
print(f"\nTotal units: {cohorts.sum()}")
```

```
Dataset shape: (3000, 7)

Cohort sizes:
  Never-treated: 90 units
  First treated in period 3: 60 units
  First treated in period 5: 75 units
  First treated in period 7: 75 units

Total units: 300
```

The staggered panel has 3,000 observations (300 units across 10 periods). Three treatment cohorts adopt at different times: 60 units start treatment in period 3, 75 in period 5, and 75 in period 7. Another 90 units are never treated, serving as a clean control group. The `first_treat` column records when each unit first received treatment (0 for never-treated). This staggered structure is where naive TWFE breaks down, as the next section demonstrates.

### Exploring the staggered dataset

The staggered dataset has a richer structure than the 2x2 case. Inspecting the first rows reveals additional columns:

```python
data_stag.head(10)
```

```
 unit  period   outcome  first_treat  treated  treat  true_effect
    0       0 11.278161            0        0      0          0.0
    0       1 11.835615            0        0      0          0.0
    0       2 11.542112            0        0      0          0.0
    0       3 11.716260            0        0      0          0.0
    0       4 12.289791            0        0      0          0.0
    0       5 10.978501            0        0      0          0.0
    0       6 11.426795            0        0      0          0.0
    0       7 11.433938            0        0      0          0.0
    0       8 11.108223            0        0      0          0.0
    0       9 12.035899            0        0      0          0.0
```

Unit 0 is never-treated, so all indicators stay at zero across all 10 periods. To understand the staggered structure, we need to see what happens to treated units. The columns have distinct roles:

- **`first_treat`**: the period when a unit first receives treatment (0 = never treated)
- **`treat`**: **time-invariant** group membership --- equals 1 for any unit *ever* assigned to treatment, 0 for never-treated
- **`treated`**: **time-varying** post-treatment indicator --- equals 0 before treatment onset and switches to 1 at `first_treat`
- **`true_effect`**: the known ground-truth treatment effect at each period, used for verification

The distinction between `treat` and `treated` is crucial: `treat` tells you *who* is in the treatment group (a permanent label), while `treated` tells you *when* they are actually under treatment (a dynamic state). For never-treated units, both are always 0. For treated units, `treat` is always 1, but `treated` flips from 0 to 1 at the unit's treatment onset.

An early-treated unit from cohort 3 illustrates this structure:

```python
early_unit = data_stag[data_stag["first_treat"] == 3]["unit"].iloc[0]
data_stag[data_stag["unit"] == early_unit]
```

```
 unit  period   outcome  first_treat  treated  treat  true_effect
   90       0 13.299816            3        0      1          0.0
   90       1 12.897337            3        0      1          0.0
   90       2 11.882534            3        0      1          0.0
   90       3 14.724679            3        1      1          2.0
   90       4 16.139340            3        1      1          2.2
   90       5 14.433891            3        1      1          2.4
   90       6 15.949127            3        1      1          2.6
   90       7 15.832888            3        1      1          2.8
   90       8 17.125174            3        1      1          3.0
   90       9 16.685332            3        1      1          3.2
```

Unit 90 has `treat=1` throughout (it belongs to the treatment group), but `treated` flips from 0 to 1 at period 3 --- the moment it enters the post-treatment state. The `true_effect` is 0 in the pre-treatment periods, then starts at 2.0 and grows by 0.2 each period, reaching 3.2 by period 9. This growing effect pattern is what makes staggered DiD challenging: the treatment effect for cohort 3 at period 7 (2.8) is very different from the effect at period 3 (2.0).

Now compare with a late-treated unit from cohort 7:

```python
late_unit = data_stag[data_stag["first_treat"] == 7]["unit"].iloc[0]
data_stag[data_stag["unit"] == late_unit]
```

```
 unit  period   outcome  first_treat  treated  treat  true_effect
   91       0  7.987886            7        0      1          0.0
   91       1  8.168639            7        0      1          0.0
   91       2  8.904022            7        0      1          0.0
   91       3  7.984438            7        0      1          0.0
   91       4  8.373931            7        0      1          0.0
   91       5  7.543381            7        0      1          0.0
   91       6  8.981115            7        0      1          0.0
   91       7 10.105654            7        1      1          2.0
   91       8 10.505532            7        1      1          2.2
   91       9 11.074785            7        1      1          2.4
```

Unit 91 also has `treat=1` throughout, but `treated` does not flip until period 7 --- giving it a much longer pre-treatment phase (7 periods vs 3 for cohort 3) and only 3 post-treatment periods. Its `true_effect` starts at 2.0 at period 7 and reaches only 2.4 by period 9, compared to cohort 3's 3.2. This asymmetry --- early cohorts accumulating larger effects over more post-treatment periods --- is precisely what causes TWFE to produce biased estimates when it uses already-treated cohort 3 units as "controls" for cohort 7.

Let us examine how the staggered structure differs from the 2x2 case in scale and treatment coverage. With multiple cohorts adopting at different times, the fraction of observations in post-treatment state is no longer 50%:

```python
data_stag.describe()
```

```
              unit      period      outcome  first_treat      treated        treat  true_effect
count  3000.000000  3000.00000  3000.000000  3000.000000  3000.000000  3000.000000  3000.000000
mean    149.500000     4.50000    11.287067     3.600000     0.340000     0.700000     0.829000
std      86.616497     2.87276     2.528589     2.709695     0.473788     0.458334     1.173464
min       0.000000     0.00000     4.521385     0.000000     0.000000     0.000000     0.000000
25%      74.750000     2.00000     9.461867     0.000000     0.000000     0.000000     0.000000
50%     149.500000     4.50000    11.107083     4.000000     0.000000     1.000000     0.000000
75%     224.250000     7.00000    13.078036     5.500000     1.000000     1.000000     2.200000
max     299.000000     9.00000    20.616391     7.000000     1.000000     1.000000     3.200000
```

With 3,000 observations and 300 units, this panel is three times larger than the 2x2 case. The `first_treat` variable has a mean of 3.60, reflecting the mix of never-treated (0) and cohorts treated at periods 3, 5, and 7. The `treated` mean of 0.34 tells us that 34% of all unit-period observations are in a post-treatment state --- less than half because late cohorts contribute fewer treated periods than early cohorts.

A crosstab of the number of **treated** (post-treatment) units by cohort and period reveals the staggered rollout:

```python
pd.crosstab(data_stag["first_treat"], data_stag["period"],
            values=data_stag["treated"], aggfunc="sum").fillna(0).astype(int)
```

```
period       0  1  2   3   4   5   6   7   8   9
first_treat
0            0  0  0   0   0   0   0   0   0   0
3            0  0  0  60  60  60  60  60  60  60
5            0  0  0   0   0  75  75  75  75  75
7            0  0  0   0   0   0   0  75  75  75
```

The staggered structure is immediately visible: zeros cascade to treatment counts as each cohort enters the post-treatment state. At period 2, no units are yet treated. At period 3, 60 units from cohort 3 enter treatment. At period 5, cohort 5 adds 75 more, bringing the total to 135. By period 7, all 210 treated units are in post-treatment. The never-treated group (row 0) remains at zero throughout. This growing treated population --- and the fact that cohort 3 has been treated for 4 periods by the time cohort 7 starts --- is the asymmetry that makes TWFE unreliable. When TWFE uses cohort 3 as a "control" for cohort 7, it compares against units whose outcomes already incorporate a treatment effect of 2.8, not the untreated counterfactual.

The pivoted outcome means by cohort and period reveal the staggered treatment pattern:

```python
data_stag.groupby(["first_treat", "period"])["outcome"].mean().unstack()
```

```
period          0     1     2     3     4     5     6     7     8     9
first_treat
0            9.92  9.95 10.17 10.28 10.40 10.46 10.53 10.68 10.78 10.88
3           10.39 10.51 10.59 12.82 13.07 13.33 13.60 13.99 14.22 14.56
5           10.08 10.17 10.33 10.32 10.58 12.70 12.90 13.11 13.64 13.77
7            9.61  9.76  9.73 10.04 10.00 10.10 10.35 12.25 12.59 12.91
```

All four cohorts track closely in their pre-treatment periods (values near 9.6--10.6 in periods 0--2), confirming parallel pre-trends. The divergence is sharp and cohort-specific: cohort 3 jumps at period 3 (from 10.59 to 12.82), cohort 5 jumps at period 5 (from 10.58 to 12.70), and cohort 7 jumps at period 7 (from 10.35 to 12.25). The never-treated group follows a smooth, gentle upward trend throughout. By period 9, all treated cohorts have outcomes around 12.9--14.6, substantially above the never-treated group's 10.88 --- but they arrived at those levels at different times.

The line plot below visualizes these divergent trajectories:

```python
cohort_means = data_stag.groupby(["first_treat", "period"])["outcome"].mean().unstack(level=0)
cohort_colors = {0: STEEL_BLUE, 3: WARM_ORANGE, 5: TEAL, 7: WHITE_TEXT}
cohort_labels = {0: "Never-treated", 3: "Cohort 3", 5: "Cohort 5", 7: "Cohort 7"}

fig, ax = plt.subplots(figsize=(9, 5))
fig.patch.set_linewidth(0)
for ft in sorted(cohort_means.columns):
    ax.plot(cohort_means.index, cohort_means[ft], "o-",
            color=cohort_colors[ft], linewidth=2, markersize=6,
            label=cohort_labels[ft])
# Vertical lines at treatment onsets
for ft in [3, 5, 7]:
    ax.axvline(x=ft - 0.5, color=cohort_colors[ft], linestyle="--",
               linewidth=1.2, alpha=0.5)
ax.set_xlabel("Period")
ax.set_ylabel("Mean Outcome")
ax.set_title("Staggered Adoption: Cohort Mean Outcomes Over Time")
ax.legend(loc="upper left")
ax.set_xticks(range(10))
plt.savefig("did_staggered_trends.png", dpi=300, bbox_inches="tight",
            facecolor=DARK_NAVY, edgecolor=DARK_NAVY, pad_inches=0)
plt.show()
```

![Line plot showing four cohorts tracking together before treatment, then diverging upward at their respective treatment onset periods. Dashed vertical lines mark each cohort's treatment timing.](did_staggered_trends.png)

The plot makes the staggered adoption pattern unmistakable. All four lines run in parallel during the early pre-treatment periods, then each treated cohort jumps upward at its treatment onset (marked by a dashed vertical line in the corresponding color). Cohort 3 (warm orange) diverges first at period 3, followed by cohort 5 (teal) at period 5, and cohort 7 (near black) at period 7. The never-treated group (steel blue) continues its steady, gentle upward trend without any jump. This visualization explains *why TWFE fails*: between periods 3 and 7, TWFE uses cohort 3 (already treated and elevated) as a comparison for cohort 7 (not yet treated). Since cohort 3's outcomes are inflated by treatment, the comparison underestimates cohort 7's true effect when it eventually adopts.

### Bacon decomposition: Diagnosing TWFE

The **Goodman-Bacon decomposition** ([Goodman-Bacon, 2021](https://doi.org/10.1016/j.jeconom.2021.03.014)) reveals exactly how TWFE constructs its estimate. The key insight is that the TWFE coefficient $\hat{\delta}$ is a weighted average of all possible 2x2 DiD comparisons between pairs of treatment cohorts:

$$\hat{\delta}^{TWFE} = \sum\_{k} s\_{kU} \hat{\delta}\_{kU} + \sum\_{e \neq U} \sum\_{l > e} \big( s\_{el} \hat{\delta}\_{el} + s\_{le} \hat{\delta}\_{le} \big)$$

The first sum covers **clean comparisons** between each treated cohort $k$ and the never-treated group $U$, weighted by $s\_{kU}$. The double sum covers comparisons between pairs of treated cohorts: $\hat{\delta}\_{el}$ compares earlier-treated ($e$) against later-treated ($l$) units, and $\hat{\delta}\_{le}$ compares later-treated against earlier-treated units. The weights $s$ are proportional to each subsample's size and the variance of the treatment indicator within each pair --- groups treated in the middle of the panel receive the most weight. Crucially, the weights sum to one, so the TWFE estimate is a proper weighted average.

The three types of comparisons have very different reliability:

1. **Treated vs never-treated** ($\hat{\delta}\_{kU}$): Clean comparisons using permanently untreated units as controls. These are the gold standard.
2. **Earlier vs later treated** ($\hat{\delta}\_{el}$): Uses not-yet-treated units as controls. Valid as long as treatment has not yet affected the later cohort.
3. **Later vs earlier treated** ($\hat{\delta}\_{le}$): The **forbidden comparisons**. Uses already-treated units as controls. If treatment effects evolve over time, these comparisons are contaminated because the "controls" are themselves experiencing treatment effects.

```python
bacon = BaconDecomposition()
bacon_results = bacon.fit(
    data_stag, outcome="outcome", unit="unit",
    time="period", first_treat="first_treat",
)
bacon_results.print_summary()
```

```
=====================================================================================
                 Goodman-Bacon Decomposition of Two-Way Fixed Effects
=====================================================================================

Total observations:                       3000
Treatment timing groups:                     3
Never-treated units:                        90
Total 2x2 comparisons:                       9

-------------------------------------------------------------------------------------
                                  TWFE Decomposition
-------------------------------------------------------------------------------------

TWFE Estimate:                            2.1822
Weighted Sum of 2x2 Estimates:            2.1052
Decomposition Error:                    0.076977

-------------------------------------------------------------------------------------
                         Weight Breakdown by Comparison Type
-------------------------------------------------------------------------------------
Comparison Type                      Weight   Avg Effect Contribution
-------------------------------------------------------------------------------------
Treated vs Never-treated             0.4331       2.3745       1.0284
Earlier vs Later treated             0.2836       2.1999       0.6238
Later vs Earlier (forbidden)         0.2834       1.5989       0.4531
-------------------------------------------------------------------------------------
Total                                1.0000                    2.1052
-------------------------------------------------------------------------------------

WARNING: 28.3% of weight is on 'forbidden' comparisons where
already-treated units serve as controls. This can bias TWFE
when treatment effects are heterogeneous over time.

Consider using Callaway-Sant'Anna or other robust estimators.

=====================================================================================
```

The decomposition reveals that 28.3% of TWFE's weight falls on forbidden comparisons --- cases where already-treated units serve as controls. These forbidden comparisons produce an average effect of only 1.60, substantially lower than the 2.37 from clean treated-vs-never-treated comparisons. This downward pull drags the TWFE estimate to 2.18, below the true treatment effect. The clean comparisons (treated vs never-treated) account for 43.3% of the weight and produce the most reliable estimates, while the earlier-vs-later comparisons (28.4% weight) sit in between. The decomposition error of 0.08 reflects higher-order interaction terms that the 2x2 decomposition does not fully capture.

The following plot visualizes the decomposition:

```python
bacon_df = bacon_results.to_dataframe()

fig, axes = plt.subplots(1, 2, figsize=(14, 5))
fig.patch.set_linewidth(0)

# Left panel: scatter by comparison type
type_colors = {
    "Treated vs Never-treated": STEEL_BLUE,
    "Earlier vs Later treated": WARM_ORANGE,
    "Later vs Earlier (forbidden)": "#e8856c",
    "treated_vs_never": STEEL_BLUE,
    "earlier_vs_later": WARM_ORANGE,
    "later_vs_earlier": "#e8856c",
}
for comp_type in bacon_df["comparison_type"].unique():
    subset = bacon_df[bacon_df["comparison_type"] == comp_type]
    color = type_colors.get(comp_type, LIGHT_TEXT)
    axes[0].scatter(subset["weight"], subset["estimate"],
                    s=80, color=color, alpha=0.7, edgecolors=DARK_NAVY,
                    label=comp_type)
axes[0].axhline(y=bacon_results.twfe_estimate, color=WHITE_TEXT,
                linestyle="--", linewidth=1.5, alpha=0.7,
                label=f"TWFE = {bacon_results.twfe_estimate:.2f}")
axes[0].set_xlabel("Weight")
axes[0].set_ylabel("2×2 DiD Estimate")
axes[0].set_title("Bacon Decomposition: Individual Comparisons")
axes[0].legend(fontsize=9, loc="lower right")

# Right panel: bar chart of weights by type
type_summary = bacon_df.groupby("comparison_type").agg(
    weight=("weight", "sum"),
    avg_effect=("estimate", lambda x: np.average(
        x, weights=bacon_df.loc[x.index, "weight"])),
).reset_index()
bar_colors = [type_colors.get(t, LIGHT_TEXT)
              for t in type_summary["comparison_type"]]
axes[1].barh(range(len(type_summary)), type_summary["weight"],
             color=bar_colors, edgecolor=DARK_NAVY, height=0.6)
axes[1].set_yticks(range(len(type_summary)))
axes[1].set_yticklabels(type_summary["comparison_type"], fontsize=10)
axes[1].set_xlabel("Total Weight")
axes[1].set_title("Weight Distribution by Comparison Type")

for i, (w, e) in enumerate(zip(type_summary["weight"],
                                type_summary["avg_effect"])):
    axes[1].text(w + 0.01, i, f"{w:.1%} (avg = {e:.2f})",
                 va="center", fontsize=10)

plt.tight_layout()
plt.savefig("did_bacon_decomposition.png", dpi=300, bbox_inches="tight",
            facecolor=DARK_NAVY, edgecolor=DARK_NAVY, pad_inches=0)
plt.show()
```

![Two-panel Bacon decomposition plot. Left: scatter of individual 2x2 estimates colored by comparison type with TWFE reference line. Right: horizontal bars showing total weight by comparison type.](did_bacon_decomposition.png)

The left panel shows each individual 2x2 comparison as a point, colored by type. The forbidden comparisons (dark orange) cluster at lower effect estimates than the clean comparisons (steel blue), visually demonstrating how they pull TWFE downward. The right panel makes the weight problem stark: nearly a third of the total weight goes to comparisons where already-treated units masquerade as controls. For a policymaker relying on the TWFE estimate of 2.18, this contamination means the reported effect underestimates the true treatment impact.

## Callaway-Sant'Anna: The modern solution

The **Callaway-Sant'Anna (CS) estimator** ([Callaway & Sant'Anna, 2021](https://doi.org/10.1016/j.jeconom.2020.12.001)) avoids forbidden comparisons entirely. Instead of a single pooled regression, CS starts from a fundamental building block --- the **group-time ATT**:

$$ATT(g, t) = E[Y\_t(g) - Y\_t(\infty) \mid G = g], \quad \text{for } t \geq g$$

Here $g$ denotes the cohort (the period when a unit first becomes treated), $t$ is the current calendar period, $Y\_t(g)$ is the potential outcome at time $t$ if first treated in period $g$, and $Y\_t(\infty)$ is the potential outcome under perpetual non-treatment. The conditioning on $G = g$ restricts attention to units in cohort $g$. This yields a separate treatment effect estimate for each combination of cohort and calendar period, using only clean comparisons.

With never-treated controls, the group-time ATT is identified as:

$$ATT(g, t) = E[Y\_t - Y\_{g-1} \mid G = g] - E[Y\_t - Y\_{g-1} \mid G = \infty]$$

In words: take the change in outcomes from the period just before treatment ($g - 1$) to the current period ($t$) for cohort $g$ units, and subtract the same change for never-treated units ($G = \infty$). This is a 2x2 DiD comparison that uses only the never-treated group as controls, eliminating all forbidden comparisons by construction.

### The doubly robust estimator

In practice, Callaway and Sant'Anna implement a **doubly robust** version of this estimator. Before diving into the formal equation, here is the core idea: the doubly robust estimator adjusts the comparison between treated and control units in *two* ways simultaneously --- by reweighting the control group to look more similar to the treated group (inverse-probability weighting), and by directly modeling and subtracting the expected outcome change for controls (outcome regression). Think of it as wearing both a belt *and* suspenders: if either adjustment is correctly specified, the estimate is valid, even if the other one is wrong. This double protection makes the estimator more reliable than methods that rely on a single modeling assumption.

The formal equation combines inverse-probability weighting with an outcome regression adjustment:

$$ATT(g, t) = \mathbb{E}\left[\left(\frac{G\_g}{\mathbb{E}[G\_g]} - \frac{\frac{p\_g(X)}{1-p\_g(X)}}{\mathbb{E}\left[\frac{p\_g(X)}{1-p\_g(X)}\right]}\right)\left(Y\_t - Y\_{g-1} - m\_{g,t}^{nev}(X)\right)\right]$$

This equation multiplies two terms inside the expectation --- a **weighting term** (first parentheses) and an **outcome term** (second parentheses). Let us unpack each one.

**The weighting term:** $\frac{G\_g}{\mathbb{E}[G\_g]} - \frac{\frac{p\_g(X)}{1-p\_g(X)}}{\mathbb{E}\left[\frac{p\_g(X)}{1-p\_g(X)}\right]}$

This term determines *how much each observation contributes* to the ATT estimate. It works differently for treated and control units:

- $G\_g$ is a **group indicator** that equals 1 if the unit belongs to cohort $g$ and 0 otherwise. Dividing by $\mathbb{E}[G\_g]$ (the share of units in cohort $g$) normalizes so that treated units receive equal weight on average. For a treated unit in cohort $g$, the first fraction contributes a positive value; for never-treated units, $G\_g = 0$ so the first fraction is zero.
- $p\_g(X)$ is the **generalized propensity score** --- the probability of being in cohort $g$ (rather than the never-treated group) given covariates $X$. This is estimated via logit regression of cohort membership on covariates. The ratio $\frac{p\_g(X)}{1-p\_g(X)}$ are the odds of being in cohort $g$, and dividing by its expectation normalizes the weights. For never-treated units, this second fraction creates a **negative weight** that is larger for control units whose covariates resemble the treated cohort --- effectively selecting the most comparable controls. For treated units, the two fractions partially cancel, leaving a net positive weight.

The intuition is similar to propensity score matching: if a never-treated city has covariates (population, per-student spending, teacher-student ratio) that look very much like a treated city, it receives a larger (more negative) weight, making it contribute more as a counterfactual. Cities with covariates far from the treated group receive near-zero weight. This **rebalances** the control group so that the covariate distribution of the weighted controls matches that of the treated cohort.

**The outcome term:** $Y\_t - Y\_{g-1} - m\_{g,t}^{nev}(X)$

This term measures the **adjusted outcome change** for each unit:

- $Y\_t - Y\_{g-1}$ is the raw change in outcomes from the baseline period ($g - 1$, the period just before cohort $g$ starts treatment) to the current period $t$. This is the same first difference used in any DiD estimator.
- $m\_{g,t}^{nev}(X)$ is the **outcome regression adjustment** --- the expected change $E[Y\_t - Y\_{g-1} \mid X, G = \infty]$ for never-treated units with covariates $X$. In practice, this is estimated by regressing the outcome change $\Delta Y = Y\_t - Y\_{g-1}$ on covariates $X$ using only the never-treated group. Subtracting $m\_{g,t}^{nev}(X)$ removes the portion of the outcome change that would have occurred *anyway* based on observable characteristics --- even without treatment. What remains is the treatment-induced change that cannot be explained by covariates alone.

Think of it this way: if cities with higher per-student spending tend to improve learning scores faster regardless of AI adoption, $m\_{g,t}^{nev}(X)$ captures that covariate-driven growth trajectory. Subtracting it ensures that the estimated treatment effect is not confounded by differential growth rates across different types of cities.

**Why "doubly robust"?** The estimator combines *both* adjustment strategies --- inverse-probability weighting (through the weighting term) and outcome regression (through $m\_{g,t}^{nev}(X)$). The key advantage is that the ATT estimate is consistent if *either* the propensity score model or the outcome regression model is correctly specified --- both do not need to be right simultaneously. If the propensity score model is wrong but the outcome regression is correct, the $m\_{g,t}^{nev}(X)$ adjustment still removes confounding. If the outcome regression is wrong but the propensity score is correct, the reweighting still produces a valid comparison group. This double layer of protection makes the estimator more reliable in practice than methods relying on a single modeling assumption.

**Note on the no-covariate case:** In this tutorial, we do not pass covariates to `CallawaySantAnna()`. Without covariates, the propensity score $p\_g(X)$ reduces to the unconditional probability of being in cohort $g$ (simply the group share), and $m\_{g,t}^{nev}(X)$ reduces to the simple mean outcome change among never-treated units. The doubly robust estimator then collapses to the basic difference-in-means formula shown earlier. The full equation is presented here because it is the general form that practitioners encounter when working with real data and covariates.

The group-time ATTs are then **aggregated** into summary parameters. Any summary is a weighted average of the building blocks:

$$\theta = \sum\_{g} \sum\_{t \geq g} w\_{g,t} \cdot ATT(g, t), \quad \sum\_{g,t} w\_{g,t} = 1$$

Two aggregations are especially useful. The **overall ATT** weights by cohort size:

$$\theta^{O} = \sum\_{g} \theta(g) \cdot P(G = g), \quad \text{where } \theta(g) = \frac{1}{T - g + 1} \sum\_{t=g}^{T} ATT(g, t)$$

The **event study aggregation** averages across cohorts at each relative time $e$ (periods since treatment onset):

$$\theta\_D(e) = \sum\_{g} ATT(g, g + e) \cdot P(G = g \mid g + e \leq T)$$

This event study aggregation is the CS analogue of the leads-and-lags event study, but free from the forbidden comparison contamination that plagues TWFE-based event studies.

The [`CallawaySantAnna()`](https://diff-diff.readthedocs.io/en/stable/) class takes `control_group` to specify which units serve as controls. Using `"never_treated"` restricts comparisons to units that never received treatment, the cleanest possible counterfactual. The `base_period="universal"` option uses a single reference period ($g - 1$) for all relative time comparisons within each cohort, rather than letting each relative period use its own baseline. This ensures that the pre-treatment coefficients are proper placebo tests: each one measures the outcome change from $g - 1$ to an earlier period, so a coefficient near zero means the treated and control groups were evolving similarly over that specific interval. With a universal base period, the period immediately before treatment ($e = -1$) is normalized to zero by construction.

```python
cs = CallawaySantAnna(control_group="never_treated", base_period="universal")
results_cs = cs.fit(
    data_stag, outcome="outcome", unit="unit",
    time="period", first_treat="first_treat",
    aggregate="event_study",
)
results_cs.print_summary()
```

```
=====================================================================================
            Callaway-Sant'Anna Staggered Difference-in-Differences Results
=====================================================================================

Total observations:                  3000
Treated units:                        210
Never-treated units:                   90
Treatment cohorts:                      3
Time periods:                          10
Control group:                 never_treated
Base period:                    universal

-------------------------------------------------------------------------------------
                   Overall Average Treatment Effect on the Treated
-------------------------------------------------------------------------------------
Parameter           Estimate    Std. Err.     t-stat      P>|t|   Sig.
-------------------------------------------------------------------------------------
ATT                   2.4136       0.0552     43.753     0.0000    ***
-------------------------------------------------------------------------------------

95% Confidence Interval: [2.3055, 2.5217]

-------------------------------------------------------------------------------------
                            Event Study (Dynamic) Effects
-------------------------------------------------------------------------------------
Rel. Period         Estimate    Std. Err.     t-stat      P>|t|   Sig.
-------------------------------------------------------------------------------------
-7                   -0.1344       0.1171     -1.148     0.2510
-6                   -0.0188       0.1126     -0.167     0.8671
-5                   -0.1435       0.0813     -1.766     0.0774      .
-4                   -0.0091       0.0744     -0.122     0.9028
-3                   -0.0697       0.0560     -1.244     0.2134
-2                   -0.0709       0.0631     -1.124     0.2610
-1                    0.0000          nan        nan        nan
0                     1.9713       0.0645     30.551     0.0000    ***
1                     2.1416       0.0577     37.124     0.0000    ***
2                     2.2969       0.0644     35.644     0.0000    ***
3                     2.6763       0.0796     33.642     0.0000    ***
4                     2.7925       0.0800     34.898     0.0000    ***
5                     3.0259       0.1227     24.669     0.0000    ***
6                     3.2663       0.1090     29.961     0.0000    ***
-------------------------------------------------------------------------------------

Signif. codes: '***' 0.001, '**' 0.01, '*' 0.05, '.' 0.1
=====================================================================================
```

The overall CS estimate of the ATT is 2.41 (SE = 0.06, p < 0.001), with a 95% CI of [2.31, 2.52]. This is higher than the TWFE estimate of 2.18, confirming that TWFE was biased downward by the forbidden comparisons. The event study reveals dynamic effects that grow over time: the effect starts at 1.97 in the first period after treatment and increases to 3.27 by six periods post-treatment. This pattern of growing effects is exactly the scenario where TWFE fails most dramatically --- the forbidden comparisons use units with large accumulated effects as controls for newly-treated units, producing a downward-biased average.

With the universal base period, relative period -1 is the reference and is normalized to zero by construction. The remaining pre-treatment estimates all hover near zero --- the largest in magnitude is -0.14 at relative period -5 (p = 0.08), which does not reach significance at the 5% level. None of the seven pre-treatment coefficients are individually significant, providing clean support for the parallel trends assumption. This contrasts with the varying base period specification, where each pre-treatment coefficient uses a different baseline, making the placebo tests harder to interpret collectively.

The event study plot visualizes these dynamics, showing how the treatment effect builds over time relative to treatment onset:

```python
cs_df = results_cs.to_dataframe("event_study")

fig, ax = plt.subplots(figsize=(9, 5))
fig.patch.set_linewidth(0)
pre_cs = cs_df[cs_df["relative_period"] < 0]
post_cs = cs_df[cs_df["relative_period"] >= 0]

ax.errorbar(pre_cs["relative_period"], pre_cs["effect"],
            yerr=1.96 * pre_cs["se"], fmt="o", color=STEEL_BLUE,
            capsize=4, linewidth=2, markersize=8, label="Pre-treatment")
ax.errorbar(post_cs["relative_period"], post_cs["effect"],
            yerr=1.96 * post_cs["se"], fmt="s", color=TEAL,
            capsize=4, linewidth=2, markersize=8, label="Post-treatment")

ax.axhline(y=0, color=LIGHT_TEXT, linewidth=1, alpha=0.5)
ax.axvline(x=-0.5, color=LIGHT_TEXT, linestyle="--", linewidth=1.5, alpha=0.5)
ax.set_xlabel("Periods Relative to Treatment")
ax.set_ylabel("Estimated ATT")
ax.set_title("Callaway-Sant'Anna: Event Study for Staggered Adoption")
ax.legend(loc="upper left")
plt.savefig("did_staggered_att.png", dpi=300, bbox_inches="tight",
            facecolor=DARK_NAVY, edgecolor=DARK_NAVY, pad_inches=0)
plt.show()
```

![Callaway-Sant'Anna event study plot showing pre-treatment effects near zero (with period -1 normalized to zero) and post-treatment effects growing steadily from about 2.0 to 3.3.](did_staggered_att.png)

The CS event study plot shows the hallmark pattern of a valid DiD analysis: pre-treatment coefficients (steel blue) cluster tightly around zero --- with relative period -1 pinned at exactly zero as the universal base period --- then post-treatment coefficients (teal) rise sharply and progressively. The upward slope in the post-treatment period reveals that the treatment effect accumulates over time, growing from roughly 2.0 immediately after treatment to 3.3 six periods later. This dynamic pattern would have been obscured by TWFE's single pooled estimate and further distorted by its forbidden comparisons.

## Choosing the right estimator

With multiple DiD estimators available, the choice depends on the data structure. The following decision flowchart guides the selection:

```mermaid
graph TD
    A["<b>Panel data with<br/>treatment & control</b>"] --> B{"Single treatment<br/>period?"}
    B -->|Yes| C["<b>Classic 2×2 DiD</b><br/>DifferenceInDifferences()"]
    B -->|No| D{"Staggered<br/>adoption?"}
    D -->|"No<br/>(same timing)"| E["<b>Multi-Period DiD</b><br/>MultiPeriodDiD()"]
    D -->|Yes| F{"Never-treated<br/>group available?"}
    F -->|Yes| G["<b>Callaway-Sant'Anna</b><br/>CallawaySantAnna()"]
    F -->|No| H["<b>Sun-Abraham / Stacked DiD</b><br/>SunAbraham() / StackedDiD()<br/><i>(not covered here)</i>"]

    style A fill:#141413,stroke:#141413,color:#fff
    style B fill:#6a9bcc,stroke:#141413,color:#fff
    style C fill:#00d4c8,stroke:#141413,color:#fff
    style D fill:#6a9bcc,stroke:#141413,color:#fff
    style E fill:#00d4c8,stroke:#141413,color:#fff
    style F fill:#6a9bcc,stroke:#141413,color:#fff
    style G fill:#00d4c8,stroke:#141413,color:#fff
    style H fill:#d97757,stroke:#141413,color:#fff
```

The following table summarizes when to use each estimator:

| Scenario | Estimator | Advantage |
|----------|-----------|-----------|
| Single treatment time, 2 groups | `DifferenceInDifferences()` | Simplest, most transparent |
| Single treatment time, many periods | `MultiPeriodDiD()` | Period-by-period effects, pre-trend test |
| Staggered, never-treated available | `CallawaySantAnna()` | Clean comparisons, flexible aggregation |
| Staggered, no never-treated group | `SunAbraham()` | Interaction-weighted, uses not-yet-treated |
| Diagnosing TWFE bias | `BaconDecomposition()` | Reveals forbidden comparison weights |

The decision logic is straightforward: if all treated units start at the same time, use the classic estimator or the multi-period event study. If treatment timing varies, use Callaway-Sant'Anna (or Sun-Abraham if no never-treated group exists). Always run Bacon decomposition on TWFE results to check for contamination from forbidden comparisons. The `diff-diff` package also offers `SyntheticDiD()`, `ImputationDiD()`, and `ContinuousDiD()` for specialized settings, but the estimators above cover the vast majority of applied research.

## Sensitivity analysis: HonestDiD

Every DiD analysis rests on parallel trends --- but this assumption is fundamentally **untestable** for the post-treatment period. Pre-treatment trend tests (Section 6) check whether trends were parallel *before* treatment, but they cannot guarantee that trends would have remained parallel *after* treatment in the absence of the intervention. A new regulation might coincide with an economic downturn that affects treated regions differently, violating parallel trends even though pre-trends looked clean.

**HonestDiD** ([Rambachan & Roth, 2023](https://doi.org/10.1093/restud/rdad018)) addresses this problem directly. Instead of assuming parallel trends hold exactly, it bounds the degree of violation using a **relative magnitudes restriction**. Let $\delta\_t = E[Y^0\_t - Y^0\_{t-1} \mid G = g] - E[Y^0\_t - Y^0\_{t-1} \mid G = \infty]$ denote the parallel trends violation at period $t$ --- the difference in untreated outcome trends between the treated cohort and the never-treated group. HonestDiD constrains the post-treatment violations relative to the largest pre-treatment violation:

$$|\delta\_t| \leq M \cdot \max\_{t' < g} |\delta\_{t'}|, \quad \text{for all } t \geq g$$

The parameter $M$ controls the degree of allowed departure. At $M = 0$, the method assumes perfect parallel trends ($\delta\_t = 0$ for all post-treatment periods) and recovers the standard CI. As $M$ increases, it allows for progressively larger post-treatment violations, widening the robust CI. The **breakdown value** of $M$ is where the CI first includes zero --- the point at which the treatment conclusion becomes fragile.

Think of $M$ as a stress test dial. Turning it up to $M = 1$ says: "The worst post-treatment violation could be as large as the worst thing we saw pre-treatment." Turning it to $M = 5$ says: "The violation could be five times worse." If the effect remains significant even at high $M$, the finding is genuinely robust.

```python
M_values = [0.0, 0.5, 1.0, 1.5, 2.0, 3.0, 4.0, 5.0, 7.0, 10.0, 12.0, 15.0]
sensitivity = []
for M in M_values:
    honest = HonestDiD(method="relative_magnitude", M=M)
    hres = honest.fit(results_cs)
    sensitivity.append({
        "M": M,
        "ci_lb": hres.ci_lb,
        "ci_ub": hres.ci_ub,
        "significant": hres.ci_lb > 0,
    })
    print(f"M = {M:.1f}: CI = [{hres.ci_lb:.4f}, {hres.ci_ub:.4f}]"
          f"  {'significant' if hres.ci_lb > 0 else 'includes zero'}")

sens_df = pd.DataFrame(sensitivity)

# Find breakdown point
breakdown_M = (sens_df[~sens_df["significant"]]["M"].min()
               if not sens_df["significant"].all()
               else sens_df["M"].max())
print(f"\nBreakdown value of M: {breakdown_M:.1f}")
```

```
M = 0.0: CI = [2.5324, 2.6592]  significant
M = 0.5: CI = [2.4606, 2.7310]  significant
M = 1.0: CI = [2.3889, 2.8028]  significant
M = 1.5: CI = [2.3171, 2.8745]  significant
M = 2.0: CI = [2.2453, 2.9463]  significant
M = 3.0: CI = [2.1018, 3.0898]  significant
M = 4.0: CI = [1.9583, 3.2334]  significant
M = 5.0: CI = [1.8148, 3.3769]  significant
M = 7.0: CI = [1.5277, 3.6639]  significant
M = 10.0: CI = [1.0971, 4.0945]  significant
M = 12.0: CI = [0.8101, 4.3816]  significant
M = 15.0: CI = [0.3795, 4.8122]  significant

Breakdown value of M: 15.0
```

At $M = 0$ (perfect parallel trends), the CI is narrow: [2.53, 2.66]. As $M$ increases, the CI widens symmetrically. At $M = 10$, the lower bound remains comfortably positive (1.10), and even at $M = 15$, it barely stays above zero (0.38). The breakdown value exceeds $M = 15$ --- the treatment effect remains statistically significant even if post-treatment violations of parallel trends are more than 15 times larger than the worst pre-treatment deviation. This is exceptionally robust --- in practice, a breakdown value above $M = 3$ is considered strong evidence that the finding is not driven by parallel trends violations. The improvement over the varying base period specification (which had a breakdown of $M = 12$) reflects the universal base period's tighter pre-treatment estimates, which give HonestDiD a smaller "worst pre-treatment deviation" to scale against.

The sensitivity plot maps the robust CI as a function of $M$, making the breakdown point visually apparent:

```python
fig, ax = plt.subplots(figsize=(9, 5))
fig.patch.set_linewidth(0)
ax.fill_between(sens_df["M"], sens_df["ci_lb"], sens_df["ci_ub"],
                alpha=0.25, color=STEEL_BLUE, label="95% Robust CI")
ax.plot(sens_df["M"], sens_df["ci_lb"], "-", color=STEEL_BLUE, linewidth=2)
ax.plot(sens_df["M"], sens_df["ci_ub"], "-", color=STEEL_BLUE, linewidth=2)
ax.axhline(y=0, color=LIGHT_TEXT, linewidth=1.5, alpha=0.7)

att_val = results_cs.overall_att
ax.axhline(y=att_val, color=TEAL, linestyle=":", linewidth=1.5,
           alpha=0.7, label=f"Overall ATT = {att_val:.2f}")
ax.axvline(x=breakdown_M, color=WARM_ORANGE, linestyle="--",
           linewidth=2, alpha=0.8,
           label=f"Breakdown (M = {breakdown_M:.1f})")

ax.set_xlabel("Sensitivity Parameter M\n"
              "(maximum post-treatment violation relative to "
              "largest pre-treatment violation)")
ax.set_ylabel("Treatment Effect (ATT)")
ax.set_title("HonestDiD Sensitivity Analysis: Robustness of the ATT")
ax.legend(loc="upper left")
plt.savefig("did_honest_sensitivity.png", dpi=300, bbox_inches="tight",
            facecolor=DARK_NAVY, edgecolor=DARK_NAVY, pad_inches=0)
plt.show()
```

![HonestDiD sensitivity plot showing the 95% robust CI widening as M increases. The CI band is steel blue, the ATT is a teal dotted line, and the breakdown point at M=15 is marked with an orange dashed line.](did_honest_sensitivity.png)

The sensitivity plot tells the robustness story at a glance. The steel blue band shows the 95% robust CI expanding as $M$ grows --- allowing for larger violations of parallel trends. The teal dotted line marks the overall ATT of 2.41, which sits comfortably within the CI for all values of $M$. The warm orange dashed line at $M = 15$ marks the boundary of our grid, with the lower CI bound still positive (0.38) at that point --- the true breakdown lies even further out. In practical terms, the treatment conclusion would only be overturned if post-treatment parallel trend violations were more than 15 times worse than anything observed in the pre-treatment data --- an extreme scenario that would require a dramatic structural break coinciding precisely with the treatment timing.

Best practice is to always report the breakdown value alongside the point estimate. A finding with a breakdown at $M = 0.5$ is fragile --- even mild violations destroy the conclusion. A finding with a breakdown at $M = 15$ or above, as in this example, provides strong evidence that the effect is genuine regardless of moderate parallel trends violations.

## Discussion

Returning to the motivating question --- did AI tutoring actually improve learning? --- the evidence from both the classic and modern DiD estimators is clear: treatment produced a genuine, statistically significant positive effect. In the 2x2 setting, the estimated ATT of 5.12 (95% CI: [4.64, 5.60]) closely matches the true effect of 5.0, confirming that the classic estimator works well when all units start treatment simultaneously. The event study further validates this finding by showing near-zero pre-treatment coefficients (the largest is -0.52 with p = 0.31) and stable post-treatment effects around 4.7--5.0.

The staggered adoption setting reveals a more nuanced picture. Naive TWFE estimation produces a biased estimate of 2.18, pulled downward by the 28.3% weight on forbidden comparisons where already-treated units serve as controls. The Callaway-Sant'Anna estimator corrects this bias, finding an overall ATT of 2.41 --- and the event study shows that the effect is not constant but grows over time, from 1.97 immediately after treatment to 3.27 six periods later. For an education policymaker, this dynamic pattern means the AI initiative's full benefits take time to materialize: evaluating the program too early would underestimate its long-run impact.

The HonestDiD sensitivity analysis provides the final piece of evidence. With a breakdown value exceeding $M = 15$, the treatment conclusion is robust to post-treatment parallel trends violations more than 15 times larger than anything observed pre-treatment. This level of robustness far exceeds the $M = 3$ threshold typically considered strong in applied research. Even a skeptic who doubts the parallel trends assumption would find it difficult to argue that the treatment had no effect.

Two important caveats apply. First, these results use synthetic data with known true effects, so the estimators are guaranteed to work under their assumptions. Real-world applications face additional challenges --- measurement error in learning assessments, spillover effects between treated and control cities (e.g., students in control cities accessing AI tools on their own), and the possibility that AI adoption depends on unobserved factors correlated with learning outcomes. Second, the treatment effects in the staggered dataset grow linearly over time by construction. In practice, effects may follow more complex trajectories --- plateauing, fading out, or accelerating --- which would require careful specification of the event study window and aggregation weights.

## Summary and key takeaways

This tutorial walked through the DiD toolkit from its simplest form to its most robust modern extensions. Four key takeaways emerge:

**Method insight:** DiD targets the **ATT** by using untreated units as a counterfactual for how treated units would have evolved without intervention. The classic 2x2 estimator (ATT = 5.12, SE = 0.25) works well when all units start treatment simultaneously, but staggered adoption requires modern estimators like Callaway-Sant'Anna to avoid TWFE's forbidden comparison bias.

**Data insight:** The classic DiD recovered the true effect of 5.0 within sampling error (95% CI: [4.64, 5.60]). In the staggered setting, TWFE estimated 2.18 while the cleaner CS estimator found 2.41 --- a 10% upward correction driven by eliminating the 28.3% weight on forbidden comparisons that dragged TWFE down. The CS event study further revealed that treatment effects grow over time, from 1.97 immediately after treatment to 3.27 six periods later.

**Practical limitation:** Parallel trends is untestable for the post-treatment period. Pre-treatment tests (p = 0.29 in our example) can only fail to reject, not confirm. HonestDiD provides a principled solution by computing robust confidence intervals under bounded violations. Our breakdown value exceeding $M = 15$ means the conclusion survives violations more than 15 times the worst pre-treatment departure --- exceptionally strong robustness.

**Next steps:** This tutorial used synthetic data --- the 2x2 dataset with a constant treatment effect and the staggered dataset with effects that grow over time. Real-world applications should consider adding covariates to the CS estimator (via the `covariates` argument), exploring continuous treatment intensity with `ContinuousDiD()`, and comparing CS results against `SunAbraham()` or `ImputationDiD()` as robustness checks. The `diff-diff` package supports all of these within the same API.

## Exercises

1. **Null effect test.** Modify the `generate_did_data()` call to set `treatment_effect=0.0`. Run the full 2x2 analysis and event study. Does the estimator correctly find a zero effect? What do the pre- and post-treatment event study coefficients look like?

2. **Covariates in Callaway-Sant'Anna.** Add covariates to the staggered data (e.g., unit-level characteristics) and pass them via the `covariates` argument in `CallawaySantAnna().fit()`. Compare the ATT with and without covariate adjustment. When does covariate adjustment matter most?

3. **Sun-Abraham comparison.** Estimate the staggered treatment effect using `SunAbraham(control_group="never_treated")` instead of `CallawaySantAnna()`. Compare the overall ATT and event study coefficients. Under what conditions do the two estimators differ?

4. **HonestDiD with finer M grid.** Run the sensitivity analysis with `M_values = np.arange(0, 15, 0.5)` to find the exact breakdown point. How does the breakdown change if you use `method="smoothness"` instead of `"relative_magnitude"`?

## References

1. [Callaway, B. & Sant'Anna, P. H. C. (2021). Difference-in-Differences with Multiple Time Periods. *Journal of Econometrics*, 225(2), 200--230.](https://doi.org/10.1016/j.jeconom.2020.12.001)
2. [Gerber, I. (2026). diff-diff: Difference-in-Differences Causal Inference for Python. GitHub repository.](https://github.com/igerber/diff-diff) --- [Documentation](https://diff-diff.readthedocs.io/en/stable/)
3. [Goodman-Bacon, A. (2021). Difference-in-Differences with Variation in Treatment Timing. *Journal of Econometrics*, 225(2), 254--277.](https://doi.org/10.1016/j.jeconom.2021.03.014)
4. [Rambachan, A. & Roth, J. (2023). A More Credible Approach to Parallel Trends. *Review of Economic Studies*, 90(5), 2555--2591.](https://doi.org/10.1093/restud/rdad018)
5. [Roth, J. (2022). Pretest with Caution: Event-Study Estimates after Testing for Parallel Trends. *American Economic Review: Insights*, 4(3), 305--322.](https://doi.org/10.1257/aeri.20210236)
6. [Sun, L. & Abraham, S. (2021). Estimating Dynamic Treatment Effects in Event Studies with Heterogeneous Treatment Effects. *Journal of Econometrics*, 225(2), 175--199.](https://doi.org/10.1016/j.jeconom.2020.09.006)
7. [Card, D. & Krueger, A. B. (1994). Minimum Wages and Employment: A Case Study of the Fast-Food Industry in New Jersey and Pennsylvania. *American Economic Review*, 84(4), 772--793.](https://www.jstor.org/stable/2118030)
8. [Cunningham, S. (2021). *Causal Inference: The Mixtape*. Yale University Press. Chapter 9: Difference-in-Differences.](https://mixtape.scunning.com/09-difference_in_differences)
9. [de Chaisemartin, C. & D'Haultfoeuille, X. (2020). Two-Way Fixed Effects Estimators with Heterogeneous Treatment Effects. *American Economic Review*, 110(9), 2964--2996.](https://doi.org/10.1257/aer.20181169)
10. [Rubin, D. B. (1974). Estimating Causal Effects of Treatments in Randomized and Nonrandomized Studies. *Journal of Educational Psychology*, 66(5), 688--701.](https://doi.org/10.1037/h0037350)

#### Acknowledgements

AI tools (Claude Code, Gemini, NotebookLM) were used to make the contents of this post more accessible to students. Nevertheless, the content in this post may still have errors. Caution is needed when applying the contents of this post to true research projects.
