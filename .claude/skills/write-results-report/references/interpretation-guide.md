# Interpretation Guide

> This file is part of the `write-results-report` skill. Read this file
> when writing interpretation paragraphs in results_report.md.

## What makes a good interpretation

Every number in the script output deserves context. Do not just restate
the output -- translate it into domain meaning.

### Bad interpretation (restates output)
> The R-squared is 0.23 and the coefficient is -0.14.

### Good interpretation (translates to domain meaning)
> The model explains about 23% of the variation in municipal development
> scores (R-squared = 0.23), suggesting that satellite imagery captures
> meaningful but incomplete information about local economic conditions.
> The treatment coefficient of -0.14 indicates that program participation
> is associated with a 0.14-point decrease in the development index,
> though this naive estimate likely reflects selection bias rather than
> a true causal effect.

## Interpretation checklist

Each interpretation paragraph must:

1. **Quote specific numbers** -- never say "the result was significant" without the number
2. **Explain in plain language** -- what does this number mean to a non-specialist?
3. **Translate to domain meaning** -- what does it mean for the case study?
4. **Connect to the research question** -- does this advance our understanding?
5. **Be a single continuous paragraph** -- 2-4 sentences, no bullet points
6. **Flag uncertainty** -- mention confidence intervals, caveats, or limitations when relevant

## Minimum count

The results report must contain at least **5 interpretation paragraphs**
across all sections. Typical locations:

1. After data overview (sample size, coverage, variable distributions)
2. After EDA/descriptive stats (patterns in the data)
3. After baseline/simple model (benchmark performance)
4. After core method results (main findings)
5. After comparison/robustness (how methods compare, sensitivity)

## Handling surprising results

When a result is unexpected:
- State what was expected and what was found
- Offer possible explanations (data quality, model misspecification, genuine finding)
- Note implications for the analysis and conclusions
- Flag prominently in the Surprises and Caveats section
