# Plan: Comprehensive Stata Matching & Treatment Effects Tutorial — Full Pipeline

## Context

The user wants a beginner-friendly tutorial on **treatment effects estimators in Stata**, built around the **maternal smoking and birth weight** case study (`cattaneo2.dta`). The reference material (in `content/post/stata_matching/references/`) walks through six estimators under Stata's `teffects` framework: regression adjustment (RA), inverse-probability weighting (IPW), IPW with regression adjustment (IPWRA), augmented IPW (AIPW), nearest-neighbor matching (NNM), and propensity-score matching (PSM).

The post must be pedagogically rigorous: written from the perspective of an expert professor of causal inference, designed to **maximize learning** for newcomers using analogies, Mermaid diagrams, equations with plain-language variable mapping, and the "sandwich pattern" (explanation → code → output → interpretation).

The user has pre-approved running the full 8-skill pipeline end-to-end **without intermediate confirmation** once this plan is approved:

`/write-script` → `/review-script` → `/write-results-report` → `/review-results-report` → `/write-post` → `/review-post` → `/write-infographic` → `/review-infographic`

This plan is the single approval gate — it locks scope, methods, equations, figures, structure, conventions, and acceptance criteria so each downstream skill can be run with `--no-confirm` semantics (i.e., the scope blocks of write-script, write-results-report, write-post, write-infographic are pre-filled from this plan).

---

## Target audience & tone

- **Primary audience:** Master's / early PhD students and applied researchers seeing `teffects` for the first time.
- **Pre-requisites assumed:** OLS regression, basic Stata, intuition about correlation vs. causation. Nothing more.
- **Tone:** A patient professor. Each method is introduced with (a) a one-sentence purpose, (b) an analogy, (c) the formal estimand it targets, (d) the equation with variables defined, (e) the Stata command, (f) the output, (g) interpretation in plain English. **Never assume jargon.** Define propensity score, balance, overlap, exchangeability, SUTVA, etc., the first time they appear.

---

## Case study (locked)

