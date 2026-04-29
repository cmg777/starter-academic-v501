# Infographic Review: stata_matching

**File:** `infographic_instructions.md`
**Source post:** `index.md`
**Reviewed:** 2026-04-29
**Scope:** Full review across all 7 dimensions

## Verdict: ACCEPT

Every number in the infographic traces back to a specific passage in `index.md`; all four sections (A flowing-prose prompt, B negative prompt, C condensed prompt under 400 words, D panel reference data) are well-formed; all six panels contain the seven required elements (position, border + circled number, title, icon, mini-viz, callout, body sentences, connector arrow); Panel 4 includes the comparison visual with the doubly robust AIPW estimate highlighted in teal as the headline; the six panels arc coherently from question → problem → method taxonomy → quantitative comparison → diagnostic → conclusion; and the Causal Inference template is correctly applied. Two LOW polish items only.

## Dimension 1 — Accuracy

Every quantitative claim cross-referenced against `index.md`:

| # | Infographic claim | Source-post location | Match? |
|---|---|---|---|
| 1 | 4,642 mother-infant pairs | §1 ("4,642 mother-infant pairs") and §5 (`Number of obs = 4,642`) | ✓ |
| 2 | 864 smokers | §5 (`Smoker | 864`) | ✓ |
| 3 | 3,778 non-smokers | §5 (`Nonsmoker | 3,778`) | ✓ |
| 4 | Smokers' mean = 3,138 g | §5 (`Smoker | 3137.66`, rounded) | ✓ |
| 5 | Non-smokers' mean = 3,413 g | §5 (`Nonsmoker | 3412.91`, rounded) | ✓ |
| 6 | Raw gap = 275 g | §5 ("a 275 g gap") and §7 (`-275.2519`) | ✓ |
| 7 | Naive ATE = −275 g | §7, §13 forest plot row | ✓ |
| 8 | RA bar at −240 g | §13 table (−239.6 → rounds to −240) | ✓ |
| 9 | IPW bar at −231 g | §13 table (−230.9 → rounds to −231) | ✓ |
| 10 | IPWRA bar at −232 g | §13 table (−231.9 → rounds to −232) | ✓ |
| 11 | AIPW bar at −232 g (teal) | §13 table (−232.5 → rounds to −232 with no decimal) | ✓ |
| 12 | NNM bar at −210 g | §13 table (−210.1 → rounds to −210) | ✓ |
| 13 | PSM bar at −229 g | §13 table (−229.4 → rounds to −229) | ✓ |
| 14 | "5/6 estimators within ±10 g" | §13 ("between −229 and −240") and §14 ("agree within 10 grams") | ✓ |
| 15 | "35 to 65 g toward zero" | §14 ("between 35 and 65 grams") | ✓ |
| 16 | "13 to 24 percent" | §14 ("13% to 24% reduction") | ✓ |
| 17 | Pseudo R² = 7.8 % | §9 (`Pseudo R2 = 0.0776`) and §14 lessons | ✓ |
| 18 | LR χ² = 346 | §9 (`LR chi2(4) = 346.31`) | ✓ |
| 19 | "Conditional independence" formula `{Y(0), Y(1)} ⊥ D | X` | §4 Assumption 1 | ✓ |
| 20 | "Propensity score" formula `e(X) = Pr(D=1 | X)` | §4 and §9 equations | ✓ |
| 21 | "AIPW influence function" formula | §10.2 equation | ✓ |
| 22 | "Matching estimator" formula | §11 equation | ✓ |
| 23 | Cattaneo (2010) attribution | §1 ("Cattaneo (2010) study") and References §1 | ✓ |
| 24 | Six estimators | §6 taxonomy and §13 forest plot | ✓ |

24/24 numerical and formula claims match the source post within stated rounding. No fabricated numbers.

## Dimension 2 — Completeness

All four sections present and well-formed:

