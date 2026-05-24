# Review — stata_spxtivdfreg/web_app

**Audit date:** 2026-05-24
**Focus:** all 10 dimensions
**Browser pass:** enabled (Chromium 1.60.0)
**Verdict:** ACCEPT

## Dimension scores

| # | Dimension              | Score | Notes |
|---|------------------------|-------|-------|
| 1 | File completeness      | 10    | All 7 expected files present; no stray files |
| 2 | HTML structure         | 9     | 4 tabs with matching button/pane IDs; D3 loads before app.js; semantic roles in place |
| 3 | JS correctness         | 10    | Smoke test passes 8/8; zero console errors across all 4 tabs (desktop + mobile) |
| 4 | Data contract          | 10    | results.json parses; estimates/diagnostics/longrun/longrun_nofactors keys match analysis.log values (LIQUIDITY = 2.4524 SR; total LR = 7.765) |
| 5 | Accessibility          | 9     | Every slider has aria-label; tabs use role + aria-selected; sliders react to keyboard |
| 6 | Performance            | 10    | Smoke-test lasso_path(n=500, p=100) = 101 ms; tab switches instant |
| 7 | Pedagogy               | 10    | Tab-1 lede directly mirrors post takeaways (ψ ≈ 0.39, ρ ≈ 0.29, LIQUIDITY 2.45 → 7.77); glossary has 8 entries; "what to look for" panel in each computational tab |
| 8 | Hugo integration       | 10    | YAML link `web_app/index.html` (no trailing-slash bug); all assets HTTP 200 |
| 9 | Visual design          | 9     | Dark palette tokens (`#1f2b5e`, `#6a9bcc`, `#d97757`, `#00d4c8`, `#e8ecf2`); consistent typography |
|10 | Mobile responsiveness  | 9     | 375×667 viewport: tab strip works; sliders reachable; charts use viewBox + responsive scaling |

## Issues addressed in this review

| Severity | Dim | Issue | Fix |
|----------|-----|-------|-----|
| MED      | 9   | Tab-1 (intro) legend at top-left overlapped the rising orange "no-factor IV" curve near σ_f = 0 | Moved legend to top-right corner (where curves have already diverged downward at large σ_f, leaving the upper-right empty); bumped background opacity from 0.7 to 0.85 |

## Positive highlights

- Numbers wired through every tab are sourced from the actual `analysis.log` (e.g. LIQUIDITY 2.4524 → LR total 7.765, Hansen J p = 0.4681 for the full model, p = 0.0002 for no-factors).
- Defactored-IV simulator in Tab 2 ships a "Run 100 simulations" button that shows the bias systematically — not just a noisy single draw.
- Long-run cascade in Tab 4 makes the multiplicative structure visceral: bar 1 (SR β) → × temporal → × spatial.
- All four model variants (Full, No factors, No spatial lag, Heterogeneous) appear in the forest plot with consistent colour coding.
- Charts.js still ships the stale `forest_plot`/`selection_bars` exports from the r_double_lasso template, but they are unused — app.js builds its own `buildForestPlot`/`buildJBars`/`drawAllvarsBars` with the spxtivdfreg-specific colour map (`COLOR_MODEL`) and proper outcome filtering. No leakage into the rendered UI.

## How to re-review

```
"$HOME/Library/Application Support/Hugo/0.84.2/hugo" server --disableFastRender --port 1349 --bind 127.0.0.1
# in another shell:
BASE=content/post/stata_spxtivdfreg/web_app node .claude/skills/write-app/references/templates/smoke-test.js
```
