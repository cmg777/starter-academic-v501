# Causal Inference Conventions

> This file is part of the `write-script` skill. Read this file only when
> the script topic involves causal inference methods.

## Estimand precision

When a script compares **multiple causal estimation methods**, explicitly state
which **estimand** each method targets. This is a common source of confusion
and errors.

**Required elements:**

1. **Define the estimand(s) early** -- before the estimation section, add a
   comment block explaining the target estimand (e.g., ATE vs ATT) with formal
   notation and a plain-language policy question each answers.
2. **Flag estimand shifts** -- if any method targets a different estimand than
   the others (e.g., PS matching targets ATT while IPW targets ATE), state
   this explicitly in code comments.
3. **Randomized vs observational framing** -- in randomized experiments, the
   naive difference-in-means is **unbiased in expectation**. Do NOT claim
   covariate adjustment "removes confounding bias" -- instead frame it as
   **improving precision** by accounting for finite-sample covariate imbalances.
   In observational studies, confounding bias is a genuine concern and should
   be described as such.

## Confounding language

Flag imprecise use of "confounder" in randomized settings. Pre-treatment
covariates in RCTs are prognostic variables that improve precision, not
confounders that create bias (though adjusting for them is still correct
and useful).
