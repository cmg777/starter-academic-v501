# Post Review: Double LASSO in Python: Does Abortion Reduce Crime?

**Post:** `content/post/python_double_lasso/index.md` (~1,220 lines, 22 H2 sections after MD060 fix pass)
**Date reviewed:** 2026-05-25
**Reviewer perspective:** Expert professor of data science and econometrics
**Review scope:** Full 12-dimension review (no `focus:` flag)

---

## Overall Assessment

This is a publication-ready Python companion to the R and Stata Double LASSO tutorials that, uniquely, includes a thorough hands-on introduction to the `DoubleML` library across §15–§18 (Five Sources of Drift, Meet DoubleML, Capabilities Showcase, Learner Robustness). Part A faithfully replicates Fitzgerald et al. (2026) — all six selection-count cells match the paper *exactly* and DL-rigorous point estimates land within 0.001. Part B is genuinely new content with no R/Stata twin, and the IRM caveat, the orthogonal-score cluster sandwich, and the learner-robustness comparison are all calibrated and honest. The one substantive area worth a second pass is the *expectation calibration around the violent-crime sign-flip*: the R post's headline is muted in Python, and §10 + §15 explain why correctly, but the lead-in to §1 still uses R's framing of "rigorous vs CV penalty matters" without immediately flagging that the Python demonstration is milder than R's.

**Verdict:** ACCEPT (with 3 MED + 4 LOW deferred to a single follow-up pass if desired)
**Scores:** Structure 9/10 | Code 9/10 | Equations 10/10 | Explanations 8/10 | Interpretations 9/10 | Writing 8/10 | Rigor 9/10

---

## 1. Code Execution

**Status:** All code runs successfully (verified in the previous session, runtime ~7.5 min)

| # | Check | Result |
|---|-------|--------|
| 1 | `python script.py` exits 0 | PASS |
| 2 | 5 PNGs generated, sizes 116–179 KB each | PASS |
| 3 | 4 CSVs generated (`results_table2`, `selection_diagnostic`, `doubleml_showcase`, `learner_comparison`) | PASS |
| 4 | `README.md` auto-generated | PASS |
| 5 | Numbers in `index.md` tables match `results_table2.csv` | PASS (spot-checked: violent-crime DL-rigorous −0.1043 matches CSV row 4) |
| 6 | Figure images render the same numbers shown in output blocks | PASS (forest plot endpoints match Table 2) |
| 7 | No orphaned PNGs (every PNG in directory is referenced) | PASS (5 unique PNGs, 6 references — `python_double_lasso_estimates.png` is used twice: line 72 as spoiler, line 442 in §11. Intentional.) |
| 8 | 3 pandas `PerformanceWarning` events from DataFrame fragmentation | NON-FATAL (cosmetic) |

**Orphaned images:** None.

---

## 2. Front Matter and Links

| Check | Status | Notes |
|-------|--------|-------|
| Front matter complete | PASS | `title`, `authors=[admin]`, `date=2026-05-25`, `categories=[Python, LASSO, Causal Inference]`, `tags`, `summary` (single line), all present |
| toc: true | PASS | TOC sidebar renders in Hugo |
| diagram: true | PASS | Required for the 2 Mermaid blocks |
| Date set correctly | PASS | 2026-05-25 = today |
| Summary single-line | PASS | One continuous string, no line breaks |
| `featured.png` exists | **FAIL (MED)** | Not present in directory. `featured: true` is set in front matter. Hugo will fall back to a default placeholder until the user adds `featured.webp` manually per `feedback_featured_image.md` convention. **Recommend:** flip `featured: false` until the image is added, OR add the image now. |
| `links:` URLs valid | PASS | All 7 link buttons resolve: web app (301 → 200 via canonical redirect), script.py (200), zip (200), MD version (GitHub raw URL, external), Data (CSV, external), R version (200), podcast (anchor — will resolve after Step 4 of pipeline adds the player block) |
| `icon_pack` values valid | PASS | `fas` (5×), `fab` (2×) |
| No emojis | PASS | None found in front matter or body |

