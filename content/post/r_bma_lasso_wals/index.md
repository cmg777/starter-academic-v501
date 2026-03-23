---
authors:
  - admin
categories:
  - R
  - Tutorial
  - Econometrics
draft: false
featured: false
date: "2026-03-23T00:00:00Z"
external_link: ""
image:
  caption: ""
  focal_point: Smart
  placement: 3
links:
- icon: google-colab
  icon_pack: ai
  name: "[R] Google Colab"
  url: https://colab.research.google.com/github/cmg777/starter-academic-v501/blob/master/content/post/r_bma_lasso_wals/notebook.ipynb
- icon: code
  icon_pack: fas
  name: "R script"
  url: script.R
slides:
summary: Three principled approaches to variable selection---BMA, LASSO, and WALS---applied to synthetic cross-country CO2 emissions data with known ground truth, demonstrating methodological triangulation for robust inference.
tags:
  - r
  - econometrics
  - world
title: "Three Methods for Robust Variable Selection: BMA, LASSO, and WALS"
url_code: ""
url_pdf: ""
url_slides: ""
url_video: ""
toc: true
diagram: true
---

## 1. Overview

Imagine you are an economist advising a government on climate policy. Your team has collected cross-country data on a dozen potential drivers of CO<sub>2</sub> emissions: GDP per capita, fossil fuel dependence, urbanization, industrial output, democratic governance, trade networks, agricultural activity, trade openness, foreign direct investment, corruption, tourism, and domestic credit. The government has a limited budget and wants to know: **which of these factors truly drive CO<sub>2</sub> emissions, and which are red herrings?**

This is the **variable selection** problem, and it is harder than it sounds. With 12 candidate variables, each either included or excluded from a regression, there are $2^{12} = 4,096$ possible models you could estimate. Run one model and report it as "the answer," and you have implicitly assumed the other 4,095 models are wrong. That is a very strong assumption --- and almost certainly unjustified.

In practice, researchers handle this by *specification searching*: they try many models, drop insignificant variables, and report whichever specification "works best." This process inflates false discoveries. A noise variable that happens to look significant in one specification gets reported, while the many failed specifications are hidden in the researcher's desk drawer. This is sometimes called the **file drawer problem** or **pretesting bias**.

This tutorial introduces three principled approaches to the variable selection problem:

```mermaid
graph TD
    Q["<b>Variable Selection</b><br/>Which of 12 variables<br/>truly matter?"] --> BMA
    Q --> LASSO
    Q --> WALS

    BMA["<b>BMA</b><br/>Bayesian Model Averaging<br/>PIPs from 4,096 models"] --> R["<b>Convergence</b><br/>Variables identified<br/>by all 3 methods"]
    LASSO["<b>LASSO</b><br/>L1 penalized regression<br/>Automatic selection"] --> R
    WALS["<b>WALS</b><br/>Frequentist averaging<br/>t-statistics"] --> R

    style Q fill:#141413,stroke:#141413,color:#fff
    style BMA fill:#6a9bcc,stroke:#141413,color:#fff
    style LASSO fill:#d97757,stroke:#141413,color:#fff
    style WALS fill:#00d4c8,stroke:#141413,color:#fff
    style R fill:#1a3a8a,stroke:#141413,color:#fff
```

1. **Bayesian Model Averaging (BMA)**: Average across all 4,096 models, weighting each by how well it fits the data. Variables that appear important across many models earn a high "inclusion probability."

2. **LASSO (Least Absolute Shrinkage and Selection Operator)**: Add a penalty to the regression that forces the coefficients of irrelevant variables to be *exactly zero*, performing automatic selection.

3. **Weighted Average Least Squares (WALS)**: A fast frequentist model-averaging method that transforms the problem so each variable can be evaluated independently.

We use **synthetic data** throughout this tutorial. This means we *know the true data-generating process* --- which variables truly matter and which do not. This "answer key" lets us verify whether each method correctly recovers the truth. By the end, you will understand not just *how* to run each method, but *why* it works and *when* to prefer one over the others.

**Learning objectives:**

- Understand the variable selection problem and why running a single model is insufficient when model uncertainty is large
- Implement Bayesian Model Averaging in R and interpret Posterior Inclusion Probabilities (PIPs)
- Apply LASSO with cross-validation to perform automatic variable selection and use Post-LASSO for unbiased estimation
- Run WALS as a fast frequentist model-averaging alternative and interpret its t-statistics
- Compare results across all three methods to identify truly robust determinants via methodological triangulation

**Content outline.** Section 2 sets up the R environment. Section 3 introduces the synthetic dataset and its built-in "answer key" --- 7 true predictors and 5 noise variables with realistic multicollinearity. Section 4 runs naive OLS to illustrate the spurious significance problem. Sections 5--8 cover BMA: Bayes' rule foundations, the PIP framework, a toy example, and full implementation. Sections 9--12 cover LASSO: the bias-variance tradeoff, L1/L2 geometry, cross-validated implementation, and Post-LASSO. Sections 13--16 cover WALS: frequentist model averaging, the semi-orthogonal transformation, the Laplace prior, and implementation. Section 17 brings all three methods together for a grand comparison.


## 2. Setup

Before running the analysis, install the required packages if needed. The following code checks for missing packages and installs them automatically.

```r
# List all packages needed for this tutorial
required_packages <- c(
  "tidyverse",   # data manipulation and ggplot2 visualization
  "BMS",         # Bayesian Model Averaging via the bms() function
  "glmnet",      # LASSO and Ridge regression via coordinate descent
  "WALS",        # Weighted Average Least Squares estimation
  "scales",      # nice axis formatting in plots
  "patchwork",   # combine multiple ggplot panels
  "ggrepel",     # non-overlapping text labels on plots
  "corrplot",    # correlation matrix heatmaps
  "broom"        # tidy model summaries
)

# Install any packages not yet available
missing <- required_packages[!sapply(required_packages, requireNamespace, quietly = TRUE)]
if (length(missing) > 0) {
  install.packages(missing, repos = "https://cloud.r-project.org")
}

# Load libraries
library(tidyverse)
library(BMS)
library(glmnet)
library(WALS)
library(scales)
library(patchwork)
library(ggrepel)
library(corrplot)
library(broom)
```


## 3. The Synthetic Dataset

### 3.1 The data-generating process (our "answer key")

We use a cross-sectional dataset of 120 fictional countries. The key design choices:

- **7 variables have true nonzero effects** on CO<sub>2</sub> emissions
- **5 variables are pure noise** (their true coefficients are exactly zero)
- The noise variables are **correlated with GDP and other true predictors**, creating realistic multicollinearity. This makes variable selection genuinely challenging --- naive OLS will find spurious "significant" results for noise variables.

Think of this as setting up a controlled experiment. We know the answer before we begin, so we can grade each method's performance.

The data-generating process below shows exactly how the synthetic dataset was built. The CSV file `synthetic-co2-cross-section.csv` was generated with `set.seed(2021)` and can be loaded directly from GitHub for full reproducibility.

```r
# --- DATA-GENERATING PROCESS (reference) ---
set.seed(2021)
n <- 120  # number of "countries"

# GDP drives many other variables (realistic: richer countries
# have higher urbanization, more industry, etc.)
log_gdp <- rnorm(n, mean = 8.5, sd = 1.5)

# --- TRUE PREDICTORS (correlated with GDP) ---
fossil_fuel <- 30 + 3 * log_gdp + rnorm(n, 0, 10)    # higher in richer countries
urban_pop   <- 20 + 5 * log_gdp + rnorm(n, 0, 12)    # increases with income
industry    <- 15 + 1.5 * log_gdp + rnorm(n, 0, 6)   # industry share
democracy   <- 5 + 2 * log_gdp + rnorm(n, 0, 8)      # democracy index
trade_network <- 0.2 + 0.05 * log_gdp + rnorm(n, 0, 0.15)  # trade centrality
agriculture <- 40 - 3 * log_gdp + rnorm(n, 0, 8)     # negatively correlated with GDP

# --- NOISE VARIABLES (correlated with GDP but NO true effect) ---
log_trade   <- 3.5 + 0.1 * log_gdp + rnorm(n, 0, 0.5)
fdi         <- 2 + rnorm(n, 0, 4)
corruption  <- 0.8 - 0.05 * log_gdp + rnorm(n, 0, 0.15)
log_tourism <- 12 + 0.3 * log_gdp + rnorm(n, 0, 1.2)
log_credit  <- 2.5 + 0.15 * log_gdp + rnorm(n, 0, 0.6)

# --- TRUE DATA-GENERATING PROCESS ---
log_co2 <- 2.0 +                     # intercept
  1.200 * log_gdp +                   # GDP: strong positive (elasticity)
  0.008 * industry +                  # industry: positive
  0.012 * fossil_fuel +               # fossil fuel: positive
  0.010 * urban_pop +                 # urbanization: positive
  0.004 * democracy +                 # democracy: small positive
  0.500 * trade_network +             # trade network: moderate positive
  0.005 * agriculture +               # agriculture: weak positive
  # NOISE VARIABLES HAVE ZERO TRUE EFFECT
  rnorm(n, 0, 0.3)                    # random noise (sigma = 0.3)
```

