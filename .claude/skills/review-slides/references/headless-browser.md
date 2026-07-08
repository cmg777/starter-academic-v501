# Headless Browser Pass

Static parsing of `index.html` cannot see what *renders*. Three failures only a
real browser catches:

1. **Math not typeset** — a broken engine leaves `\hat\alpha` as raw text; the
   static smoke test (delimiter-only) passes it.
2. **Overflow** — content that extends past the slide box and clips on a
   projector; the source HTML looks fine.
3. **Over-density** — how many words/bullets actually land on a rendered slide.

The browser pass drives Chromium across every slide and measures all three.

---

## The script

`references/templates/slide-audit.cjs` — a vendored extension of `write-slides`'s
`math-check.cjs`. Same Playwright auto-locator; it visits each slide once via
`Reveal.slide(h, v)` (covers vertical sub-slides under `#` dividers) and measures
the **innermost** current slide (`Reveal.getCurrentSlide()`), plus overflow and word/bullet
measurement.

```bash
node .claude/skills/review-slides/references/templates/slide-audit.cjs \
  "$PWD/content/post/<slug>/slides/index.html"
```

It prints one line per slide:

```
slide  6 [!] WORDS:74 BULLETS:7  words=74 bullets=7  "Identification strategy"
slide  9 [!] OVERFLOW  words=41 bullets=3  "Effect is 0.12"
slide 11 [!] RAW-LATEX:\hat,\beta  words=22 bullets=0  "The estimator"
...
slides traversed: 21
raw-latex slides: 1   overflow slides: 1   dense slides: 1   (caps: 60 words / 5 bullets)
[✗] HIGH visual issue: 1 slide(s) show raw LaTeX; 1 slide(s) overflow the box
```

---

## Thresholds (kept in sync with `readability-rules.md`)

| Signal       | Cap / rule                              | Folds into        | Severity |
|--------------|-----------------------------------------|-------------------|----------|
| Raw LaTeX    | any `\command` / `\(` visible           | Dim 3             | HIGH     |
| Overflow     | slide `scrollHeight`/`scrollWidth` past the configured frame by > 8 px | Dim 9 | HIGH |
| Words/slide  | > 60 visible words                      | Dim 5, Dim 9      | MED      |
| Bullets/slide| > 5 `<li>`                              | Dim 5, Dim 7      | MED      |
| Background   | canvas ≠ brand `#0f1729` (`rgb(15,23,41)`) | Dim 8          | MED      |
| Accent rule  | no `#title-slide .title::after` rule    | Dim 8             | MED      |
| Byline       | author font-size ≤ institute/date       | Dim 8             | MED      |
| Pipeline     | `kr-arrow` present on a **numeric** strip | Dim 8           | MED      |
| Takeaway     | deck-wide `.takeaway` card count (0 on a content-heavy deck is a note) | Dim 7 | LOW/MED |

The first four are the one-time **design/branding** pass on the title slide (plus the deck-wide
takeaway count); they surface in the `design/branding (title slide):` summary block. Like density,
they are reported findings the skill weighs — they do **not** change the exit code.

The script's exit code reflects **HIGH visual issues only**:

- `0` — math renders everywhere, no overflow (density may still be flagged as MED
  in the per-slide lines).
- `1` — raw LaTeX and/or clipping overflow on some slide (a Dim 3 / Dim 9 HIGH).
- `2` — usage or browser-launch error.
- `3` — Playwright not installed.

Density over the caps is reported in the per-slide lines but does **not** set exit
1 — it is a MED the skill weighs, not a hard browser failure.

---

## Mapping output to dimensions

- **`RAW-LATEX` on any slide** → Dimension 3 HIGH (math not rendering; floor ≤ 3).
  Capture a screenshot of the slide (`SLIDES_REVIEW_slide-NN.png`).
- **`OVERFLOW` on any slide** → Dimension 9 HIGH (content clipped). Screenshot it.
- **`WORDS:>60` / `BULLETS:>5`** → Dimension 5 MED (too dense to read at a glance)
  and a Dimension 9 legibility note. Pair each with a readability rewrite that
  trims or splits the slide.
- **Clean run** → Dimensions 3 (render) and 9 (overflow) get full marks from the
  browser side; density count of 0 supports a high Dimension 5 score.
- **`design/branding` block** → Dimension 8 (branding). `background MISMATCH`,
  `accent-rule MISSING`, `byline FLAT`, or `ARROWS-ON-NUMERIC` are MED Dim-8 findings
  (a deck rendered from a stale/off theme, or arrows misused on a numeric strip). All-ok
  supports a high Dim 8. `takeaway-cards N` → Dimension 7: `N = 0` on a deck with several
  substantive content slides is a "promote concluding lines to `.takeaway`" note (design-adherence).

---

## Screenshots

Capture a PNG **only** for a HIGH visual finding (raw LaTeX or clipping overflow),
saved into the deck folder as `SLIDES_REVIEW_slide-NN.png`. Reference it in the
report's "Screenshots" section. Do not screenshot merely-dense slides.

To grab one, navigate the deck to slide N and screenshot (the skill can run a
short inline Playwright call, or extend `slide-audit.cjs`). Never alter the deck.

---

## Fallback when Playwright/Chrome is unavailable

If `slide-audit.cjs` exits 3 (Playwright missing) or 2 (no browser):

- Mark Dimensions 3 (math-render) and 9 (overflow/density) browser checks `[~]
  not audited`; exclude them from the verdict (their static parts still run).
- Do **not** install anything silently. Surface the one-liner to the user:
  `npx playwright install chromium`.
- Note the fallback in the report's Audit metadata block.

This mirrors `write-slides`'s Layer C behavior: a missing browser degrades the
review, it does not fail it.

---

## Why reuse, not re-author

The deck is the *same* artifact `write-slides` already verifies with
`math-check.cjs`. Reusing its Playwright loader and traversal keeps the two skills
in lock-step: if `write-slides` changes how a deck renders, the shared traversal
logic changes in one place. `slide-audit.cjs` *adds* measurement (overflow,
density) and a one-time design/branding pass (background, accent rule, byline,
pipeline, takeaway count) on top of the proven math-render walk.
