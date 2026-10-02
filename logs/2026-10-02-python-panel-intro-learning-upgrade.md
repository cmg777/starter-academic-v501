# 2026-10-02 — python_panel_intro: learning components, readability rewrite, numbers audit, `panel-lab` widget

The panel-data tutorial (`content/post/python_panel_intro/`, union wage premium, NLSY-style panel,
2010 and 2012, N = 2,199) was brought up to the `python_fwl` learning standard, rewritten for
readability, and audited against a fresh run of `script.py`. The audit found real errors that had
spread into every companion artifact.

## Errors corrected

| Claim in the old post | Correct fact |
|---|---|
| Union status is "9.1% within" (abstract, concept card, §4, §11, §12, §16, §17; slides title strip) | 0.0911 is the within **SD**. The within **variance share** is **6.1%** (lwage 13.3%, age 2.6%, schooling 0%) |
| "TWFE closes the FD–FE gap exactly" (TWFE = 0.2129) | The basic TWFE included `age`. Union-only TWFE = **0.2113 (SE 0.0792) = FD with an intercept**, exactly; one-way FE 0.2103 = FD **without** an intercept; FD intercept 0.0727 = common trend. 0.2129 is now only the extended (with-controls) model |
| Age is collinear with the year dummy; "every worker ages exactly two years" | Age rose by 2 for 1,885 workers, by 1 for 164 and by 3 for 150. The TWFE age coefficient (−0.0576) is identified by 314 workers: fragile, not mechanical |
| Demeaning figure: "POLS slope ≈ 0.08" | 0.075 |
| Post loading code `df["union"].map({...})` | On the categorical column this returns a Categorical and breaks `groupby().mean()` / `diff()`. Now `.astype(str).map({"Yes": 1, "No": 0}).astype(float)` (post, notebook, `tutorial.qmd`) |
| §15 code built `df_rx` before `age_bar` | `fit_cre_x` raised KeyError; `df_rx` is re-indexed after `age_bar` (post and `tutorial.qmd`) |
| "triples from 7% to 21%", "SE 2.3 percentage points" | Units are log points |

New facts surfaced and now in the post: only **73 workers switch** (36 join, 37 leave; 1,805 never,
321 always); joiners vs leavers give 0.345 vs 0.081 (Exercise 5); with all five waves two-way FE
falls to **0.040** and FD to 0.057 (Exercise 6), so the 0.21 estimate is specific to 2010–2012; a
cluster-robust pooled Mundlak test gives p = 0.106 (RE version 0.072).

## `index.md`

- Date bumped to 2026-10-02; new `summary`; FWL layout: 22 numbered sections (1.1 motivation,
  1.2 Bloom-verb objectives, 1.3 road-ahead Mermaid, 1.4 estimator-family diagram).
- Readability rewrite of the abstract and all body/Interpretation paragraphs (topic sentence, short
  sentences, at least three sentences, formal "we"). No em dashes, contractions or possessive
  apostrophes in visible prose; American spelling. Key-concept cards keep their terse style.
- Learning components: 6 predict cards (within share, FD vs POLS, FE vs FD, TWFE vs FD, CRE vs FE,
  TWFE age sign), 2 proof cards (FD = FE when T = 2 incl. the TWFE/intercept corollary; Mundlak
  coefficient = FE via FWL, any RE θ), 5 misconception cards, 6 graded exercises (21.1 Warm-up,
  21.2 Core, 21.3 Stretch) with solution cards whose output was produced by running the code.
- Two display equations shortened (FD in Δ notation; Hausman with d̂) to remove 375px overflow.

## New widget: `{{< panel-lab >}}`

