# Review: r_SDPDmod Slide Deck

**Audited:** content/post/r_SDPDmod/slides/
**Source of truth:** content/post/r_SDPDmod/index.md
**Date:** 2026-06-11
**Audit version:** review-slides v1.0
**Focus:** all
**Browser pass:** enabled

---

## Verdict: MINOR REVISION

**Overall assessment.** A faithful, well-structured deck: every number traces to the source post, math renders cleanly (48 MathJax spans, zero raw LaTeX), branding is byte-identical, and the 3-act arc lands a one-sentence thesis. The strongest dimension is **source fidelity** (10/10 — the full dynamic-SDM ledger checks out); the weakest is **readability**, where three slides stack two full sentences of body prose on-slide instead of moving the second to speaker notes. No HIGH issues. The one change that promotes it to ACCEPT: move the trailing explanatory sentence off three slides ("The lab", "Lee-Yu corrects", the Devil's-Advocate rebuttal) into `::: {.notes}`.

**Audited 10 of 10 dimensions.**

---

## Dimension scores

| #  | Dimension                     | Score / 10 | Issues  | Notes                                  |
|----|-------------------------------|-----------:|--------:|----------------------------------------|
| 1  | Source fidelity               | 10         | 0       | all ~30 numbers + 4 figures trace to source |
| 2  | Conceptual correctness        | 10         | 0       | estimand framed descriptive; stationarity stated |
| 3  | Technical & render correctness| 10         | 0       | smoke-test PASS (15/15); math renders y |
| 4  | Title↔body consistency        | 10         | 0       | assertion-title test pass              |
| 5  | Readability & simplicity      | 6          | 3 MED, 1 LOW | 3 slides stack 2-sentence prose   |
| 6  | Typos & grammar               | 9          | 1 LOW   | "neighbour" (UK) vs post's US spelling |
| 7  | write-slides design adherence | 10         | 0       | arc ok; Devil's-Advocate present; closing ok |
| 8  | Branding integrity            | 10         | 0       | scss/title diff clean                  |
| 9  | Accessibility & legibility    | 10         | 0       | overflow none (real per-slide over=0)  |
| 10 | Deliverable completeness      | 10         | 0       | link ok (url: slides/index.html); files ok |

---

## Issues found

| #  | Dim | Severity | Location                          | Issue                                          | Suggested fix                                  |
|---:|----:|----------|-----------------------------------|------------------------------------------------|------------------------------------------------|
| 1  | 5   | MED      | slide — "The lab: 46 states × 30 years…" (qmd:92) | `.comment` holds two full sentences of body prose | Keep sentence 1 on-slide; move the FE sentence to `::: {.notes}` |
| 2  | 5   | MED      | slide — "Lee-Yu corrects the small-sample bias…" (qmd:176) | Two prose sentences stacked above the bullets | Keep the one-line anchor; move the Lee-Yu (2010) mechanics sentence to notes |
| 3  | 5   | MED      | slide — "Does any of this estimate a causal tax effect?" (qmd:286) | `[Response.]` is one 51-word, multi-clause sentence on-slide | Split into a short anchor + bullets; move the assumptions detail to notes |
| 4  | 5   | LOW      | slide — "When one state raises its cigarette tax…" (qmd:52) | Second sentence is 19 words | Tighten (optional; it is the Act-I hook) |
| 5  | 6   | LOW      | whole deck (25× "neighbour")      | UK spelling diverges from the post's US "neighbor" | Internally consistent; harmonize to US "neighbor" only if matching the post matters |

Order: HIGH first, then MED, then LOW. Number consecutively across all dimensions.

---

## Readability rewrites (Dimension 5)

**Issue #1 — slide "The lab: 46 states × 30 years of log-elasticities"**

Before:
> Log-log means every coefficient is an elasticity: a percent change in consumption per percent change in price. State and year fixed effects absorb tobacco culture and national anti-smoking trends.

After (on slide):
> Log-log: every coefficient is an elasticity — % change in consumption per % change in price.

(in `::: {.notes}`):
> State and year fixed effects absorb tobacco culture and national anti-smoking trends.

Why: two body sentences → one anchor line; the FE detail is something the speaker says, not the audience reads.

**Issue #2 — slide "Lee-Yu corrects the small-sample bias, lifting ρ from 0.223 to 0.262"**

Before:
> The 46 + 30 = 76 fixed effects create an **incidental-parameter bias** in spatial ML. Lee-Yu (2010) transforms the data to concentrate them out before estimation.

After (on slide):
> 46 + 30 = 76 fixed effects create an **incidental-parameter bias** in spatial ML.

(in `::: {.notes}`):
> Lee-Yu (2010) transforms the data to concentrate the fixed effects out before estimation.

Why: keep one anchor sentence; the "how" sentence belongs in notes.

**Issue #3 — slide "Does any of this estimate a causal tax effect? Not without the usual assumptions"**

Before:
> [Response.] Correct. Two-way fixed effects strip time-invariant state heterogeneity and common shocks, and the spatial/dynamic terms model interdependence — but a causal tax elasticity still needs no time-varying confounders and a stable spatial process ($|\tau + \rho\eta| < 1$). The deck demonstrates a *modeling workflow*, not an identified policy experiment.

After (on slide):
> [Response.] Correct — the deck demonstrates a *modeling workflow*, not an identified policy experiment.
>
> - FE strip state heterogeneity and common shocks
> - Causal tax elasticity still needs: no time-varying confounders + a stable spatial process ($|\tau + \rho\eta| < 1$)

(speaker fills the prose from notes)

Why: a 51-word multi-clause sentence becomes a claim + two short bullets the eye can scan.

**Issue #4 — slide "When one state raises its cigarette tax, smokers cross the border"**

Before:
> So a state's consumption depends on its *neighbours'* prices and consumption — a **spatial spillover**.

After:
> So a state's consumption depends on its *neighbours'* — a **spatial spillover**.

Why: 19 words → 12; optional, since this is a deliberate hook line.

---

## HIGH-issue rewrites

None found.

---

## Source-fidelity ledger (Dimension 1)

| Slide datum                 | Value on slide | Source location               | Match |
|-----------------------------|----------------|-------------------------------|-------|
| Posterior prob. static SDM (ind FE) | 99.89% | index.md:497, :561 | ✓ |
| SDEM runner-up (ind FE)     | 0.11%          | index.md:497 / :561           | ✓ |
| Static two-way: SDM / SDEM  | 45.92% / 41.31% | index.md:521 / :562          | ✓ |
| Dynamic two-way: SEM / SAR  | 29.84% / 25.73% | index.md:548 / :563           | ✓ |
| SAR two-way ρ, t            | 0.187, 6.52    | index.md:636 (0.18659, 6.5173) | ✓ |
| SAR two-way logp / logy     | −0.995 / 0.464 | index.md:640–641              | ✓ |
| SAR ind-FE ρ / price        | 0.298 / −0.53  | index.md:609, :613            | ✓ |
| Lee-Yu ρ correction         | 0.223 → 0.262 (17%) | index.md:739                | ✓ |
| Lee-Yu slope shift          | −1.003 → −1.001 | index.md:739                 | ✓ |
| SDM impacts Direct logp/logy | −1.010 / 0.588 | index.md:768–769             | ✓ |
| SDM impacts Indirect logp/logy | −0.219 / −0.197 | index.md:773–774           | ✓ |
| SDM impacts Total logp/logy | −1.230 / 0.391 | index.md:778–779              | ✓ |
| Big number: total price elasticity | −1.23 (22% > −1.01) | index.md:977, :989    | ✓ |
| Dynamic SDM τ, t            | 0.864, ≈67     | index.md:881 (0.864412, 67.12) | ✓ |
| Dynamic SDM ρ               | 0.162          | index.md:877                  | ✓ |
| Dynamic SDM logp            | −0.271         | index.md:883 (−0.270872)      | ✓ |
| W·logp static / dynamic     | 0.091 (n.s.) / 0.196 (sig), t=4.46 | index.md:735, :885, :886 | ✓ |
| Short-run / long-run direct price | −0.26 / −1.93 | index.md:907, :924         | ✓ |
| Short-run indirect price    | +0.18          | index.md:912 (0.178932)       | ✓ |
| Robustness 2nd-order: ρ=0.449, W·logp sig (notes) | 0.449 / 0.337 sig | index.md:983 | ✓ |
| Figure fig4 (spaghetti)     | ../r_SDPDmod_fig4_eda_spaghetti.png | index.md:351 | ✓ |
| Figure fig1 (W matrix)      | ../r_SDPDmod_fig1_weight_matrix.png | index.md:402 | ✓ |
| Figure fig2 (model comp.)   | ../r_SDPDmod_fig2_model_comparison.png | index.md:557 | ✓ |
| Figure fig3 (impacts)       | ../r_SDPDmod_fig3_impact_decomposition.png | index.md:965 | ✓ |

Every ✗ is a HIGH issue listed above. (No ✗ found.)

---

## Title sequence (assertion-title test)

1. When one state raises its cigarette tax, smokers cross the border
2. A 30-year panel already whispers the answer: states stay where they start
3. The lab: 46 states × 30 years of log-elasticities, neighbours from a W matrix
4. Neighbours are sparse: 188 of 2,116 pairs, ~4 neighbours per state
5. Six spatial models, one equation — they differ in where space enters
6. Let the data choose: the static SDM wins with 99.89% posterior probability
7. SDM dominates the static race — but dynamics flatten every model
8. SAR makes neighbours' consumption pull your own — ρ = 0.187, highly significant
9. Six lines fit a spatial-Durbin panel with Lee-Yu correction in R
10. Lee-Yu corrects the small-sample bias, lifting ρ from 0.223 to 0.262
11. SDM adds neighbours' covariates — and flips the income spillover negative
12. Ignore spillovers and you understate the price response by 22%
13. Cigarettes are habit-forming — so yesterday belongs in the model
14. Add time and the spatial story shrinks: τ = 0.86 dominates, ρ falls to 0.16
15. The dynamic SDM uncovers cross-border shopping: W·logp = +0.20, significant
16. Short-run vs long-run: a 1% price hike cuts demand 0.26% now, 1.93% eventually
17. Habit persistence rules: τ ≈ 0.86 dwarfs the spatial coefficient
18. Does any of this estimate a causal tax effect? Not without the usual assumptions
19. One dataset, three lessons the workflow makes visible
20. Ignore your neighbours or ignore yesterday, and your tobacco-tax forecast is wrong.

**Verdict:** coherent abstract — the titles alone tell the full arc from the cross-border hook through model selection, static SDM, dynamics, and the policy thesis.

---

## Positive highlights

- Slide 6's title "Let the data choose: the static SDM wins with 99.89% posterior probability" turns a model-selection step into a one-line claim with the headline number.
- The two dark `{.bignum}` slides (−1.23, then 0.864) anchor the static and dynamic acts on a single number each — exactly the write-slides "headline result" pattern.
- The Devil's-Advocate slide (18) correctly distinguishes a descriptive modeling workflow from an identified causal experiment and states the stationarity condition |τ + ρη| < 1 — faithful to the post's careful framing.
- Figure-first method slides: every evidence slide (fig4, fig1, fig2, fig3) leads with the picture and pushes the explanation into notes.

---

## Priority action items

1. **[MED]** Move the second sentence off three prose-heavy slides ("The lab" qmd:92, "Lee-Yu corrects" qmd:176, the rebuttal qmd:286) into `::: {.notes}`; keep a one-line anchor on each.
2. **[MED]** Split the 51-word rebuttal sentence into a claim + two bullets (Issue #3 rewrite).
3. **[LOW]** Optionally tighten the Act-I hook line (Issue #4) and decide whether to harmonize "neighbour" → "neighbor" to match the post.

---

## How to re-review

After applying fixes (via write-slides), re-run:

    /project:review-slides r_SDPDmod

To re-check just the dimension you fixed:

    /project:review-slides r_SDPDmod focus: readability

---

## Audit metadata

- Node version: v25.9.0
- Playwright: enabled (npx cache, system Chrome channel)
- smoke-test.js: PASS (15 of 15 checks)
- Branding diff: clean (site-brand.scss and title-slide.html byte-identical)
- Tooling notes: slide-audit.cjs flagged 2 "OVERFLOW" + 24 "dense" slides, but a per-slide probe at 1280×720 shows real over=0 on every slide — the flags are the documented cumulative-notes artifact (word/bullet counts sum vertical sub-slides + hidden speaker notes). Only raw-LaTeX (0) and true overflow (0) are load-bearing here.

---

*Generated by `/project:review-slides`. Skill at `.claude/skills/review-slides/`.
Read-only: this file is the only artifact written; the deck was not modified.*
