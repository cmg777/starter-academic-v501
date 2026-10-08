# Infographic Instructions — The Augmented Synthetic Control Method (Kansas)

Storyboard-first chalkboard infographic for the post `r_augsynth`. Four sections:
(A) full AI image prompt, (B) negative prompt, (C) condensed prompt, (D) panel
reference data for manual text overlay.

---

## Section A — Full Image Generation Prompt

Create a 1920x1080 landscape digital chalk illustration on a dark navy background (#0e1545). The style is academic chalkboard sketchnote: all lettering appears hand-drawn in chalk with slightly irregular strokes, chalk-dust particles float near text edges, and faint smudge marks add realism. The overall feel resembles a photograph of an expertly annotated university lecture chalkboard.

Compose a centered title banner across the top, then six panels arranged in a 3-column by 2-row grid below it. Draw each panel border as a chalk rounded rectangle in steel blue (#8bb8e0) with slightly uneven edges, and place a small circled numeral in warm orange (#e8956a) at each panel's top-left corner. Connect the panels with simple chalk arrows trailing dust particles in reading order: 1→2→3 across the top row, a vertical arrow from Panel 3 down to Panel 4, then 4→5→6 across the bottom row. Let generous navy space separate the panels so the dark background reads as a design element.

Use six chalk colors throughout. Navy blue (#0e1545) is the board. Chalk white (#f0ece2) carries body outlines and stick figures. Steel blue (#8bb8e0) writes every panel title and the main banner. Warm orange (#e8956a) is reserved for the three big anchor numbers and the panel numerals — the eye should jump to it. Teal (#00d4c8) marks the positive "fix" — the augmentation and the recovered effect. Muted chalk gray (#b0a89a) handles underlines, faint background formulas, and the professor's notes.

At the top center, write the title in large steel blue chalk small-caps: "DE-BIASING THE SYNTHETIC CONTROL." Below it, in smaller chalk-white italic, add the guiding question: "Did the 2012 Kansas tax cut really shrink the state's economy — and how would we know?"

Panel 1 (top-left): Title "A REAL-LIVE EXPERIMENT" in steel blue small-caps. A single chalk road forks into two, but only the left branch is drawn as a solid line while the right branch is faint and dotted — the path Kansas did not take. A small chalk capitol dome sits at the fork with a downward dollar arrow. Callout in warm orange: "One Kansas, no control group." Chalk arrow to Panel 2.

Panel 2 (top-center): Title "NO SINGLE TWIN" in steel blue small-caps. A chalk stick figure labeled "Kansas" stands beside a row of faint look-alike figures, none matching its height; a question mark hovers between them. Callout in warm orange: "Build a stand-in from many." Chalk arrow to Panel 3.

Panel 3 (top-right): Title "A WEIGHTED RECIPE" in steel blue small-caps. A chalk mixing bowl pours seven labeled droplets (SC, WA, TX, ND, WV, AK, KY) into one blended figure that overlaps the Kansas outline before a dashed vertical "2012" line. Callout in warm orange: "Classic SCM: a 7-state blend." Chalk arrow down to Panel 4.

Panel 4 (bottom-left): Title "THE HIDDEN GAP" in steel blue small-caps. A chalk balance scale: the left pan holds a wobbly "SCM fit" curve that fails to sit flat in the mid-2000s, the right pan holds a teal "Ridge fit" curve pulled straight; a chalk bracket marks the leftover tilt. Big warm orange callout: "⅓ was hidden bias." Chalk arrow to Panel 5.

Panel 5 (bottom-center): Title "DE-BIAS, THEN MEASURE" in steel blue small-caps. A teal magnet hovers below a chalk estimate arrow and pulls it further down past a zero line, deepening the gap; a small teal "+ ridge" tag sits beside it. Big warm orange callout: "−3.9% GDP per capita." Chalk arrow to Panel 6.

Panel 6 (bottom-right): Title "FOUR WAYS TO BE SURE" in steel blue small-caps. Four small chalk judges' gavels in a row, three resting and one striking, above a spaghetti tangle of faint gray placebo lines with one bold orange Kansas line dipping to the lower edge. Big warm orange callout: "5th of 50 placebos." No arrow (story ends).

In the bottom-right margin, outside the grid, add a professor's note in small muted-gray italic chalk with a hand-drawn arrow toward Panel 4: "Bad pre-2012 fit hides ~⅓ of the effect — augment, don't abandon." In the bottom-left margin, add a small chalk color legend with colored dots: orange dot "anchor numbers," teal dot "the augmentation / the fix," steel-blue dot "method names," gray dot "donor pool & noise."

Scatter chalk dust near text edges and panel borders, with subtle smudge marks where chalk was partially erased. Behind the panels at 15-20% opacity in muted gray, faintly draw topic formulas and diagram fragments: "ATT = Y₁ − Σ γᵢ Yᵢ", "γ̂ᵃᵘᵍ = γ̂ˢᶜᵐ + bias-fix", "min ‖X₁ − X₀′γ‖²  s.t. Σγ = 1, γ ≥ 0", "λ tunes extrapolation", a tiny sketch of a convex hull with one point just outside it, and a small four-bar "p-value" tally.

This prompt generates the base image. The AI should render clearly: the title banner, 6 panel titles in steel blue, 6 central sketch illustrations, 3 key numbers in large warm orange chalk, and 3 callout phrases. All other text — body sentences, annotations, transition phrases — is provided in the panel reference data for the user to overlay manually in an image editor. Keep text elements minimal and large for legibility.

---

## Section B — Negative Prompt

Do not render: photorealistic imagery, 3D renders, glossy gradients, or vector-flat corporate clipart. No precise statistical charts with numbered axis ticks, gridlines, or true-to-scale bars and scatterplots — use only hand-drawn chalk metaphors and uneven tally sketches. No neon or saturated colors outside the six-color chalk palette. No tiny unreadable text, no paragraphs of body text inside panels, no text written on the connector arrows. No emojis, no watermarks, no logos. Avoid clutter: at most one primary sketch per panel. Do not misspell the title or the state abbreviations. Do not fill the navy background — keep generous dark space between panels.

---

## Section C — Condensed Prompt (token-limited tools)

Chalkboard sketchnote, 1920x1080, dark navy (#0e1545), hand-drawn chalk. Title banner top-center, steel-blue small-caps: "DE-BIASING THE SYNTHETIC CONTROL"; italic chalk-white question beneath. Six chalk-bordered panels (steel blue #8bb8e0) in a 3x2 grid, orange (#e8956a) circled numbers, dust-trailed chalk arrows 1→2→3→4→5→6. Colors: white outlines, steel-blue titles, orange anchor numbers, teal for the "fix," gray for noise. Panel 1 "A REAL-LIVE EXPERIMENT": a forking road, only one branch solid; "One Kansas, no control group." Panel 2 "NO SINGLE TWIN": a stick figure beside mismatched look-alikes, question mark; "Build a stand-in from many." Panel 3 "A WEIGHTED RECIPE": a bowl blending seven labeled droplets into a Kansas-matching figure; orange "7-state blend." Panel 4 "THE HIDDEN GAP": a balance scale weighing a wobbly SCM fit against a straight teal Ridge fit; big orange "⅓ was hidden bias." Panel 5 "DE-BIAS, THEN MEASURE": a teal magnet pulling an estimate arrow below zero; big orange "−3.9% GDP per capita." Panel 6 "FOUR WAYS TO BE SURE": four gavels over gray placebo spaghetti with one bold orange Kansas line; big orange "5th of 50 placebos." Faint background formulas at 18% opacity. Chalk dust, smudges. No precise charts, no emojis, large legible text.

---

## Panel Reference Data

### Panel 1 — A Real-Live Experiment

- **Position**: Row 1, Column 1 (top-left)
- **Dramatic function**: Hook
- **Story beat**: "One state cut taxes — but there is no parallel Kansas to compare it to."
- **Callout**: "One Kansas, no control group."
- **Key number**: N/A (memorable phrase panel)
- **Central sketch**: A chalk road forks; the taken branch is solid, the untaken counterfactual branch is faint and dotted, with a small capitol dome at the fork.
- **Body sentences** (for manual overlay):
  - In May 2012 Kansas enacted one of the largest state income-tax cuts in recent U.S. history — Governor Brownback called it "a real-live experiment."
  - We cannot rerun history without the cut, so the effect must be inferred against a counterfactual we never observe.
- **Transition to next**: "If we cannot watch the other branch, we have to build it."

### Panel 2 — No Single Twin

- **Position**: Row 1, Column 2 (top-center)
- **Dramatic function**: Stakes
- **Story beat**: "No single state matches Kansas, so a comparison must be constructed."
- **Callout**: "Build a stand-in from many."
- **Key number**: N/A (memorable phrase panel)
- **Central sketch**: A labeled "Kansas" stick figure beside a row of faint mismatched look-alikes with a question mark hovering between them.
- **Body sentences** (for manual overlay):
  - Across 50 states from 1990 to 2016, Kansas sits mid-pack — no neighbour's path lies on top of it.
  - The synthetic control method builds a stand-in from a weighted blend of donor states instead of picking one twin.
- **Transition to next**: "Blend the donors so the stand-in matches Kansas before 2012."

### Panel 3 — A Weighted Recipe

- **Position**: Row 1, Column 3 (top-right)
- **Dramatic function**: First attempt
- **Story beat**: "Classic SCM mixes seven states into a convex recipe that matches the pre-2012 path."
- **Callout**: "Classic SCM: a 7-state blend."
- **Key number**: 7 donor states (contextual); classic-SCM effect −2.9%
- **Central sketch**: A chalk mixing bowl pours seven labeled droplets (SC, WA, TX, ND, WV, AK, KY) into one blended figure overlapping Kansas before a dashed "2012" line.
- **Body sentences** (for manual overlay):
  - Synthetic Kansas is a convex blend of just 7 of 49 donors — South Carolina 0.30, Washington 0.22, Texas 0.15 — the rest get exactly zero weight.
  - Classic SCM estimates a −2.9% post-2012 shortfall with a pre-fit imbalance of 0.083 (79.5% better than uniform weights).
- **Transition to next**: "But the convex recipe cannot match Kansas perfectly — and that gap matters."

### Panel 4 — The Hidden Gap

- **Position**: Row 2, Column 1 (bottom-left)
- **Dramatic function**: Twist (Comparison metaphor)
- **Story beat**: "Imperfect pre-2012 fit secretly biases the estimate — about a third of it."
- **Callout**: "⅓ was hidden bias."
- **Key number**: bias ≈ 0.011 ≈ one-third of the −0.040 effect
- **Central sketch**: A chalk balance scale weighs a wobbly "SCM fit" curve (failing in the mid-2000s) against a straight teal "Ridge fit" curve, with a bracket marking the leftover tilt.
- **Body sentences** (for manual overlay):
  - Classic SCM leaves a stubborn mid-2000s imbalance — a single quarter off by 0.043 log points, as large as the effect itself.
  - That imbalance hides bias: augsynth estimates it at 0.011, roughly one-third of the true effect, exactly the regime ASCM was built for.
- **Transition to next**: "Estimate that bias with a ridge model — then subtract it."

### Panel 5 — De-Bias, Then Measure

- **Position**: Row 2, Column 2 (bottom-center)
- **Dramatic function**: Surprise
- **Story beat**: "Ridge augmentation corrects the bias and the effect grows — without disturbing the recipe."
- **Callout**: "−3.9% GDP per capita."
- **Key number**: −0.040 log points ≈ −3.9%; pre-fit improves 0.083 → 0.062
- **Central sketch**: A teal magnet pulls an estimate arrow further below a zero line, with a small teal "+ ridge" tag beside it.
- **Body sentences** (for manual overlay):
  - Ridge ASCM fits an outcome model, predicts the leftover imbalance, and subtracts it — deepening the estimate from −2.9% to −3.9%.
  - It barely moves the weights (RMS change 0.015) yet improves pre-fit to 0.062 — better fit and a de-biased number for almost no extrapolation.
- **Transition to next**: "A bigger number is only convincing if it survives a significance test."

### Panel 6 — Four Ways to Be Sure

- **Position**: Row 2, Column 3 (bottom-right)
- **Dramatic function**: Resolution
- **Story beat**: "Four inference tools agree on the size but differ on significance — honest, borderline evidence."
- **Callout**: "5th of 50 placebos."
- **Key number**: permutation rank 5 of 50 (p = 0.10); jackknife+ CI [−0.058, −0.021] excludes zero
- **Central sketch**: Four chalk gavels (three resting, one striking) above a tangle of faint gray placebo lines with one bold orange Kansas line dipping to the lower edge.
- **Body sentences** (for manual overlay):
  - The same −0.040 estimate faces four tests: jackknife+ excludes zero, while conformal (p = 0.066), permutation (p = 0.10), and the leave-one-donor jackknife are borderline.
  - Reporting all four — rather than the friendliest one — is the honest verdict: a real but modest effect, strongest in 2013–2014.
- **Transition to next**: N/A (story resolves).

### Story Spine

> The Augmented Synthetic Control Method reveals that the 2012 Kansas tax cut lowered GDP per capita by roughly 4% — by estimating and subtracting the bias that an imperfect classic synthetic control quietly leaves behind — challenging the assumption that SCM's conservative estimate is the last word.

### Margin Elements

- **Professor's note 1**: "Bad pre-2012 fit hides ~⅓ of the effect — augment, don't abandon." — bottom-right margin, arrow toward Panel 4.
- **Color legend** (4 entries): orange = anchor numbers; teal = the augmentation / the fix; steel blue = method names; gray = donor pool & noise.
- **Background formulas** (6 fragments, 15-20% opacity): "ATT = Y₁ − Σ γᵢ Yᵢ"; "γ̂ᵃᵘᵍ = γ̂ˢᶜᵐ + bias-fix"; "min ‖X₁ − X₀′γ‖²  s.t. Σγ = 1, γ ≥ 0"; "λ tunes extrapolation"; a small convex-hull sketch with one point just outside; a four-bar p-value tally.

### Three BIG Numbers (warm orange anchors)

- **⅓ hidden bias** (Panel 4) — the share of the effect classic SCM misses.
- **−3.9%** (Panel 5) — the Ridge-ASCM estimate of the tax cut's effect on GDP per capita.
- **5th of 50** (Panel 6) — Kansas's rank in the placebo distribution (permutation p = 0.10).

### Message inventory

- **ON-IMAGE** (6): real-live experiment / no control group; no single twin → blend donors; classic SCM 7-state blend (−2.9%); imperfect fit hides ⅓ bias; ridge de-biases to −3.9%; four inference verdicts (rank 5/50).
- **MARGIN** (2): "augment, don't abandon" professor's note; color legend mapping teal = the fix.
- **REFERENCE** (Section D only): donor weights (SC 0.30, WA 0.22, …); λ = 0.079 chosen by CV; jackknife+ CI [−0.058, −0.021]; pre-fit 0.083 → 0.062.
