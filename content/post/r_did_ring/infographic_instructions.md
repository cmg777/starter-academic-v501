# Infographic Instructions: Ring DiD with Geocoded Microdata

Companion to `index.md`. Four sections: (A) flowing-prose AI image
prompt, (B) negative prompt, (C) condensed prompt for token-limited
tools, (D) panel reference data for manual text overlay.

---

## Section A: Full Image Generation Prompt

Create a 1920x1080 landscape digital chalk illustration on a dark navy
background (#0e1545). The style is academic chalkboard sketchnote: all
lettering appears hand-drawn in chalk with slightly irregular strokes,
chalk-dust particles float near text edges, and faint smudge marks add
realism. The overall feel resembles a photograph of an expertly
annotated university lecture chalkboard.

The composition has a centered title banner across the top, with the
guiding question in smaller italic chalk just beneath it; below the
banner sit six panels arranged in a three-column by two-row grid.
Panel borders are chalk-drawn rounded rectangles in steel blue
(#8bb8e0) with slightly uneven edges. Small circled numerals in warm
orange (#e8956a) sit in the top-left corner of each panel. Simple
chalk arrows with dust particles connect the panels in reading order:
Panel 1 → 2 → 3 across the top row, a vertical arrow from Panel 3 down
to Panel 4, then Panel 4 → 5 → 6 across the bottom row. Generous dark
space surrounds and separates the panels — the navy background is a
deliberate design element, not a void to fill.

The colour system is restricted and consistent throughout. The
background is navy blue (#0e1545). Body text and sketch outlines are
chalk white (#f0ece2). Panel titles and the main banner are bright
steel blue (#8bb8e0) in small-caps. Accents and the three key
numbers — `−5.78 %`, `52 %`, and `−20.6 %` — are warm orange
(#e8956a). Memorable callouts and positive-emphasis flourishes (the
checkmark on Panel 6's resolution, the "data-driven" tag near the
nonparametric curve) use teal (#00d4c8). Muted chalk gray (#b0a89a)
handles secondary annotations and the faint background equations.

The title banner runs centred at the top of the canvas, above the
panel grid. The title text reads "WHEN DISTANCE DEFINES TREATMENT" in
large steel blue chalk small-caps. Directly beneath, in smaller
chalk-white italic, sits the guiding question: *"What happens to home
prices when an offender moves in — and how do we know we measured it
right?"*

Panel 1 (top-left): title "THE SPATIAL DESIGN" in steel blue
small-caps. A large chalk-drawn concentric-rings target hovers over a
small house icon at its centre; a chalk magnifying glass hovers
slightly off-axis, examining the ring boundary. The inner disk is
faintly shaded (treated homes), the donut around it is left
unshaded (control), and the outer area carries a tiny `dropped`
label in muted gray. Callout in warm-orange chalk: *"Treated by
distance, not by policy."* Small `N = 9,092` annotation under the
target. Chalk arrow to Panel 2.

Panel 2 (top-centre): title "THE TEXTBOOK ANSWER" in steel blue
small-caps. A simple chalk house with a price tag plunging downward
on a chalk-drawn ribbon. Above the house, a steel-blue sub-tag reads
"STAGE 1: PARAMETRIC RING DiD". A small sub-equation in chalk sits
inside the panel border near the price tag:
`Δy = α + β · 1{d ≤ d̄} + ε`. The warm-orange callout dominates the
panel: **−5.78 %**, with a small chalk annotation `at 0.1 mi`
below it. Chalk arrow to Panel 3.

Panel 3 (top-right): title "THE RING WOBBLES" in steel blue
small-caps. A chalk signpost at a fork in the road with three labeled
arrows pointing to three small chalk-drawn rings of different widths;
under each ring sits its own ATT number in muted gray
(`−6.40 %`, `−5.45 %`, `−4.21 %`) with the corresponding cutoff
(`0.05`, `0.10`, `0.15` mi). A muted-gray sub-tag reads "same data,
same regression, three answers". The warm-orange callout reads
**52 % spread** in large chalk, anchoring the panel. Chalk arrow
down to Panel 4.

Panel 4 (bottom-left): title "ONE NUMBER VS THE WHOLE CURVE" in
steel blue small-caps. A chalk-drawn balance scale dominates the
panel — the left pan carries a single chalk number `−5.78 %`
(the parametric ATT); the right pan carries a chalk step-function
descending across distance, with a teal `data-driven` tag floating
above it. The scale tilts slightly toward the right pan, suggesting
the curve carries more information than the scalar. Callout in
warm-orange chalk: *"The curve reveals what the average hides."*
Chalk arrow to Panel 5.

Panel 5 (bottom-centre): title "THE HYPER-LOCAL SHOCK" in steel blue
small-caps. A chalk-drawn price curve descends sharply from the
left (close to the offender), then quickly flattens out as distance
grows. A chalk lightning bolt strikes the steep part of the curve,
emphasising the surprise. A muted-gray sub-tag reads "23 quantile
bins". An annotation arrow points to the leftmost bin with the
warm-orange callout **−20.6 %** in large chalk. A small teal
`2.1× the textbook number` label sits to the right. Chalk arrow to
Panel 6.

Panel 6 (bottom-right): title "DATA-DRIVEN CORROBORATION" in steel
blue small-caps. A chalk-drawn bridge spans two cliffs: the left
cliff is labeled `Linden-Rockoff 0.1 mi (eyeballed)`, the right is
labeled `Butts 0.094 mi (data-driven)`. A small teal checkmark sits
on the bridge midpoint where the two values nearly coincide. Callout
in warm-orange chalk: *"Cutoff confirmed, not chosen."* No arrow
out — Panel 6 is the resolution.

Outside the panel grid, two professor's margin notes sit in the
bottom-right corner, stacked vertically. The upper note, in small
italic chalk with its own hand-drawn arrow toward Panel 2, reads:
*"Cluster-robust SE 0.0225 — neighbourhood-level clustering allows
nearby sales to share unobserved shocks."* The lower note, with an
arrow toward Panel 5, reads: *"Sample-weighted ATT inside 0.1 mi =
−12.4 % — between the textbook number and bin 1."* A colour-concept
legend sits in the bottom-left corner with four small chalk
entries: `parametric ATT` paired with a warm orange dot, `bin 1
estimate` paired with a warm orange dot, `nonparametric curve`
paired with a teal dot, `cutoff fragility` paired with a muted
gray dot.

Chalk-dust particles float near text edges, panel borders, and the
arrow tips throughout the canvas. Subtle smudge marks appear where
chalk has been partially erased, particularly along the panel
borders and near the title banner. Faint background equations and
diagrammatic fragments sit behind the panels at 15-20 % opacity in
muted gray (#b0a89a): the parametric ring DiD regression
`Δy = α + β · 1{d ≤ d̄} + ε`, the nonparametric bin-difference
`τ̂(d) = Δy_j − Δy_L`, the ring DiD ATT
`τ_ring = E[Δy | d ≤ d̄] − E[Δy | d > d̄]`, a small chalk DAG
showing `Offender → distance → Δprice`, and a tiny three-circle
sketch labeled `treated / control / dropped`. These textures live
in the dark space between panels — never inside them.

This prompt generates the base image. The AI should render clearly:
the title banner, six panel titles in steel blue, six central sketch
illustrations, three key numbers in large warm orange chalk
(−5.78 %, 52 % spread, −20.6 %), and three memorable callout phrases.
All other text — body sentences, transition phrases, multi-word
annotations — is provided in the panel reference data below for the
user to overlay manually in an image editor. Keep text elements
minimal and large for legibility.

---

## Negative Prompt

Do not include: photorealistic rendering, glossy or reflective
surfaces, drop shadows, gradient color fills, emojis or Unicode
symbols, computer-generated sans-serif typography, neon glow effects,
3D perspective or depth, watermarks, stock photo elements, smooth
vector curves, pure white (#ffffff) — all whites should be warm/creamy
chalk white (#f0ece2). All lines should appear hand-drawn with varying
weight and chalk texture. Do not use clean digital borders or
perfectly straight lines. Do not render precise statistical charts,
axis labels, or data tables. Do not attempt to render more than 3 text
elements per panel. Do not include photographs of actual houses,
maps, or chalkboards — every element is a chalk-drawn illustration.
Do not render street-level photographs of neighbourhoods or
residential property images.

---

## Condensed Prompt (~200 words)

Chalkboard infographic, 1920x1080 landscape, navy background
(#0e1545). Academic chalk-drawn sketchnote, hand-lettered text, chalk
dust, faint formula textures. Six panels in 3x2 grid with steel blue
(#8bb8e0) chalk borders connected by chalk arrows. Title: "WHEN
DISTANCE DEFINES TREATMENT" in steel blue small-caps, subtitle: "What
happens to home prices when an offender moves in — and how do we
know we measured it right?" in italic chalk white (#f0ece2). Colours:
chalk white (#f0ece2) body, warm orange (#e8956a) key numbers, teal
(#00d4c8) highlights, muted gray (#b0a89a) annotations. Panel 1
(top-left): "THE SPATIAL DESIGN" — concentric-rings target with house
at centre and magnifying glass, callout "Treated by distance, not by
policy." Panel 2 (top-centre): "THE TEXTBOOK ANSWER" — chalk house
with plunging price tag, big orange **−5.78 %**. Panel 3 (top-right):
"THE RING WOBBLES" — signpost with three labeled rings, big orange
**52 % spread**. Panel 4 (bottom-left): "ONE NUMBER VS THE WHOLE
CURVE" — balance scale with scalar vs step-function. Panel 5
(bottom-centre): "THE HYPER-LOCAL SHOCK" — steep price curve struck
by lightning, big orange **−20.6 %**. Panel 6 (bottom-right):
"DATA-DRIVEN CORROBORATION" — chalk bridge between two cliffs
labeled 0.1 mi and 0.094 mi, with a small teal checkmark. Two
professor's notes bottom-right. Colour legend bottom-left. Faint
background formulas at 15 % opacity. No photorealism, no gradients,
no precise charts, no small text, no pure white.

---

## Panel Reference Data

### Panel 1 — The Spatial Design

- **Position**: top-left (row 1, column 1)
- **Dramatic function**: Hook
- **Story beat**: *"What happens to home prices when an offender moves in — and how do we know we measured it right?"*
- **Callout**: *"Treated by distance, not by policy."*
- **Key number**: none (the BIG numbers anchor Panels 2, 3, and 5)
- **Central sketch**: Chalk-drawn concentric-rings target centred on a small house icon (the offender's eventual address). A chalk magnifying glass hovers off-axis. The inner disk is faintly shaded; the donut around it is unshaded; the outer area carries a muted-gray `dropped` label. Small `N = 9,092` sits under the target. Metaphor category: Investigation.
- **Body sentences** (for manual overlay):
  - The "ring" approach turns a point in space — a registered sex offender's eventual address — into a natural experiment.
  - Homes inside 0.1 mile are the treated group; homes between 0.1 and 0.3 mile are the control group.
  - Of 170,239 transactions in the original Linden-Rockoff (2008) data, **9,092 sales** lie within 1/3 mile of an offender; that is the analysis sample.
  - The design rests on **local parallel trends**: absent the offender, inner-ring and outer-ring prices would have moved together (Butts 2023, Assumption 2).
  - The reader's question for the rest of the infographic: how big is the effect, and how confident are we in the number we report?
- **Transition to next**: *"And the stakes are real — the textbook estimator already gives one answer..."*

### Panel 2 — The Textbook Answer

- **Position**: top-centre (row 1, column 2)
- **Dramatic function**: Stakes
- **Story beat**: *"Inside 0.1 mile, prices drop −5.78 %. So says the textbook ring DiD."*
- **Callout**: **−5.78 %** *(at 0.1 mi)*
- **Key number**: **−5.78 %** — parametric ring DiD ATT at the canonical 0.1-mile inner ring (BIG)
- **Central sketch**: A simple chalk house with a price tag plunging downward on a chalk-drawn ribbon. Above the house, a steel-blue sub-tag reads "STAGE 1: PARAMETRIC RING DiD". A chalk sub-equation inside the panel border reads `Δy = α + β · 1{d ≤ d̄} + ε`. Metaphor category: Growth (inverted) — descending price tag.
- **Body sentences** (for manual overlay):
  - The standard ring DiD is one line of code: `feols(Δlog_price ~ inside_0_1_mi | srn_year, cluster = "neighborhood")`.
  - On the Linden-Rockoff sample of 9,029 transactions (singletons dropped from 9,092), the coefficient is **−0.0595 log-points**, with cluster-robust SE 0.0225.
  - In percent terms, that is an average price drop of **−5.78 %** for homes inside 0.1 mile after the offender's arrival.
  - The 95 % CI of [−10.4 %, −1.5 %] strictly excludes zero.
  - Butts (2023, p. 5) reports this magnitude as *"homes between 0 and 0.1 miles decline in value by about 7.5 %"* — our number sits about 1.7 percentage points below his approximate figure, comfortably within the CI.
- **Transition to next**: *"But the first attempt comes with a hidden choice..."*

### Panel 3 — The Ring Wobbles

- **Position**: top-right (row 1, column 3)
- **Dramatic function**: Attempt
- **Story beat**: *"Change the ring, and the answer wobbles."*
- **Callout**: **52 % spread**
- **Key number**: **52 %** — relative spread of the parametric ATT across the three reasonable inner-ring cutoffs (BIG)
- **Central sketch**: A chalk signpost at a fork in the road with three labeled arrows. Each arrow points to a small chalk-drawn ring of a different inner radius; under each ring sits its ATT number in muted gray (`−6.40 %`, `−5.45 %`, `−4.21 %`) and the corresponding cutoff (`0.05`, `0.10`, `0.15` mi). A muted-gray sub-tag reads "same data, same regression, three answers". Metaphor category: Narrowing / Decision (Fork in the road).
- **Body sentences** (for manual overlay):
  - Redrawing the inner ring at 0.05, 0.10, and 0.15 mile yields ATT estimates of **−6.40 %**, **−5.45 %**, and **−4.21 %** respectively.
  - The 95 % CIs are [−14.1 %, +0.9 %], [−10.3 %, −0.9 %], and [−7.8 %, −0.8 %].
  - The sign is stable across choices; the magnitude is not.
  - The relative spread, (−6.40 − (−4.21)) ÷ 5.45 ≈ **52 %**, has nothing to do with statistical noise — it is driven entirely by the researcher's choice of $\bar{d}$.
  - As Butts (2023, p. 5) puts it: *"the choice of 0.1 miles is an untestable assumption."*
- **Transition to next**: *"The turn comes when we drop the cutoff altogether..."*

### Panel 4 — One Number vs the Whole Curve

- **Position**: bottom-left (row 2, column 1)
- **Dramatic function**: Twist (COMPARISON)
- **Story beat**: *"One number vs the whole curve."*
- **Callout**: *"The curve reveals what the average hides."*
- **Key number**: none (this is the methodological pivot panel)
- **Central sketch**: A chalk-drawn balance scale. The left pan carries a single chalk number `−5.78 %` (the parametric ATT). The right pan carries a chalk step-function descending across distance, with a teal `data-driven` tag floating above it. The scale tilts slightly toward the right, suggesting the curve carries more information than the scalar. Metaphor category: **Comparison** (balance scale).
- **Body sentences** (for manual overlay):
  - The parametric ring DiD forces a single coefficient across the entire inner ring.
  - That coefficient averages a very strong effect right at the offender's address with a near-zero effect at the ring's outer edge.
  - The nonparametric ring DiD of Butts (2023), built on the binscatter partitioning estimator of Cattaneo, Crump, Farrell, and Feng (2024), instead reports a separate ATT per quantile-spaced bin.
  - The data-driven number of bins is chosen by a mean-squared-error criterion in `binsreg`; no researcher choice of cutoff is required.
  - When the truth has a steep close-in effect, the curve wins; when the truth is flat across the inner ring, the scalar suffices.
- **Transition to next**: *"And the surprise is just how steep the close-in effect really is..."*

### Panel 5 — The Hyper-Local Shock

- **Position**: bottom-centre (row 2, column 2)
- **Dramatic function**: Surprise
- **Story beat**: *"Homes in the closest 300 feet drop −20.6 % — 2.1× the textbook number."*
- **Callout**: **−20.6 %** *(closest bin)*
- **Key number**: **−20.6 %** — nonparametric ring DiD estimate in the closest bin (BIG)
- **Central sketch**: A chalk-drawn price curve descends sharply from the left (close to the offender), then quickly flattens out as distance grows. A chalk lightning bolt strikes the steep part of the curve, emphasising the surprise. A muted-gray sub-tag reads "23 quantile bins". A small teal `2.1× the textbook number` label sits to the right. Metaphor category: Surprise / Reversal (lightning bolt).
- **Body sentences** (for manual overlay):
  - `binsreg` partitions the Linden-Rockoff (0, 0.3]-mile sample into **23 quantile-spaced bins**.
  - The closest bin — roughly the first **300 feet** of the offender's address — returns $\hat{\tau} = $ **−20.6 %** with 95 % CI $[-34.0\%, -12.1\%]$.
  - The second bin returns **−15.2 %** with CI $[-25.4\%, -7.7\%]$.
  - Bin 3 collapses to **−2.9 %** and bin 4 to essentially zero (+0.6 %) — the effect concentrates entirely in the first two bins.
  - Butts (2023, p. 6) describes this exact pattern: *"homes in the two closest rings i.e. within a few hundred feet … with an estimated decline of home value of around 20 %"* — our **−20.6 %** lands on his claim almost exactly.
- **Transition to next**: *"So the lesson is — the data validate the eyeballed cutoff..."*

### Panel 6 — Data-Driven Corroboration

- **Position**: bottom-right (row 2, column 3)
- **Dramatic function**: Resolution
- **Story beat**: *"Data-driven crossing at 0.094 mi corroborates the eyeballed 0.1-mile cutoff."*
- **Callout**: *"Cutoff confirmed, not chosen."*
- **Key number**: none in the callout (the **0.094 mi** crossing is a small contextual annotation on the bridge midpoint)
- **Central sketch**: A chalk-drawn bridge spans two cliffs. The left cliff is labeled `Linden-Rockoff 0.1 mi (eyeballed)`, the right is labeled `Butts 0.094 mi (data-driven)`. A small teal checkmark sits on the bridge midpoint where the two values nearly coincide. Metaphor category: Connection / Synthesis (bridge between cliffs).
- **Body sentences** (for manual overlay):
  - The nonparametric estimator's step function crosses zero between bins 3 and 4, at $d \approx 0.094$ mile.
  - This is strikingly close to the 0.1-mile inner-ring cutoff that Linden and Rockoff (2008) chose by eyeballing the smoothed price gradient.
  - The data-driven crossing emerges as an *output* of the partitioning estimator, not as an input chosen by the researcher.
  - In this neighbourhood, the modern data-driven approach therefore corroborates the original authors' eyeballed choice rather than overturning it.
  - As Butts (2023, p. 6) puts it: *"After 0.1 miles, the estimated treatment effect curve becomes centered at zero consistently."*
- **Transition to next**: end of arc — no transition out.

### Story Spine

> *"The ring approach to spatial DiD reveals that the parametric estimator's textbook 5.78 % price drop at the canonical 0.1-mile cutoff masks a much steeper hyper-local effect, by showing that a data-driven nonparametric alternative recovers a 20.6 % decline inside the first 300 feet, challenging the assumption that any single ring radius can capture 'the' effect."*

### Margin Elements

- **Professor's note 1** (bottom-right margin, arrow toward Panel 2):
  *"Cluster-robust SE 0.0225 — neighbourhood-level clustering allows
  nearby sales to share unobserved shocks."*
- **Professor's note 2** (bottom-right margin, arrow toward Panel 5):
  *"Sample-weighted ATT inside 0.1 mi = −12.4 % — sits between the
  textbook number (−5.78 %) and bin 1 (−20.6 %)."*
- **Colour legend** (bottom-left margin, 4 entries):
  *parametric ATT*: warm orange dot · *bin 1 estimate*: warm orange
  dot · *nonparametric curve*: teal dot · *cutoff fragility*: muted
  gray dot.
- **Background formulas** (3-6 fragments, 15-20 % opacity, muted
  gray):
  - `Δy = α + β · 1{d ≤ d̄} + ε` (parametric ring DiD)
  - `τ̂(d) = Δy_j − Δy_L` (nonparametric bin difference)
  - `τ_ring = E[Δy | d ≤ d̄] − E[Δy | d > d̄]` (ring DiD ATT)
  - `feols(Δy ~ 1{d ≤ d̄} | srn_year, cluster = "neighborhood")`
  - Small DAG: `Offender → distance → Δprice`
  - `τ(d) = 1.5 · exp(−2.3 d) · 1{d ≤ 0.75}` (simulated DGP curve, post Section 5 — nods to the simulation-first methodology)

### Three Concepts on Screen

The infographic carries three named concepts that the panels reuse:

- **Parametric ring estimator** — one-line `feols()` regression of the
  first-differenced outcome on an inner-ring indicator. Returns one
  number per ring. Panels 2 and 3.
- **Nonparametric ring estimator (`binsreg`)** — partition distance
  into quantile-spaced bins; return a separate ATT per bin. Panels 4,
  5, and 6.
- **Ring choice as estimand** — changing the inner-ring cutoff $\bar{d}$
  changes the parameter being estimated, not just its precision.
  Panel 3.

### Key Equations on Screen

- **`Δy = α + β · 1{d ≤ d̄} + ε`** (Panel 2 sub-equation, also a
  background fragment): the one-line parametric ring DiD regression.
- **`τ̂(d) = Δy_j − Δy_L`** (background fragment): the nonparametric
  bin difference — each bin's mean change minus the last bin's mean
  change.
- **`τ_ring = E[Δy | d ≤ d̄] − E[Δy | d > d̄]`** (background
  fragment): the ring DiD ATT as a difference of conditional
  expectations.

### Message inventory (delivered vs promised)

ON-IMAGE (6, layered mode):

1. Ring DiD compares inside-0.1-mile vs 0.1–0.3-mile homes → Panel 1.
2. Parametric ring DiD on Linden-Rockoff: −5.78 % at 0.1 mi → Panel 2.
3. Ring-choice fragility: 52 % spread across reasonable cutoffs → Panel 3.
4. Parametric (one number) vs nonparametric (curve) paradigm → Panel 4.
5. Closest bin: −20.6 %; effect concentrated in 300 ft → Panel 5.
6. Data-driven 0.094 mi crossing corroborates 0.1-mile cutoff → Panel 6.

MARGIN (2):

- Cluster-robust SE 0.0225, clustered at neighbourhood → professor's
  note 1.
- Sample-weighted ATT inside 0.1 mi: −12.4 % → professor's note 2.

REFERENCE (Section D body sentences only):

- Local parallel trends assumption (Butts 2023, Assumption 2).
- Cattaneo, Crump, Farrell, Feng (2024) `binsreg` foundation.
- Linden-Rockoff (2008) original ring-method paper.
- Butts (2023) verbatim quotes on Panels 2, 3, 5, and 6.
