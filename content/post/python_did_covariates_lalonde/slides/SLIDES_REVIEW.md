# Review: python_did_covariates_lalonde Slide Deck

**Audited:** content/post/python_did_covariates_lalonde/slides/
**Source of truth:** content/post/python_did_covariates_lalonde/index.md + results_report.md
**Date:** 2026-08-04
**Audit version:** review-slides v1.0
**Focus:** all
**Browser pass:** skipped (--no-browser)

---

## Verdict: MAJOR REVISION

**Overall assessment.** Factually this is one of the cleanest decks in the collection: every number, figure and claim traces to `results_report.md` or `index.md` with no invented or altered value, the smoke test passes 15/15, and both branding files are byte-identical to the canonical templates. The blocker is not correctness — there are **zero HIGH issues** — it is compliance with the `write-slides` design contract, concentrated entirely in Dimension 7 (score 4, which forces MAJOR by the rubric): the deck closes on a forbidden `# Thank you` divider, carries **zero** `[…]{.takeaway .fragment}` cards across 15 content slides, ships **one** speaker-notes block for the entire deck (so the prose that belongs in notes sits on the slides, which is also what drags Dimension 5 to 6), and uses five label titles where assertions are required. Strongest dimensions: source fidelity (9) and deliverable completeness (9). Fixing the closing slide, adding takeaway cards, and moving the on-slide prose into `::: {.notes}` would lift the deck to ACCEPT range in a single editing pass.

**Audited 10 of 10 dimensions.** Dimensions 3 and 9 ran their static checks only; their browser-only checks (does math actually typeset; 960×700 overflow) are marked `[~]` and excluded.

---

## Dimension scores

| #  | Dimension                     | Score / 10 | Issues  | Notes                                                          |
|----|-------------------------------|-----------:|--------:|----------------------------------------------------------------|
| 1  | Source fidelity               | 9          | 0H/0M/1L | all 34 ledger rows trace to source; no invented number         |
| 2  | Conceptual correctness        | 7          | 0H/1M/1L | ATT + observational framing correct; propensity/trend conflated |
| 3  | Technical & render correctness| 7          | 0H/1M/0L | smoke-test PASS (15/15); math render `[~]`; Unicode `≈` on slides |
| 4  | Title↔body consistency        | 9          | 0H/0M/1L | assertion-title test: coherent spine, degraded by label titles  |
| 5  | Readability & simplicity      | 6          | 0H/2M/3L | 2 wall-of-prose slides, 4 sentences over 20 words              |
| 6  | Typos & grammar               | 9          | 0H/0M/1L | no typos, no `--`, consistent number formatting                |
| 7  | write-slides design adherence | 4          | 0H/4M/3L | closing = "Thank you"; 0 takeaway cards; 1 notes block          |
| 8  | Branding integrity            | 7          | 0H/1M/0L | scss + title-slide diffs clean; off-palette `#00a89e` divider   |
| 9  | Accessibility & legibility    | 7          | 0H/1M/0L | 5/5 figures have empty captions; overflow `[~]`                |
| 10 | Deliverable completeness      | 9          | 0H/0M/1L | link `slides/index.html` ok; all files present; icon name off   |

Skipped dimensions show `—` in the score column with `not audited` in Notes.

---

## Issues found

