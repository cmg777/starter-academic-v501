---
authors:
  - admin
categories:
  - Stata
  - Instrumental Variables (IV)
  - Development Economics
date: "2026-05-08T00:00:00Z"
draft: false
featured: false
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
  name: "Web app"
  url: web_app/index.html
- icon: file-code
  icon_pack: fas
  name: "Stata do-file"
  url: analysis.do
- icon: file-alt
  icon_pack: fas
  name: "Stata log"
  url: analysis.log
- icon: markdown
  icon_pack: fab
  name: "MD version"
  url: https://raw.githubusercontent.com/cmg777/starter-academic-v501/master/content/post/stata_iv/index.md
slides:
summary: "Replicate Acemoglu, Johnson and Robinson (2001) in Stata: instrument modern institutions with settler mortality across 64 ex-colonies and learn how IV recovers a causal effect that OLS understates by 80 percent."
tags:
  - stata
  - causal
  - causal inference
  - instrumental variables
  - 2sls
  - development
title: "Do Institutions Cause Prosperity? An IV Tutorial in Stata"
url_code: ""
url_pdf: ""
url_slides: ""
url_video: ""
toc: true
diagram: true
---

## Abstract

The strong cross-country correlation between property-rights institutions and prosperity cannot by itself reveal causation, because reverse causality, omitted variables such as geography or culture, and measurement error all confound the simple relationship. This tutorial sets out to estimate whether better institutions causally raise income by replicating the landmark study of Acemoglu, Johnson and Robinson (2001) in Stata, using European settler mortality during colonization as an instrumental variable for modern institutional quality. The analysis draws on the AJR base sample of 64 ex-colonies (with summary statistics also reported for the ~162-country world), where log GDP per capita spans a 60-fold range from roughly \\$450 to \\$27,400 and log settler mortality varies by nearly six log points. Using the `ivreg2` package, it estimates two-stage least squares, diagnoses weak instruments with the Kleibergen-Paap rk Wald F-statistic and Stock-Yogo critical values, runs a Durbin-Wu-Hausman endogeneity test, and layers on five families of robustness checks plus Hansen J overidentification tests. The first stage shows settler mortality lowers institutional quality by 0.607 points (F = 16.32), and the headline 2SLS coefficient on institutions is 0.944 (robust SE 0.176) — 81% larger than the OLS slope of 0.522 — with the endogeneity test rejecting OLS consistency ($\chi^2 = 9.09$, $p = 0.003$). Robustness specifications keep the effect in the 0.7–1.0 range, falling to 0.55–0.69 only when modern health channels are controlled. The results imply that measurement error dominates OLS bias and that institutional reform is roughly twice as valuable as naive regressions suggest, though the estimate is a Local Average Treatment Effect that rests on an untestable exclusion restriction.

## 1. Overview

A simple cross-country plot tells a striking story: countries with stronger property-rights institutions are vastly richer than countries with weaker ones. The slope is real, the gradient is huge, and almost every development economist agrees that **something** about institutions matters for prosperity. But that simple plot cannot tell us *which way the arrow points*. Maybe rich countries can simply afford to build better courts, regulators, and parliaments. Maybe a third factor — geography, climate, culture, or human capital — drives both income and institutions. The slope might describe correlation; it cannot prove causation.

Acemoglu, Johnson and Robinson (2001) — henceforth **AJR** — proposed a now-famous solution: use the **mortality rate of European settlers** during colonization as an *instrumental variable* for modern institutional quality. Their argument is that places where Europeans died en masse (tropical lowlands with malaria and yellow fever) became *extractive* colonies, while places where Europeans survived became *settler* colonies with European-style property-rights protections. Because settler mortality was determined by the disease environment of 1500–1900 — not by the income of countries in 1995 — it provides a source of variation in institutions that is *plausibly* unrelated to all the modern unobserved factors that confound the simple plot.

This tutorial replicates AJR's headline result on a sample of 64 ex-colonies using Stata's `ivreg2` package. We start with the naive OLS slope of 0.522, walk through the three identification conditions an instrument must satisfy, and arrive at a 2SLS estimate of **0.944** — about 81% larger. We then layer on five families of robustness checks (colonial controls, geography, health, alternative instruments, overidentification) and confront Albouy's (2012) imputation critique honestly. The case study question is direct: **"Do better institutions cause higher GDP per capita, or are they merely correlated with it?"**

### The IV identification strategy at a glance

Before we estimate anything, here is the picture of the strategy. The dashed red arrow is the assumption we cannot test directly — it is the heart of every IV paper.

```mermaid
flowchart LR
    Z["Settler mortality<br/>(logem4)"]
    X["Modern institutions<br/>(avexpr)"]
    Y["Log GDP per capita<br/>(logpgp95)"]
    U["Unobserved confounders<br/>(geography? culture?<br/>human capital?)"]

    Z -->|"first stage<br/>relevance ✓"| X
    X -->|"causal effect<br/>(what we want)"| Y
    U -->|"bias OLS"| X
    U -->|"bias OLS"| Y
    Z -.->|"exclusion restriction:<br/>no direct arrow"| Y

    style Z fill:#6a9bcc,stroke:#141413,color:#fff
    style X fill:#d97757,stroke:#141413,color:#fff
    style Y fill:#00d4c8,stroke:#141413,color:#141413
    style U fill:#1a3a8a,stroke:#141413,color:#fff,stroke-dasharray: 5 5
```

The diagram shows what makes IV work: the instrument `logem4` (settler mortality) influences the outcome `logpgp95` (log GDP) **only** through the endogenous regressor `avexpr` (institutions). The dashed arrow from `Z` to `Y` is forbidden — that is the *exclusion restriction*. Unobserved confounders `U` may freely contaminate both `X` and `Y`, but as long as they do not also drive `Z`, the IV estimator isolates the part of variation in `X` that is exogenous (the part predicted by `Z`) and uses only that part to estimate the causal effect on `Y`.

### Learning objectives

- **Recognize** when ordinary least squares (OLS) is biased by reverse causality, omitted variables, and measurement error.
- **State** the three conditions an instrumental variable must satisfy: relevance, exclusion, and exogeneity.
- **Estimate** the AJR (2001) 2SLS coefficient on institutions using `ivreg2` and the `maketable4.dta` dataset.
- **Diagnose** weak instruments using the Kleibergen-Paap rk Wald F-statistic and the Stock-Yogo critical values.
- **Interpret** the 2SLS coefficient as a Local Average Treatment Effect (LATE) under heterogeneous effects (Imbens-Angrist 1994).
- **Test** the exclusion restriction with the Hansen J overidentification test, and recognize what it cannot tell you.

