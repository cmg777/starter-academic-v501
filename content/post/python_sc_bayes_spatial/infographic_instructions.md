# Infographic instructions — `python_sc_bayes_spatial`

Image-generation brief for a single 1920×1080 landscape infographic summarising
*Bayesian Spatial Synthetic Control in Python: California's Proposition 99 with
scspill and mlsynth*.

---

## A — Full prompt

Create a 1920x1080 landscape digital chalk illustration on a dark navy
background (#0e1545), drawn as though on a large slate lecture board, with the
slightly dusty, hand-drawn line quality of chalk on stone. Chalk-dust particles
float near text edges and faint smudge marks add realism.

The palette is strictly limited: chalk white (#f0ece2) for primary linework and
headline numerals, pale blue (#8bb8e0) for structural elements, panel borders
and panel titles, warm orange (#e8956a) for the treated unit, for anything that
carries the policy, and for callouts, teal (#00d4c8) for the corrected or
recommended alternative, and warm grey (#b0a89a) for annotations and
de-emphasised detail. No other colours.

At the top, a single-line title in hand-lettered chalk capitals: WHO ELSE WAS
TREATED — AND HOW SURE ARE WE? Beneath it in smaller chalk script: California's
Proposition 99, and the state that quit smoking for a law it never passed.

Arrange six panels in a 3-across, 2-down grid, each bounded by a hand-drawn
rounded rectangle in steel blue (#8bb8e0) with slightly uneven edges, and a
small circled numeral in warm orange (#e8956a) in its top-left corner. Simple
chalk arrows with faint dust connect the panels in reading order: 1 to 2 to 3
across the top row, a vertical arrow from 3 down to 4, then 4 to 5 to 6 across
the bottom row.

Behind the panels, faint chalk equation fragments in warm grey at 15-20%
opacity: Yc_t = rho(w Y1t + W Yc_t) + Xt beta + u_t; bias_t = -sum_j alpha_j
xi_jt; alpha_j given lambda_j ~ N(0, lambda_j squared); abs(rho) < 0.95; and a
small three-node chalk diagram in which CA is joined to NV by a dashed arrow
labelled rho, with a third node further off labelled ID.

Panel 1, upper left: title THE NUMBER THE TEXTBOOKS SETTLED ON in steel blue
small-caps. A hand drawn in chalk presses a wax seal onto the silhouette of
California; the seal bears the numeral −18 in heavy chalk. Around the
silhouette, faint chalk cigarette-pack outlines. Callout beneath in warm orange:
the number the textbooks settled on.

Panel 2, upper centre: title THIRTY-NINE STATES, ONE LINE in steel blue
small-caps. A chalk-drawn fan of thirty-nine index cards seen edge-on; one card,
in warm orange and pulled forward from the stack, is stamped 1988. Along the
bottom edge of the stack, small tally strokes hatched in warm grey. Callout in
warm orange: thirty-nine states, one line leaves.

Panel 3, upper right: title THE SIMPLEX PICKS FIVE in steel blue small-caps. A
chalk sieve held above a bowl: thirty-eight small chalk grains are poured in at
the top and exactly five fall through, the rest caught in the mesh. Callout in
warm orange: five donors carry the whole story.

Panel 4, lower left: title SAME ANSWER, WIDER POOL in steel blue small-caps. A
chalk balance scale, perfectly level. The left pan, drawn in chalk white
(#f0ece2), holds five thick stacked blocks. The right pan, outlined in teal,
holds twenty-five thin plates. The beam is exactly horizontal. Callout in warm
orange: five donors become twenty-five.

Panel 5, lower centre: title THE LEAK HAS A NAME in steel blue small-caps. A
chalk relief map of the western United States with the California–Nevada border
drawn as a dashed chalk line. A thick warm-orange chalk arrow crosses that
border from California into Nevada and turns downward into a hatched chalk
sinkhole scooped out of Nevada, labelled −5.50. Two much thinner chalk arrows
continue faintly into Idaho and Utah and fade out. Beneath the map, two chalk
numerals joined by a downward arrow: −15.68 then −16.87. Callout in warm orange:
Nevada's sales fell too: −5.50.

Panel 6, lower right: title AN HONEST INTERVAL in steel blue small-caps. A chalk
measuring tape stretched horizontally across the panel. At its left end, a
hairline segment barely wider than the tape itself is bracketed and labelled
0.38. Dwarfing it, a broad teal-shaded segment is bracketed and labelled 12.71.
Written large in chalk white in the middle of the broad segment: −16.87. A small
chalk clamp, drawn cut open, sits beside the teal bracket. Callout in warm
orange: −16.87, and 33× wider than published.

In the bottom-right margin, outside the grid, two professor's notes in small
italic chalk, each with its own hand-drawn arrow. The first, aimed at Panel 4:
"the ATT is stable; the donor list is not — five states or twenty-five, same
answer." The second, aimed at Panel 6: "short chain and pinned weights are two
different failures; the chain was the smaller one."

In the bottom-left margin, a small colour legend with chalk dots: orange = the
treated unit and anything carrying the policy; teal = the corrected estimate;
chalk white = the classical baseline.

Along the bottom edge, a thin chalk rule and three small annotations in warm
grey: 1,209 observations · 5 → 25 active donors · ESS(ρ) 137 from 250,000 draws.

The overall impression should be an expert's working blackboard: confident,
legible, slightly imperfect linework, generous negative space, nothing
photographic and nothing glossy.

This prompt generates the base image. The AI should render clearly: the title
banner, the six panel titles in steel blue, the six central sketch
illustrations, the three key numbers in large warm orange chalk, and the six
callout phrases. All other text — body sentences, annotations, transition
phrases — is supplied in the panel reference data below for manual overlay in an
image editor. Keep text elements minimal and large for legibility.

## B — Negative prompt

photorealistic, 3D render, glossy, glassy, neon, gradient mesh, drop shadows,
lens flare, stock-photo people, corporate clipart, emoji, watermark, signature,
colour outside the stated palette, cluttered background, tiny illegible text,
more than six panels, actual cigarettes or smoking imagery, political symbols,
flags, real logos, misspelled labels, precise statistical charts, bar charts
with numeric axis ticks, scatter plots, gridlines, pie charts, line charts with
labelled axes

## C — Condensed prompt (<250 words)

A 1920x1080 dark navy (#0e1545) chalkboard infographic titled WHO ELSE WAS
TREATED — AND HOW SURE ARE WE?, drawn in dusty hand-lettered chalk. Palette
limited to chalk white, pale blue, warm orange, teal and warm grey. Six panels
in a 3×2 grid, steel-blue borders, orange circled numerals, chalk arrows
connecting them in reading order.

One: a chalk hand pressing a wax seal reading −18 onto a California silhouette.
Two: a fan of thirty-nine index cards, one orange card pulled forward and
stamped 1988. Three: a chalk sieve where thirty-eight grains are poured in and
five fall through. Four: a perfectly level balance scale — five thick blocks on
the chalk-white left pan, twenty-five thin plates on the teal-outlined right
pan. Five: a relief map of the western United States, a thick orange arrow
crossing a dashed California–Nevada border and turning into a hatched sinkhole
over Nevada labelled −5.50, with −15.68 → −16.87 written beneath. Six: a chalk
measuring tape with a hairline 0.38 segment beside a broad teal 12.71 segment,
−16.87 written large across it, and a cut-open clamp alongside.

Each panel carries a steel-blue small-caps title and a warm-orange callout
beneath. Bottom rule with three grey annotations: 1,209 observations · 5 → 25
active donors · ESS 137 from 250,000 draws.

Confident, legible, slightly imperfect linework. Generous negative space.
Nothing photographic, nothing glossy, no precise statistical charts.

---

## D — Panel reference data

### Story spine

**Everyone quotes what Proposition 99 did to California — but the law crossed the
state line, it crossed it in the direction nobody expected, and the interval the
published version reported was thirty-three times too narrow.**

### The three BIG numbers

These are the only three that get large-format treatment. Everything else is
supporting text.

| Number | Caption | Panel |
|---|---|---|
| **−5.50** | Nevada's spillover — from a law it never passed | 5 |
| **−16.87** | packs per capita per year, once the leak is modelled | 5 and 6 |
| **33×** | how much too narrow the published credible interval was | 6 |

### Three contextual numbers

- **1,209** observations — 39 states × 31 years
- **5 → 25** active donors, simplex versus horseshoe
- **137** effective sample size for ρ, from 250,000 draws

---

**Panel 1 — Hook.** *Position:* upper left. *Dramatic function:* Hook.
*Callout:* the number the textbooks settled on. *Key number:* −18.

ATT estimates across the ladder: classical −18.43, `mlsynth.BSCM` −18.85,
horseshoe at ρ = 0 −15.68, Bayesian spatial −16.87. The seal shows −18 because
that is what the simplex returns on this panel. Worth knowing before anyone
objects: the canonical Abadie–Diamond–Hainmueller figure is nearer −27, and the
difference is the predictor set — this panel carries only `cigsale` and
`retprice`, not the income, youth-share and beer-consumption predictors of the
original specification.

*Transition to 2 (Escalation):* the number came from somewhere — thirty-nine
somewheres.

**Panel 2 — Stakes.** *Position:* upper centre. *Dramatic function:* Stakes.
*Callout:* thirty-nine states, one line leaves. *Key number:* 1,209.

Thirty-nine states, 1970–2000, 1,209 observations. California 1970: 123 packs
per capita. California 2000: 41.6, against a synthetic California of 68.3 — a
gap of −26.7 packs. The 38-donor mean in 2000 is 92.1, so California ends the
period far below not only its own counterfactual but the typical donor state.
Treatment line at 1988; 18 pre-treatment years, 13 post.

*Transition to 3 (Complication):* but only five of them survived the constraint.

**Panel 3 — Attempt.** *Position:* upper right. *Dramatic function:* Attempt.
*Callout:* five donors carry the whole story. *Key number:* 5 of 38.

Simplex weights: Utah 0.343, Montana 0.254, Nevada 0.242, Connecticut 0.146, New
Hampshire 0.014. Thirty-three donors receive exactly zero. The top four carry
98.6% of the weight. Pre-treatment RMSE is 1.60 packs against a pre-period mean
of 117.7 — about 1.4%.

*Transition to 4 (Turn):* so let a prior choose instead.

**Panel 4 — Twist (Comparison).** *Position:* lower left. *Dramatic function:*
Twist. *Callout:* five donors become twenty-five. *Key number:* 5 → 25.

Under the horseshoe, 25 of 38 donors carry a posterior weight above 0.01 in
absolute value, against the simplex's five. (`mlsynth.BSCM`, a second horseshoe
implementation, gives 26 — and also fits an explicit intercept of 16.86 packs,
which is why its ATT sits three packs from the others.) Pre-treatment fit
improves sharply: RMSE 1.60 on the simplex against 0.19 for the spatial fit and
0.051 for BSCM. But the answer barely moves — every stage lands between −18.85
and −15.68, a 3.17-pack band. **The scales balance because the *answer* is
stable, not because the fits are equal.** Only Nevada's credible interval
excludes zero, so the wider pool looks more informative than it is.

*Transition to 5 (Complication):* the pool was never the real problem — one
donor was.

**Panel 5 — Surprise.** *Position:* lower centre. *Dramatic function:* Surprise.
*Callout:* Nevada's sales fell too: −5.50. *Key numbers:* −5.50 and −16.87.

Mean post-1988 spillovers: Nevada −5.50, Idaho −0.49, Utah −0.49, Wyoming −0.06,
every other donor below 0.05 in absolute value. Nevada absorbs 11.2× the
next-largest. ρ̂ = 0.316, 95% CrI [0.231, 0.403] — excludes zero, so SUTVA on the
donor pool is rejected by the model that nests it.

**Arrows point the same direction as the treatment effect, not against it**:
Nevada's sales fell, they did not rise. The prior hypothesis was cross-border
shopping *raising* Nevada's sales; the estimate says Nevada came in below its own
no-treatment path.

That sign is the whole reason the panel matters. A negative spillover on a
positively-weighted donor drags synthetic California down with it, so the
classical comparison gives the policy *less* credit than it deserves. The
horseshoe estimate therefore **understates** Proposition 99's effect by 1.19
packs, about 7%; the same plug-in on the simplex weights, where Nevada carries
0.242 rather than 0.200, gives 1.51 packs, about 8%. Nevada alone supplies −1.098
of the −1.130 bias identity — 97% of it.

*Transition to 6 (Resolution):* one leak, one honest interval.

**Panel 6 — Resolution.** *Position:* lower right. *Dramatic function:*
Resolution. *Callout:* −16.87, and 33× wider than published. *Key numbers:*
−16.87 and 33×.

Published R interval: [−16.78, −16.39], width 0.384, ESS(ρ) = 2.93. Corrected:
[−23.05, −10.33], width 12.713, ESS(ρ) = 136.8. Ratio 33×.

**Two separable causes, and chain length is the smaller one.** Running the R
specification 100× longer moves ESS(ρ) from 3.3 to 66.9 but the width only from
0.482 to 0.702. The remaining factor of eighteen comes from `propagate_alpha`:
the R code varies ρ across draws while holding the donor weights at their
posterior mean, so the reported interval carries no uncertainty at all about
which states make up synthetic California. The cut clamp in the sketch is that
second failure — ESS diagnoses the first, and asking what the interval
*conditions on* diagnoses the second.

### Tracked estimators

Classical SC (simplex) −18.43, 5 donors · `mlsynth.BSCM` (horseshoe with
intercept) −18.85, 26 donors · `scspill` at ρ = 0 −15.68, 25 donors · Bayesian
spatial SC **−16.87** ✓, 25 donors · `mlsynth.SPILLSYNTH(sar)` −16.52, an
independent port of the same paper.

### Message inventory

**ON-IMAGE** (rendered in the base illustration): the ATT ladder ends at −16.87
(P5, P6) · donor-pool composition is not robust, 5 versus 25 (P4) · the spillover
is concentrated in Nevada at 11.2× the next donor (P5) · the leak runs *toward*
the treatment effect (P5) · the published interval was 33× too narrow (P6) ·
SUTVA is rejected (P5, via ρ̂).

**MARGIN** (professor's notes): the ATT is stable while the donor list is not ·
short chain and pinned weights are two different failures.

**REFERENCE ONLY** (this appendix, not on the image): the bias identity
decomposition and Nevada's 97% share · the BSCM intercept of 16.86 · the
canonical ≈ −27 ADH figure · the Monte Carlo confirmation on planted truth · the
estimator-choice decision tree · pre-treatment RMSE by stage.

## E — Notes for whoever renders this

- **Panel 4's beam must be level.** If the scale tilts, the panel says the
  opposite of what it should. The two donor pools produce almost the same *ATT* —
  that is what balances. They do **not** produce the same pre-treatment fit
  (RMSE 1.60 against 0.051), so do not let any label imply they do.
- **Panel 5's arrow enters Nevada, and what it produces is a hole, not a pool.**
  The estimated spillover is negative — Nevada's sales fell. A basin that reads
  as "sales accumulating in Nevada" inverts the finding, which is why the sketch
  specifies a sinkhole scooped *out of* the state. The arrow direction (California
  → Nevada) is the direction of causal influence and is correct as drawn.
- **Panel 6's tape is a length comparison, not a timeline.** The hairline segment
  and the broad segment are two credible intervals for the same quantity, drawn to
  scale against each other. Do not add tick marks or axis numbers.
- **No smoking imagery.** The subject is a tax and an econometric method. Faint
  pack outlines in panel 1 are the limit.
- The `−` signs are minus signs (U+2212), not hyphens, and must read clearly at a
  glance in panels 1, 5 and 6.
