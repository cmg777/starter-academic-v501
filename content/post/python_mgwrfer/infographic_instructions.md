# Three Channels, One Fix: MGWFER vs the Paper's Six Estimators

## Section A: Full Image Generation Prompt

Create a 1920x1080 landscape digital chalk illustration on a dark navy background (#0e1545). The style is academic chalkboard sketchnote: all lettering appears hand-drawn in chalk with slightly irregular strokes, chalk-dust particles float near text edges, and faint smudge marks add realism. The overall feel resembles a photograph of an expertly annotated university lecture chalkboard.

The composition features a title banner centred at the top, six panels in a 3-column by 2-row grid below it, and a vertical sidebar in the right margin listing six estimators. Each panel has a chalk-drawn rounded-rectangle border in steel blue (#8bb8e0) with slightly uneven edges; panel numbers appear as small warm-orange (#e8956a) circled numerals in the top-left corner. Chalk arrows with dust particles connect the panels in reading order: 1 to 2 to 3 across the top row, vertically from 3 down to 4, then 4 to 5 to 6 across the bottom.

The colour system uses six chalk colours. Background navy blue #0e1545 reads as a real chalkboard. Body text and outlines are chalk white #f0ece2. Panel titles, headers, and the "STAGE 1" / "STAGE 2" tags above Panels 4 and 5 are steel blue #8bb8e0 in chalk small-caps. Warm orange #e8956a is reserved for the three BIG numbers and for the `sc / α_i` symbol. Teal #00d4c8 marks positive emphasis, recovery sketches, and "place is now estimable" tags. Muted chalk gray #b0a89a carries annotations, the right-margin sidebar, and faint background formulas. Each panel uses at most three foreground colours.

The title banner sits above the panel grid, centred. The main title reads "THREE CHANNELS, ONE FIX: MGWFER vs THE PAPER'S SIX ESTIMATORS" in large steel-blue chalk small-caps. Beneath it, in smaller chalk-white italic, the guiding question reads: "If unobserved geography drives both x and y, can a panel within-transformation alone identify causal effects?"

Panel 1 (top-left): Title "THREE CHANNELS, ONE LEAK" in steel blue small-caps. A chalk tree labelled "sc" sits centre-panel; three arrows fan out from the trunk. The top arrow points to a small `y` ("1. intrinsic"). The middle arrow bends through a `β` symbol ("2. behavioural"). The bottom arrow, warm orange and thicker, points to a row of `x_k` symbols ("3. INDIRECT — the leak"). A note beneath reads "Cor(x_k, sc) ≈ 0.84 in our DGP". Callout in warm orange: "Place leaks three ways". Chalk arrow to Panel 2.

Panel 2 (top-centre): Title "INDIRECT CONTAMINATION" in steel blue small-caps. A chalk-drawn pair of overlapping shadows — one labelled `x_4` and one labelled `y` — joining at the silhouette of a free-standing tree labelled `sc`. A small chalk equation floats above the tree: `β̂_k = β_k + δ_k`, with `δ_k` underlined in warm orange and a small label "Wooldridge bias". Beneath one shadow a chalk note reads "true β_4 ≡ 0". Callout in large warm orange chalk numerals: "Cor(x_4, y) = 0.84" (BIG number 1). Chalk arrow to Panel 3.

Panel 3 (top-right): Title "OLS OVERSHOOTS, MGWR INVERTS" in steel blue small-caps. A vertical chalk line splits the panel. Left half: two stacks of chalk tally marks — a tall "OLS ≈ 6" and a short "FE ≈ 1.5", with a note "true β = 1.5" arrowed to the short stack. Right half: a tilted hand mirror showing an inverted warped reflection — the object labelled "true β_1", the reflection "PMGWR β̂_1". A banner under both halves reads "Global *and* local fail". Callout in large warm orange chalk numerals: "Corr = −0.46" (BIG number 2). Chalk arrow down to Panel 4.

Panel 4 (bottom-left, Comparison metaphor): A steel-blue tag "STAGE 1" sits above the panel border. Title "DEMEAN — WATERMARK GONE" in steel blue small-caps. A chalk balance scale: the left pan holds three identical postcards stamped with a faint watermark `α_i`; the right pan holds the same three with the watermark gone, the images now legible. An arrow between the pans is labelled `ỹ_it = y_it − ȳ_i`. A note below reads "machine-zero residual ≈ 1e-15". Callout in teal: "Subtract once, see clearly". Chalk arrow to Panel 5.

Panel 5 (bottom-centre): A steel-blue tag "STAGE 2" sits above the panel border. Title "PLACE RECOVERED" in steel blue small-caps. Side-by-side chalk fingerprints — left "true sc_i", right "MGWFER α̂_i" — with delicate teal hairlines linking matching ridges. Below them a chalk equation `α̂_i = ȳ_i − Σ_k β̂_k(u,v)·x̄_ik`, with "Eq. 30" in muted gray. A teal flag above the right fingerprint reads "225/225 sig.". Callout in large warm orange chalk: "r ≈ 1.000" (BIG number 3), subtext chalk-white "RMSE 0.54". Chalk arrow to Panel 6.

Panel 6 (bottom-right): Title "FIGURE 9 — STRIPES vs CLEAN" in steel blue small-caps. Three small chalk-sketched square grids side-by-side, deliberately uneven (NOT precise heat maps). Left grid labelled "MGWR_cs", with vertical stripe shading drawn as parallel top-to-bottom chalk hatches. Middle grid labelled "PMGWR", same column-aligned stripes, slightly more intense. Right grid labelled "MGWFER", uniform near-zero with only stray chalk dots. A note beneath the right grid: "no false β̂_4 structure". Callout in teal: "92% RMSE drop". A small tag below the panel: "Place is now estimable."

Beyond the panel grid, the bottom-right margin holds two professor's notes in italic chalk-white text, each with its own hand-drawn chalk arrow. The first reads "If sc → x_k, MGWR returns β + δ. Demean once. Now you have β." with an arrow toward Panel 4. The second, lower, reads "Two stages: subtract, then read what's left." with an arrow toward Panel 5. The bottom-left margin holds a four-entry colour legend in small chalk text with colour dots: "sc / α_i: warm orange", "x_k: chalk white", "β_k slopes: steel blue", "recovery / clean estimates: teal".

The right margin holds a vertical sidebar legend in muted chalk gray titled "SIX ESTIMATORS TRACKED". Below the title, two columns of three chalk entries each: the left column reads "OLS_cs", "OLS_pool", "FE (global)" — with a small steel-blue tick mark next to "FE". The right column reads "MGWR_cs", "PMGWR", "MGWFER" — with a small steel-blue tick mark next to "MGWFER". A short chalk note under the columns reads "ticks = recovers truth".

Across the entire background, at 15-20% opacity in muted chalk gray (#b0a89a), six faint chalk fragments float behind the panels: the outcome equation `y = sc + x β + ε`; the covariate equation `x_k = 0.05·sc + N(0, 0.5)`; the Wooldridge bias `β̂_k = β_k + δ_k`; the recovery equation `α̂_i = ȳ_i − Σ_k β̂_k x̄_k`; the degrees-of-freedom note `df = NT − K − N = 446`; and a small DAG with three nodes "SC → X → Y" plus a curved arrow "SC → Y". Chalk-dust particles cluster more densely near hand-drawn shapes; subtle smudge marks suggest passages that have been partially erased and rewritten.

This prompt generates the base image. The AI renders: title banner with guiding question; six panel titles; six central sketch compositions (each with main metaphor and the sub-sketches described); three BIG warm-orange numbers in Panels 2, 3, 5; three coloured callouts in Panels 1, 4, 6; two italic professor's notes with arrows; the four-entry colour legend; the right-margin SIX ESTIMATORS sidebar. Background formulas stay recessive at 15-20% opacity. All longer text — body sentences, transitions, full panel narratives — is provided in the panel reference data for manual overlay. Keep on-image text minimal and large on the 1920x1080 canvas.

---

## Section B: Negative Prompt

Do not render: photorealistic textures, 3D shading, glossy surfaces, photographic lighting, gradient fills, vector-graphics smoothness, perfect circles, perfectly straight edges, watercolour, oil paint, anime style, cartoon faces, modern flat-design icons, infographic clip-art, stock-photo people, real maps with country outlines or geographic features (Panel 1's "tree of sc" must be metaphorical), real heat maps with smooth colour gradients (Panel 6's three grids must be uneven hand-drawn squares with chalk hatching, not photorealistic spatial visualisations), bar charts with numeric axis ticks and gridlines (Panel 3's bar tally must be chalk tally marks, not a real bar chart), scatterplots with axis ticks, mathematical typesetting in serif fonts (LaTeX-style rendering — every formula must be in chalk strokes), brand logos, watermarks (except the chalk metaphor on Panel 4's postcards), emojis, neon colours, gradient backgrounds, dark-mode UI elements, computer-generated typography, sans-serif fonts, capital-only blocky text that looks computer-typed, hashtags, social-media UI, screenshots, dollar signs, currency symbols, copyright marks, multiple title banners, redundant text labels on every shape, footers, page numbers, dates.

---

## Section C: Condensed Prompt (~230 words)

1920x1080 dark-navy (#0e1545) chalkboard sketchnote. Steel-blue (#8bb8e0) small-caps title: "THREE CHANNELS, ONE FIX: MGWFER vs THE PAPER'S SIX ESTIMATORS". Chalk-white italic guiding question below.

3x2 grid of 6 panels, steel-blue rounded borders, warm-orange (#e8956a) circled numerals. Arrows 1→2→3, down to 4, then 4→5→6. Right-margin sidebar "SIX ESTIMATORS TRACKED": OLS_cs, OLS_pool, FE (✓), MGWR_cs, PMGWR, MGWFER (✓).

P1: chalk tree "sc" with three arrows out — to y, to β, to x_k (warm orange, thick, "INDIRECT"). Warm-orange callout "Place leaks three ways".

P2: two shadows joining at tree "sc"; floating `β̂_k = β_k + δ_k`, δ_k underlined. BIG "Cor(x_4, y) = 0.84".

P3: split — left chalk tally "OLS ≈ 6" vs "FE ≈ 1.5"; right warped mirror inverting true β_1 into PMGWR β̂_1. BIG "Corr = −0.46". Sub-banner "Global *and* local fail".

P4 (Comparison, tag "STAGE 1"): balance scale, three watermarked postcards left, same erased right; arrow `ỹ = y − ȳ_i`. Teal "Subtract once, see clearly".

P5 (tag "STAGE 2"): fingerprints true sc / MGWFER α̂ with teal hairlines linking ridges; `α̂_i = ȳ_i − Σ β̂_k x̄_k`. BIG "r ≈ 1.000". Teal flag "225/225 sig.".

P6: three uneven chalk grids MGWR_cs / PMGWR / MGWFER for β̂_4; first two vertical-stripe hatching, third uniform clean. Teal "92% RMSE drop".

Faint gray 15-20% background: outcome and covariate eqs, Wooldridge bias, Eq. 30, df = 446, SC→X→Y DAG. Two italic professor's notes; four-entry colour legend. Chalk dust, smudges. Hand-drawn, uneven strokes. No precise charts, no gradient fills, no photorealism.

---

## Section D: Panel Reference Data (for manual text overlay)

### Panel 1 — THREE CHANNELS, ONE LEAK

- **Position**: row 1, column 1 (top-left).
- **Dramatic function**: Hook.
- **Story beat**: "Place enters spatial data through three distinct channels — only one of them breaks MGWR."
- **Callout**: "Place leaks three ways" (warm orange).
- **Key number**: N/A (concept Hook).
- **Central sketch**: a chalk tree labelled "sc" with three arrows out — to `y` (intrinsic), to a `β` symbol (behavioural), to `x_k` (indirect, in warm orange).
- **Body sentences** (for manual overlay):
  - Following Li & Fotheringham (2026, Section 2), spatial context affects spatial data through three distinct contextual channels.
  - **Intrinsic** contextual effects: unmeasured attributes of place that *directly* shift `y`. In MGWR these are captured by the local intercept; in MGWFER, by the individual fixed effect `α_i`.
  - **Behavioural** contextual effects: place *modulates the slopes* `β_k`. This is the channel that the original MGWR was designed to estimate via covariate-specific bandwidths.
  - **Indirect** contextual effects (the paper's headline addition): place shapes the *levels of the covariates themselves*. This is the bias source that MGWR cannot remove on its own.
  - In our DGP, every covariate satisfies `x_kt = 0.05·sc + N(0, 0.5)` (paper Eqs. 40-43), making `Cor(x_k, sc) ≈ 0.84` — the indirect channel is mechanically on.
- **Transition to next**: "What happens when the indirect channel is active and a covariate has zero causal effect?"

### Panel 2 — INDIRECT CONTAMINATION

- **Position**: row 1, column 2 (top-centre).
- **Dramatic function**: Stakes.
- **Story beat**: "Wooldridge's omitted-variable formula `β̂_k = β_k + δ_k` materialises empirically as a 0.84 correlation between a truly-null covariate and the outcome."
- **Callout**: "Cor(x_4, y) = 0.84" (warm orange) — **BIG NUMBER 1**.
- **Key number**: 0.84 — the Pearson correlation between the null covariate `x_4` and the outcome `y`, induced entirely by the shared parent `sc`.
- **Central sketch**: two overlapping shadows joining at a free-standing tree labelled "sc"; floating chalk equation `β̂_k = β_k + δ_k` with `δ_k` underlined.
- **Body sentences**:
  - The post's Wooldridge-style derivation (Section 3) shows that when `sc` is unobserved and projected linearly on `X`, OLS recovers `β̂_k = β_k + δ_k`, not `β_k`.
  - `δ_k` is exactly the *indirect contextual effect* — the strength of the link `sc → x_k`. The bigger that link, the bigger the bias.
  - In our DGP `β_4 ≡ 0` by construction (the outcome equation is `y = sc + β_1·x_1 + β_2·x_2 + β_3·x_3 + ε` — no `β_4·x_4` term).
  - Yet `Cor(x_4, y) = 0.840` because both share the spatial-context parent — a textbook spurious correlation.
  - OLS reads that 0.84 as a real effect: cross-sectional OLS returns `β̂_4 = 4.82` at p < 5.6e-14. False certainty.
- **Transition to next**: "If global OLS misfires this badly, surely a *local* model with spatial flexibility fixes it?"

### Panel 3 — OLS OVERSHOOTS, MGWR INVERTS

- **Position**: row 1, column 3 (top-right).
- **Dramatic function**: First Attempt fails (compound — global *and* local breakdown).
- **Story beat**: "Naive global OLS overshoots `β_k` by ~4×; naive local MGWR is *anti-correlated* with the truth."
- **Callout**: "Corr = −0.46" (warm orange) — **BIG NUMBER 2**.
- **Key number**: −0.46 — Pearson correlation between PMGWR's `β̂_1` map and the true `β_1` dome (anti-correlated).
- **Central sketch**: split scene — chalk bar-tally of "OLS ≈ 6" vs "FE ≈ 1.5" on the left; warped hand mirror inverting "true β_1" into "PMGWR β̂_1" on the right.
- **Body sentences**:
  - **Global Table 2** (paper, replicated): cross-sectional OLS returns `β̂_1 = 5.48`, `β̂_2 = 5.69`, `β̂_3 = 6.09` for true values of 1.5 — overestimates by ~4×. Pooled OLS is identical.
  - Worse, both OLS estimators "detect" `β̂_4 ≈ 4.2-4.8` at p < 1e-13 — spurious significance on the null covariate, driven entirely by the shared `sc` parent.
  - The individual FE estimator corrects all four: `β̂_1 = 1.57`, `β̂_2 = 1.54`, `β̂_3 = 1.55`, `β̂_4 = 0.02` (p = 0.66, n.s.). The within-transformation neutralises `δ_k` at the global level.
  - **Local Table 3** is even more striking: cross-sectional MGWR (Corr = −0.39) and PMGWR (Corr = −0.46) both produce `β̂_1` surfaces *anti-correlated* with truth. The dome is inverted.
  - PMGWR's RMSE on `β_1` is 2.30 — a constant guess of 1.5 would beat it. Local flexibility alone is not enough.
- **Transition to next**: "If we have panel data and `sc` is time-invariant, can a single demeaning step do what spatial flexibility cannot?"

### Panel 4 — STAGE 1 — DEMEAN. WATERMARK GONE.

- **Position**: row 2, column 1 (bottom-left). Comparison metaphor required.
- **Dramatic function**: Twist / breakthrough mechanism.
- **Story beat**: "Subtract each unit's time-series mean — and the time-invariant confounder cancels exactly."
- **Callout**: "Subtract once, see clearly" (teal).
- **Key number**: N/A (this panel visualises the within-transformation mechanism).
- **Central sketch**: balance scale with three watermarked postcards on the left pan and the same three with the watermark erased on the right pan; small arrow labelled `ỹ_it = y_it − ȳ_i`.
- **Body sentences**:
  - Stage 1 of MGWFER's two-stage algorithm (paper Algorithm 1, Eqs. 16-17) subtracts each unit's time-series mean from every observation.
  - Because `α_i` is constant in time, `α_i − α_i = 0` for every observation — the time-invariant confounder cancels exactly, to machine precision.
  - Demeaned `y_within` spans only −2.1 to +1.8, versus raw `y` from −0.6 to +66.2 — the confounder dominated the raw variation by a factor of ~30.
  - MGWR is then re-applied to the within-transformed panel with `constant=False` (the unit-level mean is already absorbed) and `time=N_TIME`, on standardised inputs (paper Eqs. 26-28).
  - Once Stage 1 returns the standardised slopes, paper Eq. 29 rescales them: `β̂_bwk(u_i, v_i) = β̂^S_bwk(u_i, v_i) · σ_Ÿ / σ_Ẍ_k`.
- **Transition to next**: "Stage 1 produced clean slopes. Can a Stage 2 step give us back the confounder itself as a per-unit estimate?"

### Panel 5 — STAGE 2 — PLACE RECOVERED

- **Position**: row 2, column 2 (bottom-centre).
- **Dramatic function**: Surprise / payoff.
- **Story beat**: "Eq. 30 recovers `α̂_i` per unit at Pearson r ≈ 1.000, with t-tests flagging 225/225 units significant at 5%."
- **Callout**: "r ≈ 1.000" (warm orange, with sub-text "RMSE 0.54") — **BIG NUMBER 3**.
- **Key number**: 0.9996 — Pearson correlation between MGWFER's `α̂_i` and the true `sc_i`.
- **Central sketch**: side-by-side fingerprints (true `sc` left, MGWFER `α̂` right) with teal hairlines linking matching ridges; chalk equation `α̂_i = ȳ_i − Σ_k β̂_k(u,v)·x̄_ik` beneath, labelled "Eq. 30"; teal flag "225/225 sig.".
- **Body sentences**:
  - Stage 2 applies paper Eq. 30: `α̂_i = ȳ_i − Σ_k β̂_bwk(u_i, v_i)·x̄_{ik}` — take each unit's mean outcome and subtract what the local slopes attribute to the mean covariates.
  - The result tracks the true `sc` surface at Pearson `r = 0.9996` (≈1.000), RMSE 0.54 on a 50-unit-wide range.
  - The estimated range [1.45, 51.62] is near-identical to the true [2.07, 51.55] — a 0.6-unit undershoot at the low end.
  - Per-unit t-tests use the variance machinery in paper Eqs. 32-37: `σ̂² = (T / (T-1))·σ_Ÿ²·σ̂_s²`, then `Var[α̂_i] = σ̂²/T + x̄_i^⊤ Var[β̂_i] x̄_i`, with `df = NT − K − N = 446`.
  - All 225 units pass the 5% test — the intrinsic contextual effect is universal in this DGP, as it must be (`sc_i > 0` everywhere).
- **Transition to next**: "If MGWFER recovers both the slopes and the confounder, what does the spurious-coefficient surface look like — the test the paper made into its headline visual?"

### Panel 6 — FIGURE 9 — STRIPES vs CLEAN

- **Position**: row 2, column 3 (bottom-right).
- **Dramatic function**: Resolution.
- **Story beat**: "Replicate paper Figure 9 — MGWR_cs and PMGWR's `β̂_4` surfaces are full of column-aligned spurious stripes; MGWFER's is clean."
- **Callout**: "92% RMSE drop" (teal).
- **Key number**: 92-96% — slope-RMSE reduction across `β_1, β_2, β_3, β_4` under MGWFER vs PMGWR.
- **Central sketch**: three small hand-drawn chalk grids labelled MGWR_cs / PMGWR / MGWFER; first two with parallel vertical stripe hatching, third uniform near-zero with only a couple of stray dots.
- **Body sentences**:
  - Paper Figure 9 reports the spurious `β̂_4` surface from each local model. We replicate it.
  - MGWR_cs and PMGWR both produce a column-aligned vertical-stripe bias pattern that tracks `sc`'s horizontal gradient — the indirect contamination has nowhere to go but into the slopes, and the bandwidth search dresses it up as a "local effect".
  - MGWFER's `β̂_4` is structureless and near-zero everywhere: RMSE against truth is 0.14 (versus MGWR_cs 2.38, PMGWR 1.86) — a ~13× reduction.
  - Across `β_1, β_2, β_3, β_4`, MGWFER's RMSEs drop 92-96% relative to PMGWR. Corr(`β̂_1`, true) flips from −0.46 to +0.82.
  - Empirical analogue: the paper's **Georgia case study** (Section 16) reverses the sign of poverty's effect on educational attainment and inflates intrinsic contextual effects by an order of magnitude — the policy story changes when you switch from MGWR to MGWFER.
- **Transition to next**: end of arc.

---

### Story Spine

> MGWFER reveals that place enters spatial data through three distinct channels — intrinsic, behavioural, and indirect — and that the indirect channel alone inverts cross-sectional MGWR's coefficient surfaces, by demonstrating a single within-transformation that recovers both the spatially varying slopes and the unit-level intrinsic contextual effects, challenging the assumption that spatial flexibility alone identifies causal effects.

### Six Estimators Tracked

A compact reference matching the right-margin sidebar in the image. Tick marks indicate the two estimators that recover truth.

- **OLS_cs** (cross-sectional OLS, single period, 225 obs): returns global `β̂_k ≈ 5.5-6.1` for true 1.5; spuriously flags `β̂_4 ≈ 4.8` significant at p < 1e-13.
- **OLS_pool** (pooled OLS, all 675 obs): essentially identical bias profile to OLS_cs; `β̂_k ≈ 5.8-6.3`.
- **FE (global)** ✓ (individual fixed effects via within-transformation, 675 obs): recovers `β̂_1 = 1.57`, `β̂_2 = 1.54`, `β̂_3 = 1.55`, `β̂_4 = 0.02 (n.s.)`. Global, not spatial.
- **MGWR_cs** (cross-sectional MGWR, single period, 225 obs): RMSE on `β_1` = 2.16; Corr(`β̂_1`, true) = −0.39. Local intercept range [2.42, 21.84] vs true [2.07, 51.55].
- **PMGWR** (pooled MGWR, all 675 obs): RMSE on `β_1` = 2.30; Corr(`β̂_1`, true) = −0.46. Local intercept range [−11.27, 10.04].
- **MGWFER** ✓ (Li & Fotheringham 2026): RMSE on `β_1` = 0.18; Corr(`β̂_1`, true) = +0.82. Stage 2 `α̂_i` range [1.45, 51.62], Pearson r = 0.9996 vs true `sc`.

### Three Contextual Channels (Panel 1 reference)

- **Intrinsic** — unmeasured attributes of place directly shifting `y`. Statistical home: local intercept (MGWR) or individual fixed effect (MGWFER `α_i`).
- **Behavioural** — place modulating the slopes `β_k(u_i, v_i)`. Statistical home: spatially varying coefficient surfaces.
- **Indirect** — place shaping the *levels* of the covariates `x_k`. Statistical home: the bias term `δ_k` in `β̂_k = β_k + δ_k`. This is the channel MGWFER exists to remove.

### Key Equations on Screen

- **DGP** (in-panel + background, paper Eq. 45): `y_it = sc_i + β_1·x_1 + β_2·x_2 + β_3·x_3 + ε_it` — note no `β_4·x_4` term, by design.
- **Indirect channel** (in-panel + background, paper Eqs. 40-43): `x_kt = 0.05·sc_i + N(0, 0.5)`.
- **Wooldridge bias** (in-panel + background, paper Eq. 8): `β̂_k = β_k + δ_k` where `δ_k` is the linear projection coefficient of `sc` on `x_k`.
- **Stage 1 within-transformation** (in-panel + background, paper Eq. 17): `ỹ_it = y_it − ȳ_i`.
- **Stage 2 recovery** (in-panel + background, paper Eq. 30): `α̂_i = ȳ_i − Σ_k β̂_bwk(u_i, v_i)·x̄_{ik}`.
- **Degrees of freedom** (background, paper p. 14): `df = NT − K − N = 675 − 4 − 225 = 446`.

### Margin Elements

- **Professor's note 1** (bottom-right margin, italic chalk-white, arrow toward Panel 4): "If sc → x_k, MGWR returns β + δ. Demean once. Now you have β."
- **Professor's note 2** (bottom-right margin, italic chalk-white, lower, arrow toward Panel 5): "Two stages: subtract, then read what's left."
- **Colour legend** (bottom-left margin, small chalk text with dots — four entries):
  - `sc / α_i`: warm orange.
  - `x_k`: chalk white.
  - `β_k` slopes: steel blue.
  - Recovery / clean estimates: teal.
- **Six-estimator sidebar** (right margin, vertical, muted chalk gray, titled "SIX ESTIMATORS TRACKED"): two columns of three entries each; left column "OLS_cs / OLS_pool / FE (✓)"; right column "MGWR_cs / PMGWR / MGWFER (✓)"; note beneath: "ticks = recovers truth".
- **Background formulas** (15-20% opacity, muted chalk gray, floating behind the panel grid): DGP equation, covariate equation, Wooldridge bias, Eq. 30, df note, and a small `SC → X → Y` DAG with curved `SC → Y` arrow.
