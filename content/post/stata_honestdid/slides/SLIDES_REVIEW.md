# Review: stata_honestdid Slide Deck

**Audited:** content/post/stata_honestdid/slides/
**Source of truth:** content/post/stata_honestdid/index.md
**Date:** 2026-06-11
**Audit version:** review-slides v1.0
**Focus:** all 10 dimensions
**Browser pass:** enabled

---

## Verdict: MINOR REVISION

**Overall assessment.** A strong, faithful deck. Every number, table cell, figure, and equation on a slide traces cleanly to the source post — the famously fragile bits (Goldmark `\_`-inside-math and currency `\$`) are correct, MathJax renders all 31 spans, and branding is byte-identical to the canonical templates. The strongest dimension is source fidelity (all values verified). The one weakness is a self-inconsistency on the Act-III headline slide: its bignum-label says the violation must "exceed ~2x" the worst pre-deviation, while the slide's own title and bignum say "1.5-2" and the post says "1.5 to 2 times." Aligning that label to "1.5–2x" promotes the deck to ACCEPT.

**Audited 10 of 10 dimensions.**

---

## Dimension scores

| #  | Dimension                     | Score / 10 | Issues  | Notes                                       |
|----|-------------------------------|-----------:|--------:|---------------------------------------------|
| 1  | Source fidelity               | 9          | 0H/1M/0L| all ~30 numbers + 6 figures trace to post; one label over-narrows the range |
| 2  | Conceptual correctness        | 10         | 0       | ATT stated; observational framing kept; C-LF/FLCI correct |
| 3  | Technical & render correctness| 10         | 0       | smoke-test PASS (15/15); MathJax renders; no `\_` bug |
| 4  | Title↔body consistency        | 8          | 0H/1M/0L| titles form a coherent abstract; one label contradicts its own title |
| 5  | Readability & simplicity      | 9          | 0H/0M/2L| no real overflow at 1280×720; Act-I two-sentence fragment slides are intentional |
| 6  | Typos & grammar               | 9          | 0H/0M/1L| clean; minor singular-verb / terminology drift |
| 7  | write-slides design adherence | 10         | 0       | 3-act arc, assertion titles, Devil's-Advocate, declarative closer |
| 8  | Branding integrity            | 10         | 0       | scss + title-slide byte-identical to templates |
| 9  | Accessibility & legibility    | 10         | 0       | every figure captioned; no slide overflows; math has plain-language gloss |
| 10 | Deliverable completeness      | 10         | 0       | qmd + index.html (52 KB) + slides_files/; link `url: slides/index.html` |

---

## Issues found

| #  | Dim | Severity | Location                                   | Issue                                                                                          | Suggested fix                                                              |
|---:|----:|----------|--------------------------------------------|------------------------------------------------------------------------------------------------|---------------------------------------------------------------------------|
| 1  | 1/4 | MED      | slide 17 — "The Medicaid effect survives…" (slides.qmd:211) | bignum-label says violation "must exceed ~2x" the worst pre-deviation; the title + bignum say "1.5-2" and the post (index.md:962) says "1.5 to 2 times." The label over-narrows the verified range to its upper end. | Change "exceed ~2x" → "be 1.5–2x" so the label matches the title, bignum, and post. |
| 2  | 6   | LOW      | slide 12 — "Relative magnitudes bounds…" (slides.qmd:144) | "Relative magnitudes bounds…" reads as a plural subject with a singular verb. The deck elsewhere treats it as singular ("Relative magnitudes **is** a speed limit", slides.qmd:195). | Acceptable as the restriction-name singular; optionally "The relative-magnitudes restriction bounds…". Left as a noted LOW. |
| 3  | 5   | LOW      | slides 2, 3, 4 (slides.qmd:50,62,74)        | Each Act-I slide stacks two full prose sentences on-slide (split by `. . .`). Threshold flags >1 body sentence.            | Intentional tension/fragment reveal; both lines stay under the word cap. Noted, not changed. |
| 4  | 5   | LOW      | key-results + titles (slides.qmd:12,14,207,231,247,248) | Numeric ranges use ASCII hyphen ("1.5-2", "0.015-0.02") where the post uses an en-dash ("1.5--2").                          | Cosmetic; hyphen reads as a range. Left unchanged in YAML key-results to avoid title-strip risk. |

Order: HIGH first, then MED, then LOW. Numbered consecutively across all dimensions.

---

## Readability rewrites (Dimension 5)

**Issue #3 — slides 2–4 "Act-I tension slides"**

Before (slide 2, on-slide):
> Medicaid expanded in 2014. Treated states' insurance coverage jumped — but only *if* they would have tracked non-expanders absent the policy. … That counterfactual is never observed. With two periods, parallel trends is **fundamentally untestable**. *So how much should we trust the estimate?*

After:
> (No change.) The two halves are split by a `. . .` fragment advance, so the listener sees one idea at a time. Visible word count is 52, under the 60-word cap. This is the sanctioned "deliberate tension slide" — kept as-is.

Why: the fragment reveal already enforces one-idea-at-a-time; moving either half to notes would gut the Act-I hook. Reported as LOW, not a required fix.

---

## HIGH-issue rewrites

None found.

---

## Source-fidelity ledger (Dimension 1)

