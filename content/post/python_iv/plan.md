# Plan: Python IV Tutorial — `content/post/python_iv/`

## Context

The `content/post/stata_iv/` post replicates Acemoglu, Johnson & Robinson (2001) "Colonial Origins of Comparative Development" in Stata using the `ivreg2` package. The user wants a sibling post `content/post/python_iv/` that delivers the **same content, narrative, and numerical results** but uses Python — specifically the `pyfixest` library (https://pyfixest.org/) — as the estimation engine.

**Why a sibling post:**
- Cross-language replicability is a teaching point in itself: same data, two languages, identical numbers up to numerical tolerance.
- Python is the dominant language in modern data-science curricula; Stata is the canonical language in development-economics seminars. Carrying both serves both audiences.
- The Python version reuses the exact same `.dta` files already pushed to GitHub for stata_iv (`https://raw.githubusercontent.com/cmg777/starter-academic-v501/master/content/post/stata_iv/maketableN.dta`) — no data duplication, and `pd.read_stata(URL)` reads native Stata format directly.

**Outcome at end of plan:**
- A complete `content/post/python_iv/` folder with `analysis.py`, `execution_log.txt`, 3 PNG figures (matching stata_iv's), 9 result CSVs (matching stata_iv's `tab1_summary.csv` … `tab8_overid.csv` schema), `index.md` (15 sections, Mermaid DAG, 7 toggle-card concepts, 2 display equations, References), `README.md`, `plan.md`.
- Headline numbers match the Stata reference within numerical tolerance: 2SLS β = **0.944** (SE 0.176), OLS β = **0.522**, Kleibergen-Paap rk Wald F = **16.32**, Hansen J p-values 0.21–0.80, all 27+ robustness specs reproduce.
- The Hugo build succeeds; the rendered post displays correctly with toggle cards, math, Mermaid DAG, and figures.
- `master` carries everything; live site `https://carlos-mendez.org/post/python_iv/` returns 200 after Netlify rebuilds.

## Library strategy: hybrid `pyfixest` + `linearmodels`

`pyfixest` alone is **insufficient** for byte-comparable AJR replication. Per the official llms.txt and the pyfixest IV tutorial, pyfixest:

- ✓ Estimates 2SLS (just-identified and overidentified) via `feols("Y ~ X_exog | X_endog ~ Z")`
- ✓ Reports first-stage F and Olea-Pflueger effective F via `.IV_Diag()` / `._eff_F`
- ✓ Returns first-stage regression via `.first_stage()` / `._model_1st_stage`
- ✗ Does **NOT** report Kleibergen-Paap rk Wald F (the canonical `ivreg2` weak-IV statistic — what stata_iv reports as 16.32)
- ✗ Does **NOT** report Hansen J / Sargan
- ✗ Does **NOT** report Durbin-Wu-Hausman endogeneity test
- ✗ Does **NOT** report Anderson-Rubin weak-IV-robust test
- ✗ **"Multiple endogenous variables are not supported"** (hard constraint, blocks AJR Table 7 Cols 7-9 which instrument `avexpr` AND a health variable jointly)

**Solution:** hybrid stack. Each library does the job it's best suited for:

| Job | Library | Why |
|-----|---------|-----|
| 2SLS β / SE / CI / t / p, just-identified | `pyfixest.feols` | Natural, idiomatic, matches the pyfixest tutorial flavor |
| OLS comparison columns | `pyfixest.feols` | Same engine; consistent SE conventions |
| First-stage regression (Figure 1) | `pyfixest.feols` (or `pf.feols("X ~ Z")`) | Trivial scatter |
| Reduced form (Figure 2) | `pyfixest.feols` | Same |
| Olea-Pflueger effective F | `pyfixest.feols(...).IV_Diag()` then `._eff_F` | Native |
| **Kleibergen-Paap rk Wald F** | **`linearmodels.iv.IV2SLS(...).fit().first_stage`** | The canonical weak-IV stat; matches the stata_iv reference number 16.32 |
| **Hansen J on overidentified specs** (Tab 7 Cols 7-9, Tab 8 Panel C) | **`linearmodels.iv.IV2SLS(...).fit().j_statistic`** | Native |
| **Durbin-Wu-Hausman endogeneity** | **`linearmodels.iv.IV2SLS(...).fit().wu_hausman`** | Native |
| **Anderson-Rubin** (weak-IV-robust) | **`linearmodels.iv.IV2SLS(...).fit().anderson_rubin`** | Native |
| **Multi-endog 2SLS** (Tab 7 Cols 7-9) | **`linearmodels.iv.IV2SLS`** | pyfixest issue #197 — overid systems may error |
| Coefplot (Figure 3) | matplotlib + manually extracted coefficients | Both libraries surface tidy coefficient/CI dicts |

Both libraries get installed via `python -m pip install pyfixest linearmodels` (single line in the script's environment-bootstrap step).

**SE alignment:** ivreg2 default is HC1-style with finite-sample correction (the `small` option; on by default). To match: `pyfixest.feols(..., vcov="HC1", ssc=pf.ssc(adj=True))` AND `linearmodels.iv.IV2SLS(...).fit(cov_type="robust")`. Cross-validate β across both libraries on the just-identified spec — should match to ~6 decimals.

## Data loading: reuse stata_iv's GitHub URLs

The 8 `.dta` files (`maketable1.dta` … `maketable8.dta`) are already pushed to:

```
https://raw.githubusercontent.com/cmg777/starter-academic-v501/master/content/post/stata_iv/maketableN.dta
```

`pandas.read_stata(URL)` reads them natively. No new data files. No CSV conversion. **The Python post borrows the Stata post's data**, which is the cleanest expression of cross-language replicability.

Mirror the `USE_GITHUB` toggle pattern from stata_iv's `analysis.do`:

```python
USE_GITHUB = True   # default: replicable from any Python environment
DATA_URL = (
    "https://raw.githubusercontent.com/cmg777/starter-academic-v501/master/content/post/stata_iv"
    if USE_GITHUB
    else "../stata_iv"
)
df1 = pd.read_stata(f"{DATA_URL}/maketable1.dta")
# ...
```

The local fallback `../stata_iv` is a relative path from `content/post/python_iv/` to `content/post/stata_iv/`, so offline iteration works without any data duplication.

## Folder layout (file inventory)

```
content/post/python_iv/
├── analysis.py                            # Python script (~600-800 lines)
├── execution_log.txt                      # captured stdout from running analysis.py
├── index.md                               # the post itself (~700 lines, mirrors stata_iv)
├── README.md                              # folder overview, "How to run", file inventory
├── plan.md                                # this plan, archived in the post folder
├── python_iv_first_stage.png              # Figure 1: settler mortality → expropriation risk
├── python_iv_reduced_form.png             # Figure 2: settler mortality → log GDP
├── python_iv_ols_vs_iv.png                # Figure 3: coefplot of avexpr across specs
├── tab1_summary.csv                       # Table 1 — summary statistics
├── tab2_ols.csv                           # Table 2 — OLS regressions
├── tab3a_inst.csv                         # Table 3 Panel A — institutional determinants
├── tab3b_inst.csv                         # Table 3 Panel B — early institutions
├── tab4_iv_main.csv                       # Table 4 — main 2SLS + OLS pairs (with KP-F + DWH)
├── tab5_iv_controls.csv                   # Table 5 — IV with colonial/legal/religion controls
├── tab6_iv_geo.csv                        # Table 6 — IV with geography controls
├── tab7_iv_health.csv                     # Table 7 — health channels (Cols 7-9 with Hansen J)
├── tab8_overid.csv                        # Table 8 — alternative instruments + Hansen J
└── featured.webp                          # USER-supplied (per memory: user adds manually)
```

No `.dta` files at this folder root — they're loaded from stata_iv's GitHub URLs. No `references/` folder — the AJR archive is in stata_iv's history.

## Section structure: 1:1 mirror of stata_iv with Python adaptations

The `index.md` reproduces all 15 sections of stata_iv with content and numbers preserved. Where stata_iv shows Stata code, python_iv shows Python code; where stata_iv references `ivreg2`, python_iv references `pyfixest`/`linearmodels`. Specifically:

| § | stata_iv heading | python_iv heading | Python adaptations |
|---|------------------|-------------------|---------------------|
| 1 | Overview | Overview | Same. Title becomes "Do Institutions Cause Prosperity? An IV Tutorial in Python" |
| — | Mermaid DAG (Z→X→Y, dashed Z→Y) | Same Mermaid block verbatim | None — Mermaid is language-agnostic |
| — | Learning objectives | Same | None |
| — | Key concepts (7 toggle cards) | Same 7 concepts | Stata-specific terms in 1-2 examples swapped for Python equivalents |
| 2 | Setup and dependencies (`ssc install ivreg2`) | Setup and dependencies (`pip install pyfixest linearmodels`) | Show `import pyfixest as pf`, `from linearmodels.iv import IV2SLS`, `pd.read_stata(URL)`, dark-theme matplotlib rcParams |
| 3 | Data overview (`use maketable1.dta`) | Data overview (`pd.read_stata(URL)`) | Same `df.describe()` summary; same 60-fold income range narrative |
| 4 | The naive OLS benchmark (Table 2) | Same | `pf.feols("logpgp95 ~ avexpr", data=df, vcov='HC1')` |
| 5 | First stage and reduced form (Table 3, Figures 1-2) | Same | Scatter via matplotlib + `df.plot.scatter` style; annotate country labels with `ax.annotate`; quote first-stage F |
| 6 | The main 2SLS estimate (Table 4) | Same | Hybrid: `pf.feols(...).IV_Diag()` for Olea-Pflueger F; `IV2SLS` for KP-F + DWH; show first-stage via `pf.etable([fit._model_1st_stage, fit])` |
| 7 | Robustness 1: colonial/legal/religion (Table 5) | Same | `pf.feols` loops over 9 specs |
| 8 | Robustness 2: geography (Table 6) | Same | Same |
| 9 | Robustness 3: health channels (Table 7) | Same | Cols 1-6 via `pf.feols`; Cols 7-9 via `linearmodels.IV2SLS` (multi-endog) |
| 10 | Overidentification + alternative instruments (Table 8) | Same | Panels A/B/D via `pf.feols`; Panel C (Hansen J) via `linearmodels.IV2SLS` |
| 11 | Visual summary: OLS vs IV (Figure 3) | Same | matplotlib horizontal-error-bar plot from extracted `.coef()` + `.confint()` |
| 12 | Discussion | Same | Same |
| 13 | Summary, limitations, and next steps | Same | Same |
| 14 | Exercises | Same | Exercises adapted to Python (e.g., "modify the `pf.feols` formula to add a quadratic in latitude"); 4-5 exercises |
| 15 | References | Same + 2 new | Add: pyfixest paper/docs; linearmodels paper/docs |

**Front matter** (mirrors stata_iv with Python tags/categories):

```yaml
title: "Do Institutions Cause Prosperity? An IV Tutorial in Python"
date: "2026-05-09T00:00:00Z"
tags: [python, pyfixest, linearmodels, causal, iv, development]
categories: [Python, Causal Inference, Instrumental Variables, Development Economics]
summary: "Replicate Acemoglu, Johnson and Robinson (2001) in Python with pyfixest + linearmodels: instrument modern institutions with settler mortality across 64 ex-colonies and learn how IV recovers a causal effect that OLS understates by 80 percent."
toc: true
diagram: true
image: { placement: 3, focal_point: Smart, caption: "" }
links:
  - { icon: code, icon_pack: fas, name: "Python script", url: analysis.py }
  - { icon: file-alt, icon_pack: fas, name: "Execution log", url: execution_log.txt }
```

## Implementation steps

### Step 1 — Create folder + archive plan

```bash
mkdir -p content/post/python_iv/
cp /Users/carlosmendez/.claude/plans/in-content-post-stata-iv-create-a-moonlit-allen.md content/post/python_iv/plan.md
```

### Step 2 — Bootstrap the Python environment (if missing)

```bash
python3 -m pip install --user pyfixest linearmodels pandas numpy matplotlib
python3 -c "import pyfixest, linearmodels, pandas; print('OK')"
```

If `pyfixest` requires a newer Python than 3.9 (and the system Python is older), set up a `.venv` in the post folder. Confirm before installing.

### Step 3 — Write `analysis.py`

Structure (top to bottom, mirroring `stata_iv/analysis.do`):

- §0 Preamble: docstring; imports (`pandas`, `numpy`, `matplotlib`, `pyfixest as pf`, `from linearmodels.iv import IV2SLS`); seed; site colors + dark-theme `plt.rcParams.update({...})`; `USE_GITHUB` toggle + `DATA_URL` global; `np.set_printoptions`; estimand block (LATE/ATE comment)
- §1 Table 1 (summary stats): `pd.read_stata(f"{DATA_URL}/maketable1.dta")`; `df.describe()` whole-world / base-sample / mortality-quartile; export `tab1_summary.csv`
- §2 Table 2 (OLS, 8 cols): loop over 8 specs with `pf.feols`; collect into a wide DataFrame; export `tab2_ols.csv`
- §3 Table 3 (institutional determinants): `pf.feols` × 10 cols × 2 panels; export `tab3a_inst.csv`, `tab3b_inst.csv`
- §4 Figures 1 & 2: matplotlib scatter with country-label annotation, dark theme; quote first-stage F = 16.32 in caption; save `python_iv_first_stage.png`, `python_iv_reduced_form.png`
- §5 Table 4 (main IV + diagnostics): `pf.feols(...)` × 9 IV cols + 9 OLS cols; for Col 1 also run `IV2SLS` for KP-F + DWH; export `tab4_iv_main.csv` with KP-F and DWH p-value columns
- §6 Table 5: `pf.feols` × 9 IV + 9 OLS with colonial/legal/religion; export `tab5_iv_controls.csv`
- §7 Table 6: `pf.feols` × 9 IV + 9 OLS with geography; export `tab6_iv_geo.csv`
- §8 Table 7: Cols 1-6 with `pf.feols` (single endog); Cols 7-9 with `IV2SLS` (multi-endog + Hansen J); export `tab7_iv_health.csv`
- §9 Table 8: Panels A/B/D with `pf.feols`; Panel C overid with `IV2SLS` for Hansen J; export `tab8_overid.csv`. Add Albouy (2012) imputation callout in print
- §10 Figure 3 (coefplot): extract β + CI from 6 representative models (OLS Tab 2, IV Tab 4, IV Tab 5, IV Tab 6, IV Tab 7, IV Tab 8); horizontal error-bar plot; save `python_iv_ols_vs_iv.png`
- §11 Closing: print summary banner (`IV β ≈ 0.944, OLS β ≈ 0.522, KP-F = 16.32, Hansen J non-rejection`)

Run-time target: ~60-90 seconds end-to-end on Apple Silicon.

### Step 4 — Run the script and capture logs

```bash
cd content/post/python_iv/
python3 analysis.py 2>&1 | tee execution_log.txt
```

### Step 5 — Verify byte-comparability vs stata_iv

The same 8 datasets feed both runs. Numbers should match to 3+ decimals across both reference Stata and the Python implementation. Cross-check programmatically:

```bash
# Compare key headline numbers (approximate, since pandas-vs-Stata floating-point may drift in the 4th–5th decimal)
python3 - <<'PY'
import pandas as pd
sta = pd.read_csv("../stata_iv/tab4_iv_main.csv", sep=",")
pyt = pd.read_csv("tab4_iv_main.csv", sep=",")
# extract the avexpr coefficient row from each, compare numerically
PY
```

Acceptance: |β_python − β_stata| < 0.001 for every reported coefficient; F-stats within 0.5; Hansen J p-values within 0.02.

### Step 6 — Write `index.md` (the post)

Mirror stata_iv section by section. Reuse the 7 toggle-card concepts verbatim with minor Python-language tweaks ("`ivreg2`" → "`pyfixest.feols`" in 2 of 7). Reuse the Mermaid DAG verbatim. Reuse the 2 display equations verbatim. Use the **same** numerical results (since they reproduce). Add a 1-paragraph note in §6 about the hybrid pyfixest + linearmodels strategy and why both are imported.

Italic figure captions:

- *Figure 1. First-stage scatter: log settler mortality vs expropriation risk index, base sample (n=64). Slope = -0.607, F = 16.32, R² = 0.27.*
- *Figure 2. Reduced-form scatter: log settler mortality vs log GDP per capita, base sample (n=64). Slope = -0.573.*
- *Figure 3. The avexpr coefficient across specifications: OLS in warm orange (Table 2), 2SLS in steel blue (Tables 4–8). Whiskers are 95% CIs.*

### Step 7 — Write `README.md`

Mirror stata_iv's README structure: pipeline progress (this is a derived post, not a fresh pipeline run), headline replication results, generated PNG/CSV inventory, "How to run" section, dependencies (pyfixest, linearmodels), data loading section (USE_GITHUB toggle).

### Step 8 — Hugo build verification (mirrors stata_iv Step 9)

```bash
cd /Users/carlosmendez/Documents/GitHub/starter-academic-v501
"$HOME/Library/Application Support/Hugo/0.84.2/hugo" --gc --minify 2>&1 | tail -10

HTML=public/post/python_iv/index.html
test -f "$HTML" && echo "✓ HTML rendered"
grep -q "Do Institutions Cause Prosperity" "$HTML" && echo "✓ title"
grep -q 'class=language-mermaid' "$HTML"          && echo "✓ Mermaid"
grep -q 'concept-pair' "$HTML"                     && echo "✓ toggle cards"
grep -c 'python_iv_.*\.png' "$HTML"                # expect ≥ 3
grep -q 'pyfixest' "$HTML"                         && echo "✓ pyfixest mentioned"
```

### Step 9 — Commit + push

Single comprehensive commit covering the whole new folder:

```bash
git add content/post/python_iv/
git commit -m "Add python_iv post: AJR (2001) IV tutorial in Python (pyfixest + linearmodels)"
git push origin master
```

After Netlify rebuilds (~3-5 minutes), spot-check `https://carlos-mendez.org/post/python_iv/` returns 200.

## Critical files

| File | Action |
|------|--------|
| `content/post/python_iv/analysis.py` | NEW — ~600-800 lines |
| `content/post/python_iv/execution_log.txt` | NEW — captured stdout |
| `content/post/python_iv/index.md` | NEW — ~700 lines, mirrors stata_iv |
| `content/post/python_iv/README.md` | NEW |
| `content/post/python_iv/plan.md` | NEW — archived copy of this plan |
| `content/post/python_iv/python_iv_*.png` | NEW — 3 figures |
| `content/post/python_iv/tab*.csv` | NEW — 9 result tables |

Reference patterns reused:
- `content/post/stata_iv/index.md` — content / section structure / numerical results / Mermaid / toggle cards
- `content/post/stata_iv/analysis.do` — section organization, USE_GITHUB toggle pattern, output → CSV pattern
- `content/post/python_pyfixest/script.py` — pyfixest usage, dark-theme matplotlib rcParams, figure save pattern, section banner comments
- `content/post/python_pyfixest/index.md` — front-matter template for Python posts, toggle-card pattern, math escaping (`\_`)

## Risks and mitigations

1. **Numerical drift between pyfixest HC1 and ivreg2** — ivreg2's `robust` option uses the small-sample correction (HC1 with N/(N-K) factor). pyfixest `vcov="HC1"` matches IF `ssc=pf.ssc(adj=True)` is set. Mitigation: use `vcov="HC1"` AND `ssc=pf.ssc(adj=True)` everywhere; cross-check β to 6+ decimals on the just-identified spec.
2. **pyfixest cannot do multi-endog 2SLS** (issue #197 + llms.txt explicit) — affects Tab 7 Cols 7-9. Mitigation: use `linearmodels.IV2SLS` for those cols. Document the split in code comments + post §9.
3. **pyfixest does not natively report KP-F** — for Tab 4 Col 1 the headline F = 16.32 reference comes from KP-F. Mitigation: dual-report for Col 1: pyfixest's Olea-Pflueger effective F (≈22, the "robust" F) AND linearmodels' KP-F (=16.32, the "ivreg2-canonical" F). Note the difference in the post.
4. **`pyfixest` not installed in the system Python** (confirmed during exploration) — Mitigation: Step 2 installs it explicitly. If `python3 -m pip install --user` fails (e.g., externally-managed environment), fall back to a `.venv` in the post folder.
5. **`pd.read_stata` over HTTPS is slower than local** — 8 small `.dta` files, ~140 KB total, adds ~3-5 seconds. Acceptable. The `USE_GITHUB=False` flag swaps to local for offline iteration.
6. **Numerical drift in the first-stage F across libraries** — pyfixest's iid F vs linearmodels' KP-F vs ivreg2's KP-F may all differ slightly (HC variant, small-sample correction). Mitigation: report all three in Tab 4 metadata block, document the formulae.
7. **Mermaid block with backslashes** — copy-pasting from stata_iv's Mermaid into python_iv must preserve the `stroke-dasharray: 5 5` for the latent variable U. Mitigation: literal copy of the fenced block.
8. **`featured.webp`** — user adds manually (per memory). Mitigation: leave a placeholder note in README; do not block the build on missing image (Hugo will substitute the default).
9. **Issue #197 may not even be the version we install** — pyfixest releases frequently; the constraint may have been relaxed. Mitigation: try multi-endog with pyfixest first; if it errors, fall back to linearmodels (the planned path either way).
10. **Toggle-card concept text is ~80% reusable** — but 2-3 cards reference Stata commands (`ivreg2`, `eststo`); those must be Python-localized. Mitigation: explicit list of which cards to edit (concepts #4 "Weak IV diagnostics" and concept #6 "Implementation in software" are the most likely to need Python re-wording).
11. **Stata `coefplot` figure has its own visual identity** — Python coefplot must look comparable but won't be pixel-identical. Mitigation: use the same 6 specs, same colors (orange OLS, blue IV), same horizontal layout. Different rendering is fine; same conclusion is what matters.

## Verification checklist

- [ ] Folder `content/post/python_iv/` exists with all files in the inventory
- [ ] `python3 analysis.py` runs end-to-end without errors; `execution_log.txt` captures full stdout
- [ ] All 9 result CSVs match the schema of `stata_iv/tab*.csv` (same column ordering, same row labels)
- [ ] |IV β_python − 0.944| < 0.001 (Tab 4 Col 1)
- [ ] |OLS β_python − 0.522| < 0.001 (Tab 2 Col 2)
- [ ] |KP-F_python − 16.32| < 0.5 (Tab 4 Col 1)
- [ ] All 3 figures (`python_iv_*.png`) are non-empty PNGs with dark navy background
- [ ] `index.md` front matter has `toc: true`, `diagram: true`, `image.placement: 3`, `links` to analysis.py + execution_log.txt
- [ ] Hugo build (`hugo --gc --minify`) exits 0 with no python_iv-related ERROR/WARN
- [ ] `public/post/python_iv/index.html` exists, ≥ 80 KB, contains: title, Mermaid, concept-pair, ≥3 PNG references, references to `pyfixest`
- [ ] Commit lands on master and pushes successfully
- [ ] Live site `https://carlos-mendez.org/post/python_iv/` returns 200 after Netlify deploy

## Out of scope

- Full review pipeline (`script-review.md`, `results_report.md`, `results_report_review.md`, `infographic_instructions.md`) — these can be generated separately via the data-science-post skills (`/project:review-script python_iv`, `/project:write-results-report python_iv`, etc.) once the post + script are in place.
- `featured.webp` — user adds manually per their stated convention.
- AI Podcast player block — user adds on demand.
- Cross-linking from stata_iv → python_iv (and vice-versa) in the post bodies — could be a follow-up, not blocking.
- Translating the post to a third language (R, Julia) — same data, same hybrid pattern; out of scope here.
- Achieving pixel-identical figures vs Stata — close-enough visual match is sufficient; the numerical results are what define "same results".
- A Jupyter notebook companion — `analysis.py` is the canonical artifact, matching stata_iv's `analysis.do`.
