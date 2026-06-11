# Review: stata_convergence2 Slide Deck

**Audited:** content/post/stata_convergence2/slides/
**Source of truth:** content/post/stata_convergence2/index.md (no results_report.md)
**Date:** 2026-06-11
**Audit version:** review-slides v1.0
**Focus:** all 10 dimensions
**Browser pass:** enabled (slide-audit.cjs)

---

## Verdict: MINOR REVISION

**Overall assessment.** A faithful, well-structured Teaching deck: every number on every
slide traces exactly to the source post (no fabrication), the 3-act arc and assertion titles
are excellent, the Devil's-Advocate slide is present, and the closing is one declarative
sentence. The strongest dimension is source fidelity (all 30+ data points verified); the
weakest is readability — two on-slide blocks stack four/three full sentences that belong in
speaker notes. Fixing the two MED readability blocks and the two LOW terminology
inconsistencies promotes it to ACCEPT. No HIGH issues; no branding drift; no Goldmark `\_`
or currency bug.

**Audited 10 of 10 dimensions.**

---

## Dimension scores

| #  | Dimension                     | Score / 10 | Issues  | Notes                                       |
|----|-------------------------------|-----------:|--------:|---------------------------------------------|
| 1  | Source fidelity               | 10         | 0       | all 30+ numbers/figures trace to index.md   |
| 2  | Conceptual correctness        | 10         | 0       | descriptive framing preserved; ATE disclaimed |
| 3  | Technical & render correctness| 10         | 0       | smoke-test PASS (15/15); math renders; raw-latex 0 |
| 4  | Title↔body consistency        | 10         | 0       | assertion-title test passes                 |
| 5  | Readability & simplicity      | 6          | 2M 2L   | 2 prose walls on-slide; 1 long hook         |
| 6  | Typos & grammar               | 8          | 2L      | Polity-2/Polity 2 + Washington-Consensus inconsistency |
| 7  | write-slides design adherence | 10         | 0       | arc ok; Devil's-Advocate present; closing ok |
| 8  | Branding integrity            | 10         | 0       | scss/title diff clean                       |
| 9  | Accessibility & legibility    | 9          | 1L      | all figs captioned; overflow flags = cumulative artifact |
| 10 | Deliverable completeness      | 10         | 0       | link `slides/index.html` (no trailing slash); files ok |

---

## Issues found

