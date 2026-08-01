# 2026-08-01 — New tutorial: From DiD to SDID, a ladder of synthetic control estimators (`r_sc_dsc_sdid`)

**Status: complete and verified.** Hugo 0.111.3 build exits 0 (1,223 EN / 552 ES / 552 JA pages).
18 figures, all referenced, no orphans. 18 result CSVs. 8 concept cards, 4 Mermaid diagrams,
30 display equations, 22 references. `scripts/i18n-parity.sh` reports 0 missing / 0 stale.
`analysis.R` asserts its own replication and passes.

## Why

`content/post/r_sc_dsc_sdid/` had held only the authors' replication package for
**de Brabander, Juodis & Miyazato Szini (2025)**, *Econometric Reviews* 44(10), 1617–1646
(DOI 10.1080/07474938.2025.2530649). That package is unusable as a teaching artifact: the data
is a 2.3 MB MATLAB binary, all 34 scripts begin with an absolute `setwd()` into the original
author's iCloud folder, none produces a single figure or table (each ends in `save.image()`),
and there are live bugs — the DSC weights are archived as the SC weights, and
`results$treatment_effect` is a character column.

The site had classic SC (`r_basic_synthetic_control`), ASCM (`r_augsynth`, `r_sc_multi_country`)
and SDID in Stata (`stata_sdid`), but nothing teaching **SDID in R**, nothing on the **demeaned
SC (DSC)**, and nothing connecting the family. The user asked for a highly pedagogical,
self-contained article covering every method in the paper, with each estimator hand-coded before
being run with its package.

## Replication: exact

Every headline cell lands within 0.005 pp of the published table.

| Method | Ours (2018Q4 / 2019Q4) | Published |
|---|---|---|
| SC | 3.056 / 4.204 | 3.06 / 4.20 |
| DSC | 2.985 / 4.121 | 2.98 / 4.12 |
| SDID (i) | 2.758 / 3.894 | 2.76 / 3.89 |
| SDID (ii) & (iii) | 2.787 / 3.923 | 2.79 / 3.92 |
| MASC | 2.726 / 3.828 | 2.73 / 3.83 |
| ASCM | 3.045 / 4.187 | 3.04 / 4.19 |
| SC(B), mean covariates | 2.428 / 3.606 | 2.43 / 3.61 |

The in-sample placebo table (RMSE / MAB / MedAB for all seven methods) reproduces to four
decimals. Donor weights match the paper's Table 5 exactly (Hungary 0.2186, US 0.1994,
Japan 0.1773, Canada 0.1612, Norway 0.1256), and the ASCM negative weights match its Table 6
(Switzerland −0.0090, Slovak Republic −0.0085, Belgium −0.0066, …).

## What the extensions found

- **The published SC estimate is partly a solver artefact.** With `zeta.omega = 0` the donor
  Gram matrix has condition number 7.5 × 10⁵, so `synthdid`'s Frank–Wolfe halts on its
  10,000-iteration cap rather than at the optimum. Our hand-coded Frank–Wolfe reproduces the
  package **bit for bit**; the exact quadratic program reaches a *lower* sum of squares and
  gives 3.039 instead of 3.056. The post turns this into section 8.4 with the full convergence
  ladder — the weights are not identified past two decimals even though the estimate is stable.
- **The paper's SDID-variant ranking does not survive a matched horizon.** Its scripts grade
  SC/DSC/SDID(i)/MASC/ASCM one quarter ahead but SDID (ii) and (iii) *four* quarters ahead.
  Graded like for like at h = 1, the three variants are 0.0067 / 0.0066 / 0.0066 —
  indistinguishable. At h = 4 all three tie at 0.0134. The conclusion that (ii) and (iii)
  "perform the worst" is an artefact of the exam, not a property of the estimators. What
  survives is that the whole SDID family beats every other rung at either horizon.
- **DiD, which the paper omits, is worth showing.** 4.98% at 2018Q4, nearly double everything
  else, with four times the pre-treatment fit error. It makes the ladder's first rung concrete.
- **Inference (beyond the paper, which reports none by design).** Placebo-in-space puts the UK
  first of 24 with a post/pre RMSPE ratio of 5.82 and p = 0.042 — the smallest value 23 donors
  can produce. The `synthdid` placebo SE of 0.0096 log points implies a 95% interval of roughly
  0.9% to 4.6%, which the post states plainly.

## Two package traps documented

1. **`masc` needs its fold set specified explicitly.** The published scripts pass
   `min_preperiods`, which current package master reads as the fold *start* — five folds, which
   select φ = 1 (pure matching) and give 2.356 instead of 2.726. The authors' numbers correspond
   to `set_f = 6:(T0-1)`. Silent, plausible-looking, wrong by a third of a percentage point.
2. **`masc` will not install or run out of the box.** It declares a hard `Imports: gurobi`
   (commercial, licence-gated), and its `nogurobi = TRUE` fallback crashes on an object it never
   assigns. Fixed by stripping the DESCRIPTION dependency and passing our own solver through the
   documented `sc_est` hook — which is also pedagogically better, since it is the same
   `simplex_ls` the post has already built.