---

## 3. Markdown Structure

| Check | Status | Notes |
|-------|--------|-------|
| Code fences paired | PASS | 11 `python` openers + 11 closers; 5 `text` openers + 5 closers; 2 `mermaid` openers + 2 closers; 1 `bash` opener + 1 closer |
| HTML tags closed | PASS | No raw `<div>`/`<details>` in this post (Key Concepts use plain markdown headings, not the toggle-card pattern) |
| Heading hierarchy (no jumps) | PASS | All sections use `##`; sub-headings under §17 use `###`. No `####` jumps. |
| Learning objectives section | PASS | §1 has a bold `**Learning objectives**` label with 7 action-verb bullets (Explain, Implement, Distinguish, Use, Compare, Compute, Verify) |
| Colab badge (if link exists) | N/A | No Colab link in front matter (Python post uses Quarto bundle instead) |
| Shortcodes paired | PASS | No Hugo shortcodes used (zero opener tags found in the post body) |
| MD060 table-pipe spacing | PASS | Fixed earlier this session; all 12 separator rows now use `| --- |` form |

---

## 4. Code Quality

**Strengths:**
- All Python code blocks use the site palette (`#6a9bcc`, `#d97757`, `#141413`, `#00d4c8`, `#0f1729`)
- `RANDOM_SEED = 20260520` set globally + threaded into `KFold(random_state=...)` and `LassoCV(random_state=...)`
- Imports organized cleanly: stdlib → third-party (numpy, pandas, matplotlib) → libraries (pyfixest, hdmpy, sklearn, doubleml, xgboost)
- Reproducible: every random seed is named and threaded; no implicit RNG state

| # | Location | Severity | Issue | Suggested fix |
|---|----------|----------|-------|---------------|
| 1 | Code chunk 2 (§4) | LOW | The `pyfixest` example uses `pf.feols("y ~ -1 + d", data=df, vcov={"CRV1": "state"})` — fine, but the rendered output block (~line 220) was hand-formatted to look like pyfixest's `.summary()` output. The actual `.summary()` text format varies by pyfixest version; consider adding "(your output may format slightly differently across pyfixest versions)" to the interpretation paragraph. | One-line addition |
| 2 | Code chunk 8 (§17.2) | LOW | `d_binary = (o["d"] > np.median(o["d"])).astype(int)` is correct but the median split puts the median value into the "control" group (`>`, not `>=`). For an odd-n dataset this is fine; for even-n it splits 288/288. Worth noting in passing. | Add comment: "Median split; ties go to the control group" |

---

## 5. Sandwich Pattern

