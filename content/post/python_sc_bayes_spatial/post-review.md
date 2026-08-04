# Post review — `index.md` (`python_sc_bayes_spatial`)

**Reviewed:** 2026-08-04 · **Verdict on review: MAJOR REVISION → all findings resolved**
**Method:** the 13 dimensions of `/project:review-post`, split across two independent
reviewers (dimensions 1–4, 12–13 and dimensions 5–11) so neither saw the other's
findings. Every numeric claim was then re-verified against `execution_log.txt` and the
23 CSVs before any edit was made. The headline MCMC was never re-run; dimension 1 was
satisfied by `ast.parse` on all code blocks, a line-ordered undefined-name scan,
line-by-line comparison of the output blocks against the execution log, and the
already-rendered `references/tutorial.html` (27 cells, 0 tracebacks).

## Scores

| Dim | | Before | Note |
|---|---|---:|---|
| 1 | Code execution | 6 | one output block had a row deleted; one `NameError` in reading order |
| 2 | Front matter and links | 7 | all 10 targets resolve; vestigial keys, "rungs" leftover |
| 3 | Markdown structure | 7 | 47 fences paired, 18 `<details>` balanced; no Colab badge, one heading jump |
| 4 | Code quality | 6 | five dead bindings, an unused import, a truncated block |
| 5 | Sandwich pattern | 7 | six headings dropped straight into code |
| 6 | Beginner accessibility | 6 | MCMC vocabulary and "rook contiguity" unglossed; toy arithmetic broken |
| 7 | Mathematical equations | 8 | all 18 render; one sign error in a gloss, one overloaded symbol |
| 8 | Interpretations | 7 | ~25 interpretation paragraphs; three misread their own tables |
| 9 | Writing clarity and grammar | 9 | no grammar or spelling errors found; `artifact`/`artefact` drift |
| 10 | Academic rigor | 5 | four statements would have misled a reader |
| 11 | Narrative flow | 8 | strong three-stage arc; two broken cross-references |
| 12 | Images, Mermaid, deliverables | 8 | 19/19 figures, no orphans; figure numbers out of reading order |
| 13 | Abstract | 9 | six beats in order, all numbers verified |

## Findings and outcomes

### HIGH

