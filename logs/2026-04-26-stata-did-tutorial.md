# Stata DiD Tutorial Post

**Date:** 2026-04-26
**Post:** `content/post/stata_did/`
**Status:** Complete, ready for publication

## What was created

A comprehensive tutorial on Difference-in-Differences (DiD) in Stata, based on Corral and Yang (2024). The post evaluates a fictitious after-school tutoring program across 35 high schools using the 2x2 DiD design, five equivalent TWFE regression approaches, and an event study extension.

### Files in the page bundle

| File | Description |
|------|-------------|
| `index.md` | Main tutorial (~600 lines, 10 sections) + inline audio player |
| `analysis.do` | Companion Stata do-file with all commands |
| `analysis.log` | Full Stata log from running analysis.do |
| `featured.webp` | Featured image for post header |
| `infographic_instructions.md` | AI image-generation prompt for chalkboard infographic |
| `results_report.md` | Structured results report with interpretations |
| `results_report_review.md` | Review of results report accuracy |
| `script-review.md` | Review of analysis.do quality |
| `execution_log.txt` | Script execution log |
| `stata_did_its.png` | Interrupted Time Series (naive comparison) |
| `stata_did_counterfactual.png` | DiD design with counterfactual trend |
| `stata_did_diff_plot.png` | DiD plot with labeled group means |
| `stata_did_panelview_2x2.png` | Treatment timing heatmap (2x2 dataset) |
| `stata_did_panelview_event.png` | Treatment timing heatmap (event study dataset) |
| `stata_did_event_study.png` | Event study dynamic treatment effects |

### Post structure

1. Overview -- case study setup, learning objectives, Mermaid study design diagram
2. Setup and packages -- Stata package installation
3. Data loading and exploration -- panel data summary, treatment visualization
4. The problem with naive comparisons -- ITS approach, 36.20-point naive gain
5. The DiD design -- counterfactual construction, parallel trends assumption, SUTVA
6. Manual DiD calculation -- 2x2 means table, DiD = 25.32, diff_plot visualization
7. DiD via regression -- five equivalent approaches (diff, reg, didregress, xtreg, reghdfe)
8. Table 2 -- three regression specifications following Corral and Yang (2024)
9. Event study -- 8-period dataset, dynamic treatment effects, parallel pre-trends validation
10. Discussion and summary -- policy implications, caveats, exercises

### Key results

- **ATT estimate:** 25.32 GPA points (p < 0.001), robust across all 5 estimation methods
- **Naive ITS overstatement:** 36.20 points (43% overstatement, 10.88 points from natural time trends)
- **Event study pre-trends:** Coefficients of 0.34, -0.32, 0.59 (all p > 0.10) -- parallel trends hold
- **Post-treatment effects:** 24.71 to 25.70 with no fade-out pattern
- **Five methods converge:** diff, reg, didregress, xtreg, reghdfe all produce 25.31-25.33

### Infographic

Chalkboard-style infographic prompt generated for Gemini (Option A -- all text). Six panels following the Causal Inference template: The Problem, The Case Study, The DiD Design, Five Methods One Answer, Parallel Trends Hold, Bottom Line. Reviewed and accepted with all numbers verified against source post.

### AI Podcast

Audio player streamed from external URL (`https://files.catbox.moe/s6tyrz.wav`). Implementation details:

- **YAML button**: "AI Podcast" link in front matter `links:` section, URL points to `/post/stata_did/#podcast-player`
- **Player UI**: Fixed bottom bar that slides up on click (not embedded in post body). Hidden by default. Features: play/pause, skip +/-15s, seekable progress bar with buffered indicator, playback speed (0.75x-2x), volume slider, download button, close button
- **Homepage support**: When clicked from the homepage, navigates to the post page; JS detects `#podcast-player` hash on page load and auto-opens the player
- **On-page support**: JS intercepts clicks on the button by matching text content "AI Podcast" (not by href, because Wowchemy's `relURL` mangles fragment-only URLs)
- **Audio loading**: `preload: none` -- audio only loads when the player is opened, not on page load

### Post fixes applied

- **Mermaid diagram**: Changed `flowchart LR` to `graph LR` and removed `direction TB` inside subgraphs (unsupported by Wowchemy v5's bundled Mermaid version)
- **Infographic review fixes**: Upgraded Panel 2 mini-viz to grouped bar chart, added distinct icon to Panel 3, added third body sentence to all 6 panels, fixed Panel 5 event study to show period -1 benchmark at zero with confidence interval whiskers