## What exists now

- **Data** — `prepare_data.R` (MATLAB → CSV), `brexit_analysis.csv` (24 × 104, 328 KB),
  `brexit_panel_long.csv` (all 36 countries, 4.3 MB), `data/README.md` codebook.
- **Core** — `analysis.R` (17 sections, 18 figures, 18 CSVs, self-asserting), `cheatsheet.R`
  (~160 lines, every estimator, runs in 30 s), `execution_log.txt`, `README.md`, `cache/`.
- **Post** — `index.md`, 22 numbered sections, ladder spine DiD → SC → SC(B) → DSC → SDID →
  MASC → ASCM, 8 exercises.
- **Notebook** — `tutorial.qmd` (renders clean), `_quarto.yml`, `build_bundle.sh`,
  `r_sc_dsc_sdid.zip` (7 entries, 429 KB).
- **Slides** — `slides/slides.qmd` → `index.html`, four acts, reuses 7 post figures.
- **Web app** — six interactive panels; verified by headless screenshot.
- **Infographic** — `infographic_instructions.md`.
- **i18n** — ES and JA card stubs.

## Environment note

R 4.5.2 x86_64 had only its 30 base packages. Installed 14 from CRAN plus `synthdid` 0.0.9 and
`augsynth` 0.2.0 from GitHub, and `masc` 0.1.1 from a locally patched source (see above).
The one slow step is `Synth`'s nested optimisation over 92 predictors for the covariate
specifications — roughly 20 minutes for three fits — so those, the placebo loop and the
placebo-in-space run are memoised to `cache/*.rds` (committed). Cold run ≈ 25 min, cached ≈ 2 min;
`FORCE_REFIT=1` invalidates.

The local Hugo (0.84.2) is below the site's 0.96 floor, so verification used a downloaded
0.111.3 extended binary at `/tmp/hugo-verify/hugo`, matching the `netlify.toml` pin.

## Notes / fixes made along the way

- Two ggplot bugs on first run: a numeric `y` in `annotate()` against a discrete scale, and
  `geom_raster` on the barycentric triangle lattice (switched to square points).
- The λ solver was called with one transpose too many in the first draft of `cheatsheet.R`,
  `tutorial.qmd` and the post's section 10.2 — caught because `cheatsheet.R` was actually run,
  not just written. Fixed in all three.
- `\\;` replaced with `\\,` throughout `index.md`: the site's escaping notes list `\\;` in
  display math as a construct that breaks on deployed Hugo + MathJax.
- The web app pins D3 to `d3@7.9.0` on jsDelivr with a Subresource Integrity hash rather than
  the floating `d3js.org/d3.v7.min.js` the other four web apps use.
- `content/post/r_sc_dsc_sdid/replicationReference/` (4.5 MB) added to the root `.gitignore`,
  matching the existing r_sc_bayes_spatial / r_did2 stanzas.

## Open items (for the user)

- `featured.webp` is user-supplied by site convention; the post currently ships without one.
- Nothing has been committed — all changes are left in the working tree for review.
- The paper's Monte Carlo study was deliberately deferred to a future post, as requested.

---

## Update (2026-08-02) — review pass

Ran five of the six `review-*` skills over the bundle (`review-results-report` has no input; no
`results_report.md` was written for this post, by choice). All findings applied. Reports kept in the
page bundle: `script-review.md`, `post-review.md`, `infographic-review.md`,
`slides/SLIDES_REVIEW.md`, `web_app/REVIEW.md`.

| Review | Verdict | Findings |
|---|---|---|
| script | MINOR REVISION | 3 MED, 2 LOW — all fixed |
| post | MINOR REVISION | 2 HIGH, 4 MED, 1 LOW — all fixed except the featured image |
| infographic | MAJOR REVISION | rewritten to the house template |
| slides | ACCEPT | 2 HIGH overflows + 1 MED density — all fixed |
| web app | ACCEPT | no changes needed |

### What the review actually caught

- **The post showed code that did not produce the output beneath it.** §10.2 printed
  `|hand-coded lambda − synthdid lambda| : 0.000e+00` above a `simplex_ls` call, but that zero came
  from `simplex_fw`. Running the printed code gives `2.0e-06`. The treatment effect was identical
  either way (2.758), so nothing was wrong — but the post asserted an exactness its own code did not
  deliver. Fixed by showing the Frank–Wolfe call that actually produced it.
- **`simplex_fw` was load-bearing and invisible.** §8.3's comparison and the whole of §8.4 — the
  post's most original argument — rested on a hand-coded Frank–Wolfe that appeared nowhere. Added as
  its own ~25-line code block, with the `while` condition (exit on convergence *or* iteration cap)
  called out as the hinge of the argument.
