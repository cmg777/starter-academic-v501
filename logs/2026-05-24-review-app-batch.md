# Batch review-app: all 54 interactive web apps (2026-05-24)

## Scope

Applied `/project:review-app` to every `content/post/<slug>/web_app/` on the site, then fixed all MAJOR/MINOR issues and — most importantly — every legend/annotation overlap found, even when the skill itself missed it. The skill is **read-only**; a separate fix pass was wrapped around each review per app.

Triggering observation from the user: across the 54 web apps generated in the May 22 batch, legends and annotations were frequently overlapping figure lines (data marks), making the visualizations look unprofessional.

## Headline numbers

- **Apps processed**: 54 / 54
- **Final verdict ACCEPT**: 54 / 54
- **Apps with legend/annotation overlap found and fixed**: 51 / 54 (94%)
- **Apps with NO overlap (already clean)**: 3 / 54 (`stata_cate`, `stata_panel_lasso_cluster`, `stata_sp_regression_cross_section`)
- **Apps with inherited stale `r_double_lasso` template bugs** (colorMaps, x-domains, captions, dead code paths): 15+ (caused most of the MAJOR verdicts)

## Per-app outcomes

| Slug | Initial | Final | Overlap fixed | Commit | Notes |
|---|---|---|---|---|---|
| python_cml | MINOR | ACCEPT | yes | `b00f8b3` | gate_bars + ate_bias_animation + alpha_histograms legends moved to top margin |
| python_did | MINOR | ACCEPT | yes | `40bf39c` | Tab-1 anim legend + Tab-4 HonestDiD ATT label collisions fixed |
| python_did101 | MINOR | ACCEPT | yes | `24e350b` | Tab-2 histogram + Tab-4 event-study annotations relocated |
| python_doubleml | MINOR | ACCEPT | yes | `154b8aa` | Tab-1 L1/L2 animation legend moved to top margin (dashed L2 was bleeding through panel) |
| python_doubleml_pension | MINOR | ACCEPT | yes | `bbb0aa6` | Tab-1 legend below x-axis; Tab-3 histogram got a legend + true α moved to margin |
| python_dowhy | MINOR | ACCEPT | yes | `207d79d` | Tab-4 refutation labels truncated; widened margin + collision detector |
| python_dowhy_intro | **MAJOR** | ACCEPT | yes | `07f8f5d` | DAG node labels overflowed circles; Tab-3 "true ATE" collision; Tab-4 PASS badges over values |
| python_EconML | MINOR | ACCEPT | yes | `21987bf` | 6 chart legends/labels relocated; forest_plot switched to 2×3 grid for 6 outcomes |
| python_esda2 | ACCEPT | improved | yes | `c32d445` | Initially ACCEPT but manual audit found 4 overlap issues across 4 charts — all fixed |
| python_fe_kuznets | MINOR | ACCEPT | yes | `7da26c1` | panel_scatter end-labels + panel_animation + kuznets_curve range label |
| python_fwl | MINOR | ACCEPT | yes | `3bfd5fd` | Tab-4 histogram legend was painted over bars; Tab-2 true-α + Tab-1 slopeNote |
| python_iv | MINOR | ACCEPT | yes | `0517f5d` | Tab-1 DAG forbidden arrow re-drawn as arc; Tab-2 OLS/IV legend below x-axis |
| python_mgwr | **MAJOR** | ACCEPT | yes | `4365a81` | Tab-2 TypeError; Tab-4 forest colorMap stale; Tab-3 histogram missing legend |
| python_mgwrfer | **MAJOR** | ACCEPT | yes | `2548b8b` | 12 NaN console errors from hardcoded x-scale; all-white forest plot |
| python_ml_random_forest | **MAJOR** | ACCEPT | yes | `19b0d64` | Tab 4 inherited LASSO template defaults — made data-driven; Tab-1 legend out of plot |
| python_panel_intro | MINOR | ACCEPT | yes | `728bfeb` | 5 overlaps fixed across 4 charts |
| python_panel_ses | ACCEPT* | ACCEPT | yes | `9add2ad` | 3 HIGH overlap issues fixed |
| python_partial_identification | MINOR | ACCEPT | yes | `85f93ed` | All 4 widget legend/label overlaps |
| python_pca | **MAJOR** | ACCEPT | yes | `175d704` | HIGH NaN console error in country_bars; legends moved on Tabs 1/2/4 |
| python_pca2 | **MAJOR** | ACCEPT | yes | `97a07e3` | 3 stale-template bugs causing 9 console errors, all-white forest plot, invisible bars |
| python_pyfixest | **MAJOR** | ACCEPT | yes | `90cb492` | Stale colorMap (non-CRE methods → fallback color) + Tab-1/2 inline label overlaps |
| python_sc_co2tax | **MAJOR** | ACCEPT | yes | `d9197cc` | flatMap bug → 16 NaN errors on placebo distribution; all 4 in-plot legends relocated |
| python_scpi | MINOR | ACCEPT | yes | `dfca684` | Tab-2 trajectory legend moved out of plot; dead-code template scrubbed |
| r_basic_synthetic_control | MINOR | ACCEPT | yes | `bc6409e` | Tab-3 paths_chart legend out of plot; peak label auto-flips near edge |
| r_bma_lasso_wals | **MAJOR** | ACCEPT | yes | `d8fd864`† | Full BMA/LASSO/Post-LASSO/WALS rewrite of forest plot; 13 stale references purged |
| r_causalpolicy_workshop | MINOR | ACCEPT | yes | `d8fd864`† | Tab-1 ATT/legend + Tab-2/4 fixes; race condition (see note) |
| r_demeaning_twfe | **MAJOR** | ACCEPT | yes | `554057e` | Tab-3 "FWL Showdown" was calling double_lasso — added LASSO.twfe_compare with LSDV |
| r_did | **MAJOR** | ACCEPT | yes | `917482d` | All 4 tabs: legends to bottom lane + in-plot annotations wrapped in dark bg rects |
| r_did2 | MINOR | ACCEPT | yes | `71f4a64` | All 4 chart legends relocated below plot |
| r_did_ring | MINOR | ACCEPT | yes | `15c5eec` | Tab-2/3 legends from in-SVG corner to below x-axis |
| r_double_lasso | ACCEPT | improved | yes | `8223861` | Skill missed real overlap in Tab-3 alpha_histograms — "true α" label over tallest bar |
| r_dynamic_bma | MINOR | ACCEPT | yes | `7e542fc` | Tab-3 PIP overflow; Tab-2 title collision; Tab-4 heatmap off-palette color |
| r_dynamic_bma2 | MINOR | ACCEPT | yes | `b604462`† | Tab-3 pip_bars threshold collision; race condition (see note) |
| r_fwlplot | MINOR | ACCEPT | yes | `af861bf` | Tab-2 fwl_compare bar label vs true-β line — paint-order stroke halo + auto-flip |
| r_sc_bayes_spatial | MINOR | ACCEPT | yes | `af2a575` | Tab-3/4 trajectory legend out of plot; clarified Stage 3 weights |
| r_SDPDmod | MINOR | ACCEPT | yes | `b604462`† | Tab-4 multiplier chart label collision; removed 700 LOC of unused LASSO template |
| stata_bma_dsl | **MAJOR** | ACCEPT | yes | `185ef83` + `e3894df` | Forest colorMap + selection_bars; orphan fix landed in follow-up (see "Orphan fixes") |
| stata_cate | **MAJOR** | ACCEPT | no | `6fa6bad`† | SyntaxError + rebind bug fixed; forest colorMap extended; no actual overlap |
| stata_cate2 | **MAJOR** | ACCEPT | yes | `b4fcd55` | Reframed Tab-1 as Constant τ vs Conditional τ(x); colorMap → AIPW etc. |
| stata_convergence | MINOR | ACCEPT | yes | `008de2d`† | Tab-1/3/4 annotation relocations; race condition |
| stata_convergence2 | **MAJOR** | ACCEPT | yes | `6fa6bad`† | Forest plot per-facet label gutter; intro animation legend fix |
| stata_did | **MAJOR** | ACCEPT | yes | `84fd9bd` | 4 HIGH overlap + 3 MED inherited y-axis labels from r_did |
| stata_dynamic_panel | MINOR | ACCEPT | yes | `ef4a777` | Arellano-Bond curve through legend → moved below; sigma markers relocated |
| stata_fwl | MINOR | ACCEPT | yes | `e18d555` | Slope labels in 4 D3 builders moved above title band |
| stata_honestdid | MINOR | ACCEPT | yes | `bdd16aa` | Intro anim moving labels auto-flip; forest right margin 24→130px |
| stata_iv | MINOR | ACCEPT | yes | `3211119`† | Tab-4 forest labels staggered; Tab-3 true-β to top margin |
| stata_iv_panel | MINOR | ACCEPT | yes | `b1beef0` | Tab-2/3 legends to top banners; DAG exclusion arc through bottom margin |
| stata_matching | MINOR | ACCEPT | yes | `dae3bff` | Tab-1/2 legend relocations |
| stata_panel_lasso_cluster | ACCEPT | ACCEPT | no | `be89cd9`† | Already overlap-clean; fixed 2 MED stale template fallbacks |
| stata_rct | MINOR | ACCEPT | yes | `57bae0e` | Tab-2 true-α label vs legend collision |
| stata_rd | MINOR | ACCEPT | yes | `1276026` | Dark backdrops behind τ labels in 3 D3 charts |
| stata_sc | MINOR | ACCEPT | yes | `a1e00b8` + `dc73999` | paths_chart legend below x-axis; orphan fix landed in follow-up |
| stata_sp_regression_cross_section | **MAJOR** | ACCEPT | no | `02a7d67` | Tab-1 was stale LASSO chart inside spatial app — rewrote as ρ-based SAR multiplier |
| stata_sp_regression_panel | MINOR | ACCEPT | yes | `5f71354` | Tab-3 truth-label collision + Tab-4 forest crowding |
| stata_spxtivdfreg | MINOR | ACCEPT | yes | `a1e00b8`† | Tab-1 intro legend moved; race condition with stata_sc |