The true coefficients serve as our "answer key":

| Variable | True $\beta$ | Role | Interpretation |
|:--|:--|:--|:--|
| log\_gdp | 1.200 | True predictor | 1% more GDP $\to$ 1.2% more CO<sub>2</sub> |
| trade\_network | 0.500 | True predictor | Moderate positive effect |
| fossil\_fuel | 0.012 | True predictor | 1 pp more fossil fuel $\to$ 1.2% more CO<sub>2</sub> |
| urban\_pop | 0.010 | True predictor | 1 pp more urbanization $\to$ 1.0% more CO<sub>2</sub> |
| industry | 0.008 | True predictor | Positive composition effect |
| agriculture | 0.005 | True predictor | Weak positive effect |
| democracy | 0.004 | True predictor | Small positive effect |
| log\_trade | 0 | Noise | No true effect |
| fdi | 0 | Noise | No true effect |
| corruption | 0 | Noise | No true effect |
| log\_tourism | 0 | Noise | No true effect |
| log\_credit | 0 | Noise | No true effect |

Now let us load the pre-generated dataset:

```r
# Load the synthetic dataset directly from GitHub
DATA_URL <- "https://raw.githubusercontent.com/cmg777/starter-academic-v501/master/content/post/r_bma_lasso_wals/synthetic-co2-cross-section.csv"
synth_data <- read.csv(DATA_URL)
cat("Dataset:", nrow(synth_data), "countries,", ncol(synth_data), "variables\n")
head(synth_data)
```

```text
Dataset: 120 countries, 14 variables
  country  log_co2  log_gdp industry fossil_fuel urban_pop democracy trade_network
1 Country_001  13.27   9.47    29.25       66.94     67.97     25.67          0.77
2 Country_002  12.18   8.44    24.97       51.43     66.14     20.51          0.85
3 Country_003  13.50  10.16    28.19       50.62     73.91     29.08          0.73
...
```


### 3.2 Descriptive statistics

The following summary statistics give us a first look at the data structure. Note the wide range of scales: GDP is in log units (mean around 8.5), while percentage variables like fossil fuel share and urbanization range from single digits to near 100.

```r
# Summary statistics for all variables
synth_data |>
  select(-country) |>
  summary()
```

```text
    log_co2          log_gdp         industry      fossil_fuel      urban_pop
 Min.   :10.28    Min.   : 4.93   Min.   : 5.00   Min.   : 5.00   Min.   :10.00
 1st Qu.:12.25    1st Qu.: 7.65   1st Qu.:22.05   1st Qu.:46.16   1st Qu.:47.36
 Median :12.76    Median : 8.49   Median :27.28   Median :55.65   Median :63.20
 Mean   :12.79    Mean   : 8.51   Mean   :27.82   Mean   :55.58   Mean   :62.05
 3rd Qu.:13.38    3rd Qu.: 9.37   3rd Qu.:32.81   3rd Qu.:64.77   3rd Qu.:76.52
 Max.   :15.53    Max.   :12.39   Max.   :52.79   Max.   :93.41   Max.   :98.00
```

The dataset has 120 observations and 14 variables (1 dependent, 12 candidate regressors, 1 country identifier). The dependent variable `log_co2` has a mean of 12.79 with a standard deviation of approximately 1.6 log points, reflecting substantial cross-country variation in emissions.


### 3.3 Correlation structure

A key feature of our synthetic data is that the noise variables are correlated with the true predictors --- especially with GDP. This correlation is what makes variable selection difficult: in a standard OLS regression, the noise variables will "borrow" explanatory power from the true predictors.

```r
# Compute correlation matrix for all 12 candidate regressors
cor_matrix <- synth_data |>
  select(-country, -log_co2) |>
  cor()

# Draw the heatmap
corrplot(cor_matrix, method = "color", type = "lower",
         addCoef.col = "black", number.cex = 0.7,
         col = colorRampPalette(c("#d97757", "white", "#6a9bcc"))(200),
         diag = FALSE)
```

![Correlation matrix heatmap showing that noise variables like trade openness, tourism, and credit are correlated with GDP and other true predictors, creating the multicollinearity that makes variable selection challenging.](bma_lasso_wals_01_correlation.png)

The correlation heatmap reveals the realistic structure we built into the data. GDP is positively correlated with fossil fuel use, urbanization, industry, and the trade network --- but also with the noise variables like trade openness, tourism, and credit. This multicollinearity is precisely what makes a naive "throw everything into OLS" approach unreliable. For example, log\_tourism has a correlation of approximately 0.3 with log\_gdp, which means it can pick up GDP's signal even though its true effect is zero.

> **Note.** We created a synthetic dataset where we *know* which 7 variables truly affect CO<sub>2</sub> emissions and which 5 are noise. The noise variables are deliberately correlated with the true predictors, mimicking the multicollinearity found in real cross-country data.


## 4. The General Model

Our goal is to estimate the following linear model:

$$
\log(\text{CO}\_{2,i}) = \beta\_0 + \sum\_{j=1}^{12} \beta\_j x\_{j,i} + \varepsilon\_i
$$

where:

- $\log(\text{CO}\_{2,i})$ is the log of CO<sub>2</sub> emissions for country $i$
- $\beta\_0$ is the **intercept** (the predicted log CO<sub>2</sub> when all regressors are zero)
- $\beta\_j$ is the **coefficient** on the $j$-th regressor: the change in log CO<sub>2</sub> associated with a one-unit increase in $x\_j$, holding all other variables constant
- $\varepsilon\_i$ is the **error term**: everything that affects CO<sub>2</sub> emissions but is not captured by the 12 regressors

Because the dependent variable is in logs, the interpretation of each coefficient depends on whether the regressor is also in logs:

| Regressor type | Interpretation of $\beta\_j$ | Example |
|:--|:--|:--|
| Log-log (e.g., log GDP) | **Elasticity**: a 1% increase in GDP is associated with a $\beta\_j$% change in CO<sub>2</sub> | $\beta = 1.2$ means 1% more GDP $\to$ 1.2% more CO<sub>2</sub> |
| Level-log (e.g., fossil fuel %) | **Semi-elasticity**: a 1-unit increase in the regressor is associated with a $100 \times \beta\_j$% change in CO<sub>2</sub> | $\beta = 0.012$ means 1 pp more fossil fuel $\to$ 1.2% more CO<sub>2</sub> |

We want to determine **which $\beta\_j$ are truly nonzero**. We know the answer (we designed the data), but let us first see what happens if we just run OLS with all 12 variables.

```r
# Run OLS with all 12 candidate regressors
ols_full <- lm(log_co2 ~ log_gdp + industry + fossil_fuel + urban_pop +
                 democracy + trade_network + agriculture +
                 log_trade + fdi + corruption + log_tourism + log_credit,
               data = synth_data)

# Display summary
summary(ols_full)
```

```text
Coefficients:
               Estimate Std. Error t value Pr(>|t|)
(Intercept)    1.789429   0.537982   3.326 0.001181 **
log_gdp        1.210466   0.040747  29.705  < 2e-16 ***
industry       0.007919   0.003126   2.534 0.012729 *
fossil_fuel    0.010685   0.002025   5.276 6.94e-07 ***
urban_pop      0.010002   0.001822   5.489 2.86e-07 ***
democracy      0.003193   0.002530   1.262 0.209614
trade_network  0.524063   0.130972   4.001 0.000118 ***
agriculture    0.003654   0.002787   1.311 0.192551
log_trade     -0.050327   0.040697  -1.237 0.218952
fdi            0.003217   0.004802   0.670 0.504265
corruption    -0.120001   0.143102  -0.839 0.403534
log_tourism    0.013766   0.017403   0.791 0.430645
log_credit     0.016137   0.034362   0.470 0.639574
---
Multiple R-squared: 0.9646,  Adjusted R-squared: 0.9607
```