`layouts/shortcodes/panel-lab.html`, `assets/js/panel-lab.js`, `assets/css/panel-lab.css` (fwl-lab
architecture: Scratch guard, js.Build + fingerprint + SRI, ES5 IIFE, `window.PanelLab` test hook,
`.dark` tokens, aria-live). Tab A *Selection lab*: simulated N = 2,199, T = 2, true effect 0.21,
defaults ρ = −0.15 / 3.3% switchers / σε = 0.30 give POLS 0.075, Between 0.066, RE 0.112, FE
two-way 0.209 (CI 0.111–0.306). Tab B *Demeaning lab*: 8-worker toy panel, raw/demeaned toggle,
draggable and keyboard-movable points (raw view), POLS 0.078, FE 0.260; moving a stayer leaves FE
unchanged. Documented in `.claude/docs/learning-components.md` (reference implementation #2) and the
CLAUDE.md Learning components line.

## Script and companions

- `script.py`: union-only basic TWFE, switcher patterns, FD without intercept, age-change counts,
  new `panel_intro_results.json`; docstring fixed (N = 2,199, 6 CSVs). Re-run; figures regenerated;
  `execution_log.txt` refreshed.
- Corrected numbers/claims only (no prose rewrite): `notebook.ipynb`, `references/tutorial.qmd` →
  `python_panel_intro.zip`, `slides/slides.qmd` → `slides/index.html` (quarto 1.8.27; the deck date
  now reads 2026-10-02 because it uses `date: today`), `results_report.md`,
  `infographic_instructions.md`, `data/data_dictionary.yaml` → data dictionary regenerated,
  `web_app/index.html` (TWFE/FD glossary, age bullet), `web_app/charts.js` comment.
  `SLIDES_REVIEW.md` and `results_report_review.md` are historical and unchanged.
- ES/JA stubs: summaries re-translated, dates bumped.

## Verification

All post code blocks executed in order in `.venv` (pyfixest 0.50.1, linearmodels 7.0); every printed
output matches its `text` block (the extended-models table comes from the script's printer, as
before). Notebook executes with nbconvert; `tutorial.qmd` code runs. `lint_learn_cards.py` OK;
production build exit 0 (baseline WARN only); rendered card counts 6/2/5/6; `check_learn_cards.cjs`
light/dark/375px OK; 0 page errors, 0 MathJax errors, no raw TeX; widget Node smoke test ALL PASS
and Playwright checks (both tabs, keyboard, aria-live, coexistence with fwl-lab).

## Open items

- `featured.webp` (infographic image) still shows "ONLY 9% WITHIN", a 94%/9% bar and "slope ≈ 0.08" (checked); regenerate from the
  corrected `infographic_instructions.md` if so.
- Pre-existing: `python_fwl` shows horizontal overflow in `check_learn_cards.cjs` (30px at 1280,
  349px at 375); not caused by this change.

## Addendum: Python, R and Stata cheat sheets

`cheatsheet_python.py`, `cheatsheet_R.R`, `cheatsheet_stata.do` (python_fwl pattern: local-first
loader with raw-GitHub fallback, 15 sections, traps, one comparison table). Linked from the front
matter (three `bolt` buttons after "Python script") and shipped in `python_panel_intro.zip`
(`build_bundle.sh` and the bundle README updated; zip rebuilt).

- Sections: vocabulary; structure and switchers; between/within shares; POLS and between; FD;
  FE three ways (absorbed, by hand, 2,199 dummies) with the df trap (by-hand iid SE 0.0360 ×
  √(4397/2198) = 0.0509); TWFE and both T = 2 identities (asserted); RE as OLS on quasi-demeaned
  data (θ = 0.6091; θ = 0 → POLS, θ = 1 → FE); two Hausman tests; CRE (RE and clustered pooled);
  controls; the within picture; five waves; 13 traps.
- Every row of the comparison table is asserted in each language against the post's numbers.
  R uses `fixest` + `plm` (RE SE = `vcovHC(method = "white1", type = "HC1")`); Stata uses only
  built-ins (`re_white` program: quasi-demeaned `regress, vce(robust)`), `reghdfe` cross-checked
  if installed. Run times: Python ~35 s, R ~20 s, Stata ~40 s (the 2,199-dummy regression).
- One row differs by design: RE + controls is 0.0861 in `linearmodels` (θ 0.5513) and 0.0862 in
  `plm`/Stata Swamy–Arora (θ 0.5515), all SE 0.0258 (trap 11).

Facts surfaced (not changed in the post):

- The textbook Hausman test (classical variances: Stata `hausman`, `plm::phtest`, identical in all
  three) gives **H = 5.62, p = 0.018 and rejects RE**. The post's H = 1.79, p = 0.180 plugs robust
  SEs into the classical formula, which is not a valid Hausman test (Stata's `hausman` refuses
  `vce(robust)` fits with r(198)). The classical RE Mundlak term also rejects (p = 0.018); the
  robust versions do not (0.072 RE-White, 0.106 clustered pooled). The abstract's "Neither
  specification test rejects random effects" holds only for the robust versions.
- Stata pitfalls: `xtset id year` without `delta(2)` makes every `D.` missing ("no observations");
  `xtreg ..., vce(robust)` clusters (RE SE 0.0314, not 0.0299); `xtreg, be` is classical (0.0332).
- pyfixest 0.50 and fixest 0.14 both default to iid SEs for `lwage ~ union | ID` (0.0509).

> Superseded in part by `2026-10-02-python-panel-intro-full-audit.md`: the post now reports the textbook Hausman test, RE/CRE with controls include a year effect, and the comparison table rows agree in all three languages.
