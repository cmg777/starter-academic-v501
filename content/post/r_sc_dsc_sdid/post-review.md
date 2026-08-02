# Post Review: From DiD to SDID — A Ladder of Synthetic Control Estimators

**Post:** `content/post/r_sc_dsc_sdid/index.md` (1,255 lines, ~13,400 words)
**Reviewed:** 2026-08-02 · all 13 dimensions
**Companions cross-checked:** `analysis.R`, `cheatsheet.R`, `tutorial.qmd`, 18 PNGs, 18 CSVs

## Overall Assessment

A comprehensive, structurally sound tutorial that reproduces its source paper exactly and is honest
about where it departs from it. The review found one class of defect that mattered — **output blocks
showing numbers that the accompanying code did not produce** — concentrated in the two places where
the post's own "hand-code it, then call the package" premise had quietly lapsed. Those are fixed.
Everything else was minor.

## Verdict: MINOR REVISION — all findings applied except one

**Scores:** Structure 9/10 | Code 9/10 | Equations 10/10 | Explanations 9/10 | Interpretations 10/10 | Writing 9/10 | Rigor 9/10

## Dimension results

| # | Dimension | Result |
|---|---|---|
| 1 | Code execution | **3 issues** — stale output block, code/output mismatch, missing function |
| 2 | Front matter and links | **1 issue** — no featured image (see below) |
| 3 | Markdown structure | PASS — 64 fences all paired and tagged, 16 `<details>` correctly closed, no heading jumps |
| 4 | Code quality | **1 issue** — package list incomplete |
| 5 | Sandwich pattern | PASS — every `r` + `text` pair has a preceding explanation and a following interpretation |
| 6 | Beginner accessibility | PASS — 8 concept cards, jargon defined on first use, the two traps named explicitly |
| 7 | Mathematical equations | PASS — 30 display equations, zero fragile constructs, every one has an "In words" gloss and a symbol→variable mapping |
| 8 | Interpretations | PASS — **30** interpretation paragraphs against a minimum of 8 |
| 9 | Writing and grammar | **1 issue** — one over-long sentence; no doubled words, no confusables, no spelling errors |
| 10 | Academic rigor | PASS — estimand stated, limitations discussed, 20 numbered references with DOIs |
| 11 | Narrative flow | PASS — the ladder framing gives every section a stated reason to exist |
| 12 | Images, Mermaid, deliverables | PASS with a note — 18/18 figures have alt text averaging 140 characters, 0 orphans, 4 Mermaid diagrams with prose before and after |
| 13 | Abstract | **1 issue** — length |

## Issues found and fixed

| # | Dim | Severity | Location | Issue | Fix |
|---|---|---|---|---|---|
| 1 | 1 | **HIGH** | §10.2 | The code block showed `lambda <- simplex_ls(A_lam, ...)` but the output beneath it printed `\|hand-coded lambda − synthdid lambda\| : 0.000e+00`. That zero came from `simplex_fw`, a different solver. A reader running the printed code would get `2.0e-06`, not zero. The treatment effect was identical (2.758) either way, so no conclusion was wrong — but the post asserted an exact agreement its own code did not deliver. | Show the `simplex_fw` call that actually produced the output, with a comment stating that the exact QP agrees to six decimals and yields an identical effect. Verified by running the printed code: it now returns exactly `0.000e+00`. |
| 2 | 1 | **HIGH** | §8.3 | `simplex_fw` was load-bearing but invisible. §8.3's three-row comparison and the whole of §8.4 — the post's most original argument, that the published estimate is where the optimiser stopped — rested on a hand-coded Frank–Wolfe that appeared nowhere in the post. On a tutorial whose premise is *hand-code it, then call the package*, this was the one place the premise was not honoured. | Added the ~25-line `fw_step` / `simplex_fw` port as its own code block, with a sentence pointing at the `while` condition that exits on *either* convergence *or* the iteration cap — which is the hinge of §8.4. |
| 3 | 1 | MEDIUM | §8.3 | The output block was stale against the current run: `nonzero 14` (actually 13), `SSR 2.751660e-03` (actually `2.751662e-03`), `\|QP − package\| 1.556e-02` (actually `1.564e-02`). | Replaced with the current values and re-verified by executing the post's own code standalone. |
| 4 | 1, 4 | MEDIUM | §13 | ASCM was the only stage shown package-only, with no hand-coded counterpart — the second lapse of the post's premise. Underneath, `analysis.R` was computing its hand-coded version with an arbitrary ridge of `0.01`, which produced 3.06 against the package's 3.04. | Added the closed-form `ascm_hand()` to the post, and the honest framing: the ridge parameter is *not* ours to invent, so read `ascm$lambda` back out of the fitted package object. With augsynth's own CV choice (0.13858) the two agree to **3.9e-06**. The arbitrary constant had been hiding an exact match. |
| 5 | 4 | MEDIUM | §3 | The `library()` block omitted `patchwork`, `scales` and `jsonlite`, all of which `analysis.R` requires — a reader copying the setup block would hit a missing-package error later. It also loaded `dplyr`, which nothing uses. | Package list corrected in both the post and `analysis.R`. |
| 6 | 13 | MEDIUM | Abstract | 273 words against the 150–250 target. | Trimmed to **250** without dropping any of the six beats or any number. |
| 7 | 9 | LOW | §1 Overview | A 60-word sentence carrying a three-part parallel construction, in the section where a beginner is still orienting. | Split into four sentences. |