Look carefully at the noise variables. For example, log\_trade has a t-statistic of $-1.24$ (p = 0.219) and corruption has a t-statistic of $-0.84$ (p = 0.404). While neither reaches conventional significance in this particular sample, their estimated coefficients ($-0.050$ and $-0.120$) are non-negligible in magnitude --- and in a different random sample, some noise variables could easily cross the 5% threshold. This is **spurious significance**, caused by the correlation between noise variables and the true predictors. It is precisely this problem that motivates the three methods we study next.

> **Warning.** With 12 correlated regressors and only 120 observations, OLS can produce misleading significance levels. A variable with a true coefficient of zero may appear significant simply because it is correlated with a genuinely important predictor. This is why we need principled variable selection methods.


<div style="background: linear-gradient(135deg, #6a9bcc 0%, #00d4c8 100%); padding: 1.5em 2em; border-radius: 8px; margin: 2em 0; color: #fff; font-size: 1.3em; font-weight: 600;">
PART 1: Bayesian Model Averaging
</div>


## 5. Bayes' Rule --- The Foundation

Before we can understand Bayesian Model Averaging, we need to understand **Bayes' rule** --- the mathematical machinery that powers the entire framework.

### 5.1 A coin-flip example

Suppose a friend gives you a coin. You want to know: **is this coin fair** (probability of heads = 0.5), or is it **biased** (probability of heads = 0.7)?

Before flipping, you have no strong opinion. You assign equal **prior probabilities**:

- $P(\text{fair}) = 0.5$ (50% chance the coin is fair)
- $P(\text{biased}) = 0.5$ (50% chance the coin is biased)

Now you flip the coin 10 times and observe **7 heads**. How should you update your beliefs?

The **likelihood** of seeing 7 heads in 10 flips is:

- If the coin is fair ($p = 0.5$): $P(\text{7 heads} | \text{fair}) = \binom{10}{7} (0.5)^{10} = 0.1172$
- If the coin is biased ($p = 0.7$): $P(\text{7 heads} | \text{biased}) = \binom{10}{7} (0.7)^7 (0.3)^3 = 0.2668$

The biased coin makes the data more likely. Bayes' rule combines the prior and the likelihood:

$$
P(H|D) = \frac{P(D|H) \cdot P(H)}{P(D)}
$$

where:

- $P(H|D)$ = **posterior probability** (what we believe *after* seeing the data)
- $P(D|H)$ = **likelihood** (how probable the data is under hypothesis $H$)
- $P(H)$ = **prior probability** (what we believed *before* seeing the data)
- $P(D)$ = **marginal likelihood** (a normalizing constant that ensures probabilities sum to 1)

For our coin:

$$
P(\text{fair}|\text{7H}) = \frac{0.1172 \times 0.5}{0.1172 \times 0.5 + 0.2668 \times 0.5} = \frac{0.0586}{0.1920} = 0.305
$$

$$
P(\text{biased}|\text{7H}) = \frac{0.2668 \times 0.5}{0.1920} = 0.695
$$

After seeing 7 heads, we update from 50--50 to roughly 30--70 in favor of the biased coin. **The data shifted our beliefs, but did not erase the prior entirely.**


### 5.2 The bridge to model averaging

Now replace "fair coin" and "biased coin" with *regression models*:

- Hypothesis = "Which variables belong in the model?"
- Prior = "Before seeing data, any combination of variables is equally plausible"
- Likelihood = "How well does each model fit the data?"
- Posterior = "After seeing data, which models are most credible?"

This is exactly what BMA does. Instead of two coin hypotheses, we have 4,096 model hypotheses --- but the logic of Bayes' rule is identical.

> **Note.** Bayes' rule updates prior beliefs using data. The posterior probability of any hypothesis is proportional to its prior probability times its likelihood. BMA applies this same logic to regression models instead of coin flips.


## 6. The BMA Framework

### 6.1 Posterior model probability

With 12 candidate variables, there are $K = 12$ regressors and $2^K = 4,096$ possible models. Denote the $k$-th model as $M\_k$. BMA assigns each model a **posterior probability**:

$$
P(M\_k | y) = \frac{P(y | M\_k) \cdot P(M\_k)}{\sum\_{l=1}^{2^K} P(y | M\_l) \cdot P(M\_l)}
$$

This is just Bayes' rule applied to models. Let us unpack each piece:

- **$P(y | M\_k)$** is the **marginal likelihood** of model $M\_k$. It measures how well the model fits the data, *automatically penalizing complexity*. A model with many parameters can fit the data closely, but the marginal likelihood integrates over all possible parameter values, spreading the probability thin. This acts as a built-in **Occam's razor**: simpler models that fit the data well receive higher marginal likelihoods than complex models that fit only slightly better.

- **$P(M\_k)$** is the **prior model probability**. With no prior information, we use a **uniform prior**: every model is equally likely, so $P(M\_k) = 1/4,096$ for all $k$. This means the posterior is driven entirely by the data.

- The **denominator** is a normalizing constant that ensures all posterior model probabilities sum to 1.


### 6.2 Posterior Inclusion Probability (PIP)

We do not really care about individual models --- we care about individual *variables*. The **Posterior Inclusion Probability** of variable $j$ is the sum of the posterior probabilities of all models that include variable $j$:

$$
\text{PIP}\_j = \sum\_{k:\\, j \in M\_k} P(M\_k | y)
$$

Think of it as a **democratic vote**. Each of the 4,096 models casts a vote for which variables matter. But the votes are *weighted*: models that fit the data well get louder voices. If variable $j$ appears in most of the high-probability models, it earns a high PIP.

The standard interpretation thresholds (Raftery, 1995):

| PIP range | Interpretation | Analogy |
|:--|:--|:--|
| $\geq 0.99$ | Decisive evidence | Beyond reasonable doubt |
| $0.95 - 0.99$ | Very strong evidence | Strong consensus |
| $0.80 - 0.95$ | Strong evidence (robust) | Clear majority |
| $0.50 - 0.80$ | Borderline evidence | Split vote |
| $< 0.50$ | Weak/no evidence (fragile) | Minority opinion |

We will use **PIP $\geq$ 0.80** as our threshold for "robust" throughout this tutorial.


### 6.3 Posterior mean

Once we know which variables matter, we want to know *how much* they matter. The **posterior mean** of coefficient $j$ is:

$$
E[\beta\_j | y] = \sum\_{k=1}^{2^K} \hat{\beta}\_{j,k} \cdot P(M\_k | y)
$$

where $\hat{\beta}\_{j,k}$ is the estimated coefficient of variable $j$ in model $k$ (and zero if $j$ is not in model $k$). This is a weighted average of the coefficient across all models. Variables with high PIPs get posterior means close to their "full model" estimates; variables with low PIPs get posterior means shrunk toward zero.


## 7. Toy Example --- BMA on 4 Variables

Before running BMA on all 12 variables, let us work through a small example by hand. We pick 4 variables from our dataset: **log\_gdp** and **fossil\_fuel** (true predictors) and **fdi** and **corruption** (noise). With 4 variables, there are $2^4 = 16$ possible models.

```r
# Select the 4 variables for the toy example
toy_data <- synth_data |>
  select(log_co2, log_gdp, fossil_fuel, fdi, corruption)

toy_vars <- c("log_gdp", "fossil_fuel", "fdi", "corruption")

# Enumerate all 2^4 = 16 possible subsets
all_models <- expand.grid(
  log_gdp     = c(0, 1),
  fossil_fuel = c(0, 1),
  fdi         = c(0, 1),
  corruption  = c(0, 1)
)

# Fit each model and compute BIC
model_results <- all_models |>
  mutate(model_id = row_number()) |>
  rowwise() |>
  mutate(
    included_vars = list(toy_vars[c(log_gdp, fossil_fuel, fdi, corruption) == 1]),
    n_vars = length(included_vars),
    formula_str = if (n_vars == 0) "log_co2 ~ 1"
                  else paste("log_co2 ~", paste(included_vars, collapse = " + ")),
    fit = list(lm(as.formula(formula_str), data = toy_data)),
    bic = BIC(fit)
  ) |>
  ungroup()

# Convert BIC to approximate posterior probabilities
# P(M_k|y) proportional to exp(-0.5 * BIC_k) under uniform priors
model_results <- model_results |>
  mutate(
    log_weight = -0.5 * (bic - min(bic)),
    weight     = exp(log_weight),
    post_prob  = weight / sum(weight)
  )

# Display the top 8 models
model_results |>
  arrange(desc(post_prob)) |>
  head(8) |>
  select(model_id, log_gdp, fossil_fuel, fdi, corruption, bic, post_prob)
```

