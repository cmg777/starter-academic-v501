# 2026-08-04 — the Python edition of the Bayesian spatial synthetic control post

**Status: shipped.** New long-form tutorial at `content/post/python_sc_bayes_spatial/`,
the Python counterpart of `r_sc_bayes_spatial`. Hugo 0.111.3 builds clean;
`analysis.py` exits 0 with 18/18 assertions passing.

## What changed

| Artifact | Detail |
|---|---|
| `analysis.py` | 1,320 lines, 15 sections. 19 figures, 23 CSVs, `execution_log.txt` (446 lines). ~60 min cold, <60 s warm |
| `index.md` | ~1,500 lines, 21 sections, 18 display equations, 9 concept cards, 4 Mermaid diagrams, 12 tables |
| `notebook.ipynb` | 36 cells for Colab, tutorial MCMC budget |
| `cheatsheet_python.py` | the whole argument in ~250 runnable lines, asserts it finishes inside 180 s |
| `references/` + `.zip` | hermetic `.venv` bundle, `tutorial.qmd` derived mechanically from `index.md` |
| `slides/` | 44-slide reveal.js deck, 3 acts; `quarto render` + Playwright math check both clean |
| `web_app/` | 4 tabs, D3 v7 pinned with SRI, 26/26 data-contract checks, browser-tested |
| `data/` | 3 datasets documented — the panel **and both spatial objects**, republished as Stata `.dta` v118 |
| i18n | ES + JA stub cards |
| Cross-link | reciprocal "Python edition" button added to `r_sc_bayes_spatial/index.md` |

## Why the two editions report different numbers

This is the post's centrepiece rather than an embarrassment to be smoothed over.

The R edition reports ATT −16.59 with a 95% credible interval **0.384 packs
wide**. This edition reports −16.868 with an interval **12.713 wide** — a factor
of 33. `scspill` documents six departures from the authors' R replication code;
three have escape hatches, so the Python code can be put back into the R
specification and run:

| Specification | Iterations | ATT | Width | ρ̂ | ESS(ρ) |
|---|---:|---:|---:|---:|---:|
| R edition (published) | 5,000 | −16.590 | 0.384 | 0.2226 | 2.9 |
| scspill, R spec | 5,000 | −16.286 | 0.482 | 0.2282 | 3.3 |
| scspill, R spec | 500,000 | −16.796 | 0.702 | 0.3134 | 66.9 |
| **scspill, corrected** | **500,000** | **−16.868** | **12.713** | **0.3161** | **136.8** |
| mlsynth `SPILLSYNTH(sar)` | 500,000 | −16.525 | 0.757 | 0.2476 | 135.2 |

Running the Python code in the R specification **reproduces the R edition
including its pathology** — ρ̂ to 0.006, ESS to 0.34, Nevada's spillover to 0.028
packs. So the gap is not a porting error.

The decisive row is the third. **A hundredfold increase in iterations widens the
R-specification interval only from 0.482 to 0.702.** Chain length was never the
cause. `propagate_alpha` was: the R code varies ρ while holding the donor
weights at their posterior mean, so its interval carries no uncertainty about
which states make up synthetic California. Two separable failures — one
diagnosable by effective sample size, one by asking what the interval
conditions on — and the published interval failed both.

## Headline results

- ATT: **−18.43** (simplex) → **−15.68** (horseshoe, no intercept) → **−16.87** (spatial). Spread across the whole ladder 3.17 packs; every stage agrees on the sign.
- ρ̂ = **0.316**, 95% CrI [0.231, 0.403] — excludes zero, so SUTVA on the donor pool is rejected by the model that nests it.
- Nevada spillover **−5.50** packs per capita per year, **11.2×** Idaho's −0.49.
- Max |Python − R| across the four comparable stages: **0.278 packs**.
- The bias identity checks out: Σ αⱼξⱼ = −1.1295 against a purged-minus-contaminated difference of −1.1863, Nevada contributing −1.098 of it.

**The spillover sign is the surprise.** The prior hypothesis was cross-border
shopping *raising* Nevada's sales. The estimate says they fell — so the
classical estimate is biased toward zero and **understates** the effect by 1.19
packs.

## Decisions worth recording

