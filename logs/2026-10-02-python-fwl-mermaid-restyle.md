# 2026-10-02 — python_fwl: flowcharts restyled to match python_panel_intro

Follow-up to `2026-10-02-mermaid-dark-mode-contrast.md`. Both Mermaid diagrams in
`content/post/python_fwl/index.md` now use the panel_intro look: navy panels `#1f2b5e`, light text
`#e8ecf2`, rounded boxes, 3px borders whose color carries the meaning. Same look in both themes.
Only `index.md` changed; `references/tutorial.qmd` keeps the old diagrams on purpose. ES/JA are
stub cards, so they need no change.

## §1.3 The road ahead

- `style` lines replaced by `classDef puzzle / solve / check / practice` (blue / orange / teal /
  gray borders); square boxes became rounded.
- Grouping kept as four pairs: puzzle (§5–6), solve (§7–9), check (§10–15), hand over (§16–23).
  We looked at regrouping, but the pairs already follow the section order.
- Labels are shorter; the last box now names the panel data appendix (§23).
- The paragraph below was rewritten in the panel_intro pattern ("The border colors of the
  boxes…"), with no em dashes or apostrophes.

## §3 Causal DAG

- Nodes name their role: Income (confounder, orange border), Coupons (treatment, blue),
  Sales (outcome, teal).
- The backdoor path is highlighted: both Income arrows are dashed orange (`-.->` plus
  `linkStyle 0,1 … stroke-dasharray:7 5`). In Mermaid 8.8.4, `-.->` alone came out solid once
  `linkStyle` was set, so the dash pattern must be stated explicitly. The causal arrow is solid
  teal 3px, and `===>` makes it longer so its label does not hide it.
- The `→` characters in the edge labels were removed. The paragraphs before and after the diagram
  were rewritten to refer to the dashed orange and teal arrows, with no em dashes.

## Verification

Local server, WCAG contrast probe on every node and edge label:

| Theme | Nodes (both diagrams) | Edge labels |
|---|---|---|
| Dark | 11.31 | 15.08 |
| Light | 11.31 | 10.31 |

Checked visually in both themes: dashes are visible, the teal causal arrow can be seen on the
white background, and nothing is clipped. Production build (`hugo --gc --minify`) exit 0.
