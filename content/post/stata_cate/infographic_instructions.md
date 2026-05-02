# Infographic Instructions: CATE with Stata 19

Template: **Causal Inference**. Target tool: **Gemini / Ideogram** (Option A — full text rendering). Title: "WHEN THE AVERAGE HIDES THE STORY". Guiding question: "Who really benefits from 401(k) eligibility — and by how much?".

---

## Section A: Full Image Generation Prompt

Create a 1920x1080 landscape digital chalk illustration on a dark navy background (#0e1545). The style is academic chalkboard sketchnote: all lettering appears hand-drawn in chalk with slightly irregular strokes, chalk-dust particles float near text edges, and faint smudge marks add realism. The overall feel resembles a photograph of an expertly annotated university lecture chalkboard.

The composition consists of a centered title banner at the very top, with six panels below arranged in a 3-column by 2-row grid. Each panel is bordered by a chalk-drawn rounded rectangle in steel blue (#8bb8e0) with slightly uneven, hand-drawn edges. A small circled numeral in warm orange (#e8956a) sits in the top-left corner of each panel — 1 through 6, reading left-to-right and top-to-bottom. Chalk arrows with dust particles connect the panels in reading order: panel 1 to 2 to 3 across the top row, a vertical chalk arrow from panel 3 down to panel 4, then 4 to 5 to 6 across the bottom row. Generous dark navy space between panels lets the background act as a design element, and there is breathing room around the entire grid for margin elements.

Colors: Navy blue (#0e1545) fills the background. Chalk white (#f0ece2) is used for all body text and sketch outlines — never pure white (#ffffff), always slightly warm and creamy. Steel blue (#8bb8e0) marks panel titles and borders. Warm orange (#e8956a) highlights key numbers, bold callouts, and cautionary findings — for example, the \$1,399 GATE for households in income category 1 (a group that gains essentially nothing from eligibility) and the \$2,919 bottom-quartile GATES estimate (not statistically distinguishable from zero). Teal (#00d4c8) marks positive results — for example, the \$20,511 GATE for the highest income category and the \$17,279 top-quartile GATES estimate, the strongest evidence of who the program helps. Muted chalk gray (#b0a89a) appears on connectors, annotations, and de-emphasized labels.

The title banner reads "WHEN THE AVERAGE HIDES THE STORY" in large steel blue (#8bb8e0) chalk small-caps, centered above the grid. Below it in smaller chalk-white (#f0ece2) italic: "Who really benefits from 401(k) eligibility — and by how much?". Below the question in slightly smaller muted gray (#b0a89a) chalk text: "Conditional Average Treatment Effects with Stata 19 — assets3 dataset, n = 9,913 households".

The top-left panel (row 1, column 1) is bounded by a chalk-blue rounded rectangle with a circled "1" in warm orange in its corner. Its title in steel blue small-caps reads "FROM RAW GAP TO CAUSAL EFFECT". A chalk-drawn magnifying glass hovers over a pair of small stick figures, one slightly larger than the other — symbolic of comparing eligible and ineligible households. Below the icon, two side-by-side chalk bars are drawn: a tall warm-orange bar labeled "\$19,557 raw gap" and next to it a shorter teal bar labeled "\$8,019 ATE", with a chalk-drawn caret bracket showing the difference labeled "selection bias". The phrase "60% selection, 40% effect" appears in large warm orange (#e8956a) chalk lettering with a chalk underline swoosh below the bars. In chalk white (#f0ece2), the body text reads: "Eligible households hold \$30,347 in assets versus \$10,790 for ineligible — a raw gap of \$19,557." and "After doubly robust adjustment with teffects aipw, the causal ATE is only \$8,019 (95% CI \$5,762 to \$10,277)." A chalk arrow connects to Panel 2 with the phrase "But the average hides…" in small muted gray (#b0a89a) chalk along the arrow.

The top-center panel (row 1, column 2) is bounded by a chalk-blue rounded rectangle with a circled "2" in warm orange. Its title in steel blue small-caps reads "EFFECTS ARE NOT THE SAME". A chalk-drawn right-skewed histogram with a long fat right tail dominates the panel: bars start tall on the left around the mean, with progressively smaller bars stretching far to the right, and a thin chalk arrow labels the tail "to \$80k+". Below the histogram, the formal test result is annotated in chalk: "estat heterogeneity: chi^2(1) = 4.11, p = 0.043". The phrase "REJECT HOMOGENEITY" appears in large warm orange (#e8956a) chalk lettering with a chalk underline swoosh. In chalk white, the body text reads: "The CATE function tau(x) is not constant — formal test rejects equal effects at the 5 percent level." and "Most households cluster around \$5,000–\$10,000, but a long right tail extends to \$80,000 and beyond." A chalk arrow connects to Panel 3 with the phrase "Who's in the right tail?" in small muted gray chalk along the arrow.

The top-right panel (row 1, column 3) is bounded by a chalk-blue rounded rectangle with a circled "3" in warm orange. Its title in steel blue small-caps reads "INCOME IS THE BIG DIVIDE". A chalk-drawn ascending stairstep diagram of five bars — labeled 0, 1, 2, 3, 4 along the x-axis — shows GATE values rising and falling: the bars climb to roughly \$4,087, dip down to \$1,399 (drawn in warm orange to flag the surprise), rise to \$5,154, then \$8,532, then \$20,511 — the tallest bar drawn in teal. Above the tall final bar a chalk numeral "\$20,511" is annotated. The phrase "15× SPREAD ACROSS INCOME" appears in large warm orange (#e8956a) chalk lettering with a chalk underline swoosh. In chalk white, the body text reads: "Top income category gains \$20,511 — five times the \$8,000 average." and "Joint test of GATE equality across the five groups: chi^2(4) = 18.44, p = 0.001." A chalk arrow drops down vertically from Panel 3 to Panel 4 with the phrase "Let the data sort itself…" in small muted gray chalk along the arrow.

The bottom-left panel (row 2, column 1) is the comparison-visual panel. It is bounded by a chalk-blue rounded rectangle with a circled "4" in warm orange. Its title in steel blue small-caps reads "DATA-DRIVEN QUARTILES — A 6:1 LADDER". A chalk-drawn vertical bar chart with four bars (rank 1 on the left, rank 4 on the right) shows a clean monotonic descent: rank 1 reaches \$17,279 (drawn in teal with bold chalk), rank 2 \$8,121, rank 3 \$3,444, and rank 4 \$2,919 (drawn in warm orange to flag that it is not statistically significant). Each bar has chalk-drawn confidence-interval whiskers. A horizontal dashed chalk line at \$0 sits below the bars, and the bottom-quartile bar's whiskers visibly cross it. The phrase "5.9× FROM TOP TO BOTTOM" appears in large warm orange (#e8956a) chalk lettering with a chalk underline swoosh. In chalk white, the body text reads: "Households sorted by predicted effect: top quartile gains \$17,279, bottom quartile gains \$2,919 — and that bottom estimate cannot reject zero (p = 0.167)." and "Cross-fitting blocks p-hacking: each unit's bin uses an out-of-sample prediction, so observations cannot leak their own outcome into bin assignment." A chalk arrow connects to Panel 5 with the phrase "Who's in the top quartile?" in small muted gray chalk along the arrow.

The bottom-center panel (row 2, column 2) is bounded by a chalk-blue rounded rectangle with a circled "5" in warm orange. Its title in steel blue small-caps reads "OLDER, RICHER, MORE EDUCATED". Two chalk-drawn stick figures stand side by side: one taller and slightly older-looking, the other smaller and younger. A chalk-drawn comparison table sits below the figures with two columns headed "TOP Q" and "BOTTOM Q" and three rows labeled "Age", "Educ", "Income" containing the values "45.1 yrs / 35.0 yrs", "14.0 yrs / 12.7 yrs", and "\$62,739 / \$26,861". The phrase "+\$35,878 INCOME" appears in large warm orange (#e8956a) chalk lettering with a chalk underline swoosh next to the income row. In chalk white, the body text reads: "The top-effect quartile is 10.2 years older, has 1.4 more years of education, and earns \$35,878 more in household income on average." and "All three differences are massively significant (t = 35.7, 18.6, 56.2) — income is the dominant marker of who responds." A chalk arrow connects to Panel 6 with the phrase "Robust to estimator choice?" in small muted gray chalk along the arrow.

The bottom-right panel (row 2, column 3) is bounded by a chalk-blue rounded rectangle with a circled "6" in warm orange. Its title in steel blue small-caps reads "THREE ESTIMATORS, ONE ANSWER". Three chalk-drawn horizontal confidence intervals stack vertically, each labeled with its estimator: "teffects aipw" at \$8,019, "cate po" at \$7,937, and "cate aipw" at \$8,120. The intervals overlap heavily, drawn in chalk white with point estimates marked in teal dots. A chalk-drawn arrow circles the cluster and points to the cluster center with the phrase "agree within \$200". The phrase "ROBUST ATE: \~\$8,000" appears in large warm orange (#e8956a) chalk lettering with a chalk underline swoosh. In chalk white, the body text reads: "Parametric AIPW (\$8,019), ML PO (\$7,937), and ML AIPW (\$8,120) bracket each other within a \$183 spread." and "Both ML estimators reject homogeneity — heterogeneity is real, not an artifact of one particular specification."

Outside the panel grid in the bottom-right margin, a professor's margin note appears in smaller italic chalk-white text with a hand-drawn arrow pointing toward Panel 4: "Roughly 1 in 4 households gains essentially nothing from 401(k) eligibility — a fact the ATE alone cannot reveal." Outside the panel grid in the bottom-left margin, a small chalk-text color concept legend with three colored dot swatches: "Causal effect (positive): teal dot", "Bias / null effect: warm orange dot", "Data / population: chalk white dot".

The atmosphere is enriched with chalk-dust particles floating near text edges and panel borders, and subtle smudge marks where chalk has been partially erased. Faint chalk-drawn formulas and equations are visible behind the panels on the navy background at 15-20% opacity in muted gray (#b0a89a): "tau(x) = E[y(1) - y(0) | X = x]" appears in the upper-left background, "Gamma_i = y_hat(1) + d(y - y_hat(1))/f - y_hat(0) - (1-d)(y - y_hat(0))/(1-f)" stretches across the lower-middle background, and "y = d * tau(x) + g(x,w) + e" appears in the upper-right background. Tiny chalk illustrations are scattered as decorative elements in the negative space: a tiny chalk decision tree, a small chalk forest of trees (for "causal forest"), a folded data block (for "cross-fitting"), and a chalk numeric histogram silhouette.

Text rendering priorities: The title banner text and panel numbers must be clearly legible. Panel titles should be readable in steel blue small-caps. Key numbers and callout phrases must be prominent in warm orange. Body text sentences should be readable in chalk white. Connector phrases and annotations can be smaller but still legible. Background formulas should be barely visible at 15-20% opacity.

---

## Negative Prompt

Do not include: photorealistic rendering, glossy or reflective surfaces, drop shadows, gradient color fills, emojis or Unicode symbols, computer-generated sans-serif typography, neon glow effects, 3D perspective or depth, watermarks, stock photo elements, smooth vector curves, pure white (#ffffff) — all whites should be warm/creamy chalk white (#f0ece2). All lines should appear hand-drawn with varying weight and chalk texture. Do not use clean digital borders or perfectly straight lines. Do not include photographs of actual chalkboards or classrooms. Do not include corporate stock-illustration elements such as smiling business people, briefcases, or office desks. Do not render currency values with a sans-serif numeric font; numbers must look hand-written in chalk.

---

## Condensed Prompt (~300 words)

Chalkboard infographic, 1920x1080 landscape, navy background (#0e1545). Academic chalk-drawn sketchnote style with hand-lettered text, chalk dust, and faint formula textures. Six panels in a 3x2 grid with steel blue (#8bb8e0) chalk borders connected by chalk arrows. Title: "WHEN THE AVERAGE HIDES THE STORY" in steel blue small-caps, subtitle: "Who really benefits from 401(k) eligibility — and by how much?" in italic chalk white, n = 9,913 households. Colors: chalk white (#f0ece2) body text, warm orange (#e8956a) key numbers and bias warnings, teal (#00d4c8) positive findings, muted gray (#b0a89a) annotations. Panel 1 (top-left): "FROM RAW GAP TO CAUSAL EFFECT" — magnifying glass over stick figures, side-by-side bars \$19,557 vs \$8,019, callout "60% selection, 40% effect". Panel 2 (top-center): "EFFECTS ARE NOT THE SAME" — right-skewed chalk histogram with fat tail, callout "p = 0.043, REJECT HOMOGENEITY". Panel 3 (top-right): "INCOME IS THE BIG DIVIDE" — five-bar GATE chart \$4,087 / \$1,399 / \$5,154 / \$8,532 / \$20,511, callout "15× SPREAD". Panel 4 (bottom-left): "DATA-DRIVEN QUARTILES — A 6:1 LADDER" — descending four-bar GATES chart with CI whiskers \$17,279 / \$8,121 / \$3,444 / \$2,919, callout "5.9× FROM TOP TO BOTTOM". Panel 5 (bottom-center): "OLDER, RICHER, MORE EDUCATED" — two stick figures and a comparison table 45.1/35.0 yrs, 14.0/12.7 yrs, \$62,739/\$26,861, callout "+\$35,878 INCOME". Panel 6 (bottom-right): "THREE ESTIMATORS, ONE ANSWER" — three stacked CI bars at \$8,019, \$7,937, \$8,120, callout "AGREE WITHIN \$200". Professor's margin note bottom-right toward Panel 4: "Roughly 1 in 4 households gains essentially nothing." Color legend bottom-left: positive: teal, bias / null: orange, data: white. Faint background formulas at 15% opacity: tau(x) = E[y(1) - y(0) | X = x], Gamma_i = AIPW score, y = d*tau(x) + g(x,w) + e. No photorealism, no gradients, no emojis, no drop shadows, no pure white.

---

## Panel Reference Data

### Panel 1 — From raw gap to causal effect

- **Position**: row 1, column 1 (top-left)
- **Callout**: "60% selection, 40% effect"
- **Key number**: \$19,557 raw gap → \$8,019 causal ATE (95% CI \$5,762–\$10,277)
- **Body sentences**:
  - Eligible households hold \$30,347 in assets versus \$10,790 for ineligible — a raw gap of \$19,557.
  - After doubly robust adjustment with teffects aipw, the causal ATE is only \$8,019 (95% CI \$5,762 to \$10,277).
- **Icon**: Chalk magnifying glass hovering over a pair of stick figures of different sizes
- **Mini-viz**: Two side-by-side chalk bars — tall warm-orange "\$19,557" and shorter teal "\$8,019" with a chalk caret bracket labeling the difference "selection bias"
- **Connector to next**: "But the average hides…"

### Panel 2 — Effects are not the same

- **Position**: row 1, column 2 (top-center)
- **Callout**: "REJECT HOMOGENEITY"
- **Key number**: estat heterogeneity chi^2(1) = 4.11, p = 0.043
- **Body sentences**:
  - The CATE function tau(x) is not constant — formal test rejects equal effects at the 5 percent level.
  - Most households cluster around \$5,000–\$10,000, but a long right tail extends to \$80,000 and beyond.
- **Icon**: Chalk-drawn right-skewed histogram silhouette with a thin annotation arrow pointing to the tail labeled "to \$80k+"
- **Mini-viz**: The histogram itself, with progressively smaller bars stretching right; chalk-text annotation "chi^2(1) = 4.11, p = 0.043" below
- **Connector to next**: "Who's in the right tail?"

### Panel 3 — Income is the big divide

- **Position**: row 1, column 3 (top-right)
- **Callout**: "15× SPREAD ACROSS INCOME"
- **Key number**: GATE \$20,511 (top income category) vs \$1,399 (income category 1)
- **Body sentences**:
  - Top income category gains \$20,511 — five times the \$8,000 average.
  - Joint test of GATE equality across the five groups: chi^2(4) = 18.44, p = 0.001.
- **Icon**: Stairstep arrow climbing up to the right
- **Mini-viz**: Five vertical chalk bars at heights \$4,087, \$1,399 (warm orange to flag the surprise), \$5,154, \$8,532, \$20,511 (teal, tallest); x-axis labeled with income category numbers 0–4
- **Connector to next**: "Let the data sort itself…"

### Panel 4 — Data-driven quartiles, a 6:1 ladder (COMPARISON VISUAL)

- **Position**: row 2, column 1 (bottom-left)
- **Callout**: "5.9× FROM TOP TO BOTTOM"
- **Key number**: GATES rank 1 \$17,279 vs rank 4 \$2,919 (not significant, p = 0.167)
- **Body sentences**:
  - Households sorted by predicted effect: top quartile gains \$17,279, bottom quartile gains \$2,919 — and that bottom estimate cannot reject zero (p = 0.167).
  - Cross-fitting blocks p-hacking: each unit's bin uses an out-of-sample prediction, so observations cannot leak their own outcome into bin assignment.
- **Icon**: Sorted bins / staircase descending from top-left to bottom-right
- **Mini-viz**: Four vertical chalk bars in descending order — \$17,279 (teal, tallest), \$8,121, \$3,444, \$2,919 (warm orange, with whiskers crossing a dashed \$0 line); chalk numerals above each bar
- **Connector to next**: "Who's in the top quartile?"

### Panel 5 — Older, richer, more educated

- **Position**: row 2, column 2 (bottom-center)
- **Callout**: "+\$35,878 INCOME"
- **Key number**: Top vs bottom quartile income gap \$35,878 (t = 56.2)
- **Body sentences**:
  - The top-effect quartile is 10.2 years older, has 1.4 more years of education, and earns \$35,878 more in household income on average.
  - All three differences are massively significant (t = 35.7, 18.6, 56.2) — income is the dominant marker of who responds.
- **Icon**: Two side-by-side stick figures, one larger/older
- **Mini-viz**: A two-column chalk comparison table headed "TOP Q | BOT Q" with rows "Age 45.1 / 35.0", "Educ 14.0 / 12.7", "Income \$62,739 / \$26,861" (income row drawn in warm orange)
- **Connector to next**: "Robust to estimator choice?"

### Panel 6 — Three estimators, one answer

- **Position**: row 2, column 3 (bottom-right)
- **Callout**: "ROBUST ATE: ~\$8,000"
- **Key number**: \$7,937 (PO) / \$8,019 (parametric AIPW) / \$8,120 (ML AIPW); spread \$183
- **Body sentences**:
  - Parametric AIPW (\$8,019), ML PO (\$7,937), and ML AIPW (\$8,120) bracket each other within a \$183 spread.
  - Both ML estimators reject homogeneity — heterogeneity is real, not an artifact of one particular specification.
- **Icon**: Three converging chalk arrows pointing inward to a central dot
- **Mini-viz**: Three stacked horizontal CI intervals labeled "teffects aipw", "cate po", "cate aipw" with point-estimate dots in teal at \$8,019, \$7,937, \$8,120; a chalk-drawn ellipse circles the cluster with annotation "agree within \$200"
- **Connector to next**: (none — final panel)

### Margin Elements

- **Professor's note**: "Roughly 1 in 4 households gains essentially nothing from 401(k) eligibility — a fact the ATE alone cannot reveal." — positioned bottom-right margin, with arrow toward Panel 4
- **Color legend** (positioned bottom-left margin): Causal effect (positive): teal; Bias / null effect: warm orange; Data / population: chalk white
- **Background formulas** at 15-20% opacity: `tau(x) = E[y(1) - y(0) | X = x]` (upper-left), `Gamma_i = y_hat(1) + d(y - y_hat(1))/f - y_hat(0) - (1-d)(y - y_hat(0))/(1-f)` (lower-middle), `y = d * tau(x) + g(x,w) + e` (upper-right)
- **Decorative scatter elements**: tiny chalk decision tree, small chalk forest of trees, folded data block (cross-fitting), small histogram silhouette