- **Headline budget is 500,000 iterations, not the plan's 100,000.** Section 14 is the evidence: the ATT moves by 0.337 packs across the whole budget ladder while ESS(ρ) moves 2.8 → 136.8, and the conventional floor of 100 is not reached until 500k. A separate run at 1M reaches only 164, so returns flatten sharply.
- **Treatment year pinned at 1988 everywhere.** `scspill` uses 1988; ADH and mlsynth's own example use 1989. The script rebuilds the dummy and asserts it, so all three stages and the benchmark share a post-period.
- **Stage 2b costs no extra MCMC.** `SCSPILLConfig` has no `rho` field, but the ρ = 0 case is exposed as `result.effects_detail.att_scm`, so Stage 3 is fitted first and Stage 2 narrated from it.
- **`mlsynth.BSCM` is not the same model as scspill at ρ = 0.** They disagree by 3.17 packs because BSCM fits an explicit intercept (posterior mean 16.86) and its weights sum to 0.758. scspill's ρ = 0 case matches the R edition to 0.158, which identifies BSCM as the one answering a different question. The post reframes this as "two Bayesian synthetic controls, one intercept apart" rather than claiming agreement.
- **The benchmark table carries a `comparable` column.** All 9 mlsynth estimators ran; three target a different estimand (`SPILLSYNTH(cd)` uses a demeaned leave-one-out baseline, `SpSyDiD` reports three effects at once, `ISCM` a different normalisation). Reading them against the ladder would be the easiest way to draw a false conclusion from a tidy table.
- **The Geweke test is run at two chain lengths, and the production kernel is deliberately not tested.** Its docs call that kernel "effectively untestable at feasible chain lengths". Running the simplified kernel at 20k and 200k shows max |z| falling 3.48 → 2.50 and `passed` going False → True — the documented signature of a mixing artifact rather than an incoherent conditional.

## Defects found and fixed

1. **Figure 10's cartogram encoded a `**0.45` power transform against a linear colourbar**, so Idaho's 0.49 rendered like a 2.3. Now linear, with a comment explaining that the resulting pale field *is* the finding.
2. **Cartogram tile labels used `state[:2]`** — four states begin "Ne". Now real postal codes, on a corrected US tile grid.
3. **`index.md` shipped invalid Python**: an f-string with escaped quotes inside `df.query(\"...\")`. Never executed in the post, fatal in the tutorial. Rewritten.
4. **Eight names were used in the post's code blocks without ever being assigned** (`W`, `w`, `X`, `X_pre`, `Y0_pre`, `Yc`, `Yc_pre`, `scipy`). A reader copying the blocks in order would have hit `NameError`. All now defined where first needed.
5. **`PriorPredictiveResult` has no `.table`** — it exposes `observed`/`stats`/`p_values`. Both `analysis.py` and `index.md` corrected; the table now shows observed values too (`pve_pc1` = 0.625).
6. **`GewekeReport` does its own Bonferroni bookkeeping** (`n_flagged`, `passed`, `z_crit`). Replaced a hand-rolled threshold that happened to agree.
7. **`mlsynth` stores posterior chains as `(n_donors, n_draws)`**, not the other way round. The extractor now collapses whichever axis is not the donor axis rather than assuming.

## A site-wide Hugo fix came out of this

**Rendering a post's Quarto bundle in place breaks the local Hugo build**, and
it took a while to see because the failure is remote from the cause:

```
Error: Error building site: ".../references/.venv/lib/python3.10/site-packages/
jupyter_server/templates/404.html:1:1": unmarshal failed: invalid character '%'
```

`setup_env.py` builds a hermetic `.venv` next to `tutorial.qmd`. It is
gitignored, so **Netlify never sees it** — but a local build does, and Hugo
tries to parse a Jinja template inside `jupyter_server` as front matter. The
whole build then fails and the post silently disappears from `public/`; the
symptom I first chased was "why is `slides/index.html` not published?"

The existing top-level `ignoreFiles` entry `/\.venv/` does **not** cover this,
because these files are page-bundle *resources* rather than content files.
Fixed at the mount instead, in `config/_default/config.yaml`:

```yaml
excludeFiles:
  - '{es,ja,cv}/**'
  - '**/.venv/**'
  - '**/.quarto/**'
```

