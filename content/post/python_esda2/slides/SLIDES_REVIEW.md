# Review: python_esda2 Slide Deck

**Audited:** content/post/python_esda2/slides/
**Source of truth:** content/post/python_esda2/index.md (no results_report.md)
**Date:** 2026-06-11
**Audit version:** review-slides v1.0
**Focus:** all 10 dimensions
**Browser pass:** enabled (Chromium via slide-audit.cjs + per-slide 1280×720 overflow re-check)

---

## Verdict: MINOR REVISION (pre-fix) → ACCEPT after applied fix

**Overall assessment.** A strong, faithful, on-brand deck. The assertion titles read in sequence as a clean abstract, the 3-act arc is well executed, and every on-slide number traces to the source post. The single blocker was a self-contradiction in the speaker notes of slide 211: the note simultaneously stated "5 HL" and called San Andrés "the lone HL." That note also dropped the post's actual lone outlier (Potosí, the lone LH). Strongest dimension: source fidelity of on-slide content (all 24 on-slide data points match). Weakest: the one notes-level fidelity slip, now fixed. With that correction the deck has no HIGH issues and every dimension scores ≥ 7.

**Audited 10 of 10 dimensions.**

---

## Dimension scores

| #  | Dimension                     | Score / 10 | Issues  | Notes                                        |
|----|-------------------------------|-----------:|--------:|----------------------------------------------|
| 1  | Source fidelity               | 9          | 1 LOW*  | all on-slide numbers trace; one notes slip (fixed) |
| 2  | Conceptual correctness        | 10         | 0       | estimand framing (description ≠ causation) explicit |
| 3  | Technical & render correctness| 10         | 0       | smoke-test 15/15; MathJax renders; no raw LaTeX |
| 4  | Title↔body consistency        | 10         | 0       | assertion-title test passes                  |
| 5  | Readability & simplicity      | 9          | 1 LOW   | bullets short; one slightly long rebuttal     |
| 6  | Typos & grammar               | 10         | 0       | British spelling internally consistent        |
| 7  | write-slides design adherence | 9          | 1 LOW   | arc ok; Devil's-Advocate present; closing ok; one label-ish agenda title |
| 8  | Branding integrity            | 10         | 0       | scss + title-slide diffs clean                |
| 9  | Accessibility & legibility    | 10         | 0       | 0 real overflows at 1280×720; figures captioned |
| 10 | Deliverable completeness      | 10         | 0       | url: slides/index.html; index.html 55 KB; 6/6 figs resolve |

*Issue #1 was HIGH pre-fix (self-contradiction in notes); reclassified after the fix was applied this run.

---

## Issues found