### Key concepts at a glance

The post leans on a small vocabulary repeatedly. The rest of the tutorial assumes you can move between these terms quickly. Each concept below has three parts. The **definition** is always visible. The **example** and **analogy** sit behind clickable cards: open them when you need them, leave them collapsed for a quick scan. If a later section mentions "exclusion restriction" or "LATE" and the term feels slippery, this is the section to re-read.

**1. Endogeneity.**
A regressor is *endogenous* when it is correlated with the error term. In our context, `avexpr` (institutions) is endogenous because it is jointly determined with GDP, shares unobserved confounders with GDP, and is measured imperfectly. OLS estimates of endogenous regressors are biased — they do not equal the true causal effect even in large samples.

<div class="concept-pair">
<details class="concept-card concept-example">
<summary>Example</summary>

The Durbin-Wu-Hausman test in Table 4 Col 1 returns $\chi^2(1) = 9.085$ with $p = 0.0026$. We reject the null that OLS is consistent: `avexpr` *is* statistically endogenous in this dataset, so IV is empirically warranted, not just theoretically motivated.

</details>

<details class="concept-card concept-analogy">
<summary>Analogy</summary>

A bathroom scale that you stand on while holding a heavy weight. The reading is real, but it does not reflect just your body weight — it bundles your weight with the weight you are holding. OLS bundles the causal effect with confounding. We need a different tool to separate them.

</details>
</div>

**2. Instrumental variable** (instrument, $Z$).
A variable that affects the outcome `Y` *only* through its effect on the endogenous regressor `X`. Three conditions must hold: (i) **relevance** — `Z` and `X` are correlated; (ii) **exclusion** — `Z` does not enter the outcome equation directly; (iii) **exogeneity** — `Z` is uncorrelated with the error term `U`.

<div class="concept-pair">
<details class="concept-card concept-example">
<summary>Example</summary>

`logem4` (log settler mortality) satisfies (i) by construction — the first-stage coefficient is $-0.607$ with $F = 16.32$. (ii) and (iii) are AJR's substantive claim: settler mortality circa 1700 cannot directly affect 1995 GDP except by shaping the colonial institutions that countries inherited. (ii) and (iii) are **untestable in general** but can be partially examined via overidentification (Hansen J).

</details>

<details class="concept-card concept-analogy">
<summary>Analogy</summary>

A coin flip that decides which patient gets the drug. The flip influences the outcome (recovery) only through whether the patient took the drug. The flip itself does not heal anyone. That is what an instrument is supposed to be: a clean external nudge.

</details>
</div>

**3. Two-Stage Least Squares (2SLS).**
The standard IV estimator. Stage 1: regress the endogenous `X` on the instrument `Z` (and any controls). Stage 2: regress `Y` on the *predicted* `X̂` from stage 1. The 2SLS coefficient on `X̂` is the IV estimate. Stata's `ivreg2` does both stages internally; you only see the second-stage output.

<div class="concept-pair">
<details class="concept-card concept-example">
<summary>Example</summary>

Stage 1: `avexpr = 9.341 - 0.607 × logem4`. Stage 2: `logpgp95 = 1.910 + 0.944 × avexpr_hat`. The 0.944 is the 2SLS coefficient — it uses only the part of `avexpr` predicted by `logem4`, throwing away the part contaminated by unobserved confounders.

</details>

<details class="concept-card concept-analogy">
<summary>Analogy</summary>

Filtering muddy water through a sieve. The sieve (stage 1) catches the dirt (unobserved confounding). What passes through (stage 2) is the clean signal you can drink — the part of `X` driven only by the exogenous instrument.

</details>
</div>

**4. Weak instrument.**
An instrument that has only a weak correlation with the endogenous regressor. Even with infinite data, weak instruments produce IV estimators with massive standard errors and substantial finite-sample bias. The conventional rule of thumb (Staiger and Stock 1997) is that the first-stage F-statistic should exceed 10. Stock and Yogo (2005) give more refined critical values.

<div class="concept-pair">
<details class="concept-card concept-example">
<summary>Example</summary>

In our main spec, the Kleibergen-Paap rk Wald F = 16.32, just above the F > 10 rule of thumb but only marginally above the Stock-Yogo 10% maximal-IV-size threshold of 16.38. Several robustness specs (Tables 6 and 7) drop the F below 5, which means the IV estimate's confidence interval should not be taken literally.

</details>

<details class="concept-card concept-analogy">
<summary>Analogy</summary>

A radio antenna pointing in roughly the right direction. If the signal is strong enough you hear the music clearly. If the signal is weak (low F) you hear mostly static. The static is the bias.

</details>
</div>

**5. LATE vs ATE.**
Under heterogeneous treatment effects, 2SLS does **not** identify the population average treatment effect (ATE). Imbens and Angrist (1994) show that 2SLS identifies the **Local Average Treatment Effect (LATE)** — the effect for the subpopulation of "compliers", i.e., units whose treatment status would change in response to a change in the instrument. Under constant effects, LATE = ATE.

<div class="concept-pair">
<details class="concept-card concept-example">
<summary>Example</summary>

Our 0.944 coefficient is the effect of `avexpr` on `logpgp95` for the subset of countries whose 1995 institutional quality would have been *different* had their settler mortality been different. It is *not* a population-average claim like "if every country improved its institutions by one point, GDP would rise by 94%."

</details>

<details class="concept-card concept-analogy">
<summary>Analogy</summary>

A drug trial where eligibility depends on a coin flip. The trial estimates the effect *for people who comply with the coin flip*. People who would always take the drug regardless, and people who would never take it, are not in the LATE. The LATE is a real effect on real people — just not on everyone.

</details>
</div>

**6. Hansen J overidentification test.**
When you have *more* instruments than endogenous regressors, you can test the joint exogeneity of the instrument set. The Hansen J test compares the moment conditions across instruments: if they all agree on the same causal effect, the test does not reject. Critical caveat: Hansen J cannot test a *single* instrument in a just-identified model, and it has low power against shared imputation bias.

<div class="concept-pair">
<details class="concept-card concept-example">
<summary>Example</summary>

In Table 8 Panel C we pair each alternative instrument with `logem4` and run efficient GMM. Hansen J p-values range from 0.21 to 0.80 across five instrument pairs — uniformly failing to reject. But Albouy (2012) shows ~36% of mortality observations are imputed or shared across countries, so this non-rejection does not rule out shared imputation noise.

</details>

