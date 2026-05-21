# r_double_lasso — Full Double LASSO pipeline complete

**Date:** 2026-05-21
**Post slug:** `r_double_lasso`
**Topic:** Double LASSO for causal inference — replicating Fitzgerald,
Lattimore, Robinson & Zhu (2026, *Journal of Applied Econometrics*) on the
Donohue–Levitt (2001) abortion–crime panel with 284 candidate controls

## Summary

The `r_double_lasso` post replicates Fitzgerald et al.'s (2026, *JAE*)
empirical application — the Donohue–Levitt abortion–crime panel with
n = 576 and p = 284 candidate controls — and uses it as a teaching vehicle
for the rigorous vs cross-validated penalty distinction in high-dimensional
causal inference. The post's pedagogical hinge is a sign flip on the
violent-crime estimand: DL-rigorous (theory-based λ) gives
**α̂ = −0.096** while DL-CV (same recipe, cross-validated λ) gives
**+0.019**. The selection counts $|I_y| = 0$ and $|I_d| = 8$ for violent
crime — and the analogous 3 / 9 (property) and 0 / 9 (murder) — match
the paper's Table 2 *exactly* in all six cells. Point estimates agree to
within 0.04 on the largest gap (murder DL-rigorous).

This is the **fourth full pipeline pass** since the data-science skill
system was redesigned, after `r_did2` (2026-05-18), `r_did_ring` (2026-05-19),
and the Python tutorial bundles (2026-05-20). It is the first R pipeline
delivered with all artefacts in one session and the first to use the
two-layer headline structure (rigorous vs CV) as the pedagogical spine.

## Deliverables

| # | Skill / step | Artefact | Status |
|---|---|---|---|
| 1 | `/project:write-script` | `analysis.R` (783 lines) | Clean run, 0 errors, ~90 s wall clock (committed earlier in `b61e965` + `c07eed3`) |
| 2 | `/project:review-script` | `script-review.md` | ACCEPT (committed in `c07eed3`) |
| 3 | `/project:write-results-report` | `results_report.md` (301 lines, 9 Key Findings, 7-category Surprises checklist, Fitzgerald 2026 Reproduction Audit appendix with 12 line citations to the manuscript) | ACCEPT (initial version committed in `470acc7`; 3 LOW fixes applied this session — 13-vs-12-year inconsistency, §4.4 figure placement moved to §4.5, audit-row 297 phrasing) |
| 4 | `/project:review-results-report` | `results_report_review.md` | ACCEPT (0 HIGH, 1 MED, 2 LOW — all fixed in step 3) |
| 5 | `/project:write-post` | `index.md` (1,131 lines, 18 sections, 8 display equations, 4 figures + 2 Mermaid diagrams, 8 collapsible Key Concepts cards, 4 numbered Exercises, 11-entry References section with DOI hyperlinks) | Comprehensive; user manually edited title to "Double LASSO for Causal Inference: Does Abortion Reduce Crime?" |
| 6 | `/project:review-post` | `post_review.md` | ACCEPT (110/120 across 12 dimensions; 1 MED + 3 LOW all fixed; manual title and removed front-matter "Source paper (JAE)" link preserved) |
| 7 | `/project:write-infographic` | `infographic_instructions.md` (~29 KB, 4 sections: full prompt + negative prompt + condensed prompt + panel reference data) | Chalkboard 6-panel storyboard with right-margin "FIVE ESTIMATORS TRACKED" sidebar; 3 BIG numbers (143/284, −0.096→+0.019, 8/284); Story Spine arc |
| 8 | `/project:write-quarto-notebook` | `tutorial.qmd` (1,107 lines, 33 chunks, theme: darkly) | Renders cleanly in ~3 minutes after switching `pak::pkg_install("pkg@version")` → `install.packages()` "install-if-missing" (pak refused with dependency conflicts on already-installed packages) |
| 9 | Quarto bundle (Phase 4.5) | `r_double_lasso.zip` (39 KB, 4 files inside `r_double_lasso/`: `tutorial.qmd`, `analysis.R`, `_quarto.yml` stub, `README.md`) | Built and added to `links:` after the R script entry |
| 10 | AI Podcast overlay | inline audio player block at end of `index.md` (~435 lines: `<style>` + `<div>` + `<script>`) | <https://files.catbox.moe/anx2jt.m4a> (m4a, stream link with `target="_blank"`) |

## Highlights