| #  | Dim | Severity | Location                                  | Issue                                                                 | Suggested fix                                              |
|---:|----:|----------|-------------------------------------------|----------------------------------------------------------------------|------------------------------------------------------------|
| 1  | 1   | HIGH     | slide 211 notes — slides.qmd:216          | Note says "5 HL" then calls San Andrés "the lone HL" — self-contradiction; post's lone outlier is Potosí (the lone LH) | APPLIED: "San Andrés is the most prominent of the 5 HL outliers … and Potosí (BOL) is the lone LH" |
| 2  | 5   | LOW      | slide 297 — "Does … causal claim?"        | Rebuttal is 3 stacked sentences on-slide (Devil's-Advocate)          | Acceptable as deliberate contrast; optionally move the 3rd sentence to notes |
| 3  | 7   | LOW      | slide 70 — "Where we're going"            | Mildly label/agenda-style title in an otherwise assertion-titled deck | Acceptable: Act-I roadmap, allowed for a teaching deck      |

Order: HIGH first, then LOW. Numbered consecutively across all dimensions.

---

## Readability rewrites (Dimension 5)

**Issue #2 — slide 297 "Does positive Moran's I make this a causal claim? No — it is description, not identification"**

Before:
> No. Moran's I and LISA are *descriptive* — they measure spatial pattern, not mechanism. Clustering can come from genuine spillovers, from shared regional shocks, or from omitted common factors. ESDA flags *where* to look; identifying *why* needs a spatial regression and an identification strategy.

After (keep first two sentences on-slide; move the third to `::: {.notes}`):
> No. Moran's I and LISA are *descriptive* — they measure spatial pattern, not mechanism. ESDA flags *where* to look; identifying *why* needs a spatial regression.

Why: drops the "genuine spillovers / shared shocks / omitted factors" enumeration to the spoken notes, where it already partly lives; the on-slide rebuttal becomes two crisp lines. LOW — the slide is a deliberate Devil's-Advocate beat and reads fine as is, so this is optional polish, not a blocker.

---

## HIGH-issue rewrites

**Issue #1 — Source fidelity — slide 211 speaker notes (slides.qmd:216)**

Before:
> At p < 0.10: 30 HH, 37 LL, 5 HL, 1 LH, 80 not significant. … San Andrés (COL) is the lone HL — a high-development island among lower mainland neighbours. The clusters cover roughly half the map.

After (applied):
> At p < 0.10: 30 HH, 37 LL, 5 HL, 1 LH, 80 not significant. … San Andrés (COL) is the most prominent of the 5 HL outliers — a high-development island among lower mainland neighbours — and Potosí (BOL) is the lone LH. The clusters cover roughly half the map.

Why: the post (index.md:927) reports **5 HL outliers** in 2019 and names **Potosí (BOL) as the lone LH outlier**; "the lone HL" both contradicted the same sentence's "5 HL" count and misattributed the singular outlier. The fix restores both facts.

---

## Source-fidelity ledger (Dimension 1)

| Slide datum                              | Value on slide        | Source location              | Match |
|------------------------------------------|-----------------------|------------------------------|-------|
| Global Moran's I (key-result strip)      | 0.57 → 0.63           | index.md:734-735 (0.5680→0.6320) | ✓ |
| HH / LL clusters 2019 (strip + s.211)    | 30 / 37               | index.md:842-846             | ✓     |
| Permutations / p                         | 999 / p = 0.001       | index.md:734-735             | ✓     |
| Class transitions (s.62 notes)           | 43 up, 86 same, 24 down | index.md:544-546           | ✓     |
| Mean SHDI change                         | +0.0053               | index.md:404,413             | ✓     |
| Income decline                           | 71 / 153 (46.4%)      | index.md:504                 | ✓     |
| Mean neighbours / islands                | 4.93 / 2 islands      | index.md:671-675             | ✓     |
| Moran I + p + z, 2013/2019 (table s.155) | 0.5680/10.77, 0.6320/11.99, p=0.0010 | index.md:734-735 | ✓ |
| Expected I under randomness              | −0.0066               | index.md:736                 | ✓     |
| Rise in I (notes s.168)                  | 0.064                 | 0.6320−0.5680                | ✓     |
| LISA 2019 counts                         | 30/37/5/1/80          | index.md:842-846             | ✓     |
| LISA 2013 counts (table s.219)           | 31/29/5/0 (+88 ns)    | index.md:945-949             | ✓     |
| LL growth                                | 29 → 37 (+8)          | index.md:1054,1279           | ✓     |
| HH persistence                           | 27 of 31 = 87%        | index.md:1048,1054           | ✓     |
| ns → LL transition                       | 17 regions            | index.md:1051                | ✓     |
| Quadrant stability (directional)         | 95 (62.1%) / 58 (37.9%) | index.md:1133-1134         | ✓     |
| Venezuela: n, mean, range, ending LL     | 24, −0.0653, [−0.067,−0.064], 21 in LL | index.md:1241-1246 | ✓ |
| Venezuela crossing                       | 88% (21 of 24)        | index.md:1244                | ✓     |
| Bolivia: n, mean, range, stability       | 9, +0.0333, [+0.030,+0.035], 7 of 9 (78%) | index.md:1248-1253 | ✓ |
| Country table stability                  | Bol 7/9 (78%), Ven 3/24 (12%) | index.md:1244,1251   | ✓     |
| San Andrés as HL / Potosí as LH (notes)  | corrected this run    | index.md:927                 | ✓ (after fix) |

Every on-slide ✓; the single ✗ was a notes-only slip, now fixed.

---

## Title sequence (assertion-title test)

1. Prosperous and lagging regions cluster on the map — but is the pattern real?
2. One dataset, two snapshots: 153 regions, 12 countries, six years apart
3. Where we're going
4. The lab: subnational HDI for 153 regions across 12 countries, 2013 and 2019
5. Spatial autocorrelation has no meaning until you define "neighbour"
6. Queen contiguity links 153 regions with 4.93 neighbours on average — two islands left isolated
7. Moran's I asks one question: do like values sit next to like values?
8. We test I by shuffling the map 999 times — no normality assumption needed
9. Both years cluster strongly — and the clustering strengthened: I rose 0.568 → 0.632
10. The Moran scatter plot turns I into a picture: its slope *is* Moran's I
11. Global I says clustering exists — LISA says *where* it lives
12. Four cluster types — two hot/cold cores and two rare outliers
13. LISA pins the clusters: 30 HH in the Southern Cone, 37 LL in the Amazon–Guyana band
14. The cold spot is spreading: the LL cluster grew 29 → 37 while HH held steady
15. 87% of hot spots persist; the growth is all at the cold end
16. Regions move within the scatter even without crossing significance — track the vectors
17. Two countries, opposite engines: Venezuela collapses uniformly, Bolivia climbs steadily
18. Venezuela's 24 regions fell almost uniformly — 88% crossed into a worse quadrant
19. A country that climbs alone stays trapped: Bolivia gained +0.033 yet never left LL
20. Does positive Moran's I make this a causal claim? No — it is description, not identification
21. What ESDA bought us: a deepening divide invisible to aspatial summary statistics
22. Let the map speak: a flat average can hide a deepening, spatially contagious divide.

**Verdict:** coherent abstract. Titles 7→9→11→13→14 carry the argument's spine; only slide 3 ("Where we're going") is a label-style roadmap, which is acceptable in a teaching deck.

---

## Positive highlights

- Slide 9's title "Both years cluster strongly — and the clustering strengthened: I rose 0.568 → 0.632" is a perfect assertion title: claim + the two numbers that prove it.
- Slide 20 is a textbook Devil's-Advocate beat — it pre-empts the causal over-read of Moran's I and correctly frames the result as descriptive, pointing forward to spatial regression.
- The closing divider (slide 22) is a single declarative sentence ("Let the map speak: a flat average can hide a deepening, spatially contagious divide."), exactly as the design contract requires — not "Questions?".
- Branding is byte-identical to the canonical templates; the title key-result strip carries all three brand stats.

---

## Priority action items

1. **[HIGH — applied]** slide 211 notes: replace "the lone HL" with "the most prominent of the 5 HL outliers … and Potosí (BOL) is the lone LH" to match index.md:927.
2. **[LOW]** slide 297: optionally move the rebuttal's third sentence to `::: {.notes}` for a two-line on-slide rebuttal.

---

## Screenshots (HIGH-severity visual issues only)

None — no overflow clipped content at 1280×720 (all slides scrollHeight == clientHeight ≤ 720). The slide-audit.cjs OVERFLOW/density flags on slides 17–23 are the known cumulative artifact (speaker-notes + fragment-walk DOM); a per-current-slide re-check at 1280×720 found 0 real overflows.

---

## How to re-review

After applying fixes (via write-slides), re-run:

    /project:review-slides python_esda2

To re-check just the dimension fixed:

    /project:review-slides python_esda2 focus: fidelity

---

## Audit metadata

- Node version: v25.9.0
- Playwright: enabled (Chromium via slide-audit.cjs + a per-slide 1280×720 overflow re-check)
- smoke-test.js: PASS (15 / 15)
- Branding diff: clean (site-brand.scss and title-slide.html byte-identical to templates)
- Tooling notes: slide-audit.cjs word/bullet/overflow counts are cumulative across vertical sub-slides + hidden speaker-notes; only raw-LaTeX (0) and a per-current-slide overflow re-check (0) were treated as load-bearing.

---

*Generated by `/project:review-slides`. Skill at `.claude/skills/review-slides/`.
Read-only report; the one applied fix this run was made to `slides.qmd` + a re-render of `index.html`, per the audit-and-fix task.*
