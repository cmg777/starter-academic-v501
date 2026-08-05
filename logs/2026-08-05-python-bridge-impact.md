# 2026-08-05 — the Jamuna Bridge difference-in-differences tutorial

**Status: shipped, uncommitted.** New long-form tutorial at
`content/post/python_bridge_impact/`, replicating Blankespoor, Emran, Shilpi & Xu (2021),
*"Bridge to bigpush or backwash? Market integration, reallocation and productivity effects of
Jamuna Bridge in Bangladesh"*, *Journal of Economic Geography*.

Hugo 0.111.3 builds clean. `analysis.py` exits 0. **122 of 122 published coefficients reproduce
to the printed three decimals**; 113 also reproduce the standard error exactly.

## What changed

| Artifact | Detail |
|---|---|
| `analysis.py` | 1,540 lines, 17 sections. 21 figures, 21 CSVs, `execution_log.txt` (596 lines). ~95 s |
| `index.md` | ~1,700 lines, 22 numbered sections, 13 display equations, 8 concept cards, 5 Mermaid diagrams, 21 captioned figures |
| `results_report.md` | 14 method subsections, 12 key findings, all 7 caveat categories, reproduction audit appendix |
| `notebook.ipynb` | 51 cells for Colab; executes end to end and reproduces the published numbers |
| `cheatsheet_python.py` | one-page DiD reference, 11 sections, ending with 10 traps that fail silently |
| `analysis.do` | Stata companion mirroring the Python, with the `$trimL` bug fixed |
| `references/` + `.zip` | hermetic `.venv` bundle; verified by rendering from a clean temp dir |
| `slides/` | 40-slide reveal.js deck, 4 acts, plus a 2.3 MB PDF export; renders clean, verified in-browser |
| `web_app/` | 5 tabs, D3 v7 pinned with SRI; all 10 charts verified in-browser |
| `data/` | 5 datasets documented; labeled `.dta` v118, `stata_codebook.do`, download-all ZIP |
| i18n | ES + JA stub cards |
| `.gitignore` | `referenceMaterials/` excluded — manuscript, appendix and the authors' `.dta` files |

## The design, in one line

Two-group, non-staggered DiD. Treated: 123 upazilas in the Jamuna hinterland, connected by a
bridge in June 1998. Comparison: 125 upazilas in the Padma hinterland, cut off by the other great
river, whose own bridge was not begun until 2015 — so it stayed isolated for the whole 1988–2013
window. The Dhaka–Chittagong core is excluded.

## Headline result, and why it matters methodologically

| Outcome (KOBDR) | Short run | Long run |
|---|---:|---:|
| Nighttime lights | +4.9% | **+11.2%** |
| Rice yield | +1.2% (n.s.) | **+7.9%** |
| Population density | **−2.5%** | **+5.9%** |
| Manufacturing share | −0.6 pp (n.s.) | **−1.2 pp** |
| Services share | **+2.0 pp** | **+2.4 pp** |

Backwash and comparative advantage make the *same* prediction about manufacturing, so the industry
coefficient alone settles nothing. They disagree about people. Density rises, so backwash is
rejected: the region specialised rather than declined. That the pooled density effect is
insignificant (+2.5%, p = 0.10) while the split is a clean sign reversal is the post's best
argument for never trusting an averaged null.

Spatially, the average hides a reversal too. Long-run rice yield: +4.9% nearest, +6.5% middle,
**+26.5%** farthest. Services employment: **−2.6 pp** nearest, **+5.9 pp** farthest.

## Three things that had to be right for 122/122

Each of these produces wrong numbers without producing an error:

1. **`ln(0)` must become missing, not `-inf`.** 24 employment rows have zero recorded rainfall.
   Stata drops them; NumPy keeps them and the sample never falls from 744 to 738.
2. **The dof correction excludes the fixed effects.** Stata's `xtreg, fe` uses
   `G/(G-1) · (N-1)/(N-K)` with `K` counting only non-absorbed regressors. Counting the FEs
   inflates every standard error by roughly 20%.
3. **Distance terciles are cut at different points in different do-files.** `nite_2021.do` cuts
   before dropping rows with missing controls; `employment_2021.do` drops first. This was the last
   discrepancy resolved — it moved every nightlights heterogeneity coefficient in the third decimal.

## diff-diff API notes worth keeping

- `DifferenceInDifferences(...).fit(..., treatment='treat', time='post', absorb=[unit,'year'])`
  reproduces Stata exactly. `fixed_effects=` gives the same coefficient and a different SE (0.0238
  vs 0.0220) because it counts the dummies in `K`.
