# Review: python_fwl Web App

**Audited:** content/post/python_fwl/web_app/
**Date:** 2026-09-28
**Audit version:** review-app v1.0 (adapted: see "Deviations from the standard audit")
**Focus:** all
**Browser pass:** enabled (headless Chromium via Playwright 1.61.0; desktop 1280×800 + mobile 375×667 + a reduced-motion context)

---

## Verdict: ACCEPT

**Overall assessment.** The app now teaches the post's numbers rather than a toy model. Every figure it quotes is bound at runtime to `data/results.json` (written by `../script.py`) or computed live from the post's 50 stores. The math is verified by a Node harness: 39/39 checks pass, including the exact in-sample OVB identity across 2,000 simulated samples and the unbiasedness of FWL over 2,000 seeds. The strongest dimensions are data contract and pedagogy: the omitted-variable-bias display is corrected, and the SE ladder is explained mechanically. The weakest is mobile ergonomics: buttons are 40 px tall and slider thumbs 22 px, just under the 44 px touch-target guideline. Only LOW issues remain.

---

## Deviations from the standard audit

- **No penalized-regression module.** The standard checklist expects the write-app template's penalized-regression module and its smoke test. This app has no penalized regression, so that file was intentionally deleted. The write-app smoke test does not apply here and was replaced by a purpose-built Node `vm` harness, described under Dim 3.
- **Five tabs, not four.** A Quiz tab (`#pane-quiz`) was added on purpose.
- **Existing dev server.** The audit used the Hugo dev server that was already running at `127.0.0.1:1313` and did not start a second one.

---

## Dimension scores

