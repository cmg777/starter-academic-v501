# Causal Machine Learning and the Resource Curse

## Full Image Generation Prompt

Create a 1920x1080 landscape digital chalk illustration on a dark navy background (#0e1545). The style is academic chalkboard sketchnote: all lettering appears hand-drawn in chalk with slightly irregular strokes, chalk-dust particles float near text edges, and faint smudge marks add realism. The overall feel resembles a photograph of an expertly annotated university lecture chalkboard.

The composition features a title banner centered at the top and six rectangular panels arranged in a 3-column by 2-row grid below it, with generous dark navy space between panels. Each panel has a chalk-drawn rounded-rectangle border in steel blue (#8bb8e0) with slightly uneven hand-drawn edges. Panel numbers appear as small circled numerals in warm orange (#e8956a) in the top-left corner of each panel. Chalk arrows with faint dust particles connect the panels in reading order: left to right across the top row (1 to 2 to 3), a vertical arrow from Panel 3 down to Panel 4, then left to right across the bottom row (4 to 5 to 6).

Colors: Navy blue (#0e1545) fills the entire background. Chalk white (#f0ece2) is used for all body text and sketch outlines -- never pure white (#ffffff), always slightly warm and creamy. Steel blue (#8bb8e0) marks panel titles and chalk-drawn borders. Warm orange (#e8956a) highlights key numbers like the 56% underestimate, the 0.240 ATE, and the GATE range of 0.089. Teal (#00d4c8) marks positive emphasis like institutional moderation and the DML residualization step. Muted chalk gray (#b0a89a) appears on connector arrows and background annotations.

The title banner reads "CAUSAL MACHINE LEARNING AND THE RESOURCE CURSE" in large steel blue (#8bb8e0) chalk small-caps, centered above the grid. Below it in smaller chalk-white (#f0ece2) italic: "Do institutions decide whether mining is a blessing or a curse?"

Panel 1 (top-left): Title "THE RESOURCE CURSE PUZZLE" in steel blue small-caps. A large chalk-drawn magnifying glass hovers over a pickaxe stuck in the ground, with a bold question mark floating above -- is mining good or bad? Callout: "Blessing or curse? It depends" in warm orange. Chalk arrow to Panel 2.

Panel 2 (top-center): Title "3,000 OBS, 85% UNTREATED" in steel blue small-caps. A chalk-drawn grid of tally marks in groups of five fills most of the panel, with a tiny cluster of circled marks in warm orange in the corner -- only 15% are treated, the vast minority. Callout: "56% underestimate" in large warm orange chalk. Chalk arrow to Panel 3.

Panel 3 (top-right): Title "DML RESIDUALIZATION" in steel blue small-caps. A large chalk-drawn funnel with confounders (stick figures, geographic icons) pouring in at the wide top and a clean residualized signal dripping out the narrow bottom into a causal forest below. Callout: "ATE = 0.240" in large warm orange chalk. Chalk arrow down to Panel 4.

Panel 4 (bottom-left): Title "INSTITUTIONS VS PRICES" in steel blue small-caps. A chalk-drawn balance scale with two pans: the left pan labeled "Mining" tilts sharply on a teal pillar labeled "Institutions," while the right pan labeled "Prices" stays level -- institutions tip one side but not the other. Callout: "Range: 0.089 vs 0.045" in large warm orange chalk. Chalk arrow to Panel 5.

Panel 5 (bottom-center): Title "IMPORTANCE CAN MISLEAD" in steel blue small-caps. A chalk-drawn lightning bolt strikes a ranked list where geographic variables sit at the top and institutional variables sit at the bottom -- the rankings are wrong, and a teal arrow flips the order to show the true moderators. Callout: "GATEs reveal the truth" in warm orange. Chalk arrow to Panel 6.

Panel 6 (bottom-right): Title "INSTITUTIONS ARE KEY" in steel blue small-caps. A chalk-drawn fork in the road with two signpost arrows: one pointing to "Curse" (crossed out) and one circled in warm orange pointing to "Blessing," with a teal pillar labeled "Institutions" at the fork -- strong institutions steer mining toward prosperity. Callout: "DML + GATEs reveal the answer" in warm orange.

In the bottom-right margin, outside the panel grid, a professor's handwritten-style annotation in smaller italic chalk white (#f0ece2) reads: "Feature importance measures splitting frequency, not causal importance -- use GATEs instead!" A hand-drawn chalk arrow points from the note toward Panel 5. In the bottom-left margin, a small color concept legend shows three entries: a teal (#00d4c8) dot labeled "Institutions", a warm orange (#e8956a) dot labeled "Key effects", and a chalk white (#f0ece2) dot labeled "Data / method."

Faint chalk-drawn equations are visible behind the panels on the navy background at approximately 15-20% opacity in muted gray (#b0a89a): the formulas "Y = T * tau(x) + g(x,w) + epsilon" and "T = m(x,w) + v" are scattered across the background. Chalk-style silhouettes of pickaxes, tree diagrams, and bracket symbols appear faintly in the background gaps. Subtle chalk dust particles float near text edges and panel borders, and faint smudge marks add tactile realism.

This prompt generates the base image. The AI should render clearly: the title banner, 6 panel titles in steel blue, 6 central sketch illustrations, 3 key numbers in large warm orange chalk (56%, 0.240, 0.089), and 3 callout phrases. All other text -- body sentences, annotations, transition phrases -- is provided in the panel reference data for the user to overlay manually in an image editor. Keep text elements minimal and large for legibility.

---

## Negative Prompt

Do not include: photorealistic rendering, glossy or reflective surfaces, drop shadows, gradient color fills, emojis or Unicode symbols, computer-generated sans-serif typography, neon glow effects, 3D perspective or depth, watermarks, stock photo elements, smooth vector curves, pure white (#ffffff) -- all whites should be warm/creamy chalk white (#f0ece2). All lines should appear hand-drawn with varying weight and chalk texture. Do not use clean digital borders or perfectly straight lines. Do not render precise statistical charts, axis labels, or data tables. Do not attempt to render more than 3 text elements per panel. Do not include photographs of actual mines, minerals, or natural landscapes.

---

## Condensed Prompt (~200 words)

Chalkboard infographic, 1920x1080 landscape, navy background (#0e1545). Academic chalk-drawn sketchnote, hand-lettered text, chalk dust, faint formula textures. Six panels in 3x2 grid with steel blue (#8bb8e0) chalk borders connected by chalk arrows. Title: "CAUSAL MACHINE LEARNING AND THE RESOURCE CURSE" in steel blue small-caps, subtitle: "Do institutions decide whether mining is a blessing or a curse?" in italic chalk white (#f0ece2). Colors: chalk white (#f0ece2) body, warm orange (#e8956a) key numbers, teal (#00d4c8) highlights, muted gray (#b0a89a) annotations. Panel 1 (top-left): "THE RESOURCE CURSE PUZZLE" -- magnifying glass over pickaxe with question mark, callout "Blessing or curse? It depends" in orange. Panel 2 (top-center): "3,000 OBS, 85% UNTREATED" -- tally marks with tiny circled minority, orange "56% underestimate." Panel 3 (top-right): "DML RESIDUALIZATION" -- funnel filtering confounders into clean signal, orange "ATE = 0.240." Panel 4 (bottom-left): "INSTITUTIONS VS PRICES" -- balance scale, institutions tipping mining pan but not prices pan, orange "Range: 0.089 vs 0.045." Panel 5 (bottom-center): "IMPORTANCE CAN MISLEAD" -- lightning bolt striking ranked list, teal arrow flipping order, orange "GATEs reveal the truth." Panel 6 (bottom-right): "INSTITUTIONS ARE KEY" -- fork in road, "Blessing" circled in orange, teal "Institutions" pillar at fork. Professor's note bottom-right: "Feature importance measures splitting frequency, not causal importance!" Legend bottom-left: institutions (teal), effects (orange), method (white). Faint formulas: Y = T*tau(x) + g(x,w) + epsilon at 15% opacity. No photorealism, no gradients, no precise charts, no pure white.

---

## Panel Reference Data

### Panel 1 -- The Resource Curse Puzzle

- **Position**: Row 1, Column 1 (top-left)
- **Dramatic function**: Hook
- **Story beat**: "Is mining a blessing or a curse?"
- **Callout**: "Blessing or curse? It depends"
- **Key number**: N/A (conceptual panel)
- **Central sketch**: Chalk-drawn magnifying glass hovering over a pickaxe stuck in the ground, with a bold question mark floating above
- **Body sentences** (for manual overlay):
  - Can natural resource wealth be both a blessing and a curse -- and can local institutions determine which?
  - EconML's CausalForestDML estimates heterogeneous causal effects of mining on economic development.
- **Transition to next**: "Let's look at the data"

### Panel 2 -- 3,000 Obs, 85% Untreated

- **Position**: Row 1, Column 2 (top-center)
- **Dramatic function**: Stakes
- **Story beat**: "3,000 observations, 85% untreated"
- **Callout**: "56% underestimate"
- **Key number**: Naive estimate of 0.109 vs true ATE of 0.250 -- a 56% underestimate due to selection bias
- **Central sketch**: Chalk-drawn tally marks in groups of five filling the panel, with a tiny cluster circled in warm orange -- only 15% of districts have mining
- **Body sentences** (for manual overlay):
  - 300 districts across 8 countries, observed over 10 years -- 3,000 district-year observations with 85/5/5/5 treatment imbalance.
  - The naive mining effect estimate of 0.109 misses the true 0.250 by 56% -- mining districts have worse baseline characteristics.
  - For within-mining comparisons like 3-1, only 300 observations contribute, inflating standard errors.
- **Transition to next**: "How does DML fix this?"

### Panel 3 -- DML Residualization

- **Position**: Row 1, Column 3 (top-right)
- **Dramatic function**: First attempt
- **Story beat**: "Naive estimates miss by 56%"
- **Callout**: "ATE = 0.240"
- **Key number**: DML ATE for mining effect (1-0) = 0.240, ground truth = 0.250
- **Central sketch**: Large chalk-drawn funnel with confounders pouring in at the wide top and a clean residualized signal dripping out the narrow bottom into a causal forest
- **Body sentences** (for manual overlay):
  - DML residualizes both outcome and treatment in a first stage -- like noise-canceling headphones removing confounder background noise.
  - The causal forest recovers ATE = 0.240 for the mining effect, close to the ground truth of 0.250.
  - Neyman orthogonality means first-stage errors have only second-order impact on the causal estimates.
- **Transition to next**: "But does the effect vary?"

### Panel 4 -- Institutions vs Prices

- **Position**: Row 2, Column 1 (bottom-left)
- **Dramatic function**: Twist
- **Story beat**: "Institutions shape mining effects, NOT price effects"
- **Callout**: "Range: 0.089 vs 0.045"
- **Key number**: Mining GATE range = 0.089 across institutional levels; price GATE range = only 0.045
- **Central sketch**: Chalk-drawn balance scale -- left pan labeled "Mining" tilts sharply based on a teal pillar labeled "Institutions," while right pan labeled "Prices" stays level regardless of the pillar
- **Body sentences** (for manual overlay):
  - Mining effect GATEs range from 0.175 at the weakest institutions to 0.264 at the strongest -- a spread of 0.089.
  - Price effect GATEs show a range of only 0.045 with no monotone pattern -- institutions do not moderate price shocks.
  - This asymmetry matches exactly the structural finding in Hodler, Lechner & Raschky (2023).
- **Transition to next**: "What do the forest's own diagnostics say?"

### Panel 5 -- Importance Can Mislead

- **Position**: Row 2, Column 2 (bottom-center)
- **Dramatic function**: Surprise
- **Story beat**: "Feature importance lies about moderation"
- **Callout**: "GATEs reveal the truth"
- **Key number**: N/A (conceptual panel -- exec_constraints importance = 0.010 despite being the true moderator)
- **Central sketch**: Chalk-drawn lightning bolt striking a ranked list where geographic variables (distance_capital 0.172, ethnic_frac 0.141) sit at the top and institutional variables (exec_constraints 0.010) sit at the bottom, with a teal arrow flipping the order
- **Body sentences** (for manual overlay):
  - Geographic variables dominate feature importance because they have continuous variation the forest splits on finely.
  - Executive constraints ranks last at 0.010 importance despite being the true moderator -- it has only 6 discrete levels.
  - Feature importance measures splitting frequency, not causal importance -- GATE analysis is the right tool for moderation.
- **Transition to next**: "So what's the takeaway?"

### Panel 6 -- Institutions Are Key

- **Position**: Row 2, Column 3 (bottom-right)
- **Dramatic function**: Resolution
- **Story beat**: "Institutions steer mining toward prosperity"
- **Callout**: "DML + GATEs reveal the answer"
- **Key number**: N/A (resolution panel)
- **Central sketch**: Chalk-drawn fork in the road with two signpost arrows -- "Curse" crossed out and "Blessing" circled in warm orange, with a teal pillar labeled "Institutions" at the fork
- **Body sentences** (for manual overlay):
  - CausalForestDML recovered all three ground-truth findings: mining ATE = 0.240, non-linear price effects, and institutional moderation.
  - The DML framework makes the causal forest robust to nuisance model errors via Neyman orthogonality.
  - For heterogeneous effects with confounders, residualize first -- then let the forest discover the heterogeneity.
- **Transition to next**: N/A (final panel)

### Story Spine

> CausalForestDML reveals that institutions determine whether mining is a blessing or a curse by showing that the mining effect increases by 50% from weak to strong institutions while price effects stay flat, challenging the assumption that the resource curse affects all places equally.

### Margin Elements

- **Professor's note**: "Feature importance measures splitting frequency, not causal importance -- use GATEs instead!" -- positioned bottom-right margin, with arrow toward Panel 5
- **Color legend**: Institutions: teal, Key effects: warm orange, Data / method: chalk white
- **Background formulas**: Y = T * tau(x) + g(x,w) + epsilon, T = m(x,w) + v at 15-20% opacity
