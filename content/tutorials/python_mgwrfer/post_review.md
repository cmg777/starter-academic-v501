# Post Review: python_mgwrfer

**Post:** `index.md` (paper-faithful version, ~990 lines)
**Reviewed:** 2026-05-11
**Status:** Hugo renders cleanly; all 8 figures load; math and Mermaid OK

## Verdict: MINOR REVISION

The post structure is sound across all 12 review dimensions. Three accuracy issues (stale `α̂` numbers carried over from the pre-MGWR_cs-fix rerun) and a handful of low-severity polish items are flagged. No structural rewrites needed.

## Issues Found

| # | Dimension | Severity | Location | Issue | Suggested fix |
|---|-----------|----------|----------|-------|---------------|
| 1 | Interpretations / Accuracy | HIGH | line 673 (output block in Section 9) | `alpha_hat recovery: RMSE=0.5721, Corr=1.000` — both numbers are stale. Execution log reports `RMSE=0.5398, Corr=0.9996`. | Replace `0.5721 → 0.5398`, `1.000 → 0.9996`. |
| 2 | Interpretations / Accuracy | HIGH | line 755 (Model comparison table) | Cell `**0.5721**` for MGWFER RMSE(α_i) does not match `execution_log.txt` (0.5398). | Replace `0.5721 → 0.5398`. |
| 3 | Interpretations / Accuracy | MEDIUM | line 676 | Prose says "Pearson correlation of 1.000 (rounded; raw value 0.99989)". The raw value is **0.9996**, not 0.99989. | Replace `0.99989 → 0.9996`. |
| 4 | Writing clarity | LOW | lines 50, 261, 706, 904 | Multiple instances of "Pearson correlation **1.000**" or "correlation **1.000**" for `α̂`. The actual value is 0.9996 — rounding to 1.000 at 3 sig figs is fine in casual prose, but the headline assertion "essentially perfect" is stronger if quoted as "≈1.000 (0.9996)". | Soften to "≈1.000" or "0.9996 (≈1.000)" in 4 spots. |
| 5 | Front matter and links | LOW | line 18-26 | The `links:` block has Python script and MD version, but lacks a DOI link to Li & Fotheringham (2026) for one-click access to the source paper. | Add a third link entry pointing to https://doi.org/10.1080/24694452.2026.2654481. |
| 6 | Academic rigor | LOW | Section 9 / Section 13 | The post does not explain WHY PMGWR's α̂ range comes out negative ([−11, 10]) and MGWR_cs's positive ([2, 22]) — the answer is the back-transform convention (PMGWR uses partial back-transform sigma_y · intercept_std; MGWR_cs adds the full mean shift). Without this, readers may think the negative values are a bug. | Add one sentence in Section 9 explaining the convention. |
| 7 | Markdown structure | LOW | Section 3.1 onward | The concept-cards use inline `<details>/<summary>` HTML, which Hugo's `unsafe: true` allows. markdownlint flags them. This is intentional per project conventions but worth a one-line note at the top of the section. | Optional; leave as-is. |
| 8 | Mathematical equations | LOW | Section 3, Wooldridge derivation | Display equations use `\beta\_0`, `\beta\_1` etc. with `\_` escaping for subscripts, which is correct per project memory. KaTeX renders them. | None. |

## Positive Highlights

- **Six-estimator narrative is clean**: the post walks from global baselines (Section 6, Table 2 replication) through naive local (Sections 7 and 15) to MGWFER's Stage 1 (Section 8) and Stage 2 (Section 9), then re-summarises in Section 15.
- **Paper Figures 5 and 9 are explicitly identified and replicated** with side-by-side discussion linking estimated vs true surfaces.
- **Three-fold typology** (intrinsic / behavioural / indirect) is introduced front-loaded in Section 2 and reinforced throughout.
- **DAG framing** (Section 3, two Mermaid subgraphs) makes the bias mechanism visual; Wooldridge derivation (`β̂_k = β_k + δ_k`) makes it formal.
- **Concept cards (Section 3.1)** define all 8 key terms with example + analogy, including the new "Indirect contextual effects" card.
- **Sandwich pattern** holds throughout: explanation → code → output block → interpretation paragraph.
- **Beginner accessibility** is high: every Greek letter is glossed, every paper equation cited by number, every figure has alt text.
- **Section numbering is now continuous** (1-19, no gaps).
- **All 8 figures (`mgwrfer_*.png`) are referenced and exist** on disk; URL-stable filenames preserved.

## Priority Action Items

1. **[HIGH] Fix stale MGWFER alpha_hat numbers** in two places: code-output block (line 673) and model comparison table (line 755). `0.5721 → 0.5398`.
2. **[HIGH] Fix stale raw correlation** on line 676: `0.99989 → 0.9996`.
3. **[LOW] Soften 4 instances of "Pearson correlation 1.000"** to "≈1.000 (0.9996)" or similar.
4. **[LOW] Add DOI link** for Li & Fotheringham (2026) to the front-matter `links:` block.
5. **[LOW] Add a one-sentence explainer** of the PMGWR/MGWR_cs intercept back-transform convention in Section 9.