<details class="concept-card concept-analogy">
<summary>Analogy</summary>

Two witnesses giving the same alibi. Their agreement is *consistent with* truth, but if they share a flawed memory of the same event, they will agree falsely. Hansen J cannot tell consistent witnesses from coordinated ones.

</details>
</div>

**7. First stage and reduced form.**
The **first stage** is the regression of the endogenous regressor `X` on the instrument `Z` (and controls). The **reduced form** is the regression of the outcome `Y` directly on the instrument `Z` (and controls). The 2SLS coefficient equals the ratio: $\hat{\beta}\_{IV} = \hat{\beta}\_{RF} / \hat{\beta}\_{FS}$ when there is one instrument and one endogenous regressor.

<div class="concept-pair">
<details class="concept-card concept-example">
<summary>Example</summary>

First stage: $\hat{\beta}\_{FS} = -0.607$ (logem4 → avexpr). Reduced form: $\hat{\beta}\_{RF} = -0.573$ (logem4 → logpgp95, computed in §6 below). Ratio: $-0.573 / -0.607 = 0.944$ — exactly the 2SLS coefficient. The whole IV machinery boils down to this one division.

</details>

<details class="concept-card concept-analogy">
<summary>Analogy</summary>

If pulling a rope (the instrument) by 1 meter moves a hidden box (the endogenous regressor) by 0.6 meters, and that pulling also lifts a flag (the outcome) by 0.57 meters, then moving the box by 1 meter must lift the flag by 0.57/0.6 = 0.94 meters. IV is just this proportion calculation.

</details>
</div>

---

## 2. Setup and dependencies

The script depends on four community-contributed Stata packages from the SSC archive: `ivreg2` (the IV workhorse), `ranktest` (a dependency of `ivreg2`), `estout` (for table assembly via `eststo` and `esttab`), and `coefplot` (for the comparison plot at the end). The `capture ssc install` pattern is idempotent: it installs each package on the first run and does nothing on subsequent runs. We also define the dark-theme color palette as global macros — Stata's `color()` graph option takes RGB triplets, not hex codes, so we pre-convert the site palette.

```stata
clear all
set more off
set seed 42

capture log close
log using "analysis.log", text replace

// SSC dependencies
capture ssc install ivreg2
capture ssc install ranktest
capture ssc install estout
capture ssc install coefplot

// Globals: outcome, treatment, instrument
global Y   logpgp95
global X   avexpr
global Z   logem4

// Data-loading mode: 1 = GitHub raw URL (replicable), 0 = local folder
global USE_GITHUB 1
if $USE_GITHUB {
    global DATA_URL "https://raw.githubusercontent.com/cmg777/starter-academic-v501/master/content/post/stata_iv"
}
else {
    global DATA_URL "."
}

// Dark-theme color palette (hex -> Stata "R G B" triplet)
global DARK_NAVY   "15 23 41"     // background
global STEEL_BLUE  "106 155 204"  // primary data points
global WARM_ORANGE "217 119 87"   // fit lines
global TEAL        "0 212 200"    // labels and highlights
global LIGHT_TEXT  "200 208 224"  // axis labels
global WHITE_TEXT  "232 236 242"  // titles
```

The three globals `Y`, `X`, and `Z` map directly onto the IV diagram above: `Y` is the outcome (log GDP), `X` is the endogenous regressor (institutional quality), and `Z` is the instrument (log settler mortality). Using globals keeps every regression below readable and consistent — every spec is `ivreg2 ${Y} ... (${X} = ${Z})`.

The `USE_GITHUB` toggle lets the same do-file run two ways: with `1` (the default) Stata pulls each `.dta` from this site's GitHub raw URL — so any reader can `do analysis.do` and replicate the full set of tables without cloning the repo or downloading the AJR archive. Flipping it to `0` loads from the current folder instead, which is faster for offline iteration. The eight `.dta` files (`maketable1.dta` … `maketable8.dta`) are mirrored at the post root so both modes work.

---

## 3. Data overview

AJR provide eight datasets — one per table in the original paper. Table 1's dataset (`maketable1.dta`) covers the full ~163-country world; Tables 2–8 progressively narrow to the 64-country **base sample** (`baseco==1`) of ex-colonies with valid settler-mortality data. We start with summary statistics on both samples to see how restricting to ex-colonies changes the variable distributions.

```stata
use "${DATA_URL}/maketable1.dta", clear

di "*** Whole world ***"
summarize logpgp95 loghjypl avexpr cons00a cons1 democ00a euro1900

di "*** AJR base sample (baseco==1) ***"
preserve
    keep if baseco==1
    summarize logpgp95 loghjypl avexpr cons00a cons1 democ00a euro1900 logem4
    estpost summarize logpgp95 loghjypl avexpr cons00a cons1 democ00a euro1900 logem4
    esttab using "tab1_summary.csv", csv replace ///
        cells("count(fmt(0)) mean(fmt(3)) sd(fmt(3)) min(fmt(3)) max(fmt(3))")
restore
```

```text
*** Whole world ***
    Variable |        Obs        Mean    Std. dev.       Min        Max
-------------+---------------------------------------------------------
    logpgp95 |        162    8.304196    1.070869   6.109248   10.28875
      avexpr |        129    6.988548    1.831779   1.636364         10
    euro1900 |        166    30.10241    41.86424          0        100

*** AJR base sample (baseco==1) ***
    Variable |        Obs        Mean    Std. dev.       Min        Max
-------------+---------------------------------------------------------
    logpgp95 |         64    8.062237    1.043359   6.109248   10.21574
      avexpr |         64    6.515625    1.468647        3.5         10
    euro1900 |         63    16.18095    25.53334          0         99
      logem4 |         64    4.657031    1.257984   2.145931   7.986165
```

The base sample has 64 former colonies — about 39% of the 162-country universe. Restricting to ex-colonies lowers the mean of `avexpr` from 6.99 to 6.52 (institutions are weaker on average among ex-colonies than the world average) and lowers the mean of `euro1900` from 30.1 to 16.2 (ex-colonies had fewer European settlers in 1900). The instrument `logem4` ranges from 2.15 (very low mortality, ~9 deaths per 1,000) to 7.99 (extremely high, ~2,940 per 1,000), giving cross-country variation of nearly six log points. Log GDP per capita varies from 6.11 (~\\$450, the poorest country) to 10.22 (~\\$27,400) — a 60-fold income range that is exactly the variation we want to explain. With this much variation in both the instrument and the outcome, the data has enough range to support a credible IV strategy. The next step is to ask: how *would* a naive OLS estimate look on this sample?

