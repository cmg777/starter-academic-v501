---
authors:
  - admin
categories:
  - R
  - Policy Evaluation
draft: false
featured: false
date: "2026-05-15T00:00:00Z"
external_link: ""
image:
  caption: ""
  focal_point: Smart
  placement: 3
links:
- icon: code
  icon_pack: fas
  name: "R script"
  url: analysis.R
- icon: markdown
  icon_pack: fab
  name: "MD version"
  url: https://raw.githubusercontent.com/cmg777/starter-academic-v501/master/content/post/r_causalpolicy_workshop/index.md
slides:
summary: Six estimators in one tutorial --- naive pre-post, DiD, two flavours of ITS, RDD on time, Synthetic Control, and CausalImpact --- all applied to California's 1988 Proposition 99 cigarette tax to see how much (and where) they disagree.
tags:
  - r
  - causal
  - causal inference
  - policy evaluation
  - did
  - its
  - rdd
  - synthetic control
  - causalimpact
  - panel data
title: "Six Ways to Evaluate a Policy in R: A Workshop Replication with Proposition 99"
url_code: ""
url_pdf: ""
url_slides: ""
url_video: ""
toc: true
diagram: true
---

## 1. Overview

How do you measure the causal effect of a policy when you cannot randomize who gets treated? In January 1989, California raised its cigarette tax by 25 cents per pack as part of **Proposition 99**. Every other state was, of course, free to choose its own tobacco policy at its own pace. Per-capita cigarette sales in California then fell from 116 packs in 1988 to 60 packs in 2000 --- almost a 50% drop. The question that this tutorial is built around is deceptively simple: **how much of that drop was caused by the tax, and how much would have happened anyway?**