Verified: the site now builds clean (1,270 EN pages, 233 files under this post)
with the `.venv` present, and nothing from it leaks into `public/`. This was
latent for every post with a `references/` bundle — ours is simply the first
whose venv existed at build time.

## Verification

| Check | Result |
|---|---|
| `analysis.py` cold run | exit 0, 18/18 assertions, 19 figures, 23 tables |
| Hugo 0.111.3 `--gc --minify --buildFuture` | exit 0, 1,266 EN / 552 ES / 552 JA pages |
| Rendered math | 18 display equations, 0 raw-LaTeX leaks, 0 stray `<em>` in math |
| Figures referenced vs on disk | 19 / 19, none missing, none orphaned |
| Slides `quarto render` | exit 0, 44 slides |
| Slides Playwright math check | 44 slides traversed, no raw LaTeX |
| Web app data contract | 26/26 checks, every `D.<key>` used in JS present in `results.json` |
| Web app in Chrome | 4 tabs render, both sliders drive redraws, no page errors |
| Data dictionary | 3 datasets, 3 `.dta` verified at release 118 |
| numba vs numpy backends | identical (`att = -17.3352` both), numba 5.6× faster |

## Confirmed non-issues

- **The `[numba]` install failing in the bundle venv is handled.** `setup_env.py` fell back to Python 3.10, where `llvmlite` has no wheel; the retry-without-extras path I added fired, installed plain `scspill`, and the tutorial runs on the numpy backend. This was observed for real, not just designed for.
- **A 404 on the local test server** is `favicon.ico`; Hugo serves the site favicon in production.
- **`SPILLSYNTH(sar)` is fitted twice at 500k** (994 s + 1,094 s) — once as the standalone cross-check, once inside the benchmark sweep. Redundant, but it keeps the two sections independently cacheable and both are cached after the first run.

## Deferred

- **`featured.webp` is not present** — added by hand, as always.
- **No infographic image was rendered.** `infographic_instructions.md` is written and ready.
- **The deck carries 6 speaker-note blocks** across 44 slides. Enough to present from, thinner than the R edition's every-slide coverage.
- **`p_factors = 1` may be too few.** The prior predictive check flags `pve_pc1` at p = 0.028 with an observed 0.625; the R edition's appendix flags the same statistic. A two-factor run is the obvious follow-up.

---

# Review pass — 2026-08-04 (same day)

The Write half of the pipeline had run in full; the Review half had not. Only
`script-review.md` existed. Four review skills were run — `review-post`,
`review-slides`, `review-app`, `review-infographic` — across five parallel
subagents, `review-post` split in two along the skill's own `focus:` table so
neither reviewer saw the other's dimensions. Fix policy was
**fix-everything-including-LOW**.

## Guard, because the reviewers can write

`audit-subagent-readonly` records that read-only audit agents sometimes edit
files anyway. The usual remedy — `git status` + `git restore` — does not work
here, because the whole post directory is untracked. So a tarball plus a
202-file checksum manifest was taken first. **The diff afterwards showed exactly
two additions, both the agents' own designated report files.** Nothing else in
the post, and none of the three companion files outside it, was touched.

## Verdicts

| Review | Verdict | HIGH | Report |
|---|---|---:|---|
| Post (13 dimensions, two reviewers) | MAJOR REVISION | 5 | `post-review.md` |
| Slides | MAJOR REVISION | 0 | `slides/SLIDES_REVIEW.md` |
| Web app | MAJOR REVISION | 1 | `web_app/REVIEW.md` |
| Infographic | MAJOR REVISION | 6 | `infographic-review.md` |

Every finding was re-verified against `execution_log.txt` and the CSVs before
any edit. All 12 HIGH findings were real.

## The five that mattered most

