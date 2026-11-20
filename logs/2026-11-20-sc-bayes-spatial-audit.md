# python_sc_bayes_spatial — audit, fixes, restyle, learning components and ripple lab

A full pass over `/tutorials/python_sc_bayes_spatial/` and every companion: cold re-run, correctness audit, prose restyle, teaching revisions, learning cards, a new interactive lab, and factual fixes in the companions and the R edition.

## Cold re-run

- `rm -rf cache/ && FORCE_REFIT=1 APP_DATA=1 python analysis.py` with scspill 0.2.1 and mlsynth @ `15f168b` (Python 3.13, numba backend): about 68 minutes.
- Every committed result reproduced to about 1e-9 (headline ATT −16.868 [−23.045, −10.332], ρ 0.3161, ESS 137, Nevada −5.500). Only run times changed.
- A warm re-run then regenerated the prior predictive check with `p=1` (see below) and `execution_log.txt`.

## Correctness fixes (post, with companions where they repeat)

- **Makalic–Schmidt prior** (§8.1): λ²|ν ~ IG(1/2, 1/ν), not IG(1, ·); the shape 1 belongs to the full conditional.
- **Prior predictive check** (§11.1): it ran with `p=0` (no latent factor) while the fitted model has `p_factors=1`; now `p=1` in `analysis.py`, the post, the notebook and the qmd. The reading was also inverted: scspill reports p = P(sim ≤ obs), so `pve_pc1` (0.036) means the prior *over*-predicts single-factor dominance, while `ac1`/`ac2` (0.995/1.000) mean it under-predicts persistence.
- **Bias framing**: "the classical estimate understates the effect" holds only within a set of weights; the simplex ATT (−18.43) is further from zero than the purged −16.87. Rewritten in the abstract, §1, §12, §19, slides and notebook.
- **ρ caveat** (new, §9.5, §18, §19, exercise 2): one ρ governs both exposure to California and donor-to-donor dependence. With the exposure moved to Utah, ρ̂ is still 0.29 [0.21, 0.37], so the interval excluding zero is first of all evidence of spatial dependence.
- **Facts**: California starts *above* the donor average in 1970 (123.0 vs 120.1); 1988 is essentially untreated (tax effective 1 January 1989), not "a partial year"; `retprice` is nominal cents, not real; seven of the eleven excluded states were dropped for tax rises of 50 cents or more, not for programmes; mlsynth has 69 estimator classes (92 exported names), not 46; ESS rates were off by 1,000 (5.8 / 10,000, not 5,816 / 10,000); ρ̂ reproduced to within 0.006, not "three decimals"; "33 times too narrow" → narrower than the corrected one; the departures table is written by `analysis.py`, not shipped by scspill; Kim–Lee–Gupta inline DOI corrected to the JMR one; Makalic–Schmidt dated 2016.
- **Inference caution**: the Stage 1 "interval" is an iid bootstrap of the 13 post-period gaps, now labelled descriptive, not a valid confidence interval.
- **Runnable code**: every code block runs in order in one namespace (verified block by block, outputs pasted verbatim). §8.3 no longer uses `result` before §9.5; §12, §16 and §10.2 no longer read CSVs the reader lacks; §13 now shows the benchmark loop; four outputs were display-formatted so the printed output matches.
- **Exercises**: exercise 2 (zero Nevada) could not run (`normalize_w` rejects an all-zero `w`) and exercise 3 needed centroids the data lack; replaced by "misplace the graph" (Utah) and "widen the exposure" (Idaho and Utah at 0.5). All five now have run solutions; exercise 4 finds ESS 267 at 1.5M iterations (not 400), exercise 5 finds ρ no better identified on the Sudan trade graph (ESS 155).

## Prose and teaching

- Post prose restyled to the tutorial writing rules (no em dashes, possessives or contractions; paragraphs of at least three sentences; "we" voice). The title keeps "California's" by the author's choice; cited titles are verbatim. Checked mechanically with a regex checker (0 problems, apart from cited titles).
- Estimand and identifying assumption stated for each stage; credible-interval meaning; jargon (convex hull, row-normalisation) defined; inline citations added so every reference is cited; Grossi et al. moved to Further reading (page numbers unverified).
- Learning components: 6 predict cards, 1 proof card (§9.3: why β, γ, η, σ² cancel; ξᶜ = (I − ρW)⁻¹ρwξ₀), a new §18 Common misconceptions (5 cards), and 5 solution cards. Sections 18–21 renumbered to 19–22.

## New interactive lab: `spill-lab` (§9.7)

- `layouts/shortcodes/spill-lab.html`, `assets/js/spill-lab.js`, `assets/css/spill-lab.css`, dark tokens in `assets/css/orbital-subpages.css`, `tests/spill-lab.test.cjs` (+ `tests/spill-lab.reference.json`), data from `content/tutorials/python_sc_bayes_spatial/build_spill_lab_data.py` (`--check`).
- Evaluates the closed-form ripple live: ρ, effect size, ripple rounds (Neumann series) and origin state; tile map, top recipients, bias and naive estimate. Defaults are plug-in values (Nevada −5.484 vs posterior mean −5.500, bias +1.125).
- Verified: 17/17 tests on the source and on the minified bundle; Playwright at 1280 and 360 px (no overflow, no console errors, aria-live updates). Documented as reference implementation #5 in `.claude/docs/learning-components.md`.

## Companions

- Notebook: facts, `p=1`, new exercises, citation (Tagawa, H.; full title), numbering aligned with the post.
- `references/tutorial.qmd`: same facts; headline numbers labelled as the published run; §12 uses live objects. `build_bundle.sh` now ships the 19 figures and rewrites the `../` image paths in the bundled copy (the zip grows from 0.1 to 4.9 MB; images were broken before). Zip rebuilt.
- Slides: facts and titles (re-rendered). AhaSlides `deck.md`/`deck.json`: quiz 32 had the wrong answer (a 100× longer chain closed about 2% of the gap, not 45%); time-limit text now matches the JSON (30 s).
- Data dictionary: retprice nominal, exclusion reasons, ADH −26 is a 2000 gap, double-escaped `&amp;amp;` fixed in the post copy of `build_data_dictionary.py` (the skill template has the same bug).
- Web app text, `results_report.md`, `infographic_instructions.md`, cheat sheet, README and `setup_env.py`: factual fixes.

## R edition (facts only)

- `r_sc_bayes_spatial/index.md`: `w` has only Nevada non-zero (verified in the R package data; the post said Arizona, Nevada and Oregon); `retprice` is nominal; the ADH −26/−27 comparison is a 2000 gap, not an average.
- Not changed (out of scope): the same three errors remain in the R edition's `tutorial.qmd`, `data/` dictionary files and `results_report.md`.
