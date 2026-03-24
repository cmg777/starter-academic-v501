# Plan: Evaluating a Cash Transfer Program (RCT) with Panel Data in Stata

## Context

This tutorial teaches beginners how to evaluate a randomized controlled trial (RCT) using panel data in Stata. It uses simulated data from a hypothetical cash transfer program (2,000 households, baseline 2021, endline 2024) where the **true treatment effect is known** (0.12 log points, ~12% consumption increase). This "known answer" setup lets readers see how well different econometric methods recover the correct answer.

The reference materials in `content/post/stata_rct/` contain complete Stata code, output screenshots, and detailed explanations covering 10 analytical methods. The post needs to distill this into a beginner-friendly, progressively complex tutorial following the site's data-science-post conventions.

**Key adaptation:** This is a **Stata** tutorial (not Python), so there's no `script.py` or `notebook.ipynb`. Figures are Stata graph outputs. The user will need to run Stata commands separately to generate PNGs.

### Design Decisions (Confirmed)
1. **Endogenous treatment section:** Include as optional advanced section with skip-ahead note
2. **AIPW balance test:** Keep full AIPW balance test with all 4 diagnostic outputs
3. **Figures:** Use placeholder references with descriptive filenames (e.g., `stata_rct_balance_plot.png`) --- user generates PNGs from Stata separately
4. **Companion do-file:** Create `analysis.do` with all commands organized by section, linked in front matter
5. **Three-family comparison:** Every estimation section systematically compares RA, IPW, and DR results for both ATE and ATT
6. **95% CIs in all tables:** Every comparison table must include 95% confidence intervals and note whether the CI contains the true effect (0.12)
7. **Save plan to post directory:** Save this plan as a markdown file in the post directory (`content/post/stata_rct/plan.md`)
8. **Update skill:** Add requirement to the `data-science-post` skill: when a plan is approved, save it as `plan.md` in the post directory

---

## Proposed Outline

### Front Matter
- `categories: [Stata, Causal Inference]`
- `tags: [stata, causal, causal inference, rct, panel]`
- `toc: true`, `diagram: true`, `image.placement: 3`
- Links: Stata do-file (`analysis.do`), dataset URL on GitHub
- Date: 2026-03-24

---

### Section 1: Overview (~3 paragraphs)
- Hook: Cash transfer programs are among the most common development interventions --- how do we rigorously evaluate their impact?
- Scope: walk through the full workflow of analyzing an RCT with panel data in Stata
- Why simulated data: the true effect (12%) gives us a benchmark to judge each method
- **Learning Objectives** (7 items):
  1. Verify baseline balance using t-tests, standardized mean differences, and balance plots
  2. Distinguish between ATE and ATT and identify which estimand each method targets
  3. Understand three estimation strategies --- regression adjustment, inverse probability weighting, and doubly robust --- and when to use each
  4. Estimate treatment effects using all three approaches and compare their results
  5. Leverage panel data structure with difference-in-differences and understand why DiD estimates ATT
  6. Apply doubly robust difference-in-differences (DRDID) for modern panel data analysis
  7. Separate the effect of treatment offer from treatment receipt under imperfect compliance

---

### Section 2: Study Design (~2 paragraphs + Mermaid diagram + variable table)

**Mermaid Diagram 1 --- Randomization and compliance flow:**
```
2,000 Households --> Stratified Randomization (by poverty)
  --> Treatment (~1,000): 85% receive / 15% don't
  --> Control (~1,000): 5% receive / 95% don't
  --> Baseline 2021 --> Endline 2024
```
Uses site palette colors (blue, orange, teal).

Key design features:
- Balanced panel, block randomization by poverty status
- Imperfect compliance (creates the offer vs. receipt distinction)
- Variables table: `id`, `year`, `post`, `treat` (offer), `D` (receipt), `y` (log consumption), `age`, `female`, `poverty`, `edu`

Callout: **Offer vs. Receipt** --- `treat` captures random assignment (exogenous), `D` captures actual receipt (endogenous). Most methods estimate the effect of the *offer* (intent-to-treat).

---

