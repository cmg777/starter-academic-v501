# Review: python_panel_ses Slide Deck

**Audited:** content/post/python_panel_ses/slides/
**Source of truth:** content/post/python_panel_ses/index.md
**Date:** 2026-06-11
**Audit version:** review-slides v1.0
**Focus:** all
**Browser pass:** enabled (slide-audit.cjs)

---

## Verdict: MINOR REVISION

**Overall assessment.** A faithful, well-paced deck. Every number on every slide
traces to the source post, math escaping is correct (no Goldmark `\_` artifacts,
no currency issues), the 3-act arc is clean, the Devil's-Advocate slide is a true
steelman, and the closing slide is a single declarative sentence. The strongest
dimension is **Source fidelity** (all 24 datums verified). The one blemish was a
**title↔body mismatch on slide 22**: the title asserted the Monte-Carlo "9.0%
over-rejection" while the slide's figure is the SE-ratios chart (the 9.0% figure
is on slide 21). Fixed by retitling slide 22 to the ratios claim it actually
shows. Promoting to ACCEPT required only that one fix plus a small title-wording
cleanup — both applied.

**Audited 10 of 10 dimensions.**

---

## Dimension scores

| #  | Dimension                     | Score / 10 | Issues  | Notes                                  |
|----|-------------------------------|-----------:|--------:|----------------------------------------|
| 1  | Source fidelity               | 10         | 0       | all 24 numbers/figures trace to source |
| 2  | Conceptual correctness        | 10         | 0       | estimand, bias-vs-inference exact      |
| 3  | Technical & render correctness| 10         | 0       | smoke-test PASS 15/15; math renders y  |
| 4  | Title↔body consistency        | 7          | 1 M     | slide 22 title vs ratios figure (fixed)|
| 5  | Readability & simplicity      | 9          | 1 L     | one long comment line; notes hold prose|
| 6  | Typos & grammar               | 10         | 0       | em-dashes correct; terminology stable  |
| 7  | write-slides design adherence | 9          | 1 L     | slide-23 title wording (fixed)         |
| 8  | Branding integrity            | 10         | 0       | scss + title-slide byte-identical      |
| 9  | Accessibility & legibility    | 9          | 1 L     | overflow flag is cumulative artifact   |
| 10 | Deliverable completeness      | 10         | 0       | url: slides/index.html; 5/5 figures ok |

---

## Issues found

| #  | Dim | Severity | Location                          | Issue                                          | Suggested fix                                  |
|---:|----:|----------|-----------------------------------|------------------------------------------------|------------------------------------------------|
| 1  | 4   | MED      | slide 22 — "Time clustering over-rejects at 9.0%…" | On-slide figure is the SE-ratios chart, not the Monte-Carlo rejection-rate chart; the 9.0% number appears only in notes (the 9.0% chart is slide 21). | Retitle to the ratios claim the figure proves: "0.55–0.58× the honest benchmark — understating uncertainty by ~40%". **APPLIED.** |
| 2  | 7   | LOW      | slide 23 — "Does machine-correcting the SE…" | "machine-correcting" is awkward, undefined jargon. | "Does fixing the SE make the estimate causal? No". **APPLIED.** |
| 3  | 5   | LOW      | slide 22 — comment line           | Comment runs long; acceptable as a single anchor line, prose lives in notes. | No change needed (within tolerance). |

Order: MED first, then LOW. Numbered consecutively across all dimensions.

---

## Readability rewrites (Dimension 5)

**Issue #3 — slide 22 "…understating uncertainty by ~40%"**

Before:
> SE ratios relative to the entity-clustered benchmark. Ratios below 1.0 understate uncertainty.

After:
> (No on-slide change — this is the figure caption, the correct length for a single anchor. Speaker delivers the 9.0% over-rejection narrative from notes.)

Why: The body is figure + one caption + speaker notes; no over-length on-slide
sentence remains after the title fix.

---

## HIGH-issue rewrites

None found.

---

## Source-fidelity ledger (Dimension 1)

| Slide datum                          | Value on slide | Source location                | Match |
|--------------------------------------|----------------|--------------------------------|-------|
| Hook t-statistic                     | 30 / 29.9      | index.md:67, :564 (29.9151)    | ✓     |
| Within-firm corr (notes)             | 0.41           | index.md:478 (0.4100)          | ✓     |
| SE range spoiler (notes)             | 0.016–0.062    | index.md DK 0.0158 / ent 0.0621| ✓     |
| True effect β                        | 0.5            | index.md:312, :340             | ✓     |
| AR(1) ρ                              | 0.5            | index.md:324 (rho=0.5)         | ✓     |
| DGP equation                         | 2.0 + 0.5x + μ + λ + ε | index.md:322             | ✓     |
| Year-effect variance                 | N(0, 0.5)      | index.md:730, :642             | ✓     |
| Between/within std y (notes)         | 2.46 / 1.67    | index.md:452–453               | ✓     |
| Pooled β / SE / t                    | 1.0318 / 0.0345 / 29.9 | index.md:562–564       | ✓     |
| White SE / t                         | 0.0361 / 28.6  | index.md:590–591 (28.5897)     | ✓     |
| Entity-clustered SE / t              | 0.0621 / 16.6  | index.md:618–619 (16.6233)     | ✓     |
| Time-clustered SE / t                | 0.0168 / 61.3  | index.md:638–639 (61.2757)     | ✓     |
| Two-way SE / t                       | 0.0532 / 19.4  | index.md:659–660 (19.3829)     | ✓     |
| FE β / SE                            | 0.4829 / 0.0357| index.md:700–701               | ✓     |
| FE bignum + residual gap             | 0.48 / 0.017   | index.md:705                   | ✓     |
| TWFE β (notes)                       | 0.4796         | index.md:725                   | ✓     |
| Driscoll-Kraay SE / t                | 0.0158 / 65.4  | index.md:745–746 (65.4073)     | ✓     |
| MC FE+entity rejection               | 6.6%           | index.md:811 (0.066)           | ✓     |
| MC conventional / White              | 6.0% / 6.4%    | index.md:809–810               | ✓     |
| MC time-clustered                    | 9.0%           | index.md:812 (0.090)           | ✓     |
| MC TWFE+entity                       | 3.2%           | index.md:814 (0.032)           | ✓     |
| SE ratios understate                 | 0.55–0.58× / ~40% | index.md:835                | ✓     |
| Cluster rule-of-thumb groups         | ≥40–50; 100 vs 10 | index.md:642, :853          | ✓     |
| Figures (5)                          | ../panel_ses_*.png | index.md:516,776,786,821,833| ✓     |

