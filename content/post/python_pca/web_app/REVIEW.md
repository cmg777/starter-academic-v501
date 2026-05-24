# Review — `python_pca/web_app/`

**Audit date:** 2026-05-24
**Focus:** all 10 dimensions
**Browser pass:** enabled (desktop 1280×800 + mobile 375×667)

## Verdict: **ACCEPT**

After targeted fixes to the chart layout and a defensive guard in
`country_bars`, the app passes the smoke test 8/8, produces zero
console errors during a full multi-tab Playwright exercise (including
moving every slider to its extremes), and legends/labels no longer
overlap data marks.

### Initial run (before fixes)

The initial audit produced verdict **MAJOR REVISION** based on:

1. **HIGH** — `country_bars.update()` produced repeated `<line> attribute
   x1: NaN` console errors whenever the life-expectancy filter removed
   every row, because `d3.extent` returned `[undefined, undefined]` and
   `Math.min(0, undefined) = NaN` propagated into the zero-line.
2. **MED** — Tab 1's inside-plot legend (`translate(8, h-56)`) overlapped
   the bottom-left of the scatter cloud.
3. **MED** — Tab 4's `loadings_bars` legend (`translate(w-160, -8)`)
   sat directly on top of the "0.7071" bar value labels.
4. **MED** — Tab 2's `pca_scatter` axis labels were inside the plot
   area and could collide with the PC arrows / cross-hair.
5. **LOW** — `#rank-le-val` initial readout said "0" while the slider
   default was 50.

## Fixes applied (this commit)

| Sev. | Dim | Fix                                                                                                                |
|------|-----|--------------------------------------------------------------------------------------------------------------------|
| HIGH | 3   | `country_bars.update()` early-returns with a friendly "no countries match this filter" SVG message when rows.length === 0. Defensive `Number.isFinite` clamps on extents. |
| MED  | 9   | `pca_rotation_animation`: legend moved BELOW the plot in a new bottom margin (`H` 360→400, `bottom` 44→84). Added PC2 to legend. |
| MED  | 9   | `loadings_bars`: top margin 24→48; legend moved from `translate(w-160, -8)` to a horizontal row at `translate(0, -32)` — above the bars, never over the value labels. |
| MED  | 9   | `pca_scatter`: H 420→440, left margin 56→64, bottom margin 40→56; axis titles moved OUTSIDE the plot (rotated y-title on the left; centred x-title below). |
| MED  | 9   | `pca_rotation_animation`: axis labels shortened to `z₁ (LE)` / `z₂ (IS)` and repositioned to outer corners of the plot to avoid the rotating arrows. |
| LOW  | 2   | `#rank-le-val` initial text changed from "0" to "50" to match the slider default. |

## Dimension scores (post-fix)

| # | Dimension              | Score | Notes                                                            |
|---|------------------------|-------|------------------------------------------------------------------|
| 1 | File completeness      | 10    | All 7 files present; bundle size sensible                        |
| 2 | HTML structure         | 10    | 4 tabs, matching IDs; semantic roles correct                     |
| 3 | JS correctness         | 10    | Smoke test 8/8; zero console errors after Playwright exercise    |
| 4 | Data contract          | 10    | results.json parses; matches post numbers (λ₁=1.9595, r=0.9595)  |
| 5 | Accessibility          | 9     | All sliders have aria-label; tabs role+aria-selected             |
| 6 | Performance            | 10    | Smoke: 102 ms (<300); sliders responsive                         |
| 7 | Pedagogy               | 9     | Strong intro lede; "what to look for" panels; glossary 8 entries |
| 8 | Hugo integration       | 10    | YAML url is `web_app/index.html` (no trailing-slash); HTTP 200   |
| 9 | Visual design          | 9     | Legends now outside plot areas; no overlap with data marks       |
|10 | Mobile responsiveness  | 9     | viewBox scales; tabs reachable; charts readable at 375 wide      |

## Positive highlights

- Pedagogy is strong: Tab 1's rotating-direction animation explicitly
  visualises "PC1 = max-variance axis" — exactly the post's central
  concept.
- Closed-form math (`λ₁ = 1+|r|`, `λ₂ = 1−|r|`) is named in Tab 2's
  stats and re-grounded in Tab 4's commentary — full vertical
  alignment with the post.
- results.json values match the post's CSV (correlation 0.9595,
  λ₁=1.9595, variance explained 97.97%).
- Monte-Carlo stability test (100 sims) is a thoughtful pedagogical
  extension — sliders progress bar gives good feedback.
- YAML `Web app` link uses `web_app/index.html` (no trailing-slash bug).

## How to re-review

```
/project:review-app python_pca
```