- **Selection-count exact match.** $|I_y| = 0 / 3 / 0$ and $|I_d| = 8 / 9 / 9$
  across (violent, property, murder) reproduce Fitzgerald et al.'s Table 2
  *exactly* in all six cells — the strongest replication signal in the
  whole pipeline. The selection-count fidelity sells the replication
  more convincingly than the point estimates do (which match within 0.04
  on the largest gap).

- **Two-layer headline.** DL-rigorous gives violent-crime α̂ = −0.096;
  DL-CV (same recipe, cross-validated λ) flips to +0.019 and inflates
  the murder estimate to −1.11. The contrast reads as a pedagogical
  hinge — "same recipe, one knob, very different answer" — and reinforces
  the paper's main methodological point that the CV penalty is tuned for
  prediction, not for causal inference.

- **Sandwich-formula transparency.** The post derives the HC1 cluster-
  robust variance from scratch, with an `\underbrace{...}` breakdown of
  $\hat V_{\text{cluster}} =$ (small-sample correction) × (cluster-count
  correction) × (bread) × (meat) × (bread). The 20-line `cluster_se()`
  implementation sits directly next to the equation, so the reader sees
  the math and the R together.

- **Key Concepts + Exercises added.** Eight collapsible concept cards
  (LASSO, λ, PSL, DL, selection sets $I_y$/$I_d$, rigorous vs CV penalty,
  post-OLS, clustered SE) match the `python_doubleml` exemplar's
  Example + Analogy `<details>` pattern. Four numbered Exercises ask the
  reader to perturb `analysis.R` directly (change CV seed, tighten
  rigorous `c`, drop a year, substitute Ridge for LASSO).

- **Math typesetting audit resolved a Goldmark/KaTeX edge case.**
  `\|I_y\|` outside math mode renders correctly with plain `\|...\|`
  (cardinality bars), while the legitimate L2 norm at §6 inside math
  mode uses `\\\|y - X\beta\\\|_2^2` (rendered as ‖·‖). All 8 display
  equations verified in the Hugo dev server before the post was
  finalised.

## Quarto-bundle deviation from skill template

The `setup-packages` chunk uses `install.packages()` "install-if-missing"
instead of the skill template's `pak::pkg_install("pkg@version")`. The
pak approach failed at render time with:

```
! ! error in pak subprocess
* glmnet@4.1.10: Conflicts with glmnet@4.1.10
* dplyr@1.1.4: dependency conflict
[etc.]
```

pak refused to "install" packages whose requested versions matched the
already-installed versions on the developer's machine. The fall-back
to plain `install.packages()` (mirroring `analysis.R`'s pattern) renders
cleanly. The pinned versions (`glmnet@4.1.10, hdm@0.3.2, sandwich@3.1.1,
lmtest@0.9.40, ggplot2@4.0.1, dplyr@1.1.4, tidyr@1.3.2, scales@1.4.0,
patchwork@1.3.2`) are retained as comments in the setup chunk for
readers who want bit-reproducible installs via `remotes::install_version()`
or a manual `pak::pkg_install()`. The notebook also pins
`set.seed(20260520)` (matching `analysis.R`) so DL-CV numbers reproduce
exactly across renders.

## Render artefacts (not committed)

`tutorial.html` (127 KB) and `tutorial_files/figure-html/` (~3 MB, 5 PNGs)
are produced locally by `quarto render` but excluded per the sibling-post
convention (`content/post/*/tutorial.html` and `tutorial_files/` are in
`.gitignore`). The 4 reproducible PNGs already in the post bundle
(`r_double_lasso_estimates.png`, `r_double_lasso_methods_compare.png`,
`r_double_lasso_paths.png`, `r_double_lasso_selection.png`) are the
authoritative versions for the published post body. The transient
`tutorial-render.log` is also gitignored (new rule added in this commit).

## Next steps

1. Optional: generate a single-image rendered version of
   `infographic_instructions.md` via Gemini and embed it under
   `featured-infographic.png` in the page bundle.
2. Optional: regenerate the AI podcast (`anx2jt.m4a`) if substantial
   later edits to `index.md` make the audio drift from the prose.
3. Optional: revisit the `pak::pkg_install` strategy in the
   `write-quarto-notebook` skill — for posts where the developer
   has bleeding-edge versions installed, the strict pinning fails.
   A try/catch fallback to plain `install.packages()` would make the
   skill template more robust.
4. Pipeline ready for the next post; no follow-up work required on
   r_double_lasso itself.