| #  | Dim | Severity | Location                                                     | Issue                                                                                                                  | Suggested fix                                                                                     |
|---:|----:|----------|--------------------------------------------------------------|------------------------------------------------------------------------------------------------------------------------|---------------------------------------------------------------------------------------------------|
| 1  | 2   | MED      | slide 9 — "…until covariates touch the trend" (slides.qmd:133–147) | IPW (\$1,861) and DR (\$1,993) are listed under a title asserting they work by touching the *trend*, and the closing line says "the instant covariates bend the counterfactual trend, the estimate snaps". index.md:454 is explicit that IPW "specifies how treatment depends on [covariates]" — a different mechanism; results_report.md:52–53 classes both as `propensity`, not `corrected`. | Label the third bullet as a different route (see rewrite) or split propensity estimators onto their own slide |
| 2  | 3   | MED      | slides.qmd:66, 183 (and 88, 90, 91)                           | Unicode math on slides: `≈` in "the experimental ATT ≈ **\$1,794**" and "SE ≈ **\$671**"; Unicode `×` in "2×2 DiD", "treatment × post", "post × treatment" while the same operator is `$\times$` on slides.qmd:110–111, 127, 135 | Convert to `$\approx$` and `$\times$` per slide-mapping.md § "Math symbols → LaTeX"                |
| 3  | 5   | MED      | slide 2 — "The same job-training program, two very different answers" (slides.qmd:45–53) | Wall of prose: five full sentences stacked on one slide, including a 20-word sentence, with only a two-line notes block behind it | See rewrite #3 — one anchor line + question on the slide, the rest into `::: {.notes}`            |
| 4  | 5   | MED      | slide 14 — "How much should we trust \$1,770 over \$1,711?" (slides.qmd:186) | Three stacked prose sentences below an already-full callout; middle sentence is 22 words with a colon and a semicolon | See rewrite #4 — keep the split as two short lines, move the reliability sentence to notes         |
| 5  | 7   | MED      | slides.qmd:204–206 — `# Thank you {.divider background-color="#141413"}` | Closing slide is "Thank you", explicitly forbidden; the deck must end on one declarative sentence stating the thesis. Every sibling deck (`stata_sdid:316`, `stata_sp_regression_panel:331`) closes with a sentence on `#141413` | Replace with the thesis, e.g. `# Covariates rescue a DiD only from the trend — never from the level.` |
| 6  | 7   | MED      | deck-wide (`grep -c 'class="[^"]*takeaway' index.html` → 0)   | Zero `[…]{.takeaway .fragment}` cards across 15 content slides. Slides 8, 9, 11 already end on the right sentence but leave it as plain italic body text | Promote slides.qmd:131, 147, 163 (and the closing line of slides 4, 5, 13) to `[…]{.takeaway .fragment}` |
| 7  | 7   | MED      | slides 3, 10, 11, 15, 16 — "The setup", "The cliff", "The decision rule", "Takeaways", "Resources" | Five label titles where design-adherence.md requires assertions. The post supplies each claim verbatim — e.g. index.md:494 for "The cliff" | "The cliff" → "The estimate is flat at \$3,621 until covariates enter the trend"; "The setup" → "185 trainees, 15,992 survey controls, one known answer"; "Takeaways" → "Placement, not inclusion, is what moves a DiD" |
| 8  | 7   | MED      | deck-wide (only `slides.qmd:55–57` has `::: {.notes}`)        | One speaker-notes block in a 19-slide deck. Law 3 ("the slide serves the spoken word") is inverted: the explanatory prose sits on slides 2, 5, 6, 12, 14 instead of in notes | Add `::: {.notes}` to every content slide and move the interpretation paragraphs from index.md into them |
| 9  | 8   | MED      | slides.qmd:165 — `# The Payoff {.divider background-color="#00a89e"}` | `#00a89e` is off-palette. The brand teal is `#00d4c8`; every other deck in the repo uses `#00d4c8` for the Act III divider (`stata_sdid:249`, `stata_spxtivdfreg:190`, `stata_sp_regression_cross_section:236`) | Change to `background-color="#00d4c8"`                                                             |
| 10 | 9   | MED      | slides.qmd:76, 82, 151, 171, 175 — all five `![](../…png)`     | Every figure ships an empty caption/alt (`figcaption` count in index.html = 0). Slides 10 and 12 are figure-only, so a screen reader gets the title and nothing else | Add the caption from the post, e.g. `![Standardized mean differences: trainees vs each control group](../did_covariates_lalonde_balance.png)` |
| 11 | 1   | LOW      | title key-result strip (slides.qmd:12–13) vs results_report.md:49–53 | Strip caption reads "covariates in the trend" for the range `1,711–1,993`, but the upper end (\$1,993) is the doubly-robust *propensity* estimate, classed `propensity` not `corrected` in the source | Recaption to "trend + propensity estimators" or narrow the range to `1,711–1,770`                  |
| 12 | 2   | LOW      | slide 3 — callout (slides.qmd:71)                              | "Swapping the experimental control for CPS **changes the ATE**" overstates: index.md:116 says it "changes who the comparison represents", not that the ATE itself changes | "Swapping the control group changes who the comparison represents. The treated group stays — so the ATT target is still \$1,794." |
| 13 | 4   | LOW      | slide 2 — "The same job-training program, two very different answers" (slides.qmd:43) | The title promises two answers; the body gives only \$1,794 and a question. The second answer (\$3,621) does not appear until slide 8 | Either surface \$3,621 as the fragment on this slide, or retitle "We know the answer. Can an observational estimator find it?" |
| 14 | 5   | LOW      | slide 6 — "Four regressions, one number" (slides.qmd:97)      | 22-word sentence with a nested relative clause                                                                          | See rewrite #14                                                                                    |
| 15 | 5   | LOW      | slide 3 — "The setup" callout (slides.qmd:71)                 | 22-word compound sentence with two clauses inside a callout                                                             | See rewrite #15 (also fixes issue #12)                                                             |
| 16 | 5   | LOW      | slide 11 — "The decision rule" (slides.qmd:163)               | 21-word sentence ending in a two-item colon list                                                                        | See rewrite #16                                                                                    |
| 17 | 6   | LOW      | slides.qmd:135, 139 vs 143                                     | `✅` marks Spec B and Spec C but not IPW/DR on the next line, although all four recover the benchmark — inconsistent signalling of the same status | Either mark all four or drop the emoji and let the numbers carry the point                          |
| 18 | 7   | LOW      | deck-wide                                                      | No code slide and no display equation in a deck subtitled "The LaLonde test in Python". The thesis is a one-token change in a `pyfixest` formula (`+ {XF}` → `+ {post_ints}`, index.md:354 vs 389) that is never shown | Add one `{.python}` contrast slide showing the two formulas side by side                            |
| 19 | 7   | LOW      | slides.qmd:99 — `# The Spec Ladder` divider                    | Act I runs five content slides (band is 2–4) because the Act II divider lands after the DiD refresher; Act II then holds 5 of 15 content slides (~33%) against the 60–75% band | Move the divider before "Why the naive DiD fails" (slides.qmd:74) so the investigation act carries the evidence slides |
| 20 | 7   | LOW      | slide 7 — "Three ways to add a covariate" (slides.qmd:107–111) | The table's headline row (Trend / `$X \times \text{post}$`) is not highlighted, so the eye has no anchor on the row the whole talk turns on | Tag the cell `[the counterfactual **trend**]{.key}`                                                 |
| 21 | 10  | LOW      | ../index.md:17–20                                              | Deck link uses `icon: chalkboard-teacher`; the documented convention is `icon: person-chalkboard`, `icon_pack: fas`. URL is correct (`slides/index.html`, no trailing-slash bug) | Change the icon name to `person-chalkboard`                                                        |