- **An arbitrary constant was hiding an exact result.** `analysis.R` computed its hand-coded ASCM
  with a made-up ridge of `0.01`, printing 3.059 against the package's 3.045 with no explanation,
  and ASCM was the only rung of seven with no hand-vs-package agreement metric. Reading
  `augsynth`'s own CV choice back out (`$lambda` = 0.13858) makes the two agree to **3.9e-06**. The
  same `0.01` had propagated to `cheatsheet.R` and `tutorial.qmd`; both corrected. The post now
  shows the closed form too, so ASCM stops being the second place the "hand-code then package"
  premise lapsed.
- **The infographic brief was not an image prompt.** Factually impeccable — all 22 decimal figures
  traced to the post — but structurally wrong: a hand-written design memo with eight panels, prose
  instructions and the *website* palette, where `write-infographic` specifies four labelled sections,
  six panels and a distinct chalkboard palette. No generator could have been driven from it.
  Rewritten to Template A (Causal Inference); the turkey, the ladder and the dartboard survive.
- **Two slides overflowed their box.** Both carried prose plus a full-width figure. Split so the
  figure gets its own slide, matching the pattern the deck already used elsewhere. Deck is now 31
  slides, 0 overflow.
- Smaller: `dplyr` was attached and never used; 40 lines of `augsynth` chatter polluted a cold-cache
  log (`suppressMessages`); `HALF_Q3` was a dead constant; the post's `library()` block omitted three
  packages `analysis.R` needs; the Abstract was 273 words against a 250 cap.

### Two things the review got wrong, and how

Worth recording because both cost time and both would recur.

- **A "HIGH horizontal-overflow bug" in the web app that does not exist.** A 390 px screenshot showed
  the hero text clipped mid-word. Instrumenting the live page gave `clientWidth=500 scrollWidth=500`
  and `DOC body scrolls horizontally: false` — headless Chrome clamps its layout viewport to a
  **500 px floor**, so the capture was showing the leftmost 390 px of a 500 px layout. All seven chart
  wrappers scroll internally exactly as the site convention requires. The obvious "fix" (deleting the
  chart `min-width`) would have made the charts illegible for no reason.
- **A "data contract drift" that was rounding.** `results.json` is written at 8 significant digits;
  the CSVs carry full precision. `0.00891541` vs `0.00891540826470886` is not drift.

### Reproducibility, now actually verified

The previous session verified determinism only on a warm cache, which proves nothing — `cache/`
short-circuits every expensive fit. A `FORCE_REFIT=1` run recomputed all of them (the `Synth` nested
optimisation over 92 predictors, the 20-window placebo tournament, both MASC cross-validations, the
placebo-in-space sweep) and produced a log **byte-identical** to the cached run apart from the line
echoing the flag. Cold run ≈ 22 min, warm ≈ 2 min.

### Verification after the pass

`analysis.R` exit 0, 9/9 replication assertions pass, headline table unchanged. `cheatsheet.R` runs
clean. `tutorial.qmd` and the deck both render. Bundle rebuilt (7 entries, 440 KB). Hugo 0.111.3
build exit 0. Post HTML: 18/18 figures with alt text (shortest 122 chars), 16 concept-card
`<details>`, 4 Mermaid blocks, 30 display equations, 0 raw-LaTeX leaks. The post's own code was
extracted and executed standalone — every number in every output block is reproduced by the code
printed above it. `i18n-parity.sh` 0 missing / 0 stale. No review report is published as a page or
appears in the sitemap.

### Still open

- `featured.webp` — the one review finding deliberately not auto-fixed. The site's conventions state
  the featured image is user-supplied and that the pipeline must never generate one, so manufacturing
  it to satisfy Dimension 2 would break a documented rule to pass a checklist.
- Nothing committed; all changes remain in the working tree.

---

## Update (2026-08-02) — media

- **AI podcast.** Spotify episode `7wmH9iF0ITNStTeBk47zb1` added two ways, following the
  `python_dowhy` precedent (the only other post using an `open.spotify.com/episode/…` link): a
  `spotify`/`fab` "Podcast" button in the front matter, and the Spotify embed iframe at the top of
  the body, before `## Abstract`. Note this is *not* the `.claude/docs/ai-podcast-player.md` inline
  HTML5 player — that one takes a direct `.m4a`/`.wav` URL and cannot play a Spotify episode link.
  Verified: episode and embed both return HTTP 200, and the episode title matches the post title.
- **AI slides.** `ai-slides.pdf` (15 pages, 2.0 MB) added with a `file-pdf`/`fas` button using the
  **absolute** URL `https://carlos-mendez.org/post/r_sc_dsc_sdid/ai-slides.pdf`, per
  `.claude/docs/post-resource-buttons.md` — the relative form resolves but opens in the same tab.

The post now carries eight resource buttons, all verified to resolve after a Hugo build:
Slides (HTML) · AI slides (PDF) · Web app · R script · Cheat sheet · Quarto project (.zip) ·
Podcast · MD version.
