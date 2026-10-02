# 2026-10-02 — Mermaid flowcharts restyled site-wide (panel_intro / FWL look)

Follow-up to `2026-10-02-mermaid-dark-mode-contrast.md` and
`2026-10-02-python-fwl-mermaid-restyle.md`. Every Mermaid diagram on the site now uses the
python_panel_intro look: navy panels, light text, rounded boxes, and a 3px border whose color
carries the meaning. It looks the same in light and dark themes.

Scope: 142 diagrams on 70 pages, i.e. 66 posts plus the `20260528-EM` publication in EN, ES and JA.

- Pilot, approved by the user: `stata_rct`, `python_dowhy`, `r_estimateW` (17 diagrams)
- Rest: 121 diagrams on 65 pages
- Already done before: `python_panel_intro`, `python_fwl`

Only `index.md` files changed. Companion files (slides, notebooks, `references/*.qmd`) keep their
old diagrams.

## Shared classes (in each diagram)

| Class | Border | Replaces |
|---|---|---|
| `blue` | `#6a9bcc` | steel-blue fills (and `#8b9dc3`) |
| `orange` | `#d97757` | orange fills (and `#c4623d`) |
| `teal` | `#00d4c8` | teal fills |
| `gray` | `#c8d0e0` | gray / light fills (`#f5f5f5`, `#999`, `#9aa0a6`, `#7a8395`, `#c8d0e0`), and boxes that had no style at all |
| `violet` | `#a78bfa` | violet fills (DoWhy "Refute"), and instruments in DAGs |
| `key` | `#e8ecf2` (white) | dark-blue `#1a3a8a` "result" boxes |
| `anchor` | thin `#c8d0e0` on a darker `#0f1729` panel | near-black `#141413` start/data nodes |

All use fill `#1f2b5e` (anchor: `#0f1729`) and text `#e8ecf2`. A dashed border survives as a
`*_dash` class (e.g. unobserved confounders). Existing `classDef`s keep their names and get the
mapped colors; nodes already on navy keep the meaning of their border color.

## Other rules

- Square boxes `["…"]` and unquoted `[…]` become rounded `("…")`; diamonds and circles keep their
  shape.
- Subgraphs get a transparent dashed gray frame (`fill:none`), so their titles use the theme's
  text color. Subgraphs without an id get one (`SG1`, `SG2`, …).
- Label case: titles in sentence case and lowercase second lines, following the pilot. Only
  common English words are lowercased (checked against `/usr/share/dict/words`). Untouched:
  proper nouns, a guard list (Oaxaca-Blinder, Fisher, Linden-Rockoff, Dodd-Frank Act, West
  Germany, Metropolis, Proposition 99, Moran, Gibbs, …), words before a number or letter
  (`Table 2`, `Spec A`, `Step 4`), and any label that looks like code (`=`, `()`, `_`).
  `7--8` became `7–8`.
- DAG convention (as in python_fwl): confounding, backdoor and collider arrows are dashed orange,
  and the causal arrow is solid teal. Node roles: confounder orange (dashed border if
  unobserved), treatment blue, outcome teal, instrument violet, mediator and collider gray.
  Applied in `python_dowhy`, `python_dowhy_intro`, `python_iv`, `stata_iv`, `stata_iv_panel`
  (both), `python_partial_identification`, `python_pyfixest`, `python_mgwrfer` (Figure 2B),
  `r_fwlplot`, `stata_fwl`, `stata_matching`. Process flowcharts keep plain arrows; dotted
  "assumption" arrows keep the theme's dotted style.

## Prose

Only sentences that the new look made wrong were edited:

- `r_estimateW`: "the box with the teal border".
- `r_causalpolicy_workshop`: four color references now say "border".
- `python_fe_kuznets`: "(dark blue)" became "(white border)".
- `stata_matching`: DAG roles and the dashed orange backdoor arrows.
- `python_dowhy_intro`: role colors.
- `python_iv` and `stata_iv`: "dashed red arrow", which was never red, now reads "dashed gray
  arrow".

Plain parenthetical colors like "(blue)" or "(teal)" were left alone, since they still name the
border color.

## Verification

- A static build (`--buildFuture`) was served on a port without live reload (live reload on
  `hugo server` kills a long in-page probe).
- The probe loaded every page in a hidden iframe and checked, per page: Mermaid errors, blocks
  vs rendered SVGs, nodes left with the bare `node default` class, and WCAG contrast of every
  node and edge label.
- Result for 121 diagrams on 65 pages (the 17 pilot diagrams were checked the same way):

| Theme | Errors | Unstyled nodes | Min node | Min edge label |
|---|---|---|---|---|
| Dark | 0 | 0 | 11.31 | 15.08 |
| Light | 0 | 0 | 11.31 | 10.31 |

- Converter bugs caught before commit:
  1. Nodes with unquoted labels (`A[Raw data…]`) lost their style.
  2. The first fix also quoted parentheses inside labels (`AR(2)` became `AR("2")`).

  Both were fixed, the 65 files were reset to HEAD and converted again. A separate validator then
  confirmed: no `style` lines left on nodes, no square boxes outside subgraph titles, and a class
  on every node.

Convention for new diagrams: copy the classDef lines above; never use `style` on nodes.

## Follow-up (same day): companion files

The same restyle now covers the Mermaid copies outside `index.md`: 62 blocks in 38 tracked files.

- **Quarto sources.** These are the `references/*.qmd` files and `r_*/tutorial.qmd`. 56 blocks in
  33 files were exact copies of a post's old diagram, so they now carry the post's new block
  verbatim. That includes the DAG arrow styling, and any `%%|` chunk options were kept.
  `python_panel_intro`'s copies were already up to date.
- **Blocks that differ from their post.** Seven blocks never matched a post:
  - the two resource-curse tutorials in `python_EconML` and `stata_cate2`
  - `r_augsynth`, `r_sc_multi_country`, and both blocks in `r_double_lasso`
  - the `python_did_covariates_lalonde` slide

  The same converter restyled them. The ones that never had colors got gray borders. All 7 were
  rendered in a scratch Quarto document: no errors, and every node is styled.
- **Slide deck** `python_did_covariates_lalonde/slides`. This is the only deck that uses Mermaid.
  - The diagram uses the post's role colors: question orange, inert gray, corrected blue,
    benchmark anchor.
  - The deck was re-rendered. The theme CSS hash changed, so the old hashed file was removed and
    the new one is tracked.
  - `date: today` would have changed the deck date, so it was put back to August 4, 2026.
  - Arrow labels were 3.62:1 (theme blue on a light chip). A rule in the deck's `site-brand.scss`
    (dark chip, light text) brings them to 15.08:1. Quarto renders diagrams as `svg.mermaid-js`
    with no `.mermaid` wrapper.
  - The same rule went into the `write-slides` template
    (`.claude/skills/write-slides/references/templates/site-brand.scss`), so future decks get it.
    The other 70 deck copies have no Mermaid and were left unchanged.
- **Not changed.** Rendered `tutorial.html` files are untracked build outputs.
  `SLIDES_REVIEW.md` and `post_review.md` are historical review notes. The `python_panel_intro`
  notebook was already up to date. No other notebook contains Mermaid.
