# Script Review: r_double_lasso

**Script:** `analysis.R` (679 lines)
**Language:** R 4.5.2
**Executed:** 2026-05-21 09:04 (fresh `Rscript` in a temp directory, `BASE_URL` left at the live GitHub raw URL)
**Status:** All code runs; exit code 0; 88 s wall time; no warnings.

## Verdict: **MINOR REVISION**

The script is statistically correct, runs end-to-end against the now-live GitHub
raw URLs, and replicates the paper's Table 2 headline numbers (violent-crime DL
rigorous: −0.0964 vs paper −0.104; First-diff: −0.1521 vs −0.152; OLS-full
point: 0.0135 vs 0.014). It is also well-structured, has a real docstring, and
uses the site's dark palette correctly. What holds it back from ACCEPT is
pedagogical depth: a graduate student in econometrics encountering Double LASSO
for the first time would walk away knowing *what* was computed but not *why*
several of the key tricks work. Eight MEDIUM-severity pedagogy issues should
be addressed; no HIGH issues found.

## Execution Results

| Metric | Value |
|---|---|
| Exit code | 0 |
| Wall time | 88 s (`81.5s user + 3.5s system`) |
| Figures generated | 4 PNGs (estimates, selection, paths, methods_compare) |
| CSV tables generated | 2 (results_table2.csv, selection_diagnostic.csv) |
| Warnings | None |
| Replication match (violent crime, point estimates) | First-diff −0.1521 (paper −0.152), OLS-full +0.0135 (0.014), PSL −0.1567 (−0.155), DL-rigorous −0.0964 (−0.104), DL-CV +0.0193 |
| Replication match (DL violent-crime selection) | \|I\_y\|=0, \|I\_d\|=8, union=8 — **exact match to paper** |
| End-to-end replicability | Confirmed: fresh tempdir run from GitHub raw URLs produced identical numbers |

## Issues Found

