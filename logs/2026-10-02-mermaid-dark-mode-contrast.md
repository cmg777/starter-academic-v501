# 2026-10-02 — Mermaid diagrams: dark-mode contrast fix (site-wide) + python_panel_intro diagrams

The user reported that flowcharts in `python_panel_intro` were hard to read on the dark page.

## Cause

Wowchemy re-initialises Mermaid with `theme:'dark'` in dark mode. Nodes with no explicit style
(decision rhombi, plain boxes without `style`/`classDef`) render their HTML labels LIGHT (`#ccc`).
The old `custom.scss` §23 rule painted those shapes light lavender (`#ececff`), assuming dark label
text, which produced pale text on a pale box (contrast 1.0–1.4). Edge labels sat on a mid-gray chip
(contrast 4.4) and arrows were thin gray lines.

## Site-wide fix (`assets/scss/custom.scss` §23, dark mode only; light mode untouched)

- Unstyled nodes: navy panel `#1f2b5e`, steel-blue border, light label text `#e8ecf2`. Scoped to
  nodes whose class is exactly `node default` / `node default default`, so nodes styled with
  `classDef` / `:::class` (which carry no inline style) keep their own colors. A first version
  without this scoping forced light text onto `stata_cate2`'s light teal classDef boxes; caught by
  the contrast probe and fixed.
- Edge labels: `#0f1729` chip with `#e8ecf2` text.
- Arrows and arrowheads: `#c8d0e0`, except links colored by `linkStyle`.
- Note: the CSS minifier lowercases `foreignObject`, which then no longer matches the SVG element;
  avoid that type selector in `custom.scss`.

## python_panel_intro

- §1.3 road-ahead and §1.4 estimator-family diagrams restyled with `classDef`: navy panels, light
  text, border colors carry the meaning (blue = data/cross-sectional, orange = within, teal = RE and
  tests, gray/white = practice/CRE). Same look in both themes.
- §1.4 simplified: rounded boxes replace the two large decision diamonds; shorter edge labels.
  One crossing remains (FE and RE both feed the test box and the CRE box).
- Paragraphs around both diagrams rewritten (no em dashes or apostrophes, at least three sentences).

## Verification

WCAG contrast probe on every node and edge label, dark mode, live (before) vs local (after):

| Post | Min node before | Min node after | Edge labels |
|---|---|---|---|
| python_panel_intro | 1.38 | 11.31 | 4.43 → 15.08 |
| python_double_lasso | 1.02 | 11.31 | 4.43 → 15.08 |
| r_causalpolicy_workshop | 1.17 | 2.93 | 4.43 → 15.08 |
| python_sc_dsc_sdid | 1.38 | 2.72 | 4.43 → 15.08 |
| stata_cate2 | 2.93 | 2.93 | n/a |
| python_did, stata_rd, stata_rct, python_fwl | n/a | n/a | 4.43 → 15.08 |

Remaining values near 3 are author-chosen inline fills (white text on steel blue or orange), not
touched by this rule. Production build exit 0; `check_learn_cards.cjs` OK on python_panel_intro.

## Open items (pre-existing, not changed)

- Light mode: unstyled decision diamonds in `python_double_lasso` (and similar posts) measure
  contrast about 1.0 in light mode; §23 is dark-only.
- Several posts use white text on `#6a9bcc` / `#d97757` fills (contrast about 2.7–3.1).
