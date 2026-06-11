# Taming Dynamic Panels: From Nickell Bias to System GMM

## Section A: Full Image Generation Prompt

Create a 1920x1080 landscape digital chalk illustration on a dark navy background (#0e1545). The style is academic chalkboard sketchnote: all lettering appears hand-drawn in chalk with slightly irregular strokes, chalk-dust particles float near text edges, and faint smudge marks add realism. The overall feel resembles a photograph of an expertly annotated university lecture chalkboard.

The composition features a title banner centred at the top, six panels in a 3-column by 2-row grid below it, and a vertical sidebar in the right margin listing five estimators. Each panel has a chalk-drawn rounded-rectangle border in steel blue (#8bb8e0) with slightly uneven hand-drawn edges; panel numbers appear as small warm-orange (#e8956a) circled numerals in the top-left corner of each panel. Chalk arrows with faint dust particles connect the panels in reading order: 1 to 2 to 3 across the top row, a vertical arrow from Panel 3 down to Panel 4, then 4 to 5 to 6 across the bottom row. Generous dark navy space separates the panels — the background is a design element.

The colour system uses six chalk colours. Background navy blue #0e1545 reads as a real chalkboard. Body text and all sketch outlines are chalk white #f0ece2 — never pure white, always slightly warm and creamy. Steel blue #8bb8e0 marks panel titles, panel borders, and headers. Warm orange #e8956a is reserved for the three BIG numbers — the bracket [0.626, 0.962], the Hansen drift 0.035 to 0.235, and the headline 0.927 — plus bias warnings. Teal #00d4c8 marks the defensible system-GMM result and passing diagnostics. Muted chalk gray #b0a89a carries annotations, the right-margin sidebar, and the faint background formulas. Each panel uses at most three foreground colours.

The title banner sits above the panel grid, centred. The main title reads "TAMING DYNAMIC PANELS: FROM NICKELL BIAS TO SYSTEM GMM" in large steel-blue chalk small-caps. Beneath it, in smaller chalk-white italic, the guiding question reads: "How much of an employment shock survives into next year?"

Panel 1 (top-left): Title "THE ECHO PROBLEM" in steel blue small-caps. A chalk stick figure shouts into a hand-drawn canyon; three echo arcs bounce back, each fainter than the last, the strongest labelled "ρ = echo strength". A one-line chalk sub-equation sits inside the panel at about 80% opacity: `n_it = ρ·n_i,t−1 + α_i + ε_it`, with `α_i` circled in warm orange. Callout in warm orange: "The regressor is guilty by construction". Chalk arrow to Panel 2.

Panel 2 (top-centre): Title "TWO WRONG CLOCKS" in steel blue small-caps. Two chalk-drawn clocks side by side: the left labelled "OLS 0.962" with an upward arrow ("runs fast"), the right labelled "FE 0.626" with a downward arrow ("runs slow"); a chalk question mark inside a small bracket floats between them — the truth sits between the broken clocks. A sub-sketch beneath shows chalk tally marks labelled "140 firms, 1976–1984". Callout in large warm orange chalk: "Truth trapped in [0.626, 0.962]" (BIG number 1). Chalk arrow to Panel 3.

Panel 3 (top-right): Title "ONE WITNESS, NO VERDICT" in steel blue small-caps. A chalk courtroom witness stand with a single small stick figure on it, dwarfed by an enormous horizontal error-bar whisker stretching past both panel edges; a gray dashed vertical line crossing the whisker is labelled "unit root 1.0". Annotation labels: "AH-IV 1.233" at the whisker's centre dot and "CI width 1.87" along the bar. Callout in warm orange: "Consistent but useless". Chalk arrow down to Panel 4.

Panel 4 (bottom-left, Comparison metaphor): Title "RIPPLES VS WATERLINE" in steel blue small-caps. A vertical chalk divider splits the panel into two scenes. Left: a flat calm lake with barely visible ripples, labelled "Diff GMM 0.679 — 91 instruments, hugs the floor" in warm orange. Right: a shoreline rock with bold horizontal waterline marks, labelled "Sys GMM 0.927 — 32 collapsed" in teal. A chalk note under the lake reads "every printed test passes". Callout in warm orange: "Passes every test, hugs the wrong bound". Chalk arrow to Panel 5.

Panel 5 (bottom-centre): Title "THE OVERWHELMED JUDGE" in steel blue small-caps. A chalk judge's bench with a gavel faces a swelling crowd of identical stick-figure witnesses packed shoulder to shoulder, the crowd visibly growing toward the right edge. Two annotation labels: "68 → 95 → 113 instruments" above the crowd and "ceiling: 140 firms" on a dashed chalk line at the right. Callout in large warm orange chalk: "Hansen p: 0.035 → 0.235, same model" (BIG number 2). Chalk arrow to Panel 6.

Panel 6 (bottom-right): Title "TRUST THE WORKFLOW" in steel blue small-caps. A large chalk clipboard holding a checklist with five teal tick marks beside short hand-written items: "bracket", "AR(2)", "Hansen", "collapse", "replicate". A small teal flag at the clipboard's corner reads "exact replication". Callout in large warm orange chalk: "ρ = 0.927 — 93% survives a year" (BIG number 3).

Beyond the panel grid, the bottom-right margin holds two professor's notes in smaller italic chalk-white text, stacked vertically, each with its own hand-drawn chalk arrow. The first reads "AR(1) must reject; AR(2) must not. Read p = 0.000 on AR(1) as good news!" with an arrow toward Panel 4. The second, lower, reads "A Hansen p near 1 is an overwhelmed test, not a valid model." with an arrow toward Panel 5. The bottom-left margin holds a four-entry colour legend in small chalk text with colour dots: a chalk-white dot labelled "naive estimators", a warm-orange dot labelled "bias / warning", a teal dot labelled "defensible estimate", and a muted-gray dot labelled "diagnostics".

The right margin holds a vertical sidebar in muted chalk gray titled "FIVE ESTIMATORS, ONE ρ". Below the title, a single column of five chalk entries: "OLS 0.962", "FE 0.626", "AH-IV 1.233", "Diff GMM 0.679", "Sys GMM 0.927" — with a small teal tick mark next to "Sys GMM 0.927" only. A short chalk note under the column reads "tick = inside the bracket, clean diagnostics".

Across the background, at 15-20% opacity in muted chalk gray (#b0a89a), six faint chalk fragments float behind the panels: the model `n_it = ρ·n_i,t−1 + β·w_it + γ·k_it + α_i + δ_t + ε_it`; the difference-GMM moments `E[n_i,t−s · Δε_it] = 0, s ≥ 2`; the system-GMM moments `E[Δn_i,t−1(α_i + ε_it)] = 0`; the bias note `Nickell bias ≈ −1/T`; the persistence arithmetic `0.927^5 ≈ 0.68`; and a small timeline diagram of three chalk dots labelled "t−2, t−1, t" with a curved arrow from the t−2 dot to a Δ symbol over the t dot. Chalk-dust particles cluster near text edges and panel borders, and subtle smudge marks suggest passages partially erased and rewritten.

This prompt generates the base image. The AI should render clearly: the title banner with its guiding question, 6 panel titles in steel blue, 6 central sketch compositions with the sub-elements described, 3 key numbers in large warm orange chalk ([0.626, 0.962]; 0.035 → 0.235; 0.927 / 93%), 3 callout phrases, the two italic professor's notes with arrows, the four-entry colour legend, and the right-margin estimator sidebar. All other text — body sentences, annotations, transition phrases — is provided in the panel reference data for the user to overlay manually in an image editor. Keep text elements minimal and large for legibility.

---

## Section B: Negative Prompt

Do not include: photorealistic rendering, glossy or reflective surfaces, drop shadows, gradient color fills, emojis or Unicode symbols, computer-generated sans-serif typography, neon glow effects, 3D perspective or depth, watermarks, stock photo elements, smooth vector curves, pure white (#ffffff) — all whites should be warm/creamy chalk white (#f0ece2). All lines should appear hand-drawn with varying weight and chalk texture. Do not use clean digital borders or perfectly straight lines. Do not render precise statistical charts, axis labels, numeric tick marks, or data tables — Panel 3's error bar must be a loose chalk whisker, not a plotted confidence interval, and Panel 5's growing crowd must not become a bar chart. Do not attempt to render more than 3 text elements per panel. Do not include photographs of actual chalkboards, classrooms, courtrooms, or factories. Do not draw real clock faces with readable numerals or real mathematical typesetting in serif fonts — every formula must look chalk-written.

---

## Section C: Condensed Prompt (~250 words)

Chalkboard infographic, 1920x1080 landscape, navy background (#0e1545). Academic chalk sketchnote, hand-lettered, chalk dust, faint formula textures. Six panels in 3x2 grid, steel blue (#8bb8e0) chalk borders, chalk-arrow connectors. Title: "TAMING DYNAMIC PANELS: FROM NICKELL BIAS TO SYSTEM GMM" in steel blue small-caps; italic chalk-white (#f0ece2) subtitle "How much of an employment shock survives into next year?". Colors: chalk white body, warm orange (#e8956a) key numbers, teal (#00d4c8) defensible results, muted gray (#b0a89a) annotations. P1 (top-left): "THE ECHO PROBLEM" — figure shouting into canyon, fading echo arcs, equation with α_i circled; orange "The regressor is guilty by construction". P2: "TWO WRONG CLOCKS" — fast clock "OLS 0.962" vs slow clock "FE 0.626", question mark between; BIG orange "Truth trapped in [0.626, 0.962]". P3: "ONE WITNESS, NO VERDICT" — tiny witness stand under enormous chalk whisker "AH-IV 1.233, CI width 1.87"; orange "Consistent but useless". P4: "RIPPLES VS WATERLINE" — split scene, calm lake "Diff GMM 0.679" (orange) vs shoreline waterline marks "Sys GMM 0.927" (teal); orange "Passes every test, hugs the wrong bound". P5: "THE OVERWHELMED JUDGE" — judge's bench facing swelling identical-witness crowd, "68 → 95 → 113 instruments"; BIG orange "Hansen p: 0.035 → 0.235, same model". P6: "TRUST THE WORKFLOW" — clipboard, five teal ticks; BIG orange "ρ = 0.927 — 93% survives a year". Two professor's notes bottom-right; four-dot legend bottom-left; right sidebar "FIVE ESTIMATORS, ONE ρ", tick on Sys GMM only. Faint formulas at 15% opacity. No photorealism, gradients, precise charts, or pure white.

---

## Section D: Panel Reference Data (for manual text overlay)

### Panel 1 — THE ECHO PROBLEM

- **Position**: row 1, column 1 (top-left)
- **Dramatic function**: Hook
- **Story beat**: "This year's employment depends on last year's — and that one fact breaks every ordinary panel method."
- **Callout**: "The regressor is guilty by construction" (warm orange)
- **Key number**: N/A (concept Hook)
- **Central sketch**: stick figure shouting into a chalk canyon with fading echo arcs labelled "ρ = echo strength"; in-panel sub-equation `n_it = ρ·n_i,t−1 + α_i + ε_it` with `α_i` circled in warm orange
- **Body sentences** (for manual overlay):
  - ρ is the echo strength of the labor market: at ρ = 0.6 a shock fades within a couple of years; at ρ = 0.93 it is still audible a decade later (post Section 1).
  - The model puts a lagged dependent variable on the right-hand side while the firm effect α_i sits in the error — so the regressor is correlated with the error by construction (Section 1).
  - The data make α_i unavoidable: the between-firm SD of log employment (1.339) is seven times the within-firm SD (0.195) — firms orbit their own levels (Section 3).
  - Same regression, same data: the estimator choice will imply shock half-lives of 1.5, 9, or 18 years (Sections 5 and 13).
- **Transition to next**: "And the stakes are visible the moment we run the two workhorse estimators."

### Panel 2 — TWO WRONG CLOCKS

- **Position**: row 1, column 2 (top-centre)
- **Dramatic function**: Stakes
- **Story beat**: "Pooled OLS and fixed effects fail in opposite, theoretically known directions — so the two wrong answers bracket the truth."
- **Callout**: "Truth trapped in [0.626, 0.962]" (warm orange) — **BIG NUMBER 1**
- **Key number**: the Bond (2002) bracket [0.626, 0.962] from ρ̂_OLS = 0.9617 (SE 0.0084) and ρ̂_FE = 0.6262 (SE 0.0515)
- **Central sketch**: two chalk wall clocks — fast clock "OLS 0.962" (up arrow), slow clock "FE 0.626" (down arrow), question mark in a bracket between them; sub-sketch of tally marks "140 firms, 1976–1984"
- **Body sentences**:
  - Pooled OLS leaves α_i in the error: the lag absorbs the firm effect and ρ̂ = 0.9617 is biased up toward a unit root (Section 5).
  - Fixed effects demeans with an average that contains future shocks: Nickell bias of order 1/T drags ρ̂ down to 0.6262 with T ≈ 7–9 (Section 5).
  - The gap is 0.336 — half-life stories of 18 years versus 1.5 years from the same regression (Section 5).
  - Both bias directions are known from theory, so any consistent estimator must land inside [0.626, 0.962] — and the two clustered CIs do not even overlap, so the bracket is sharp (Section 5).
  - The panel: 1,031 firm-years on 140 UK manufacturing firms, 1976–1984, unbalanced (Section 3).
- **Transition to next**: "But the first consistent estimator turns out to be useless in practice."

### Panel 3 — ONE WITNESS, NO VERDICT

- **Position**: row 1, column 3 (top-right)
- **Dramatic function**: First attempt
- **Story beat**: "Anderson-Hsiao IV is consistent in theory and hopeless in practice — one instrument cannot pin down a persistent series."
- **Callout**: "Consistent but useless" (warm orange)
- **Key number**: ρ̂_AH = 1.2327 (SE 0.4782), 95% CI [0.296, 2.170], width 1.87
- **Central sketch**: a single small stick figure on a courtroom witness stand, dwarfed by an enormous chalk error-bar whisker crossing the dashed "unit root 1.0" line; labels "AH-IV 1.233" and "CI width 1.87"
- **Body sentences**:
  - First-differencing kills α_i exactly; instrumenting Δn_i,t−1 with the level n_i,t−2 restores consistency (Section 6).
  - But with exactly one instrument, ρ̂ = 1.2327 lands above the unit root, outside the bracket, with a standard error of 0.4782 — nearly 60 times the OLS standard error (Section 6).
  - The 1.87-wide CI contains the entire bracket, the unit root, and explosive dynamics all at once (Section 6).
  - The fix is not a better witness but more of them: if n_i,t−2 is valid, so is every deeper lag — the doorway to GMM (Section 6).
- **Transition to next**: "The turn: GMM brings 91 witnesses — and still gives a suspect answer."

### Panel 4 — RIPPLES VS WATERLINE

- **Position**: row 2, column 1 (bottom-left). Comparison metaphor (split-scene, side-by-side).
- **Dramatic function**: Twist
- **Story beat**: "Difference GMM passes every printed test yet hugs the biased FE bound — weak instruments that only system GMM's levels equation repairs."
- **Callout**: "Passes every test, hugs the wrong bound" (warm orange)
- **Key number**: Diff GMM ρ̂ = 0.6788 (SE 0.0891, 91 instruments) vs Sys GMM ρ̂ = 0.9270 (SE 0.0785, 32 collapsed instruments)
- **Central sketch**: split scene with a chalk divider — calm lake with faint ripples ("Diff GMM 0.679 — 91 instruments, hugs the floor", orange) versus a shoreline rock with bold waterline marks ("Sys GMM 0.927 — 32 collapsed", teal); note "every printed test passes" under the lake
- **Body sentences**:
  - Arellano-Bond difference GMM instruments the differenced equation with 91 lagged levels: ρ̂ = 0.6788, Hansen p = 0.211, AR(2) p = 0.866 — every formal diagnostic passes (Section 7).
  - Yet the estimate sits only 0.053 above the FE floor, within one standard error of it — Bond's informal diagnostic failing loudly (Section 7).
  - When ρ is near 1, lagged levels barely predict future differences: like reading a calm lake's ripples, all 91 instruments are individually weak (Sections 7–8).
  - Blundell-Bond system GMM adds the levels equation, instrumented by lagged differences — the waterline marks that actually pin the answer down — at the price of one new assumption: mean stationarity (Section 8).
  - The move from 0.679 to 0.927 is the entire twist: an estimator that passes every test can still be wrong, and no printed line says so (Sections 7–8, 12).
- **Transition to next**: "The surprise is that the test we would use to defend the winner bends too."

### Panel 5 — THE OVERWHELMED JUDGE

- **Position**: row 2, column 2 (bottom-centre)
- **Dramatic function**: Surprise
- **Story beat**: "The Hansen p-value responds to the instrument count, not just instrument validity — more witnesses, weaker verdicts."
- **Callout**: "Hansen p: 0.035 → 0.235, same model" (warm orange) — **BIG NUMBER 2**
- **Key number**: uncollapsed Hansen drift 0.035 → 0.186 → 0.235 as instruments climb 68 → 95 → 113 (ceiling: 140 firms), while ρ̂ stays in [0.921, 0.956]
- **Central sketch**: judge's bench with gavel facing a swelling crowd of identical stick-figure witnesses; labels "68 → 95 → 113 instruments" and "ceiling: 140 firms"
- **Body sentences**:
  - The proliferation grid re-runs the identical system-GMM model six times, varying only lag window and collapsing (Section 10).
  - The point estimate barely moves — all six cells land in [0.921, 0.956] — but the Hansen p-value drifts 0.035 → 0.186 → 0.235 as uncollapsed instruments pile up (Section 10).
  - The drift's endpoint is the notorious "Hansen p = 1.000" red flag: an overwhelmed test, not a valid model (Sections 9–10).
  - Proliferation distorts both tails: the uncollapsed 2:3 spec is rejected (p = 0.0348) while its collapsed twin passes (p = 0.0957) — same model, opposite verdicts (Section 10).
  - The uncollapsed SE of 0.0274 versus the collapsed 0.0785 is too-good-to-be-true precision — overfitting flatters the SE and disarms the test simultaneously (Section 10).
- **Transition to next**: "So the lesson is a workflow, not a number on a printout."

### Panel 6 — TRUST THE WORKFLOW

- **Position**: row 2, column 3 (bottom-right)
- **Dramatic function**: Resolution
- **Story beat**: "System GMM's 0.927 is the defensible answer — identified by the bracket, the diagnostics, the collapse rule, and a digit-for-digit replication, not by any single p-value."
- **Callout**: "ρ = 0.927 — 93% survives a year" (warm orange) — **BIG NUMBER 3**
- **Key number**: ρ̂ = 0.9270 (SE 0.0785), AR(2) p = 0.994, Hansen p = 0.462, 32 collapsed instruments; roughly 93 percent of an employment shock survives into the next year (half-life ≈ 9 years; 0.927^5 ≈ 0.68)
- **Central sketch**: chalk clipboard checklist with five teal tick marks — "bracket", "AR(2)", "Hansen", "collapse", "replicate" — and a teal corner flag "exact replication"
- **Body sentences**:
  - The headline: ρ̂ = 0.9270 (SE 0.0785), inside the bracket's upper half, AR(2) p = 0.994, Hansen p = 0.462, 32 collapsed instruments against 140 firms (Section 8).
  - Substantively, about 93 percent of an employment shock survives into the next year — an echo half-life of roughly nine years, versus the 1.5 years fixed effects would have claimed (Sections 8 and 13).
  - Honest caveat: the 95% CI [0.773, 1.081] includes 1.0, so a unit root cannot be rejected — the deliverable is the point estimate and its lower bound (Section 8).
  - The toolchain replicates the published pydynpd benchmark digit for digit: L1.n = 0.2710675, Hansen χ² = 32.666, 42 instruments — Exact match: True (Section 11).
  - Nothing on any single printed line separates the winner from the losers — only the bracket logic, the weak-instrument reasoning, the proliferation experiment, and the replication check do (Section 12).
- **Transition to next**: end of arc.

---

### Story Spine

> The dynamic-panel estimator ladder reveals that only the full bracket-plus-diagnostics workflow — not any printed p-value — identifies employment persistence at 0.927, by showing pooled OLS and fixed effects failing in opposite known directions and difference GMM passing every formal test while hugging the biased bound, challenging the assumption that a clean regression table can be trusted.

### Message Inventory (Step 0.6 record)

**ON-IMAGE (7 — layered-panel mode):**

1. A lagged dependent variable plus a firm effect breaks both workhorses — OLS up to 0.962, FE down to 0.626 (Panels 1–2).
2. Two known-sign biases bracket the truth: [0.626, 0.962] (Panel 2).
3. Anderson-Hsiao IV is consistent but useless — 1.233 with CI width 1.87 (Panel 3).
4. Difference GMM passes every printed test yet hugs the FE bound at 0.679 with 91 weak instruments (Panel 4).
5. System GMM with 32 collapsed instruments is the defensible headline: 0.927 (SE 0.079), AR(2) p = 0.994, Hansen p = 0.462 (Panels 4 and 6).
6. The Hansen p-value bends to instrument count, not validity — 0.035 → 0.235 on the identical model; p near 1 is a red flag (Panel 5).
7. Roughly 93 percent of an employment shock survives into the next year — half-life about nine years (Panel 6).

**MARGIN (3):**

8. AR(1) must reject; AR(2) must not — the diagnostics are routinely read backwards (professor's note 1).
9. A Hansen p near 1 signals an overwhelmed test, not valid instruments (professor's note 2).
10. Five estimators, one parameter — the full ladder with only system GMM earning the tick (right-margin sidebar).

**REFERENCE (4):**

11. Between-firm SD of log employment (1.339) is seven times the within-firm SD (0.195) — α_i dominates the data.
12. The headline CI [0.773, 1.081] includes the unit root — "employment is stationary" is not a defensible claim.
13. Exact replication of the pydynpd benchmark: L1.n = 0.2710675, Hansen χ² = 32.666, 42 instruments.
14. Every lag burns data: 1,031 rows → 891 → 751 → 611 across specifications.

### Five Estimators Tracked (right-margin sidebar reference)

A compact reference matching the sidebar in the image. The tick marks the one estimator that lands inside the bracket with clean diagnostics.

- **Pooled OLS**: ρ̂ = 0.9617 (SE 0.0084) — biased up; L1.n absorbs the omitted firm effect; defines the bracket's ceiling (Section 5).
- **Fixed effects**: ρ̂ = 0.6262 (SE 0.0515) — biased down by Nickell bias of order 1/T with T ≈ 7–9; defines the bracket's floor (Section 5).
- **Anderson-Hsiao IV**: ρ̂ = 1.2327 (SE 0.4782) — consistent but useless; one instrument, CI width 1.87, outside the bracket (Section 6).
- **Difference GMM (two-step)**: ρ̂ = 0.6788 (SE 0.0891), 91 instruments — passes Hansen (p = 0.211) and AR(2) (p = 0.866) yet hugs the FE floor: weak instruments (Section 7).
- **System GMM (two-step, collapsed)** ✓: ρ̂ = 0.9270 (SE 0.0785), 32 instruments — inside the bracket's upper half, AR(2) p = 0.994, Hansen p = 0.462 (Section 8).

### Reading the Three Diagnostics (Panel 4–5 reference)

- **AR(1) in differences** — must reject. Differencing makes adjacent errors share a term, so rejection (here z = −4.49, p = 0.000) is mechanical good news (Section 9).
- **AR(2) in differences** — must not reject. It is the test that validates the t−2 instruments; the headline's p = 0.994 could hardly be cleaner (Section 9).
- **Hansen J** — two-tailed in spirit. Below 0.05 means invalid-looking instruments; drifting toward 1 as instruments accumulate means an overwhelmed test. The headline's 0.462 with 32 instruments is the comfortable middle (Sections 9–10).

### Key Equations on Screen

- **`n_it = ρ·n_i,t−1 + α_i + ε_it`** (in-panel, Panel 1; full version with w, k, δ_t in background — post Section 1): the dynamic labor-demand model whose lagged dependent variable plus fixed effect creates the whole problem.
- **`E[n_i,t−s · Δε_it] = 0, s ≥ 2`** (background — Section 7): the Arellano-Bond moment conditions; every level dated t−2 or earlier instruments the differenced equation.
- **`E[Δn_i,t−1(α_i + ε_it)] = 0`** (background — Section 8): the Blundell-Bond levels moments bought with the mean-stationarity assumption.
- **`Nickell bias ≈ −1/T`** (background — Section 5): why the within estimator's bias is large at T ≈ 7–9 and does not shrink with more firms.
- **`0.927^5 ≈ 0.68`** (background — Sections 1 and 8): the persistence arithmetic — two-thirds of a shock still present after five years.

### Margin Elements

- **Professor's note 1**: "AR(1) must reject; AR(2) must not. Read p = 0.000 on AR(1) as good news!" — positioned bottom-right margin, italic chalk white, with arrow toward Panel 4
- **Professor's note 2**: "A Hansen p near 1 is an overwhelmed test, not a valid model." — positioned bottom-right margin below note 1, with arrow toward Panel 5
- **Color legend** (4 entries): naive estimators: chalk white, bias / warning: warm orange, defensible estimate: teal, diagnostics: muted gray — bottom-left margin
- **Right-margin sidebar**: "FIVE ESTIMATORS, ONE ρ" — OLS 0.962 / FE 0.626 / AH-IV 1.233 / Diff GMM 0.679 / Sys GMM 0.927 ✓, with note "tick = inside the bracket, clean diagnostics"
- **Background formulas** (6 fragments): the full model equation, the difference-GMM moments, the system-GMM moments, the Nickell bias note, 0.927^5 ≈ 0.68, and the t−2 → Δt timeline diagram — at 15-20% opacity
