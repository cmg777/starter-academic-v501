# 2026-10-02 — python_did101: pre-teaching audit (pinned-version breakage, econometric wording, learning components, web-app cleanup)

The Python DiD tutorial (`content/post/python_did101/`, Corral & Yang 2024 tutoring panel, 35 schools,
2×2 and 8-period event study) was audited before being shared for teaching. Every artifact in the
folder was checked for econometric correctness, number consistency and pedagogy, against a fresh
run of `script.py` in a venv with the bundle's own pins (pyfixest 0.50.1, great_tables 0.21.0,
numpy 1.26.4, pandas 2.2.2, matplotlib 3.9.2). **All estimates are unchanged** from the April run;
the problems were code that broke under the pinned versions, wrong attributions, overclaiming
wording, and drift between copies.

## Breakage under the pinned versions (script, `tutorial.qmd`, post, notebook)

| Problem | Fix |
|---|---|
| `csw0(female_share)` raises `FormulaSyntaxError` in pyfixest 0.50.1 (≥ 2 arguments required) — the bundled Quarto tutorial could not render | `csw(txp, female_share)` everywhere; post explains the change |
| Event-study coefficients are now named `timeToTreat::-4.0`; the regex `T\.([-\d.]+)` matched nothing, so **the event-study figure came out silently empty** | Pattern `(?:::|\[T\.)(-?[\d.]+)\]?$` accepts both naming schemes |
| `print(fit_multi.etable())` printed a Great Tables object repr; the post showed a hand-formatted table | `pf.etable(models_list, type="df", coef_fmt="b* \n (se)")`; the post shows the real output |
| `etable(type="tex")` no longer adds stars by default, yet the table notes explain stars | `coef_fmt="b* \n (se)"`; post preamble now also lists `tabularx` |
| Table 4 marked significance with `abs(c)/(hi-c) > 1.96` (≈ \|t\| > 3.9) and always printed "***" | Stars from p-values (`*`/`**`/`***`) |
| `gt.save()` needs selenium + Chrome, not in any pin | Noted in the post's §2 and the bundle README |
| Post §5/§6 code did not round the means, so running it printed 25.31 / 10.89, not the 25.32 / 10.88 shown | Code now rounds like `script.py`; a note gives the exact 25.315 / 10.886 |

## Errors corrected (attributions and econometrics)

| Old claim | Correct fact |
|---|---|
| Corral & Yang DOI `10.1007/s12564-024-09984-9` (post, qmd, notebook) | Returns 404. Correct: `10.1007/s12564-024-09959-0`, *Asia Pacific Education Review* 25(3), 663–672 (Crossref) |
| CRV3 = "Bell-McCaffrey" | Bell-McCaffrey is CR2; CRV3 is the leave-one-cluster-out jackknife |
| "With only 35 clusters, CRV3 is the safer default" | The binding constraint is the **10 treated** clusters; wild cluster bootstrap mentioned (MacKinnon, Nielsen & Webb 2023) |
| Pre-trend coefficients "validate" parallel trends / "strong evidence" / "holds statistically" | Consistent with parallel trends, not proof; pre-tests have low power (Roth 2022) |
| Example cited "`lead-1` near zero" | t = −1 is the reference period, zero by construction |
| Key-concepts card: post-treatment effects "grow modestly … benefit accumulates" | Contradicted §11: effects are flat (25.03, 24.71, 24.77, 25.70) |
| Insignificant `female_share` "confirms the FE capture the relevant variation" | Does not follow; added a bad-control caveat |
| HC1 "the most common choice" with no panel caveat | HC1 ignores within-school correlation in this panel |
| Event-study equation had an undefined index `k`, a sum over the reference period and an intercept | $\sum_{j=-4, j\neq -1}^{3}\theta_j D_i \mathbf{1}[t-E_i=j] + \gamma_i + \vartheta_t$ with $D_i$, $E_i$ defined |
| "No school switches treatment status"; "staggered-on-simultaneously" (slides) | Absorbing treatment, single simultaneous adoption date |
| TWFE "generalizes naturally"; staggered bias stated without its condition | Bias arises with staggered adoption **and** heterogeneous effects (Goodman-Bacon 2021) |
| SUTVA: "schools serve distinct geographic catchments"; "both are testable" | Invented fact removed; SUTVA cannot be fully tested |

## `index.md`

- Podcast/video player block (≈ 585 lines of CSS/JS) moved from inside §1.3 to the end of the file,
  per `.claude/docs/ai-podcast-player.md`; both overlays verified to open.
- Learning components (`.claude/docs/learning-components.md`): 5 predict cards (§5, §7.2, §7.3, §8,
  §11.3); new `## 12. Common misconceptions` with 5 cards; Discussion/Summary/Exercises renumbered
  13–15; Exercises regraded Warm-up → Core → Stretch with 4 solution cards (first-difference
  regression, collapsing the event study, placebo test, smallest significant effect by SE type).
  Solution outputs come from running the code in the pinned venv. `lint_learn_cards.py` passes.
- Output blocks updated to the pyfixest 0.50.1 format; install line pinned.
- Front matter, title and summary unchanged, so the ES/JA stub cards need no update.

## Companion artifacts

- **`script.py`** — fixes above; re-run; all 10 PNGs, `did101_table2.tex` and `execution_log.txt`
  regenerated (numbers identical; event-study figure and Table 4 visually checked).
- **`references/tutorial.qmd`** — mirrors every post change; learning cards as Quarto callouts
  (tip / warning / collapsible note with executable solution chunks). Rendered end-to-end in an
  isolated pinned venv: no errors, event-study plot populated.
- **`notebook.ipynb`** — rebuilt from `tutorial.qmd` (it was an older, shorter version with unpinned
  installs and the wrong DOI); Colab install cell pins pyfixest 0.50.1 + great_tables 0.21.0;
  executed top to bottom with `nbconvert` (0 errors); committed with outputs cleared.
- **`python_did101.zip`** — rebuilt with `build_bundle.sh` (its `tutorial.qmd` also predated the
  Mermaid restyle); contents diff-identical to the sources.
- **`slides/`** — wording fixes in `slides.qmd` (pre-trends, CRV3, staggered, rounding note in the
  speaker notes); `index.html` re-rendered. Numbers unchanged.
- **`web_app/`** — Tab 1 still showed the Double-LASSO "L1 vs L2 shrinkage" animation; replaced by a
  parallel-trends/counterfactual animation built from the post's means. `lasso.js`, the LASSO DGPs
  and four unused chart builders removed; tooltip "α̂" → "Estimate". `results.json` regenerated at
  full precision: the naive row's non-reproducible SE 4.27 (CI 27.83–44.57) is now 0.525
  (CI 35.10–37.30), the SE-type CIs use PyFixest's t-based intervals, and the t = 1 label reads
  24.71. Asset URLs carry `?v=20261002`. Headless smoke test: no console errors, no `lasso.js` request.
- **Process files** — `infographic_instructions.md` panel 5 reworded ("supports", not "confirms");
  dated addenda appended to `slides/SLIDES_REVIEW.md` and `web_app/REVIEW.md`.

## Verification

- Hugo 0.111.3 `--gc --minify` build clean; rendered page has 5 predict / 5 misconception /
  4 solution cards, the Mermaid diagram, both overlays; equation and cards checked in a browser.
- Every key number (25.315, 25.328, 36.20, 10.88, SEs 0.6071/0.5852/0.5851/0.6373, event-study
  coefficients, p = 0.714) traced to the fresh `execution_log.txt`.