## Issue NOT fixed, and why

| Dim | Severity | Issue |
|---|---|---|
| 2 | MEDIUM | **No `featured.webp` in the page bundle.** Dimension 2 requires one. It is deliberately not auto-generated: the site's own conventions state that the featured image is user-supplied and that the script must never produce one (`write-script`, Dimension 5: "No `featured.png` generated by the script"). Manufacturing one here would break a documented house rule to satisfy a checklist. It remains an open item for the author, already recorded in the log entry. |

## Verification after fixes

The post's own code was extracted and executed standalone. Every number in every output block is
reproduced by the code printed immediately above it:

```text
  POST-CODE exact QP     : SSR 2.686818e-03 nonzero  9 loss 3.039
  POST-CODE hand-coded FW: SSR 2.751662e-03 nonzero 13 loss 3.056
  |FW - package| = 0.000e+00     |QP - package| = 1.564e-02
  POST-CODE lambda vs synthdid: 0.000e+00
```

Abstract 250 words; 30 interpretations; 30 equations with zero fragile constructs; 18/18 figures
referenced with alt text and zero orphans.

## Positive highlights

- **Thirty interpretation paragraphs** against a minimum of eight, every one quoting specific
  numbers and saying what they mean rather than restating the output.
- **The traps are taught, not hidden.** Three places where a reader would predictably go wrong —
  the two conflicting definitions of $T\_0$, the two different meanings of "demeaned" between stages
  3 and 4, and the fact that SDID reuses DSC's unit weights — each get an explicit callout instead
  of being left as a silent hazard.
- **The post corrects its own source.** §15.3 shows that the paper's ranking of the three SDID
  variants is an artefact of grading two of them at a four-quarter horizon and the rest at one
  quarter, and reports the matched-horizon comparison. That is a genuine contribution, and it is
  presented without overclaiming.
- **Every abstract number is traceable.** All ten figures cited in the Abstract appear again in the
  body, backed by an output block.
- **Equation discipline.** Thirty display equations, each with an "In words" sentence and a
  symbol→code-variable mapping, and the paper's `\underbrace` bias decomposition deliberately
  rewritten as four separate displays because that construct breaks on the deployed renderer.

## Priority action items

All applied except the featured image.

1. **[HIGH]** §10.2 code/output mismatch — fixed.
2. **[HIGH]** `simplex_fw` shown — fixed.
3. **[MED]** §8.3 stale output — refreshed.
4. **[MED]** ASCM hand-coded version added, ridge taken from CV — fixed.
5. **[MED]** Package list — fixed.
6. **[MED]** Abstract length — fixed.
7. **[LOW]** Long sentence — split.
8. **[MED, open]** `featured.webp` — author to supply.

## Note on an optional convention

Dimension 12 asks for italic captions under figures (`![alt](f.png)` followed by `*Caption*`). This
post uses alt text plus a bold `**Interpretation.**` paragraph instead, which is the majority
pattern on this site (21 of 23 R posts). Not treated as a defect.