- `TwoWayFixedEffects` is **not** a drop-in substitute here: `time='year'` returns 0.0184 (a
  different model), `time='post'` returns 0.1339 (only one post dummy, not seven period effects).
- Multi-absorb is **rejected** with survey weights. For the weighted columns, absorb the unit and
  pass explicit year dummies as covariates, with
  `SurveyDesign(weights=..., weight_type='aweight', psu=unit)`.
- That survey path uses a design-based Taylor-linearisation variance, not the classical cluster
  sandwich. Point estimates match to 9 decimals; SEs diverge, most visibly on the nine-cluster
  yield panel (0.034 vs 0.023). Documented in the post as an estimator-agreement table rather than
  smoothed over.
- `MultiPeriodDiD(reference_period=…)` reproduces the paper's short-run/long-run split exactly and
  gives the event study the paper never drew.

## Defects found inside the shipped replication package

Documented in §18 of the post, framed constructively — none changes a conclusion, and all four are
only knowable *because* the authors published a complete package.

1. **`nite_2021.do` never defines `$trimL`.** `gen cut11 = r(p$trimL)` expands to the non-existent
   `r(p)`, every cutoff is missing, and since any number is less than missing in Stata the trim
   fires for every comparison unit. The regression then runs on treated units only and prints
   **1.064 (se 0.710), N = 868, 124 upazilas**. Reproduced exactly; matches the archived
   `nlite_mean.txt`. The published paper uses the correct `nlite2_*` numbers.
2. **Published Table 3's coefficient column is shifted one row down** from "Hospitals" onward
   relative to `did_vill.txt`. The printed "Cooperatives" SR of 0.420 is actually `post_office`;
   the true value is 0.090 (0.108). The N column follows the correct labels.
3. **§8.1.2 text vs Table 4.** The text says long-run yield gains peak at intermediate distance;
   the table shows the farthest band (0.265) dominating the middle (0.065).
4. **§7.3** describes an estimate as "statistically significant" where the surrounding argument
   requires *in*significant.

## Verification performed

- `python3 analysis.py` → exit 0, 122/122 audit matches, four sample-size chains confirmed
  (738/714 & 246/238; 1729/1673 & 247/239; 88/72 & 11/9; 1543 & 37)
- `hugo --gc --minify --buildFuture` → clean, 1291 EN / 552 ES / 552 JA pages
- Browser: 93 MathJax containers, **0 render errors**; 5 Mermaid SVGs; 21 figures; 16 concept cards
- `notebook.ipynb` executed end to end against local CSVs; reproduces OLS 0.0881, LWDR 0.1058,
  KOBDR 0.1087, density SR −0.0248 / LR +0.0590
- Quarto bundle rendered from a **clean temp dir** after unzip: venv built, kernel registered,
  `tutorial.html` produced
- `slides/index.html` rendered and inspected in-browser: 40 slides, math and figures correct
- `web_app/`: all 10 D3 charts render, tab switching and toggles verified interactively

## Review pass (same day, `review-post` all 13 dimensions)

Ran the audit, then fixed everything it found. Verdict before: MAJOR REVISION (4 HIGH). After: clean.

**The structural fault.** The post's code blocks were never runnable in order. Exploratory analysis
sat *before* data preparation, so `NL`, `EMP`, `YLD`, `VILL`, `nlp` and `es_nl_res` were all used
before they existed, and `mdist` — the minimum of the two river distances, the variable the whole
symmetric design rests on — was never constructed at all. Concatenating the blocks died at §6.2 with
`NameError: name 'NL' is not defined`, and would have died again at `KeyError: 'mdist'`.

Fixed by swapping the two sections and filling the gap:

- **§6 Data preparation** now precedes **§7 Exploratory analysis**. §7.5 is the old §7.3.
- New **§6.1** writes out `add_common()` in full — which surfaces the `ln(0)` trap at the line where
  it happens, rather than only in §17's retrospective.
- New **§6.4** builds `NL`/`EMP`/`YLD`/`VILL`/`HH` from the `smp1` filter, prints 1729/247, 738/246,
  88/11, and states the lower-case-frame / upper-case-sample convention the post had been using
  silently.

**Every output block is now produced by the code shown.** Ten blocks were previously formatted
summaries of `analysis.py` output that the post's own snippets never printed; those snippets now
print them. Verified mechanically: 25 of 25 blocks match a fresh run of the extracted blocks, exit 0.

**Three other HIGH fixes.**

1. §15's band snippet was the naive `pd.qcut` over all three datasets — the exact trap §17 warns
   about. Measured: it reassigns 2 upazilas (14 observations) and shifts every nightlights
   heterogeneity coefficient in the third decimal. Replaced with the two-step cut.
