# Infographic Instructions: Six Ways to Evaluate a Policy

## Section A — Full Image Generation Prompt

Create a 1920x1080 landscape digital chalk illustration on a dark navy background (#0e1545). The style is academic chalkboard sketchnote: all lettering appears hand-drawn in chalk with slightly irregular strokes, chalk-dust particles float near text edges, and faint smudge marks add realism. The overall feel resembles a photograph of an expertly annotated university lecture chalkboard.

The composition centres on a title banner running across the top of the board, with six panels arranged below in a 3-column by 2-row grid. Each panel is enclosed by a chalk-drawn rounded rectangle in steel blue (#8bb8e0) with slightly uneven edges and small breaks in the line where the chalk skipped. A small circled numeral in warm orange (#e8956a) sits in the top-left corner of each panel. Simple chalk arrows with trailing dust particles connect the panels in reading order — left-to-right across the top row (1 → 2 → 3), a vertical arrow dropping from Panel 3 to Panel 4, then left-to-right across the bottom row (4 → 5 → 6). The navy background between panels is part of the design and should breathe; do not fill the gaps with extra ornamentation.

The chalkboard palette is built from six fixed colours, each carrying a specific meaning. The dark navy blue (#0e1545) is the board itself. Chalk white (#f0ece2) is the workhorse for body text, sketch outlines, and the title-banner subtitle. Bright steel blue (#8bb8e0) is reserved for panel titles, the main title text, panel borders, and the "trusted method" series in Panel 6's forest sketch. Warm orange (#e8956a) is the accent colour for the three BIG numbers, panel numerals, and the policy-threshold dashed line in Panels 1 and 4. Teal (#00d4c8) is the positive-emphasis colour for the consensus check-mark in Panel 6 and for the "robust" tag in the colour legend. Muted chalk gray (#b0a89a) is used for background formulas, the smudge texture, and for the "outlier" tags in Panel 5.

The title banner across the top centre reads SIX WAYS TO EVALUATE A POLICY in large steel-blue chalk small-caps, with the guiding question *How much of California's smoking drop did Proposition 99 really cause?* directly below in smaller chalk-white italic.

Panel 1 (top-left): Title "THE BIG DROP" in steel blue small-caps. A large chalk-drawn line chart with two stick-figure smokers — one tall (labelled "1988") and one short (labelled "2000") — standing on either side of a downward-sloping line; a dashed warm-orange vertical line marks "PROP 99". Callout in warm orange: "47.9% fewer packs". Chalk arrow to Panel 2.

Panel 2 (top-centre): Title "NO RANDOM TRIAL" in steel blue small-caps. A large chalk-drawn courtroom-style scale, but one pan holds California in chalk white while the other pan is *empty with a giant question mark* hovering above it. Below the scale, a small chalk caption "the counterfactual". Callout in warm orange: "Build the missing twin". Chalk arrow to Panel 3.

Panel 3 (top-right): Title "NAIVE BASELINE" in steel blue small-caps. A large chalk-drawn ruler stretched from "1984" to "1993" with two horizontal segments at different heights — the higher one labelled "Pre 99" and the lower one labelled "Post 60.4". A muted-gray dashed arrow extends California's pre-period line through the post-period at the same slope, showing the implicit "no change" counterfactual. Callout in warm orange: "−27 packs (but biased)". Chalk arrow downward to Panel 4.

Panel 4 (bottom-left): Title "SIX ESTIMATORS, ONE TRUTH?" in steel blue small-caps. A large chalk-drawn horizontal forest plot with six stacked rows of small dots and whisker bars at different positions along a centred zero axis. Three dots cluster tightly on the negative side (labelled DiD/SCM/CI), one dot sits far left (NAIVE), one sits on the line near zero (DIDvNV), and one dot sits on the *positive* side (ARIMA). A faint chalk vertical line marks zero, with "no effect" written below it. Callout in warm orange: "Range: +5 to −28 packs". Chalk arrow to Panel 5.

Panel 5 (bottom-centre): Title "WHEN METHODS BREAK" in steel blue small-caps. A split-scene composition with a vertical chalk divider down the middle. On the left, two chalk-drawn cars side-by-side moving in the same direction, one labelled "CA", one labelled "NV" — labelled below "DiD: parallel-decline". On the right, a chalk-drawn rocket whose nose tilts even further down than the actual flight path, labelled "ARIMA over-extrapolates". Below the divider, in muted gray: "single-control DiD" / "auto-AIC ARIMA". Callout in warm orange: "Don't trust one control". Chalk arrow to Panel 6.

Panel 6 (bottom-right): Title "CONSENSUS" in steel blue small-caps. A large chalk-drawn ribbon banner stretched between two small chalk hands, with the number "−18.7" written in warm orange chalk on the ribbon and "packs/capita" in smaller chalk white below. A teal check-mark sits to the right of the ribbon. Below: three chalk method names in steel-blue small-caps stacked vertically — "SCM", "RDD", "CausalImpact" — each with a small tick beside it. Callout in warm orange: "92% posterior probability".

Outside the panel grid, the bottom-right margin carries two professor's notes in italic chalk-white script with their own hand-drawn arrows. The first reads *"DiD with one similar control collapses to noise — Nevada was already falling"* and its arrow points up-left toward Panel 5. The second reads *"AICc picks ARIMA(1,2,0) because it minimises in-sample fit, not out-of-sample plausibility"* and its arrow points up-right toward Panel 5 from the opposite side. The bottom-left margin carries a four-entry colour concept legend with small coloured dots: warm orange = "BIG number / threshold", teal = "robust consensus", steel blue = "panel & series title", muted gray = "outlier / background". The right margin runs a compact vertical sidebar in muted chalk gray titled SIX ESTIMATORS, with six small-caps rows: "Naive pre-post  −27.0", "DiD vs NV  −5.7", "ITS growth  −28.3", "ITS ARIMA  +4.5", "RDD on time  −20.1 ✓", "Synthetic Control  −18.7 ✓", "CausalImpact  −12.8 ✓", with a small footnote "✓ = trusted method".

The chalkboard is alive with texture. Chalk dust drifts near every text edge and along the panel borders, especially where arrows leave one panel and enter another. Subtle smudge marks suggest partially erased earlier work. At 15–20% opacity behind the panels and in the margins, several muted-gray chalk fragments are visible: the DiD identity $\hat{\tau} = (\bar Y_{CA,post} - \bar Y_{CA,pre}) - (\bar Y_{NV,post} - \bar Y_{NV,pre})$ written along the left margin, the BSTS state-space sketch $y_{1t} = \mu_t + \beta^\top x_t + \varepsilon_t$ along the right margin, a tiny three-node DAG with arrows labelled CA → cigsale and Prop99 → cigsale tucked behind Panel 2, the segmented regression formula `cigsale ~ year0 + post + year0:post` faintly visible behind Panel 4, and a small chalk pie chart fragment showing Utah 34 / NV 24 / MT 18 / CO 18 / CT 6 hovering behind Panel 6.

This prompt generates the base image. The AI should render clearly: the title banner, six panel titles in steel blue, six central sketch illustrations, the three BIG warm-orange numbers (47.9%, +5 to −28, −18.7), and the six panel callouts. All other text — body sentences, per-method effect sizes, narrative transitions, professor's notes verbatim, and the sidebar entries — is provided in the panel reference data for the user to overlay manually in an image editor. Keep text elements minimal and large for legibility.

---

## Section B — Negative Prompt

Avoid: photorealism, 3D rendering, glossy textures, neon colours, gradients, photographic lighting, computer-generated typography, perfectly straight lines (chalk strokes should be slightly irregular), pixel art, vector-art cleanness, sans-serif rendered text, watermarks, signatures, modern UI elements, cartoon characters, emojis, anime style, manga style, comic-book speech bubbles, photo-stickers, fluorescent highlights, lens flares, depth-of-field blur. Avoid precise statistical charts with exact numeric axis ticks or gridlines — sketch metaphors only. No tobacco-product imagery (no cigarettes, no smoke, no ashtrays, no packs); the post is about *measuring* a policy, not advertising the product. No US state outlines drawn precisely (use schematic shapes only). No human faces with detailed features; stick figures only. No bar charts with axis numbers; use chalk tallies and stripe-hatching instead.

---

## Section C — Condensed Prompt (≤250 words)

Chalkboard sketchnote infographic, 1920x1080 landscape, dark navy (#0e1545) background, hand-drawn chalk style with dust particles and smudges. Title banner top centre: "SIX WAYS TO EVALUATE A POLICY" in steel blue (#8bb8e0) chalk small-caps; below in italic chalk white (#f0ece2): "How much of California's smoking drop did Proposition 99 really cause?"

Six panels in a 3x2 grid below the title, each in a steel-blue rounded chalk rectangle with a warm-orange (#e8956a) numeral in the corner, connected by chalk arrows in reading order.

Panel 1 THE BIG DROP: line chart with two stick figures (1988, 2000), dashed orange "PROP 99" line, callout "47.9% fewer packs".
Panel 2 NO RANDOM TRIAL: scale of justice with one empty pan and a giant question mark, callout "Build the missing twin".
Panel 3 NAIVE BASELINE: ruler 1984→1993 with two horizontal levels, dashed gray "no-change" line extending pre-period slope, callout "−27 packs (but biased)".
Panel 4 SIX ESTIMATORS, ONE TRUTH?: horizontal chalk forest plot with six dots scattered around a zero axis, callout "Range: +5 to −28 packs".
Panel 5 WHEN METHODS BREAK: split scene — two parallel cars (CA, NV) on the left, a rocket nose-diving past its trajectory on the right, callout "Don't trust one control".
Panel 6 CONSENSUS: chalk ribbon with "−18.7" in warm orange chalk on it, teal check-mark, three method names listed (SCM, RDD, CausalImpact), callout "92% posterior probability".

Colour legend bottom-left (warm orange / teal / steel blue / muted gray). Two italic professor's notes bottom-right. Vertical sidebar right margin with all six estimator effect sizes in muted chalk gray. Avoid photorealism, neon, precise charts, tobacco imagery, faces, emojis.

---

## Panel Reference Data

### Panel 1 — The Big Drop

- **Position**: Row 1, Column 1 (top-left)
- **Dramatic function**: Hook
- **Story beat**: "California's per-capita cigarette sales fell almost in half after 1988 — what caused the drop?"
- **Callout**: "47.9% fewer packs"
- **Key number**: 47.9% drop in California per-capita cigarette sales between the 1970–1988 mean (116 packs) and the 1989–2000 mean (60.4 packs)
- **Central sketch**: A chalk-drawn line chart sloping from upper-left to lower-right, with a tall stick-figure smoker on the left labelled "1988" and a much shorter stick figure on the right labelled "2000". A dashed warm-orange vertical line cuts the chart at the 1988/89 boundary with the label "PROP 99" above it.
- **Body sentences** (for manual overlay):
  - California's mean per-capita cigarette sales fell from 116 packs in 1970–1988 to 60.4 packs in 1989–2000.
  - Proposition 99 raised the state cigarette tax by 25 cents per pack starting January 1989.
  - The raw drop is impressive but does not by itself reveal causation — the entire country was also reducing smoking over the same window.
- **Transition to next**: "But how much of that drop did the policy actually cause?"

### Panel 2 — No Random Trial

- **Position**: Row 1, Column 2 (top-centre)
- **Dramatic function**: Stakes
- **Story beat**: "There is no randomized trial — every method must build California's missing counterfactual twin"
- **Callout**: "Build the missing twin"
- **Key number**: N/A (memorable phrase rather than a number)
- **Central sketch**: A large chalk-drawn scale of justice. One pan holds a chalk silhouette of California; the other pan is empty with a giant chalk question mark hovering above it. Below the scale, a small chalk caption reads "the counterfactual".
- **Body sentences** (for manual overlay):
  - The fundamental problem of causal inference: we observe California's outcome with Proposition 99 but not without.
  - Every estimator in this tutorial builds the counterfactual differently — same data, different assumptions.
  - The choice of counterfactual is the design decision; the rest is bookkeeping.
- **Transition to next**: "Start with the simplest counterfactual — California's own pre-period."

### Panel 3 — Naive Baseline

- **Position**: Row 1, Column 3 (top-right)
- **Dramatic function**: First attempt
- **Story beat**: "Compare California's pre- and post-1988 means and call the difference the effect"
- **Callout**: "−27 packs (but biased)"
- **Key number**: −27.0 packs/capita naive pre-post estimate (HAC SE 5.3, p < 0.001)
- **Central sketch**: A horizontal chalk ruler spanning "1984 → 1993" with two horizontal segments at different heights — the higher one labelled "Pre 99" and the lower one labelled "Post 60.4". A muted-gray dashed arrow continues the pre-period level flat through the post-period, illustrating the implicit "no change" counterfactual that the naive method assumes.
- **Body sentences** (for manual overlay):
  - The naive pre-post comparison on California's 1984–1993 window gives −27.02 packs (HAC SE 5.30).
  - The implicit counterfactual is "no change" — which silently bundles the nationwide secular decline into the estimate.
  - This is *descriptive*, not causal; the magnitude is roughly 45% larger than the synthetic-control consensus estimate of −18.7 packs.
- **Transition to next**: "Six causal estimators tackle the same question — and they don't all agree."

### Panel 4 — Six Estimators, One Truth?

- **Position**: Row 2, Column 1 (bottom-left)
- **Dramatic function**: Twist (Comparison metaphor)
- **Story beat**: "Plot all six estimators on one forest plot and see where they cluster, scatter, and break"
- **Callout**: "Range: +5 to −28 packs"
- **Key number**: Range of estimates from +4.55 (ITS-ARIMA) to −28.28 (ITS growth-curve)
- **Central sketch**: A large chalk-drawn horizontal forest plot with six stacked rows. Three dots cluster tightly together on the left side around −15 to −20 (RDD, Synthetic Control, CausalImpact). One dot sits far left at −27/−28 (Naive, ITS-growth). One dot sits on the centre line at −5.7 (DiD vs Nevada). One dot sits on the positive side at +4.5 (ITS ARIMA). Each dot has a small horizontal whisker. A faint chalk vertical line marks zero, with "no effect" written below.
- **Body sentences** (for manual overlay):
  - On the same dataset, six estimators span a 32-pack range from +4.5 to −28.3.
  - Three causal methods cluster: RDD on time −20.1, Synthetic Control −18.7, CausalImpact −12.8.
  - Two methods double the apparent effect by ignoring the nationwide trend (Naive −27.0, ITS-growth −28.3).
  - Two methods break in opposite directions: single-control DiD collapses to −5.7, AICc-ARIMA flips to +4.5.
- **Transition to next**: "Why do the broken methods break?"

### Panel 5 — When Methods Break

- **Position**: Row 2, Column 2 (bottom-centre)
- **Dramatic function**: Surprise
- **Story beat**: "Single comparisons are fragile and automated model selection over-extrapolates"
- **Callout**: "Don't trust one control"
- **Key number**: N/A (memorable phrase rather than a number)
- **Central sketch**: A split-scene composition with a vertical chalk divider down the middle. On the left, two side-by-side chalk cars labelled "CA" and "NV" moving in the same direction (parallel decline), with a caption "DiD: parallel-decline". On the right, a chalk-drawn rocket whose nose tilts even further down than its actual trajectory line, with a caption "ARIMA over-extrapolates".
- **Body sentences** (for manual overlay):
  - DiD against Nevada gives −5.68 packs (p = 0.31) because Nevada's own sales fell 21.3 packs over the same window.
  - The lesson: a single control unit on a similar trajectory wipes out the DiD contrast.
  - AICc selects ARIMA(1, 2, 0) on the 1970–1988 window — double-differencing locks onto the late-1980s acceleration.
  - The extrapolated counterfactual ends up *below* California's actual post-period sales, producing a counterintuitive +4.55 packs "effect".
- **Transition to next**: "What survives once we fix these mistakes?"

### Panel 6 — Consensus

- **Position**: Row 2, Column 3 (bottom-right)
- **Dramatic function**: Resolution
- **Story beat**: "Methods that borrow information from a weighted comparison group converge on a −13 to −20 pack reduction"
- **Callout**: "92% posterior probability"
- **Key number**: −18.7 packs/capita (Synthetic Control consensus); 92% posterior probability of a non-zero effect (CausalImpact full-covariate model)
- **Central sketch**: A chalk-drawn ribbon banner stretched between two small chalk hands, with the number "−18.7" written in large warm-orange chalk on the ribbon and "packs/capita" in smaller chalk white below. A teal check-mark sits to the right of the ribbon. Below the ribbon: three chalk method names in steel-blue small-caps stacked vertically — "SCM", "RDD", "CausalImpact" — each with a small teal tick beside it.
- **Body sentences** (for manual overlay):
  - The three "trusted" estimators agree: RDD −20.1, Synthetic Control −18.7, CausalImpact −12.8.
  - Synthetic California is built from five states: Utah 34.3%, Nevada 23.6%, Montana 18.2%, Colorado 17.5%, Connecticut 6.2%.
  - CausalImpact reports a 92% posterior probability of a non-zero causal effect, with a 95% credible interval of [−32, +5.7] packs.
  - Bottom line for policymakers: Proposition 99 reduced per-capita cigarette sales by roughly 13–20 packs per year over 1989–2000.
- **Transition to next**: End of story — return to the title question with confidence.

### Story Spine

> Running six estimators on California's Proposition 99 cigarette tax reveals that the choice of counterfactual decides the answer — three methods that borrow data from a weighted comparison group converge on a −18-pack consensus, two methods double the effect by ignoring the nationwide trend, and two methods break entirely — challenging the assumption that the data alone determines a policy's measured impact.

### Margin Elements

- **Professor's note 1**: "*DiD with one similar control collapses to noise — Nevada was already falling.*" Positioned in the bottom-right margin, with a hand-drawn arrow pointing up-left toward Panel 5.
- **Professor's note 2**: "*AICc picks ARIMA(1,2,0) because it minimises in-sample fit, not out-of-sample plausibility.*" Positioned just below the first note in the bottom-right margin, with a hand-drawn arrow pointing up-right toward Panel 5 from the opposite side.
- **Color legend** (4 entries, bottom-left margin with small coloured dots):
  - Warm orange = "BIG number / threshold"
  - Teal = "robust consensus"
  - Steel blue = "panel & series title"
  - Muted gray = "outlier / background"
- **Right-margin sidebar** (justified by 7 tracked estimators): titled "SIX ESTIMATORS" in muted chalk gray small-caps, with seven vertically-stacked rows: "Naive pre-post −27.0", "DiD vs NV −5.7", "ITS growth −28.3", "ITS ARIMA +4.5", "RDD on time −20.1 ✓", "Synthetic Control −18.7 ✓", "CausalImpact −12.8 ✓", and a footnote "✓ = trusted method".
- **Background formulas** (5 fragments at 15–20% opacity in muted gray):
  1. DiD identity: $\hat{\tau} = (\bar Y_{CA,post} - \bar Y_{CA,pre}) - (\bar Y_{NV,post} - \bar Y_{NV,pre})$ — left margin
  2. BSTS state-space: $y_{1t} = \mu_t + \beta^\top x_t + \varepsilon_t$ — right margin
  3. Three-node DAG with arrows labelled "CA → cigsale" and "Prop99 → cigsale" — behind Panel 2
  4. Segmented regression: `cigsale ~ year0 + post + year0:post` — behind Panel 4
  5. Five-slice synthetic-mix pie fragment "Utah 34 / NV 24 / MT 18 / CO 18 / CT 6" — behind Panel 6

### Three Concepts — Counterfactual Strategies

- **Within-unit extrapolation** (Naive, ITS-growth, ITS-ARIMA, RDD on time): build the counterfactual from California's own pre-period trajectory alone. Fragile to pre-trend mis-specification.
- **Single-control DiD** (Method 2): borrow Nevada's pre-to-post change. Fragile to any drift in the single control.
- **Weighted donor blending** (Synthetic Control, CausalImpact): combine many donor states into a data-driven counterfactual. The robust class for this dataset.

### Tracked Estimators

- **Naive pre-post**: −27.0 packs (HAC SE 5.3, p < 0.001) — descriptive, not causal.
- **DiD (CA vs Nevada)**: −5.7 packs (HAC SE 5.4, p = 0.31) — collapses to noise.
- **ITS growth curve**: −28.3 packs (SE 1.7) — matches naive; ignores secular trend.
- **ITS ARIMA(1,2,0)**: +4.5 packs (SE 2.3) — wrong sign from over-extrapolation.
- **RDD on time**: −20.1 packs level break (HAC SE 5.6, p = 0.001) ✓ trusted.
- **Synthetic Control (tidysynth)**: −18.7 packs ATT ✓ trusted; donor weights Utah 34.3%, Nevada 23.6%, Montana 18.2%, Colorado 17.5%, Connecticut 6.2%.
- **CausalImpact (full covariates)**: −12.8 packs, 95% CrI [−32, +5.7], 92% posterior probability ✓ trusted.

### Message Inventory (Step 0.6 audit)

ON-IMAGE (6, fills the panel grid):
- "47.9% raw drop" → Panel 1
- "No random trial; build the counterfactual" → Panel 2
- "Naive baseline −27, but biased" → Panel 3
- "Six estimators range +5 to −28" → Panel 4 (Comparison)
- "Single-control DiD breaks; AIC-ARIMA breaks" → Panel 5
- "Consensus −18.7 packs; 92% posterior probability" → Panel 6

MARGIN (2):
- "Why DiD breaks (Nevada falling in parallel)" → Professor's note 1
- "Why ARIMA breaks (AICc maximises in-sample fit)" → Professor's note 2

REFERENCE (only in Section D / sidebar):
- Exact estimate per method
- Synthetic California donor weights (Utah/NV/MT/CO/CT split)
- BSTS state-space and DiD identity formulas
- 25-cent tax increase magnitude
- 1984–1993 vs 1970–2000 window choice
