# Interpretation Guide

> This file is part of the `write-results-report` skill. Read this file
> when writing interpretation paragraphs in `results_report.md`.

## What makes a good interpretation

Every number in the script output deserves context. Do not just restate the
output — translate it into domain meaning. Aim for the rhythm of the two
exemplars (`content/post/r_did_ring/results_report.md`,
`content/post/r_did2/results_report.md`): a 2–4 sentence paragraph that
quotes specific values, translates them to a domain quantity (percent,
dollars, count), and connects to the research question.

### Bad interpretation (restates output)

> The R-squared is 0.23 and the coefficient is −0.14.

### Good interpretation (translates to domain meaning)

> The model explains about 23% of the variation in municipal development
> scores (R-squared = 0.23), suggesting that satellite imagery captures
> meaningful but incomplete information about local economic conditions.
> The treatment coefficient of −0.14 indicates that program participation
> is associated with a 0.14-point decrease in the development index,
> though this naive estimate likely reflects selection bias rather than
> a true causal effect.

### Good interpretation — headline-number-translation pattern

When the script reports a log-scale coefficient, a hazard ratio, or any
transformed quantity, **translate to the natural reading scale** (percent,
dollars, count) inside the same sentence as the raw number, with the
confidence interval immediately attached.

> The `close_post_move` coefficient is **−0.0595 log-points (SE 0.0225,
> 95 % CI [−10.4 %, −1.5 %])**, translating to an average price drop of
> **−5.78 %** for homes inside 0.1 mile of an offender's address after
> arrival. The CI strictly excludes zero, but the magnitude is conditional
> on the choice of ring boundary — re-running the same regression at
> 0.05 mi gives −6.40 %, at 0.15 mi gives −4.21 %.

This is the canonical shape: **raw number → translated scale → uncertainty
in the same breath → conditional-on-what callout** when applicable.

## Interpretation checklist

Each interpretation paragraph must:

1. **Quote specific numbers** — never say "the result was significant" without the number.
2. **Explain in plain language** — what does this number mean to a non-specialist?
3. **Translate to domain meaning** — what does it mean for the case study?
4. **Connect to the research question** — does this advance our understanding?
5. **Be a single continuous paragraph** — 2–4 sentences, no bullet points.
6. **Flag uncertainty** — mention confidence intervals, caveats, or limitations when relevant.
7. **Anchor to a domain quantity** — dollars, percent, count of observations, deaths per 100k. Never leave a log-coefficient or hazard-ratio untranslated.

## Minimum count (raised gates)

The results report must contain at least:

- **10 interpretation paragraphs** across all sections. Typical locations:
  1. After data overview (sample size, coverage, variable distributions)
  2. After each method subsection (one per subsection, target 6+ in a
     multi-method tutorial)
  3. After EDA / descriptive stats (if present as a separate subsection)
  4. Throughout Surprises and Caveats (each bullet is itself a mini-
     interpretation)
  5. After the Reproduction Audit (one summary sentence)
- **8 Key Findings** with specific numbers (see SKILL.md § 3f for the
  format).

If a report falls short of either gate, the writer should add subsections
or split a multi-finding bullet into its own numbered Key Finding. The
exemplars (r_did_ring: 9 findings, 10+ interpretations; r_did2: 8 findings,
15+ interpretations) sit at or above these gates.

## Surprises checklist

Replace the open-ended "anything surprising?" prompt with a walk through
the seven common categories. **For every report, document each category
that applies, AND explicitly state "not applicable" for any that does not**
so the downstream reviewer can tell every category was considered.

1. **Estimator non-determinism.** Does the script's headline estimator
   depend on a random draw that is not seed-pinned? Examples: `binsreg`
   uses a subsample for bin selection above n = 5,000 unless `randcut = 1`
   is set; bootstrap-based SEs depend on `biters`; HonestDiD grid search
   can saturate; `did::att_gt()` bootstrap CIs depend on `biters` (default
   often 1,000 in tutorial mode).

2. **Sample reductions from adjustment.** Does the estimator silently
   drop observations? Examples: `fixest` reports "N fixed-effect singletons
   were removed"; `did::att_gt()` drops never-treated cohorts that fail
   covariate-balance constraints; complete-case panels drop units with any
   missing post-period outcome.

3. **Weighting / aggregation choices that affect the headline at the
   third significant figure.** Examples: unweighted vs population-weighted
   ATT; sample-weighted vs bin-equal-weight nonparametric ATT; uniform vs
   pointwise CIs.

4. **Effect concentration.** Is the average headline driven by a few
   extreme bins, cells, or units? If so, say so — a reader who sees only
   the headline might misread it.

5. **Cosmetic warnings the reader might mistake for problems.** Examples:
   `Removed N rows containing missing values` from intentional NA-break
   rows in step-function geoms; deprecation warnings from packages that
   still work; locale-encoding messages.

6. **Identification assumptions in force.** No-anticipation, parallel
   trends (or its spatial / continuous analogues), SUTVA / no spillovers,
   strict / sequential exogeneity, conditional ignorability. None are
   testable; the report should name them so a downstream reader knows
   what the conclusions rest on.

7. **Pedagogical framing of the source paper.** When the original paper
   itself disclaims definitiveness ("This empirical exercise is meant
   solely to illustrate …"; Baker et al. 2025 line 134; Butts 2023
   line 134), the report should quote that disclaimer rather than
   overclaim on the paper's behalf.

## Handling surprising results

When a result is unexpected:

- State what was expected and what was found.
- Offer possible explanations (data quality, model misspecification,
  genuine finding).
- Note implications for the analysis and conclusions.
- Flag in the Surprises and Caveats section under the appropriate category
  above.
- If the result is a *major* finding (not a footnote), also promote it to
  a Key Finding.

## Anti-patterns

- "The coefficient is significant." → Quote the number, the SE, the CI,
  and the translated quantity.
- "R² = 0.42 indicates a good fit." → Translate ("explains 42 % of
  variation in …") and add domain context.
- An interpretation paragraph as bullet list → Always a single paragraph,
  2–4 sentences.
- An interpretation paragraph that paraphrases the raw output without
  adding any context → Re-read criteria 3 and 4 above and rewrite.
- Skipping the Surprises checklist with "no surprises" → Walk every
  category and explicitly note "not applicable" if it does not apply.