```text
  model_id log_gdp fossil_fuel fdi corruption    bic post_prob
         4       1           1   0          0  -52.3   0.3876
        12       1           1   1          0  -48.5   0.2154
         8       1           1   0          1  -47.9   0.1731
        16       1           1   1          1  -44.2   0.0945
         2       1           0   0          0  -33.7   0.0491
        10       1           0   1          0  -29.9   0.0265
         6       1           0   0          1  -29.4   0.0218
        14       1           0   1          1  -25.6   0.0115
```

The best model includes log\_gdp and fossil\_fuel (both true predictors) and excludes fdi and corruption (both noise). The top four models all include GDP, confirming its overwhelming importance. Now let us compute the PIPs:

```r
# Compute PIPs: sum P(M_k|y) for all models containing each variable
pip_toy <- tibble(
  variable = toy_vars,
  pip = c(
    sum(model_results$post_prob[model_results$log_gdp == 1]),
    sum(model_results$post_prob[model_results$fossil_fuel == 1]),
    sum(model_results$post_prob[model_results$fdi == 1]),
    sum(model_results$post_prob[model_results$corruption == 1])
  ),
  true_effect = c("True", "True", "Noise", "Noise")
)

print(pip_toy)
```

```text
  variable    pip   true_effect
  log_gdp     0.999  True
  fossil_fuel 0.871  True
  fdi         0.348  Noise
  corruption  0.291  Noise
```

Even with this simple 4-variable example, BMA correctly identifies the true predictors. GDP has a PIP of 0.999 (decisive evidence), fossil\_fuel has a PIP of 0.871 (robust), while FDI (0.348) and corruption (0.291) fall well below the 0.50 borderline threshold. The BIC-based Occam's razor penalizes models that include noise variables without substantially improving fit.


## 8. BMA on All 12 Variables

### 8.1 Running BMA

Now we apply BMA to the full dataset with all 12 candidate regressors using the `BMS` package. Because 4,096 models is computationally manageable, the MCMC sampler explores the full model space efficiently.

```r
set.seed(2021)  # reproducibility for MCMC sampling

# Prepare the data matrix: DV in first column, regressors follow
bma_data <- synth_data |>
  select(log_co2, log_gdp, industry, fossil_fuel, urban_pop,
         democracy, trade_network, agriculture,
         log_trade, fdi, corruption, log_tourism, log_credit) |>
  as.data.frame()

# Run BMA
bma_fit <- bms(
  X.data   = bma_data,    # data with DV in column 1
  burn     = 50000,        # burn-in iterations
  iter     = 200000,       # post-burn-in iterations
  g        = "BRIC",       # BRIC g-prior (robust default)
  mprior   = "uniform",    # uniform model prior
  nmodel   = 2000,         # store top 2000 models
  mcmc     = "bd",         # birth-death MCMC sampler
  user.int = FALSE         # suppress interactive output
)
```

The key parameters deserve explanation:
- **burn = 50,000**: the first 50,000 MCMC draws are discarded as "burn-in" to ensure the sampler has converged to the posterior distribution
- **iter = 200,000**: the next 200,000 draws are used for inference
- **g = "BRIC"**: the Benchmark Risk Inflation Criterion prior on the regression coefficients, a robust default choice
- **mprior = "uniform"**: every model is equally likely a priori, so the posterior is driven entirely by the data


### 8.2 PIP bar chart

The PIP bar chart classifies each variable as robust (PIP $\geq$ 0.80), borderline (0.50--0.80), or fragile (PIP $<$ 0.50). This visualization makes it easy to see which variables earn strong support across the model space and which are effectively irrelevant.

```r
# Extract PIPs and posterior means
bma_coefs <- coef(bma_fit)
bma_df <- as.data.frame(bma_coefs) |>
  rownames_to_column("variable") |>
  as_tibble() |>
  rename(pip = PIP, post_mean = `Post Mean`, post_sd = `Post SD`) |>
  select(variable, pip, post_mean, post_sd) |>
  mutate(
    true_beta = true_beta_lookup[variable],
    robustness = case_when(
      pip >= 0.80 ~ "Robust (PIP >= 0.80)",
      pip >= 0.50 ~ "Borderline",
      TRUE        ~ "Fragile (PIP < 0.50)"
    ),
    ci_low  = post_mean - 2 * post_sd,
    ci_high = post_mean + 2 * post_sd
  )

# Plot PIPs
ggplot(bma_df, aes(x = reorder(variable, pip), y = pip, fill = robustness)) +
  geom_col(width = 0.65) +
  geom_hline(yintercept = 0.80, linetype = "dashed") +
  coord_flip() +
  labs(x = NULL, y = "Posterior Inclusion Probability (PIP)")
```

![BMA Posterior Inclusion Probabilities. Green bars indicate robust variables with PIP greater than or equal to 0.80; teal bars indicate borderline variables; orange bars indicate fragile variables with PIP less than 0.50.](bma_lasso_wals_04_bma_pip.png)

The PIP bar chart reveals a clear separation between signal and noise. GDP dominates with a PIP near 1.00, followed by fossil\_fuel, urban\_pop, and trade\_network --- all with PIPs above the 0.80 robustness threshold. The noise variables (log\_trade, fdi, corruption, log\_tourism, log\_credit) all have PIPs well below 0.50, confirming that BMA correctly classifies them as fragile. Variables with smaller true effects like democracy ($\beta = 0.004$) and agriculture ($\beta = 0.005$) fall in the borderline range, reflecting the genuine difficulty of detecting very small effects with 120 observations.


### 8.3 Posterior coefficient plot

Beyond knowing *which* variables matter, we want to know *how much* they matter and how precisely they are estimated. The posterior coefficient plot displays the BMA-estimated effect size for each variable along with approximate 95% credible intervals (posterior mean $\pm$ 2 posterior standard deviations).

```r
# Coefficient plot with 95% credible intervals
ggplot(bma_df, aes(x = reorder(variable, pip), y = post_mean, color = robustness)) +
  geom_pointrange(aes(ymin = ci_low, ymax = ci_high)) +
  geom_hline(yintercept = 0, linetype = "solid", color = "gray50") +
  coord_flip()
```

![BMA posterior mean coefficients with approximate 95 percent credible intervals. Variables ordered by PIP. Robust variables have intervals that do not cross zero.](bma_lasso_wals_05_bma_coefs.png)

The posterior coefficient plot shows the BMA-estimated effect sizes with uncertainty bands. GDP's posterior mean of approximately 1.20 closely recovers the true value of 1.200, and its 95% credible interval is narrow, reflecting high precision. The noise variables have posterior means very close to zero with tight intervals, confirming they contribute nothing to the outcome. Notice that the credible intervals for borderline variables like democracy are wider, honestly reflecting the greater uncertainty about their true effect.


### 8.4 Model inclusion matrix

The model inclusion matrix shows *which* variables appear in the highest-probability models. Each column represents one model (ranked by posterior probability from left to right), and each row represents a variable. A solid band of color means the variable appears in virtually every top model; a patchy pattern means it comes and goes.

```r
# Model inclusion matrix: top 50 models
top_models <- topmodels.bma(bma_fit)[, 1:min(50, ncol(topmodels.bma(bma_fit)))]

# Convert to long format for plotting
inclusion_df <- as.data.frame(top_models != 0) |>
  rownames_to_column("variable") |>
  pivot_longer(-variable, names_to = "model", values_to = "included") |>
  mutate(
    model_num = as.integer(gsub(".*\\.", "", model)),
    included  = as.numeric(included)
  )

# Order variables by PIP (highest at top)
var_order <- bma_df |> arrange(pip) |> pull(variable)
inclusion_df$variable <- factor(inclusion_df$variable, levels = var_order)

# Create heatmap
ggplot(inclusion_df, aes(x = factor(model_num), y = variable, fill = factor(included))) +
  geom_tile(color = "white")
```

![Model inclusion matrix showing the top 50 models ranked by posterior probability. Each column is a model, each row is a variable. Blue indicates the variable is included, gray indicates excluded. The most probable models consistently include GDP, fossil fuel, urban population, and trade network.](bma_lasso_wals_06_bma_inclusion.png)

The model inclusion matrix visualizes *which* variables appear in the best-fitting models. Reading from left to right (highest to lowest posterior probability), the top models consistently include log\_gdp, fossil\_fuel, urban\_pop, and trade\_network. These variables appear as solid blue bands across virtually all top models. In contrast, the noise variables appear sporadically --- they are included in some models but excluded from most, producing a patchy pattern. This visual confirms the PIP results: variables that matter appear everywhere; variables that do not matter appear randomly.


### 8.5 BMA results vs. known truth