### Section 3: Analytical Roadmap (~1 paragraph + Mermaid diagram)

**Mermaid Diagram 2 --- Method progression (revised):**
```
Balance Checks --> [Cross-sectional: RA / IPW / DR] --> [Panel: DiD / DR-DiD] --> [Advanced: Endogenous Treatment]
```
Color-coded: blue (foundations) --> orange (cross-sectional estimation) --> teal (panel estimation) --> dark (advanced)

Brief paragraph: The tutorial progresses from simple to sophisticated. We first establish that randomization worked (balance checks), then estimate treatment effects three ways using only endline data (RA, IPW, DR). Next, we unlock the full power of panel data with difference-in-differences. Finally, we address the real-world complication of imperfect compliance.

---

### Section 4: Data Loading and Exploration
**Stata commands:** `use`, `des`, `sum if post==0`, `sum if post==1`, `xtset id year`

- 3 code blocks with output + interpretation
- Key numbers: 4,000 obs (2,000 HH x 2 waves), mean consumption ~10, ~50% treatment assignment
- Confirm panel structure with `xtset`

---

### Section 5: Baseline Balance Checks (4 subsections)

**5.1 T-tests and proportion tests**
- `ttest y/age/edu if post==0, by(treat)` + `prtest female/poverty if post==0, by(treat)`
- Finding: female has p=0.024 (significant imbalance, SMD ~9.3%)

**5.2 Balance table (iebaltab)**
- Install `ietoolkit`, run `iebaltab`
- Visual output: balance table screenshot
- Interpretation: only female shows ** significance

**5.3 Visual balance plot**
- Install `balanceplot`, generate plot
- Visual output: standardized mean differences plot
- Interpretation: all below 10% threshold, female closest

**5.4 AIPW as a formal balance test**
- `teffects aipw` at baseline only --- expecting null effect
- Diagnostics: `tebalance overid` (p=0.667), `tebalance summarize`, `tebalance density`, `teffects overlap`
- 4 visual outputs (density, overlap, balance summary)
- Interpretation: ATE at baseline = -0.024 (not significant) --- confirms successful randomization
- **Pedagogical bridge:** introduces the concept of doubly robust methods before the estimation sections

---

### Section 6: What Are We Estimating? ATE vs. ATT (~3 paragraphs + equations)

Formal definitions with LaTeX:
- **ATE** = E[Y(1) - Y(0)] --- the policymaker's question: "What happens if we scale this program to everyone?"
- **ATT** = E[Y(1) - Y(0) | T=1] --- the evaluator's question: "Did the program benefit those assigned to it?"
- In a well-designed RCT with homogeneous effects, ATE ≈ ATT
- With heterogeneous effects, they can differ --- and knowing *which* you are estimating matters for interpretation
- Frame covariate adjustment as **precision improvement** (not bias removal) --- this is an RCT

**Key point for later sections:** Some methods can estimate both ATE and ATT (RA, IPW, DR). Difference-in-differences inherently estimates the ATT only. Understanding this distinction is essential for interpreting all results.

---

### Section 7: Three Strategies for Causal Estimation (NEW --- conceptual section)

This is a **key new section** that lays the conceptual foundation before any estimation code. It explains the three families of estimators using intuition, analogies, and a comparison table --- no code yet.

**7.1 Regression Adjustment (RA) --- modeling the outcome**

- **What it does:** Fits a statistical model predicting the outcome (consumption) as a function of treatment and covariates. Compares predicted outcomes under treatment vs. control.
- **Intuition:** "Adjust the outcome to account for differences in observable characteristics."
- **Stata command family:** `teffects ra`
- **Key assumption:** The outcome model must be correctly specified.
- **Strength:** Simple, familiar (just regression). Easy to interpret.
- **Weakness:** If the outcome model is wrong (e.g., wrong functional form, omitted nonlinearities), the estimate is biased.

**7.2 Inverse Probability Weighting (IPW) --- modeling the treatment assignment**