---

## 4. The naive OLS benchmark (Table 2)

Before we instrument anything, we should know what OLS thinks. If OLS already gave us the right answer, IV would be unnecessary. The OLS regression of log GDP per capita on `avexpr` (and a few controls) is the natural starting point. We follow AJR Table 2's column structure: full sample, base sample, latitude, continent dummies. All standard errors are robust (`vce(robust)`).

```stata
use "${DATA_URL}/maketable2.dta", clear

eststo m2_c1: regress logpgp95 avexpr, robust
eststo m2_c2: regress logpgp95 avexpr if baseco==1, robust
eststo m2_c3: regress logpgp95 avexpr lat_abst, robust
eststo m2_c4: regress logpgp95 avexpr lat_abst africa asia other_cont, robust

esttab m2_c1 m2_c2 m2_c3 m2_c4 using "tab2_ols.csv", csv replace ///
    b(3) se(3) star(* 0.10 ** 0.05 *** 0.01) stats(N r2)
```

```text
                   (1)         (2)         (3)         (4)
              Full        Base       +Latitude   +Continents
              N=111       N=64        N=111        N=111
avexpr        0.532***    0.522***    0.463***    0.390***
              (0.029)     (0.050)     (0.052)     (0.051)
lat_abst                              0.872*       0.333
                                      (0.499)     (0.442)
africa                                            -0.916***
                                                   (0.154)
R-squared     0.611       0.540       0.623       0.715
```