| # | Dimension              | Score / 10 | Issues  | Notes                                                                                                   |
|---|------------------------|-----------:|--------:|---------------------------------------------------------------------------------------------------------|
| 1 | File completeness      | 10         | 0/0/0   | index.html, styles.css, dgp.js, charts.js, app.js, data/results.json; bundle 116 KB                     |
| 2 | HTML structure         | 10         | 0/0/0   | 5 tabs ↔ 5 panes, role=tab/tabpanel + aria-controls; D3 (SRI-pinned) → dgp → charts → app              |
| 3 | JS correctness         | 10         | 0/0/0   | Node harness 39/39; Playwright 111/111; zero console errors/warnings or failed requests                 |
| 4 | Data contract          | 10         | 0/0/0   | 7 estimate rows match fwl_results.json at 4 dp; checkbox values == method names (exact, same order)     |
| 5 | Accessibility          | 9          | 0/0/1   | Arrow/Home/End tab keys, keyboard quiz, aria-live feedback, SVG aria-labels, forest table view           |
| 6 | Performance            | 10         | 0/0/0   | Slider → update 69–71 ms (60 ms of that is debounce); 100-sim MC well under 1 s                          |
| 7 | Pedagogy               | 10         | 0/0/0   | Takeaway alignment 3/3; 9-term glossary; 7-question quiz mirrors the post's predict checks              |
| 8 | Hugo integration       | 9          | 0/0/1   | Post link href is `/post/python_fwl/web_app/index.html`; all assets 200 (dev server 301s index.html)    |
| 9 | Visual design          | 9          | 0/0/1   | Site palette throughout; two supporting tints (#8b9dc3, #9bdcc3) sit outside the four named colors       |
|10 | Mobile responsiveness  | 9          | 0/0/1   | No horizontal overflow on any pane at 375 px; charts re-render at the real container width              |

---

## Issues found

| #  | Dim | Severity | Location                       | Issue                                                                                                        | Suggested fix                                                                                   |
|---:|----:|----------|--------------------------------|--------------------------------------------------------------------------------------------------------------|-------------------------------------------------------------------------------------------------|
| 1  | 5   | LOW      | styles.css (`@media (max-width: 600px)`) | Mobile buttons are 40 px tall and slider thumbs 22 px, under the 44 px touch-target guideline.             | Raise `button.action { min-height: 44px }` and the thumb to 26 px inside the phone media query.  |
| 2  | 8   | LOW      | Hugo dev server                | `GET /post/python_fwl/web_app/index.html` answers 301 → `./` (Go file-server behavior). The fragment survives, so `index.html#lab` still opens the Lab. | None needed. Re-check deep links on the Netlify deploy preview.                                 |
| 3  | 9   | LOW      | charts.js:13–25                | The forest plot uses the muted `#8b9dc3` (Step 1 + intercept) and mint `#9bdcc3` (two-control rows) in addition to the site palette. | Keep, or map both rows to steel with dashed CIs if strict palette parity is wanted.              |
| 4  | 10  | LOW      | index.html (OVB card)          | At 375 px, the longest OVB-card labels push their value onto a second line (wraps cleanly; nothing clipped). | Shorten the labels on phones if a single-line layout is preferred.                               |

---

## Fixes applied in this revision (for the record)

1. **OVB display.** The old label "γ · δ (predicted OVB)" multiplied γ by the *DGP slope of coupons on income*, which is the wrong direction. The Lab now shows two things. First, the population bias γ · δ, with δ = Cov(I, C)/Var(C) = π·σ²ᵢ/(π²·σ²ᵢ + σ²_C) computed from the simulator's own σᵢ = 10 and σ_C = 5. Second, the exact in-sample identity γ̂ · δ̂ = naive β̂ − FWL β̂, with δ̂ taken from income regressed on coupons. The DGP slider is relabeled "π — DGP slope, income → coupons". The false promise that the two numbers "agree within sampling noise" is gone.
2. **Monte Carlo sign-flip text.** The old claim of "typically 40–80%" is gone. The page now computes the default rate at load with the Run button's own seeds (1000–1099) and shows it live: **98%** at n = 100. The harness independently finds 98/100 at n = 100 and 96/100 at n = 50.
3. **Step-1 and df explanations.** The Step 1 SE of 1.2715 is attributed mainly to the dropped intercept: adding one gives 0.1437, closing 98% of the gap. The Step 2 vs. full SE difference is traced to SSR/49 vs. SSR/47. The "FWL hugs 0.20" claims are softened.
4. **Tab 1 animation.** The N = 24 toy model is replaced by the post's 50 stores from `results.json → sample`. It moves through three phases: naive −0.1059, Step 1 (coupons on income), and Step 2 +0.2673. Phase buttons and Play/Pause are provided, and reduced-motion users get a paused animation.
5. **Dead code.** The unused penalized-regression module and its `<script>` tag are deleted. `dgp.js` now holds only `mulberry32`, `makeNormal`, the DGP constants, the population-δ helpers, and the FWL fitter/simulator.
6. **D3 pinned.** D3 now loads from `cdn.jsdelivr.net/npm/d3@7.9.0/dist/d3.min.js` with `integrity="sha384-CjloA8y0…"` and `crossorigin="anonymous"`. The hash was recomputed locally and matches the one python_bridge_impact uses.
7. **Wording and notation.** American spelling throughout (residualize, neighborhood, center). β̂ notation replaces α̂.
8. **Forest plot.** The seven checkbox values equal the `results.json` method names, and the new "FWL Step 1 + intercept" row is added. The plot gains a table view, touch tooltips, and a residual-df field.
9. **Deep links.** `#intro | #lab | #forest | #mc | #quiz` select the pane on load and on `hashchange`. Unknown or absent hashes fall back to intro. Tab clicks call `history.replaceState`, and the CTA cards are real `href="#…"` links.
10. **Quiz tab.** Seven click-to-answer cards (`.card.quiz[data-answer]`, `button[data-pick]`, `.quiz-feedback`, `QUIZ_FEEDBACK`) with feedback for right and wrong answers. All numbers are bound from `results.json`, and a score line tracks progress.

---

## Pedagogical alignment (Dim 7 deep-dive)

**Post takeaways extracted** (§1.2 learning objectives and the summary):
1. Diagnose omitted-variable bias: the naive coupon slope (−0.1059) has the wrong sign because income confounds it.
2. Decompose the naive-vs-controlled gap exactly with the OVB identity, and state FWL (the residualized regression reproduces 0.2673).
3. Explain why residualizing only the treatment gets the coefficient but not the SE (intercept + df), and connect FWL to Double Machine Learning.

**App messaging extracted:**
- Tab 1 lede: "…ignoring neighborhood income gives a slope of sales on coupons of −0.1059 (p = 0.365): the wrong sign. After partialling income out of both variables, the slope becomes +0.2673, exactly the multiple-regression coefficient…"
- Tab 2 heading: "Confounding Lab — make the sign flip yourself"
- Tab 3 heading: "The post's estimates — one coefficient, several standard errors"
- Tab 4 heading: "Monte Carlo — bias vs. variance over many samples"
- Tab 5 heading: "Quiz — predict, then check"

**Coverage:**
- Takeaway 1: ✓ covered in the Tab 1 lede, the Tab 2 sign-flip bullet, and Quiz Q1.
- Takeaway 2: ✓ covered in the Tab 1 lede and animation, the Tab 2 OVB card (exact identity), the glossary, and Quiz Q2–Q3.
- Takeaway 3: ✓ covered in the Tab 3 bullets, the "Why do FWL Step 2 and the full regression report different SEs?" card, Quiz Q4–Q5 and Q7, and the DML glossary entry.

**Coverage score:** 3/3

**Glossary check:**
- The post's "Key concepts at a glance" and the app's nine glossary entries both cover FWL, partialling out, confounding, OVB, conditional vs. marginal effects, the backdoor path, Simpson's paradox, and the DML bridge. The app adds a degrees-of-freedom correction entry.
- Missing: none.

---

## Widget catalog audit

| Tab | Widget archetype                  | Status | Notes                                                                        |
|-----|-----------------------------------|--------|------------------------------------------------------------------------------|
| 1   | concept-animation                 | READY  | Post's 50 stores; 3 phases; pause/step controls; reduced-motion aware        |
| 2   | dgp-simulator                     | READY  | Sliders n / γ / π; population OVB vs. exact in-sample identity               |
| 3   | forest-plot                       | READY  | Real-data rows from results.json; table view; hover and tap tooltips         |
| 4   | monte-carlo                       | READY  | 100 fixed seeds; predicted-mean line β + γ·δ; live sign-flip rate            |
| 5   | quiz (click-to-answer)            | READY  | 7 questions, right/wrong feedback, keyboard operable, score line             |

---

## Positive highlights

- The in-sample OVB identity is displayed and self-checked on every refit (app.js `lab_refit`): "✓ Equal to machine precision". The harness confirms naive = FWL + γ̂·δ̂ to 1.4e−14 across 2,000 samples at 4 sample sizes × 4 γ × 5 π.
- `dgp.js::fit_fwl` reproduces the post's canonical numbers from the 50 stores to 1e−9: naive −0.1059, full 0.2673, SE 0.1203, γ̂ 0.3836, δ̂ −0.9730, and the Step-1 slope −0.3935.
- The population-bias display matches the Monte Carlo. Over 2,000 seeds at the defaults, mean naive − truth is −0.2997 (n = 50) and −0.2991 (n = 100), against the displayed −0.300. The same check passes at three off-default settings, and mean FWL is 0.2011 and 0.2009.
- The quiz feedback quotes the post's numbers through `buildFacts`, so the text can never drift from `script.py`. The number checker reports 0 near-misses on `index.html` and `app.js`.
- Charts size their viewBox to the real container width and use a stacked legend and labels on phones, so text stays legible at 375 px with no page-level horizontal scroll.

---

## Priority action items

1. **[LOW]** Raise mobile touch targets to 44 px (buttons, slider thumbs).
2. **[LOW]** Spot-check the `#lab` / `#quiz` deep links on the Netlify deploy preview (the dev server's 301 keeps the fragment in Chromium).

---

## Screenshots (HIGH-severity visual issues only)

None found.

---

## How to re-review

After applying the fixes, re-run:

    /project:review-app python_fwl

To focus on the dimension you just fixed:

    /project:review-app python_fwl focus: <pedagogy|code|accessibility|data|hugo|visual>

---

## Audit metadata

- Hugo port used: 1313 (existing dev server; no second server started)
- Node version: v25.9.0
- Playwright: 1.61.0 (global install), headless Chromium; 111/111 checks. The browser pass covered, for every hash (`#intro`, `#lab`, `#forest`, `#mc`, `#quiz`, none, unknown):
  - pane activation on fresh load and on `hashchange`;
  - tab click → `replaceState`, and Arrow/Home keys;
  - CTA links;
  - all 7 quiz questions with wrong-then-right answers, plus keyboard Enter/Space;
  - Lab slider, reseed, and reset;
  - forest toggle, table, and tooltip (hover on desktop, tap on mobile);
  - an MC run at the defaults, where the flip rate equals the harness value (98%);
  - animation phase buttons and Play/Pause;
  - reduced-motion start state;
  - no horizontal overflow at 1280 and 375 px;
  - zero console errors or warnings.
- Node harness (`vm`, d3 stub; 39/39): exports; post sample vs. `fwl_results.json`; `results.json` vs. canonical; checkbox ↔ method coupling; population δ(−0.5) = −1.0 and the plim −0.10; |δ| peaks at |π| = 0.5; the identity across 2,000 samples; FWL unbiasedness and naive bias over 2,000 seeds; MC flip rate 98/100; no dead code; no British spellings; D3 SRI pin; 5 panes; 7 quiz cards; every `data-fact` defined.
- Number check: `check_numbers.py fwl_results.json web_app/index.html web_app/app.js` → 0 near-misses.
- Tooling notes: `data/results.json` is generated by the "Web app payload" block of `../script.py`. Its schema now carries `true_effect`, 4-dp SEs, `scaled_residuals`, the full `ovb` object (including the wrong-direction slope and the population values), `se_ladder`, and `se_ratio_step2_over_full`.

---

## Addendum — 2026-09-28 (post-review corrections)

A later verification pass changed some text this review quotes. The verdict stands.

- **Tab 1 animation labels (Fix 4 above).** The phases are no longer called "Step 1 (coupons on income)" and "Step 2". The post uses Step 1 for regressing raw sales on residualized coupons, so the app's labels meant something different. The buttons now read "1 · Naive view", "2 · Partial out income" and "3 · Residuals on residuals". The phase titles and the card text say the last phase is the post's Step 2, and that the post's Step 1 appears in Tab 3. Quiz Q3's feedback for "Coupons on income" and "Sales on income" now calls them the partialling-out regressions for coupons and for sales.
- **Glossary, "Conditional vs. marginal effect."** The old line, "They agree only when no relevant variable is omitted," was wrong. The new line says they coincide when the omitted variable does not affect the outcome or is uncorrelated with the treatment, and in a sample exactly when γ̂ · δ̂ = 0. Day of week in the post is a counterexample to the old line: it is relevant but independent of coupons.
- **Quiz Q2 ("It stays near the naive value").** The gap of −0.3732 is now described as γ̂ · δ̂, the in-sample OVB term measured against the full-regression estimate. It is not the bias against the true 0.20.
- **Tab 3 lede.** The seven rows match the post's Summary of results table. Only the NumPy row is left out, because it has no standard error. "FWL Step 1 + intercept" is no longer called an extra diagnostic row.
- **Hats (Fix 7 above).** A combining circumflex (β̂) sat off-center in the system sans font. In HTML, hats are now drawn by CSS (`<span class="hat">β</span>`, see `styles.css`), and the span also stops `.stat-label` from upper-casing β to Β. The residual tildes in the FWL glossary card use the same method. The SVG axis titles no longer use a hat: "Estimated coupon coefficient across simulated samples" and "Coupon coefficient with 95% CI".
- **Cache busting.** Netlify caches `*.css` and `*.js` for 30 days, so every local asset tag now carries `?v=20260928`.
- **Re-checks.** Node harness: naive − FWL = γ̂ · δ̂ to 6.4e−15 across 400 simulated samples. Playwright at 1280 and 375 px: deep links, all 21 quiz options, zero console errors, no horizontal overflow. `check_numbers.py` reports 0 near-misses.

---

*Generated by `/project:review-app`. Skill at
`.claude/skills/review-app/`. Verification rubric at
`references/scoring-and-criteria.md`.*