- **What it does:** Estimates the probability of being assigned to treatment (propensity score), then reweights observations so that the treatment and control groups look comparable. Does NOT model the outcome directly.
- **Intuition:** "Make the groups balanced by giving more weight to underrepresented observations."
- **Stata command family:** `teffects ipw`
- **Key assumption:** The treatment model (propensity score) must be correctly specified.
- **Strength:** Does not require assumptions about the outcome model.
- **Weakness:** If the propensity score model is wrong, or if there are extreme weights (poor overlap), the estimate is biased or unstable.
- **Note:** In a well-designed RCT, the propensity score is known by design (it's ~0.50 for everyone), so IPW may seem unnecessary. But it becomes valuable when there are baseline imbalances or when extending to observational settings.

**7.3 Doubly Robust (DR) --- modeling both ("belt and suspenders")**

- **What it does:** Combines both approaches --- fits an outcome model AND estimates a propensity score. The estimate is consistent if *either* model is correctly specified (not necessarily both).
- **Intuition:** "Wear a belt AND suspenders --- if one fails, the other still holds your pants up."
- **Stata command families:** `teffects aipw` (augmented IPW) and `teffects ipwra` (IPW regression adjustment)
- **Key assumption:** At least one of the two models is correctly specified.
- **Strength:** Extra protection against misspecification. The standard recommendation in modern causal inference.
- **Weakness:** Slightly more complex; requires specifying two models.
- **AIPW vs. IPWRA:** Both are doubly robust but differ in how they combine the two models. AIPW augments the IPW estimator with a bias-correction term from the outcome model. IPWRA applies IPW weights to the regression adjustment. In practice, results are usually very similar.

**Comparison table (conceptual --- no numbers yet):**

| Feature | RA | IPW | DR |
|---------|-----|------|-----|
| Models the outcome? | Yes | No | Yes |
| Models the treatment? | No | Yes | Yes |
| Consistent if outcome model correct? | Yes | --- | Yes |
| Consistent if treatment model correct? | --- | Yes | Yes |
| Recommended for? | Simple settings | Known propensity | General use |

**Mermaid Diagram 3 (optional) --- How the three strategies relate:**
```
RA (outcome model) + IPW (treatment model) --> DR (both models, doubly robust)
```
Visual showing that DR is the union/combination of the other two.

---

### Section 8: Cross-sectional Estimation at Endline --- RA, IPW, and DR (6 subsections)

This is the **core estimation section** using only endline data (`keep if post==1`). It systematically applies all three methods, estimating **both ATE and ATT** for each.

**8.1 Simple difference in means (baseline reference)**
- `reg y treat, robust`
- Result: coefficient = 0.116, SE = 0.019, p < 0.001
- Interpretation: the simplest estimator; unbiased because of randomization but does not adjust for the gender imbalance we found. This is our benchmark.

**8.2 Regression Adjustment --- ATE and ATT**
- ATE: `teffects ra (y c.age c.edu i.female i.poverty) (treat), ate`
- ATT: `teffects ra (y c.age c.edu i.female i.poverty) (treat), atet`
- Results: ATE ≈ 0.116, ATT ≈ 0.116
- Interpretation: RA models the outcome with covariates. In this RCT, ATE and ATT are nearly identical because treatment effects are homogeneous. RA adjusts for the gender imbalance, improving precision.

**8.3 Inverse Probability Weighting --- ATE and ATT**
- ATE: `teffects ipw (y) (treat c.age c.edu i.female i.poverty), ate`
- ATT: `teffects ipw (y) (treat c.age c.edu i.female i.poverty), atet`
- Results: ATE ≈ TBD, ATT ≈ TBD (user will run in Stata)
- Interpretation: IPW reweights observations based on propensity scores. It does NOT model the outcome --- only the treatment assignment. In this RCT, propensity scores are near 0.50 (by design), so weights are mild. Compare results with RA.

**8.4 Doubly Robust --- ATE and ATT (IPWRA)**
- ATE: `teffects ipwra (y c.age c.edu i.female i.poverty) (treat c.age c.edu i.female i.poverty), vce(robust)`
- ATT: `teffects ipwra (y c.age c.edu i.female i.poverty) (treat c.age c.edu i.female i.poverty), atet vce(robust)`
- Results: ATE = 0.113, ATT = 0.113
- Interpretation: DR combines both models. The slight difference from RA (0.116 vs. 0.113) comes from the additional propensity score adjustment. Both are close to the true 0.12.

**8.5 Doubly Robust --- ATE and ATT (AIPW alternative)**
- ATE: `teffects aipw (y c.age c.edu i.female i.poverty) (treat c.age c.edu i.female i.poverty)`
- Brief comparison with IPWRA results --- typically nearly identical
- Note: AIPW and IPWRA are two flavors of doubly robust estimation

**8.6 Cross-sectional comparison table**

| Method | Approach | Estimand | Estimate | SE | 95% CI | Contains 0.12? |
|--------|----------|----------|----------|-----|--------|:-:|
| Simple regression | None | ATE | 0.116 | 0.019 | [0.078, 0.154] | Yes |
| Regression Adjustment | Outcome model | ATE | 0.116 | 0.019 | [0.078, 0.154] | Yes |
| Regression Adjustment | Outcome model | ATT | 0.116 | 0.019 | [0.078, 0.154] | Yes |
| Inverse Prob. Weighting | Treatment model | ATE | TBD | TBD | TBD | TBD |
| Inverse Prob. Weighting | Treatment model | ATT | TBD | TBD | TBD | TBD |
| IPWRA (Doubly Robust) | Both models | ATE | 0.113 | 0.019 | [0.075, 0.150] | Yes |
| IPWRA (Doubly Robust) | Both models | ATT | 0.113 | 0.019 | [0.076, 0.151] | Yes |
| **True effect** | | | **0.12** | | | |

Interpretation paragraph: All cross-sectional methods recover estimates close to the true 0.12. In this well-designed RCT:
- ATE ≈ ATT for every method (homogeneous effects)
- RA and IPW give similar results because randomization ensures both models are approximately correct
- DR methods provide insurance but don't change results dramatically when both constituent models are correct
- The real value of DR methods appears when one model might be misspecified --- a common situation in practice

---

### Section 9: Leveraging Panel Data --- Difference-in-Differences (5 subsections)

This section explains **why panel data adds value** beyond cross-sectional analysis, **why DiD estimates ATT (not ATE)**, and how doubly robust DiD works.

**9.1 Why use panel data? The value of before-and-after (conceptual)**

- Cross-sectional methods (Section 8) use only endline data --- they compare treated vs. control *after* the intervention
- With panel data, we observe the *same* households before and after the intervention
- This lets us control for **time-invariant unobservable characteristics** (household fixed effects) --- things like innate motivation, geographic advantage, family culture --- that no amount of cross-sectional covariate adjustment can capture
- **Key insight:** Even in an RCT, panel methods can improve precision by removing within-household variation that cross-sectional methods cannot address

**LaTeX equation for DiD:**

$$\hat{\tau}\_{DiD} = (\bar{Y}\_{treat,post} - \bar{Y}\_{treat,pre}) - (\bar{Y}\_{control,post} - \bar{Y}\_{control,pre})$$

Interpretation: The first difference (treated group's change over time) captures the treatment effect *plus* any time trend. The second difference (control group's change) captures the time trend alone. Subtracting removes the time trend, isolating the treatment effect.

**9.2 Why does DiD estimate ATT and not ATE? (conceptual --- CRITICAL)**

This subsection explicitly explains a point that many beginners miss:

- **DiD fundamentally answers:** "How did the treated group's outcome change, *relative to* what would have happened without treatment?"
- The counterfactual is constructed from the **control group's time trend** applied to the **treated group's baseline level**
- This counterfactual is specific to the treated group --- it asks what *their* trajectory would have been without treatment
- Therefore, DiD estimates the effect **on the treated** (ATT), not the effect on the general population (ATE)
- **For ATE, you would need:** the treatment effect for the untreated group too (i.e., what would happen if we gave the program to those who didn't receive it). DiD doesn't tell us this.
- **Parallel trends assumption:** The control group's time trend is a valid counterfactual for the treated group's time trend. This is the key identifying assumption of DiD.
- **In an RCT context:** Since treatment was randomly assigned, the parallel trends assumption is very plausible (groups were similar at baseline), making DiD a strong estimator of ATT.

**9.3 Basic DiD with panel fixed effects**
- Code:
  ```stata
  gen treat_post = treat*post
  xtset id year
  xtdidregress (y) (treat_post), group(id) time(year) vce(cluster id)
  ```
- Result: ATT = 0.135, SE = 0.027, p < 0.001
- Interpretation: The DiD estimate (0.135) is slightly higher than the cross-sectional estimates (0.113--0.116). This is expected: DiD removes household fixed effects, which can change the estimate. The result is still within the confidence interval of the true 0.12.
- Note: Standard errors are clustered at the household level (`vce(cluster id)`) to account for serial correlation within panels.

**9.4 From cross-sectional DR to panel DR --- Doubly Robust DiD (DRDID)**

This is a **key pedagogical bridge** connecting the three-family framework from Section 7 to panel data.

**Conceptual explanation:**
- In Section 8, we saw that doubly robust methods combine outcome modeling and propensity score modeling for cross-sectional data
- **DRDID extends this logic to the panel setting:** it combines the DiD framework (using pre/post variation) with doubly robust covariate adjustment
- Like cross-sectional DR, DRDID is consistent if *either* the outcome model for the time trend OR the propensity score model is correctly specified
- **Value added over basic DiD:** basic DiD (Section 9.3) does not adjust for covariates. DRDID adjusts for covariates in a doubly robust way, improving precision and robustness to violations of parallel trends *conditional on covariates*
- **Academic foundation:** Sant'Anna & Zhao (2020) formalized the DRDID estimator, showing it achieves semiparametric efficiency under correct specification

**Stata implementation:**
- Install: `ssc install drdid, replace`
- Code: `drdid y c.age c.edu i.female i.poverty, ivar(id) time(year) treatment(treat) dripw`
- Result: ATT = 0.138, SE = 0.027, p < 0.001
- `dripw` option = Doubly Robust Inverse Probability Weighting (combines outcome regression + IPW within DiD)

**Alternative: Stata 17+ built-in command:**
```stata
gen treat_post = treat*post
xthdidregress aipw (y c.age c.edu i.female i.poverty) (treat_post c.age c.edu i.female i.poverty), group(id)
```
- `xthdidregress aipw` is Stata's built-in AIPW-DiD estimator (no package installation needed)
- Produces similar results to `drdid`

**9.5 Cross-sectional vs. panel comparison table**

| Method | Approach | Estimand | Data Used | Estimate | SE | 95% CI | Contains 0.12? |
|--------|----------|----------|-----------|----------|-----|--------|:-:|
| Simple regression | None | ATE | Endline only | 0.116 | 0.019 | [0.078, 0.154] | Yes |
| RA | Outcome model | ATE | Endline only | 0.116 | 0.019 | [0.078, 0.154] | Yes |
| IPW | Treatment model | ATE | Endline only | TBD | TBD | TBD | TBD |
| DR (IPWRA) | Both models | ATE | Endline only | 0.113 | 0.019 | [0.075, 0.150] | Yes |
| Basic DiD | Panel FE | **ATT** | **Both waves** | 0.135 | 0.027 | [0.081, 0.188] | Yes |
| DR-DiD (DRDID) | Both + Panel | **ATT** | **Both waves** | 0.138 | 0.027 | [0.084, 0.191] | Yes |
| **True effect** | | | | **0.12** | | | |

**Interpretation paragraph (important):**
- Cross-sectional methods estimate ATE using only endline data; DiD methods estimate ATT using both waves
- The DiD estimates are slightly higher (0.135--0.138) than cross-sectional estimates (0.113--0.116), but all confidence intervals contain the true 0.12
- DiD's wider standard errors (0.027 vs. 0.019) reflect the additional uncertainty from using the pre-post difference rather than endline levels alone
- **The key value of DiD is not tighter standard errors but robustness to time-invariant unobservables.** In observational settings (where randomization doesn't hold), DiD can correct biases that cross-sectional methods cannot. In this RCT, the randomization already handles confounding, so the estimates are similar.
- DRDID adds doubly robust protection on top of DiD, making it the most robust panel method available

---

### Section 10: Offer vs. Receipt --- Endogenous Treatment (Advanced)

Marked as **advanced/optional** with a callout: "This section addresses imperfect compliance. Readers new to causal inference may skip this on first reading."

**10.1 The compliance problem**
- Conceptual: In practice, not everyone assigned to treatment actually receives it (85% compliance), and some control households receive it anyway (5% crossover)
- The variable `treat` (offer) is random and exogenous. The variable `D` (receipt) is endogenous --- it correlates with household characteristics
- Naively comparing receivers vs. non-receivers would introduce selection bias
- **Solution:** Use the random assignment (`treat`) as an instrumental variable for actual receipt (`D`)
- This shifts the estimand: we now estimate the effect of *receipt* rather than the effect of the *offer*

**10.2 Endogenous treatment regression**
- Code: `etregress y c.age i.female i.poverty c.edu, treat(D = treat c.age i.female i.poverty c.edu) vce(robust)`
- `margins r.D` for ATE of receipt
- `margins, predict(cte) subpop(if D==1)` for ATT of receipt
- Interpretation: compares the ATE/ATT of receipt with the ATE/ATT of offer from Section 8

**10.3 Doubly robust estimation of receipt effect**
- Code: `teffects ipwra (y y0 c.age i.female i.poverty c.edu) (D c.age i.female i.poverty c.edu treat), vce(robust)`
- Uses baseline outcome `y0` as an additional control (ANCOVA-style)
- Uses `treat` (random assignment) as a covariate in the treatment model for `D`
- Diagnostics: `tebalance summarize`, `tebalance density`, `teffects overlap`

---

### Section 11: Comparing All Estimates --- The Big Picture

**Comprehensive summary table:**

| # | Method | Approach | Estimand | Data | Estimate | SE | 95% CI | Contains 0.12? |
|---|--------|----------|----------|------|----------|-----|--------|:-:|
| 1 | Simple regression | None | ATE (offer) | Endline | 0.116 | 0.019 | [0.078, 0.154] | Yes |
| 2 | Regression Adjustment | Outcome model | ATE (offer) | Endline | 0.116 | 0.019 | [0.078, 0.154] | Yes |
| 3 | Regression Adjustment | Outcome model | ATT (offer) | Endline | 0.116 | 0.019 | [0.078, 0.154] | Yes |
| 4 | Inverse Prob. Weighting | Treatment model | ATE (offer) | Endline | TBD | TBD | TBD | TBD |
| 5 | Inverse Prob. Weighting | Treatment model | ATT (offer) | Endline | TBD | TBD | TBD | TBD |
| 6 | IPWRA (Doubly Robust) | Both models | ATE (offer) | Endline | 0.113 | 0.019 | [0.075, 0.150] | Yes |
| 7 | IPWRA (Doubly Robust) | Both models | ATT (offer) | Endline | 0.113 | 0.019 | [0.076, 0.151] | Yes |
| 8 | Basic DiD | Panel FE | ATT (offer) | Panel | 0.135 | 0.027 | [0.081, 0.188] | Yes |
| 9 | DR-DiD (DRDID) | Both + Panel | ATT (offer) | Panel | 0.138 | 0.027 | [0.084, 0.191] | Yes |
| | **True effect** | | | | **0.12** | | | |

**Three key takeaways from the comparison:**

1. **RA vs. IPW vs. DR:** In this well-designed RCT, all three approaches give similar results because randomization ensures both the outcome model and the propensity score model are approximately correct. The differences are small (0.113--0.116). In observational studies, where models may be misspecified, the choice matters much more --- and DR is the safest bet.

2. **ATE vs. ATT:** For all cross-sectional methods, ATE ≈ ATT. This confirms that treatment effects are roughly homogeneous across households. When effects are heterogeneous, ATE and ATT can diverge --- and the researcher must choose the estimand that matches their policy question.

3. **Cross-sectional vs. DiD:** DiD estimates (0.135--0.138) are slightly higher than cross-sectional estimates (0.113--0.116) but all contain the true 0.12 in their confidence intervals. DiD's main advantage is controlling for time-invariant unobservables --- less important in an RCT (where randomization handles confounding) but critical in quasi-experimental settings.

---

### Section 12: Summary and Key Takeaways

- The cash transfer program increased household consumption by approximately 11--14% across all methods, close to the true 12%
- **7 methodological lessons:**
  1. Always verify baseline balance before estimating effects
  2. Be explicit about your estimand --- ATE answers the policymaker's question, ATT answers the evaluator's
  3. Regression adjustment models the outcome; IPW models treatment assignment; doubly robust does both
  4. In a well-designed RCT, all three approaches converge --- but DR provides insurance against misspecification
  5. Panel data (DiD) controls for time-invariant unobservables that cross-sectional methods cannot address
  6. DiD inherently estimates ATT because its counterfactual is specific to the treated group
  7. Doubly robust DiD (DRDID) extends the DR logic to the panel setting for maximum robustness
- **Limitations:** simulated data, two periods only, homogeneous effects assumed
- **Next steps:** apply to real-world RCT data, explore heterogeneous treatment effects by subgroup, extend to multi-period panels with staggered treatment adoption

---

### Section 13: Exercises (3 items)
1. Estimate treatment effects separately for male and female households using IPWRA --- are the effects heterogeneous? Does ATE still equal ATT?
2. Compare the RA, IPW, and DR estimates when you deliberately misspecify the outcome model (e.g., omit `edu` and `age`) --- which method is most robust?
3. Re-run the DiD analysis without the `dripw` option in `drdid` --- how does the basic DiD compare to doubly robust DiD?

---

### Section 14: References
1. [Stata `teffects` documentation --- Treatment-effects estimation](https://www.stata.com/manuals/teteffects.pdf)
2. [Sant'Anna, P.H.C. & Zhao, J. (2020). Doubly Robust Difference-in-Differences Estimators. *Journal of Econometrics*, 219(1), 101--122](https://doi.org/10.1016/j.jeconom.2020.06.003)
3. [Imbens, G. & Rubin, D. (2015). *Causal Inference for Statistics, Social, and Biomedical Sciences*. Cambridge University Press](https://doi.org/10.1017/CBO9781139025751)
4. [Rios-Avila, F., Sant'Anna, P.H.C., & Callaway, B. `drdid` --- Doubly Robust DID estimators for Stata](https://friosavila.github.io/stpackages/drdid.html)
5. [World Bank `ietoolkit` / `iebaltab` documentation](https://dimewiki.worldbank.org/iebaltab)
6. [Mize, T. `balanceplot` --- Stata module for covariate balance visualization](https://tdmize.github.io/data/)
7. [RCT Analysis: Cash Transfers, Panel Data, and Doubly Robust Estimation (YouTube)](https://youtu.be/Gr_fu5deDMk)

---

## Files to Create/Modify

| File | Action |
|------|--------|
| `content/post/stata_rct/index.md` | **Create** --- main tutorial post |
| `content/post/stata_rct/analysis.do` | **Create** --- companion Stata do-file with all commands |
| `content/post/stata_rct/*.png` | **User generates** --- Stata graph outputs (balance plot, density, overlap) |

**Not created:** `featured.png` (user adds manually), `script.py` (not applicable for Stata post)

## Verification

1. Run Hugo dev server: `"$HOME/Library/Application Support/Hugo/0.109.0/hugo" server --disableFastRender`
2. Navigate to `http://localhost:1313/post/stata_rct/`
3. Verify: left-side TOC renders, Mermaid diagrams display, code blocks have syntax highlighting, LaTeX equations render, headings are blue, tables are styled
4. Check sandwich pattern: every code block has explanation + output + interpretation
5. Count interpretation paragraphs with specific numbers (target: >= 12, given expanded sections)
6. Verify all three families (RA, IPW, DR) appear in every estimation comparison table
7. Run `/project:proofread-post stata_rct` for automated quality check