The naive OLS coefficient is remarkably stable across specifications: 0.532 in the full 111-country sample (Col 1), 0.522 in the 64-country base sample (Col 2), and falls only to 0.390 once continent dummies are added (Col 4). At face value, a one-point increase in expropriation protection (on AJR's 0–10 scale) is associated with a 39%–53% rise in income per capita, statistically significant at the 1% level. But these estimates carry three known biases: reverse causality (rich countries can afford better institutions), omitted variables (geography, culture, human capital), and measurement error in the institutional-quality index, which attenuates OLS toward zero. We need IV to find out how much of the 0.522 is bias and how much is the true causal effect.

---

## 5. The first stage and the reduced form (Table 3 and Figures 1–2)

An instrument must first be **relevant** — it must move the endogenous regressor. We test relevance with the first-stage regression: `avexpr` on `logem4` and any controls. Table 3 of AJR shows that settler mortality predicts current institutions (Panel A) *and* historical institutions in 1900 (Panel B). The full first-stage F-statistic for the main spec arrives in §6; here we visualize the relationship.

```stata
use "${DATA_URL}/maketable4.dta", clear
keep if baseco==1

// Run the first stage to extract numeric F-statistic
ivreg2 logpgp95 (avexpr=logem4), robust
di _newline "*** First-stage Kleibergen-Paap rk Wald F: " %6.2f e(widstat)
```

```text
First-stage regression of avexpr on logem4:
      logem4 |  -.6067782   .1501972    -4.04   0.000

*** First-stage Kleibergen-Paap rk Wald F: 16.32
*** Stock-Yogo 10% maximal IV size critical value:    16.38 (IID)
*** Under robust SEs, see Olea & Pflueger (2013) effective F.
```

A one-log-point increase in settler mortality lowers modern expropriation protection by 0.607 points, with a t-statistic of 4.04. The first-stage Kleibergen-Paap rk Wald F-statistic is **16.32**, just above the Staiger-Stock (1997) rule of thumb of F > 10 and almost exactly equal to the Stock-Yogo (2005) iid threshold of 16.38 for ≤10% maximal IV size distortion. Honest disclosure: 16.32 is *borderline*, not comfortable. Under heteroskedasticity-robust standard errors (which we are using), the more rigorous benchmark is the Olea-Pflueger (2013) effective F (`weakivtest` in SSC); we will fall back on the weak-IV-robust Anderson-Rubin Wald test in §6 to confirm significance even if one is uncomfortable with the conventional asymptotics.

The next two figures make the same point graphically. Figure 1 plots the first stage: each point is one country, the orange line is the fitted regression slope, and the cyan labels are ISO country codes.

```stata
twoway ///
    (scatter avexpr logem4, ///
        mcolor("${STEEL_BLUE}") ///
        mlabel(shortnam) mlabcolor("${TEAL}") mlabsize(vsmall)) ///
    (lfit avexpr logem4, lcolor("${WARM_ORANGE}") lwidth(medthick)), ///
    title("Figure 1. First stage: settler mortality predicts institutions", color("${WHITE_TEXT}")) ///
    xtitle("Log settler mortality (logem4)", color("${LIGHT_TEXT}")) ///
    ytitle("Avg. protection from expropriation (avexpr)", color("${LIGHT_TEXT}")) ///
    graphregion(color("${DARK_NAVY}")) plotregion(color("${DARK_NAVY}")) ///
    bgcolor("${DARK_NAVY}") legend(off)

graph export "stata_iv_first_stage.png", replace width(2400)
```

![First stage: settler mortality predicts institutions](stata_iv_first_stage.png)
*Figure 1. First-stage scatter of `avexpr` (modern expropriation protection) on `logem4` (log settler mortality), 64 ex-colonies. Slope = −0.607, F = 16.32, R² = 0.27.*

The negative slope is unmistakable. Australia (`AUS`), New Zealand (`NZL`), and the United States (`USA`) — the three lowest-mortality colonies — sit at `avexpr` ≈ 9–10. Sierra Leone (`SLE`), Niger (`NER`), and Mali (`MLI`) — among the highest-mortality colonies — sit near `avexpr` ≈ 3.5–5. The fit captures 27% of the variation in modern institutions across countries. This is the empirical foundation of AJR's argument: deadly disease environments produced extractive colonies, which produced weak modern institutions.

Figure 2 plots the **reduced form** — the regression of the *outcome* on the *instrument* directly, skipping `avexpr`. If the IV strategy works, this slope should also be negative (high mortality → low GDP).

```stata
twoway ///
    (scatter logpgp95 logem4, ///
        mcolor("${STEEL_BLUE}") ///
        mlabel(shortnam) mlabcolor("${TEAL}") mlabsize(vsmall)) ///
    (lfit logpgp95 logem4, lcolor("${WARM_ORANGE}") lwidth(medthick)), ///
    title("Figure 2. Reduced form: settler mortality predicts log GDP", color("${WHITE_TEXT}")) ///
    xtitle("Log settler mortality (logem4)", color("${LIGHT_TEXT}")) ///
    ytitle("Log GDP per capita, PPP, 1995 (logpgp95)", color("${LIGHT_TEXT}")) ///
    graphregion(color("${DARK_NAVY}")) plotregion(color("${DARK_NAVY}")) ///
    bgcolor("${DARK_NAVY}") legend(off)

graph export "stata_iv_reduced_form.png", replace width(2400)
```

![Reduced form: settler mortality predicts log GDP](stata_iv_reduced_form.png)
*Figure 2. Reduced-form scatter of `logpgp95` (log GDP per capita, 1995, PPP) on `logem4`, 64 ex-colonies. The slope (≈ −0.573) is the total effect of the instrument on the outcome.*

The reduced-form gradient is steep: across the 5.8-log-point span of `logem4`, the fitted line predicts a GDP gap of about 3.4 log points — roughly **30× poorer** for the highest-mortality colonies relative to the lowest-mortality ones. This is the *total* effect of the instrument on the outcome. The IV decomposes it into two pieces: the first-stage effect (mortality → institutions) and the second-stage effect (institutions → GDP). When we divide the reduced-form slope by the first-stage slope, the institutions-mediated channel pops out.

---

## 6. The main 2SLS estimate (Table 4)

This is the headline result. We instrument `avexpr` with `logem4`, all standard errors are heteroskedasticity-robust, and we add the Durbin-Wu-Hausman endogeneity test via `ivreg2`'s `endog()` option. Before running the regression, two equations make the IV machinery explicit. The structural model is:

$$Y\_i = \alpha + \beta X\_i + U\_i, \quad \text{where} \\, \\, \text{Cov}(X\_i, U\_i) \neq 0$$

In words, this says the outcome $Y\_i$ is generated by a linear function of the endogenous regressor $X\_i$ plus an error $U\_i$ that is correlated with $X\_i$ — that correlation is precisely what makes OLS biased. $Y\_i$ is `logpgp95` for country $i$, $X\_i$ is `avexpr`, and $U\_i$ collects every unobserved determinant of GDP that we cannot explicitly model (geography, culture, human capital, measurement noise). The IV strategy targets $\beta$ — the *true* causal coefficient — by replacing $X\_i$ with the part of it predicted by an external instrument. The 2SLS estimator can then be written as a single ratio:

$$\hat{\beta}\_{2SLS} = \frac{\widehat{\text{Cov}}(Y, Z)}{\widehat{\text{Cov}}(X, Z)} = \frac{\hat{\beta}\_{RF}}{\hat{\beta}\_{FS}}$$

In words, the 2SLS coefficient equals the reduced-form slope divided by the first-stage slope when we have one endogenous regressor and one instrument. $Z\_i$ is `logem4`. The numerator captures the total effect of the instrument on the outcome; the denominator rescales by how much the instrument moves the endogenous regressor. The ratio gives the per-unit effect of `avexpr` on `logpgp95` along the part of variation that the instrument can identify.

```stata
ivreg2 logpgp95 (avexpr=logem4), robust first endog(avexpr)
```

```text
2SLS estimate, base sample (N=64):
      avexpr |   .9442794   .1760958     5.36   0.000     .5991379    1.289421
       _cons |   1.909667   1.173955     1.63   0.104    -.3912422    4.210575

Underidentification (Kleibergen-Paap rk LM):  9.492   p = 0.0021
Weak ID (Cragg-Donald F):                    22.95
Weak ID (Kleibergen-Paap rk Wald F):         16.32
Stock-Yogo 10% maximal IV size threshold:    16.38   (iid)
Anderson-Rubin Wald test (weak-IV-robust):   F(1,62) = 61.66   p < 0.0001

Endogeneity test (Durbin-Wu-Hausman):        chi2(1) = 9.085   p = 0.0026
```

The 2SLS coefficient on `avexpr` is **0.944** with a robust standard error of 0.176 (95% CI [0.60, 1.29]). It is **81% larger** than the OLS estimate of 0.522 and statistically distinguishable from zero at the 1% level (z = 5.36). The Kleibergen-Paap rk Wald F = 16.32 sits just below the Cragg-Donald F = 22.95 (as expected under heteroskedasticity) and at the Stock-Yogo iid threshold; the weak-IV-robust Anderson-Rubin Wald test (F = 61.66, p < 0.0001) gives extra reassurance. The Durbin-Wu-Hausman endogeneity test rejects the null that OLS is consistent ($\chi^2 = 9.09$, $p = 0.003$): the IV-OLS gap is large enough to constitute statistical evidence that OLS is biased — IV is empirically warranted, not just theoretically motivated.

In domain terms: moving Nigeria (`avexpr` = 5.55) up to Chile's level (`avexpr` = 7.82) would, all else equal, raise its log GDP per capita by 0.944 × 2.27 ≈ 2.15 points — roughly an **8.5-fold increase** in income. That is enormous. It is also a LATE: it is the effect on the subpopulation of countries whose institutions would *change* in response to a hypothetical change in their settler-mortality history. It is not a population-average claim about every country.

The IV > OLS gap (0.944 vs 0.522) is itself informative. Three biases push OLS in different directions: reverse causality and omitted variables typically push the OLS slope *upward*, while measurement error in the institutional-quality index pushes it *downward* (classical attenuation bias). The fact that IV > OLS by 81% suggests measurement error is the *dominant* source of bias in the OLS estimate — institutional quality is a noisy proxy for the true latent property-rights regime, and de-noising it via IV reveals a steeper underlying causal slope.

---

## 7. Robustness 1: colonial, legal, and religious controls (Table 5)

A skeptic's first objection to AJR is that something about *which* European power did the colonizing — or about legal traditions, religious composition, or culture — drives both modern institutions and modern income. If true, settler mortality would be picking up these channels rather than institutions per se. Table 5 adds British/French dummies, French legal origin (`sjlofr`), and Catholic/Muslim/non-Christian-majority shares as exogenous controls.

```stata
use "${DATA_URL}/maketable5.dta", clear
keep if baseco==1

eststo m5_c1: ivreg2 logpgp95 f_brit f_french (avexpr=logem4), robust
eststo m5_c5: ivreg2 logpgp95 sjlofr (avexpr=logem4), robust
eststo m5_c7: ivreg2 logpgp95 catho80 muslim80 no_cpm80 (avexpr=logem4), robust

esttab m5_c1 m5_c5 m5_c7 using "tab5_iv_controls.csv", csv replace ///
    b(3) se(3) star(* 0.10 ** 0.05 *** 0.01) ///
    stats(N r2 firstF, fmt(0 3 2))
```

```text
                       (1)         (5)         (7)
                  +brit/french  +legal     +religion
avexpr               1.078***     1.080***    0.917***
                    (0.240)      (0.202)     (0.156)
First-stage F (KP)    11.73       15.94       16.76
N                     64          64          64
```

Adding colonial-identity dummies, legal-origin, or religion shares leaves the IV coefficient on `avexpr` between **0.917 and 1.339** across the nine columns — never below the 0.944 baseline and frequently larger. Standard errors widen (0.156 to 0.535), and first-stage F-statistics range from 2.90 (Col 4, with Neo-Europes excluded + latitude) to 16.76 (Col 7). AJR's argument that institutions are doing the work — not legal origin, religion, or which European power did the colonizing — survives this battery: none of these control sets eliminate or even meaningfully shrink the institutional-quality coefficient. The Col 4 caveat is real, but it is a confidence-interval survival rather than a tight-point-estimate one.

---

## 8. Robustness 2: geography and climate (Table 6)

Geography is the most plausible threat to the exclusion restriction. Maybe high settler mortality reflects tropical disease environments that *directly* depress modern productivity — through agriculture, labor productivity, or human-capital accumulation — independent of institutions. If true, settler mortality would have a direct arrow into `logpgp95` and the exclusion restriction would fail.

```stata
use "${DATA_URL}/maketable6.dta", clear
keep if baseco==1

eststo m6_c1: ivreg2 logpgp95 temp1-temp5 humid1-humid4 (avexpr=logem4), robust
eststo m6_c5: ivreg2 logpgp95 steplow deslow stepmid desmid drystep drywint goldm iron silv zinc oilres landlock (avexpr=logem4), robust
eststo m6_c7: ivreg2 logpgp95 avelf (avexpr=logem4), robust

esttab m6_c1 m6_c5 m6_c7 using "tab6_iv_geo.csv", csv replace ///
    b(3) se(3) star(* 0.10 ** 0.05 *** 0.01) stats(N r2 firstF)
```

```text
                       (1)         (5)         (7)
                  +climate    +resources   +ethnic-frac
avexpr               0.837***     1.259**    0.738***
                    (0.165)      (0.543)    (0.140)
First-stage F (KP)    17.80        2.83       14.99
N                     64          64          64
```

Across nine geographic specifications — temperature dummies, humidity, latitude, percent in steppe/desert/dry climate, mineral resources, landlock status, ethnolinguistic fractionalization (`avelf`) — the IV coefficient on `avexpr` ranges from **0.713 to 1.358**, bracketing the 0.944 baseline. The catch is that first-stage F drops below 10 in five of nine columns (lowest 1.74 in Col 6, 2.83 in Col 5), because the geography variables are themselves correlated with `logem4`. The qualitative conclusion holds; the quantitative confidence intervals widen.

---

## 9. Robustness 3: the trickiest case — health channels (Table 7)

The tightest empirical challenge to AJR's exclusion restriction is health. If the disease environment that killed European settlers in 1700 *still* depresses productivity in 1995 (through malaria, infant mortality, or low life expectancy), then `logem4` enters `logpgp95` through a direct health channel, not just through institutions. Table 7 includes modern health variables as controls. Two readings are possible:

- **AJR's preferred reading:** modern health is a "bad control" — itself an outcome of institutional quality, so adjusting for it shrinks the institutional coefficient toward zero artifactually.
- **A critic's reading:** modern health is genuinely exogenous, and its inclusion exposes a violation of the exclusion restriction.

The data alone cannot adjudicate.

```stata
use "${DATA_URL}/maketable7.dta", clear
keep if baseco==1

eststo m7_c1: ivreg2 logpgp95 malfal94 (avexpr=logem4), robust
eststo m7_c3: ivreg2 logpgp95 leb95    (avexpr=logem4), robust
eststo m7_c5: ivreg2 logpgp95 imr95    (avexpr=logem4), robust

// Cols 7-9: 4 instruments, 2 endogenous regressors -> Hansen J meaningful
eststo m7_c7: ivreg2 logpgp95 (avexpr malfal94 = logem4 latabs lt100km meantemp), gmm2s robust
estadd scalar hansenJ = e(j)
estadd scalar hansenP = e(jp)

esttab m7_c1 m7_c3 m7_c5 m7_c7 using "tab7_iv_health.csv", csv replace ///
    b(3) se(3) star(* 0.10 ** 0.05 *** 0.01) ///
    stats(N r2 firstF hansenJ hansenP)
```

```text
                       (1)          (3)         (5)         (7) overid
                  +malaria      +life exp.   +infant mort. (4 instr)
avexpr               0.687***     0.629**     0.551**     0.611***
                    (0.265)      (0.295)     (0.260)     (0.235)
First-stage F (KP)    3.79         4.02        4.86        1.17
Hansen J                                                    1.56  (p=0.459)
N                     62           60          60          60
```

When malaria prevalence (`malfal94`), life expectancy (`leb95`), or infant mortality (`imr95`) are added as exogenous controls, the IV coefficient on `avexpr` falls to **0.55–0.69** — the only place in the entire script where the IV approaches the OLS benchmark of 0.522. Cols 7–9 use four instruments for two endogenous regressors via efficient GMM (`gmm2s`), making the Hansen J test meaningful: J p-values of 0.46–0.76 fail to reject the joint exogeneity of the instrument set, providing modest support for AJR's reading. But the first-stage F-statistics in these overidentified specs collapse to **1.17–4.86** — well below any weak-IV threshold — so the Hansen J non-rejection has *low power* against shared imputation bias and limited confidence. Health channels are the place where a fair-minded reader should retain doubt.

---

## 10. Overidentification and alternative instruments (Table 8)

If `logem4` were the only instrument we had, we could not test the exclusion restriction directly. AJR's solution is to use *alternative* historical-institution variables — 1900 constraints on the executive (`cons00a`), 1900 democracy (`democ00a`), 1st-year-of-independence constraints (`cons1`), independence year (`indtime`), and 1st-year-of-independence democracy (`democ1`) — and ask: do these all agree on the same causal effect? If yes, the joint exogeneity assumption is more credible.

We split this into three parts. **Panel C** pairs each alternative instrument with `logem4` and runs efficient GMM, producing a Hansen J test. **Panel D** drops the exclusion restriction on `logem4` itself by including it as an exogenous control while alternative instruments do the identification — the harshest sensitivity check.

```stata
use "${DATA_URL}/maketable8.dta", clear
keep if baseco==1

// Panel C: alt instrument + logem4 -> Hansen J meaningful
eststo m8c_c1: ivreg2 logpgp95 (avexpr = euro1900 logem4), gmm2s robust
eststo m8c_c3: ivreg2 logpgp95 (avexpr = cons00a logem4), gmm2s robust
eststo m8c_c5: ivreg2 logpgp95 (avexpr = democ00a logem4), gmm2s robust

// Panel D: logem4 as exogenous control, alt instrument identifies
eststo m8d_c1: ivreg2 logpgp95 logem4 (avexpr = euro1900),  robust
eststo m8d_c3: ivreg2 logpgp95 logem4 (avexpr = cons00a),   robust
eststo m8d_c5: ivreg2 logpgp95 logem4 (avexpr = democ00a),  robust
```

```text
Panel C (overid): Hansen J p-values 0.21 to 0.80 across 5 alt instruments
                  -> uniformly fails to reject joint exogeneity

Panel D (logem4 as control):
  euro1900    instrument:  avexpr = 0.81-0.88   logem4 control = -0.05 to -0.07
  cons00a     instrument:  avexpr = 0.42-0.45   logem4 control = -0.25 to -0.26
  democ00a    instrument:  avexpr = 0.48-0.52   logem4 control = -0.21 to -0.22
  cons1       instrument:  avexpr = 0.49-0.49   logem4 control = -0.14 to -0.14
  democ1      instrument:  avexpr = 0.40-0.41   logem4 control = -0.19 to -0.19

In all 10 columns the logem4 control coefficient is statistically zero (p > 0.1).
```

Panel C delivers Hansen J p-values from **0.21 to 0.80** across five alternative instrument pairs — uniformly failing to reject joint exogeneity. This is the test AJR pass cleanly. Panel D is more demanding: when `logem4` enters as a control, the IV coefficient on `avexpr` splits by instrument family. Cols 21–22 (using `euro1900`) keep `avexpr` at **0.81–0.88** — likely because `euro1900` is itself a continuous mortality-correlated proxy rather than a clean institutional alternative. Cols 23–30 (using historical-institution alternatives `cons00a`, `democ00a`, `cons1`, `indtime`, `democ1`) fall to **0.40–0.52**. The `logem4` control is itself never statistically distinguishable from zero across any of the 10 columns. This pattern is consistent with AJR's claim — settler mortality affects modern income only through institutions — but the 8-of-10 drop in coefficient magnitude when `logem4` is moved to the right-hand side suggests some of the baseline IV's strength came from `logem4` proxying for unobserved correlates that the historical-institution alternatives do not capture.

A critical caveat is owed: Albouy (2012) shows that roughly 36% of AJR's mortality observations are imputed or shared across countries (e.g., one African country's mortality figure used for several neighbors). Hansen J non-rejection assumes *independent* moment conditions. If the alternative instruments share imputation noise with `logem4`, they would agree spuriously — Hansen J cannot detect coordinated witnesses.