Order: HIGH first, then MED, then LOW. Number consecutively across all dimensions.

---

## Readability rewrites (Dimension 5)

**Issue #3 — slide 2 "The same job-training program, two very different answers"**

Before:
> A program trained disadvantaged workers. A randomized trial found it raised earnings by about **\$1,794**.
>
> Throw away the randomized control group, swap in a survey of ordinary Americans, and run the usual difference-in-differences with covariates. Do you still recover **\$1,794**?
>
> *Robert LaLonde asked exactly this in 1986 — and launched the credibility revolution when the answer was "no."*

After (on slide):
> A randomized trial says job training raised earnings by **\$1,794**.
>
> . . .
>
> Now throw the control group away. Use a survey instead.
>
> . . .
>
> Do you still find **\$1,794**?

After (into `::: {.notes}`):
> Robert LaLonde asked exactly this in 1986. The answer was no, and that launched the credibility revolution. We swap in a survey of ordinary Americans and run the usual difference-in-differences with covariates.

Why: five stacked sentences (one of 20 words) → three lines of 10, 9 and 5 words; the history moves to the speaker, where it belongs.

---

**Issue #4 — slide 14 "How much should we trust \$1,770 over \$1,711?"**

Before:
> The **\$59** gap between Spec B and Spec C is noise. What is trustworthy is the clean split: trend-ignoring specs are all wrong the same way; trend-modeling specs all move to the truth. Reliability comes from **stability across specifications and across datasets**, not one lucky hit.

