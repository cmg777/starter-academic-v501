# 2026-08-02 — Python edition ships, and both SC/DSC/SDID posts audited against their own data

**Status: complete.** `content/post/python_sc_dsc_sdid/` goes live (14 figures, 19 result CSVs,
`analysis.py`, notebook, Quarto bundle, ES/JA stub cards). `content/post/r_sc_dsc_sdid/index.md`
corrected. Both posts re-checked line by line against the CSVs and `execution_log.txt` their own
scripts wrote.

## Why

The Python edition (`mlsynth`) was finished but entirely untracked, so its Colab badge — which
points at `blob/master/content/post/python_sc_dsc_sdid/notebook.ipynb` — could not resolve. It
needed to be committed and pushed to work at all.

Before shipping it, both posts were audited. The audit surface was `index.md` only; the rule was
that the committed CSVs and `execution_log.txt` are the source of truth and prose that disagrees
with them is wrong. No code was re-executed.

## What was wrong

Five defect classes, both posts affected:

1. **Stale output blocks.** Values printed in ` ```text ` blocks that no longer match the log.
   R: `|hand - package| = 2.220e-16` (log says `0.000e+00`); placebo SE `0.00957` (log and
   `inference_summary.csv` say `0.00948`). Python: DSC's whole h = 1 placebo row
   (`0.0087 / 0.0069 / 0.0050` vs the CSV's `0.0086 / 0.0068 / 0.0051`).
2. **Variant-label drift.** Both posts compare SDID numbers across sections without saying which
   of the three variants each is. Python §19 labelled variant (i)'s 2.77 as "(headline)" while the
   abstract, §11, §14 and the summary all headline variant (ii)'s 2.80. R §19.2's SDID row is
   variant (ii) but §14's headline is variant (i).
3. **Rounding-boundary mismatches.** DSC's estimate is 2.985 in R and 2.9887 in Python — right on
   the 2.985 boundary. R's §14 printed 2.99, its §19.2 printed 2.98, and its §19.2 Python column
   printed 3.00, which is the *rounded* `TSSC.att` — precisely the trap the Python post documents
   in its own §10.1. Python's §14 then claimed "four of six stages agree" when DSC also differs.
4. **Promised-vs-shown counts.** R §17 announced "Four departures", presented three, and its
   figure alt text said five. The figure genuinely has five rows because the covariates departure
   is plotted but was never introduced in prose. Fixed by writing the missing **(d) Mean
   covariates** block from `robustness_covariates.csv`. Related: "three cases out of four" where
   all four qualify, and "Fifteen of the twenty-three donors get nothing" where the count is
   fourteen (`donor_weights_by_method.csv`: SC has 9 nonzero, 14 zero — DSC is the one with 15).
5. **Code that cannot produce its own output.** Three Python blocks were abridged past the point
   of working: a loop over four solvers under a five-line output; a `print(f"…")` under a
   DataFrame render; a block that built `rows` and never printed, under a table with a `rank`
   column it never computed. `analysis.py` does produce exactly those outputs, so the `index.md`
   code blocks were restored to match the script rather than the other way round.

Also corrected: an abstract claim of "two full percentage points" against a measured 1.76;
"2.7% to 3.1%" against an actual excl.-DiD range of 2.73–3.04; an inference sentence counting
five p-values where `scpi` reports none; an exercise titled "Find the third default" colliding
with the post's `zeta`/`set_f`/covariate-method triple. The R abstract had regressed to 285 words
after §19 was appended (`post-review.md` #6 had trimmed it to 250) and is back to 249.

The Python post's **Slides**, **AI slides** and **Web app** buttons point at the R edition's
deliverables through hardcoded `carlos-mendez.org` URLs; they are now labelled "— R edition" so
the destination is not a surprise.

## Confirmed non-issues

- **Math renders even though no post sets `math: true` and `params.yaml` sets `math: false`.**
  `content/post/_index.md` has a `cascade:` block setting `math: true` for every post, and the
  theme gate is `{{ if or .Params.math site.Params.math }}`. Do not "fix" this again.
- `#### Acknowledgements` after `## References` is the site-wide convention, not a heading-level
  bug.
- **Python SC = 3.04 vs R SC = 3.06 is the posts' headline finding**, not an inconsistency. The
  same applies to Python SDID 2.80 vs R 2.76 once the variants are labelled.

## Deferred — needs an `analysis.R` re-run, out of scope here

- `r_sc_dsc_sdid_17_robustness_grid.png` has a wrong baked-in subtitle ("five departures") and a
  wrong caption (claims the SC(B) variant approaches the 2.4% line; SC(B) is not plotted at all —
  the figure's leftmost point is SDID under the ridge penalty at 2.64). The `index.md`
  interpretation now describes the figure honestly; the PNG still does not.
- `r_sc_dsc_sdid/README.md` still lists `dplyr` as a required package (removed by
  `script-review.md` #2) and still records the featured image as an open item
  (`featured.webp` has been present since `50ff92e`).
- Figures 06/07 and 13/14/15 are numbered against narrative order; `README.md` claims otherwise.
- Two `http://` SSC links remain in the R post's references (`fmwww.bc.edu`, http-only upstream).