| #  | Dim | Severity | Location                                            | Issue                                                              | Suggested fix                                         |
|---:|----:|----------|-----------------------------------------------------|-------------------------------------------------------------------|-------------------------------------------------------|
| 1  | 5   | MED      | slide "Does this make convergence causal?" (slides.qmd:241) | Response block stacks 4 full sentences (~55 words) on-slide        | Keep 2 anchor lines; move the rest to `::: {.notes}`  |
| 2  | 5   | MED      | slide "The OVB identity…" (slides.qmd:143)          | 32-word gloss with nested parentheticals under the equation       | Tighten to one short line; push elaboration to notes  |
| 3  | 6   | LOW      | slides.qmd:153 vs 15/136/192/225/229                | "Polity 2" (table) vs "Polity-2" (elsewhere) — inconsistent        | Standardize to "Polity 2" (post's form)               |
| 4  | 6   | LOW      | slides.qmd:244,250 (notes) vs 202 (slide)           | "Washington-Consensus" (notes) vs "Washington Consensus" (slide)  | Standardize to "Washington Consensus" (post's form)   |
| 5  | 5   | LOW      | slide "For 30 years…" (slides.qmd:50)               | Hook paragraph ~25 words; second clause could shorten             | Trim to a tighter two-line hook                       |
| 6  | 9   | LOW      | browser pass (slides 20–23)                         | slide-audit reports 4 OVERFLOW + 23 dense slides                  | Cumulative-fragment/notes artifact; per-slide content ≤ 720 box — no real clip |

Order: MED first, then LOW. Numbered consecutively across all dimensions.

---

## Readability rewrites (Dimension 5)

**Issue #1 — slide "Does this make convergence *causal*? No — it is still a description"**

Before:
> [Response.]{.rebuttal} The OVB identity decomposes **correlations**, not causal effects. A flattening $\lambda$ could mean genuine causal change, convergence in unobserved variables, or merely reduced cross-country variation making coefficients noisier. The panel is unbalanced and ends pre-2008. This is a conditional association, not an ATE — and emphatically not policy advice.

After (on slide):
> [Response.]{.rebuttal} The OVB identity decomposes **correlations**, not causal effects.
> A conditional association — not an ATE, and not policy advice.

(in notes): "A flattening λ could mean genuine causal change, convergence in unobserved
variables, or merely reduced cross-country variation making coefficients noisier. The panel
is unbalanced and ends pre-2008."

Why: 4 sentences / ~55 words → 2 short anchor lines; the three alternative explanations are
what the speaker *says*, so they move to notes.

**Issue #2 — slide "The omitted-variable-bias identity links the two literatures in one line"**

Before:
> The gap between **unconditional** ($\beta$) and **conditional** ($\beta^{\ast}$) convergence equals the product of $\delta$ (how much richer countries have *more* of a correlate) and $\lambda$ (how much that correlate predicts growth).

After (on slide):
> The convergence gap = $\delta$ (income → correlate) $\times$ $\lambda$ (correlate → growth).

(in notes): "δ is how much richer countries have more of a correlate; λ is how much that
correlate predicts growth."

Why: 32-word sentence with two nested parentheticals → one symbolic anchor line under the
equation; the verbal unpacking is speech.

**Issue #5 — slide "For 30 years the data said poor countries were *not* catching up"**

Before:
> In the 1960s, richer countries grew **faster** than poorer ones — a world of divergence. Through the 1970s–1990s, the convergence slope sat indistinguishable from zero.

After:
> In the 1960s, richer countries grew **faster** — divergence.
> Through the 1970s–1990s, the convergence slope sat near zero.

Why: trims two ~13-word sentences into tighter two-line spoken-register hook; "indistinguishable
from zero" → "near zero".

---

## HIGH-issue rewrites

None found.

---

## Source-fidelity ledger (Dimension 1)

| Slide datum                          | Value on slide        | Source location          | Match |
|--------------------------------------|-----------------------|--------------------------|-------|
| β 1960s (notes, slide 2)             | +0.53 (p = 0.006)     | index.md:338, 346        | ✓     |
| β 2007 (notes, slide 2)              | −0.76 (p < 0.001)     | index.md:343, 346        | ✓     |
| Convergence trend                    | −0.025/yr             | index.md:388, 403        | ✓     |
| Panel size (slide "The lab")         | 160 countries, 58 yr, 8,328 obs, 50+ correlates | index.md:286, 290 | ✓ |
| Mean growth / log GDP / SD           | 1.96%/yr / 8.71 / 1.19 | index.md:286–287, 290   | ✓     |
| 109 → 160 country expansion          | 109 (1960), 160 (1990) | index.md:290, 820       | ✓     |
| σ trajectory                         | 0.95 → 1.22 (2000) → 1.17 | index.md:130, 429     | ✓     |
| Quartile growth                      | Q4 3.49/Q1 2.46 (1960); Q1 3.02/Q4 0.31 (2007) | index.md:469, 472 | ✓ |
| Excl. SSA stronger                   | β → −1.25 by 2000     | index.md:493            | ✓     |
| Correlate convergence                | inflation −3.07, investment −2.98, polity2 −2.03, schooling −0.16 n.s. | index.md:520–527 | ✓ |
| OVB table 1985                       | δ 0.494, λ 0.891, gap 0.440 | index.md:597–604       | ✓     |
| OVB table 2005                       | δ 0.216, λ 0.183, gap 0.040 | index.md:608–615       | ✓     |
| δ stability slopes                   | Solow 0.88, short 0.89, long 1.02, culture 0.88 | index.md:653–656 | ✓ |
| λ flattening slopes                  | Solow 0.86 (R²0.95); short 0.19 (R²0.06) | index.md:688–689 | ✓ |
| λ falls (notes)                      | Polity2 0.89→0.34; FH pol 1.11→0.19 | index.md:696        | ✓     |
| OVB-gap slopes                       | short 0.09; Solow 0.74 | index.md:724–725        | ✓     |
| Absolute vs conditional gap          | 1.49 (1985) → 0.15 (2000) | index.md:760, 763, 768 | ✓     |
| Polity-2 gap reduction               | 0.440 → 0.040 (91%)   | index.md:623, 836        | ✓     |
| 73-country / 10-correlate sample     | 73 / 10               | index.md:735, 738        | ✓     |
| All 10 figures (`../*.png`)          | resolve on disk       | smoke-test 10/10         | ✓     |

No ✗ entries. Source fidelity is clean.

---

## Title sequence (assertion-title test)

1. For 30 years the data said poor countries were *not* catching up
2. One slope, flipping sign across six decades, is the fact to explain
3. Where we're going
4. The lab: 160 countries, 58 years, 8,328 observations, 50+ correlates
5. Convergence is a trend, not a snapshot: −0.025 per year
6. Beta convergence leads sigma convergence by about a decade
7. Convergence compresses the pack from both ends
8. The catch-up is global — it survives dropping any single region
9. Growth correlates have themselves been converging since 1985
10. The omitted-variable-bias identity links the two literatures in one line
11. For democracy, the gap closed because λ collapsed — not δ
12. Three normalized regressions reproduce the OVB worked example
13. δ is the half that did *not* move: slopes cluster on the 45° line
14. λ is the half that broke: short-run correlates lose all persistence
15. Solow keeps its punch; policy variables flatten
16. Stable δ × collapsed λ ⇒ the OVB gap vanishes for policy variables
17. Absolute convergence "converged to" conditional convergence
18. The Polity-2 OVB gap closed 91% in twenty years
19. Does this make convergence *causal*? No — it is still a description
20. Let the data, not the 1990s regressions, tell you what predicts growth.

**Verdict:** coherent abstract. Slide 3 ("Where we're going") is the only label-style title,
but it is the standard Teaching-deck roadmap slide and is acceptable. The remaining titles read
as a complete argument from tension to resolution.

---

## Positive highlights

- Slide 11's title "For democracy, the gap closed because λ collapsed — not δ" states the
  paper's entire mechanism in nine words before the table proves it.
- Slides 13–14 ("δ is the half that did *not* move" / "λ is the half that broke") form a
  perfect two-slide contrast that carries the OVB decomposition with no extra prose.
- Source fidelity is exemplary: the OVB worked-example table (δ 0.494×λ 0.891 = 0.440 gap)
  reproduces index.md:597–604 to three decimals with no rounding drift.
- The Devil's-Advocate slide steelmans the policy-advice objection rather than strawmanning it,
  and the closing divider is a single declarative thesis — both honor the design contract.

---

## Priority action items

1. **[MED]** Trim the Response block on the Devil's-Advocate slide (slides.qmd:241) to two
   anchor lines; move the three-explanations sentence to `::: {.notes}`.
2. **[MED]** Shorten the OVB-identity gloss (slides.qmd:143) to one symbolic line; push the
   verbal δ/λ unpacking to notes.
3. **[LOW]** Standardize "Polity 2" (drop the hyphen) across slides for consistency with the post.
4. **[LOW]** Standardize "Washington Consensus" (drop the hyphen) in the notes.
5. **[LOW]** Tighten the Act-I hook on slides.qmd:50 into a two-line spoken-register opener.

---

## How to re-review

After applying fixes (via write-slides), re-run:

    /project:review-slides stata_convergence2

To re-check just the dimension you fixed:

    /project:review-slides stata_convergence2 focus: readability

---

## Audit metadata

- Node version: v25.9.0
- Playwright: enabled (system Chrome channel)
- smoke-test.js: PASS (15 of 15 checks)
- Branding diff: clean (site-brand.scss and title-slide.html byte-identical to templates)
- Tooling notes: slide-audit.cjs OVERFLOW/density counts are cumulative across fragments +
  hidden speaker notes (known artifact); per-current-slide content height measured ≤ 720px box,
  so no real clipping. raw-latex slides: 0. No Goldmark `\_` or literal-currency `\$` issues.

---

*Generated by `/project:review-slides`. Skill at `.claude/skills/review-slides/`.
Read-only: this file is the only artifact written; the deck was not modified.*