| Slide datum                                   | Value on slide            | Source location           | Match |
|-----------------------------------------------|---------------------------|---------------------------|-------|
| 2x2 DiD ATT                                   | +6.18 pp                  | index.md:411,448          | ✓     |
| Treated change 65.45%→78.09%                  | +12.64 pp                 | index.md:411              | ✓     |
| Control change 61.90%→68.36%                  | +6.46 pp                  | index.md:411              | ✓     |
| 2x2 t-stat / p / CI                           | t=7.24, p<0.001, [4.45,7.91] | index.md:448           | ✓     |
| Clusters                                      | 38 states                 | index.md:433              | ✓     |
| 2x2 RM table M=0/1/2                          | [0.026,0.059] / [0.017,0.064] / [0.003,0.076] | index.md:551,553,555 | ✓ |
| Event-study 2014 / 2015                       | +4.23 / +6.87 pp          | index.md:640 (.0423/.0687)| ✓     |
| Pre-trends F-test                             | F=0.86, p=0.518           | index.md:675–676          | ✓     |
| Full-panel RM table M=1/1.5/2                 | [0.013,0.071] / [0.003,0.081] / [−0.007,0.091] | index.md:740–742 | ✓ |
| RM breakdown                                  | M-bar 1.5–2               | index.md:746,949          | ✓     |
| Smoothness notes M=0.01/0.015/0.02            | [0.007,0.065] / lb 0.002 / lb −0.003 | index.md:814–816 | ✓     |
| Smoothness breakdown                          | M 0.015–0.02              | index.md:824,951          | ✓     |
| csdid RM M-bar=1.5 / 2                         | lb 0.004 / lb −0.007      | index.md:927,929          | ✓     |
| 2x2 breakdown ">2: very robust"               | > 2, very robust          | index.md:948              | ✓     |
| Sample: 38 states, 2008–2015, 22 vs 16        | 38 / 2008–2015 / 22 / 16  | index.md:358              | ✓     |
| Figure: 2x2 means                             | ../stata_honestdid_2x2_means.png | index.md:462       | ✓     |
| Figure: 2x2 RM                                | ../stata_honestdid_2x2_rm.png    | index.md:571       | ✓     |
| Figure: event study                           | ../stata_honestdid_event_study.png | index.md:654     | ✓     |
| Figure: RM full                               | ../stata_honestdid_rm_full.png   | index.md:754       | ✓     |
| Figure: SD full                               | ../stata_honestdid_sd_full.png   | index.md:832       | ✓     |
| Figure: csdid                                 | ../stata_honestdid_csdid.png     | index.md:933       | ✓     |

No ✗. The one MED issue (#1) is an interpretive over-narrowing of a correct range, not a wrong number.

---

## Title sequence (assertion-title test)

1. Every difference-in-differences estimate rests on an assumption you cannot test
2. The pre-trends test is a smoke detector that only beeps for large fires
3. Replace "do trends hold?" with "how far can they bend before the result breaks?"
4. The lab: 38 states over 2008-2015, ACA Medicaid expansion
5. The 2x2 DiD is the difference of two changes
6. Treated states gained 6.18 pp more than controls
7. With one photograph of two runners, you cannot see who was accelerating
8. Relative magnitudes bounds the post-violation by the worst pre-violation
9. Three lines turn an event study into a breakdown value
10. Even at twice the worst pre-trend, the 2x2 result stays above zero
11. Five pre-periods let us watch trends before treatment — and run a pre-trends test
12. Smoothness limits how fast the trend can change direction
13. The Medicaid effect survives violations up to 1.5-2x the worst pre-trend
14. The robust CI widens with M-bar and crosses zero between 1.5 and 2
15. Under smoothness, the trend's curvature can shift only 1.5-2 pp before the result breaks
16. Smoothness gives a complementary, tighter view of the same result
17. The staggered-robust estimator reaches the same verdict
18. Does honestdid make the claim causal? No — it disciplines doubt, not identification
19. Report the breakdown value next to every DiD estimate — it is the honest measure of doubt.

**Verdict:** coherent abstract — the titles alone tell the whole talk from tension through resolution.

---

## Positive highlights

- Slide 9's title "Three lines turn an event study into a breakdown value" sets up the code block in seven words and is literally true of the three-line Stata snippet.
- Every figure ships a substantive caption that names the quantity *and* its meaning (e.g. slide 13's "the dashed counterfactual is where treated states sit *under* parallel trends").
- The Devil's-Advocate slide (18) steelmans the objection ("a breakdown value cannot prove parallel trends held") and answers it precisely ("sensitivity is not identification — it quantifies how much identification we need").
- Math is correct throughout: every subscript uses plain `_` (no Goldmark `\_` bug), and all 31 MathJax spans render — verified by both the smoke-test and the headless pass.

---

## Priority action items

1. **[MED]** Fix slide 17's bignum-label (slides.qmd:211): "must exceed ~2x" → "must be 1.5–2x" so it matches its own title, bignum, and the post.
2. **[LOW]** Optionally reword slide 12's title to "The relative-magnitudes restriction bounds…" for subject-verb agreement.
3. **[LOW]** Leave Act-I two-sentence tension slides as deliberate fragment reveals.

---

## How to re-review

After applying fixes (via write-slides), re-run:

    /project:review-slides stata_honestdid

To re-check just the dimension you fixed:

    /project:review-slides stata_honestdid focus: fidelity and consistency

---

## Audit metadata

- Node version: v25.9.0
- Playwright: enabled (system Chrome channel)
- smoke-test.js: PASS (15/15 checks)
- Branding diff: clean (site-brand.scss + title-slide.html byte-identical)
- Tooling notes: slide-audit.cjs cumulative word/overflow counts are vertical-stack + notes artifacts; per-current-slide re-probe at 1280×720 found 0 real overflow and 0 unrendered-LaTeX slides.

---

*Generated by `/project:review-slides`. Skill at `.claude/skills/review-slides/`.
Read-only: this file is the only artifact written; the deck was not modified.*