After (on slide):
> The **\$59** gap between Spec B and Spec C is noise.
>
> [Trust the split, not the ranking: ignore the trend and you are wrong; model it and you are right.]{.takeaway .fragment}

After (into `::: {.notes}`):
> Reliability comes from stability across specifications and across datasets, not from one lucky hit. That is the point of the rctvsobs.org effort.

Why: 22-word middle sentence with a colon and a semicolon → an 11-word anchor plus a 17-word takeaway card; the meta-point about replication moves to notes.

---

**Issue #14 — slide 6 "Four regressions, one number"**

Before:
> We use the **saturated form** — it is the one that lets us add time-invariant covariates in different places and watch what happens.

After:
> We use the **saturated form**. Only it lets us move covariates around and watch the estimate.

Why: 22 words with a nested relative clause → two sentences of 6 and 11 words; "it is the one that lets us" → "only it lets us".

---

**Issue #15 — slide 3 "The setup" (callout)**

Before:
> Swapping the experimental control for CPS changes the ATE, but the treated group stays — so the **ATT target is unchanged** at \$1,794.

After:
> The treated group never changes. So the **ATT target stays \$1,794**, whatever control group we use.

Why: 22-word compound sentence → two sentences of 5 and 12 words; also removes the imprecise "changes the ATE" (issue #12).

---

**Issue #16 — slide 11 "The decision rule"**

Before:
> Covariates in DiD are **not** a robustness knob — they perform a function: satisfying conditional parallel trends and relaxing constant treatment effects.

After:
> Covariates in DiD are **not** a robustness knob.
>
> [They have a job: make parallel trends hold, once you condition on X.]{.takeaway .fragment}

Why: 21 words with a trailing two-item list → an 8-word statement plus a 13-word takeaway card; "relaxing constant treatment effects" belongs in notes, where the speaker can attach it to Spec C.

---

## HIGH-issue rewrites

None found.

---

## Source-fidelity ledger (Dimension 1)

| Slide datum                                   | Value on slide   | Source location                                     | Match |
|-----------------------------------------------|------------------|-----------------------------------------------------|-------|
| Key-result strip #1                            | 3,621 · "naive DiD · 2× too large" | results_report.md:46, 18; index.md:343–346         | ✓     |
| Key-result strip #2                            | 1,711–1,993 · "covariates in the trend" | results_report.md:49–53 (1,993 classed `propensity`) | ✓*    |
| Key-result strip #3                            | 1,794 · "experimental benchmark (ATT)" | results_report.md:25, 68; estimates.json `benchmark` | ✓     |
| Slide 2 — RCT effect                           | \$1,794          | index.md:84                                          | ✓     |
| Slide 2 — LaLonde's year                       | 1986             | index.md:86 (LaLonde 1986)                           | ✓     |
| Slide 3 — treated units                        | 185 NSW trainees | index.md:259; results_report.md:22                   | ✓     |
| Slide 3 — control units                        | 15,992 CPS       | index.md:259; results_report.md:22                   | ✓     |
| Slide 3 — panel periods                        | pre 1975, post 1978 | index.md:259, 274; results_report.md:22            | ✓     |
| Slide 3 — estimand / design                    | ATT, observational | index.md:80; results_report.md:126                 | ✓     |
| Slide 3 — ground truth                         | ≈ \$1,794        | results_report.md:25                                 | ✓     |
| Slide 3 — callout: ATT target unchanged        | \$1,794          | index.md:116                                         | ✓     |
| Slide 4 — figure                               | ../did_covariates_lalonde_balance.png | index.md:308 (same figure)                | ✓     |
| Slide 4 — SMD on race                          | +2.3 SD          | index.md:310; results_report.md:33                   | ✓     |
| Slide 4 — SMD on prior earnings                | −1.6 SD          | index.md:310; results_report.md:33                   | ✓     |
| Slide 5 — figure                               | ../did_covariates_lalonde_trends.png | index.md:316 (same figure)                 | ✓     |
| Slide 5 — different level and slope            | qualitative      | index.md:318; results_report.md:39                   | ✓     |
| Slide 6 — four regressions give one number     | 4 forms listed   | index.md:326 (same four)                             | ✓     |
| Slide 7 — level / effect / trend taxonomy      | table, 3 rows    | index.md:161; mermaid at index.md:208–233            | ✓     |
| Slide 8 — Spec 0 (no covariates)               | \$3,621          | index.md:343; results_report.md:46; json att 3621.2  | ✓     |
| Slide 8 — Spec A (additive X)                  | \$3,621          | index.md:359; results_report.md:47; json att 3621.2  | ✓     |
| Slide 8 — Spec BT (X × treatment)              | \$3,621          | index.md:378; results_report.md:48; json att 3621.2  | ✓     |
| Slide 9 — Spec B (X × post)                    | \$1,711          | index.md:394; results_report.md:49; json att 1711.1  | ✓     |
| Slide 9 — Spec C (saturated FD = HIT)          | \$1,770          | index.md:412, 429; results_report.md:50; json 1770.0 | ✓     |
| Slide 9 — IPW (Abadie 2005)                    | \$1,861          | index.md:451; results_report.md:52; json att 1861.0  | ✓     |
| Slide 9 — DR (Sant'Anna-Zhao 2020)             | \$1,993          | index.md:468; results_report.md:53; json att 1993.2  | ✓     |
| Slide 10 — figure                              | ../did_covariates_lalonde_ladder.png | index.md:492 (same figure)                 | ✓     |
| Slide 11 — decision-rule diagram               | mermaid, 2 branches | index.md:208–233 (condensed, same logic)          | ✓     |
| Slide 11 — "inert ~3,621" / "corrected ~1,794" | 3,621 / 1,794    | index.md:217, 220, 223                               | ✓     |
| Slide 12 — figure                              | ../did_covariates_lalonde_forest.png | index.md:477 (same figure)                 | ✓     |
| Slide 13 — figure                              | ../did_covariates_lalonde_crosscheck.png | index.md:517 (same figure)             | ✓     |
| Slide 13 — package gap                         | \$14             | index.md:519; results_report.md:94 (1,993 vs 1,979)  | ✓     |
| Slide 14 — CI span                             | \$400 to \$3,100 | index.md:523                                         | ✓     |
| Slide 14 — benchmark SE                        | ≈ \$671          | index.md:523; results_report.md:25, 68; json 670.8   | ✓     |
| Slide 14 — Spec B vs Spec C gap                | \$59             | index.md:523 (1,770 − 1,711)                         | ✓     |
| Slide 15 — takeaway figures                    | 3,621 / 3,621 / 1,711 / 1,770 / 1,794 | index.md:534                        | ✓     |
| Slide 16 — benchmark repository                | rctvsobs.org     | index.md:536                                         | ✓     |

Every ✗ is a HIGH issue listed above. **No ✗ rows** — every datum on every slide traces to the source post, `results_report.md`, or `did_covariates_lalonde_estimates.json`, with matching value, sign and rounding. `✓*` marks issue #11: the value is correct, the strip's caption class-label is loose.

---

## Title sequence (assertion-title test)

Read in order, the slide titles should form the talk's abstract:

1. Covariates in Difference-in-Differences — The LaLonde test in Python (title)
2. *The Puzzle* (divider, Act I)
3. The same job-training program, two very different answers
4. The setup
5. Why the naive DiD fails: covariate imbalance
6. Different groups, different trends
7. Four regressions, one number
8. *The Spec Ladder* (divider, Act II)
9. Three ways to add a covariate
10. The estimate stays inert…
11. …until covariates touch the trend
12. The cliff
13. The decision rule
14. *The Payoff* (divider, Act III)
15. Covariates rescue LaLonde only when they enter the trend
16. Independent check: the diff-diff package
17. How much should we trust \$1,770 over \$1,711?
18. Takeaways
19. Resources
20. *Thank you* (divider, closing)

**Verdict:** coherent spine, degraded by label titles at 4, 12, 13, 18, 19 and a non-thesis closing at 20. The `10 → 11 → 15` sequence ("The estimate stays inert…" / "…until covariates touch the trend" / "Covariates rescue LaLonde only when they enter the trend") is a genuinely strong three-beat abstract; the label titles around it drop the reader out of the argument, and a listener reading titles alone never learns what the talk concluded because the deck ends on "Thank you" (issues #5, #7).

---

## Positive highlights

- **Dollar-perfect fidelity.** All 34 ledger rows — including the three key-result strip numbers, all eight ATT estimates, the \$14 package gap and the \$59 spec gap — match `results_report.md` and `did_covariates_lalonde_estimates.json` exactly. No slide invents, rounds inconsistently, or flips a sign.
- **The auto-animate pair is the best rhetorical device in the deck.** Slides 10–11 (`slides.qmd:117` and `:133`, "The estimate stays inert…" → "…until covariates touch the trend") turn the paper's central finding into a two-slide reveal with matched `data-id` titles, so the audience literally watches the number drop. This is the deck's thesis, staged.
- **Estimand discipline.** Slide 3 (`slides.qmd:65`) names the ATT *and* the design ("observational") explicitly, and the callout at `:71` pre-empts the standard ATE/ATT objection before anyone can raise it — exactly what the causal-post convention asks for.
- **Density is under control everywhere.** No slide exceeds 4 bullets, no slide exceeds 3 fragment advances, and the `{.smaller}` class is applied to precisely the four slides that need it (`:59`, `:86`, `:103`, `:179`, `:188`). The bullet/word thresholds in `readability-rules.md` are met on every slide.
- **The Devil's Advocate is present and honest.** Slide 17 (`slides.qmd:179`) raises the strongest objection — that ranking \$1,770 above \$1,711 is meaningless — and answers it with the CI span and the benchmark's own SE, importing Diamond's critique from index.md:523 rather than burying it.

---

## Priority action items

1. **[MED]** Replace the `# Thank you` closing (`slides.qmd:204`) with one declarative thesis sentence on `#141413`, e.g. `# Covariates rescue a DiD only from the trend — never from the level.` This alone lifts the Dimension 7 ceiling.
2. **[MED]** Add `[…]{.takeaway .fragment}` cards to the substantive content slides. The sentences already exist as plain italics at `slides.qmd:131`, `:147`, `:163` — promote them, then add cards to slides 5, 6, 13 and 17.
3. **[MED]** Move the on-slide prose into `::: {.notes}` on every content slide (currently one notes block deck-wide, `slides.qmd:55`). This resolves both Dimension 5 MEDs (#3, #4) and Dimension 7 issue #8 in one pass; the rewrites above give the exact splits.
4. **[MED]** Convert the five label titles (#7) to assertions and add captions to all five figures (#10); the post supplies both the claims (index.md:310, 318, 494, 519, 534) and the captions.
5. **[MED]** Fix the two one-token brand/notation slips: `#00a89e` → `#00d4c8` at `slides.qmd:165` (#9), and `≈`/`×` → `$\approx$`/`$\times$` at `:66`, `:88`, `:90`, `:91`, `:183` (#2).

---

## How to re-review

After applying fixes (via write-slides), re-run:

    /project:review-slides python_did_covariates_lalonde

To re-check just the dimension you fixed:

    /project:review-slides python_did_covariates_lalonde focus: <fidelity|correctness|readability|consistency|design|branding|accessibility|render>

---

## Audit metadata

- Node version: v25.9.0
- Playwright: disabled (--no-browser)
- smoke-test.js: PASS (15 of 15 checks; 23 `<section>` tags, 3 key-result stats, 5/5 figure paths resolve, MathJax delimiters clean, no leaked `{{…}}`)
- Branding diff: clean (`site-brand.scss` and `title-slide.html` both byte-identical to `.claude/skills/write-slides/references/templates/`; no `$sep$`/`kr-arrow` variation present, correct for a numeric key-result strip)
- Design/branding (browser pass): not run (--no-browser). Static equivalents: `data-background-color` dividers 4; takeaway-cards **0** (`grep -c 'class="[^"]*takeaway' index.html`); `figcaption` count **0**; speaker-notes blocks **1**; off-palette divider hex `#00a89e` at slides.qmd:165
- Tooling notes: index.html is 32,665 bytes (> 30 KB floor); `slides_files/` present; mermaid block at slides.qmd:155 compiled correctly to `<pre class="mermaid mermaid-js">` — legitimate Quarto diagram syntax, not an executable-fence violation

---

*Generated by `/project:review-slides`. Skill at `.claude/skills/review-slides/`.
Read-only: this file is the only artifact written; the deck was not modified.*
