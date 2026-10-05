<!-- Usage note: paste the full prompt (Section A) or the condensed prompt (Section C) into the image tool, and supply the negative prompt (Section B) where the tool accepts one.
     Save the result as featured.webp in this folder, in a 16:9 format of at least 1280x720 pixels; 1920x1080 is preferred.
     The homepage tutorial cards crop the image with object-fit: cover, so the prompt keeps all key content inside a central safe area.
     The hex codes are chalkboard tones chosen for legibility on a dark background, not the colors of the site theme. -->

## Section A: Full Image Generation Prompt

Create a 1920x1080 landscape digital chalk illustration on a dark navy background (#0e1545). The style is academic chalkboard sketchnote: all lettering appears hand-drawn in chalk with slightly irregular strokes, chalk-dust particles float near text edges, and faint smudge marks add realism. The overall feel resembles a photograph of an expertly annotated university lecture chalkboard.

The composition places a title banner at the top center and six panels below it, in three columns and two rows. Each panel is a chalk-drawn rounded rectangle with uneven steel blue (#8bb8e0) edges and a circled warm orange (#e8956a) numeral in its top-left corner. Chalk arrows with dust particles link the panels in reading order: across the top row, down from Panel 3 to Panel 4, and across the bottom row. Generous dark space separates the panels. The website crops this image to fill its cards, so all key content sits inside a central safe area. Every title, panel, number, and note stays at least 100 pixels from the left and right edges.

Colors: navy blue (#0e1545) fills the background. Chalk white (#f0ece2) carries body text, sketch outlines, and the donor states, and pure white (#ffffff) never appears. Steel blue (#8bb8e0) marks the title, the panel titles, and the panel borders. Warm orange (#e8956a) marks actual California and all six callouts, including the three big numbers. Teal (#00d4c8) marks synthetic California wherever it appears. Muted chalk gray (#b0a89a) carries arrows, small annotations, and the faint background formulas.

The title banner reads "BUILDING A SYNTHETIC CALIFORNIA WITH MLSYNTH" in large steel blue (#8bb8e0) chalk small caps, centered above the grid. Below it, a smaller italic subtitle in chalk white (#f0ece2) reads "What would cigarette sales have been without Proposition 99?" Both lines must be fully legible, with even letter spacing.

Panel 1 (top-left): title "CIGARETTE SALES FELL EVERYWHERE" in steel blue small caps. A chalk hillside slopes downward, and a crowd of chalk-white stick figures, one for each state, walks down it together. One orange figure labeled "California" walks farther down, beside the gray note "123.0 to 90.1 packs, 1970–1988". A ballot box on the hilltop carries the tag "Proposition 99: 25 cents per pack, 1989". Callout in warm orange: "A falling trend is not an effect". Chalk arrow to Panel 2.

Panel 2 (top-center): title "NO TWIN STATE EXISTS" in steel blue small caps. An empty puzzle slot has the chalk outline of California. Beside it, a chalk-white puzzle piece labeled "average of 38 states" is far too large to fit. A gray tape measure between the slot and the piece reads "1988: 90.1 against 113.82 packs". Callout in warm orange: "The average state is no twin". Chalk arrow to Panel 3.

Panel 3 (top-right): title "A RECIPE OF FIVE STATES" in steel blue small caps. A chalk recipe card lists five ingredients: "Utah 0.335", "Nevada 0.236", "Montana 0.202", "Colorado 0.160", and "Connecticut 0.068". Five small arrows pour them into a teal mixing bowl labeled "synthetic California". Beside the bowl, a solid orange line and a dashed teal line overlap closely, with the gray label "RMSE 1.754 packs before 1989". Callout in warm orange: "If no twin exists, build one". Chalk arrow down to Panel 4.

Panel 4 (bottom-left): title "THE GAP OPENS IN 1989" in steel blue small caps. On the left, an orange path and a dashed teal path run together, then split at a dotted line labeled "1989". The widening gap between them is hatched and labeled "ATT −18.98". On the right, two stacks of cigarette packs stand side by side: a short orange stack labeled "41.6" and a tall teal one labeled "67.33". Callout in large warm orange chalk: "38% fewer packs in 2000". Chalk arrow to Panel 5.

Panel 5 (bottom-center): title "TRY TO BREAK IT" in steel blue small caps. A sturdy chalk shield stands in the middle, and three gray chalk arrows fly at it, labeled "placebo states", "fake 1985 start", and "drop a donor". The first and third arrows snap and fall away. The middle arrow leaves only a small dent, labeled "gaps one third as large". Callout in large warm orange chalk: "Rank 1 of 39". Chalk arrow to Panel 6.

Panel 6 (bottom-right): title "PYTHON AND STATA AGREE" in steel blue small caps. Two chalk hands shake in the center, and their sleeves read "Python" and "Stata". A small gray tag on the Stata sleeve reads "−19.00". Below the handshake, four chalk arrows of slightly different lengths all point down, with the gray label "four estimators, one sign". Callout in large warm orange chalk: "−18.98 packs per capita per year".

Below the grid on the right, two margin notes in small italic chalk white carry hand-drawn arrows. The first reads "p = 0.026 is a rank, not the probability of no effect" and points to Panel 5. The second reads "A second tax increase in 1999 may also shape the 2000 gap" and points to Panel 4. Below the grid on the left, a small legend pairs chalk dots with labels: warm orange for "California", teal for "synthetic California", and chalk white for "donor states".

Faint chalk formulas float behind the panels at 15–20% opacity in muted gray (#b0a89a). They read "min_W sum v_m (X_1m - sum w_j X_jm)^2", "w_j >= 0, sum w_j = 1", "gap_t = Y_1t - sum w_j Y_jt", and "r_j = MSPE_post / MSPE_pre". A tiny diagram of five arrows flowing into one circle sits among them. Chalk dust drifts near text and borders, and subtle smudges show partly erased chalk.

This prompt generates the base image. The AI should clearly render the title banner, six panel titles, six sketches, three big numbers, three callout phrases, two margin notes, and the legend. Body sentences and transitions appear in the panel reference data, for manual overlay in an image editor. Keep text elements few and large, and copy every number exactly as written.

---

## Section B: Negative Prompt

Do not include photorealistic rendering, glossy or reflective surfaces, drop shadows, gradient color fills, or neon glow effects. Also exclude emojis or pictographic symbols, computer-generated sans-serif typography, 3D perspective or depth, watermarks, stock photo elements, smooth vector curves, and pure white (#ffffff). Every white should be a warm, creamy chalk white (#f0ece2), and every line should look hand-drawn, with varying weight and chalk texture. Do not use clean digital borders, perfectly straight lines, precise statistical charts with axis ticks or gridlines, or data tables. Do not draw software logos, state flags, photographic maps, photographs of smokers, or smoke that hides any text. Do not add text beyond the labels that the prompt names. All rendered text must follow three rules: no apostrophes, no double hyphens, no em dashes.

---

## Section C: Condensed Prompt (under 250 words)

Chalkboard sketchnote infographic, 1920x1080 landscape, navy background (#0e1545), hand-lettered chalk text, chalk dust, and faint formulas. Title: "BUILDING A SYNTHETIC CALIFORNIA WITH MLSYNTH" in steel blue (#8bb8e0) small caps. Subtitle: "What would cigarette sales have been without Proposition 99?" in italic chalk white (#f0ece2). Six panels in a 3x2 grid have steel blue chalk borders, orange (#e8956a) circled numerals, and chalk arrows in reading order. Keep all content 100 pixels inside the side edges. Orange marks California and callouts, teal (#00d4c8) synthetic California, and gray (#b0a89a) notes. Panel 1, "CIGARETTE SALES FELL EVERYWHERE": stick-figure states walk downhill, California ahead; callout "A falling trend is not an effect". Panel 2, "NO TWIN STATE EXISTS": an oversized "average of 38 states" puzzle piece beside a California-shaped slot; callout "The average state is no twin". Panel 3, "A RECIPE OF FIVE STATES": a card lists Utah 0.335, Nevada 0.236, Montana 0.202, Colorado 0.160, and Connecticut 0.068. They pour into a teal bowl; callout "If no twin exists, build one". Panel 4, "THE GAP OPENS IN 1989": paths split at 1989; packs stack 41.6 against 67.33; big "38% fewer packs in 2000". Panel 5, "TRY TO BREAK IT": a shield stops three arrows; big "Rank 1 of 39". Panel 6, "PYTHON AND STATA AGREE": a handshake above four downward arrows; big "−18.98 packs per capita per year". Legend bottom-left; two italic notes bottom-right. No photorealism, gradients, logos, emojis, or pure white; no apostrophes, no double hyphens, no em dashes.

---

## Section D: Panel Reference Data

This appendix is not part of the image prompt. It holds the full text for manual overlay and for later revisions of the prompt. Every number below comes from the post, its execution log, or the Stata log.

### Panel 1: CIGARETTE SALES FELL EVERYWHERE

- **Position**: row 1, column 1, top-left
- **Dramatic function**: Hook
- **Story beat**: "Sales were falling everywhere, so a decline alone proves nothing"
- **Callout**: "A falling trend is not an effect"
- **Key number**: none; the contextual label beside California reads "123.0 to 90.1 packs, 1970–1988"
- **Central sketch**: a crowd of chalk stick figures, one for each state, walks down a hillside. California, in warm orange, walks farther down the slope.
- **Sub-elements**: a ballot box tagged "Proposition 99: 25 cents per pack, 1989" and the gray note on sales in California
- **Body sentences** (for manual overlay):
  - In November 1988, voters in California approved Proposition 99, which raised the cigarette tax by 25 cents per pack from January 1989.
  - The program also funded anti-smoking education, so the estimate covers a tax and a campaign together.
  - Sales in California had already fallen from 123.0 packs per capita in 1970 to 90.1 in 1988, before the program began.
  - The average donor state also declined: its mean sales fell by 28.51 packs per capita from 1970–1988 to 1989–2000.
  - A before-and-after comparison finds a drop of 55.86 packs in California, so it mixes the program with a national decline.
- **Source in the post**: Sections 1 and 4, Figure 1
- **Transition to next**: "If every state was falling, which one can show California without the program?"

### Panel 2: NO TWIN STATE EXISTS

- **Position**: row 1, column 2, top-center
- **Dramatic function**: Stakes
- **Story beat**: "No single state, and no simple average, can stand in for California"
- **Callout**: "The average state is no twin"
- **Key number**: none; the contextual label reads "1988: 90.1 against 113.82 packs"
- **Central sketch**: an empty puzzle slot shaped like California beside an oversized puzzle piece labeled "average of 38 states"
- **Sub-elements**: a gray tape measure between the slot and the piece, labeled "1988: 90.1 against 113.82 packs"
- **Body sentences** (for manual overlay):
  - In 1970, California sold 123.0 packs per capita, close to the 120.08 packs of the average donor state.
  - By 1988, California sold 90.1 packs against 113.82 for the average, a gap of −23.72 before any program.
  - In 1988, the 38 donor states ranged from 55.0 packs in Utah to 180.4 packs in New Hampshire.
  - Equal weights give every donor the same voice, although 25 of the 38 donors sold more than California over 1970–1988.
  - A simple difference-in-differences gives −27.35 packs, but it assumes parallel paths that the years before 1989 contradict.
- **Source in the post**: Section 4, Figure 1
- **Transition to next**: "No real twin exists, so we build one from several states."

### Panel 3: A RECIPE OF FIVE STATES

- **Position**: row 1, column 3, top-right
- **Dramatic function**: Attempt
- **Story beat**: "Five states blend into a synthetic California"
- **Callout**: "If no twin exists, build one"
- **Key number**: none; the contextual label reads "RMSE 1.754 packs before 1989"
- **Central sketch**: a recipe card with five weighted ingredients pours into a teal mixing bowl labeled "synthetic California"
- **Sub-elements**: an orange line and a dashed teal line that overlap before 1989, labeled "RMSE 1.754 packs before 1989"
- **Body sentences** (for manual overlay):
  - The VanillaSC class of mlsynth matches California on four covariates and on cigarette sales in 1975, 1980, and 1988.
  - Five of the 38 donor states receive weight: Utah 0.335, Nevada 0.236, Montana 0.202, Colorado 0.160, and Connecticut 0.068.
  - The other 33 donors receive a weight of zero, and the five weights sum to one.
  - Synthetic California misses actual sales before 1989 by 1.754 packs per capita, about 1.5 percent of mean sales.
  - Utah supplies about one third of the recipe, because its low sales pull the blend down toward California.
- **Source in the post**: Sections 5, 7.2, and 7.3, Figure 2
- **Transition to next**: "The recipe tracks California until 1988, and then the two paths part."

### Panel 4: THE GAP OPENS IN 1989

- **Position**: row 2, column 1, bottom-left
- **Dramatic function**: Twist
- **Story beat**: "The gap opens in 1989 and grows to 38 percent by 2000"
- **Callout**: "38% fewer packs in 2000"
- **Key number**: sales in 2000 are 38.2 percent below synthetic California (41.6 against 67.33 packs per capita); the in-panel label reads "ATT −18.98"
- **Central sketch**: two stacks of cigarette packs stand side by side, the comparison metaphor of this panel. The short orange stack reads "41.6", and the tall teal stack reads "67.33".
- **Sub-elements**: an orange path and a dashed teal path that split at 1989, with the hatched gap labeled "ATT −18.98"
- **Body sentences** (for manual overlay):
  - The gap between actual and synthetic California moves from −1.55 packs in 1988 to −7.59 packs in 1989.
  - The gap keeps widening through the 1990s and reaches −25.73 packs per capita in 2000.
  - Averaged over 1989–2000, the ATT is −18.98 packs per capita per year, a reduction of 23.9 percent.
  - In 2000, California sold 41.6 packs per capita against 67.33 for synthetic California, or 38.2 percent fewer.
  - Proposition 10 added 50 cents per pack in January 1999, so the gaps of 1999 and 2000 may also reflect it.
- **Source in the post**: Sections 7.5 and 7.6, Figures 5 and 6
- **Transition to next**: "A gap this large could still be luck, so we try to break it."

### Panel 5: TRY TO BREAK IT

- **Position**: row 2, column 2, bottom-center
- **Dramatic function**: Surprise
- **Story beat**: "Three attempts to break the result leave only a dent"
- **Callout**: "Rank 1 of 39"
- **Key number**: California ranks 1 of 39 states in the in-space placebo test (p = 0.026)
- **Central sketch**: a chalk shield struck by three arrows labeled "placebo states", "fake 1985 start", and "drop a donor"
- **Sub-elements**: two arrows snap, and the middle one leaves a small dent labeled "gaps one third as large"
- **Body sentences** (for manual overlay):
  - When each of the 38 donors is treated as a placebo, California has the largest MSPE ratio, 129.0, ahead of Georgia at 97.0.
  - The permutation p-value is 1/39 = 0.026, and it becomes 0.050 when the cut(2) filter keeps 20 states.
  - A fake start in 1985 yields gaps averaging −5.97 packs, about one third of the mean gap of −18.75 after 1989.
  - The in-time test therefore supports the timing only in part, because the gap already steps down before 1989.
  - Dropping each of the five donors in turn keeps the ATT between −19.29 and −17.52 packs per capita.
  - Every leave-one-out refit keeps the gap negative after 1988, and the gap in 2000 stays between −27.15 and −23.48 packs.
- **Source in the post**: Sections 8.3, 8.4, 9.2, and 10, Figures 7, 10, and 11
- **Transition to next**: "The result bends but does not break, so the last question concerns the software."

### Panel 6: PYTHON AND STATA AGREE

- **Position**: row 2, column 3, bottom-right
- **Dramatic function**: Resolution
- **Story beat**: "Python and Stata agree, and four estimators share one sign"
- **Callout**: "−18.98 packs per capita per year"
- **Key number**: an ATT of −18.98 packs per capita per year in Python, against −19.00 in Stata
- **Central sketch**: a chalk handshake between sleeves labeled "Python" and "Stata", with a gray tag "−19.00" on the Stata sleeve
- **Sub-elements**: four downward arrows of different lengths, labeled "four estimators, one sign"
- **Body sentences** (for manual overlay):
  - The mlsynth library closely reproduces the Stata benchmark, with an ATT of −18.98 against −19.00 from synth2.
  - The donor weights of the two programs agree within 0.002, and their yearly gaps differ by at most 0.03 packs.
  - Applying the rounded Stata weights by hand reproduces the Stata ATT exactly.
  - Four mlsynth estimators all find a large reduction, from −15.61 packs with SDID to −21.39 with CLUSTERSC.
  - The evidence supports a large and persistent cut in sales, while the exact timing of its onset remains less certain.
- **Source in the post**: Sections 11, 12, and 15.1, Figure 12
- **Transition to next**: none (final panel)

### Story Spine

- Synthetic control reveals that Proposition 99 cut cigarette sales by 23.9 percent, by showing an effect that ranks first among 39 states, challenging the idea that falling sales prove success.

### Message Inventory

- **ON-IMAGE** (eight messages, so the panels are layered):
  - Sales fell across the country before 1989, so a before-and-after comparison cannot isolate the program (Panel 1).
  - The average of the 38 donor states is a poor counterfactual: 113.82 against 90.1 packs in 1988 (Panel 2).
  - Synthetic California blends five states, led by Utah at 0.335, and misses sales before 1989 by 1.754 packs (Panel 3).
  - The gap opens in 1989, with an ATT of −18.98 packs per capita per year (Panels 4 and 6).
  - Sales in 2000 are 38.2 percent below synthetic California (Panel 4).
  - California ranks 1 of 39 in the in-space placebo test (Panel 5).
  - A fake start in 1985 yields gaps one third as large, and leave-one-out refits keep the effect negative (Panel 5).
  - Python and Stata agree, and four mlsynth estimators share one sign (Panel 6).
- **MARGIN**:
  - The p-value of 0.026 is a rank, not the probability that the program had no effect (note toward Panel 5).
  - Proposition 10, a second tax increase in 1999, may contribute to the gaps of 1999 and 2000 (note toward Panel 4).
- **REFERENCE**:
  - The predictor weights V differ between the two programs, because V is not identified (Section 7.4).
  - The cut(2) filter keeps 20 states and raises the smallest attainable p-value to 0.050 (Section 8.4).
  - A closer fit need not give stronger evidence: the outcome-only fit ranks California only third, with p = 0.077 (Section 12).
  - The estimate is an ATT for California, not a forecast for other states (Sections 5.4 and 15.2).

### Margin Elements

- **Professor note 1**: "p = 0.026 is a rank, not the probability of no effect"; it sits in the bottom-right margin, below the grid, with an arrow toward Panel 5.
- **Professor note 2**: "A second tax increase in 1999 may also shape the 2000 gap"; it sits below the first note, with an arrow toward Panel 4.
- **Color legend**: California in warm orange, synthetic California in teal, and donor states in chalk white; it sits in the bottom-left margin, below the grid.
- **Background formulas**: the four fragments listed under Key Equations on Screen, plus a tiny diagram of five arrows flowing into one circle, all at 15–20% opacity.

### Tracked Estimators

- **VanillaSC with the ADH predictors (baseline)**: ATT −18.98 and pre-treatment RMSE 1.754, with five donors that receive weight.
- **VanillaSC, outcome only**: ATT −19.51 and RMSE 1.656, with six donors; its own placebo test ranks California third (p = 0.077).
- **Synthetic difference-in-differences (SDID)**: ATT −15.61 and RMSE 1.799; version 1.0.0 does not expose its weights.
- **CLUSTERSC with principal component regression**: ATT −21.39 and RMSE 1.503, with 34 donors, of which 11 have negative weights.
- **TWFE difference-in-differences (reference only)**: −27.35, with equal weights on all 38 donors.
- **Stata synth2 (benchmark)**: ATT −19.00, from the classic estimator alone.

### Key Equations on Screen

- **"min_W sum v_m (X_1m - sum w_j X_jm)^2"** (background; Equation 1, Section 5.2): the donor weights minimize the weighted mismatch between California and the blend on each predictor.
- **"w_j >= 0, sum w_j = 1"** (background; Equation 1): the weights are nonnegative and sum to one, so the blend stays inside the range of the donors.
- **"gap_t = Y_1t - sum w_j Y_jt"** (background; Equation 2, Section 5.3): the gap subtracts synthetic sales from actual sales in each year.
- **"r_j = MSPE_post / MSPE_pre"** (background; Equation 4, Section 8.1): the placebo statistic divides the mean squared misses of a state after 1989 by those before 1989.