1. **The diagnostics output block was missing a row.** `result.diagnostics()`
   emits nine; the post showed eight. The absent one is `beta[retprice]`, ESS
   **388** — and the sentence directly beneath it ("everything else in this
   model is easy; one scalar is hard") was only true with that row deleted.
2. **The intercept gloss had the sign backwards.** BSCM fits β₀ = **+16.86**
   with weights summing to 0.758, so its blend sits *below* California and the
   intercept lifts it. The post said "shifted down".
3. **The prior-predictive check was read too kindly.** `ac1` at 0.996 and `ac2`
   at 0.9985 sit *further* into their tails than the one statistic the post
   flagged. And the claim that the R edition's appendix flags the same statistic
   is false — the R post has no appendix, and says all four of its statistics
   land inside the cloud.
4. **Figure 11 promised credible intervals that do not exist.** `scspill`
   returns the effects panel as posterior means, so `lo95`/`hi95` are empty in
   the CSV. Three prose passages rested significance claims on them. The SUTVA
   verdict is now grounded on ρ's interval, which does exist.
5. **"One million iterations reaches an ESS of about 164" contradicted the
   post's own table.** ESS per kept draw is flat at ≈0.00055 from 20,000 onward,
   so ESS grows close to *linearly* and extrapolation gives ≈275. The
   "diminishing returns" framing was wrong; the honest reading is a constant,
   poor exchange rate.

## Two claims corrected in the other direction

- **The bias figure was conflating two numbers.** Σαⱼξⱼ = **−1.1295** on
  horseshoe weights but **−1.5132** on simplex weights. The classical estimate
  is the *more* contaminated of the two, because the constraint pushed more
  weight onto the one leaking donor.
- **Slow mixing is not weak identification.** ρ's posterior is tight — sd 0.043
  on a support 1.9 wide. The low ESS is autocorrelation from the random-walk
  Metropolis step, not thin data. The post now draws the distinction.

## Web app: one root cause behind most of the findings

`styles.css` is the verbatim shared template, but `index.html` was written with
a different class vocabulary — **six classes had no rules at all**. `.chart-card`
rendered transparent, `.mini-btn` fell back to an OS default button in Arial on
a navy page, and the range inputs lost their styled thumb. All six are now
defined, with 44px touch targets.

Two `-0` bugs also surfaced only at ρ = 0: `vals["Nevada"] || NaN` reads `-0` as
falsy, and a comparator over all-zero values makes the sort a no-op, so "the ten
largest spillovers" became ten arbitrary states with Nevada absent.

And the thinning slider taught the wrong lesson. Measured on the app's own data,
ESS is **flat** from k=1 to k=18, and past k≈44 the *fixed-step* chain overtakes
the adaptive one on estimator noise alone. Slider capped at 20; the text now
says what actually happens.

**The ρ→P bug is worth remembering.** `text-transform: uppercase` maps Greek ρ to
capital Rho, so the stat tiles read "ATT AT THIS **P**". The first fix,
`font-variant-caps: all-small-caps`, reproduces it exactly — caught only by
zooming into a screenshot. The working fix keeps the uppercase look and exempts
non-Latin runs in markup.

## A second site-wide Hugo fix

The `.venv` exclusion added earlier today did not cover Quarto's execution
cache. `references/_freeze/` is gitignored, so Netlify never sees it, but a local
build published it into `public/`. Added `'**/_freeze/**'` to the same mount
`excludeFiles` in `config/_default/config.yaml`. Local builds now match
production exactly: **0 files leaked, 232 under the post.**

## Declined, deliberately

- **Nine concept cards** against the skill's 5–8. Folding one removes teaching
  content from a post commissioned as comprehensive.
- **Deck length, 44 slides against a 20–30 seminar band**, and the ~20 slides
  over the 60-word density cap. Cutting means dropping content; the nine new
  speaker-note blocks address the presenting problem instead. Flagged, not
  silently left.
- **Two code blocks print a dataframe the page then shows as a markdown table.**
  The duplication was judged worse than the mismatch.

## Verification after the fixes

| Check | Result |
|---|---|
| `analysis.py` warm re-run | exit 0, **18/18 assertions**, every headline number unchanged |
| Code blocks in `index.md` | 24/24 parse; line-ordered undefined-name scan returns **none** |
| Hugo 0.111.3 `--gc --minify --buildFuture` | exit 0, **1,272 EN / 552 ES / 552 JA** |
| Published artifacts | all 5 present; `notebook.ipynb` absent; **0** `.venv` or `_freeze` leakage |
| Rendered math | 18 display equations, **0** raw-LaTeX leaks, **0** `<em>` in math, no banned constructs |
| Figures | 19 referenced, 19 on disk, none missing, none orphaned |
| Concept cards | 18 `<details>`/`<summary>` balanced, **0** blank-line violations |
| Deck | `quarto render` exit 0; browser: 44 slides, **0** raw LaTeX, 42 math spans, **0** errors, 12/12 figures with alt text |
| Web app | Chrome, 4 tabs, both sliders: **0 page errors, 0 console errors**; 9/9 SVGs named |
| Bundle | `tutorial.qmd` regenerated from the corrected `index.md`, 22 frozen output blocks dropped; zip 15 files, no `__MACOSX`/`.DS_Store`/`.venv`/`_freeze` |
| i18n parity | post 96/96, 0 missing |
| Link targets | all 6 local targets resolve; no bare `/slides/` or `/web_app/` hrefs |
| Infographic | **26/26** numeric claims verified against the CSVs |
| Branding | `site-brand.scss` and `title-slide.html` still byte-identical to the templates |

---

# Colab notebook rebuild — 2026-08-04 (same day, after the push)

`notebook.ipynb` shipped in the two commits above and was **broken on arrival**.
Three separate problems, one of them mechanical and total.

## It did not display, and the cause was one line

Every `source` array stored its lines without trailing `\n`:

```json
"source": ["# Bayesian Spatial Synthetic Control in Python", "",
           "## California's Proposition 99 with `scspill` and `mlsynth`"]
```

nbformat defines `source` as a list whose **concatenation** is the cell body. With
the newlines gone, Colab and GitHub render each cell as a single run-on line:
markdown headings merge into a paragraph and every code cell becomes one
syntactically invalid line, which indentation-based Python cannot survive.

The cause was one line in the generator:

```python
"source": src.strip("\n").split("\n")      # drops every newline
```

Measured against the siblings: `python_sc_dsc_sdid` has 438/493 lines
newline-terminated and `python_ml_random_forest` 295/327 — the shortfall in each
being the correctly-bare last line of a cell. This notebook had **0 of 493**. It
was the only broken notebook on the site.

Fixed at the generator, not in the JSON, so it cannot come back:

```python
def _lines(src):
    body = src.strip("\n").split("\n")
    return [l + "\n" for l in body[:-1]] + body[-1:]   # last line stays bare
```

## It was also thin, and its sections were its own

The post carries **24 Python blocks across 21 sections**; the notebook had 18
cells under a private 0–10 numbering that did not track the post. Absent
entirely: §4 (the by-hand three-donor derivation), §11 Diagnostics (prior
predictive, Geweke, prior sensitivity), §14 chain budget, §15 Monte Carlo, §16
the ladder.

Rebuilt to **90 cells (59 markdown, 31 code)** mirroring the post's own numbering
and titles, so the two can be read side by side and Colab's table of contents
lands on the same sections. One or two lines of prose per section plus the
equations that carry the argument; the discussion stays in the post.

## The install cells, which is where a Colab notebook actually fails

Three defects beyond the newline damage:

- **No fallback for the `[numba]` extra.** The post and `references/setup_env.py`
  both carry one; the notebook did not. numba lags each new CPython release by
  months, so on a newer Colab image the whole install failed. `%pip` is a magic
  and cannot take the post's shell `||`, so the fallback is now a `subprocess`
  helper that reports which path it took.
- **Restart detection only fired on a downgrade to numpy 1.x.** Replaced with a
  general on-disk-versus-in-memory comparison that catches any resolver-driven
  swap — and that imports none of numpy/scipy/pandas, so §5's BLAS pinning still
  takes effect.
- **Ordering.** `OMP_NUM_THREADS` is a no-op once numpy is imported.

Pins verified identical across `notebook.ipynb`, `setup_env.py` and `index.md`:
`scspill[numba]==0.2.1` and `mlsynth[bayes] @ ...@15f168bb`.

## Fidelity: a dial, not a compromise

Stages 1–3 and the diagnostics run at the post's real budget (`m_iter = 500_000`),
so the headline numbers match the published ones; §13–§15 use a survey budget,
because `SPILLSYNTH(sar)` at 500,000 draws alone takes about 17 minutes. `FAST =
True` in §5 drops everything to a ~3-minute pass. Also restored
`max_effect_draws=5_000` on the Stage 3 fit — harmless at 4,000 iterations, a
memory risk at 500,000 on a Colab box.

## Four portability problems solved rather than papered over

| | |
|---|---|
| §8.3 forward-references `result` | fine in a post assembled by `analysis.py`, fatal in a linear notebook. The single `SCSPILL` fit now runs **at 8.3** — truthful, since `result.effects_detail.att_scm` *is* Stage 2 inside the Stage 3 fit — and saves a duplicate half-million-draw run |
| Three blocks read local CSVs | `scspill_departures.csv` inlined as markdown; the bias identity and the ladder rebuilt from the live objects |
| §17 is a Mermaid diagram | Colab cannot render Mermaid; converted to a plain-text decision tree |
| Goldmark escaping | equations copied with the doubling removed (`\\hat\\rho` → `\hat\rho`); audited, none leaked |

## A latent defect in the post, found by executing the notebook

§11.3's code block calls `sens.query("parameter == 'rho'")`. `prior_sensitivity`
returns a `PriorSensitivityResult`, **not** a dataframe — the long table is on
`.table`, which is exactly what `analysis.py:1523` does
(`pd.DataFrame(getattr(sens, "table", sens))`). Copy-pasted from the post, the
line raises `AttributeError`.

It had never executed. `references/tutorial.html` was rendered at 13:41, before
the review pass rewrote the block, and contains no `parameter == ` string at all —
so the freeze cache was showing an older, passing version and nothing ever caught
it. The published `text` output block is real (it comes from
`prior_sensitivity.csv` via `analysis.py`), so only the one line was wrong.

Fixed in **`index.md`**, **`references/tutorial.qmd`** and the notebook; bundle
`.zip` rebuilt. This is the argument for actually running a notebook end to end
rather than static-checking it — the review pass verified §11.3 by `ast.parse`
and an undefined-name scan, both of which it passes.

## Verification

| Check | Result |
|---|---|
| `nbformat.validate` | OK, v4.5 with unique cell ids |
| Newline audit | **90/90 cells** correct; last line of each cell correctly bare |
| `ast.parse` | 31/31 code cells and the concatenation; undefined-name scan **none** |
| Section coverage vs `index.md` | every `##`/`###` heading present, **in the post's order** |
| KaTeX parse of every expression | **124/124**, 0 failures |
| Portability | 0 mermaid fences, 0 local-file reads, 0 Goldmark escapes leaked |
| End-to-end execution, `FAST=True` | **31/31 cells, 0 tracebacks**, 259 s; 29 stream outputs, 4 figures |
| §13 catalogue | all **9 estimators ran, none errored** |
| Cross-implementation check | `SPILLSYNTH(sar)` −16.469 against Stage 3's −16.130 at the survey budget |
| Hugo 0.111.3 `--gc --minify --buildFuture` | exit 0, 1,274 EN / 552 ES / 552 JA; `notebook.ipynb` absent from `public/`, no `.venv`/`_freeze` leakage |
| Bundle | rebuilt, 15 files |
| Outputs | stripped before commit, matching `python_sc_dsc_sdid` and `python_dowhy` |

### Fidelity spot-check at the shipped budget

The notebook was then run **as shipped** (`FAST = False`, `m_iter = 500_000`)
through section 9.5 and compared against the post's published values:

| Quantity | Notebook | Post | Delta |
|---|---:|---:|---:|
| ATT | −16.868 | −16.87 | +0.002 |
| ATT at ρ=0 | −15.6816 | −15.68 | −0.002 |
| ρ | 0.3161 | 0.316 | +0.0001 |
| ρ 95% CrI | [0.2312, 0.4032] | [0.231, 0.403] | +0.0002 |
| ESS(ρ) | 136.8 | 137 | — |

Acceptance came out at **0.444** against §9.4's stated 0.44 Robbins–Monro target,
and `BSCM` reproduced the intercept fit exactly: weights summing to 0.7576 over
26 active donors, against the post's 0.758 and 26. The default configuration
reproduces the post; `FAST = True` does not, and says so.

Both `links:` entries for the notebook resolve against
`github.com/cmg777/starter-academic-v501/blob/master/…`, so the fix reaches
readers only on push.
