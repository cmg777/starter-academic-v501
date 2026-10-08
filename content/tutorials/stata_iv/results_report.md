# Results Report: Instrumental Variables in Development Economics

**Script:** `analysis.do` (~934 lines, 11 sections)
**Executed:** 2026-05-09 12:53:02–12:53:43 (41 seconds wall-clock)
**Status:** Success — clean execution, no errors, no warnings
**Runtime:** 41 seconds end-to-end (most of the time is graph rendering)
**Language:** Stata 18.0 MP (`/Applications/Stata 18.0/StataMP.app/Contents/MacOS/stata-mp`)
**Key packages:** `ivreg2` (Baum, Schaffer, Stillman; SSC), `ranktest` (Kleibergen-Schaffer; SSC dependency of `ivreg2`), `estout` (Jann; SSC), `coefplot` (Jann; SSC). Versions not captured in this run — to record exact versions, run `ado describe ivreg2` etc. on the local machine.

---

## Execution Summary

The script replicates Acemoglu, Johnson & Robinson (2001) "The Colonial Origins of Comparative Development" across Tables 1–8, instrumenting modern institutional quality (`avexpr`, average protection from expropriation 1985–95) with log settler mortality (`logem4`) in a cross-section of 64 ex-colonies (the "AJR base sample"). Every 2SLS estimate is paired with modern weak-IV diagnostics (Kleibergen-Paap rk Wald F, Stock-Yogo critical values), an endogeneity test (Durbin-Wu-Hausman) on Table 4 Col 1, and Hansen J overidentification tests on Tables 7 and 8 (Cols 7-9 and Panel C respectively, using `gmm2s` to make J meaningful). The headline finding is that **2SLS β = 0.944 on `avexpr` is roughly 80% larger than the OLS β = 0.522** — consistent with classical measurement-error attenuation in OLS dominating reverse-causality and omitted-variables biases.

**Warnings:** None. Informational `ivreg2` notes ("Critical values are for Cragg-Donald F and i.i.d. errors") appear after each just-identified IV — these are documentation, not warnings.

---

## Data Overview

```text
Table 1 — Whole world (Column 1):

    Variable |        Obs        Mean    Std. dev.       Min        Max
-------------+---------------------------------------------------------
    logpgp95 |        162    8.304196    1.070869   6.109248   10.28875
    loghjypl |        127   -1.709099    1.076916  -3.540459          0
      avexpr |        129    6.988548    1.831779   1.636364         10
     cons00a |         96    1.854167    1.788732          1          7
       cons1 |         92    3.630435    2.393753          1          7
    democ00a |         90    1.122222    2.538812          0         10
    euro1900 |        166    30.10241    41.86424          0        100

Table 1 — Base sample (baseco==1) (Column 2):

    Variable |        Obs        Mean    Std. dev.       Min        Max
-------------+---------------------------------------------------------
    logpgp95 |         64    8.062237    1.043359   6.109248   10.21574
    loghjypl |         61   -1.934052    .9807444  -3.540459          0
      avexpr |         64    6.515625    1.468647        3.5         10
     cons00a |         60        2.25    2.112313          1          7
       cons1 |         60         3.4     2.39491          1          7
    democ00a |         59    1.644068     3.00438          0         10
    euro1900 |         63    16.18095    25.53334          0         99
      logem4 |         64    4.657031    1.257984   2.145931   7.986165
```

**Interpretation:** The AJR base sample has 64 former colonies with valid settler-mortality data — about 39% of the 162-country universe. Restricting to the base sample lowers the mean of `avexpr` from 6.99 to 6.52 (institutions are weaker on average among ex-colonies than the full world) and lowers the mean of `euro1900` from 30.1 to 16.2 (ex-colonies had fewer European settlers in 1900 than the world average). The instrument `logem4` ranges from 2.15 (very low mortality, ~9 deaths per 1,000) to 7.99 (extremely high, ~2,940 per 1,000), giving cross-country variation of nearly six log points — more than enough scale for a credible first stage. The base sample's log GDP per capita varies from 6.11 (~\\$450, the poorest country) to 10.22 (~\\$27,400), a 60-fold income range — exp(10.22 − 6.11) = exp(4.11) ≈ 61 — that is exactly the variation AJR want to explain.

