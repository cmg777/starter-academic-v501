# Wealth and weight: evidence and production brief

Mode: **install**, authorized as part of the trilingual publication addition.
Source: Restrepo Gómez, Du, and Mendez (2026), *The European Journal of Health
Economics*, DOI 10.1007/s10198-026-01998-1, version of record published October 8,
2026. The complete 21-page publisher PDF was downloaded and its main text,
appendix tables, funding, data statement, and license inspected. Table 2 and
Tables 3–4 were also rendered and visually inspected. The first two authors'
full names are confirmed in the funding statement on PDF page 20; Crossref uses
initials. No volume, issue, or page range is assigned. PDF page references below
are file page numbers, not journal pagination.

## Question → evidence → answer

- Top: **Wealth up, obesity down?**
- Middle: two deterministic cubic income-component curves, from Table 2
  posterior means, centered at GDP per person of USD 10,000 (constant 2015).
- Bottom: **Not at every income.**
- Visible qualifier: model associations, not causal effects; posterior means,
  1,195 observations, and no uncertainty band shown.

The central question concerns the shape of the income–obesity association after
accounting for model uncertainty. The within-country estimates have an
inverted-N pattern. The pooled descriptive fits in Figures 1–2 use different
variation and are deliberately not substituted for the main panel evidence.
No publisher figure is reproduced or edited. This original plot represents
reported numerical facts; the publisher article carries CC BY-NC-ND 4.0.

## Evidence ledger

| Claim / mark | Source locator | Values and meaning | Uncertainty / transformation |
|---|---|---|---|
| Scope | Data, PDF p. 3 | 84 countries, 2000–2020; age-standardized adult obesity prevalence, ages 18+, BMI ≥30 kg/m² | National aggregates; not individual risk |
| Solid blue curve | Table 2, PDF p. 5, fixed g-prior (UIP), first three rows | Coefficients on ln GDPpc, its square, and cube: −189.358, 21.620, −0.804; PIP = 1 for each | Posterior means. Draw f(ln income) − f(ln 10000), where f(x)=b1x+b2x²+b3x³ |
| Dashed gold curve | Table 2, PDF p. 5, robust g-prior, first three rows | −187.464, 21.405, −0.796; PIP = 1 for each | Same centering and common scales as UIP; not a confidence band or a good/bad color judgment |
| Observation count | Table 2 diagnostics, PDF p. 5 | 1,195 country-year observations for each BMA prior | Do not substitute the TWFE count of 1,190 or the 91-country supplementary sample |
| Horizontal domain | Table 7, PDF p. 13, GDP per capita row | Minimum 620.560, maximum 84611.100; constant 2015 US dollars | Logarithmic spacing, dollar tick labels; no extrapolation beyond reported range |
| Vertical axis | Transformation above | Percentage-point difference in the income component from the reference at USD 10,000 | Arbitrary centering constant for readability; not a predicted obesity prevalence level; other regressors held fixed |
| Two turning points | Table 3, PDF p. 7; verified from Table 2 coefficients | Both derivative quadratics have two real roots inside the displayed domain | Numeric roots are not labeled; no precision beyond rounded published coefficients is implied |
| Uncertainty limitation | Table 2, PDF p. 5 | Marginal posterior standard deviations are reported | Joint posterior/covariances unavailable; no invented curve band; closeness of means is not certainty about the shape |
| Interpretation | Diagnostic robustness, PDF pp. 8–9; Discussion p. 9; Concluding remarks p. 11; Table 11 p. 19 | Lagged predictors retain the sign pattern; low-income evidence is sparser; time-varying confounding and reverse causality remain possible | Association only; no causal health recommendation |

## Production

Renderer and machine-readable data:
`scripts/figures/20261008-EJHE/build_infographic.py` and
`scripts/figures/20261008-EJHE/infographic-data.json`.
Run `python build_infographic.py OUTPUT_DIRECTORY` with Matplotlib, NumPy, and
Pillow installed. It exports a native 2560×1440 PNG, lossless WebP, and review
previews. No image-generation model supplies numerical marks or text.

Actual CSS tokens checked in `assets/css/orbital-palette.css`: background
`#050a12`, panel `#0a121d`, ink `#edf2f6`, secondary `#9baaba`, blue `#88b9de`,
gold `#e9c184`, separator `#22303e`. Essential axes use the secondary color,
not the low-contrast separator. Blue/solid and gold/dashed distinguish priors;
gold does not encode a favorable health result. Source figures' scientific
colors are untouched because those figures are not included.

Reference images inspected as actual pixels: 20260528-EM, 20260216-APJRS,
20251006-SIR, and 20261011-REGION. The composition follows their large question,
evidence, and short answer hierarchy. The existing publication image viewer and
320×180 q88 / 640×360 q92 responsive thumbnail pipeline are retained.

## Delivery and checks

The same `featured.webp` is installed under EN/ES/JA `20261008-EJHE` bundles.
Each article has a complete translated abstract and body plus a localized alt
description covering question, result, units, scope, and uncertainty. All three
pages explicitly set `featured: false`; existing featured flags are preserved.

Full-size WebP and 160/96-pixel previews inspected: the main question, overall
curve, and answer remain recognizable; fine axis labels require enlargement.
Full page, image-viewer, catalog, responsive layout, hashes, file sizes, Hugo,
CV, parity, and test results are recorded in the task verification report/log
after execution. A source brief alone does not certify those later checks.
