# Slides Review: `python_bridge_impact`

**Deck:** `content/post/python_bridge_impact/slides/` (`slides.qmd`, 495 lines → 36 leaf slides)
**Source of truth:** `content/post/python_bridge_impact/index.md` + `results_report.md`
**Reviewed:** 2026-08-05 — all 10 dimensions, browser pass enabled

## Verdict: ACCEPT

Source fidelity, branding, and render correctness are all clean. The only finding is a readability
one: about a dozen on-slide sentences and four titles run past the 15-word guideline. Nothing on the
deck is wrong.

## Scores

| # | Dimension | Score | Note |
|---|-----------|------:|------|
| 1 | Source fidelity | 10 | 19/19 decimal numbers trace to `index.md` or a result CSV; 0 unverifiable |
| 2 | Conceptual correctness | 10 | ATT named as the estimand; the manufacturing/density discriminating test stated correctly; no causal overclaiming |
| 3 | Technical & render correctness | 10 | Smoke test 15/15; math typesets; no raw LaTeX; no leaked `{{…}}` |
| 4 | Title↔body consistency | 9 | Assertion titles throughout; each is supported by its body |
| 5 | Readability & simplicity | 7 | ~13 sentences and 4 titles over 15 words — see below |
| 6 | Typos & grammar | 10 | Zero `--`; consistent British spelling; no doubled words |
| 7 | write-slides design adherence | 10 | 19 `.takeaway` cards; 12 brand dividers; 0 slides over 5 bullets; closing slide is a declarative sentence, not "Questions?" |
| 8 | Branding integrity | 10 | `site-brand.scss` and `title-slide.html` both **byte-identical** to the canonical templates |
| 9 | Accessibility & legibility | 10 | Browser pass: 0 slides overflow the reveal canvas; 11 images, 0 broken |
| 10 | Deliverable completeness | 10 | `slides.qmd` + `index.html` (57 KB) + `slides_files/`; `index.md` links it with the relative `url: slides/index.html` |

## Static smoke test

```
15 of 15 checks passed
```

Including: reveal structure, title key-result strip (3 stats), chalkboard + menu plugins, speaker
notes, ≥1 brand divider (12 found), slide count in range (40 `<section>` tags), **every `../` figure
path resolves (9/9)**, MathJax delimiter sanity, no leaked substitution markers.

## Branding diff

```
site-brand.scss:  IDENTICAL
title-slide.html: IDENTICAL
```

No per-deck theming drift, and no need to invoke the approved `$sep$`/`kr-arrow` exception.

## Browser pass

Driven through all 36 leaf slides at reveal's native canvas size:

| Check | Result |
|---|---|
| Slides overflowing the canvas | **0** |
| Raw LaTeX visible on a slide | **0** |
| Images | 11, **0 broken** |
| Math rendering | correct — verified visually on slide 11 |

**Note on the math, since a naive check misreads it.** `document.querySelectorAll('mjx-container')`
returns 0 and `MathJax.startup.document` is `false`, which looks like a typesetting failure. It is
not. Quarto emits each equation as native **MathML** plus a `<script type="math/tex">` LaTeX
fallback, and Chrome renders the MathML directly. A screenshot of slide 11 confirms
$\widehat{\tau} = (\bar{Y}_{J,post} - \bar{Y}_{J,pre}) - (\bar{Y}_{P,post} - \bar{Y}_{P,pre})$
typesetting correctly, with no duplication and no stray backslashes. The `innerText` of the math
span appears doubled only because it concatenates the MathML rendering with its hidden annotation —
a DOM artifact, not a visual one.

## Source fidelity ledger

Every decimal number on a slide was matched to `index.md` or a result CSV. Spot checks:

| Slide datum | Source |
|---|---|
| +0.0719 / +0.0078 / +0.0641 (the 2×2) | `_did_2x2.csv` |
| −2.5% short run → +5.9% long run | `_table2_short_long_run.csv` |
| −1.2 pp manufacturing, long run | `_table2_short_long_run.csv` |
| +26.5% farthest-band yield | `_table4_heterogeneity.csv` |
| Breakdown value just under M = 1 | `_honest_did.csv` |
| 1.064 (0.710), N = 868, 124 upazilas | `_trimL_forensics.csv` |
| "Twenty-one estimates, zero significant at 5 percent" | `_table3_public_goods.csv` (26 rows − 5 non-estimable) |
| 122 of 122 | `_audit_reproduction.csv` |

The deck does **not** repeat either of the two claims corrected in `index.md` during the post review
(the pre-trend significance contradiction and the "within 0.003 everywhere" overclaim). Its
public-goods sentence is independently correct.

## Issues Found

| # | Dimension | Severity | Location | Issue | Suggested fix |
|---|-----------|----------|----------|-------|---------------|
| 1 | 5 Readability | MEDIUM | slide 12 | 27-word sentence: *"A confounder producing this would have to be absent before June 1998, appear at exactly the right moment, and then grow steadily for fifteen years…"* | Split: "A confounder would have to be absent before June 1998. Then appear at exactly the right moment. Then grow for fifteen years without reversing." |
| 2 | 5 Readability | MEDIUM | slides 1, 19, 20 and 11 | Four titles run 14–15 words. e.g. *"Because trade responds to the level of the barrier, not the percentage change in it"* | Shorten to the assertion's core: "Trade responds to the level of the barrier, not the percentage cut" |
| 3 | 5 Readability | LOW | slides 1, 2, 5, 8 (×2), 10, 17, 19, 20 (×2), 28 (×2), 29 | Twelve further sentences at 16–22 words — marginally over the guideline, each still a single clause | Optional. Most read fine aloud; trim only if you want strict compliance |
| 4 | 9 Accessibility | LOW | figure slides | Figures are captioned in the deck, but the underlying `<img>` elements inherit alt text from the post rather than carrying deck-specific alt | Cosmetic; only matters for a screen-reader user reading the HTML deck standalone |

## Positive Highlights

- **The title strip and the three key-result stats do real work.** The deck opens by naming the
  number that settles the question rather than by naming the topic.
- **The 4-act arc is intact and the acts are load-bearing** — the trap (two theories, one
  prediction) is set up in act 1 and paid off at the discriminating test, so the deck has an actual
  reversal rather than a list of results.
- **19 takeaway cards across 36 slides** means almost every substantive slide ends on a stated
  conclusion, which is exactly the `write-slides` contract.
- **The closing slide is a declarative sentence** — *"A region can lose its factories and still be
  better off. You only find that out if you measure the people too."* — not "Questions?".

## Priority Action Items

1. **[MED]** Split the 27-word confounder sentence on slide 12.
2. **[MED]** Trim the four 14–15-word titles.
3. **[LOW]** Optionally tighten the twelve 16–22-word sentences.