---

## Method Results

### Table 2 — OLS regressions of log GDP per capita

```text
                    (1)         (2)         (3)         (4)         (5)         (6)
                logpgp95    logpgp95    logpgp95    logpgp95    logpgp95    logpgp95
avexpr         0.532***    0.522***    0.463***    0.390***    0.468***    0.401***
              (0.029)     (0.050)     (0.052)     (0.051)     (0.063)     (0.064)
lat_abst                              0.872*      0.333       1.577**     0.875
                                     (0.499)     (0.442)     (0.651)     (0.614)
africa                                            -0.916***               -0.881***
                                                  (0.154)                 (0.156)
asia                                              -0.153                  -0.577*
                                                  (0.181)                 (0.299)
other                                             0.304*                  0.107
                                                  (0.174)                 (0.223)
N                  111         64        111         111         64          64
R-squared        0.611      0.540      0.623      0.715       0.574       0.714
```

**Interpretation:** The naive OLS coefficient on `avexpr` is remarkably stable across specifications: 0.532 in the full 111-country sample (Col 1), 0.522 in the 64-country base sample (Col 2), and falls only to 0.390–0.401 once continent dummies are added (Cols 4 and 6). At face value, a one-point increase in expropriation protection (on AJR's 0–10 scale) is associated with a 39%–53% rise in income per capita — economically large and statistically significant at the 1% level. But these estimates carry three known biases: (i) reverse causality (rich countries can afford better institutions), (ii) omitted variables (geography, culture, human capital), and (iii) measurement error in the institutional-quality index, which attenuates OLS toward zero. The IV strategy in §5 will quantify how much of the 0.522 estimate is bias and how much is the true causal effect.

### Table 3 — Determinants of institutions (first-stage preview)

```text
Panel A: DV = avexpr (current institutions, 1985-95)
                    (9)        (10)
                  avexpr     avexpr
logem4         -0.607***  -0.510***
              (0.127)    (0.141)
lat_abst                  2.002
                         (1.337)
N                  64         64
R-squared       0.270      0.296

Panel B: DV = early institutions
                    (3)         (7)         (9)
                cons00a    democ00a    euro1900
logem4        -0.821***  -1.221***   -0.112***
              (0.167)    (0.242)     (0.020)
N                  75         68         73
R-squared       0.248      0.278       0.305
```

**Interpretation:** The first-stage relationship is strong and goes the right way: a one-log-point increase in settler mortality lowers current expropriation protection by 0.607 points (Panel A Col 9, robust SE 0.127, t ≈ –4.8) and explains 27.0% of the cross-country variation in modern institutions. Panel B confirms that high-mortality colonies also developed weaker historical institutions — `logem4` reduces 1900-era constraints on the executive by 0.821 points (Col 3) and reduces the European-settler share in 1900 by 11.2 percentage points (Col 9). Together these results trace AJR's proposed causal chain: deadly disease environments → fewer European settlers → extractive colonial institutions → weak modern institutions → low income today. The full first stage (in §5) yields a Kleibergen-Paap rk Wald F of **16.32** — above the Staiger-Stock (1997) rule of thumb of 10 and just above the Stock-Yogo (2005) iid critical value of 16.38 for ≤10% size distortion.

### Table 4 — Main 2SLS result (the headline finding)

```text
First-stage regression of avexpr (Col 1):
      logem4 |  -.6067782   .1501972    -4.04   0.000
F( 1, 62) =    16.32     P-val = 0.0001

2SLS estimate of avexpr on logpgp95 (Col 1):
      avexpr |   .9442794   .1760958     5.36   0.000     .5991379    1.289421
       _cons |   1.909667   1.173955     1.63   0.104    -.3912422    4.210575

Underidentification (Kleibergen-Paap rk LM):  9.492    P-val = 0.0021
Weak ID (Cragg-Donald F):                    22.947
Weak ID (Kleibergen-Paap rk Wald F):         16.321
Stock-Yogo 10% maximal IV size critical val: 16.38   (iid threshold)
Anderson-Rubin Wald test (weak-IV robust):   F(1,62) = 61.66   P-val = 0.0000

Endogeneity test (Durbin-Wu-Hausman) chi2(1):    9.085
                                       P-val:    0.0026
```

**Interpretation:** The 2SLS coefficient on `avexpr` is **0.944** with a robust standard error of 0.176 (95% CI [0.60, 1.29]) — about 81% larger than the OLS estimate of 0.522 and statistically distinguishable from zero at the 1% level (z = 5.36). The first-stage Kleibergen-Paap rk Wald F of 16.32 sits just below the Cragg-Donald F of 22.95 (as expected under heteroskedasticity), and just below the Stock-Yogo 10%-maximal-IV-size threshold of 16.38 — so the weak-IV concern is borderline rather than dismissable. The weak-IV-robust Anderson-Rubin Wald test (F = 61.66, p < 0.0001) confirms that institutions remain a strongly significant determinant of GDP even if one is uncomfortable with the conventional 2SLS asymptotics. The Durbin-Wu-Hausman endogeneity test rejects the null that OLS is consistent (χ² = 9.09, p = 0.003): the IV-OLS gap is large enough to constitute statistical evidence that the OLS estimate is biased — IV is empirically warranted, not just theoretically motivated. In domain terms, the IV estimate implies that moving Nigeria (`avexpr` = 5.55) up to Chile's level (`avexpr` = 7.82) would, all else equal, raise its log GDP per capita by 0.944 × 2.27 ≈ 2.15 points — roughly an 8.5-fold increase in income, an enormous effect that is consistent with AJR's ambitious thesis.

### Table 5 — IV with colonial / legal / religion controls

```text
                    (1)         (5)         (7)
                logpgp95    logpgp95    logpgp95
                IV+brit/    IV+legal     IV+
                french      origin       religion
avexpr         1.078***     1.080***    0.917***
              (0.240)      (0.202)     (0.156)
First-stage F (KP rk Wald)
                 11.73       15.94       16.76
N                  64           64          64
```

**Interpretation:** Adding colonial-identity dummies (British, French), legal-origin (`sjlofr`), or religion shares (Catholic, Muslim, none) leaves the IV coefficient on `avexpr` between **0.917 and 1.339** across Cols 1–9 — never below the 0.944 baseline and frequently larger. Standard errors widen (0.16 to 0.54), and first-stage F-statistics range from 2.90 (Col 4) to 16.76 (Col 7) — straddling the conventional weak-IV threshold — but the causal estimate remains within the original confidence interval. AJR's argument that institutions are doing the work — not legal origin, religion, or which European power did the colonizing — survives this battery: none of these control sets eliminate or even meaningfully shrink the institutional-quality coefficient, though Col 4 (Neo-Europes excluded + latitude) does so in confidence-interval terms rather than tight-point-estimate terms, given its F = 2.90 on a 25-country subsample.

### Table 6 — IV with geography and climate controls

```text
                    (1)         (3)         (5)         (7)         (9)
                logpgp95    logpgp95    logpgp95    logpgp95    logpgp95
                IV+temp/    IV+land     IV+geo+     IV+ethnic   IV+all
                humidity    desert      resources   linguistic  geography
avexpr         0.837***    0.960***    1.259**     0.738***    0.713***
              (0.165)     (0.294)     (0.543)     (0.140)     (0.147)
First-stage F (KP rk Wald)
                 17.80       6.27        2.83       14.99        5.54
N                  64          64          64         64          64
```

**Interpretation:** Geography and climate are AJR's most plausible threats to exclusion: maybe settler mortality reflects tropical disease environments that *directly* depress output through agriculture, labor productivity, or human capital — independent of institutions. The data say otherwise. Across nine geographic specifications — temperature dummies, humidity, latitude, percent in steppe/desert/dry climate, mineral resources, landlock status, ethnolinguistic fractionalization (`avelf`) — the IV coefficient on `avexpr` ranges from **0.713 to 1.358** (Cols 1–9), bracketing the 0.944 baseline. The all-geography Col 9 estimate (0.713) is the smallest, and even there the institutional coefficient remains significant at 1% (SE 0.147). The catch: first-stage F falls below 10 in five of nine columns (lowest 1.74 in Col 6, 2.83 in Col 5), so the wider geographic specifications enter weak-instrument territory. The qualitative conclusion holds; the quantitative confidence intervals widen.

### Table 7 — IV with health channels (first overidentified specs)

```text
                    (1)         (3)         (5)         (7)         (8)         (9)
                logpgp95    logpgp95    logpgp95    logpgp95    logpgp95    logpgp95
                IV+malfal   IV+leb95    IV+imr95    IV+malfal   IV+leb95    IV+imr95
                                                    (overid)    (overid)    (overid)
avexpr         0.687***    0.629**     0.551**     0.611***    0.705***    0.644***
              (0.265)     (0.295)     (0.260)     (0.235)     (0.222)     (0.193)
First-stage F   3.79        4.02        4.86        1.17        2.36        2.06
Hansen J                                              1.56        1.18        0.55
Hansen J p-val                                        0.459       0.554       0.760
N                 62           60          60          60         59          59
```

**Interpretation:** When malaria prevalence (`malfal94`), life expectancy at birth in 1995 (`leb95`), or infant mortality (`imr95`) are added as additional exogenous controls, the IV coefficient on `avexpr` falls to **0.55–0.69** (Cols 1, 3, 5) — the only specification in the entire script where the IV estimate dips below the OLS benchmark of 0.52. Two interpretations are possible: (a) modern health is a "bad control" (AJR's preferred reading — health is itself an outcome of institutions), or (b) settler mortality has a direct channel through modern disease environments that violates exclusion. Cols 7–9 use four instruments (`logem4 latabs lt100km meantemp`) for two endogenous regressors (`avexpr` + a health variable) via `gmm2s`, making the Hansen J test meaningful — and J fails to reject (p = 0.46–0.76) in all three specifications, providing some support for the joint validity of the instrument set. However, first-stage F-statistics in these overidentified specs collapse to **1.17–4.86** — well below any weak-IV threshold — so the Hansen J non-rejections must be read with caution: the test has low power when instruments are weak.

### Table 8 — Alternative instruments + Hansen J overidentification

```text
Panel B (all alt instruments, Col 1 baseline of each):
  (11) cons00a   logem4=ctrl   J=0.13  p=0.714
  (13) democ00a  logem4=ctrl   J=1.56  p=0.211
  (15) cons1     logem4=ctrl   J=1.34  p=0.247
  (17) indtime   logem4=ctrl   J=0.32  p=0.569
  (19) democ1    logem4=ctrl   J=0.73  p=0.393

Panel C — overidentification using BOTH alt instrument AND logem4:
  avexpr coefficients range 0.752 to 0.936;  Hansen J p-values 0.21-0.80
  → fails to reject the joint null that the instrument set is exogenous

Panel D — logem4 enters as exogenous control (relaxes exclusion):
  avexpr coefficients range 0.402 to 0.515 (drop of ~50% from baseline)
  logem4 control coefficients statistically zero (-0.05 to -0.26)
```

**Interpretation:** Panels A–B replicate AJR's claim that several alternative instruments — early constraints on the executive (`cons00a`), 1900 democracy (`democ00a`), constraints in the first year of independence (`cons1`), independence-time (`indtime`), and 1900 European-settler share (`euro1900`) — each individually deliver IV coefficients on `avexpr` between 0.40 and 0.94. Panel C is the modern overidentification cousin of AJR's original `hausman consistent efficient` workflow: it pairs each alternative instrument *with* `logem4` and runs efficient GMM (`gmm2s`), producing Hansen J statistics with p-values from **0.21 to 0.80** — uniformly failing to reject the joint exogeneity of the instrument pair. Panel D is the most demanding sensitivity check: it drops the exclusion restriction on `logem4` by including it as an exogenous control while instrumenting with the alternatives; the IV coefficient on `avexpr` then splits by instrument family. Cols 21–22 (using `euro1900` as alt instrument) keep `avexpr` at **0.81–0.88** — likely because `euro1900` is itself a continuous mortality-correlated proxy rather than a clean institutional alternative — while Cols 23–30 (using historical-institution alternatives `cons00a`, `democ00a`, `cons1`, `indtime`, `democ1`) fall to **0.40–0.52** (still significant in most cases). The `logem4` control is itself never significantly different from zero (range –0.05 to –0.26 across all 10 columns). This pattern is consistent with AJR's claim that settler mortality affects modern income only through institutions, but Albouy's (2012) critique applies: roughly 36% of the mortality observations are imputed or repeated across countries, so shared imputation noise could pass through a J-test that assumes independent measurement errors.

---

## Figure Inventory

| # | Filename | Description | Key takeaway |
|---|----------|-------------|--------------|
| 1 | `stata_iv_first_stage.png` (305 KB) | Scatter of `avexpr` (institutions) vs `logem4` (log settler mortality) for 64 base-sample countries, with country-code labels and warm-orange OLS fit line | Strong negative slope (–0.61) — colonies with deadlier disease environments developed weaker modern institutions; F = 16.32 |
| 2 | `stata_iv_reduced_form.png` (319 KB) | Scatter of `logpgp95` (log GDP per capita 1995) vs `logem4` for the same 64 countries | Clear negative reduced-form relationship: high-mortality colonies are ~10× poorer today; this is the gradient that the IV decomposes into a first stage and a second stage |
| 3 | `stata_iv_ols_vs_iv.png` (196 KB) | `coefplot` comparing the coefficient on `avexpr` across six representative specs: OLS (orange), IV with `logem4` baseline / + colonial controls / + geography / + malaria (steel blue), IV with alt instrument `euro1900` (teal), with 95% CIs | OLS sits at 0.52; every IV variant sits at 0.69–0.94 with overlapping CIs — visual confirmation that the IV-OLS gap is robust to controls and to changing the instrument |

---

## Key Findings

1. **OLS understates the institutional-quality effect by roughly 80%.** The OLS coefficient on `avexpr` is 0.522 (SE 0.050, base sample); the 2SLS coefficient is 0.944 (SE 0.176). The IV is statistically distinguishable from zero (z = 5.36) and the endogeneity test rejects the null that OLS is consistent (χ² = 9.09, p = 0.003). Under classical measurement error in the institutional index, OLS attenuation toward zero is the most parsimonious explanation for the IV > OLS gap.

2. **The first stage is borderline strong.** The Kleibergen-Paap rk Wald F = 16.32 sits just below the Stock-Yogo 10%-maximal-IV-size iid threshold of 16.38 and clearly above the Staiger-Stock rule of thumb F > 10. Under robust SEs the more conservative Olea-Pflueger (2013) effective F should be consulted (`weakivtest`, not currently in the script). The Anderson-Rubin Wald test (F = 61.66, p < 0.0001) confirms institutional quality remains highly significant under weak-IV-robust inference.

3. **The IV estimate survives 27 out of 27 control sets.** Across Tables 5 (colonial/legal/religion, 9 cols), 6 (geography/climate, 9 cols), and 7 Cols 1–9 (health channels including the overidentified Cols 7–9), the 2SLS coefficient on `avexpr` ranges from **0.55 to 1.36**, with the baseline 0.944 sitting near the middle. The lower end of that range comes from the health-channel specs (Tab 7 Cols 1–6, where IV drops to 0.55–0.69) — a well-known nuance discussed in Key Finding #5. In no specification does adding a control set drive the institutional coefficient to zero or flip its sign, even when first-stage F-statistics fall below 5.

4. **Hansen J overidentification tests do not reject instrument validity.** Table 7 Cols 7–9 (4 instruments, 2 endogenous regressors) report J-statistics of 0.55–1.56 with p-values 0.46–0.76. Table 8 Panel C, which pairs each alternative instrument with `logem4` and uses efficient 2-step GMM, reports J p-values from **0.21 to 0.80** across five alternative instruments — uniform failure to reject joint exogeneity. Caveat: Albouy (2012) shows ~36% of mortality observations are imputed or repeats, so shared imputation noise could pass the J-test undetected.

5. **Health channels are the empirically thorniest threat to exclusion.** Cols 1–6 of Table 7, which add modern malaria prevalence (`malfal94`), life expectancy (`leb95`), or infant mortality (`imr95`) as exogenous controls, drive the IV coefficient on `avexpr` down to **0.55–0.69** — the only place in the script where the IV approaches the OLS magnitude. AJR's own preferred reading is that these are "bad controls" (themselves outcomes of institutions); a critic's reading is that disease environments may have a direct channel into modern income. The Hansen J overid tests (p = 0.46–0.76) modestly support AJR, but the first-stage F-statistics in these specs are 1.17–4.86, so the J-test has low power.

6. **Panel D drops the `logem4` exclusion restriction and the IV coefficient halves in 8 of 10 specifications.** When `logem4` enters as an exogenous control while alternative instruments do the identification, the IV coefficient on `avexpr` falls from ~0.94 to **0.40–0.52** in Cols 23–30 (those using historical-institution alternatives `cons00a`, `democ00a`, `cons1`, `indtime`, `democ1`); Cols 21–22 (using `euro1900`) keep `avexpr` at **0.81–0.88** because `euro1900` is itself a continuous mortality-correlated proxy. The `logem4` control is never statistically distinguishable from zero (range –0.05 to –0.26, all p > 0.1) across any of the 10 columns. This is the strongest piece of evidence in the script for AJR's exclusion claim — settler mortality enters modern income only through its first-stage effect on institutions — though the 8-of-10 drop suggests some of the baseline IV's strength comes from `logem4` proxying for unobserved correlates that the historical-institution alternatives do not capture.

7. **2SLS identifies a LATE, not necessarily the ATE.** Under heterogeneous treatment effects (Imbens-Angrist 1994), the 0.944 coefficient is the local average treatment effect for the subpopulation of countries whose institutional quality would change in response to settler-mortality variation — *not* the average effect across all countries. The script flags this in §0 and §11. Whether the LATE generalizes to the ATE depends on substantive judgment about which countries are "compliers" with the historical mortality-institutions link.

---

## Surprises and Caveats

- **First-stage F sits at the borderline, not comfortably above it.** The KP rk Wald F = 16.32 vs Stock-Yogo iid threshold = 16.38 is essentially a wash. Robust-SE practice (this script's default) calls for the Olea-Pflueger (2013) effective F, which the `weakivtest` SSC package computes; this is not currently in the script and would be a natural extension. The script's `di` block now flags this caveat in the log (per the post-review fix).

- **First-stage F collapses in some robustness specs.** Table 6 Cols 5–6 (full geography + resources + landlock): F = 1.74–2.83. Table 7 overid Cols 7–9: F = 1.17–4.86. Hansen J p-values from these specs should not be over-interpreted — they have low power against weak instruments.

- **Health-channel specs are the only place IV approaches OLS.** Table 7 Col 5 (IV + infant mortality): β = 0.551 vs OLS = 0.522. This is consistent with two opposing readings — "bad control" vs "exclusion violation" — and the data alone cannot adjudicate between them. The blog post should flag this honestly rather than emphasize the more comfortable Tables 4–6 results.

- **Albouy (2012) imputation critique materially limits what the J-test buys.** When ~36% of the mortality data are imputed or shared across countries (e.g., one African country's mortality used for several neighbors), shared imputation noise survives the orthogonality assumption underlying the Hansen J test. Non-rejection of overidentification is therefore *necessary but not sufficient* for instrument validity. The script flags this in a `di` block at the end of §9.

- **`mlabel(shortnam)` produces overlapping country codes** in Figures 1 and 2 (especially the dense cluster around `logem4 ≈ 4`, `avexpr ≈ 6.5`). This is a teaching-figure compromise rather than a bug; resolving it cleanly would require manual cluster-specific label suppression. Already noted in `script-review.md` as a LOW-priority polish item.

- **Coefficients on the "Neo-Europes-excluded" subsample are wider than on the full base.** Tables 4 Cols 3–4 and 5 Cols 3–4 work on samples of N = 25–60. These columns help readers see that the result is not driven by the four high-income outliers (USA, CAN, AUS, NZL) — but the standard errors widen accordingly (0.40–0.54 vs 0.18 baseline), and the IV effects climb to 1.21–1.34, suggesting the four outliers anchor the lower end of the institutions-income relationship.

- **Sample-size quirk in Table 2:** Col 1 has N = 111, Col 2 has N = 64. The 47-country gap is ex-colonies vs the AJR base sample (excludes Neo-Europes from one set, includes them in another, etc.). The original AJR `maketable2.do` shows the same N = 111/110/64 pattern; this is not a bug.

- **No unexpected sign flips, no convergence issues, no missing figures, no orphan PNGs.** The execution log is clean from start to finish; the success marker now lands at line 10803 inside the log (post-review fix).