| # | File:line | Issue | Outcome |
|---|---|---|---|
| 1 | `index.md:959` | The `result.diagnostics(top_n_alpha=6)` output block showed 8 rows; the call produces **9**. The missing row is `beta[retprice]` — ESS **388**, R̂ 1.0060 — present at `execution_log.txt:131`. The claim immediately below ("Everything else in this model is easy; one scalar is hard") was only true with that row deleted. | **fixed** — row restored, column alignment recomputed to match the block, and the claim rewritten to "the two quantities leaning on the single contiguity channel are hard" |
| 2 | `index.md:765` | Sign error. BSCM fits $\beta_0 = +16.86$ with weights summing to 0.758, so its blend sits *below* California and the intercept lifts it. The gloss said "shifted **down** by 17 packs". | **fixed** — "shifted up", with the arithmetic ($0.758 \times 131.5 \approx 100$ against California's 117.7) spelled out |
| 3 | `index.md:1162` | The prior-predictive interpretation said "Eight of nine land comfortably inside". `ac1` = 0.996 and `ac2` = 0.9985 sit **further into their tails** than the one statistic the post flagged. | **fixed** — now "six of nine", with all three failures read as the same finding: a prior under-predicting persistence and common variance twice over |
| 4 | `index.md:1164` | "The R edition's own appendix flags the same statistic" is false. The R post has no appendix, and its prior-predictive passage says the opposite: all four observed lines land inside the cloud. | **fixed** — replaced with what the R edition actually does (a coarser four-statistic check at 1,000 draws) |
| 5 | `index.md:1011`, `analysis.py` | Figure 11's caption and alt text promised "95% credible intervals" that the figure does not draw and the data do not contain — `stage3_spillover_effects.csv` has empty `lo95`/`hi95`. Three prose passages then made significance claims resting on those absent intervals. | **fixed** — caption corrected in both `index.md` and `analysis.py`; the limitation is now stated explicitly, and the SUTVA verdict re-grounded on $\rho$'s interval (which does exist) rather than per-donor ones |

### MEDIUM

| # | File:line | Issue | Outcome |
|---|---|---|---|
| 6 | `index.md:966` | R̂ = 1.0154 described as "**below** the conventional 1.01–1.05 warning band". It is inside it. | **fixed**, with the Vehtari et al. (2021) threshold cited |
| 7 | `index.md:1276` | "The classical **and** horseshoe estimates understate by about 1.2 packs" conflates two different numbers. Recomputed: $\sum \alpha_j \xi_j = -1.1295$ on horseshoe weights, $-1.5132$ on simplex weights. | **fixed** — both reported; the classical estimate is identified as the more contaminated, because the constraint pushed more weight onto the leaking donor |
| 8 | `index.md:1362,1478,1491` | "One million iterations reaches an ESS of about 164" is unsourced **and** contradicted by the post's own budget table, where ESS per kept draw is flat at ≈0.00055 from 20,000 onward. Linear extrapolation gives ≈275. The "diminishing returns" reading was wrong. | **fixed** — the claim is gone; the section now reports the constant exchange rate the table actually shows, and exercise 4 was rewritten to match |
| 9 | `index.md:865,943,964,1478` | Slow mixing repeatedly relabelled as weak identification. $\rho$'s posterior is tight (sd 0.043 on a support 1.9 wide); the low ESS is autocorrelation from the random-walk Metropolis step. | **fixed** — the distinction is now drawn explicitly in both §9.6 and §19 |
| 10 | `index.md:594,896` | The $\lvert\rho\rvert < 0.95$ bound presented as following from invertibility. For row-normalised $W$ the mathematical bound is $\lvert\rho\rvert < 1$; 0.95 is a package safety margin — which matters, because §11.3's whole lesson is that the support constraint is a prior. | **fixed** in both places |
| 11 | `index.md:1392` | The coverage explanation cited RMSE 0.19 against bias 0.136, which would still cover ~83% of the time, not 0.2%. | **fixed** — reframed as posterior precision versus sampling accuracy under misspecification |
| 12 | `index.md:438` | §4.3 set `Y_no_treatment = [16, 22, 30]`, breaking the "A and B sum to 30 in every year" structure the section calls *the one structural fact that makes this tractable*, and sending B up 8 after a strictly falling trend. | **fixed** — `[18, 12, 30]` continues both trends, restores the sum, and leaves every printed number byte-identical (verified by execution) |
| 13 | `index.md:1462` | "Every estimator that targets this ATT reports between −15.7 and −18.8" is contradicted by §13's own `comparable: yes` rows — MVBBSC −23.13, SPOTSYNTH −26.32. | **fixed** — scoped to the ladder, with the wider comparable range stated |
| 14 | `index.md:213,1464` | The simplex's active-donor count given as **four** in two places against **five** everywhere else (New Hampshire's 0.0144 clears the same 0.01 threshold used for the horseshoe). | **fixed** in both |
| 15 | `index.md:1090` | "$\hat\rho$ moves from roughly 0.19 to roughly 0.35" appears in no CSV, log or table. | **fixed** — replaced with the substantive point about departure 1 having no usable escape hatch |
| 16 | `index.md` ×6 | Six headings dropped straight into a code block with no pre-explanation (§6.1, §8.2, §9.5, §10.1, §10.2, §16). | **fixed** — one paragraph added before each |
| 17 | `index.md` ×5 | Five code blocks assigned a result and printed nothing — two of them after minutes of MCMC. | **fixed** — prints added, each with a matching ```text block carrying the real output |
| 18 | `index.md:1297` | A comment promised a classical-MDS embedding; the block stopped at the shortest-path matrix, so `BPSCS` could not be reproduced from the post. | **fixed** — the full double-centring and eigendecomposition now shown, matching `analysis.py`, with its real output |
| 19 | `index.md:505,917` | `M_ITER`/`BURN` defined and then hard-coded 400 lines later. | **fixed** |
| 20 | `index.md:494` | `matplotlib.pyplot` imported and never used. | **fixed** (removed; `scipy.sparse.csgraph` moved up to the import block in its place) |
| 21 | `index.md:98` | "Rook contiguity" is load-bearing from the abstract onward and never defined. | **fixed** — glossed on first use |
| 22 | `index.md:687,869,890` | "Conjugate", "cut posterior" and "random-walk Metropolis" unglossed in a beginner-facing post. | **fixed** — inline glosses added |
| 23 | `index.md:711` | "Credible interval" used ~30 times, never distinguished from a confidence interval. | **fixed** — glossed at first substantive use |
| 24 | `index.md:59,1481` | "Rungs" survives after the site-wide rename (`bc1c52c`). | **fixed** in `index.md`, `notebook.ipynb` and `references/tutorial.qmd` |
| 25 | `index.md:83` | A Colab URL in `links:` with no badge in the body. | **fixed** |
| 26 | `index.md:1360` | Figure captions ran 16 → 19 → 17 → 18 in reading order. | **fixed** — captions renumbered (no prose cross-references figures by number; filenames untouched) |
| 27 | `results_report.md:111` | Reports the ρ=0 gap as −1.2488; the log and the arithmetic both give **−1.1863**. | **fixed** |

### LOW

All applied: the pre-treatment gap range (−3.6 → **−3.5**); the donor `sd` range (0.13–0.17 → **0.10–0.17**); the Monte Carlo bound (0.003 → **0.004**) and the monotonicity claim, which fails for SCM on the negative branch; the 0.44 acceptance target reattributed to Gelman, Roberts and Gilks (1996); "eight more estimators" reconciled with nine table rows; two broken cross-references (`section 5.1`, `Sections 13 and 14`); `artifact` → `artefact` in the post's own prose (the quotation at 1182 correctly keeps US spelling); `#### Acknowledgements` → `###`; the references section retitled, since eight entries are uncited; the streetlight analogy, which was a *positive*-spillover example sitting under a negative-spillover finding; the toward-zero rule qualified (it holds only when the true effect is negative); the eigenvalue $\lambda_i$ renamed $\mu_i$ to stop colliding with the horseshoe's local scale, and $W_n$ added to the symbol table; the toy `alpha` renamed `alpha_toy`; `{**common}` → `dict(common)`; `spill.mean()` no longer computed twice; `list(ppc.p_values)` → `.keys()`; the ESS 2.93/3 provenance; four vestigial front-matter keys removed; `icon: database` → `book` (39 posts to 1); the `\;` thick spaces converted to `\,` per the skill's AVOID list; the stray empty nested `content/` directory deleted.

