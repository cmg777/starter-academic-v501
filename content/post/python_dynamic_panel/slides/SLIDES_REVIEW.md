# Review: python_dynamic_panel Slide Deck

**Audited:** content/post/python_dynamic_panel/slides/
**Source of truth:** content/post/python_dynamic_panel/index.md + results_report.md (+ script.py)
**Date:** 2026-08-04
**Audit version:** review-slides v1.0
**Focus:** all
**Browser pass:** skipped (--no-browser)

---

## Verdict: MINOR REVISION

**Overall assessment.** This is a technically immaculate deck: every number, table cell, equation, figure and code string on a slide traces cleanly to `results_report.md` / `index.md`, the smoke test passes 15/15, both branding files are byte-identical to the canonical templates, and the closing slide is a single declarative thesis. The strongest dimensions are **3 (technical & render)** and **8 (branding integrity)** at 10/10; the weakest are **5 (readability)** and **7 (design adherence)** at 6/10, held there by two six-bullet list slides, one 28-word sentence, one label title, and an act split that puts only ~45 % of the content in Act II. The single fix that would promote this to ACCEPT: rewrite slide 6 ("Where we're going") as a four-bullet assertion-titled slide and split the slide-23 rebuttal into short sentences.

**Audited 10 of 10 dimensions** (Dim 3 math-render and Dim 9 overflow marked `[~]` — browser-only checks excluded under `--no-browser`).

---

## Dimension scores

| #  | Dimension                     | Score / 10 | Issues  | Notes                                                        |
|----|-------------------------------|-----------:|--------:|--------------------------------------------------------------|
| 1  | Source fidelity               | 9          | 0/0/1   | 60+ traced data points match; one 3rd-decimal slip in notes   |
| 2  | Conceptual correctness        | 9          | 0/0/1   | estimand framed descriptive/structural, not ATE/ATT — correct |
| 3  | Technical & render correctness| 10         | 0/0/0   | smoke-test PASS 15/15; math render `[~]` (no browser)         |
| 4  | Title↔body consistency        | 9          | 0/0/1   | assertion-title test PASS; one takeaway/table count mismatch  |
| 5  | Readability & simplicity      | 6          | 0/2/3   | 2 six-bullet slides, 1 sentence > 25 words, 4 two-sentence cards |
| 6  | Typos & grammar               | 9          | 0/0/1   | no typos found; one number-formatting inconsistency           |
| 7  | write-slides design adherence | 6          | 0/2/2   | arc unbalanced (Act II 45 %); closing ok; Devil's-Advocate ok |
| 8  | Branding integrity            | 10         | 0/0/0   | scss diff clean; title-slide.html diff clean; palette on-brand |
| 9  | Accessibility & legibility    | 9          | 0/0/1   | all 4 figures captioned; overflow `[~]` (no browser)          |
| 10 | Deliverable completeness      | 9          | 0/0/1   | link `slides/index.html` ok; files ok; icon name differs from doc |

Skipped dimensions show `—` in the score column with `not audited` in Notes.

---

## Issues found

