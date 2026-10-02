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

## Follow-up (same day): per-post source fixes, both themes

Both items left open by the first pass are now fixed in the Mermaid source of each page, using a
one-off script (idempotent; a second run changes nothing):

- **Non-rectangular nodes with a `style` line.** In this Mermaid version a `style X fill:…` reaches
  only rectangles; for diamonds (`{}`), circles, and other polygons the text color applied but the
  fill did not, so light text sat on the default lavender (contrast 1.02 in light mode, for example
  in `python_double_lasso`). 34 such `style` lines were converted to an equivalent
  `classDef sty_X …` plus `class X sty_X`, which Mermaid applies to every shape.
- **Text on styled fills below 4.5:1.** 490 `style`/`classDef` text colors were switched to
  whichever of `#141413` or `#ffffff` contrasts more with the fill; the fills themselves are
  unchanged. Almost all cases were white text on steel blue `#6a9bcc` (2.93), orange `#d97757`
  (3.12), or teal `#00d4c8` (1.87); they now use `#141413` (5.9 to 12.3).
- **Violet `#8b5cf6`** (DoWhy "Refute" box in `python_dowhy` and `python_dowhy_intro`) passes with
  neither text color (4.35 / 4.23), so its fill was lightened to `#a78bfa` with dark text (5.9).
- 67 files across 66 posts and one publication, including its ES and JA counterparts.

Full audit afterwards: all 70 pages with Mermaid diagrams, every node and edge label, in dark and
light mode on the local server. Every node is at least 5.90:1 and every edge label at least
10.31:1 (light) / 15.08:1 (dark). Note for future audits: Hugo lowercases URLs (`/post/r_sdpdmod/`),
and some diagrams put label text in a bare `div` (no `span.nodeLabel`), so a probe must read
`foreignObject div`.

Convention for new diagrams: prefer `classDef` over `style` for non-rectangular nodes, and pick text
colors with at least 4.5:1 contrast against the fill (dark text on steel blue, orange, and teal).
