---
authors:
  - admin
categories:
  - Stata
  - Tutorial
  - Econometrics
draft: false
featured: false
date: "2026-04-04T00:00:00Z"
external_link: ""
image:
  caption: ""
  focal_point: Smart
  placement: 3
links:
- icon: file-code
  icon_pack: fas
  name: "Stata do-file"
  url: analysis.do
- icon: database
  icon_pack: fas
  name: "Savings data (.dta)"
  url: refMaterials/saving.dta
- icon: database
  icon_pack: fas
  name: "Democracy data (.dta)"
  url: refMaterials/democracy.dta
- icon: file-alt
  icon_pack: fas
  name: "Stata log"
  url: analysis.log
slides:
summary: Identify latent group structures in panel data using the Classifier-LASSO method (Su, Shi, Phillips 2016), revealing that the pooled democracy-growth effect of +1.055 masks a +2.151 effect in 57 countries and a -0.936 effect in 41 countries.
tags:
  - stata
  - panel
  - econometrics
  - world
title: "Identifying Latent Group Structures in Panel Data: The classifylasso Command in Stata"
url_code: ""
url_pdf: ""
url_slides: ""
url_video: ""
toc: true
diagram: true
---

## 1. Overview

Do all countries respond the same way to inflation, interest rates, or democratic transitions? Standard panel data models force a stark choice: either assume every country shares the same slope coefficients (pooled or fixed-effects regression) or allow every country to have its own parameters (unit-by-unit estimation). The first approach is too restrictive --- it masks important heterogeneity. The second is too noisy --- with limited time periods, individual estimates are imprecise.

The **Classifier-LASSO** (C-LASSO) method, developed by Su, Shi, and Phillips (2016), offers a middle path. It discovers **latent groups** where slope coefficients are homogeneous within each group but heterogeneous across groups. Think of it like a sorting hat for countries: rather than treating all 98 countries as identical or all as unique, C-LASSO finds that they naturally cluster into a small number of groups with shared behavioral patterns.

This tutorial demonstrates the `classifylasso` Stata command (Huang, Wang, and Zhou 2024) using two applications:

1. **Savings behavior** across 56 countries (1995--2010) --- where we discover that inflation affects savings in opposite directions depending on the country group
2. **Democracy and economic growth** across 98 countries (1970--2010) --- where the pooled estimate that "democracy promotes growth" turns out to mask a striking split: +2.15 in one group of countries and -0.94 in another

**Learning objectives:**

- Understand why assuming homogeneous slopes can be misleading in panel data
- Learn the Classifier-LASSO method for identifying latent group structures
- Implement `classifylasso` in Stata with both static and dynamic specifications
- Use postestimation commands (`classogroup`, `classocoef`, `predict gid`) to visualize and interpret results
- Compare pooled fixed-effects estimates with group-specific C-LASSO estimates

The following diagram summarizes the progression of this tutorial. We begin with data exploration, establish pooled benchmarks, then apply C-LASSO with increasing complexity --- from a simple static model to a dynamic specification with bias correction --- before turning to the policy-relevant democracy application.

```mermaid
graph LR
    A["<b>EDA</b><br/>Savings data"] --> B["<b>Baseline FE</b><br/>Pooled &<br/>fixed effects"]
    B --> C["<b>C-LASSO</b><br/>Static model<br/>(no lagged DV)"]
    C --> D["<b>C-LASSO</b><br/>Dynamic model<br/>(jackknife)"]
    D --> E["<b>Democracy</b><br/>Application<br/>(two-way FE)"]
    E --> F["<b>Comparison</b><br/>Pooled vs<br/>group-specific"]

    style A fill:#141413,stroke:#141413,color:#fff
    style B fill:#6a9bcc,stroke:#141413,color:#fff
    style C fill:#d97757,stroke:#141413,color:#fff
    style D fill:#d97757,stroke:#141413,color:#fff
    style E fill:#00d4c8,stroke:#141413,color:#141413
    style F fill:#1a3a8a,stroke:#141413,color:#fff
```

---

## 2. The Problem: Homogeneous vs Heterogeneous Slopes

### 2.1 Three approaches to slope heterogeneity