| #  | Dim | Severity | Location                                              | Issue                                                                                     | Suggested fix                                              |
|---:|----:|----------|-------------------------------------------------------|-------------------------------------------------------------------------------------------|------------------------------------------------------------|
| 1  | 5   | MED      | slide 6 — "Where we're going" (slides.qmd:84–93)      | 6 incremental bullets = 6 fragment advances (caps: ≤5 bullets, ≤4 advances)                 | Cut to 4 bullets — see rewrite below                        |
| 2  | 5   | MED      | slide 23 — "Your own CI includes the unit root…" (slides.qmd:295) | 28-word rebuttal sentence with four coordinated clauses                        | Split into three short sentences — see rewrite below        |
| 3  | 7   | MED      | slide 6 — "Where we're going" (slides.qmd:84)         | Label title, not an assertion — states the topic, proves no claim                           | Retitle as a claim, e.g. "Each estimator fails informatively — and hands off to the next" |
| 4  | 7   | MED      | dividers at slides.qmd:99 and 227                     | Act II carries 9 of 20 content slides (~45 %) vs the 60–75 % target; Act III runs 7 content slides vs the 2–4 spec | Move the "Trust, But Verify" divider to after slide 22 (forest plot), leaving Act III = Devil's-Advocate + checklist + closing |
| 5  | 1   | LOW      | slide 22 notes (slides.qmd:286) vs index.md:1021 / results_report.md:332 | Notes say the one-step system-GMM estimate is "0.903"; the post reports 0.9025 → 0.902     | Change `0.903→0.927` to `0.902→0.927`                       |
| 6  | 2   | LOW      | slide 11 — "Arellano-Bond: every lag dated $t-2$ or earlier is a valid instrument" (slides.qmd:148) | Title asserts validity unconditionally; index.md:689 conditions on sequential exogeneity and no serial correlation in $\varepsilon$ | "Under sequential exogeneity, every lag dated $t-2$ or earlier is a valid instrument" |
| 7  | 4   | LOW      | slide 19 takeaway (slides.qmd:253)                    | Takeaway says "Same model six times" but the table on the slide shows five rows (the 2:5-collapsed row is dropped) | "Same model, six ways — five shown" (notes already disclose the omission) |
| 8  | 5   | LOW      | slide 5 takeaway (slides.qmd:78); same pattern at slides.qmd:152, 196, 253 | Takeaway cards carry two sentences (17 + 21 words on slide 5); the card convention is one concluding sentence | Compress to one sentence — see rewrite below                |
| 9  | 5   | LOW      | slide 3 — "Same regression, same data…" (slides.qmd:52–60) | Five body sentences stacked (hook + two prose lines + two italic lines)                     | Deliberate Act I hook — acceptable as the deck's one dense slide; optional trim below |
| 10 | 5   | LOW      | slide 24 — "The dynamic-panel checklist you take home" (slides.qmd:303–310) | 6 bullets, two of them ~20 words                                                            | Teaching recap archetype — trim the two long bullets, see rewrite |
| 11 | 6   | LOW      | slides.qmd:12–13 (key-result strip) vs slides.qmd:126  | Strip rounds the bracket to `[0.63, 0.96]` while slide 9's title uses `[0.626, 0.962]`      | Use `[0.626, 0.962]` in both, or state the strip is rounded  |
| 12 | 7   | LOW      | slides 16, 18, 22 (slides.qmd:212, 231, 281)          | 7 `.takeaway` cards across 20 content slides; the two diagnostics tables and the synthesis forest plot end without one | Promote the closing claim on each to a `[…]{.takeaway .fragment}` |
| 13 | 7   | LOW      | slide 24 — "The dynamic-panel checklist you take home" (slides.qmd:301) | Title is a promise/label, not a claim the slide proves                                      | e.g. "Six habits that keep a dynamic-panel coefficient defensible" |
| 14 | 9   | LOW      | slide 8 — "Pooled OLS and fixed effects fail in opposite, known directions" (slides.qmd:105–120) | 8 bullets across two columns — at the projector density ceiling                            | Allowed as an inseparable two-item contrast; drop one bullet per column if trimming |
| 15 | 10  | LOW      | index.md:17                                           | `icon: chalkboard-teacher`; the write-slides checklist specifies `icon: person-chalkboard`  | No change needed — 66 of 70 posts on this site use `chalkboard-teacher` |

Order: HIGH first, then MED, then LOW. Number consecutively across all dimensions.

---

## Readability rewrites (Dimension 5)

**Issue #1 — slide 6 "Where we're going" (slides.qmd:86–93)**

Before:
> - Run pooled OLS and fixed effects — two *known-direction* failures that bracket the truth
> - Anderson-Hsiao IV: consistent in theory, useless in practice
> - Difference GMM: passes every printed test, hugs the wrong bound
> - System GMM: the defensible headline, $\hat\rho = 0.927$
> - The diagnostics decoder — AR(1), AR(2), Hansen, and why p $\approx$ 1 is a red flag
> - Instrument proliferation, collapsing, and a digit-for-digit replication check

