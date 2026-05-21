# Double LASSO for Causal Inference: Does Abortion Reduce Crime?

## Section A: Full Image Generation Prompt

Create a 1920x1080 landscape digital chalk illustration on a dark navy background (#0e1545). The style is academic chalkboard sketchnote: all lettering appears hand-drawn in chalk with slightly irregular strokes, chalk-dust particles float near text edges, and faint smudge marks add realism. The overall feel resembles a photograph of an expertly annotated university lecture chalkboard.

The composition features a title banner centred at the top, six panels arranged in a 3-column by 2-row grid below it, and a vertical sidebar in the right margin titled "FIVE ESTIMATORS TRACKED". Each panel has a chalk-drawn rounded-rectangle border in steel blue (#8bb8e0) with slightly uneven edges; panel numbers appear as small warm-orange (#e8956a) circled numerals in the top-left corner of each panel. Chalk arrows with dust particles connect the panels in reading order: 1 to 2 to 3 across the top row, vertically from 3 down to 4, then 4 to 5 to 6 across the bottom row. Generous dark space between panels lets the navy background read as a design element.

The colour system uses six chalk colours. Background navy blue #0e1545 reads as a real chalkboard. Body text and outlines are chalk white #f0ece2. Panel titles, headers, and the four steel-blue tags above Panels 2, 3, 4, and 6 are steel blue #8bb8e0 in chalk small-caps. Warm orange #e8956a is reserved for the three BIG numbers — "Murder jumps +234%" sub-text in Panel 1, "143 of 284" in Panel 4, "−0.096 → +0.019" in Panel 5, "8 of 284" in Panel 6 — and for the over-selected CV side of Panel 4's balance scale. Teal #00d4c8 marks the recommended methods, the rigorous-penalty side of comparisons, and the six checkmarks in Panel 6. Muted chalk gray #b0a89a carries annotation labels, the right-margin sidebar, and faint background formulas. Each panel uses at most three foreground colours.

The title banner sits above the panel grid, centred. The main title reads "DOUBLE LASSO FOR CAUSAL INFERENCE: DOES ABORTION REDUCE CRIME?" in large steel-blue chalk small-caps, broken across two lines at the colon so the question sits visually under the methodology label. Beneath it, in smaller steel-blue chalk small-caps, the subtitle reads "Disciplined Selection: 8 of 284 Beats the Kitchen Sink". Below the subtitle, in smaller chalk-white italic, the guiding question reads: "Do you really need all 284 controls — or does adding more break the very estimate you wanted to sharpen?"

Panel 1 (top-left): Title "ALL 284 CONTROLS?" in steel blue small-caps. A large chalk magnifying glass hovers over an absurdly bloated chalk numeral "+2.34" with a faint question mark beside it. Below the glass, a chalk-tally row "−0.20 / −0.15 / −0.11" (the no-controls murder, violent, property baselines) appears crossed out by the bloated estimate. A floating in-panel fragment `(X′X)⁻¹` shows a chalk crack running through it. Annotation label in muted gray: "Kitchen-sink OLS, n=576, p=284". Callout in warm orange: "Murder jumps +234%". Chalk arrow to Panel 2.

Panel 2 (top-centre): A steel-blue tag "THE REGIME" sits above the panel border. Title "576 OBS × 284 CONTROLS" in steel blue small-caps. A chalk-drawn mountain rises across the panel; on its slope, a tiny stick figure labelled "OLS" stumbles. A chalk gauge on the right shows a needle pinned at "p/n ≈ 0.49" with a danger arc beyond it. Three small annotation labels — "Violent / Property / Murder" — sit at three points on the slope. Callout in warm orange: "Too many controls, too few rows". Chalk arrow to Panel 3.

Panel 3 (top-right): A steel-blue tag "ONE LASSO" sits above the panel border. Title "PSL — TREATMENT PINNED" in steel blue small-caps. A chalk funnel filters a stream of candidate controls; one chalk star labelled "treatment d" is pinned in place inside the funnel's neck by an arrow labelled `penalty.factor = 0`. A small chalk variable labelled "predicts d, not y" rolls off the funnel's edge and falls toward the bottom corner. Annotation label: "1 LASSO". Callout in warm orange: "Insurance + lottery — blind to confounders". Chalk arrow down to Panel 4.

Panel 4 (bottom-left, Comparison metaphor): A steel-blue tag "TWO LASSOs" sits above the panel border. Title "DL — TAKE THE UNION" in steel blue small-caps. A chalk balance scale dominates the panel: the left "rigorous" pan holds a tidy teal stack of 8 controls; the right "CV" pan overflows with orange chalk bars for 143 controls, tilting dramatically downward. The equation `I_y ∪ I_d` floats above the fulcrum, and a dotted chalk "union" ring loops around both pans. Annotations "|I_y|=0" and "|I_d|=8" sit on the rigorous pan. Callout in large warm orange chalk: "143 of 284". Chalk arrow to Panel 5.

Panel 5 (bottom-centre): Title "SAME RECIPE, OPPOSITE ANSWER" in steel blue small-caps. A chalk flipped hourglass dominates the panel; the upper bulb contains a teal chalk bar labelled "−0.096" pointing leftward (crime-reducing), the lower bulb an orange chalk bar labelled "+0.019" pointing rightward (crime-increasing). A faint in-panel chalk formula `λ^rig = (2c σ̂ / √n) · Φ⁻¹(1 − γ / 2p)` floats behind the hourglass at ~80% opacity. Annotation labels "λ rigorous" (teal) and "λ.min" (orange) sit beside the two bulbs. Callout in large warm orange chalk: "−0.096 → +0.019". Chalk arrow to Panel 6.

Panel 6 (bottom-right): A steel-blue tag "REPLICATION" sits above the panel border. Title "8 OF 284 — PAPER MATCHED" in steel blue small-caps. A chalk clipboard lists three outcome rows — "violent / property / murder" — each pairing "ours vs paper" counts with a teal ✓ (six ticks total). Annotations "(0,8) → 8", "(3,9) → 12", "(0,9) → 9" sit beside the corresponding rows. A chalk note beneath reads "|I_y| + |I_d| = union". Callout in large warm orange chalk: "8 of 284". A small tag below the panel reads "Rigorous penalty wins."

Beyond the panel grid, the bottom-right margin holds two professor's notes in italic chalk-white text, each with its own hand-drawn chalk arrow. The first, upper, reads "G = 48 states. Cluster-robust SE inflates naïve HC1 by ~40% — without it we'd over-reject." with an arrow toward Panel 2. The second, lower, reads "|I_y|=0, |I_d|=8 — the fingerprint of when DL beats PSL: treatment predictable, outcome not." with an arrow toward Panel 4. The bottom-left margin holds a four-entry colour legend in small chalk text with coloured dots: "Recommended (rigorous DL): teal", "Key numbers / over-selection: warm orange", "Body text & sketches: chalk white", "Annotations & background formulas: muted gray".

The right margin holds a vertical sidebar legend in muted chalk gray titled "FIVE ESTIMATORS TRACKED". Below the title, two columns of entries (three in the left column, two in the right) list "First-diff", "OLS-full", "PSL", and on the right "DL-rigorous" and "DL-CV". A small teal tick mark sits next to "DL-rigorous". A short chalk note under the columns reads "tick = recommended for causal inference (n=576, p=284)".

Across the entire background, at 15-20% opacity in muted chalk gray (#b0a89a), five faint chalk fragments float behind the panels: the LASSO objective `β̂(λ) = argmin (1 / 2n)‖y − Xβ‖² + λ Σ|β_j|`; the rigorous penalty `λ^rig = (2c σ̂ / √n) Φ⁻¹(1 − γ / 2p)` with `c=1.1, γ=0.05`; the Frisch–Waugh–Lovell residualisation `α̂ = (d̃′ d̃)⁻¹ d̃′ ỹ` with `ỹ = M_X y`, `d̃ = M_X d`; a small DAG with three chalk nodes `x → d → y` plus a curved side arrow `x → y` labelled "confounder"; and the sandwich SE stub `V̂ = (X′X)⁻¹ · Σ_g X_g′ ê_g ê_g′ X_g · (X′X)⁻¹`. Chalk-dust particles cluster more densely near hand-drawn shapes; subtle smudge marks suggest passages that have been partially erased and rewritten.

This prompt generates the base image. The AI renders: the title banner with guiding question; the six panel titles; the six central sketch compositions (each with its main metaphor and the sub-sketches described); three BIG warm-orange numbers in Panels 4, 5, and 6; three coloured callouts in Panels 1, 2, and 3; two italic professor's notes with arrows; the four-entry colour legend; the right-margin "FIVE ESTIMATORS TRACKED" sidebar. Background formulas stay recessive at 15-20% opacity. All longer text — body sentences, full panel narratives, transition phrases — is provided in the panel reference data for manual overlay in an image editor. Keep on-image text minimal and large on the 1920x1080 canvas.

---

## Section B: Negative Prompt

Do not render: photorealistic textures, 3D shading, glossy surfaces, photographic lighting, gradient fills, vector-graphics smoothness, perfect circles, perfectly straight edges, watercolour, oil paint, anime style, cartoon faces, modern flat-design icons, infographic clip-art, stock-photo people, real photographs of statisticians or chalkboards, real bar charts with numeric axis ticks and gridlines (Panel 4's overflowing CV pan must read as a chalk-tally heap, not a real bar chart), real scatterplots, coefficient paths with smooth curves and tick-labelled axes (the Panel 5 hourglass bars are chalk-style, not data-style), mathematical typesetting in serif fonts (LaTeX-style rendering — every formula must be in chalk strokes), brand logos, watermarks, dollar signs or currency symbols, emojis, neon colours, gradient backgrounds, dark-mode UI elements, computer-generated typography, sans-serif fonts, capital-only blocky text that looks computer-typed, hashtags, social-media UI, screenshots, copyright marks, multiple title banners, redundant text labels on every shape, footers, page numbers, dates. All whites should be warm/creamy chalk white (#f0ece2), never pure #ffffff. All lines should appear hand-drawn with varying weight and chalk texture.

---

## Section C: Condensed Prompt (~230 words)

1920x1080 dark-navy (#0e1545) chalkboard sketchnote. Steel-blue (#8bb8e0) small-caps two-line title: "DOUBLE LASSO FOR CAUSAL INFERENCE: / DOES ABORTION REDUCE CRIME?". Smaller steel-blue subtitle: "Disciplined Selection: 8 of 284 Beats the Kitchen Sink". Chalk-white italic guiding question: "Do you really need all 284 controls?"

3x2 grid of 6 panels, steel-blue rounded borders, warm-orange (#e8956a) circled numerals. Arrows 1→2→3, down to 4, then 4→5→6. Right-margin sidebar "FIVE ESTIMATORS TRACKED": First-diff / OLS-full / PSL / DL-rigorous (✓) / DL-CV.

P1 "ALL 284 CONTROLS?": magnifying glass over bloated "+2.34", crossed-out baseline "−0.20 / −0.15 / −0.11", cracked `(X′X)⁻¹`. Warm-orange "Murder jumps +234%".

P2 (tag "THE REGIME") "576 OBS × 284 CONTROLS": chalk mountain, OLS stick figure stumbling, gauge "p/n ≈ 0.49" in the danger arc. Warm-orange "Too many controls, too few rows".

P3 (tag "ONE LASSO") "PSL — TREATMENT PINNED": funnel, treatment-star pinned by `penalty.factor = 0`, dropped confounder labelled "predicts d, not y" rolling off. Warm-orange "Insurance + lottery".

P4 (Comparison, tag "TWO LASSOs") "DL — TAKE THE UNION": balance scale, teal stack of 8 (rigorous) vs orange overflow of 143 (CV), `I_y ∪ I_d` over fulcrum, dotted "union" ring. BIG "143 of 284".

P5 "SAME RECIPE, OPPOSITE ANSWER": flipped hourglass, teal "−0.096" bar above, orange "+0.019" bar below, faint `λ^rig` formula. BIG "−0.096 → +0.019".

P6 (tag "REPLICATION") "8 OF 284 — PAPER MATCHED": clipboard, three outcome rows, six teal ✓ ticks. BIG "8 of 284".

Faint gray 15-20% background: LASSO objective, rigorous penalty, FWL, x→d→y DAG, sandwich SE. Two professor's notes; four-entry colour legend. Chalk dust, smudges. No precise charts, no gradients, no photorealism.

---

## Section D: Panel Reference Data (for manual text overlay)

### Panel 1 — ALL 284 CONTROLS?

- **Position**: row 1, column 1 (top-left).
- **Dramatic function**: Hook.
- **Story beat**: "Just add all 284 controls? Murder jumps +234% — a numerical artefact, not a causal effect."
- **Callout**: "Murder jumps +234%" (warm orange).
- **Key number**: +2.34 (murder coefficient from kitchen-sink OLS) — the absurd output of throwing every available control into a single OLS.
- **Central sketch**: magnifying glass over a bloated chalk "+2.34" with question mark; below, a crossed-out tally of the no-controls baselines "−0.20 / −0.15 / −0.11"; a cracked `(X′X)⁻¹` fragment floats in-panel.
- **Body sentences** (for manual overlay):
  - Post §5 reports the kitchen-sink OLS output: α̂ = +0.014 for violent crime (flips sign), −0.195 for property crime, **+2.34** for murder — i.e. a unit increase in the differenced abortion rate would *raise* murder by 234%.
  - The procedure runs only because `p = 284 < n = 576` keeps X′X technically invertible; R's `lm()` silently drops three exactly-collinear columns and presses on with 281.
  - The remaining 281 are close enough to collinear that `(X′X)⁻¹` blows up: variance is inflated for some coefficients and point estimates wander far from anything credible.
  - This is exactly the failure mode that motivates LASSO. "More controls" is not a fix when the controls are correlated and the sample is moderate — disciplined variable selection is the cure.
- **Transition to next**: "Why does adding controls break a regression that handled them fine in lower dimensions?"

### Panel 2 — 576 OBS × 284 CONTROLS

- **Position**: row 1, column 2 (top-centre).
- **Dramatic function**: Stakes.
- **Story beat**: "The post sits squarely in the small-sample, high-dimensional regime where classical OLS becomes unreliable."
- **Callout**: "Too many controls, too few rows" (warm orange).
- **Key number**: p/n ≈ 0.49 — the ratio that puts this analysis in the danger zone for plain OLS (post §12 decision tree treats p/n > 0.3 as the informal cutoff for high-dimensional methods).
- **Central sketch**: chalk mountain with a tiny stick figure labelled "OLS" stumbling on the slope; a gauge needle pinned at "p/n ≈ 0.49" with a danger arc; three annotation labels "Violent / Property / Murder" at three points on the slope.
- **Body sentences**:
  - Post §1 and §2 fix the dimensions: 48 U.S. states × 12 years = **576 observations** after first-differencing the 1985–1997 panel; **284 candidate controls** built from Donohue–Levitt's original 8 via squares, interactions, lagged levels, and time-trend products.
  - State fixed effects are absorbed by first-differencing; year fixed effects are absorbed by Frisch–Waugh–Lovell partialling in the prep step, so the analysis script sees no time dummies.
  - The headline regime is the one Fitzgerald et al. (2026) §3.2 calls "moderate-dimensional": OLS is feasible but unstable; LASSO is the natural discipline.
  - The three crime outcomes (violent, property, murder) inherit the same n and p — but murder has the smallest signal-to-noise ratio and punishes any procedure that over-selects.
- **Transition to next**: "If a single LASSO with the treatment forced in would handle this, why do we need anything fancier?"

### Panel 3 — PSL — TREATMENT PINNED

- **Position**: row 1, column 3 (top-right).
- **Dramatic function**: First Attempt (insufficient).
- **Story beat**: "Post-Structural LASSO is the simplest one-LASSO causal estimator — but it has a built-in causal-inference blind spot."
- **Callout**: "Insurance + lottery — blind to confounders" (warm orange).
- **Key number**: N/A (mechanism panel; the analogy from §1 carries it).
- **Central sketch**: a single chalk funnel filtering candidate controls; a chalk star labelled "treatment d" is pinned inside the funnel's neck by an arrow labelled `penalty.factor = 0`; a small chalk variable labelled "predicts d, not y" rolls off the funnel's lip toward the bottom corner.
- **Body sentences**:
  - Post §6 defines PSL: run one LASSO of `y` on `(d, X)` with `penalty.factor = c(0, rep(1, p))` so the treatment is exempt from shrinkage, then refit by plain OLS on the LASSO-selected support.
  - On the violent-crime equation, PSL keeps just 3 of 284 controls and returns α̂ = **−0.157** — within 0.005 of the no-controls baseline of −0.152.
  - The catch is the blind spot. LASSO picks controls that predict `y`; a variable strongly correlated with `d` but weakly with `y` is dropped — and confounders that move `d` move α̂ when omitted.
  - Belloni, Chernozhukov & Hansen (2014, ReStud) made exactly this point and proposed Double LASSO as the fix: run a *second* LASSO on the d-equation to catch the confounders the y-equation missed.
- **Transition to next**: "If one LASSO is not enough, what does running two of them actually buy us?"

### Panel 4 — DL — TAKE THE UNION

- **Position**: row 2, column 1 (bottom-left). Comparison metaphor required (balance scale).
- **Dramatic function**: Twist (the method's central move).
- **Story beat**: "Run two LASSOs — one for y, one for d — take the union of selected controls, refit post-OLS. Compared with the same recipe under CV: 8 vs 143 controls survive."
- **Callout**: "143 of 284" (warm orange) — **BIG NUMBER 1**.
- **Key number**: 143 — the count of controls surviving in the d-equation LASSO at CV's `lambda.min` on the violent-crime panel (post §10, "143 of 284 controls survive at the CV-optimal penalty").
- **Central sketch**: chalk balance scale; left pan "rigorous" holds a tidy teal stack of 8 controls, right pan "CV" overflows with orange chalk bars representing 143; small `I_y ∪ I_d` floats over the fulcrum; dotted chalk "union" ring loops around both pans; annotations "|I_y|=0" and "|I_d|=8" on the rigorous pan.
- **Body sentences**:
  - Post §7 defines DL: a LASSO of y on X gives selected index set `I_y`; a LASSO of d on X gives `I_d`; the final α̂ comes from `lm(y ~ d + X[, I_y ∪ I_d])` with state-clustered SE.
  - The intuition is Frisch–Waugh–Lovell: residualising y and d against the same controls recovers α̂. DL approximates that projection without committing to all 284 columns.
  - With the *rigorous* (Belloni et al. 2012) penalty `λ^rig = (2c σ̂ / √n) Φ⁻¹(1 − γ / 2p)`, c=1.1, γ=0.05, the violent-crime union has size 8.
  - With CV's `lambda.min` instead, the d-equation alone keeps **143 of 284** controls — a 17× over-selection that swallows the treatment variation.
  - The post-OLS refit step is load-bearing: LASSO's shrunken coefficients are biased toward zero by `O_p(λ / n)`, roughly 10-20% of α̂ at our `λ^rig` — running plain `lm()` on the selected support removes that bias.
- **Transition to next**: "If both flavours follow the same three-step recipe, how different can the final coefficients really be?"

### Panel 5 — SAME RECIPE, OPPOSITE ANSWER

- **Position**: row 2, column 2 (bottom-centre).
- **Dramatic function**: Surprise.
- **Story beat**: "Same three-step recipe, different penalty rule — and the violent-crime coefficient flips sign from −0.096 to +0.019."
- **Callout**: "−0.096 → +0.019" (warm orange) — **BIG NUMBER 2**.
- **Key number**: −0.096 (rigorous DL on violent crime, §7 table) → +0.019 (CV DL on violent crime, §10 table). Same data, same outcome, opposite sign.
- **Central sketch**: chalk flipped hourglass; upper bulb holds a teal chalk bar labelled "−0.096" pointing left (crime-reducing); lower bulb holds an orange chalk bar labelled "+0.019" pointing right (crime-increasing); faint in-panel formula `λ^rig = (2c σ̂ / √n) Φ⁻¹(1 − γ / 2p)` behind; annotations "λ rigorous" (teal) and "λ.min" (orange).
- **Body sentences**:
  - Post §10 contrasts the two penalty rules: rigorous DL gives α̂ = −0.096 [95% CI −0.197, +0.004] for violent crime; switching to CV's `lambda.min` flips it to α̂ = **+0.019**.
  - For murder the same switch multiplies the coefficient by seven (rigorous −0.166 vs CV **−1.11**) — still negative, but implausible.
  - The reason is mechanical: CV optimises *prediction* MSE, not causal-inference selection error. Keeping 143 marginally-predictive controls soaks up variation in `d`, leaving less for the post-OLS to identify α̂ on.
  - The rigorous penalty is tuned to a different asymptotic objective: keeping selection error small *relative to estimation error*. Bonferroni-style scaling via `Φ⁻¹(1 − γ / 2p)` is the load-bearing piece (Belloni et al. 2012).
  - Practical moral (§10 final paragraph): practitioners moving from supervised-ML training to causal inference often default to CV without thinking — and this is the post's headline reminder that the choice is not innocuous.
- **Transition to next**: "If rigorous is right, how well do its selections match the original paper — the test of whether we have actually reproduced the method?"

### Panel 6 — 8 OF 284 — PAPER MATCHED

- **Position**: row 2, column 3 (bottom-right).
- **Dramatic function**: Resolution.
- **Story beat**: "Rigorous DL keeps 8 of 284 controls for violent crime and matches Fitzgerald et al.'s Table 2 selection counts exactly across all three outcomes — 6 of 6 cells."
- **Callout**: "8 of 284" (warm orange) — **BIG NUMBER 3**.
- **Key number**: 8 — the size of the union `|I_y ∪ I_d|` for violent crime under rigorous DL (post §7 table). Also: 12 (property) and 9 (murder).
- **Central sketch**: chalk clipboard listing three outcome rows ("violent / property / murder"), each with a paired "ours vs paper" count and a teal ✓ next to each pair (six ticks); annotations "(0,8) → 8", "(3,9) → 12", "(0,9) → 9"; chalk note "|I_y| + |I_d| = union, all 3 outcomes"; small tag below "Rigorous penalty wins."
- **Body sentences**:
  - Post §14 audits the replication: for all three outcomes, `(|I_y|, |I_d|)` matches the paper exactly — violent (0, 8), property (3, 9), murder (0, 9). **Six of six** selection-count cells.
  - Point estimates agree to within 0.04 on the largest absolute gap (murder, −0.166 vs paper −0.125) and within 0.01 on violent and property crime — well inside the tolerance set by the random fold assignment in any LASSO with CV components.
  - This matters because LASSO selections are an *empirical* fingerprint of the method's behaviour. Two implementations agreeing on the support is stronger evidence of correct execution than agreement on a single coefficient.
  - Post §9: the asymmetry `|I_y| = 0, |I_d| = 8` is the textbook fingerprint of "DL helps most when treatment is well-predicted from X but the outcome is not" (Fitzgerald et al. 2026, footnote 4).
  - Decision rule for a fresh dataset (post §12 flowchart): if `p ≥ n` or `p / n > 0.3` *and* you need causal inference rather than prediction, reach for **DL with the rigorous penalty** — not CV, not PSL alone.
- **Transition to next**: end of arc.

---

### Story Spine

> Double LASSO with the rigorous penalty reveals that disciplined variable selection rescues the abortion–crime headline by showing that 8 carefully chosen controls do the work that 284 unconstrained cannot, challenging the assumption that adding more controls — or letting cross-validation pick them — always sharpens a causal estimate.

### Five Estimators Tracked

A compact reference matching the right-margin sidebar in the image. The single tick marks the estimator the post recommends for causal inference at n=576, p=284.

- **First-difference OLS**: original Donohue–Levitt (1993) specification with no controls. Violent crime α̂ = −0.152, property −0.108, murder −0.204. The baseline target every other method should land near.
- **OLS-full**: all 284 controls, no shrinkage. Violent +0.014 (sign-flip), property −0.195, **murder +2.34** (the absurd output of the kitchen-sink regression).
- **PSL** (Post-Structural LASSO): one CV-LASSO with the treatment forced in. Violent −0.157, property −0.068, murder −0.206 — sensible but causally fragile (the y-equation alone can drop strong d-side confounders).
- **DL-rigorous** ✓ (post-OLS on `I_y ∪ I_d`, `hdm::rlasso` penalty): violent −0.096 (union size 8), property −0.031 (union size 12), murder −0.166 (union size 9). Matches Fitzgerald et al.'s Table 2 selection counts on all three outcomes.
- **DL-CV** (post-OLS on `I_y ∪ I_d`, `cv.glmnet` `lambda.min`): violent **+0.019** (union size 150, sign flip), property −0.178 (109), murder **−1.11** (161). Demonstrates how CV's prediction-MSE objective collides with causal-inference selection.

### Three Concepts (Section D reference)

- **Penalty rule (rigorous vs CV)** — Rigorous: theory-driven Bonferroni-style penalty `λ^rig = (2c σ̂ / √n) Φ⁻¹(1 − γ / 2p)`. CV: data-driven `lambda.min` from k-fold cross-validation. Different objectives (selection-error control vs prediction MSE), different answers (8 vs 143 controls in this post's d-equation).
- **Selection asymmetry (|I_y| vs |I_d|)** — `|I_y| = 0, |I_d| = 8` for violent crime is the fingerprint of the regime where DL most outperforms PSL (Fitzgerald et al. footnote 4): the treatment is well-predicted from controls but the outcome is not, so a one-LASSO procedure on y misses the confounders that move d.
- **Post-OLS refit** — LASSO is used for *selection only*. The final α̂ comes from plain `lm(y ~ d + X[, U])` on the selected support — never from the LASSO coefficients themselves, which carry an `O_p(λ / n)` shrinkage bias (~10-20% of α̂ at our λ^rig).

### Key Equations on Screen

- **LASSO objective** (background, post §6): `β̂(λ) = argmin (1 / 2n)‖y − Xβ‖² + λ Σ|β_j|`. The L1 penalty is what enables exact-zero coefficients.
- **Rigorous penalty** (in-panel Panel 5 + background, post §7, Belloni et al. 2012): `λ^rig = (2c σ̂ / √n) · Φ⁻¹(1 − γ / 2p)`, with c = 1.1, γ = 0.05.
- **Frisch–Waugh–Lovell** (background, post §7): `α̂ = (d̃′ d̃)⁻¹ d̃′ ỹ` where `ỹ = M_X y`, `d̃ = M_X d`. Justifies residualising y and d against the same X.
- **PSL pinning** (in-panel Panel 3, post §6): `penalty.factor = c(0, rep(1, p))` — the slot at the treatment is zero so LASSO cannot shrink d away.
- **Union of selections** (in-panel Panel 4, post §7): `I_y ∪ I_d` — the support of the final post-OLS regression.
- **State-clustered sandwich** (background, post §8, Cameron & Miller 2015): `V̂ = ((n−1)/(n−k)) · (G/(G−1)) · (X′X)⁻¹ · Σ_g X_g′ ê_g ê_g′ X_g · (X′X)⁻¹`, with G = 48.

### Margin Elements

- **Professor's note 1** (bottom-right margin, italic chalk-white, arrow toward Panel 2): "G = 48 states. Cluster-robust SE inflates naïve HC1 by ~40% — without it we'd over-reject."
- **Professor's note 2** (bottom-right margin, italic chalk-white, lower, arrow toward Panel 4): "|I_y|=0, |I_d|=8 — the fingerprint of when DL beats PSL: treatment predictable, outcome not."
- **Colour legend** (bottom-left margin, small chalk text with coloured dots — four entries):
  - Recommended (rigorous DL): teal.
  - Key numbers / over-selection: warm orange.
  - Body text & sketches: chalk white.
  - Annotations & background formulas: muted gray.
- **Five-estimator sidebar** (right margin, vertical, muted chalk gray, titled "FIVE ESTIMATORS TRACKED"): two columns; left "First-diff / OLS-full / PSL"; right "DL-rigorous (✓) / DL-CV"; note beneath: "tick = recommended for causal inference (n=576, p=284)".
- **Background formulas** (15-20% opacity, muted chalk gray, floating behind the panel grid): LASSO objective, rigorous-penalty formula, FWL residualisation, x → d → y DAG with curved x → y arrow labelled "confounder", and the state-clustered sandwich SE.

### Message Inventory (promised vs delivered)

**ON-IMAGE (7 messages, all landed):**

1. Kitchen-sink OLS gives nonsense (murder +2.34) → Panel 1 sketch + callout.
2. Small-n / large-p regime (n=576, p=284, p/n ≈ 0.49) → Panel 2 sketch + gauge.
3. PSL = one LASSO, treatment forced in, causal blind spot → Panel 3 sketch + callout.
4. DL = two LASSOs, take the union, post-OLS → Panel 4 sketch + sub-equation.
5. Rigorous → CV flips the sign on violent crime → Panel 5 sketch + BIG callout.
6. CV keeps 143 of 284; rigorous keeps 8 → Panel 4 balance scale + BIG callout.
7. DL-rigorous matches the paper exactly (6/6 selection counts) → Panel 6 clipboard + BIG callout.

**MARGIN (2 messages):**

- State-clustered SE inflates ~40% over naïve HC1 → professor's note 1.
- |I_y|=0, |I_d|=8 is the empirical fingerprint of when DL beats PSL → professor's note 2.

**REFERENCE (3 messages, Section D body only):**

- Post-OLS step removes shrinkage bias (~10-20% on α̂) → Panel 4 body sentence 5.
- FWL projection justifies residualising y and d against the same controls → Panel 4 body sentence 2.
- The §16 exercises (seed sensitivity, c-parameter, Ridge swap) anchor the practical takeaways → reachable from the "Three Concepts" subsection.