---

## 11. The visual summary: OLS vs IV across specifications (Figure 3)

Figure 3 presents a `coefplot` of the `avexpr` coefficient across six representative specifications: OLS baseline (orange), four IV variants with `logem4` (steel blue), and IV with the `euro1900` alternative instrument (teal). The visual confirms what the tables show numerically.

```stata
coefplot ///
    (m4_ols_c1, label("OLS") mcolor("${WARM_ORANGE}")) ///
    (m4_iv_c1,  label("IV: settler mortality") mcolor("${STEEL_BLUE}")) ///
    (m5_iv_c1,  label("IV + colonial controls") mcolor("${STEEL_BLUE}")) ///
    (m6_iv_c1,  label("IV + geography controls") mcolor("${STEEL_BLUE}")) ///
    (m7_iv_c1,  label("IV + malaria control") mcolor("${STEEL_BLUE}")) ///
    (m8a_c1,    label("IV: alt instrument euro1900") mcolor("${TEAL}")), ///
    keep(avexpr) xline(0, lcolor("${LIGHT_TEXT}") lpattern(dash)) ///
    title("Effect of institutions on log GDP: OLS vs IV", color("${WHITE_TEXT}")) ///
    graphregion(color("${DARK_NAVY}")) plotregion(color("${DARK_NAVY}")) ///
    bgcolor("${DARK_NAVY}")

graph export "stata_iv_ols_vs_iv.png", replace width(3000)
```