Consider a panel dataset with $N$ countries observed over $T$ time periods. The standard fixed-effects model is:

$$y\_{it} = \mu\_i + \boldsymbol{\beta}' \mathbf{x}\_{it} + u\_{it}$$

In words, the outcome $y\_{it}$ for country $i$ at time $t$ depends on country-specific intercepts $\mu\_i$ (fixed effects) and a common slope vector $\boldsymbol{\beta}$ applied to the regressors $\mathbf{x}\_{it}$. The key assumption is that $\boldsymbol{\beta}$ is the **same for all countries**. This may be too restrictive --- countries with different economic structures may respond very differently to the same macroeconomic shocks.

At the other extreme, we could estimate country-by-country regressions, allowing each country its own $\boldsymbol{\beta}\_i$. But with limited time periods (say, $T = 15$), these individual estimates are noisy and we lose the ability to make cross-country comparisons.

C-LASSO introduces a structured middle ground. It assumes that countries belong to $K$ latent groups, where all countries within a group share the same coefficients:

$$\boldsymbol{\beta}\_i = \boldsymbol{\alpha}\_k \quad \text{if} \quad i \in G\_k, \quad k = 1, \ldots, K$$

In words, country $i$'s slope coefficients $\boldsymbol{\beta}\_i$ equal the group-specific parameter $\boldsymbol{\alpha}\_k$ if country $i$ belongs to latent group $G\_k$. The number of groups $K$, the group memberships, and the group-specific coefficients $\boldsymbol{\alpha}\_k$ are all estimated simultaneously from the data. This is analogous to clustering students by learning style rather than assuming all students learn identically or that every student is unique.

### 2.2 Why not just use K-means or other clustering?

A natural question is: why not cluster the individual regression coefficients using K-means? The C-LASSO approach has two key advantages. First, it estimates group membership and group-specific coefficients **jointly** rather than in two separate steps, which avoids the propagation of first-stage estimation error. Second, the penalty structure of C-LASSO naturally shrinks similar units toward the same group, providing a statistically principled way to determine group membership.

---

## 3. The Classifier-LASSO Method

### 3.1 The C-LASSO objective function

The C-LASSO estimator minimizes a penalized least-squares objective function:

$$Q\_{NT,\lambda}^{(K)} = \frac{1}{NT} \sum\_{i=1}^{N} \sum\_{t=1}^{T} (y\_{it} - \boldsymbol{\beta}\_i' \mathbf{x}\_{it})^2 + \frac{\lambda\_{NT}}{N} \sum\_{i=1}^{N} \prod\_{k=1}^{K} \|\boldsymbol{\beta}\_i - \boldsymbol{\alpha}\_k\|$$

In words, the first term is the standard sum of squared residuals --- it measures how well the model fits the data. The second term is a **penalty** that encourages $\boldsymbol{\beta}\_i$ to be close to one of the group centers $\boldsymbol{\alpha}\_k$. The novel "mixed additive-multiplicative" structure of this penalty means that if $\boldsymbol{\beta}\_i$ is close to **any** group center $\boldsymbol{\alpha}\_k$, the product $\prod\_k \|\boldsymbol{\beta}\_i - \boldsymbol{\alpha}\_k\|$ becomes small, effectively shrinking that unit into the nearest group. The tuning parameter $\lambda\_{NT} = c\_\lambda T^{-1/3}$ controls the strength of this shrinkage.

### 3.2 Three-step estimation procedure

The `classifylasso` command implements a three-step procedure:

1. **Classifier-LASSO estimation.** For each candidate number of groups $K$, the algorithm iteratively updates group centers and membership assignments until convergence. Starting values come from unit-by-unit regressions.

2. **Postlasso estimation.** Given the group classification from step 1, re-estimate the coefficients within each group using standard OLS. This "postlasso" step improves finite-sample performance and enables standard inference (standard errors, confidence intervals).

3. **Information criterion.** When $K$ is unknown, the command tests $K \in \{1, 2, \ldots, K\_{\max}\}$ and selects the $K$ that minimizes an information criterion with tuning parameter $\rho\_{NT} = c\_\rho (NT)^{-1/2}$.

### 3.3 Dynamic panels and Nickell bias

When lagged dependent variables appear among the regressors (e.g., $y\_{i,t-1}$), the standard fixed-effects estimator suffers from **Nickell bias** --- a systematic bias that arises because the demeaned lagged dependent variable is correlated with the demeaned error term. The `classifylasso` command offers a `dynamic` option that applies the **half-panel jackknife** method (Dhaene and Jochmans 2015) to correct this bias.

---

## 4. Data Exploration: Savings

### 4.1 Load and describe the data

Our first application uses a panel of 56 countries observed over 15 years, originally analyzed by Su, Shi, and Phillips (2016). The outcome is the savings-to-GDP ratio, and the regressors include lagged savings, CPI inflation, real interest rates, and GDP growth.

```stata
use "refMaterials/saving.dta", clear
xtset code year
summarize savings lagsavings cpi interest gdp
```

```text
    Variable |        Obs        Mean    Std. dev.       Min        Max
-------------+---------------------------------------------------------
     savings |        840   -2.87e-08    1.000596  -2.495871   2.893858
  lagsavings |        840    5.81e-08    1.000596  -2.832278    2.91508
         cpi |        840    3.56e-09    1.000596  -2.773791   3.548945
    interest |        840   -7.17e-09    1.000596  -3.600348   3.277582
         gdp |        840    1.06e-08    1.000596  -3.554419   2.461317
```

The panel is strongly balanced: 56 countries $\times$ 15 years = 840 observations. All variables are standardized to have mean zero and standard deviation one. This standardization means that coefficient magnitudes should be interpreted in standard-deviation terms (e.g., "a one-SD increase in CPI is associated with a 0.18-SD change in savings"). The balanced structure is essential for C-LASSO, which requires all units to be observed in all time periods.

### 4.2 Visualize cross-country heterogeneity

Before running any regressions, it helps to visualize how savings trajectories differ across countries. The `xtline` command overlays all 56 country lines on a single plot:

```stata
xtline savings, overlay ///
    title("Savings-to-GDP Ratio Across 56 Countries", size(medium)) ///
    subtitle("Each line represents one country", size(small)) ///
    ytitle("Savings / GDP") xtitle("Year") legend(off)
graph export "stata_panel_lasso_cluster_fig1_savings_scatter.png", replace width(2400)
```

![Spaghetti plot of savings-to-GDP ratio across 56 countries, showing wide dispersion in trajectories.](stata_panel_lasso_cluster_fig1_savings_scatter.png)

The spaghetti plot reveals substantial heterogeneity. Some countries maintain consistently positive savings ratios while others fluctuate below zero. The lines do not move in lockstep --- different countries appear to follow fundamentally different savings dynamics. This visual pattern motivates the search for latent groups: perhaps subsets of countries share similar responses to macroeconomic conditions, even if the full panel does not.

---

## 5. Baseline: Pooled and Fixed Effects Regressions

Before applying C-LASSO, we establish a benchmark by estimating the standard pooled OLS and fixed-effects models. These models assume that all 56 countries share the same slope coefficients.

```stata
* Pooled OLS
regress savings lagsavings cpi interest gdp

* Standard Fixed Effects
xtreg savings lagsavings cpi interest gdp, fe

* Robust Fixed Effects (reghdfe)
reghdfe savings lagsavings cpi interest gdp, absorb(code) vce(robust)
```

```text
                 Pooled OLS     FE (robust)
lagsavings           0.6051         0.6051
cpi                  0.0301         0.0301
interest             0.0059         0.0059
gdp                  0.1882         0.1882
```

The pooled OLS and fixed-effects estimates are virtually identical, with an R-squared of 0.438. Lagged savings dominates with a coefficient of 0.605 ($p < 0.001$), indicating strong persistence. GDP growth also matters ($\hat{\beta} = 0.188$, $p < 0.001$). But notice that CPI (0.030) and the interest rate (0.006) are both statistically insignificant. Is this because inflation and interest rates truly do not affect savings? Or is it because the pooled model averages over country groups with **opposite-sign effects**, producing a near-zero average? C-LASSO will answer this question.

---

## 6. Classifier-LASSO: Savings, Static Model

### 6.1 Estimation

We start with the simplest C-LASSO specification --- a static model without the lagged dependent variable. This allows us to focus on the core mechanics of `classifylasso` before introducing the dynamic bias correction.

```stata
classifylasso savings cpi interest gdp, grouplist(1/5) tolerance(1e-4)
```

The command searches over $K = 1$ to $K = 5$ groups and reports the information criterion (IC) for each:

```text
Estimation 1: Group Number = 1; IC = 0.054
Estimation 2: Group Number = 2; IC = -0.028  ← minimum
Estimation 3: Group Number = 3; IC = 0.059
Estimation 4: Group Number = 4; IC = 0.131
Estimation 5: Group Number = 5; IC = 0.213
* Selected Group Number: 2
```

The IC is minimized at $K = 2$, with values rising monotonically from $K = 3$ onward. This clear U-shape provides strong evidence for exactly two latent groups in the data.

### 6.2 Group-specific coefficients

```stata
classoselect, postselection
predict gid_static, gid
tabulate gid_static
```

```text
Group 1 (34 countries, 510 obs):  Within R-sq. = 0.2019
         cpi |  -0.1813   (z = -4.29, p < 0.001)
    interest |  -0.1966   (z = -4.64, p < 0.001)
         gdp |   0.3346   (z =  7.98, p < 0.001)

Group 2 (22 countries, 330 obs):  Within R-sq. = 0.2369
         cpi |   0.4781   (z =  9.10, p < 0.001)
    interest |   0.2631   (z =  5.01, p < 0.001)
         gdp |   0.1117   (z =  2.23, p = 0.026)
```

The results are striking. Group 1 (34 countries) shows **negative** effects of CPI (-0.181) and interest rates (-0.197) on savings, while Group 2 (22 countries) shows **positive** effects: CPI at +0.478 and interest at +0.263. This sign reversal explains why the pooled CPI coefficient was near zero and insignificant --- the pooled model was averaging a negative effect in one group with a positive effect in another, producing a misleading null result. In Group 1, higher inflation erodes the real value of savings, discouraging saving. In Group 2, higher inflation may trigger **precautionary savings** --- households save more precisely because the economic environment is uncertain.

### 6.3 Group selection plot

```stata
classogroup
graph export "stata_panel_lasso_cluster_fig2_group_selection_static.png", replace width(2400)
```

![Information criterion and iteration count by number of groups for the static savings model. IC is minimized at K=2.](stata_panel_lasso_cluster_fig2_group_selection_static.png)

The group selection plot confirms the IC minimum at $K = 2$ (marked by a triangle). The left axis shows the IC values and the right axis shows the number of iterations needed for convergence. The algorithm converged quickly for $K = 2$ (about 3 iterations) but required the maximum 20 iterations for $K \geq 3$, suggesting that models with more groups are overparameterized and struggle to find stable group assignments.

---

## 7. Classifier-LASSO: Savings, Dynamic Model

### 7.1 Adding the lagged dependent variable

The static model omitted lagged savings to keep things simple. But savings are highly persistent (the pooled coefficient on `lagsavings` was 0.605), so omitting it may bias the other coefficients. We now estimate the full dynamic specification, replicating Su, Shi, and Phillips (2016), and use the `dynamic` option to correct for Nickell bias via the half-panel jackknife.

```stata
use "refMaterials/saving.dta", clear
xtset code year
classifylasso savings lagsavings cpi interest gdp, ///
    grouplist(1/5) lambda(1.5485) tolerance(1e-4) dynamic
```

```text
* Selected Group Number: 2
The algorithm takes 9min57s.

Group 1 (31 countries, 465 obs):  Within R-sq. = 0.4988
  lagsavings |   0.6952   (z = 18.15, p < 0.001)
         cpi |  -0.1602   (z = -4.09, p < 0.001)
    interest |  -0.1490   (z = -4.04, p < 0.001)
         gdp |   0.2892   (z =  7.62, p < 0.001)

Group 2 (25 countries, 375 obs):  Within R-sq. = 0.4372
  lagsavings |   0.6939   (z = 19.45, p < 0.001)
         cpi |   0.1967   (z =  4.93, p < 0.001)
    interest |   0.1225   (z =  2.98, p = 0.003)
         gdp |   0.1127   (z =  2.38, p = 0.018)
```

The dynamic model again selects $K = 2$ groups. The sign reversal on CPI persists: $-0.160$ in Group 1 versus $+0.197$ in Group 2. The same pattern holds for the interest rate: $-0.149$ versus $+0.123$. Crucially, both groups show nearly identical savings persistence (lagsavings coefficients of 0.695 and 0.694), indicating that the heterogeneity lies in how countries respond to macroeconomic shocks, not in their baseline savings dynamics. The within R-squared improves substantially compared to the static model (0.499 and 0.437 versus 0.202 and 0.237), confirming that lagged savings is a critical predictor.

### 7.2 Coefficient plots

The `classocoef` postestimation command visualizes group-specific coefficients with 95% confidence bands:

```stata
classocoef cpi
graph export "stata_panel_lasso_cluster_fig3_coef_cpi.png", replace width(2400)

classocoef interest
graph export "stata_panel_lasso_cluster_fig4_coef_interest.png", replace width(2400)
```

![CPI coefficient estimates and 95% confidence bands by group, showing a clear sign reversal with non-overlapping confidence intervals.](stata_panel_lasso_cluster_fig3_coef_cpi.png)

The CPI coefficient plot is the "smoking gun" of this tutorial. The two horizontal lines represent the group-specific coefficient estimates, and the dashed lines show 95% confidence bands. The bands do not overlap --- this is not a marginal difference but a statistically robust sign reversal. For 31 countries in Group 1, higher inflation reduces savings ($-0.160$, $p < 0.001$). For 25 countries in Group 2, higher inflation increases savings ($+0.197$, $p < 0.001$). A pooled model, by averaging these opposing forces, would find CPI "insignificant" --- a classic case of aggregation bias masking genuine heterogeneity.

![Interest rate coefficient estimates and 95% confidence bands by group, showing the same sign reversal pattern as CPI.](stata_panel_lasso_cluster_fig4_coef_interest.png)

The interest rate plot shows the same pattern. Group 1 countries save less when interest rates rise ($-0.149$), while Group 2 countries save more ($+0.123$). One interpretation is that Group 1 countries, with more developed financial markets, experience a substitution effect (higher returns favor consumption over saving), while Group 2 countries see an income effect (higher returns make saving more attractive for households with limited financial access).

---

## 8. Democracy Application: Does Democracy Cause Growth?

### 8.1 The Acemoglu et al. (2019) question

Acemoglu, Naidu, Restrepo, and Robinson (2019) argued in the *Journal of Political Economy* that "democracy does cause growth." Their pooled two-way fixed-effects model, controlling for lagged GDP, found a positive and significant effect. But does this average effect apply to all 98 countries in their sample? Or does it mask heterogeneity?

### 8.2 Data exploration

```stata
use "refMaterials/democracy.dta", clear
xtset country year
summarize lnPGDP Democracy ly1
tabulate Democracy
```

```text
    Variable |        Obs        Mean    Std. dev.       Min        Max
-------------+---------------------------------------------------------
      lnPGDP |      4,018    758.5558    162.9137   405.6728   1094.003
   Democracy |      4,018    .5450473    .4980286          0          1
         ly1 |      3,920    757.7754    162.6702   405.6728   1094.003

  Democracy |      Freq.     Percent
------------+-----------------------------------
          0 |      1,828       45.50
          1 |      2,190       54.50
```

The panel covers 98 countries from 1970 to 2010 (4,018 observations). The binary `Democracy` indicator shows that about 55% of country-year observations are classified as democratic, reflecting the global wave of democratization over this period. The dependent variable `lnPGDP` (log per-capita GDP, scaled) ranges widely from 406 to 1,094, capturing the full spectrum from low-income to high-income countries.

### 8.3 Pooled fixed-effects benchmark

```stata
reghdfe lnPGDP Democracy ly1, absorb(country year) cluster(country)
```

```text
HDFE Linear regression                            Number of obs   =      3,920
                                                  R-squared       =     0.9991
                                                  Within R-sq.    =     0.9607

                               (Std. err. adjusted for 98 clusters in country)
      lnPGDP | Coefficient  Robust std. err.      t    P>|t|
   Democracy |   1.054992    .369806          2.85   0.005
         ly1 |    .970495   .0059964        161.85   0.000
```

The pooled model finds that democracy is associated with a statistically significant 1.055-unit increase in log per-capita GDP ($p = 0.005$, clustered SE = 0.370). The lagged GDP coefficient of 0.970 indicates strong persistence. This result replicates the central finding of Acemoglu et al. (2019): on average, democracy promotes growth. But the pooled model assumes this effect is the same for all 98 countries. Is it?

### 8.4 C-LASSO: revealing the heterogeneity

```stata
classifylasso lnPGDP Democracy ly1, ///
    grouplist(1/5) rho(0.2) absorb(country year) ///
    cluster(country) dynamic optmaxiter(300)
```

```text
* Selected Group Number: 2
The algorithm takes 2h33min41s.

Group 1 (57 countries, 2,280 obs):  Within R-sq. = 0.9609
   Democracy |   2.151397   (z = 3.94, p < 0.001)
         ly1 |   1.032752   (z = 149.97, p < 0.001)

Group 2 (41 countries, 1,640 obs):  Within R-sq. = 0.9538
   Democracy |  -0.935589   (z = -2.69, p = 0.007)
         ly1 |   0.979327   (z = 95.73, p < 0.001)
```

This is the tutorial's most striking finding. The pooled coefficient of $+1.055$ is **not representative of any actual country group**. Instead, it is a weighted average of two fundamentally different effects. Group 1 (57 countries) shows a large, positive democracy effect of $+2.151$ ($p < 0.001$) --- more than twice the pooled estimate. Group 2 (41 countries) shows a statistically significant **negative** effect of $-0.936$ ($p = 0.007$). The democracy coefficient literally changes sign depending on which group of countries is examined. For roughly 58% of countries, democratic transitions are associated with substantial GDP gains; for the remaining 42%, they are associated with GDP declines.

### 8.5 Visualizing the democracy-growth split

```stata
classogroup
graph export "stata_panel_lasso_cluster_fig5_democracy_selection.png", replace width(2400)

classocoef Democracy
graph export "stata_panel_lasso_cluster_fig6_democracy_coef.png", replace width(2400)
```

![Information criterion and iteration count for the democracy model. IC is minimized at K=2, though values are close across specifications.](stata_panel_lasso_cluster_fig5_democracy_selection.png)

The group selection plot shows that $K = 2$ is selected, but the IC values are very close across all $K$ (ranging from 3.267 to 3.280 --- a span of just 0.013). This suggests the 2-group structure, while optimal, is not overwhelmingly favored over alternatives. Researchers should consider sensitivity to the IC tuning parameter $\rho$.

![Democracy coefficient polarization across two groups: Group 1 (57 countries) shows a positive effect around +2.2, Group 2 (41 countries) shows a negative effect around -1.0.](stata_panel_lasso_cluster_fig6_democracy_coef.png)

The coefficient plot for `Democracy` is the key figure of this tutorial. Each dot represents a country's individual coefficient estimate, and the horizontal lines show the group-specific postlasso estimates with 95% confidence bands. The polarization is unmistakable: Group 1 (the left cluster) has a strongly positive democracy effect, while Group 2 (the right cluster) has a negative effect. The confidence bands do not overlap with zero for either group, confirming that both effects are statistically significant. This is not a case of "some countries benefit and others see no effect" --- it is a genuine sign reversal.

---

## 9. Comparison: What the Pooled Model Misses

### 9.1 Summary table

| | Pooled FE | C-LASSO Group 1 | C-LASSO Group 2 |
|---|---|---|---|
| **Democracy coefficient** | +1.055 | +2.151 | -0.936 |
| **Standard error** | 0.370 | 0.546 | 0.348 |
| **p-value** | 0.005 | < 0.001 | 0.007 |
| **Lagged GDP** | 0.970 | 1.033 | 0.979 |
| **Countries** | 98 | 57 | 41 |
| **Observations** | 3,920 | 2,280 | 1,640 |

### 9.2 Simpson's paradox in panel data

This comparison illustrates a form of **Simpson's paradox** in panel data. The pooled estimate of $+1.055$ lies between the two group-specific effects ($+2.151$ and $-0.936$) but describes neither group accurately. A policymaker relying on the pooled result would conclude that democracy universally promotes growth --- missing the fact that for 41 countries (42% of the sample), the relationship runs in the opposite direction.

The pooled CPI coefficient in the savings model showed the same pattern on a smaller scale: the insignificant pooled estimate of $+0.030$ masked significant effects of $-0.160$ and $+0.197$ in the two groups. When heterogeneous effects have opposite signs, pooled estimation does not just underestimate the magnitude --- it can produce a qualitatively wrong conclusion.

### 9.3 Robustness of the group structure

Across all three C-LASSO specifications in this tutorial --- static savings, dynamic savings, and democracy --- the information criterion consistently selected $K = 2$ groups. The sign reversal on CPI and interest rates was preserved when moving from the static to the dynamic savings model, despite a shift in group composition (34/22 to 31/25). This consistency across specifications suggests the latent groups reflect genuine structural heterogeneity rather than an artifact of a particular model choice.

---

## 10. Summary and Takeaways

### 10.1 What we learned

- **Pooled estimates can be misleading.** The insignificant pooled CPI coefficient ($+0.030$) in the savings model masked opposing effects of $-0.160$ and $+0.197$ in two latent groups. The pooled democracy coefficient ($+1.055$) masked a split of $+2.151$ versus $-0.936$.

- **C-LASSO finds latent groups.** In all three specifications, the information criterion selected $K = 2$ groups, revealing binary latent structures in both datasets. The `classifylasso` command handles the full workflow: estimation, group selection, and postestimation.

- **The `dynamic` option corrects Nickell bias.** When lagged dependent variables are included, the half-panel jackknife bias correction preserves the group structure while improving within-group R-squared (from 0.20--0.24 in the static model to 0.44--0.50 in the dynamic model).

- **Postestimation tools aid interpretation.** The `classogroup` command visualizes the information criterion, `classocoef` plots group-specific coefficients with confidence bands, and `predict gid` assigns countries to groups.

### 10.2 Limitations

The IC values in the democracy model were very close across $K = 1$ through $K = 5$ (range 3.267--3.280), suggesting the 2-group structure, while optimal, is not overwhelmingly dominant. The datasets use numeric country codes rather than names, limiting interpretability. Finally, C-LASSO is computationally intensive --- the democracy model with two-way FE, clustered SEs, and dynamic bias correction took over 2.5 hours.

### 10.3 Exercises

1. **Sensitivity analysis.** Re-run the democracy model with `rho(0.5)` and `rho(1.0)` instead of `rho(0.2)`. Does the selected number of groups change? How sensitive are the group assignments to this tuning parameter?

2. **Extended lag structure.** Following the reference `empirical.do`, estimate the democracy model with 2, 3, and 4 lags of GDP (`ly1-ly2`, `ly1-ly3`, `ly1-ly4`). Do the group-specific democracy coefficients remain stable?

3. **Static vs dynamic comparison.** Run `classifylasso savings cpi interest gdp` (without `dynamic`) on the savings data and compare group assignments with the dynamic model using `tabulate gid_static gid_dynamic`. How many countries switch groups?

---

## References

1. Su, L., Shi, Z., and Phillips, P. C. B. (2016). [Identifying latent structures in panel data](https://doi.org/10.3982/ECTA12560). *Econometrica*, 84(6), 2215--2264.

2. Huang, W., Wang, Y., and Zhou, L. (2024). [Identify latent group structures in panel data: The classifylasso command](https://doi.org/10.1177/1536867X241233664). *Stata Journal*, 24(1), 173--203.

3. Acemoglu, D., Naidu, S., Restrepo, P., and Robinson, J. A. (2019). [Democracy does cause growth](https://doi.org/10.1086/700936). *Journal of Political Economy*, 127(1), 47--100.

4. Dhaene, G. and Jochmans, K. (2015). [Split-panel jackknife estimation of fixed-effect models](https://doi.org/10.1093/restud/rdv007). *Review of Economic Studies*, 82(3), 991--1030.
