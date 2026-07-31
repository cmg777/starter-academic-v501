# 2026-07-31 — Post: "Who Are My Neighbors? Bayesian Estimation of Spatial Weight Matrices in R"

**Status: complete and verified — ready to deploy.** Hugo 0.111.3 full build exit 0; 19/19 figures
referenced with zero orphans; 4 Mermaid diagrams, 8 concept cards, 10 tables, 16 display equations
all render; i18n parity 0 missing / 0 stale.

A full data-science pipeline post at `content/post/r_estimateW/`, replicating **Krisztin & Piribauer
(2026)**, *"estimateW: a Bayesian R package for estimating spatial weight matrices, with an
application to European regional growth"* — and extending it well past what the paper does.

## The argument

Every spatial econometric result is conditional on a neighbourhood map somebody chose before the
analysis began. `estimateW` treats all 8,010 off-diagonal cells of the adjacency matrix for 90
European NUTS-1 regions as unknown parameters and samples them jointly with ρ, β and σ² — 8,016
unknowns against 1,710 observations, which is only estimable because of an explicit sparsity prior.

The post is the site's first treatment of an **estimated** W; every prior spatial post
(`r_SDPDmod`, `stata_sp_regression_*`, `python_esda2`, `stata_spxtivdfreg`) takes W as given.

## Replication: exact

All **12 of 12** published quantities of the paper's Table 3 reproduce to the five decimals printed
(largest absolute difference 4.3e-06, below the printed resolution of 1e-5). This required seed 571,
`estimateW` 0.2.0, Mersenne-Twister/Inversion RNG and the reference BLAS to coincide. The audit CSV
also reports each difference in Monte Carlo standard-error units so a reader on a different BLAS can
tell noise from a real discrepancy.

| Quantity | Paper | Ours |
|---|---:|---:|
| ρ | 0.71322 | 0.71322 |
| log initial GVA per worker | −0.01692 | −0.016922 |
| av. indirect, initial GVA | −0.03972 | −0.039723 |
| av. direct, share high education | 0.00049 | 0.000490 |

## What the extensions found

- **The estimated network is national, not geographic.** Regions place 35.6% of their neighbourhood
  weight on compatriots against a size-adjusted chance benchmark of 7.1%. The posterior link
  probability discriminates "same country" (AUC 0.753) better than "shares a border" (0.698).
  Nothing in the specification mentions countries.
- **The map choice moves the policy number.** Refitting the identical SAR under estimated / queen /
  7-NN maps leaves every sign intact but moves the total education impact from 0.00153 to 0.00066
  and 0.00074 — the data-chosen map more than doubles it — and the spillover-to-direct ratio from
  2.11 to 1.20.
- **Ground truth, honestly reported.** On a simulated network (n=40, T=20, 1,560 unknown cells) the
  sampler achieves AUC 0.976 and 95.3% cell accuracy — but **none of the four structural parameters'
  95% credible intervals covered the truth**. The sparsity prior biases the network sparse and ρ down
  with it; autocorrelation narrows the intervals. Reported prominently rather than buried.
- **Specification still matters.** On a Durbin-generated panel only SDM/SDEM recover ρ (0.41, 0.44 vs
  a true 0.50); SAR/SEM omitting the WX channel collapse to 0.17 and 0.11.
- **Contiguity needed ten undocumented decisions.** Ten of ninety regions have no queen neighbour
  (Cyprus, Malta, Aegean islands, Canarias, Åland, Corse, Sicily & Sardinia, Azores, Madeira,
  Ireland) and were patched by nearest centroid before the benchmark could run at all.

## What exists now

- **Core:** `analysis.R` (1,733 lines, 11 sections), `execution_log.txt`, **19 PNG figures**,
  **15 CSV tables**, `plan.md`, `README.md`, `results_report.md` (10 key findings, 7-category
  surprises walk, reproduction-audit appendix).
- **Post:** `index.md` — ~16,000 words, 19 sections, 8 concept cards + 2 inline, 16 display
  equations, 4 Mermaid diagrams, 13 fresh analogies (audited against the three sibling posts so none
  repeat), 10 tables.
- **Notebook + bundle:** `tutorial.qmd` (knitr, `darkly`) and `r_estimateW.zip` (4 files, 40 KB).
  The qmd never samples the 90-region panel — it downloads the committed cache and re-runs only the
  cheap fits, so it knits in about a minute.
- **Slides:** reveal.js deck at `slides/index.html`, 24 slides, three-act structure.
- **Web app:** `web_app/` — dark-theme D3 lab with four tabs: reproduction audit, a prior explorer
  (drag k̄ and watch what you are actually asserting), a network explorer (raise the evidence
  threshold and watch the same-country share climb), and the three-maps comparator. Data baked to
  `web_app/data/results.json` (35 KB) from the CSVs.