![Effect of institutions on log GDP across specifications](stata_iv_ols_vs_iv.png)
*Figure 3. Coefficient on `avexpr` across six representative specifications, 95% CIs. OLS in orange, four IV variants with `logem4` in steel blue, IV with the alternative instrument `euro1900` in teal.*

The orange OLS estimate sits at 0.522 with a tight confidence interval. Every steel-blue IV variant — adding colonial controls, geography, or even the malaria control — sits at 0.69–0.94 with overlapping confidence intervals. The teal `euro1900` alternative instrument lands near 0.87. Color semantics are deliberate: orange = naive estimator, blue family = IV with `logem4`, teal = alternative instrument. The visual hierarchy mirrors the statistical hierarchy. No single specification stands above the rest as a "preferred estimate"; the message is that the institutional coefficient lives in the 0.7–1.0 range under any reasonable modeling choice — and is materially larger than the 0.5 OLS slope.

---

## 12. Discussion

**Do better institutions cause higher GDP per capita?** The data say yes — and the magnitude is substantial. The 2SLS estimate of 0.944 implies that the gap between the world's worst and best institutional environments accounts for a large share of the 60-fold income gap between the world's poorest and richest ex-colonies. Specifically, the gap from `avexpr` = 3.5 (worst) to `avexpr` = 10 (best) is 6.5 institutional points; multiplied by 0.944, that is 6.14 log points of GDP, or a 465-fold income gap predicted by institutions alone — an upper-bound *out of sample*, but a striking number.

The IV-OLS gap (0.944 vs 0.522) tells its own story. IV is **81% larger** than OLS. Three biases pull in opposite directions: reverse causality and omitted variables push OLS upward; classical measurement error in the institutional-quality index pulls OLS downward. The fact that IV > OLS implies measurement error dominates — institutional quality is a noisy proxy for the latent property-rights regime, and noise attenuates OLS. De-noising it via IV reveals a *steeper* causal slope, not a shallower one.