## Considered and deliberately not changed

- **Nine concept cards** against the skill's stated range of 5–8. Folding one would remove teaching content from a post commissioned as comprehensive. The pairs are balanced and the blank-line rule is clean throughout.
- **Two blocks print a dataframe that the page then shows as a markdown table** (§10.2, §16). The duplication was judged worse than the mismatch: the markdown tables carry alignment and emphasis the raw `to_string` cannot, and the code above them documents provenance.
- **A handful of interpretations are delivered as bullet lists** rather than continuous paragraphs. In a 1,500-line post the lists aid scanning, and the convention is a preference rather than a correctness rule.

## Verification after fixes

- 24/24 Python blocks parse individually and concatenated; line-ordered undefined-name scan returns **none**
- `analysis.py` warm re-run: exit 0, **18/18 assertions pass**
- Hugo 0.111.3 `--gc --minify --buildFuture`: exit 0, 1,272 EN / 552 ES / 552 JA
- Rendered math: 18 display equations, **0** raw-LaTeX leaks, **0** `<em>` inside math spans, no banned constructs
- Figures: 19 referenced, 19 on disk, no missing, no orphans
- Concept cards: 18 `<details>`/`<summary>` balanced, 9 pairs, **0** blank-line violations
- The budget output block was verified to match, character for character, the f-string in the code block above it

---

*Produced by `/project:review-post` (dimensions split across two independent reviewers).
Unlike a stock run, this file records the resolution of each finding as well as the finding.*
