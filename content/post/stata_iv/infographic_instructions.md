# Infographic Instructions: stata_iv

Storyboard-first chalkboard infographic prompt for the post **Do Institutions Cause Prosperity? An IV Tutorial in Stata**. Target tool: **Gemini**. The Story Spine and the 6-beat narrative arc appear in Section D below.

---

## Section A: Full Image Generation Prompt

Create a 1920x1080 landscape digital chalk illustration on a dark navy background (#0e1545). The style is academic chalkboard sketchnote: all lettering appears hand-drawn in chalk with slightly irregular strokes, chalk-dust particles float near text edges, and faint smudge marks add realism. The overall feel resembles a photograph of an expertly annotated university lecture chalkboard.

The composition has a centered title banner spanning the top of the board, then six panels arranged in a 3-column by 2-row grid below the title with generous dark space between them — the navy background is itself a design element. Each panel is bounded by a chalk-drawn rounded rectangle in steel blue (#8bb8e0) with slightly uneven edges. Panel numbers appear as small circled numerals in warm orange (#e8956a) in the top-left corner of each panel. Connector arrows are simple chalk arrows with dust particles drawn between panels in reading order: a horizontal arrow from Panel 1 to Panel 2, another from Panel 2 to Panel 3, a vertical arrow descending from Panel 3 down to Panel 4, then horizontal arrows from Panel 4 to Panel 5 to Panel 6.

The color system uses six chalk shades. The navy background (#0e1545) provides contrast for everything. Body text and central sketch outlines are chalk white (#f0ece2) — warm and slightly creamy, never pure white. Panel titles and headers are bright steel blue (#8bb8e0) in small-caps lettering. Key numbers — the headline coefficients of OLS = 0.52, IV = 0.94, and the +81% gap — render in large warm orange (#e8956a) chalk for maximum recall. Positive call-outs and successful diagnostic check marks use a vivid teal (#00d4c8). Annotations, axis-like labels on the central sketches, and the faint background formulas use a muted chalk gray (#b0a89a).

The title banner sits at the top center, above the panel grid. The main title reads "DO INSTITUTIONS CAUSE PROSPERITY?" in large steel blue chalk small-caps. Directly below it, in smaller chalk-white italic, the guiding question reads: "OLS says 0.52. IV says 0.94. Which is right?" The italic question is rendered in a slightly more relaxed handwriting style, as if scrawled by the lecturer mid-thought.

Panel 1 (top-left): Title "CAUSE OR CORRELATION?" in steel blue small-caps. A large chalk-drawn magnifying glass hovers over a chalk scatter cloud of dots that vaguely traces an upward line — but where the slope's "cause" should be, a bold question mark fills the lens. Callout in warm orange chalk: "Which way does the arrow point?". Chalk arrow to Panel 2.

Panel 2 (top-center): Title "64 EX-COLONIES TODAY" in steel blue small-caps. A simple chalk-drawn world map silhouette with sixty-four small chalk dots speckled across Africa, Asia, the Americas, and Oceania — clustered roughly where former European colonies sit historically. A small chalk-gray "N = 64" annotation labels the dot cluster. Callout in chalk white: "One question, one cross-section". Chalk arrow to Panel 3.

Panel 3 (top-right): Title "OLS IS BIASED" in steel blue small-caps. A chalk-drawn bathroom scale with a stick figure standing on it holding a heavy weight — the dial reading is skewed too low. A small chalk-gray "+ unobserved bag" annotation labels the weight. Large warm orange callout: "OLS = 0.52" in large chalk numerals. Chalk arrow descending to Panel 4.

Panel 4 (bottom-left): Title "IV REVEALS THE TRUTH" in steel blue small-caps. A large chalk-drawn balance scale with two pans: the left pan labeled "OLS" in chalk white sits high (light), the right pan labeled "IV" in **teal chalk** (#00d4c8) sits low (heavy) — clearly tilted toward IV as the winning method. Large warm orange callout: "IV = 0.94" in large chalk numerals. Chalk arrow to Panel 5.

Panel 5 (bottom-center): Title "JUST PURE DIVISION" in steel blue small-caps. A chalk-drawn rope-and-pulley: a hand pulls a rope, a small box rises slightly, and a flag rises a bit more. The chalk-gray fraction "−0.573 / −0.607 = 0.944" floats beside the pulley as the only annotation. Callout in teal: "IV is just a ratio". Chalk arrow to Panel 6.

Panel 6 (bottom-right): Title "INSTITUTIONS MATTER MOST" in steel blue small-caps. A chalk-drawn shield with a teal checkmark in its center, deflecting a bundled cluster of three unlabeled arrows. A single muted-gray annotation beneath the cluster reads "geography · religion · legal origin". A faint dashed chalk loop behind the shield labeled "exclusion?" hints at the Albouy caveat. Large warm orange callout: "+81% causal kick" in large chalk numerals.

A professor's margin note sits in the bottom-right margin, outside the panel grid. In smaller italic chalk text it reads: "0.94 is a LATE — the effect for compliers, not the population ATE", with a hand-drawn chalk arrow looping back toward Panel 4. The note feels like something a lecturer scribbled at the end of office hours. A color concept legend sits in the bottom-left margin, outside the grid: small chalk text with three colored dots reads "OLS estimate: warm orange · IV estimate: teal · Unobserved confounders: muted gray".

The atmosphere is rich with chalk texture. Chalk-dust particles float near the edges of every text block and panel border. Subtle smudge marks suggest places where chalk has been partially erased and rewritten. Behind the panels, faint chalk-drawn formulas appear at roughly 15-20% opacity in muted chalk gray (#b0a89a) — visible enough to read up close but recessed enough not to distract: the structural model "Y = α + βX + U", the 2SLS ratio identity "β̂ = Cov(Y,Z) / Cov(X,Z)", the Stock-Yogo threshold "F > 16.38" alongside the actual "F = 16.32 ≈ 16.38" (the post's borderline first-stage diagnostic), and the three IV conditions "relevance · exclusion · exogeneity" tucked into the corners. Tiny chalk fragments of stick figures, brackets, and arrows fill background gaps between panels.

This prompt generates the base image. The AI should render clearly: the title banner, the 6 panel titles in steel blue, the 6 central sketch illustrations, the 3 key numbers in large warm orange chalk (OLS = 0.52, IV = 0.94, +81% causal kick), and the 3 callout phrases. All other text — body sentences, annotations, transition phrases — is provided in the panel reference data for the user to overlay manually in an image editor. Keep text elements minimal and large for legibility.

---

## Negative Prompt

Do not include: photorealistic rendering, glossy or reflective surfaces, drop shadows, gradient color fills, emojis or Unicode symbols, computer-generated sans-serif typography, neon glow effects, 3D perspective or depth, watermarks, stock photo elements, smooth vector curves, pure white (#ffffff) — all whites should be warm/creamy chalk white (#f0ece2). All lines should appear hand-drawn with varying weight and chalk texture. Do not use clean digital borders or perfectly straight lines. Do not render precise statistical charts, axis labels, or data tables. Do not attempt to render more than 3 text elements per panel. Do not include photographs of actual chalkboards, classrooms, or stock illustrations of professors. Do not render ISO country codes or political boundaries on the world map silhouette in Panel 2.

---

## Condensed Prompt (~200 words)

Chalkboard infographic, 1920x1080 landscape, navy (#0e1545). Hand-lettered chalk sketchnote, chalk dust, faint formula textures. Six panels in 3x2 grid with steel blue (#8bb8e0) borders, chalk arrows connecting. Title: "DO INSTITUTIONS CAUSE PROSPERITY?" small-caps; subtitle: "OLS says 0.52. IV says 0.94. Which is right?" italic chalk white (#f0ece2). Palette: chalk white (#f0ece2), warm orange (#e8956a), teal (#00d4c8), muted gray (#b0a89a). Panel 1 (top-L) "CAUSE OR CORRELATION?": magnifying glass over scatter, question mark in lens; callout "Which way does the arrow point?". Panel 2 (top-C) "64 EX-COLONIES TODAY": world-map silhouette dotted with 64 marks; callout "One question, one cross-section". Panel 3 (top-R) "OLS IS BIASED": bathroom scale skewed by hidden weight; callout "OLS = 0.52" in large orange. Panel 4 (bot-L) "IV REVEALS THE TRUTH": balance scale, IV pan in teal sits low, OLS pan chalk-white sits high; callout "IV = 0.94" orange. Panel 5 (bot-C) "JUST PURE DIVISION": rope-pulley with floating fraction "−0.573 / −0.607 = 0.944"; callout "IV is just a ratio" in teal. Panel 6 (bot-R) "INSTITUTIONS MATTER MOST": shield deflecting bundled unlabeled arrows under single label "geography · religion · legal origin"; callout "+81% causal kick" orange. Professor's note (bot-R margin): "0.94 is a LATE, not an ATE". Legend (bot-L): OLS orange, IV teal, confounder gray. Background formulas at 15% opacity: "Y = α + βX + U", "β̂ = RF/FS", "F = 16.32 ≈ 16.38". No photorealism, no gradients, no precise charts, no pure white.

---

## Panel Reference Data

Use this section when overlaying body text on the generated image, or when iterating on the prompt. Numbers cited here are verified against `index.md` and `analysis.log`.

### Panel 1 — Cause or Correlation?

- **Position:** row 1, column 1 (top-left)
- **Dramatic function:** Hook
- **Story beat:** "Cause or just correlation?"
- **Callout:** "Which way does the arrow point?"
- **Key number:** N/A (phrase callout)
- **Central sketch:** Magnifying glass hovering over a chalk scatter cloud whose dots trace an upward slope. Where the cause should be revealed, a bold question mark fills the lens.
- **Body sentences (for manual overlay):**
  - The cross-country plot of institutions vs GDP shows a steep, real correlation.
  - But correlation cannot prove causation: maybe rich countries afford better institutions.
  - This is the question every IV paper exists to answer.
- **Transition to Panel 2:** "And the stakes are real — 64 ex-colonies span a 60-fold income range."

### Panel 2 — 64 Ex-Colonies Today

- **Position:** row 1, column 2 (top-center)
- **Dramatic function:** Stakes
- **Story beat:** "64 ex-colonies, one causal question"
- **Callout:** "One question, one cross-section"
- **Key number:** N/A (annotation `N = 64` on sketch)
- **Central sketch:** Chalk silhouette of the world map with 64 small dots speckled across former European colonies in Africa, Asia, the Americas, and Oceania.
- **Body sentences (for manual overlay):**
  - The AJR base sample contains 64 ex-colonies with valid settler-mortality data.
  - GDP per capita ranges from \$450 to \$27,400 — a 60-fold gap to explain.
  - Settler mortality circa 1700 ranges across 5.8 log points (≈ 9 to 2,940 per 1,000).
- **Transition to Panel 3:** "But the first attempt — naive OLS — turns out to be biased."

### Panel 3 — OLS Is Biased

- **Position:** row 1, column 3 (top-right)
- **Dramatic function:** First attempt
- **Story beat:** "Naive OLS: 0.52 — biased"
- **Callout:** "OLS = 0.52" (large warm orange chalk)
- **Key number:** **0.52** — the OLS coefficient on `avexpr` in the base sample (Tab 2 Col 2)
- **Central sketch:** Bathroom scale with a stick figure standing on it holding a heavy weight; the dial is skewed too low because the scale weighs the figure plus the hidden weight.
- **Body sentences (for manual overlay):**
  - OLS regresses log GDP on `avexpr` and reports β = 0.522 (SE 0.050, N = 64).
  - But three biases contaminate it: reverse causality, omitted variables, and measurement-error attenuation.
  - The Durbin-Wu-Hausman test (χ² = 9.085, p = 0.003) confirms OLS is statistically inconsistent.
- **Transition to Panel 4:** "The surprise is what happens when we instrument."

### Panel 4 — IV Reveals the Truth

- **Position:** row 2, column 1 (bottom-left)
- **Dramatic function:** Twist (Comparison metaphor)
- **Story beat:** "IV reveals 0.94 — gap is huge"
- **Callout:** "IV = 0.94" (large warm orange chalk)
- **Key number:** **0.94** — the 2SLS coefficient on `avexpr` (Tab 4 Col 1)
- **Central sketch:** Balance scale clearly tilted: the OLS pan in chalk white rests high and light, the IV pan in teal (#00d4c8) rests low and heavy. No floating annotation between the pans — the orange callout carries the numeric contrast.
- **Body sentences (for manual overlay):**
  - Instrumenting `avexpr` with `logem4` yields β = 0.944 (SE 0.176, 95% CI [0.60, 1.29]).
  - That is **81% larger** than the OLS estimate — and statistically distinguishable at z = 5.36.
  - Implication: measurement error in the institutions index is the dominant source of OLS bias.
- **Transition to Panel 5:** "The surprise is that this isn't magic — it's just a ratio."

### Panel 5 — Just Pure Division

- **Position:** row 2, column 2 (bottom-center)
- **Dramatic function:** Surprise
- **Story beat:** "Just division: −0.57 / −0.61 = 0.94"
- **Callout:** "IV is just a ratio" (in teal)
- **Key number:** N/A (phrase callout — the floating fraction carries the math)
- **Central sketch:** Rope-and-pulley: a hand pulls a rope, a small box rises slightly, a flag rises a bit more. Beside the pulley, a chalk-gray fraction "−0.573 / −0.607 = 0.944" floats — the only annotation. (Optional tiny labels: `avexpr` on the box, `logpgp95` on the flag.)
- **Body sentences (for manual overlay):**
  - 2SLS = (Reduced-form slope) ÷ (First-stage slope) when there's one endogenous regressor.
  - First stage: −0.607 (logem4 → avexpr); reduced form: −0.573 (logem4 → logpgp95).
  - Their ratio: −0.573 / −0.607 = **0.944** — exactly the 2SLS estimate.
- **Transition to Panel 6:** "So the lesson is: institutions matter, and twice as much as we thought."

### Panel 6 — Institutions Matter Most

- **Position:** row 2, column 3 (bottom-right)
- **Dramatic function:** Resolution
- **Story beat:** "Institutions matter ~2× more than OLS suggested"
- **Callout:** "+81% causal kick" (large warm orange chalk)
- **Key number:** **+81%** — the IV-OLS gap (IV is 81% larger than OLS)
- **Central sketch:** A chalk shield with a teal checkmark deflects a bundled cluster of three unlabeled arrows. A single muted-gray annotation beneath the cluster reads "geography · religion · legal origin". Behind the shield, a faint dashed chalk loop labeled "exclusion?" hints at the Albouy caveat.
- **Body sentences (for manual overlay):**
  - IV survives 27 of 27 control sets (Tabs 5-7) — the slope lives in the 0.55–1.36 range.
  - Hansen J p-values 0.21–0.80 across 5 alternative instruments fail to reject exogeneity.
  - But this is a LATE for compliers, and Albouy (2012) flags 36% of mortality data as imputed — handle with care.
- **Transition out:** N/A (final panel)

### Story Spine

> Instrumental variables reveal that institutions cause prosperity by using settler mortality as a clean external nudge, challenging the assumption that the cross-country institution–GDP correlation is just rich countries affording better courts.

### Margin Elements

- **Professor's note:** "0.94 is a LATE — the effect for compliers, not the population ATE" — positioned bottom-right margin outside the panel grid, with a hand-drawn arrow looping back toward Panel 4.
- **Color legend:** OLS estimate: warm orange · IV estimate: teal · Unobserved confounders: muted gray — positioned bottom-left margin outside the grid, with three small colored dots beside each label.
- **Background formulas (15-20% opacity in muted chalk gray):**
  - Structural model: "Y = α + β X + U"
  - 2SLS ratio identity: "β̂ = Cov(Y,Z) / Cov(X,Z) = β̂\_RF / β̂\_FS"
  - Weak-IV threshold and actual F: "F > 16.38" alongside "F = 16.32 ≈ 16.38" (the borderline diagnostic from §5)
  - The three IV conditions: "relevance · exclusion · exogeneity"