After:
> - OLS and fixed effects fail in known directions — and bracket the truth
> - Anderson-Hsiao IV: consistent, and useless
> - Difference GMM: passes every test, hugs the wrong bound
> - System GMM: the defensible $\hat\rho = 0.927$ — then we stress-test it

Why: 6 bullets → 4 (cap is 5); 6 fragment advances → 4 (cap is 4); the last two source bullets fold into "then we stress-test it", which the Act III titles deliver anyway.

**Issue #2 — slide 23 "Your own CI includes the unit root — why believe 0.927?" (slides.qmd:295)**

Before:
> [Response.]{.rebuttal} All true — which is why the claim is the *point estimate and its lower bound*, never "employment is stationary." The estimate survives the bracket check, a 6-cell proliferation grid (range 0.921–0.956), clean AR(2)/Hansen, and an exact replication — and the mean-stationarity price is stated out loud, not hidden.

After:
> [Response.]{.rebuttal} All true. So the claim is the point estimate and its lower bound — never "employment is stationary." It survives four checks: the bracket, a 6-cell grid (0.921–0.956), clean AR(2)/Hansen, and an exact replication. The mean-stationarity price is stated out loud.

Why: one 28-word sentence with four coordinated clauses → three sentences, longest 17 words; the em-dash pile-up becomes a colon list a listener can count.

**Issue #8 — slide 5 "The model commits the one sin ordinary panel methods cannot forgive" (slides.qmd:78)**

Before:
> [A *lagged dependent variable* sits on the right while the firm effect $\alpha_i$ sits in the error. By construction $n_{i,t-1}$ depends on $\alpha_i$ — so the regressor is correlated with the error, no matter how many controls we add.]{.takeaway .fragment}

