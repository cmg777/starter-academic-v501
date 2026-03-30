# Taming Model Uncertainty with BMA and Double-Selection LASSO

## Full Image Generation Prompt

Create a 1920x1080 landscape digital chalk illustration on a dark navy background (#0e1545). The style is academic chalkboard sketchnote: all lettering appears hand-drawn in chalk with slightly irregular strokes, chalk-dust particles float near text edges, and faint smudge marks add realism. The overall feel resembles a photograph of an expertly annotated university lecture chalkboard.

The composition features a title banner centered at the top and six rectangular panels arranged in a 3-column by 2-row grid below it, with generous dark navy space between panels. Each panel has a chalk-drawn rounded-rectangle border in steel blue (#8bb8e0) with slightly uneven hand-drawn edges. Panel numbers appear as small circled numerals in warm orange (#e8956a) in the top-left corner of each panel. Chalk arrows with faint dust particles connect the panels in reading order: left to right across the top row (1 to 2 to 3), a vertical arrow from Panel 3 down to Panel 4, then left to right across the bottom row (4 to 5 to 6). Breathing room surrounds the entire grid to accommodate margin elements in the bottom-left and bottom-right corners.

Colors: Navy blue (#0e1545) fills the entire background. Chalk white (#f0ece2) is used for all body text and sketch outlines -- never pure white (#ffffff), always slightly warm and creamy. Steel blue (#8bb8e0) marks panel titles and chalk-drawn borders. Warm orange (#e8956a) highlights key numbers, bold callouts, and cautionary findings like the 29% coefficient instability across specifications. Teal (#00d4c8) marks positive results like both methods converging on the same inverted-N shape with turning points at $1,275 and $41,561. Muted chalk gray (#b0a89a) appears on connector arrows, annotations, and de-emphasized labels.

The title banner reads "TAMING MODEL UNCERTAINTY WITH BMA AND DOUBLE-SELECTION LASSO" in large steel blue (#8bb8e0) chalk small-caps, centered above the grid. Below it in smaller chalk-white (#f0ece2) italic: "With 16.7 million possible models, which one should you trust?"

The top-left panel (row 1, column 1) has a chalk-drawn rounded-rectangle border in steel blue (#8bb8e0) with a circled "1" in warm orange (#e8956a) in its top-left corner. The title reads "THE EKC HYPOTHESIS" in steel blue small-caps chalk lettering. Inside the panel, a chalk-drawn smokestack emits a curving plume that rises and then descends, tracing the shape of an inverted-U over a simple x-axis labeled "Income." A small chalk question mark hovers near the tail of the curve, hinting that the story may not end there. The phrase "Does pollution fall as countries grow richer?" appears in large warm orange (#e8956a) chalk with a chalk underline swoosh. In chalk white (#f0ece2), the text reads: "The Environmental Kuznets Curve says pollution rises with industrialization, then falls as nations afford cleaner technology" and "But recent evidence suggests an inverted-N -- pollution falls, rises, then falls again -- requiring a cubic polynomial to detect." A chalk arrow connects to Panel 2 with the phrase "How do we test this?" in small muted gray (#b0a89a) chalk along the arrow.

The top-center panel (row 1, column 2) has a chalk-drawn rounded-rectangle border in steel blue (#8bb8e0) with a circled "2" in warm orange (#e8956a) in its top-left corner. The title reads "84 COUNTRIES, 24 CONTROLS" in steel blue small-caps chalk lettering. Inside the panel, a chalk-drawn grid of tiny country flag outlines (simplified rectangular blocks with varied internal lines) represents the 84 countries, with a small label "N = 1,215 obs" beneath the grid. Six small chalk icons arranged in a cluster represent the control variable groups: a lightning bolt (energy), a cityscape (sociodemographic), a gear (technology), a leaf (environment), a coin (economic), and a ballot box (institutional). The phrase "2^24 = 16.7 million possible models" appears in large warm orange (#e8956a) chalk numerals with a chalk underline swoosh. In chalk white (#f0ece2), the text reads: "Panel data from 1995--2015 with CO2 emissions, GDP per capita, and 24 candidate controls across six thematic groups" and "Pick one model arbitrarily and you implicitly assume the other 16.7 million are wrong." A chalk arrow connects to Panel 3 with the phrase "Standard regressions reveal the problem" in small muted gray (#b0a89a) chalk along the arrow.

The top-right panel (row 1, column 3) has a chalk-drawn rounded-rectangle border in steel blue (#8bb8e0) with a circled "3" in warm orange (#e8956a) in its top-left corner. The title reads "COEFFICIENT INSTABILITY" in steel blue small-caps chalk lettering. Inside the panel, two chalk-drawn vertical bars stand side by side: one labeled "Sparse" at height --5.67 in chalk white (#f0ece2) and a taller one labeled "Kitchen-Sink" at height --7.34 in warm orange (#e8956a), with a double-headed arrow between them labeled "29%." Below the bars, a chalk number line shows the minimum turning point jumping from $289 to $1,159 with a small "x4" annotation. The phrase "GDP coefficient shifts 29% across specifications" appears in large warm orange (#e8956a) chalk numerals with a chalk underline swoosh. In chalk white (#f0ece2), the text reads: "The sparse model finds a minimum turning point at $289; the kitchen-sink model pushes it to $1,159 -- a fourfold change" and "We need a principled method for deciding which of the 24 controls belong in the model." A chalk arrow connects downward to Panel 4 with the phrase "Two principled solutions" in small muted gray (#b0a89a) chalk along the arrow.

The bottom-left panel (row 2, column 1) has a chalk-drawn rounded-rectangle border in steel blue (#8bb8e0) with a circled "4" in warm orange (#e8956a) in its top-left corner. The title reads "BMA vs. DSL" in steel blue small-caps chalk lettering. Inside the panel, two side-by-side comparison blocks are drawn in chalk. On the left, a chalk-drawn horse race icon (three stick horses in a row) represents BMA with the label "Bet on every horse" and "2,162 models averaged" beneath it in chalk white. On the right, a chalk-drawn magnifying glass with a LASSO loop represents DSL with the label "Smart assistant" and "4 seconds, 107 controls selected" beneath it. The BMA block has a small chalk "~15 min" timer; the DSL block has a "~4 sec" timer. Both blocks are outlined in teal (#00d4c8) to indicate they are complementary methods. The phrase "Bayesian averaging meets frequentist selection" appears in large teal (#00d4c8) chalk with a chalk underline swoosh. In chalk white (#f0ece2), the text reads: "BMA averages across thousands of models, weighting each by posterior probability -- 15 variables earn PIP > 0.5" and "DSL runs LASSO twice (on outcome and treatment) to select controls that prevent omitted variable bias." A chalk arrow connects to Panel 5 with the phrase "Do they agree?" in small muted gray (#b0a89a) chalk along the arrow.

The bottom-center panel (row 2, column 2) has a chalk-drawn rounded-rectangle border in steel blue (#8bb8e0) with a circled "5" in warm orange (#e8956a) in its top-left corner. The title reads "CONVERGENCE: INVERTED-N CONFIRMED" in steel blue small-caps chalk lettering. Inside the panel, a chalk-drawn inverted-N curve is sketched with two vertical dashed lines marking the turning points. A solid line labeled "BMA" and a dashed line labeled "DSL" overlap almost perfectly along the curve, with small teal dots at their respective turning points. The x-axis is labeled "Log GDP per capita" and the y-axis "Log CO2." The phrase "Both methods trace the same inverted-N shape" appears in large teal (#00d4c8) chalk with a chalk underline swoosh. In chalk white (#f0ece2), the text reads: "BMA turning points: $1,275 and $41,561 -- DSL turning points: $557 and $35,743" and "The maximum turning points differ by only $5,800 -- remarkable agreement from fundamentally different philosophies." A chalk arrow connects to Panel 6 with the phrase "What does this mean for policy?" in small muted gray (#b0a89a) chalk along the arrow.

The bottom-right panel (row 2, column 3) has a chalk-drawn rounded-rectangle border in steel blue (#8bb8e0) with a circled "6" in warm orange (#e8956a) in its top-left corner. The title reads "POLICY BOTTOM LINE" in steel blue small-caps chalk lettering. Inside the panel, a chalk-drawn world map outline has three shaded zones: the leftmost region (very poor) in teal (#00d4c8) with a downward arrow, the middle region (industrializing) in warm orange (#e8956a) with an upward arrow, and the right region (wealthy) in teal (#00d4c8) with a downward arrow. Small chalk labels read "Phase 1: Declining", "Phase 2: Rising", "Phase 3: Declining." The phrase "Middle-income countries cannot grow out of pollution" appears in large warm orange (#e8956a) chalk with a chalk underline swoosh. In chalk white (#f0ece2), the text reads: "The rising phase spans roughly $600--$1,300 to $36,000--$42,000 -- most of the world's population lives here" and "Active investment in clean technology and regulation is essential; waiting for income growth alone is not a strategy."

In the bottom-right margin, outside the panel grid, a professor's handwritten-style annotation in smaller italic chalk white (#f0ece2) reads: "When a Bayesian and a frequentist agree, pay attention -- that's robust evidence!" A hand-drawn chalk arrow points from the note toward Panel 5. In the bottom-left margin, a small color concept legend shows three entries: a teal (#00d4c8) dot labeled "Robust finding / convergence", a warm orange (#e8956a) dot labeled "Model uncertainty / instability", and a chalk white (#f0ece2) dot labeled "Data / controls."

Faint chalk-drawn equations are visible behind the panels on the navy background at approximately 15-20% opacity in muted gray (#b0a89a): the formulas "ln(CO2) = beta1 ln(GDP) + beta2 ln(GDP)^2 + beta3 ln(GDP)^3 + X'gamma + alpha_i + delta_t + epsilon" and "PIP_j = Sigma P(M_k | data)" and "min (1/2N) Sigma(y_i - x'beta)^2 + lambda Sigma |beta_j|" are scattered across the background, partially obscured by the panels. Chalk-style illustrations of bell curves, horse silhouettes, and LASSO loops appear faintly in the background gaps. Subtle chalk dust particles float near text edges and panel borders, and faint smudge marks appear where chalk has been partially erased, adding tactile realism.

Text rendering priorities: The title banner text and panel numbers must be clearly legible. Panel titles should be readable in steel blue small-caps. Key numbers and callout phrases must be prominent in warm orange. Body text sentences should be readable in chalk white. Connector phrases and annotations can be smaller but still legible. Background formulas should be barely visible at 15-20% opacity.

---

## Negative Prompt

Do not include: photorealistic rendering, glossy or reflective surfaces, drop shadows, gradient color fills, emojis or Unicode symbols, computer-generated sans-serif typography, neon glow effects, 3D perspective or depth, watermarks, stock photo elements, smooth vector curves, pure white (#ffffff) -- all whites should be warm/creamy chalk white (#f0ece2). All lines should appear hand-drawn with varying weight and chalk texture. Do not use clean digital borders or perfectly straight lines. Do not include photographs of actual chalkboards or classrooms. Do not include detailed realistic country flags or photographic world maps.

---

## Condensed Prompt (~300 words)

Chalkboard infographic, 1920x1080 landscape, navy background (#0e1545). Academic chalk-drawn sketchnote style with hand-lettered text, chalk dust, and faint formula textures. Six panels in a 3x2 grid with steel blue (#8bb8e0) chalk borders connected by chalk arrows. Title: "TAMING MODEL UNCERTAINTY WITH BMA AND DOUBLE-SELECTION LASSO" in steel blue small-caps, subtitle: "With 16.7 million possible models, which one should you trust?" in italic chalk white (#f0ece2). Colors: chalk white (#f0ece2) body text, warm orange (#e8956a) key numbers, teal (#00d4c8) positive highlights, muted gray (#b0a89a) annotations. Panel 1 (top-left): "THE EKC HYPOTHESIS" -- chalk smokestack with inverted-U plume and question mark, orange "Does pollution fall as countries grow richer?" Panel 2 (top-center): "84 COUNTRIES, 24 CONTROLS" -- chalk country grid with six thematic icons, orange "2^24 = 16.7 million possible models." Panel 3 (top-right): "COEFFICIENT INSTABILITY" -- two bars showing coefficient shift from -5.67 to -7.34, number line with $289 to $1,159 jump, orange "29% shift." Panel 4 (bottom-left): "BMA vs. DSL" -- side-by-side: horse race icon (BMA, 2,162 models, ~15 min) vs magnifying glass with LASSO loop (DSL, 107 controls, ~4 sec), teal "Bayesian meets frequentist." Panel 5 (bottom-center): "CONVERGENCE: INVERTED-N CONFIRMED" -- overlapping BMA and DSL curves tracing inverted-N with turning point markers at $1,275/$41,561 and $557/$35,743, teal "Same shape." Panel 6 (bottom-right): "POLICY BOTTOM LINE" -- chalk world map with three phases (declining/rising/declining), orange "Middle-income countries cannot grow out of pollution." Professor's margin note bottom-right: "When a Bayesian and a frequentist agree, pay attention!" with arrow toward Panel 5. Color legend bottom-left: Robust finding: teal, Uncertainty: orange, Data: white. Faint background formulas: ln(CO2) = beta1 ln(GDP) + beta2 ln(GDP)^2 + ..., PIP_j = Sigma P(M_k|data), LASSO objective at 15% opacity. No photorealism, no gradients, no emojis, no drop shadows, no pure white.

---

## Panel Reference Data

### Panel 1 -- The EKC Hypothesis

- **Position**: Row 1, Column 1 (top-left)
- **Callout**: "Does pollution fall as countries grow richer?"
- **Key number**: N/A (conceptual panel)
- **Body sentences**:
  - The Environmental Kuznets Curve says pollution rises with industrialization, then falls as nations afford cleaner technology.
  - But recent evidence suggests an inverted-N -- pollution falls, rises, then falls again -- requiring a cubic polynomial to detect.
- **Icon**: Chalk-drawn smokestack emitting a curving plume that traces an inverted-U, with a question mark at the tail
- **Mini-viz**: Simple inverted-U curve over an x-axis labeled "Income," with a chalk question mark near the descending tail hinting at a possible third phase
- **Connector to next**: "How do we test this?"

### Panel 2 -- 84 Countries, 24 Controls

- **Position**: Row 1, Column 2 (top-center)
- **Callout**: "2^24 = 16.7 million possible models"
- **Key number**: 1,215 observations from 84 countries, 1995--2015
- **Body sentences**:
  - Panel data from 1995--2015 with CO2 emissions, GDP per capita, and 24 candidate controls across six thematic groups.
  - Pick one model arbitrarily and you implicitly assume the other 16.7 million are wrong.
- **Icon**: Grid of tiny chalk country outlines with six thematic icons (lightning bolt, cityscape, gear, leaf, coin, ballot box)
- **Mini-viz**: Chalk grid of 84 country blocks with "N = 1,215 obs" label beneath
- **Connector to next**: "Standard regressions reveal the problem"

### Panel 3 -- Coefficient Instability

- **Position**: Row 1, Column 3 (top-right)
- **Callout**: "GDP coefficient shifts 29% across specifications"
- **Key number**: beta1 changes from --5.67 (sparse) to --7.34 (kitchen-sink); minimum turning point jumps from $289 to $1,159
- **Body sentences**:
  - The sparse model finds a minimum turning point at $289; the kitchen-sink model pushes it to $1,159 -- a fourfold change.
  - We need a principled method for deciding which of the 24 controls belong in the model.
- **Icon**: Two chalk vertical bars at different heights with a double-headed "29%" arrow between them
- **Mini-viz**: Number line showing minimum turning point jumping from $289 to $1,159 with a "x4" annotation
- **Connector to next**: "Two principled solutions"

### Panel 4 -- BMA vs. DSL

- **Position**: Row 2, Column 1 (bottom-left)
- **Callout**: "Bayesian averaging meets frequentist selection"
- **Key number**: BMA sampled 2,162 models in ~15 min; DSL selected 107 controls in ~4 seconds
- **Body sentences**:
  - BMA averages across thousands of models, weighting each by posterior probability -- 15 variables earn PIP > 0.5.
  - DSL runs LASSO twice (on outcome and treatment) to select controls that prevent omitted variable bias.
- **Icon**: Side-by-side: horse race icon (BMA) vs magnifying glass with LASSO loop (DSL)
- **Mini-viz**: Two comparison blocks -- left: "2,162 models, ~15 min" with horse silhouettes; right: "107 controls, ~4 sec" with magnifying glass -- both outlined in teal
- **Connector to next**: "Do they agree?"

### Panel 5 -- Convergence: Inverted-N Confirmed

- **Position**: Row 2, Column 2 (bottom-center)
- **Callout**: "Both methods trace the same inverted-N shape"
- **Key number**: BMA turning points $1,275 and $41,561; DSL turning points $557 and $35,743; maximum TPs differ by $5,800
- **Body sentences**:
  - BMA turning points: $1,275 and $41,561 -- DSL turning points: $557 and $35,743.
  - The maximum turning points differ by only $5,800 -- remarkable agreement from fundamentally different philosophies.
- **Icon**: Two overlapping curves (solid and dashed) tracing the same inverted-N shape
- **Mini-viz**: Chalk inverted-N curve with two vertical dashed lines marking turning points, solid line labeled "BMA" and dashed line labeled "DSL" overlapping
- **Connector to next**: "What does this mean for policy?"

### Panel 6 -- Policy Bottom Line

- **Position**: Row 2, Column 3 (bottom-right)
- **Callout**: "Middle-income countries cannot grow out of pollution"
- **Key number**: Rising phase spans roughly $600--$1,300 to $36,000--$42,000 GDP per capita
- **Body sentences**:
  - The rising phase spans roughly $600--$1,300 to $36,000--$42,000 -- most of the world's population lives here.
  - Active investment in clean technology and regulation is essential; waiting for income growth alone is not a strategy.
- **Icon**: Chalk world map outline with three shaded zones and directional arrows (down, up, down)
- **Mini-viz**: World map with Phase 1 (teal, declining), Phase 2 (warm orange, rising), Phase 3 (teal, declining) zones
- **Connector to next**: N/A (final panel)

### Margin Elements

- **Professor's note**: "When a Bayesian and a frequentist agree, pay attention -- that's robust evidence!" -- positioned bottom-right margin, with arrow toward Panel 5
- **Color legend**: Robust finding / convergence: teal, Model uncertainty / instability: warm orange, Data / controls: chalk white
- **Background formulas**: ln(CO2) = beta1 ln(GDP) + beta2 ln(GDP)^2 + beta3 ln(GDP)^3 + X'gamma + alpha_i + delta_t + epsilon, PIP_j = Sigma P(M_k | data), min (1/2N) Sigma(y_i - x'beta)^2 + lambda Sigma |beta_j| at 15-20% opacity
