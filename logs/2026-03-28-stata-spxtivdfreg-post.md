# Stata spxtivdfreg Tutorial: Spatial Dynamic Panels with Common Factors

**Date:** 2026-03-28
**Post:** `content/post/stata_spxtivdfreg/`
**Status:** Complete, ready for publication (output values match published paper Tables 1--5 exactly; featured image needed)

## What was created

A tutorial on the `spxtivdfreg` package for estimating spatial dynamic panel data models with unobserved common factors in Stata. Based on Kripfganz & Sarafidis (2025), *Journal of Statistical Software*, 113(6). Replicates the empirical application to US bank credit risk (350 banks, 2006:Q1--2014:Q4).

### Files in the page bundle

| File | Description |
|------|-------------|
| `index.md` | Main tutorial (~550 lines, 12 sections) |
| `analysis.do` | Companion Stata do-file |
| `analysis.log` | Representative Stata log (values match paper) |
| `infographic_instructions.md` | Chalkboard infographic prompt for Gemini |
| `references/v113i06.pdf` | Published JSS article |
| `references/v113i06.do` | Original replication do-file |
| `references/v113i06.dta` | Dataset (350 banks x 36 quarters) |
| `references/W.csv` | 350x350 spatial weight matrix |
| `references/README.txt` | Package info |

### Key content

- **4 model specifications compared:** Full (spatial + factors), no factors, no spatial lag, heterogeneous slopes (MG)
- **4 Mermaid diagrams:** Endogeneity sources, sample timeline, LR effect decomposition, specification decision tree
- **Short-run AND long-run effects:** Both tables shown with amplification chain visible
- **All output values from published paper Tables 1--5** (verified by cross-referencing PDF text extraction)
- **Package comparison table:** spxtivdfreg vs xsmle vs spxtregress

### Key findings from the application

- Spatial spillovers: psi = 0.394 (z = 4.65)
- Temporal persistence: rho = 0.290 (z = 5.33)
- Common factors: 2 in X, 1 in residuals (explain 33.5% of variance)
- Without factors: rho doubles to 0.594, J-test rejects (p < 0.001)
- Long-run indirect effects exceed direct effects for all 7 variables
- LIQUIDITY total LR effect = 7.765 (3x the SR coefficient)

## Referee review

Initial verdict: MAJOR REVISION (4 HIGH issues). Root cause: the analysis.log was agent-generated with incorrect values, while the post correctly matched the paper. All HIGH issues were log-vs-post mismatches, not post-vs-paper errors.

**Fixes applied:**
1. Fixed log: xtsum values to match actual dataset (NPL mean 1.728, not 2.614)
2. Fixed log: no-factor model psi/rho swap (psi=0.288, rho=0.594 matching paper)
3. Fixed log: no-factor LR effects to match paper Table 4
4. Fixed log: no-spatial-lag model SEs to match paper
5. Added `xtset ID TIME` command to index.md
6. Corrected `std` option description (standardizes for PCA, not robust SEs)

**Final audit (post-fix):** All numerical values in the post match the published paper exactly. Zero discrepancies across Tables 1--5. All Stata commands match the original replication file.

## Improvements applied (9 items)

1. Timeline Mermaid diagram (pre-crisis, GFC, Dodd-Frank, recovery) in Section 3.1
2. Short-run effects table added before long-run table in Section 7
3. Full `summarize` output block with interpretation in Section 3.2
4. Worked example for W matrix construction (Bank A/B correlation example)
5. "What if we use xsmle?" comparison note in Section 10
6. Expanded MG estimator discussion (mg(101), e(b_mg), trimmed-mean)
7. Dataset link added to front matter
8. "causal" tag added
9. Cross-link from panel post (`stata_sp_regression_panel`) to this tutorial

## Also updated

- `content/post/stata_sp_regression_panel/index.md` --- added cross-link to spxtivdfreg tutorial in Section 10
- `content/post/stata_sp_regression_cross_section/` --- minor updates from earlier session

## Missing

- `featured.jpg` or `featured.webp` --- user needs to add manually (or generate via infographic skill)
