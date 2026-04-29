# Infographic Instructions: Treatment Effects in Stata — Six Estimators

A ready-to-paste AI-image generation prompt summarizing the post into a 6-panel chalkboard infographic. Section A is the full prompt, Section B is the negative prompt, Section C is a condensed prompt for token-limited tools, and Section D is structured panel reference data.

---

## Section A — Full Image Generation Prompt

Create a 1920x1080 landscape digital chalk illustration on a dark navy background (#0e1545). The style is academic chalkboard sketchnote: all lettering appears hand-drawn in chalk with slightly irregular strokes, chalk-dust particles float near text edges, and faint smudge marks add realism. The overall feel resembles a photograph of an expertly annotated university lecture chalkboard.

Composition: A title banner sits centered at the top above the grid. Below the banner, six panels are arranged in a 3-column by 2-row grid. Panel borders are chalk-drawn rounded rectangles in steel blue (#8bb8e0) with slightly uneven, hand-traced edges. Small circled numerals 1 through 6 in warm orange (#e8956a) sit in the top-left corner of each panel. Chalk arrows with chalk-dust particles connect the panels in reading order: Panel 1 to Panel 2 to Panel 3 across the top row, a vertical arrow from Panel 3 down to Panel 4, then Panel 4 to Panel 5 to Panel 6 across the bottom row. The navy background between panels is a deliberate design element — generous dark space gives the chalkboard an authentic feel. There is breathing room around the entire grid for margin elements.

Colors: Navy blue (#0e1545) fills the background. Chalk white (#f0ece2) is used for all body text and sketch outlines — never pure white (#ffffff), always slightly warm and creamy. Steel blue (#8bb8e0) marks panel titles and panel borders. Warm orange (#e8956a) highlights key numbers, bold callouts, and cautionary findings such as the naive (biased) gap of −275 g and the unobserved-confounder warning. Teal (#00d4c8) marks positive results — the doubly robust ATE estimate of −232 g (the headline answer) and the convergence of five estimators within ±10 grams. Muted chalk gray (#b0a89a) appears on connector arrows, annotations, and de-emphasized labels.

The title banner reads "TREATMENT EFFECTS IN STATA — SIX ESTIMATORS" in large steel blue (#8bb8e0) chalk small-caps, centered above the grid. Below it in smaller chalk-white (#f0ece2) italic: "Does maternal smoking really cost babies 275 grams — or is the answer hiding in the covariates?"

The top-left panel (row 1, column 1) is bordered by a chalk-drawn rounded rectangle in steel blue with a small "1" in warm orange in the corner. The title "THE QUESTION" is rendered in steel blue (#8bb8e0) chalk small-caps. A chalk-drawn pregnant figure stands beside a stylized cigarette with a faint smoke curl — both rendered in chalk white outlines on the navy background. Below the icon, a chalk-drawn baby silhouette sits beside a stylized scale showing "3,138 g" for smokers' babies in warm orange and "3,413 g" for non-smokers' babies in chalk white. The phrase "Does smoking *cause* the gap?" appears in large warm orange (#e8956a) chalk italics with a swooshing chalk underline. In chalk white (#f0ece2), the body text reads: "4,642 mother-infant pairs from Cattaneo (2010); 864 smokers, 3,778 non-smokers." and "A 275 g raw gap — but smokers and non-smokers also differ in age, education, and prenatal care." A chalk arrow connects to Panel 2 with the phrase "Why is this hard?" in small muted gray (#b0a89a) chalk along the arrow.

The top-center panel (row 1, column 2) is titled "THE CONFOUNDING PROBLEM" in steel blue chalk small-caps with a "2" circle in warm orange. A chalk-drawn directed graph dominates the center: three nodes labeled X, D, and Y with chalk arrows from X to D, X to Y, and D to Y — the back-door structure that biases the naive comparison. The X node is labeled "education, age, marital, prenatal care" in small chalk white text; the D node is labeled "smoking"; the Y node is labeled "birth weight". The chalk-drawn arrow from X to Y is highlighted in warm orange (#e8956a) — the path that contaminates the comparison. The phrase "Naive gap = −275 g (biased)" appears in large warm orange chalk numerals with a chalk underline. In chalk white, the body text reads: "Mothers who smoke also tend to be younger, less educated, and less likely to have early prenatal care." and "Adjusting for these covariates is what every method below buys us." A chalk arrow connects to Panel 3 with the phrase "How do we fix it?" in small muted gray chalk along the arrow.

The top-right panel (row 1, column 3) is titled "SIX ESTIMATORS" in steel blue chalk small-caps with a "3" circle in warm orange. A small chalk-drawn taxonomy diagram organizes the methods into four families. The first branch shows "Outcome model only" leading to a chalk box labeled "1. RA". The second branch shows "Treatment model only" leading to two chalk boxes "2. IPW" and "6. PSM". The third branch in teal (#00d4c8) shows "Both (doubly robust)" leading to "3. IPWRA" and "4. AIPW". The fourth branch shows "Direct matching" leading to "5. NNM". The phrase "All built on `teffects`" appears in large warm orange (#e8956a) chalk monospace. In chalk white, the body text reads: "Six routes to the same causal estimand — RA models the outcome, IPW reweights by propensity, IPWRA and AIPW combine both." and "NNM and PSM build statistical twins from the data directly, with no parametric outcome model." A chalk arrow leads from this panel down to Panel 4 with the phrase "How do they compare?" in muted gray chalk.

The bottom-left panel (row 2, column 1) is titled "FOREST PLOT COMPARISON" in steel blue chalk small-caps with a "4" circle in warm orange. A chalk-drawn forest plot dominates the panel: seven horizontal bars on a vertical axis labeled (top to bottom) "Naive" in warm orange, then "RA", "IPW", "IPWRA", "AIPW" (in teal), "NNM", "PSM" each in chalk white. The horizontal axis runs from −320 to −150 grams with a dashed chalk vertical line at zero. Each bar is a chalk error-bar segment with a small chalk diamond marking the point estimate. The Naive bar is rendered in warm orange (the cautionary, biased estimate) and stretches from −317 to −234 with a diamond at −275. The five middle bars (RA through PSM) are rendered in chalk white with diamonds clustered near −230. The AIPW bar is highlighted in teal (#00d4c8) with a slightly bolder diamond at −232 — this is the pedagogical headline. The phrase "−232 g (AIPW, the doubly robust default)" appears in large teal chalk numerals with a chalk underline. In chalk white, the body text reads: "Five of six adjusted estimators agree within ±10 g; only NNM is a slight outlier at −210 g with a wider CI." and "Adjustment moves the answer 35 to 65 grams toward zero — the magnitude of confounding bias on this dataset." A chalk arrow connects to Panel 5 with the phrase "Can we trust the comparison?" in muted gray chalk.

The bottom-center panel (row 2, column 2) is titled "OVERLAP & BALANCE" in steel blue chalk small-caps with a "5" circle in warm orange. A chalk-drawn density-overlap chart dominates the center: two overlapping bell-like curves on a horizontal axis from 0 to 1 labeled "estimated propensity score". The non-smokers' curve is in steel blue, peaking near 0.15. The smokers' curve is in warm orange, peaking near 0.35. The two curves overlap across most of the (0, 1) interval. A chalk-drawn shaded region in muted gray emphasizes where they overlap. The phrase "Pseudo R² = 7.8%" appears in large warm orange chalk numerals — the strength of the propensity model. In chalk white, the body text reads: "The overlap assumption holds: every observed covariate combination contains both smokers and non-smokers." and "If a non-smoker had propensity 0.99, IPW would give them weight 100 — and the comparison would collapse." A chalk arrow connects to Panel 6 with the phrase "What do we conclude?" in muted gray chalk.

The bottom-right panel (row 2, column 3) is titled "KEY TAKEAWAYS" in steel blue chalk small-caps with a "6" circle in warm orange. A chalk-drawn horizontal three-panel mini-comic shows three icons left to right: a magnifying glass (representing the naive gap), an equals sign with a teal dot (representing the cluster of five), and a small chalk question mark with three faint dotted arrows (representing unobserved confounding — the limit). Below the comic, three numbered chalk bullets summarize. The phrase "5/6 estimators within ±10 g" appears in large teal (#00d4c8) chalk numerals with a chalk underline. In chalk white, the body text reads: "Confounding inflates the apparent harm by 13 to 24 percent — adjustment is doing real work." and "But conditional independence is an *unverifiable* assumption — sensitivity analysis or instruments are the next step."

A professor's margin note sits in the bottom-right outside the panel grid, written in smaller chalk-white italic with a hand-drawn arrow pointing toward Panel 6. The note reads: "If unobserved confounders matter, every one of the six estimators above is biased in the same direction — that is the limit of conditional independence." Below the note, the muted chalk gray signature "— prof. note" trails off in a curved chalk line.

A color concept legend sits in the bottom-left margin, outside the panel grid, with three small chalk circles followed by short chalk-white labels. The first circle is teal (#00d4c8) labeled "Causal effect (adjusted)". The second circle is warm orange (#e8956a) labeled "Bias / confounding". The third circle is chalk white (#f0ece2) labeled "Mothers / data". The legend reads as if scribbled in the corner of the chalkboard, slightly tilted.

Atmosphere: Chalk dust particles float in soft clouds near every text edge, panel border, and connector arrow tip. Subtle chalk smudges sit beneath each panel — places where the chalkboard has been partially erased and re-drawn. Faint chalk-drawn formulas hover behind the panels on the navy background at 15 to 20 percent opacity in muted chalk gray (#b0a89a): the conditional independence statement "{Y(0), Y(1)} ⊥ D | X", the propensity-score definition "e(X) = Pr(D=1|X)", the AIPW influence function "θ = E[μ₁(X) − μ₀(X) + D(Y−μ₁(X))/e(X) − (1−D)(Y−μ₀(X))/(1−e(X))]", and the matching estimator "τ̂ = (1/n)Σ(2D−1)[Y − Σ Y_NN]". Tiny chalk illustrations are scattered between the panels: a stick-figure mother holding a baby, a cigarette with a faint chalk-smoke curl, a small chalk DAG with three nodes and three arrows, a chalk-drawn tree (for matching), and a small chalk balance scale.

Text rendering priorities: The title banner text and panel numbers must be clearly legible. Panel titles should be readable in steel blue small-caps. Key numbers and callout phrases must be prominent in warm orange (and teal for the headline AIPW estimate). Body text sentences should be readable in chalk white. Connector phrases and annotations can be smaller but still legible. Background formulas should be barely visible at 15 to 20 percent opacity.

---

## Section B — Negative Prompt

Avoid: photorealistic photographs, computer-generated CGI, glossy plastic textures, neon glow, pure black background (use navy #0e1545 instead), pure white text (use chalk white #f0ece2 instead), modern flat-design icons, vector-style cleanliness, sharp pixel-perfect lines (chalk should be slightly irregular), watermarks, logos, signatures other than the professor's note, emojis, 3D rendering, stock-photo people, coffee stains, paper notebook texture, classroom wall textures, anime style, cartoon style, comic-book outlines, ink pen drawings, marker drawings, whiteboard rendering (must be chalkboard), low-resolution artifacts, JPEG compression artifacts, text in any language other than English, mathematical notation rendered in modern LaTeX style, full sentences in background formulas (formulas must be partial fragments), references to specific software brand logos.

---

## Section C — Condensed Prompt (under 400 words, for token-limited tools)

1920x1080 chalkboard infographic on dark navy (#0e1545). Hand-drawn chalk style with chalk dust and smudges. Title at top in steel blue (#8bb8e0) small-caps: "TREATMENT EFFECTS IN STATA — SIX ESTIMATORS". Subtitle in italic chalk white (#f0ece2): "Does maternal smoking cost babies 275 grams — or is the answer hiding in the covariates?"

Below title: 3x2 grid of six panels, each a chalk rounded rectangle in steel blue with circled warm orange (#e8956a) numbers 1 to 6 in the corner. Connector arrows in muted gray (#b0a89a) link panels in reading order.

Panel 1 (top-left) "THE QUESTION": pregnant figure beside cigarette icon in chalk white; baby with weight scale showing "3,138 g" smokers vs. "3,413 g" non-smokers; callout "Does smoking cause the gap?" in warm orange.

Panel 2 (top-center) "THE CONFOUNDING PROBLEM": chalk DAG with X→D, X→Y, D→Y nodes; X arrow to Y highlighted in warm orange; callout "Naive gap = −275 g (biased)".

Panel 3 (top-right) "SIX ESTIMATORS": chalk taxonomy tree with four branches: Outcome (RA), Treatment (IPW, PSM), Both/doubly robust in teal (IPWRA, AIPW), Direct matching (NNM); callout "All built on `teffects`" in warm orange.

Panel 4 (bottom-left) "FOREST PLOT COMPARISON": seven horizontal chalk error-bars on −320 to −150 grams axis; Naive bar in warm orange at −275; five bars clustered near −230 in chalk white; AIPW bar highlighted in teal (#00d4c8) at −232; callout "−232 g (AIPW)" in teal.

Panel 5 (bottom-center) "OVERLAP & BALANCE": two overlapping chalk density curves in steel blue (non-smokers) and warm orange (smokers) over (0,1) propensity axis; callout "Pseudo R² = 7.8%" in warm orange.

Panel 6 (bottom-right) "KEY TAKEAWAYS": three chalk icons (magnifying glass, equals sign with teal dot, question mark with arrows); callout "5/6 estimators within ±10 g" in teal.

Margin: bottom-right professor's note "If unobserved confounders matter, every estimator is biased the same way" with arrow to Panel 6. Bottom-left legend with three colored dots: teal "causal effect", warm orange "bias/confounding", chalk white "mothers/data".

Background: faint formulas at 15% opacity — "{Y(0),Y(1)} ⊥ D | X", "e(X) = Pr(D=1|X)" — and scattered chalk doodles of mother, baby, DAG, tree.

Style: chalk dust particles, slightly irregular strokes, hand-drawn warmth.

---

## Section D — Panel Reference Data

### Panel 1 — The Question

- **Position**: row 1, column 1 (top-left)
- **Callout**: "Does smoking *cause* the gap?"
- **Key number**: 3,138 g (smokers' mean) vs. 3,413 g (non-smokers' mean) — a 275 g raw gap
- **Body sentences**:
  - "4,642 mother-infant pairs from Cattaneo (2010); 864 smokers, 3,778 non-smokers."
  - "A 275 g raw gap — but smokers and non-smokers also differ in age, education, and prenatal care."
- **Icon**: chalk-drawn pregnant figure beside a stylized cigarette with a faint smoke curl; baby silhouette beside a chalk-drawn weight scale
- **Mini-viz**: side-by-side chalk numerals "3,138 g" (warm orange) and "3,413 g" (chalk white) with a small bracket connecting them labeled "−275 g raw gap"
- **Connector to next**: "Why is this hard?"

### Panel 2 — The Confounding Problem

- **Position**: row 1, column 2 (top-center)
- **Callout**: "Naive gap = −275 g (biased)"
- **Key number**: −275 grams (the biased, unadjusted estimate)
- **Body sentences**:
  - "Mothers who smoke also tend to be younger, less educated, and less likely to have early prenatal care."
  - "Adjusting for these covariates is what every method below buys us."
- **Icon**: chalk-drawn directed acyclic graph with three labeled nodes — X (covariates), D (smoking), Y (birth weight)
- **Mini-viz**: chalk DAG with arrows X→D, X→Y, D→Y; the X→Y arrow rendered in warm orange to highlight the back-door path
- **Connector to next**: "How do we fix it?"

### Panel 3 — Six Estimators

- **Position**: row 1, column 3 (top-right)
- **Callout**: "All built on `teffects`"
- **Key number**: 6 estimators across 4 modeling families
- **Body sentences**:
  - "Six routes to the same causal estimand — RA models the outcome, IPW reweights by propensity, IPWRA and AIPW combine both."
  - "NNM and PSM build statistical twins from the data directly, with no parametric outcome model."
- **Icon**: chalk-drawn taxonomy tree with four branches (Outcome / Treatment / Both / Direct matching)
- **Mini-viz**: tree with four branches; the "Both (doubly robust)" branch highlighted in teal because IPWRA and AIPW are the recommended workhorses
- **Connector to next** (vertical down to Panel 4): "How do they compare?"

### Panel 4 — Forest Plot Comparison

- **Position**: row 2, column 1 (bottom-left)
- **Callout**: "−232 g (AIPW, the doubly robust default)"
- **Key number**: −232 g (AIPW ATE, the headline answer in teal); compared against −275 g naive
- **Body sentences**:
  - "Five of six adjusted estimators agree within ±10 g; only NNM is a slight outlier at −210 g with a wider CI."
  - "Adjustment moves the answer 35 to 65 grams toward zero — the magnitude of confounding bias on this dataset."
- **Icon**: chalk-drawn forest plot
- **Mini-viz**: seven horizontal chalk error-bars labeled top-to-bottom (Naive in warm orange at −275, RA at −240, IPW at −231, IPWRA at −232, AIPW highlighted in teal at −232, NNM at −210, PSM at −229) on an x-axis from −320 to −150 g with a dashed vertical chalk line at zero
- **Connector to next**: "Can we trust the comparison?"

### Panel 5 — Overlap & Balance

- **Position**: row 2, column 2 (bottom-center)
- **Callout**: "Pseudo R² = 7.8%"
- **Key number**: 7.8% pseudo-R² of the logistic propensity model (LR χ² = 346); overlap holds across (0, 1)
- **Body sentences**:
  - "The overlap assumption holds: every observed covariate combination contains both smokers and non-smokers."
  - "If a non-smoker had propensity 0.99, IPW would give them weight 100 — and the comparison would collapse."
- **Icon**: chalk-drawn pair of overlapping bell curves
- **Mini-viz**: two density curves labeled "non-smokers" (steel blue) and "smokers" (warm orange) over a horizontal axis from 0 to 1 marked "estimated propensity score"; shaded muted-gray region where the curves overlap
- **Connector to next**: "What do we conclude?"

### Panel 6 — Key Takeaways

- **Position**: row 2, column 3 (bottom-right)
- **Callout**: "5/6 estimators within ±10 g"
- **Key number**: ±10 g range across the five clustered estimators (RA, IPW, IPWRA, AIPW, PSM)
- **Body sentences**:
  - "Confounding inflates the apparent harm by 13 to 24 percent — adjustment is doing real work."
  - "But conditional independence is an *unverifiable* assumption — sensitivity analysis or instruments are the next step."
- **Icon**: three-panel chalk mini-comic: magnifying glass, equals sign with teal dot, question mark with dotted arrows
- **Mini-viz**: three numbered chalk bullets summarizing — (1) "Naive: −275 g", (2) "Adjusted: ≈ −230 g", (3) "If unobserved → all biased"
- **Connector to next**: end of grid (no successor panel)

### Margin Elements

- **Professor's note**: "If unobserved confounders matter, every one of the six estimators above is biased in the same direction — that is the limit of conditional independence." — positioned bottom-right margin, with arrow toward Panel 6
- **Color legend**: Causal effect (adjusted): teal (#00d4c8). Bias / confounding: warm orange (#e8956a). Mothers / data: chalk white (#f0ece2). Positioned bottom-left margin
- **Background formulas**: "{Y(0), Y(1)} ⊥ D | X" (conditional independence), "e(X) = Pr(D=1 | X)" (propensity score), "τ̂_AIPW = E[μ₁(X) − μ₀(X) + D(Y−μ₁(X))/e(X) − (1−D)(Y−μ₀(X))/(1−e(X))]" (AIPW influence function), "τ̂_NNM = (1/n) Σ (2D−1)[Y − Σ Y_NN]" (matching) — at 15-20% opacity in muted gray

---

*Source post: `content/post/stata_matching/index.md`. All numerical claims in the panels are verified against the post.*