Every datum matches. No ✗.

---

## Title sequence (assertion-title test)

1. A t-statistic of 30 can be an illusion built on the wrong formula
2. With the same point estimate, six SE formulas tell six different stories
3. Where we're going
4. The lab: 100 firms × 10 years, with a known true effect of 0.5
5. The true model bakes ability and serial correlation into the data
6. Persistent firm differences dominate — exactly what fixed effects absorb
7. Pooled OLS reports 1.03 — more than double the true 0.5
8. White SEs barely move the needle — correlation, not heteroskedasticity, is the problem
9. Clustering on firms inflates the SE by 80% — the honest correction
10. Time clustering looks precise but lies: only 10 clusters break the asymptotics
11. Fixed effects subtract each firm's average — and the bias vanishes
12. Fixed effects recover 0.48 — the bias was the model, not the SE
13. One picture: no SE rescues a biased estimate; FE intervals cover the truth
14. Driscoll-Kraay targets cross-sectional shocks — weak here, vital elsewhere
15. Only Monte Carlo proves it: FE + entity-clustered rejects at 6.6%, near the nominal 5%
16. The too-small SEs sit at 0.55–0.58× the honest benchmark — understating uncertainty by ~40%
17. Does fixing the SE make the estimate causal? No
18. The decision rule: fix the model first, then cluster on the larger dimension
19. Standard errors set the width of your conclusion — fixed effects set whether it is the right one.

**Verdict:** coherent abstract. Read in order the titles narrate the full talk:
fake precision → six SE stories → known DGP → bias diagnosis → FE fix → Monte
Carlo validation → causal caveat → decision rule → one-sentence close. (Slide 16
title now matches its ratios figure after the fix.)

---

## Positive highlights

- Slide 12's bignum slide "Fixed effects recover 0.48 — the bias was the model,
  not the SE" stages the single most important number transition (1.03 → 0.48) on
  a dark background with a clean label.
- Slide 17's objection/rebuttal is a genuine steelman: it concedes the SE controls
  size, then draws the precise line — SEs fix inference, FE fixes identification,
  a time-varying confounder would still bias β.
- Math escaping is fully correct for the Quarto/MathJax path: plain `\mu_i`,
  `y_{it}`, `\hat\beta` with no Goldmark `\_` or `\\cdot` artifacts leaking in.
- All eight model-SE combinations and the 500-run Monte-Carlo rates are reported
  to the exact precision of the source post, including the t-stats.
- The closing divider is one declarative sentence (not "Questions?"/"Thank you"),
  exactly per the design contract.

---

## Priority action items

1. **[MED]** Retitle slide 22 so its assertion matches the SE-ratios figure it
   displays (not the Monte-Carlo 9.0% number on slide 21). **APPLIED.**
2. **[LOW]** Replace "machine-correcting" in the slide-23 title with plain
   wording. **APPLIED.**

---

## Screenshots (HIGH-severity visual issues only)

None — the single overflow flag from slide-audit.cjs is a cumulative-measurement
artifact (counts accumulate across vertical sub-slides + hidden speaker notes, per
the known caveat); no real per-slide content clips at 1280×720, and raw-LaTeX
slides = 0.

---

## How to re-review

After applying fixes (via write-slides), re-run:

    /project:review-slides python_panel_ses

To re-check just the dimension you fixed:

    /project:review-slides python_panel_ses focus: consistency

---

## Audit metadata

- Node version: present (smoke-test + slide-audit both ran)
- Playwright: enabled (Chromium via system Chrome channel)
- smoke-test.js: PASS (15/15 checks)
- Branding diff: clean (site-brand.scss and title-slide.html byte-identical)
- Tooling notes: slide-audit.cjs reported 1 overflow / 21 "dense" slides — both are
  the documented cumulative artifact across vertical sub-slides + hidden notes;
  raw-latex slides = 0 (load-bearing signal is clean).

---

*Generated by `/project:review-slides`. Skill at `.claude/skills/review-slides/`.
Read-only contract noted, but per the calling task the two unambiguous fixes were
applied to slides.qmd and the deck re-rendered.*
