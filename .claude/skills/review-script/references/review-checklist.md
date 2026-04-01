# Script Review Checklist

> This file is part of the `review-script` skill. Read this file when
> performing the review.

## Review dimensions

### 1. Execution (highest priority)

- [ ] Script runs without errors (exit code 0)
- [ ] All expected figures are generated
- [ ] Printed output matches expected results
- [ ] No deprecation warnings or convergence issues
- [ ] Execution log is complete (final success message present)

### 2. Structure and organization

- [ ] Docstring/header present with title, description, usage, outputs, references
- [ ] Configuration block near the top (RANDOM_SEED, colors, data paths, column names)
- [ ] Section dividers separate logical sections
- [ ] Logical flow: data loading -> EDA -> baseline -> core method -> results -> validation
- [ ] No dead code or commented-out experiments

### 3. Code quality

- [ ] Variable names are descriptive and consistent
- [ ] Comments explain "why" not "what" (no `# increment i by 1`)
- [ ] No overly clever one-liners -- prefer clarity over brevity
- [ ] Functions are used for repeated logic (DRY)
- [ ] Imports are at the top, organized (stdlib, third-party, local)
- [ ] No unused imports

### 4. Reproducibility

- [ ] `RANDOM_SEED` set and used consistently
- [ ] Data is cached locally after download
- [ ] `np.random.seed()` or `np.random.default_rng()` used appropriately
- [ ] Results are deterministic across runs

### 5. Figure conventions

- [ ] At least 3 figures saved as PNG
- [ ] `dpi=300, bbox_inches="tight"` on all `savefig()` calls
- [ ] Site color palette used (`#6a9bcc`, `#d97757`, `#141413`, `#00d4c8`)
- [ ] Color families for related method groups (if applicable)
- [ ] Dark theme (if used): `fig.patch.set_linewidth(0)`, matching facecolor/edgecolor, `pad_inches=0`
- [ ] Figure naming follows `<slug>_<name>.png` pattern
- [ ] No `featured.png` generated

### 6. Data handling

- [ ] Dataset loaded and cached correctly
- [ ] Shape and basic stats printed after loading
- [ ] Missing values handled appropriately
- [ ] Data types are correct (no silent string-to-float issues)

### 7. Statistical correctness

- [ ] Methods applied correctly (correct function calls, correct parameters)
- [ ] Train/test split (if applicable) done before any fitting
- [ ] No data leakage
- [ ] Results are plausible (sanity check against known benchmarks)
- [ ] Confidence intervals or standard errors reported where appropriate

### 8. Causal inference (if applicable)

- [ ] Estimand (ATE/ATT/LATE) stated in comments for each method
- [ ] Randomized vs observational framing is correct
- [ ] Covariates are pre-treatment only
- [ ] "Confounder" used correctly (not in RCT contexts)

## Report format

Deliver the review inline using this structure:

```
# Script Review: <slug>

**Script:** `<filename>`
**Executed:** <timestamp>
**Status:** <All code runs / Errors found>

## Verdict: <ACCEPT / MINOR REVISION / MAJOR REVISION>

## Execution Results
<execution outcome, timing, warnings>

## Issues Found

| # | Dimension | Severity | Location | Issue | Suggested fix |
|---|-----------|----------|----------|-------|---------------|

## Positive Highlights
- <what the script does well>

## Priority Action Items
1. **[HIGH]** <most critical>
2. **[MED]** <important>
3. **[LOW]** <nice to have>
```
