# python_sc_dsc_sdid — data dictionary and output audit

Added an interactive data dictionary for the Python synthetic control ladder tutorial at `/tutorials/python_sc_dsc_sdid/data/`, linked from a new "Data dictionary" button (after "Python script") and from §4.1 of the post.

## Data folder (`content/tutorials/python_sc_dsc_sdid/data/`)

- `brexit_analysis.csv`: a byte-identical copy of the post-root estimation panel (24 countries × 104 quarters). The root copy stays because `analysis.py`, the notebook, `tutorial.qmd` and `build_bundle.sh` load it from there.
- `brexit_panel_wide.csv`: a lossless pivot of `r_sc_dsc_sdid/brexit_panel_long.csv` (36 countries × 244 quarters, 12 concepts), plus a derived `in_estimation_sample` flag. `make_wide_panel.py` builds it and asserts four things:
  - every long value carries over unchanged;
  - there are no duplicate keys;
  - the flag matches the 24 countries of the estimation sample;
  - `log(real_gdp)` reproduces `log_rgdp` to within 1e-9.
- `data_dictionary.yaml` and `build_data_dictionary.py` (the skill template) generate:
  - labelled `.dta` files (release 118);
  - `README.md` and `stata_codebook.do`;
  - `python_sc_dsc_sdid_data.zip`;
  - `index.html`.

## Verified facts documented on the page

- `log_rgdp` is the log of real GDP indexed to each country's 1995 average.
- Every covariate formula matches the replication code to machine precision.
- `lab_prod_raw = real_gdp_raw / tot_emp_raw` and `tot_emp_pc_raw = tot_emp_raw / pop_quarterly` hold exactly, so `pop_quarterly` is the working-age population.
- **The data are observed only through 2018Q3.** From 2018Q4 to 2020Q4 the values are OECD Economic Outlook (November 2018) projections. The average absolute quarter-to-quarter change in GDP growth falls from 0.77 to 0.06 points, and 2020 shows no COVID drop. Both evaluation quarters of the post are therefore projections. Neither the Python nor the R edition says so; this is flagged for the author as a pending prose decision.

## Output audit

- `analysis.py` was re-run cold in a scratch copy, with mlsynth pinned at 15f168b (Python 3.11, numpy 2.4.6, pandas 3.1.1).
- Every result CSV reproduces the committed one to about 1e-8; only run times differ.
- Every `text` output block in `index.md` matches the log or the CSVs, except §4.1's `head(3)`. That block showed `log_rgdp = -0.351514` for Australia in 1995Q1; the data hold `-0.014859`. It is now corrected, with a short explanation of the 1995 indexing and a link to the dictionary, also added to `references/tutorial.qmd`.
- `python_sc_dsc_sdid.zip` was rebuilt with `build_bundle.sh`.

## Review-driven factual fixes

A full review (the 13 dimensions of the `review-post` skill) found the problems below. Each was re-verified against the data, the R edition or a live `mlsynth` call before being applied.

- **"92 estimators" → "about seventy estimator classes (92 exported names)".** `__all__` has 92 names: 76 classes, 69 of them with `.fit`, plus 16 functions. The print label is now `names exported:` in the post, the qmd, the notebook, `analysis.py` and the log.
- **Abstract and §1** no longer claim that every default moves the answer more than the whole ladder. `zeta` (0.13) stays inside the 0.31 spread above DiD.
- **DSC "R" value 2.98 → 2.99.** The R edition computes 2.985 and reports 2.99. Updated in `analysis.py`, `att_headline.csv`, the log, the qmd, the notebook, `cheatsheet_python.py` and `cheatsheet_stata.do`. The §14 comparison prose (DiD has no published value; SC and SDID differ in opposite directions) is corrected in the post and the notebook. The §10.1 sentence no longer says the paper reports 2.99.
- **`cheatsheet_python.py` read DSC from TSSC's rounded `.att`** and printed 3.00. It now reads the full-precision gap and prints 2.99 / 4.12 (re-run, exit code 0).
- **Time weights:** the text now mentions the 0.0386 weight on 2008Q4, where it used to say "nothing" on the other quarters.
- **"φ rises with m"** becomes "broadly rises", because it is not monotone.
- **§19 SDID `zeta` rows** are relabelled variant (iii), the bare `.fit()`.
- **Permutation p-value floor** is now qualified as applying to permutation tests.
- **SDID interval** is now attributed to section 11.
- **Covariate RMSE and `v_agreement`** are given as the range across both optimiser budgets.
- **§16** code now prints the summary that the output block shows; its output is verified identical.
- **Exercise 4** is reworded so it can be run: `FDID().did` has no `.weights`, and only `VanillaSC` reports `n_negative`.
- **Exercise 5** is restricted to k ≤ 78 so that the h = 8 targets never reach post-referendum quarters.

Pending author decisions (prose, not applied): the projection caveat and its headline rewording, the estimand and identifying-assumption paragraph, the code-ordering setup block for §4, the inference and horizon cautions, jargon definitions, and the refresh of the slides and web app.