- **Infographic:** `infographic_instructions.md` (6-panel chalkboard prompt).
- **AI slides (PDF):** `AI-slides-Bayesian_Spatial_Weight_Estimation.pdf` (22 MB, user-supplied),
  linked absolutely so it opens in a new tab.
- **Podcast:** Spotify episode linked from the front matter (`icon: spotify`, `icon_pack: fab`).
- **i18n:** ES + JA stub cards. Parity clean at 92/92 posts.

## Environment note

R 4.5.2 (x86_64), `estimateW` 0.2.0, reference BLAS. Installed five new CRAN packages: `estimateW`,
`matrixcalc`, `plot.matrix` (both `estimateW` Imports), `circlize`, `GlobalOptions`.

Deliberately **not** used: `spdep` (queen contiguity from `sf::st_touches`), `igraph`/`ggraph`
(network layout is classical MDS drawn with `geom_curve`), `giscoR` (GISCO GeoJSON read directly by
`sf::st_read`). That keeps the dependency footprint to five small pure-R packages.

**The `cache/` directory is committed** (2.2 MB, 19 RDS objects). The three 90-region chains cost
~34 minutes; with the cache present the whole script reproduces in about a minute. This is a
deliberate reversal of the original plan, which would have gitignored the heavy objects — at 2.2 MB
they are smaller than the 8 MB `slides_files/` this site already commits per post, and the
reproducibility is worth far more.

**Figure DPI is not uniformly 300.** At the site's usual `dpi = 300` the 19 figures totalled 12 MB —
five to ten times any other post here — because the network, chord and map figures are line art built
from hundreds of semi-transparent curves, and alpha blending generates millions of near-unique
colours that PNG cannot compress. The map alone was 2.3 MB. Those six figures now render at 150–200
dpi (`save_fig(..., dpi=)` gained an argument), bringing the total to **7.4 MB** with no visible
difference at any realistic display width — the map is still 1870 × 1700, well above a retina content
column. The other thirteen figures remain at 300. Worth remembering if a future post ships many
alpha-blended graphics.

**Local Hugo is too old to build this site.** Both installed binaries (0.84.2, 0.89.4) predate the
`continue` keyword `layouts/section/event.html` needs. Verification used Hugo **0.111.3 extended**,
matching the `netlify.toml` pin, downloaded to the session scratchpad. This is a pre-existing
condition, not caused by this post — worth knowing for any future local verification.

## Verification

- `Rscript analysis.R` ends with `=== Script completed successfully ===`; no errors, no warnings, no
  `Rplots.pdf`.
- Reproduction audit: 12 exact / 0 within-MC-noise / 0 differing, of 12 quantities.
- Identification checks (De Paula, Rasul & Souza 2025): four conditions hold by construction, two
  tested and passing, one (ρ > 0) imposed by the prior support and flagged as such.
- Hugo 0.111.3 `--gc --minify --buildFuture`: exit 0. Post renders with left ToC, all 19 figures,
  4 Mermaid diagrams, all concept cards expanding, math rendered (verified visually in a browser,
  not just in the HTML source — MathJax failures are silent).
- Zero orphaned PNGs, zero broken figure references.
- ZIP verified: 4 files under a single `r_estimateW/` folder, no `__MACOSX`, no `.DS_Store`.
- `scripts/i18n-parity.sh`: 0 missing, 0 stale.

## Open items (for the user)

- **Featured image** `featured.webp` — add manually. `image.placement: 3` renders it full-width above
  the title. Never generated by the pipeline.
- **Journal and DOI for reference [1] are unknown.** The source markdown gives Springer, received
  2026-05-05, responsible editor Christian Glocker, but no journal title, and a web search does not
  resolve it. The reference is cited as "Springer, open access" with no invented journal name — worth
  filling in once the article is indexed.
- **Category vocabulary.** The post uses the canonical `Spatial Regression (SAR, SEM, SDM)` so it
  lands in the `spatial` bucket of `data/tutorial_topics.yaml`. There is no `Bayesian Econometrics`
  category on the site; the Bayesian angle is carried by tags only. If a Bayesian bucket is ever
  wanted, `r_estimateW`, `r_sc_bayes_spatial`, `r_bma_lasso_wals`, `r_dynamic_bma*` and
  `stata_bma_dsl` would populate it.
- **Source paper** is at `content/post/r_estimateW/references/` and gitignored — CC BY 4.0, but not
  republished from this site.
