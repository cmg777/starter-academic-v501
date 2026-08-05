# Script Review: `python_bridge_impact`

**Script:** `analysis.py` (1,569 lines)
**Language:** Python 3.13
**Executed:** 2026-08-05 16:45 JST (fresh run from a clean scratchpad copy, CSV data path)
**Status:** All code runs

## Verdict: ACCEPT

The script runs clean, is fully deterministic, and reproduces 122 of 122 published coefficients.
The only defects found are one unused import and a thin estimand-comment layer — neither affects a
number.

## Execution Results

- Exit code: **0**
- Execution time: **38 s** (CSV path); ~95 s when rebuilding from the `.dta` sources
- Figures generated: **21** PNG files, all referenced by `index.md`
- CSVs written: **21** plus `python_bridge_impact_summary.json`
- Warnings: **none** surfaced (`warnings.filterwarnings("ignore")` at line 48 — see issue 3)
- Reproduction audit: `122 of 122 coefficients reproduce to the printed precision (100.0%)`,
  `113 of 122 reproduce both the coefficient and the standard error (92.6%)`
- **Determinism verified:** two independent runs produced byte-identical logs and an identical
  `summary.json`.

## Issues Found

| # | Dimension | Severity | Location | Issue | Suggested fix |
|---|-----------|----------|----------|-------|---------------|
| 1 | 3 Code quality | MEDIUM | line 35 | `import scipy.linalg as sla` is never used — zero `sla.` references in 1,569 lines | Delete the import |
| 2 | 8 Causal inference | MEDIUM | throughout | The estimand is named in only two places (the `build_weights` docstring at 386, one print at 772). The checklist asks for it per estimation method | Add a one-line `# Estimand: ATT` comment at the head of Sections 6, 7, 8 and 9 |
| 3 | 1 Execution | LOW | line 48 | `warnings.filterwarnings("ignore")` is a blanket suppression. It hides the benign `post`-collinearity and `aweight` messages, but would also hide a new one | Narrow to `warnings.filterwarnings("ignore", message=".*collinear.*")` plus the aweight message, or leave the blanket filter and keep the comment that names what it silences |
| 4 | 4 Reproducibility | LOW | `load_or_build`, lines 425–446 | On a machine where `referenceMaterials/` exists the function silently **rebuilds and overwrites** `data/*.csv` from the `.dta` sources. The two paths differ in the ~7th decimal, so `execution_log.txt` (produced by the `.dta` path) and a reader's run (CSV path) disagree in the last digits of any 17-significant-figure print | Harmless at every reported precision. If you want them identical, add `--rebuild` as an opt-in flag instead of auto-detecting the directory |
| 5 | 5 Figures | LOW | `savefig`, line 269 | Uses `pad_inches=0.1`; the dark-theme checklist specifies `pad_inches=0` and an explicit `fig.patch.set_linewidth(0)` | Cosmetic only — all 21 figures were inspected and none shows a light border. Leave as is unless a border appears |
| 6 | 2 Structure | LOW | post directory | `plan.md` (a `write-script` deliverable) is absent | Optional; `README.md` already carries the inventory |

## Dimension scores

| # | Dimension | Score | Note |
|---|-----------|------:|------|
| 1 | Execution | 10 | Exit 0, deterministic, 21/21 figures, no errors |
| 2 | Structure | 9 | Module docstring with title/description/usage/references; config block; 14 banner-delimited sections; no dead code |
| 3 | Code quality | 8 | One unused import; otherwise DRY (20 functions), descriptive names, why-comments |
| 4 | Reproducibility | 9 | `RANDOM_SEED = 42`, `default_rng(RANDOM_SEED)`, verified byte-identical across runs |
| 5 | Figures | 9 | Single `savefig` helper enforces `dpi=300, bbox_inches="tight"`; `<slug>_NN_<name>.png` naming; no `featured.png` |
| 6 | Data handling | 10 | Shapes printed on load; the `ln(0) → NaN` handling is explicit and commented |
| 7 | Statistical correctness | 10 | Verified against 122 published benchmarks; Stata dof correction implemented and documented |
| 8 | Causal inference | 8 | Pre-treatment covariates only; ATT weights correct by construction; estimand under-commented |

## Positive Highlights

- **`stata_fe` reproduces Stata's `xtreg, fe` cluster-robust dof exactly** — `G/(G-1) · (N-1)/(N-K)`
  with `K` excluding absorbed fixed effects. This is the single thing that makes a 122-coefficient
  audit possible, and it is implemented and commented properly.
- **`independent_columns` reimplements Stata's left-to-right collinearity drop.** Most Python
  replications silently use a pseudo-inverse here and get different standard errors.
- **The three known traps are handled at the line where they occur, with a comment saying why:**
  `ln(0) → NaN` in `add_common`, the pre-`dropna` tercile cut at lines 522–528, and the
  `rain_plus_one` / `dist_scale` per-dataset switches.
- **The audit is an assertion, not a claim.** `add_audit` compares every estimate against the
  authors' own `.txt` output and writes a 122-row CSV with match flags, so the "100%" in the post is
  checkable rather than asserted.

## Priority Action Items

1. **[MED]** Delete the unused `import scipy.linalg as sla` (line 35).
2. **[MED]** Add per-section `# Estimand: ATT` comments in Sections 6–9.
3. **[LOW]** Narrow the `filterwarnings` call, or keep it and leave the naming comment.
4. **[LOW]** Consider making the `.dta` rebuild path an explicit flag rather than directory sniffing.
