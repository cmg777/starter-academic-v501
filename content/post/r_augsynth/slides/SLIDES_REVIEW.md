# Slides Review — r_augsynth

**Deck:** `content/post/r_augsynth/slides/` (slides.qmd + index.html + slides_files/)
**Source of truth:** `content/post/r_augsynth/index.md`
**Dimensions audited:** all 10 + browser pass
**Date:** 2026-06-11

---

## Verdict: **ACCEPT** (with one MED readability fix applied)

This is a clean, faithful, on-brand deck. Every on-slide number traces to the
source post; the 3-act Tension→Investigation→Resolution arc is correct;
assertion titles read in sequence as a coherent abstract; the closing slide is a
single declarative sentence (and a true Devil's-Advocate precedes it). Smoke test
15/15, both branding files byte-identical to the canonical templates, 0 raw-LaTeX
slides, no genuine overflow at 1280×720. One MED readability finding (the
Devil's-Advocate rebuttal was a ~50-word multi-clause sentence on-slide) was
fixed by trimming the on-slide text and moving the elaboration to speaker notes.

---

## Dimension scores (1–10)

| # | Dimension | Score | Notes |
|---|-----------|------:|-------|
| 1 | Source fidelity | 10 | Every number/figure/equation/table cell matches `index.md`. |
| 2 | Conceptual correctness | 10 | ATT stated explicitly; SCM/Ridge/covariate framing correct; no overclaiming; identification caveats honest. |
| 3 | Technical & render correctness | 10 | Renders; MathJax `\(…\)` delimiters; `{.r}` code fence; no leaked `{{…}}`; 0 raw-LaTeX. |
| 4 | Title↔body consistency | 10 | Each assertion title proven by its body; titles read as an abstract. |
| 5 | Readability & simplicity | 8 | One MED (rebuttal sentence) fixed; Act-I hook is deliberately prose-y (LOW, kept). |
| 6 | Typos & grammar | 10 | No `--` (only YAML/table delimiters); em-dashes used; consistent terminology. |
| 7 | write-slides design adherence | 10 | Figure-first methods, one idea/slide, MB/MC pacing, Devil's-Advocate, single-sentence close. |
| 8 | Branding integrity | 10 | `site-brand.scss` and `title-slide.html` byte-identical to templates. |
| 9 | Accessibility & legibility | 9 | All 7 figures captioned; math has plain-language companions; no overflow. |
| 10 | Deliverable completeness | 10 | slides.qmd + index.html (51 KB) + slides_files/; `index.md` links `url: slides/index.html`; 7/7 figures resolve. |

---

## Tooling results

- **Smoke test:** `15 of 15 checks passed` (exit 0).
- **`diff site-brand.scss`:** clean (byte-identical).
- **`diff title-slide.html`:** clean (byte-identical).
- **`slide-audit.cjs`:** `raw-latex slides: 0`. The single `OVERFLOW` flag and the
  23 "dense" flags are the documented **cumulative-traversal artifact** (word/bullet
  counts accumulate across vertical sub-slides + hidden notes). A per-slide
  re-measurement at 1280×720 (`Reveal.getCurrentSlide().scrollHeight`) found
  **0 genuinely overflowing slides** — not load-bearing.

---

## Source-fidelity ledger (spot checks — all PASS)

| On-slide datum | Source location | Match |
|---|---|---|
| Title strip −0.040 / 0.011 (⅓) / 7 donors | abstract; §7.4; §6.2 | ✓ |
| Classic SCM −0.029, L2 0.083, 79.5% | §6.2 (−0.0294) | ✓ |
| Donor weights SC 0.30 / WA 0.22 / TX 0.15 / ND 0.13 / WV 0.09 / AK 0.07 / KY 0.05 | §6.2 fig caption | ✓ |
| 42 zeros, 7 donors | §6.2 | ✓ |
| Worst pre-2012 quarter 2005 Q4 −0.043 | §6.3, §7.4 | ✓ |
| λ = 0.079, 1-SE rule | §7.3 | ✓ |
| Ridge −0.040, L2 0.062, 84.7%, bias 0.011 | §7.4 | ✓ |
| 2005 Q4 −0.043 → −0.031 (ridge) | §7.4 | ✓ |
| RMS weight change 0.015 / 0.0147; 21 negative weights | §7.4 | ✓ |
| Covariate −0.061 / −5.9% / L2 0.054 / bias 0.027 | §8, §10 table | ✓ |
| Inference: jk+ [−0.058,−0.021]; conformal p=0.066; perm 5th/50 p=0.10; jk Wald [−0.088,0.007] | §9.1–9.5 | ✓ |
| Strongest 2013–2014 | §6.3, §9.2, §11 | ✓ |

---

## Issues

### HIGH
None found.

### MED

**[1] (Dim 5 — readability) Devil's-Advocate rebuttal is a ~50-word multi-clause sentence on-slide.**
`slide 21 — "Does LASSO-style selection make this causal?"` (`slides.qmd:261`).
A listener cannot absorb a four-clause sentence at a glance; the rules cap a
single on-slide body sentence and ~25 words.

- **Before:** "Correct. The ATT is identified only if a weighted donor blend can stand in for Kansas's untreated path, with no anticipation and no interference. ASCM disciplines *selection*; it cannot strip out the 2012–2013 drought or aerospace shocks. The estimate is the *net* gap — suggestive-to-moderate evidence, not a knock-down result."
- **After:** "Correct. ASCM disciplines *selection*; it cannot manufacture identification. The ATT still needs a credible donor blend, no anticipation, no interference — and the gap mixes the tax cut with the drought and aerospace shocks. *Suggestive-to-moderate evidence, not a knock-down result.*" (elaboration on the identifying assumptions moved to `::: {.notes}`).

*Applied.*

### LOW

**[2] (Dim 5 — readability) Act-I hook carries two full prose sentences on-slide.**
`slide 1 — "There is only one Kansas, and it took the treatment"` (`slides.qmd:52,56`).
This is the deliberate narrative opener (split by a `. . .` fragment reveal), which
the readability rules explicitly permit as the exception. **Kept as-is** — trimming
it would weaken the hook; flagged only for completeness.

---

## Browser pass

- 1280×720, walked all 24 traversal stops via `Reveal.next()`.
- Math renders (0 raw `\command` spans).
- 0 slides overflow the 1280×720 box on per-slide measurement.

---

## Follow-ups (not auto-run)

1. Re-review: `/project:review-slides r_augsynth focus: readability`.
2. Preview: `cd content/post/r_augsynth/slides && hugo server` → open `/post/r_augsynth/slides/`.