2. §7.5 contradicted itself — "No trend difference is significant at 5 percent in any panel under
   any estimator" followed immediately by $p = 0.022$. Rewritten to state the significant unweighted
   nightlights pre-trend plainly, then show it falling to $p = 0.16$ under both DR estimators. The
   honest version is the stronger one: it is the best argument in the post for the weights.
3. §5.2's `head(4)` showed `10419 / 1.150000`; the shipped CSV starts at `10409 / 1.016667`.

**Medium and low.** Concept card 4 taught `fixed_effects=` where §9.2 says to use `absorb=`; card 2
paired `check_parallel_trends`'s SE (0.092) with the equivalence test's p-value; §11.5 claimed LWDR
and KOBDR land "within 0.003 everywhere" (0.009 on the yield panel); `Conley` is
`diff_diff.conley`, not a top-level export; Colab badge added; 21 figure captions added;
`#### Acknowledgements` → `##`; em dashes in `summary:`; a 61-word abstract sentence split;
Exercise 10's "thirteen" village regressions → twelve.

## Added after review

- **Podcast** — Spotify episode `4U2j7kAwgmzWuugvm2cbav`, resolved from the Creators share link.
  `links:` entry plus the embed iframe above the Abstract, matching `python_sc_bayes_spatial`.
- **Slides (PDF)** — `slides/Infrastructure_Impact_Econometrics.pdf` (2.3 MB), absolute URL so it
  opens in a new tab. Publishes correctly as a page-bundle resource (`200 application/pdf`).

## Verification after the review pass

- Post's own code blocks, extracted and run: **exit 0**, all 25 output blocks match
- `analysis.py` unchanged: exit 0, 122/122
- `hugo --gc --minify --buildFuture`: clean, 1296 EN / 552 ES / 552 JA
- Browser: **97 MathJax containers, 0 errors**, no raw LaTeX leaks, 5 Mermaid SVGs, 21 captions,
  16 concept cards, 12 link buttons, Spotify iframe and Colab badge both present
- 13 display equations, 0 unescaped `_`, 0 fragile constructs, 0 `--` in prose
- All bundle resources resolve: slides HTML/PDF, web app, data dictionary, `.py`, `.do`, `.zip`

## Follow-ups not done

- `featured.webp` — left for manual addition, per standing preference
- The infographic image itself — `infographic_instructions.md` holds the prompt; generation is manual
- Nothing is committed; `git status` is left dirty for review

---

## Follow-up: internal review documents were publicly served

Found while verifying that this post's own review reports stayed unpublished. They did — but
`content/post/r_dynamic_bma2/` has **no `index.md`**, so it is not a leaf bundle, and Hugo was
turning each of its working documents into a live page:

```
/post/r_dynamic_bma2/plan/
/post/r_dynamic_bma2/readme/
/post/r_dynamic_bma2/results_report/
/post/r_dynamic_bma2/results_report_review/
/post/r_dynamic_bma2/script-review/
/post/r_dynamic_bma2/web_app/review/
```

All six were in `sitemap.xml` and in the JSON search index. The directory has no post — only the
pipeline's intermediate artifacts, committed in `dc14d530` and `0e9f0e16`.

**Root cause is structural, not local.** In a leaf bundle these files are page *resources* and Hugo
never publishes them; in a directory without an `index.md` they are ordinary content files and each
becomes a page. `r_dynamic_bma2` was the only such directory today, but 412 working documents across
`content/` sit behind that same single condition.

**Fix:** seven filename patterns added to `ignoreFiles` in `config/_default/config.yaml` —
`plan.md`, `README.md`, `results_report.md`, `results_report_review.md`, `script-review.md`,
`REVIEW.md`, `SLIDES_REVIEW.md`. This closes the six pages and makes the other ~400 immune to the
same mistake. Nothing links to any of them as a Hugo resource, so ignoring them costs nothing.

**Verified by diffing the full published-URL set across the two configs:**

- **6 URLs removed, 0 added** — exactly the six documents above
- 1914 → 1908 published pages
- `r_dynamic_bma2/web_app/index.html` (the real app) still publishes
- every post spot-checked still renders, including this post's slides, web app, data dictionary
  and slides PDF

The `Pages` figure in Hugo's build summary drops 1300 → 1159 because it counts the ignored in-bundle
`.md` resources; the published-page count is the one that moved by six.

**Not done:** `r_dynamic_bma2` still has no post. The directory holds a finished analysis, a results
report and a working web app with no `index.md` to present them. Writing that post is a separate
decision.