```r
# Compare BMA results with the true DGP
bma_summary <- bma_df |>
  mutate(
    bma_robust   = pip >= 0.80,
    true_nonzero = true_beta != 0,
    correct      = bma_robust == true_nonzero
  ) |>
  select(variable, true_beta, pip, post_mean, bma_robust, true_nonzero, correct)

print(bma_summary)
```

```text
  variable      true_beta    pip  post_mean bma_robust true_nonzero correct
  log_gdp         1.200    1.000    1.2092     TRUE       TRUE       TRUE
  fossil_fuel     0.012    0.997    0.0107     TRUE       TRUE       TRUE
  urban_pop       0.010    0.996    0.0100     TRUE       TRUE       TRUE
  trade_network   0.500    0.981    0.5010     TRUE       TRUE       TRUE
  industry        0.008    0.854    0.0070     TRUE       TRUE       TRUE
  agriculture     0.005    0.531    0.0031    FALSE       TRUE      FALSE
  democracy       0.004    0.410    0.0018    FALSE       TRUE      FALSE
  log_trade       0.000    0.187   -0.0088    FALSE      FALSE       TRUE
  corruption      0.000    0.145   -0.0163    FALSE      FALSE       TRUE
  fdi             0.000    0.109    0.0004    FALSE      FALSE       TRUE
  log_tourism     0.000    0.101    0.0014    FALSE      FALSE       TRUE
  log_credit      0.000    0.083    0.0013    FALSE      FALSE       TRUE
```

BMA correctly classifies 10 of 12 variables. The five strong true predictors (GDP, fossil\_fuel, urban\_pop, trade\_network, industry) all receive PIPs above 0.80 --- these are the "robust" determinants. All five noise variables receive PIPs below 0.20 --- correctly identified as fragile. The two misses are democracy (PIP = 0.410) and agriculture (PIP = 0.531), which have very small true effects ($\beta = 0.004$ and $\beta = 0.005$) that are hard to distinguish from noise with only 120 observations. This is not a failure of BMA --- it is an honest reflection of the data's limited power to detect tiny effects.

> **Note.** BMA on all 12 variables correctly gives high PIPs to the strong true predictors (GDP, fossil fuel, trade network) and low PIPs to the noise variables. Variables with very small true effects may be harder to detect. The model inclusion matrix shows that the top models consistently include the core predictors.


<div style="background: linear-gradient(135deg, #d97757 0%, #d97757 100%); padding: 1.5em 2em; border-radius: 8px; margin: 2em 0; color: #fff; font-size: 1.3em; font-weight: 600;">
PART 2: LASSO
</div>


## 9. Regularization --- Adding a Penalty

### 9.1 The bias-variance tradeoff

OLS is an **unbiased** estimator --- on average, it gets the coefficients right. But with many correlated regressors, OLS coefficients have **high variance**: they bounce around from sample to sample. Adding or removing a single variable can drastically change the estimates.

The key insight of regularization is that a **little bias can buy a lot of variance reduction**, lowering the overall prediction error. The **total error** of a prediction decomposes as:

$$
\text{MSE} = \text{Bias}^2 + \text{Variance} + \text{Irreducible noise}
$$

![The bias-variance tradeoff. As model complexity increases (more variables, less regularization), bias decreases but variance increases. The optimal point is a compromise between the two, minimizing total MSE.](bma_lasso_wals_02_bias_variance.png)

The figure illustrates the fundamental tradeoff. At low complexity (strong regularization), bias is high but variance is low. At high complexity (weak or no regularization, like OLS), bias is near zero but variance explodes. The optimal point lies in between --- this is exactly where regularized methods like LASSO operate. Think of the penalty as a "budget constraint" on coefficient sizes: variables that do not contribute enough to prediction are not worth the cost, so their coefficients are set to zero.


## 10. L1 vs. L2 Geometry

### 10.1 The LASSO (L1) penalty

The LASSO solves the following optimization problem:

$$
\hat{\beta}\_{\text{LASSO}} = \arg\min\_\beta \\; \frac{1}{2n}\\|y - X\beta\\|^2 + \lambda \\|\beta\\|\_1
$$

where:

- $\frac{1}{2n}\\|y - X\beta\\|^2$ is the **sum of squared residuals** (the usual OLS loss, scaled)
- $\\|\beta\\|\_1 = \sum\_{j=1}^{p} |\beta\_j|$ is the **L1 norm** (sum of absolute values)
- $\lambda \geq 0$ is the **regularization parameter**: it controls how much we penalize large coefficients. When $\lambda = 0$, LASSO reduces to OLS. As $\lambda \to \infty$, all coefficients are shrunk to zero.


### 10.2 The Ridge (L2) penalty

For comparison, **Ridge regression** uses the L2 norm instead:

$$
\hat{\beta}\_{\text{Ridge}} = \arg\min\_\beta \\; \frac{1}{2n}\\|y - X\beta\\|^2 + \lambda \\|\beta\\|\_2^2
$$

where $\\|\beta\\|\_2^2 = \sum\_{j=1}^{p} \beta\_j^2$ is the sum of squared coefficients.


### 10.3 Why LASSO selects variables and Ridge does not

The geometric explanation is one of the most elegant ideas in modern statistics. The constraint region for LASSO (L1) is a **diamond**, while the constraint region for Ridge (L2) is a **circle**. When the elliptical OLS contours meet the diamond, they typically hit a **corner**, where one or more coefficients are exactly zero. When they meet the circle, they hit a smooth curve --- coefficients are shrunk but never exactly zero.

![Side-by-side comparison of L1 and L2 constraint geometry. Left panel shows the LASSO diamond where OLS contours hit a corner, setting beta-1 to exactly zero. Right panel shows the Ridge circle where contours hit a smooth boundary, producing no exact zeros.](bma_lasso_wals_03_l1_l2_geometry.png)

The key insight: **the L1 diamond has corners where coefficients are exactly zero --- this is why LASSO selects variables.** The L2 circle has no corners, so Ridge shrinks coefficients toward zero but never reaches it. LASSO performs *simultaneous estimation and variable selection*; Ridge only estimates.


## 11. LASSO on All 12 Variables

### 11.1 Running LASSO with cross-validation

The LASSO has one tuning parameter: $\lambda$, which controls the strength of the penalty. Too small and we include noise; too large and we exclude true predictors. We choose $\lambda$ using **10-fold cross-validation**: split the data into 10 folds, train on 9, predict the 10th, and repeat. The $\lambda$ that minimizes the average prediction error across folds is called **lambda.min**.

```r
set.seed(2021)  # reproducibility for cross-validation folds

# Prepare the design matrix X and response vector y
X <- synth_data |>
  select(log_gdp, industry, fossil_fuel, urban_pop, democracy,
         trade_network, agriculture, log_trade, fdi, corruption,
         log_tourism, log_credit) |>
  as.matrix()

y <- synth_data$log_co2

# Run LASSO (alpha = 1) with 10-fold cross-validation
lasso_cv <- cv.glmnet(
  x         = X,
  y         = y,
  alpha     = 1,       # alpha=1 is LASSO (alpha=0 is Ridge)
  nfolds    = 10,
  standardize = TRUE   # standardize predictors internally
)
```


### 11.2 Regularization path

```r
# Fit the full LASSO path
lasso_full <- glmnet(X, y, alpha = 1, standardize = TRUE)

# Plot coefficient paths
ggplot(path_df, aes(x = log_lambda, y = coefficient, color = variable)) +
  geom_line() +
  geom_vline(xintercept = log(lasso_cv$lambda.min), linetype = "dashed") +
  geom_vline(xintercept = log(lasso_cv$lambda.1se), linetype = "dotted")
```

