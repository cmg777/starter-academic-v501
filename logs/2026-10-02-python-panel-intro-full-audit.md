# 2026-10-02 — python_panel_intro: full audit (post, cheat sheets, every companion)

A second, folder-wide audit of `content/post/python_panel_intro/`, run after the learning upgrade
and the cheat-sheet addendum (`2026-10-02-python-panel-intro-learning-upgrade.md`). Scope: the
post, the three cheat sheets, `script.py`, notebook, Quarto bundle, slides, web app, data
dictionary, results report, infographic brief, READMEs and the ES/JA stubs. The historical review
files (`slides/SLIDES_REVIEW.md`, `results_report_review.md`, `web_app/REVIEW.md`, `plan.md`) were
left unchanged on purpose.

## Method

- Ground truth: re-ran `script.py` (byte-identical CSVs and JSON before the fixes), all three cheat
  sheets (Python, `Rscript`, Stata 19 SE batch), and every ```python block of `index.md` in order,
  then compared each printed result with the ```text block below it.
- Three read-only Explore audits (numbers and claims across the companions; R/Stata cheat sheets;
  style, escaping, links and cross-references in `index.md`). Every finding was re-checked against
  code output before fixing.
- Rendering: production `hugo --gc --minify`, then the dev server in Chrome (MathJax errors,
  Mermaid, `panel-lab`, learn-cards, link buttons, light/dark, a 375px iframe for overflow).

## Findings and fixes

| Claim / defect | Correct fact | Files |
|---|---|---|
| "Neither specification test rejects RE" (Hausman H = 1.79, p = 0.180) | That statistic plugs robust SEs into the classical formula and is not a valid test. The textbook Hausman test (classical variances: FE SE 0.0509, RE SE 0.0278) gives **H = 5.62, p = 0.018 and rejects RE**. The robust check is the Mundlak test: p = 0.072 (RE, White) and 0.106 (pooled, clustered), borderline. | `index.md` (abstract, road-ahead diagram, concept card 8, §13 rewritten with a new predict card and code, §14, §18 misconception 1, §19, §20, Ex. 4), `script.py` (+ figure annotation, takeaways, JSON), slides, web app, notebook, tutorial.qmd, results report, infographic brief, data dictionary, cheat sheets |
| §16: "RE and CRE with … year effects" | The RE and CRE specs had **no** year effect, so CRE was one-way FE and its age coefficient (+0.033) absorbed the common wage trend. Added a 2012 dummy: RE union 0.0875, age 0.0205; **CRE reproduces TWFE exactly** (union 0.2129, age −0.0576). | `index.md`, `script.py`, CSV/JSON/figure, cheat sheets §11, web app data, slides, results report |
| §16 code printed nothing, yet a table followed | Added the printing loop; output verified | `index.md` |
| §9: "the upward revision is statistically detectable" | The FD 95% CI [0.06, 0.37] excludes zero but contains the POLS 0.075 | `index.md`, results report |
| `# Stata:` comments (`L.` without `delta(2)`, `xtreg, be` / `re robust` / `fe robust`, `reghdfe` without vce) | Replaced with commands that reproduce the shown SEs (`xtset …, delta(2)` + `D.`; `collapse` + `regress, vce(robust)`; `areg …, vce(robust)`; note that `xtreg, re vce(robust)` clusters, SE 0.0314) | `index.md`, `script.py`, notebook, tutorial.qmd |
| Web app Hausman explorer p-values | `chi2Sf1` used Φ(z) = (1 + erf z)/2 instead of erf(z/√2): it showed p = 0.0008 for H = 5.62 (and 0.058 for H = 1.79). Fixed; defaults now classical SEs. | `web_app/app.js`, `index.html` |
| Web app demeaning animation | Hardcoded slopes did not match the drawn points (raw slope −0.90 drawn as 0.07). New toy data; slopes computed from the points (POLS 0.07, FE 0.21). | `web_app/charts.js` |
| Web app forest plot "seven methods" showed six | Added the basic TWFE row; fixed several text claims (bias direction, within R², ranges) | `web_app/data/results.json`, `index.html` |
| `notebook.ipynb` and `references/tutorial.qmd` (and so the zip) were the April version of the post | Regenerated from `index.md` by the new `regen_companions.py` (idempotent; reuses the styled figure chunks; learn-cards become Quarto callouts). Notebook executed end to end (0 errors); tutorial rendered from a fresh bundle `.venv` (all 7 pins OK). | `regen_companions.py`, notebook, tutorial.qmd, zip |
| Smaller corrections in the post | Alice was both an always-member and a joiner; 0.066–0.213 range → 0.211; "two to three times more precise" → SEs 2.6–3.5× smaller; "2,199 dummies" → about 2,200; Mundlak equation gained the random effect a_i; θ defined; Mundlak γ = Between − FE exactly (0.0662 − 0.2103); defined log points, NLSY, FDFE, DVFE, strict exogeneity, consistency; new note on which SE type each estimator reports; one "your" removed; a proof equation split to remove 375px scrolling | `index.md` |
| Figures | FE value label clipped (coefficient figure); Age ticks overlapping and "absorbed" clipped (extended figure); missing 6% label (variation figure) | `script.py`, regenerated PNGs |
| Cheat sheets | Hausman wording ("the post plugs…"); comparison table no longer has an exception row (RE + controls is 0.0875 in all three; θ 0.5528 vs 0.5529); R `NOTE: unitary time step` removed (wave index, the analogue of `delta(2)`); `lmtest` check; `T` no longer masks `TRUE`; Stata `reghdfe` block survives a missing `require`/`ftools`; trap 11 `sa` claim fixed; header lines no longer wrap in the log; em dashes removed | `cheatsheet_*.{py,R,do}` |
| Stata batch logs carry license details | `content/post/*/cheatsheet_stata.log` added to `.gitignore` | `.gitignore` |
| Stale READMEs | Folder README pipeline status; data dictionary "FD and FE coincide" wording | `README.md`, `data/` |

Verified clean (no change needed): Goldmark/MathJax escaping, output fences, cross-references,
learning objectives, figure files, front-matter links (all 200 on the dev server), the `panel-lab`
numbers (reproduced via `window.PanelLab`), the ES/JA stubs (the English summary did not change),
and the zip contents (each member byte-identical to its source).

## Not changed

- `web_app/lasso.js` is loaded but unused (template leftover); harmless, left in place.
- The learning-upgrade log's cheat-sheet addendum describes the pre-audit state (one differing
  table row, Hausman "facts surfaced"); this log supersedes it.

## Verification

`script.py`, all three cheat sheets (self-asserting comparison tables), the post's 22 code blocks
(19 output blocks match), the notebook (nbclient) and `tutorial.qmd` (fresh-bundle render) all run
without errors. `hugo --gc --minify` succeeds; in Chrome: 0 MathJax errors, both Mermaid diagrams
render, no console errors on the post, slides, web app or data dictionary, no overflow at 375px.