- **Dataset:** `cattaneo2.dta` (already in `references/` — will be re-downloaded from `https://github.com/quarcs-lab/data-open/raw/master/ametrics/cattaneo2.dta`)
- **Outcome (Y):** `bweight` — infant birth weight in grams
- **Treatment (D):** `mbsmoke` — 1 if mother smoked during pregnancy, 0 otherwise
- **Confounders (X):** `mage` (mother's age), `mmarried`, `fage` (father's age), `medu` (mother's education), `prenatal1` (prenatal care in 1st trimester), `fbaby` (first baby indicator)
- **Estimands of interest:** ATE = E[Y(1) − Y(0)] and ATT = E[Y(1) − Y(0) | D=1]
- **Expected sign of effect:** Negative — smoking reduces birth weight. Reference benchmark from Cattaneo (2010) literature: roughly −200 to −250 grams under proper adjustment, vs. a naive (unadjusted) gap that is also negative but biased.

---

## Design decisions (locked)

| # | Decision | Rationale |
|---|---|---|
| 1 | **Six estimators** (RA, IPW, IPWRA, AIPW, NNM, PSM) plus a **naive OLS-difference** baseline as a foil | Matches reference material; naive baseline shows what the methods correct |
| 2 | Use the **same covariate set** across methods where possible (`mmarried mage fbaby medu` for treatment model; `mmarried mage prenatal1 fbaby` for outcome model), to make estimates comparable | Mirrors the reference material |
| 3 | **Both ATE and ATT** reported for every applicable method (AIPW reports ATE only — explained in text) | Reinforces estimand literacy |
| 4 | Light theme figures (site palette: `#6a9bcc` blue, `#d97757` orange, `#141413` near-black, `#00d4c8` teal) | Consistency with stata_rct |
| 5 | **5 PNG figures** (locked list below) | Exceeds 3-figure minimum; one per learning anchor |
| 6 | Mermaid diagrams: **3 total** (potential-outcomes flow, method taxonomy, PSM logic) | Mermaid is strongly used in stata_rct — proven pedagogical tool |
| 7 | **8+ display-math equations** with full variable definitions inline | Each method gets its estimand equation |
| 8 | **Manual recreation** blocks for RA, IPW, and PSM (mirror reference material) — show that `teffects` is not a black box | Strong pedagogical move; demystifies the estimators |
| 9 | Companion files: `analysis.do` (executable end-to-end) + `analysis.log` (Stata's batch-mode log, also linked as `execution_log.txt`) + 5 PNGs + dataset link | Mirrors stata_rct deliverables |
| 10 | Date = `2026-04-29` (today) | Per CLAUDE.md current date |
| 11 | **No intermediate skill confirmations**: each downstream skill consumes the locked scope below | Per user's instruction |
| 12 | Save this plan as `content/post/stata_matching/plan.md` during execution (the project convention from stata_rct) | Matches existing convention |

---

## Stata execution environment

- **Binary:** `/Applications/Stata 18.5/StataMP.app/Contents/MacOS/stata-mp`
- **Batch command:** `"/Applications/Stata 18.5/StataMP.app/Contents/MacOS/stata-mp" -b do analysis.do`
- **Set seed:** `set seed 42` at top of script (NNM/PSM use random tie-breaking)
- **Required user packages:** `coefplot` (for the forest plot of all six estimates) — install via `capture ssc install coefplot, replace` at top of script
- **Working directory for execution:** `/Users/carlos/GitHub/starter-academic-v501/content/post/stata_matching/`

---

## Final post outline (locked) — `index.md`

### Front matter (YAML)

```yaml
authors: [admin]
categories: [Stata, Causal Inference, Treatment Effects, Matching, Propensity Score]
draft: false
featured: false
date: "2026-04-29T00:00:00Z"
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
    name: "Dataset (.dta)"
    url: https://github.com/quarcs-lab/data-open/raw/master/ametrics/cattaneo2.dta
  - icon: file-alt
    icon_pack: fas
    name: "Stata log"
    url: analysis.log
summary: A beginner-friendly walk-through of six treatment-effects estimators in Stata — regression adjustment, IPW, IPWRA, AIPW, nearest-neighbor matching, and propensity-score matching — applied to the classic maternal-smoking and birth-weight case study.
tags: [stata, causal, causal inference, matching, propensity score, teffects, treatment effects]
title: "Treatment Effects in Stata: A Beginner's Tour of Six Estimators with the Maternal Smoking and Birth Weight Case Study"
toc: true
diagram: true
---
```

### Section structure (H2 / H3) — locked

1. **Overview** (~3 paragraphs + 8 learning objectives)
2. **The Case Study: Maternal Smoking and Birth Weight** (Mermaid diagram of the question + variables table)
3. **The Potential Outcomes Framework** (definitions, ATE/ATT, fundamental problem, SUTVA)
   - 3.1 The two potential outcomes
   - 3.2 ATE vs. ATT — what's the difference?
   - 3.3 Why a naive comparison fails — confounding
4. **The Identification Assumptions** (conditional independence / unconfoundedness, overlap, SUTVA — clearly stated and explained)
5. **Data Loading and Exploration** (`use`, `describe`, `summarize`, `tab`, naive `regress`/`ttest` to show biased gap)
6. **A Roadmap to Six Estimators** (Mermaid taxonomy: outcome models / treatment models / both / matching)
7. **Method 1 — Regression Adjustment (RA)**
   - Purpose & analogy
   - Equation: $\hat{\tau}_{RA}$ formula
   - `teffects ra` for POMs, ATE, ATT
   - Manual recreation block (regress for D=0, regress for D=1, predict potential outcomes, average difference)
   - Interpretation
8. **Method 2 — Inverse-Probability Weighting (IPW)**
   - Purpose & analogy ("re-weighting to look like a randomized sample")
   - Equation: propensity score $e(X) = \Pr(D=1 \mid X)$, IPW estimator
   - `teffects ipw` for POMs, ATE, ATT
   - Manual recreation block (logit, predict ps, generate weights, weighted regression)
   - Interpretation + caveat (extreme weights)
9. **Method 3 — Inverse-Probability-Weighted Regression Adjustment (IPWRA)**
   - Purpose: doubly robust
   - Equation
   - `teffects ipwra` for POMs, ATE, ATT
   - Interpretation: what "doubly robust" buys you
10. **Method 4 — Augmented Inverse-Probability Weighting (AIPW)**
    - Purpose: efficient & doubly robust
    - Equation: AIPW influence function form
    - `teffects aipw`
    - Note: ATE only (Stata's implementation); brief explanation
    - Interpretation
11. **Method 5 — Nearest-Neighbor Matching (NNM)**
    - Purpose & analogy ("find statistical twins")
    - Equation: matching estimator
    - `teffects nnmatch` with `ematch()` and `biasadj()` — explain each option
    - Interpretation
12. **Method 6 — Propensity-Score Matching (PSM)**
    - Purpose & visualization (PSM scatterplot — Figure 4)
    - Equation: propensity-score matching estimator
    - `teffects psmatch` with overlap check (`teffects overlap` — Figure 5)
    - Interpretation
13. **Comparing All Six Estimators** (`estimates table` + `coefplot` forest plot — Figure 6 — with the naive estimate as a reference line)
    - When do they agree? When do they disagree? What does that tell us?
14. **Summary and Key Takeaways** (8 methodological lessons)
15. **Limitations and Next Steps** (unmeasured confounders, sensitivity analysis, machine-learning extensions like Double ML)
16. **Exercises** (6 exercises — vary covariates, compute ATT vs. ATE, swap probit/logit, robustness checks)
17. **References** (Cattaneo 2010, Imbens & Rubin 2015, Wooldridge 2010, Stata `teffects` documentation, Carlos's video links)

---

## Figures (locked, 5 total)

| # | Filename | What it shows | Stata command sketch |
|---|---|---|---|
| 1 | `stata_matching_density_bweight.png` | Kernel density of `bweight` by `mbsmoke` (raw, descriptive) — visual hook for the bias | `twoway (kdensity bweight if mbsmoke==0) (kdensity bweight if mbsmoke==1)` |
| 2 | `stata_matching_propensity_distribution.png` | Histogram of estimated propensity scores by treatment status | `logit mbsmoke ...; predict ps; twoway (histogram ps if mbsmoke==0) (histogram ps if mbsmoke==1)` |
| 3 | `stata_matching_psm_logic.png` | The "match a smoker with one or more nonsmokers" annotated scatter (from reference material) | `twoway (scatter mbsmoke ps) (pcarrowi ...)` (per reference material) |
| 4 | `stata_matching_overlap.png` | `teffects overlap` plot after `teffects psmatch` — diagnostic of overlap assumption | `teffects overlap` after `teffects psmatch` |
| 5 | `stata_matching_forest_plot.png` | Forest plot of all 6 ATE estimates + naive baseline with 95% CIs | `coefplot te_ra te_ipw te_ipwra te_aipw te_nnmatch te_psmatch, ...` |

All figures: 300 dpi, site palette, light theme, descriptive titles in figure caption, alt text in `index.md`.

---

## Mermaid diagrams (locked, 3 total)

1. **Diagram 1 — Potential Outcomes & the Fundamental Problem** (Section 3.1): box for each infant showing Y(1) and Y(0), one observed (solid) and one counterfactual (dashed), arrow to "missing data" question.
2. **Diagram 2 — Six-Method Taxonomy** (Section 6): tree showing Outcome Model (RA) / Treatment Model (IPW, PSM) / Both (IPWRA, AIPW) / Direct Matching (NNM), color-coded by family.
3. **Diagram 3 — How PSM Works** (Section 12, before code): smoker → propensity score → nearest non-smoker(s) → matched comparison.

All Mermaid diagrams use the four-color palette and explicit `linkStyle`/`style` directives.

---

## Key equations (locked, 8+) — with variable definitions

1. **Treatment effect** for individual $i$: $\tau_i = Y_i(1) - Y_i(0)$
2. **ATE**: $\tau_{ATE} = E[Y(1) - Y(0)]$
3. **ATT**: $\tau_{ATT} = E[Y(1) - Y(0) \mid D = 1]$
4. **Conditional independence (unconfoundedness)**: $\{Y(0), Y(1)\} \perp D \mid X$
5. **Overlap**: $0 < e(X) < 1$, where $e(X) = \Pr(D = 1 \mid X)$
6. **Regression adjustment estimator**: $\hat\tau_{RA} = \frac{1}{n}\sum_{i=1}^{n}[\hat\mu_1(X_i) - \hat\mu_0(X_i)]$ where $\hat\mu_d(X) = E[Y \mid D=d, X]$
7. **IPW estimator**: $\hat\tau_{IPW} = \frac{1}{n}\sum_i \left[\frac{D_i Y_i}{\hat e(X_i)} - \frac{(1-D_i) Y_i}{1-\hat e(X_i)}\right]$
8. **AIPW (doubly robust) estimator**: $\hat\tau_{AIPW} = \frac{1}{n}\sum_i \left\{[\hat\mu_1(X_i) - \hat\mu_0(X_i)] + \frac{D_i [Y_i - \hat\mu_1(X_i)]}{\hat e(X_i)} - \frac{(1-D_i)[Y_i - \hat\mu_0(X_i)]}{1 - \hat e(X_i)}\right\}$
9. **Matching estimator (NNM)**: $\hat\tau_{NNM} = \frac{1}{n}\sum_i (2D_i - 1)\left[Y_i - \frac{1}{M}\sum_{j \in J_M(i)} Y_j\right]$ where $J_M(i)$ is the set of $M$ nearest neighbors of $i$ in the opposite group.

Every equation will be followed by a "**Read it like this:**" plain-language sentence and a variable list.

---

## Critical files to be created (in execution order)

| Stage | File | Created by |
|---|---|---|
| 0 | `content/post/stata_matching/plan.md` | Copy of this plan (saved as project convention) |
| 1a | `content/post/stata_matching/analysis.do` | `/write-script` |
| 1b | `content/post/stata_matching/analysis.log` (Stata batch log) | `/write-script` (executed) |
| 1c | `content/post/stata_matching/execution_log.txt` (alias) | `/write-script` |
| 1d | 5 PNGs (filenames above) | `/write-script` (executed) |
| 1e | `content/post/stata_matching/script-review.md` | `/review-script` |
| 2a | `content/post/stata_matching/results_report.md` | `/write-results-report` |
| 2b | `content/post/stata_matching/results_report_review.md` | `/review-results-report` |
| 3a | `content/post/stata_matching/index.md` | `/write-post` |
| 3b | Inline review report | `/review-post` |
| 4a | `content/post/stata_matching/infographic_instructions.md` | `/write-infographic` |
| 4b | Inline review report | `/review-infographic` |

The user must already have the dataset accessible (it is in `references/[ ] Case study Maternal smoking and birth weight/cattaneo2.dta`); the script will load from the GitHub URL but fall back to the local copy if needed.

---

## Pipeline execution plan

After plan approval, **each skill is executed with the scope pre-locked from this plan**. No mid-pipeline confirmation prompts. If a downstream skill encounters a hard blocker (e.g., Stata fails to compile, a method's CI is wildly inconsistent with the reference benchmark), the pipeline halts and reports the issue — but otherwise it runs end-to-end.

### Step 1 — `/write-script`
- **Topic:** "treatment effects estimators (RA, IPW, IPWRA, AIPW, NNM, PSM)"
- **Dataset:** `cattaneo2.dta` from `https://github.com/quarcs-lab/data-open/raw/master/ametrics/cattaneo2.dta`
- **Language:** Stata
- **References:** `content/post/stata_matching/references/[ ] Case study Maternal smoking and birth weight 250a08da773f809ebfc1fee88f5be67c.md` and `Slides.pdf`
- **Theme:** light
- Produces: `analysis.do`, executes via `stata-mp -b`, generates 5 PNGs + `analysis.log`

### Step 2 — `/review-script stata_matching`
- 8-dimension review of the script. Re-runs the .do file. If `MAJOR REVISION`: stop and surface to user.

### Step 3 — `/write-results-report stata_matching`
- Re-executes the script, writes `results_report.md` with ≥5 key findings and ≥5 interpretation paragraphs, every number cross-checked against `analysis.log`.

### Step 4 — `/review-results-report stata_matching`
- 6-dimension review of the report. If `MAJOR REVISION`: stop.

### Step 5 — `/write-post stata_matching`
- Mode A (consume existing script + results_report). Writes `index.md` with the full structure above. Sandwich pattern enforced; ≥8 interpretation paragraphs; ≥3 figures; ≥2 (we'll have 8+) display-math equations; LaTeX escaped with `\\` per site convention.

### Step 6 — `/review-post stata_matching`
- 12-dimension review. If `MAJOR REVISION`: stop.

### Step 7 — `/write-infographic stata_matching`
- Causal-template, 3×2 panel grid, chalkboard style. Six panels: (1) The Question, (2) The Confounding Problem, (3) Six Estimators, (4) Forest Plot Comparison (best/headline estimate in teal), (5) Overlap & Balance, (6) Key Takeaways.

### Step 8 — `/review-infographic stata_matching`
- 7-dimension review. Cross-check every number vs. `index.md`.

### Final hand-off
Concise report listing every file produced, each review verdict, and the headline estimate (e.g., "ATE = −XXX grams [95% CI: −YYY, −ZZZ] from AIPW; six methods agree within ±20g").

---

## Verification (how I'll know the pipeline succeeded)

End-to-end checks:

1. **Build the site locally**: `"$HOME/Library/Application Support/Hugo/0.84.2/hugo" server --disableFastRender` and visit `http://localhost:1313/post/stata_matching/` — confirm the post renders, all 5 PNGs display, all Mermaid diagrams render, all LaTeX equations render, the TOC appears on the left, and links to the .do file / dataset / log resolve.
2. **Run `analysis.do` from scratch**: `cd content/post/stata_matching && "/Applications/Stata 18.5/StataMP.app/Contents/MacOS/stata-mp" -b do analysis.do` — exit code 0; all 5 PNGs regenerated; all 6 `estimates store te_*` entries populate the final `estimates table`.
3. **Numerical sanity**: every `teffects` estimate in `index.md` matches the latest `analysis.log`. The naive (unadjusted) gap is more negative than the adjusted estimates (i.e., adjusting moves the estimate toward zero — confounding inflated the apparent effect of smoking).
4. **All review skills return verdict ACCEPT or MINOR REVISION** (no MAJOR REVISIONs unaddressed).
5. **No emojis anywhere**, em dashes (`—`) not double hyphens, currency `\\$`, MathJax dollar-sign escapes correctly.

---

## Risks and mitigations

| Risk | Mitigation |
|---|---|
| Stata batch run fails (license / package issues) | First do an interactive sanity-run of the bare-minimum dataset load. `coefplot` install is wrapped in `capture` so re-runs don't error. |
| `teffects nnmatch` is slow on this dataset (~4,600 obs) | Acceptable — typically <30 s. If it takes >5 min, reduce M (default 1 NN) and document. |
| Overlap violations flagged by `teffects overlap` | Discuss this honestly in the post — overlap is a real assumption, and showing where it bites is pedagogically valuable. |
| AIPW supports ATE only (not ATT) in `teffects aipw` | Already handled — explicitly noted in Section 10 of the outline. |
| Six-method estimates may diverge | That's the point of the comparison section — divergence is interpretable, not a bug. |

---

## What I will NOT do

- Will not invent results or numbers — every number in the post comes from `analysis.log` after a clean run.
- Will not deviate from the locked figure list, Mermaid count, or section structure without flagging.
- Will not skip the review skills, even if the write skills look fine — the review pass catches numerical drift.
- Will not introduce additional methods (e.g., entropy balancing, Double ML, synthetic control) — they belong in a sequel post.

---

## Open question for the user (only one)

I picked the date as **2026-04-29** (today). If you'd prefer a different date for the post (e.g., a future-dated post that uses Netlify's `--buildFuture` flag), say the word and I'll lock it in. Otherwise I'll proceed with today's date.

---

**On approval, I will execute steps 1–8 sequentially without further prompting and report back at the end.**
