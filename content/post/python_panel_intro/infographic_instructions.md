# Infographic Instructions: Introduction to Panel Data Methods

Ready-to-paste AI image generation prompts for a chalkboard-style infographic summarizing this post into six panels. Copy Section A into Gemini or Ideogram for the full prompt; use Section C for token-limited tools (Midjourney, DALL-E 3); reference Section D when iterating.

---

## Section A: Full Image Generation Prompt

Create a 1920x1080 landscape digital chalk illustration on a dark navy background (#0e1545). The style is academic chalkboard sketchnote: all lettering appears hand-drawn in chalk with slightly irregular strokes, chalk-dust particles float near text edges, and faint smudge marks add realism. The overall feel resembles a photograph of an expertly annotated university lecture chalkboard.

The composition places a title banner centered at the top above a 3-column by 2-row grid of six panels. Each panel is a chalk-drawn rounded rectangle in steel blue (#8bb8e0) with slightly uneven hand-drawn edges. A small circled numeral in warm orange (#e8956a) sits in the top-left corner of each panel. Chalk arrows with dust particles connect the panels in reading order: Panel 1 to Panel 2 to Panel 3 across the top row, a vertical arrow from Panel 3 down to Panel 4, then Panel 4 to Panel 5 to Panel 6 across the bottom row. Generous dark navy space surrounds and separates the panels — the background is itself a design element. Breathing room around the entire grid leaves margins for enrichment elements.

Colors: Navy blue (#0e1545) fills the background. Chalk white (#f0ece2) is used for all body text and sketch outlines — never pure white (#ffffff), always slightly warm and creamy. Steel blue (#8bb8e0) marks panel titles and borders. Warm orange (#e8956a) highlights key numbers, bold callouts, and cautionary findings like the "factor-of-three gap" between cross-sectional and within estimators and the Hausman p-value of 0.180. Teal (#00d4c8) marks positive results like the within-style estimators that recover the unbiased coefficient (0.2103) and the CRE/Mundlak specification that bridges FE and RE. Muted chalk gray (#b0a89a) appears on connector arrows, annotations, axis labels, and de-emphasized background formulas.

The title banner reads "FROM 7% TO 21%: WHAT FIXED EFFECTS REVEAL" in large steel blue (#8bb8e0) chalk small-caps, centered above the grid. Below it in smaller chalk-white (#f0ece2) italic: "Does union membership raise wages by 7% or by 21%?"

The top-left panel (row 1, column 1) is bordered by a steel blue chalk rounded rectangle with a small circled "1" in warm orange in the top-left corner. The panel title "THE PROBLEM" appears in steel blue small-caps chalk lettering across the top of the panel. The icon shows a cluster of chalk-drawn worker stick figures separated into two small groups — one labeled "union" and one labeled "non-union" — with a chalk question mark hovering between them, suggesting confounded comparison. A small chalk number line beneath the icon spans from 0.0 to 0.3 with a single short bar marker at 0.075 labeled "POLS" in chalk white. The callout phrase "+7.5% — BUT BIASED?" appears in large warm orange (#e8956a) chalk numerals with a chalk underline swoosh. In chalk white (#f0ece2), the body text reads: "Pooled OLS reports a 7.5% union wage premium (SE 2.3). But workers who join unions are not the same as workers who do not — unobserved differences in ability or schooling could explain the entire gap." A chalk arrow connects to Panel 2 with the phrase "Panel data lets us compare each worker to themselves" in small muted gray (#b0a89a) chalk along the arrow.

The top-center panel (row 1, column 2) is bordered by a steel blue chalk rounded rectangle with a small circled "2" in warm orange in the top-left corner. The panel title "THE WAGE PANEL" appears in steel blue small-caps chalk lettering. The icon shows a chalk-drawn 2-row × 6-column data grid (worker × year) with three of the rows highlighted in teal (#00d4c8) labeled "switchers" and the rest in chalk white labeled "always-or-never". The mini-viz beneath is a small chalk-drawn data summary table reading "N = 2,199  |  T = 2  |  4,398 obs  |  16% union" in chalk white. The callout phrase "ONLY 9% WITHIN" appears in large warm orange (#e8956a) chalk with a chalk underline swoosh. In chalk white (#f0ece2), the body text reads: "Two-period balanced panel of 2,199 prime-age workers, 2010 and 2012. Only 16% are unionized in any given period, and a small minority actually switch status across the two waves." A chalk arrow connects to Panel 3 with the phrase "Strip out worker means to see the within slope" in small muted gray (#b0a89a) chalk along the arrow.

The top-right panel (row 1, column 3) is bordered by a steel blue chalk rounded rectangle with a small circled "3" in warm orange in the top-left corner. The panel title "THE WITHIN ESTIMATOR" appears in steel blue small-caps chalk lettering. The icon shows a chalk worker stick figure with two horizontal arrows pointing to time points "2010" and "2012", and a vertical subtraction arrow showing the worker's mean being subtracted from each observation. The mini-viz is a side-by-side pair of small chalk scatter plots: the left labeled "RAW" shows a shallow chalk regression line with slope written as ≈ 0.08, and the right labeled "DEMEANED" shows a steeper line through the origin with slope ≈ 0.21 highlighted in teal (#00d4c8). The callout phrase "+21.0% (SE 0.081)" appears in large warm orange (#e8956a) chalk numerals with a chalk underline swoosh. In chalk white (#f0ece2), the body text reads: "Subtract each worker's mean from every variable, then run OLS on the demeaned data. The FE coefficient jumps to 21.0 log points — almost three times POLS. Identification rests entirely on workers who switched union status." A vertical chalk arrow connects downward to Panel 4 with the phrase "But six estimators give different answers — why?" in small muted gray (#b0a89a) chalk along the arrow.

The bottom-left panel (row 2, column 1) is bordered by a steel blue chalk rounded rectangle with a small circled "4" in warm orange in the top-left corner. The panel title "SIX ESTIMATORS, TWO CAMPS" appears in steel blue small-caps chalk lettering. The icon shows a chalk dashed vertical divider with the words "cross-sectional" on one side and "within" on the other. The mini-viz is a chalk-drawn horizontal bar chart with six labeled bars: "POLS 0.075", "Between 0.066", "RE 0.109" rendered in chalk white (#f0ece2), and "FDFE 0.211", "FE 0.210", "CRE 0.210" rendered in teal (#00d4c8) — a clear visual divide between two clusters. The callout phrase "FACTOR-OF-THREE GAP" appears in large warm orange (#e8956a) chalk with a chalk underline swoosh. In chalk white (#f0ece2), the body text reads: "Cross-sectional methods cluster at 7–11 log points; within methods cluster at 21. Standard errors swing inversely — within methods are 2-3× noisier but causally cleaner under weaker assumptions." A chalk arrow connects to Panel 5 with the phrase "The gap is not noise — it is selection" in small muted gray (#b0a89a) chalk along the arrow.

The bottom-center panel (row 2, column 2) is bordered by a steel blue chalk rounded rectangle with a small circled "5" in warm orange in the top-left corner. The panel title "WHY THE GAP?" appears in steel blue small-caps chalk lettering. The icon shows a small chalk-drawn DAG: an "ability" node at the top with chalk arrows flowing simultaneously into a "union" node and a "wages" node — a textbook confounder in chalk. The mini-viz is a stacked horizontal bar showing union variance decomposed into "94% between" in chalk white and "9% within" highlighted in teal (#00d4c8), with a small label reading "← the slice FE uses". The callout phrase "9% WITHIN → HAUSMAN p = 0.180" appears in large warm orange (#e8956a) chalk with a wavy chalk underline in muted gray suggesting skepticism. In chalk white (#f0ece2), the body text reads: "Only 9% of union variance is within-individual — the thin slice FE has to work with. The 14-point gap between cross-sectional and within estimates is the empirical signature of negative selection. Hausman's failure to reject (p = 0.180) is mostly a power problem, not a verdict." A chalk arrow connects to Panel 6 with the phrase "So which estimator should you actually use?" in small muted gray (#b0a89a) chalk along the arrow.

The bottom-right panel (row 2, column 3) is bordered by a steel blue chalk rounded rectangle with a small circled "6" in warm orange in the top-left corner. The panel title "USE CRE / MUNDLAK" appears in steel blue small-caps chalk lettering. The icon shows a chalk-drawn bridge connecting two labeled blocks "FE" and "RE", with a small worker stick figure standing on top of the bridge. The mini-viz is a small chalk results card listing three rows in chalk white: "CRE union: 0.2103 ✓ (= FE)" with the checkmark in teal (#00d4c8), "CRE schooling: +11% / yr ✓ (FE absorbs)" with the checkmark in teal, and "Mundlak term: p = 0.072" in warm orange (#e8956a). The callout phrase "FE COEFFICIENT + RE FLEXIBILITY" appears in large warm orange (#e8956a) chalk with a chalk underline swoosh. In chalk white (#f0ece2), the body text reads: "Mundlak's CRE recovers the FE coefficient on union (0.2103) AND keeps schooling (+11%) and gender (−27%) identified. The Mundlak term (p = 0.072) is a sharper specification test than Hausman in low-power settings. Lead with this one."

Margin elements appear outside the panel grid. In the bottom-right margin, beyond Panel 6, a professor's hand-written italic note in chalk white (#f0ece2) reads: "9% within variance is why FE has wide CIs — think harder before reading 'p > 0.05' as 'RE wins'." A small hand-drawn chalk arrow from this note points back toward Panel 5. In the bottom-left margin, beyond Panel 4, a small color concept legend reads: "● Within effect (teal #00d4c8)  ●  Selection bias / cross-sectional gap (warm orange #e8956a)  ●  Workers / data (chalk white #f0ece2)" with each concept paired to a small colored chalk dot.

Texture and atmosphere: chalk dust particles float visibly near text edges and panel borders, especially around the title banner and the warm-orange callouts. Faint smudge marks suggest chalk has been partially erased and rewritten in places. Behind the panels on the navy background at roughly 15-20% opacity in muted gray (#b0a89a), three faint chalk-drawn formulas are visible: $y\_{it} = \\alpha\_i + \\beta x\_{it} + u\_{it}$ across the upper-middle area, $\\tilde{x}\_{it} = x\_{it} - \\bar{x}\_i$ across the lower-middle area, and the Hausman test $H = (\\hat{\\beta}\_{FE} - \\hat{\\beta}\_{RE})' [V\_{FE} - V\_{RE}]^{-1} (\\hat{\\beta}\_{FE} - \\hat{\\beta}\_{RE})$ tucked into the upper-right corner. The formulas should look like notes left over from a previous lecture, not foreground content.

Text rendering priorities: The title banner text and panel numbers must be clearly legible. Panel titles should be readable in steel blue small-caps. Key numbers (7.5%, 21.0%, 0.2103, 0.180, 0.072, 9%, 94%, 2,199, T=2) and callout phrases must be prominent in warm orange. Body text sentences should be readable in chalk white. Connector phrases between panels and the professor's margin note can be smaller but still legible. Background formulas should be barely visible at 15-20% opacity.

---

## Negative Prompt

Do not include: photorealistic rendering, glossy or reflective surfaces, drop shadows, gradient color fills, emojis or Unicode symbols, computer-generated sans-serif typography, neon glow effects, 3D perspective or depth, watermarks, stock photo elements, smooth vector curves, pure white (#ffffff) — all whites should be warm/creamy chalk white (#f0ece2). All lines should appear hand-drawn with varying weight and chalk texture. Do not use clean digital borders or perfectly straight lines. Do not include photographs of actual chalkboards, classrooms, or lecture halls. Do not depict real worker photos, NLSY logos, or stock images of unions, factories, or workplace scenes — every panel element should be hand-drawn chalk illustration only.

---

## Condensed Prompt (~300 words)

Chalkboard infographic, 1920x1080 landscape, navy background (#0e1545). Academic hand-drawn chalk-sketchnote style with chalk dust, smudge marks, and faint formula textures behind the panels. Six panels in a 3x2 grid with steel blue (#8bb8e0) chalk-drawn rounded borders connected by chalk arrows in reading order. Title banner above grid: "FROM 7% TO 21%: WHAT FIXED EFFECTS REVEAL" in steel blue chalk small-caps, with subtitle "Does union membership raise wages by 7% or by 21%?" in italic chalk white. Colors: chalk white (#f0ece2) body text and outlines, warm orange (#e8956a) key numbers and callouts, teal (#00d4c8) positive within-estimator results, muted gray (#b0a89a) annotations and connector arrows. Panel 1 (top-left, "THE PROBLEM"): worker stick figures split into union/non-union with question mark; callout "+7.5% — BUT BIASED?" in orange. Panel 2 (top-center, "THE WAGE PANEL"): chalk data grid; callout "ONLY 9% WITHIN" in orange; "N=2,199, T=2". Panel 3 (top-right, "THE WITHIN ESTIMATOR"): side-by-side raw vs demeaned scatters with slopes 0.08 and 0.21; callout "+21.0% (SE 0.081)" in orange. Panel 4 (bottom-left, "SIX ESTIMATORS, TWO CAMPS"): horizontal bar chart with POLS 0.075 / Between 0.066 / RE 0.109 in white and FDFE 0.211 / FE 0.210 / CRE 0.210 in teal; callout "FACTOR-OF-THREE GAP" in orange. Panel 5 (bottom-center, "WHY THE GAP?"): small DAG with ability → union and ability → wages; stacked variance bar 94% between / 9% within; callout "9% WITHIN → HAUSMAN p = 0.180" in orange. Panel 6 (bottom-right, "USE CRE / MUNDLAK"): chalk bridge between FE and RE; results card showing CRE union 0.2103 ✓ and Mundlak term p = 0.072; callout "FE COEFFICIENT + RE FLEXIBILITY" in orange. Bottom-right margin: italic professor's note "9% within variance is why FE has wide CIs". Bottom-left margin: color legend (within effect: teal, selection: orange, data: white). Faint background formulas at 15% opacity: $y_{it} = \alpha_i + \beta x_{it} + u_{it}$, $\tilde{x}_{it} = x_{it} - \bar{x}_i$, Hausman quadratic form. No photorealism, no gradients, no emojis, no drop shadows, no pure white, no real photographs.

---

## Panel Reference Data

This section is not part of the prompt — it is a structured appendix for iterating on the generated image.

### Panel 1 — THE PROBLEM

- **Position**: row 1, column 1 (top-left)
- **Callout**: "+7.5% — but biased?"
- **Key number**: 0.0750 (POLS union coefficient, SE 0.0231) — from `index.md` §6
- **Body sentences**:
  - Pooled OLS reports a 7.5% union wage premium (SE 2.3).
  - Workers who join unions are not the same as workers who do not.
  - Unobserved differences in ability or schooling could explain the entire gap.
- **Icon**: chalk worker stick figures split into "union" and "non-union" clusters with a question mark hovering between them
- **Mini-viz**: chalk number line from 0.0 to 0.3 with a single bar marker at 0.075 labeled "POLS"
- **Connector to next**: "Panel data lets us compare each worker to themselves"

### Panel 2 — THE WAGE PANEL

- **Position**: row 1, column 2 (top-center)
- **Callout**: "ONLY 9% WITHIN"
- **Key number**: 9% (within variance share for union) — from `index.md` §4
- **Body sentences**:
  - Two-period balanced panel of 2,199 prime-age workers (2010 and 2012).
  - Only 16% are unionized in any given period.
  - A small minority actually switch union status across the two waves.
- **Icon**: chalk 2-row × 6-column data grid (worker × year) with three rows highlighted teal as "switchers"
- **Mini-viz**: small chalk text panel reading "N = 2,199  |  T = 2  |  4,398 obs  |  16% union"
- **Connector to next**: "Strip out worker means to see the within slope"

### Panel 3 — THE WITHIN ESTIMATOR

- **Position**: row 1, column 3 (top-right)
- **Callout**: "+21.0% (SE 0.081)"
- **Key number**: 0.2103 (FE coefficient, SE 0.0812) — from `index.md` §9
- **Body sentences**:
  - Subtract each worker's mean from every variable, then run OLS on the demeaned data.
  - The FE coefficient jumps to 21.0 log points — almost three times POLS.
  - Identification rests entirely on workers who switched union status.
- **Icon**: chalk worker stick figure with two arrows for 2010 and 2012, and a subtraction arrow showing worker mean being removed
- **Mini-viz**: side-by-side scatter pair — left "RAW" with shallow line slope ≈ 0.08, right "DEMEANED" with steeper teal line slope ≈ 0.21 through origin
- **Connector to next**: "But six estimators give different answers — why?" (vertical arrow)

### Panel 4 — SIX ESTIMATORS, TWO CAMPS

- **Position**: row 2, column 1 (bottom-left)
- **Callout**: "FACTOR-OF-THREE GAP"
- **Key number**: 0.21 vs 0.07 (within camp vs cross-sectional camp) — from `index.md` §14
- **Body sentences**:
  - Cross-sectional methods cluster at 7–11 log points; within methods cluster at 21.
  - Standard errors swing inversely — within methods are 2-3× noisier.
  - Within methods are causally cleaner under weaker assumptions.
- **Icon**: chalk dashed vertical divider labeled "cross-sectional" and "within"
- **Mini-viz** (the required Panel 4 comparison visual): horizontal bar chart with six bars — POLS 0.075, Between 0.066, RE 0.109 in chalk white (#f0ece2); FDFE 0.211, FE 0.210, CRE 0.210 in teal (#00d4c8). The teal bars are the "winning" within camp; the white bars are the cross-sectional camp.
- **Connector to next**: "The gap is not noise — it is selection"

### Panel 5 — WHY THE GAP?

- **Position**: row 2, column 2 (bottom-center)
- **Callout**: "9% within → Hausman p = 0.180"
- **Key number**: 1.79 / 0.180 (Hausman χ² and p-value) — from `index.md` §12
- **Body sentences**:
  - Only 9% of union variance is within-individual — the thin slice FE has to work with.
  - The 14-point gap between cross-sectional and within estimates is the empirical signature of negative selection.
  - Hausman's failure to reject (p = 0.180) is mostly a power problem, not a verdict.
- **Icon**: small chalk DAG with "ability" node at the top, arrows flowing into "union" and "wages" nodes — a textbook confounder
- **Mini-viz**: stacked horizontal variance bar showing "94% between" in chalk white and "9% within" highlighted in teal, labeled "← the slice FE uses"
- **Connector to next**: "So which estimator should you actually use?"

### Panel 6 — USE CRE / MUNDLAK

- **Position**: row 2, column 3 (bottom-right)
- **Callout**: "FE coefficient + RE flexibility"
- **Key number**: 0.2103 (CRE = FE, exactly) and 0.072 (Mundlak term p-value) — from `index.md` §13
- **Body sentences**:
  - Mundlak's CRE recovers the FE coefficient on union (0.2103) AND keeps schooling (+11%) and gender (−27%) identified.
  - The Mundlak term (p = 0.072) is a sharper specification test than Hausman in low-power settings.
  - Lead with this one.
- **Icon**: chalk bridge connecting "FE" and "RE" blocks, with a worker stick figure standing on top
- **Mini-viz**: results card listing "CRE union: 0.2103 ✓" / "CRE schooling: +11% / yr ✓" / "Mundlak term: p = 0.072" with teal checkmarks and orange numbers

### Margin Elements

- **Professor's note**: "9% within variance is why FE has wide CIs — think harder before reading 'p > 0.05' as 'RE wins'." — positioned in the bottom-right margin, with a hand-drawn chalk arrow pointing back toward Panel 5
- **Color legend** (bottom-left margin): Within effect: teal (#00d4c8) · Selection bias / cross-sectional gap: warm orange (#e8956a) · Workers / data: chalk white (#f0ece2)
- **Background formulas** (15-20% opacity in muted gray, behind the panels): $y_{it} = \alpha_i + \beta x_{it} + u_{it}$ (panel data model, upper-middle); $\tilde{x}_{it} = x_{it} - \bar{x}_i$ (within transformation, lower-middle); Hausman quadratic form $H = (\hat\beta_{FE} - \hat\beta_{RE})' [V_{FE} - V_{RE}]^{-1} (\hat\beta_{FE} - \hat\beta_{RE})$ (upper-right corner)