Two caveats are non-negotiable. First, the 0.944 is a **LATE** for compliers, not a population ATE. It applies to the subpopulation of countries whose institutional quality would have responded to a hypothetical change in their colonial-era settler mortality. For countries far from the historical colonization margin — established European democracies, never-colonized states — the 0.944 is silent. Second, Albouy (2012) flagged that a substantial share of AJR's mortality data are imputed or shared across countries. Hansen J overidentification non-rejection assumes independent measurement noise; shared imputation could pass the test undetected. The exclusion restriction is **untestable in principle**, only *partially* falsifiable in practice, and AJR's assumption that 1700-era mortality affects 1995 GDP only through institutions remains a *substantive* claim that empirical work can support but not prove.

For policymakers and practitioners, the practical implication is sharper than the academic debate. If institutional quality has a causal effect on GDP roughly twice as large as naive cross-country regressions suggest, then institutional reform is **roughly twice as valuable** as previously thought — and reforms that are merely correlated with growth in OLS samples may be substantially more powerful causal levers. Conversely, naive policy advice based on OLS slopes systematically *understates* the returns to building courts, regulators, and parliaments.

---

## 13. Summary, limitations, and next steps

**Method insight.** 2SLS recovers a causal effect that is 81% larger than OLS (0.944 vs 0.522) — consistent with classical attenuation from measurement error in the institutional-quality index dominating reverse-causality and omitted-variable biases. The Durbin-Wu-Hausman test ($\chi^2 = 9.09$, $p = 0.003$) confirms OLS is biased; the weak-IV-robust Anderson-Rubin Wald test ($F = 61.66$) confirms institutions matter even if one is uncomfortable with conventional 2SLS asymptotics on a borderline first-stage F.

**Data insight.** 64 ex-colonies span a 60-fold income range and a six-log-point mortality range. That much variation is enough to identify the IV cleanly when the instrument is strong, but not enough to identify it cleanly when controls absorb most of the first-stage signal. Robustness specs with first-stage F < 5 (Tab 6 Cols 5-6, Tab 7 Cols 7-9) live in weak-IV territory — read their confidence intervals, not their point estimates.

**Limitation.** The 0.944 is a LATE, not an ATE. It applies to the colonization-margin compliers, not the whole population of countries. It also depends on AJR's exclusion restriction — that 1700-era settler mortality affects 1995 GDP only through institutions — which is untestable in principle and only partially probed by Hansen J in practice. Albouy's (2012) imputation critique limits what J-test non-rejection can buy: roughly 36% of mortality observations are shared across countries, so the joint exogeneity test has low power against shared imputation noise.

**Next step.** Install the SSC `weakivtest` package and rerun the main spec to obtain the Olea-Pflueger (2013) effective F-statistic — the right benchmark under heteroskedasticity-robust inference. If the effective F materially exceeds the Stock-Yogo iid threshold of 16.38, the conventional 2SLS asymptotics are safer to lean on. If it does not, the Anderson-Rubin Wald test becomes the primary inference tool.

---

## 14. Exercises

1. **Reduced-form ratio check.** Compute the reduced-form coefficient by regressing `logpgp95` directly on `logem4` in the base sample. Verify that it equals approximately $-0.573$, and that dividing it by the first-stage coefficient $-0.607$ recovers the 2SLS estimate of 0.944. What does this exercise teach you about what 2SLS is doing under the hood?

2. **Just-identified vs overidentified.** Replicate Table 8 Panel C in just-identified form: run `ivreg2 logpgp95 (avexpr = euro1900), gmm2s robust` (one instrument only). Note that Hansen J is now zero — the model is exactly identified. What does this tell you about the J-test's logic? Why must we have *more* instruments than endogenous regressors to compute it?

3. **Stress-test the exclusion restriction.** Pick a candidate omitted variable that you think could violate the exclusion restriction (e.g., percentage of population at high altitude, or distance from the equator). Add it as an exogenous control to the main spec and report what happens to the 2SLS coefficient on `avexpr`. Is your candidate a "bad control" (downstream of institutions) or a genuine threat to exclusion (upstream of mortality)?

---

## 15. References

1. [Acemoglu, D., Johnson, S., and Robinson, J. A. (2001). "The Colonial Origins of Comparative Development: An Empirical Investigation." *American Economic Review*, 91(5), 1369–1401.](https://www.aeaweb.org/articles?id=10.1257/aer.91.5.1369)
2. [Albouy, D. Y. (2012). "The Colonial Origins of Comparative Development: An Investigation of the Settler Mortality Data." *American Economic Review*, 102(6), 3059–3076.](https://www.aeaweb.org/articles?id=10.1257/aer.102.6.3059)
3. [Imbens, G. W. and Angrist, J. D. (1994). "Identification and Estimation of Local Average Treatment Effects." *Econometrica*, 62(2), 467–475.](https://www.jstor.org/stable/2951620)
4. [Staiger, D. and Stock, J. H. (1997). "Instrumental Variables Regression with Weak Instruments." *Econometrica*, 65(3), 557–586.](https://www.jstor.org/stable/2171753)
5. [Stock, J. H. and Yogo, M. (2005). "Testing for Weak Instruments in Linear IV Regression." In *Identification and Inference for Econometric Models*, Cambridge University Press.](https://www.nber.org/papers/t0284)
6. [Olea, J. L. M. and Pflueger, C. (2013). "A Robust Test for Weak Instruments." *Journal of Business and Economic Statistics*, 31(3), 358–369.](https://www.tandfonline.com/doi/abs/10.1080/00401706.2013.806694)
7. [Baum, C. F., Schaffer, M. E., and Stillman, S. (2007). "Enhanced routines for instrumental variables/generalized method of moments estimation and testing." *Stata Journal*, 7(4), 465–506.](https://journals.sagepub.com/doi/10.1177/1536867X0800700402)
8. [`ivreg2` — Stata SSC archive.](http://fmwww.bc.edu/RePEc/bocode/i/ivreg2.html)
9. [`coefplot` (Jann) — Stata SSC archive.](http://repec.sowi.unibe.ch/stata/coefplot/)
10. [AJR (2001) replication package — `maketable1.dta` through `maketable8.dta` are mirrored at the post root and loaded by `analysis.do` from this site's GitHub raw URL for one-click replicability.](https://economics.mit.edu/people/faculty/daron-acemoglu/data-archive)
11. [Duke Mod·U "Causal Inference Bootcamp" — *Introduction to Regression Analysis*. YouTube video.](https://youtu.be/ROLeLaR-17U)
12. [Duke Mod·U "Causal Inference Bootcamp" — *Basic Elements of a Regression Table*. YouTube video.](https://youtu.be/vCkrWeJG5cs)
13. [Duke Mod·U "Causal Inference Bootcamp" — *The Relationship Between Economic Development and Property Rights*. YouTube video.](https://youtu.be/fDCgagw2CAI)
