# Batch `/project:write-app` Run — 2026-05-22

Scope: 54 eligible tutorial posts (23 Python + 12 R + 19 Stata).
`r_double_lasso` excluded (already has an app).
Mode: autonomous (agents self-answer interview questions), `--no-verify`, no commit.

## Results

| Slug | Language | Status | Widgets picked | Takeaways | Note |
|------|----------|--------|----------------|-----------|------|
| python_EconML | Python | DONE | concept-animation, penalty-slider, dgp-simulator, forest-plot | 3 | Baked from execution_log + ate-table.csv; added GATE-by-exec-constraints panel; 8/8 smoke |
| python_cml | Python | DONE | concept-animation, forest-plot, dgp-simulator, gate-bars+welfare-bars | 3 | Pattern A; 4 tabs (intro/ATE forest/confounding sim/GATE+policy); custom charts; 8/8 smoke |
| python_did | Python | DONE | concept-animation, dgp-simulator, forest-plot, honest-did-custom | 3 | 4 tabs (intro+DiD sim+forest+HonestDiD); 8/8 smoke |
| python_did101 | Python | DONE | concept-animation, dgp-simulator, forest-plot, event-study | 3 | 4 tabs (intro/parallel-trends, 2x2 sim 100-MC, forest 4 specs+4 SE, event-study coef plot); 8/8 smoke |
| python_doubleml | Python | DONE | concept-animation, penalty-slider, dgp-simulator, forest-plot | 3 | Pattern A; 4 post estimates baked (DML-RF, DML-LASSO + 95% CIs; OLS no SEs); 8/8 smoke |
| python_doubleml_pension | Python | DONE | concept-animation, penalty-slider, dgp-simulator, forest-plot | 3 | Pattern A; 14 estimates baked (ATE eligibility, LATE participation); 8/8 smoke |
| python_dowhy | Python | DONE | concept-animation, dgp-simulator, forest-plot, refutation-bars | 3 | DoWhy 4-tab Lalonde NSW; DAG anim, confounder lab 100-MC, 6-estimator forest, refutation bars; custom charts; 8/8 smoke |
| python_dowhy_intro | Python | DONE | confounder-dag-animation, estimate-forest, confounding-simulator, refutation-lab | 3 | Real-data forest from estimation_results.csv (true ATE=1.0, 5 methods); WFH backdoor OLS + Wald IV; 8/8 smoke |
| python_esda2 | Python | DONE | concept-animation, moran-scatter-lab, lisa-explorer, forest-plot | 3 | Custom Moran scatter+LISA bars; spatial DGP (Neumann series on lattice); 9 Moran's I estimates baked; 8/8 smoke |
| python_fe_kuznets | Python | DONE | panel-animation, dgp-simulator-panel, turning-point-explorer, forest-plot | 3 | Custom OLS+TWFE solver; Pattern-A from kuznets_determinants_results.csv; 8/8 smoke |
| python_fwl | Python | DONE | concept-animation, dgp-simulator, forest-plot, MC-histograms | 3 | All READY; Pattern-A baked (6 estimators, true alpha=0.20); 8/8 smoke (103ms) |
| python_iv | Python | DONE | concept-animation, instrument-strength-slider, dgp-simulator, forest-plot | 3 | 14 estimates from tab2/4/5/6/7/8 CSVs; custom IV DAG + ols_vs_iv chart + histograms; inline IV DGP in app.js; 8/8 smoke |
| python_mgwr | Python | DONE | concept-animation, penalty-slider, dgp-simulator, forest-plot | 3 | Bandwidth/local-vs-global pedagogy reuse of LASSO modules; Indonesia OLS-vs-MGWR baked (β, R², AICc); 8/8 smoke |
| python_mgwrfer | Python | DONE | concept-animation, penalty-slider, dgp-simulator, forest-plot | 3 | Pattern-A from model_comparison.csv + global_models_comparison.csv; LASSO templates relabelled PMGWR-vs-MGWFER; 8/8 smoke |
| python_ml_random_forest | Python | DONE | concept-animation, sparsity-lab, rf-vs-linear-showdown, forest-plot | 3 | Baseline-vs-tuned RF metrics + top-20 permutation+MDI importance; 8/8 smoke |
| python_panel_intro | Python | DONE | within-animation, panel-dgp-simulator, seven-method-forest, hausman-mundlak-explorer | 3 | 7 estimators × 5 outcomes baked; Hausman chi-square explorer snap-to-post; 8/8 smoke |
| python_panel_ses | Python | DONE | concept-animation, forest-plot, rejection-bars, dgp-simulator | 3 | 8 SE estimates + 6 MC rejection rates; custom inline forest renderer; 8/8 smoke |
| python_partial_identification | Python | DONE | bounds-widening, bounds-forest, confounding-simulator, sample-size-sensitivity | 3 | Manski/Autobound/Entropy for ATE + Tian-Pearl/Autobound/Entropy for PNS; Tab 3 live binary-confounder DGP; 8/8 smoke |
| python_pca | Python | DONE | concept-animation, dgp-simulator, country-bars, loadings-bars+scree | 3 | Rotation anim, correlation/noise sim with 100-MC, 50-country rankings from health_index_results.csv, loadings & scree; 8/8 smoke |
| python_pca2 | Python | DONE | concept-animation, dgp-simulator, forest-plot, validation-bars | 3 | Pooled-PCA 4 tabs (Why Pooled, Simulator, Weight Comparison, SHDI Validation); 3x3 PCA via power iteration; 8/8 smoke |
| python_pyfixest | Python | DONE | concept-animation, dgp-simulator, forest-plot, clustered-se-explorer | 3 | panel_intro template adapted; within anim pooled 0.183→FE 0.078; SE table from §8; §11 Mincer forest; 8/8 smoke |
| python_sc_co2tax | Python | DONE | concept-animation, sc-path-gap, sc-placebo-distribution, sc-method-forest | 5 | Pattern A; 6-donor weights, placebo MSPE bars, 9-method forest, carbon-tax-vs-VAT wedge; 6 custom SC chart builders; 8/8 smoke |
| python_scpi | Python | DONE | concept-animation, scpi-trajectory, scpi-gap-simulator, scpi-method-forest | 3 | 6 donor weights, 13-yr trajectory, 8 forest estimates, 4 sensitivity rows, 4 method-comparison rows; 8/8 smoke |
| r_SDPDmod | R | DONE | concept-animation, spatial-dynamic-panel-DGP, forest-effect-decomposition, multiplier-explorer | 3 | Static SDM + dyn short/long-run for logp+logy; (I-ρW)^-1 ring anim; N=12 ring 100-MC; impulse-response; 8/8 smoke |
| r_basic_synthetic_control | R | DONE | donor-weight-anim, donor-bars, paths-chart (actual-vs-synth gap), placebo-chart | 3 | Sparse 85/15 recipe, ATT -0.58 avg / -1.04 peak 1989, placebo rank 2/8 trimmed; 8/8 smoke |
| r_bma_lasso_wals | R | DONE | concept-animation, penalty-slider, dgp-simulator, forest-plot | 3 | Pattern A §17 grand table; 12 vars × 4 methods (BMA/LASSO/Post-LASSO/WALS); 8/8 smoke |
| r_causalpolicy_workshop | R | DONE | concept-animation, dgp-simulator, forest-plot, bias-variance-lab | 3 | Pattern A 7-method cross-method CSV baked; custom D3 widgets for tabs 1/2/4; 8/8 smoke |
| r_demeaning_twfe | R | DONE | concept-animation, LASSO-path-dgp, forest-plot, alpha-compare-histograms | 3 | 4 tabs (Intro/Demeaning Lab/FWL Showdown/Forest); 11 estimates baked from coefficient_comparison+se_comparison; 8/8 smoke |
| r_did | R | DONE | parallel-trends-anim, parallel-trends-lab, did-2x2-simulator, forest+event-study+honestdid | 3 | 4 tabs; 100-sim TWFE-vs-CS histogram; TWFE -0.038, DR -0.065, M̄≈0.67 baked; 8/8 smoke |
| r_did2 | R | DONE | parallel-trends-animation, weighting-dgp-simulator, did-forest-plot, gxt-event-study | 3 | 14 forest + 16 event-study + 4 by-cohort + 10 HonestDiD rows baked; 8/8 smoke (97 ms) |
| r_did_ring | R | DONE | three-numbers-hero, ringchoice-slider, ring-DGP-simulator, forest+binsreg-step | 3 | Cutoff slider 0.05-0.15 mi showing 52% wobble; exponential τ(d) sim; 6-method forest + 23-bin step curve; 8/8 smoke |
| r_dynamic_bma | R | DONE | concept-animation, pip-forest, prior-lab, jointness-heatmap | 3 | 4 tabs; PIPs from 4 priors × 9 vars + 36-pair jointness matrix; custom BMA charts; 8/8 smoke |
| r_dynamic_bma2 | R | DONE* | concept-animation, forest-plot, prior-sensitivity, jointness-heatmap | 3 | **index.md absent** — YAML link NOT injected (no-link mode); v1 web_app reused as base (numerically identical PIPs from bdsm precomputed model space); 8/8 smoke |
| r_fwlplot | R | DONE | fwl_animation, fwl-confounding-lab, forest-plot, within-panel-scatter | 3 | 4 tabs; store-DGP confounding sim w/ 100-sim hist; forest across store/flights/wages; raw-vs-within toggle; 8/8 smoke |
| r_sc_bayes_spatial | R | DONE | concept-animation (simplex_vs_horseshoe), donor-weights, spillover-bars+trajectory, stage-forest | 3 | 5 CSVs baked (att_comparison, stage1_weights, stage2_alpha, spillovers, rho_posterior); custom SC + simplex↔horseshoe charts; 8/8 smoke |
| stata_bma_dsl | Stata | DONE | concept-animation, dgp-simulator, forest-plot, pip-chart | 3 | 21 forest rows (7 methods × 3 GDP coefs) + 15 FE/pooled PIPs; pip_chart extension; 8/8 smoke |
| stata_cate | Stata | DONE | heterogeneity-anim, CATE-DGP, GATE/GATES forest, IATE explorer | 3 | 9,913-household IATE; 60-bin histogram, 800-pt scatter, GATE incomecat, GATES quartile, age/educ/income binned; 5 custom builders; 8/8 smoke |
| stata_cate2 | Stata | DONE | concept-animation, GATE-explorer, resource-curse-DGP, forest-plot | 3 | 8 outcomes × 4 methods; 5 GATE panels; χ² tests; subpop ATEs; 8/8 smoke |
| stata_convergence | Stata | DONE | concept-animation, solow-dgp-simulator, rolling-beta-line, sigma-evolution-line | 3 | 4-tab; Solow sim + 2 real-data line charts baked; 8/8 smoke |
| stata_convergence2 | Stata | DONE | mean-reversion-animation, beta-trend-explorer, ovb-simulator, forest-plot | 3 | β-trend, σ, quartile growth, conditional convergence, decade β, Polity-2 OVB; 100-sim MC δ·λ draws; 8/8 smoke |
| stata_did | Stata | DONE | concept-animation, parallel-trends-lab, DiD-vs-ITS, forest+event-study | 3 | 2-period parallel-trends viz GPA scale; DiD-vs-ITS sim showing 10.88-pt secular-trend; 5-estimator forest at 25.32; 8/8 smoke |
| stata_dynamic_panel | Stata | DONE | nickell-bias-anim, AR1-FE-vs-AB-DGP, forest-plot, diagnostics+longrun | 3 | Pattern-A regression_results+longrun_effects+diagnostics; AR(1) sim OLS/FE/AB; 8/8 smoke |
| stata_fwl | Stata | DONE | fog-lift-animation, dgp-simulator, forest-plot, within-panel-FE | 3 | Stata flight coefficients (-0.005/-0.008/-0.032); panel FE toggle; scatterfit/reghdfe glossary; 8/8 smoke |
| stata_honestdid | Stata | DONE | concept-animation, m-slider, dgp-simulator, breakdown-forest | 3 | 34 rows (Δᴿᴹ grids + Δˢᴰ + event study); 4-tab M-slider w/ RM+SD breakdown; 8/8 smoke (98 ms) |
| stata_iv | Stata | DONE | IV-DAG-anim, first-stage-scatter-lab, OLS-vs-IV showdown, 12-spec forest | 3 | Custom IV DGP; OLS 0.522 baseline + 11 IV variants w/ first-stage F tooltips; 8/8 smoke |
| stata_iv_panel | Stata | DONE | iv-path-anim, first-stage-scatter, iv-ols-vs-2sls, iv-forest | 3 | 8 OLS/2SLS + reduced-form + first-stage + Hansen J baked; 4 new chart builders; 8/8 smoke (99 ms) |
| stata_matching | Stata | DONE | concept-animation, confounding-overlap-lab, NAIVE-RA-IPW-AIPW, 7-estimator forest | 3 | L1/L2 anim+glossary; overlap hist w/ γ/δ sliders; 100-MC; ATE/ATT toggle; 8/8 smoke |
| stata_panel_lasso_cluster | Stata | DONE | concept-animation, penalty-slider, dgp-simulator, forest-plot | 3 | Pattern-A C-LASSO G1/G2 vs Pooled FE for democracy (+2.151/-0.936 vs +1.055) + savings CPI; 8/8 smoke |
| stata_rct | Stata | DONE | randomization-anim, balance-plot, variance-anim, RA/IPW/DR/AIPW sim, 12-method forest | 3 | Custom RCT DGP + IRLS logistic + Gaussian-OLS/WLS + AIPW in app.js; 100-sim hist; 8/8 smoke |
| stata_rd | Stata | DONE | rd-jump-anim, rd-simulator-scatter, bandwidth-sweep, robustness-forest | 3 | 4-tab (Intro/Simulator/BW Lab/Forest); 22 forest rows baked; 4-panel forest (parametric, BW, kernel, placebos); 8/8 smoke |
| stata_sc | Stata | DONE | concept-animation (donor-weights), donor-weights-bar, paths-chart, placebo-chart | 3 | California Prop99 ATT -19.0 avg / -26.4 peak 1999 (p=0.026/0.050); modeled on r_basic_synthetic_control; 8/8 smoke |
| stata_sp_regression_cross_section | Stata | DONE | concept-animation, spillover-multiplier-grid, SAR/SEM/SDM-sim, direct/indirect/total forest | 3 | Pattern A 48 estimates (8 models × 2 regressors × 3 effects); §9.2 + model_summary + diagnostics; 8/8 smoke |
| stata_sp_regression_panel | Stata | DONE | concept-animation, cross-border-spillover-lattice, dynamic-SDM-sim, direct/indirect/total forest | 3 | 7×7 lattice w/ ρ slider 0-0.95; profile-LL grid estimation; 8 models direct/indirect/total + 48 rows + 3 Wald + diagnostics; 8/8 smoke (103 ms) |
| stata_spxtivdfreg | Stata | DONE | concept-animation, defactored-IV-sim, forest-plot, long-run-multipliers | 3 | Factor-omission bias on ψ̂; spatial-panel DGP 100-sim hist; 4 models forest + Hansen J p-value bars; 28 estimates from analysis.log; 8/8 smoke |

## Totals

**54 DONE / 0 SKIP / 0 ERROR out of 54**

Caveats:

1. **`r_dynamic_bma2`** has no `index.md` — the post folder contains analysis.R + results CSVs + a results_report.md + a web_app/ but is not yet a published Hugo post. YAML link cannot be injected until the post is created.
2. **`r_causalpolicy_workshop`** — agent reported DONE but missed the YAML link injection. Fixed manually after the batch (link added at top of `links:` array).

Final state: 54/54 web_app folders exist; 53/54 with YAML links injected (the 1 exception is `r_dynamic_bma2`, awaiting its `index.md`).

## Coverage

- **Python:** 23/23 DONE
- **R:** 12/12 DONE (1 with no YAML link due to missing index.md)
- **Stata:** 19/19 DONE
- **Skipped (already had app):** `r_double_lasso` (1)
- **Total content/post/*/web_app/ folders expected:** 55
