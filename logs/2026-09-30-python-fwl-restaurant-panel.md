# 2026-09-30 — python_fwl: fast-food reframe + "Appendix: FWL with panel data"

**Status: local, uncommitted.** The AhaSlides deck was rebuilt in place (live).

## What changed and why

The author asked for two things:

1. **Reframe the case study.** The retail chain (50 stores, "coupon usage", daily sales) is now
   a **fast-food chain**: 50 restaurants, one per neighborhood. Each hands out **100 coupons on a
   single day** and counts how many are redeemed during the month. `coupons` is that **redemption
   rate (%)**, and `sales` is **monthly sales (thousands $)**. `dayofweek` stays a generic control.
   Every number in the main body is unchanged. Coupon values keep their two decimals ("36.93 ≈
   37 of 100"), a gap the post states explicitly.
2. **Add §23 "Appendix: FWL with panel data".** The chain repeats the promotion in **June**.
   `simulate_restaurant_panel()` replays January draw for draw (asserted equal to
   `simulate_store_data(50, 42)`) and continues the same RNG stream. January's sales noise
   `α ~ N(0, 3)` becomes a persistent restaurant trait. June adds `income + N(0, 2)`, a summer
   lift of +3, and a trait that raises June redemption (counter handout). The appendix uses
   `expdpy.analyze_fwl_plot` (v0.5.2, pyfixest 0.60 backend), with SEs clustered by restaurant.
   References became §24.

## Appendix numbers (seed 42; `fwl_results.json → panel`)

| Estimator | coupons | SE |
|---|---|---|
| Pooled OLS + income + month | 0.4496 | 0.0814 (cluster) |
| Restaurant FE (LSDV = demeaning = `analyze_fwl_plot`) | 0.2138 | 0.0807 |
| Two-way FE (LSDV = `analyze_fwl_plot`) | 0.1394 | 0.0691 |
| First differences + intercept (= TWFE exactly) | 0.1394 | 0.0695 (HC1) |

SE lesson: TWFE CRV with no small-sample factors = FD HC0 = 0.0674 exactly. statsmodels LSDV
counts all 53 parameters, which gives 0.0988. Monte Carlo (500 panels): pooled 0.376, TWFE 0.203
(SD 0.043 = average SE 0.042); 7% of panels land at or below 0.1394.

## Files

- `index.md`: reframe (59 exact-match replacements), objective 8, the §23 appendix (code blocks
  and outputs taken verbatim from a tested run), the `panel data` tag, a new summary, and the
  expdpy reference. The interactive plots are iframes to `panel_plots/fwl_panel_{fe,twfe}.html`
  (Plotly, dark theme, hover shows restaurant and month; `loading="lazy"`).
- `script.py`: new labels, the 5 regenerated PNGs, and the panel block. It writes
  `data/fwl_restaurant_panel.csv`, the two Plotly HTMLs and `fwl_results.json → panel`, with
  asserts that FWL = LSDV, FD = TWFE and CRV0 = HC0. It now imports `expdpy`.
- `notebook.ipynb` and `references/tutorial.qmd`: reframed, with the appendix added. The Colab
  cell installs `expdpy`. The qmd guards the expdpy/pyfixest lines (`HAS_EXPDPY`).
- `references/setup_env.py`: optional `expdpy==0.5.2`, installed wheel-only and non-fatal,
  because pyfixest 0.60 has **no macOS wheel for Python 3.10**. It now relaunches with the
  **newest** compatible Python it finds. The README and `build_bundle.sh` ship the panel CSV,
  and `python_fwl.zip` was rebuilt.
- Companions reframed: the three cheat sheets, `analysis.do` (+ `analysis.log`, re-run in Stata
  19 SE with the license header scrubbed), `data/` (dictionary YAML + builder output; the panel is
  a second dataset with `restaurant_id` and `period`), `infographic_instructions.md`, `web_app/`
  (`?v=20260930`), `slides/slides.qmd` (re-rendered), `ahaslides/deck.md/json/payload`.
- Shared lab (only used by this post): `layouts/shortcodes/fwl-lab.html`,
  `assets/js/fwl-lab.js` now say restaurants.
- ES/JA stub summaries updated.

## AhaSlides (presentation 10198190)

Rebuilt in place: backup deck `10220004`, new 34-page PDF imported *before* deleting, old images
soft-deleted, 7 interactive slides moved (positions 5/14/20/24/29/32/40 verified; badge 0 / 3 as
before; share link 200). Follow-up: the notes of interactive slides 6 and 7 were updated with
`update_slide_content` (full quiz resent; IDs, order, correct answers unchanged). See
`ahaslides/README.md → Rebuild log`.

## Not regenerable

The Spotify podcast episode, the YouTube video overview and `slides/ai-slides.pdf` still tell the
retail-store story.

## Verification

`script.py` runs with all asserts passing; main-body JSON numbers are identical to before. The
notebook executes with 0 errors on the bundle's pinned stack (Python 3.13). The zip renders from a
clean unzip, twice: once with expdpy, and once on the Python 3.10 fallback path. Python and R cheat
sheets, `analysis.do` and `cheatsheet_stata.do` run. The production build succeeds (baseline WARN
only) and publishes `panel_plots/` and the panel data. In the browser: 0 MathJax errors, no raw
TeX, iframes render, and the lab, web app and data dictionary show no "stores". i18n parity:
0 missing.