| # | Dimension | Severity | Location | Issue | Suggested fix |
|---|---|---|---|---|---|
| 1 | Code quality | MEDIUM | line 374 | Comment claims "10-fold CV" but `dl_cv_fit` uses `nfolds = 3` (line 387). Factually wrong comment. | Change "10-fold CV" → "3-fold CV (paper footnote 2)" to match the actual setting. |
| 2 | Pedagogy | MEDIUM | lines 1–46 (header) | Docstring states *what* the paper does but never motivates Double LASSO. A reader new to high-dimensional inference doesn't see *why* OLS fails or *why* a single LASSO isn't enough. | Add a 6–10-line "What is Double LASSO and why?" subsection to the header: explain the high-dimensional inference problem (p~n, many controls, regularisation bias on the treatment if a single LASSO drops controls correlated with d) and the three-step fix. |
| 3 | Pedagogy | MEDIUM | line 290 | The `penalty.factor = c(0, rep(1, ncol(X)))` trick is the heart of PSL; the inline comment ("do not penalise d") describes the effect but not the mechanism (a zero entry means the variable enters with zero shrinkage, equivalent to "forced in"). | Add a 2-line note: `penalty.factor` is a per-variable multiplier on lambda. Setting it to 0 for d makes d's effective penalty zero so d is never shrunk; the LASSO uses its capacity for selecting controls only. |
| 4 | Statistical correctness | MEDIUM | lines 348–349 vs 389–390 | `rlasso` uses `intercept = FALSE` (with a one-sentence justification); `cv.glmnet` in `dl_cv_fit` uses `intercept = TRUE` for the same partialled data. The asymmetry is undocumented and looks like an inconsistency. | Add a one-line comment at the `cv.glmnet` call explaining the choice: `intercept = TRUE` is glmnet's default and is harmless on partialled (mean ≈ 0) data because the fitted intercept will be ≈ 0; rlasso's penalty derivation, by contrast, assumes no intercept and is sensitive to the choice. |
| 5 | Pedagogy / Stat correctness | MEDIUM | lines 271–311 (PSL), 314–369 (DL rigorous), 372–420 (DL CV) | The script computes "LASSO selects, then OLS estimates" but never says *why* the post-OLS step exists. LASSO shrinks selected coefficients toward zero (bias). The post-OLS refit removes shrinkage on the selected support — that's the whole point. | Add a 3-line comment before `psl_fit` (or near the post-OLS step): "Post-OLS, not LASSO coefficients. LASSO is used here for selection only; its shrinkage would bias the treatment estimate. Refitting with plain OLS on the selected variables gives an unshrunk, identified estimate of α." |
| 6 | Causal inference | MEDIUM | nowhere | The script never explicitly states the estimand. This is observational causal inference, identified under conditional-independence given the 284 controls (after first-differencing absorbs state fixed effects). | Add a 3–5-line comment block before section 4 stating: α is the average partial effect of the (first-differenced) effective abortion rate on (first-differenced) crime, identified under (a) the conditional-independence-given-X assumption — i.e. the 284 partialled controls absorb confounders — and (b) the parallel-trends assumption that first-differencing soaks up state fixed effects. State + year fixed effects are absorbed by the FD and the partialling step respectively. |
| 7 | Pedagogy | MEDIUM | lines 113, 235, 255, 282, 328, 379, 426, 479, 644 (all `cat()` section headers) | The execution log narrates labels only ("4. FIRST-DIFFERENCE OLS"). A reader who only opens `execution_log.txt` gets numbers without the story. The script is the only narration. | Rewrite each `cat()` header into 1–2 narrative sentences: "STEP 1 — FIRST-DIFFERENCE OLS. The original Donohue–Levitt 2001 spec: regress differenced crime on differenced abortion with no controls. Treat this as the no-controls baseline." Do the same for every section. |
| 8 | Pedagogy / Math | MEDIUM | lines 314–325 | The DL three-step section names the steps but never shows the paper's reduced-form equations that *justify* this exact construction (y = x'π + r_c + ε and d = x'θ_d + r_d + v from Belloni et al. 2014, eqs 3–4 in the paper). Without the equations, "Step 1: LASSO of y on X" reads like a recipe rather than the consequence of a derivation. | Add a 4–6-line ASCII-math block before the three-step listing: write out the two reduced-form equations, then one sentence on why their union of selected controls gives an unbiased estimate of α (the Frisch–Waugh–Lovell / partial-out argument). |
| 9 | Pedagogy | LOW | line 282 (section 6 header) | "POST-STRUCTURAL LASSO (PSL)" is the section title but the term is only fully spelled out in the docstring (line 27). A skim-reader who jumped to section 6 doesn't see the expansion. | Add "(Post-Structural LASSO)" inline at first body-text use, or in the section subtitle. |
| 10 | Pedagogy / Math | LOW | lines 182–188 | The cluster-SE formula is correctly written out but the canonical terminology ("sandwich estimator", "bread" = (X'X)⁻¹, "meat" = Σ X\_g'e\_g e\_g'X\_g) is not used. A reader who later searches for "cluster-robust standard errors" will encounter that vocabulary everywhere. | Add the three terms inline ("bread × meat × bread, hence 'sandwich estimator'") so the formula matches the standard textbook language (e.g. Cameron & Miller 2015 *J. Hum. Resour.*). |
| 11 | Code quality | LOW | line 243 vs line 220 | Section 4 uses `lm.fit(cbind(o$d_raw), o$y_raw)` while `ols_fit` uses `lm(y ~ . - 1, data = df)`. Both produce the same residuals but the inconsistency invites the question "why?". | One-line note at line 243: `lm.fit` is the lower-level form that takes a design matrix directly; it's slightly faster than `lm()` with a formula. Either form is fine here. |
| 12 | Pedagogy | LOW | line 383 (DL-CV) and line 578 (paths fig) | `lambda.min` is used but the alternative `lambda.1se` is never mentioned. `lambda.1se` (the simplest model within one SE of the minimum) is what most CV tutorials recommend for parsimony. | One-line note: "we use lambda.min (MSE-minimising) per Fitzgerald et al. footnote 2; the more parsimonious lambda.1se would select fewer controls." |
| 13 | Pedagogy | LOW | line 319 | `I_y` and `I_d` introduced as "set of nonzero indices" without naming what they mean substantively. | One-line gloss on first use: "I\_y = the controls LASSO picks when predicting the outcome from controls only; I\_d = the controls LASSO picks when predicting the treatment from controls only. Their union is what the post-OLS will adjust for." |

## Positive Highlights

- **Docstring (lines 1–46) is genuinely excellent**: title, dataset description, panel structure (48 × 12 = 576 obs), method enumeration with one-line gloss for each, usage, outputs, three precise references with DOIs. Above average for the site's R posts.
- **Headline replication is honest and tight**: violent-crime point estimates within ≤ 0.01 of the paper across all four estimators; DL selection counts (\|I\_y\|=0, \|I\_d\|=8 for violent crime) match the paper *exactly*. The summary block (lines 660–666) honestly flags the SE divergence rather than papering over it.
- **Clean function abstraction**: `cluster_se()` (lines 189–210) and `ols_fit()` (lines 216–229) are reused by every estimator, so the cluster-robust calculation appears in one place; this is the DRY principle done well in a long script.
- **Data architecture is replicable**: `prepare_data.R` does the one-time `.mat` → CSV conversion; `analysis.R` loads only from GitHub raw URLs; the GitHub-URL pathway was verified end-to-end this review (88 s, exit 0, identical numbers in a tempdir).
- **DL three-step procedure is named, not buried**: lines 318–321 spell out "Step 1 / Step 2 / Step 3" and the union-of-supports — most working DL code in the wild buries this in a function with no commentary.
- **Partialled-vs-raw data distinction is documented** (lines 156–162) with the actual Frisch–Waugh–Lovell projection formula written out: `v - T (T'T)^{-1} T' v`. Many empirical replications leave this implicit; here it is named.
- **Figure conventions are correct**: site palette, dark theme via `theme_site()`, `dpi = 300`, `bg = DARK_BG` on `ggsave`, no `featured.png` generated. All four figures are well-styled and informative; the selection bar-chart in particular makes the rigorous-vs-CV difference visually obvious.
- **Reproducibility is solid**: `set.seed(20260520)` is set early and used consistently; data is loaded from a versioned URL on the user's own repo; no environment-dependent paths in the committed file (the local-override pattern is left as a comment only).

## Priority Action Items

1. **[MED]** Fix the stale "10-fold CV" comment at line 374 — it contradicts the actual `nfolds = 3` setting and will confuse a careful reader. (Issue #1)
2. **[MED]** Add a "What is Double LASSO and why?" preamble to the header — without this, the *motivation* for the whole script is missing for a reader who isn't already a high-dimensional-inference expert. (Issue #2)
3. **[MED]** State the estimand and the identifying assumptions once, in a comment block before section 4 — this is observational causal inference and the causal-inference dimension of the rubric requires it. (Issue #6)
4. **[MED]** Explain *why* post-OLS exists in PSL/DL (selection vs shrinkage) — currently the script assumes the reader already knows this. (Issue #5)
5. **[MED]** Decode the `penalty.factor` zero-pad trick (Issue #3) and the rigorous-vs-CV intercept asymmetry (Issue #4) — both are non-obvious R idioms that deserve one-line comments.
6. **[MED]** Rewrite the `cat()` section headers from labels into 1–2-sentence narration so `execution_log.txt` reads as a tutorial walkthrough, not a results dump. (Issue #7)
7. **[MED]** Add the paper's two reduced-form equations as ASCII-math comments before the DL three-step section (Issue #8) — this is the conceptual bridge between "two prediction problems" and "an unbiased causal estimate".
8. **[LOW]** Define PSL inline at section 6 (Issue #9), name the sandwich/bread/meat vocabulary at `cluster_se` (Issue #10), gloss `I_y`/`I_d` substantively (Issue #13), note the `lm.fit` vs `lm` choice (Issue #11), and acknowledge `lambda.min` vs `lambda.1se` (Issue #12). These are quick wins.

After fixes 1–7 land, the script should comfortably clear ACCEPT.
