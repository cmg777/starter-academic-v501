# 2026-08-02 — a deck of its own for `python_sc_dsc_sdid`

## What changed

`content/post/python_sc_dsc_sdid/` shipped without a slide deck and borrowed the R edition's
by absolute URL (`name: "Slides (HTML) — R edition"`). It now has its own:
`content/post/python_sc_dsc_sdid/slides/`, 42 slides across four acts, and a new
front-matter entry `Slides (HTML)` → `slides/index.html` inserted as the **first** link.
The three "— R edition" buttons (slides, AI slides PDF, web app) stay below it as sibling
cross-references. The R post's deck is untouched.

Built with `/project:write-slides`; audited against the `/project:review-slides` checklist in
the same pass (the review skill is user-invocation-only, so its checks were run inline).

## Why the two decks differ deliberately

The R deck argues **"from DiD to SDID, and what Brexit cost the UK"** — four acts built on the
bias decomposition, because that post hand-codes each estimator before calling its package.

The Python post's thesis is different and does not appear in the R edition at all: **the
library's defaults move the answer further than the choice of estimator does.** So the deck is
Python/mlsynth-first. Brexit is the running case, not the punchline.

| Act | Divider | Slides | Argument |
|---|---|---|---|
| I — One Treated Unit | `#d97757` | 4 | there is one UK; 92 estimators behind one config dict |
| II — One Config, Six Rungs | `#6a9bcc` | 16 | the weighted two-way regression, then a rung per class |
| III — The Defaults | `#141413` | 8 | `zeta`, `set_f`, covariates; silent rounding; solver fingerprint |
| IV — Which Rung? | `#00d4c8` | 8 | the placebo tournament, the matched exam, the inferential floor |

Act III is the part with no counterpart in the R deck. Its opening table is the whole
argument: `zeta` moves the estimate 0.13 pp, `set_f` 0.47 pp, the covariate method 1.76 pp —
against a 0.31 pp spread across the entire six-rung ladder.

## Title key-result strip

Software-forward rather than effect-forward, to separate it from its R sibling
(which leads `2.8%` · `0.96` · `23`):

| | |
|---|---|
| `1.76 pp` | one default's covariate spread |
| `0.31 pp` | the whole ladder's spread |
| `92` | estimators behind one config dict |

## Figures

Twelve of the post's fourteen, one per slide, referenced in place via `../python_sc_dsc_sdid_*.png`.
Dropped: `_02_mlsynth_native_plot` (the package's default styling, not an argument) and
`_05_dsc_offset` (the DSC offset is one number, carried by text). Every figure carries real alt
text — the R deck's seven `![](…)` calls have empty alt attributes, so this closes that gap.

## Numbers

There is no `results_report.md` for this post, so the ledger is `att_headline.csv`,
`inference_summary.csv`, `covariate_methods.csv`, `masc_fold_settings.csv`, `robustness_grid.csv`,
`solver_comparison.csv`, `sdid_time_weights.csv` and `placebo_h{1,4}_summary.csv`. All 40+ slide
numbers were traced to a named CSV row or a quoted `index.md` line — the ledger is in
`slides/SLIDES_REVIEW.md`.

## Verification

| Layer | Result |
|---|---|
| 0 — `quarto render` (1.8.27) | `index.html` 91 KB + `slides_files/` 8.0 MB |
| A — Hugo 0.111.3 | deck 200, post 200, figures 12/12 at 200, button href `/post/python_sc_dsc_sdid/slides/index.html` |
| B — `smoke-test.js` | 15/15 |
| C — `math-check.cjs` | 42 slides traversed, no raw LaTeX |
| review — `slide-audit.cjs` | 0 overflow, 0 raw LaTeX, branding on-brand, 30 takeaway cards |

The one audit finding was density: 23 of 42 slides over the 60-word cap on the first render,
mostly 28-35-word takeaway cards and stacked body prose. Tightening the cards to one clause and
moving the second and third sentences into `::: {.notes}` brought it to 15, all of which are
equation slides (the counter tokenizes MathJax output) or tables — both permitted structured
content under `readability-rules.md`. Verdict ACCEPT; full report in `slides/SLIDES_REVIEW.md`.

## Note

The rendered deck is committed on purpose. Netlify runs Hugo, not Quarto, so `index.html` and
`slides_files/` must be in git; only `content/post/*/slides/.quarto/` is ignored.

Concurrent, unrelated: `web_app/`, four `app_*.csv` files and an `analysis.py` section-17 change
were already in the working tree from the same day's web-app work
(`logs/2026-08-02-python-sc-dsc-sdid-web-app.md`). This change did not touch them.
