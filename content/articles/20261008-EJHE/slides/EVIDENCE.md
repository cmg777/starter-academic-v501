# Evidence and reproduction notes

This English teaching deck accompanies the EN, ES and JA article pages. It is an explanatory presentation, not a new empirical study. No study microdata or replication notebook was available. Prepared October 11, 2026.

## Authoritative source

Restrepo Gómez, K., Du, H., & Mendez, C. (2026). *Wealth and weight revisited: A Bayesian model averaging approach to the Obesity Kuznets Curve*. The European Journal of Health Economics. https://doi.org/10.1007/s10198-026-01998-1

Version of record: October 8, 2026. No volume, issue or page range assigned at preparation. PDF page numbers below count from its first page (21 pages total), not journal pagination. The source is open access under CC BY-NC-ND 4.0. This deck uses original explanatory graphics and published numerical facts; it does not recolor or modify publisher figures.

## Claim ledger

| Slide(s) | Evidence | Interpretation guardrail |
|---|---|---|
| Title, 2–3 | Abstract/introduction, PDF pp.1–3 | A conventional inverted-U is a hypothesis; the main result is inverted-N. |
| 4 | Data p.3; Tables 2 (p.5), 5 (p.11) | 84 countries, 2000–2020; BMA N=1,195, controlled TWFE N=1,190. National age-standardized adult obesity prevalence; BMI ≥30. |
| 5–7 | Methodology pp.3–4 | Country/year effects always included; 61 candidate covariates; the workflow is conceptual, with no fabricated model weights. |
| 8 | Equation 4, p.4 | PIP adds posterior probabilities of models retaining a variable; it is not a causal probability or p-value. |
| 9–11 | Table 2 p.5; Table 7 p.13 | UIP coefficients −189.358, 21.620, −0.804; robust −187.464, 21.405, −0.796. PIPs 1.00 at printed precision. |
| 12 | Table 3 p.7 | Reported discriminants 4.97, 10.69, 10.51. Point-estimate shape check, not a confidence interval. |
| 13 | Table 4 column 5 p.7; Table 7 p.13 | Reported controlled-TWFE turning points USD 2,445.66 and 24,983.24. These are not BMA turning points or policy targets. |
| 14 | Figure 1 and note p.6; Table 4/discussion p.7 | Pooled N-shaped fit differs from within-country inverted-N estimates; the pooled second bend lies outside observed support. |
| 15 | Table 2 p.5 | Selected correlates: forest area, renewable energy and population density negative; arable land per person positive. PIP 1.00 under both priors. Units differ. |
| 16 | Table 11 p.19 | Five-year lags: UIP −233.992, 27.135, −1.037; robust −231.340, 26.840, −1.026; all PIPs 1.00; N=802. |
| 17–20, 22 | Discussion/conclusion pp.9–11 | Country aggregates, sparse low-income evidence and possible confounding limit causal/policy interpretation. No joint posterior is supplied here to construct an uncertainty band. |
| 21 | Data availability p.11 and official article page | Full dataset available from corresponding author on reasonable request. No fabricated notebook, podcast or video. |

## Original figures

Run `python figures.py` with NumPy and Matplotlib to regenerate the three SVGs.

- `income-curve.svg`: evaluates `f(log GDPpc) - f(log 10000)` for each set of Table 2 posterior means over Table 7's observed income support, USD 620.560–84,611.100 (constant 2015 USD). The y-axis is an income-component difference in percentage points, not fitted obesity prevalence. Centering changes only the vertical origin. No confidence band is invented. Blue solid = fixed UIP; gold dashed = robust prior.
- `turning-points.svg`: locates Table 4 column 5's reported TWFE turning points on a log-income axis within the observed support. No interval is implied. Blue = first bend; gold = second bend.
- `model-averaging.svg`: original conceptual schematic. Equal boxes encode no probabilities.

## Render and navigation

Run `quarto render slides.qmd --to revealjs` (created with Quarto 1.8.27). Commit `index.html`, `slides_files/`, images and sources together; Netlify runs Hugo without rerendering Quarto. The repository's canonical `site-brand.scss` and title partial are retained; `ejhe-palette.css` supplies this paper's requested navy/blue/gold palette.

Arrow/Space advances, M opens the slide menu, O opens overview, S opens speaker view, B opens chalkboard. Narrow screens use Reveal's scroll mode. The footer links to the article and start. Online MathJax is used for equations, matching the recent REGION deck.