## Round 2 — author-approved revisions (all eight items)

1. **Data vintage.** A callout in §4.1, plus reworded abstract, summary (EN, ES and JA), §9.3, §11.2, §18.1, §21 and §22. At 2018Q3, the last observed quarter, the ladder reads 2.46–2.78% (verified by refitting at `t = 95`). Exercise 9 asks students to reproduce this.
2. **Estimand.** The single-quarter ATT is the UK's own effect. The design is observational, with three shared assumptions: no anticipation, no interference and no other UK-specific shock. The post now explains log points against percent (3.04 log points is a 2.99% shortfall).
3. **Code runs as shown.**
   - §4 is reordered: data, then helpers (now including `SEED`), then Pydantic configs (`base = cfg(96)`), then the data plot, which now has its own setup lines (`Y`, `DONORS`, `QLAB`, `QDEC`, colours).
   - `tssc_att` is defined at its first use in §9.2.
   - A harness ran all 36 post code blocks in order in a clean namespace. Every block ran, and all 30 output blocks match exactly.
   - The harness exposed four further errors, now fixed:
     - §11.2 printed the time weights of the 2018Q4 fit (1.0000 on 2016Q2) but showed the treatment-quarter fit's 0.9585/0.0386. The code now shows both fits.
     - §14 lacked the `.round(2)` its output implies.
     - §18 lacked `lto_max_pairs=120, scpi_sims=200`. The leave-two-out p-value of 0.0083 is the floor of 1/120; with all pairs it is 1/253.
     - MASC's `phi_hat` printed float noise; it is now rounded.
4. **Inference cautions.**
   - The TSSC Step-1 bracket is a subsampling acceptance region (checked in `tssc_helpers/selection.py`).
   - SDID placebo with B = 500 has at most 23 distinct assignments (checked in `sdid_helpers/inference.py`).
   - Tournament horizons (1 and 4 quarters) are short of the evaluation horizons (10 and 14): SDID's edge is 23% at h = 1 and 9% at h = 4, and the placebo windows overlap.
   - The event-study pre-period is now called a weak check.
   - The post explains why SDID's p = 0.20 and the RMSPE-ratio p of about 0.04 answer different questions.
   - §19 discusses the 2016Q2 campaign quarter as an anticipation risk.
5. **Spillovers.** EU donors hold 31–32% of the SC, DSC and SDID weight; the US holds 0.18–0.19.
6. **Jargon defined.** RMSE, predictor weights V, m-nearest-neighbour matching, rolling-origin cross-validation, `set_f`, the event study, and log points.
7. **Polish.**
   - 14 italic figure captions; interpretation paragraphs after Figs 5, 10 and 13; Fig 13 moved to the end of §17.1.
   - §11.1 lead-in; the §18.1 equation now comes before its code; a §14.1 note.
   - References: four added (Li 2024; Lei and Sudijono 2025; Chernozhukov, Wüthrich and Zhu 2025; Malo et al. 2024, with details taken from mlsynth's docstrings). All 26 are cited and renumbered by first mention.
   - The global `filterwarnings("ignore")` is narrowed to `PydanticDeprecationWarning` in the post, `analysis.py`, `cheatsheet_python.py`, the qmd and the notebook. The harness showed that these were the only warnings it hid.
   - Private-module note; British spelling; the abstract is trimmed to 254 words and ends with a "report the ladder" line; exercises are graded Warm-up, Core or Stretch.
   - The h = 1 "variants collapse" suggestion was not applied: the tournament code fits the (ii) and (iii) targets at k + 4 whatever the horizon.
8. **Slides and web app.**
   - `slides.qmd` is corrected and re-rendered with Quarto 1.9.37, which replaced two hashed CSS files. The `/tutorials/` links are restored by hand, as in cc384980.
   - The web app text is corrected. `web_app/data/results.json` was regenerated with `APP_DATA=1` in a scratch copy; the only change is DSC's R value, 2.98 → 2.99.
   - The notebook and the qmd gain a data-vintage note.

## Renderer template fix

`.claude/skills/write-data-dictionary/references/templates/build_data_dictionary.py` gains `p a,li a,.note a{overflow-wrap:anywhere}`. Long bare URLs (the Colab link) overflowed the page by 55px at a 360px width. Existing dictionaries rendered with the old template (for example `python_did_sc_tsunami`) still show this overflow until they are re-rendered.

## Validation

- Pinned Hugo 0.111.3 production build passed; the data page and the button publish.
- Headless Chrome checks all pass:
  - each tab shows one panel;
  - "Expand all" shows 2 of 2 panels;
  - the dark mode choice persists after reload;
  - the cross-file link sets `#var-…`;
  - print shows 2 of 2 panels;
  - no overflow at 360px;
  - no JS errors.
- i18n parity: 0 missing. Site audit: only the six known legacy findings in `python_dynamic_panel`.
- No ES/JA change, because the tutorial stubs' title and summary are unaffected.