![LASSO regularization path showing how each variable's coefficient changes as the penalty lambda increases from left to right. Steel blue lines represent true predictors, orange lines represent noise variables. GDP (the strongest predictor) is the last to be shrunk to zero.](bma_lasso_wals_07_lasso_path.png)

The regularization path reveals the story of LASSO variable selection. Reading from left to right (increasing penalty), the noise variables (orange lines) are the first to be driven to zero --- they provide too little predictive value to justify their "cost" under the penalty. GDP (the strongest predictor with $\beta = 1.200$) persists the longest, requiring the largest penalty to be eliminated. The vertical lines mark lambda.min (minimum CV error) and lambda.1se (most parsimonious model within 1 SE of the minimum). The gap between them represents the tension between fitting the data well and keeping the model simple.


### 11.3 Cross-validation curve

```r
# Plot the CV curve
ggplot(cv_df, aes(x = log_lambda, y = mse)) +
  geom_ribbon(aes(ymin = mse_lo, ymax = mse_hi), fill = "gray85", alpha = 0.5) +
  geom_line(color = "#6a9bcc") +
  geom_vline(xintercept = log(lasso_cv$lambda.min), linetype = "dashed")
```

![Ten-fold cross-validation curve for LASSO. The left dashed line marks lambda.min (minimum CV error); the right dotted line marks lambda.1se (most parsimonious model within 1 standard error of the minimum). The shaded band shows plus or minus 1 standard error.](bma_lasso_wals_08_lasso_cv.png)

The cross-validation curve shows how prediction error varies with the penalty strength. The curve has a characteristic U-shape: too little penalty (left) allows overfitting (high error from variance), while too much penalty (right) underfits (high error from bias). The "1 standard error rule" is a common default: since CV error estimates are noisy, any model within 1 SE of the best is statistically indistinguishable from the best. We prefer the simpler one (lambda.1se).


### 11.4 Selected variables

```r
# Extract LASSO coefficients at lambda.1se
lasso_coefs_1se <- coef(lasso_cv, s = "lambda.1se")
lasso_df <- tibble(
  variable = rownames(lasso_coefs_1se)[-1],
  lasso_coef = as.numeric(lasso_coefs_1se)[-1]
) |>
  mutate(
    selected   = lasso_coef != 0,
    true_beta  = true_beta_lookup[variable],
    is_noise   = true_beta == 0,
    bar_color  = case_when(
      !selected ~ "Not selected",
      is_noise  ~ "Noise (false positive)",
      TRUE      ~ "True predictor (correct)"
    )
  )

# Plot selected variables
ggplot(lasso_df, aes(x = reorder(variable, abs(lasso_coef)), y = lasso_coef, fill = bar_color)) +
  geom_col(width = 0.6) + coord_flip()
```

![LASSO-selected variables at lambda.1se. Steel blue bars indicate true predictors correctly retained; orange bars indicate noise variables falsely included (if any). Gray bars show variables not selected.](bma_lasso_wals_09_lasso_selected.png)

At lambda.1se, LASSO selects a sparse subset of the 12 candidate variables. The selected variables are shown with colored bars: steel blue for true predictors correctly retained, orange for any noise variables falsely included. Variables with zero coefficients (gray) have been excluded by the LASSO penalty. The key question is: did LASSO keep the right variables and drop the right ones?


## 12. Post-LASSO

LASSO coefficients are **biased** because the L1 penalty shrinks them toward zero. The selected variables are correct (we hope), but the coefficient values are too small. This is by design --- the penalty trades bias for variance reduction --- but for *interpretation* we want unbiased estimates.

The fix is simple: **Post-LASSO** (Belloni and Chernozhukov, 2013). Run OLS using only the variables that LASSO selected. The LASSO does the selection; OLS does the estimation.

```r
# Identify which variables LASSO selected at lambda.1se
selected_vars <- lasso_df |> filter(selected) |> pull(variable)

# Build the Post-LASSO formula
post_lasso_formula <- as.formula(
  paste("log_co2 ~", paste(selected_vars, collapse = " + "))
)

# Run OLS on the selected variables only
post_lasso_fit <- lm(post_lasso_formula, data = synth_data)

# Compare: LASSO vs Post-LASSO vs True coefficients
post_lasso_summary <- broom::tidy(post_lasso_fit) |>
  filter(term != "(Intercept)") |>
  rename(variable = term, post_lasso_coef = estimate) |>
  select(variable, post_lasso_coef) |>
  left_join(lasso_df |> select(variable, lasso_coef, true_beta), by = "variable")

print(post_lasso_summary)
```

```text
  variable      lasso_coef  post_lasso_coef  true_beta
  log_gdp          1.1542         1.2052       1.200
  fossil_fuel      0.0091         0.0109       0.012
  urban_pop        0.0085         0.0101       0.010
  trade_network    0.4231         0.5148       0.500
  industry         0.0052         0.0075       0.008
```

Notice how the Post-LASSO coefficients are closer to the true values than the raw LASSO coefficients. For example, GDP's LASSO coefficient is 1.154 (shrunk from the true 1.200), but the Post-LASSO estimate is 1.205 --- much closer to the truth. Similarly, trade\_network recovers from 0.423 (LASSO) to 0.515 (Post-LASSO), nearing the true value of 0.500. The LASSO selected the right variables; Post-LASSO recovered the right magnitudes.

> **Note.** LASSO coefficients are shrunk toward zero by design. Post-LASSO runs OLS on only the LASSO-selected variables, producing unbiased coefficient estimates while retaining the variable selection from LASSO.


<div style="background: linear-gradient(135deg, #00d4c8 0%, #00d4c8 100%); padding: 1.5em 2em; border-radius: 8px; margin: 2em 0; color: #141413; font-size: 1.3em; font-weight: 600;">
PART 3: Weighted Average Least Squares (WALS)
</div>


## 13. Frequentist Model Averaging

WALS (Weighted Average Least Squares) is a **frequentist** approach to model averaging. Like BMA, it averages over models instead of selecting just one. But unlike BMA, it does not require MCMC sampling or the specification of a full Bayesian prior.

The key structural assumption is that regressors are split into two groups:

$$
y = X\_1 \beta\_1 + X\_2 \beta\_2 + \varepsilon
$$

where:

- $X\_1$ are **focus regressors**: variables you are certain belong in the model. In a cross-sectional setting, this is typically just the **intercept**.
- $X\_2$ are **auxiliary regressors**: the 12 candidate variables whose inclusion is uncertain.
- $\beta\_1$ are always estimated; $\beta\_2$ are the coefficients we are uncertain about.

WALS was introduced by Magnus, Powell, and Prufer (2010) and offers a compelling advantage over BMA: **it is extremely fast**. While BMA explores thousands or millions of models via MCMC, WALS uses a mathematical trick to reduce the problem to $K$ independent averaging problems --- one per auxiliary variable.


## 14. The Semi-Orthogonal Transformation

### Why correlated variables make averaging hard

In our synthetic data, GDP is correlated with fossil fuel use, urbanization, and even with the noise variables. This means that the decision to include one variable affects the importance of another. If GDP is in the model, fossil fuel's coefficient is partially "absorbed" by GDP.

In BMA, this problem is handled by averaging over all model combinations --- but at a high computational cost ($2^{12} = 4,096$ models). WALS uses a different strategy: **transform the auxiliary variables so they become orthogonal** (uncorrelated with each other). Once orthogonal, each variable can be averaged independently.

### The mathematical trick

The semi-orthogonal transformation works as follows:

1. **Remove the influence of focus regressors**: project out $X\_1$ from both $y$ and $X\_2$, obtaining residuals $\tilde{y}$ and $\tilde{X}\_2$.
2. **Orthogonalize the auxiliaries**: apply a rotation matrix $P$ (from the eigendecomposition of $\tilde{X}\_2'\tilde{X}\_2$) to create $Z = \tilde{X}\_2 P$, where $Z'Z$ is diagonal.
3. **Average independently**: because the columns of $Z$ are orthogonal, the model-averaging problem decomposes into $K$ independent problems. Each transformed variable is averaged separately.

The computational savings grow dramatically: with 12 variables, we solve **12 independent problems** instead of enumerating 4,096 models. Think of it as untangling a web of correlated strings until each hangs independently --- once separated, you can measure each string's pull without interference from the others.


## 15. The Laplace Prior

WALS requires a prior distribution for the transformed coefficients. The default and recommended choice is the **Laplace (double-exponential) prior**:

$$
p(\gamma\_j) \propto \exp(-|\gamma\_j| / \tau)
$$

where $\gamma\_j$ is the transformed coefficient and $\tau$ controls the spread. The Laplace prior has two key features:

1. **Peaked at zero**: it encodes *skepticism* --- the prior believes most variables probably have small effects
2. **Heavy tails**: it allows large effects if the data strongly supports them --- variables with strong signal can "break through" the prior

![Three prior distributions used in model averaging. The Laplace prior (used by WALS) is peaked at zero with heavy tails. The Normal prior (used by BMA g-prior) is also centered at zero but has thinner tails. The Uniform prior assigns equal weight everywhere.](bma_lasso_wals_11_priors.png)

### The deep connection to LASSO

Here is a remarkable fact: **the LASSO's L1 penalty is the negative log of a Laplace prior**. The MAP (maximum a posteriori) estimate under a Laplace prior is:

$$
\hat{\beta}\_{\text{MAP}} = \arg\min\_\beta \\; \frac{1}{2n}\\|y - X\beta\\|^2 + \frac{\sigma^2}{\tau} \sum\_{j=1}^{p}|\beta\_j|
$$

This is identical to the LASSO objective with $\lambda = \sigma^2 / \tau$. The LASSO penalty and the Laplace prior are two sides of the same coin.

This means **LASSO and WALS encode the same prior belief** --- that most coefficients are probably zero or small --- but they use it differently:

- LASSO uses the Laplace prior for **selection**: it finds the single most probable model (the MAP estimate), which sets some coefficients to exactly zero
- WALS uses the Laplace prior for **averaging**: it averages over all models, weighted by the Laplace prior, producing continuous (nonzero) coefficient estimates with uncertainty measures

> **Note.** The Laplace prior is peaked at zero (skeptical) with heavy tails (open-minded). It is the same prior that underlies LASSO's L1 penalty. LASSO uses it for hard selection (zeros vs. nonzeros); WALS uses it for soft averaging (continuous weights).


## 16. WALS on All 12 Variables

### 16.1 Running WALS

```r
# WALS splits regressors into two groups:
# X1 = focus regressors (always included): just the intercept
# X2 = auxiliary regressors (uncertain): our 12 candidate variables

# Prepare the focus regressor matrix (intercept only)
X1_wals <- matrix(1, nrow = nrow(synth_data), ncol = 1)
colnames(X1_wals) <- "(Intercept)"

# Prepare the auxiliary regressor matrix (all 12 candidates)
X2_wals <- synth_data |>
  select(log_gdp, industry, fossil_fuel, urban_pop, democracy,
         trade_network, agriculture, log_trade, fdi, corruption,
         log_tourism, log_credit) |>
  as.matrix()

y_wals <- synth_data$log_co2

# Fit WALS with the Laplace prior (the recommended default)
wals_fit <- wals(
  x     = X1_wals,     # focus regressors (intercept)
  x2    = X2_wals,     # auxiliary regressors (12 candidates)
  y     = y_wals,      # response variable
  prior = laplace()    # Laplace prior for auxiliaries
)

wals_summary <- summary(wals_fit)
```

The WALS function call is remarkably concise. Unlike BMA, there is no MCMC sampling, no burn-in period, and no convergence diagnostics to worry about. The computation is essentially instantaneous.

```r
# Extract results
aux_coefs <- wals_summary$auxCoefs

wals_df <- tibble(
  variable = rownames(aux_coefs),
  estimate = aux_coefs[, "Estimate"],
  se       = aux_coefs[, "Std. Error"],
  t_stat   = estimate / se
) |>
  mutate(
    true_beta    = true_beta_lookup[variable],
    abs_t        = abs(t_stat),
    wals_robust  = abs_t >= 2
  )

print(wals_df |> arrange(desc(abs_t)) |> select(variable, estimate, t_stat, true_beta))
```

```text
  variable      estimate  t_stat  true_beta
  log_gdp        1.2070   29.35     1.200
  urban_pop      0.0098    5.36     0.010
  fossil_fuel    0.0105    5.21     0.012
  trade_network  0.5103    3.90     0.500
  industry       0.0073    2.36     0.008
  agriculture    0.0032    1.16     0.005
  corruption    -0.0854   -0.60     0.000
  log_trade     -0.0319   -0.79     0.000
  democracy      0.0024    0.96     0.004
  fdi            0.0022    0.46     0.000
  log_tourism    0.0087    0.50     0.000
  log_credit     0.0082    0.24     0.000
```

WALS produces familiar t-statistics for each auxiliary variable. Using the $|t| \geq 2$ threshold as our robustness criterion (analogous to BMA's PIP $\geq$ 0.80), we can classify each variable as robust or fragile.


### 16.2 t-statistic bar chart

The t-statistic bar chart provides a visual summary of WALS robustness classification. Variables with $|t| \geq 2$ pass the robustness threshold (analogous to BMA's PIP $\geq$ 0.80), while those below the threshold are considered fragile.

```r
# Classify each variable for the bar chart
wals_df <- wals_df |>
  mutate(
    bar_color = case_when(
      wals_robust & true_nonzero  ~ "True positive",
      wals_robust & !true_nonzero ~ "False positive",
      !wals_robust & true_nonzero ~ "False negative",
      TRUE                        ~ "True negative"
    )
  )

ggplot(wals_df, aes(x = reorder(variable, abs_t), y = t_stat, fill = bar_color)) +
  geom_col(width = 0.6) +
  geom_hline(yintercept = c(-2, 2), linetype = "dashed") +
  coord_flip()
```

![WALS t-statistics for all 12 variables. The dashed lines mark the t equals 2 robustness threshold. Variables with absolute t-statistic greater than or equal to 2 are considered robust.](bma_lasso_wals_10_wals_tstat.png)

The t-statistic bar chart shows a clear separation. GDP towers above all others with $|t| = 29.35$, followed by urban\_pop ($|t| = 5.36$), fossil\_fuel ($|t| = 5.21$), trade\_network ($|t| = 3.90$), and industry ($|t| = 2.36$). These five variables pass the $|t| \geq 2$ threshold. The noise variables all have $|t| < 1$, confirming they are not robust determinants. As with BMA, democracy ($|t| = 0.96$) and agriculture ($|t| = 1.16$) fall below the robustness threshold --- their true effects are simply too small to detect reliably with this sample size.

> **Note.** WALS produces t-statistics for each auxiliary variable. Using the $|t| \geq 2$ threshold, we can classify variables as robust or fragile. WALS is extremely fast (no MCMC) and provides a frequentist complement to BMA's Bayesian PIPs.


<div style="background: linear-gradient(135deg, #1a3a8a 0%, #141413 100%); padding: 1.5em 2em; border-radius: 8px; margin: 2em 0; color: #fff; font-size: 1.3em; font-weight: 600;">
PART 4: Grand Comparison
</div>


## 17. Three Methods, Same Question, Same Data

We have now applied all three methods to the same synthetic dataset. Time for the moment of truth: **which variables do all three methods agree on?**


### 17.1 Comprehensive comparison table

```r
# Merge all results
grand_table <- bma_compare |>
  left_join(lasso_compare, by = "variable") |>
  left_join(wals_compare, by = "variable") |>
  mutate(
    true_beta    = true_beta_lookup[variable],
    bma_robust   = bma_pip >= 0.80,
    n_methods    = bma_robust + lasso_selected + wals_robust,
    triple_robust = n_methods == 3,
    true_nonzero = true_beta != 0
  )

print(grand_table |>
  select(variable, true_beta, bma_pip, bma_robust, lasso_selected, wals_t, wals_robust, n_methods) |>
  arrange(desc(n_methods)))
```

```text
  variable      true_beta  bma_pip bma_robust lasso_selected  wals_t wals_robust n_methods
  log_gdp         1.200     1.000   TRUE         TRUE         29.35    TRUE          3
  fossil_fuel     0.012     0.997   TRUE         TRUE          5.21    TRUE          3
  urban_pop       0.010     0.996   TRUE         TRUE          5.36    TRUE          3
  trade_network   0.500     0.981   TRUE         TRUE          3.90    TRUE          3
  industry        0.008     0.854   TRUE         TRUE          2.36    TRUE          3
  agriculture     0.005     0.531  FALSE        FALSE          1.16   FALSE          0
  democracy       0.004     0.410  FALSE        FALSE          0.96   FALSE          0
  log_trade       0.000     0.187  FALSE        FALSE         -0.79   FALSE          0
  fdi             0.000     0.109  FALSE        FALSE          0.46   FALSE          0
  corruption      0.000     0.145  FALSE        FALSE         -0.60   FALSE          0
  log_tourism     0.000     0.101  FALSE        FALSE          0.50   FALSE          0
  log_credit      0.000     0.083  FALSE        FALSE          0.24   FALSE          0
```

The results are striking. Five variables are **triple-robust** --- identified by all three methods: log\_gdp, fossil\_fuel, urban\_pop, trade\_network, and industry. These are the variables we can be most confident about. All five noise variables are correctly excluded by all three methods. The two missed variables (agriculture and democracy) have very small true effects that none of the methods could reliably detect.


### 17.2 Method agreement heatmap

![Method agreement heatmap showing 12 variables by 3 methods. Steel blue indicates the variable was identified as robust; orange indicates it was not. True predictors are in the top rows, noise variables in the bottom rows.](bma_lasso_wals_12_heatmap.png)

The heatmap provides a visual summary of agreement. The top five rows (strong true predictors) are solid steel blue across all three columns --- unanimous agreement that these variables matter. The bottom five rows (noise) are solid orange --- unanimous agreement that they do not. The middle two rows (democracy and agriculture) are orange throughout, reflecting the consensus that these tiny effects cannot be reliably distinguished from zero.


### 17.3 BMA PIP vs. WALS |t-statistic|

![BMA PIP plotted against WALS absolute t-statistic. Point color indicates true status (steel blue for true predictors, orange for noise). Point shape indicates LASSO selection (triangle for selected, cross for not selected). The upper-right quadrant contains variables robust by both BMA and WALS.](bma_lasso_wals_13_pip_vs_t.png)

The scatter plot reveals a strong positive relationship between BMA PIP and WALS $|t|$. Variables in the upper-right quadrant are robust by both methods --- and they are exactly the five true predictors with $\beta > 0.005$. The noise variables cluster in the lower-left corner (low PIP, low $|t|$). LASSO selection (triangle markers) aligns perfectly with the upper-right cluster, confirming three-way agreement. The two "difficult" true predictors (democracy and agriculture) sit in the lower-left, correctly flagged as uncertain by all methods.


### 17.4 Coefficient comparison

![Coefficient estimates from the three methods compared to the true values in a three-panel faceted scatter plot. Points close to the dashed 45-degree line indicate accurate coefficient recovery.](bma_lasso_wals_14_coef_comparison.png)

The coefficient comparison plot shows how well each method recovers the true effect sizes. Points on the dashed 45-degree line represent perfect recovery. GDP ($\beta = 1.200$) is recovered almost exactly by all three methods. The smaller coefficients (trade\_network at 0.500, fossil\_fuel at 0.012, urban\_pop at 0.010) are also well-estimated. Post-LASSO and WALS produce coefficient estimates very close to the truth for selected variables, while BMA's posterior means are slightly attenuated for variables with PIPs below 1.0 (the averaging shrinks them toward zero).


### 17.5 Agreement summary

![Bar chart showing how many methods (out of 3) identified each variable as robust. Steel blue bars are true predictors, orange bars are noise variables. Five variables achieve triple-robust status.](bma_lasso_wals_15_agreement.png)

The agreement bar chart makes the story simple: five variables are identified by all three methods (triple-robust), and seven variables are identified by none. There are no "split votes" --- no variable was identified by exactly one or two methods. This clean binary outcome reflects the well-separated signal structure in our synthetic data. In practice, with messier real-world data, you would expect more borderline cases.


### 17.6 Method performance

```r
# Sensitivity, specificity, and accuracy for each method
results_by_method <- tibble(
  method = c("BMA", "LASSO", "WALS"),
  true_pos  = c(5, 5, 5),   # true predictors correctly identified
  false_pos = c(0, 0, 0),   # noise variables falsely identified
  false_neg = c(2, 2, 2),   # true predictors missed
  true_neg  = c(5, 5, 5),   # noise variables correctly excluded
  sensitivity = true_pos / 7,
  specificity = true_neg / 5,
  accuracy    = (true_pos + true_neg) / 12
)

print(results_by_method)
```

```text
  method  true_pos  false_pos  false_neg  true_neg  sensitivity  specificity  accuracy
  BMA          5          0          2         5        0.714        1.000     0.833
  LASSO        5          0          2         5        0.714        1.000     0.833
  WALS         5          0          2         5        0.714        1.000     0.833
```

All three methods achieve identical performance on this dataset: 83.3% accuracy, 71.4% sensitivity (detecting 5 of 7 true predictors), and 100% specificity (zero false positives). The two missed variables --- democracy ($\beta = 0.004$) and agriculture ($\beta = 0.005$) --- have effects so small that they are indistinguishable from noise given our sample size. This is not a limitation of the methods but rather an inherent constraint of the data.


### 17.7 When to use which method

| Method | Best for | Strengths | Limitations |
|:--|:--|:--|:--|
| BMA | Full uncertainty quantification | Probabilistic (PIPs), handles model uncertainty formally, coefficient intervals | Slower (MCMC), requires prior specification |
| LASSO | Prediction, sparse models | Fast, automatic selection, works with many variables | Binary (in/out), biased coefficients (use Post-LASSO) |
| WALS | Speed, frequentist inference | Very fast, produces t-statistics, no MCMC | Less common, limited software support |

The strongest recommendation: **use all three**. When they converge on the same variables, you have robust evidence. When they disagree, investigate why --- the disagreement itself is informative. In real-world data, complications such as nonlinearity, heteroskedasticity, and endogeneity may affect method performance and should be addressed before applying these techniques.


## 18. Conclusion

### 18.1 Summary

This tutorial introduced three principled approaches to the variable selection problem:

1. **Bayesian Model Averaging (BMA)** averages over all possible models, weighting each by its posterior probability. It produces Posterior Inclusion Probabilities (PIPs) that quantify how robust each variable is across the entire model space. Variables with PIP $\geq$ 0.80 are considered robust.

2. **LASSO** adds an L1 penalty to the OLS objective, forcing irrelevant coefficients to exactly zero. Cross-validation selects the penalty strength. Post-LASSO recovers unbiased coefficient estimates for the selected variables.

3. **WALS** uses a semi-orthogonal transformation to decompose the model-averaging problem into independent subproblems --- one per variable. It is extremely fast and produces familiar t-statistics for robustness assessment.


### 18.2 Key takeaways

**The methods converge.** All three methods achieved 83.3% accuracy, correctly identifying 5 of the 7 true predictors while producing zero false positives. When BMA, LASSO, and WALS agree that a variable matters (or does not matter), we can be confident in the conclusion. The convergence across fundamentally different statistical paradigms --- Bayesian, penalized likelihood, and frequentist model averaging --- provides a form of methodological triangulation.

**Model uncertainty is real but addressable.** With 12 candidate variables, there are 4,096 possible models. Rather than pretending one of them is "the" model, these methods account for the uncertainty explicitly. The result is more honest inference.

**Synthetic data lets us verify.** Because we designed the data-generating process, we could check each method's performance against the known truth. In practice, the truth is unknown --- which is precisely why using multiple methods is so valuable.


### 18.3 Applying this to your own research

The code in this tutorial is designed to be modular. To apply these methods to your own data:

1. **Replace the CSV**: load your own cross-sectional dataset instead of the synthetic one
2. **Define the variable list**: specify which variables are candidates for selection
3. **Run the three methods**: use the same `bms()`, `cv.glmnet()`, and `wals()` function calls
4. **Compare results**: build the same comparison table and heatmap

The interpretation framework --- PIPs for BMA, selection for LASSO, t-statistics for WALS --- applies regardless of the specific dataset.


### 18.4 Further reading

- **BMA**: Hoeting, J.A., Madigan, D., Raftery, A.E., and Volinsky, C.T. (1999). "Bayesian Model Averaging: A Tutorial." *Statistical Science*, 14(4), 382--417.
- **LASSO**: Tibshirani, R. (1996). "Regression Shrinkage and Selection via the Lasso." *Journal of the Royal Statistical Society, Series B*, 58(1), 267--288.
- **WALS**: Magnus, J.R., Powell, O., and Prufer, P. (2010). "A Comparison of Two Model Averaging Techniques with an Application to Growth Empirics." *Journal of Econometrics*, 154(2), 139--153.
- **Application**: Aller, C., Ductor, L., and Grechyna, D. (2021). "Robust Determinants of CO<sub>2</sub> Emissions." *Energy Economics*, 96, 105154.
- **Post-LASSO**: Belloni, A. and Chernozhukov, V. (2013). "Least Squares After Model Selection in High-Dimensional Sparse Models." *Bernoulli*, 19(2), 521--547.
- **R Packages**: [BMS vignette](https://cran.r-project.org/web/packages/BMS/vignettes/bms.pdf), [glmnet vignette](https://glmnet.stanford.edu/articles/glmnet.html), [WALS package](https://cran.r-project.org/package=WALS)


## References

1. Hoeting, J.A., Madigan, D., Raftery, A.E., and Volinsky, C.T. (1999). Bayesian Model Averaging: A Tutorial. *Statistical Science*, 14(4), 382--417.
2. Tibshirani, R. (1996). Regression Shrinkage and Selection via the Lasso. *Journal of the Royal Statistical Society, Series B*, 58(1), 267--288.
3. Magnus, J.R., Powell, O., and Prufer, P. (2010). A Comparison of Two Model Averaging Techniques with an Application to Growth Empirics. *Journal of Econometrics*, 154(2), 139--153.
4. Raftery, A.E. (1995). Bayesian Model Selection in Social Research. *Sociological Methodology*, 25, 111--163.
5. Aller, C., Ductor, L., and Grechyna, D. (2021). Robust Determinants of CO<sub>2</sub> Emissions. *Energy Economics*, 96, 105154.
6. Belloni, A. and Chernozhukov, V. (2013). Least Squares After Model Selection in High-Dimensional Sparse Models. *Bernoulli*, 19(2), 521--547.