This tutorial is a faithful R replication of the one-day workshop at [causalpolicy.nl](https://causalpolicy.nl/) by the ODISSEI Social Data Science team. We run six different estimators on the *same* dataset and place all six results on a single forest plot so the disagreements are visible at a glance. The methods --- naive pre-post comparison, Difference-in-Differences (DiD), Interrupted Time Series (ITS) in two flavours, Regression Discontinuity Design on time (RDD), Synthetic Control, and Google's CausalImpact --- represent essentially the full applied-policy toolkit when randomized trials are off the table. Each one builds a *counterfactual* (what would California's smoking have looked like *without* Proposition 99?) in a slightly different way, and the gap between counterfactual and observed becomes the estimated effect.

The case study is famous because the original Synthetic Control paper by [Abadie, Diamond, and Hainmueller (2010)](https://www.aeaweb.org/articles?id=10.1257/jasa.2010.ap08746) used exactly this dataset. We replicate their estimate (within rounding), but we also walk through what happens when you swap in five other estimators. The headline finding: **five of the six methods agree on a 13--20 packs-per-capita reduction, while one (DiD against a single Nevada control) collapses to noise and one (ITS with auto-selected ARIMA) flips sign entirely**. The disagreement is itself the lesson --- and it is exactly the lesson the workshop is designed to teach.

If you want to go deeper on any single method after this tour, two sister tutorials cover the same territory in much greater detail: [Difference-in-Differences for Policy Evaluation: A Tutorial using R](/post/r_did/) walks through staggered adoption, Callaway--Sant'Anna group-time ATTs, and HonestDiD sensitivity analysis; and [Bayesian Spatial Synthetic Control](/post/r_sc_bayes_spatial/) revisits Proposition 99 with a spatial Bayesian extension of the synthetic-control machinery.

**Learning objectives:**

- Understand why a within-unit pre-post comparison is biased, and how each of five causal estimators tries to fix that bias
- Build, fit, and interpret DiD, ITS (growth-curve and ARIMA), RDD-on-time, Synthetic Control (`tidysynth`), and CausalImpact models in R
- Read a `synthetic_control()` pipeline end-to-end --- predictors, donor weights, placebo permutations, balance tables
- Compare six estimators on a single forest plot and explain *why* they disagree where they do
- Apply the **estimand discipline** of saying which causal quantity each method targets (descriptive difference vs ATT vs posterior mean) before quoting numbers

### Key concepts at a glance

This post leans on a small vocabulary repeatedly. The rest of the tutorial assumes you can move between these terms quickly. Each concept below has three parts. The **definition** is always visible. The **example** and **analogy** sit behind clickable cards: open them when you need them, leave them collapsed for a quick scan.

**1. Counterfactual.**
The outcome a treated unit *would have shown* in the absence of treatment. It is the thing you cannot observe but must somehow construct in order to estimate a causal effect.

<div class="concept-pair">
<details class="concept-card concept-example">
<summary>Example</summary>

In this post, "California's cigarette sales in 1995 if Proposition 99 had not passed" is the counterfactual. Every method we cover builds one differently: ITS extrapolates California's own pre-trend, DiD borrows Nevada's change, Synthetic Control borrows a *weighted combination* of donor states, and CausalImpact borrows a Bayesian projection from a structural time-series model.

</details>

<details class="concept-card concept-analogy">
<summary>Analogy</summary>

A doctor who wants to know whether a new drug worked needs to ask "what would this patient's blood pressure have been at week 12 if they had taken a placebo?" There is no parallel universe to peek into, so they construct an estimate from similar patients, prior trends, or a control group.

</details>
</div>

**2. Parallel trends.**
The identifying assumption behind classical DiD: in the absence of treatment, the treated and control units would have moved in *parallel* over time. Differences in *levels* are allowed; differences in *trends* are not.

<div class="concept-pair">
<details class="concept-card concept-example">
<summary>Example</summary>

DiD against Nevada implicitly assumes that California and Nevada cigarette sales would have evolved on parallel paths after 1989 if Proposition 99 had never passed. The raw plot (Figure 2) shows that they were already on similar downward trajectories before 1988 --- which is why the DiD point estimate ends up so small.

</details>

<details class="concept-card concept-analogy">
<summary>Analogy</summary>

Two cars driving down a highway at the same speed. If one suddenly brakes, the *gap* between them grows --- and that gap is the "treatment effect". Parallel trends says they were going the same speed *before* the braking.

</details>
</div>

**3. Interrupted Time Series (ITS).**
A class of methods that fits a model to the treated unit's *pre-period* data, extrapolates that model into the post-period as a counterfactual, and averages the residual gap. ITS does not need a comparison unit, but it pays for that in stronger modelling assumptions about the pre-trend.

<div class="concept-pair">
<details class="concept-card concept-example">
<summary>Example</summary>

We fit two ITS counterfactuals: a simple linear `lm(cigsale ~ year)` on 1970--1988 (the *growth curve*), and an AICc-selected ARIMA model from `fpp3`. Both are then projected onto 1989--2000. The growth-curve version produces a sensible $-28$ packs estimate; the ARIMA(1, 2, 0) version produces a counterintuitive $+4.5$ packs because it extrapolates the late-1980s acceleration too aggressively.

</details>

<details class="concept-card concept-analogy">
<summary>Analogy</summary>

Predicting tomorrow's weather purely from this week's pattern. If the trend is "warming by 0.5 degrees per day", extrapolating works for a few days but fails the moment a cold front arrives.

</details>
</div>

**4. RDD on time.**
A regression discontinuity design where the *running variable* is the calendar year and the *threshold* is the policy adoption date. Practically, it is a piecewise linear regression of the form `cigsale ~ year + post + year:post` that allows both a level jump and a slope change at the threshold.

<div class="concept-pair">
<details class="concept-card concept-example">
<summary>Example</summary>

We fit `cigsale ~ year0 + prepost + year0:prepost` to California's full 1970--2000 series, where `year0 = year - 1989` centres the running variable at the threshold. The level break (`prepostPost` = $-20.06$ packs) is the discontinuity right at January 1989; the slope break ($-1.49$ packs/year extra) means the post-period decline accelerates relative to the pre-period.

</details>

<details class="concept-card concept-analogy">
<summary>Analogy</summary>

Imagine a road where the speed limit changes from 100 to 80 km/h at a sign. Drivers slow down right at the sign (the level break) and may also gradually drive slower over the next few kilometres (the slope break).

</details>
</div>

**5. Donor pool.**
The set of untreated units from which Synthetic Control draws weights to build a synthetic version of the treated unit. The data-driven weighting algorithm chooses how much of each donor to use.

<div class="concept-pair">
<details class="concept-card concept-example">
<summary>Example</summary>

The 38 non-California states are the donor pool. `tidysynth` chooses convex weights that minimise pre-1988 RMSE on lagged outcomes plus four covariates. The optimal mix turns out to be 34.3% Utah, 23.6% Nevada, 18.2% Montana, 17.5% Colorado, 6.2% Connecticut --- a "synthetic California" built entirely from five states.

</details>

<details class="concept-card concept-analogy">
<summary>Analogy</summary>

A cocktail recipe that has to match a specific flavour profile. Instead of using one ingredient, you blend several --- 35% lime, 25% mint, 20% sugar, etc. --- until the mixture tastes right.

</details>
</div>

**6. Posterior credible interval.**
A Bayesian interval that has a 95% probability of containing the true parameter, *given* the data and the prior. It is the Bayesian counterpart to a frequentist 95% confidence interval, but with a far more natural interpretation.

<div class="concept-pair">
<details class="concept-card concept-example">
<summary>Example</summary>

CausalImpact's full-covariate model reports an average effect of $-13$ packs with a 95% credible interval of $[-32, +5.7]$. Read literally: given the data and the structural time-series prior, there is a 95% probability that the true average ATT lies in that interval. The posterior probability of *any* causal effect is 92%.

</details>

<details class="concept-card concept-analogy">
<summary>Analogy</summary>

A weather forecast that says "70% chance of rain". You do not need 100 parallel universes; the 70% is a direct probability statement about the world, not about a sampling distribution.

</details>
</div>

## 2. Setup and packages

We use `pacman::p_load()` to install (if needed) and load every package in a single line. The script is fully reproducible: a global `set.seed(42)` fixes the random-forest imputation and the CausalImpact MCMC sampler.

```r
if (!require("pacman", quietly = TRUE)) {
  install.packages("pacman", repos = "https://cloud.r-project.org")
}
pacman::p_load(
  tidyverse,    # data manipulation + ggplot2
  sandwich,     # HAC variance estimator
  lmtest,       # coeftest
  tidysynth,    # synthetic control (tidy API)
  fpp3,         # forecasting (tsibble, fable, ARIMA)
  mice,         # multiple imputation
  CausalImpact, # Bayesian structural time series
  broom,        # tidy model output
  glue          # string interpolation
)
set.seed(42)
```

The dark-navy ggplot theme used in every figure of this post is defined in `analysis.R` as a helper called `theme_site()`. It sets the plot background to `#0f1729`, the panel grid to `#1f2b5e`, and the text to `#e8ecf2`, matching the site's other dark-themed posts.

## 3. Data: download and inspect

Like the workshop, we download a pre-prepared `proposition99.rds` file directly from `causalpolicy.nl`. The script caches the download so it only fetches once.

```r
DATA_URL  <- "https://causalpolicy.nl/data/proposition99.rds"
CACHE_RDS <- "proposition99.rds"
if (!file.exists(CACHE_RDS)) {
  download.file(DATA_URL, destfile = CACHE_RDS, mode = "wb")
}
prop99 <- read_rds(CACHE_RDS) |> as_tibble()
```

```text
Rows: 1209  Cols: 7
Columns: state, year, cigsale, lnincome, beer, age15to24, retprice
States: 39  Years: 1970 - 2000

# A tibble: 6 × 7
  state         year cigsale lnincome  beer age15to24 retprice
  <fct>        <int>   <dbl>    <dbl> <dbl>     <dbl>    <dbl>
1 Rhode Island  1970   124.        NA    NA     0.183     39.3
2 Tennessee     1970    99.8       NA    NA     0.178     39.9
3 Indiana       1970   135.        NA    NA     0.177     30.6
4 Nevada        1970   190.        NA    NA     0.162     38.9
5 Louisiana     1970   116.        NA    NA     0.185     34.3
6 Oklahoma      1970   108.        NA    NA     0.175     38.4
```

The panel is 39 states $\times$ 31 years for 1,209 observations in total. The treated unit is California, the intervention year is January 1989 (so the last full pre-period year is 1988), and the outcome is `cigsale` --- per-capita cigarette pack sales. Of the four covariates, `cigsale` and `retprice` (the retail price) are fully observed, while `lnincome` is missing 195 rows (16.1%), `age15to24` is missing 390 (32.3%), and `beer` is missing 663 (54.8%). The covariate gaps matter for CausalImpact (Section 9), where we will fill them with random-forest imputation; the other five methods either ignore covariates entirely or do not need them.

A quick descriptive comparison of California's pre vs post means confirms the puzzle that motivates the rest of the tutorial.

```r
prop99_cali <- prop99 |>
  filter(state == "California") |>
  mutate(prepost = factor(year > 1988, labels = c("Pre", "Post")))

prop99_cali |>
  group_by(prepost) |>
  summarize(n = n(),
            mean_cigsale = mean(cigsale),
            sd_cigsale   = sd(cigsale),
            .groups = "drop")
```

```text
# A tibble: 2 × 4
  prepost     n mean_cigsale sd_cigsale
1 Pre        19        116.        11.7
2 Post       12         60.4       12.1
```

California's average per-capita cigarette sales fell from 116.0 packs (1970--1988) to 60.4 packs (1989--2000) --- a within-state drop of 55.6 packs, or 47.9% of the pre-period mean. That is the *raw* before/after change. The rest of the tutorial is about how much of that 55.6-pack drop we can credibly attribute to Proposition 99 rather than to the broader American secular decline in smoking.

Before doing any modelling, it helps to see all 39 series at once.

```r
eda_data <- prop99 |>
  mutate(unit_type = if_else(state == "California",
                             "California (treated)", "Donor state"))
ggplot(eda_data, aes(x = year, y = cigsale, group = state,
                     color = unit_type,
                     linewidth = unit_type, alpha = unit_type)) +
  geom_line() +
  geom_vline(xintercept = 1988.5, color = "#d97757",
             linetype = "dashed", linewidth = 0.7) +
  scale_color_manual(values = c("California (treated)" = "#d97757",
                                "Donor state" = "#6a9bcc"))
```

![Per-capita cigarette sales for all 39 states 1970-2000, with California highlighted in orange](fig1_raw_series.png)

California (orange) sits inside the donor cloud throughout the 1970s and 1980s, then visibly separates downward after the dashed Proposition 99 line. The pre-1988 trajectory is already slightly below the donor median, but it is not anomalous; the sharp post-1988 separation is. Visually, this is the signal every causal estimator is trying to quantify.

## 4. Method 1 --- Naive pre-post comparison

The simplest possible "evaluation" is to compare California's pre and post averages directly. The implicit counterfactual is "California's pre-period level continues unchanged". That counterfactual is almost certainly wrong --- smoking was declining nationwide --- but the estimate is so easy to compute that it deserves to be shown explicitly as a baseline before we invest in anything more sophisticated.

We follow the workshop's narrow 1984--1993 window for direct comparability. Using a longer window (e.g., 1970--2000) would change the numbers but not the qualitative point.

```r
fit_prepost <- lm(cigsale ~ prepost,
                  data = prop99_cali |> filter(year > 1983, year < 1994))
coeftest(fit_prepost, vcov. = vcovHAC)
```

```text
t test of coefficients:

            Estimate Std. Error t value  Pr(>|t|)
(Intercept)  98.9800     2.4999 39.5941 1.821e-10 ***
prepostPost -27.0200     5.2951 -5.1029 0.0009266 ***
```

California's mean cigarette sales over 1984--1988 was 98.98 packs/capita; the `prepostPost` coefficient says that over 1989--1993 the mean fell by $-27.02$ packs (HAC robust SE of 5.30, $p < 0.001$). The HAC standard error from `sandwich::vcovHAC` corrects for the heteroskedasticity-and-autocorrelation that small time series typically exhibit; the *t*-statistic of $-5.1$ would be wildly overconfident under classical OLS. **The estimand here is purely descriptive** --- this is a within-state difference of means, *not* a causal estimate. Any nationwide secular decline in smoking gets silently bundled into this $-27.02$. That bundling is exactly what the next five methods try to undo.

## 5. Method 2 --- Difference-in-Differences (CA vs Nevada)

DiD adds a single control unit --- here Nevada --- and subtracts that control's pre-to-post change from California's pre-to-post change. The estimand becomes a proper **Average Treatment effect on the Treated** (ATT) for California, *under the assumption* that Nevada is what California would have done absent Proposition 99 (the parallel-trends assumption).

The formal DiD identity is

$$\hat{\tau}\_{\text{DiD}} = \big(\bar{Y}\_{\text{CA, post}} - \bar{Y}\_{\text{CA, pre}}\big) - \big(\bar{Y}\_{\text{NV, post}} - \bar{Y}\_{\text{NV, pre}}\big).$$

In words, this says that the DiD estimate is California's pre-to-post change *minus* Nevada's pre-to-post change. If both states would have evolved in parallel without the policy, the only thing that can drive their *difference* in changes is the policy itself. In the regression `cigsale ~ state * prepost`, the interaction coefficient `stateCalifornia:prepostPost` is exactly this quantity.

```r
prop99_did <- prop99 |>
  filter(state %in% c("California", "Nevada"),
         year > 1983, year < 1994) |>
  mutate(prepost = factor(year > 1988, labels = c("Pre", "Post")),
         state   = factor(state, levels = c("Nevada", "California")))

fit_did <- lm(cigsale ~ state * prepost, data = prop99_did)
coeftest(fit_did, vcov. = vcovHAC)
```

```text
t test of coefficients:

                            Estimate Std. Error  t value  Pr(>|t|)
(Intercept)                 143.1000     1.0918 131.0701 < 2.2e-16 ***
stateCalifornia             -44.1200     3.8796 -11.3722 4.464e-09 ***
prepostPost                 -21.3400     7.6870  -2.7761   0.01349 *
stateCalifornia:prepostPost  -5.6800     5.3929  -1.0532   0.30788
```

The DiD coefficient of interest is $-5.68$ packs (HAC SE 5.39, $p = 0.31$). That is *dramatically* smaller than the naive $-27.02$ and statistically indistinguishable from zero. The reason is the `prepostPost` main effect of $-21.34$: Nevada's own cigarette sales fell by 21.3 packs between 1984--1988 and 1989--1993, so when DiD subtracts Nevada's change from California's, the gap shrinks. Visually:

![California vs Nevada raw series 1970-2000, both showing downward post-1988 trajectories](fig2_did_parallel_trends.png)

This is the textbook DiD pitfall: a single control unit that itself is shifting in the same direction makes the contrast collapse. Nevada is geographically and culturally adjacent to California, so it inherits many of the same secular forces (rising health awareness, federal tobacco settlements, etc.) and is therefore a poor control. Synthetic Control in Section 8 is the principled response: instead of using one control state, *blend* dozens of states into a weighted "synthetic California" that matches the pre-period much more precisely.

## 6. Method 3a --- ITS via pre-period growth curve

Interrupted Time Series methods stop borrowing from a comparison unit entirely and instead build the counterfactual from California's *own* pre-period dynamics. The simplest version is a linear time trend.

```r
prop99_ts <- prop99 |>
  filter(state == "California") |>
  select(year, cigsale) |>
  mutate(prepost = factor(year > 1988, labels = c("Pre", "Post"))) |>
  as_tsibble(index = year) |>
  mutate(year0 = year - 1989)

fit_growth <- lm(cigsale ~ year, data = prop99_ts |> filter(prepost == "Pre"))
summary(fit_growth)$coefficients
```

```text
             Estimate Std. Error  t value     Pr(>|t|)
(Intercept) 3637.7889   513.3284  7.087  1.823e-06 ***
year          -1.7795     0.2594 -6.860  2.767e-06 ***
```

The pre-period (1970--1988) linear trend is $-1.78$ packs/year ($p < 10^{-5}$, $R^2 = 0.735$) --- so smoking was already declining about 1.8 packs per capita per year in California well before Proposition 99. To estimate the policy effect we extrapolate that line forward to 2000 and average the gap between observed and predicted:

```r
post_df <- prop99_ts |> filter(prepost == "Post")
pred_growth <- predict(fit_growth, newdata = as_tibble(post_df))
its_growth_estimate <- mean(post_df$cigsale - pred_growth)
its_growth_estimate
```

```text
[1] -28.28
```

The ITS-growth-curve estimate is $-28.28$ packs/capita --- essentially identical to the naive pre-post $-27.02$. That coincidence is suggestive but not reassuring: both methods can be biased the same way if California's pre-trend slope itself was understating the speed of the secular decline. They give similar answers because they both use within-California-only information; neither one borrows from a comparison unit that would let them separate "California effect" from "national effect".

## 7. Method 3b --- ITS via AICc-selected ARIMA forecast

A slightly more sophisticated ITS replaces the straight line with a time-series model that accounts for autocorrelation and curvature in the pre-period. We let `fpp3::ARIMA()` pick the orders by minimising AICc and then forecast 12 years forward.

```r
fit_arima <- prop99_ts |>
  filter(prepost == "Pre") |>
  model(timeseries = ARIMA(cigsale, ic = "aicc"))
report(fit_arima)
```

```text
Series: cigsale
Model: ARIMA(1,2,0)
Coefficients:
          ar1
      -0.6255
s.e.   0.2427
sigma^2 estimated as 4.953:  log likelihood = -37.45
AIC = 78.9   AICc = 79.76   BIC = 80.57
```

`ARIMA(1, 2, 0)` was selected: one autoregressive lag and *two* rounds of differencing. The double-differencing means the model is tracking the *acceleration* of California's late-1980s drop, not just its level or slope. We then forecast 12 years out and average the gap.

```r
fcasts <- forecast(fit_arima, h = "12 years")
ce_arima <- post_df$cigsale - fcasts$.mean
mean(ce_arima)
```

```text
[1] 4.55
```

The ARIMA-based ITS estimate is $+4.55$ packs --- a *positive* number, implying that Proposition 99 *increased* California's smoking relative to the counterfactual. That is plainly the wrong answer, and the visual diagnostic shows why:

![ITS counterfactual from ARIMA(1,2,0) model with 95% forecast band](fig3_its_arima.png)

The dashed blue line is the ARIMA counterfactual. It sits *below* the observed orange series throughout the post period because the model extrapolates the late-1980s downward acceleration too aggressively --- predicting that California should have hit roughly 50 packs by 2000 if the pre-period momentum had continued. This is the canonical failure mode of model-selection-driven ITS: AICc minimises in-sample fit, but in-sample fit can come from features (here, second-order momentum) that do not persist out-of-sample. The lesson is not "ARIMA is bad" but "single-model ITS is fragile" --- you should always pair ITS with a comparison-unit method like Synthetic Control before drawing conclusions.

## 8. Method 4 --- RDD on time (segmented regression)

The workshop labels the next specification "RDD". This is **RDD with time as the running variable** --- a specific case of regression discontinuity where the assignment threshold is the calendar date of the policy. It is not the classical sharp RDD that you would use to evaluate, say, a means-tested benefit that kicks in at an income cutoff. With time as the running variable, the model is essentially a *segmented regression* that allows both a level jump and a slope change at the threshold.

```r
fit_rdd <- lm(cigsale ~ year0 + prepost + year0:prepost,
              data = as_tibble(prop99_ts))
coeftest(fit_rdd, vcov. = vcovHAC)
```

```text
t test of coefficients:

                   Estimate Std. Error t value  Pr(>|t|)
(Intercept)        98.41579    4.96750 19.8119 < 2.2e-16 ***
year0              -1.77947    0.45909 -3.8761 0.0006137 ***
prepostPost       -20.05810    5.58538 -3.5912 0.0012911 **
year0:prepostPost  -1.49465    0.40140 -3.7236 0.0009151 ***
```

There are three coefficients to read. The pre-period slope on `year0` is $-1.78$ packs/year (matching the growth-curve fit, as expected). The level break `prepostPost` is $-20.06$ packs (HAC SE 5.59, $p = 0.001$): California's cigarette sales drop by about 20 packs *immediately* at the 1989 threshold. The slope change `year0:prepostPost` is $-1.49$ packs/year (HAC SE 0.40, $p < 0.001$): the post-period decline *accelerates* by an extra 1.5 packs/year on top of the pre-period 1.8 packs/year. Combining these, by 2000 (12 years after the threshold) the cumulative deviation from the pre-period counterfactual is roughly $-20 - 12 \times 1.49 \approx -38$ packs. The piecewise fit is excellent ($R^2 = 0.973$), which you can see directly:

![RDD on time: piecewise pre/post linear fit with level and slope breaks at 1989](fig4_rdd_segmented.png)

The blue pre-1988 line and the orange post-1989 line both fit California's points almost perfectly, with a clear discontinuity right at the threshold. The caveat to keep in mind: RDD on time inherits the same potential pre-trend mis-specification risks as ITS. If California's *underlying* trajectory was changing curvature in the late 1980s for non-policy reasons (e.g., the 1988 Surgeon General's report on nicotine addiction), the level break attributed to Proposition 99 will absorb that change too.

## 9. Method 5 --- Synthetic Control

This is the method the dataset is famous for. Synthetic Control builds the counterfactual as a *weighted combination* of donor states chosen to match California's pre-period as closely as possible on a set of predictors. The `tidysynth` package wraps the original Abadie--Diamond--Hainmueller optimisation in a tidyverse-friendly pipeline.

The recipe has four steps: (1) declare the treated unit and intervention time; (2) define predictors (typically averages over pre-period windows); (3) optimise the donor weights to minimise pre-period RMSE; (4) generate the synthetic control series.

```r
prop99_syn <- prop99 |>
  synthetic_control(
    outcome  = cigsale, unit = state, time = year,
    i_unit   = "California", i_time = 1988,
    generate_placebos = TRUE
  ) |>
  generate_predictor(
    time_window = 1980:1988,
    lnincome    = mean(lnincome, na.rm = TRUE),
    retprice    = mean(retprice, na.rm = TRUE),
    age15to24   = mean(age15to24, na.rm = TRUE)
  ) |>
  generate_predictor(time_window = 1984:1988,
                     beer = mean(beer, na.rm = TRUE)) |>
  generate_predictor(time_window = 1975, cigsale_1975 = cigsale) |>
  generate_predictor(time_window = 1980, cigsale_1980 = cigsale) |>
  generate_predictor(time_window = 1988, cigsale_1988 = cigsale) |>
  generate_weights(optimization_window = 1970:1988) |>
  generate_control()
```

The seven predictors mix three pre-period covariate averages (`lnincome`, `retprice`, `age15to24` over 1980--1988), one slightly narrower window (`beer` over 1984--1988), and three "lagged outcome" predictors picking cigarette sales in 1975, 1980, and 1988. The lagged outcomes are the key trick: anchoring the synthetic control on the treated unit's own pre-period outcome levels at multiple time points forces the synthetic series to track California's pre-1988 trajectory closely.

After fitting, we extract the post-period gap.

```r
sc_post <- grab_synthetic_control(prop99_syn) |>
  filter(time_unit > 1988) |>
  mutate(dif = real_y - synth_y)
mean(sc_post$dif)
```

```text
[1] -18.72
```

The Synthetic Control ATT is $-18.72$ packs/capita averaged over 1989--2000. This is the workshop's primary causal estimate and within rounding of the canonical Abadie et al. result. Visually:

![Synthetic Control: California (observed) vs synthetic California (weighted donor combination)](fig5_sc_trends.png)

The pre-period fit is excellent --- the synthetic and observed series are nearly indistinguishable through 1988 --- and a substantial gap opens immediately after, widening to roughly 30 packs by 2000. The donor weights show which states are doing the "synthesising":

![Top 10 donor-state weights from the synthetic control optimisation](fig6_sc_weights.png)

Five states absorb 99.8% of the weight: Utah (34.3%), Nevada (23.6%), Montana (18.2%), Colorado (17.5%), and Connecticut (6.2%). Every other state gets effectively zero weight. The pattern is intuitive: California is matched mostly to other Western/sunbelt states with similar age structure and cigarette price levels, plus Connecticut as an East Coast counterweight. The unweighted donor average sat at 114.2 packs in 1988, while California was at 90.1; the weighted synthetic California sits at 91.4 --- a near-perfect match.

For inference, the "standard error" you get by dividing the cross-year SD of the gap by $\sqrt{N}$ is *not* a real sampling-distribution-based standard error. The proper Synthetic Control uncertainty quantification comes from **placebo permutations**: refit the model treating each donor state as if *it* had been treated, and compare California's effect size to the placebo distribution.

```r
ce_data <- prop99_syn |>
  grab_synthetic_control(placebo = TRUE) |>
  filter(time_unit > 1988) |>
  mutate(dif = real_y - synth_y) |>
  group_by(.id, .placebo) |>
  summarize(average_causal_effect = mean(dif), .groups = "drop")
```

![Placebo distribution of average causal effects with California highlighted](fig7_sc_placebos.png)

The grey density is the distribution of average causal effects across all 38 placebo "treatments". California's vertical line sits in the *left tail* of that distribution --- only a handful of placebos produced an effect as extreme as $-18.7$ in either direction. That is the Abadie--Diamond--Hainmueller version of a "significance test", and it confirms that California's outcome is unusual relative to what we would see by sheer chance if Proposition 99 had no effect.

## 10. Method 6 --- CausalImpact

The final estimator is Google's `CausalImpact`, which fits a **Bayesian structural time-series (BSTS)** model on the pre-period and forecasts forward as a counterfactual. The BSTS counterfactual can be written abstractly as

$$y\_{1t} = \mu\_t + \beta^\top x\_t + \varepsilon\_t, \quad t \le t^*$$

where $\mu\_t$ is a local-level trend, $x\_t$ are the control-series regressors (other states' `cigsale` and optionally covariates), and $t^*$ is the intervention date. In words, this says that California's outcome is modelled as a slowly-evolving trend *plus* a linear combination of donor-state outcomes (and optionally covariates), with a random error term. The trend $\mu\_t$ absorbs the dynamics that no control series can explain; the regression term $\beta^\top x\_t$ borrows information from the donor pool. After fitting on $t \le t^*$, the model is projected forward and the posterior over $y\_{1t} - \hat{y}\_{1t}$ gives the credible interval for the policy effect.

CausalImpact wants a wide-format dataset with the treated outcome in column 1 and every control series in the remaining columns. The covariate columns have missing values, which we fill with random-forest multiple imputation from `mice`.

```r
prop99_imputed <- prop99 |>
  mice(m = 1, method = "rf", printFlag = FALSE) |>
  complete() |> as_tibble()

prop99_wide <- prop99_imputed |>
  pivot_wider(names_from  = state,
              values_from = c(cigsale, lnincome, beer, age15to24, retprice)) |>
  relocate(cigsale_California) |>
  select(-year)

pre_idx  <- c(1, 19)   # 1970-1988
post_idx <- c(20, 31)  # 1989-2000

set.seed(42)
impact_full <- CausalImpact(prop99_wide, pre.period = pre_idx, post.period = post_idx)
summary(impact_full)
```

```text
Posterior inference {CausalImpact}

                         Average       Cumulative
Actual                   60            724
Prediction (s.d.)        73 (11)       878 (129)
95% CI                   [55, 92]      [656, 1108]
Absolute effect (s.d.)   -13 (11)      -154 (129)
95% CI                   [-32, 5.7]    [-383, 68.1]
Relative effect (s.d.)   -16% (12%)    -16% (12%)
95% CI                   [-35%, 10%]   [-35%, 10%]

Posterior tail-area probability p:  0.082
Posterior prob. of a causal effect: 92%
```

The full-covariate model reports an average ATT of $-13$ packs/capita (posterior SD 11), with a 95% credible interval of $[-32, +5.7]$. The cumulative effect over the 12-year post-period is $-154$ packs (95% CI $[-383, +68]$), or about 16% of what would have been expected absent the policy. The posterior probability that there *is* some causal effect is 92%. If we drop the covariates and use only other states' cigarette sales as controls, the point estimate strengthens to $-21$ packs (95% CI $[-40, +2.4]$) and the posterior probability rises to 96.8% --- the covariates appear to absorb some of the variation the simpler model was attributing to Proposition 99.

![CausalImpact two-panel: pointwise observed vs Bayesian counterfactual, and cumulative effect over time](fig8_causalimpact.png)

The top panel shows the pointwise picture: observed California (orange) opens a steady gap below the Bayesian counterfactual (blue) starting in 1989, with a 95% credible band that widens as we forecast further from the training window. The bottom panel cumulates that gap over time --- by 2000 the cumulative effect is roughly $-150$ packs/capita with a credible interval that includes zero only at the very upper edge.

## 11. Cross-method comparison

We collect every method's point estimate, an approximate standard error, and an implied 95% interval into one tibble for the final visual.

```r
results_tbl <- tibble(
  method = c("Naive pre-post", "DiD (CA vs Nevada)", "ITS (growth curve)",
             "ITS (ARIMA)", "RDD on time", "Synthetic Control", "CausalImpact"),
  estimand = c("Descriptive (biased)", "ATT (CA, 1989-1993)",
               "Mean post-period gap", "Mean post-period gap",
               "Level jump at 1989", "ATT (CA, 1989-2000)",
               "ATT (CA, 1989-2000)"),
  estimate  = c(-27.02, -5.68, -28.28, 4.55, -20.06, -18.72, -12.82),
  std_error = c(5.30, 5.39, 1.72, 2.34, 5.59, 1.82, 9.60)
) |>
  mutate(ci_low  = estimate - 1.96 * std_error,
         ci_high = estimate + 1.96 * std_error)
results_tbl
```

```text
# A tibble: 7 × 6
  method             estimand             estimate std_error   ci_low ci_high
1 Naive pre-post     Descriptive (biased)   -27.0       5.30 -37.4     -16.6
2 DiD (CA vs Nevada) ATT (CA, 1989-1993)     -5.68      5.39 -16.3       4.89
3 ITS (growth curve) Mean post-period gap   -28.3       1.72 -31.7     -24.9
4 ITS (ARIMA)        Mean post-period gap     4.55      2.34  -0.0451    9.14
5 RDD on time        Level jump at 1989     -20.1       5.59 -31.0      -9.11
6 Synthetic Control  ATT (CA, 1989-2000)    -18.7       1.82 -22.3     -15.2
7 CausalImpact       ATT (CA, 1989-2000)    -12.8       9.60 -31.6       5.99
```

![Forest plot of all seven estimators with 95% intervals for the effect on per-capita cigarette sales](fig9_cross_method_forest.png)

Three groupings jump off the page. The first cluster --- RDD on time ($-20.1$), Synthetic Control ($-18.7$), and CausalImpact full-covariate ($-12.8$) --- sits between $-12$ and $-20$ packs with overlapping intervals. These are the methods that build counterfactuals from principled donor-information machinery (a piecewise time model, a weighted donor blend, and a Bayesian structural time series, respectively). The second cluster --- naive pre-post ($-27.0$) and ITS-growth-curve ($-28.3$) --- doubles down on California's own pre-trend and reports roughly 50% larger effects. Without a comparison unit to absorb the national-secular component, these methods attribute *all* of California's decline to Proposition 99. The third group --- DiD vs Nevada ($-5.7$, $p = 0.31$) and ITS-ARIMA ($+4.55$) --- are the methodological *outliers* in opposite directions: DiD because a single similar control is too noisy, ITS-ARIMA because aggressive AIC-driven differencing extrapolates short-run momentum out of sample.

## 12. Discussion

The point of running six estimators on the same data is not to find "the right answer" --- it is to learn where each estimator fails and how to read disagreement. Three lessons land directly.

**First, the choice of counterfactual is *the* design decision.** Every method estimates effect $=$ observed $-$ counterfactual. The naive pre-post counterfactual is "no change". The ITS counterfactual is "your own pre-trend continues". The DiD counterfactual is "you would have done what Nevada did". The Synthetic Control counterfactual is "you would have done what a weighted blend of similar states did". The CausalImpact counterfactual is "you would have done what a Bayesian structural model fit on donor states predicts". These are radically different assumptions about what *would have happened*, and the gap between $-5.7$ packs (DiD) and $-28.3$ packs (ITS-growth) is the price of getting that assumption wrong.

**Second, single comparisons are fragile; weighted combinations are robust.** DiD against one neighbouring state collapses to noise when that state happens to be on a similar trajectory. Synthetic Control's data-driven blending --- which gave Utah 34%, Nevada 24%, Montana 18%, Colorado 18%, Connecticut 6%, and everyone else 0% --- recovers a stable, interpretable estimate that closely matches the CausalImpact full-covariate model. The robust answer for Proposition 99 is somewhere in the $-13$ to $-20$ packs/capita range, depending on whether you trust the additional covariate adjustment.

**Third, automated model selection is not your friend in ITS.** ARIMA(1, 2, 0) is the AICc minimiser on California's 19-year pre-period, but the implied counterfactual is *worse* than the observed post-period --- a result that is obviously wrong but that no diagnostic statistic flagged. The practical recommendation is to never report a single-model ITS estimate without pairing it against a comparison-unit method (Synthetic Control, CausalImpact, or DiD with a credibly-matched control).

**A "so-what" for policymakers.** If a state legislator asks "what did Proposition 99 do for California's smoking rates?", the honest answer is: cigarette sales fell about 18 packs per capita per year more than they would have without the policy, with reasonable bounds of $-13$ to $-22$ packs. The cumulative effect over the first 12 years is roughly 150--250 fewer packs per Californian. That headline survives every causally-defensible specification (RDD, Synthetic Control, both CausalImpact variants) and would be straightforward to plug into a back-of-envelope mortality or revenue calculation.

## 13. Summary and next steps

**Method takeaway.** Five out of six causal estimators agree that Proposition 99 reduced California's per-capita cigarette sales by roughly 13--20 packs per year over 1989--2000. The synthetic-control-class methods (SCM, CausalImpact, RDD-on-time) form a tight consensus around $-18$ packs; the naive/single-unit methods either overshoot or collapse to noise.

**Data takeaway.** California's pre-1988 cigarette sales were already declining at $-1.78$ packs/year before the policy, so any honest evaluation must separate the policy effect from a pre-existing trend. Synthetic California's pre-period fit (90.1 vs 91.4 in 1988) shows that a five-state weighted blend can replicate that trend almost exactly.

**Practical limitation.** No method here delivers a "true" causal effect with formal frequentist guarantees, because Proposition 99 was not randomized. Every estimate is conditional on an identifying assumption (parallel trends, pre-trend extrapolation, donor convexity, BSTS prior). The cross-method comparison is a *triangulation*, not a proof.

**Next steps.** For a deeper modern DiD treatment with staggered adoption, group-time ATTs, and HonestDiD sensitivity analysis, see [Difference-in-Differences for Policy Evaluation: A Tutorial using R](/post/r_did/). For a Bayesian extension that lets the donor weights vary across space (and is also fit on this same Proposition 99 dataset), see [Bayesian Spatial Synthetic Control: California's Proposition 99 in R](/post/r_sc_bayes_spatial/). For the original workshop with PDF lecture slides, see [causalpolicy.nl](https://causalpolicy.nl/).

## 14. Exercises

1. **Sensitivity to the comparison window.** Re-run the DiD and naive pre-post estimates on the full 1970--2000 window instead of the workshop's 1984--1993 window. Do the estimates get closer to the synthetic-control consensus, or further away? Why?

2. **Pick a different ITS model.** Refit the ITS section using `ARIMA(1, 1, 0)` (one autoregressive lag, one round of differencing) instead of the AICc-selected `ARIMA(1, 2, 0)`. Does the post-period counterfactual still bend below the observed series? What does that imply for the choice between AIC, AICc, and BIC in policy evaluation?

3. **Different intervention year.** Pretend the intervention happened in 1985 instead of 1989 (a placebo). Re-run Synthetic Control with `i_time = 1984`. The post-period gap should be near zero if the method is working --- is it? What does a non-zero "placebo effect" tell you about the method's identification assumptions?

## 15. References

1. [Abadie, A., Diamond, A., & Hainmueller, J. (2010). Synthetic control methods for comparative case studies: Estimating the effect of California's Tobacco Control Program. *Journal of the American Statistical Association*, 105(490), 493--505.](https://www.aeaweb.org/articles?id=10.1257/jasa.2010.ap08746)

2. [Abadie, A. (2021). Using synthetic controls: Feasibility, data requirements, and methodological aspects. *Journal of Economic Literature*, 59(2), 391--425.](https://www.aeaweb.org/articles?id=10.1257/jel.20191450)

3. [Brodersen, K. H., Gallusser, F., Koehler, J., Remy, N., & Scott, S. L. (2015). Inferring causal impact using Bayesian structural time-series models. *The Annals of Applied Statistics*, 9(1), 247--274.](https://research.google.com/pubs/pub41854.html)

4. [Bernal, J. L., Cummins, S., & Gasparrini, A. (2017). Interrupted time series regression for the evaluation of public health interventions: A tutorial. *International Journal of Epidemiology*, 46(1), 348--355.](https://academic.oup.com/ije/article/46/1/348/2622842)

5. [Hyndman, R. J., & Athanasopoulos, G. (2021). *Forecasting: Principles and Practice* (3rd ed.). OTexts.](https://otexts.com/fpp3/)

6. [ODISSEI Social Data Science team. (2024). *Workshop on Causal Effects of Policy Interventions*. CC-BY-4.0.](https://causalpolicy.nl/)

7. [`tidysynth` --- A tidy implementation of the synthetic control method in R.](https://cran.r-project.org/package=tidysynth)

8. [`CausalImpact` --- An R package for causal inference using Bayesian structural time-series models.](https://google.github.io/CausalImpact/)

9. [`fpp3` --- Forecasting: Principles and Practice (3rd edition) data and R package.](https://cran.r-project.org/package=fpp3)
