# Reference Exemplars

> This file is part of the `write-results-report` skill. Read this file
> when you need to internalize the depth, shape, and rhythm of a
> high-quality `results_report.md` before writing one yourself.

Two reports define the quality bar for this skill. They were written by
hand and then used to design the present version of the skill. Both clear
the gates in `SKILL.md` § Step 4. Read both end to end before writing a new
report, then refer back to them by section line range as needed.

## Exemplar A — `content/post/r_did_ring/results_report.md` (332 lines)

**Topic:** Difference-in-differences with geocoded microdata (the ring
approach). Replicates Butts (2023, *Journal of Urban Economics*) on the
Linden & Rockoff (2008) home-sales × sex-offender data.

**Section line ranges:**

| Lines | Section | Notes |
|---:|---|---|
| 1–11 | Header / metadata | Full Butts (2023) citation; paragraph stating the script "ports" the helper functions from the replication archive |
| 14–25 | Execution Summary | Three-layer headline pattern: parametric / ring-choice / nonparametric. Categorized warnings block |
| 27–51 | Data Overview | One inline `table_lr_cells.csv` showing the 2×2 ring × pre/post cell counts; interpretation paragraph quotes the 12 % treated-share number |
| 55–262 | Method Results (10 subsections, 4.1–4.10) | One inline figure embed per subsection; four subsections include a Table — *X* (`table_*.csv`) markdown block alongside the raw output; every subsection ends with a 2–4 sentence interpretation paragraph |
| 263–278 | Figure Inventory | 10-row table; description + key takeaway per PNG |
| 280–300 | Key Findings | 9 numbered bold-title findings; every finding quotes a specific number with provenance |
| 302–320 | Surprises and Caveats | All 7 categories from the surprises checklist walked, each as a bullet |
| 322–332 | Appendix — Reproduction Audit (Butts 2023) | 5-row table with `Rings.tex` line-number citations; verdict at the end |

**Patterns to imitate:**

1. **Three-layer headline.** When the script reports multiple estimators
   (parametric / sensitivity / nonparametric), state the headline as a
   layered structure in the Execution Summary so the reader sees the
   gradient of conclusions, not just one number.
2. **Inline embed + raw output + table + interpretation rhythm.** Every
   method subsection that has both a figure and a structured CSV uses the
   full four-part rhythm. See subsection 4.10 (lines 235–262) for the
   canonical example.
3. **Audit appendix with line citations.** Every audit row carries our
   value with full provenance (coefficient + SE + n), the paper's quote in
   its own words, a precise location (filename + line number), and a
   "Notes" column explaining any gap.
4. **Surprises walked, not skipped.** The Surprises section walks each of
   the 7 categories as a bullet — no open-ended "anything else" prompt.

## Exemplar B — `content/post/r_did2/results_report.md` (455 lines)

**Topic:** Difference-in-differences for regional data (county-level ACA
Medicaid expansion vs adult mortality). Replicates Baker, Callaway,
Cunningham, Goodman-Bacon, and Sant'Anna (2025, "A Practitioner's Guide"
arXiv:2503.13323).

**Section line ranges:**

| Lines | Section | Notes |
|---:|---|---|
| 1–11 | Header / metadata | Full Baker et al. (2025) citation; manuscript-reference paragraph naming `references/manuscript.tex` for downstream lookups |
| 14–21 | Execution Summary | Reproduces the flagship sign reversal numerically (+0.122 / −2.563); categorizes warnings |
| 24–52 | Data Overview | `table_adoption_cohorts.csv` inline as a 5-row table; interpretation quotes the 88 % combined population share that drives the weighting reversal |
| 55–370 | Method Results (8 subsections, 4.1–4.7) | Each method subsection has an inline figure embed; most subsections include 1–2 inline CSV tables alongside the raw output |
| 372–399 | Figure Inventory | 8-row table; `summary.csv` quoted as a separate summary block |
| 401–419 | Key Findings | 8 numbered findings; finding #1 explicitly cites the manuscript line where the flagship +0.1 / −2.6 sign-reversal appears |
| 421–439 | Surprises and Caveats | Walks bootstrap iterations, HonestDiD grid saturation, informational `cat()` lines, pre-trend lead patterns, pedagogical-framing disclaimer, identification assumptions |
| 441–455 | Appendix — Manuscript Reproduction Audit | 9-row table with line citations to `reference/manuscript.tex` (LaTeX-searchable); verdict at the end |

**Patterns to imitate:**

1. **Numerical reproduction of a flagship result.** When the source paper
   has a "headline" number, reproduce it to three decimals if possible and
   say so explicitly in Key Finding #1.
2. **Header points downstream at the source file.** The header paragraph
   names `references/manuscript.tex` (with section labels like
   `tab:two_by_two_ex`) so downstream readers know where to look up the
   paper's numbers without having to re-find the PDF.
3. **Sign-reversal headline as the organizing principle.** When the
   tutorial's pedagogical point is a sign-reversal or sign-flip, organize
   the Execution Summary, Key Finding #1, and the Reproduction Audit
   around that one comparison.
4. **Pedagogical-framing disclaimer.** When the source paper itself
   disclaims definitiveness (Baker et al. 2025 line 134), quote it in the
   Surprises section so the report does not overclaim on the paper's
   behalf.

## When to read which exemplar

- **First report you write in a new pipeline?** Read exemplar A
  (r_did_ring) first — it is the newer one and was written *against* this
  skill's current version. Its rhythm is the cleanest single template.
- **Replicating a manuscript with multiple stages and a flagship result?**
  Read exemplar B (r_did2) for the audit-appendix shape and the
  layered-comparison patterns.
- **Both reports are R-based.** Python and Stata reports should imitate the
  same patterns; the patterns are language-agnostic. If you write the first
  Python or Stata exemplar at this quality bar, add a third entry here.

## What NOT to imitate

- **Length is not a goal.** Exemplar B (455 lines) is longer because the
  underlying tutorial has 8 method subsections, not because longer is
  better. Length follows from the number of method subsections × the
  per-subsection rhythm. A 250-line report can fully clear the gates if
  the script has only 4 method subsections.
- **The exemplars use `−` (Unicode minus) for negative numbers in prose.**
  This is a stylistic choice, not a requirement. ASCII `-` is also fine.
  Be consistent within a report.
- **Verbatim text from these exemplars should not be copied into a new
  report.** The patterns and rhythm transfer; the words do not.