- **Section A** — full image generation prompt (~1,250 words of flowing prose, no markdown tables, all six hex codes inline)
- **Section B** — negative prompt (single dense paragraph, includes both standard exclusions and topic-specific ones such as "no specific software brand logos")
- **Section C** — condensed prompt (370 words by my count, well under the 400-word ceiling for token-limited tools like DALL-E 3 and Midjourney)
- **Section D** — panel reference data (six panel records with all required fields plus a Margin Elements record)

All six panels in Section D have callout, key number, body sentences (2 each, all 15-30 words), icon, mini-viz, and connector to next.

## Dimension 3 — Prompt Quality

- Section A opens with the exact required line: "Create a 1920x1080 landscape digital chalk illustration on a dark navy background (#0e1545)".
- All six hex codes appear inline in the color paragraph: `#0e1545`, `#f0ece2`, `#8bb8e0`, `#e8956a`, `#00d4c8`, `#b0a89a`.
- Title banner is described and positioned ("centered above the grid"); guiding question appears in italic chalk-white below.
- Each of the six panel paragraphs begins with a spatial position phrase ("The top-left panel (row 1, column 1)", "The top-center panel (row 1, column 2)", etc.).
- Connector arrows are described between every adjacent pair of panels with explicit transition phrases ("Why is this hard?", "How do we fix it?", "How do they compare?", "Can we trust the comparison?", "What do we conclude?").
- Section A is **flowing prose throughout** — no bullet points, no markdown tables, no tagged metadata. Section D is the only place where structured markdown is used (correctly, since it is the appendix).

## Dimension 4 — Panel Completeness

Each panel checked against the seven required elements:

| Panel | Position | Border + number | Title | Icon | Mini-viz | Callout | Body | Connector |
|---|---|---|---|---|---|---|---|---|
| 1 The Question | row 1, col 1 | ✓ | "THE QUESTION" | pregnant figure + cigarette + baby + scale | side-by-side weights | "Does smoking *cause* the gap?" (warm orange) | 2 sentences | "Why is this hard?" |
| 2 The Confounding Problem | row 1, col 2 | ✓ | "THE CONFOUNDING PROBLEM" | DAG nodes X, D, Y | DAG with X→Y in warm orange | "Naive gap = −275 g (biased)" | 2 sentences | "How do we fix it?" |
| 3 Six Estimators | row 1, col 3 | ✓ | "SIX ESTIMATORS" | taxonomy tree | 4-branch tree, doubly robust in teal | "All built on `teffects`" | 2 sentences | "How do they compare?" (vertical) |
| 4 Forest Plot | row 2, col 1 | ✓ | "FOREST PLOT COMPARISON" | forest plot | 7 error bars, AIPW in teal | "−232 g (AIPW)" (teal) | 2 sentences | "Can we trust the comparison?" |
| 5 Overlap & Balance | row 2, col 2 | ✓ | "OVERLAP & BALANCE" | overlapping bell curves | 2 density curves on (0,1) | "Pseudo R² = 7.8 %" | 2 sentences | "What do we conclude?" |
| 6 Key Takeaways | row 2, col 3 | ✓ | "KEY TAKEAWAYS" | 3-icon mini-comic | 3 numbered bullets | "5/6 estimators within ±10 g" (teal) | 2 sentences | end |

All 42 cells (6 panels × 7 elements) populated with concrete content. Icons are panel-specific (no repeats). Mini-vizes use specific data values from the post (e.g., "−320 to −150 grams axis", "0 to 1 propensity score axis").

## Dimension 5 — Panel 4 Comparison Visual

- ✓ Includes a comparison visual: a chalk-drawn forest plot with seven horizontal error-bars on a horizontal grams axis.
- ✓ Identifies a "best" or headline method: AIPW at −232 g, the doubly robust default.
- ✓ Highlights the headline in teal (`#00d4c8`), the conventional positive-emphasis color from the site palette.
- ✓ Naive baseline rendered in warm orange (the cautionary, biased estimate) — the visual contrast between teal headline and warm-orange foil is intentional and well-described.
- ✓ Body text quantifies the spread: "5 of 6 within ±10 g" and "moves the answer 35 to 65 grams toward zero".

