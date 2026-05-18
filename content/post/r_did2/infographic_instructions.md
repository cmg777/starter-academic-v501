# Regional DiD: When Weighting Flips the Sign

## Full Image Generation Prompt

Create a 1920x1080 landscape digital chalk illustration on a dark navy background (#0e1545). The style is academic chalkboard sketchnote: all lettering appears hand-drawn in chalk with slightly irregular strokes, chalk-dust particles float near text edges, and faint smudge marks add realism. The overall feel resembles a photograph of an expertly annotated university lecture chalkboard.

The composition features a title banner centered at the top and six rectangular panels arranged in a 3-column by 2-row grid below it, with generous dark navy space between panels and a tall right-margin sidebar running vertically along the right edge of the grid. Each panel has a chalk-drawn rounded-rectangle border in steel blue (#8bb8e0) with slightly uneven hand-drawn edges. Panel numbers appear as small circled numerals in warm orange (#e8956a) in the top-left corner of each panel. Chalk arrows with faint dust particles connect the panels in reading order: left to right across the top row (1 to 2 to 3), a vertical arrow from Panel 3 down to Panel 4, then left to right across the bottom row (4 to 5 to 6).

Colors: Navy blue (#0e1545) fills the entire background. Chalk white (#f0ece2) is used for all body text and sketch outlines -- never pure white (#ffffff), always slightly warm and creamy. Steel blue (#8bb8e0) marks panel titles and chalk-drawn borders, and tags the "unweighted / county-as-unit" series. Warm orange (#e8956a) highlights the population-weighted series and the three key numbers: "+0.12 vs -2.56", "84M adults vs 978 counties", and the breakdown value "M-bar* < 0.25". Teal (#00d4c8) marks moments where the two weightings agree or where covariate adjustment converges. Muted chalk gray (#b0a89a) appears on connector arrows, the right-margin sidebar text, and faint background formulas.

The title banner reads "REGIONAL DiD: WHEN WEIGHTING FLIPS THE SIGN" in large steel blue (#8bb8e0) chalk small-caps, centered above the grid. Below it in smaller chalk-white (#f0ece2) italic: "Did Medicaid expansion reduce adult mortality -- or does the answer depend on who counts?"

Panel 1 (top-left): Title "DID MEDICAID SAVE LIVES?" in steel blue small-caps. A large chalk-drawn magnifying glass hovers over a stylized US map silhouette dotted with small chalk-tally marks representing counties; some dots are circled in warm orange (expansion counties) and others sit blank (never-expansion). A bold chalk question mark floats above the lens. Small annotation labels: "2,604 counties" and "11 years" tucked beside the map. Callout: "20 million newly insured" in warm orange chalk. Chalk arrow to Panel 2.

Panel 2 (top-center): Title "SAME DATA, OPPOSITE SIGNS" in steel blue small-caps. Two side-by-side chalk-drawn two-pan balance scales separated by a thin vertical chalk divider. The left scale (labeled "Unweighted" in steel blue) sits nearly level with a tiny "+0.12" tilt; the right scale (labeled "Pop-weighted" in warm orange) tilts dramatically downward to the right with "-2.56" near the lowered pan. Sub-equation in chalk inside the panel: "ATT_unw = +0.12   ATT_wt = -2.56". Callout: "+0.12 vs -2.56 deaths / 100k" in large warm orange chalk. Chalk arrow to Panel 3.

Panel 3 (top-right): Title "THREE SPECS, ONE NUMBER" in steel blue small-caps. Three chalk-drawn equation cards stacked vertically labeled "Levels", "Two-way FE", and "Long diff", each connected by a chalk arrow pointing rightward to a single shared answer box that reads the same coefficient. Sub-equation in chalk: "beta^{2x2} identical in all three". A small chalk magnifying glass loupe sits over the answer box highlighting the agreement in teal. Callout: "Methodology is not the story" in warm orange. Chalk arrow down to Panel 4.

Panel 4 (bottom-left): Title "COUNTY OR ADULT?" in steel blue small-caps. A vertical chalk divider splits the panel. Left: ONE small chalk stick figure above "1 county = 1 vote" with a tiny Wyoming outline. Right: a dense crowd of ~thirty chalk stick figures above "1 adult = 1 vote" with a Los Angeles County outline. Sub-tag in muted gray above the divider: "COHORTS: 978 / 171 / 93 / 140". Callout: "84M adults vs 978 counties" in large warm orange chalk. Chalk arrow to Panel 5.

Panel 5 (bottom-center): Title "ROBUST? NOT QUITE" in steel blue small-caps. A chalk-drawn fragile suspension bridge labeled "Parallel trends" spans the panel, with a visible crack and falling chalk-dust at the one-quarter mark; a small stick-figure researcher peers across from the near end. Sub-sketch beneath the bridge: a tiny chalk forest plot with four nearly superimposed dots (OR, IPW, DRDID, TWFE) per weighting. Sub-equation: "Delta^RM: M-bar > 0.25 -> sign collapses". Callout: "M-bar* < 0.25" in large warm orange chalk. Chalk arrow to Panel 6.

Panel 6 (bottom-right): Title "CHOOSE THE QUESTION" in steel blue small-caps. A chalk-drawn signpost stands at a fork in a chalk road. The left arm of the signpost points to "Average county effect" with a small county-outline icon beneath; the right arm points to "Average adult effect" with a small stick-figure crowd icon beneath. A tiny chalk researcher stands at the fork, hand cupped to chin, deciding. Sub-tag above the panel border in steel blue small-caps: "BOTH ARE VALID CAUSAL PARAMETERS". Callout: "Weighting chooses the question" in warm orange chalk.

In the bottom-right margin, outside the panel grid, two professor's handwritten-style annotations stack vertically. The upper note in smaller italic chalk white (#f0ece2) reads: "The pre-period gap is essentially the same in both weightings (-54.77 vs -53.68) -- the reversal is driven entirely by who dominates the post-period!" with a hand-drawn chalk arrow toward Panel 2. The lower note reads: "None of the six 2x2 95% CIs excludes zero -- power, not method, is the binding constraint!" with a chalk arrow toward Panel 3. In the bottom-left margin, a small color concept legend shows four entries: a steel blue (#8bb8e0) dot labeled "Unweighted (counties)", a warm orange (#e8956a) dot labeled "Pop-weighted (adults)", a teal (#00d4c8) dot labeled "Convergence", and a muted gray (#b0a89a) dot labeled "Background assumption". Along the right edge of the grid, a tall vertical sidebar in muted gray (#b0a89a) titled "FIVE STAGES, TWO ANSWERS" lists five estimator rows in small chalk text: "2x2 cells: +0.12 / -2.56", "2x2 TWFE: +0.12 / -2.56", "2x2 DRDID: -1.23 / -3.76", "2xT dynamic: +9.43 / -0.68", and "GxT dynamic: +7.92 / +0.27", with a small footnote reading "Gap range: 2.5 -- 10.1 deaths / 100k".

Faint chalk-drawn equations are visible behind the panels on the navy background at approximately 15-20% opacity in muted gray (#b0a89a): "ATT(2014) = (Y_T,post - Y_T,pre) - (Y_C,post - Y_C,pre)" scattered diagonally, "ATT(g,t) = E[Y_i,t(g) - Y_i,t(inf) | G_i = g]" near the bottom edge, "ATT_DR = (1/n) sum (w1 - w0)(dY - mu)" between Panels 2 and 4, "G_i in {2014, 2015, 2016, 2019, inf}" near Panel 4, and "Delta^RM: |Delta_post| <= M-bar * max|Delta_pre|" near Panel 5. A small chalk DAG with three nodes (D -> Y with U as confounder arrow) sits faintly behind Panel 1. Chalk-style silhouettes of stick figures, balance scales, and bracket symbols appear faintly in the background gaps. Subtle chalk dust particles float near text edges and panel borders, and faint smudge marks add tactile realism.

This prompt generates the base image. The AI should render clearly: the title banner, 6 panel titles in steel blue, 6 central sketch illustrations, 3 key numbers in large warm orange chalk ("+0.12 vs -2.56", "84M adults vs 978 counties", "M-bar* < 0.25"), and 3 callout phrases. All other text -- body sentences, sidebar entries, annotations, transition phrases -- is provided in the panel reference data for the user to overlay manually in an image editor. Keep text elements minimal and large for legibility.

---

## Negative Prompt

Do not include: photorealistic rendering, glossy or reflective surfaces, drop shadows, gradient color fills, emojis or Unicode symbols, computer-generated sans-serif typography, neon glow effects, 3D perspective or depth, watermarks, stock photo elements, smooth vector curves, pure white (#ffffff) -- all whites should be warm/creamy chalk white (#f0ece2). All lines should appear hand-drawn with varying weight and chalk texture. Do not use clean digital borders or perfectly straight lines. Do not render precise statistical charts, tick-marked axes, gridlines, or data tables -- chalk-tally marks and stripe hatching are fine, axis ticks are not. Do not attempt to render more than 3 text elements per panel. Do not include photographs of actual chalkboards, classrooms, or hospitals. Do not depict identifiable political figures, ACA logos, or US flag imagery. Do not render the US map with state borders -- a single loose silhouette is enough.

---

## Condensed Prompt (~200 words)

Chalkboard infographic, 1920x1080 landscape, navy background (#0e1545). Academic chalk sketchnote, hand-lettered text, chalk dust, faint formula textures. Six panels in 3x2 grid with steel blue (#8bb8e0) chalk borders connected by chalk arrows; tall right-margin sidebar in muted gray. Title: "REGIONAL DiD: WHEN WEIGHTING FLIPS THE SIGN" in steel blue small-caps, subtitle: "Did Medicaid expansion reduce mortality -- or does the answer depend on who counts?" in italic chalk white (#f0ece2). Colors: chalk white (#f0ece2) body, warm orange (#e8956a) population-weighted + key numbers, steel blue (#8bb8e0) unweighted + titles, teal (#00d4c8) convergence, muted gray (#b0a89a) annotations. Panel 1 (top-left): "DID MEDICAID SAVE LIVES?" -- magnifying glass over US county map with circled dots, callout "20 million newly insured". Panel 2 (top-center): "SAME DATA, OPPOSITE SIGNS" -- two balance scales, one level, one tilted, orange "+0.12 vs -2.56 deaths / 100k". Panel 3 (top-right): "THREE SPECS, ONE NUMBER" -- three equation cards collapsing to one answer box, orange "Methodology is not the story". Panel 4 (bottom-left): "COUNTY OR ADULT?" -- divider, 1 stick figure vs crowd, orange "84M adults vs 978 counties". Panel 5 (bottom-center): "ROBUST? NOT QUITE" -- fragile cracked bridge "Parallel trends", orange "M-bar* < 0.25". Panel 6 (bottom-right): "CHOOSE THE QUESTION" -- signpost at fork, orange "Weighting chooses the question". Right sidebar "FIVE STAGES, TWO ANSWERS". Two professor's notes bottom-right; color legend bottom-left with 4 entries. Faint formulas: ATT(2014), ATT(g,t), Delta^RM at 15% opacity. No photorealism, no gradients, no precise charts, no pure white, no state borders.

---

## Panel Reference Data

### Panel 1 -- Did Medicaid Save Lives?

- **Position**: Row 1, Column 1 (top-left)
- **Dramatic function**: Hook
- **Story beat**: "Did the ACA Medicaid expansion reduce adult mortality?"
- **Callout**: "20 million newly insured"
- **Key number**: N/A (conceptual panel)
- **Central sketch**: Chalk-drawn magnifying glass hovering over a loose US map silhouette dotted with chalk-tally county marks; some dots circled in warm orange (expansion), others left blank (never-expansion). Sub-sketch: small chalk DAG with three nodes faintly behind the map. Annotation labels: "2,604 counties", "11 years".
- **Body sentences** (for manual overlay):
  - Between 2014 and 2019, twenty-nine states plus DC opened Medicaid eligibility to low-income adults; the rest did not (Section 1).
  - The unit of analysis is the *county*, but US counties differ in size by three orders of magnitude -- Los Angeles County has more adults than Wyoming, Vermont, and Alaska combined.
  - The cleaned panel covers 2,604 counties across 11 years (28,644 county-year rows, Section 3).
  - Even a few deaths per 100,000 averted would translate into thousands of lives saved each year.
- **Transition to next**: "Now compute the headline DiD twice -- once per county, once per adult."

### Panel 2 -- Same Data, Opposite Signs

- **Position**: Row 1, Column 2 (top-center)
- **Dramatic function**: Stakes
- **Story beat**: "The same four numbers flip sign when you switch weights."
- **Callout**: "+0.12 vs -2.56 deaths / 100k"
- **Key number**: Unweighted ATT(2014) = +0.122; population-weighted ATT(2014) = -2.563 (Section 4, manuscript line 215)
- **Central sketch**: Two side-by-side chalk-drawn two-pan balance scales separated by a vertical divider. Left scale labeled "Unweighted" tips fractionally to the right ("+0.12"); right scale labeled "Pop-weighted" tilts dramatically downward with "-2.56" on the lowered pan. Sub-equation inside the panel: "ATT_unw = +0.12   ATT_wt = -2.56".
- **Body sentences** (for manual overlay):
  - Treated cell means: 419.23 (2013) and 428.50 (2014); control cell means: 474.00 (2013) and 483.15 (2014). The unweighted DiD is just +0.122.
  - Switching to population weights -- adult population in 2013, held constant across years -- pulls the treated trend down from +9.27 to +3.74 while the control trend falls from +9.15 to +6.30.
  - The reversal is purely a re-weighting effect: the pre-period gap is essentially identical in both regimes (-54.77 unweighted vs -53.68 weighted, Table 2x2).
  - This reproduces the manuscript's flagship example (Section 4, manuscript Table tab:two_by_two_ex).
- **Transition to next**: "Maybe a richer regression closes the gap?"

### Panel 3 -- Three Specs, One Number

- **Position**: Row 1, Column 3 (top-right)
- **Dramatic function**: First attempt
- **Story beat**: "Three TWFE specifications recover *identical* DiD coefficients."
- **Callout**: "Methodology is not the story"
- **Key number**: N/A (memorable phrase)
- **Central sketch**: Three chalk equation cards stacked vertically labeled "Levels", "Two-way FE", and "Long diff", each pointing with a chalk arrow rightward to a single shared answer box. A small chalk loupe in teal highlights the agreement. Sub-equation: "beta^{2x2} identical in all three".
- **Body sentences** (for manual overlay):
  - Levels DiD, two-way FE, and long-difference regressions all return +0.122 unweighted and -2.563 weighted -- agreeing to three decimals (Section 5, Result 1).
  - Standard errors also coincide within a weighting: 3.75 unweighted, 1.49 weighted -- the weighted SE is roughly 2.5x tighter, but neither CI excludes zero (Figure 2).
  - The methodological choice between Levels, TWFE, and Long Difference is *illusory* on a balanced 2x2; the only substantive choice is whether to weight.
  - This is the manuscript's algebraic Result 1 (line 234): "the estimate of beta^{2x2} is numerically the same if the regression contains fixed effects or one regresses outcome changes on a constant."
- **Transition to next**: "If the regression doesn't change the answer, what does weighting really do?"

### Panel 4 -- County or Adult?

- **Position**: Row 2, Column 1 (bottom-left)
- **Dramatic function**: Twist [COMPARISON METAPHOR]
- **Story beat**: "Equal weights = typical county; population weights = typical adult."
- **Callout**: "84M adults vs 978 counties"
- **Key number**: 2014 cohort = 978 counties / 84.4M adults; 38% of counties carry 50% of adults (Section 3, Table tab:adoption-cohorts)
- **Central sketch**: A vertical chalk divider splits the panel. Left half: ONE small chalk stick figure above "1 county = 1 vote" with a tiny chalk outline of Wyoming. Right half: a crowd of ~30 chalk stick figures above "1 adult = 1 vote" with a chalk outline of Los Angeles County. Sub-sketch: small chalk seesaw annotated "47% counties vs 38% adults". Sub-tag above the divider: "STAGGERED COHORTS: 978 / 171 / 93 / 140".
- **Body sentences** (for manual overlay):
  - The never-expansion cohort is 47% of counties but only 38% of adults; the 2014 cohort is 38% of counties but 50% of adults -- an 11 percentage-point mass swing (Section 3).
  - Equal weights estimate the ATT for the *typical treated county*; population weights estimate the ATT for the *typical treated adult* (Section 4, manuscript lines 169-170).
  - When treatment effects vary across counties of different sizes, these two parameters answer *different* policy questions.
  - The Callaway-Sant'Anna staggered design (Section 9) reveals that the 2014 cohort flips sign on weighting: +9.43 unweighted, -0.68 weighted.
  - Both are legitimate causal estimands; choosing the weight is choosing the question.
- **Transition to next**: "But how robust is any of this to a parallel-trends violation?"

### Panel 5 -- Robust? Not Quite

- **Position**: Row 2, Column 2 (bottom-center)
- **Dramatic function**: Surprise
- **Story beat**: "The unweighted positive sign collapses by M-bar = 0.25."
- **Callout**: "M-bar* < 0.25"
- **Key number**: HonestDiD relative-magnitudes bound at M-bar = 0 is [+2.01, +14.09] (unweighted) and [-6.07, +6.07] (weighted); both bounds cross zero by M-bar = 0.25 (Section 10, Figure 8)
- **Central sketch**: Chalk-drawn fragile suspension bridge labeled "Parallel trends" spanning the panel, with a visible crack and falling chalk-dust at the one-quarter mark; a small stick-figure researcher peers across from the near end. Sub-sketch tucked beneath the bridge: a small chalk forest plot with four nearly superimposed dots (OR, IPW, DRDID, TWFE) per weighting. Sub-equation: "Delta^RM: M-bar > 0.25 -> sign collapses".
- **Body sentences** (for manual overlay):
  - Covariate-adjusted DRDID barely closes the weighting gap: estimator spread within a weighting is at most 0.8 deaths/100k, while the across-weighting gap stays 2.5 deaths/100k (Section 7, Figure 4).
  - At exact parallel trends (M-bar = 0), the unweighted dynamic ATT bound is entirely positive: [+2.01, +14.09] -- suggesting Medicaid *raised* mortality (Section 10, Figure 8).
  - By M-bar = 0.25 both bounds already cross zero; by M-bar = 1 they saturate at the package's grid limits of +/-66.7.
  - The pre-period leads at e = -10 and e = -9 are sharply negative under both weightings (-23 to -26 deaths/100k) -- a warning that long-pre-history cohorts contaminate the assumption (Section 9b, Figure 7).
  - The Rambachan-Roth method (manuscript line 556): "the identified set spans implausibly large effects in both directions."
- **Transition to next**: "What is left to say?"

### Panel 6 -- Choose the Question

- **Position**: Row 2, Column 3 (bottom-right)
- **Dramatic function**: Resolution
- **Story beat**: "Weighting is not a precision knob -- it chooses the policy target."
- **Callout**: "Weighting chooses the question"
- **Key number**: N/A (conceptual resolution)
- **Central sketch**: Chalk signpost at a fork in a chalk road. Left arm points to "Average county effect" with a small county-outline icon below; right arm points to "Average adult effect" with a small stick-figure crowd icon. A tiny chalk researcher stands at the fork deciding. Sub-tag above panel border: "BOTH ARE VALID CAUSAL PARAMETERS".
- **Body sentences** (for manual overlay):
  - For the *typical treated adult*, the GxT dynamic aggregate is +0.27 with the 2014-cohort component at -0.68 -- no CI comfortably excludes zero (Section 11 summary).
  - For the *typical treated county*, the GxT dynamic aggregate is +7.92 with the 2xT 5-year-out estimate at +16.96, CI [+6.83, +27.09] -- but HonestDiD shows this conclusion is fragile (Section 10).
  - When the policy is "should we cover *adults*?", population weighting is the decision-relevant target -- and the answer is small and statistically indistinguishable from zero (Section 12).
  - When the question is "which county *types* saw the largest effects?", equal weighting is the right tool -- but does not deliver a federal cost-benefit answer.
  - The manuscript flags the case as pedagogical (line 134): "The results are pedagogical in spirit and do not represent the best possible estimates of Medicaid's effect on adult mortality."
- **Transition to next**: N/A (final panel)

### Story Spine

> Regional DiD reveals that weighting choice -- not estimator choice -- is what flips the sign of Medicaid expansion's effect on mortality, challenging the assumption that the same data must yield a single causal answer.

### Margin Elements

- **Professor's note 1**: "The pre-period gap is essentially the same in both weightings (-54.77 vs -53.68) -- the reversal is driven entirely by who dominates the post-period!" -- positioned bottom-right margin upper, with arrow toward Panel 2
- **Professor's note 2**: "None of the six 2x2 95% CIs excludes zero -- power, not method, is the binding constraint!" -- positioned bottom-right margin lower, with arrow toward Panel 3
- **Color legend** (4 entries): Unweighted (counties): steel blue; Pop-weighted (adults): warm orange; Convergence: teal; Background assumption: muted gray
- **Right-margin sidebar**: "FIVE STAGES, TWO ANSWERS" -- vertical list along the right edge of the grid in muted gray. Rows: "2x2 cells: +0.12 / -2.56", "2x2 TWFE: +0.12 / -2.56", "2x2 DRDID: -1.23 / -3.76", "2xT dynamic: +9.43 / -0.68", "GxT dynamic: +7.92 / +0.27". Footnote: "Gap range: 2.5 -- 10.1 deaths / 100k".
- **Background formulas** (5 fragments + 1 DAG): "ATT(2014) = (Y_T,post - Y_T,pre) - (Y_C,post - Y_C,pre)", "ATT(g,t) = E[Y_i,t(g) - Y_i,t(inf) | G_i = g]", "ATT_DR = (1/n) sum (w1 - w0)(dY - mu)", "G_i in {2014, 2015, 2016, 2019, inf}", "Delta^RM: |Delta_post| <= M-bar * max|Delta_pre|", and a small chalk DAG (D -> Y with U as confounder) -- all at 15-20% opacity

### Tracked Estimators (referenced by the right-margin sidebar)

- **2x2 cell-means**: +0.122 unweighted / -2.563 weighted -- the headline four-cell DiD (Section 4)
- **2x2 TWFE long-difference**: +0.122 / -2.563 -- algebraically identical to cells on a balanced panel (Section 5)
- **2x2 DRDID (Callaway-Sant'Anna)**: -1.226 / -3.756 -- doubly-robust 2x2 with six covariates (Section 7)
- **2xT dynamic ATT (avg e >= 0)**: +9.428 / -0.684 -- 2014 cohort only, 11 event times (Section 8)
- **GxT dynamic ATT (avg e >= 0)**: +7.917 / +0.266 -- all four cohorts pooled (Section 9b)

### Three Estimands at Play

- **Conditional ATT (unweighted)**: average effect on the *typical treated county*, conditional on covariates X
- **Conditional ATT (population-weighted)**: average effect on the *typical treated adult*, conditional on covariates X
- **Group-time ATT(g, t)**: cohort-specific effect at calendar time t, the building block of the Callaway-Sant'Anna design

### Key Equations On Screen

- **ATT(2014) = (Y_T,post - Y_T,pre) - (Y_C,post - Y_C,pre)** (Panel 2 sub-equation; manuscript Eq. for the headline 2x2)
- **beta^{2x2} identical across Levels / TWFE / Long-diff** (Panel 3 sub-equation; manuscript Result 1, line 234)
- **ATT_DR = (1/n) sum (w1 - w0)(dY - mu)** (background; Section 7 doubly-robust estimator, manuscript Eq. eqn:ATT_DR_estimator at line 446)
- **ATT(g, t) = E[Y_i,t(g) - Y_i,t(inf) | G_i = g]** (background; Section 9 group-time ATT)
- **Delta^RM: |Delta_post| <= M-bar * max|Delta_pre|** (Panel 5 sub-equation; HonestDiD relative-magnitudes restriction, Section 10)

### Message Inventory (Step 0.6 audit)

ON-IMAGE (8): (1) sign reversal +0.12 vs -2.56, (2) 11-pp mass swing, (3) Three TWFE specs collapse to one number, (4) County-vs-adult is two estimands, (5) Five-estimator panel converges within a weighting, (6) HonestDiD breakdown M-bar < 0.25, (7) 20 million newly insured framing, (8) Weighting chooses the policy question.

MARGIN (2): pre-period gap identical in both weightings (-54.77 vs -53.68); none of six 2x2 95% CIs excludes zero.

REFERENCE (3): 2,604 counties / 11 years / 28,644 rows; cohort-by-cohort estimates (2015: +4.94 -> +10.04, 2016: -17.31 -> -12.57, 2019: +3.48 -> +3.31); bootstrap iterations BITERS = 2,000.
