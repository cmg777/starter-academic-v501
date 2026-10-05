# 2026-10-05: stata_sc, factual errata, full restyle, and rebuilt web app data

Building the Python twin `python_sc101` required a careful audit of `content/post/stata_sc`, the Stata benchmark. The audit found about two dozen factual errors in the post, the results report, the slides, the do-file, and the web app. The user asked to fix every erratum and to restyle all prose under the same writing rules as the new post. This entry records what changed and how each change was verified.

## Factual corrections

Each correction was checked against `analysis.log` or a recomputation from the data. The list groups the main corrections by topic. Smaller wording fixes are recorded in the reports of the editing lanes:

- The donor pool has 38 states, not 39, and the leave-one-out check drops only the five donors with positive weight.
- The in-time placebo uses the fake year 1985, not 1980.
- The 213 packs quoted as the Kentucky average are the New Hampshire mean; Kentucky averages 187.94.
- California did not broadly track the donor average before 1989; the gap was −23.7 packs in 1988.
- The R-squared of 0.974 divides by the variation of the synthetic series; the conventional R-squared with the same weights is 0.976, and "97.4 percent explained" was removed.
- The predictor weights V are fragile across refits, so they are not read as importance.
- The spaghetti plot shows the 19 placebos kept by cut(2), not all states.
- The fit statistics printed with the in-time test belong to the reduced model estimated at the real date 1989.
- The ATT of −18.87 is the refit of the baseline inside the `loo` run, not an average over the refits.
- Claims of "no spurious effect" are replaced by "much smaller effects at the fake date".
- No anticipation and no donor contamination are now separate assumptions.
- The tails of the pointwise test were reversed in the do-file text: the left-sided p-value tests a negative effect.
- The slides reversed which p-value is more conservative.
- `lnincome` is the log of GDP per capita, and `age15to24` is a share.
- The synth2 reference is Yan and Chen (2023) in the *Stata Journal*, and Abadie and Gardeazabal (2003) is added.
- The post now notes that Proposition 10 raised the cigarette tax again in January 1999, which may contribute to the gaps of 1999 and 2000.

## Restyle

All prose in `index.md`, `results_report.md`, `README.md`, `infographic_instructions.md`, `slides/slides.qmd`, the web app, and the comments and display strings of `analysis.do` now follows the writing rules. The title became "The Synthetic Control Method in Stata: Did Proposition 99 Cut Smoking in California?". A fidelity checker confirmed against git HEAD that code blocks, Stata output, math, headings, image targets, and the card structure did not change, except where an erratum required it. The internal records `plan.md` and `slides/SLIDES_REVIEW.md` stay unchanged as history.

## Guarded Stata rerun

The restyled do-file changes display strings that Stata echoes into the log, so the log was refreshed by a guarded batch run. The run used a scratch copy without the `ssc install ..., replace` lines, which keeps synth 0.0.7 and synth2 2.1.0 (SSC now serves synth 0.0.8). An acceptance script compared the new log with HEAD and passed: only the 141 edited echo lines, their 130 display outputs, and the timestamps differ, and every estimate is identical.

The 14 deployed figures were restored byte for byte from git, because Netlify caches PNG files as immutable. StataNow MP reported "License not applicable to this Stata", so the run used Stata 19 SE. Its batch log stayed in the scratchpad, because batch logs carry license text.

## Web app

`web_app/data/results.json` held invented values. The new `build_web_app_data.py` rebuilds it from `analysis.log` and recomputes the 1970–1988 synthetic path from the data with the rounded Stata weights, with 193 assertions. The app text is restyled, the cutoff explanation is corrected (a high pre-period MSPE makes the ratio small), and the dead `dgp.js` and `lasso.js` files from an earlier LASSO app are removed.

## Notes for the user

The existing `featured.webp` still shows "1,200 obs" (the panel has 1,209), the LOO −18.87 claim, and a 97.4 percent reading of R-squared. The corrected `infographic_instructions.md` can regenerate it. The LOO figure keeps its old Stata note "Each panel excludes one donor state", because replacing the deployed PNG would require a new file name.
