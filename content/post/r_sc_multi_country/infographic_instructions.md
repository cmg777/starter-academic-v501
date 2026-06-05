# Augmented Synthetic Control for Many Countries — Infographic

**Story Spine.** *Once upon a time* researchers wanted to measure a policy's effect on one
country — but a country has no identical twin. *Every day* classic synthetic control built a
weighted "recipe" of donor countries as a stand-in, yet it only worked when the
pre-treatment match was good. *Until one day* the Augmented Synthetic Control Method added an
outcome-model bias correction. *Because of that* it recovered known effects on simulated data
and rescued estimates where plain SCM failed — even flipping a wrong sign back. *Because of
that* it replicated a published euro-area study, country by country. *Until finally* a simple
rule emerged: read the pre-treatment fit, augment when it is poor, and report the dynamics —
not just the average.

**Three BIG numbers:** `0.39 → 0.13` (mean recovery error, plain SCM → Ridge-ASCM) ·
`+0.34 vs −1.32` (the C05 sign flip: plain SCM wrong, ridge right; truth −1.23) ·
`0.74` (rank correlation with Papaioannou 2021 across 12 euro members).

## Full Image Generation Prompt

Create a 1920x1080 landscape digital chalk illustration on a dark navy background (#0e1545). The style is academic chalkboard sketchnote: all lettering appears hand-drawn in chalk with slightly irregular strokes, chalk-dust particles float near text edges, and faint smudge marks add realism. The overall feel resembles a photograph of an expertly annotated university lecture chalkboard.

The composition features a title banner centered at the top and six rectangular panels arranged in a 3-column by 2-row grid below it, with generous dark navy space between panels. Each panel has a chalk-drawn rounded-rectangle border in steel blue (#8bb8e0) with slightly uneven hand-drawn edges. Panel numbers appear as small circled numerals in warm orange (#e8956a) in the top-left corner of each panel. Chalk arrows with faint dust particles connect the panels in reading order: left to right across the top row (1 to 2 to 3), a vertical arrow from Panel 3 down to Panel 4, then left to right across the bottom row (4 to 5 to 6). Breathing room surrounds the entire grid for the margin note and color legend.

Colors: Navy blue (#0e1545) fills the entire background. Chalk white (#f0ece2) is used for all body text and sketch outlines — never pure white (#ffffff), always slightly warm and creamy. Steel blue (#8bb8e0) marks panel titles and chalk-drawn borders. Warm orange (#e8956a) highlights key numbers, bold callouts, and cautionary findings like the C05 sign flip from +0.34 to −1.32. Teal (#00d4c8) marks positive method-strength results like the recovery improvement 0.39 to 0.13 and the 0.74 rank correlation with the paper. Muted chalk gray (#b0a89a) appears on connector arrows, annotations, and de-emphasized labels.

The title banner reads "AUGMENTED SYNTHETIC CONTROL FOR MULTIPLE COUNTRIES" in large steel blue (#8bb8e0) chalk small-caps, centered above the grid. Below it in smaller chalk-white (#f0ece2) italic: "How do you build a counterfactual for a country with no twin?"

The top-left panel (row 1, column 1) has a steel blue (#8bb8e0) chalk border with a circled "1" in warm orange (#e8956a). The title reads "THE PROBLEM" in steel blue small-caps chalk lettering. Inside, a chalk-drawn lone country outline (a generic blob nation) stands with a large question mark hovering above and a faint dashed twin outline beside it labeled "counterfactual?" in muted gray (#b0a89a). The phrase "One country, no twin" appears in large warm orange (#e8956a) chalk with a chalk underline swoosh. In chalk white (#f0ece2): "We never observe the path a country would have taken without the policy." and "Synthetic control builds the missing twin as a weighted recipe of donor countries." A chalk arrow connects to Panel 2 with "Which augsynth tool fits?" in small muted gray (#b0a89a) chalk along the arrow.

The top-center panel (row 1, column 2) has a steel blue (#8bb8e0) chalk border with a circled "2" in warm orange (#e8956a). The title reads "THREE DOORS" in steel blue small-caps chalk lettering. Inside, a chalk-drawn sketch of three labeled doorways: door one "single_augsynth — one unit" with a single chalk stick-country; door two "multisynth — many units, staggered" with three chalk stick-countries on a small staircase (staggered adoption); door three "augsynth_multiout — many outcomes" with one country and two small chalk gauges. The phrase "One method, three entry points" appears in large warm orange (#e8956a) chalk with a chalk underline swoosh. In chalk white (#f0ece2): "augsynth() dispatches to the right routine automatically." and "Formula language: outcome ~ treatment | covariates." A chalk arrow connects to Panel 3 with "What makes it augmented?" in small muted gray (#b0a89a) chalk along the arrow.

The top-right panel (row 1, column 3) has a steel blue (#8bb8e0) chalk border with a circled "3" in warm orange (#e8956a). The title reads "THE AUGMENTATION" in steel blue small-caps chalk lettering. Inside, a chalk-drawn two-piece equation sketch: a big bracket "SCM gap" (actual minus weighted donors) and a second bracket "− bias correction" drawn as a small chalk paintbrush touching up a wall, labeled "Ridge outcome model." A small chalk note reads "fit perfect ⇒ correction = 0" in muted gray (#b0a89a). The phrase "Doubly robust: insurance, not a free lunch" appears in large warm orange (#e8956a) chalk with a chalk underline swoosh. In chalk white (#f0ece2): "When the pre-treatment fit is good, augmentation does nothing." and "When it is poor, the outcome model removes the leftover bias." A chalk arrow connects downward to Panel 4 with "Does it actually recover the truth?" in small muted gray (#b0a89a) chalk along the arrow.

The bottom-left panel (row 2, column 1) has a steel blue (#8bb8e0) chalk border with a circled "4" in warm orange (#e8956a). The title reads "PROOF ON SIMULATED DATA" in steel blue small-caps chalk lettering. Inside, a small chalk-drawn line chart shows an estimated effect curve in steel blue (#8bb8e0) tracking a white dashed "true effect" line, flat before treatment then rising together. Beside it, a tiny chalk two-bar comparison labeled "C05 outside the hull": a warm orange (#e8956a) bar pointing up labeled "plain +0.34 (wrong sign!)" and a teal (#00d4c8) bar pointing down labeled "ridge −1.32 (true −1.23)". The phrase "Recovery error 0.39 → 0.13" appears in large teal (#00d4c8) chalk numerals with a chalk underline swoosh. In chalk white (#f0ece2): "On data with a known effect, all three tools recover the truth within a few percent." and "For a unit outside the donor hull, plain SCM gets the sign wrong — augmentation fixes it." A chalk arrow connects to Panel 5 with "Does it hold on real data?" in small muted gray (#b0a89a) chalk along the arrow.

The bottom-center panel (row 2, column 2) has a steel blue (#8bb8e0) chalk border with a circled "5" in warm orange (#e8956a). The title reads "THE EURO REPLICATION" in steel blue small-caps chalk lettering. Inside, a chalk-drawn outline of Europe with twelve euro members lightly cross-hatched in warm orange (#e8956a), beside a small chalk path chart that rises just after a vertical "1999" hatch, dips during a shaded "2008 crisis" band, then recovers — labeled "pooled TFP effect." The phrase "Spearman 0.74 vs Papaioannou (2021)" appears in large teal (#00d4c8) chalk numerals with a chalk underline swoosh. In chalk white (#f0ece2): "Our ASCM estimates track the paper's per-country TFP contributions across all 12 members." and "Strong early gains, eroded by the 2008 crisis, then recovery — the paper's exact arc." A chalk arrow connects to Panel 6 with "So when should I use this?" in small muted gray (#b0a89a) chalk along the arrow.

The bottom-right panel (row 2, column 3) has a steel blue (#8bb8e0) chalk border with a circled "6" in warm orange (#e8956a). The title reads "BOTTOM LINE" in steel blue small-caps chalk lettering. Inside, a chalk-drawn three-step checklist with hand-drawn checkmarks: "1. Read the pre-treatment fit (scaled L2)", "2. Augment when the fit is poor", "3. Report the dynamic path, not just the average" — the third item circled in teal (#00d4c8). The phrase "Validate on truth, then trust on data" appears in large warm orange (#e8956a) chalk with a chalk underline swoosh. In chalk white (#f0ece2): "A small pre-fit imbalance means plain SCM and ASCM agree — either is fine." and "A near-zero average can hide a large early effect: always show the path." No outgoing arrow.

In the bottom-right margin, outside the panel grid, a professor's handwritten-style annotation in smaller italic chalk white (#f0ece2) reads: "Augmentation is an insurance policy — quiet when the fit is good, decisive when it is not." A hand-drawn chalk arrow points from the note toward Panel 3. In the bottom-left margin, a small color concept legend shows three entries: a teal (#00d4c8) dot labeled "Method strength / good recovery", a warm orange (#e8956a) dot labeled "Caution / where SCM fails", and a chalk white (#f0ece2) dot labeled "Data / counterfactual."

Faint chalk-drawn equations are visible behind the panels on the navy background at approximately 15-20% opacity in muted gray (#b0a89a): "W* = argmin ||X_1 - X_0 W||_V" and "tau_aug = (Y_1t - Sigma w_j Y_jt) - (m_t(X_1) - Sigma w_j m_t(X_j))" are scattered across the background, partially obscured by the panels. Chalk-style illustrations of country blobs, doorways, paintbrushes, and small line charts appear faintly in the background gaps. Subtle chalk dust particles float near text edges and panel borders, and faint smudge marks appear where chalk has been partially erased, adding tactile realism.

Text rendering priorities: The title banner text and panel numbers must be clearly legible. Panel titles should be readable in steel blue small-caps. Key numbers and callout phrases must be prominent (teal for method strengths, orange for cautions). Body text sentences should be readable in chalk white. Connector phrases and annotations can be smaller but still legible. Background formulas should be barely visible at 15-20% opacity.

---

## Negative Prompt

Do not include: photorealistic rendering, glossy or reflective surfaces, drop shadows, gradient color fills, emojis or Unicode symbols, computer-generated sans-serif typography, neon glow effects, 3D perspective or depth, watermarks, stock photo elements, smooth vector curves, pure white (#ffffff) — all whites should be warm/creamy chalk white (#f0ece2). All lines should appear hand-drawn with varying weight and chalk texture. Do not use clean digital borders or perfectly straight lines. Do not include photographs of actual chalkboards, classrooms, or lecture halls; the Europe map silhouette in Panel 5 should be a stylized chalk sketch with rough outlines, not a realistic geographic projection. Do not render real national flags or recognizable politicians.

---

## Condensed Prompt (~250 words)

Chalkboard infographic, 1920x1080 landscape, navy background (#0e1545). Academic chalk-drawn sketchnote style with hand-lettered text, chalk dust, and faint formula textures. Six panels in a 3x2 grid with steel blue (#8bb8e0) chalk borders connected by chalk arrows. Title: "AUGMENTED SYNTHETIC CONTROL FOR MANY COUNTRIES" in steel blue small-caps; subtitle "How do you build a counterfactual for a country with no twin?" in italic chalk white (#f0ece2). Colors: chalk white (#f0ece2) body text, teal (#00d4c8) method strengths, warm orange (#e8956a) cautions and callouts, muted gray (#b0a89a) annotations. Panel 1 "THE PROBLEM": lone chalk country with question mark and dashed twin, orange "One country, no twin." Panel 2 "THREE DOORS": three chalk doorways — single_augsynth (one unit), multisynth (three units on a staircase), augsynth_multiout (one unit, two gauges), orange "One method, three entry points." Panel 3 "THE AUGMENTATION": chalk equation = SCM gap minus a paintbrush "bias correction (Ridge)", note "fit perfect ⇒ correction = 0", orange "Doubly robust: insurance, not a free lunch." Panel 4 "PROOF ON SIMULATED DATA": chalk line chart estimate tracking white dashed truth, plus two-bar C05 sign flip (plain +0.34 wrong, ridge −1.32 right), teal "Recovery error 0.39 → 0.13." Panel 5 "THE EURO REPLICATION": chalk Europe with 12 members cross-hatched orange beside a path rising at 1999, dipping in a 2008 crisis band, recovering, teal "Spearman 0.74 vs Papaioannou (2021)." Panel 6 "BOTTOM LINE": chalk 3-step checklist (read pre-fit, augment when poor, report the path), orange "Validate on truth, then trust on data." Margin note: "Augmentation is insurance — quiet when fit is good, decisive when not." Faint background formulas at 15% opacity. No photorealism, no gradients, no emojis, no pure white.

---

## Panel Reference Data

### Panel 1 — The Problem
- **Position**: Row 1, Column 1 (top-left)
- **Callout**: "One country, no twin"
- **Key number**: N/A (conceptual)
- **Body sentences**:
  - We never observe the path a country would have taken without the policy.
  - Synthetic control builds the missing twin as a weighted recipe of donor countries.
- **Icon**: Lone chalk country outline with question mark and dashed "counterfactual?" twin
- **Connector to next**: "Which augsynth tool fits?"

### Panel 2 — Three Doors
- **Position**: Row 1, Column 2 (top-center)
- **Callout**: "One method, three entry points"
- **Key facts**: `single_augsynth` (one treated unit) · `multisynth` (many units, staggered) · `augsynth_multiout` (one unit, many outcomes)
- **Body sentences**:
  - augsynth() dispatches to the right routine automatically.
  - Formula language: outcome ~ treatment | covariates.
- **Icon**: Three chalk doorways with a single country, three staggered countries, and one country with two gauges
- **Connector to next**: "What makes it augmented?"

### Panel 3 — The Augmentation
- **Position**: Row 1, Column 3 (top-right)
- **Callout**: "Doubly robust: insurance, not a free lunch"
- **Key idea**: ATT_aug = (SCM gap) − (Ridge outcome-model bias correction)
- **Body sentences**:
  - When the pre-treatment fit is good, augmentation does nothing.
  - When it is poor, the outcome model removes the leftover bias.
- **Icon**: Chalk equation with a paintbrush "touch-up" for the bias correction; note "fit perfect ⇒ correction = 0"
- **Connector to next**: "Does it actually recover the truth?"

### Panel 4 — Proof on Simulated Data
- **Position**: Row 2, Column 1 (bottom-left)
- **Callout / Key number**: "Recovery error 0.39 → 0.13" (teal); C05 sign flip "plain +0.34 → ridge −1.32 (true −1.23)"
- **Body sentences**:
  - On data with a known effect, all three tools recover the truth within a few percent.
  - For a unit outside the donor hull, plain SCM gets the sign wrong — augmentation fixes it.
- **Mini-viz**: Chalk line chart (estimate tracking white dashed truth) + two-bar C05 comparison
- **Connector to next**: "Does it hold on real data?"

### Panel 5 — The Euro Replication
- **Position**: Row 2, Column 2 (bottom-center)
- **Callout / Key number**: "Spearman 0.74 vs Papaioannou (2021)" (teal)
- **Body sentences**:
  - Our ASCM estimates track the paper's per-country TFP contributions across all 12 members.
  - Strong early gains, eroded by the 2008 crisis, then recovery — the paper's exact arc.
- **Mini-viz**: Chalk Europe with 12 members cross-hatched orange + pooled TFP path rising at 1999, dipping in a 2008 crisis band
- **Connector to next**: "So when should I use this?"

### Panel 6 — Bottom Line
- **Position**: Row 2, Column 3 (bottom-right)
- **Callout**: "Validate on truth, then trust on data"
- **Key idea**: 3-step checklist — (1) read the pre-fit (scaled L2), (2) augment when poor, (3) report the dynamic path
- **Body sentences**:
  - A small pre-fit imbalance means plain SCM and ASCM agree — either is fine.
  - A near-zero average can hide a large early effect: always show the path.
- **Icon**: Chalk checklist with checkmarks; step 3 circled in teal
- **Connector to next**: N/A (final panel)

### Margin & legend
- **Professor's note (bottom-right, arrow to Panel 3)**: "Augmentation is an insurance policy — quiet when the fit is good, decisive when it is not."
- **Color legend (bottom-left)**: teal = method strength / good recovery · orange = caution / where SCM fails · chalk white = data / counterfactual
- **Background formulas (15-20% opacity)**: `W* = argmin ||X_1 - X_0 W||_V` and `tau_aug = (Y_1t - Σ w_j Y_jt) - (m_t(X_1) - Σ w_j m_t(X_j))`