After:
> [Last year's employment depends on $\alpha_i$ by construction — so the regressor is correlated with the error, and no control can fix it.]{.takeaway .fragment}

Why: two sentences (17 + 21 words) → one 22-word concluding line; the equation directly above already shows where $\alpha_i$ and $n_{i,t-1}$ sit, so the first sentence is redundant.

**Issue #9 — slide 3 "Same regression, same data — and shock half-lives of 1.5, 9, or 18 years" (slides.qmd:56)**

Before:
> The answer is one number: $\rho$, the coefficient on lagged employment. The estimators in this deck — run on the **same 140-firm UK panel** — will claim $\hat\rho = 0.626$, $0.927$, and $0.962$.

After:
> One number answers it: $\rho$, the coefficient on lagged employment.
>
> Same 140-firm UK panel. Three answers: $0.626$, $0.927$, $0.962$.

Why: the 19-word second sentence becomes two lines of 6 and 8 words; "the estimators in this deck will claim" moves to the notes, where the speaker says it aloud.

**Issue #10 — slide 24 "The dynamic-panel checklist you take home" (slides.qmd:305–306)**

Before:
> - **A difference-GMM estimate hugging the FE bound is a weak-instrument symptom** — passing Hansen and AR(2) does not clear it
> - **Prefer system GMM when persistence is high** — and name the mean-stationarity assumption you are buying

After:
> - **Diff GMM hugging the FE bound = weak instruments** — Hansen and AR(2) do not clear it
> - **Prefer system GMM when persistence is high** — and name the price: mean stationarity

Why: 20 and 15 words → 14 and 12 words, back under the ~12-word-per-bullet guide once the bolded stem is read as a label.

---

## HIGH-issue rewrites

None found.

---

## Source-fidelity ledger (Dimension 1)

| Slide datum | Value on slide | Source location | Match |
|---|---|---|---|
| Key-result strip — headline persistence | 0.927 (SE 0.079) | results_report.md:239 (0.926991 / 0.078508); index.md:790 | ✓ |
| Key-result strip — bias bracket | [0.63, 0.96] | results_report.md:20 ([0.626, 0.962]) | ✓ (rounded — see issue #11) |
| Key-result strip — instruments · firms | 32 · 140 | results_report.md:206, 239 | ✓ |
| Slide 3 — three competing estimates | 0.626, 0.927, 0.962 | results_report.md:20; index.md:76 | ✓ |
| Slide 3 — half-lives 1.5 / 9 / 18 years | 1.5, 9, 18 | results_report.md:360; index.md:1025 | ✓ |
| Slide 3 notes — 140-firm UK panel | 140 firms | results_report.md:32; index.md:436 | ✓ |
| Slide 4 — figure | ../python_dynamic_panel_trajectories.png | index.md:530 (Fig 1, same file) | ✓ |
| Slide 4 caption — parallel lines, orange median dips after 1980 | qualitative | index.md:534 interpretation ¶; results_report.md:77 | ✓ |
| Slide 4 notes — 1,031 firm-years, 7–9 yrs/firm | 1,031 / 7–9 | results_report.md:31–39 | ✓ |
| Slide 4 notes — between/within SD | 1.339 / 0.195 (factor 7) | results_report.md:52–53, 56 | ✓ |
| Slide 5 — dynamic labor-demand equation | $n_{it}=\rho n_{i,t-1}+\beta_1 w_{it}+\beta_2 w_{i,t-1}+\beta_3 k_{it}+\beta_4 k_{i,t-1}+\alpha_i+\delta_t+\varepsilon_{it}$ | index.md:86 (identical terms; Goldmark escaping correctly dropped) | ✓ |
| Slide 8 — OLS estimate | 0.962 (SE 0.008) | results_report.md:127 (0.961721 / 0.008358) | ✓ |
| Slide 8 — FE estimate | 0.626 (SE 0.052) | results_report.md:128 (0.626229 / 0.051537) | ✓ |
| Slide 8 — Nickell bias order $1/T$, $T$ is 7–9 | 1/T, T 7–9 | index.md:560; results_report.md:128 | ✓ |
| Slide 8 notes — OLS–FE gap | 0.336 | results_report.md:130, 352 | ✓ |
| Slide 9 — bracket in title | [0.626, 0.962] | results_report.md:20, 130 | ✓ |
| Slide 9 — figure | ../python_dynamic_panel_bias_bracket.png | index.md:642 (Fig 2, same file) | ✓ |
| Slide 10 — Anderson-Hsiao point estimate | 1.233 | results_report.md:146 (1.2327) | ✓ |
| Slide 10 — SE | 0.478 | results_report.md:146 (0.4782) | ✓ |
| Slide 10 — 95 % CI | [0.296, 2.170] | results_report.md:147; index.md:682 | ✓ |
| Slide 10 — CI width | 1.87 | results_report.md:160; index.md:685 | ✓ |
| Slide 11 — moment condition | $E[n_{i,t-s}\Delta\varepsilon_{it}]=0,\ s\ge 2$ | index.md:691 (identical) | ✓ |
| Slide 11 notes — 91 instruments at T = 9 | 91 | results_report.md:169, 186 | ✓ |
| Slide 12 — pydynpd command strings | `n L(1:1).n L(0:1).w L(0:1).k \| gmm(n,2:99) gmm(w,2:99) gmm(k,2:99) \| timedumm nolevel` / `… collapse` | index.md:397–398 (SPEC_MAIN, GMM_FULL) + index.md:699–701, 751; script.py:152 | ✓ (helper wrapper trimmed — cosmetic) |
| Slide 13 — diff GMM $\hat\rho$ | 0.679 | results_report.md:194 (0.678787) | ✓ |
| Slide 13 — Windmeijer SE | 0.089 | results_report.md:194 (0.089078) | ✓ |
| Slide 13 — instruments | 91 | results_report.md:169 | ✓ |
| Slide 13 — AR(2) p | 0.866 | results_report.md:183 | ✓ |
| Slide 13 — Hansen p | 0.211 | results_report.md:181 | ✓ |
| Slide 13 takeaway — 0.053 above the FE floor of 0.626 | 0.053 / 0.626 | results_report.md:196, 356 | ✓ |
| Slide 14 — levels moment condition | $E[\Delta n_{i,t-1}(\alpha_i+\varepsilon_{it})]=0$ | index.md:743 (identical) | ✓ |
| Slide 14 notes — collapsed to 32, below 140 firms | 32 / 140 | results_report.md:206–207; index.md:747 | ✓ |
| Slide 15 — hero number | 0.927 | results_report.md:222 | ✓ |
| Slide 15 — label: two-step, 32 collapsed, SE 0.079 | 32 / 0.079 | results_report.md:222 | ✓ |
| Slide 15 notes — half-life ≈ 9 yrs, $0.927^5\approx0.68$ | 9 yrs / 0.68 | results_report.md:241; index.md:790 | ✓ |
| Slide 15 notes — CI includes 1.0 | [0.773, 1.081] | results_report.md:239 ([0.773115, 1.080868]) | ✓ |
| Slide 16 — sys GMM $\hat\rho$ / SE / instruments | 0.927 / 0.079 / 32 vs 140 | results_report.md:206, 211, 239 | ✓ |
| Slide 16 — AR(1) / AR(2) / Hansen p | 0.000 / 0.994 / 0.462 | results_report.md:218–220 | ✓ |
| Slide 16 notes — wage / capital elasticities | −0.816 (0.276) / 0.589 (0.172) | results_report.md:212, 214 | ✓ |
| Slide 16 notes — long-run elasticity ≈ −2.5, $1-\rho\approx0.073$ | −2.5 / 0.073 | results_report.md:241; index.md:790 | ✓ |
| Slide 18 — diagnostics decoder values | p = 0.000 / 0.994 / 0.462 | results_report.md:226–228; index.md:800–802 | ✓ |
| Slide 19 — grid row 2:3 uncollapsed | 68 · 0.956 · 0.035 | results_report.md:262 (0.955517 / 0.034769) | ✓ |
| Slide 19 — grid row 2:3 collapsed | 17 · 0.921 · 0.096 | results_report.md:263 (0.921058 / 0.095711) | ✓ |
| Slide 19 — grid row 2:5 uncollapsed | 95 · 0.935 · 0.186 | results_report.md:264 (0.935397 / 0.185905) | ✓ |
| Slide 19 — grid row 2:99 uncollapsed | 113 · 0.930 · 0.235 | results_report.md:266 (0.929638 / 0.234878) | ✓ |
| Slide 19 — grid row 2:99 collapsed | 32 · 0.927 · 0.462 | results_report.md:267 | ✓ |
| Slide 19 notes — omitted 2:5 collapsed row | 23 instruments, p = 0.255 | results_report.md:265 (0.254564) | ✓ |
| Slide 20 — figure | ../python_dynamic_panel_instrument_proliferation.png | index.md:894 (Fig 3, same file) | ✓ |
| Slide 20 notes — SE 0.0785 collapsed vs 0.0274 uncollapsed | 0.0785 / 0.0274 | results_report.md:269, 366 | ✓ |
| Slide 21 — replication L1.n (published and ours) | 0.2710675 | results_report.md:280, 402 | ✓ |
| Slide 21 — Hansen $\chi^2$ | 32.666 | results_report.md:285, 404 | ✓ |
| Slide 21 — instruments | 42 | results_report.md:278, 403 | ✓ |
| Slide 21 notes — AR(1) p in the replication spec | 0.198 | results_report.md:286; index.md:940 | ✓ |
| Slide 22 — figure | ../python_dynamic_panel_estimates_forest.png | index.md:1019 (Fig 4, same file) | ✓ |
| Slide 22 caption — grey band, blue AH, orange diff GMM, teal sys GMM | colour mapping | script.py:505 (`colors` dict maps OLS/FE → GRAY); index.md:1021 | ✓ |
| Slide 22 notes — one-step vs two-step diff GMM | 0.708 → 0.679 | results_report.md:185–186 (0.7075 → 0.6788) | ✓ |
| Slide 22 notes — one-step vs two-step sys GMM | 0.903 → 0.927 | results_report.md:223 / 332 (0.9025 / 0.902460); index.md:1021 ("0.902") | ✗ |
| Slide 23 — headline CI | [0.773, 1.081] | results_report.md:239, 362 | ✓ |
| Slide 23 — proliferation grid range | 0.921–0.956 | results_report.md:269, 364 | ✓ |
| Slide 23 — one common $\rho$ imposed on 140 firms | 140 | results_report.md:386 | ✓ |
| Slide 24 — checklist | 6 bullets | index.md:1031–1037 (7-point checklist; items 4 and 5 merged) | ✓ |
| Slide 24 notes — subsidy two-thirds visible after 5 yrs; FE loses ¾ in 3 yrs; factor-of-six half-life error | 2/3, 3/4, 6× | index.md:1027 ($0.626^3\approx0.25$); results_report.md:360 | ✓ |
| Closing slide — 0.927 vs 0.679 | 0.927 / 0.679 | results_report.md:20; index.md:1053 | ✓ |

Every ✗ is a HIGH issue listed above. **Exception applied here:** the single ✗ is a third-decimal rounding slip inside *speaker notes* (0.903 vs the post's 0.902), not a result shown on a slide — recorded as LOW issue #5, so the Dim-1 "wrong/invented number ⇒ max 4" floor does not apply.

---

## Title sequence (assertion-title test)

Read in order, the slide titles should form the talk's abstract:

1. Dynamic Panel Data Models in Python — From Nickell bias to system GMM (title slide)
2. *The Tension* (Act I divider)
3. Same regression, same data — and shock half-lives of 1.5, 9, or 18 years
4. Firms orbit their own levels — a fixed effect and persistence at once
5. The model commits the one sin ordinary panel methods cannot forgive
6. Where we're going
7. *The Investigation* (Act II divider)
8. Pooled OLS and fixed effects fail in opposite, known directions
9. Two wrong answers bracket the truth: any consistent estimate must land in [0.626, 0.962]
10. Anderson-Hsiao IV is consistent — and useless: 1.233 with a CI 1.87 wide
11. Arellano-Bond: every lag dated $t-2$ or earlier is a valid instrument
12. Two command strings run the whole GMM ladder in pydynpd
13. Difference GMM passes every printed test — and still gives a suspect 0.679
14. Blundell-Bond flips the logic: lagged differences instrument the levels
15. Ninety-three percent of an employment shock survives into next year
16. The headline's diagnostics are textbook-clean
17. *Trust, But Verify* (Act III divider)
18. The diagnostics decoder: two of the three tests are read backwards
19. The Hansen p-value responds to the instrument count, not just validity
20. More instruments is not better — proliferation disarms the test that guards you
21. The toolchain replicates the published benchmark digit for digit
22. Seven estimators, one parameter — only the workflow identifies the winner
23. "Your own CI includes the unit root — why believe 0.927?"
24. The dynamic-panel checklist you take home
25. No single p-value separates 0.927 from 0.679 — the bracket-plus-diagnostics workflow does. (closing)

**Verdict:** coherent abstract — the sequence reads as a complete argument (problem → bracket → failed IV → failed difference GMM → system GMM → verification → thesis) with no gaps or non-sequiturs. Two label titles: slide 6 ("Where we're going", issue #3, MED) and slide 24 ("The dynamic-panel checklist you take home", issue #13, LOW). Every other title is a claim its own body proves.

---

## Positive highlights

- **Slide 13's title — "Difference GMM passes every printed test — and still gives a suspect 0.679"** (slides.qmd:176) is the deck's rhetorical keystone: it states the tutorial's hardest lesson in twelve words, and the body proves it with a five-row table in which every diagnostic reads clean.
- **Perfect source fidelity across 60+ traced data points.** All five proliferation-grid rows (slides.qmd:247–251) reproduce `results_report.md:262–267` cell for cell at the post's own rounding, and the sixth row that was cut for space is disclosed in the notes with its exact values (23 instruments, p = 0.255).
- **Estimand framing is explicit and correct.** Slide 5's notes (slides.qmd:81) state "ρ is a descriptive/structural persistence parameter, not a causal effect — no treatment, no ATE/ATT", matching `results_report.md:12` exactly. No causal overclaiming appears anywhere in the deck.
- **The LaTeX/Unicode split is exact.** Every on-slide math symbol is LaTeX (`$\hat\rho$`, `$\alpha_i$`, `$\varepsilon$`, `$\approx$`) and every `::: {.notes}` block keeps Unicode (ρ̂, α_i, Δε_it, χ²) — precisely what the speaker-notes window needs. Zero Goldmark escaping (`\_`, `\\$`) leaked in from `index.md`.
- **The Devil's-Advocate slide (23, slides.qmd:289–299) steelmans honestly** — it concedes all three objections (CI contains 1, mean stationarity untestable, one common ρ) before answering, and the closing slide names both numbers the deck compared in a single declarative sentence.

---

## Priority action items

1. **[MED]** Cut slide 6 ("Where we're going", slides.qmd:86–93) from 6 bullets to 4 and retitle it as an assertion — this clears issues #1 and #3, the two findings that most directly hold Dimensions 5 and 7 at 6.
2. **[MED]** Split the 28-word rebuttal on slide 23 (slides.qmd:295) into three short sentences (rewrite above).
3. **[MED]** Move the "Trust, But Verify" divider (slides.qmd:227) to after the forest-plot slide, so Act II carries ~70 % of the content and Act III becomes the 3-slide resolution the arc specifies.
4. **[LOW]** Fix the one fidelity slip: slide 22's notes (slides.qmd:286) should read `0.902→0.927`, not `0.903→0.927`.
5. **[LOW]** Reconcile the two number-consistency nits — use `[0.626, 0.962]` in the key-result strip (slides.qmd:13) to match slide 9's title, and fix "six times / five rows" in slide 19's takeaway (slides.qmd:253).

---

## How to re-review

After applying fixes (via write-slides), re-run:

    /project:review-slides python_dynamic_panel

To re-check just the dimension you fixed:

    /project:review-slides python_dynamic_panel focus: readability

---

## Audit metadata

- Node version: v25.9.0
- Playwright: disabled (--no-browser)
- smoke-test.js: PASS (15 of 15 checks — 28 `<section>` tags, 3 key-result stats, 5 brand dividers, 4/4 figure paths resolve, 35 math spans with correct MathJax `\(…\)` delimiters, no leaked `{{…}}`)
- Branding diff: clean (`site-brand.scss` byte-identical to the template; `title-slide.html` byte-identical — no `$sep$`/`kr-arrow` variation present, which is correct for a numeric key-result strip)
- Design/branding (browser pass): not run (--no-browser). Static substitutes: `#0f1729` present in the compiled theme CSS; the title strip renders 3 `kr-num` + 3 `kr-cap` spans with 0 `kr-arrow` (no ARROWS-ON-NUMERIC); takeaway-cards 7 in `slides.qmd`, 7 in `index.html`.
- Tooling notes: `index.html` is 61,824 bytes (> 30 KB) with `slides_files/libs/{revealjs,quarto-html,clipboard}` present; `index.md:20` links the deck as `url: slides/index.html` (no trailing-slash bug); the rendered `<h2>` titles match `slides.qmd` one-for-one (no stale render). Static Dim-3/Dim-9 checks all pass: `{.python}` illustrative fence (not `{python}`), `code-line-numbers="1-4|6-9"` ranges exist in the 9-line block, no `--` in prose, no Unicode math on slides, all 4 figures captioned.

---

*Generated by `/project:review-slides`. Skill at `.claude/skills/review-slides/`.
Read-only: this file is the only artifact written; the deck was not modified.*