`† = commit was shared with a sibling app due to a parallel `git add` race during the batch — the fix is in the named commit but the commit message may only mention one of the two apps.`

`*python_panel_ses initial verdict was "ACCEPT with overlap issues" via manual audit (skill not invocable).`

## Patterns observed

1. **Legend/annotation overlap was endemic** (51/54 apps) and the `review-app` skill does not currently check for it. The skill's Dim 9 (visual) and Dim 10 (mobile) checklists need a new "no chart element overlaps data marks" criterion to catch this automatically next time.
2. **Stale `r_double_lasso` template artifacts** caused most of the MAJOR verdicts. The `write-app` skill clones from a reference implementation and many fields (colorMap, x-scale domain, default outcomes, tooltip labels, even the post header comment) were never re-keyed to the new post's data. Suggested follow-up: add a write-app post-generation lint that flags `colorMap`/`facet domain` entries matching the reference template's method names verbatim.
3. **Dead-code template debris** (`charts.js` `forest_plot`/`selection_bars`/`l1_vs_l2_animation` modules from the LASSO template) is present in many apps that don't invoke them. Harmless at runtime but adds noise. Worth a cleanup pass eventually.

## Race-condition incidents (commit-history quality only — fixes are intact)

Six commits ended up containing files from two adjacent batch agents because the shared git index was modified concurrently between an agent's `git add` and `git commit`:

| Commit | Apps it actually contains |
|---|---|
| `d8fd864` | r_bma_lasso_wals + r_causalpolicy_workshop |
| `b604462` | r_dynamic_bma2 + r_SDPDmod |
| `6fa6bad` | stata_cate + stata_convergence2 |
| `008de2d` | stata_cate2 (then soft-reset) + stata_convergence (actual) |
| `3211119` | stata_iv (under stata_matching's message) |
| `a1e00b8` | stata_sc + stata_spxtivdfreg |
| `be89cd9` | stata_panel_lasso_cluster (under stata_rd's message) |

All affected files are correct on disk; this is purely a commit-message attribution issue and the diffs are still bisectable (each commit's `--name-only` output identifies the actual changed files unambiguously).

## Orphan fixes (committed as cleanup)

Two agents successfully edited charts.js with their intended overlap/template fixes, but those edits never made it into their original commit due to a race during `git restore --staged`. The files were left in the working tree and committed as follow-ups today:

| Slug | Original commit (partial) | Orphan follow-up |
|---|---|---|
| stata_bma_dsl | `185ef83` | `e3894df` (EKC colorMap + selection_bars completion) |
| stata_sc | `a1e00b8` | `dc73999` (paths_chart legend relocation completion) |

## Known gap: missing REVIEW.md files

17 apps do not have a `web_app/REVIEW.md` audit document, even though their fixes are committed and verified:

```
python_cml, python_esda2, r_dynamic_bma, r_fwlplot, r_SDPDmod,
stata_bma_dsl, stata_cate2, stata_convergence, stata_convergence2,
stata_dynamic_panel, stata_fwl, stata_honestdid, stata_iv, stata_iv_panel,
stata_matching, stata_rct, stata_sc
```

These agents reported running the skill workflow manually (smoke test + Hugo HTTP + Playwright probe) rather than via the `Skill` tool, which is what writes the canonical `REVIEW.md`. The fixes themselves were applied and committed; only the formal audit artifact is missing. To regenerate the missing reports, run:

```
for slug in python_cml python_esda2 r_dynamic_bma r_fwlplot r_SDPDmod stata_bma_dsl stata_cate2 stata_convergence stata_convergence2 stata_dynamic_panel stata_fwl stata_honestdid stata_iv stata_iv_panel stata_matching stata_rct stata_sc; do
  echo "/project:review-app $slug"
done
```

## Verification (how to confirm this batch holds)

1. `git status` clean — verified.
2. `git log --oneline | grep "/web_app:" | wc -l` should report ~52 (54 minus race-merged duplicates).
3. Spot-check any app in the Hugo dev server:
   ```
   "$HOME/Library/Application Support/Hugo/0.84.2/hugo" server --disableFastRender
   ```
   Visit `/post/<slug>/web_app/`. On Tabs 2/3/4 at both desktop (1280×800) and mobile (375×667), no legend or text annotation should overlap a data mark (line, bar, point, area).
4. The `/project:review-app` audit can be re-run on any single app to get a fresh REVIEW.md.

## Suggested follow-ups (not blocking)

1. Add a "no chart element overlaps data marks" criterion to `.claude/skills/review-app/SKILL.md` Dim 9 so the gap that drove this batch is caught automatically next time.
2. Add a `write-app` post-generation lint that flags `colorMap` / `facet x-domain` entries matching the LASSO template's method names verbatim.
3. Regenerate the 17 missing `REVIEW.md` files via the one-line script above (low priority — the fixes are verified).
4. Cleanup pass to remove dead-code template debris (LASSO `charts.js` modules) from apps that don't invoke them.