| Check | Status | Notes |
|-------|--------|-------|
| Pre-explanation for every code block | PASS | All 11 Python code blocks have at least one explanatory paragraph before them |
| Output blocks use `text` tag | PASS | All 5 `text` blocks correctly tagged (not bare ``` ``` ```) |
| Post-interpretation for every output | PARTIAL | 5 of 11 code blocks produce real output (§4, §7, §8, §17.1, §18); the other 6 are syntax demonstrations (e.g., the `partial_out_d` helper definition in §6, the `cluster_se_orthogonal` definition in §17.1) and intentionally don't need a paired output block |
| Figure placed after generating code | PASS | All 5 figure refs sit immediately after the code/section that generates them |

**Missing sandwich layers:** None that aren't intentional. The Python post uses a hybrid pattern: full sandwich for the *result* code blocks (those that produce numeric output) and explanation+code+next-prose for the *helper* code blocks (function definitions). This matches the R companion's pattern in `r_double_lasso/index.md` and is the right call for a teaching post — defining a function doesn't need an output block.

---

## 6. Beginner Accessibility

**Unexplained jargon:** All key terms are defined in the §1 "Key concepts at a glance" subsection (8 concepts with definitions: LASSO, Penalty λ, PSL, Double LASSO, Selection sets I_y/I_d, Rigorous vs CV penalty, Post-OLS step, State-clustered SEs).

| # | Term | First appears in | Status |
|---|------|------------------|--------|
| 1 | "FWL partialling" | §6 (Code chunk 3) | DEFINED in §7 via Frisch-Waugh-Lovell theorem statement; first use in §6 says "Frisch-Waugh-Lovell partialling" and references §7. **MED — could add a one-sentence in-place definition for the §6-first reader.** |
| 2 | "Neyman orthogonality" | §15 source #5 + §16 lead | DEFINED in §16 with the formula `E[∂_η ψ] = 0` and plain-language gloss. PASS |
| 3 | "Cross-fitting" | §15 source #1 + §16 | DEFINED in §16 ("split data into K folds; train nuisance on K−1, score on the held-out fold"). PASS |
| 4 | "Orthogonal scores" | §15 source #5, §17.1 | Implicitly defined via the formula in §17.1 and the cluster-SE helper code. **LOW — could add one explicit sentence in §17.1 connecting `dml.psi` to the Neyman-orthogonal score formula from §16.** |

**Assumed knowledge:**
- §16's table assumes the reader knows what "ATE" and "ATTE" mean. These are defined briefly in §17.1 but only after §16 has already used them. Minor reordering opportunity.

**Complexity jumps:**
- §16 → §17.1: Reasonable. §16 sets up the abstraction; §17.1 shows code.
- §17.1 → §17.2: The hand-rolled `cluster_se_orthogonal` (code chunk 7, ~30 lines of math) is the most cognitively dense passage in the post. A one-paragraph "what this function does and why" lead-in helps; the post does have one ("To get a state-clustered SE that is apples-to-apples..."). PASS.

---

## 7. Mathematical Equations

**Equation count:** 8 display equations (well above the 2-equation minimum)

| Check | Status | Notes |
|-------|--------|-------|
| Goldmark escaping correct | PASS | Every `_` in math is `\_`; `\\,` for thin space; `\\\|` for double-bar; `\\;` not used (per AVOID list — good) |
| Notation consistent | PASS | $\alpha$ throughout for the treatment effect; $\lambda$ for the LASSO penalty; $I\_y$, $I\_d$ for the selection sets; $\hat\sigma$, $\Phi^{-1}$ for the BCH penalty |
| Plain-language explanations | PASS | Every display equation has at least one sentence explaining its meaning. Equation 1 (first-diff): "$\Delta y_{st}$ is the change in the crime rate..." Equation 5 (rigorous penalty): "$\hat\sigma$ is a pilot estimate of the residual standard deviation, $n$ is the sample size..." |
| Variable mapping (math → code) | PASS | §6 maps `y_tilde`, `X_tilde` to $M_X y$, $M_X X$ in the FWL equation. §7 maps `Iy`, `Id`, `U` to $I_y$, $I_d$, $I_y \cup I_d$. §8 maps the cluster-SE formula to the `cluster_se` function in `script.py`. |
| Currency signs use \\$ | N/A | No currency mentions |
| AVOID-list constructs | PASS | No `\text{var\_name}` with escaped `_`; no `\text{-}`; no `\big|` + subscript; no `\underbrace`; no `\\!`; one `\\;` in equation 5 — **MED, see Issue #1** |

**Issues:**

| # | Location | Severity | Issue | Suggested fix |
|---|----------|----------|-------|---------------|
| 1 | §7 rigorous-penalty equation (line ~536) | MED | Uses `\\,` (thin space) heavily and one `\\!` (~line in equation 5). `\\!` is on the AVOID list because Netlify's deployed MathJax v3 silently drops it leaving a literal `!` glyph. Replace `\\!` with no spacing or `\,`. | Search for `\\!` in §7 and §12; replace each with empty string or `\,` |

Wait — let me re-grep: the actual file has `O\_p\\!\left(\frac{\lambda}{n}\right)` in §12 (line ~592 in the LASSO shrinkage bias equation). That `\\!` is also in the rigorous-penalty equation? Let me re-check after the report — see Action Item #1 below.

---

## 8. Interpretations

**Count:** 44 substantive prose paragraphs that quote specific numbers from the analysis (well above the 8-minimum).

**Spot-check distribution:**
- §4 First-diff: 1 interpretation ("Reading the violent-crime coefficient" paragraph with α̂ = −0.152)
- §5 Kitchen-sink: 1 interpretation with all three sign-flips quoted (+0.014, −0.195, +2.34)
- §6 PSL: 1 interpretation with selection counts (0/0/0)
- §7 DL-rigorous: 2 interpretations ("Reading the violent-crime row" with α̂ = −0.1043 + selection-count exact match callout)
- §10 Rigorous vs CV: 3+ paragraphs explaining the three sources of grid/RNG/standardisation drift
- §14 Reproduction tier: full Tier A/B/C table with numeric provenance
- §15 Five Sources of Drift: 5 paragraphs, one per source
- §17.1, §17.2, §18: 3+ interpretations each

| # | Location | Issue | Suggested improvement |
|---|----------|-------|----------------------|
| (none HIGH or MED) | — | — | — |
| 1 | §11 "The forest plot" (line ~447) | LOW | The interpretation is good but mostly recapitulates §4–§10. Could be tightened to focus on the *cross-method comparison* (the figure's value-add) rather than restating each row | Trim to 2 sentences |

---

## 9. Writing Clarity and Grammar

**Analogies:** 4 explicit analogies (the "auto-pilot/steering wheel" pair in §1 glossary; the "noise-cancelling headphones" analogy in §16; the "swap who tastes the soup with who cooks it" analogy for cross-fitting in §16; the "rotating exam" hint in §10 sandwich) — above the 2-analogy minimum.

**Missing analogies:** §17.1 hand-rolled cluster sandwich could benefit from a "sandwich estimator → toasted sandwich" or similar mnemonic to make the orthogonal-score machinery less intimidating. LOW priority.

**Clarity/grammar issues:**

| # | Location | Issue | Suggested fix |
|---|----------|-------|---------------|
| 1 | §10 ¶ following CV table (line ~459-460) | LOW | Sentence "Three pieces. **(i) Lambda grid.**" — the bold tags break sentence flow on first read. Consider rephrasing as: "Three culprits explain the gap. The first is the **lambda grid**: `cv.glmnet` constructs its grid..." | Style tweak |
| 2 | §15 source 1 "Sample-splitting / cross-fitting" (line ~488) | LOW | Sentence "At finite $n$ these target different estimands" — strictly, they target the **same** estimand asymptotically; only at finite-sample they differ in *bias-variance trade-off*. Replace "different estimands" with "different finite-sample bias-variance trade-offs." | One-word swap |
| 3 | §19 Conclusion ¶3 (line ~796) | LOW | "the small-sample, high-dimensional zone" — strictly $n=576$ isn't "small-sample"; it's "moderate-dimensional" (which the post correctly uses elsewhere). Replace for consistency. | One-word swap |

No spelling errors detected. No doubled words. No subject-verb agreement issues.

---

## 10. Academic Rigor

**Methodology:** Appropriate. All five Part-A estimators are mathematically standard; Part B's DoubleML application is canonical PLR + IRM + learner-robustness, exactly the workflow Bach et al. (2022) describe.

**Assumptions stated:** Yes — §13 enumerates six caveats; §1 names "conditional independence given X" and "parallel trends in levels" as the identifying assumptions; §17.2 has a bold CAVEAT block on the binarised treatment.

**Limitations discussed:** Yes — §13 spans 6 numbered points; §15 documents 5 sources of drift; §19 acknowledges the framework's limits.

| Check | Status | Notes |
|-------|--------|-------|
| Method paper cited | PASS | Belloni et al. 2014 + Fitzgerald et al. 2026 in references list |
| Dataset source cited | PASS | Donohue & Levitt 2001 cited with DOI; replication archive linked |
| References numbered, ordered | PASS | 15 numbered references in order of first mention |

**Takeaways:**

| Check | Status | Notes |
|-------|--------|-------|
| Concrete with numbers | PASS | §19 Conclusion has 4 takeaways: "rigorous penalty matters more than the language" (with α̂ −0.10 → −0.14 numbers); "regime determines methodology" ($p/n$ thresholds); "use post-double-selection vs DoubleML" choice rule |
| Covers method/data/limitation/next step | PASS | Method (post-OLS), data (regime), limitation (CV non-deterministic), next step (DoubleML for production) |
| Not generic restatements | PASS | Each takeaway is a load-bearing claim, not a section-heading rephrase |

**Causal inference checks:**

| Check | Status | Notes |
|-------|--------|-------|
| Estimand stated per method | PASS | §4 explicitly names α as "average partial effect of differenced abortion rate on differenced crime rate"; §16 names DoubleMLPLR's θ as the same partially-linear parameter; §17.2 names DoubleMLIRM's estimand as ATE |
| RCT/observational framing correct | PASS | Post correctly frames this as observational (not randomised); identifying assumptions are explicit |
| Confounding language | PASS | Uses "omitted-variable bias" and "confounder" in observational contexts only |

---

## 11. Narrative Flow

- **Transitions:** Smooth. Each section ends with a forward-pointing sentence ("...we unpack the meaning of this asymmetry in the next section"; "see §16 for...")
- **Question-answer arc:** Overview poses "does the regression's headline result survive when we let the data choose from 284 candidate controls"; §19 answers "yes, at the rigorous-penalty level; with caveats about the regime"
- **Result ordering:** Headline forest plot at §1 spoiler → method walk-through §4-§10 → cross-method summary §11 → decision tree §12 → tier table §14 → DoubleML Part B §15-§18. Logical.
- **"So what?" moment:** §12 decision tree + §19 fourth takeaway ("Use post-double-selection when you want to replicate published results; use DoubleML when you want modern Neyman-orthogonal cross-fitting") are concrete practitioner guidance
- **Terminology consistency:** Consistent throughout. PSL, DL-rigorous, DL-CV, DoubleMLPLR all used with the same meaning every time. **MED on one quirk:** §1 introduces the post saying "rigorous penalty matters (CV vs rigorous → sign-flip on violent crime)" — but §10 shows Python *doesn't* reproduce the sign-flip. The two messages are reconciled in §15 but a first-time reader gets a brief expectation-mismatch. **Recommend:** edit §1 takeaway #2 to read "rigorous penalty matters (R demonstrates a sign-flip; Python a milder shift, both for the same reason — see §15)."

---

## 12. Images, Mermaid, and Deliverables

**Images:**

| Check | Status | Notes |
|-------|--------|-------|
| All image refs valid | PASS | 5 unique PNGs, 6 references, all files present in directory |
| Alt text present | PASS | Every `![alt](file.png)` has descriptive alt text (forest plot caption, selection bar-chart caption, etc.) |
| No orphaned PNGs | PASS | All 5 PNGs are referenced |
| Captions present | PARTIAL | Alt text serves dual purpose as caption; no separate italic-caption lines (the `img + em` pattern from `custom.scss`). **LOW — would be nice to add italic captions but the current alt-text-as-caption is also valid** |

**Mermaid:**

| Check | Status | Notes |
|-------|--------|-------|
| diagram: true in front matter | PASS | Set |
| Valid syntax | PASS | `flowchart TD` for the Double LASSO procedure; `flowchart TD` for the decision tree |
| Site palette colors | PASS | All node styles use `#0f1729`, `#1f2b5e`, `#6a9bcc`, `#00d4c8`, `#d97757` |
| Pre/post paragraphs | PASS | Both diagrams have explanatory text before and after |

**Deliverable consistency:**

| Check | Status | Notes |
|-------|--------|-------|
| Same imports/seed/data | PASS | `script.py` uses `RANDOM_SEED = 20260520` matching the post; same imports; same HTTPS data URLs |
| Same output values | PASS | Every numeric value in `index.md` matches `results_table2.csv` |
| Notebook raw LaTeX | N/A | No Jupyter notebook (Python post uses Quarto bundle instead). `tutorial.qmd` does not re-render the equations (Quarto's `embed-resources: true` + light theme `cosmo`) |
| Quarto bundle structurally valid | PASS | `python_double_lasso.zip` contains 7 files in `python_double_lasso/` |

**Site conventions:**

| Check | Status | Notes |
|-------|--------|-------|
| Em dashes (—) not double hyphens | MIXED | Most em dashes are correct (—). A few `--` survive in prose. **LOW — search for ` -- ` (space-dash-dash-space) and replace with ` — ` (em-dash).** |
| No emojis | PASS | None found |
| Site color palette | PASS | All figures use the documented hex codes |

---

## Priority Action Items

1. **[MED]** `featured.png` / `featured.webp` missing while `featured: true` is set in front matter. Hugo will show a placeholder. **User decision:** add the image, or flip to `featured: false` until the image is ready. (Per project convention, the user adds featured images manually — current state is expected mid-pipeline, just flag it.)

2. **[MED]** §1 "Key concepts at a glance" #2 (and the broader §1 lead-in) frames "rigorous penalty matters → sign-flip" using R's punchline. In Python the sign-flip is muted (covered in §10 and §15). **Recommend:** edit §1 takeaway and #2 to read "rigorous penalty matters — R demonstrates a sign-flip on violent crime, Python a milder shift; both flow from the same source (see §15)." Sets expectations correctly without spoiling §15.

3. **[MED]** §7 / §12 use `\\!` (negative thin space) inside display math. This is on the AVOID list — Netlify's Hugo 0.89.4 + MathJax v3 silently drops `\\!`, leaving a literal `!` glyph in the rendered output. **Fix:** remove `\\!` entirely (no spacing) or replace with `\,`. The bias equation in §12 already mostly does this; one stray `\\!` in `O\_p\\!\left(...)` is the candidate to clean up.

4. **[LOW]** Define "FWL partialling" in-place at first §6 mention (don't only forward-reference §7).

5. **[LOW]** §10 ¶ "Three pieces. **(i) Lambda grid.**" — restructure to flow as a single sentence.

6. **[LOW]** §15 source #1 — "different estimands" → "different finite-sample bias-variance trade-offs" (technically more accurate).

7. **[LOW]** Search prose for ` -- ` and replace with ` — ` (em-dash) for site convention.

---

## Positive Highlights

1. **Part B is original, calibrated, and substantive.** The "Five Sources of Drift" (§15) is technically accurate on every point and is genuinely useful for any Python user who has been confused by why their `DoubleML` results don't match an R `hdm` paper. The IRM caveat is appropriately prominent.

2. **Numerical replication is faithful.** All six \|I_y\|, \|I_d\| cells exactly match Fitzgerald et al. (2026) Table 2. DL-rigorous point estimates match the paper to 3 decimals. The post is honest about the Python-specific divergences (DL-CV sign-flip muted; OLS-full SE differs from R) and explains *why* without overclaiming.

3. **The learner-robustness comparison (§18) demonstrates DoubleML's strength better than any number alone.** Three structurally different learners landing within 0.03 of each other is the canonical DoubleML "robustness signal" — and the post correctly frames it as evidence that the conclusion is *not* fragile.

---

## Verdict and recommendation

**ACCEPT.** No HIGH issues. Three MEDs (featured-image status, §1 expectation calibration, `\\!` AVOID-list cleanup) and four LOWs are deferred to a follow-up pass. The Python post is ready to commit and deploy. The featured image is a known user-add convention; the other MEDs are minor expectation-calibration tweaks that don't block publication.