## Dimension 6 — Pedagogical Coherence

The six panels tell a coherent story that mirrors the post's narrative:

1. **Panel 1 (Question)** — establishes the case study with concrete numbers a reader can grasp immediately (3,138 g vs 3,413 g).
2. **Panel 2 (Problem)** — visualizes *why* the question is non-trivial via the DAG.
3. **Panel 3 (Methods)** — lays out the toolkit (six estimators in four families).
4. **Panel 4 (Comparison)** — delivers the quantitative answer with the headline number in teal.
5. **Panel 5 (Diagnostic)** — establishes the credibility of the answer.
6. **Panel 6 (Takeaways)** — synthesizes and points to the unresolved limit (unobserved confounding).

The arc parallels the post's §1 → §3 → §6 → §13 → §10/§12 → §15 progression. A viewer with no prior exposure to causal inference can follow the panels as a self-contained narrative, and a viewer who *has* read the post will recognize each panel as a one-card summary of a multi-section argument.

## Dimension 7 — Template Alignment

- ✓ **Causal Inference template** correctly applied (the post is tagged Causal Inference and uses `teffects`).
- ✓ Color legend uses the canonical causal-template entries: "Causal effect" (teal), "Bias / confounding" (warm orange), "Mothers / data" (chalk white).
- ✓ Background formulas are causal-inference-relevant (conditional independence, propensity score, AIPW influence function, matching estimator).
- ✓ Topic-specific icon vocabulary (DAG, mother + cigarette, statistical twins implied by matching tree).

## Issues Found

| # | Dimension | Severity | Location | Issue | Suggested fix |
|---|---|---|---|---|---|
| 1 | Accuracy (notation) | LOW | Section A atmosphere paragraph + Section D background formulas | The AIPW background formula is written as `θ = E[μ₁(X) − μ₀(X) + ...]`, but `index.md` §10.2 uses the symbol `τ̂_AIPW` for the same quantity. The AI image renderer will not care, but a sharp-eyed reader of the rendered chalkboard might. | Optional: change `θ` to `τ̂_AIPW` in the formula text. |
| 2 | Sentence quality | LOW | Section D, Panel 5, body sentences | "If a non-smoker had propensity 0.99, IPW would give them weight 100 — and the comparison would collapse." This is a great pedagogical micro-example, but it implies a counterfactual scenario that does not occur on this dataset. A skeptical reviewer might ask whether the chalkboard is making an empirical claim about *this* analysis. | Optional: change to "Where propensities approach 0 or 1, IPW becomes unstable — but here the (0,1) overlap is healthy across the entire interval." |

No HIGH and no MEDIUM issues.

## Variant Improvement Suggestions

1. **Forest-plot variant.** If a future iteration wants to make the methodology comparison even more legible, the forest plot in Panel 4 could swap the seven horizontal error-bars for a *vertical* dot-and-line forest plot with the methods on the y-axis labels. Reduces the visual weight at the bottom of the panel and makes the AIPW teal dot more prominent.

2. **Add a Mermaid-style "method family" callout to Panel 3.** Currently the four-branch taxonomy is a chalk tree; a small chalk Venn diagram showing "Outcome model" ∩ "Treatment model" → "Doubly robust" would make the pedagogical insight (you only need *one* of two to be right) immediately visible without reading body text.

3. **Tone variant for Panel 6.** The current "If unobserved confounders matter, every estimator is biased the same way" is academically correct but clinical. A warmer alternative: "Even six methods agreeing leaves *one* assumption unverifiable — is the one you can't measure the one that matters?"

## Priority Action Items

None blocking. Both LOW issues are cosmetic. The infographic is ready to paste into Gemini, Ideogram, DALL-E 3, or Midjourney (using the appropriate Section A or Section C variant).
